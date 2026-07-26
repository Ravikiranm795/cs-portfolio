/* Generic scroll-reveal engine. Attaches to existing shared class names only —
   adds no markup, no CSS initial-hidden state. Every animated element ends
   with clearProps so it carries zero inline style once revealed. */
(function () {
  var motion = window.CSDN_MOTION;
  if (!motion || !motion.gsap || !motion.ScrollTrigger || motion.reduced) return;

  var gsap = motion.gsap;
  var ScrollTrigger = motion.ScrollTrigger;
  var theme = motion.theme;

  /* Images have no width/height attributes anywhere on this site, so any
     element already in the viewport at script-run time has unreliable
     geometry (its card may still be collapsing as images decode). Rather
     than hide it and hope a later ScrollTrigger.refresh() catches up before
     the user notices, elements already visible right now are left alone —
     no hide, no animation, just naturally visible. Only elements the user
     still has to scroll to get the hide+reveal treatment, by which point
     images will have loaded and geometry is trustworthy. */
  function inViewport(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  function fromVars(presetName, dist) {
    switch (presetName) {
      case 'fadeIn': return { opacity: 0 };
      case 'fromLeft': return { x: -dist * 1.4, opacity: 0 };
      case 'fromRight': return { x: dist * 1.4, opacity: 0 };
      case 'scaleIn': return { scale: 0.965, opacity: 0, transformOrigin: 'center center' };
      case 'maskUp': return { clipPath: 'inset(100% 0 0 0)' };
      case 'pop': return { scale: 0.9, opacity: 0 };
      case 'sketchPop': return null; // handled per-element (seeded rotation)
      case 'fadeUp':
      default: return { y: dist, opacity: 0 };
    }
  }

  var CLEAR = 'transform,opacity,willChange,clipPath';

  function revealScroll(target, presetName, opts) {
    opts = opts || {};
    var els = gsap.utils.toArray(target);
    if (!els.length) return;
    els = els.filter(function (el) { return !inViewport(el); });
    if (!els.length) return;
    var vars = fromVars(presetName, opts.dist || theme.dist);
    if (!vars) return;
    vars = Object.assign({}, vars, {
      duration: opts.dur || theme.dur,
      ease: opts.ease || theme.ease,
      stagger: opts.stagger != null ? opts.stagger : 0,
      clearProps: CLEAR,
      scrollTrigger: { trigger: opts.trigger || els[0], start: opts.start || 'top 88%' }
    });
    gsap.from(els, vars);
  }

  function revealLoad(target, presetName, opts) {
    opts = opts || {};
    var els = gsap.utils.toArray(target);
    if (!els.length) return;
    var vars = fromVars(presetName, opts.dist || theme.dist);
    if (!vars) return;
    vars = Object.assign({}, vars, {
      duration: opts.dur || theme.dur,
      ease: opts.ease || theme.ease,
      stagger: opts.stagger != null ? opts.stagger : 0,
      delay: opts.delay || 0,
      clearProps: CLEAR
    });
    gsap.from(els, vars);
  }

  /* ---- Shared chrome (every page) ---- */
  revealLoad('.site-header', 'fadeIn');
  revealScroll('.footer-logo', 'fadeUp');
  revealScroll('.footer-contact .contact-item', 'fadeUp', { stagger: 0.08, trigger: '.footer-contact' });
  revealScroll('.footer-socials .pill-btn', 'pop', { stagger: 0.035, trigger: '.footer-socials' });
  revealScroll('.footer-copyright', 'fadeIn');

  /* ---- index.html ---- */
  revealLoad('.hero-logo', 'maskUp');
  revealLoad('.hero-copy > *', 'fadeUp', { stagger: 0.12, delay: 0.1 });
  revealLoad('.hero-phone', 'scaleIn', { delay: 0.25 });
  revealScroll('.featured-work .eyebrow, .featured-work .section-title', 'fadeUp');
  revealScroll('.work-strip-tile', 'fromRight', { stagger: 0.05, trigger: '.work-strip-track', dist: 20 });
  revealScroll('.view-all .outline-btn', 'fadeUp');
  revealScroll('.testimonials .eyebrow, .trusted-by-logos, .trusted-by-note', 'fadeUp', { stagger: 0.1, trigger: '.testimonials' });
  revealScroll('.testimonial-nav, .testimonial-content > *', 'fadeUp', { stagger: 0.09, trigger: '.testimonial' });

  /* ---- about.html ---- */
  revealLoad('.about-hero-title', 'fadeUp');
  revealLoad('.about-hero-photo', 'maskUp', { delay: 0.15 });
  revealScroll('.about-intro-copy > *', 'fadeUp', { stagger: 0.1, trigger: '.about-intro' });
  gsap.utils.toArray('.service-row').forEach(function (row, i) {
    revealScroll(row, i % 2 === 0 ? 'fromLeft' : 'fromRight', { trigger: row });
  });
  revealScroll('.tool-tile', 'pop', { stagger: 0.05, trigger: '.tools-grid' });
  revealScroll('.career-copy > *', 'fadeUp', { stagger: 0.08, trigger: '.career-copy' });
  revealScroll('.experience-entry, .education-entry', 'fadeUp', { stagger: 0.07, trigger: '.resume' });

  /* ---- lets-connect.html ---- */
  revealLoad('.connect-hero-title', 'fadeUp');
  revealLoad('.connect-intro, .connect-hero .contact-item', 'fadeUp', { stagger: 0.1, delay: 0.1 });
  revealScroll('.social-tile', 'pop', { stagger: 0.06, trigger: '.social-tiles' });
  revealScroll('.deck-media', 'fromLeft', { trigger: '.deck-cta-inner' });
  revealScroll('.deck-copy > *', 'fadeUp', { stagger: 0.1, trigger: '.deck-copy' });

  /* ---- all-works.html ---- */
  revealLoad('.works-hero-title', 'fadeUp');
  revealLoad('.works-tab', 'fadeIn', { stagger: 0.06 });

  /* ---- Grid cohesion: one consistent reveal, no per-card variation ---- */
  ['.work-card', '.work-list-card'].forEach(function (sel) {
    var items = gsap.utils.toArray(sel).filter(function (el) { return !inViewport(el); });
    if (!items.length) return;
    gsap.set(items, { y: 24, opacity: 0 });
    ScrollTrigger.batch(items, {
      interval: 0.1,
      batchMax: 3,
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power2.out', clearProps: CLEAR, overwrite: true });
      }
    });
  });

  /* Works-tab filter interop: never leave a re-shown card stranded invisible.
     main.js's own filter sets inline style.display on each card — clear only
     the GSAP-owned properties (CLEAR), never 'all', or this would wipe out
     that display:none and defeat the category filter entirely. */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.works-tab')) return;
    requestAnimationFrame(function () {
      gsap.set('.work-list-card', { clearProps: CLEAR });
      ScrollTrigger.refresh();
    });
  });

  /* ---- Case-study shared skeleton (all 10 pages) ---- */
  revealLoad('.cs-hero .eyebrow, .cs-hero-title, .cs-hero-intro', theme.headingPreset, { stagger: 0.1, delay: 0.1 });
  revealLoad('.cs-hero-media', 'maskUp', { delay: 0.25 });
  revealScroll('.cs-stats .cs-stat', 'pop', { stagger: 0.07, trigger: '.cs-stats' });

  gsap.utils.toArray('.cs-section').forEach(function (section) {
    var reverse = section.classList.contains('reverse');
    var copy = section.querySelector(':scope > .cs-section-copy');
    var media = section.querySelector(':scope > .cs-section-media');
    var mediaGrid = section.querySelector(':scope > .cs-section-media-grid');
    if (copy) revealScroll(copy, reverse ? 'fromRight' : 'fromLeft', { trigger: section });
    if (media) revealScroll(media, reverse ? 'fromLeft' : 'fromRight', { trigger: section });
    if (mediaGrid) {
      var imgs = mediaGrid.querySelectorAll('img');
      if (imgs.length) revealScroll(imgs, 'fadeUp', { stagger: 0.06, trigger: mediaGrid, dist: 16 });
      else revealScroll(mediaGrid, reverse ? 'fromLeft' : 'fromRight', { trigger: section });
    }
  });

  gsap.utils.toArray('.cs-section-full').forEach(function (section) {
    var heading = section.querySelector(':scope > .cs-section-heading');
    var paras = section.querySelectorAll(':scope > p');
    if (heading) revealScroll(heading, 'fadeUp', { trigger: section });
    if (paras.length) revealScroll(paras, 'fadeUp', { stagger: 0.08, trigger: section, delay: heading ? 0.08 : 0 });
  });

  /* Galleries: batched for pages with many items (e.g. illustration-sketches) */
  (function () {
    var galleryItems = gsap.utils.toArray('.cs-gallery .gallery-item').filter(function (el) { return !inViewport(el); });
    if (!galleryItems.length) return;
    if (theme.galleryPreset === 'sketchPop') {
      galleryItems.forEach(function (el, i) {
        var rot = ((i * 37) % 5) - 2;
        gsap.set(el, { opacity: 0, y: theme.dist * 0.7, scale: 0.98, rotation: rot });
      });
      ScrollTrigger.batch(galleryItems, {
        interval: 0.08, batchMax: 4, start: 'top 90%', once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out', clearProps: CLEAR, overwrite: true });
        }
      });
    } else {
      gsap.set(galleryItems, { y: theme.dist * 0.7, opacity: 0 });
      ScrollTrigger.batch(galleryItems, {
        interval: 0.08, batchMax: 4, start: 'top 90%', once: true,
        onEnter: function (batch) {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power2.out', clearProps: CLEAR, overwrite: true });
        }
      });
    }
  })();

  /* .cs-chip instances are scattered across many separate sections on a
     case-study page (not one co-located group) — batch so each cluster
     triggers independently as it scrolls into view, instead of one
     ScrollTrigger firing every chip on the page off the first chip's position. */
  (function () {
    var chips = gsap.utils.toArray('.cs-chip').filter(function (el) { return !inViewport(el); });
    if (!chips.length) return;
    gsap.set(chips, { scale: 0.9, opacity: 0 });
    ScrollTrigger.batch(chips, {
      interval: 0.06, batchMax: 4, start: 'top 92%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'back.out(1.5)', clearProps: CLEAR, overwrite: true });
      }
    });
  })();

  revealScroll('.cs-closer-title', theme.headingPreset);
  revealScroll('.cs-closer-media', 'maskUp');

  /* ---- Per-case-study bespoke extras ---- */
  if (typeof theme.extras === 'function') {
    theme.extras({ gsap: gsap, ScrollTrigger: ScrollTrigger, reduced: motion.reduced });
  }

  ScrollTrigger.refresh();
})();
