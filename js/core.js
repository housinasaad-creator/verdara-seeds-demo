/* Shared state: current language, translation lookup, WhatsApp link. No imports from other app modules (avoids cycles). */
import { BRAND } from './brand.js?v=10192019';
import { T, LANGS, DIR, detectLang } from './i18n.js?v=10192019';

export const V = { lang: detectLang() };
export const t = (k) => (T[V.lang] && T[V.lang][k]) || T.en[k] || k;
export const tl = (k, lang) => (T[lang] && T[lang][k]) || T.en[k] || k;
export const waLink = (text = '') => `https://wa.me/${BRAND.wa}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
export { LANGS, DIR };

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
}

export function setLang(l, silent = false) {
  if (!LANGS.includes(l)) return;
  V.lang = l;
  try { localStorage.setItem('vdr.lang', l); } catch (e) { /* ignore */ }
  document.documentElement.lang = l; document.documentElement.dir = DIR[l];
  applyI18n();
  document.querySelectorAll('.lang button, .ldm button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  document.querySelectorAll('[data-lang-cur]').forEach(e => { e.textContent = l.toUpperCase(); });
  if (!silent) window.dispatchEvent(new CustomEvent('langchange', { detail: l }));
}

export const fmtNum = (n) => Number(n).toLocaleString(V.lang === 'ar' ? 'ar-EG' : V.lang);
export const isRTL = () => V.lang === 'ar';
