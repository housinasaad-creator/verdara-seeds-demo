/*
  Product page 3D: one seed packet (pillow-shaped pouch with crimped seams), a few drifting seeds, a soft shadow.
  Light on purpose: a single mesh pair, one instanced mesh, no post-processing. Renders only while visible; dispose() frees everything.
*/
import * as THREE from 'three';
import { drawPacket, fontsReady } from '../art.js?v=10191953';
import { drawMark } from '../brand.js?v=10191953';
import { catById, CROPS, describe } from '../data.js?v=10191953';
import { tl } from '../core.js?v=10191953';

const W = 2.7, H = 3.67;               // packet size (aspect 560:760)
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function pillow(seg = [26, 34]) {
  const g = new THREE.PlaneGeometry(W, H, seg[0], seg[1]), pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const nx = pos.getX(i) / (W / 2), ny = pos.getY(i) / (H / 2);
    const body = Math.pow(Math.max(0, 1 - nx * nx), 0.7) * Math.pow(Math.max(0, 1 - ny * ny), 0.7);
    const crimp = smooth(0.84, 0.95, Math.abs(ny));
    pos.setZ(i, 0.34 * body * (1 - crimp * 0.82) + crimp * (0.03 + 0.016 * Math.sin(nx * 64)));
  }
  g.computeVertexNormals(); return g;
}

function backCanvas(p, lang, size = 880) {
  const cv = document.createElement('canvas'), w = 560, h = 760, S = size / w; cv.width = size; cv.height = Math.round(h * S);
  const g = cv.getContext('2d'), cat = catById(p.cat), c = CROPS[p.crop];
  g.scale(S, S); g.beginPath(); g.roundRect(0, 0, w, h, 26); g.clip();
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6f0e0'); gr.addColorStop(1, '#e9dec3'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = cat.color; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14);
  g.fillStyle = 'rgba(16,38,27,.16)'; for (const [y0, d] of [[0, 1], [h, -1]]) for (let i = 0; i < 70; i++) { g.beginPath(); g.moveTo(i * 8, y0); g.lineTo(i * 8 + 4, y0 + d * 9); g.lineTo(i * 8 + 8, y0); g.fill(); }
  drawMark(g, w / 2, 112, 38, cat.color, '#f6f0e0');
  g.textAlign = 'center'; g.fillStyle = '#10261b'; g.font = '700 22px "Manrope", sans-serif'; g.letterSpacing = '6px'; g.fillText('VERDARA', w / 2, 176); g.letterSpacing = '0px';
  g.font = '600 46px "Cormorant Garamond", serif'; g.fillText(p.name, w / 2, 236);
  /* description, wrapped */
  g.fillStyle = 'rgba(16,38,27,.78)'; g.font = (lang === 'ar' ? '600 21px "Tajawal"' : '600 18px "Manrope"') + ', sans-serif'; g.direction = lang === 'ar' ? 'rtl' : 'ltr';
  const words = describe(p, lang).split(' '); let line = '', y = 292; const maxW = 400;
  for (const wd of words) { const t = line ? `${line} ${wd}` : wd; if (g.measureText(t).width > maxW && line) { g.fillText(line, w / 2, y); y += 30; line = wd; } else line = t; }
  if (line) g.fillText(line, w / 2, y);
  /* spec rows */
  const rows = [[tl('p.depth', lang), `${c.depth} ${tl('p.cm', lang)}`], [tl('p.space', lang), `${c.space} ${tl('p.cm', lang)}`], [tl('p.temp', lang), `${c.temp} °C`], [tl('p.germ', lang), `${c.germ} ${tl('p.d', lang)}`]];
  g.direction = 'ltr'; let ry = 470; g.textAlign = 'left';
  rows.forEach(([a, b]) => {
    g.strokeStyle = 'rgba(16,38,27,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(70, ry + 14); g.lineTo(w - 70, ry + 14); g.stroke();
    g.textAlign = lang === 'ar' ? 'right' : 'left'; g.fillStyle = 'rgba(16,38,27,.6)'; g.font = (lang === 'ar' ? '600 18px "Tajawal"' : '700 15px "Manrope"') + ', sans-serif'; g.fillText(a, lang === 'ar' ? w - 70 : 70, ry);
    g.textAlign = lang === 'ar' ? 'left' : 'right'; g.fillStyle = '#10261b'; g.font = '700 19px "Manrope", sans-serif'; g.fillText(b, lang === 'ar' ? 70 : w - 70, ry); ry += 44;
  });
  /* barcode-like strip + code */
  g.fillStyle = '#10261b'; let x = 190; for (let i = 0; i < 38; i++) { const bw = 2 + ((i * 7) % 4); g.fillRect(x, 676, bw, 40); x += bw + 3; }
  g.textAlign = 'center'; g.font = '700 14px "Manrope", sans-serif'; g.fillStyle = 'rgba(16,38,27,.7)'; g.fillText(p.code, w / 2, 740);
  return cv;
}

function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(20,32,22,.55)'); r.addColorStop(1, 'rgba(20,32,22,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); return t;
}

export class Packet3D {
  constructor(canvas, host, { mobile = false } = {}) {
    this.canvas = canvas; this.host = host; this.mobile = mobile; this.running = false; this.time = 0; this.dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
    this.rot = { x: 0, y: 0, tx: 0, ty: 0 }; this.drag = null; this._ft = []; this.disposables = [];
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.02;
    const s = this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60); this.camera.position.set(0, 0, 11.5);
    s.add(new THREE.HemisphereLight(0xfff6e4, 0xb9c9a8, 1.15));
    const key = new THREE.DirectionalLight(0xfff0d6, 2.3); key.position.set(-3.5, 5, 6); s.add(key);
    const rim = new THREE.DirectionalLight(0xbfe6ff, 0.9); rim.position.set(5, 1, -4); s.add(rim);
    this.group = new THREE.Group(); s.add(this.group);
    const geo = this.track(pillow());
    this.frontMat = this.track(new THREE.MeshPhysicalMaterial({ roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.28, alphaTest: 0.5, side: THREE.FrontSide }));
    this.backMat = this.track(new THREE.MeshPhysicalMaterial({ roughness: 0.5, metalness: 0, clearcoat: 0.3, alphaTest: 0.5, side: THREE.FrontSide }));
    this.front = new THREE.Mesh(geo, this.frontMat); this.back = new THREE.Mesh(geo, this.backMat); this.back.rotation.y = Math.PI;
    this.group.add(this.front, this.back);
    /* shadow disc under the packet */
    this.shadow = new THREE.Mesh(this.track(new THREE.PlaneGeometry(4.6, 1.5)), this.track(new THREE.MeshBasicMaterial({ map: this.track(shadowTex()), transparent: true, depthWrite: false })));
    this.shadow.rotation.x = -Math.PI / 2; this.shadow.position.y = -H / 2 - 0.55; s.add(this.shadow);
    /* drifting seeds */
    const n = mobile ? 16 : 30; this.seedN = n;
    this.seeds = new THREE.InstancedMesh(this.track(new THREE.SphereGeometry(1, 10, 8)), this.track(new THREE.MeshStandardMaterial({ color: 0xcdb27a, roughness: 0.55 })), n);
    this.sd = Array.from({ length: n }, () => ({ x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8, z: -0.9 - Math.random() * 3.2, v: 0.18 + Math.random() * 0.3, r: Math.random() * 6, s: 0.8 + Math.random() * 0.7 }));
    /* the seeds are drawn first and without depth, so the packet always covers them: they can never pierce it or show in front of it */
    this.seeds.renderOrder = -10; this.seeds.material.depthTest = false; this.seeds.material.depthWrite = false;
    s.add(this.seeds); this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._p = new THREE.Vector3(); this._sc = new THREE.Vector3();
    this._onResize = () => this.resize(); addEventListener('resize', this._onResize);
    this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(host);
    this.bind(); this.resize();
  }

  track(o) { this.disposables.push(o); return o; }

  bind() {
    const c = this.canvas; c.style.touchAction = 'pan-y'; c.style.cursor = 'grab';
    this._down = (e) => { this.drag = { x: e.clientX, ry: this.rot.ty }; c.setPointerCapture(e.pointerId); c.style.cursor = 'grabbing'; };
    this._move = (e) => {
      if (this.drag) { this.rot.ty = this.drag.ry + (e.clientX - this.drag.x) * 0.012; return; }
      if (e.pointerType === 'mouse') { const r = c.getBoundingClientRect(); this.hover = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }; }
    };
    this._up = () => { this.drag = null; c.style.cursor = 'grab'; };
    this._leave = () => { this.hover = null; };
    c.addEventListener('pointerdown', this._down); c.addEventListener('pointermove', this._move); c.addEventListener('pointerup', this._up); c.addEventListener('pointercancel', this._up); c.addEventListener('pointerleave', this._leave);
  }

  async setProduct(p, lang) {
    await fontsReady();
    const old = [this.frontMat.map, this.backMat.map];
    const fc = document.createElement('canvas'); drawPacket(fc, p, lang, 880, Math.round(880 * 760 / 560));
    const mk = (cv) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    this.frontMat.map = mk(fc); this.backMat.map = mk(backCanvas(p, lang));
    this.frontMat.needsUpdate = this.backMat.needsUpdate = true;
    old.forEach(t => t && t.dispose());
    this.seeds.material.color.set(CROPS[p.crop].season === 'winter' ? 0xd8bf7e : 0xcdb27a);
  }

  resize() {
    const w = this.host.clientWidth || 400, h = this.host.clientHeight || 500; this.w = w; this.h = h;
    this.renderer.setPixelRatio(this.dpr); this.renderer.setSize(w, h, false); this.camera.aspect = w / h;
    this.camera.position.z = 11.5 * Math.max(1, 0.78 / this.camera.aspect); // pull back in narrow frames so the packet always fits
    this.camera.updateProjectionMatrix();
  }

  frame(dt) {
    this.time += dt; const t = this.time, r = this.rot;
    if (!this.drag) { r.ty += (Math.sin(t * 0.55) * 0.42 + (this.hover ? this.hover.x * 0.8 : 0) - r.ty) * (1 - Math.exp(-dt * 2.2)); }
    r.tx = (this.hover ? this.hover.y * 0.4 : Math.sin(t * 0.7) * 0.05);
    r.y += (r.ty - r.y) * (1 - Math.exp(-dt * 7)); r.x += (r.tx - r.x) * (1 - Math.exp(-dt * 5));
    this.group.rotation.set(r.x, r.y, Math.sin(t * 0.8) * 0.025); this.group.position.y = Math.sin(t * 1.1) * 0.12;
    this.shadow.material.opacity = 0.8 - Math.sin(t * 1.1) * 0.12; this.shadow.scale.setScalar(1 - Math.sin(t * 1.1) * 0.04);
    for (let i = 0; i < this.seedN; i++) {
      const s = this.sd[i]; s.y -= s.v * dt; if (s.y < -4.4) { s.y = 4.4; s.x = (Math.random() - 0.5) * 8; }
      this._e.set(s.r + t * 0.6, s.r * 1.7 + t * 0.4, 0); this._q.setFromEuler(this._e); this._sc.set(0.07 * s.s, 0.12 * s.s, 0.045 * s.s);
      this._p.set(s.x + Math.sin(t * 0.5 + s.r) * 0.2, s.y, s.z); this._m.compose(this._p, this._q, this._sc); this.seeds.setMatrixAt(i, this._m);
    }
    this.seeds.instanceMatrix.needsUpdate = true;
  }

  start() {
    if (this.running) return; this.running = true; this._last = performance.now();
    const loop = (now) => {
      if (!this.running) return; this._raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this._last) / 1000); this._last = now;
      this.frame(dt); this.renderer.render(this.scene, this.camera);
      this._ft.push(dt); if (this._ft.length >= 50) { const a = this._ft.reduce((x, y) => x + y, 0) / this._ft.length; this._ft.length = 0; if (a > 0.024 && this.dpr > 1) { this.dpr = Math.max(1, this.dpr - 0.25); this.resize(); } }
    };
    this._raf = requestAnimationFrame(loop);
  }
  stop() { this.running = false; cancelAnimationFrame(this._raf); }

  dispose() {
    this.stop(); removeEventListener('resize', this._onResize); this._ro.disconnect();
    const c = this.canvas; c.removeEventListener('pointerdown', this._down); c.removeEventListener('pointermove', this._move); c.removeEventListener('pointerup', this._up); c.removeEventListener('pointercancel', this._up); c.removeEventListener('pointerleave', this._leave);
    [this.frontMat.map, this.backMat.map].forEach(t => t && t.dispose());
    this.disposables.forEach(o => { try { o.dispose && o.dispose(); } catch (e) { /* already disposed */ } });
    this.seeds.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss();
  }
}
