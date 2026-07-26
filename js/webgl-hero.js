/* Subtle WebGL hero accent. ESM so three.js (module-only build) can be
   dynamically imported — only after every gate below passes, so slow
   devices/connections never pay for it and the hero image/text is never
   delayed or obscured. One instance per page, mounted behind hero content
   at z-index:-1 inside an absolutely-positioned layer (see css/animations.css). */
(function () {
  var host = document.querySelector('.cs-hero') || document.querySelector('.hero');
  if (!host) return;

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduced = true; }
  if (reduced) return;
  if (window.innerWidth < 900) return;
  try {
    if (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1200) return;
  } catch (e) { /* ignore */ }
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return;

  var probe = document.createElement('canvas');
  var gl;
  try { gl = probe.getContext('webgl2') || probe.getContext('webgl'); } catch (e) { gl = null; }
  if (!gl) return;

  var VARIANTS = {
    lattice: { mode: 0, freq: 5.5, speed: 0.35, particles: 0 },
    blobs: { mode: 1, freq: 2.6, speed: 0.3, particles: 0 },
    particles: { mode: 1, freq: 2.0, speed: 0.2, particles: 40 },
    orbit: { mode: 1, freq: 2.4, speed: 0.28, particles: 70 },
    grain: { mode: 2, freq: 3.0, speed: 0.5, particles: 0 },
    bubbles: { mode: 1, freq: 2.2, speed: 0.24, particles: 90 },
    stream: { mode: 4, freq: 3.4, speed: 0.6, particles: 120 },
    ripples: { mode: 3, freq: 4.4, speed: 0.3, particles: 0 },
    nebula: { mode: 1, freq: 2.0, speed: 0.24, particles: 150, opacityBoost: 1.7 },
    mesh: { mode: 1, freq: 1.6, speed: 0.18, particles: 0 }
  };

  function hexToVec3(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return [0.5, 0.5, 0.5];
    var n = parseInt(m[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  var theme = (window.CSDN_MOTION && window.CSDN_MOTION.theme) || {};
  var variantKey = theme.webgl || 'mesh';
  var variant = VARIANTS[variantKey] || VARIANTS.mesh;
  var colorA = hexToVec3(theme.accent && theme.accent[0]);
  var colorB = hexToVec3(theme.accent && theme.accent[1] || theme.accent && theme.accent[0]);
  var baseOpacity = 0.09 * (variant.opacityBoost || 1);

  var layer = document.createElement('div');
  layer.className = 'hero-webgl';
  layer.setAttribute('aria-hidden', 'true');
  host.insertBefore(layer, host.firstChild);

  var state = { renderer: null, raf: null, running: false, disposed: false, clock0: 0, elapsed: 0 };

  function boot(THREE) {
    if (state.disposed) return;
    var w = host.clientWidth || 1;
    var h = host.clientHeight || 1;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true, antialias: false, powerPreference: 'low-power',
        stencil: false, depth: false, failIfMajorPerformanceCaveat: true
      });
    } catch (e) { return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    layer.appendChild(renderer.domElement);
    state.renderer = renderer;

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    var uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(w, h) },
      uColorA: { value: new THREE.Vector3(colorA[0], colorA[1], colorA[2]) },
      uColorB: { value: new THREE.Vector3(colorB[0], colorB[1], colorB[2]) },
      uFreq: { value: variant.freq },
      uOpacity: { value: baseOpacity },
      uMode: { value: variant.mode }
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = vec4(position.xy, 0.0, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision mediump float;',
        'varying vec2 vUv;',
        'uniform float uTime;',
        'uniform vec2 uResolution;',
        'uniform vec3 uColorA;',
        'uniform vec3 uColorB;',
        'uniform float uFreq;',
        'uniform float uOpacity;',
        'uniform int uMode;',
        'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
        'void main() {',
        '  vec2 uv = vUv * 2.0 - 1.0;',
        '  uv.x *= uResolution.x / max(uResolution.y, 1.0);',
        '  float t = uTime;',
        '  float field;',
        '  if (uMode == 0) {',
        '    vec2 g = uv * uFreq + vec2(sin(t * 0.5), cos(t * 0.4)) * 0.3;',
        '    field = 0.5 + 0.5 * sin(g.x * 3.14159) * sin(g.y * 3.14159 + t);',
        '  } else if (uMode == 2) {',
        '    field = hash(floor(uv * uFreq * 30.0) + floor(t * 6.0));',
        '  } else if (uMode == 3) {',
        '    float d = length(uv);',
        '    field = 0.5 + 0.5 * sin(d * uFreq * 5.0 - t * 1.6);',
        '  } else if (uMode == 4) {',
        '    field = 0.5 + 0.5 * sin(uv.x * uFreq * 1.6 + t * 2.2) * (1.0 - clamp(abs(uv.y), 0.0, 1.0) * 0.6);',
        '  } else {',
        '    field = 0.5 + 0.5 * sin(uv.x * uFreq + t + sin(uv.y * uFreq * 0.7 - t * 0.5) * 1.3);',
        '  }',
        '  float d2 = length(uv);',
        '  float edge = smoothstep(0.1, 1.3, d2);',
        '  vec3 color = mix(uColorA, uColorB, field);',
        '  gl_FragColor = vec4(color, uOpacity * edge);',
        '}'
      ].join('\n')
    });

    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    var points = null;
    if (variant.particles > 0) {
      var count = variant.particles;
      var positions = new Float32Array(count * 3);
      var velocities = [];
      for (var i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() * 2 - 1);
        positions[i * 3 + 1] = (Math.random() * 2 - 1);
        positions[i * 3 + 2] = 0;
        velocities.push({
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05
        });
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var ptMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(theme.accent && theme.accent[1] || '#ffffff'),
        size: 0.012, transparent: true, opacity: 0.35, depthWrite: false
      });
      points = new THREE.Points(geo, ptMaterial);
      scene.add(points);
      state.velocities = velocities;
    }

    state.scene = scene;
    state.camera = camera;
    state.material = material;
    state.mesh = mesh;
    state.points = points;
    state.THREE = THREE;

    startLoop();

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startLoop(); else stopLoop();
      });
    }, { threshold: 0, rootMargin: '100px' });
    io.observe(host);
    state.io = io;

    document.addEventListener('visibilitychange', onVisibility);

    var resizeTimer = null;
    var ro = new ResizeObserver(function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 150);
    });
    ro.observe(host);
    state.ro = ro;

    window.addEventListener('pagehide', dispose);
  }

  function onVisibility() {
    if (document.hidden) stopLoop(); else if (isHostVisible()) startLoop();
  }

  function isHostVisible() {
    var r = host.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  var lastFrame = 0;
  function tick(now) {
    if (!state.running) return;
    state.raf = requestAnimationFrame(tick);
    if (now - lastFrame < 33) return; // cap ~30fps
    lastFrame = now;
    if (!state.clock0) state.clock0 = now;
    state.elapsed = (now - state.clock0) / 1000;
    state.material.uniforms.uTime.value = state.elapsed;

    if (state.points && state.velocities) {
      var pos = state.points.geometry.attributes.position;
      for (var i = 0; i < state.velocities.length; i++) {
        var v = state.velocities[i];
        var x = pos.getX(i) + v.x * 0.016;
        var y = pos.getY(i) + v.y * 0.016;
        if (x > 1.05) x = -1.05; if (x < -1.05) x = 1.05;
        if (y > 1.05) y = -1.05; if (y < -1.05) y = 1.05;
        pos.setXY(i, x, y);
      }
      pos.needsUpdate = true;
    }

    state.renderer.render(state.scene, state.camera);
  }

  function startLoop() {
    if (state.running || state.disposed || !state.renderer) return;
    state.running = true;
    state.raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = null;
  }

  function onResize() {
    if (state.disposed || !state.renderer) return;
    var w = host.clientWidth || 1;
    var h = host.clientHeight || 1;
    state.renderer.setSize(w, h, false);
    state.material.uniforms.uResolution.value.set(w, h);
  }

  function dispose() {
    if (state.disposed) return;
    state.disposed = true;
    stopLoop();
    document.removeEventListener('visibilitychange', onVisibility);
    if (state.io) state.io.disconnect();
    if (state.ro) state.ro.disconnect();
    if (state.material) state.material.dispose();
    if (state.mesh) state.mesh.geometry.dispose();
    if (state.points) { state.points.geometry.dispose(); state.points.material.dispose(); }
    if (state.renderer) {
      state.renderer.dispose();
      if (state.renderer.forceContextLoss) state.renderer.forceContextLoss();
      if (state.renderer.domElement && state.renderer.domElement.parentNode) {
        state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
      }
    }
  }

  function loadThree() {
    import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.min.js')
      .then(function (THREE) { boot(THREE); })
      .catch(function () { /* silent: WebGL accent is purely decorative */ });
  }

  window.addEventListener('load', function () {
    if (window.requestIdleCallback) {
      requestIdleCallback(loadThree, { timeout: 800 });
    } else {
      setTimeout(loadThree, 400);
    }
  });
})();
