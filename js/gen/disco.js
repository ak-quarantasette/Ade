// Esercizi sui tempi di accesso di un disco magnetico.
// Formule (slide «Memorie esterne», pag. 9): T = Ts + TL + Tt, TL = mezzo giro, Tt = b / (r·N),
// con b byte da trasferire, N byte per traccia, r giri al secondo.
// Settori contigui su un cilindro: le facce si leggono insieme, quindi Tt si divide per il
// numero di facce (esercizio svolto negli appunti; coerente con l'esito Moodle del compitino 2025).
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;
  const UNITS = { B: 1, KB: 2 ** 10, MB: 2 ** 20, GB: 2 ** 30, TB: 2 ** 40 };

  /** Tempo totale medio in ms. p: { capacity, faces, tracks, rpm, seek, bytes, cylinder } */
  function accessTime(p) {
    const N = p.capacity / p.faces / p.tracks;       // byte per traccia
    const r = p.rpm / 60;                            // giri al secondo
    const TL = 1000 / r / 2;
    let Tt = (p.bytes / (r * N)) * 1000;
    if (p.cylinder) Tt /= p.faces;
    return { N, r, TL, Tt, T: p.seek + TL + Tt };
  }

  /** Problema inverso (compitino 2025): dal tempo totale alla capacità del disco. */
  function capacityFromTime(p) {
    const r = p.rpm / 60, TL = 1000 / r / 2;
    const Tt = p.total - p.seek - TL;
    const N = (p.bytes * 1000) / (r * Tt * (p.cylinder ? p.faces : 1));
    return { r, TL, Tt, N, capacity: p.faces * p.tracks * N };
  }

  const ms = (x) => String(+x.toFixed(5)).replace('.', ',');

  function gen(seed, type) {
    const rnd = U.rng(seed);
    type = type || rnd.pick(['tempo', 'capacita']);
    // Si scartano le combinazioni con tempi di trasferimento irrealistici o dischi enormi.
    for (let i = 0; i < 200; i++) {
      const ex = build(rnd, type, seed);
      if (ex.a.Tt >= 0.04 && ex.a.Tt <= 12 && ex.p.capacity <= 4 * UNITS.TB) return ex;
    }
    throw new Error('generazione fallita per il seme ' + seed);
  }

  function build(rnd, type, seed) {
    const rpm = rnd.pick([3750, 5000, 7500, 10000, 15000]);
    const platters = rnd.pick([1, 2, 4]);
    const faces = platters * 2;
    const tracksExp = rnd.int(14, 16), sectorsExp = 13;
    const trackBytesExp = rnd.int(18, 22);             // byte per traccia
    const tracks = 2 ** tracksExp, N = 2 ** trackBytesExp;
    const capacity = faces * tracks * N;
    const bytes = 2 ** rnd.int(16, 18);                // 64KB, 128KB o 256KB
    const seek = rnd.int(40, 99) / 10;
    const cylinder = type === 'capacita' ? true : rnd.next() < 0.5;
    const p = { capacity, faces, tracks, rpm, seek, bytes, cylinder };
    const a = accessTime(p);
    const where = cylinder ? 'in settori contigui di un cilindro' : 'in una stessa traccia';
    const common = '<li>' + platters + ' piatt' + (platters === 1 ? 'o' : 'i') + ' (' + faces + ' facce);</li><li>' + tracks + ' tracce per faccia e ' + 2 ** sectorsExp + ' settori per traccia;</li><li>velocità di rotazione di ' + rpm + ' rpm;</li><li>tempo medio di posizionamento della testina di ' + ms(seek) + ' ms.</li>';
    const ex = { type, seed, p, a };
    const s1 = 'Giri al secondo: r = ' + rpm + ' / 60 = ' + ms(a.r) + '. Un giro dura ' + ms(1000 / a.r) + ' ms, quindi la latenza media (mezzo giro) è TL = ' + ms(a.TL) + ' ms.';
    if (type === 'tempo') {
      ex.html = '<p>Sia dato un disco rigido con le seguenti caratteristiche:</p><ul><li>capacità di ' + U.size(capacity) + ';</li>' + common + '</ul><p>Qual è il tempo totale medio per trasferire ' + U.size(bytes) + ' memorizzati ' + where + '?</p>';
      ex.answer = a.T; ex.unit = 'ms';
      ex.steps = [s1,
        'Byte per faccia: ' + U.size(capacity) + ' / ' + faces + ' = ' + U.size(capacity / faces) + '. Byte per traccia: N = ' + U.size(capacity / faces) + ' / ' + tracks + ' = ' + U.size(N) + '.',
        'Tempo di trasferimento: Tt = b / (r·N) · 1000 = ' + U.size(bytes) + ' / (' + ms(a.r) + ' · ' + U.size(N) + ') · 1000 = ' + ms(cylinder ? a.Tt * faces : a.Tt) + ' ms.',
        cylinder ? 'Settori contigui su un cilindro: le ' + faces + ' facce si leggono insieme, quindi Tt = ' + ms(a.Tt * faces) + ' / ' + faces + ' = ' + ms(a.Tt) + ' ms.' : 'Stessa traccia: nessuna divisione per il numero di facce.',
        'T = Ts + TL + Tt = ' + ms(seek) + ' + ' + ms(a.TL) + ' + ' + ms(a.Tt) + ' = ' + ms(a.T) + ' ms.'];
    } else {
      ex.total = +a.T.toFixed(6);
      ex.html = '<p>Sia dato un disco rigido con le seguenti caratteristiche:</p><ul>' + common + '</ul><p>Calcolare la capacità totale del disco, sapendo che il tempo totale medio per trasferire ' + U.size(bytes) + ' ' + where + ' è di ' + ms(a.T) + ' ms.</p>';
      ex.answer = capacity; ex.unit = 'capacità';
      ex.steps = [s1,
        'Tempo di trasferimento: Tt = T − Ts − TL = ' + ms(a.T) + ' − ' + ms(seek) + ' − ' + ms(a.TL) + ' = ' + ms(a.Tt) + ' ms.',
        'Su un cilindro Tt = b / (r·N·facce) · 1000, quindi N = b · 1000 / (r · Tt · facce) = ' + U.size(bytes) + ' · 1000 / (' + ms(a.r) + ' · ' + ms(a.Tt) + ' · ' + faces + ') = ' + U.size(N) + ' per traccia.',
        'Capacità = facce · tracce · N = ' + faces + ' · ' + tracks + ' · ' + U.size(N) + ' = ' + U.size(capacity) + '.',
        'I settori per traccia non servono per il calcolo (darebbero solo la dimensione del settore: ' + U.size(N / 2 ** sectorsExp) + ').'];
    }
    return ex;
  }

  /** "12,59375" → 12.59375 ; "32GB" / "32 gb" → byte */
  function parseAnswer(ex, str) {
    const s = String(str || '').trim().replace(',', '.');
    if (ex.type === 'tempo') { const v = parseFloat(s); return Number.isFinite(v) ? v : null; }
    const m = /^([\d.]+)\s*([KMGT]?B)$/i.exec(s);
    return m ? parseFloat(m[1]) * UNITS[m[2].toUpperCase()] : null;
  }

  function grade(ex, str) {
    const got = parseAnswer(ex, str);
    const exp = ex.type === 'tempo' ? ms(ex.answer) + ' ms' : U.size(ex.answer);
    if (got === null) return { ok: false, score: 0, exp, why: ex.type === 'tempo' ? 'Scrivi un numero in millisecondi, per esempio 9,875.' : 'Scrivi numero e unità, per esempio 32GB.' };
    const ok = Math.abs(got - ex.answer) <= Math.abs(ex.answer) * 0.002;
    let why = '';
    if (!ok && ex.type === 'tempo') {
      const { p, a } = ex;
      const near = (v) => Math.abs(got - v) < 0.002 * v;
      if (near(p.seek + a.Tt)) why = 'Hai dimenticato la latenza rotazionale (mezzo giro).';
      else if (near(p.seek + 2 * a.TL + a.Tt)) why = 'Hai usato un giro intero come latenza: quella media è mezzo giro.';
      else if (p.cylinder && near(p.seek + a.TL + a.Tt * p.faces)) why = 'Su un cilindro le facce si leggono insieme: il tempo di trasferimento va diviso per il numero di facce.';
      else if (!p.cylinder && near(p.seek + a.TL + a.Tt / p.faces)) why = 'I dati sono su una sola traccia: il tempo di trasferimento non va diviso per le facce.';
      else if (near(a.TL + a.Tt)) why = 'Hai dimenticato il tempo di posizionamento della testina.';
      else why = 'Ricontrolla i byte per traccia N e il tempo di trasferimento.';
    } else if (!ok) {
      const r = got / ex.answer;
      if (Math.abs(r - ex.p.faces) < 0.01) why = 'Risultato ' + ex.p.faces + ' volte troppo grande: su un cilindro il tempo di trasferimento è diviso per le facce, quindi N è ' + ex.p.faces + ' volte più piccolo.';
      else if (Math.abs(r - 1 / ex.p.faces) < 0.01) why = 'Hai calcolato la capacità di una sola faccia: moltiplica per il numero di facce.';
      else why = 'Ricava prima Tt = T − Ts − TL, poi N, poi moltiplica per facce e tracce.';
    }
    return { ok, score: ok ? 1 : 0, exp, why };
  }

  ADE.disco = { accessTime, capacityFromTime, gen, grade, parseAnswer, UNITS };
})(typeof globalThis !== 'undefined' ? globalThis : this);
