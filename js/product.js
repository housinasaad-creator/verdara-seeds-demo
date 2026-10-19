/* Product page: light 3D packet, facts, sowing guide for the chosen climate zone, related varieties. */
import { V, t, tl, waLink } from './layout.js?v=10191741';
import { PRODUCTS, CROPS, ZONES, prodById, catById, catName, cropName, tagLabel, typeLabel, growLabel, packLabel, describe, maturity } from './data.js?v=10191741';
import { reveal, tilt, art, unart, REDUCE } from './motion.js?v=10191741';
import { cardHTML, productLabel, monthBars, monthHeader, windowText, stateChip } from './cards.js?v=10191741';
import { getZone, setZone } from './season.js?v=10191741';
import { buildMessage } from './quote.js?v=10191741';

const id = new URLSearchParams(location.search).get('id');
const known = prodById(id), p = known || PRODUCTS[0];
if (!known) location.replace('catalog.html');
const host = document.getElementById('pbody');

const ICON = {
  depth: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h36M24 14V6M19 10l5-5 5 5M10 22c6 3 10 3 14 0s8-3 14 0M10 32c6 3 10 3 14 0s8-3 14 0"/><circle cx="24" cy="38" r="3"/></svg>',
  space: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="24" r="4"/><circle cx="39" cy="24" r="4"/><path d="M15 24h18M18 20l-3 4 3 4M30 20l3 4-3 4"/></svg>',
  temp: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 28V10a4 4 0 018 0v18a8 8 0 11-8 0z"/><path d="M24 20v14"/></svg>',
  germ: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 42V24M24 26c0-8-6-13-14-13 0 8 6 13 14 13zM24 30c0-7 5-11 13-11 0 7-5 11-13 11z"/></svg>'
};
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

function related() {
  const same = PRODUCTS.filter(x => x.id !== p.id && x.crop === p.crop), rest = PRODUCTS.filter(x => x.id !== p.id && x.cat === p.cat && x.crop !== p.crop);
  return [...same, ...rest].slice(0, 5);
}

function render() {
  const cat = catById(p.cat), c = CROPS[p.crop], lang = V.lang;
  document.title = `${p.name} | VERDARA`;
  const md = document.querySelector('meta[name=description]'); if (md) md.content = `${p.name} (${cropName(p.crop, lang)}): ${describe(p, lang)}`;
  const zone = getZone(), win = windowText(p.crop, zone, lang);
  host.innerHTML = `
  <div class="wrap">
    <a class="back" href="catalog.html?cat=${p.cat}">${ARROW}<span>${t('p.back')}</span></a>
    <div class="pwrap" style="--c:${cat.color}">
      <div class="p3d" id="p3d"><img id="pimg" data-packet="${p.id}" alt="${p.name} — ${cropName(p.crop, lang)}"><canvas id="pgl" aria-hidden="true"></canvas><div class="hint3d">${t('p.drag')}</div></div>
      <div class="pinfo">
        <div class="pstate">${stateChip(p.crop)}</div>
        <span class="cat-pill"><i></i>${[...new Set([catName(p.cat, lang), cropName(p.crop, lang)])].join(' · ')}</span>
        <h1>${p.name}</h1>
        <p class="sub">${typeLabel(p.type, lang)} · ${maturity(p, lang)}</p>
        <p class="desc">${describe(p, lang)}</p>
        <div class="tagrow">${p.tags.map(k => `<span>${tagLabel(k, lang)}</span>`).join('')}</div>
        <dl class="specs">
          <div><dt>${t('p.type')}</dt><dd>${p.type}</dd></div>
          <div><dt>${t('p.days')}</dt><dd>${maturity(p, lang)}</dd></div>
          <div><dt>${t('p.grow')}</dt><dd>${p.grow.map(g => growLabel(g, lang)).join(' · ')}</dd></div>
          <div><dt>${t('p.code')}</dt><dd dir="ltr">${p.code}</dd></div>
        </dl>
        <h4>${t('p.pack')}</h4>
        <div class="packs">${p.pack.map(k => `<span>${packLabel(k, lang)}</span>`).join('')}</div>
        <div class="pbtns">
          <button class="btn amber big" type="button" data-req="${p.id}">${t('c.request')}</button>
          <a class="btn ghost big" href="${waLink(buildMessage({ prod: productLabel(p) }, lang))}" target="_blank" rel="noopener">${t('p.ask')}</a>
        </div>
        <p class="pnote">${t('p.price')} · ${t('p.note')}</p>
      </div>
    </div>
  </div>
  <section class="guide"><div class="wrap">
    <h2 data-rv>${t('p.guide')}</h2>
    <div class="gcards" data-rv-stagger>
      <div class="gcard">${ICON.depth}<small>${t('p.depth')}</small><b>${c.depth} <span>${t('p.cm')}</span></b></div>
      <div class="gcard">${ICON.space}<small>${t('p.space')}</small><b>${c.space} <span>${t('p.cm')}</span></b></div>
      <div class="gcard">${ICON.temp}<small>${t('p.temp')}</small><b>${c.temp} <span>°C</span></b></div>
      <div class="gcard">${ICON.germ}<small>${t('p.germ')}</small><b>${c.germ} <span>${t('p.d')}</span></b></div>
    </div>
    <div class="zbar" role="group" aria-label="${t('p.zone')}">${ZONES.map(z => `<button class="chip" type="button" data-zone="${z.id}" aria-pressed="${z.id === zone}">${z.n[lang] || z.n.en}</button>`).join('')}</div>
    <div class="pcal" data-rv>
      ${monthHeader(lang)}
      <div class="cm-r" style="grid-template-columns:1fr">${monthBars(p.crop, zone)}</div>
      <div class="legend"><span><i class="s"></i>${t('cal.sow')}: ${win.sow}</span>${win.cover ? `<span><i class="c"></i>${t('s.cover')}: ${win.cover}</span>` : ''}<span><i class="h"></i>${t('cal.harv')}: ${win.harv}</span></div>
    </div>
  </div></section>
  <section class="related"><div class="wrap">
    <h2 data-rv>${t('p.related')}</h2>
    <div class="grid" style="margin-top:30px">${related().map(cardHTML).join('')}</div>
  </div></section>`;
  reveal(host); tilt(host); art(host);
  /* the bars animate in once the section is visible */
  host.querySelectorAll('.pcal').forEach(e => e.classList.add('in'));
  mount3D();
}

/* ---------- light 3D (only when WebGL works, motion is allowed, and the packet is on screen) ---------- */
let pk = null, io = null;
const gl = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };
async function mount3D() {
  teardown();
  const box = document.getElementById('p3d'); if (!box || REDUCE || !gl()) return;
  const mod = await import('./gl/packet3d.js?v=10191741');
  if (!document.body.contains(box)) return;
  pk = new mod.Packet3D(box.querySelector('#pgl'), box, { mobile: innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4 });
  await pk.setProduct(p, V.lang); box.classList.add('live');
  io = new IntersectionObserver(es => es.forEach(e => { if (!pk) return; e.isIntersecting && !document.hidden ? pk.start() : pk.stop(); }), { rootMargin: '80px' }); io.observe(box);
}
function teardown() { if (io) { io.disconnect(); io = null; } if (pk) { pk.dispose(); pk = null; const old = document.getElementById('pgl'); if (old) old.replaceWith(old.cloneNode(false)); } }
document.addEventListener('visibilitychange', () => { if (!pk) return; if (document.hidden) pk.stop(); });
addEventListener('pagehide', teardown);

host.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zone]'); if (!z) return;
  setZone(z.dataset.zone);
});
const redo = () => { const y = scrollY; unart(host); render(); scrollTo(0, y); };
window.addEventListener('langchange', redo); window.addEventListener('seasonchange', redo);
render();
