/* Home: the scroll story (3D hero with load/unload), group tiles, this month's featured varieties, calendar teaser. */
import { V, t } from './layout.js';
import { CATS, CROPS, PRODUCTS, ZONES, SOW_SEASONS, cropName, catName } from './data.js';
import { reveal, tilt, art, unart, counters, REDUCE, clamp } from './motion.js';
import { cardHTML, stateChip, monthBars, monthHeader, windowText } from './cards.js';
import { today, getZone, setZone, setPreviewMonth, seasonOf, monthName, summary, featured } from './season.js';

const $ = (s, r = document) => r.querySelector(s);
const journey = $('#journey'), stage = $('#stage');

/* ---------- featured rail: endless loop (three identical sets, the view is re-centred on the middle one), big arrows over the products ---------- */
const rail = $('#rail'), rprev = $('#rprev'), rnext = $('#rnext');
let setW = 0, idleT = 0;
const cards = () => rail.querySelectorAll('.pcard');
function measure() { const c = cards(), n = c.length / 3; setW = n ? c[n].offsetLeft - c[0].offsetLeft : 0; }
function recenter() { if (!setW) return; const sl = rail.scrollLeft; if (sl < setW * 0.5) rail.scrollLeft = sl + setW; else if (sl > setW * 1.5) rail.scrollLeft = sl - setW; }
function railStep() { const c = rail.querySelector('.pcard'), w = c ? c.offsetWidth + 24 : 286; return w * Math.max(1, Math.floor(rail.clientWidth / w) - 0); }
rprev.addEventListener('click', () => rail.scrollBy({ left: -railStep(), behavior: REDUCE ? 'auto' : 'smooth' }));
rnext.addEventListener('click', () => rail.scrollBy({ left: railStep(), behavior: REDUCE ? 'auto' : 'smooth' }));
rail.addEventListener('scroll', () => { clearTimeout(idleT); idleT = setTimeout(recenter, 110); }, { passive: true });
addEventListener('resize', () => { const k = setW ? (rail.scrollLeft - setW) / setW : 0; measure(); rail.scrollLeft = setW * (1 + k); });
rail.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); rnext.click(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); rprev.click(); } });

/* ---------- group tiles (language only) ---------- */
function buildTiles() {
  $('#catgrid').innerHTML = CATS.map(c => {
    const n = PRODUCTS.filter(p => p.cat === c.id).length;
    return `<a class="cat" href="catalog.html?cat=${c.id}" style="--c:${c.color}"><img data-emblem="${c.emblem}" data-size="360" alt="" width="180" height="180"><div class="cn">${catName(c.id, V.lang)}</div><div class="cc">${n} ${t('c.varieties')}</div></a>`;
  }).join('');
  reveal(); tilt(); art();
}

/* ---------- this month: counters, featured varieties and the calendar teaser all come from the season engine ---------- */
function buildSeason() {
  const d = today(), z = getZone(), sm = summary(z, d.month), season = seasonOf(d.month), zn = ZONES.find(x => x.id === z).n;
  const shown = [['sow', 'ss.n.sow'], ['cover', 'ss.n.cover'], ['harvest', 'ss.n.harv'], ['soon', 'ss.n.soon']].filter(([k]) => sm[k] > 0);
  const months = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${d.preview && d.month === i + 1 ? 'selected' : ''}>${monthName(i + 1, V.lang)}</option>`).join('');
  $('#sstrip').innerHTML = `
    <div class="sm"><span class="sk">${t('ss.k')}</span><b>${monthName(d.month, V.lang)}</b><span class="ssub">${t('se.' + season)} · ${zn[V.lang] || zn.en}${d.preview ? ` · <em>${t('ss.preview.note')}</em>` : ''}</span></div>
    <div class="scs">${shown.map(([k, l]) => `<div class="scn s-${k}"><b data-count="${sm[k]}">0</b><span>${t(l)}</span></div>`).join('')}</div>
    <div class="sctl"><div class="chips" role="group" aria-label="${t('cal.zone')}">${ZONES.map(zz => `<button class="chip" type="button" data-zone="${zz.id}" aria-pressed="${zz.id === z}">${zz.n[V.lang] || zz.n.en}</button>`).join('')}</div>
      <label class="mprev"><span>${t('ss.preview')}</span><select class="fsel" id="mprev"><option value="0">${t('ss.today')}</option>${months}</select></label></div>`;
  $('#snote').textContent = t('ss.note');
  counters($('#sstrip'));
  unart(rail);
  const html = featured(12, z, d.month).map(f => cardHTML(f.product));
  const dup = (h) => h.replace('<article class="pcard"', '<article class="pcard" aria-hidden="true"').replace(/<a /g, '<a tabindex="-1" ').replace(/<button /g, '<button tabindex="-1" ');
  rail.innerHTML = `<div class="railin">${html.map(dup).join('')}${html.join('')}${html.map(dup).join('')}</div>`;
  measure(); rail.scrollLeft = setW;
  const rows = [...new Set(featured(8, z, d.month).map(f => f.product.crop))].slice(0, 4);
  $('#calmini').innerHTML = monthHeader() + rows.map(id => {
    const w = windowText(id, z);
    return `<div class="cm-r"><div class="cm-n"><b>${cropName(id, V.lang)}</b><small>${t('cal.sow')} ${w.sow}</small>${stateChip(id)}</div>${monthBars(id, z)}</div>`;
  }).join('');
  reveal(); tilt(rail); art(rail);
}
$('#sstrip').addEventListener('click', (e) => { const b = e.target.closest('[data-zone]'); if (b) setZone(b.dataset.zone); });
$('#sstrip').addEventListener('change', (e) => { if (e.target.id === 'mprev') setPreviewMonth(+e.target.value || null); });

/* ---------- variety finder: three tap-filters, instant results ---------- */
const F = { cat: 'tomato', grow: '', season: '' };
const chip = (k, v, label, on) => `<button class="chip" type="button" data-f="${k}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
function finder() {
  $('#fd').innerHTML = `
    <div><h3>${t('cat.groups')}</h3><div class="chips">${chip('cat', '', t('fd.any'), F.cat === '')}${CATS.map(c => chip('cat', c.id, catName(c.id, V.lang), F.cat === c.id)).join('')}</div></div>
    <div><h3>${t('cat.grow')}</h3><div class="chips">${chip('grow', '', t('fd.any'), F.grow === '')}${['field', 'greenhouse'].map(g => chip('grow', g, t('gr.' + g), F.grow === g)).join('')}</div></div>
    <div><h3>${t('cat.season')}</h3><div class="chips">${chip('season', '', t('fd.any'), F.season === '')}${['spring', 'autumn', 'winter'].map(s => chip('season', s, t('se.' + s), F.season === s)).join('')}</div></div>`;
  const list = PRODUCTS.filter(p => (!F.cat || p.cat === F.cat) && (!F.grow || p.grow.includes(F.grow)) && (!F.season || SOW_SEASONS[CROPS[p.crop].season].includes(F.season)));
  const res = $('#fdres'); unart(res);
  res.innerHTML = list.slice(0, 4).map(cardHTML).join('') || `<p class="none">${t('cat.none')}</p>`;
  const u = new URLSearchParams(); for (const k of ['cat', 'grow', 'season']) if (F[k]) u.set(k, F[k]);
  const more = $('#fdmore'); more.href = `catalog.html${u.toString() ? '?' + u : ''}`; more.hidden = list.length <= 4;
  tilt(res); art(res);
}
$('#fd').addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (!b) return; F[b.dataset.f] = b.dataset.v; finder(); });

buildTiles(); buildSeason(); finder();
window.addEventListener('langchange', () => { buildTiles(); buildSeason(); finder(); });
/* the month (or zone) changed: the featured list, counters, badges, calendar teaser and the hero weather follow */
window.addEventListener('seasonchange', () => { buildSeason(); finder(); if (hero) hero.setSeason(seasonOf(today().month)); });

/* ---------- the story ---------- */
const chs = [...document.querySelectorAll('.ch')], dots = [...document.querySelectorAll('#dots i')], hint = $('#hint');
const CUT = [0, 0.26, 0.52, 0.78];
let hero = null, p = 0, vis = false;

function chapter(pp) { let i = 0; CUT.forEach((c, k) => { if (pp >= c) i = k; }); chs.forEach((c, k) => c.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); hint.classList.toggle('gone', pp > 0.04); }
function progress() { const r = journey.offsetHeight - stage.offsetHeight, y = scrollY - journey.offsetTop; p = clamp(y / Math.max(1, r)); chapter(p); if (hero) hero.setProgress(p); }
addEventListener('scroll', progress, { passive: true }); addEventListener('resize', progress); progress();

/* device tier: weak = 4 cores or fewer, or 2 GB RAM or less → no 3D hero at all (nothing from three.js is even downloaded): one still screen with the first headline, so the first scroll leaves the hero.
   lite = mid-range (up to 6 cores / 4 GB) → lighter scene. ?hero=on forces the scene, ?hero=off forces the skip. */
const deviceTier = (() => { const q = new URLSearchParams(location.search).get('hero'), c = navigator.hardwareConcurrency || 8, m = navigator.deviceMemory || 8; if (q === 'on') return 'full'; if (q === 'off') return 'weak'; return (c <= 4 || m <= 2) ? 'weak' : (c <= 6 || m <= 4) ? 'lite' : 'full'; })();
const webglOK = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };
const ok = !REDUCE && deviceTier !== 'weak' && webglOK();
if (!ok) document.documentElement.classList.add('no3d');
if (deviceTier === 'weak' && !REDUCE) document.documentElement.classList.add('weak3d');
let HeroClass = null, mounting = false;
async function mount() {
  if (hero || !ok || mounting) return; mounting = true;
  try { if (!HeroClass) HeroClass = (await import('./gl/hero.js')).Hero; } catch (e) { console.warn('hero', e); mounting = false; return; }
  mounting = false; if (hero || !vis) return;
  hero = new HeroClass($('#gl'), stage, { mobile: innerWidth < 760 || deviceTier === 'lite', season: seasonOf(today().month) }); hero.setProgress(p); hero.p = p; hero.start(); stage.classList.add('live'); }
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
