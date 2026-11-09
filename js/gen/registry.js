// Registro degli esercizi generati: un'interfaccia unica usata dalle pagine di esercizio,
// dal simulatore d'esame e dalla riga di comando.
//   make(seed)        → esercizio
//   prompt(ex)        → HTML della consegna
//   fields(ex)        → [{ name, label, placeholder }] campi di risposta
//   grade(ex, values) → { score 0..1, items: [{ label, ok, detail }] }
//   steps(ex)         → procedimento passo-passo (stringhe)
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const single = (mod, label, placeholder) => ({
    fields: (ex) => [{ name: 'a', label: typeof label === 'function' ? label(ex) : label, placeholder }],
    grade: (ex, v) => { const g = mod.grade(ex, v.a); return { score: g.score, items: [{ label: 'Risposta', ok: g.ok, detail: g.ok ? 'Corretto: ' + g.exp + '.' : 'Hai scritto ' + (v.a || '–') + ', era ' + g.exp + '. ' + g.why }] }; },
    steps: (ex) => ex.steps,
  });

  const R = {};
  R.hamming = Object.assign({ id: 'gen:hamming', title: 'Codice di Hamming', src: 'Slide «Memoria centrale a semiconduttore», pag. 8-9; primo compitino 2025, domanda 2',
    make: (seed) => ADE.hamming.gen(seed), prompt: (ex) => '<p>' + esc(ex.text) + '</p>' }, single(ADE.hamming, (ex) => ex.label, '0011 1001'));
  R.disco = Object.assign({ id: 'gen:disco', title: 'Tempi e capacità di un disco', src: 'Slide «Memoria esterna», pag. 9; primo compitino 2025, domanda 3',
    make: (seed) => ADE.disco.gen(seed), prompt: (ex) => ex.html }, single(ADE.disco, (ex) => (ex.type === 'tempo' ? 'Tempo totale (ms)' : 'Capacità (numero e unità)'), 'es. 9,875 oppure 32GB'));
  R.basi = Object.assign({ id: 'gen:basi', title: 'Conversioni di base', src: 'Slide «Notazione binaria, ottale, esadecimale», pag. 1-3',
    make: (seed) => ADE.basi.gen(seed), prompt: (ex) => '<p>' + esc(ex.text) + '</p>' }, single(ADE.basi, 'Risultato', ''));
  R.campi = { id: 'gen:cache-campi', title: 'Campi dell\'indirizzo', src: 'Slide «Esercizi cache 1-4», pag. 1-2',
    make: (seed) => ADE.cache.genFields(seed), prompt: (ex) => '<p>' + esc(ex.text) + '</p>',
    fields: (ex) => ex.asks.map((k) => ({ name: k, label: 'bit di ' + { tag: 'tag', set: ex.cfg.ways === 1 ? 'linea' : 'set', word: 'parola', addr: 'indirizzo' }[k] })),
    grade: (ex, v) => { const g = ADE.cache.gradeFields(ex, v); return { score: g.score, items: g.items.map((i) => ({ label: i.label, ok: i.ok, detail: i.ok ? i.exp + ', corretto.' : 'Hai scritto ' + (i.got || '–') + ', era ' + i.exp + '. ' + i.why })) }; },
    steps: (ex) => ex.steps };

  ADE.exercises = R;
})(typeof globalThis !== 'undefined' ? globalThis : this);
