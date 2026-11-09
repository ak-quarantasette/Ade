// Conversioni tra basi (binario, ottale, esadecimale, decimale) con procedimento.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;
  const NAMES = { 2: 'binario', 8: 'ottale', 10: 'decimale', 16: 'esadecimale' };
  const chunk = (s, n) => { const pad = s.padStart(Math.ceil(s.length / n) * n, '0'); return pad.match(new RegExp('.{' + n + '}', 'g')); };

  function steps(value, from, to) {
    const src = value.toString(from).toUpperCase();
    const out = [];
    const bin = value.toString(2);
    if (from === 10 && to === 2) {
      let v = value; const rem = [];
      while (v > 0) { rem.push(v + ' : 2 = ' + Math.floor(v / 2) + ' resto ' + (v % 2)); v = Math.floor(v / 2); }
      out.push('Divisioni successive per 2: ' + rem.join('; ') + '.', 'I resti letti dall\'ultimo al primo: ' + bin + '.');
    } else if (to === 10) {
      const digits = src.split('');
      out.push('Ogni cifra per la potenza della base: ' + digits.map((d, i) => parseInt(d, from) + '·' + from + '^' + (digits.length - 1 - i)).join(' + ') + ' = ' + value + '.');
    } else {
      if (from !== 2) out.push('Ogni cifra ' + NAMES[from] + ' diventa ' + (from === 16 ? 4 : 3) + ' bit: ' + src.split('').map((d) => d + '→' + parseInt(d, from).toString(2).padStart(from === 16 ? 4 : 3, '0')).join(', ') + '. Binario: ' + bin + '.');
      if (to !== 2) { const n = to === 16 ? 4 : 3; out.push('Si raggruppano i bit a ' + n + ' a ' + n + ' partendo da destra: ' + chunk(bin, n).join(' ') + ' → ' + chunk(bin, n).map((g) => parseInt(g, 2).toString(to).toUpperCase()).join(' ') + '.'); }
    }
    out.push('Risultato: ' + value.toString(to).toUpperCase() + '.');
    return out;
  }

  function gen(seed) {
    const rnd = U.rng(seed);
    const [from, to] = rnd.pick([[2, 16], [16, 2], [2, 8], [8, 2], [2, 10], [10, 2], [16, 10], [10, 16], [16, 8]]);
    const value = rnd.int(17, from === 10 || to === 10 ? 255 : 4095);
    return { seed, from, to, value, src: value.toString(from).toUpperCase(), answer: value.toString(to).toUpperCase(),
      text: 'Converti ' + value.toString(from).toUpperCase() + ' da ' + NAMES[from] + ' a ' + NAMES[to] + '.', steps: steps(value, from, to) };
  }

  function grade(ex, str) {
    const got = String(str || '').replace(/\s/g, '').toUpperCase().replace(/^0+(?=.)/, '');
    const ok = got === ex.answer;
    let why = '';
    if (!ok) {
      const valid = got && [...got].every((ch) => parseInt(ch, ex.to) < ex.to);
      if (!valid) why = 'La risposta contiene cifre che non esistono in ' + NAMES[ex.to] + '.';
      else if ([...got].reverse().join('') === ex.answer) why = 'Le cifre sono in ordine inverso: i gruppi si formano da destra e i resti si leggono dall\'ultimo.';
      else why = 'Il tuo numero vale ' + parseInt(got, ex.to) + ' in decimale, quello richiesto ' + ex.value + '.';
    }
    return { ok, score: ok ? 1 : 0, why, exp: ex.answer };
  }

  ADE.basi = { gen, grade, steps, NAMES };
})(typeof globalThis !== 'undefined' ? globalThis : this);
