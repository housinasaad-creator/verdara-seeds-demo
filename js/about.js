/* About: counters (real numbers from the catalogue data) and a floating collage of crop emblems. */
import { t } from './layout.js?v=10191953';
import { CATS, PRODUCTS } from './data.js?v=10191953';
import { LANGS } from './core.js?v=10191953';
import { counters, art, reveal } from './motion.js?v=10191953';

const stats = [[PRODUCTS.length, 'a.stat1'], [CATS.length, 'a.stat2'], [LANGS.length, 'a.stat3'], [3, 'a.stat4']];
function build() {
  document.getElementById('stats').innerHTML = stats.map(([n, k]) => `<div><b data-count="${n}">0</b><span>${t(k)}</span></div>`).join('');
  counters();
}
document.getElementById('coll').innerHTML = ['tomato', 'wheat', 'sunflower', 'lettuce', 'melon', 'carrot'].map(id => `<img data-emblem="${id}" data-size="320" alt="" width="160" height="160">`).join('');
build(); art(); reveal();
window.addEventListener('langchange', build);
