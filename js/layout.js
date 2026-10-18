/*
  Shared chrome: header, mobile menu, footer, language switch (TR / EN / FR / AR, layout always left-to-right), floating quote button.
  Every page loads this first, then its own script. Event: window 'langchange'.
*/
import { BRAND, markSVG } from './brand.js';
import { V, t, tl, setLang, applyI18n, LANGS, waLink } from './core.js';
import { mountFab, openQuote, WA_ICON, Q } from './quote.js';
import { reveal, tilt, art, REDUCE } from './motion.js';
import './cursor.js';

const PAGE = document.body.dataset.page || 'home';
const NAV = [['home', 'index.html', 'nav.home'], ['catalog', 'catalog.html', 'nav.catalog'], ['calendar', 'calendar.html', 'nav.calendar'], ['about', 'about.html', 'nav.about']];
const DESC = {
  tr: 'VERDARA, toptan tohum tedariki için bir marka ve web sitesi tasarım örneğidir: katalog, ekim takvimi, WhatsApp ile fiyat teklifi.',
  en: 'VERDARA is a brand and website design demo for wholesale seed supply: catalogue, sowing calendar and price quotes on WhatsApp.',
  fr: 'VERDARA est une démo de marque et de site pour la fourniture de semences en gros : catalogue, calendrier de semis et devis sur WhatsApp.',
  ar: 'فيردارا نموذج علامة وموقع لتوريد البذور بالجملة: كتالوج وتقويم زراعة وعروض أسعار عبر واتساب.'
};
const HOME_TITLE = { tr: 'VERDARA | Toptan tohum tedariki', en: 'VERDARA | Wholesale seed supply', fr: 'VERDARA | Semences en gros', ar: 'فيردارا | توريد البذور بالجملة' };

function chrome() {
  const hdr = document.getElementById('hdr');
  if (hdr) hdr.outerHTML = `
  <a class="skip" href="#main" data-i18n="x.skip"></a>
  <header class="hdr ${PAGE === 'home' ? 'over' : ''}" id="hdrbar">
    <a class="brand" href="index.html" aria-label="${BRAND.name}">${markSVG()}<span class="bn"><b>${BRAND.name}</b><em>${BRAND.sub}</em></span></a>
    <nav class="nav" aria-label="Main">${NAV.map(([id, href, k]) => `<a href="${href}" ${PAGE === id || (PAGE === 'product' && id === 'catalog') ? 'class="on" aria-current="page"' : ''} data-i18n="${k}"></a>`).join('')}</nav>
    <div class="tools">
      <div class="lang" role="group" aria-label="Language">${LANGS.map(l => `<button type="button" data-lang="${l}" aria-pressed="false">${l.toUpperCase()}</button>`).join('')}</div>
      ${PAGE === 'quote' ? '' : `<button class="btn amber hq" type="button" data-openquote>${WA_ICON}<span data-i18n="nav.quote"></span><b class="cnt" hidden>0</b></button>`}
      <button class="burger" type="button" aria-label="Menu" data-i18n-aria="nav.menu" aria-expanded="false"><i></i></button>
    </div>
  </header>
  <div class="mnav" id="mnav">${NAV.map(([id, href, k]) => `<a href="${href}" data-i18n="${k}"></a>`).join('')}<a href="quote.html" data-i18n="nav.quote"></a>
    <div class="lang" role="group" aria-label="Language">${LANGS.map(l => `<button type="button" data-lang="${l}" aria-pressed="false">${l.toUpperCase()}</button>`).join('')}</div></div>`;

  const ftr = document.getElementById('ftr');
  if (ftr) ftr.outerHTML = `
  <footer class="ftr"><div class="wrap">
    <div class="fgrid">
      <div class="fb"><a class="brand" href="index.html">${markSVG()}<span class="bn"><b>${BRAND.name}</b><em>${BRAND.sub}</em></span></a>
        <p data-i18n="f.tag"></p><p class="demo-note" data-i18n="f.demo"></p></div>
      <div><h4 data-i18n="f.links"></h4><ul>${NAV.map(([id, href, k]) => `<li><a href="${href}" data-i18n="${k}"></a></li>`).join('')}<li><a href="quote.html" data-i18n="nav.quote"></a></li><li><a href="privacy.html" data-i18n="f.privacy"></a></li></ul></div>
      <div><h4 data-i18n="f.contact"></h4><ul><li><a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a></li><li dir="ltr">${BRAND.email}</li><li data-i18n="f.hours"></li></ul></div>
    </div>
    <div class="fbar"><span>© ${BRAND.year} ${BRAND.name} (demo) · <a href="privacy.html" data-i18n="f.privacy"></a></span><span><span data-i18n="f.by"></span> <a href="https://housinasaad-creator.github.io/mohammed-studio/" target="_blank" rel="noopener">MOHAMMED Web Studio</a></span></div>
  </div></footer>`;
}

function setTitles() {
  const nav = NAV.find(n => n[0] === PAGE);
  if (PAGE === 'home') document.title = HOME_TITLE[V.lang];
  else if (PAGE === 'quote') document.title = `${tl('nav.quote', V.lang)} | ${BRAND.name}`;
  else if (PAGE === 'product') { /* set by product.js */ }
  else if (PAGE === 'privacy') document.title = `${t('f.privacy')} | ${BRAND.name}`;
  else if (nav) document.title = `${t(nav[2])} | ${BRAND.name}`;
  const d = document.querySelector('meta[name=description]'); if (d) d.content = DESC[V.lang];
}

function wire() {
  const bar = document.getElementById('hdrbar'), mnav = document.getElementById('mnav'), burger = document.querySelector('.burger');
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.lang button'); if (b) { setLang(b.dataset.lang); return; }
    if (e.target.closest('.burger')) { const on = mnav.classList.toggle('on'); burger.setAttribute('aria-expanded', String(on)); bar.classList.toggle('open', on); document.documentElement.classList.toggle('noscroll', on); return; }
    if (mnav && mnav.classList.contains('on') && e.target.closest('#mnav a')) { mnav.classList.remove('on'); bar.classList.remove('open'); document.documentElement.classList.remove('noscroll'); }
  });
  /* the header stays put while scrolling; on the home page it only changes from dark glass to light glass once the hero is behind it */
  const jr = document.getElementById('journey');
  let wasOver = null;
  const onScroll = () => { if (!jr) return; const over = scrollY < jr.offsetTop + jr.offsetHeight - 80; if (over !== wasOver) { wasOver = over; bar.classList.toggle('over', over); } };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  window.addEventListener('langchange', setTitles);
}

/* back-to-top button: appears once the visitor has scrolled down, sits above the floating quote button */
function mountTop() {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'totop'; b.setAttribute('data-i18n-aria', 'c.top');
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  if (PAGE === 'quote') b.classList.add('low');
  document.body.appendChild(b); applyI18n(b);
  let on = false; const upd = () => { const s = scrollY > 700; if (s !== on) { on = s; b.classList.toggle('on', s); } };
  addEventListener('scroll', upd, { passive: true }); upd();
  b.addEventListener('click', () => scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' }));
}

chrome();
document.documentElement.lang = V.lang; document.documentElement.dir = 'ltr';
setLang(V.lang, true); setTitles(); wire(); mountFab(); mountTop();
document.addEventListener('DOMContentLoaded', () => { reveal(); tilt(); art(); });
if (document.readyState !== 'loading') { reveal(); tilt(); art(); }
export { V, t, tl, setLang, applyI18n, waLink, openQuote, Q };
