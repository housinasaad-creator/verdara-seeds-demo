/*
  The season engine: it reads today's date (or a preview month the visitor picked) and works out, for the chosen climate zone,
  which crops can be sown now, started under cover, are in harvest, or are about to be sown. Everything that is "this season"
  on the site (featured varieties, badges, counters, calendar highlights, hero weather) is derived from these few functions,
  so on the 1st of every month the site changes by itself.
*/
import { CROPS, PRODUCTS, ZONES, windows } from './data.js?v=10191757';

const ZKEY = 'vdr.zone', MKEY = 'vdr.month';
const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };
const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } } };

/* ---------- zone and date ---------- */
export const getZone = () => { const z = ls.get(ZKEY); return ZONES.some(x => x.id === z) ? z : 'med'; };
export function setZone(z) { ls.set(ZKEY, z); window.dispatchEvent(new CustomEvent('seasonchange')); }

/* a month can be previewed with ?month=1..12 or from the picker (kept for the browser session); otherwise it is today's month */
export function today() {
  const q = +new URLSearchParams(location.search).get('month'), s = +ss.get(MKEY), m = q >= 1 && q <= 12 ? q : s >= 1 && s <= 12 ? s : 0, d = new Date();
  return { month: m || d.getMonth() + 1, day: m ? 15 : d.getDate(), year: d.getFullYear(), preview: !!m };
}
export function setPreviewMonth(m) { ss.set(MKEY, m ? String(m) : null); window.dispatchEvent(new CustomEvent('seasonchange')); }
/* meteorological seasons, northern hemisphere (the catalogue targets Türkiye, the Mediterranean and the Gulf) */
export const seasonOf = (month) => (month === 12 || month <= 2 ? 'winter' : month <= 5 ? 'spring' : month <= 8 ? 'summer' : 'autumn');
export const monthName = (month, lang) => new Intl.DateTimeFormat(lang, { month: 'long' }).format(new Date(2024, month - 1, 1));

/* ---------- windows ---------- */
const inWin = (arr, m) => arr.some(([a, b]) => (a <= b ? m >= a && m <= b : m >= a || m <= b));
const next = (m) => (m % 12) + 1;
/* warm crops grown in greenhouses are started under cover earlier than the open-field sowing */
const COVER = { med: [[1, 2]], cont: [[2, 3]], hot: [[12, 1]] };
const UNDER_COVER = new Set(PRODUCTS.filter(p => p.grow.includes('greenhouse') && CROPS[p.crop].season === 'warm').map(p => p.crop));

/* 'sow' | 'cover' | 'harvest' | 'soon' | '' */
export function cropState(cropId, zone = getZone(), month = today().month) {
  const w = windows(cropId, zone);
  if (inWin(w.sow, month)) return 'sow';
  if (UNDER_COVER.has(cropId) && inWin(COVER[zone], month)) return 'cover';
  if (inWin(w.harv, month)) return 'harvest';
  if (inWin(w.sow, next(month))) return 'soon';
  return '';
}
export const coverWindow = (zone) => COVER[zone];
export const canCover = (cropId) => UNDER_COVER.has(cropId);

/* how many crops are in each state right now */
export function summary(zone = getZone(), month = today().month) {
  const out = { sow: 0, cover: 0, harvest: 0, soon: 0, total: 0 };
  for (const id of Object.keys(CROPS)) { const s = cropState(id, zone, month); if (s) out[s]++; out.total++; }
  return out;
}

/* ---------- featured varieties for the month ---------- */
const POP = ['tomato', 'cucumber', 'sweetpepper', 'watermelon', 'melon', 'lettuce', 'wheat', 'strawberry', 'sunflower', 'potato', 'onion', 'carrot', 'chickpea', 'lentilred', 'cabbage', 'broccoli', 'cauliflower', 'spinach', 'apple', 'olive', 'corn', 'barley', 'eggplant', 'zucchini', 'parsley', 'basil', 'cherry', 'grape', 'pomegranate', 'apricot', 'fig', 'hazelnut', 'pistachio', 'alfalfa', 'cotton', 'pea', 'drybean', 'garlic', 'radish', 'beet'];
const BASE = { sow: 5, cover: 4, harvest: 3, soon: 1.6 };
const h32 = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/* the best varieties to show now: in-season first, popular crops first, a different spread every month, at most two per group */
export function featured(n = 12, zone = getZone(), month = today().month) {
  const cand = [];
  for (const id of Object.keys(CROPS)) {
    const st = cropState(id, zone, month); if (!st) continue;
    const pop = POP.indexOf(id), score = BASE[st] + (pop < 0 ? 0 : (1 - pop / POP.length) * 1.6) + (h32(id + month) % 100) / 100;
    cand.push({ id, st, score });
  }
  cand.sort((a, b) => b.score - a.score);
  const per = {}, out = [];
  for (const c of cand) { const cat = CROPS[c.id].cat; if ((per[cat] || 0) >= 2) continue; per[cat] = (per[cat] || 0) + 1; out.push(c); if (out.length === n) break; }
  for (const c of cand) { if (out.length >= n) break; if (!out.includes(c)) out.push(c); }
  /* a different variety of the crop is highlighted each month */
  return out.map(c => { const list = PRODUCTS.filter(p => p.crop === c.id); return { product: list[month % list.length], state: c.st }; });
}

