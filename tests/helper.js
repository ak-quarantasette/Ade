// Carica gli script del sito nell'ordine in cui li carica index.html
// e restituisce lo spazio dei nomi globale ADE.
const path = require('node:path');
for (const f of ['core/util', 'core/scheduler', 'core/state', 'core/plan', 'gen/cache', 'gen/hamming', 'gen/disco', 'gen/basi', 'gen/registry', 'data/course', 'data/cache', 'data/intro', 'data/memorie', 'data/esterne']) {
  require(path.join(__dirname, '..', 'js', f + '.js'));
}
module.exports = globalThis.ADE;
