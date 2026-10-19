/*
  Demo catalogue: invented varieties in 11 broad groups, built from the crop table in crops.js.
  Everything here is placeholder content for the concept demo (no real product claims).
*/
import { ROWS } from './crops.js?v=10191741';

export const LANGS = ['tr', 'en', 'fr', 'ar'];

/* ---------- groups (11): each one holds every crop of its kind ---------- */
export const CATS = [
  { id: 'leafy',     color: '#8fd14f', emblem: 'lettuce',    p: 'LG', n: { tr: 'Yapraklı Sebzeler', en: 'Leafy Greens', fr: 'Légumes feuilles', ar: 'الخضروات الورقية' } },
  { id: 'brassica',  color: '#2f9e6b', emblem: 'cabbage',    p: 'BR', n: { tr: 'Lahanagiller', en: 'Cabbage Family', fr: 'Choux et crucifères', ar: 'الكرنبيات' } },
  { id: 'fruitveg',  color: '#f2862a', emblem: 'tomato',     p: 'FV', n: { tr: 'Meyveli Sebzeler', en: 'Fruit Vegetables', fr: 'Légumes-fruits', ar: 'خضروات الثمار' } },
  { id: 'fruits',    color: '#d6405a', emblem: 'apple',      p: 'FN', n: { tr: 'Meyveler ve Kuruyemiş', en: 'Fruits & Nuts', fr: 'Fruits et fruits à coque', ar: 'الفواكه والمكسرات' } },
  { id: 'roots',     color: '#b8602e', emblem: 'carrot',     p: 'RT', n: { tr: 'Kök, Yumru ve Soğanlılar', en: 'Roots, Tubers & Bulbs', fr: 'Racines, tubercules et bulbes', ar: 'الجذور والدرنات والبصليات' } },
  { id: 'cereals',   color: '#b9975b', emblem: 'wheat',      p: 'CR', n: { tr: 'Hububat', en: 'Cereals & Grains', fr: 'Céréales', ar: 'الحبوب' } },
  { id: 'legumes',   color: '#7b5ea7', emblem: 'drybean',    p: 'LE', n: { tr: 'Baklagiller', en: 'Legumes & Pulses', fr: 'Légumineuses', ar: 'البقوليات' } },
  { id: 'oil',       color: '#e1a21b', emblem: 'sunflower',  p: 'OI', n: { tr: 'Yağlı ve Endüstri Bitkileri', en: 'Oil & Industrial Crops', fr: 'Oléagineux et cultures industrielles', ar: 'المحاصيل الزيتية والصناعية' } },
  { id: 'forage',    color: '#5f8f3a', emblem: 'clover',     p: 'FO', n: { tr: 'Yem ve Çayır Bitkileri', en: 'Forage & Grasses', fr: 'Fourrages et graminées', ar: 'محاصيل العلف والأعشاب' } },
  { id: 'herbs',     color: '#2f9e8a', emblem: 'basil',      p: 'HB', n: { tr: 'Baharat ve Aromatik Bitkiler', en: 'Herbs & Spices', fr: 'Aromates et épices', ar: 'الأعشاب والتوابل' } },
  { id: 'flowers',   color: '#d8579b', emblem: 'marigold',   p: 'FL', n: { tr: 'Çiçekler', en: 'Flowers', fr: 'Fleurs', ar: 'الأزهار' } }
];

/* ---------- indicative sowing profiles: depth cm, in-row spacing cm, soil temperature °C, germination days ---------- */
const PROFILE = {
  sm: ['0.3–0.5', '5–10', '12–20', '3–7'],   lf: ['0.5–1', '15–30', '12–20', '4–9'],     br: ['0.5–1.5', '40–60', '15–22', '4–8'],
  fv: ['0.5–1', '40–60', '22–28', '5–12'],   cu: ['1–3', '60–120', '22–30', '4–8'],      st: ['0.2–0.5', '25–40', '18–22', '14–28'],
  rt: ['0.5–1.5', '5–15', '12–22', '7–14'],  bu: ['1–1.5', '8–12', '10–20', '7–14'],     po: ['8–10', '30–35', '8–16', '14–28'],
  ce: ['3–5', '10–15', '8–15', '5–10'],      ri: ['1–2', '15–20', '18–28', '5–10'],      mz: ['4–5', '20–25', '12–20', '5–10'],
  lg: ['3–5', '8–10', '12–25', '5–12'],      ol: ['2–4', '20–30', '10–20', '6–10'],      fo: ['1–2', '10–15', '8–18', '5–14'],
  hb: ['0.5–1', '15–25', '15–22', '7–14'],   fl: ['0.3–1', '20–30', '18–24', '5–14'],     tr: ['3–5', '200–400', '2–5 (cold stratification)', '30–90']
};

/* ---------- trait tags ---------- */
export const TAGS = {
  early:      { tr: 'Erkenci', en: 'Early', fr: 'Précoce', ar: 'مبكر' },
  highYield:  { tr: 'Yüksek verim', en: 'High yield', fr: 'Rendement élevé', ar: 'إنتاجية عالية' },
  firm:       { tr: 'Sert meyve', en: 'Firm fruit', fr: 'Fruit ferme', ar: 'ثمار متماسكة' },
  longShelf:  { tr: 'Uzun raf ömrü', en: 'Long shelf life', fr: 'Longue conservation', ar: 'عمر تخزين طويل' },
  heatTol:    { tr: 'Sıcağa dayanıklı', en: 'Heat tolerant', fr: 'Tolérant à la chaleur', ar: 'يتحمل الحرارة' },
  coldTol:    { tr: 'Soğuğa dayanıklı', en: 'Cold tolerant', fr: 'Tolérant au froid', ar: 'يتحمل البرودة' },
  uniform:    { tr: 'Üniform', en: 'Uniform', fr: 'Uniforme', ar: 'متجانس' },
  diseaseTol: { tr: 'Hastalığa toleranslı', en: 'Disease tolerant', fr: 'Tolérant aux maladies', ar: 'يتحمل الأمراض' },
  sweet:      { tr: 'Tatlı', en: 'Sweet', fr: 'Sucré', ar: 'حلو المذاق' },
  crisp:      { tr: 'Gevrek', en: 'Crisp', fr: 'Croquant', ar: 'مقرمش' },
  slowBolt:   { tr: 'Geç çiçeğe kalkar', en: 'Slow bolting', fr: 'Montaison lente', ar: 'بطيء الإزهار' },
  vigorous:   { tr: 'Güçlü bitki', en: 'Vigorous plant', fr: 'Plante vigoureuse', ar: 'نبات قوي' },
  droughtTol: { tr: 'Kuraklığa dayanıklı', en: 'Drought tolerant', fr: 'Tolérant à la sécheresse', ar: 'يتحمل الجفاف' },
  processing: { tr: 'Sanayiye uygun', en: 'For processing', fr: 'Pour transformation', ar: 'مناسب للتصنيع' },
  export:     { tr: 'İhracat kalitesi', en: 'Export quality', fr: 'Qualité export', ar: 'جودة للتصدير' },
  aromatic:   { tr: 'Aromatik', en: 'Aromatic', fr: 'Aromatique', ar: 'عطري' },
  compact:    { tr: 'Kompakt bitki', en: 'Compact plant', fr: 'Plante compacte', ar: 'نبات مدمج' },
  tall:       { tr: 'Uzun boylu', en: 'Tall plant', fr: 'Plante haute', ar: 'نبات طويل' },
  oilRich:    { tr: 'Yüksek yağ oranı', en: 'High oil content', fr: 'Teneur élevée en huile', ar: 'نسبة زيت عالية' },
  protein:    { tr: 'Yüksek protein', en: 'High protein', fr: 'Riche en protéines', ar: 'بروتين عالٍ' },
  pungent:    { tr: 'Yüksek acılık', en: 'High pungency', fr: 'Piquant élevé', ar: 'حرارة عالية' },
  glossy:     { tr: 'Parlak meyve', en: 'Glossy fruit', fr: 'Fruit brillant', ar: 'ثمار لامعة' },
  largeFruit: { tr: 'İri tane/meyve', en: 'Large fruit / grain', fr: 'Gros fruit / grain', ar: 'ثمار / حبوب كبيرة' },
  seedless:   { tr: 'Çekirdeksiz', en: 'Seedless', fr: 'Sans pépins', ar: 'بدون بذور' },
  rootstock:  { tr: 'Anaç tohumu', en: 'Rootstock seed', fr: 'Semence de porte-greffe', ar: 'بذور أصول' },
  breadQ:     { tr: 'Ekmeklik kalite', en: 'Bread-making quality', fr: 'Qualité boulangère', ar: 'جودة للخبز' },
  silage:     { tr: 'Silajlık kalite', en: 'Silage quality', fr: "Qualité d'ensilage", ar: 'جودة للسيلاج' },
  multiCut:   { tr: 'Çok biçimli', en: 'Multi-cut', fr: 'Multi-coupes', ar: 'متعدد الحشّات' },
  nFix:       { tr: 'Azot bağlar', en: 'Nitrogen fixing', fr: "Fixe l'azote", ar: 'يثبّت النيتروجين' },
  longBloom:  { tr: 'Uzun çiçeklenme', en: 'Long bloom', fr: 'Floraison longue', ar: 'إزهار طويل' },
  beeFriendly:{ tr: 'Arı dostu', en: 'Bee friendly', fr: 'Mellifère', ar: 'صديق للنحل' },
  cutFlower:  { tr: 'Kesme çiçek', en: 'Cut flower', fr: 'Fleur coupée', ar: 'زهرة قطف' },
  bedding:    { tr: 'Peyzaj bitkisi', en: 'Bedding plant', fr: 'Plante de massif', ar: 'نبات حدائق' },
  fastCook:   { tr: 'Çabuk pişer', en: 'Fast cooking', fr: 'Cuisson rapide', ar: 'سريع الطهي' },
  dense:      { tr: 'Sıkı baş', en: 'Dense head', fr: 'Pomme dense', ar: 'رأس متماسك' },
  pickling:   { tr: 'Turşuluk', en: 'For pickling', fr: 'Pour conserves', ar: 'مناسب للتخليل' },
  fibre:      { tr: 'Lif kalitesi', en: 'Fibre quality', fr: 'Qualité de fibre', ar: 'جودة الألياف' },
  sugar:      { tr: 'Yüksek şeker', en: 'High sugar', fr: 'Sucre élevé', ar: 'سكر مرتفع' },
  fastGerm:   { tr: 'Hızlı çimlenme', en: 'Fast germination', fr: 'Germination rapide', ar: 'إنبات سريع' },
  heritage:   { tr: 'Anadolu çeşidi', en: 'Anatolian heritage', fr: 'Variété anatolienne', ar: 'صنف أناضولي' }
};

/* traits a variety of each group can draw from */
const POOL = {
  leafy:    ['crisp', 'slowBolt', 'coldTol', 'uniform', 'diseaseTol', 'early', 'vigorous', 'sweet', 'export', 'fastGerm'],
  brassica: ['dense', 'uniform', 'coldTol', 'diseaseTol', 'longShelf', 'highYield', 'early', 'firm', 'export'],
  fruitveg: ['highYield', 'firm', 'uniform', 'longShelf', 'heatTol', 'diseaseTol', 'early', 'glossy', 'largeFruit', 'export', 'sweet'],
  fruits:   ['sweet', 'firm', 'aromatic', 'highYield', 'largeFruit', 'early', 'longShelf', 'export', 'uniform', 'diseaseTol'],
  roots:    ['uniform', 'longShelf', 'sweet', 'firm', 'early', 'highYield', 'coldTol', 'crisp', 'diseaseTol'],
  cereals:  ['highYield', 'droughtTol', 'coldTol', 'protein', 'uniform', 'diseaseTol', 'processing', 'early', 'heatTol'],
  legumes:  ['protein', 'droughtTol', 'highYield', 'uniform', 'early', 'largeFruit', 'coldTol', 'diseaseTol'],
  oil:      ['oilRich', 'droughtTol', 'highYield', 'uniform', 'heatTol', 'early', 'vigorous', 'diseaseTol'],
  forage:   ['highYield', 'multiCut', 'coldTol', 'droughtTol', 'vigorous', 'protein', 'tall', 'diseaseTol'],
  herbs:    ['aromatic', 'vigorous', 'compact', 'slowBolt', 'early', 'coldTol', 'uniform', 'heatTol'],
  flowers:  ['longBloom', 'compact', 'vigorous', 'uniform', 'tall', 'beeFriendly', 'cutFlower', 'bedding', 'heatTol', 'early']
};
const DEF_LEAF = { leafy: '#3f9a3a', brassica: '#3a8a4a', fruitveg: '#2f8f4e', fruits: '#3a8a3a', roots: '#3f9e3a', cereals: '#8aa03a', legumes: '#4a9a3a', oil: '#4a9a37', forage: '#4a9a3a', herbs: '#3f8f3a', flowers: '#3f8f3a' };

/* packs by pack set */
const PACKS = {
  veg:    [{ v: 1000, u: 'seeds' }, { v: 5000, u: 'seeds' }, { v: 50, u: 'g' }, { v: 500, u: 'g' }],
  leaf:   [{ v: 25, u: 'g' }, { v: 100, u: 'g' }, { v: 1, u: 'kg' }, { v: 5, u: 'kg' }],
  field:  [{ v: 25, u: 'kg' }, { v: 50, u: 'kg' }, { v: 1, u: 't' }],
  herb:   [{ v: 10, u: 'g' }, { v: 100, u: 'g' }, { v: 1, u: 'kg' }],
  tree:   [{ v: 1, u: 'kg' }, { v: 5, u: 'kg' }, { v: 25, u: 'kg' }],
  flow:   [{ v: 1000, u: 'seeds' }, { v: 10, u: 'g' }, { v: 100, u: 'g' }]
};

/* ---------- crops, parsed from the table ---------- */
export const CROPS = {};
const VAR = {};
for (const line of ROWS.split('\n')) {
  const f = line.trim().split('|'); if (f.length < 16) continue;
  const [id, cat, emblem, fruit, leafc, prof, season, days, grow, hy, pk, tr, en, fr, ar, names, extra] = f, p = PROFILE[prof];
  CROPS[id] = { cat, emblem, fruit: '#' + fruit, leaf: leafc === '-' ? DEF_LEAF[cat] : '#' + leafc, season, depth: p[0], space: p[1], temp: p[2], germ: p[3], n: { tr, en, fr, ar } };
  VAR[id] = { names: names.split(',').map(s => s.trim()), days: +days, grow, hy, pk, extra: (extra || '').split(',').filter(Boolean) };
}
for (const c of CATS) c.crops = Object.keys(CROPS).filter(id => CROPS[id].cat === c.id);

/* ---------- varieties: names come from the table, the rest is derived deterministically ---------- */
const h32 = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function pickTags(pool, seed, n, first) {
  const out = [...first]; let h = h32(seed);
  while (out.length < n) { const k = pool[h % pool.length]; if (!out.includes(k)) out.push(k); h = (Math.imul(h, 1103515245) + 12345) >>> 0; }
  return out.slice(0, n);
}
const OFFS = [0, -4, 5, -2, 8];
export const PRODUCTS = [];
for (const cat of CATS) {
  let n = 100;
  for (const cropId of cat.crops) {
    const v = VAR[cropId], tree = v.days >= 365;
    v.names.forEach((name, i) => {
      n += 1 + (h32(name) % 4);
      const type = v.hy === 'h' ? (i % 3 === 2 ? 'OP' : 'F1') : v.hy === 'm' ? (i === 0 ? 'F1' : 'OP') : 'OP';
      PRODUCTS.push({
        id: `${cat.p}-${n}`.toLowerCase(), code: `${cat.p}-${n}`, name, crop: cropId, cat: cat.id, type,
        days: tree ? v.days : Math.max(20, v.days + OFFS[i % OFFS.length]),
        grow: v.grow === 'fg' ? ['field', 'greenhouse'] : v.grow === 'g' ? ['greenhouse'] : ['field'],
        tags: pickTags(POOL[cat.id], cropId + name, tree ? 3 : 4, v.extra.slice(0, 2)),
        pack: PACKS[v.pk]
      });
    });
  }
}

/* ---------- planting calendar (indicative, by climate zone) ---------- */
export const ZONES = [
  { id: 'med',  n: { tr: 'Akdeniz & Ege', en: 'Mediterranean', fr: 'Méditerranéen', ar: 'المتوسطي' } },
  { id: 'cont', n: { tr: 'İç Anadolu / karasal', en: 'Continental', fr: 'Continental', ar: 'القاري' } },
  { id: 'hot',  n: { tr: 'Sıcak & kurak', en: 'Hot & arid', fr: 'Chaud & aride', ar: 'الحار والجاف' } }
];
/* month windows [from, to] (1-12, may wrap) for sowing / harvest by crop season and zone */
const WIN = {
  warm:   { med: { sow: [[3, 5]], harv: [[6, 10]] }, cont: { sow: [[4, 6]], harv: [[7, 10]] }, hot: { sow: [[2, 4], [8, 9]], harv: [[5, 7], [11, 12]] } },
  cool:   { med: { sow: [[9, 11]], harv: [[12, 4]] }, cont: { sow: [[3, 4], [8, 9]], harv: [[5, 6], [10, 11]] }, hot: { sow: [[10, 12]], harv: [[1, 3]] } },
  winter: { med: { sow: [[10, 12]], harv: [[5, 6]] }, cont: { sow: [[9, 10]], harv: [[6, 8]] }, hot: { sow: [[11, 12]], harv: [[4, 5]] } },
  tree:   { med: { sow: [[10, 12]], harv: [[6, 11]] }, cont: { sow: [[11, 12], [1, 2]], harv: [[7, 11]] }, hot: { sow: [[11, 12]], harv: [[5, 10]] } }
};
export const windows = (cropId, zone) => WIN[CROPS[cropId].season][zone];
export const SOW_SEASONS = { warm: ['spring'], cool: ['autumn', 'spring'], winter: ['autumn', 'winter'], tree: ['autumn', 'winter'] };

/* ---------- helpers ---------- */
export const catById = (id) => CATS.find(c => c.id === id);
export const prodById = (id) => PRODUCTS.find(p => p.id === id);
export const cropName = (cropId, lang) => CROPS[cropId].n[lang] || CROPS[cropId].n.en;
export const catName = (catId, lang) => catById(catId).n[lang] || catById(catId).n.en;
export const tagLabel = (k, lang) => (TAGS[k] && (TAGS[k][lang] || TAGS[k].en)) || k;

const UNIT = {
  seeds: { tr: 'tohum', en: 'seeds', fr: 'graines', ar: 'بذرة' },
  g: { tr: 'g', en: 'g', fr: 'g', ar: 'غ' },
  kg: { tr: 'kg', en: 'kg', fr: 'kg', ar: 'كغ' },
  t: { tr: 'ton', en: 't', fr: 't', ar: 'طن' }
};
export const unitLabel = (u, lang) => (UNIT[u] && (UNIT[u][lang] || UNIT[u].en)) || u;
export const packLabel = (p, lang) => `${p.v.toLocaleString(lang === 'ar' ? 'ar-EG' : lang)} ${unitLabel(p.u, lang)}`;

const DAY = { tr: 'gün', en: 'days', fr: 'jours', ar: 'يوم' }, YR = { tr: 'yıl', en: 'yrs', fr: 'ans', ar: 'سنوات' };
/* "72 days", or "4 yrs" for tree crops (stored as days) */
export const maturity = (p, lang) => (p.days >= 365 ? `${Math.round(p.days / 365)} ${YR[lang]}` : `${p.days} ${DAY[lang]}`);
export const isTree = (p) => p.days >= 365;

const TYPE = {
  F1: { tr: 'F1 hibrit', en: 'F1 hybrid', fr: 'Hybride F1', ar: 'هجين F1' },
  OP: { tr: 'Açık tozlaşan çeşit', en: 'Open-pollinated', fr: 'Pollinisation libre', ar: 'ملقّح مفتوح' }
};
const GROW = {
  field: { tr: 'açık tarla', en: 'open field', fr: 'plein champ', ar: 'الحقل المكشوف' },
  greenhouse: { tr: 'sera', en: 'greenhouse', fr: 'serre', ar: 'البيوت المحمية' }
};
export const typeLabel = (t, lang) => TYPE[t][lang] || TYPE[t].en;
export const growLabel = (g, lang) => GROW[g][lang] || GROW[g].en;

const AND = { tr: ' ve ', en: ' and ', fr: ' et ', ar: ' و' };
const SEP = { tr: ', ', en: ', ', fr: ', ', ar: '، ' };

/* a short description assembled from traits (all four languages) */
export function describe(p, lang) {
  const crop = cropName(p.crop, lang);
  const grow = p.grow.map(g => growLabel(g, lang)).join(AND[lang]);
  const tags = p.tags.map(k => tagLabel(k, lang)).join(SEP[lang]);
  const m = maturity(p, lang), tree = isTree(p);
  switch (lang) {
    case 'tr': return `${typeLabel(p.type, lang)} ${crop.toLowerCase()}, ${grow} için. Öne çıkan özellikler: ${tags}. ${tree ? `Yaklaşık ${m} içinde verime girer.` : `Yaklaşık ${m} içinde olgunlaşır.`}`;
    case 'fr': return `${crop} ${typeLabel(p.type, lang).toLowerCase()} pour ${grow}. Atouts : ${tags}. ${tree ? `Entre en production en ${m} environ.` : `Environ ${m} jusqu'à maturité.`}`;
    case 'ar': return `${crop} (${typeLabel(p.type, lang)}) مناسب لـ${grow}. أبرز الصفات: ${tags}. ${tree ? `يدخل مرحلة الإنتاج بعد نحو ${m}.` : `يستغرق نحو ${m} حتى النضج.`}`;
    default: return `${typeLabel(p.type, lang)} ${crop.toLowerCase()} for ${grow}. Key traits: ${tags}. ${tree ? `Comes into bearing in about ${m}.` : `About ${m} to maturity.`}`;
  }
}

/* text normalisation for search (accents, Turkish dotless i, Arabic marks) */
export const norm = (s) => String(s || '').toLowerCase().replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ًͯ-ٰٟ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');

/* one lowercase haystack per product with names in every language */
export function haystack(p) {
  const parts = [p.name, p.code, p.type, ...p.tags.flatMap(k => Object.values(TAGS[k])), ...Object.values(CROPS[p.crop].n), ...Object.values(catById(p.cat).n)];
  return norm(parts.join(' | '));
}
