/* Home: the scroll story (3D hero with load/unload), group tiles, this month's featured varieties, calendar teaser. */
import { V, t } from './layout.js';
import { CATS, CROPS, PRODUCTS, ZONES, SOW_SEASONS, cropName, catName } from './data.js';
import { initHeroVideo } from './hero-video.js';   // (the live 3D hero import `{ Hero, webglOK } from './gl/hero.js'` is archived, see js/archive/home-story-3d.js)
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

/* ---------- the story: the hero is a pre-rendered video played in four scroll steps (js/hero-video.js) ----------
   The live 3D scene (three.js) is NOT used any more but is kept: js/archive/home-story-3d.js + js/gl/hero.js (see the note there). */
const chs = [...document.querySelectorAll('.ch')], dots = [...document.querySelectorAll('#dots i')], hint = $('#hint');
const STG = 5, CH_OF = [0, 1, 2, 3, 3];                  // five stops (start + four scrolls) over four text chapters
let hero = null, p = 0;                                  // hero stays null: no live scene
function chapter(pp) { const k = clamp(Math.round(pp * (STG - 1)), 0, STG - 1), i = CH_OF[k]; chs.forEach((c, j) => c.classList.toggle('on', j === i)); dots.forEach((d, j) => d.classList.toggle('on', j === i)); hint.classList.toggle('gone', pp > 0.04); }
function progress() { if (journey.classList.contains('one')) { chapter(0); return; } const r = journey.offsetHeight - stage.offsetHeight, y = scrollY - journey.offsetTop; p = clamp(y / Math.max(1, r)); chapter(p); }
addEventListener('scroll', progress, { passive: true }); addEventListener('resize', progress); progress();

if (REDUCE) document.documentElement.classList.add('no3d');
const hv = initHeroVideo({
  hero: journey, stick: stage, video: $('#hv'), hdr: () => 0, reduced: REDUCE, saveData: !!(navigator.connection && navigator.connection.saveData),
  stops: [0, 3.2, 6.2, 9.4, 13.0], clips: 'assets/hero/', mobileQuery: '(max-width: 760px)',
  onFail: () => document.documentElement.classList.add('no3d')
});
dots.forEach((d, k) => d.addEventListener('click', () => hv.jump(k)));
/* the video loads once and stays (it only pauses off-screen); low-memory devices release it when far away */
{
  const lowMem = (navigator.deviceMemory || 8) <= 2, idle = window.requestIdleCallback || ((f) => setTimeout(f, 250));
  idle(() => {
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) hv.pause(); }, { rootMargin: '200px 0px' }).observe(journey);
    new IntersectionObserver(([e]) => { if (e.isIntersecting) hv.load(); else hv.unload(); }, { rootMargin: '250% 0px 250% 0px' }).observe(journey);
  }, { timeout: 1200 });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hv.pause(); });
}
$('#skipj').addEventListener('click', () => scrollTo({ top: journey.offsetTop + journey.offsetHeight, behavior: 'smooth' }));
