/* Catalogue: search (all four languages, accent-insensitive), group / crop / season / growing filters, sort, URL-synced state. */
import { V, t } from './layout.js?v=10192019';
import { CATS, CROPS, PRODUCTS, SOW_SEASONS, catName, cropName, norm, haystack } from './data.js?v=10192019';
import { reveal, tilt, art, unart } from './motion.js?v=10192019';
import { cardHTML } from './cards.js?v=10192019';
import { cropState } from './season.js?v=10192019';

const $ = (s) => document.querySelector(s);
const grid = $('#grid'), qIn = $('#q'), filters = $('#filters');
const HAY = new Map(PRODUCTS.map(p => [p.id, haystack(p)]));
const SEASONS = ['spring', 'autumn', 'winter'], GROWS = ['field', 'greenhouse'];

const S = { cat: '', crop: '', season: '', grow: '', sort: 'def', q: '', insn: '' };
const RANK = { sow: 0, cover: 1, harvest: 2, soon: 3, '': 4 }, ACTIVE = ['sow', 'cover', 'harvest'];
{
  const u = new URLSearchParams(location.search);
  for (const k of Object.keys(S)) if (u.get(k)) S[k] = u.get(k);
  if (!CATS.some(c => c.id === S.cat)) S.cat = '';
  if (S.crop && (!CROPS[S.crop] || (S.cat && CROPS[S.crop].cat !== S.cat))) S.crop = '';
}
qIn.value = S.q;

function syncURL() {
  const u = new URLSearchParams(), cur = new URLSearchParams(location.search); for (const k of ['lang', 'month']) if (cur.get(k)) u.set(k, cur.get(k));
  for (const k of Object.keys(S)) if (S[k] && !(k === 'sort' && S[k] === 'def')) u.set(k, S[k]);
  const s = u.toString(); history.replaceState(null, '', location.pathname + (s ? `?${s}` : ''));
}

function result() {
  const toks = norm(S.q).split(/\s+/).filter(Boolean);
  let list = PRODUCTS.filter(p => {
    if (S.cat && p.cat !== S.cat) return false;
    if (S.crop && p.crop !== S.crop) return false;
    if (S.season && !SOW_SEASONS[CROPS[p.crop].season].includes(S.season)) return false;
    if (S.grow && !p.grow.includes(S.grow)) return false;
    if (S.insn && !ACTIVE.includes(cropState(p.crop))) return false;
    const h = HAY.get(p.id); return toks.every(k => h.includes(k));
  });
  if (S.sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  else if (S.sort === 'early') list = [...list].sort((a, b) => a.days - b.days);
  else if (S.sort === 'season') list = list.map((p, i) => [p, i]).sort((a, b) => RANK[cropState(a[0].crop)] - RANK[cropState(b[0].crop)] || a[1] - b[1]).map(x => x[0]);
  return list;
}

function drawFilters() {
  $('#fgroups').innerHTML = `<button type="button" data-cat="" aria-pressed="${S.cat === ''}">${t('c.all')}<em>${PRODUCTS.length}</em></button>` +
    CATS.map(c => `<button type="button" data-cat="${c.id}" aria-pressed="${S.cat === c.id}"><i class="dot" style="--c:${c.color};background:${c.color}"></i>${catName(c.id, V.lang)}<em>${PRODUCTS.filter(p => p.cat === c.id).length}</em></button>`).join('');
  const wrap = $('#fcropwrap'); wrap.hidden = !S.cat;
  if (S.cat) $('#fcrops').innerHTML = CATS.find(c => c.id === S.cat).crops.map(id => `<button class="chip" type="button" data-crop="${id}" aria-pressed="${S.crop === id}">${cropName(id, V.lang)}</button>`).join('');
  $('#fseason').innerHTML = SEASONS.map(s => `<button class="chip" type="button" data-season="${s}" aria-pressed="${S.season === s}">${t('se.' + s)}</button>`).join('');
  $('#fgrow').innerHTML = GROWS.map(g => `<button class="chip" type="button" data-grow="${g}" aria-pressed="${S.grow === g}">${t('gr.' + g)}</button>`).join('');
  $('#fsort').value = S.sort;
  $('#finsn').setAttribute('aria-pressed', String(!!S.insn));
}

/* cards are added in chunks as the visitor scrolls (the catalogue is large); pictures load and unload around the viewport */
const CHUNK = 48, sent = $('#sent'); let list = [], shown = 0;
const sentIO = new IntersectionObserver((es) => { if (es.some(e => e.isIntersecting)) more(); }, { rootMargin: '1400px 0px' });
function more() {
  const next = list.slice(shown, shown + CHUNK); if (!next.length) return;
  grid.insertAdjacentHTML('beforeend', next.map(cardHTML).join(''));
  [...grid.querySelectorAll('.pcard')].slice(shown).forEach((c, i) => c.style.setProperty('--i', Math.min(i, 10)));
  shown += next.length; tilt(grid); art(grid);
  sentIO.unobserve(sent); if (shown < list.length) sentIO.observe(sent);
}
function drawGrid() {
  list = result(); shown = 0;
  unart(grid); sentIO.unobserve(sent);
  $('#count').textContent = `${list.length} ${t('cat.count')}`;
  $('#fclose').textContent = `${t('cat.show')} · ${list.length}`;
  grid.innerHTML = list.length ? '' : `<div class="none"><p>${t('cat.none')}</p><button class="btn amber" type="button" data-reset>${t('cat.reset')}</button></div>`;
  more(); syncURL();
}

/* after any filter change the page goes back up to the first product of the new list (the visitor may be far down the old list) */
function toTop() {
  const hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hh')) || 72;
  const y = Math.max(0, $('.cwrap').getBoundingClientRect().top + scrollY - hh - 16);
  if (scrollY > y + 4) scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function render() { drawFilters(); drawGrid(); }

filters.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'finsn') { S.insn = S.insn ? '' : '1'; render(); toTop(); return; }
  if (b.dataset.cat !== undefined) { S.cat = b.dataset.cat; S.crop = ''; }
  else if (b.dataset.crop) S.crop = S.crop === b.dataset.crop ? '' : b.dataset.crop;
  else if (b.dataset.season) S.season = S.season === b.dataset.season ? '' : b.dataset.season;
  else if (b.dataset.grow) S.grow = S.grow === b.dataset.grow ? '' : b.dataset.grow;
  else if (b.id === 'freset') reset();
  else return;
  render(); toTop();
});
$('#fsort').addEventListener('change', (e) => { S.sort = e.target.value; drawGrid(); toTop(); });
let timer; qIn.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { S.q = qIn.value; drawGrid(); }, 120); });
grid.addEventListener('click', (e) => { if (e.target.closest('[data-reset]')) { reset(); render(); toTop(); } });
function reset() { Object.assign(S, { cat: '', crop: '', season: '', grow: '', sort: 'def', q: '', insn: '' }); qIn.value = ''; }

/* mobile bottom sheet */
const sheet = (on) => { filters.classList.toggle('on', on); $('#fscrim').classList.toggle('on', on); document.documentElement.classList.toggle('noscroll', on); };
$('#fopen').addEventListener('click', () => sheet(true));
$('#fclose').addEventListener('click', () => { sheet(false); setTimeout(toTop, 60); });
$('#fscrim').addEventListener('click', () => sheet(false));

window.addEventListener('langchange', render);
window.addEventListener('seasonchange', drawGrid);
render(); reveal();
