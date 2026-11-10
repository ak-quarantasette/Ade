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

// ---- Seconda parte ----
(function (root) {
  const ADE = root.ADE, R = ADE.exercises, A = ADE.aritmetica, P = ADE.pipeline;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const AP = 'Appunti «AdE semplice (per davvero)», pag. ';
  const listing = (prog) => '<pre class="formula">' + prog.map((i) => esc(P.text(i))).join('\n') + '</pre>';

  R.c2 = { id: 'gen:c2', title: 'Complemento a 2', src: AP + '97-102',
    make: (seed) => A.genC2(seed), prompt: (ex) => '<p>' + esc(ex.text) + '</p>',
    fields: (ex) => (ex.type === 'somma' ? [{ name: 'a', label: 'Risultato (' + ex.n + ' bit)' }, { name: 'o', label: 'Overflow? (sì/no)', wide: false }] : [{ name: 'a', label: ex.type === 'decodifica' ? 'Valore decimale' : 'Bit (' + ex.n + ')' }]),
    grade: (ex, v) => A.gradeC2(ex, v), steps: (ex) => ex.steps };

  R.ieee = { id: 'gen:ieee', title: 'Virgola mobile IEEE 754', src: 'Esempio di compitino seconda parte 2025/26, es2; ' + AP + '109',
    make: (seed) => A.genIEEE(seed), prompt: (ex) => '<p>' + esc(ex.text) + '</p>',
    fields: (ex) => (ex.type === 'decodifica' ? [{ name: 'a', label: 'Valore decimale' }] : [{ name: 's', label: 'Segno (1 bit)', wide: false }, { name: 'e', label: 'Esponente (8 bit)' }, { name: 'f', label: 'Mantissa (23 bit, zeri finali facoltativi)' }]),
    grade: (ex, v) => A.gradeIEEE(ex, v), steps: (ex) => ex.steps };

  R.conta = { id: 'gen:conta', title: 'Cicli risparmiati con il forwarding', src: 'Esempio di compitino seconda parte 2025/26, es3',
    make: (seed) => P.genCount(seed),
    prompt: (ex) => '<p>Sia data la seguente sequenza di istruzioni RISC-V e si consideri la pipeline a 5 stadi vista a lezione, con possibilità di scrittura e successiva lettura dei registri in uno stesso ciclo di clock:</p>' + listing(ex.prog) +
      '<p>Quanti cicli di clock si risparmiano usando i circuiti di data forwarding rispetto alla versione senza data forwarding?</p>',
    fields: () => [{ name: 'a', label: 'Cicli risparmiati', wide: false }],
    grade: (ex, v) => { const got = Number(v.a), ok = v.a !== '' && got === ex.answer;
      return { score: ok ? 1 : 0, items: [{ label: 'Risposta', ok, detail: ok ? 'Corretto: ' + ex.answer + '.' : 'Hai scritto ' + (v.a || '–') + ', erano ' + ex.answer + ' (' + ex.none.cycles + ' cicli senza forwarding, ' + ex.sch.cycles + ' con). ' +
        (got === ex.none.cycles - ex.prog.length - 4 ? 'Hai contato tutti gli stalli senza forwarding, ma con il forwarding ne resta uno dopo ogni LW usata subito.' : 'Disegna i due diagrammi e confronta l\'ultimo ciclo di WB.') }] }; },
    steps: (ex) => ['Senza forwarding un\'istruzione resta in ID finché chi produce il dato non arriva in WB (scrittura e lettura nello stesso ciclo): ' + ex.none.cycles + ' cicli in totale.',
      'Con forwarding resta uno stallo solo quando si usa subito il risultato di una LW: ' + ex.sch.cycles + ' cicli in totale.', 'Risparmio: ' + ex.none.cycles + ' − ' + ex.sch.cycles + ' = ' + ex.answer + '.'],
    solution: (ex) => '<p>Senza forwarding (' + ex.none.cycles + ' cicli):</p>' + P.tableHtml(ex.prog, ex.none) + '<p>Con forwarding (' + ex.sch.cycles + ' cicli):</p>' + P.tableHtml(ex.prog, ex.sch) + '<p>Risparmio: <strong>' + ex.answer + '</strong> cicli. In rosso gli stadi ripetuti (stalli).</p>' };

  const FW = [['', 'nessuno'], ['EX/MEM', 'EX/MEM'], ['MEM/WB', 'MEM/WB']];
  R.pipeline = { id: 'gen:pipeline', title: 'Evoluzione della pipeline con forwarding', src: 'Esempio di compitino seconda parte 2025/26, es8',
    make: (seed) => P.gen(seed),
    prompt: (ex) => '<p>Sia data la seguente sequenza di istruzioni assembler. Si consideri la pipeline a 5 stadi vista a lezione, con data forwarding e con scrittura e successiva lettura dei registri nello stesso ciclo di clock. Assumendo falsa la condizione di ogni salto, mostrare come evolve la pipeline, indicando stalli e circuiti di by-pass.</p>' + listing(ex.prog) +
      '<p class="small muted">Disegna il diagramma su carta, poi riporta per ogni istruzione: quanti cicli di stallo subisce (ID ripetuti per una sua dipendenza), in quale ciclo fa WB, e da quale registro di pipeline arriva per forwarding ciascun operando.</p>',
    fields: () => [],
    form: (ex) => '<div class="scroll"><table><thead><tr><th>Istruzione</th><th>stalli</th><th>ciclo di WB</th><th>1º operando (rs1)</th><th>2º operando (rs2)</th></tr></thead><tbody>' + ex.sch.rows.map((r, i) => {
      const sel = (port) => (P.OPS[r.ins.op].src(r.ins).some((x) => x[0] === port) ? '<select name="p' + i + port + '" aria-label="Istruzione ' + (i + 1) + ', ' + port + '">' + FW.map(([v, l]) => '<option value="' + v + '">' + l + '</option>').join('') + '</select>' : '<span class="muted">–</span>');
      return '<tr><td class="mono">' + esc(P.text(r.ins)) + '</td><td><input class="num" name="p' + i + 'st" inputmode="numeric" aria-label="Istruzione ' + (i + 1) + ', stalli"></td><td><input class="num" name="p' + i + 'wb" inputmode="numeric" aria-label="Istruzione ' + (i + 1) + ', ciclo di WB"></td><td>' + sel('rs1') + '</td><td>' + sel('rs2') + '</td></tr>'; }).join('') + '</tbody></table></div>',
    grade: (ex, v) => P.grade(ex, ex.sch.rows.map((_, i) => ({ stalls: v['p' + i + 'st'], wb: v['p' + i + 'wb'], rs1: v['p' + i + 'rs1'] || '', rs2: v['p' + i + 'rs2'] || '' }))),
    steps: (ex) => P.comments(ex.prog, ex.sch).map((c) => 'Ciclo ' + c.cycle + ', ' + c.instr + ', x' + c.reg + ': ' + c.action + '.'),
    solution: (ex) => P.tableHtml(ex.prog, ex.sch) + '<div class="scroll"><table><thead><tr><th>Ciclo</th><th>Istr.</th><th>Dipendenza</th><th>Unità</th><th>Condizione verificata</th><th>Stallo / forwarding</th></tr></thead><tbody>' +
      P.comments(ex.prog, ex.sch).map((c) => '<tr><td>' + c.cycle + '</td><td>' + c.instr + '</td><td>RAW x' + c.reg + '</td><td>' + c.unit + '</td><td class="mono small">' + esc(c.cond) + '</td><td>' + esc(c.action) + '</td></tr>').join('') + '</tbody></table></div>' +
      '<p class="small muted">Le dipendenze che non compaiono sono risolte dal banco dei registri: chi produce il dato è già in WB quando l\'istruzione è in ID.</p>' };
})(typeof globalThis !== 'undefined' ? globalThis : this);
