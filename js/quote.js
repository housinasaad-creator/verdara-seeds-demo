/*
  Quote request: a free-text product box (the visitor types any product name), plus every "Request price" button
  appends its product name to that box automatically. Sent through WhatsApp: no prices, no payment.
  The draft survives page changes (localStorage) and is shared by the slide-over drawer and the quote page.
*/
import { V, t, tl, waLink, applyI18n } from './core.js?v=10191953';

const KEY = 'vdr.q', FKEY = 'vdr.qf';
const store = {
  get(k, d = '') { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
};

export const Q = {
  text() { return store.get(KEY); },
  lines() { return this.text().split('\n').map(s => s.trim()).filter(Boolean); },
  set(v) { store.set(KEY, v); window.dispatchEvent(new CustomEvent('quotechange')); },
  add(name) {
    const l = this.lines(); if (!l.includes(name)) l.push(name); this.set(l.join('\n')); toast(`${t('q.added')}: ${name}`); pulse();
  },
  clear() { this.set(''); }
};

export function fields() { try { return JSON.parse(store.get(FKEY, '{}')) || {}; } catch (e) { return {}; } }
function saveField(k, v) { const f = fields(); f[k] = v; store.set(FKEY, JSON.stringify(f)); }

export function buildMessage(f, lang = V.lang) {
  const L = (k) => tl(k, lang), out = [L('m.hello'), ''];
  const prods = (f.prod || '').split('\n').map(s => s.trim()).filter(Boolean);
  out.push(`${L('m.prod')}:`); prods.forEach(p => out.push(`• ${p}`));
  const unit = { kg: tl('q.unit.kg', lang), t: tl('q.unit.t', lang), pack: tl('q.unit.pack', lang) }[f.unit || 'kg'];
  if (f.qty) out.push(`${L('m.qty')}: ${f.qty} ${unit}`);
  if (f.company) out.push(`${L('m.company')}: ${f.company}`);
  if (f.name) out.push(`${L('m.name')}: ${f.name}`);
  if (f.country) out.push(`${L('m.country')}: ${f.country}`);
  if (f.phone) out.push(`${L('m.phone')}: ${f.phone}`);
  if (f.notes) out.push(`${L('m.notes')}: ${f.notes}`);
  return out.join('\n');
}

/* ---------- toast + FAB pulse ---------- */
let toastEl, toastT;
export function toast(msg) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
  toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2400);
}
function pulse() { const b = document.querySelector('.qfab'); if (!b) return; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }

/* ---------- the form (used in the drawer and on the quote page) ---------- */
const WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.78a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45c6.56 0 11.9-5.34 11.9-11.89 0-3.18-1.24-6.17-3.48-8.41"/></svg>';
export const WA_ICON = WA;

export function buildForm(host, { inline = false } = {}) {
  const f0 = fields();
  host.innerHTML = `
    <form class="qf" novalidate>
      <label class="fld big"><span data-i18n="q.products"></span>
        <textarea name="prod" dir="auto" rows="${inline ? 5 : 4}" data-i18n-ph="q.ph" required></textarea>
        <small data-i18n="q.hint"></small><em class="err" hidden data-i18n="q.empty"></em>
      </label>
      <div class="row2 qty">
        <label class="fld"><span data-i18n="q.qty"></span><input name="qty" type="number" min="0" step="any" inputmode="decimal"></label>
        <label class="fld"><span>&nbsp;</span><select name="unit"><option value="kg" data-i18n="q.unit.kg"></option><option value="t" data-i18n="q.unit.t"></option><option value="pack" data-i18n="q.unit.pack"></option></select></label>
      </div>
      <div class="row2">
        <label class="fld"><span data-i18n="q.company"></span><input name="company" dir="auto" autocomplete="organization"></label>
        <label class="fld"><span data-i18n="q.name"></span><input name="name" dir="auto" autocomplete="name"></label>
        <label class="fld"><span data-i18n="q.country"></span><input name="country" dir="auto" autocomplete="country-name"></label>
        <label class="fld"><span data-i18n="q.phone"></span><input name="phone" type="tel" autocomplete="tel" inputmode="tel"></label>
      </div>
      <label class="fld"><span data-i18n="q.notes"></span><textarea name="notes" dir="auto" rows="2"></textarea></label>
      <div class="qact">
        <button class="btn amber send" type="submit">${WA}<span data-i18n="q.send"></span></button>
        <button class="btn ghost copy" type="button" data-i18n="q.copy"></button>
        <button class="lnk clr" type="button" data-i18n="q.clear"></button>
      </div>
      <details class="prev" ${inline ? 'open' : ''}><summary data-i18n="q.preview"></summary><pre class="bub" dir="auto"></pre></details>
    </form>`;
  const form = host.querySelector('form'), ta = form.elements.prod;
  const get = () => ({ prod: ta.value, qty: form.elements.qty.value, unit: form.elements.unit.value, company: form.elements.company.value, name: form.elements.name.value, country: form.elements.country.value, phone: form.elements.phone.value, notes: form.elements.notes.value });
  const bub = form.querySelector('.bub');
  const paint = () => { bub.textContent = buildMessage(get()); };
  ta.value = Q.text();
  for (const k of ['qty', 'unit', 'company', 'name', 'country', 'phone', 'notes']) if (f0[k] !== undefined) form.elements[k].value = f0[k];
  applyI18n(host); paint();
  form.addEventListener('input', (e) => {
    if (e.target === ta) Q.set(ta.value); else if (e.target.name) saveField(e.target.name, e.target.value);
    form.querySelector('.err').hidden = true; paint();
  });
  const sync = () => { if (document.activeElement !== ta && ta.value !== Q.text()) ta.value = Q.text(); paint(); };
  window.addEventListener('quotechange', sync); window.addEventListener('langchange', () => { applyI18n(host); paint(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ta.value.trim()) { form.querySelector('.err').hidden = false; ta.focus(); return; }
    window.open(waLink(buildMessage(get())), '_blank', 'noopener');
  });
  form.querySelector('.copy').addEventListener('click', async () => {
    if (!ta.value.trim()) { form.querySelector('.err').hidden = false; ta.focus(); return; }
    try { await navigator.clipboard.writeText(buildMessage(get())); toast(t('q.copied')); } catch (er) { /* clipboard blocked */ }
  });
  form.querySelector('.clr').addEventListener('click', () => { Q.clear(); ta.value = ''; paint(); ta.focus(); });
  return form;
}

/* ---------- slide-over drawer + floating button ---------- */
let drawer;
export function openQuote() { if (!drawer) mountDrawer(); drawer.classList.add('on'); drawer.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('noscroll'); setTimeout(() => drawer.querySelector('textarea').focus({ preventScroll: true }), 220); }
export function closeQuote() { if (!drawer) return; drawer.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('noscroll'); }
function mountDrawer() {
  drawer = document.createElement('div'); drawer.className = 'qd'; drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `<div class="qd-bg" data-close></div><aside class="qd-p" role="dialog" aria-modal="true" aria-labelledby="qd-t"><header><h2 id="qd-t" data-i18n="q.title"></h2><button class="x" type="button" data-close data-i18n-aria="c.close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header><div class="qd-b"></div></aside>`;
  document.body.appendChild(drawer); buildForm(drawer.querySelector('.qd-b')); applyI18n(drawer);
  drawer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeQuote(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeQuote(); });
}

export function mountFab() {
  if (document.body.dataset.page === 'quote') return;
  const b = document.createElement('button'); b.className = 'qfab'; b.type = 'button';
  b.innerHTML = `${WA}<span class="lbl" data-i18n="nav.quote"></span><b class="cnt" hidden>0</b>`; document.body.appendChild(b); applyI18n(b);
  const upd = () => { const n = Q.lines().length, c = b.querySelector('.cnt'); c.textContent = n; c.hidden = n === 0; document.querySelectorAll('.hq .cnt').forEach(x => { x.textContent = n; x.hidden = n === 0; }); };
  b.addEventListener('click', openQuote); window.addEventListener('quotechange', upd); upd();
  document.addEventListener('click', (e) => { const o = e.target.closest('[data-openquote]'); if (o) { e.preventDefault(); openQuote(); } });
  return upd;
}
