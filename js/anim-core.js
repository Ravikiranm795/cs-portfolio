/* Core motion runtime: Lenis smooth-scroll + GSAP/ScrollTrigger wiring.
   Shared by every page. Fails safe: if GSAP/ScrollTrigger didn't load,
   this reveals the page immediately and does nothing else. */
(function () {
  var root = document.documentElement;

  function pageReady() {
    (window.__csdnPageReady || function () {})();
  }

  var reducedMotion = false;
  try {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    reducedMotion = false;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    window.CSDN_MOTION = { gsap: null, ScrollTrigger: null, lenis: null, reduced: true, theme: null };
    pageReady();
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var lenis = null;
  var coarseSmall = false;
  try {
    coarseSmall = window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 700;
  } catch (e) {
    coarseSmall = false;
  }

  if (!reducedMotion && window.Lenis && !coarseSmall) {
    try {
      lenis = new window.Lenis({
        duration: 1.1,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        autoRaf: false
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      root.classList.add('lenis');
    } catch (e) {
      lenis = null;
    }
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      if (lenis) lenis.resize();
      ScrollTrigger.refresh();
    }
  });

  window.addEventListener('pagehide', function () {
    if (lenis) lenis.destroy();
  });

  var themeKey = 'default';
  var bodyMatch = /(?:^|\s)([a-z0-9-]+)-page(?:\s|$)/.exec(document.body.className);
  if (document.body.dataset.animTheme) {
    themeKey = document.body.dataset.animTheme;
  } else if (bodyMatch) {
    themeKey = bodyMatch[1];
  }
  var themes = window.CSDN_THEMES || {};
  var theme = themes[themeKey] || themes.default || {
    ease: 'power2.out', dur: 0.7, dist: 28, stagger: 0.08,
    headingPreset: 'fadeUp', mediaPreset: 'scaleIn', galleryPreset: 'fadeUp',
    accent: ['#0a0a0a', '#6f6f6f'], webgl: 'mesh'
  };

  window.CSDN_MOTION = {
    gsap: gsap,
    ScrollTrigger: ScrollTrigger,
    lenis: lenis,
    reduced: reducedMotion,
    themeKey: themeKey,
    theme: theme
  };

  pageReady();
})();
