/* ================= المشهد الثلاثي الأبعاد الحي لهيرو الصفحة الرئيسية (محفوظ ولا يُحذف) =================
   كان هذا الكود في آخر js/home.js: مشهد three.js حي (Hero من js/gl/hero.js) بأربع مراحل للتمرير (بذرة، جذور، ساق، حصاد).
   الهيرو الآن فيديو مُصوَّر منه (assets/hero/*.mp4) يُشغَّل بأربع تمريرات عبر js/hero-video.js.
   لإعادة المشهد الحي: ألصق هذا الكود في آخر js/home.js بدل قسم الفيديو، وأعد import { Hero, webglOK } from './gl/hero.js' في أول home.js،
   وأعد <canvas id="gl"> (محفوظ في <template id="scene3d-archive"> داخل index.html) إلى .stage. ولإعادة تصوير الفيديو: _hero_video_tools/sites/verdara.json
   (يستخدم window.__hero() من هذا الكود على الموقع القديم المنشور أو من النسخة الاحتياطية _backup_before_video_hero).
   يعتمد على متغيرات home.js: journey, stage, t, V, today, seasonOf, clamp, REDUCE, $.
*/
/* ---------- the story ---------- */
const chs = [...document.querySelectorAll('.ch')], dots = [...document.querySelectorAll('#dots i')], hint = $('#hint');
const CUT = [0, 0.26, 0.52, 0.78];
let hero = null, p = 0, vis = false;

function chapter(pp) { let i = 0; CUT.forEach((c, k) => { if (pp >= c) i = k; }); chs.forEach((c, k) => c.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); hint.classList.toggle('gone', pp > 0.04); }
function progress() { const r = journey.offsetHeight - stage.offsetHeight, y = scrollY - journey.offsetTop; p = clamp(y / Math.max(1, r)); chapter(p); if (hero) hero.setProgress(p); }
addEventListener('scroll', progress, { passive: true }); addEventListener('resize', progress); progress();

const ok = !REDUCE && webglOK();
if (!ok) document.documentElement.classList.add('no3d');
function mount() { if (hero || !ok) return; hero = new Hero($('#gl'), stage, { mobile: innerWidth < 760 || navigator.hardwareConcurrency <= 4, season: seasonOf(today().month) }); hero.setProgress(p); hero.p = p; hero.start(); stage.classList.add('live'); }
function unmount() { if (!hero) return; hero.dispose(); hero = null; stage.classList.remove('live'); const old = $('#gl'), n = old.cloneNode(false); old.replaceWith(n); }
/* mount shortly after load (idle), start/stop with visibility, release GPU memory when far away */
const onIO = new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis) { if (!hero) mount(); else hero.start(); } else if (hero) hero.stop(); }), { rootMargin: '200px 0px' });
const farIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) unmount(); }), { rootMargin: '1800px 0px' });
const idle = window.requestIdleCallback || ((f) => setTimeout(f, 250));
idle(() => { onIO.observe(journey); farIO.observe(journey); }, { timeout: 1200 });
document.addEventListener('visibilitychange', () => { if (!hero) return; if (document.hidden) hero.stop(); else if (vis) hero.start(); });
$('#skipj').addEventListener('click', () => scrollTo({ top: journey.offsetTop + journey.offsetHeight, behavior: 'smooth' }));
/* ---------- four stages instead of a continuous scrub ----------
   One wheel notch, swipe or key press moves exactly one stage (seed, roots, shoot, harvest). After the last stage the next scroll leaves the hero
   normally; before the first one nothing is caught. Skip and the dots still work. Without WebGL / with reduced motion the page scrolls natively. */
const STAGES = [0, 0.4, 0.66, 1];
let animating = false, touching = false, rafId = 0, settleT = 0;
const span = () => Math.max(1, journey.offsetHeight - stage.offsetHeight);
const stageY = (k) => journey.offsetTop + span() * STAGES[k];
const LAST = STAGES.length - 1;
const nearest = () => { let b = 0, d = Infinity; STAGES.forEach((_, k) => { const dd = Math.abs(scrollY - stageY(k)); if (dd < d) { d = dd; b = k; } }); return b; };
const stepOn = () => ok && !document.documentElement.classList.contains('noscroll');
const inJourney = () => scrollY <= stageY(LAST) + 2;
const canStep = (dir) => stepOn() && inJourney() && !(dir > 0 && scrollY >= stageY(LAST) - 2) && !(dir < 0 && scrollY <= journey.offsetTop + 2);
function animateTo(y, ms) {
  cancelAnimationFrame(rafId); const y0 = scrollY, t0 = performance.now(); animating = true;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tick = (now) => { const k = Math.min(1, (now - t0) / ms); scrollTo({ top: y0 + (y - y0) * ease(k), behavior: 'instant' }); if (k < 1) rafId = requestAnimationFrame(tick); else animating = false; };
  rafId = requestAnimationFrame(tick);
}
const go = (dir) => animateTo(stageY(clamp(nearest() + dir, 0, LAST)), 950);
dots.forEach((d, k) => d.addEventListener('click', () => animateTo(stageY(k), 1100)));

/* wheel (mouse notch or trackpad flick): one stage per gesture; the tail of a trackpad flick is ignored */
let lastW = 0;
function onWheel(e) {
  if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  const now = performance.now(), fresh = now - lastW > 110; lastW = now;
  const dir = e.deltaY > 0 ? 1 : -1;
  if (!canStep(dir)) return;
  e.preventDefault();
  if (!animating && fresh) go(dir);
}
let wheelOn = false;
function wheelWatch() { const near = scrollY <= stageY(LAST) + 1200; if (near && !wheelOn) { addEventListener('wheel', onWheel, { passive: false }); wheelOn = true; } else if (!near && wheelOn) { removeEventListener('wheel', onWheel); wheelOn = false; } }

/* touch: a swipe that starts on the hero moves one stage as soon as it is clearly vertical */
let ty0 = 0, tx0 = 0, tState = '';
journey.addEventListener('touchstart', (e) => { touching = true; if (e.touches.length !== 1) { tState = 'native'; return; } ty0 = e.touches[0].clientY; tx0 = e.touches[0].clientX; tState = stepOn() ? 'pending' : 'native'; }, { passive: true });
journey.addEventListener('touchmove', (e) => {
  if (tState === 'native' || e.touches.length !== 1) return;
  if (tState === 'pending') {
    const dy = e.touches[0].clientY - ty0, dx = e.touches[0].clientX - tx0;
    if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return;
    const dir = dy < 0 ? 1 : -1;
    if (Math.abs(dx) > Math.abs(dy) || !canStep(dir)) { tState = 'native'; return; }
    tState = 'done'; if (e.cancelable) e.preventDefault(); if (!animating) go(dir); return;
  }
  if (e.cancelable) e.preventDefault();
}, { passive: false });
const touchEnd = () => { touching = false; tState = ''; };
journey.addEventListener('touchend', touchEnd, { passive: true }); journey.addEventListener('touchcancel', touchEnd, { passive: true });

/* keyboard */
addEventListener('keydown', (e) => {
  if (!stepOn() || e.altKey || e.ctrlKey || e.metaKey) return;
  const tg = e.target || {}, tag = tg.tagName || '';
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || tg.isContentEditable || (e.key === ' ' && /^(BUTTON|A)$/.test(tag))) return;
  const fwd = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey), back = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
  if (!fwd && !back) return;
  const dir = fwd ? 1 : -1; if (!canStep(dir)) return;
  e.preventDefault(); if (!animating) go(dir);
});

/* if the page comes to rest between two stages (scroll bar drag, restored position), it settles on the nearest one */
addEventListener('scroll', () => {
  wheelWatch(); clearTimeout(settleT); if (animating) return;
  settleT = setTimeout(() => { if (animating || touching || !stepOn() || !inJourney()) return; const y = stageY(nearest()); if (Math.abs(scrollY - y) > 3) animateTo(y, 500); }, 200);
}, { passive: true });
wheelWatch();
window.__hero = () => hero;
