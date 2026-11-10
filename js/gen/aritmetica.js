// Seconda parte: complemento a 2 e virgola mobile IEEE 754 a precisione singola.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;
  const clean = (s) => String(s || '').replace(/[^01]/g, '');

  // ---------- Complemento a 2 ----------
  const toC2 = (v, n) => U.bin(((v % 2 ** n) + 2 ** n) % 2 ** n, n);
  const fromC2 = (bits) => { const u = parseInt(bits, 2); return bits[0] === '1' ? u - 2 ** bits.length : u; };
  const invert = (b) => b.split('').map((x) => (x === '1' ? '0' : '1')).join('');

  function genC2(seed, type) {
    const rnd = U.rng(seed);
    type = type || rnd.pick(['codifica', 'decodifica', 'somma']);
    const n = type === 'somma' ? rnd.pick([4, 5, 6]) : rnd.pick([5, 6, 8]);
    const lo = -(2 ** (n - 1)), hi = 2 ** (n - 1) - 1;
    const ex = { kind: 'c2', type, seed, n };
    if (type === 'codifica') {
      const v = -rnd.int(1, -lo);
      ex.v = v; ex.answer = toC2(v, n);
      ex.text = 'Rappresenta ' + v + ' in complemento a 2 su ' + n + ' bit.';
      const abs = U.bin(-v, n);
      ex.steps = ['Valore assoluto in binario su ' + n + ' bit: ' + abs + '.', 'Complemento bit a bit: ' + invert(abs) + '.', 'Somma 1: ' + ex.answer + '.',
        'Controllo: il bit più a sinistra pesa −' + 2 ** (n - 1) + ', gli altri sono positivi → ' + fromC2(ex.answer) + '.'];
    } else if (type === 'decodifica') {
      const v = rnd.next() < 0.75 ? -rnd.int(1, -lo) : rnd.int(0, hi);
      ex.bits = toC2(v, n); ex.answer = v;
      ex.text = 'Quale numero decimale rappresenta ' + ex.bits + ' in complemento a 2 su ' + n + ' bit?';
      ex.steps = v >= 0 ? ['Il bit più a sinistra è 0: il numero è positivo, si legge come binario normale → ' + v + '.']
        : ['Il bit più a sinistra è 1: il numero è negativo.', 'Complemento bit a bit: ' + invert(ex.bits) + '; più 1: ' + U.bin(-v, n) + ' = ' + -v + '.', 'Quindi il numero è ' + v + '. (Oppure: −' + 2 ** (n - 1) + ' + ' + (v + 2 ** (n - 1)) + '.)'];
    } else {
      const a = rnd.int(lo, hi), b = rnd.int(lo, hi), sum = a + b;
      ex.a = a; ex.b = b; ex.A = toC2(a, n); ex.B = toC2(b, n);
      ex.answer = toC2(sum, n); ex.overflow = sum < lo || sum > hi;
      ex.text = 'Somma in complemento a 2 su ' + n + ' bit: ' + ex.A + ' + ' + ex.B + '. Scrivi il risultato su ' + n + ' bit e indica se c\'è overflow.';
      ex.steps = ['Operandi: ' + ex.A + ' = ' + a + ', ' + ex.B + ' = ' + b + '.', 'Somma binaria ignorando il riporto finale: ' + ex.answer + '.',
        ex.overflow ? 'Overflow: gli operandi hanno lo stesso segno e il risultato ha segno opposto (' + sum + ' non sta tra ' + lo + ' e ' + hi + ').'
          : 'Nessun overflow: ' + (a < 0 !== b < 0 ? 'gli operandi hanno segno diverso, l\'overflow è impossibile.' : 'il risultato ha lo stesso segno degli operandi.') + ' Risultato = ' + sum + '.'];
    }
    return ex;
  }

  function gradeC2(ex, v) {
    const items = [];
    if (ex.type === 'decodifica') {
      const got = parseInt(String(v.a || '').replace('−', '-'), 10);
      const ok = got === ex.answer;
      items.push({ label: 'Valore', ok, detail: ok ? 'Corretto: ' + ex.answer + '.' : 'Hai scritto ' + (v.a || '–') + ', era ' + ex.answer + '. ' +
        (got === parseInt(ex.bits, 2) ? 'Hai letto il numero come senza segno: il bit più a sinistra pesa −' + 2 ** (ex.n - 1) + '.' : got === -ex.answer ? 'Il modulo è giusto, il segno no.' : got === -(parseInt(invert(ex.bits), 2)) ? 'Hai fatto solo il complemento: manca il +1.' : '') });
    } else {
      const got = clean(v.a), ok = got === ex.answer;
      items.push({ label: 'Bit', ok, detail: ok ? 'Corretto: ' + ex.answer + '.' : 'Hai scritto ' + (got || '–') + ', era ' + ex.answer + '. ' +
        (got.length !== ex.n ? 'Servono esattamente ' + ex.n + ' bit.' : ex.type === 'codifica' && got === invert(U.bin(-ex.v, ex.n)) ? 'Hai fatto solo il complemento: manca il +1.' : ex.type === 'codifica' && got === '1' + U.bin(-ex.v, ex.n).slice(1) ? 'Questa è la rappresentazione in modulo e segno, non in complemento a 2.' : '') });
      if (ex.type === 'somma') {
        const o = String(v.o || '').toLowerCase().startsWith('s'), ok2 = o === ex.overflow;
        items.push({ label: 'Overflow', ok: ok2, detail: ok2 ? (ex.overflow ? 'Sì, corretto.' : 'No, corretto.') : 'Era ' + (ex.overflow ? 'sì' : 'no') + '. C\'è overflow solo se due operandi dello stesso segno danno un risultato di segno opposto.' });
      }
    }
    return { score: items.filter((i) => i.ok).length / items.length, items };
  }

  // ---------- IEEE 754 singola precisione ----------
  /** Numero → { sign, exp, frac } (stringhe di bit), tramite la rappresentazione nativa. */
  function encodeIEEE(x) {
    const buf = new DataView(new ArrayBuffer(4));
    buf.setFloat32(0, x);
    const bits = U.bin(buf.getUint32(0), 32);
    return { sign: bits[0], exp: bits.slice(1, 9), frac: bits.slice(9), bits };
  }
  function decodeIEEE(bits) {
    const buf = new DataView(new ArrayBuffer(4));
    buf.setUint32(0, parseInt(bits, 2));
    return buf.getFloat32(0);
  }
  /** Parte intera e frazionaria in binario (frazione esatta, senza zeri finali). */
  function binParts(abs) {
    const int = Math.floor(abs);
    let f = abs - int, fr = '';
    while (f > 0 && fr.length < 30) { f *= 2; if (f >= 1) { fr += '1'; f -= 1; } else fr += '0'; }
    return { int: int.toString(2), fr };
  }
  const it = (x) => String(x).replace('.', ',');

  function genIEEE(seed, type) {
    const rnd = U.rng(seed);
    type = type || rnd.pick(['codifica', 'codifica', 'decodifica']);
    // Numeri con frazione binaria finita, come nell'esempio di compitino (−7,28515625).
    const den = 2 ** rnd.int(1, 8);
    const abs = rnd.int(1, 60) + rnd.int(1, den - 1) / den;
    const x = (rnd.next() < 0.6 ? -1 : 1) * (rnd.next() < 0.2 ? abs / 64 : abs);
    const e = encodeIEEE(x);
    const p = binParts(Math.abs(x));
    const expo = parseInt(e.exp, 2) - 127;
    const mant = (p.int === '0' ? p.fr.replace(/^0*1/, '') : p.int.slice(1) + p.fr);
    const ex = { kind: 'ieee', type, seed, x, enc: e, expo };
    const s = ['Segno: il numero è ' + (x < 0 ? 'negativo → bit di segno 1' : 'positivo → bit di segno 0') + '.',
      'In binario: ' + it(Math.abs(x)) + ' = ' + p.int + ',' + p.fr + '.',
      'Normalizzazione: 1,' + (mant || '0') + ' · 2^' + expo + ' (la virgola si sposta di ' + Math.abs(expo) + ' posizioni verso ' + (expo >= 0 ? 'sinistra' : 'destra') + ').',
      'Esponente polarizzato: ' + expo + ' + 127 = ' + (expo + 127) + ' = ' + e.exp + '.',
      'Mantissa: i bit dopo la virgola (l\'1 iniziale è implicito), completati con zeri fino a 23: ' + e.frac + '.',
      'Risultato: ' + e.sign + ' ' + e.exp + ' ' + e.frac + '.'];
    if (type === 'codifica') {
      ex.text = 'Si consideri il numero ' + it(x) + '. Qual è la sua rappresentazione in virgola mobile a singola precisione (IEEE 754)?';
      ex.steps = s;
    } else {
      ex.text = 'Quale numero decimale è rappresentato da questa sequenza IEEE 754 a singola precisione? ' + e.sign + ' ' + e.exp + ' ' + e.frac;
      ex.steps = ['Segno ' + e.sign + ' → ' + (x < 0 ? 'negativo' : 'positivo') + '.', 'Esponente ' + e.exp + ' = ' + (expo + 127) + '; tolta la polarizzazione: ' + (expo + 127) + ' − 127 = ' + expo + '.',
        'Mantissa con l\'1 implicito: 1,' + (mant || '0') + '.', 'Valore: 1,' + (mant || '0') + ' · 2^' + expo + ' = ' + p.int + ',' + p.fr + ' in binario = ' + it(Math.abs(x)) + '.', 'Risultato: ' + it(x) + '.'];
    }
    return ex;
  }

  function gradeIEEE(ex, v) {
    const e = ex.enc, items = [];
    if (ex.type === 'decodifica') {
      const got = parseFloat(String(v.a || '').replace(',', '.').replace('−', '-'));
      const ok = Math.abs(got - ex.x) < 1e-9;
      items.push({ label: 'Valore', ok, detail: ok ? 'Corretto: ' + it(ex.x) + '.' : 'Hai scritto ' + (v.a || '–') + ', era ' + it(ex.x) + '. ' +
        (Math.abs(got + ex.x) < 1e-9 ? 'Il modulo è giusto: ricontrolla il bit di segno.' : Math.abs(Math.abs(got) - Math.abs(ex.x) * 2) < 1e-9 || Math.abs(Math.abs(got) * 2 - Math.abs(ex.x)) < 1e-9 ? 'Sei fuori di un fattore 2: ricontrolla l\'esponente (polarizzazione 127).' : 'Ricorda l\'1 implicito prima della virgola.') });
    } else {
      const sg = clean(v.s), xp = clean(v.e), fr = clean(v.f);
      items.push({ label: 'Segno', ok: sg === e.sign, detail: sg === e.sign ? 'Corretto.' : 'Era ' + e.sign + ': 1 per i negativi, 0 per i positivi.' });
      const expGot = parseInt(xp || '0', 2);
      items.push({ label: 'Esponente', ok: xp === e.exp, detail: xp === e.exp ? 'Corretto: ' + e.exp + '.' : 'Hai scritto ' + (xp || '–') + ', era ' + e.exp + ' (' + (ex.expo + 127) + '). ' +
        (xp.length !== 8 ? 'Servono 8 bit.' : expGot === ex.expo + 128 ? 'Hai sommato 128: la polarizzazione è 2^7 − 1 = 127.' : expGot === Math.abs(ex.expo) ? 'Manca la polarizzazione: va sommato 127.' : expGot === ex.expo + 126 || expGot === ex.expo + 128 ? 'Sei fuori di 1: la normalizzazione lascia un solo 1 prima della virgola.' : 'Ricontrolla di quante posizioni hai spostato la virgola.') });
      const frOk = fr.padEnd(23, '0') === e.frac && fr.length <= 23;
      items.push({ label: 'Mantissa', ok: frOk, detail: frOk ? 'Corretto.' : 'Era ' + e.frac + '. ' + (('1' + e.frac).startsWith(fr.replace(/0+$/, '')) && fr[0] === '1' && fr.replace(/0+$/, '') !== e.frac.replace(/0+$/, '') ? 'Hai incluso l\'1 prima della virgola: è implicito e non si scrive.' : 'Sono i bit dopo la virgola del numero normalizzato, completati a destra con zeri.') });
    }
    return { score: items.filter((i) => i.ok).length / items.length, items };
  }

  ADE.aritmetica = { toC2, fromC2, genC2, gradeC2, encodeIEEE, decodeIEEE, genIEEE, gradeIEEE };
})(typeof globalThis !== 'undefined' ? globalThis : this);

// ---- Virgola mobile in formato ridotto (Esercizi del docente: 3 bit di esponente, 4 di mantissa) ----
(function (root) {
  const ADE = root.ADE, U = ADE.util, A = ADE.aritmetica;
  const it = (x) => String(x).replace('.', ',');
  /** Valore di una sequenza segno | k bit esponente | m bit mantissa. Nessun valore speciale: come negli esercizi del docente. */
  function miniValue(bits, k) { const s = bits[0] === '1' ? -1 : 1, e = parseInt(bits.slice(1, 1 + k), 2) - (2 ** (k - 1) - 1), f = bits.slice(1 + k); return s * (1 + parseInt(f, 2) / 2 ** f.length) * 2 ** e; }
  /** Codifica con troncamento della mantissa ("approssimato" nelle soluzioni del docente). */
  function miniEncode(x, k, m) {
    const bias = 2 ** (k - 1) - 1; let a = Math.abs(x), e = 0;
    while (a >= 2) { a /= 2; e++; } while (a < 1) { a *= 2; e--; }
    return (x < 0 ? '1' : '0') + U.bin(e + bias, k) + U.bin(Math.floor((a - 1) * 2 ** m), m);
  }
  function genMini(seed, type) {
    const rnd = U.rng(seed), k = 3, m = 4, bias = 3;
    type = type || rnd.pick(['decodifica', 'codifica']);
    const bits = String(rnd.int(0, 1)) + U.bin(rnd.int(1, 6), k) + U.bin(rnd.int(0, 15), m);
    const x = miniValue(bits, k), e = parseInt(bits.slice(1, 4), 2), f = bits.slice(4);
    const ex = { kind: 'mini', type, seed, k, m, bits, x };
    const fmt = bits[0] + ' ' + bits.slice(1, 4) + ' ' + f;
    if (type === 'decodifica') {
      ex.text = 'Con 1 bit di segno, 3 bit per l\'esponente e 4 bit per la mantissa, quale numero rappresenta la configurazione ' + bits + ' ?';
      ex.steps = ['Polarizzazione: 2^(k−1) − 1 = 2^2 − 1 = 3.', 'Campi: ' + fmt + ' → segno ' + (bits[0] === '1' ? 'negativo' : 'positivo') + ', esponente ' + e + ' − 3 = ' + (e - bias) + ', mantissa 1,' + f + '.',
        'Valore: ' + (bits[0] === '1' ? '−' : '+') + '1,' + f + ' · 2^' + (e - bias) + ' = ' + it(x) + '.'];
    } else {
      ex.text = 'Con 1 bit di segno, 3 bit per l\'esponente e 4 bit per la mantissa, dare la rappresentazione in virgola mobile di ' + it(x) + '.';
      ex.steps = ['In binario e normalizzato: ' + (x < 0 ? '−' : '') + '1,' + f + ' · 2^' + (e - bias) + '.', 'Esponente polarizzato: ' + (e - bias) + ' + 3 = ' + e + ' = ' + bits.slice(1, 4) + '.', 'Mantissa (senza l\'1 implicito): ' + f + '. Segno: ' + bits[0] + '.', 'Risultato: ' + fmt + '.'];
    }
    return ex;
  }
  function gradeMini(ex, v) {
    if (ex.type === 'decodifica') { const got = parseFloat(String(v.a || '').replace(',', '.').replace('−', '-')), ok = got === ex.x;
      return { score: ok ? 1 : 0, items: [{ label: 'Valore', ok, detail: ok ? 'Corretto: ' + it(ex.x) + '.' : 'Hai scritto ' + (v.a || '–') + ', era ' + it(ex.x) + '. ' + (got === -ex.x ? 'Controlla il bit di segno.' : 'La polarizzazione con 3 bit di esponente è 3, e la mantissa ha un 1 implicito prima della virgola.') }] }; }
    const got = String(v.a || '').replace(/[^01]/g, ''), ok = got === ex.bits;
    return { score: ok ? 1 : 0, items: [{ label: 'Configurazione', ok, detail: ok ? 'Corretto: ' + ex.bits + '.' : 'Hai scritto ' + (got || '–') + ', era ' + ex.bits + '. ' + (got.length !== 8 ? 'Servono 8 bit: 1 + 3 + 4.' : got.slice(1, 4) !== ex.bits.slice(1, 4) ? 'Esponente sbagliato: va sommata la polarizzazione 3.' : 'Ricontrolla la mantissa: sono i 4 bit dopo la virgola del numero normalizzato.') }] };
  }
  Object.assign(A, { miniValue, miniEncode, genMini, gradeMini });
})(typeof globalThis !== 'undefined' ? globalThis : this);
