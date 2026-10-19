/*
  Hero scene: a seed underground splits, roots grow down, a shoot rises through the soil and unfolds into a fruiting plant,
  driven by scroll progress p (0..1). Everything is procedural (no model files) and kept light:
  one renderer, ~30 draw calls, tapered tubes rebuilt in place, instanced leaves. The page disposes it when it is far from the viewport.
*/
import * as THREE from 'three';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

function canvasTexture(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; return t;
}

/* ---------- tapered tube rebuilt in place as it grows ---------- */
class GrowTube {
  constructor(curve, N, R, radius, material) {
    this.N = N; this.R = R; this.radius = radius;
    this.pts = []; for (let i = 0; i <= N; i++) this.pts.push(curve.getPoint(i / N));
    const fr = curve.computeFrenetFrames(N, false); this.nor = fr.normals; this.bin = fr.binormals;
    this.geo = new THREE.BufferGeometry();
    this.pos = new Float32Array((N + 1) * (R + 1) * 3); this.nrm = new Float32Array((N + 1) * (R + 1) * 3);
    const idx = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < R; j++) { const a = i * (R + 1) + j, b = (i + 1) * (R + 1) + j; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    this.geo.setIndex(idx); this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); this.geo.setAttribute('normal', new THREE.BufferAttribute(this.nrm, 3));
    this.mesh = new THREE.Mesh(this.geo, material); this.mesh.frustumCulled = false; this.g = -1;
  }
  at(t) { const f = clamp(t) * this.N, i = Math.min(this.N - 1, Math.floor(f)), k = f - i; return this.pts[i].clone().lerp(this.pts[i + 1], k); }
  update(g) {
    if (Math.abs(g - this.g) < 1e-4) return; this.g = g; const { N, R, pos, nrm } = this;
    for (let i = 0; i <= N; i++) {
      const t = i / N, te = Math.min(t, g), c = this.at(te), n = this.nor[i], b = this.bin[i];
      const r = this.radius(t) * Math.sqrt(clamp((g - t) / 0.05));
      for (let j = 0; j <= R; j++) {
        const a = j / R * Math.PI * 2, cx = Math.cos(a), sx = Math.sin(a), o = (i * (R + 1) + j) * 3;
        nrm[o] = n.x * cx + b.x * sx; nrm[o + 1] = n.y * cx + b.y * sx; nrm[o + 2] = n.z * cx + b.z * sx;
        pos[o] = c.x + nrm[o] * r; pos[o + 1] = c.y + nrm[o + 1] * r; pos[o + 2] = c.z + nrm[o + 2] * r;
      }
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.normal.needsUpdate = true;
  }
  dispose() { this.geo.dispose(); }
}

/* ---------- keyframes: camera target y, distance, fov ---------- */
const KEY = [
  [0.00, -13.6, 24, 30],
  [0.13, -13.6, 17, 30],
  [0.30, -19.5, 36, 30],
  [0.46, -9.0, 38, 30],
  [0.60, 2.0, 40, 30],
  [0.78, 10.0, 50, 30],
  [1.00, 14.0, 62, 32]
];
function cam(p) {
  let i = 0; while (i < KEY.length - 2 && p > KEY[i + 1][0]) i++;
  const a = KEY[i], b = KEY[i + 1], t = smooth(a[0], b[0], p);
  return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
}

const SKY = [ /* p, top, horizon */
  [0.00, [0.02, 0.035, 0.03], [0.04, 0.06, 0.05]],
  [0.50, [0.03, 0.05, 0.06], [0.08, 0.1, 0.1]],
  [0.68, [0.16, 0.22, 0.3], [0.9, 0.52, 0.28]],
  [0.84, [0.38, 0.62, 0.8], [0.99, 0.82, 0.55]],
  [1.00, [0.45, 0.72, 0.9], [1.0, 0.92, 0.72]]
];
function sky(p) {
  let i = 0; while (i < SKY.length - 2 && p > SKY[i + 1][0]) i++;
  const a = SKY[i], b = SKY[i + 1], t = smooth(a[0], b[0], p);
  const mix = (x, y) => x.map((v, k) => lerp(v, y[k], t));
  return [mix(a[1], b[1]), mix(a[2], b[2])];
}
const css = (c) => `rgb(${c.map(v => Math.round(clamp(v) * 255)).join(',')})`;

/* the weather of the month: sky tint [r,g,b,amount], hill colour [r,g,b,amount], grass tint [r,g,b,amount], sun strength, falling things */
const SEASONS = {
  winter: { sky: [0.66, 0.74, 0.88, 0.58], hill: [0.86, 0.9, 0.94, 0.85], gt: [0.93, 0.97, 1.0, 0.75], grass: 0.85, sun: 0.5, fall: { shape: 0, c1: [1, 1, 1], c2: [0.82, 0.92, 1], size: 1.0, speed: 0.5, sway: 1.0, count: 1 } },
  spring: { sky: [0.8, 0.86, 1.0, 0.2], hill: [0.4, 0.78, 0.36, 0.4], gt: [0.55, 0.9, 0.4, 0.2], grass: 1.1, sun: 1.0, fall: { shape: 1, c1: [1, 0.74, 0.84], c2: [1, 0.96, 0.98], size: 1.15, speed: 0.4, sway: 1.5, count: 0.8 } },
  summer: { sky: [0.25, 0.6, 1.0, 0.26], hill: [0.7, 0.62, 0.24, 0.5], gt: [0.85, 0.78, 0.3, 0.3], grass: 1.0, sun: 1.25, fall: { shape: 0, c1: [1, 0.88, 0.5], c2: [1, 0.96, 0.72], size: 0.55, speed: 0.08, sway: 1.8, count: 0.4 } },
  autumn: { sky: [1.0, 0.68, 0.42, 0.34], hill: [0.66, 0.36, 0.13, 0.75], gt: [0.78, 0.46, 0.16, 0.55], grass: 0.9, sun: 0.9, fall: { shape: 2, c1: [0.92, 0.42, 0.1], c2: [0.78, 0.16, 0.1], size: 1.35, speed: 0.65, sway: 1.2, count: 0.9 } }
};

export class Hero {
  constructor(canvas, stageEl, opts = {}) {
    this.canvas = canvas; this.stageEl = stageEl; this.mobile = !!opts.mobile; this.season = SEASONS[opts.season] ? opts.season : 'summer'; this.sp = SEASONS[this.season];
    this.p = 0; this.pt = 0; this._up = -1; this._nf = 0; this.time = 0; this.running = false; this.pointer = new THREE.Vector2(); this.ptS = new THREE.Vector2(); this._ft = [];
    this.build();
  }

  build() {
    const { canvas, mobile } = this;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace; r.setClearColor(0, 0);
    this.dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400); this.scene.add(this.camera);
    this.disposables = [];
    this.buildEnv(); this.buildLights(); this.buildSoil(); this.buildHills(); this.buildGrass(); this.buildSeed(); this.buildRoots(); this.buildStem(); this.buildLeaves(); this.buildFruit(); this.buildParticles(); this.buildFall(); this.buildSun();
    this.resize(); this._onResize = () => this.resize(); window.addEventListener('resize', this._onResize);
    this._onMove = (e) => { this.pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1); };
    if (!mobile) window.addEventListener('pointermove', this._onMove, { passive: true });
  }

  track(o) { this.disposables.push(o); return o; }

  buildEnv() {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(60, 24, 12), new THREE.MeshBasicMaterial({ color: 0x182016, side: THREE.BackSide })));
    const box = (w, h, pos, color, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); };
    box(30, 14, [0, 30, 10], 0xfff0d0, 3.2); box(10, 22, [-24, 6, 12], 0xffe0ac, 3.6); box(8, 24, [26, 4, 6], 0xcfe8ff, 2.2); box(40, 10, [0, -22, 10], 0x7a5a30, 0.7); box(18, 8, [0, 4, -30], 0xffb066, 2.0);
    const pm = new THREE.PMREMGenerator(this.renderer); this.envRT = pm.fromScene(s, 0.03); pm.dispose();
    this.scene.environment = this.envRT.texture; this.scene.environmentIntensity = 0.9;
    s.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }

  buildLights() {
    this.hemi = new THREE.HemisphereLight(0xcfe6ff, 0x3a2a18, 0.35); this.sun = new THREE.DirectionalLight(0xffd9a0, 1.8); this.sun.position.set(-26, 40, 30);
    this.glow = new THREE.PointLight(0xffb45a, 90, 40, 1.6); this.glow.position.set(0, -13, 4);
    this.scene.add(this.hemi, this.sun, this.glow);
  }

  buildSoil() {
    const lite = this.mobile;
    const tex = this.track(canvasTexture(lite ? 768 : 1536, lite ? 512 : 1024, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#3f2c1a'); bg.addColorStop(0.35, '#2a1d12'); bg.addColorStop(1, '#0c0806'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 11; i++) { const y = (i + 0.5) / 11 * h, a = 0.05 + rnd() * 0.07; g.fillStyle = `rgba(${rnd() > 0.5 ? '120,86,50' : '20,12,6'},${a})`; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x * 0.006 + i * 2) * 26 + (rnd() - 0.5) * 8); g.lineTo(w, y + 50 + rnd() * 40); g.lineTo(0, y + 60); g.closePath(); g.fill(); }
      for (let i = 0; i < 90; i++) { const x = rnd() * w, y = rnd() * h * 0.95 + 30, rx = 5 + rnd() * 20, ry = rx * (0.55 + rnd() * 0.3), gr = g.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 1, x, y, rx); const base = 70 + Math.floor(rnd() * 70); gr.addColorStop(0, `rgb(${base + 40},${base + 20},${base})`); gr.addColorStop(1, `rgb(${base - 40},${base - 50},${base - 55})`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, rnd() * 3, 0, 6.3); g.fill(); }
    }));
    tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(1.4, 1);
    const grain = lite ? null : this.track(canvasTexture(512, 512, (g, w, h) => {
      g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 5200; i++) { const v = 40 + Math.floor(rnd() * 190), a = 0.25 + rnd() * 0.6; g.fillStyle = `rgba(${v},${v},${v},${a})`; const r = 0.7 + rnd() * 2.2; g.beginPath(); g.arc(rnd() * w, rnd() * h, r, 0, 6.3); g.fill(); }
      for (let i = 0; i < 70; i++) { const x = rnd() * w, y = rnd() * h, r = 4 + rnd() * 9, gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); gr.addColorStop(0, '#d8d8d8'); gr.addColorStop(1, '#505050'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); }
    }, false));
    if (grain) { grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(34, 24); }
    const mat = this.track(lite ? new THREE.MeshLambertMaterial({ map: tex }) : new THREE.MeshStandardMaterial({ map: tex, bumpMap: grain, bumpScale: 2.6, roughness: 1, metalness: 0 }));
    this.soil = new THREE.Mesh(new THREE.PlaneGeometry(190, 130), mat); this.soil.position.set(0, -65, -3); this.scene.add(this.soil); this.track(this.soil.geometry);
  }

  buildHills() {
    this.hills = [];
    [[-70, 7, 0.011, 0], [-52, 5, 0.017, 2], [-36, 3.2, 0.024, 4]].forEach(([z, amp, f, ph], i) => {
      const sh = new THREE.Shape(); sh.moveTo(-170, -8); for (let x = -170; x <= 170; x += 6) sh.lineTo(x, 3 + amp * (0.55 + 0.45 * Math.sin(x * f + ph) + 0.25 * Math.sin(x * f * 2.7 + ph * 1.7))); sh.lineTo(170, -8); sh.closePath();
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0x20382a })); m.position.set(0, -1.5 + i * 0.4, z); this.scene.add(m); this.hills.push(m); this.track(m.geometry); this.track(m.material);
    });
  }

  buildGrass() {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, 0, 0, 0.5, 0, 0, 0, 1, 0]), 3));
    const n = this.mobile ? 200 : 700, off = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { off[i * 4] = (rnd() - 0.5) * 150; off[i * 4 + 1] = -3 + rnd() * 7; off[i * 4 + 2] = 1.1 + rnd() * 2.8; off[i * 4 + 3] = rnd(); }
    const ig = new THREE.InstancedBufferGeometry(); ig.index = g.index; ig.setAttribute('position', g.attributes.position); ig.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 4)); ig.instanceCount = n;
    this.grassMat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, uniforms: { uTime: { value: 0 }, uLight: { value: 0.25 }, uTint: { value: new THREE.Color(1, 1, 1) }, uTintK: { value: 0 } },
      vertexShader: `attribute vec4 aOff; uniform float uTime; varying float vH; varying float vR;
        void main(){ vec3 p = position; float h = aOff.z; p.x *= 0.22 + aOff.w*0.12; p.y *= h; float bend = pow(position.y,2.0) * (sin(uTime*1.3 + aOff.x*0.4 + aOff.w*6.0)*0.35 + (aOff.w-0.5)*0.9);
          p.x += bend * h * 0.5; p += vec3(aOff.x, 0.0, aOff.y); vH = position.y; vR = aOff.w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
      fragmentShader: `uniform float uLight, uTintK; uniform vec3 uTint; varying float vH; varying float vR;
        void main(){ vec3 base = vec3(0.07,0.22,0.1), tip = mix(vec3(0.38,0.7,0.22), vec3(0.62,0.78,0.3), vR); vec3 c = mix(base, tip, vH); c = mix(c, uTint, uTintK * (0.35 + 0.65 * vH)); gl_FragColor = vec4(c * uLight, 1.0); }`
    });
    this.grass = new THREE.Mesh(ig, this.grassMat); this.grass.frustumCulled = false; this.scene.add(this.grass); this.track(ig); this.track(this.grassMat);
  }

  buildSeed() {
    this.seedY = -13.6;
    const bump = this.track(canvasTexture(256, 256, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1800; i++) { const v = 90 + Math.floor(rnd() * 90); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); } for (let i = 0; i < 18; i++) { g.strokeStyle = 'rgba(40,40,40,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.1 + i * 13, 0); g.bezierCurveTo(w * 0.3 + i * 8, h * 0.3, w * 0.2 + i * 10, h * 0.7, w * 0.15 + i * 12, h); g.stroke(); } }, false));
    const col = this.track(canvasTexture(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#e2c27a'); gr.addColorStop(1, '#b98a3e'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(90,55,20,${rnd() * 0.18})`; g.fillRect(rnd() * w, rnd() * h, 2, 3); } }));
    this.seedMat = this.track(new THREE.MeshStandardMaterial({ map: col, bumpMap: bump, bumpScale: 1.4, roughness: 0.5, metalness: 0.02, emissive: 0x3a2308, emissiveIntensity: 0.55 }));
    const capMat = this.track(new THREE.MeshStandardMaterial({ color: 0xf1e3b8, roughness: 0.7, emissive: 0x4a3a18, emissiveIntensity: 0.4 }));
    this.seed = new THREE.Group(); this.seed.position.set(0, this.seedY, 0); this.scene.add(this.seed);
    const half = (phiStart) => { const gm = new THREE.SphereGeometry(1, 36, 26, phiStart, Math.PI); gm.scale(0.9, 1.4, 0.55); gm.rotateY(Math.PI / 2); return gm; };
    this.halfL = new THREE.Mesh(half(Math.PI), this.seedMat); this.halfR = new THREE.Mesh(half(0), this.seedMat);
    const cap = (dir) => { const gm = new THREE.CircleGeometry(1, 36); gm.scale(0.9, 1.4, 1); gm.rotateY(dir * Math.PI / 2); const m = new THREE.Mesh(gm, capMat); m.material.side = THREE.DoubleSide; return m; };
    this.capL = cap(1); this.capR = cap(-1); this.halfL.add(this.capL); this.halfR.add(this.capR);
    this.embryo = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), this.track(new THREE.MeshStandardMaterial({ color: 0x9fe36a, emissive: 0x3c8a2a, emissiveIntensity: 0.9, roughness: 0.5 }))); this.embryo.scale.set(1, 1.5, 1);
    this.seed.add(this.halfL, this.halfR, this.embryo); [this.halfL.geometry, this.halfR.geometry, this.capL.geometry, this.capR.geometry, this.embryo.geometry].forEach(x => this.track(x));
  }

  buildRoots() {
    const mat = this.rootMat = this.track(new THREE.MeshStandardMaterial({ color: 0xeedfb8, roughness: 0.65, emissive: 0x5a4a22, emissiveIntensity: 0.55 }));
    const main = new THREE.CatmullRomCurve3([new THREE.Vector3(0, this.seedY - 1.2, 0), new THREE.Vector3(0.5, this.seedY - 7, 0.3), new THREE.Vector3(-0.6, this.seedY - 14, -0.2), new THREE.Vector3(0.4, this.seedY - 22, 0.3), new THREE.Vector3(0, this.seedY - 30, 0)]);
    this.roots = [{ tube: new GrowTube(main, 70, 6, t => 0.26 * (1 - t * 0.78), mat), start: 0, curve: main, tb: 0 }];
    const lat = [[0.16, -1, 9, 3], [0.2, 1, 11, 4], [0.34, -1, 10, 5], [0.38, 1, 12, 6], [0.5, -1, 9, 8], [0.56, 1, 8, 9], [0.68, -1, 7, 12], [0.72, 1, 6, 13]];
    lat.forEach(([tb, side, dx, dy]) => {
      const o = main.getPoint(tb), pts = [o.clone(), o.clone().add(new THREE.Vector3(side * dx * 0.35, -dy * 0.3, 0.2)), o.clone().add(new THREE.Vector3(side * dx * 0.75, -dy * 0.85 - 1, -0.3)), o.clone().add(new THREE.Vector3(side * dx, -dy * 1.5 - 2.5, 0.2))];
      const c = new THREE.CatmullRomCurve3(pts); this.roots.push({ tube: new GrowTube(c, 40, 5, t => 0.13 * (1 - t * 0.85), mat), start: tb, curve: c, tb });
    });
    this.roots.forEach(r => { this.scene.add(r.tube.mesh); this.track(r.tube); });
  }

  buildStem() {
    this.stemBase = this.seedY + 0.9;
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, this.stemBase, 0), new THREE.Vector3(0.45, this.stemBase + 8, 0.1), new THREE.Vector3(-0.5, this.stemBase + 17, 0), new THREE.Vector3(0.6, this.stemBase + 26, 0.1), new THREE.Vector3(0.1, this.stemBase + 35, 0), new THREE.Vector3(-0.5, this.stemBase + 42, 0)]);
    const mat = this.track(new THREE.MeshStandardMaterial({ color: 0x6fc25a, roughness: 0.55, emissive: 0x143a10, emissiveIntensity: 0.5 }));
    this.stem = new GrowTube(c, 120, 7, t => 0.3 * (1 - t * 0.7), mat); this.scene.add(this.stem.mesh); this.track(this.stem);
  }

  buildLeaves() {
    const alpha = this.track(canvasTexture(128, 128, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.beginPath(); const N = 90;
      for (let k = 0; k <= N; k++) { const t = k / N, x = t * w, ww = Math.sin(Math.PI * Math.pow(t, 0.75)) * 0.48 + 0.02, zig = 1 + 0.11 * Math.sin(t * 52) * (t > 0.08 && t < 0.97 ? 1 : 0); const y = h / 2 - ww * h * zig; k ? g.lineTo(x, y) : g.moveTo(x, y); }
      for (let k = N; k >= 0; k--) { const t = k / N, x = t * w, ww = Math.sin(Math.PI * Math.pow(t, 0.75)) * 0.48 + 0.02, zig = 1 + 0.11 * Math.sin(t * 52 + 1.5) * (t > 0.08 && t < 0.97 ? 1 : 0); g.lineTo(x, h / 2 + ww * h * zig); }
      g.closePath(); g.fill(); }, false));
    const map = this.track(canvasTexture(256, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2a7a34'); gr.addColorStop(0.5, '#3f9e45'); gr.addColorStop(1, '#6cc050'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(210,255,190,.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); g.lineWidth = 2;
      for (let i = 1; i < 9; i++) { const x = i / 9 * w; g.beginPath(); g.moveTo(x, h / 2); g.lineTo(x + w * 0.16, h * 0.08); g.moveTo(x, h / 2); g.lineTo(x + w * 0.16, h * 0.92); g.stroke(); }
    }));
    const mat = this.leafMat = this.track(new THREE.MeshStandardMaterial({ map, alphaMap: alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0, emissive: 0x0d2a0c, emissiveIntensity: 0.5 }));
    const gm = new THREE.PlaneGeometry(1, 1, 10, 10), pos = gm.attributes.position, uv = gm.attributes.uv;
    for (let i = 0; i < pos.count; i++) { const u = uv.getX(i), v = uv.getY(i) * 2 - 1, w = Math.sin(Math.PI * Math.pow(Math.max(u, 0.001), 0.75)) * 0.5 + 0.03; pos.setXYZ(i, u, 0.28 * u - 0.55 * u * u + v * w * 0.55, 0.16 * v * v * w - 0.12 * u * u); }
    gm.computeVertexNormals(); this.track(gm);
    this.nLeaf = this.mobile ? 26 : 38; this.leaves = [];
    for (let k = 0; k < this.nLeaf; k++) { const t = 0.12 + (k / (this.nLeaf - 1)) * 0.84, side = k % 2 ? 1 : -1; this.leaves.push({ t, side, phi: 0.12 + rnd() * 0.75, size: lerp(6.3, 2.7, t) * (0.85 + rnd() * 0.3), alpha: 0.35 + rnd() * 0.3, wob: rnd() * 6 }); }
    this.leafMesh = new THREE.InstancedMesh(gm, mat, this.nLeaf); this.leafMesh.frustumCulled = false; this.scene.add(this.leafMesh);
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._s = new THREE.Vector3(); this._v = new THREE.Vector3();
  }

  buildFruit() {
    this.fruit = [];
    const calyxGeo = new THREE.CylinderGeometry(0.55, 0.12, 0.14, 5); this.track(calyxGeo); const sGeo = new THREE.SphereGeometry(1, 28, 20); this.track(sGeo);
    const calyxMat = this.track(new THREE.MeshStandardMaterial({ color: 0x3b8a3a, roughness: 0.6 }));
    [[0.44, 1, 1.2], [0.52, -1, 1.3], [0.6, 1, 1.4], [0.68, -1, 1.26], [0.76, 1, 1.18], [0.84, -1, 1.1]].forEach(([t, side, size]) => {
      const mat = this.track(new THREE.MeshPhysicalMaterial({ color: 0x7cbf4a, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.18 }));
      const m = new THREE.Mesh(sGeo, mat); m.scale.set(1, 0.9, 1); const c = new THREE.Mesh(calyxGeo, calyxMat); c.position.y = 0.84; m.add(c); m.visible = false; this.scene.add(m);
      this.fruit.push({ m, t, side, size, mat });
    });
  }

  buildParticles() {
    const n = this.mobile ? 90 : 420, box = new THREE.Vector3(70, 60, 40), g = new THREE.BufferGeometry();
    const a = new Float32Array(n * 3), s = new Float32Array(n), kind = new Float32Array(n);
    for (let i = 0; i < n; i++) { a[i * 3] = rnd() * box.x; a[i * 3 + 1] = rnd() * box.y; a[i * 3 + 2] = rnd() * box.z; s[i] = rnd(); kind[i] = rnd() > 0.45 ? 0 : 1; }
    g.setAttribute('position', new THREE.BufferAttribute(a, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(s, 1)); g.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
    this.dustMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: box }, uPx: { value: 1 }, uAbove: { value: 0 } },
      vertexShader: `uniform float uTime, uPx, uAbove; uniform vec3 uCam, uBox; attribute float aSeed; attribute float aKind; varying float vA; varying float vK;
        void main(){ vec3 p = position + vec3(sin(uTime*.12+aSeed*40.)*2., uTime*(.35+aSeed*.5), cos(uTime*.1+aSeed*30.)*2.);
          vec3 rel = mod(p - uCam + uBox*.5, uBox) - uBox*.5; vec3 w = uCam + rel; vec4 mv = viewMatrix*vec4(w,1.); float d = -mv.z;
          float under = smoothstep(2.0, -2.0, w.y); float over = smoothstep(-2.0, 4.0, w.y);
          float want = aKind < .5 ? under : over; vK = aKind;
          vA = smoothstep(uBox.z*.5, uBox.z*.1, length(rel)) * (.3+.7*fract(aSeed*7.13)) * want; vA *= .6 + .4*sin(uTime*(.7+aSeed*1.6)+aSeed*60.);
          gl_PointSize = (0.28 + aSeed*0.8) * uPx / max(d, 6.) * 90.; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vA; varying float vK; void main(){ vec2 c = gl_PointCoord-.5; float r = length(c); float a = smoothstep(.5,.0,r); a*=a; vec3 col = vK < .5 ? vec3(1.,.74,.42) : vec3(.86,1.,.6); gl_FragColor = vec4(col, a*vA*.9); }`
    });
    this.dust = new THREE.Points(g, this.dustMat); this.dust.frustumCulled = false; this.scene.add(this.dust); this.track(g); this.track(this.dustMat);
    /* dirt burst where the shoot breaks the surface */
    const bn = 70, bg = new THREE.BufferGeometry(), bp = new Float32Array(bn * 3), bv = new Float32Array(bn * 3);
    for (let i = 0; i < bn; i++) { bv[i * 3] = (rnd() - 0.5) * 9; bv[i * 3 + 1] = 4 + rnd() * 9; bv[i * 3 + 2] = (rnd() - 0.5) * 4; }
    bg.setAttribute('position', new THREE.BufferAttribute(bp, 3)); this.burstV = bv;
    this.burst = new THREE.Points(bg, this.track(new THREE.PointsMaterial({ color: 0x6b4a2a, size: 0.34, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false })));
    this.burst.frustumCulled = false; this.burst.visible = false; this.scene.add(this.burst); this.track(bg);
  }

  /* snow / petals / pollen / leaves, depending on the month: one cheap Points object that wraps around the camera */
  buildFall() {
    const n = this.mobile ? 60 : 240, box = new THREE.Vector3(60, 50, 34), g = new THREE.BufferGeometry(), a = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { a[i * 3] = rnd() * box.x; a[i * 3 + 1] = rnd() * box.y; a[i * 3 + 2] = rnd() * box.z; sd[i] = rnd(); }
    g.setAttribute('position', new THREE.BufferAttribute(a, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
    this.fallMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: box }, uPx: { value: 1 }, uShape: { value: 0 }, uC1: { value: new THREE.Color() }, uC2: { value: new THREE.Color() }, uSize: { value: 1 }, uSpeed: { value: 0.5 }, uSway: { value: 1 }, uAmt: { value: 0 }, uCount: { value: 1 } },
      vertexShader: `uniform float uTime, uPx, uSize, uSpeed, uSway, uAmt, uCount; uniform vec3 uCam, uBox; attribute float aSeed; varying float vA; varying float vS; varying float vR;
        void main(){ float fall = uTime*uSpeed*(.8+aSeed*.7)*6.; vec3 p = position + vec3(sin(uTime*.4*uSway+aSeed*40.)*1.8, -fall, cos(uTime*.33*uSway+aSeed*30.)*1.4);
          vec3 rel = mod(p - uCam + uBox*.5, uBox) - uBox*.5; vec3 w = uCam + rel; vec4 mv = viewMatrix*vec4(w,1.); float d = -mv.z;
          float over = smoothstep(0.5, 3.0, w.y), on = step(aSeed, uCount);
          vec3 q = abs(rel)/uBox; vA = (1. - smoothstep(.38, .5, q.x)) * (1. - smoothstep(.38, .5, q.y)) * (1. - smoothstep(.38, .5, q.z)) * over * on * uAmt; vS = aSeed; vR = uTime*(.6+aSeed*1.6)+aSeed*20.;
          gl_PointSize = min((.35 + aSeed*.6) * uSize * uPx / max(d, 6.) * 640., 34.); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform float uShape; uniform vec3 uC1, uC2; varying float vA; varying float vS; varying float vR;
        void main(){ vec2 c = gl_PointCoord-.5; float cs = cos(vR), sn = sin(vR); vec2 r = vec2(cs*c.x - sn*c.y, sn*c.x + cs*c.y); float a;
          if (uShape < .5) a = smoothstep(.5, .15, length(c));
          else if (uShape < 1.5) a = smoothstep(1., .7, length(vec2(r.x*1.9, r.y*3.))*2.);
          else a = smoothstep(1., .8, abs(r.x*2.)+abs(r.y*4.2));
          gl_FragColor = vec4(mix(uC1, uC2, fract(vS*5.3)), a*vA); }`
    });
    this.fall = new THREE.Points(g, this.fallMat); this.fall.frustumCulled = false; this.scene.add(this.fall); this.track(g); this.track(this.fallMat);
    this.setSeason(this.season);
  }

  setSeason(name) {
    if (!SEASONS[name]) return; this.season = name; this.sp = SEASONS[name];
    const f = this.sp.fall, u = this.fallMat.uniforms; u.uShape.value = f.shape; u.uC1.value.setRGB(...f.c1); u.uC2.value.setRGB(...f.c2); u.uSize.value = f.size; u.uSpeed.value = f.speed; u.uSway.value = f.sway; u.uCount.value = f.count;
  }

  buildSun() {
    /* white-hot disc, yellow shoulder, soft warm halo: reads as a real sun against a blue sky */
    const tex = this.track(canvasTexture(512, 512, (g, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      [[0, 'rgba(255,255,252,1)'], [0.062, 'rgba(255,253,240,1)'], [0.078, 'rgba(255,246,205,.92)'], [0.12, 'rgba(255,226,130,.55)'], [0.26, 'rgba(255,204,100,.26)'], [0.5, 'rgba(255,186,84,.09)'], [1, 'rgba(255,180,80,0)']].forEach(([o, c]) => gr.addColorStop(o, c));
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }));
    this.sunSprite = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })));
    this.sunSprite.scale.set(100, 100, 1); this.sunSprite.position.set(16, 27, -80); this.scene.add(this.sunSprite);
  }

  resize() {
    const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight; this.w = w; this.h = h;
    this.renderer.setPixelRatio(this.dpr); this.renderer.setSize(w, h, false); this.camera.aspect = w / h;
    this.portrait = w / h < 1; this.camera.userData.k = this.portrait ? 1 + (1 - w / h) * 1.15 : 1;
    this.camera.updateProjectionMatrix(); this.dustMat.uniforms.uPx.value = this.dpr * Math.min(1.4, Math.max(0.7, h / 800)); this.fallMat.uniforms.uPx.value = this.dustMat.uniforms.uPx.value;
  }

  setProgress(p) { this.pt = clamp(p); }

  /* ----- per-frame ----- */
  frame(dt) {
    this.time += dt;
    this.p += (this.pt - this.p) * (1 - Math.exp(-dt * 7)); const p = this.p;
    const open = smooth(0.07, 0.24, p), rootG = smooth(0.16, 0.5, p), stemG = smooth(0.26, 0.74, p), above = smooth(0.5, 0.7, p);
    /* seed */
    const halfX = 0.14 + open * 1.15, sc = lerp(1, 0.82, open);
    this.halfL.position.x = -halfX; this.halfR.position.x = halfX; this.halfL.rotation.z = open * 0.5; this.halfR.rotation.z = -open * 0.5; this.seed.scale.setScalar(sc);
    this.capL.visible = this.capR.visible = open > 0.02; this.embryo.visible = open > 0.02; this.embryo.scale.set(0.5 + open * 0.8, 0.8 + open * 1.2, 0.5 + open * 0.8);
    this.seed.position.y = this.seedY + Math.sin(this.time * 1.4) * 0.05 * (1 - open);
    this.seedMat.emissiveIntensity = 0.5 + 0.3 * Math.sin(this.time * 2.1) * (1 - open) + 0.4 * (1 - smooth(0.0, 0.3, p));
    /* roots, stem, leaves, fruit: on phones only while the scroll position is still moving */
    const g = stemG, moving = !this.mobile || Math.abs(p - this._up) > 1e-4; if (moving) { this._up = p;
    this.roots.forEach((r, i) => { const gk = i === 0 ? rootG : clamp((rootG - r.tb * 0.9) / 0.5); r.tube.update(smooth(0, 1, gk) * 1.0); });
    /* stem + leaves + fruit */
    this.stem.update(stemG * 0.999 + 0.0005);
    for (let k = 0; k < this.nLeaf; k++) {
      const L = this.leaves[k], s = smooth(L.t, L.t + 0.14, g); const pt = this.stem.at(Math.min(L.t, g));
      const unf = lerp(1.35, L.alpha, smooth(0, 1, s)), wob = Math.sin(this.time * 0.9 + L.wob) * 0.04 * s;
      const rotY = L.side > 0 ? -L.phi : Math.PI + L.phi;
      this._e.set(0, rotY, (L.side > 0 ? unf : unf) + wob, 'YZX'); this._q.setFromEuler(this._e);
      this._s.setScalar(Math.max(0.0001, s * L.size)); this._v.copy(pt); this._m.compose(this._v, this._q, this._s); this.leafMesh.setMatrixAt(k, this._m);
    }
    this.leafMesh.instanceMatrix.needsUpdate = true;
    const fr = smooth(0.76, 0.93, p), ripe = smooth(0.84, 1.0, p);
    this.fruit.forEach(f => {
      const pt = this.stem.at(Math.min(f.t, g)), vis = fr > 0.01 && g > f.t; f.m.visible = vis; if (!vis) return;
      const s = f.size * smooth(0, 1, fr) * 1.05; f.m.scale.set(s, s * 0.9, s); f.m.position.set(pt.x + f.side * (0.9 + s * 0.7), pt.y - 1.1 - s * 0.6, pt.z + 0.3);
      f.mat.color.setHex(0x7cbf4a).lerp(this._cY || (this._cY = new THREE.Color(0xf0b030)), smooth(0, 0.5, ripe)).lerp(this._cR || (this._cR = new THREE.Color(0xd8322a)), smooth(0.4, 1, ripe));
    });
    }
    /* light, sky, hills, camera */
    const [top0, hor0] = sky(p), dayK = smooth(0.55, 0.95, p), sp = this.sp, tk = sp.sky[3] * dayK, tint = (c) => c.map((v, i) => lerp(v, sp.sky[i], tk)), top = tint(top0), hor = tint(hor0);
    this.stageEl.style.setProperty('--sky1', css(top)); this.stageEl.style.setProperty('--sky2', css(hor));
    this.hemi.intensity = lerp(0.35, 1.0, dayK); this.sun.intensity = lerp(0.5, 2.6, dayK); this.sun.color.setRGB(lerp(1, 1, dayK), lerp(0.8, 0.93, dayK), lerp(0.55, 0.78, dayK));
    this.glow.intensity = lerp(90, 8, smooth(0.3, 0.7, p)); const rt = this.roots[0].tube.at(Math.min(1, rootG)); this.glow.position.set(0, lerp(this.seedY - 1, Math.min(rt.y + 3, this.stem.at(Math.min(g, 1)).y - 1), smooth(0.2, 0.6, p)), 5);
    this.grassMat.uniforms.uLight.value = lerp(0.22, 1.0, smooth(0.45, 0.9, p)) * lerp(1, sp.grass, dayK); this.grassMat.uniforms.uTint.value.setRGB(sp.gt[0], sp.gt[1], sp.gt[2]); this.grassMat.uniforms.uTintK.value = sp.gt[3] * dayK; this.grassMat.uniforms.uTime.value = this.time;
    this.hills.forEach((h, i) => {
      const day = [[0.36, 0.55, 0.36], [0.28, 0.5, 0.3], [0.2, 0.42, 0.24]][i], night = [[0.07, 0.12, 0.1], [0.06, 0.1, 0.08], [0.05, 0.08, 0.06]][i];
      h.material.color.setRGB(lerp(night[0], day[0], dayK), lerp(night[1], day[1], dayK), lerp(night[2], day[2], dayK), THREE.SRGBColorSpace);
      this._sh = this._sh || new THREE.Color(); h.material.color.lerp(this._sh.setRGB(sp.hill[0], sp.hill[1], sp.hill[2], THREE.SRGBColorSpace), sp.hill[3] * dayK * (1 - i * 0.15));
      this._c = this._c || new THREE.Color(); this._c.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace); h.material.color.lerp(this._c, (0.5 - i * 0.14) * smooth(0.6, 0.95, p));
    });
    this.sunSprite.material.opacity = smooth(0.62, 0.9, p) * 0.95 * sp.sun;
    const fu = this.fallMat.uniforms; fu.uTime.value = this.time; fu.uCam.value.set(this.camera.position.x, this.camera.position.y, this.camera.position.z * 0.4); /* the falling layer lives between the camera and the plant */ fu.uAmt.value = smooth(0.5, 0.72, p);
    const [ty, dist, fov] = cam(p); this.ptS.lerp(this.pointer, 1 - Math.exp(-dt * 3));
    const k = this.camera.userData.k || 1, lookY = ty;
    this.camera.fov = fov * k; this.camera.position.set(this.ptS.x * 1.4, lookY + 1.6 - this.ptS.y * 0.9, dist * (this.portrait ? 1.08 : 1)); this.camera.lookAt(0, lookY, 0);
    if (!this.portrait) this.camera.setViewOffset(this.w, this.h, -this.w * 0.12, 0, this.w, this.h); else this.camera.setViewOffset(this.w, this.h, 0, this.h * 0.2, this.w, this.h); /* phones: lift the scene into the upper half, the text sits below */
    this.camera.updateProjectionMatrix();
    this.dustMat.uniforms.uTime.value = this.time; this.dustMat.uniforms.uCam.value.copy(this.camera.position);
    /* surface burst */
    const bt = smooth(0.52, 0.64, p) * (1 - smooth(0.66, 0.74, p));
    this.burst.visible = bt > 0.01 || (p > 0.52 && p < 0.7);
    if (this.burst.visible) { const b = smooth(0.52, 0.66, p), pos = this.burst.geometry.attributes.position.array; for (let i = 0; i < pos.length / 3; i++) { pos[i * 3] = this.burstV[i * 3] * b; pos[i * 3 + 1] = this.burstV[i * 3 + 1] * b - 14 * b * b + 0.3; pos[i * 3 + 2] = this.burstV[i * 3 + 2] * b; } this.burst.geometry.attributes.position.needsUpdate = true; this.burst.material.opacity = 0.9 * (1 - smooth(0.6, 0.7, p)); }
  }

  start() {
    if (this.running) return; this.running = true; this._last = performance.now();
    const loop = (now) => {
      if (!this.running) return; this._raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this._last) / 1000); this._last = now;
      this.frame(dt); this.renderer.render(this.scene, this.camera);
      if (++this._nf > 24) this._ft.push(dt);
      if (this._ft.length >= 40) { const avg = this._ft.reduce((a, b) => a + b, 0) / this._ft.length; this._ft.length = 0; if (avg > 0.024) { if (this.dpr > 1) { this.dpr = Math.max(1, this.dpr - 0.25); this.resize(); } else this.degrade(); } }
    };
    this._raf = requestAnimationFrame(loop);
  }
  /* last resort on a slow device: drop the decorative layers, keep the plant */
  degrade() {
    if (this._deg) return; this._deg = true;
    this.dust.visible = false; this.fall.visible = false; this.grass.geometry.instanceCount = Math.floor(this.grass.geometry.instanceCount * 0.5);
  }
  stop() { this.running = false; cancelAnimationFrame(this._raf); }

  dispose() {
    this.stop(); window.removeEventListener('resize', this._onResize); window.removeEventListener('pointermove', this._onMove);
    this.disposables.forEach(o => { try { if (o.dispose) o.dispose(); } catch (e) { /* already disposed */ } });
    this.envRT && this.envRT.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss();
  }
}
