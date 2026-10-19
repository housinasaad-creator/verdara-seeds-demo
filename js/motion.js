/*
  Motion + memory helpers: scroll reveals, counters, pointer tilt, and a lazy artwork lifecycle
  (packets and emblems are drawn only when near the viewport and their blob URLs are released when far away).
*/
import { V } from './core.js?v=10192019';
import { prodById } from './data.js?v=10192019';
import { packetURL, releasePacket, releaseAllPackets, emblemURL } from './art.js?v=10192019';

export const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
export const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const PW = 440;

/* ---------- reveal on scroll ---------- */
const rvIO = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
export function reveal(root = document) {
  root.querySelectorAll('[data-rv-stagger]').forEach(p => { [...p.children].forEach((c, i) => { c.style.setProperty('--i', i); c.setAttribute('data-rv', ''); }); });
  root.querySelectorAll('[data-rv]:not(.in)').forEach(e => { if (REDUCE) e.classList.add('in'); else rvIO.observe(e); });
}

/* ---------- counters ---------- */
const cIO = new IntersectionObserver((es) => es.forEach(e => {
  if (!e.isIntersecting) return; cIO.unobserve(e.target);
  const el = e.target, to = +el.dataset.count, dur = 1100, t0 = performance.now();
  const step = (now) => { const k = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString(V.lang === 'ar' ? 'ar-EG' : V.lang); if (k < 1) requestAnimationFrame(step); };
  if (REDUCE) el.textContent = to.toLocaleString(); else requestAnimationFrame(step);
}), { threshold: 0.5 });
export function counters(root = document) { root.querySelectorAll('[data-count]').forEach(e => cIO.observe(e)); }

/* ---------- pointer tilt ---------- */
export function tilt(root = document) {
  if (!FINE || REDUCE) return;
  root.querySelectorAll('.tilt:not([data-tl])').forEach(el => {
    el.dataset.tl = '1';
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg'); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

/* ---------- lazy artwork ---------- */
async function loadArt(el) {
  if (el.dataset.state === 'on' || el.dataset.state === 'loading') return; el.dataset.state = 'loading';
  let url;
  if (el.dataset.packet) { const p = prodById(el.dataset.packet); if (!p) return; url = await packetURL(p, V.lang, PW); }
  else if (el.dataset.emblem) url = await emblemURL(el.dataset.emblem, +el.dataset.size || 256);
  if (el.dataset.state !== 'loading') return; el.src = url; el.dataset.state = 'on'; el.classList.add('ok');
}
function dropArt(el) {
  if (el.dataset.state !== 'on' || !el.dataset.packet) return;
  const p = prodById(el.dataset.packet); if (p) releasePacket(p, V.lang, PW);
  el.removeAttribute('src'); el.dataset.state = ''; el.classList.remove('ok');
}
const loadIO = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) loadArt(e.target); }), { rootMargin: '700px 0px' });
const dropIO = new IntersectionObserver((es) => es.forEach(e => { if (!e.isIntersecting) dropArt(e.target); }), { rootMargin: '2600px 0px' });
export function art(root = document) {
  root.querySelectorAll('[data-packet],[data-emblem]').forEach(el => { if (el.dataset.obs) return; el.dataset.obs = '1'; loadIO.observe(el); if (el.dataset.packet) dropIO.observe(el); });
}
/* call before replacing a container's HTML: stop observing its pictures and release their blob URLs */
export function unart(root) {
  root.querySelectorAll('[data-packet],[data-emblem]').forEach(el => { loadIO.unobserve(el); dropIO.unobserve(el); dropArt(el); el.dataset.state = ''; });
}
export function refreshArt() {
  releaseAllPackets();
  document.querySelectorAll('[data-packet]').forEach(el => { el.removeAttribute('src'); el.dataset.state = ''; el.classList.remove('ok'); loadIO.unobserve(el); loadIO.observe(el); });
}
window.addEventListener('langchange', refreshArt);

/* run a callback while an element is on screen (used for 3D scenes) */
export function whileVisible(el, on, off, margin = '120px') {
  const io = new IntersectionObserver((es) => es.forEach(e => (e.isIntersecting ? on() : off())), { rootMargin: margin });
  io.observe(el); return io;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
