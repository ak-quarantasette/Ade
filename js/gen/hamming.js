// Codice di Hamming a correzione di errore singolo, con la disposizione delle slide
// «Memorie interne»: posizioni numerate da 1, bit di controllo nelle posizioni potenze di 2,
// dati nelle altre (D1 in posizione 3). Le parole si scrivono con la posizione più alta a sinistra.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;
  const isPow2 = (n) => (n & (n - 1)) === 0;

  /** Numero di bit di controllo K per M bit di dati: il minimo K con 2^K − 1 ≥ M + K. */
  function checkBits(m) { let k = 1; while (2 ** k - 1 < m + k) k++; return k; }

  /** Posizioni (crescenti) occupate dai dati: tutte tranne le potenze di 2. */
  function dataPositions(m) {
    const n = m + checkBits(m), out = [];
    for (let p = 1; p <= n; p++) if (!isPow2(p)) out.push(p);
    return out;
  }

  /** "00111001" (D8…D1) → parola di codice come array indicizzato per posizione (1..N). */
  function encode(dataStr) {
    const m = dataStr.length, k = checkBits(m), n = m + k;
    const word = new Array(n + 1).fill(0);
    const pos = dataPositions(m);
    for (let i = 0; i < m; i++) word[pos[i]] = Number(dataStr[m - 1 - i]); // D1 è il bit più a destra
    for (let j = 0; j < k; j++) {
      const c = 2 ** j;
      let x = 0;
      for (let p = 1; p <= n; p++) if (!isPow2(p) && (p & c)) x ^= word[p];
      word[c] = x;
    }
    return word;
  }

  const wordStr = (word) => word.slice(1).reverse().join('');
  /** Bit di controllo come stringa CK…C1 (es. "0111" = C8 C4 C2 C1). */
  function checks(dataStr) {
    const w = encode(dataStr), k = checkBits(dataStr.length);
    let s = '';
    for (let j = k - 1; j >= 0; j--) s += w[2 ** j];
    return s;
  }
  function parseWord(str) { const b = str.replace(/\s/g, ''); return [0].concat(b.split('').reverse().map(Number)); }
  function extract(word) { let s = ''; for (let p = word.length - 1; p >= 1; p--) if (!isPow2(p)) s += word[p]; return s; }

  /** Sindrome di una parola letta: 0 = nessun errore, altrimenti posizione del bit errato. */
  function syndrome(word) {
    let s = 0;
    for (let p = 1; p < word.length; p++) if (word[p]) s ^= p;
    return s;
  }

  /** Corregge (al più un errore) e restituisce i dati originali. */
  function decode(readStr) {
    const word = parseWord(readStr);
    const s = syndrome(word);
    const fixed = word.slice();
    if (s > 0 && s < word.length) fixed[s] ^= 1;
    return { syndrome: s, kind: s === 0 ? 'nessuno' : isPow2(s) ? 'controllo' : 'dato', data: extract(fixed), corrected: wordStr(fixed) };
  }

  const group = (s) => { const r = s.length % 4; return ((r ? s.slice(0, r) + ' ' : '') + (s.slice(r).match(/.{4}/g) || []).join(' ')).trim(); };
  const clean = (s) => String(s || '').replace(/[^01]/g, '');
  const randBits = (rnd, n) => { let s = ''; for (let i = 0; i < n; i++) s += rnd.int(0, 1); return s; };

  function checkLines(dataStr) {
    const m = dataStr.length, k = checkBits(m), w = encode(dataStr), pos = dataPositions(m), lines = [];
    for (let j = 0; j < k; j++) {
      const c = 2 ** j, terms = [];
      pos.forEach((p, i) => { if (p & c) terms.push('D' + (i + 1) + '=' + w[p]); });
      lines.push('C' + c + ' = XOR dei dati nelle posizioni con il bit ' + c + ' a 1: ' + terms.join(' ⊕ ') + ' = ' + w[c]);
    }
    return lines;
  }

  /**
   * Tre tipi di esercizio, tutti presi dalle prove del corso:
   *  - 'codifica': dati → sequenza memorizzata;
   *  - 'sindrome': parola, bit di controllo memorizzati e ricalcolati → parola letta (compitino 2025, turno I);
   *  - 'decodifica': sequenza letta → messaggio originale (compitino 2025, altro turno).
   */
  function gen(seed, type) {
    const rnd = U.rng(seed);
    type = type || rnd.pick(['codifica', 'sindrome', 'decodifica', 'codifica', 'sindrome', 'decodifica', 'quanti']);
    if (type === 'quanti') {
      // Esercizio 3 del docente: quanti bit di controllo per una parola di M bit.
      const M = rnd.pick([4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]);
      const K = checkBits(M);
      return { type, seed, m: M, k: K, answer: String(K), label: 'Numero di bit di controllo',
        text: 'Quanti bit di controllo sono necessari se il codice a correzione di errore di Hamming viene usato per rilevare errori di bit singoli in una parola di dati a ' + M + ' bit?',
        steps: ['Serve il minimo K tale che 2^K ≥ M + K + 1: bisogna poter indicare quale degli M + K bit è errato, più il caso "nessun errore".',
          'Con K = ' + (K - 1) + ': 2^' + (K - 1) + ' = ' + 2 ** (K - 1) + ' < ' + M + ' + ' + (K - 1) + ' + 1 = ' + (M + K) + ', non basta.',
          'Con K = ' + K + ': 2^' + K + ' = ' + 2 ** K + ' ≥ ' + M + ' + ' + K + ' + 1 = ' + (M + K + 1) + '. Quindi K = ' + K + '.'] };
    }
    const m = type === 'sindrome' ? 8 : rnd.pick([8, 16]);
    const k = checkBits(m), n = m + k;
    const data = randBits(rnd, m);
    const code = encode(data);
    const ex = { type, seed, m, k, n, data };
    const layout = 'Disposizione: ' + n + ' posizioni numerate da 1 (a destra) a ' + n + '; bit di controllo nelle posizioni ' + Array.from({ length: k }, (_, j) => 2 ** j).join(', ') + ', dati nelle altre.';
    if (type === 'codifica') {
      ex.text = 'Si consideri un codice di correzione di Hamming su ' + m + ' bit. Quale sequenza di bit è memorizzata in memoria se si devono memorizzare i seguenti ' + m + ' bit di dati: ' + group(data) + ' ?';
      ex.answer = wordStr(code);
      ex.label = 'Sequenza memorizzata (' + n + ' bit, posizione ' + n + ' a sinistra)';
      ex.steps = ['Bit di controllo necessari: il minimo K con 2^K − 1 ≥ M + K → K = ' + k + ' (' + (2 ** k - 1) + ' ≥ ' + (m + k) + ').', layout]
        .concat(checkLines(data)).concat(['Sequenza completa: ' + group(ex.answer) + '.']);
    } else if (type === 'sindrome') {
      const pos = rnd.next() < 0.15 ? 0 : rnd.int(1, n);
      const stored = checks(data);
      const computed = U.bin(parseInt(stored, 2) ^ pos, k);
      const read = code.slice();
      if (pos && !isPow2(pos)) read[pos] ^= 1;
      ex.stored = stored; ex.computed = computed; ex.pos = pos;
      ex.text = 'Per la parola ' + group(data) + ' i bit di controllo memorizzati sono ' + stored + '. Si supponga che, quando la parola viene letta dalla memoria, i bit di controllo siano calcolati essere ' + computed + '. Quale parola di dati è letta dalla memoria?';
      ex.answer = extract(read);
      ex.label = 'Parola letta (8 bit)';
      ex.steps = ['Sindrome = XOR bit a bit tra i controlli memorizzati e quelli ricalcolati: ' + stored + ' ⊕ ' + computed + ' = ' + U.bin(pos, k) + ' = ' + pos + '.',
        pos === 0 ? 'Sindrome 0: nessun errore, la parola letta è quella originale.'
          : isPow2(pos) ? 'La posizione ' + pos + ' è una potenza di 2, quindi contiene un bit di controllo: l\'errore non tocca i dati, la parola letta è quella originale.'
          : 'La posizione ' + pos + ' contiene il dato D' + (dataPositions(m).indexOf(pos) + 1) + ': la parola letta ha quel bit invertito rispetto all\'originale.',
        layout, 'Parola letta: ' + group(ex.answer) + '.'];
    } else {
      const pos = rnd.next() < 0.15 ? 0 : rnd.int(1, n);
      const read = code.slice();
      if (pos) read[pos] ^= 1;
      ex.read = wordStr(read); ex.pos = pos;
      ex.text = 'Si consideri la seguente sequenza di bit letta da una memoria RAM che implementa il codice di correzione di Hamming: ' + group(ex.read) + ' . Qual è il messaggio originale che era stato scritto in RAM?';
      ex.answer = data;
      ex.label = 'Messaggio originale (' + m + ' bit)';
      const ones = []; for (let p = 1; p <= n; p++) if (read[p]) ones.push(p);
      ex.steps = [layout, 'Sindrome = XOR dei numeri di posizione di tutti i bit a 1 (equivale a ricalcolare i controlli e confrontarli): ' + (ones.join(' ⊕ ') || '0') + ' = ' + pos + '.',
        pos === 0 ? 'Sindrome 0: nessun errore.' : 'Il bit in posizione ' + pos + ' è errato' + (isPow2(pos) ? ' (è un bit di controllo: i dati sono già corretti).' : ': va invertito.'),
        'Si tolgono i bit di controllo (posizioni potenze di 2) e si leggono i dati dalla posizione più alta: ' + group(data) + '.'];
    }
    return ex;
  }

  function grade(ex, answer) {
    if (ex.type === 'quanti') {
      const n = parseInt(String(answer || '').trim(), 10), ok = n === ex.k;
      return { ok, score: ok ? 1 : 0, exp: String(ex.k), why: ok ? '' : n === ex.k - 1 ? 'Con K = ' + n + ' si ha 2^K = ' + 2 ** n + ', che è minore di M + K + 1 = ' + (ex.m + n + 1) + ': hai dimenticato che K compare anche a destra.' : 'Cerca il minimo K con 2^K ≥ M + K + 1.' };
    }
    const got = clean(answer);
    const ok = got === ex.answer;
    let why = '';
    if (!ok) {
      if (got.length !== ex.answer.length) why = 'Servono ' + ex.answer.length + ' bit, ne hai scritti ' + got.length + '.';
      else {
        const diff = []; for (let i = 0; i < got.length; i++) if (got[i] !== ex.answer[i]) diff.push(got.length - i);
        why = 'Differisce nei bit (contando da destra): ' + diff.join(', ') + '.' +
          (ex.type === 'codifica' && diff.every((d) => isPow2(d)) ? ' Sono tutti bit di controllo: i dati sono al posto giusto, ricontrolla gli XOR.' : '') +
          (ex.type === 'sindrome' && got === ex.data && ex.answer !== ex.data ? ' Hai riscritto la parola originale, ma la sindrome indica un bit di dati alterato.' : '');
      }
    }
    return { ok, score: ok ? 1 : 0, why, exp: group(ex.answer) };
  }

  ADE.hamming = { checkBits, dataPositions, encode, checks, wordStr, decode, syndrome, parseWord, gen, grade, group };
})(typeof globalThis !== 'undefined' ? globalThis : this);
