/* Shared building blocks: product card, product label for the quote list, month bars, request-button handler. */
import { V, t } from './core.js?v=10191757';
import { CROPS, cropName, catName, catById, tagLabel, prodById, windows, typeLabel, maturity } from './data.js?v=10191757';
import { Q, openQuote } from './quote.js?v=10191757';
import { cropState, today, canCover, coverWindow } from './season.js?v=10191757';

export const productLabel = (p, lang = V.lang) => `${p.name}${p.type === 'F1' ? ' F1' : ''} (${cropName(p.crop, lang)}, ${p.code})`;

/* "Sow now" / "Harvest season" ... for the current month and climate zone (see season.js) */
export function stateChip(cropId) { const st = cropState(cropId); return st ? `<span class="sn s-${st}">${t('s.' + st)}</span>` : ''; }

export function cardHTML(p) {
  const cat = catById(p.cat), crop = cropName(p.crop, V.lang), tags = p.tags.slice(0, 2).map(k => tagLabel(k, V.lang));
  return `<article class="pcard" style="--c:${cat.color}" data-id="${p.id}">
    <a class="pic tilt" href="product.html?id=${p.id}" aria-label="${p.name}"><img data-packet="${p.id}" alt="${p.name} — ${crop}" width="440" height="598" decoding="async"><span class="bdg">${p.type}</span></a>
    <div class="stt">${stateChip(p.crop)}</div>
    <div class="pm"><i class="dot"></i><span>${crop}</span><span class="sep">·</span><span>${maturity(p, V.lang)}</span></div>
    <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
    <p class="tg">${tags.join(' · ')}</p>
    <button class="btn amber req" type="button" data-req="${p.id}">${t('c.request')}</button>
  </article>`;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-req]'); if (!b) return;
  const p = prodById(b.dataset.req); if (!p) return;
  Q.add(productLabel(p)); openQuote();
});

/* ----- planting windows as month bars ----- */
const segs = (arr) => arr.flatMap(([a, b]) => (a <= b ? [[a, b]] : [[a, 12], [1, b]]));
export function monthLabels(lang = V.lang) { const f = new Intl.DateTimeFormat(lang, { month: 'short' }); return Array.from({ length: 12 }, (_, i) => f.format(new Date(2024, i, 1))); }
export function monthBars(cropId, zone) {
  const w = windows(cropId, zone), cur = today().month, hit = ([a, b]) => cur >= a && cur <= b;
  const cov = canCover(cropId) ? segs(coverWindow(zone)) : [];
  const bar = (cls, row) => ([a, b]) => `<i class="bar ${cls}${hit([a, b]) ? ' act' : ''}" style="grid-column:${a}/${b + 1};grid-row:${row}"></i>`;
  return `<div class="mb" aria-hidden="true">${segs(w.sow).map(bar('sow', 1)).join('')}${cov.map(bar('cov', 1)).join('')}${segs(w.harv).map(bar('harv', 2)).join('')}</div>`;
}
/* month names row with the current month highlighted */
export function monthHeader(lang = V.lang) { const cur = today().month - 1; return `<div class="cm-h">${monthLabels(lang).map((x, i) => `<span data-n="${i + 1}"${i === cur ? ' class="now"' : ''}>${x}</span>`).join('')}</div>`; }
export function windowText(cropId, zone, lang = V.lang) {
  const m = monthLabels(lang), w = windows(cropId, zone), f = (arr) => arr.map(([a, b]) => `${m[a - 1]}–${m[b - 1]}`).join(', ');
  return { sow: f(w.sow), harv: f(w.harv), cover: canCover(cropId) ? f(coverWindow(zone)) : '' };
}
