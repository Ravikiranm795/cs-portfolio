/* Per-case-study animation themes. Keyed by the slug already present in
   <body class="{slug}-page">. Each theme only supplies tokens/preset choices
   plus an optional extras() for that page's bespoke markup — it never touches
   the shared registry in anim-reveal.js. accent colors mirror each project's
   own css/pages/works/{slug}.css :root palette. */
(function () {
  function safe(fn) {
    return function (ctx) {
      try { fn(ctx); } catch (e) { /* one theme's bug stays contained to its page */ }
    };
  }

  window.CSDN_THEMES = {
    default: {
      ease: 'power2.out', dur: 0.7, dist: 28, stagger: 0.08,
      headingPreset: 'fadeUp', mediaPreset: 'scaleIn', galleryPreset: 'fadeUp',
      accent: ['#0a0a0a', '#6f6f6f'], webgl: 'mesh'
    },

    arisinfra: {
      ease: 'power4.out', dur: 0.7, dist: 22, stagger: 0.07,
      headingPreset: 'fadeUp', mediaPreset: 'maskUp', galleryPreset: 'fadeUp',
      accent: ['#f2a022', '#2f7fc1'], webgl: 'lattice',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
        gsap.utils.toArray('.dark-band').forEach(function (band) {
          gsap.fromTo(band, { backgroundPosition: '50% 40%' }, {
            backgroundPosition: '50% 60%', ease: 'none',
            scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
          });
        });
      })
    },

    billd: {
      ease: 'back.out(1.5)', dur: 0.7, dist: 24, stagger: 0.09,
      headingPreset: 'fadeUp', mediaPreset: 'scaleIn', galleryPreset: 'fadeUp',
      accent: ['#3a1050', '#e5a35b'], webgl: 'blobs',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        var cards = gsap.utils.toArray('.pricing-card');
        if (cards.length) {
          gsap.set(cards, { y: 40, opacity: 0 });
          gsap.to(cards, {
            y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.2)', stagger: 0.12,
            scrollTrigger: { trigger: '.pricing-cards', start: 'top 82%' },
            onStart: function () {
              var featured = document.querySelector('.pricing-card.featured');
              if (featured) gsap.fromTo(featured, { scale: 1.04 }, { scale: 1, duration: 0.5, delay: 0.3, ease: 'power2.out' });
            }
          });
        }
        gsap.utils.toArray('.pricing-card-features').forEach(function (list) {
          gsap.from(list.children, {
            opacity: 0, x: -10, duration: 0.4, stagger: 0.04,
            scrollTrigger: { trigger: list, start: 'top 88%' }
          });
        });
        var chips = gsap.utils.toArray('.cs-business-type .cs-chip');
        if (chips.length) {
          gsap.from(chips, {
            opacity: 0, scale: 0.85, duration: 0.5, stagger: 0.05, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: '.cs-business-type', start: 'top 82%' }
          });
        }
      })
    },

    bookdu: {
      ease: 'power2.out', dur: 0.9, dist: 18, stagger: 0.1,
      headingPreset: 'fadeUp', mediaPreset: 'fadeIn', galleryPreset: 'fadeUp',
      accent: ['#5b3a9e', '#2e1c56'], webgl: 'particles',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        var inner = document.querySelector('.cs-progress-inner');
        if (inner) {
          gsap.from(inner, {
            opacity: 0, scale: 0.96, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: inner, start: 'top 88%' }
          });
        }
      })
    },

    happtag: {
      ease: 'back.out(1.4)', dur: 0.65, dist: 26, stagger: 0.08,
      headingPreset: 'fadeUp', mediaPreset: 'scaleIn', galleryPreset: 'pop',
      accent: ['#1da5dc', '#5f59a3'], webgl: 'orbit',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        gsap.utils.toArray('.happtag-tag-card').forEach(function (card, i) {
          gsap.from(card, {
            rotation: -4, opacity: 0, transformOrigin: 'top left',
            duration: 0.6, delay: i * 0.06, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: card, start: 'top 90%' }
          });
        });
        var swatches = gsap.utils.toArray('.happtag-swatch');
        if (swatches.length) {
          gsap.from(swatches, {
            opacity: 0, y: 16, duration: 0.5, stagger: 0.05, ease: 'power2.out',
            scrollTrigger: { trigger: '.happtag-swatches', start: 'top 85%' }
          });
        }
        gsap.utils.toArray('.happtag-feature-card').forEach(function (card) {
          gsap.from(card, {
            opacity: 0, y: 24, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 90%' }
          });
        });
        var stats = gsap.utils.toArray('.cs-stat-value');
        stats.forEach(function (el) {
          var end = parseInt(el.textContent, 10);
          if (isNaN(end)) return;
          var obj = { val: 0 };
          var suffix = /\D+$/.exec(el.textContent);
          gsap.to(obj, {
            val: end, duration: 1.1, ease: 'power1.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: function () { el.textContent = Math.round(obj.val) + (suffix ? suffix[0] : ''); }
          });
        });
      })
    },

    'illustration-sketches': {
      ease: 'power2.out', dur: 0.65, dist: 20, stagger: 0.06,
      headingPreset: 'fadeUp', mediaPreset: 'fadeIn', galleryPreset: 'sketchPop',
      accent: ['#d21b1c', '#158084'], webgl: 'grain',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        var caption = document.querySelector('.illustration-caption');
        if (caption) gsap.set(caption, { clearProps: 'all' });
        var panel = document.querySelector('.illustration-impact-panel');
        if (panel) {
          gsap.from(panel, {
            opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: panel, start: 'top 88%' }
          });
        }
      })
    },

    'prep-my-skills': {
      ease: 'elastic.out(1, 0.6)', dur: 0.9, dist: 30, stagger: 0.1,
      headingPreset: 'fadeUp', mediaPreset: 'scaleIn', galleryPreset: 'fadeUp',
      accent: ['#ef8f35', '#3395ff'], webgl: 'bubbles',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        var illo = document.querySelector('.cs-hero-illustration img');
        if (illo && !ctx.reduced) {
          gsap.to(illo, { y: -6, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        }
      })
    },

    'surge-send': {
      ease: 'power3.out', dur: 0.55, dist: 24, stagger: 0.06,
      headingPreset: 'fadeUp', mediaPreset: 'fromRight', galleryPreset: 'fadeUp',
      accent: ['#1d48e0', '#8dd4ff'], webgl: 'stream',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        var card = document.querySelector('.surge-send-type-card');
        if (card) {
          gsap.from(card, {
            opacity: 0, x: -20, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%' }
          });
        }
        var dots = gsap.utils.toArray('.surge-send-colors .cs-chip');
        if (dots.length) {
          gsap.from(dots, {
            opacity: 0, x: 16, duration: 0.4, stagger: 0.06, ease: 'power3.out',
            scrollTrigger: { trigger: '.surge-send-colors', start: 'top 88%' }
          });
        }
      })
    },

    swash: {
      ease: 'power2.out', dur: 0.6, dist: 20, stagger: 0.08,
      headingPreset: 'fadeUp', mediaPreset: 'maskUp', galleryPreset: 'fadeUp',
      accent: ['#1991cc', '#6e6ed2'], webgl: 'ripples',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        var steps = gsap.utils.toArray('.swash-step');
        steps.forEach(function (step, i) {
          var number = step.querySelector('.swash-step-number');
          var body = step.querySelector('.swash-step-body');
          var tl = gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 85%' } });
          if (number) tl.from(number, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'power2.out' });
          if (body) tl.from(body, { opacity: 0, x: 16, duration: 0.5, ease: 'power2.out' }, '-=0.2');
        });
        var swatches = gsap.utils.toArray('.swash-swatch');
        if (swatches.length) {
          gsap.from(swatches, {
            opacity: 0, x: -20, duration: 0.45, stagger: 0.06, ease: 'power2.out',
            scrollTrigger: { trigger: '.swash-swatches', start: 'top 85%' }
          });
        }
      })
    },

    uax: {
      ease: 'power3.out', dur: 0.7, dist: 26, stagger: 0.08,
      headingPreset: 'fadeUp', mediaPreset: 'scaleIn', galleryPreset: 'fadeUp',
      accent: ['#14102a', '#c026d3', '#7c3aed'], webgl: 'nebula',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        gsap.utils.toArray('.uax-card, .uax-offering').forEach(function (card, i) {
          gsap.from(card, {
            opacity: 0, y: 30, rotateX: 8, transformPerspective: 900, duration: 0.65, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%' }
          });
        });
        var news = gsap.utils.toArray('.uax-news-item');
        if (news.length) {
          gsap.from(news, {
            opacity: 0, y: 16, duration: 0.5, stagger: 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: '.uax-news-list', start: 'top 85%' }
          });
        }
        var rows = gsap.utils.toArray('.uax-token-row');
        if (rows.length) {
          gsap.from(rows, {
            opacity: 0, x: -16, duration: 0.4, stagger: 0.06, ease: 'power2.out',
            scrollTrigger: { trigger: '.uax-tokenomics', start: 'top 85%' }
          });
        }
        var donut = document.querySelector('.uax-donut');
        if (donut) {
          gsap.from(donut, {
            opacity: 0, scale: 0.85, rotation: -25, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: donut, start: 'top 85%' }
          });
        }
        gsap.utils.toArray('.uax-stats-section .cs-stat-value').forEach(function (el) {
          var end = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
          if (isNaN(end)) return;
          var suffix = el.textContent.replace(/^[0-9.,]+/, '');
          var obj = { val: 0 };
          gsap.to(obj, {
            val: end, duration: 1.2, ease: 'power1.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: function () { el.textContent = Math.round(obj.val) + suffix; }
          });
        });
        gsap.utils.toArray('.dark-band').forEach(function (band) {
          gsap.fromTo(band, { backgroundPosition: '50% 45%' }, {
            backgroundPosition: '50% 55%', ease: 'none',
            scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
          });
        });
      })
    },

    zave: {
      ease: 'power2.out', dur: 0.7, dist: 22, stagger: 0.08,
      headingPreset: 'fadeUp', mediaPreset: 'scaleIn', galleryPreset: 'fadeUp',
      accent: ['#197383', '#f0cb56'], webgl: 'mesh',
      extras: safe(function (ctx) {
        var gsap = ctx.gsap;
        var swatches = gsap.utils.toArray('.zave-swatch');
        swatches.forEach(function (sw, i) {
          gsap.from(sw, {
            opacity: 0, rotationY: 60, transformPerspective: 700, duration: 0.55, delay: i * 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: sw, start: 'top 88%' }
          });
        });
        gsap.utils.toArray('.dark-band').forEach(function (band) {
          gsap.from(band, {
            clipPath: 'inset(0 50% 0 50%)', duration: 0.8, ease: 'power2.inOut',
            scrollTrigger: { trigger: band, start: 'top 82%' }
          });
        });
      })
    }
  };
})();
