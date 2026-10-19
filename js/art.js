/*
  Procedural artwork: crop emblems (unit-space vector drawings) and seed packets, drawn on canvas.
  No image files: packets are generated lazily, turned into blob URLs and released when far from the viewport.
*/
import { drawMark } from './brand.js?v=10192019';
import { CROPS, catById, cropName, catName, packLabel } from './data.js?v=10192019';

const TAU = Math.PI * 2;

/* ---------- colour + path helpers ---------- */
function hex(c) { if (c[0] === 'r') { const m = c.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]]; } const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; }
const lighter = (c, t) => mix(c, '#ffffff', t);
const darker = (c, t) => mix(c, '#000000', t);

function rg(g, x, y, r0, x1, y1, r1, stops) { const k = g.createRadialGradient(x, y, r0, x1, y1, r1); stops.forEach(([o, c]) => k.addColorStop(o, c)); return k; }
function lg(g, x0, y0, x1, y1, stops) { const k = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => k.addColorStop(o, c)); return k; }
function ell(g, cx, cy, rx, ry, fill, rot = 0) { g.beginPath(); g.ellipse(cx, cy, rx, ry, rot, 0, TAU); g.fillStyle = fill; g.fill(); }
function round3d(c) { return (g, cx, cy, rx, ry, rot = 0) => ell(g, cx, cy, rx, ry, rg(g, cx - rx * 0.35, cy - ry * 0.4, 0, cx, cy, Math.max(rx, ry) * 1.15, [[0, lighter(c, 0.4)], [0.5, c], [1, darker(c, 0.38)]]), rot); }

/* a leaf: from the base (0,0) towards +x, rotated by ang */
function leaf(g, x, y, len, wid, ang, fill, veins = true) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(len * 0.25, -wid, len * 0.7, -wid * 0.95, len, 0); g.bezierCurveTo(len * 0.7, wid * 0.95, len * 0.25, wid, 0, 0); g.closePath();
  g.fillStyle = typeof fill === 'string' ? fill : fill; g.fill();
  if (veins) {
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = Math.max(0.012, wid * 0.06); g.beginPath(); g.moveTo(len * 0.04, 0); g.lineTo(len * 0.92, 0); g.stroke();
    g.lineWidth = Math.max(0.008, wid * 0.035);
    for (let i = 1; i < 5; i++) { const px = len * (0.15 + i * 0.16); g.beginPath(); g.moveTo(px, 0); g.lineTo(px + len * 0.1, -wid * 0.55 * (1 - i * 0.12)); g.moveTo(px, 0); g.lineTo(px + len * 0.1, wid * 0.55 * (1 - i * 0.12)); g.stroke(); }
  }
  g.restore();
}
function leafFill(g, len, c) { return lg(g, 0, 0, len, 0, [[0, darker(c, 0.2)], [1, lighter(c, 0.18)]]); }

/* tapered capsule between two points */
function capsule(g, x0, y0, x1, y1, r0, r1, c, rot3d = true) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  g.save(); g.translate(x0, y0); g.rotate(a);
  g.beginPath(); g.moveTo(0, -r0); g.lineTo(L, -r1); g.arc(L, 0, r1, -Math.PI / 2, Math.PI / 2); g.lineTo(0, r0); g.arc(0, 0, r0, Math.PI / 2, Math.PI * 1.5); g.closePath();
  g.fillStyle = lg(g, 0, -r0, 0, r0, [[0, lighter(c, 0.38)], [0.45, c], [1, darker(c, 0.4)]]); g.fill();
  g.restore();
}

/* a smooth ribbon along a bezier spine with width profile w(t) */
function ribbon(g, p0, p1, p2, p3, w, fill) {
  const N = 28, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
    const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
    const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    const d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ww = w(t);
    L.push([x + nx * ww, y + ny * ww]); R.push([x - nx * ww, y - ny * ww]);
  }
  g.beginPath(); L.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); for (let i = N; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
  g.fillStyle = fill; g.fill();
}

function calyx(g, x, y, r, c, n = 5) {
  for (let i = 0; i < n; i++) leaf(g, x, y, r, r * 0.22, -Math.PI / 2 + (i - (n - 1) / 2) * 0.62 + (i % 2 ? 0.05 : -0.05), c, false);
  ell(g, x, y, r * 0.16, r * 0.12, darker(c, 0.25));
}
function petals(g, n, cx, cy, r0, len, wid, color, rot = 0) {
  for (let i = 0; i < n; i++) { const a = rot + i * TAU / n; g.save(); g.translate(cx, cy); g.rotate(a); ell(g, r0 + len / 2, 0, len / 2, wid, typeof color === 'function' ? color(i) : color); g.restore(); }
}
function shine(g, x, y, rx, ry, a = 0.35) { ell(g, x, y, rx, ry, `rgba(255,255,255,${a})`, -0.5); }

/* ---------- emblems (unit space, radius ~1 around 0,0) ---------- */
const EM = {
  tomato(g, c) {
    round3d(c.fruit)(g, 0, 0.12, 0.8, 0.68);
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 0.03; for (const k of [-0.32, 0.32]) { g.beginPath(); g.moveTo(k, -0.42); g.quadraticCurveTo(k * 1.25, 0.15, k * 0.7, 0.72); g.stroke(); }
    shine(g, -0.38, -0.12, 0.2, 0.1); calyx(g, 0, -0.5, 0.5, c.leaf);
    g.fillStyle = darker(c.leaf, 0.2); g.beginPath(); g.roundRect(-0.045, -0.96, 0.09, 0.42, 0.04); g.fill();
  },
  cherry(g, c) {
    g.strokeStyle = darker(c.leaf, 0.1); g.lineWidth = 0.05; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, -0.95); g.quadraticCurveTo(0.05, -0.55, -0.45, -0.1); g.moveTo(0.04, -0.62); g.quadraticCurveTo(0.2, -0.3, 0.42, 0.02); g.moveTo(0.02, -0.7); g.quadraticCurveTo(0.0, -0.3, 0.02, 0.2); g.stroke();
    for (const [x, y, r] of [[-0.45, 0.18, 0.4], [0.42, 0.26, 0.38], [0.02, 0.5, 0.42]]) { round3d(c.fruit)(g, x, y, r, r); shine(g, x - r * 0.35, y - r * 0.3, r * 0.22, r * 0.12); calyx(g, x, y - r * 0.82, r * 0.5, c.leaf); }
    leaf(g, 0.02, -0.7, 0.55, 0.16, -0.5, leafFill(g, 0.55, c.leaf));
  },
  plum(g, c) {
    g.save(); g.rotate(0.35); round3d(c.fruit)(g, 0, 0.12, 0.55, 0.88); shine(g, -0.22, -0.1, 0.12, 0.28); calyx(g, 0, -0.6, 0.45, c.leaf); g.restore();
  },
  sweetpepper(g, c) {
    g.beginPath(); g.moveTo(-0.62, -0.32); g.bezierCurveTo(-0.85, 0.3, -0.58, 0.9, -0.22, 0.88); g.bezierCurveTo(-0.05, 0.78, 0.05, 0.78, 0.22, 0.88); g.bezierCurveTo(0.58, 0.9, 0.85, 0.3, 0.62, -0.32); g.bezierCurveTo(0.34, -0.62, -0.34, -0.62, -0.62, -0.32); g.closePath();
    g.fillStyle = rg(g, -0.3, -0.2, 0, 0, 0.1, 1.1, [[0, lighter(c.fruit, 0.4)], [0.5, c.fruit], [1, darker(c.fruit, 0.4)]]); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 0.035; for (const k of [-0.28, 0.28]) { g.beginPath(); g.moveTo(k, -0.5); g.quadraticCurveTo(k * 1.6, 0.2, k * 0.9, 0.84); g.stroke(); }
    shine(g, -0.4, -0.05, 0.12, 0.3); ell(g, 0, -0.55, 0.3, 0.12, darker(c.leaf, 0.1)); g.fillStyle = c.leaf; g.beginPath(); g.moveTo(-0.07, -0.58); g.quadraticCurveTo(-0.08, -0.95, 0.2, -0.98); g.quadraticCurveTo(0.1, -0.75, 0.08, -0.58); g.fill();
  },
  chili(g, c) {
    ribbon(g, [0.5, -0.55], [1.0, -0.05], [0.45, 0.6], [-0.7, 0.9], t => 0.23 * (1 - t) ** 0.65 * (1 + 0.25 * Math.sin(t * 3)) + 0.012, lg(g, 0.5, -0.6, -0.6, 0.9, [[0, lighter(c.fruit, 0.3)], [0.5, c.fruit], [1, darker(c.fruit, 0.38)]]));
    ribbon(g, [0.78, -0.45], [0.86, -0.15], [0.62, 0.25], [0.35, 0.5], t => 0.04 * (1 - t), 'rgba(255,255,255,.35)');
    ell(g, 0.5, -0.56, 0.27, 0.14, darker(c.leaf, 0.1), 0.5);
    for (let i = 0; i < 5; i++) leaf(g, 0.5, -0.56, 0.3, 0.07, -Math.PI / 2 + 0.5 + (i - 2) * 0.42, c.leaf, false);
    g.fillStyle = darker(c.leaf, 0.15); g.beginPath(); g.moveTo(0.44, -0.6); g.quadraticCurveTo(0.34, -0.98, 0.64, -1.02); g.quadraticCurveTo(0.54, -0.8, 0.56, -0.6); g.fill();
  },
  eggplant(g, c) {
    g.save(); g.rotate(-0.3); capsule(g, 0, -0.55, 0.05, 0.55, 0.3, 0.5, c.fruit); shine(g, -0.22, 0.1, 0.1, 0.4);
    ell(g, 0, -0.62, 0.34, 0.14, darker(c.leaf, 0.1)); for (let i = -2; i <= 2; i++) leaf(g, 0, -0.62, 0.42, 0.1, Math.PI / 2 + i * 0.55, c.leaf, false);
    g.fillStyle = darker(c.leaf, 0.15); g.beginPath(); g.roundRect(-0.045, -1.02, 0.09, 0.42, 0.04); g.fill(); g.restore();
  },
  cucumber(g, c) {
    g.save(); g.rotate(-0.55); capsule(g, -0.92, 0, 0.92, 0, 0.3, 0.3, c.fruit);
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 0.03; for (const k of [-0.13, 0.05, 0.19]) { g.beginPath(); g.moveTo(-0.85, k); g.lineTo(0.85, k); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 16; i++) ell(g, -0.78 + i * 0.105, ((i * 37) % 9 - 4) * 0.055, 0.016, 0.016, 'rgba(255,255,255,.45)');
    ell(g, 0.93, 0, 0.05, 0.05, '#f2d64a'); g.restore();
  },
  zucchini(g, c) {
    g.save(); g.rotate(-0.5); capsule(g, -0.9, 0.04, 0.92, -0.04, 0.25, 0.3, c.fruit);
    g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 0.025; for (const k of [-0.1, 0.06, 0.18]) { g.beginPath(); g.moveTo(-0.7, k); g.lineTo(0.75, k); g.stroke(); }
    for (let i = 0; i < 26; i++) ell(g, -0.75 + (i % 13) * 0.12, ((i * 13) % 7 - 3) * 0.07, 0.014, 0.014, 'rgba(255,255,230,.55)');
    g.fillStyle = darker(c.fruit, 0.35); g.beginPath(); g.moveTo(-0.9, -0.12); g.lineTo(-1.05, -0.07); g.lineTo(-1.05, 0.12); g.lineTo(-0.9, 0.16); g.closePath(); g.fill(); g.restore();
  },
  pumpkin(g, c) {
    for (const k of [-0.5, 0.5]) ell(g, k, 0.12, 0.45, 0.68, darker(c.fruit, 0.2));
    ell(g, 0, 0.12, 0.5, 0.74, rg(g, -0.15, -0.15, 0, 0, 0.1, 0.9, [[0, lighter(c.fruit, 0.35)], [0.6, c.fruit], [1, darker(c.fruit, 0.35)]]));
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 0.03; for (const k of [-0.27, 0, 0.27]) { g.beginPath(); g.moveTo(k * 0.6, -0.55); g.quadraticCurveTo(k * 1.6, 0.12, k * 0.6, 0.78); g.stroke(); }
    g.fillStyle = '#6b8a3b'; g.beginPath(); g.moveTo(-0.07, -0.55); g.quadraticCurveTo(-0.1, -0.95, 0.12, -1.0); g.lineTo(0.18, -0.9); g.quadraticCurveTo(0.08, -0.8, 0.09, -0.55); g.fill();
  },
  melon(g, c) {
    ell(g, 0, 0.05, 0.85, 0.78, rg(g, -0.3, -0.3, 0, 0, 0, 1.1, [[0, lighter(c.fruit, 0.35)], [0.6, c.fruit], [1, darker(c.fruit, 0.32)]]));
    g.save(); g.beginPath(); g.ellipse(0, 0.05, 0.85, 0.78, 0, 0, TAU); g.clip(); g.strokeStyle = 'rgba(255,248,220,.5)'; g.lineWidth = 0.025;
    for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(i * 0.15 - 0.3, -0.9); g.lineTo(i * 0.15 + 0.3, 0.9); g.stroke(); g.beginPath(); g.moveTo(i * 0.15 + 0.3, -0.9); g.lineTo(i * 0.15 - 0.3, 0.9); g.stroke(); }
    g.strokeStyle = 'rgba(120,90,30,.25)'; g.lineWidth = 0.03; for (const k of [-0.4, 0, 0.4]) { g.beginPath(); g.moveTo(k, -0.8); g.quadraticCurveTo(k * 1.3, 0.05, k, 0.9); g.stroke(); } g.restore();
    shine(g, -0.4, -0.3, 0.16, 0.09); g.fillStyle = '#7d8f3b'; g.beginPath(); g.roundRect(-0.05, -0.98, 0.1, 0.25, 0.04); g.fill();
  },
  watermelon(g, c) {
    ell(g, -0.1, -0.1, 0.85, 0.7, rg(g, -0.4, -0.4, 0, -0.1, -0.1, 1.1, [[0, '#4cae6a'], [0.6, c.fruit], [1, darker(c.fruit, 0.4)]]));
    g.save(); g.beginPath(); g.ellipse(-0.1, -0.1, 0.85, 0.7, 0, 0, TAU); g.clip(); g.strokeStyle = 'rgba(20,70,35,.55)'; g.lineWidth = 0.07;
    for (const k of [-0.6, -0.3, 0, 0.3, 0.6]) { g.beginPath(); g.moveTo(-0.1 + k * 0.5, -0.85); g.quadraticCurveTo(-0.1 + k * 1.5, -0.1, -0.1 + k * 0.5, 0.7); g.stroke(); } g.restore();
    g.save(); g.translate(0.15, 0.35); g.rotate(-0.25);
    g.beginPath(); g.moveTo(-0.7, 0); g.arc(0, 0, 0.7, Math.PI, 0, true); g.closePath(); g.fillStyle = '#2f8a4a'; g.fill();
    g.beginPath(); g.moveTo(-0.62, 0); g.arc(0, 0, 0.62, Math.PI, 0, true); g.closePath(); g.fillStyle = '#f1f0d0'; g.fill();
    g.beginPath(); g.moveTo(-0.57, 0); g.arc(0, 0, 0.57, Math.PI, 0, true); g.closePath(); g.fillStyle = rg(g, 0, 0, 0.05, 0, 0, 0.6, [[0, '#ff6a6a'], [1, '#e63946']]); g.fill();
    for (const [x, y] of [[-0.3, -0.18], [0, -0.3], [0.3, -0.18], [-0.12, -0.12], [0.14, -0.1]]) ell(g, x, y, 0.035, 0.06, '#1b1b1b', 0.3); g.restore();
  },
  lettuce(g, c) {
    const rows = [[[darker(c.fruit, 0.26), 1.0, 0.62], 7], [[darker(c.fruit, 0.08), 0.82, 0.52], 6], [[lighter(c.fruit, 0.1), 0.62, 0.42], 5], [[lighter(c.fruit, 0.38), 0.42, 0.32], 3]];
    rows.forEach(([[col, len, wid], n], ri) => {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * (2.35 / Math.max(n - 1, 1)) * (1 - ri * 0.12);
        g.save(); g.translate((i - (n - 1) / 2) * 0.02, 0.82); g.rotate(a);
        g.beginPath(); g.moveTo(0, 0);
        for (let k = 0; k <= 12; k++) { const t = k / 12, x = len * 1.25 * t, y = -wid * Math.sin(Math.PI * t) ** 0.8 * (1 + 0.13 * Math.sin(t * 22 + i)); g.lineTo(x, y); }
        for (let k = 12; k >= 0; k--) { const t = k / 12, x = len * 1.25 * t, y = wid * Math.sin(Math.PI * t) ** 0.8 * (1 + 0.13 * Math.sin(t * 22 + i + 2)); g.lineTo(x, y); }
        g.closePath(); g.fillStyle = lg(g, 0, 0, len * 1.25, 0, [[0, lighter(col, 0.45)], [0.5, col], [1, darker(col, 0.12)]]); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.42)'; g.lineWidth = 0.022; g.beginPath(); g.moveTo(0.04, 0); g.lineTo(len * 1.1, 0); g.stroke(); g.restore();
      }
    });
  },
  spinach(g, c) {
    leaf(g, -0.65, 0.55, 1.45, 0.62, -0.62, leafFill(g, 1.45, c.leaf));
    leaf(g, -0.2, 0.7, 0.9, 0.34, -1.3, leafFill(g, 0.9, c.fruit)); leaf(g, -0.3, 0.7, 0.85, 0.3, 0.05, leafFill(g, 0.85, c.fruit));
  },
  rocket(g, c) {
    g.save(); g.translate(-0.1, 0.8); g.rotate(-1.15); const L = 1.7;
    for (let i = 0; i < 4; i++) { const px = 0.28 + i * 0.32, w = 0.34 - i * 0.04; ell(g, px, -w * 0.9, w * 0.75, w * 0.42, leafFill(g, L, c.leaf), -0.5); ell(g, px, w * 0.9, w * 0.75, w * 0.42, leafFill(g, L, c.leaf), 0.5); }
    leaf(g, 0, 0, L, 0.22, 0, leafFill(g, L, c.fruit)); g.restore();
  },
  parsley(g, c) {
    g.strokeStyle = darker(c.leaf, 0.1); g.lineWidth = 0.055; g.lineCap = 'round';
    for (const [x, a] of [[-0.35, -0.95], [0.0, -1.57], [0.35, -2.2]]) {
      const ex = x + Math.cos(a) * 1.15, ey = 1.0 + Math.sin(a) * 1.15; g.beginPath(); g.moveTo(0, 1.0); g.quadraticCurveTo(x * 0.5, 0.6, ex, ey); g.stroke();
      for (let k = 0; k < 9; k++) { const aa = k * TAU / 9; ell(g, ex + Math.cos(aa) * 0.27, ey + Math.sin(aa) * 0.27, 0.2, 0.14, mix(c.leaf, c.fruit, (k % 3) / 3.4), aa); }
      for (let k = 0; k < 5; k++) { const aa = k * TAU / 5 + 0.3; ell(g, ex + Math.cos(aa) * 0.1, ey + Math.sin(aa) * 0.1, 0.14, 0.1, lighter(c.fruit, 0.15 + (k % 2) * 0.1), aa); }
    }
  },
  carrot(g, c) {
    capsule(g, 0.05, 0.98, -0.12, -0.45, 0.02, 0.3, c.fruit); // narrow tip at the bottom
    g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 0.025; for (let i = 0; i < 7; i++) { const y = -0.3 + i * 0.18, w = 0.28 * (1 - (y + 0.4) / 1.45); g.beginPath(); g.moveTo(-0.12 - w * 0.9, y); g.lineTo(-0.12 + w * 0.9, y + 0.02); g.stroke(); }
    shine(g, -0.28, 0.1, 0.05, 0.3, 0.3);
    for (let i = -2; i <= 2; i++) { g.strokeStyle = c.leaf; g.lineWidth = 0.045; g.beginPath(); g.moveTo(-0.12, -0.42); g.quadraticCurveTo(-0.12 + i * 0.12, -0.8, -0.12 + i * 0.3, -0.98); g.stroke(); for (let k = 0; k < 4; k++) { const t = 0.35 + k * 0.17; leaf(g, -0.12 + i * 0.3 * t, -0.42 - 0.56 * t, 0.2, 0.06, -Math.PI / 2 + i * 0.4 + (k % 2 ? 0.8 : -0.8), c.leaf, false); } }
  },
  onion(g, c) {
    g.save(); g.translate(0, 0.2); ell(g, 0, 0, 0.78, 0.66, rg(g, -0.25, -0.2, 0, 0, 0, 1, [[0, lighter(c.fruit, 0.35)], [0.55, c.fruit], [1, darker(c.fruit, 0.4)]]));
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 0.03; for (const k of [-0.45, -0.2, 0.05, 0.3, 0.52]) { g.beginPath(); g.moveTo(k * 0.45, -0.62); g.quadraticCurveTo(k * 1.7, 0, k * 0.5, 0.64); g.stroke(); } g.restore();
    capsule(g, 0, -0.35, 0.02, -0.82, 0.18, 0.04, mix(c.fruit, '#f6e8c0', 0.35));
    g.strokeStyle = 'rgba(120,90,50,.7)'; g.lineWidth = 0.025; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 0.06, 0.86); g.lineTo(i * 0.1, 1.0); g.stroke(); }
    shine(g, -0.35, 0.0, 0.14, 0.08);
  },
  radish(g, c) {
    ell(g, 0, 0.18, 0.62, 0.58, rg(g, -0.2, -0.1, 0, 0, 0.2, 0.9, [[0, lighter(c.fruit, 0.35)], [0.6, c.fruit], [1, darker(c.fruit, 0.38)]]));
    g.beginPath(); g.moveTo(-0.14, 0.7); g.lineTo(0, 1.02); g.lineTo(0.14, 0.7); g.closePath(); g.fillStyle = '#f4efe6'; g.fill();
    for (const a of [-0.9, -0.3, 0.3, 0.9]) leaf(g, 0, -0.32, 0.8, 0.2, -Math.PI / 2 + a, leafFill(g, 0.8, c.leaf));
    shine(g, -0.3, 0.0, 0.12, 0.07);
  },
  wheat(g, c) {
    g.strokeStyle = darker(c.fruit, 0.2); g.lineWidth = 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 1); g.lineTo(0, -0.6); g.stroke();
    for (let i = 0; i < 9; i++) { const y = -0.6 + i * 0.16, s = 1 - i * 0.04; for (const k of [-1, 1]) { g.save(); g.translate(0, y); g.rotate(k * 0.45); ell(g, k * 0.0, -0.1 * s, 0.1 * s, 0.2 * s, rg(g, -0.03, -0.1, 0, 0, -0.1, 0.25, [[0, lighter(c.fruit, 0.35)], [1, darker(c.fruit, 0.3)]])); g.restore(); g.strokeStyle = c.fruit; g.lineWidth = 0.016; g.beginPath(); g.moveTo(k * 0.12, y - 0.1); g.lineTo(k * 0.34, y - 0.62); g.stroke(); } }
    ell(g, 0, -0.78, 0.09, 0.16, lighter(c.fruit, 0.2));
  },
  barley(g, c) {
    g.strokeStyle = darker(c.fruit, 0.2); g.lineWidth = 0.045; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 1); g.lineTo(0, -0.5); g.stroke();
    for (let i = 0; i < 8; i++) { const y = -0.5 + i * 0.15; for (const k of [-1, 1]) { ell(g, k * 0.08, y, 0.09, 0.15, lighter(c.fruit, 0.1), k * 0.3); g.strokeStyle = darker(c.fruit, 0.05); g.lineWidth = 0.014; g.beginPath(); g.moveTo(k * 0.1, y - 0.1); g.lineTo(k * (0.28 + i * 0.012), y - 0.82); g.stroke(); } }
  },
  corn(g, c) {
    for (const k of [-1, 1]) { g.save(); g.rotate(k * 0.2); leaf(g, 0, 0.95, 1.9, 0.38, -Math.PI / 2 - k * 0.38, leafFill(g, 1.9, c.leaf), false); g.restore(); }
    g.save(); g.rotate(0.12); ell(g, 0, 0.05, 0.4, 0.85, lg(g, -0.4, 0, 0.4, 0, [[0, darker(c.fruit, 0.2)], [0.5, lighter(c.fruit, 0.25)], [1, darker(c.fruit, 0.25)]]));
    g.beginPath(); g.ellipse(0, 0.05, 0.4, 0.85, 0, 0, TAU); g.clip(); for (let r = -8; r <= 8; r++) for (let q = -3; q <= 3; q++) { const x = q * 0.115 + (r % 2 ? 0.05 : 0), y = r * 0.105; ell(g, x, y, 0.047, 0.05, 'rgba(255,255,255,.28)'); ell(g, x + 0.012, y + 0.014, 0.036, 0.034, 'rgba(0,0,0,.12)'); } g.restore();
    for (const k of [-1, 1]) { g.save(); g.translate(k * 0.08, 0.96); g.rotate(k * 0.18); leaf(g, 0, 0, 1.3, 0.34, -Math.PI / 2 - k * 0.12, leafFill(g, 1.3, c.leaf), false); g.restore(); }
  },
  sunflower(g, c) {
    petals(g, 18, 0, 0, 0.3, 0.7, 0.13, i => (i % 2 ? c.fruit : lighter(c.fruit, 0.12)), 0.1);
    petals(g, 18, 0, 0, 0.24, 0.62, 0.11, i => darker(c.fruit, 0.1 + (i % 2) * 0.06), 0.28);
    ell(g, 0, 0, 0.42, 0.42, rg(g, -0.1, -0.1, 0, 0, 0, 0.45, [[0, '#8a5a2b'], [1, '#3a2412']]));
    for (let i = 0; i < 70; i++) { const a = i * 2.39996, r = 0.039 * Math.sqrt(i) * 1.45; ell(g, Math.cos(a) * r, Math.sin(a) * r, 0.016, 0.016, i % 3 ? '#b3814a' : '#2a1a0c'); }
  },
  cotton(g, c) {
    g.strokeStyle = '#6b7a35'; g.lineWidth = 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 1); g.lineTo(0, 0.4); g.stroke();
    for (let i = 0; i < 5; i++) { g.save(); g.translate(0, 0.25); g.rotate(-Math.PI / 2 + (i - 2) * 0.9); ell(g, 0.28, 0, 0.3, 0.09, '#6b4a2d'); g.restore(); }
    for (const [x, y, r] of [[-0.38, -0.12, 0.34], [0.38, -0.1, 0.34], [-0.2, -0.48, 0.36], [0.22, -0.46, 0.36], [0, -0.14, 0.4], [0, -0.7, 0.28]]) ell(g, x, y, r, r, rg(g, x - r * 0.3, y - r * 0.3, 0, x, y, r * 1.2, [[0, '#ffffff'], [0.7, '#f1eee4'], [1, '#cfcab8']]));
    leaf(g, 0, 0.75, 0.55, 0.2, -0.3, leafFill(g, 0.55, c.leaf)); leaf(g, 0, 0.8, 0.5, 0.18, Math.PI + 0.35, leafFill(g, 0.5, c.leaf));
  },
  bean(g, c) {
    const pod = (p0, p1, p2, p3, wmax, col) => {
      ribbon(g, p0, p1, p2, p3, t => wmax * Math.sin(Math.PI * (0.06 + t * 0.88)) ** 0.55 + 0.012, lg(g, p0[0], p0[1], p3[0], p3[1], [[0, lighter(col, 0.3)], [0.5, col], [1, darker(col, 0.3)]]));
      for (let i = 1; i <= 5; i++) { const t = i / 6, u = 1 - t; const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0]; const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]; ell(g, x - 0.02, y - 0.03, wmax * 0.55, wmax * 0.38, 'rgba(255,255,255,.2)', 0.4); }
    };
    pod([-0.85, -0.2], [-0.3, -0.95], [0.55, 0.0], [0.85, 0.75], 0.2, darker(c.fruit, 0.12));
    pod([-0.7, 0.35], [-0.2, -0.3], [0.45, 0.45], [0.9, 0.35], 0.19, c.fruit);
    leaf(g, -0.85, -0.2, 0.55, 0.2, 2.5, leafFill(g, 0.55, c.leaf));
  },
  chickpea(g, c) {
    for (const [x, y, r] of [[-0.45, 0.3, 0.38], [0.2, 0.42, 0.4], [0.62, -0.05, 0.36], [-0.1, -0.12, 0.42], [-0.62, -0.38, 0.3], [0.2, -0.62, 0.34], [-0.15, -0.78, 0.0]]) { if (!r) continue; ell(g, x, y, r, r * 0.98, rg(g, x - r * 0.3, y - r * 0.35, 0, x, y, r * 1.15, [[0, lighter(c.fruit, 0.45)], [0.6, c.fruit], [1, darker(c.fruit, 0.3)]])); g.fillStyle = darker(c.fruit, 0.15); g.beginPath(); g.moveTo(x + r * 0.45, y - r * 0.85); g.lineTo(x + r * 0.7, y - r * 1.05); g.lineTo(x + r * 0.6, y - r * 0.7); g.closePath(); g.fill(); }
  },
  lentil(g, c) {
    const pts = [[-0.6, 0.45], [-0.15, 0.65], [0.35, 0.55], [0.7, 0.2], [0.55, -0.35], [0.05, -0.62], [-0.45, -0.5], [-0.75, -0.05], [-0.1, 0.0], [0.3, 0.1]];
    pts.forEach(([x, y], i) => { const rx = 0.3, ry = 0.15; g.save(); g.translate(x, y); g.rotate(-0.5 + i * 0.7); ell(g, 0, 0, rx, ry, rg(g, -0.08, -0.05, 0, 0, 0, rx, [[0, lighter(c.fruit, 0.4)], [0.7, c.fruit], [1, darker(c.fruit, 0.35)]])); ell(g, -0.07, -0.04, 0.09, 0.04, 'rgba(255,255,255,.3)'); g.restore(); });
  },
  basil(g, c) {
    g.strokeStyle = darker(c.leaf, 0.2); g.lineWidth = 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 1); g.quadraticCurveTo(0.05, 0.2, 0, -0.1); g.stroke();
    leaf(g, 0.02, 0.35, 0.95, 0.42, -0.65, leafFill(g, 0.95, c.leaf)); leaf(g, 0.0, 0.5, 0.95, 0.42, Math.PI + 0.65, leafFill(g, 0.95, c.fruit)); leaf(g, 0.0, 0.0, 0.8, 0.36, -1.57, leafFill(g, 0.8, lighter(c.leaf, 0.12)));
  },
  coriander(g, c) {
    g.strokeStyle = darker(c.leaf, 0.15); g.lineWidth = 0.04; g.lineCap = 'round';
    for (const [x, a] of [[-0.5, -0.8], [0.05, -1.57], [0.55, -2.35]]) {
      const ex = x + Math.cos(a) * 0.85, ey = 0.95 + Math.sin(a) * 0.85; g.beginPath(); g.moveTo(0.0, 1); g.lineTo(ex, ey); g.stroke();
      for (let k = 0; k < 5; k++) { const aa = a + (k - 2) * 0.7; leaf(g, ex, ey, 0.34, 0.14, aa, leafFill(g, 0.34, mix(c.leaf, c.fruit, k / 6)), false); for (const s of [-0.38, 0.38]) leaf(g, ex + Math.cos(aa) * 0.17, ey + Math.sin(aa) * 0.17, 0.2, 0.08, aa + s, c.fruit, false); }
    }
  },
  marigold(g, c) {
    petals(g, 14, 0, 0, 0.35, 0.62, 0.16, i => (i % 2 ? c.fruit : lighter(c.fruit, 0.1)), 0.05);
    petals(g, 12, 0, 0, 0.22, 0.52, 0.15, i => darker(c.fruit, 0.08 + (i % 2) * 0.05), 0.3);
    petals(g, 10, 0, 0, 0.1, 0.42, 0.13, i => lighter(c.fruit, 0.2 - (i % 2) * 0.1), 0.15);
    ell(g, 0, 0, 0.14, 0.14, '#7a3f0d');
  },
  zinnia(g, c) {
    petals(g, 12, 0, 0, 0.3, 0.68, 0.19, i => (i % 2 ? c.fruit : lighter(c.fruit, 0.12)), 0.1);
    petals(g, 12, 0, 0, 0.2, 0.55, 0.17, i => darker(c.fruit, 0.1 + (i % 2) * 0.05), 0.35);
    ell(g, 0, 0, 0.3, 0.3, rg(g, -0.05, -0.05, 0, 0, 0, 0.32, [[0, '#e6c34a'], [1, '#8f6a14']]));
    for (let i = 0; i < 30; i++) { const a = i * 2.4, r = 0.045 * Math.sqrt(i) * 1.5; ell(g, Math.cos(a) * r, Math.sin(a) * r, 0.02, 0.02, i % 2 ? '#fff2b0' : '#a0771a'); }
  },
  /* ---------- archetypes shared by many crops (recoloured through c.fruit / c.leaf) ---------- */
  head(g, c) {
    for (const k of [-1, 1]) leaf(g, k * 0.2, 0.55, 1.05, 0.45, -Math.PI / 2 + k * 0.95, leafFill(g, 1.05, darker(c.leaf, 0.1)), false);
    ell(g, 0, 0.12, 0.86, 0.8, rg(g, -0.3, -0.3, 0, 0, 0.1, 1.2, [[0, lighter(c.fruit, 0.4)], [0.6, c.fruit], [1, darker(c.fruit, 0.4)]]));
    g.strokeStyle = 'rgba(255,255,255,.34)'; g.lineWidth = 0.03; for (const k of [-0.5, -0.2, 0.1, 0.4]) { g.beginPath(); g.moveTo(k * 0.4, -0.5); g.quadraticCurveTo(k * 1.5, 0.15, k * 0.5, 0.86); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 0.04; g.beginPath(); g.arc(-0.12, 0.3, 0.6, 3.5, 5.3); g.stroke(); g.beginPath(); g.arc(0.22, 0.26, 0.52, 4.2, 6.0); g.stroke();
    shine(g, -0.42, -0.2, 0.16, 0.09);
  },
  floret(g, c) {
    for (const k of [-1, 1]) leaf(g, k * 0.1, 0.8, 1.1, 0.4, -Math.PI / 2 + k * 0.85, leafFill(g, 1.1, c.leaf), false);
    capsule(g, 0, 0.95, 0, 0.35, 0.2, 0.26, lighter(c.leaf, 0.45));
    const pts = []; for (let i = 0; i < 70; i++) { const a = i * 2.39996, r = Math.sqrt(i / 70); const x = Math.cos(a) * r * 0.86, yy = -0.02 - Math.sqrt(Math.max(0, 1 - (x / 0.9) ** 2)) * 0.62 * (1 - r * 0.55) + Math.sin(a) * r * 0.2; pts.push([x, yy, 0.15 + (i % 3) * 0.02]); }
    pts.sort((p, q) => p[1] - q[1]).forEach(([x, yy, r]) => round3d(c.fruit)(g, x, yy + 0.35, r, r));
  },
  apple(g, c) {
    g.beginPath(); g.moveTo(0, -0.5); g.bezierCurveTo(0.25, -0.78, 0.95, -0.62, 0.9, 0.12); g.bezierCurveTo(0.88, 0.66, 0.45, 0.95, 0.1, 0.84); g.quadraticCurveTo(0, 0.8, -0.1, 0.84); g.bezierCurveTo(-0.45, 0.95, -0.88, 0.66, -0.9, 0.12); g.bezierCurveTo(-0.95, -0.62, -0.25, -0.78, 0, -0.5); g.closePath();
    g.fillStyle = rg(g, -0.3, -0.25, 0, 0, 0.1, 1.15, [[0, lighter(c.fruit, 0.42)], [0.55, c.fruit], [1, darker(c.fruit, 0.4)]]); g.fill();
    shine(g, -0.42, -0.12, 0.14, 0.22, 0.32);
    g.strokeStyle = '#6b4a2a'; g.lineWidth = 0.06; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -0.48); g.quadraticCurveTo(0.02, -0.75, 0.1, -0.95); g.stroke();
    leaf(g, 0.06, -0.78, 0.58, 0.19, -0.45, leafFill(g, 0.58, c.leaf));
  },
  citrus(g, c) {
    ell(g, 0, 0.1, 0.86, 0.8, rg(g, -0.3, -0.25, 0, 0, 0.1, 1.15, [[0, lighter(c.fruit, 0.4)], [0.6, c.fruit], [1, darker(c.fruit, 0.36)]]));
    for (let i = 0; i < 46; i++) { const a = i * 2.39996, r = Math.sqrt(i / 46) * 0.8; ell(g, Math.cos(a) * r, 0.1 + Math.sin(a) * r * 0.92, 0.014, 0.014, 'rgba(0,0,0,.14)'); }
    shine(g, -0.4, -0.15, 0.17, 0.1); ell(g, 0, -0.62, 0.1, 0.06, darker(c.fruit, 0.3));
    leaf(g, 0.05, -0.64, 0.62, 0.21, -0.55, leafFill(g, 0.62, c.leaf)); leaf(g, -0.02, -0.64, 0.5, 0.17, -2.5, leafFill(g, 0.5, darker(c.leaf, 0.1)));
  },
  pear(g, c) {
    g.beginPath(); g.moveTo(0, -0.72); g.bezierCurveTo(0.3, -0.72, 0.34, -0.36, 0.5, -0.05); g.bezierCurveTo(0.96, 0.38, 0.82, 0.96, 0, 0.96); g.bezierCurveTo(-0.82, 0.96, -0.96, 0.38, -0.5, -0.05); g.bezierCurveTo(-0.34, -0.36, -0.3, -0.72, 0, -0.72); g.closePath();
    g.fillStyle = rg(g, -0.3, 0.05, 0, 0, 0.2, 1.1, [[0, lighter(c.fruit, 0.42)], [0.55, c.fruit], [1, darker(c.fruit, 0.4)]]); g.fill();
    shine(g, -0.38, 0.3, 0.13, 0.26, 0.3);
    g.strokeStyle = '#6b4a2a'; g.lineWidth = 0.06; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -0.7); g.quadraticCurveTo(0.04, -0.9, 0.14, -1.0); g.stroke();
    leaf(g, 0.04, -0.82, 0.55, 0.18, -0.3, leafFill(g, 0.55, c.leaf));
  },
  pomegranate(g, c) {
    round3d(c.fruit)(g, 0, 0.12, 0.82, 0.78);
    g.fillStyle = darker(c.fruit, 0.28); g.beginPath(); g.moveTo(-0.3, -0.55); g.lineTo(-0.24, -0.86); g.lineTo(-0.1, -0.64); g.lineTo(0, -0.92); g.lineTo(0.1, -0.64); g.lineTo(0.24, -0.86); g.lineTo(0.3, -0.55); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 0.03; for (const k of [-0.35, 0, 0.35]) { g.beginPath(); g.moveTo(k * 0.5, -0.5); g.quadraticCurveTo(k * 1.7, 0.2, k * 0.6, 0.85); g.stroke(); }
    shine(g, -0.42, -0.05, 0.15, 0.09);
  },
  berry(g, c) {
    g.beginPath(); g.moveTo(0, 1.0); g.bezierCurveTo(-0.25, 0.86, -0.88, 0.36, -0.82, -0.1); g.bezierCurveTo(-0.8, -0.56, -0.3, -0.64, 0, -0.5); g.bezierCurveTo(0.3, -0.64, 0.8, -0.56, 0.82, -0.1); g.bezierCurveTo(0.88, 0.36, 0.25, 0.86, 0, 1.0); g.closePath();
    g.fillStyle = rg(g, -0.3, -0.2, 0, 0, 0.1, 1.2, [[0, lighter(c.fruit, 0.35)], [0.55, c.fruit], [1, darker(c.fruit, 0.4)]]); g.fill();
    for (let r = 0; r < 7; r++) for (let q = 0; q < 5 - Math.floor(r / 2); q++) { const w = (5 - Math.floor(r / 2) - 1) / 2, x = (q - w) * 0.28 + (r % 2 ? 0.07 : -0.07), y = -0.3 + r * 0.19; ell(g, x, y, 0.025, 0.04, 'rgba(255,236,150,.85)', 0.2); }
    shine(g, -0.4, -0.18, 0.12, 0.08); calyx(g, 0, -0.5, 0.62, c.leaf, 7);
  },
  grape(g, c) {
    g.strokeStyle = '#6b4a2a'; g.lineWidth = 0.06; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -0.95); g.lineTo(0, -0.5); g.stroke();
    for (let r = 0; r < 5; r++) { const n = 5 - r, y = -0.5 + r * 0.31; for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 0.36, rr = 0.2; round3d(c.fruit)(g, x, y, rr, rr); shine(g, x - 0.06, y - 0.07, 0.05, 0.03, 0.45); } }
    leaf(g, 0.02, -0.7, 0.7, 0.28, -0.5, leafFill(g, 0.7, c.leaf));
  },
  pod(g, c) {
    g.save(); g.rotate(-0.4);
    ribbon(g, [-0.95, 0.35], [-0.35, -0.4], [0.4, -0.4], [0.95, 0.25], t => 0.25 * Math.sin(Math.PI * (0.03 + t * 0.94)) ** 0.55 + 0.012, lg(g, 0, -0.5, 0, 0.4, [[0, lighter(c.fruit, 0.32)], [0.5, c.fruit], [1, darker(c.fruit, 0.38)]]));
    for (let i = 1; i <= 6; i++) { const t = i / 7, u = 1 - t, x = u * u * u * -0.95 + 3 * u * u * t * -0.35 + 3 * u * t * t * 0.4 + t * t * t * 0.95, y = u * u * u * 0.35 + 3 * u * u * t * -0.4 + 3 * u * t * t * -0.4 + t * t * t * 0.25; ell(g, x, y - 0.02, 0.1, 0.12, 'rgba(255,255,255,.2)'); }
    g.strokeStyle = darker(c.leaf, 0.1); g.lineWidth = 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(-0.95, 0.35); g.quadraticCurveTo(-1.05, 0.55, -0.9, 0.7); g.stroke(); g.restore();
    leaf(g, -0.8, 0.5, 0.55, 0.2, 2.3, leafFill(g, 0.55, c.leaf));
  },
  panicle(g, c) {
    g.strokeStyle = darker(c.leaf, 0.1); g.lineWidth = 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(-0.1, 1); g.quadraticCurveTo(0.05, 0.3, 0.0, -0.3); g.stroke();
    leaf(g, -0.1, 0.9, 1.1, 0.12, -Math.PI / 2 - 0.7, leafFill(g, 1.1, c.leaf), false);
    for (let k = 0; k < 9; k++) {
      const y0 = -0.3 - k * 0.07, dir = k % 2 ? 1 : -1, len = 0.62 - k * 0.04, ex = dir * len, ey = y0 + 0.5 - k * 0.02;
      g.strokeStyle = darker(c.fruit, 0.15); g.lineWidth = 0.02; g.beginPath(); g.moveTo(0, y0); g.quadraticCurveTo(dir * len * 0.7, y0 - 0.1, ex, ey); g.stroke();
      for (let i = 0; i < 5; i++) { const t = (i + 1) / 6, x = dir * len * (0.2 + 0.8 * t) * (0.5 + 0.5 * Math.sin(t * 1.6)), y = y0 + (ey - y0) * t * t - 0.08 * (1 - t); ell(g, x, y, 0.045, 0.085, rg(g, x - 0.01, y - 0.02, 0, x, y, 0.1, [[0, lighter(c.fruit, 0.4)], [1, darker(c.fruit, 0.25)]]), dir * 0.5); }
    }
  },
  beet(g, c) {
    for (const a of [-0.65, -0.25, 0.15, 0.55]) { g.strokeStyle = mix(c.fruit, '#6a1a3a', 0.4); g.lineWidth = 0.045; g.beginPath(); g.moveTo(0, -0.3); g.lineTo(Math.sin(a) * 0.5, -0.3 - Math.cos(a) * 0.5); g.stroke(); leaf(g, Math.sin(a) * 0.5, -0.3 - Math.cos(a) * 0.5, 0.62, 0.2, -Math.PI / 2 + a * 1.3, leafFill(g, 0.62, c.leaf)); }
    g.beginPath(); g.moveTo(-0.1, 0.72); g.quadraticCurveTo(0, 1.0, 0.12, 1.02); g.quadraticCurveTo(0.14, 0.9, 0.12, 0.74); g.closePath(); g.fillStyle = darker(c.fruit, 0.25); g.fill();
    round3d(c.fruit)(g, 0, 0.22, 0.66, 0.6); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 0.025; for (const k of [-0.32, -0.1, 0.12, 0.34]) { g.beginPath(); g.moveTo(-0.5, 0.22 + k * 0.7); g.quadraticCurveTo(0, 0.3 + k, 0.5, 0.22 + k * 0.7); g.stroke(); }
    shine(g, -0.28, 0.02, 0.11, 0.07);
  },
  potato(g, c) {
    g.save(); g.rotate(-0.3); g.beginPath(); g.moveTo(-0.85, 0.1); g.bezierCurveTo(-0.9, -0.5, -0.2, -0.65, 0.35, -0.55); g.bezierCurveTo(0.95, -0.45, 1.05, 0.2, 0.7, 0.55); g.bezierCurveTo(0.3, 0.9, -0.5, 0.8, -0.85, 0.1); g.closePath();
    g.fillStyle = rg(g, -0.3, -0.25, 0, 0.1, 0.1, 1.2, [[0, lighter(c.fruit, 0.38)], [0.6, c.fruit], [1, darker(c.fruit, 0.4)]]); g.fill();
    for (const [x, y] of [[-0.4, -0.1], [0.1, -0.28], [0.45, 0.1], [-0.1, 0.35], [0.5, -0.32], [-0.55, 0.38]]) { ell(g, x, y, 0.07, 0.04, 'rgba(60,35,15,.55)', 0.4); ell(g, x - 0.02, y - 0.03, 0.04, 0.02, 'rgba(255,255,255,.2)'); }
    for (let i = 0; i < 40; i++) ell(g, ((i * 37) % 17 - 8) * 0.095, ((i * 23) % 11 - 5) * 0.09, 0.012, 0.012, 'rgba(70,45,20,.3)');
    shine(g, -0.35, -0.3, 0.2, 0.08, 0.28); g.restore();
  },
  leek(g, c) {
    for (let i = -4; i <= 4; i++) { g.strokeStyle = 'rgba(120,90,50,.6)'; g.lineWidth = 0.02; g.beginPath(); g.moveTo(i * 0.04, 0.97); g.lineTo(i * 0.07, 1.08); g.stroke(); }
    capsule(g, 0, 0.95, 0, -0.15, 0.2, 0.16, c.fruit);
    g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 0.02; for (const k of [-0.08, 0.04, 0.12]) { g.beginPath(); g.moveTo(k, 0.9); g.lineTo(k * 0.8, -0.1); g.stroke(); }
    for (const a of [-0.62, -0.3, 0, 0.3, 0.62]) leaf(g, a * 0.08, -0.05, 1.0 - Math.abs(a) * 0.2, 0.13, -Math.PI / 2 + a, leafFill(g, 1.0, c.leaf), false);
  },
  sprig(g, c) {
    g.strokeStyle = darker(c.leaf, 0.2); g.lineWidth = 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 1); g.quadraticCurveTo(0.12, 0.2, 0.02, -0.85); g.stroke();
    for (let i = 0; i < 6; i++) { const y = 0.75 - i * 0.28, x = 0.05 * i, len = 0.62 - i * 0.05; for (const k of [-1, 1]) leaf(g, x * 0.4, y, len, 0.16, -Math.PI / 2 + k * (0.95 - i * 0.04), leafFill(g, len, mix(c.leaf, c.fruit, i / 7)), false); }
    leaf(g, 0.02, -0.82, 0.4, 0.12, -Math.PI / 2, leafFill(g, 0.4, c.fruit), false);
  },
  daisy(g, c) {
    petals(g, 18, 0, 0, 0.16, 0.8, 0.095, i => (i % 2 ? c.fruit : lighter(c.fruit, 0.16)), 0.1);
    petals(g, 16, 0, 0, 0.14, 0.62, 0.09, i => darker(c.fruit, 0.1 + (i % 2) * 0.05), 0.25);
    ell(g, 0, 0, 0.26, 0.26, rg(g, -0.05, -0.05, 0, 0, 0, 0.28, [[0, '#f6d44a'], [1, '#b5801a']]));
    for (let i = 0; i < 22; i++) { const a = i * 2.4, r = 0.04 * Math.sqrt(i) * 1.3; ell(g, Math.cos(a) * r, Math.sin(a) * r, 0.017, 0.017, i % 2 ? '#fff0a0' : '#9a6a10'); }
  },
  blossom4(g, c) {
    leaf(g, 0, 0.5, 0.6, 0.18, -2.3, leafFill(g, 0.6, '#4a9a37'), false); leaf(g, 0, 0.5, 0.6, 0.18, -0.85, leafFill(g, 0.6, '#4a9a37'), false);
    petals(g, 4, 0, 0, 0.08, 0.78, 0.34, i => (i % 2 ? c.fruit : lighter(c.fruit, 0.14)), Math.PI / 4);
    petals(g, 4, 0, 0, 0.06, 0.55, 0.22, () => darker(c.fruit, 0.1), 0);
    ell(g, 0, 0, 0.14, 0.14, '#7a8f2a'); for (let i = 0; i < 6; i++) ell(g, Math.cos(i) * 0.1, Math.sin(i) * 0.1, 0.03, 0.03, '#f6e870');
  },
  blossom5(g, c) {
    petals(g, 5, 0, 0, 0.06, 0.82, 0.38, i => lighter(c.fruit, 0.08 * (i % 2)), -Math.PI / 2);
    petals(g, 5, 0, 0, 0.05, 0.48, 0.2, () => darker(c.fruit, 0.14), -Math.PI / 2 + 0.3);
    ell(g, 0, 0, 0.17, 0.17, rg(g, 0, 0, 0, 0, 0, 0.18, [[0, '#fff6b0'], [1, '#e0b020']]));
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 0.02; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; g.beginPath(); g.moveTo(Math.cos(a) * 0.2, Math.sin(a) * 0.2); g.lineTo(Math.cos(a) * 0.7, Math.sin(a) * 0.7); g.stroke(); }
  },
  trumpet(g, c) {
    petals(g, 5, 0, 0, 0.05, 0.9, 0.46, () => c.fruit, -Math.PI / 2);
    ell(g, 0, 0, 0.5, 0.5, rg(g, 0, 0, 0.04, 0, 0, 0.55, [[0, '#fff3c0'], [0.2, lighter(c.fruit, 0.55)], [0.65, c.fruit], [1, darker(c.fruit, 0.2)]]));
    g.strokeStyle = darker(c.fruit, 0.28); g.lineWidth = 0.03; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; g.beginPath(); g.moveTo(Math.cos(a) * 0.12, Math.sin(a) * 0.12); g.lineTo(Math.cos(a) * 0.85, Math.sin(a) * 0.85); g.stroke(); }
    ell(g, 0, 0, 0.07, 0.07, '#f2e070');
  },
  spike(g, c) {
    g.strokeStyle = darker(c.leaf, 0.1); g.lineWidth = 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 1); g.lineTo(0.02, -0.7); g.stroke();
    leaf(g, 0, 1.0, 0.8, 0.17, -Math.PI / 2 - 0.85, leafFill(g, 0.8, c.leaf), false); leaf(g, 0, 0.9, 0.7, 0.15, -Math.PI / 2 + 0.85, leafFill(g, 0.7, c.leaf), false);
    for (let i = 0; i < 20; i++) { const t = i / 20, y = 0.55 - t * 1.4, r = 0.2 * (1 - t * 0.6); for (const k of [-1, 1]) round3d(i % 2 ? c.fruit : lighter(c.fruit, 0.12))(g, k * r * (0.9 + (i % 3) * 0.18), y + (k > 0 ? 0.04 : 0), r, r * 0.82, k * 0.4); }
    round3d(lighter(c.fruit, 0.1))(g, 0.02, -0.85, 0.09, 0.12);
  },
  grass(g, c) {
    for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i - 5) * 0.17, len = 1.15 + ((i * 7) % 5) * 0.1; leaf(g, (i - 5) * 0.06, 0.95, len, 0.075, a, leafFill(g, len, mix(c.leaf, c.fruit, (i % 4) / 5)), false); }
    g.strokeStyle = darker(c.leaf, 0.1); g.lineWidth = 0.025; for (const dx of [-0.25, 0.05, 0.3]) { g.beginPath(); g.moveTo(dx * 0.4, 0.9); g.lineTo(dx, -0.35); g.stroke(); for (let k = 0; k < 7; k++) { const y = -0.35 + k * 0.1; for (const s of [-1, 1]) ell(g, dx + s * 0.04, y, 0.03, 0.065, mix(c.fruit, '#c8d890', 0.3), s * 0.35); } }
  },
  clover(g, c) {
    g.strokeStyle = darker(c.leaf, 0.1); g.lineWidth = 0.045; g.lineCap = 'round'; g.beginPath(); g.moveTo(-0.2, 1); g.quadraticCurveTo(-0.15, 0.4, -0.1, 0.1); g.moveTo(0.2, 1); g.quadraticCurveTo(0.3, 0.2, 0.28, -0.35); g.stroke();
    for (const a of [-2.5, -0.65, -1.57]) { g.save(); g.translate(-0.1, 0.1); g.rotate(a); ell(g, 0.42, 0, 0.42, 0.3, leafFill(g, 0.84, c.leaf)); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 0.035; g.beginPath(); g.moveTo(0.22, -0.2); g.lineTo(0.44, 0); g.lineTo(0.22, 0.2); g.stroke(); g.restore(); }
    for (let i = 0; i < 26; i++) { const a = i * 2.4, r = Math.sqrt(i / 26) * 0.34; ell(g, 0.28 + Math.cos(a) * r * 0.85, -0.5 + Math.sin(a) * r * 1.15, 0.06, 0.09, i % 2 ? c.fruit : lighter(c.fruit, 0.2), a); }
  },
  nut(g, c) {
    leaf(g, 0, -0.35, 0.95, 0.28, -2.0, leafFill(g, 0.95, c.leaf)); leaf(g, 0.05, -0.35, 0.85, 0.25, -0.9, leafFill(g, 0.85, darker(c.leaf, 0.1)));
    for (const [x, y, r] of [[-0.36, 0.28, 0.5], [0.4, 0.38, 0.46]]) {
      round3d(c.fruit)(g, x, y, r * 0.86, r); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(x, y - r * 0.6); g.quadraticCurveTo(x + r * 0.2, y, x, y + r * 0.9); g.stroke();
      g.fillStyle = darker(c.leaf, 0.05); g.beginPath(); g.moveTo(x - r * 0.9, y - r * 0.38); for (let i = 0; i <= 8; i++) g.lineTo(x - r * 0.9 + i * r * 0.225, y - r * 0.38 + (i % 2 ? 0.07 : -0.03)); g.quadraticCurveTo(x + r * 0.5, y - r * 1.05, x, y - r * 1.02); g.quadraticCurveTo(x - r * 0.5, y - r * 1.05, x - r * 0.9, y - r * 0.38); g.fill();
      shine(g, x - r * 0.3, y + r * 0.05, r * 0.12, r * 0.28, 0.3);
    }
  },
  peanut(g, c) {
    g.save(); g.rotate(-0.55);
    for (const [x, y, rx, ry] of [[-0.43, 0, 0.5, 0.4], [0.43, 0, 0.5, 0.4], [0, 0, 0.45, 0.3]]) ell(g, x, y, rx, ry, rg(g, x - 0.1, y - 0.12, 0, x, y, 0.65, [[0, lighter(c.fruit, 0.42)], [0.6, c.fruit], [1, darker(c.fruit, 0.35)]]));
    g.save(); g.beginPath(); g.ellipse(-0.43, 0, 0.5, 0.4, 0, 0, TAU); g.ellipse(0.43, 0, 0.5, 0.4, 0, 0, TAU); g.clip(); g.strokeStyle = 'rgba(110,70,30,.28)'; g.lineWidth = 0.02;
    for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(i * 0.08 - 0.3, -0.5); g.lineTo(i * 0.08 + 0.3, 0.5); g.stroke(); g.beginPath(); g.moveTo(i * 0.08 + 0.3, -0.5); g.lineTo(i * 0.08 - 0.3, 0.5); g.stroke(); } g.restore();
    shine(g, -0.5, -0.17, 0.2, 0.06, 0.3); g.restore();
  },
  poppyhead(g, c) {
    g.strokeStyle = '#6f8a3a'; g.lineWidth = 0.06; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 1); g.quadraticCurveTo(0.1, 0.5, 0, 0.45); g.stroke();
    leaf(g, 0.02, 0.9, 0.7, 0.17, -Math.PI / 2 - 0.9, leafFill(g, 0.7, '#6f9a4a'), false);
    ell(g, 0, 0.02, 0.58, 0.72, rg(g, -0.2, -0.2, 0, 0, 0.1, 0.95, [[0, lighter(c.fruit, 0.38)], [0.6, c.fruit], [1, darker(c.fruit, 0.38)]]));
    ell(g, 0, -0.64, 0.5, 0.15, darker(c.fruit, 0.22)); ell(g, 0, -0.7, 0.3, 0.07, lighter(c.fruit, 0.1));
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 0.03; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.28; g.beginPath(); g.moveTo(Math.sin(a) * 0.4, -0.6); g.quadraticCurveTo(Math.sin(a) * 0.72, 0.05, Math.sin(a) * 0.3, 0.7); g.stroke(); }
    shine(g, -0.28, -0.1, 0.1, 0.28, 0.3);
  }
};

export function drawEmblem(g, cropId, cx, cy, s) {
  const c = CROPS[cropId]; g.save(); g.translate(cx, cy); g.scale(s, s); g.lineJoin = 'round'; EM[c.emblem](g, c); g.restore();
}

/* ---------- fonts ---------- */
let fontsP = null;
export function fontsReady() {
  if (!fontsP) fontsP = Promise.all([
    document.fonts.load('600 40px "Cormorant Garamond"'), document.fonts.load('italic 600 40px "Cormorant Garamond"'), document.fonts.load('700 20px "Manrope"'),
    document.fonts.load('600 20px "Markazi Text"'), document.fonts.load('600 20px "Tajawal"')
  ]).catch(() => { });
  return fontsP;
}

const font = (lang, kind, px) => {
  if (lang === 'ar') return kind === 'display' ? `600 ${px * 1.12}px "Markazi Text", serif` : `700 ${px}px "Tajawal", sans-serif`;
  return kind === 'display' ? `600 ${px}px "Cormorant Garamond", serif` : `700 ${px}px "Manrope", sans-serif`;
};

/* ---------- seed packet ---------- */
export function drawPacket(cv, p, lang, W = 560, H = 760) {
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d'), cat = catById(p.cat), col = cat.color, c = CROPS[p.crop], S = W / 560;
  g.save(); g.scale(S, S); const w = 560, h = 760;
  g.beginPath(); g.roundRect(0, 0, w, h, 26); g.clip();
  g.fillStyle = lg(g, 0, 0, 0, h, [[0, '#f8f3e6'], [1, '#ece2cb']]); g.fillRect(0, 0, w, h);
  /* header band */
  g.fillStyle = lg(g, 0, 0, w, 190, [[0, darker(col, 0.18)], [1, col]]); g.fillRect(0, 0, w, 178);
  g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 28; i++) g.fillRect(i * 20, 0, 10, 178);
  /* crimp edges */
  for (const [y0, dir] of [[0, 1], [h, -1]]) { g.fillStyle = 'rgba(16,38,27,.16)'; for (let i = 0; i < 70; i++) { g.beginPath(); g.moveTo(i * 8, y0); g.lineTo(i * 8 + 4, y0 + dir * 9); g.lineTo(i * 8 + 8, y0); g.closePath(); g.fill(); } }
  /* brand */
  drawMark(g, 70, 82, 30, '#f8f3e6', darker(col, 0.25));
  g.fillStyle = '#f8f3e6'; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.font = '700 26px "Manrope", sans-serif'; g.letterSpacing = '5px'; g.fillText('VERDARA', 116, 82); g.letterSpacing = '4px'; g.font = '600 13px "Manrope", sans-serif'; g.globalAlpha = 0.8; g.fillText('SEEDS', 118, 106); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.textAlign = 'right'; g.font = font(lang, 'ui', 17); g.globalAlpha = 0.95; g.fillText(catName(p.cat, lang), w - 40, 88); g.globalAlpha = 1;
  /* emblem stage */
  const ecx = w / 2, ecy = 372;
  g.fillStyle = rg(g, ecx, ecy, 10, ecx, ecy, 196, [[0, 'rgba(255,255,255,.95)'], [0.55, mix('#fffaf0', col, 0.16)], [1, mix('#f1e8d2', col, 0.28)]]);
  g.beginPath(); g.arc(ecx, ecy, 190, 0, TAU); g.fill();
  g.strokeStyle = mix(col, '#ffffff', 0.35); g.lineWidth = 2; g.setLineDash([1, 9]); g.lineCap = 'round'; g.beginPath(); g.arc(ecx, ecy, 205, 0, TAU); g.stroke(); g.setLineDash([]);
  g.shadowColor = 'rgba(30,20,10,.28)'; g.shadowBlur = 22; g.shadowOffsetY = 14; drawEmblem(g, p.crop, ecx, ecy + 4, 138); g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;
  /* name */
  g.textAlign = 'center'; g.fillStyle = '#10261b'; let px = 62; g.font = font('en', 'display', px); while (g.measureText(p.name).width > w - 90 && px > 30) { px -= 2; g.font = font('en', 'display', px); } g.fillText(p.name, w / 2, 620);
  g.fillStyle = col; g.font = font(lang, 'ui', 19); g.letterSpacing = lang === 'ar' ? '0px' : '4px'; g.fillText(lang === 'ar' ? cropName(p.crop, lang) : cropName(p.crop, lang).toUpperCase(), w / 2, 658); g.letterSpacing = '0px';
  /* footer */
  g.fillStyle = 'rgba(16,38,27,.78)'; g.textAlign = 'left'; g.font = '700 16px "Manrope", sans-serif'; g.fillText(p.code, 42, 714);
  g.textAlign = 'right'; g.fillText(packLabel(p.pack[0], lang === 'ar' ? 'en' : lang), w - 42, 714);
  g.fillStyle = col; g.beginPath(); g.roundRect(w / 2 - 34, 694, 68, 28, 14); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 15px "Manrope", sans-serif'; g.fillText(p.type, w / 2, 714);
  /* sheen */
  g.fillStyle = lg(g, 0, 0, w, h, [[0, 'rgba(255,255,255,.28)'], [0.28, 'rgba(255,255,255,0)'], [0.62, 'rgba(255,255,255,0)'], [0.78, 'rgba(255,255,255,.12)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(0, 0, w, h);
  g.restore();
  return cv;
}

/* blob-URL lifecycle: create lazily, release when far from the viewport */
const urls = new Map();
export async function packetURL(p, lang, W = 560) {
  const key = `${p.id}|${lang}|${W}`;
  if (urls.has(key)) return urls.get(key);
  await fontsReady();
  const cv = document.createElement('canvas'); drawPacket(cv, p, lang, W, Math.round(W * 760 / 560));
  const url = await new Promise(res => cv.toBlob(b => res(URL.createObjectURL(b)), 'image/webp', 0.9));
  cv.width = cv.height = 1; urls.set(key, url); return url;
}
export function releasePacket(p, lang, W = 560) {
  const key = `${p.id}|${lang}|${W}`; const u = urls.get(key); if (u) { URL.revokeObjectURL(u); urls.delete(key); }
}
export function releaseAllPackets() { for (const u of urls.values()) URL.revokeObjectURL(u); urls.clear(); }

/* a standalone emblem picture (category tiles, marquee) */
const eurls = new Map();
export async function emblemURL(cropId, size = 256) {
  const key = `${cropId}|${size}`; if (eurls.has(key)) return eurls.get(key);
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const g = cv.getContext('2d');
  g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = size * 0.06; g.shadowOffsetY = size * 0.04; drawEmblem(g, cropId, size / 2, size / 2 + size * 0.01, size * 0.4);
  const url = await new Promise(res => cv.toBlob(b => res(URL.createObjectURL(b)), 'image/webp', 0.92)); eurls.set(key, url); return url;
}
