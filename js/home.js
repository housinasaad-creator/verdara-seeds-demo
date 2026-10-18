/* Home: the scroll story (3D hero with load/unload), group tiles, this month's featured varieties, calendar teaser. */
import { V, t } from './layout.js';
import { CATS, CROPS, PRODUCTS, ZONES, SOW_SEASONS, cropName, catName } from './data.js';
import { Hero, webglOK } from './gl/hero.js';
import { reveal, tilt, art, unart, counters, REDUCE, clamp } from './motion.js';
import { cardHTML, stateChip, monthBars, monthHeader, windowText } from './cards.js';
import { today, getZone, setZone, setPreviewMonth, seasonOf, monthName, summary, featured } from './season.js';

const $ = (s, r = document) => r.querySelector(s);
const journey = $('#journey'), stage = $('#stage');

/* ---------- featured rail: arrows scroll it a few cards at a time ---------- */
const rail = $('#rail'), rprev = $('#rprev'), rnext = $('#rnext');
function railState() { rprev.disabled = rail.scrollLeft <= 2; rnext.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2; }
function railStep() { const c = rail.querySelector('.pcard'), w = c ? c.offsetWidth + 24 : 286; return w * Math.max(1, Math.floor(rail.clientWidth / w) - 0); }
rprev.addEventListener('click', () => rail.scrollBy({ left: -railStep(), behavior: REDUCE ? 'auto' : 'smooth' }));
rnext.addEventListener('click', () => rail.scrollBy({ left: railStep(), behavior: REDUCE ? 'auto' : 'smooth' }));
rail.addEventListener('scroll', railState, { passive: true }); addEventListener('resize', railState);
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
    <div class="scs">${shown.map(([k, l]) => `<div class="sc s-${k}"><b data-count="${sm[k]}">0</b><span>${t(l)}</span></div>`).join('')}</div>
    <div class="sctl"><div class="chips" role="group" aria-label="${t('cal.zone')}">${ZONES.map(zz => `<button class="chip" type="button" data-zone="${zz.id}" aria-pressed="${zz.id === z}">${zz.n[V.lang] || zz.n.en}</button>`).join('')}</div>
      <label class="mprev"><span>${t('ss.preview')}</span><select class="fsel" id="mprev"><option value="0">${t('ss.today')}</option>${months}</select></label></div>`;
  $('#snote').textContent = t('ss.note');
  counters($('#sstrip'));
  unart(rail);
  rail.innerHTML = `<div class="railin">${featured(12, z, d.month).map(f => cardHTML(f.product)).join('')}</div>`; rail.scrollLeft = 0; railState();
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
function progress() { const r = journey.offsetHeight - innerHeight, y = scrollY - journey.offsetTop; p = clamp(y / Math.max(1, r)); chapter(p); if (hero) hero.setProgress(p); }
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
dots.forEach((d, k) => d.addEventListener('click', () => { const r = journey.offsetHeight - innerHeight; scrollTo({ top: journey.offsetTop + r * (CUT[k] + 0.03), behavior: 'smooth' }); }));
window.__hero = () => hero;
