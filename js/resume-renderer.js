(function () {
  let resumeData = null;
  let currentLang = 'en';

  function renderExperience(items) {
    return items.map(item => `
      <article class="experience-card fade-in">
        <div class="experience-header">
          <div class="experience-meta">
            <div class="experience-period">${item.period}</div>
            <div class="experience-position">${item.position}</div>
            <div class="experience-company">${item.company}</div>
            <div class="experience-location">${item.location}</div>
          </div>
          <div class="experience-description">${item.description}</div>
        </div>
      </article>
    `).join('');
  }

  function renderEducation(items) {
    return items.map(item => `
      <article class="education-card fade-in">
        <div class="education-header">
          <div class="education-meta">
            <div class="education-period">${item.period}</div>
            <div class="education-degree">${item.degree}</div>
            <div class="education-school">${item.school}</div>
            <div class="education-location">${item.location}</div>
          </div>
          <div class="experience-description">${item.description}</div>
        </div>
      </article>
    `).join('');
  }

  function renderSkills(items) {
    return items.map(s => `<div class="skill-item">${s}</div>`).join('');
  }

  function renderLanguageContent(lang) {
    const data = resumeData.languages[lang];
    return `
      <section>
        <div class="section-header fade-in">
          <div class="section-icon"><i class="bi bi-briefcase"></i></div>
          <h2 class="section-title">${data.labels.experience}</h2>
        </div>
        ${renderExperience(data.experience)}
      </section>

      <section>
        <div class="section-header fade-in">
          <div class="section-icon"><i class="bi bi-mortarboard"></i></div>
          <h2 class="section-title">${data.labels.education}</h2>
        </div>
        ${renderEducation(data.education)}
      </section>

      <section class="skills-section">
        <div class="section-header fade-in">
          <div class="section-icon"><i class="bi bi-tools"></i></div>
          <h2 class="section-title">${data.labels.skills}</h2>
        </div>
        <div class="skills-card fade-in">
          <div class="skills-category">
            <div class="skills-header">
              <div class="skills-icon"><i class="bi bi-gear"></i></div>
              <h3 class="skills-title">${data.labels.professionalSkills}</h3>
            </div>
            <div class="skills-grid">${renderSkills(data.professionalSkills)}</div>
          </div>
          <div class="skills-category">
            <div class="skills-header">
              <div class="skills-icon"><i class="bi bi-code-slash"></i></div>
              <h3 class="skills-title">${data.labels.technologies}</h3>
            </div>
            <div class="skills-grid">${renderSkills(data.technologies)}</div>
          </div>
        </div>
      </section>
    `;
  }

  function observeFadeIn(root) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    root.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  function renderActive() {
    const container = document.getElementById('resume-content');
    if (!container) return;
    container.innerHTML = renderLanguageContent(currentLang);
    observeFadeIn(container);
  }

  window.switchLanguage = function (lang) {
    currentLang = lang;
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-id').classList.toggle('active', lang === 'id');
    renderActive();
  };

  async function loadResume() {
    const container = document.getElementById('resume-content');
    if (!container) return;
    try {
      const res = await fetch('data/resume.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      resumeData = await res.json();

      const cvLink = document.getElementById('cv-download');
      if (cvLink && resumeData.cvFile) cvLink.href = resumeData.cvFile;

      renderActive();
    } catch (err) {
      container.innerHTML = `<p style="color:red;text-align:center;padding:2rem;">Failed to load resume: ${err.message}</p>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadResume);
  } else {
    loadResume();
  }
})();
