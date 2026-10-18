/* Sowing calendar: every crop as a row of animated month bars for the chosen zone; the current month, today's marker and the crops that are active now come from the season engine. */
import { V, t, Q, openQuote } from './layout.js?v=10182307';
import { CATS, CROPS, ZONES, catName, cropName, norm } from './data.js?v=10182307';
import { reveal } from './motion.js?v=10182307';
import { monthBars, monthHeader, windowText, stateChip } from './cards.js?v=10182307';
import { today, getZone, setZone, setPreviewMonth, cropState, monthName } from './season.js?v=10182307';

const $ = (s) => document.querySelector(s);
const rows = $('#crows'), tab = $('#ctab'), todayEl = $('#today');
let grp = '', q = '', onlyActive = false;
const HAY = Object.fromEntries(Object.keys(CROPS).map(id => [id, norm(Object.values(CROPS[id].n).join(' | ') + ' ' + id)]));
{ const g = new URLSearchParams(location.search).get('cat'); if (CATS.some(c => c.id === g)) grp = g; }
const RANK = { sow: 0, cover: 1, harvest: 2, soon: 3, '': 4 };

function groupRows(c, ids, zone) {
  return `<div class="crowgroup" style="--c:${c.color}"><h3><i></i>${catName(c.id, V.lang)}</h3>${ids.map((id, i) => {
    const w = windowText(id, zone);
    return `<div class="crow" data-rv style="--i:${Math.min(i, 8)}"><div><div class="cn2">${cropName(id, V.lang)} ${stateChip(id)}</div><small>${t('cal.sow')} ${w.sow}${w.cover ? ` · ${t('s.cover')} ${w.cover}` : ''} · ${t('cal.harv')} ${w.harv}</small></div>${monthBars(id, zone)}<button class="btn ghost" type="button" data-reqcrop="${id}">${t('cal.req')}</button></div>`;
  }).join('')}</div>`;
}

function render() {
  const zone = getZone(), d = today(), toks = norm(q).split(/\s+/).filter(Boolean);
  $('#zones').innerHTML = ZONES.map(z => `<button class="chip" type="button" data-zone="${z.id}" aria-pressed="${z.id === zone}">${z.n[V.lang] || z.n.en}</button>`).join('');
  $('#grp').innerHTML = `<option value="">${t('c.all')}</option>` + CATS.map(c => `<option value="${c.id}" ${c.id === grp ? 'selected' : ''}>${catName(c.id, V.lang)}</option>`).join('');
  $('#cmon').innerHTML = `<option value="0">${t('ss.today')} · ${monthName(d.month, V.lang)}</option>` + Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${d.preview && d.month === i + 1 ? 'selected' : ''}>${monthName(i + 1, V.lang)}</option>`).join('');
  $('#cact').setAttribute('aria-pressed', String(onlyActive));
  const groups = CATS.filter(c => !grp || c.id === grp).map(c => {
    const ids = c.crops.filter(id => toks.every(k => HAY[id].includes(k)) && (!onlyActive || ['sow', 'cover', 'harvest'].includes(cropState(id, zone, d.month))));
    return [c, ids.map((id, i) => [id, i]).sort((a, b) => RANK[cropState(a[0], zone, d.month)] - RANK[cropState(b[0], zone, d.month)] || a[1] - b[1]).map(x => x[0])];
  }).filter(([, ids]) => ids.length);
  rows.innerHTML = monthHeader() + (groups.length ? groups.map(([c, ids]) => groupRows(c, ids, zone)).join('') : `<p class="crownone">${t('cat.none')}</p>`);
  reveal(rows); placeToday();
}

/* today marker: measured from the first bar track so it lines up with the month grid */
function placeToday() {
  const track = rows.querySelector('.mb'); if (!track || innerWidth <= 640) { todayEl.hidden = true; return; }
  const d = today(), dim = new Date(d.year, d.month, 0).getDate(), f = ((d.month - 1) + (d.day - 0.5) / dim) / 12, a = track.getBoundingClientRect(), b = tab.getBoundingClientRect();
  todayEl.hidden = false;
  Object.assign(todayEl.style, { insetInlineStart: 'auto', insetInlineEnd: 'auto', left: `${Math.round(a.left + f * a.width - b.left)}px` });
}

document.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zone]');
  if (z) { setZone(z.dataset.zone); return; }
  if (e.target.closest('#cact')) { onlyActive = !onlyActive; render(); return; }
  const r = e.target.closest('[data-reqcrop]');
  if (r) { Q.add(cropName(r.dataset.reqcrop, V.lang)); openQuote(); }
});
$('#grp').addEventListener('change', (e) => { grp = e.target.value; render(); });
$('#cmon').addEventListener('change', (e) => setPreviewMonth(+e.target.value || null));
let qt; $('#cq').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => { q = e.target.value; render(); }, 140); });
addEventListener('resize', placeToday); addEventListener('load', placeToday);
window.addEventListener('langchange', render); window.addEventListener('seasonchange', render);
render();
