/* Portfolio Admin
 *
 * Edits data/projects.json, data/resume.json, and assets/* via the GitHub
 * Contents API. The user's PAT is stored in localStorage only.
 */
(function () {
  'use strict';

  // ========================================================================
  // GitHub API client
  // ========================================================================

  class GitHub {
    constructor({ token, owner, repo, branch }) {
      this.token = token;
      this.owner = owner;
      this.repo = repo;
      this.branch = branch || 'main';
      this.base = `https://api.github.com/repos/${owner}/${repo}`;
    }

    headers(extra = {}) {
      return {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...extra,
      };
    }

    async req(path, opts = {}) {
      const url = path.startsWith('http') ? path : `${this.base}${path}`;
      const res = await fetch(url, {
        ...opts,
        headers: { ...this.headers(opts.json ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
        body: opts.json ? JSON.stringify(opts.json) : opts.body,
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = `${res.status} ${res.statusText}`;
        try { msg = JSON.parse(text).message || msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const ct = res.headers.get('content-type') || '';
      return ct.includes('application/json') ? res.json() : res.text();
    }

    async getFile(filePath) {
      const data = await this.req(`/contents/${filePath}?ref=${this.branch}`);
      const content = data.encoding === 'base64'
        ? new TextDecoder().decode(Uint8Array.from(atob(data.content.replace(/\s/g, '')), c => c.charCodeAt(0)))
        : data.content;
      return { content, sha: data.sha };
    }

    async putFile(filePath, contentString, sha, message) {
      const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(contentString)));
      const body = {
        message: message || `admin: update ${filePath}`,
        content: b64,
        branch: this.branch,
      };
      if (sha) body.sha = sha;
      return this.req(`/contents/${filePath}`, { method: 'PUT', json: body });
    }

    async putBinary(filePath, arrayBuffer, message) {
      // Convert ArrayBuffer to base64
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      const b64 = btoa(binary);

      // Check if file exists to get sha
      let sha;
      try {
        const existing = await this.req(`/contents/${filePath}?ref=${this.branch}`);
        sha = existing.sha;
      } catch { /* doesn't exist */ }

      const body = {
        message: message || `admin: upload ${filePath}`,
        content: b64,
        branch: this.branch,
      };
      if (sha) body.sha = sha;
      return this.req(`/contents/${filePath}`, { method: 'PUT', json: body });
    }

    async listDir(dirPath) {
      try {
        const data = await this.req(`/contents/${dirPath}?ref=${this.branch}`);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        if (err.message.includes('Not Found')) return [];
        throw err;
      }
    }

    async deleteFile(filePath, sha, message) {
      return this.req(`/contents/${filePath}`, {
        method: 'DELETE',
        json: {
          message: message || `admin: delete ${filePath}`,
          sha,
          branch: this.branch,
        },
      });
    }
  }

  // ========================================================================
  // State
  // ========================================================================

  const state = {
    github: null,
    auth: null,
    projects: { data: null, sha: null, dirty: false },
    resume: { data: null, sha: null, dirty: false },
  };

  // ========================================================================
  // Utilities
  // ========================================================================

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const attr = (s) => String(s ?? '').replace(/"/g, '&quot;');

  function toast(msg, type = 'info', ms = 3500) {
    const el = $('#toast');
    el.className = `toast ${type}`;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, ms);
  }

  function openModal({ title, body, footer, wide }) {
    const modal = $('#modal');
    $('#modal-title').textContent = title || '';
    $('#modal-body').innerHTML = '';
    if (typeof body === 'string') $('#modal-body').innerHTML = body;
    else if (body) $('#modal-body').appendChild(body);
    $('#modal-footer').innerHTML = '';
    if (footer) {
      if (typeof footer === 'string') $('#modal-footer').innerHTML = footer;
      else $('#modal-footer').appendChild(footer);
    }
    modal.querySelector('.modal-container').classList.toggle('wide', !!wide);
    modal.hidden = false;
  }
  function closeModal() { $('#modal').hidden = true; }

  function confirmAction(message) {
    return new Promise((resolve) => {
      const body = document.createElement('div');
      body.textContent = message;
      const footer = document.createElement('div');
      footer.style.cssText = 'display:flex;gap:.5rem;';
      const cancel = document.createElement('button');
      cancel.className = 'btn ghost';
      cancel.textContent = 'Cancel';
      cancel.onclick = () => { closeModal(); resolve(false); };
      const ok = document.createElement('button');
      ok.className = 'btn danger';
      ok.textContent = 'Confirm';
      ok.onclick = () => { closeModal(); resolve(true); };
      footer.append(cancel, ok);
      openModal({ title: 'Confirm', body, footer });
    });
  }

  // ========================================================================
  // Auth
  // ========================================================================

  const AUTH_KEY = 'portfolio-admin-auth-v1';
  const loadAuth = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; } };
  const saveAuth = (auth) => localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  const clearAuth = () => localStorage.removeItem(AUTH_KEY);

  async function handleLogin() {
    const token = $('#login-token').value.trim();
    const repoStr = $('#login-repo').value.trim();
    const branch = $('#login-branch').value.trim() || 'main';
    const errEl = $('#login-error');
    errEl.hidden = true;

    if (!token) return showLoginError('Token wajib diisi');
    if (!repoStr.includes('/')) return showLoginError('Format repository harus owner/repo');

    const [owner, repo] = repoStr.split('/').map(s => s.trim());
    const btn = $('#login-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Verifying...';

    const gh = new GitHub({ token, owner, repo, branch });
    try {
      // Verify by fetching projects.json
      await gh.getFile('data/projects.json');
      const auth = { token, owner, repo, branch };
      saveAuth(auth);
      await initApp(auth);
    } catch (err) {
      showLoginError(`Login gagal: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
    }
  }

  function showLoginError(msg) {
    const errEl = $('#login-error');
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  function handleLogout() {
    if (state.projects.dirty || state.resume.dirty) {
      if (!confirm('Ada perubahan yang belum disimpan. Yakin mau logout?')) return;
    }
    clearAuth();
    location.reload();
  }

  // ========================================================================
  // App init
  // ========================================================================

  async function initApp(auth) {
    state.auth = auth;
    state.github = new GitHub(auth);

    $('#login-screen').hidden = true;
    $('#app').hidden = false;
    $('#repo-label').textContent = `${auth.owner}/${auth.repo}@${auth.branch}`;

    // Load both data files in parallel
    try {
      const [proj, res] = await Promise.all([
        state.github.getFile('data/projects.json'),
        state.github.getFile('data/resume.json'),
      ]);
      state.projects.data = JSON.parse(proj.content);
      state.projects.sha = proj.sha;
      state.resume.data = JSON.parse(res.content);
      state.resume.sha = res.sha;
    } catch (err) {
      toast(`Failed to load data: ${err.message}`, 'error', 6000);
      return;
    }

    renderProjectsView();
    renderResumeView();
    renderAssetsView();

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    $('#logout-btn').onclick = handleLogout;
  }

  function handleHashChange() {
    const hash = location.hash.replace('#', '') || 'projects';
    showView(hash);
  }

  function showView(name) {
    ['projects', 'resume', 'assets'].forEach(v => {
      $(`#view-${v}`).hidden = v !== name;
    });
    $$('.sidebar-nav .nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.view === name);
    });
    if (name === 'assets') refreshAssetsList();
  }

  // ========================================================================
  // RESUME EDITOR
  // ========================================================================

  function renderResumeView() {
    const view = $('#view-resume');
    view.innerHTML = `
      <div class="view-header">
        <h1><i class="bi bi-person-badge"></i> Resume</h1>
        <div class="actions">
          <button class="btn ghost" data-action="resume-preview"><i class="bi bi-eye"></i> Preview</button>
          <button class="btn primary" data-action="resume-save"><i class="bi bi-cloud-arrow-up"></i> Save to GitHub</button>
        </div>
      </div>

      <div class="form-group">
        <label>CV File Path</label>
        <input type="text" id="resume-cvfile" value="${attr(state.resume.data.cvFile)}">
        <small>Path file PDF CV (relatif dari root, contoh: <code>assets/CV_yoga_krisna.pdf</code>)</small>
      </div>

      <div class="tabs">
        <button class="tab active" data-lang-tab="en">English</button>
        <button class="tab" data-lang-tab="id">Bahasa Indonesia</button>
      </div>

      <div id="resume-lang-content"></div>
    `;

    view.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-lang-tab]');
      if (tab) {
        $$('[data-lang-tab]', view).forEach(t => t.classList.toggle('active', t === tab));
        renderResumeLang(tab.dataset.langTab);
      }
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'resume-save') saveResume();
      if (action === 'resume-preview') previewResume();
    });

    view.addEventListener('input', (e) => {
      if (e.target.id === 'resume-cvfile') {
        state.resume.data.cvFile = e.target.value;
        state.resume.dirty = true;
      }
    });

    renderResumeLang('en');
  }

  function renderResumeLang(lang) {
    const block = state.resume.data.languages[lang];
    const container = $('#resume-lang-content');
    container.innerHTML = `
      <div class="section-block">
        <div class="section-block-header">
          <h2><i class="bi bi-briefcase"></i> Experience (${block.experience.length})</h2>
          <button class="btn small primary" data-add="experience"><i class="bi bi-plus"></i> Add</button>
        </div>
        <div id="experience-list"></div>
      </div>

      <div class="section-block">
        <div class="section-block-header">
          <h2><i class="bi bi-mortarboard"></i> Education (${block.education.length})</h2>
          <button class="btn small primary" data-add="education"><i class="bi bi-plus"></i> Add</button>
        </div>
        <div id="education-list"></div>
      </div>

      <div class="section-block">
        <div class="section-block-header">
          <h2><i class="bi bi-gear"></i> Professional Skills</h2>
        </div>
        <div id="prof-skills-list"></div>
      </div>

      <div class="section-block">
        <div class="section-block-header">
          <h2><i class="bi bi-code-slash"></i> Technologies</h2>
        </div>
        <div id="tech-skills-list"></div>
      </div>

      <div class="section-block">
        <div class="section-block-header">
          <h2><i class="bi bi-tag"></i> Section Labels</h2>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Experience label</label><input type="text" data-label="experience" value="${attr(block.labels.experience)}"></div>
          <div class="form-group"><label>Education label</label><input type="text" data-label="education" value="${attr(block.labels.education)}"></div>
          <div class="form-group"><label>Skills label</label><input type="text" data-label="skills" value="${attr(block.labels.skills)}"></div>
          <div class="form-group"><label>Professional skills label</label><input type="text" data-label="professionalSkills" value="${attr(block.labels.professionalSkills)}"></div>
          <div class="form-group"><label>Technologies label</label><input type="text" data-label="technologies" value="${attr(block.labels.technologies)}"></div>
        </div>
      </div>
    `;

    renderExperienceList(lang);
    renderEducationList(lang);
    renderSkillList(lang, 'professionalSkills', '#prof-skills-list');
    renderSkillList(lang, 'technologies', '#tech-skills-list');

    container.addEventListener('click', (e) => {
      const addType = e.target.closest('[data-add]')?.dataset.add;
      if (addType === 'experience') {
        block.experience.push({ period: '', position: '', company: '', location: '', description: '' });
        state.resume.dirty = true;
        renderResumeLang(lang);
      }
      if (addType === 'education') {
        block.education.push({ period: '', degree: '', school: '', location: '', description: '' });
        state.resume.dirty = true;
        renderResumeLang(lang);
      }
    }, { once: true });

    container.addEventListener('input', (e) => {
      const label = e.target.dataset.label;
      if (label) {
        block.labels[label] = e.target.value;
        state.resume.dirty = true;
      }
    });
  }

  function renderExperienceList(lang) {
    const block = state.resume.data.languages[lang];
    const list = $('#experience-list');
    list.innerHTML = block.experience.map((item, i) => `
      <div class="array-item-card" data-idx="${i}">
        <div class="array-item-card-header">
          <span>Experience #${i + 1}</span>
          <div class="array-item-card-actions">
            <button class="btn small ghost" data-move="up" ${i === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
            <button class="btn small ghost" data-move="down" ${i === block.experience.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
            <button class="btn small danger" data-remove><i class="bi bi-trash"></i></button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Period</label><input type="text" data-field="period" value="${attr(item.period)}"></div>
          <div class="form-group"><label>Position</label><input type="text" data-field="position" value="${attr(item.position)}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Company (HTML allowed)</label><input type="text" data-field="company" value="${attr(item.company)}"></div>
          <div class="form-group"><label>Location</label><input type="text" data-field="location" value="${attr(item.location)}"></div>
        </div>
        <div class="form-group">
          <label>Description (HTML allowed)</label>
          <textarea data-field="description" rows="4">${escapeHtml(item.description)}</textarea>
        </div>
      </div>
    `).join('');

    bindArrayHandlers(list, block.experience, () => renderExperienceList(lang));
  }

  function renderEducationList(lang) {
    const block = state.resume.data.languages[lang];
    const list = $('#education-list');
    list.innerHTML = block.education.map((item, i) => `
      <div class="array-item-card" data-idx="${i}">
        <div class="array-item-card-header">
          <span>Education #${i + 1}</span>
          <div class="array-item-card-actions">
            <button class="btn small ghost" data-move="up" ${i === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
            <button class="btn small ghost" data-move="down" ${i === block.education.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
            <button class="btn small danger" data-remove><i class="bi bi-trash"></i></button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Period</label><input type="text" data-field="period" value="${attr(item.period)}"></div>
          <div class="form-group"><label>Degree</label><input type="text" data-field="degree" value="${attr(item.degree)}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>School</label><input type="text" data-field="school" value="${attr(item.school)}"></div>
          <div class="form-group"><label>Location</label><input type="text" data-field="location" value="${attr(item.location)}"></div>
        </div>
        <div class="form-group">
          <label>Description (HTML allowed)</label>
          <textarea data-field="description" rows="3">${escapeHtml(item.description)}</textarea>
        </div>
      </div>
    `).join('');

    bindArrayHandlers(list, block.education, () => renderEducationList(lang));
  }

  function renderSkillList(lang, key, selector) {
    const arr = state.resume.data.languages[lang][key];
    const list = $(selector);
    list.innerHTML = `
      <div class="array-editor">
        ${arr.map((s, i) => `
          <div class="array-item" data-idx="${i}">
            <input type="text" data-field="value" value="${attr(s)}">
            <button class="btn small ghost" data-move="up" ${i === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
            <button class="btn small ghost" data-move="down" ${i === arr.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
            <button class="btn small danger" data-remove><i class="bi bi-trash"></i></button>
          </div>
        `).join('')}
      </div>
      <button class="btn small primary" style="margin-top:.5rem" data-add-skill><i class="bi bi-plus"></i> Add</button>
    `;

    list.addEventListener('input', (e) => {
      if (e.target.dataset.field === 'value') {
        const idx = parseInt(e.target.closest('[data-idx]').dataset.idx, 10);
        arr[idx] = e.target.value;
        state.resume.dirty = true;
      }
    });
    list.addEventListener('click', (e) => {
      const item = e.target.closest('[data-idx]');
      if (item) {
        const idx = parseInt(item.dataset.idx, 10);
        if (e.target.closest('[data-remove]')) {
          arr.splice(idx, 1);
          state.resume.dirty = true;
          renderSkillList(lang, key, selector);
        }
        const move = e.target.closest('[data-move]')?.dataset.move;
        if (move) {
          const target = move === 'up' ? idx - 1 : idx + 1;
          if (target >= 0 && target < arr.length) {
            [arr[idx], arr[target]] = [arr[target], arr[idx]];
            state.resume.dirty = true;
            renderSkillList(lang, key, selector);
          }
        }
      }
      if (e.target.closest('[data-add-skill]')) {
        arr.push('');
        state.resume.dirty = true;
        renderSkillList(lang, key, selector);
      }
    });
  }

  function bindArrayHandlers(listEl, arr, rerender) {
    listEl.addEventListener('input', (e) => {
      const card = e.target.closest('[data-idx]');
      if (!card) return;
      const idx = parseInt(card.dataset.idx, 10);
      const field = e.target.dataset.field;
      if (field) {
        arr[idx][field] = e.target.value;
        state.resume.dirty = true;
      }
    });
    listEl.addEventListener('click', (e) => {
      const card = e.target.closest('[data-idx]');
      if (!card) return;
      const idx = parseInt(card.dataset.idx, 10);
      if (e.target.closest('[data-remove]')) {
        confirmAction('Hapus item ini?').then(ok => {
          if (ok) {
            arr.splice(idx, 1);
            state.resume.dirty = true;
            rerender();
          }
        });
      }
      const move = e.target.closest('[data-move]')?.dataset.move;
      if (move) {
        const target = move === 'up' ? idx - 1 : idx + 1;
        if (target >= 0 && target < arr.length) {
          [arr[idx], arr[target]] = [arr[target], arr[idx]];
          state.resume.dirty = true;
          rerender();
        }
      }
    });
  }

  async function saveResume() {
    try {
      toast('Saving resume...', 'info');
      const content = JSON.stringify(state.resume.data, null, 2) + '\n';
      const result = await state.github.putFile('data/resume.json', content, state.resume.sha, 'admin: update resume');
      state.resume.sha = result.content.sha;
      state.resume.dirty = false;
      toast('Resume saved & pushed to GitHub', 'success');
    } catch (err) {
      toast(`Save failed: ${err.message}`, 'error', 6000);
    }
  }

  function previewResume() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="tabs">
        <button class="tab active" data-preview-lang="en">English</button>
        <button class="tab" data-preview-lang="id">Bahasa</button>
      </div>
      <iframe class="preview-frame" id="resume-preview-frame"></iframe>
    `;
    openModal({ title: 'Resume Preview', body: wrap, wide: true });

    const renderPreview = (lang) => {
      const frame = $('#resume-preview-frame');
      const doc = frame.contentDocument || frame.contentWindow.document;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head>
        <link href="css/professional.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <base href="${location.href.replace(/\/[^/]*$/, '/')}">
        <style>body { background: white; padding: 2rem; font-family: Inter, sans-serif; }</style>
        </head><body><div id="resume-content"></div></body></html>`);
      doc.close();
      frame.onload = () => {
        window.PortfolioRenderers.renderResume(state.resume.data, doc.getElementById('resume-content'), lang);
      };
      // Some browsers fire load synchronously; call once anyway:
      setTimeout(() => {
        if (doc.getElementById('resume-content')) {
          window.PortfolioRenderers.renderResume(state.resume.data, doc.getElementById('resume-content'), lang);
        }
      }, 50);
    };
    renderPreview('en');
    wrap.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-preview-lang]');
      if (tab) {
        $$('[data-preview-lang]', wrap).forEach(t => t.classList.toggle('active', t === tab));
        renderPreview(tab.dataset.previewLang);
      }
    });
  }

  // ========================================================================
  // PROJECTS EDITOR
  // ========================================================================

  const PROJECT_TYPES = {
    'image': { label: 'Image + Details (most common)' },
    'video': { label: 'Video Demo + Carousel' },
    'image-grid': { label: 'Image Grid + Carousel' },
    'iframe': { label: 'Embedded Demo (iframe)' },
    'image-only': { label: 'Image Only (no details)' },
    'website-list': { label: 'Website List (multiple URLs)' },
  };

  function renderProjectsView() {
    const view = $('#view-projects');
    view.innerHTML = `
      <div class="view-header">
        <h1><i class="bi bi-collection"></i> Projects</h1>
        <div class="actions">
          <button class="btn ghost" data-action="add-section"><i class="bi bi-plus-square"></i> Add Section</button>
          <button class="btn ghost" data-action="projects-preview"><i class="bi bi-eye"></i> Preview</button>
          <button class="btn primary" data-action="projects-save"><i class="bi bi-cloud-arrow-up"></i> Save to GitHub</button>
        </div>
      </div>
      <div id="sections-list"></div>
    `;
    renderSectionsList();

    view.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'projects-save') saveProjects();
      if (action === 'projects-preview') previewProjects();
      if (action === 'add-section') addSection();
    });
  }

  function renderSectionsList() {
    const list = $('#sections-list');
    const sections = state.projects.data.sections;
    list.innerHTML = sections.map((section, sIdx) => `
      <div class="section-block" data-sidx="${sIdx}">
        <div class="section-block-header">
          <div style="display:flex;align-items:center;gap:.5rem;flex:1;">
            <input type="text" class="section-title-input" data-field="title" value="${attr(section.title)}" style="font-weight:600;font-size:1rem;">
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn small ghost" data-section-move="up" ${sIdx === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
            <button class="btn small ghost" data-section-move="down" ${sIdx === sections.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
            <button class="btn small danger" data-section-remove><i class="bi bi-trash"></i></button>
            <button class="btn small primary" data-add-project><i class="bi bi-plus"></i> Add Project</button>
          </div>
        </div>
        <div class="projects-list">
          ${section.projects.map((p, pIdx) => `
            <div class="card" data-pidx="${pIdx}">
              <div class="card-row">
                <div class="meta">
                  <h3>${escapeHtml(p.title || '(untitled)')}</h3>
                  <p>${escapeHtml(PROJECT_TYPES[p.type]?.label || p.type)}</p>
                </div>
                <div class="actions">
                  <button class="btn small ghost" data-project-move="up" ${pIdx === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
                  <button class="btn small ghost" data-project-move="down" ${pIdx === section.projects.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
                  <button class="btn small" data-project-edit><i class="bi bi-pencil"></i> Edit</button>
                  <button class="btn small danger" data-project-remove><i class="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          `).join('') || '<p class="muted" style="padding:1rem;">No projects yet.</p>'}
        </div>
      </div>
    `).join('');

    list.oninput = (e) => {
      const sIdx = parseInt(e.target.closest('[data-sidx]').dataset.sidx, 10);
      if (e.target.dataset.field === 'title') {
        sections[sIdx].title = e.target.value;
        state.projects.dirty = true;
      }
    };

    list.onclick = (e) => {
      const sectionEl = e.target.closest('[data-sidx]');
      if (!sectionEl) return;
      const sIdx = parseInt(sectionEl.dataset.sidx, 10);
      const section = sections[sIdx];

      const secMove = e.target.closest('[data-section-move]')?.dataset.sectionMove;
      if (secMove) {
        const target = secMove === 'up' ? sIdx - 1 : sIdx + 1;
        if (target >= 0 && target < sections.length) {
          [sections[sIdx], sections[target]] = [sections[target], sections[sIdx]];
          state.projects.dirty = true;
          renderSectionsList();
        }
      }
      if (e.target.closest('[data-section-remove]')) {
        confirmAction(`Hapus section "${section.title}" beserta ${section.projects.length} project di dalamnya?`).then(ok => {
          if (ok) {
            sections.splice(sIdx, 1);
            state.projects.dirty = true;
            renderSectionsList();
          }
        });
      }
      if (e.target.closest('[data-add-project]')) {
        openProjectEditor(sIdx, -1);
      }

      const card = e.target.closest('[data-pidx]');
      if (card) {
        const pIdx = parseInt(card.dataset.pidx, 10);
        if (e.target.closest('[data-project-edit]')) openProjectEditor(sIdx, pIdx);
        if (e.target.closest('[data-project-remove]')) {
          confirmAction(`Hapus project "${section.projects[pIdx].title}"?`).then(ok => {
            if (ok) {
              section.projects.splice(pIdx, 1);
              state.projects.dirty = true;
              renderSectionsList();
            }
          });
        }
        const pMove = e.target.closest('[data-project-move]')?.dataset.projectMove;
        if (pMove) {
          const target = pMove === 'up' ? pIdx - 1 : pIdx + 1;
          if (target >= 0 && target < section.projects.length) {
            [section.projects[pIdx], section.projects[target]] = [section.projects[target], section.projects[pIdx]];
            state.projects.dirty = true;
            renderSectionsList();
          }
        }
      }
    };
  }

  function addSection() {
    const title = prompt('Section title:', 'NEW SECTION');
    if (!title) return;
    state.projects.data.sections.push({ title, projects: [] });
    state.projects.dirty = true;
    renderSectionsList();
  }

  // -----------------------
  // Project editor (modal)
  // -----------------------

  function openProjectEditor(sIdx, pIdx) {
    const isNew = pIdx === -1;
    const section = state.projects.data.sections[sIdx];
    const original = isNew ? { type: 'image', title: '', tech: [], links: [], details: [] } : section.projects[pIdx];
    // Deep copy so editor changes are isolated until save
    const project = JSON.parse(JSON.stringify(original));

    const body = document.createElement('div');
    body.innerHTML = `
      <div class="form-group">
        <label>Project Type</label>
        <select id="ed-type">
          ${Object.entries(PROJECT_TYPES).map(([k, v]) =>
            `<option value="${k}" ${project.type === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>
      <hr>
      <div id="ed-fields"></div>
    `;

    const footer = document.createElement('div');
    footer.innerHTML = `
      <button class="btn ghost" data-cancel>Cancel</button>
      <button class="btn primary" data-save><i class="bi bi-check2"></i> ${isNew ? 'Add' : 'Save'}</button>
    `;

    openModal({ title: isNew ? `New Project in "${section.title}"` : `Edit: ${original.title}`, body, footer, wide: true });

    const renderFields = () => renderProjectFields(project, $('#ed-fields'));
    renderFields();

    body.querySelector('#ed-type').onchange = (e) => {
      project.type = e.target.value;
      renderFields();
    };

    footer.querySelector('[data-cancel]').onclick = () => closeModal();
    footer.querySelector('[data-save]').onclick = () => {
      if (isNew) section.projects.push(project);
      else section.projects[pIdx] = project;
      state.projects.dirty = true;
      renderSectionsList();
      closeModal();
      toast(isNew ? 'Project added (not yet pushed to GitHub)' : 'Project updated (not yet pushed to GitHub)', 'success');
    };
  }

  function renderProjectFields(p, container) {
    container.innerHTML = '';
    // Always present
    container.appendChild(formGroup('Title', input('text', p.title, v => p.title = v)));

    switch (p.type) {
      case 'image':
      case 'image-only':
        container.appendChild(formGroup('Image path', input('text', p.image || '', v => p.image = v)));
        container.appendChild(formGroup('Image alt', input('text', p.imageAlt || '', v => p.imageAlt = v)));
        break;
      case 'video':
        container.appendChild(formGroup('Video src', input('text', p.video || '', v => p.video = v)));
        container.appendChild(formGroup('Fallback image', input('text', p.fallbackImage || '', v => p.fallbackImage = v)));
        container.appendChild(formGroup('Fallback alt', input('text', p.fallbackAlt || '', v => p.fallbackAlt = v)));
        break;
      case 'image-grid':
        container.appendChild(formGroupHtml('Image grid (4 thumbs)', renderImageArrayEditor(p, 'imageGrid')));
        break;
      case 'iframe':
        container.appendChild(formGroup('Iframe src', input('text', p.iframe || '', v => p.iframe = v)));
        container.appendChild(formGroup('Iframe title', input('text', p.iframeTitle || '', v => p.iframeTitle = v)));
        if (!p.meta) p.meta = { category: '', year: '' };
        container.appendChild(formGroup('Category', input('text', p.meta.category, v => p.meta.category = v)));
        container.appendChild(formGroup('Year', input('text', p.meta.year, v => p.meta.year = v)));
        container.appendChild(formGroup('Description (HTML allowed)', textarea(p.description || '', v => p.description = v, 3)));
        break;
      case 'website-list':
        container.appendChild(formGroupHtml('Websites', renderWebsiteListEditor(p)));
        break;
    }

    // Links (most types support these)
    if (p.type !== 'video' && p.type !== 'image-grid') {
      container.appendChild(formGroupHtml('Links', renderLinksEditor(p)));
    } else {
      // video & image-grid also support
      container.appendChild(formGroupHtml('Links', renderLinksEditor(p)));
    }

    // Carousel (video, image-grid)
    if (p.type === 'video' || p.type === 'image-grid') {
      container.appendChild(formGroupHtml('Carousel images', renderImageArrayEditor(p, 'carousel')));
      const cbWrap = document.createElement('div');
      cbWrap.className = 'form-group';
      cbWrap.innerHTML = `<label class="checkbox-label"><input type="checkbox" ${p.carouselAutoplay ? 'checked' : ''}> Autoplay carousel</label>`;
      cbWrap.querySelector('input').onchange = (e) => p.carouselAutoplay = e.target.checked;
      container.appendChild(cbWrap);
    }

    // Features (iframe only)
    if (p.type === 'iframe') {
      container.appendChild(formGroupHtml('Features', renderFeaturesEditor(p)));
    }

    // Details (image, video, image-grid, website-list)
    if (['image', 'video', 'image-grid', 'website-list'].includes(p.type)) {
      container.appendChild(formGroupHtml('Details (sections)', renderDetailsEditor(p)));
    }

    // Tech tags (all except image-only)
    if (p.type !== 'image-only') {
      container.appendChild(formGroupHtml('Tech tags', renderStringArrayEditor(p, 'tech')));
    }
  }

  function formGroup(label, inputEl) {
    const div = document.createElement('div');
    div.className = 'form-group';
    const lbl = document.createElement('label');
    lbl.textContent = label;
    div.append(lbl, inputEl);
    return div;
  }

  function formGroupHtml(label, html) {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `<label>${escapeHtml(label)}</label>`;
    if (typeof html === 'string') div.insertAdjacentHTML('beforeend', html);
    else div.appendChild(html);
    return div;
  }

  function input(type, value, onChange) {
    const el = document.createElement('input');
    el.type = type;
    el.value = value ?? '';
    el.oninput = () => onChange(el.value);
    return el;
  }

  function textarea(value, onChange, rows = 4) {
    const el = document.createElement('textarea');
    el.rows = rows;
    el.value = value ?? '';
    el.oninput = () => onChange(el.value);
    return el;
  }

  function renderLinksEditor(p) {
    if (!Array.isArray(p.links)) p.links = [];
    const wrap = document.createElement('div');
    const rerender = () => {
      wrap.innerHTML = '';
      p.links.forEach((link, i) => {
        const row = document.createElement('div');
        row.className = 'array-item-card';
        row.innerHTML = `
          <div class="array-item-card-header">
            <span>Link #${i + 1}</span>
            <div class="array-item-card-actions">
              <button class="btn small ghost" data-up><i class="bi bi-arrow-up"></i></button>
              <button class="btn small ghost" data-down><i class="bi bi-arrow-down"></i></button>
              <button class="btn small danger" data-del><i class="bi bi-trash"></i></button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Icon (bi-*)</label><input type="text" data-k="icon" value="${attr(link.icon)}" placeholder="bi-github"></div>
            <div class="form-group"><label>Label</label><input type="text" data-k="label" value="${attr(link.label)}"></div>
          </div>
          <div class="form-group"><label>URL</label><input type="text" data-k="url" value="${attr(link.url)}"></div>
        `;
        row.oninput = (e) => { if (e.target.dataset.k) link[e.target.dataset.k] = e.target.value; };
        row.querySelector('[data-del]').onclick = () => { p.links.splice(i, 1); rerender(); };
        row.querySelector('[data-up]').onclick = () => { if (i > 0) { [p.links[i], p.links[i - 1]] = [p.links[i - 1], p.links[i]]; rerender(); } };
        row.querySelector('[data-down]').onclick = () => { if (i < p.links.length - 1) { [p.links[i], p.links[i + 1]] = [p.links[i + 1], p.links[i]]; rerender(); } };
        wrap.appendChild(row);
      });
      const addBtn = document.createElement('button');
      addBtn.className = 'btn small primary';
      addBtn.innerHTML = '<i class="bi bi-plus"></i> Add link';
      addBtn.onclick = () => { p.links.push({ icon: 'bi-globe', label: '', url: '' }); rerender(); };
      wrap.appendChild(addBtn);
    };
    rerender();
    return wrap;
  }

  function renderStringArrayEditor(p, key) {
    if (!Array.isArray(p[key])) p[key] = [];
    const wrap = document.createElement('div');
    const rerender = () => {
      wrap.innerHTML = '';
      const editor = document.createElement('div');
      editor.className = 'array-editor';
      p[key].forEach((s, i) => {
        const row = document.createElement('div');
        row.className = 'array-item';
        row.innerHTML = `
          <input type="text" value="${attr(s)}">
          <button class="btn small ghost" data-up ${i === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
          <button class="btn small ghost" data-down ${i === p[key].length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
          <button class="btn small danger" data-del><i class="bi bi-trash"></i></button>
        `;
        row.querySelector('input').oninput = (e) => p[key][i] = e.target.value;
        row.querySelector('[data-del]').onclick = () => { p[key].splice(i, 1); rerender(); };
        row.querySelector('[data-up]').onclick = () => { if (i > 0) { [p[key][i], p[key][i - 1]] = [p[key][i - 1], p[key][i]]; rerender(); } };
        row.querySelector('[data-down]').onclick = () => { if (i < p[key].length - 1) { [p[key][i], p[key][i + 1]] = [p[key][i + 1], p[key][i]]; rerender(); } };
        editor.appendChild(row);
      });
      wrap.appendChild(editor);
      const addBtn = document.createElement('button');
      addBtn.className = 'btn small primary';
      addBtn.style.marginTop = '.5rem';
      addBtn.innerHTML = '<i class="bi bi-plus"></i> Add';
      addBtn.onclick = () => { p[key].push(''); rerender(); };
      wrap.appendChild(addBtn);
    };
    rerender();
    return wrap;
  }

  function renderImageArrayEditor(p, key) {
    if (!Array.isArray(p[key])) p[key] = [];
    const wrap = document.createElement('div');
    const rerender = () => {
      wrap.innerHTML = '';
      p[key].forEach((img, i) => {
        const row = document.createElement('div');
        row.className = 'array-item';
        row.innerHTML = `
          <input type="text" placeholder="src" value="${attr(img.src)}" style="flex:2;">
          <input type="text" placeholder="alt" value="${attr(img.alt)}" style="flex:1;">
          <button class="btn small ghost" data-up ${i === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
          <button class="btn small ghost" data-down ${i === p[key].length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
          <button class="btn small danger" data-del><i class="bi bi-trash"></i></button>
        `;
        const inputs = row.querySelectorAll('input');
        inputs[0].oninput = (e) => img.src = e.target.value;
        inputs[1].oninput = (e) => img.alt = e.target.value;
        row.querySelector('[data-del]').onclick = () => { p[key].splice(i, 1); rerender(); };
        row.querySelector('[data-up]').onclick = () => { if (i > 0) { [p[key][i], p[key][i - 1]] = [p[key][i - 1], p[key][i]]; rerender(); } };
        row.querySelector('[data-down]').onclick = () => { if (i < p[key].length - 1) { [p[key][i], p[key][i + 1]] = [p[key][i + 1], p[key][i]]; rerender(); } };
        wrap.appendChild(row);
      });
      const addBtn = document.createElement('button');
      addBtn.className = 'btn small primary';
      addBtn.style.marginTop = '.5rem';
      addBtn.innerHTML = '<i class="bi bi-plus"></i> Add image';
      addBtn.onclick = () => { p[key].push({ src: '', alt: '' }); rerender(); };
      wrap.appendChild(addBtn);
    };
    rerender();
    return wrap;
  }

  function renderDetailsEditor(p) {
    if (!Array.isArray(p.details)) p.details = [];
    const wrap = document.createElement('div');
    const rerender = () => {
      wrap.innerHTML = '';
      p.details.forEach((d, i) => {
        const row = document.createElement('div');
        row.className = 'array-item-card';
        row.innerHTML = `
          <div class="array-item-card-header">
            <span>Section #${i + 1}</span>
            <div class="array-item-card-actions">
              <button class="btn small ghost" data-up ${i === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
              <button class="btn small ghost" data-down ${i === p.details.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
              <button class="btn small danger" data-del><i class="bi bi-trash"></i></button>
            </div>
          </div>
          <div class="form-group"><label>Heading</label><input type="text" data-k="heading" value="${attr(d.heading)}"></div>
          <div class="form-group"><label>Paragraph (HTML allowed)</label><textarea data-k="paragraph" rows="3">${escapeHtml(d.paragraph || '')}</textarea></div>
          <div class="form-group"><label>Bullet list (one per line)</label><textarea data-k="list" rows="4" placeholder="One item per line">${escapeHtml((d.list || []).join('\n'))}</textarea></div>
        `;
        row.oninput = (e) => {
          const k = e.target.dataset.k;
          if (k === 'list') d.list = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
          else if (k) d[k] = e.target.value;
        };
        row.querySelector('[data-del]').onclick = () => { p.details.splice(i, 1); rerender(); };
        row.querySelector('[data-up]').onclick = () => { if (i > 0) { [p.details[i], p.details[i - 1]] = [p.details[i - 1], p.details[i]]; rerender(); } };
        row.querySelector('[data-down]').onclick = () => { if (i < p.details.length - 1) { [p.details[i], p.details[i + 1]] = [p.details[i + 1], p.details[i]]; rerender(); } };
        wrap.appendChild(row);
      });
      const addBtn = document.createElement('button');
      addBtn.className = 'btn small primary';
      addBtn.innerHTML = '<i class="bi bi-plus"></i> Add detail section';
      addBtn.onclick = () => { p.details.push({ heading: '', paragraph: '', list: [] }); rerender(); };
      wrap.appendChild(addBtn);
    };
    rerender();
    return wrap;
  }

  function renderFeaturesEditor(p) {
    if (!Array.isArray(p.features)) p.features = [];
    const wrap = document.createElement('div');
    const rerender = () => {
      wrap.innerHTML = '';
      p.features.forEach((f, i) => {
        const row = document.createElement('div');
        row.className = 'array-item-card';
        row.innerHTML = `
          <div class="array-item-card-header">
            <span>Feature group #${i + 1}</span>
            <div class="array-item-card-actions">
              <button class="btn small danger" data-del><i class="bi bi-trash"></i></button>
            </div>
          </div>
          <div class="form-group"><label>Title</label><input type="text" data-k="title" value="${attr(f.title)}"></div>
          <div class="form-group"><label>List items (one per line)</label><textarea data-k="list" rows="5">${escapeHtml((f.list || []).join('\n'))}</textarea></div>
        `;
        row.oninput = (e) => {
          if (e.target.dataset.k === 'list') f.list = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
          else if (e.target.dataset.k) f[e.target.dataset.k] = e.target.value;
        };
        row.querySelector('[data-del]').onclick = () => { p.features.splice(i, 1); rerender(); };
        wrap.appendChild(row);
      });
      const addBtn = document.createElement('button');
      addBtn.className = 'btn small primary';
      addBtn.innerHTML = '<i class="bi bi-plus"></i> Add feature group';
      addBtn.onclick = () => { p.features.push({ title: '', list: [] }); rerender(); };
      wrap.appendChild(addBtn);
    };
    rerender();
    return wrap;
  }

  function renderWebsiteListEditor(p) {
    if (!Array.isArray(p.websites)) p.websites = [];
    const wrap = document.createElement('div');
    const rerender = () => {
      wrap.innerHTML = '';
      p.websites.forEach((w, i) => {
        const row = document.createElement('div');
        row.className = 'array-item-card';
        row.innerHTML = `
          <div class="array-item-card-header">
            <span>Website #${i + 1}</span>
            <div class="array-item-card-actions">
              <button class="btn small ghost" data-up ${i === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
              <button class="btn small ghost" data-down ${i === p.websites.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
              <button class="btn small danger" data-del><i class="bi bi-trash"></i></button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Name</label><input type="text" data-k="name" value="${attr(w.name)}"></div>
            <div class="form-group"><label>URL</label><input type="text" data-k="url" value="${attr(w.url)}"></div>
          </div>
          <div class="form-group"><label>PDF path (optional)</label><input type="text" data-k="pdf" value="${attr(w.pdf || '')}"></div>
        `;
        row.oninput = (e) => { if (e.target.dataset.k) w[e.target.dataset.k] = e.target.value; };
        row.querySelector('[data-del]').onclick = () => { p.websites.splice(i, 1); rerender(); };
        row.querySelector('[data-up]').onclick = () => { if (i > 0) { [p.websites[i], p.websites[i - 1]] = [p.websites[i - 1], p.websites[i]]; rerender(); } };
        row.querySelector('[data-down]').onclick = () => { if (i < p.websites.length - 1) { [p.websites[i], p.websites[i + 1]] = [p.websites[i + 1], p.websites[i]]; rerender(); } };
        wrap.appendChild(row);
      });
      const addBtn = document.createElement('button');
      addBtn.className = 'btn small primary';
      addBtn.innerHTML = '<i class="bi bi-plus"></i> Add website';
      addBtn.onclick = () => { p.websites.push({ name: '', url: '', pdf: '' }); rerender(); };
      wrap.appendChild(addBtn);
    };
    rerender();
    return wrap;
  }

  async function saveProjects() {
    try {
      toast('Saving projects...', 'info');
      const content = JSON.stringify(state.projects.data, null, 2) + '\n';
      const result = await state.github.putFile('data/projects.json', content, state.projects.sha, 'admin: update projects');
      state.projects.sha = result.content.sha;
      state.projects.dirty = false;
      toast('Projects saved & pushed to GitHub', 'success');
    } catch (err) {
      toast(`Save failed: ${err.message}`, 'error', 6000);
    }
  }

  function previewProjects() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<iframe class="preview-frame" id="projects-preview-frame" style="min-height:80vh;"></iframe>`;
    openModal({ title: 'Projects Preview', body: wrap, wide: true });
    const frame = $('#projects-preview-frame');
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head>
      <link href="css/professional.css" rel="stylesheet">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
      <base href="${location.href.replace(/\/[^/]*$/, '/')}">
      <style>body { background: white; padding: 2rem; font-family: Inter, sans-serif; }</style>
      </head><body><div id="projects-root"></div></body></html>`);
    doc.close();
    const renderInto = () => {
      const root = doc.getElementById('projects-root');
      if (root) window.PortfolioRenderers.renderProjects(state.projects.data, root);
    };
    frame.onload = renderInto;
    setTimeout(renderInto, 100);
  }

  // ========================================================================
  // ASSETS UPLOADER
  // ========================================================================

  function renderAssetsView() {
    const view = $('#view-assets');
    view.innerHTML = `
      <div class="view-header">
        <h1><i class="bi bi-image"></i> Assets</h1>
      </div>

      <div class="form-group">
        <label>Target folder (relative to <code>assets/</code>, leave blank for root)</label>
        <input type="text" id="upload-folder" placeholder="e.g. web-compro or slidermobile">
        <small>Folder akan otomatis dibuat oleh GitHub jika belum ada.</small>
      </div>

      <label for="file-input" class="uploader" id="dropzone">
        <i class="bi bi-cloud-upload"></i>
        <p><strong>Click atau drag file ke sini</strong></p>
        <p class="muted">Image, PDF, video &mdash; akan di-commit ke <code>assets/{folder}/{filename}</code></p>
      </label>
      <input type="file" id="file-input" hidden multiple>

      <div id="upload-status" style="margin-top:1rem;"></div>

      <hr>

      <div class="view-header">
        <h2 style="font-size:1.1rem;margin:0;">Browse folder</h2>
        <div class="actions">
          <input type="text" id="browse-folder" placeholder="assets/web-compro" style="width:260px;">
          <button class="btn ghost" id="browse-go"><i class="bi bi-arrow-right"></i> List</button>
        </div>
      </div>
      <div id="browse-result"></div>
    `;

    $('#file-input').onchange = (e) => handleFiles(Array.from(e.target.files));
    const dz = $('#dropzone');
    dz.ondragover = (e) => { e.preventDefault(); dz.classList.add('dragover'); };
    dz.ondragleave = () => dz.classList.remove('dragover');
    dz.ondrop = (e) => {
      e.preventDefault(); dz.classList.remove('dragover');
      handleFiles(Array.from(e.dataTransfer.files));
    };

    $('#browse-go').onclick = () => listFolder($('#browse-folder').value.trim() || 'assets');
  }

  function refreshAssetsList() {
    // Auto-list assets/ on first open
    if (!$('#browse-result').innerHTML) listFolder('assets');
  }

  async function handleFiles(files) {
    const folder = $('#upload-folder').value.trim();
    const status = $('#upload-status');
    status.innerHTML = '';
    for (const file of files) {
      const row = document.createElement('div');
      row.className = 'card';
      row.innerHTML = `<div class="card-row"><div class="meta"><h3>${escapeHtml(file.name)}</h3><p>${(file.size / 1024).toFixed(1)} KB &mdash; uploading...</p></div></div>`;
      status.appendChild(row);
      try {
        const buf = await file.arrayBuffer();
        const path = `assets/${folder ? folder + '/' : ''}${file.name}`;
        await state.github.putBinary(path, buf, `admin: upload ${path}`);
        row.querySelector('p').innerHTML = `<span class="success">✓ Uploaded</span> &mdash; <code>${escapeHtml(path)}</code>`;
      } catch (err) {
        row.querySelector('p').innerHTML = `<span class="error">✗ ${escapeHtml(err.message)}</span>`;
      }
    }
    if ($('#browse-folder').value.trim() === `assets${folder ? '/' + folder : ''}` || !$('#browse-folder').value.trim()) {
      listFolder(`assets${folder ? '/' + folder : ''}`);
    }
  }

  async function listFolder(dirPath) {
    const result = $('#browse-result');
    result.innerHTML = '<div class="spinner"></div> Loading...';
    try {
      const items = await state.github.listDir(dirPath);
      if (!items.length) {
        result.innerHTML = '<div class="empty-state"><i class="bi bi-folder"></i><p>Folder kosong atau tidak ada</p></div>';
        return;
      }
      const folders = items.filter(i => i.type === 'dir');
      const files = items.filter(i => i.type === 'file');
      result.innerHTML = `
        ${folders.length ? `<div style="margin-bottom:1rem;">${folders.map(f =>
          `<button class="btn ghost small" data-folder="${attr(f.path)}" style="margin-right:.5rem;"><i class="bi bi-folder"></i> ${escapeHtml(f.name)}</button>`
        ).join('')}</div>` : ''}
        <div class="asset-grid">${files.map(f => assetTile(f)).join('')}</div>
      `;
      result.querySelectorAll('[data-folder]').forEach(b => b.onclick = () => {
        $('#browse-folder').value = b.dataset.folder;
        listFolder(b.dataset.folder);
      });
      result.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => {
        navigator.clipboard.writeText(b.dataset.copy);
        toast(`Copied: ${b.dataset.copy}`, 'success', 1500);
      });
      result.querySelectorAll('[data-delete]').forEach(b => b.onclick = async () => {
        const { path, sha } = b.dataset;
        if (!await confirmAction(`Hapus ${path}?`)) return;
        try {
          await state.github.deleteFile(path, sha);
          toast('Deleted', 'success');
          listFolder(dirPath);
        } catch (err) { toast(`Delete failed: ${err.message}`, 'error', 5000); }
      });
    } catch (err) {
      result.innerHTML = `<p class="error">Failed to list: ${escapeHtml(err.message)}</p>`;
    }
  }

  function assetTile(file) {
    const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
    const isPdf = /\.pdf$/i.test(file.name);
    const icon = isPdf ? 'bi-file-pdf' : 'bi-file-earmark';
    const preview = isImage
      ? `<img src="${attr(file.download_url)}" alt="${attr(file.name)}" loading="lazy">`
      : `<div class="asset-icon"><i class="bi ${icon}"></i></div>`;
    return `
      <div class="asset-tile">
        ${preview}
        <code>${escapeHtml(file.path)}</code>
        <div class="asset-tile-actions">
          <button class="btn small ghost" data-copy="${attr(file.path)}" title="Copy path"><i class="bi bi-clipboard"></i></button>
          <a class="btn small ghost" href="${attr(file.download_url)}" target="_blank" title="Open"><i class="bi bi-box-arrow-up-right"></i></a>
          <button class="btn small danger" data-delete data-path="${attr(file.path)}" data-sha="${attr(file.sha)}" title="Delete"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `;
  }

  // ========================================================================
  // Modal close handlers
  // ========================================================================

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ========================================================================
  // Boot
  // ========================================================================

  document.addEventListener('DOMContentLoaded', async () => {
    const auth = loadAuth();
    if (auth) {
      try {
        await initApp(auth);
        return;
      } catch (err) {
        // Token might be invalid — fall through to login
        clearAuth();
      }
    }
    $('#login-screen').hidden = false;
    $('#login-btn').onclick = handleLogin;
    $('#login-token').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
    $('#login-repo').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  });

})();
