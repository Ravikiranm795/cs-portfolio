/* Cross-page fade transitions for this full-page-reload multi-page site.
   No library dependency — must keep working even if every CDN fails. */
(function () {
  var root = document.documentElement;
  var overlay = document.querySelector('.page-fade');

  function reveal() {
    root.classList.remove('page-leaving');
    (window.__csdnPageReady || function () {})();
  }

  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(reveal);
  });

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      root.classList.remove('page-leaving');
      root.classList.add('page-ready');
      if (window.CSDN_MOTION && window.CSDN_MOTION.lenis) window.CSDN_MOTION.lenis.resize();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
  });

  if (!overlay || !root.classList.contains('anim-js')) return;

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return;
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;

    var url;
    try { url = new URL(href, window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;

    e.preventDefault();
    root.classList.remove('page-ready');
    root.classList.add('page-leaving');

    var done = false;
    function go() {
      if (done) return;
      done = true;
      window.location.href = url.href;
    }
    overlay.addEventListener('transitionend', function handler(ev) {
      if (ev.propertyName !== 'opacity') return;
      overlay.removeEventListener('transitionend', handler);
      go();
    });
    setTimeout(go, 400);
  }, false);
})();
