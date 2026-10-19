/*
  Mouse cursor: a small seed that leans as it moves and splits open to show a sprout whenever there is something to press.
  Only for mouse users (hover + fine pointer); touch screens keep their normal behaviour. One element, one transform per frame.
*/
import { FINE, REDUCE } from './motion.js?v=10191757';

if (FINE) {
  const SEL = 'a, button, [role=button], summary, label, select, .chip, .pic, .cat, .rbtn, .dots i, [data-req], [data-openquote], .p3d canvas, .qd-bg, .fg button';
  const HALF = 'M0 -15 C-9 -13 -12 -3 -10 6 C-8 13 -3 16 0 16 Z';
  const el = document.createElement('div');
  el.className = 'sc gone'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="sc-lean"><svg viewBox="-26 -26 52 52" width="52" height="52">
    <defs><linearGradient id="scg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".55" stop-color="#f2b84b"/><stop offset="1" stop-color="#b9791c"/></linearGradient></defs>
      <g class="sc-sprout"><path d="M0 4 C-8 2 -13 -5 -13 -14 C-6 -13 -1 -8 0 4Z" fill="#5fbf5a" stroke="#10261b" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 4 C8 2 13 -5 13 -14 C6 -13 1 -8 0 4Z" fill="#8fe07a" stroke="#10261b" stroke-width="1.2" stroke-linejoin="round"/></g>
      <g class="sc-half sc-l"><path d="${HALF}" fill="url(#scg)" stroke="#10261b" stroke-width="1.4" stroke-linejoin="round"/></g>
      <g class="sc-half sc-r"><path d="${HALF}" transform="scale(-1 1)" fill="url(#scg)" stroke="#10261b" stroke-width="1.4" stroke-linejoin="round"/></g>
</svg></div>`;
  document.body.appendChild(el);
  const rot = el.querySelector('.sc-lean');

  let x = -100, y = -100, lx = -100, lean = 0, raf = 0, shown = false;
  const frame = () => {
    raf = 0;
    const vx = x - lx; lx = x;
    if (!REDUCE) { lean += (Math.max(-26, Math.min(26, vx * 1.3)) - lean) * 0.22; rot.style.setProperty('--r', lean.toFixed(1) + 'deg'); }
    el.style.transform = `translate3d(${x}px,${y}px,0)`;
    if (Math.abs(lean) > 0.4 && !REDUCE) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; document.documentElement.classList.add('sc-on'); lx = x; el.classList.remove('gone'); }
    kick();
  }, { passive: true });

  const classify = (t) => {
    const txt = t && t.closest && t.closest('input, textarea, [contenteditable]');
    el.classList.toggle('txt', !!txt);
    el.classList.toggle('open', !txt && !!(t && t.closest && t.closest(SEL)));
  };
  document.addEventListener('pointerover', (e) => classify(e.target), { passive: true });
  document.addEventListener('pointerdown', () => el.classList.add('down'), { passive: true });
  addEventListener('pointerup', () => el.classList.remove('down'), { passive: true });
  document.documentElement.addEventListener('mouseleave', () => el.classList.add('gone'));
  document.documentElement.addEventListener('mouseenter', () => { if (shown) el.classList.remove('gone'); });
}
