// Generatori di esercizi sulla cache, nel formato degli esercizi del corso:
//  - "campi": divisione dell'indirizzo in tag / set (o linea) / parola (Esercizi cache 1-3);
//  - "traccia": evoluzione di cache e memoria su una sequenza di letture e scritture
//    (Esercizi cache 4-5 e domanda 8 del primo compitino).
// Il simulatore è verificato in tests/cache.test.js contro le soluzioni ufficiali.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;

  /** Calcola linee, set e dimensione dei campi. Parola = 1 byte (vedi ASSUNZIONI.md, A3). */
  function makeConfig(p) {
    const cfg = Object.assign({ addrBits: 12, cacheBytes: 16, blockBytes: 4, ways: 1, repl: 'LRU', write: 'back' }, p);
    cfg.lines = cfg.cacheBytes / cfg.blockBytes;
    cfg.sets = cfg.lines / cfg.ways;
    if (!Number.isInteger(cfg.lines) || !Number.isInteger(cfg.sets) || cfg.sets < 1) throw new Error('configurazione non valida');
    cfg.wordBits = U.log2(cfg.blockBytes);
    cfg.setBits = U.log2(cfg.sets);
    cfg.tagBits = cfg.addrBits - cfg.setBits - cfg.wordBits;
    if (cfg.tagBits < 0) throw new Error('indirizzo troppo corto');
    return cfg;
  }

  function split(cfg, addr) {
    return {
      word: addr & (cfg.blockBytes - 1),
      set: (addr >> cfg.wordBits) & (cfg.sets - 1),
      tag: addr >> (cfg.wordBits + cfg.setBits),
      blockAddr: addr - (addr & (cfg.blockBytes - 1)),
    };
  }

  /**
   * Simula la sequenza di accessi.
   * memory: oggetto { indirizzo: byte } (gli indirizzi assenti valgono 00).
   * accesses: [{ addr, op: 'l' | 's', data }]
   * Regole (dal materiale del corso):
   *  - miss in scrittura gestito con write allocate: prima si carica il blocco, poi si scrive;
   *  - se nel set ci sono linee libere si usa quella di indice minore;
   *  - LRU sostituisce la linea usata meno di recente, FIFO quella caricata per prima;
   *  - write-back: la memoria è aggiornata solo al rimpiazzo di una linea sporca;
   *  - write-through: ogni scrittura va subito anche in memoria.
   */
  function simulate(cfg, memory, accesses) {
    const mem = Object.assign({}, memory);
    const rd = (a) => (mem[a] === undefined ? 0 : mem[a]);
    const cache = [];
    for (let s = 0; s < cfg.sets; s++) {
      cache.push([]);
      for (let w = 0; w < cfg.ways; w++) cache[s].push({ valid: false, tag: 0, data: [], dirty: false, loadedAt: -1, usedAt: -1 });
    }
    const snapshot = () => cache.map((set) => set.map((l) => ({ valid: l.valid, tag: l.tag, data: l.data.slice(), dirty: l.dirty })));
    const steps = [];

    accesses.forEach((acc, i) => {
      const f = split(cfg, acc.addr);
      const set = cache[f.set];
      let way = set.findIndex((l) => l.valid && l.tag === f.tag);
      const hit = way >= 0;
      const step = { i, addr: acc.addr, op: acc.op, data: acc.data, tag: f.tag, set: f.set, word: f.word, blockAddr: f.blockAddr,
        hit, way: -1, evicted: null, usedFree: false, memWrites: [], loaded: null };

      if (!hit) {
        way = set.findIndex((l) => !l.valid);
        if (way >= 0) step.usedFree = true;
        else {
          const key = cfg.repl === 'FIFO' ? 'loadedAt' : 'usedAt';
          way = 0;
          for (let w = 1; w < cfg.ways; w++) if (set[w][key] < set[way][key]) way = w;
          const old = set[way];
          const oldBlock = ((old.tag << cfg.setBits) | f.set) << cfg.wordBits;
          step.evicted = { tag: old.tag, blockAddr: oldBlock, dirty: old.dirty, data: old.data.slice() };
          if (old.dirty) {
            // Write-back: si riscrive in memoria tutto il blocco; "changed" segna i byte davvero diversi.
            old.data.forEach((b, k) => {
              step.memWrites.push({ addr: oldBlock + k, val: b, changed: rd(oldBlock + k) !== b });
              mem[oldBlock + k] = b;
            });
          }
        }
        const line = set[way];
        line.valid = true; line.tag = f.tag; line.dirty = false; line.loadedAt = i;
        line.data = [];
        for (let k = 0; k < cfg.blockBytes; k++) line.data.push(rd(f.blockAddr + k));
        step.loaded = line.data.slice();
      }

      const line = set[way];
      if (acc.op === 's') {
        line.data[f.word] = acc.data;
        if (cfg.write === 'through') {
          mem[acc.addr] = acc.data;
          step.memWrites.push({ addr: acc.addr, val: acc.data, changed: true });
        } else line.dirty = true;
      }
      line.usedAt = i;
      step.way = way;
      step.after = snapshot();
      steps.push(step);
    });
    return { cfg, steps, memory: mem };
  }

  // ---------- Testi ----------

  const policyText = (cfg) =>
    (cfg.ways === 1 ? 'associazione diretta' : 'associazione a ' + cfg.ways + ' vie') +
    ' (politica di rimpiazzo ' + cfg.repl + ', politica di scrittura ' +
    (cfg.write === 'back' ? 'write-back' : 'write-through') + ', miss in scrittura gestiti con write allocate)';

  const lineStr = (l) => (l.valid ? '[' + l.data.map((b) => U.hex(b)).join(' ') + ']' + (l.dirty ? '*' : '') : '(vuota)');

  /** Spiegazione in italiano di un passo della traccia. */
  function explainStep(cfg, st) {
    const out = [];
    const a = U.bin(st.addr, cfg.addrBits);
    const tagS = a.slice(0, cfg.tagBits), setS = a.slice(cfg.tagBits, cfg.tagBits + cfg.setBits), wS = a.slice(cfg.tagBits + cfg.setBits);
    const where = cfg.ways === 1 ? 'linea ' + st.set : 'set ' + st.set;
    out.push('Indirizzo ' + U.hex(st.addr, 3) + ' = ' + tagS + (setS ? ' | ' + setS : '') + ' | ' + wS +
      ' → tag ' + tagS + (setS ? ', ' + where : '') + ', parola ' + st.word + ' del blocco ' + U.hex(st.blockAddr, 3) + '.');
    if (st.hit) {
      out.push('Hit: ' + (cfg.ways === 1 ? 'la linea ' + st.set : 'la linea ' + st.way + ' del set ' + st.set) + ' è valida e ha lo stesso tag.');
    } else {
      if (st.usedFree) out.push('Miss: nessuna linea ' + (cfg.ways === 1 ? '' : 'del set ') + 'contiene questo tag. C\'è una linea libera: si usa ' + (cfg.ways === 1 ? 'la linea ' + st.set : 'la linea ' + st.way + ' (indice minore tra le libere)') + '.');
      else {
        out.push('Miss: ' + (cfg.ways === 1
          ? 'la linea ' + st.set + ' contiene un altro blocco (tag diverso), che va rimpiazzato.'
          : 'il set è pieno e nessun tag coincide. ' + cfg.repl + ' sceglie la linea ' + st.way +
            (cfg.repl === 'LRU' ? ', usata meno di recente.' : ', caricata per prima.')));
        if (st.evicted.dirty) out.push('La linea rimpiazzata è sporca: con write-back il blocco ' + U.hex(st.evicted.blockAddr, 3) + ' viene ricopiato in memoria prima di essere sovrascritto.');
        else if (cfg.write === 'back') out.push('La linea rimpiazzata non è sporca: nessuna scrittura in memoria.');
      }
      out.push('Si carica il blocco ' + U.hex(st.blockAddr, 3) + ': [' + st.loaded.map((b) => U.hex(b)).join(' ') + ']' + (st.op === 's' ? ' (write allocate: prima si carica, poi si scrive).' : '.'));
    }
    if (st.op === 's') {
      out.push('Scrittura di ' + U.hex(st.data) + ' nella parola ' + st.word + ': ' +
        (cfg.write === 'back' ? 'solo in cache, la linea diventa sporca (*).' : 'in cache e subito in memoria (write-through).'));
    }
    return out;
  }

  // ---------- Generatore "traccia" ----------

  const MEM_LO = 0x100, MEM_HI = 0x127;

  function genTrace(seed, opts) {
    opts = opts || {};
    const rnd = U.rng(seed);
    const combos = [];
    for (const blockBytes of [2, 4, 8]) for (const ways of [1, 2]) {
      if (16 / blockBytes / ways >= 2 || ways === 1) combos.push({ blockBytes, ways });
    }
    // Riprova con semi derivati finché la sequenza non è "interessante":
    // almeno 2 hit, almeno 1 rimpiazzo, e con write-back almeno 1 riscrittura in memoria.
    for (let attempt = 0; attempt < 500; attempt++) {
      const c = opts.blockBytes ? { blockBytes: opts.blockBytes, ways: opts.ways } : rnd.pick(combos);
      const cfg = makeConfig({
        blockBytes: c.blockBytes, ways: c.ways,
        repl: opts.repl || (c.ways === 1 ? 'FIFO' : rnd.pick(['LRU', 'FIFO'])),
        write: opts.write || rnd.pick(['back', 'back', 'through']),
      });
      const memory = {};
      for (let a = MEM_LO; a <= MEM_HI; a++) memory[a] = rnd.next() < 0.25 ? 0 : rnd.int(1, 255);
      const nBlocks = (MEM_HI + 1 - MEM_LO) / cfg.blockBytes;
      const pool = [];
      while (pool.length < Math.min(5, nBlocks)) {
        const b = MEM_LO + rnd.int(0, nBlocks - 1) * cfg.blockBytes;
        if (!pool.includes(b)) pool.push(b);
      }
      const accesses = [];
      for (let i = 0; i < 8; i++) {
        const addr = rnd.pick(pool) + rnd.int(0, cfg.blockBytes - 1);
        const write = i < 2 ? rnd.next() < 0.7 : rnd.next() < 0.3;
        accesses.push(write ? { addr, op: 's', data: rnd.int(1, 255) } : { addr, op: 'l' });
      }
      const sim = simulate(cfg, memory, accesses);
      const hits = sim.steps.filter((s) => s.hit).length;
      const evictions = sim.steps.filter((s) => s.evicted).length;
      const writes = accesses.filter((a) => a.op === 's').length;
      const memW = sim.steps.filter((s) => s.memWrites.length).length;
      if (hits >= 2 && hits <= 5 && evictions >= 1 && writes >= 2 && memW >= 1) {
        return { type: 'traccia', seed, cfg, memory, accesses, sim, text: traceText(cfg) };
      }
    }
    throw new Error('generazione fallita per il seme ' + seed);
  }

  function traceText(cfg) {
    return 'Si assuma che la dimensione di parola coincida con un byte, e la presenza di una cache di ampiezza ' +
      cfg.cacheBytes + 'B, dimensione di blocco ' + cfg.blockBytes + 'B, inizialmente vuota, e ad ' + policyText(cfg) +
      '. Gli indirizzi sono di ' + cfg.addrBits + ' bit. Si mostri come cambiano il contenuto della cache e quello della memoria.';
  }

  /** Legge "M[11E]=90, 11F=AE" → Map(0x11E → 0x90, ...). Stringa vuota, "/" o "-" = nessuna modifica. */
  function parseMem(str) {
    const m = new Map();
    const s = (str || '').trim();
    if (!s || s === '/' || s === '-') return m;
    for (const part of s.split(/[,;\n]+/)) {
      const r = /^\s*(?:M\s*\[)?\s*([0-9a-f]+)\s*\]?\s*=\s*([0-9a-f]{1,2})\s*$/i.exec(part);
      if (!r) return null; // formato non riconosciuto
      m.set(parseInt(r[1], 16), parseInt(r[2], 16));
    }
    return m;
  }

  const sameMap = (m, arr) => m.size === arr.length && arr.every((w) => m.get(w.addr) === w.val);

  /**
   * Corregge la risposta alla traccia.
   * answers: { tag, set, word, sets, steps: [{ hit: bool, set: n, way: n, mem: 'M[..]=..' }] }
   * from: indice del primo passo da correggere (per gli esercizi guidati).
   * Restituisce i punti ottenuti e, per ogni errore, quale passaggio è sbagliato e perché.
   */
  function gradeTrace(ex, answers, from) {
    const { cfg, sim } = ex;
    from = from || 0;
    const res = { fields: [], steps: [], points: 0, max: 0 };
    const chk = (label, got, exp, why) => {
      const ok = Number(got) === exp;
      res.max++; if (ok) res.points++;
      res.fields.push({ label, ok, got, exp, why });
    };
    if (from === 0) {
      chk('bit di parola', answers.word, cfg.wordBits, 'Il blocco è di ' + cfg.blockBytes + 'B = 2^' + cfg.wordBits + ' byte, e la parola è un byte: servono ' + cfg.wordBits + ' bit per scegliere la parola nel blocco.');
      chk(cfg.ways === 1 ? 'bit di linea' : 'bit di set', answers.set, cfg.setBits,
        'Linee = ' + cfg.cacheBytes + 'B / ' + cfg.blockBytes + 'B = ' + cfg.lines + (cfg.ways > 1 ? '; set = ' + cfg.lines + ' / ' + cfg.ways + ' vie = ' + cfg.sets : '') + ' = 2^' + cfg.setBits + '.');
      chk('bit di tag', answers.tag, cfg.tagBits, 'Tag = bit totali − altri campi = ' + cfg.addrBits + ' − ' + cfg.setBits + ' − ' + cfg.wordBits + ' = ' + cfg.tagBits + '.');
      chk(cfg.ways === 1 ? 'numero di linee' : 'numero di set', answers.sets, cfg.sets, 'Vedi sopra: ' + cfg.sets + '.');
    }
    sim.steps.forEach((st, i) => {
      if (i < from) return;
      const a = (answers.steps && answers.steps[i]) || {};
      const errs = [];
      const full = st.memWrites, changed = st.memWrites.filter((w) => w.changed);
      const got = parseMem(a.mem);
      const hitOk = a.hit === st.hit;
      const setOk = Number(a.set) === st.set;
      const wayOk = cfg.ways === 1 || Number(a.way) === st.way;
      // Per il write-back il materiale del corso riporta a volte tutto il blocco, a volte solo
      // i byte cambiati (vedi ASSUNZIONI.md, A4): si accettano entrambe le forme.
      const memOk = !!got && (sameMap(got, full) || sameMap(got, changed));
      if (!hitOk) errs.push('Hit/miss: era ' + (st.hit ? 'hit' : 'miss') + '. ' + (st.hit
        ? 'Il blocco ' + U.hex(st.blockAddr, 3) + ' era già in cache: confronta il tag con quello della linea, non l\'indirizzo intero.'
        : (cfg.ways === 1 ? 'La linea ' + st.set + ' non conteneva' : 'Nessuna linea del set ' + st.set + ' conteneva') + ' questo tag in quel momento.'));
      if (!setOk) errs.push((cfg.ways === 1 ? 'Linea' : 'Set') + ': era ' + st.set + '. Si legge dai ' + cfg.setBits + ' bit che stanno tra tag e parola.');
      if (!wayOk) errs.push('Linea nel set: era ' + st.way + '. ' + (st.hit ? 'È la linea che contiene già il blocco.' : st.usedFree ? 'Tra le linee libere si prende quella di indice minore.' : cfg.repl + ' sceglie ' + (cfg.repl === 'LRU' ? 'la linea usata meno di recente (conta anche l\'ultimo hit).' : 'la linea caricata per prima (gli hit non contano).')));
      if (!memOk) errs.push('Memoria: ' + (got === null ? 'formato non riconosciuto (usa M[ind]=byte, separati da virgola). ' : '') + 'attesa ' + memStr(st) + '. ' + (cfg.write === 'back'
        ? (full.length ? 'Qui viene rimpiazzata una linea sporca, quindi il suo blocco torna in memoria.' : 'Con write-back la memoria cambia solo quando si rimpiazza una linea sporca.')
        : (full.length ? 'Con write-through ogni scrittura va subito anche in memoria.' : 'Le letture non modificano la memoria.')));
      const parts = [hitOk, setOk, wayOk, memOk];
      res.max += parts.length;
      res.points += parts.filter(Boolean).length;
      res.steps.push({ i, ok: errs.length === 0, errs });
    });
    // Punteggio severo per lo scheduler: un passo conta solo se è giusto in ogni sua parte
    // (hit/miss, posizione, memoria). I "punti" restano come dettaglio per il feedback.
    const units = res.fields.length + res.steps.length;
    res.score = units ? (res.fields.filter((f) => f.ok).length + res.steps.filter((s) => s.ok).length) / units : 0;
    return res;
  }

  function memStr(st) {
    return st.memWrites.length ? st.memWrites.map((w) => 'M[' + U.hex(w.addr, 3) + ']=' + U.hex(w.val)).join(', ') : 'nessuna modifica (/)';
  }

  // ---------- Generatore "campi" ----------

  function genFields(seed) {
    const rnd = U.rng(seed);
    const wordBits = rnd.int(4, 7);
    const ways = rnd.pick([1, 2, 4, 8]);
    const setBits = rnd.int(2, 8);
    const addrBits = rnd.pick([16, 18, 20, 24, 32]);
    const cfg = makeConfig({ addrBits, blockBytes: 2 ** wordBits, ways, cacheBytes: 2 ** (wordBits + setBits) * ways });
    // Variante inversa (come l'Esercizio 2): dato il tag, trovare la memoria massima.
    const inverse = rnd.next() < 0.3;
    const assoc = ways === 1 ? 'associazione diretta' : 'associazione a gruppi a ' + ways + ' vie (' + ways + '-way set associative)';
    const text = inverse
      ? 'Si consideri una cache di ' + U.size(cfg.cacheBytes) + ' con ' + assoc + ' e dimensione di linea di ' + U.size(cfg.blockBytes) +
        '. Il campo tag è di ' + cfg.tagBits + ' bit e la parola è di un byte. Quanti bit ha un indirizzo di memoria, e quanti bit hanno i campi ' + (ways === 1 ? 'linea' : 'set') + ' e parola?'
      : 'Si consideri una cache di ' + U.size(cfg.cacheBytes) + ' con ' + assoc + ' in congiunzione con una memoria centrale di ' + U.size(2 ** addrBits) +
        '. Un blocco è di ' + U.size(cfg.blockBytes) + ' e la parola è di un byte. In quali campi è suddiviso un indirizzo di memoria, e di quanti bit ciascuno?';
    const sizeExp = Math.log2(cfg.cacheBytes);
    const steps = [
      inverse
        ? 'Il numero di bit dell\'indirizzo è la somma dei campi: va trovata la dimensione di ' + (ways === 1 ? 'linea' : 'set') + ' e parola.'
        : 'Memoria di ' + U.size(2 ** addrBits) + ' = 2^' + addrBits + ' byte → indirizzi di ' + addrBits + ' bit.',
      'Blocco di ' + U.size(cfg.blockBytes) + ' = 2^' + wordBits + ' byte → campo parola di ' + wordBits + ' bit.',
      'Cache di ' + U.size(cfg.cacheBytes) + ' = 2^' + sizeExp + ' byte; ogni linea contiene un blocco → 2^' + sizeExp + ' / 2^' + wordBits + ' = 2^' + (sizeExp - wordBits) + ' linee.',
      ways === 1
        ? 'Associazione diretta: il campo linea ha ' + setBits + ' bit.'
        : 'Ogni set contiene ' + ways + ' = 2^' + Math.log2(ways) + ' linee → 2^' + (sizeExp - wordBits) + ' / 2^' + Math.log2(ways) + ' = 2^' + setBits + ' set → campo set di ' + setBits + ' bit.',
      inverse
        ? 'Indirizzo = tag + ' + (ways === 1 ? 'linea' : 'set') + ' + parola = ' + cfg.tagBits + ' + ' + setBits + ' + ' + wordBits + ' = ' + addrBits + ' bit (memoria massima ' + U.size(2 ** addrBits) + ').'
        : 'Tag = ' + addrBits + ' − ' + setBits + ' − ' + wordBits + ' = ' + cfg.tagBits + ' bit.',
    ];
    return { type: 'campi', seed, cfg, inverse, text, steps,
      asks: inverse ? ['addr', 'set', 'word'] : ['tag', 'set', 'word'],
      solution: { tag: cfg.tagBits, set: setBits, word: wordBits, addr: addrBits } };
  }

  function gradeFields(ex, answers) {
    const names = { tag: 'tag', set: ex.cfg.ways === 1 ? 'linea' : 'set', word: 'parola', addr: 'indirizzo' };
    const why = { addr: 0, word: 1, set: 3, tag: 4 };
    const items = ex.asks.map((k) => {
      const ok = Number(answers[k]) === ex.solution[k];
      return { key: k, label: 'bit di ' + names[k], ok, got: answers[k], exp: ex.solution[k], why: ex.steps[k === 'addr' ? 4 : why[k]] };
    });
    const points = items.filter((x) => x.ok).length;
    return { items, points, max: items.length, score: points / items.length };
  }

  ADE.cache = { makeConfig, split, simulate, explainStep, genTrace, gradeTrace, parseMem, memStr, lineStr, policyText, genFields, gradeFields };
})(typeof globalThis !== 'undefined' ? globalThis : this);
