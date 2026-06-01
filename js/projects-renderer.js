(function () {
  const escapeAttr = (s) => String(s ?? '').replace(/"/g, '&quot;');

  function renderLinks(links) {
    if (!links || !links.length) return '';
    const items = links.map(l => `
      <a href="${escapeAttr(l.url)}" class="project-link" target="_blank" rel="noopener">
        <i class="bi ${escapeAttr(l.icon)}"></i>
        ${l.label}
      </a>
    `).join('');
    return `<div class="project-links">${items}</div>`;
  }

  function renderTech(tech) {
    if (!tech || !tech.length) return '';
    const tags = tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    return `<div class="tech-tags">${tags}</div>`;
  }

  function renderDetails(details) {
    if (!details || !details.length) return '';
    return details.map(d => {
      const list = d.list && d.list.length
        ? `<ul>${d.list.map(li => `<li>${li}</li>`).join('')}</ul>`
        : '';
      return `
        <h3>${d.heading}</h3>
        <p>${d.paragraph || ''}</p>
        ${list}
      `;
    }).join('');
  }

  function renderCarousel(carousel, autoplay, carouselId) {
    if (!carousel || !carousel.length) return '';
    const images = carousel.map((img, i) =>
      `<img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt)}" class="carousel-image${i === 0 ? ' active' : ''}">`
    ).join('');
    const indicators = carousel.map((_, i) =>
      `<span class="carousel-indicator${i === 0 ? ' active' : ''}" data-slide="${i + 1}"></span>`
    ).join('');
    return `
      <div class="project-carousel">
        <div class="carousel-container" id="${carouselId}" data-autoplay="${autoplay ? '1' : '0'}">
          ${images}
          <button class="carousel-controls carousel-prev"><i class="bi bi-chevron-left"></i></button>
          <button class="carousel-controls carousel-next"><i class="bi bi-chevron-right"></i></button>
          <div class="carousel-indicators">${indicators}</div>
        </div>
      </div>
    `;
  }

  function renderProject(project, index) {
    const carouselId = `carousel-${index}`;
    let media = '';
    let body = '';

    switch (project.type) {
      case 'video': {
        media = `
          <div class="video-container">
            <video class="project-video" controls muted>
              <source src="${escapeAttr(project.video)}" type="video/mp4" />
            </video>
          </div>
          <img src="${escapeAttr(project.fallbackImage)}" alt="${escapeAttr(project.fallbackAlt)}" class="project-image fallback-hidden project-fallback-image" />
        `;
        body = `
          <div class="project-content">
            ${renderCarousel(project.carousel, project.carouselAutoplay, carouselId)}
            <div class="project-details">
              ${renderDetails(project.details)}
              ${renderTech(project.tech)}
            </div>
          </div>
        `;
        break;
      }
      case 'image-grid': {
        media = `<div class="image-grid">${project.imageGrid.map(img =>
          `<img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt)}">`).join('')}</div>`;
        body = `
          <div class="project-content">
            ${renderCarousel(project.carousel, project.carouselAutoplay, carouselId)}
            <div class="project-details">
              ${renderDetails(project.details)}
              ${renderTech(project.tech)}
            </div>
          </div>
        `;
        break;
      }
      case 'iframe': {
        media = `
          <div class="project-media">
            <iframe src="${escapeAttr(project.iframe)}" width="100%" height="400"
              title="${escapeAttr(project.iframeTitle || project.title)}"></iframe>
          </div>
        `;
        const meta = project.meta
          ? `<div class="project-meta">
              <span class="project-category">${project.meta.category}</span>
              <span class="project-year">${project.meta.year}</span>
            </div>`
          : '';
        const features = (project.features || []).map(f => `
          <div class="project-features">
            <h4>${f.title}</h4>
            <ul>${f.list.map(li => `<li>${li}</li>`).join('')}</ul>
          </div>
        `).join('');
        body = `
          <div class="project-content">
            <h2 class="project-title">${project.title}</h2>
            ${meta}
            ${renderLinks(project.links)}
            <div class="project-description">
              <p>${project.description || ''}</p>
              ${features}
              <div class="tech-stack">
                <h4>TECHNOLOGY STACK:</h4>
                ${renderTech(project.tech)}
              </div>
            </div>
          </div>
        `;
        // iframe layout has title inside body, return early
        return `<article class="project-card project-content fade-in">${media}${body}</article>`;
      }
      case 'image-only': {
        return `
          <article class="project-card project-content fade-in">
            <img src="${escapeAttr(project.image)}" alt="${escapeAttr(project.imageAlt)}" class="project-image">
            <h2 class="project-title">${project.title}</h2>
            ${renderLinks(project.links)}
          </article>
        `;
      }
      case 'image':
      default: {
        media = `<img src="${escapeAttr(project.image)}" alt="${escapeAttr(project.imageAlt)}" class="project-image">`;
        body = `
          <div class="project-details">
            ${renderDetails(project.details)}
            ${renderTech(project.tech)}
          </div>
        `;
        break;
      }
    }

    // Default layout: media on top, title, links, then body
    return `
      <article class="project-card project-content fade-in">
        ${media}
        <h2 class="project-title">${project.title}</h2>
        ${renderLinks(project.links)}
        ${body}
      </article>
    `;
  }

  function initCarousels(root) {
    const carousels = root.querySelectorAll('.carousel-container');
    carousels.forEach(carousel => {
      let current = 0;
      const slides = carousel.querySelectorAll('.carousel-image');
      const indicators = carousel.querySelectorAll('.carousel-indicator');
      if (!slides.length) return;

      const show = (n) => {
        if (n >= slides.length) n = 0;
        if (n < 0) n = slides.length - 1;
        current = n;
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(i => i.classList.remove('active'));
        slides[current].classList.add('active');
        if (indicators[current]) indicators[current].classList.add('active');
      };

      const prev = carousel.querySelector('.carousel-prev');
      const next = carousel.querySelector('.carousel-next');
      if (prev) prev.addEventListener('click', () => show(current - 1));
      if (next) next.addEventListener('click', () => show(current + 1));
      indicators.forEach((ind, i) => ind.addEventListener('click', () => show(i)));

      if (carousel.dataset.autoplay === '1') {
        setInterval(() => show(current + 1), 3000);
      }
    });
  }

  function initVideoFallback(root) {
    root.querySelectorAll('.video-container').forEach(container => {
      const video = container.querySelector('video');
      const fallback = container.parentElement.querySelector('.project-fallback-image');
      if (video && fallback) {
        video.addEventListener('error', () => {
          fallback.style.display = 'block';
          container.style.display = 'none';
        });
      }
    });
  }

  function initFadeIn(root) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    root.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  async function loadProjects() {
    const container = document.getElementById('projects-root');
    if (!container) return;
    try {
      const res = await fetch('data/projects.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let idx = 0;
      const html = data.sections.map(section => {
        const projectsHtml = section.projects.map(p => renderProject(p, idx++)).join('');
        return `
          <section class="section-header fade-in">
            <h2 class="section-title">${section.title}</h2>
          </section>
          ${projectsHtml}
        `;
      }).join('');

      container.innerHTML = html;
      initCarousels(container);
      initVideoFallback(container);
      initFadeIn(container);
    } catch (err) {
      container.innerHTML = `<p style="color:red;text-align:center;padding:2rem;">Failed to load projects: ${err.message}</p>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjects);
  } else {
    loadProjects();
  }
})();
