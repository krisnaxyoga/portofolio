(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * Nav drawer
   * ------------------------------------------------------------------ */
  try {
    var navToggle = document.getElementById('st-nav-toggle');
    var navDrawer = document.getElementById('st-nav-drawer');
    if (navToggle && navDrawer) {
      navToggle.addEventListener('click', function () {
        navDrawer.classList.toggle('is-open');
      });
      navDrawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { navDrawer.classList.remove('is-open'); });
      });
    }
  } catch (err) { console.error('nav drawer init failed', err); }

  /* ------------------------------------------------------------------ *
   * Reveal grammar — below-fold content only. The hero (incl. the
   * cut-out subject) is guaranteed visible by a pure-CSS animation in
   * studio.css, so it never depends on this script running at all.
   * ------------------------------------------------------------------ */
  try {
    var groups = document.querySelectorAll('[data-reveal-group]');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var items = entry.target.querySelectorAll('.st-reveal');
          items.forEach(function (el, i) {
            setTimeout(function () { el.classList.add('is-visible'); }, i * 70);
          });
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
      groups.forEach(function (g) { io.observe(g); });
    } else {
      groups.forEach(function (g) {
        g.querySelectorAll('.st-reveal').forEach(function (el) { el.classList.add('is-visible'); });
      });
    }
  } catch (err) { console.error('reveal grammar init failed', err); }

  /* ------------------------------------------------------------------ *
   * Split-wordmark bracket — scroll-bound, not one-shot, so it still
   * answers when the reader scrolls back up. Purely an enhancement on
   * top of the CSS-guaranteed resting state: if this never runs, the
   * hero still renders fully visible and static.
   * ------------------------------------------------------------------ */
  try {
    var hero = document.querySelector('.st-hero');
    var upperLine = document.querySelector('.st-wordmark-line--upper');
    var lowerLine = document.querySelector('.st-wordmark-line--lower');
    var subject = document.querySelector('.st-hero-subject');

    var tickingHero = false;
    var updateHero = function () {
      tickingHero = false;
      if (!hero) return;
      var vh = window.innerHeight;
      var rect = hero.getBoundingClientRect();
      var progress = 1 - (rect.bottom - vh) / rect.height;
      progress = Math.max(0, Math.min(1, progress));

      if (reduceMotion) progress = Math.min(progress, 0.35);

      var upperShift = -0.20 * vh * progress;
      var lowerShift = 0.20 * vh * progress;
      var subjectRise = -0.24 * vh * progress;
      var subjectScale = 1 + 0.06 * progress;

      if (upperLine) upperLine.style.transform = 'translate3d(6%, ' + upperShift + 'px, 0)';
      if (lowerLine) lowerLine.style.transform = 'translate3d(-6%, ' + lowerShift + 'px, 0)';
      if (subject) subject.style.transform = 'translate3d(0, ' + subjectRise + 'px, 0) scale(' + subjectScale + ')';
    };

    var onScrollHero = function () {
      if (!tickingHero) {
        tickingHero = true;
        requestAnimationFrame(updateHero);
      }
    };

    if (hero) {
      window.addEventListener('scroll', onScrollHero, { passive: true });
      window.addEventListener('resize', onScrollHero);
      requestAnimationFrame(updateHero);
    }
  } catch (err) { console.error('hero bracket init failed', err); }

  /* ------------------------------------------------------------------ *
   * Pinned study — every readout is progress * measured-final-value,
   * so the printed number and the marker position never disagree.
   * ------------------------------------------------------------------ */
  try {
    var study = document.getElementById('study');
    var stage = study ? study.querySelector('.st-study-stage') : null;
    var arcPath = document.getElementById('st-arc-path');
    var arcMarker = document.getElementById('st-arc-marker');
    var readoutEls = document.querySelectorAll('[data-readout]');
    var pathLength = arcPath ? arcPath.getTotalLength() : 0;

    var METRICS = {
      performance: { final: 98, suffix: '' },
      seo: { final: 100, suffix: '' },
      impressions: { final: 8000, suffix: '+', format: 'k' },
      ctr: { final: 1.6, suffix: '%', decimals: 1 }
    };

    var formatReadout = function (key, value) {
      var spec = METRICS[key];
      if (!spec) return String(Math.round(value));
      if (spec.format === 'k') return Math.round(value / 1000) + 'K' + spec.suffix;
      if (spec.decimals) return value.toFixed(spec.decimals) + spec.suffix;
      return Math.round(value) + spec.suffix;
    };

    var tickingStudy = false;
    var updateStudy = function () {
      tickingStudy = false;
      if (!study || !stage) return;

      var stageHeight = stage.offsetHeight;
      var scrollable = study.offsetHeight - stageHeight;
      var studyTop = study.getBoundingClientRect().top + window.scrollY;
      var progress = (window.scrollY - studyTop) / (scrollable || 1);
      progress = Math.max(0, Math.min(1, progress));

      if (arcPath && arcMarker && pathLength) {
        var point = arcPath.getPointAtLength(progress * pathLength);
        arcMarker.setAttribute('cx', point.x);
        arcMarker.setAttribute('cy', point.y);
      }

      readoutEls.forEach(function (el) {
        var key = el.getAttribute('data-readout');
        var spec = METRICS[key];
        if (!spec) return;
        el.textContent = formatReadout(key, spec.final * progress);
      });
    };

    var onScrollStudy = function () {
      if (!tickingStudy) {
        tickingStudy = true;
        requestAnimationFrame(updateStudy);
      }
    };

    if (study && stage) {
      window.addEventListener('scroll', onScrollStudy, { passive: true });
      window.addEventListener('resize', onScrollStudy);
      requestAnimationFrame(updateStudy);
    }
  } catch (err) { console.error('pinned study init failed', err); }
})();
