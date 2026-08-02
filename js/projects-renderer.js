(function () {
  'use strict';

  // Fallback dataset containing all 20 portfolio projects (mobile apps last; portfolio focus is web/SEO)
  const PROJECTS_DATA_FALLBACK = {
    "sections": [
      {
        "title": "WEB APPLICATIONS",
        "projects": [
          {
            "type": "image-grid",
            "title": "HRIS APPLICATION - JUARA HOLDING GROUP",
            "image": "assets/hris-jhg.png",
            "imageGrid": [
              {
                "src": "assets/hris-jhg.png",
                "alt": "HRIS Dashboard - Juara Holding Group"
              },
              {
                "src": "assets/hrisjhgmobile.png",
                "alt": "HRIS Mobile Responsive View - Juara Holding Group"
              }
            ],
            "links": [],
            "carousel": [
              {
                "src": "assets/hris-jhg.png",
                "alt": "HRIS Dashboard Desktop View"
              },
              {
                "src": "assets/hrisjhgmobile.png",
                "alt": "HRIS Mobile Responsive View"
              }
            ],
            "carouselAutoplay": true,
            "details": [
              {
                "heading": "Business Challenge:",
                "paragraph": "Juara Holding Group needed a centralized Human Resource Information System (HRIS) to replace scattered spreadsheets for managing employees, departments, positions, attendance, and leave across the organization."
              },
              {
                "heading": "Solution:",
                "paragraph": "A fully responsive HRIS platform covering the complete employee lifecycle, with a dedicated mobile bottom-navigation layout for field and remote staff.",
                "list": [
                  "Organization & People management with contract/permanent status tracking",
                  "Time & Attendance with photo verification: selfie-based clock in/out for identity verification",
                  "Leave, Overtime & Meeting Room booking approval workflows",
                  "Recruitment & Work Arrangements management",
                  "Mobile-first responsive design with bottom-nav mobile experience"
                ]
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "MySQL",
              "Bootstrap",
              "Responsive Design",
              "Camera/Photo Capture API",
              "REST API"
            ]
          },
          {
            "type": "website-list",
            "title": "NUSA PENIDA TOURISM COMPANY PROFILES",
            "image": "assets/web-compro/activitiespenidatour.pdf",
            "links": [],
            "details": [
              {
                "heading": "Project Overview:",
                "paragraph": "A collection of 7 WordPress company profile websites built for tour & lifestyle operators around Nusa Penida, Bali, optimized for SEO performance, lead generation, and fast loading."
              }
            ],
            "websites": [
              {
                "name": "activitiespenidatour.com",
                "url": "https://activitiespenidatour.com/",
                "pdf": "assets/web-compro/activitiespenidatour.pdf"
              },
              {
                "name": "gahingkarya.com",
                "url": "https://gahingkarya.com/",
                "pdf": "assets/web-compro/gahingkarya.pdf"
              },
              {
                "name": "klingkingbeach.com",
                "url": "https://klingkingbeach.com/",
                "pdf": "assets/web-compro/klingkingbeach-com.pdf"
              },
              {
                "name": "nusapenidacamping.com",
                "url": "https://nusapenidacamping.com/",
                "pdf": "assets/web-compro/nusapenidacamping.pdf"
              },
              {
                "name": "nusapenidatattoo.com",
                "url": "https://nusapenidatattoo.com/",
                "pdf": "assets/web-compro/nusapenidatattoo.pdf"
              },
              {
                "name": "penidatripgo.com",
                "url": "https://penidatripgo.com/",
                "pdf": "assets/web-compro/penidatripgo.pdf"
              },
              {
                "name": "snorkelingpenida.com",
                "url": "https://snorkelingpenida.com/",
                "pdf": "assets/web-compro/snorkelingpenida.pdf"
              }
            ],
            "tech": [
              "WordPress",
              "PHP",
              "HTML",
              "CSS",
              "JavaScript",
              "SEO Optimization"
            ]
          },
          {
            "type": "image-grid",
            "title": "POS PRIMA KARYA TANI",
            "image": "assets/pos-primakaryatani/dashboard.png",
            "imageGrid": [
              {
                "src": "assets/pos-primakaryatani/dashboard.png",
                "alt": "POS Dashboard"
              },
              {
                "src": "assets/pos-primakaryatani/login.png",
                "alt": "POS Login Screen"
              }
            ],
            "links": [
              {
                "icon": "bi-file-pdf",
                "label": "Homepage PDF",
                "url": "assets/pos-primakaryatani/homepage-primakaryatani.pdf"
              },
              {
                "icon": "bi-file-pdf",
                "label": "Offline Mode PDF",
                "url": "assets/pos-primakaryatani/pos-mode-offline.pdf"
              }
            ],
            "carousel": [
              {
                "src": "assets/pos-primakaryatani/dashboard.png",
                "alt": "POS Dashboard"
              },
              {
                "src": "assets/pos-primakaryatani/login.png",
                "alt": "POS Login"
              }
            ],
            "carouselAutoplay": true,
            "details": [
              {
                "heading": "Business Challenge:",
                "paragraph": "CV. Prima Karya Tani needed a point of sale system with offline-first support for rural agricultural retail operations."
              },
              {
                "heading": "Solution:",
                "paragraph": "Full-featured offline-first POS web application with automatic transaction sync upon reconnecting, real-time inventory management, and multi-user role security.",
                "list": [
                  "Offline cashier transaction processing with IndexedDB sync",
                  "Real-time sales dashboard and revenue metrics",
                  "Automated inventory management & low-stock alerts",
                  "Multi-role user authentication (Cashier, Manager, Admin)"
                ]
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "MySQL",
              "JavaScript",
              "Bootstrap",
              "PWA",
              "IndexedDB"
            ]
          },
          {
            "type": "image",
            "title": "MELANJO: ONLINE STORE",
            "image": "assets/tokoonline/admin.png",
            "imageAlt": "Melanjo Online Store",
            "links": [
              {
                "icon": "bi-eye",
                "label": "Show More",
                "url": "melanjo.html"
              }
            ],
            "details": [
              {
                "heading": "E-commerce Development:",
                "paragraph": "Full-featured SME online store built with Laravel 10, integrated with RajaOngkir API for real-time shipping calculation and secure checkout."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "MySQL",
              "RajaOngkir API",
              "Bootstrap",
              "jQuery"
            ]
          },
          {
            "type": "image",
            "title": "ACCESSWASTE",
            "image": "assets/accesswaste.png",
            "imageAlt": "AccessWaste Australia",
            "links": [
              {
                "icon": "bi-globe",
                "label": "accesswaste.com.au",
                "url": "https://accesswaste.com.au/"
              }
            ],
            "details": [
              {
                "heading": "Waste Logistics Platform:",
                "paragraph": "Digital waste management and online skipbin booking platform operating in Perth, Australia. Includes real-time quote generation, automated scheduling, and customer portals."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "Vue.js",
              "MySQL",
              "Bootstrap"
            ]
          },
          {
            "type": "image",
            "title": "PANDOOIN",
            "image": "assets/pandooin.png",
            "imageAlt": "Pandooin Travel Marketplace",
            "links": [
              {
                "icon": "bi-globe",
                "label": "pandooin.com",
                "url": "https://pandooin.com/"
              }
            ],
            "details": [
              {
                "heading": "Travel Marketplace:",
                "paragraph": "Modern travel package marketplace empowering travelers to search, customize, and book tour packages in Indonesia with reactive search filtering."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "Vue.js",
              "Inertia.js",
              "MySQL",
              "Tailwind CSS"
            ]
          },
          {
            "type": "image",
            "title": "VILLAGE POPULATION SYSTEM",
            "image": "assets/desa.png",
            "imageAlt": "Village Population System",
            "links": [],
            "details": [
              {
                "heading": "Government Population System:",
                "paragraph": "Centralized village demographic recording and reporting system for Indonesian local administration with data analytics and interactive charts."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "MySQL",
              "JavaScript",
              "Bootstrap"
            ]
          },
          {
            "type": "image",
            "title": "RESELLR",
            "image": "assets/resellr.png",
            "imageAlt": "Resellr Platform",
            "links": [
              {
                "icon": "bi-globe",
                "label": "resellr.id",
                "url": "https://resellr.id/"
              }
            ],
            "details": [
              {
                "heading": "SME Reseller Platform:",
                "paragraph": "E-commerce reseller distribution system connecting SME suppliers with resellers, featuring automated order routing and Ipaymu payment gateway integration."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "MySQL",
              "Ipaymu API",
              "Bootstrap"
            ]
          },
          {
            "type": "image",
            "title": "QRMENU: RESTAURANT APP",
            "image": "assets/qrmenu.png",
            "imageAlt": "QRMenu Restaurant System",
            "links": [],
            "details": [
              {
                "heading": "Digital Restaurant Menu:",
                "paragraph": "Contactless QR code menu system allowing restaurant diners to view digital menus, filter dietary preferences, and place orders directly from their mobile phones."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "MySQL",
              "Bootstrap",
              "jQuery"
            ]
          },
          {
            "type": "image",
            "title": "ASMOGPSKU: SHIPMENT DATA APP",
            "image": "assets/asmo.png",
            "imageAlt": "AsmoGPSKU",
            "links": [
              {
                "icon": "bi-globe",
                "label": "asmogpsku.com",
                "url": "https://asmogpsku.com/"
              }
            ],
            "details": [
              {
                "heading": "Shipment Tracking System:",
                "paragraph": "Operational shipment logging and logistics monitoring app engineered for Astramotor Bali to replace error-prone manual spreadsheets."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "MySQL",
              "Bootstrap",
              "jQuery"
            ]
          },
          {
            "type": "image",
            "title": "ASTRA MOTOR CATALOG",
            "image": "assets/astrakatalog.png",
            "imageAlt": "Astra Motor Spare Parts Catalog",
            "links": [],
            "details": [
              {
                "heading": "Spare Parts Catalog System:",
                "paragraph": "Comprehensive Honda motorcycle spare parts catalog for Astramotor dealers with instant part lookup, stock availability, and ordering workflows."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "MySQL",
              "Bootstrap",
              "jQuery"
            ]
          },
          {
            "type": "image",
            "title": "ARCTURUS: HOTEL BOOKING",
            "image": "assets/arcturus.png",
            "imageAlt": "Arcturus Hotel Booking System",
            "links": [
              {
                "icon": "bi-github",
                "label": "arcturus.my.id",
                "url": "https://github.com/krisnaxyoga/arcturus"
              }
            ],
            "details": [
              {
                "heading": "Hotel Booking Application:",
                "paragraph": "Travel agent hotel reservation platform built with Laravel, Inertia.js, and React.js for searching room availability, comparing rates, and issuing vouchers."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "React.js",
              "Inertia.js",
              "MySQL",
              "Bootstrap"
            ]
          },
          {
            "type": "image",
            "title": "MULIA PRIVILEGE",
            "image": "assets/muliapr.png",
            "imageAlt": "Mulia Privilege Loyalty App",
            "links": [
              {
                "icon": "bi-eye",
                "label": "Show More",
                "url": "muliaprivileges.html"
              }
            ],
            "details": [
              {
                "heading": "Luxury Resort Loyalty Platform:",
                "paragraph": "Guest loyalty and reward application for The Mulia 5-star resort, featuring point earning algorithms, reward redemptions, and personalized guest services."
              }
            ],
            "tech": [
              "Next.js",
              "Node.js",
              "Express.js",
              "MySQL",
              "Bootstrap"
            ]
          }
        ]
      },
      {
        "title": "UI & UX DESIGN",
        "projects": [
          {
            "type": "image-only",
            "title": "TJS SHUTTLE UI/UX",
            "image": "assets/tjsshuttle.png",
            "imageAlt": "TJS Shuttle UI/UX Design",
            "links": [
              {
                "icon": "bi-palette",
                "label": "Figma Design",
                "url": "https://www.figma.com/design/WjGEfxgKkn7DM9E186agKF/Tj's-Shuttle-homepage?node-id=54-2&t=z0Nu9tGG3EmhKBlB-1"
              }
            ],
            "details": [
              {
                "heading": "Shuttle Booking UI/UX Design:",
                "paragraph": "Figma design system and user interface prototype for shuttle transportation booking service, focusing on clean user flows and mobile responsiveness."
              }
            ],
            "tech": [
              "Figma",
              "UI Design",
              "UX Research",
              "Prototyping"
            ]
          },
          {
            "type": "image-only",
            "title": "PORTFOLIO UI/UX",
            "image": "assets/myprorto.png",
            "imageAlt": "Portfolio UI/UX Design",
            "links": [
              {
                "icon": "bi-palette",
                "label": "Figma Design",
                "url": "https://www.figma.com/design/pmjJOyQO2KHmnDQXdLAyaB/my_portofolio?node-id=0-1&t=fdM5wX5T5k7UWP25-1"
              }
            ],
            "details": [
              {
                "heading": "Personal Portfolio Design System:",
                "paragraph": "Figma design system layout exploring typography scales, dark aesthetic UI components, and case study presentations."
              }
            ],
            "tech": [
              "Figma",
              "UI Design",
              "Visual System"
            ]
          }
        ]
      },
      {
        "title": "AI & INFRASTRUCTURE TOOLS",
        "projects": [
          {
            "type": "image",
            "title": "AI PBN & SERVER MONITORING DASHBOARD",
            "image": "assets/tokoonline/admin.png",
            "imageAlt": "AI PBN & Server Monitoring Dashboard",
            "links": [],
            "details": [
              {
                "heading": "AI-Powered Infrastructure Dashboard:",
                "paragraph": "Centralized control panel integrating Google Search Console API and Google Gemini API to automatically monitor PBN site indexation, domain authority, and traffic anomaly detection."
              }
            ],
            "tech": [
              "PHP",
              "Laravel",
              "Google Gemini API",
              "GSC API",
              "MySQL",
              "REST API"
            ]
          },
          {
            "type": "image",
            "title": "MULIA PMS REST API",
            "image": "assets/pmsapidoc.png",
            "imageAlt": "Mulia PMS API",
            "links": [],
            "details": [
              {
                "heading": "Property Management REST API:",
                "paragraph": "High-performance Node.js and Express.js REST API providing secure endpoints for hotel PMS reservations, room status updates, and guest authentication."
              }
            ],
            "tech": [
              "Node.js",
              "Express.js",
              "MySQL",
              "REST API",
              "JWT"
            ]
          }
        ]
      },
      {
        "title": "MOBILE APPS",
        "projects": [
          {
            "type": "video",
            "title": "E-WALLET MOBILE APPS",
            "video": "assets/flutterdemo.mp4",
            "fallbackImage": "assets/fluttermockup.png",
            "fallbackAlt": "Flutter E-Wallet Mobile App Mockup - Yoga Krisna Portfolio",
            "links": [
              {
                "icon": "bi-github",
                "label": "GITHUB REPO",
                "url": "https://github.com/krisnaxyoga/tomato_ewallet.git"
              }
            ],
            "carousel": [
              {
                "src": "assets/slidermobile/1.png",
                "alt": "E-wallet Screenshot 1"
              },
              {
                "src": "assets/slidermobile/2.png",
                "alt": "E-wallet Screenshot 2"
              },
              {
                "src": "assets/slidermobile/5.png",
                "alt": "E-wallet Screenshot 3"
              }
            ],
            "carouselAutoplay": false,
            "details": [
              {
                "heading": "Business Challenges & Market Opportunity:",
                "paragraph": "E-wallet mobile app development addresses critical fintech industry challenges in delivering seamless, secure, and user-friendly digital payment solutions for modern businesses."
              },
              {
                "heading": "Professional Development Solution:",
                "paragraph": "As an expert Flutter mobile app developer and Laravel backend specialist, I engineered this comprehensive e-wallet solution combining cutting-edge mobile technologies with secure backend infrastructure.",
                "list": [
                  "Intuitive user interface for account balances and transaction management",
                  "Secure Laravel backend API with encrypted communication protocols",
                  "Cross-platform Flutter app running on iOS and Android",
                  "Real-time transaction monitoring, digital receipts, and spending insights"
                ]
              },
              {
                "heading": "Business Impact & Results:",
                "paragraph": "Delivers 95% customer satisfaction and reduces operational costs by 60% with automated transaction processing."
              }
            ],
            "tech": [
              "Flutter",
              "Dart",
              "PHP",
              "Laravel",
              "MySQL",
              "Bootstrap"
            ]
          },
          {
            "type": "image-grid",
            "title": "TRAFFIC SIGNS GAME",
            "image": "assets/slidermobile/tf01.jpg",
            "imageGrid": [
              {
                "src": "assets/slidermobile/tf01.jpg",
                "alt": "Traffic Signs Game Screenshot 1"
              },
              {
                "src": "assets/slidermobile/tf03.jpg",
                "alt": "Traffic Signs Game Screenshot 2"
              },
              {
                "src": "assets/slidermobile/tf04.jpg",
                "alt": "Traffic Signs Game Screenshot 3"
              },
              {
                "src": "assets/slidermobile/tf06.jpg",
                "alt": "Traffic Signs Game Screenshot 4"
              }
            ],
            "links": [
              {
                "icon": "bi-github",
                "label": "GITHUB REPO",
                "url": "https://github.com/krisnaxyoga/tomato_ewallet.git"
              },
              {
                "icon": "bi-palette",
                "label": "Figma Design",
                "url": "https://www.figma.com/design/3w9oQCcQJXxfrNnd0OPB4b/Untitled?t=R2H6MjGUL91vXjGI-0"
              }
            ],
            "carousel": [
              {
                "src": "assets/slidermobile/tf01.jpg",
                "alt": "Traffic Signs Screenshot 1"
              },
              {
                "src": "assets/slidermobile/tf02.jpg",
                "alt": "Traffic Signs Screenshot 2"
              },
              {
                "src": "assets/slidermobile/tf03.jpg",
                "alt": "Traffic Signs Screenshot 3"
              },
              {
                "src": "assets/slidermobile/tf04.jpg",
                "alt": "Traffic Signs Screenshot 4"
              },
              {
                "src": "assets/slidermobile/tf05.jpg",
                "alt": "Traffic Signs Screenshot 5"
              }
            ],
            "carouselAutoplay": true,
            "details": [
              {
                "heading": "Challenges:",
                "paragraph": "Traditional traffic sign education lacks interactive and real-world applicability."
              },
              {
                "heading": "Solution:",
                "paragraph": "Developed an interactive traffic signs detection & quiz application using Flutter and Laravel with Filament admin backend.",
                "list": [
                  "Accurate traffic sign detection and classification",
                  "Interactive quizzes with real-time score tracking",
                  "Cross-platform iOS and Android support",
                  "Comprehensive administrative management panel"
                ]
              }
            ],
            "tech": [
              "Flutter",
              "Dart",
              "PHP",
              "Laravel",
              "Laravel Filament",
              "MySQL"
            ]
          }
        ]
      }
    ]
  };
  let allProjectsList = [];
  let currentFilter = 'all';
  let searchQuery = '';

  const escapeAttr = (s) => String(s ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // PDFs open in the in-site viewer instead of a new tab; everything else
  // (live sites, GitHub, Figma) keeps opening in a new tab as before.
  function resolveLinkTarget(url, label) {
    const isPdf = typeof url === 'string' && /\.pdf(\?.*)?$/i.test(url) && !/^[a-z]+:/i.test(url);
    if (isPdf) {
      const viewerUrl = 'pdf-viewer.html?file=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(label || 'Document');
      return { href: viewerUrl, target: '_self' };
    }
    return { href: url, target: '_blank' };
  }

  // Flatten sections data into a list with normalized fields
  function normalizeData(rawSections) {
    const list = [];
    let globalId = 0;
    (rawSections || []).forEach(sec => {
      const sectionCategory = sec.title || 'OTHER';
      (sec.projects || []).forEach(p => {
        globalId++;
        let cover = p.image || p.fallbackImage || '';
        if (!cover && p.carousel && p.carousel.length) cover = p.carousel[0].src;
        if (!cover && p.imageGrid && p.imageGrid.length) cover = p.imageGrid[0].src;

        // Map section to clean category key
        let catKey = 'web';
        if (sectionCategory.includes('MOBILE')) catKey = 'mobile';
        else if (sectionCategory.includes('UI') || sectionCategory.includes('DESIGN')) catKey = 'design';
        else if (sectionCategory.includes('AI') || sectionCategory.includes('INFRASTRUCTURE') || sectionCategory.includes('REST')) catKey = 'ai';
        else if (p.type === 'iframe' || (p.meta && p.meta.category === 'WEB GAME')) catKey = 'game';

        // Extract summary text
        let summary = p.description || '';
        if (!summary && p.details && p.details.length) {
          summary = p.details[0].paragraph || '';
        }
        // Clean HTML tags from summary for card preview
        summary = summary.replace(/<[^>]*>/g, '').trim();
        if (summary.length > 140) {
          summary = summary.substring(0, 137) + '...';
        }

        list.push({
          id: globalId,
          type: p.type || 'image',
          title: p.title,
          category: sectionCategory,
          catKey: catKey,
          cover: cover,
          fallbackImage: p.fallbackImage,
          video: p.video,
          iframe: p.iframe,
          iframeTitle: p.iframeTitle,
          summary: summary,
          details: p.details || [],
          websites: p.websites || [],
          carousel: p.carousel || [],
          imageGrid: p.imageGrid || [],
          links: p.links || [],
          tech: p.tech || [],
          meta: p.meta || null,
          rawProject: p
        });
      });
    });
    return list;
  }

  function renderTechPills(tech) {
    if (!tech || !tech.length) return '';
    return tech.slice(0, 5).map(t => `<span>${t}</span>`).join('');
  }

  function renderCardActionLinks(links) {
    if (!links || !links.length) return '';
    return links.map(l => {
      const resolved = resolveLinkTarget(l.url, l.label);
      return `
      <a href="${escapeAttr(resolved.href)}" target="${resolved.target}" rel="noopener" class="project-link" onclick="event.stopPropagation();">
        <i class="bi ${escapeAttr(l.icon)}"></i> ${l.label}
      </a>
    `;
    }).join('');
  }

  function renderCard(p) {
    let coverHtml = '';
    if (p.cover) {
      coverHtml = `<img src="${escapeAttr(p.cover)}" alt="${escapeAttr(p.title)}" loading="lazy" />`;
    } else if (p.type === 'iframe') {
      coverHtml = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg, #1e293b, #0f172a);color:#fff;font-family:var(--p-font-display);font-weight:700;gap:.5rem;">
          <i class="bi bi-controller" style="font-size:2.5rem;color:var(--p-primary);"></i>
          <span>Interactive Game</span>
        </div>
      `;
    } else {
      coverHtml = `<div style="height:100%;background:var(--p-bg-muted);"></div>`;
    }

    return `
      <article class="project-showcase-card fade-in" data-id="${p.id}" onclick="window.PortfolioRenderers.openModal(${p.id})">
        <div class="project-card-image">
          ${coverHtml}
          <span class="project-card-category">${p.category}</span>
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title">${p.title}</h3>
          <p class="project-card-desc">${p.summary}</p>
          <div class="project-tech-pills">
            ${renderTechPills(p.tech)}
          </div>
          <div class="project-card-actions">
            <div class="project-card-actions-left">
              ${renderCardActionLinks(p.links)}
            </div>
            <button class="project-details-btn" type="button">
              Details <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderGrid(projects) {
    const gridEl = document.getElementById('projects-grid');
    const counterEl = document.getElementById('projects-counter');
    if (!gridEl) return;

    if (!projects.length) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--p-bg-soft); border-radius: var(--p-radius-lg); border: 1px dashed var(--p-border);">
          <i class="bi bi-search" style="font-size: 2.5rem; color: var(--p-text-light); margin-bottom: 1rem; display: block;"></i>
          <h3 style="margin-bottom: .5rem;">No projects found</h3>
          <p style="color: var(--p-text-muted);">Try adjusting your search query or filter category.</p>
        </div>
      `;
      if (counterEl) counterEl.textContent = 'Showing 0 projects';
      return;
    }

    gridEl.innerHTML = projects.map(p => renderCard(p)).join('');
    if (counterEl) counterEl.textContent = `Showing ${projects.length} of ${allProjectsList.length} projects`;

    // Initialize IntersectionObserver for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.05 });
    gridEl.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  function filterProjects() {
    let filtered = allProjectsList;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(p => {
        if (currentFilter === 'mobile') return p.catKey === 'mobile';
        if (currentFilter === 'web') return p.catKey === 'web';
        if (currentFilter === 'game') return p.catKey === 'game';
        if (currentFilter === 'design') return p.catKey === 'design';
        if (currentFilter === 'ai') return p.catKey === 'ai';
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const inTitle = p.title.toLowerCase().includes(q);
        const inSummary = p.summary.toLowerCase().includes(q);
        const inCategory = p.category.toLowerCase().includes(q);
        const inTech = p.tech.some(t => t.toLowerCase().includes(q));
        return inTitle || inSummary || inCategory || inTech;
      });
    }

    renderGrid(filtered);
  }

  function setupFilterAndSearch() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter || 'all';
        filterProjects();
      });
    });

    const searchInput = document.getElementById('project-search');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value;
        filterProjects();
      });
    }
  }

  // Modal Functionality
  function openModal(projectId) {
    const project = allProjectsList.find(p => p.id === projectId);
    if (!project) return;

    const backdrop = document.getElementById('project-modal');
    if (!backdrop) return;

    const modalTitle = backdrop.querySelector('.project-modal-title');
    const modalBadge = backdrop.querySelector('.project-modal-badge');
    const modalBody = backdrop.querySelector('.project-modal-body');

    if (modalTitle) modalTitle.textContent = project.title;
    if (modalBadge) modalBadge.textContent = project.category;

    // Render Modal Body Content
    let mediaHtml = '';
    if (project.video) {
      mediaHtml = `
        <div class="modal-media-wrapper">
          <video controls autoplay muted loop poster="${escapeAttr(project.cover)}">
            <source src="${escapeAttr(project.video)}" type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
      `;
    } else if (project.type === 'iframe') {
      mediaHtml = `
        <div class="modal-media-wrapper">
          <iframe src="${escapeAttr(project.iframe)}" title="${escapeAttr(project.iframeTitle || project.title)}"></iframe>
        </div>
      `;
    } else if (project.carousel && project.carousel.length) {
      const slides = project.carousel.map((img, i) =>
        `<img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt)}" class="modal-carousel-img${i === 0 ? ' active' : ''}" style="${i === 0 ? 'display:block;' : 'display:none;'}width:100%;max-height:420px;object-fit:cover;">`
      ).join('');
      mediaHtml = `
        <div class="modal-media-wrapper" style="position:relative;">
          <div class="modal-carousel-track">${slides}</div>
          ${project.carousel.length > 1 ? `
            <div style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.7);padding:4px 12px;border-radius:20px;color:#fff;font-size:0.8rem;font-weight:600;">
              ${project.carousel.length} Screenshots
            </div>
          ` : ''}
        </div>
      `;
    } else if (project.websites && project.websites.length) {
      const siteCards = project.websites.map(w => {
        const pdfResolved = w.pdf ? resolveLinkTarget(w.pdf, w.name + ' — PDF Spec') : null;
        return `
        <div style="background:var(--p-bg-soft);border:1px solid var(--p-border);border-radius:10px;padding:1rem;display:flex;flex-direction:column;gap:.4rem;">
          <a href="${escapeAttr(w.url)}" target="_blank" rel="noopener" style="font-weight:700;font-size:.95rem;text-decoration:none;">
            <i class="bi bi-globe"></i> ${w.name}
          </a>
          ${pdfResolved ? `<a href="${escapeAttr(pdfResolved.href)}" target="${pdfResolved.target}" rel="noopener" class="project-link" style="font-size:.8rem;">
            <i class="bi bi-file-pdf"></i> View PDF Spec
          </a>` : ''}
        </div>
      `;
      }).join('');
      mediaHtml = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:1rem;">
          ${siteCards}
        </div>
      `;
    } else if (project.cover) {
      mediaHtml = `
        <div class="modal-media-wrapper">
          <img src="${escapeAttr(project.cover)}" alt="${escapeAttr(project.title)}" />
        </div>
      `;
    }

    // Render detailed text blocks
    let detailsHtml = '';
    if (project.details && project.details.length) {
      detailsHtml = project.details.map(d => {
        const listItems = (d.list || []).map(li => `<li>${li}</li>`).join('');
        const listBlock = listItems ? `<ul class="modal-list">${listItems}</ul>` : '';
        return `
          <div>
            <h4 class="modal-section-h3"><i class="bi bi-check-circle-fill"></i> ${d.heading}</h4>
            <p class="modal-paragraph">${d.paragraph || ''}</p>
            ${listBlock}
          </div>
        `;
      }).join('');
    } else if (project.summary) {
      detailsHtml = `
        <div>
          <h4 class="modal-section-h3"><i class="bi bi-info-circle-fill"></i> Overview</h4>
          <p class="modal-paragraph">${project.summary}</p>
        </div>
      `;
    }

    // Tech stack badges
    const techHtml = project.tech && project.tech.length ? `
      <div>
        <h4 class="modal-section-h3"><i class="bi bi-cpu"></i> Technologies & Architecture</h4>
        <div class="modal-tech-tags">
          ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
      </div>
    ` : '';

    // Links buttons
    const linksHtml = project.links && project.links.length ? `
      <div class="modal-actions">
        ${project.links.map(l => {
          const resolved = resolveLinkTarget(l.url, l.label);
          return `
          <a href="${escapeAttr(resolved.href)}" target="${resolved.target}" rel="noopener" class="project-link" style="padding: 8px 16px; font-size: 0.9rem;">
            <i class="bi ${escapeAttr(l.icon)}"></i> ${l.label}
          </a>
        `;
        }).join('')}
      </div>
    ` : '';

    modalBody.innerHTML = `
      ${mediaHtml}
      ${detailsHtml}
      ${techHtml}
      ${linksHtml}
    `;

    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const backdrop = document.getElementById('project-modal');
    if (!backdrop) return;
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setupModalEvents() {
    const backdrop = document.getElementById('project-modal');
    if (!backdrop) return;

    const closeBtn = backdrop.querySelector('.project-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function resolveJsonUrl() {
    const scriptEl = document.currentScript || document.querySelector('script[src$="projects-renderer.js"]');
    if (scriptEl) return new URL('../data/projects.json', scriptEl.src).href;
    return new URL('data/projects.json', window.location.href).href;
  }

  async function init() {
    let data = PROJECTS_DATA_FALLBACK;
    try {
      const url = resolveJsonUrl();
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        data = await res.json();
      }
    } catch (err) {
      console.warn('Projects renderer using embedded fallback data:', err);
    }

    allProjectsList = normalizeData(data.sections);
    setupFilterAndSearch();
    setupModalEvents();
    renderGrid(allProjectsList);
  }

  window.PortfolioRenderers = window.PortfolioRenderers || {};
  window.PortfolioRenderers.openModal = openModal;
  window.PortfolioRenderers.closeModal = closeModal;
  window.PortfolioRenderers.init = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
