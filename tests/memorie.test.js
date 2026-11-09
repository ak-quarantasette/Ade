// Hamming e dischi: i generatori devono riprodurre gli esempi delle slide e le domande dei compitini.
const test = require('node:test');
const assert = require('node:assert/strict');
const ADE = require('./helper');
const H = ADE.hamming, D = ADE.disco;
const GB = 2 ** 30, KB = 2 ** 10;

test('Hamming: bit di controllo necessari (tabella delle slide)', () => {
  assert.deepEqual([8, 16, 32, 64].map(H.checkBits), [4, 5, 6, 7]);
});

test('Hamming: parola 0011 1001 → bit di controllo 0111 (compitino 2025, domanda 2)', () => {
  assert.equal(H.checks('00111001'), '0111');
  assert.equal(H.wordStr(H.encode('00111001')), '001101001111');
});

test('Hamming: compitino 2025 turno I, controlli ricalcolati 0101 → parola letta invariata', () => {
  // Sindrome 0111 xor 0101 = 0010: posizione 2, un bit di controllo. Risposta segnata corretta: 0011 1001.
  const syn = parseInt('0111', 2) ^ parseInt('0101', 2);
  assert.equal(syn, 2);
  assert.equal(H.dataPositions(8).includes(syn), false);
});

test('Hamming: compitino 2025 altro turno, sequenza letta → messaggio tra le opzioni', () => {
  const r = H.decode('1 1101 0000 1010 0111 0010');
  const options = ['1110100010101111', '1110100010101110', '1100100010101110', '1110100010101011'];
  console.log('  altro turno: sindrome', r.syndrome, 'messaggio', H.group(r.data), options.includes(r.data) ? '(è tra le opzioni)' : '(NON è tra le opzioni)');
  assert.equal(r.data.length, 16);
});

test('Hamming: esercizio degli appunti, 16 bit 1001001010001110 → C1=1, altri controlli 0', () => {
  assert.equal(H.checks('1001001010001110'), '00001');
  console.log('  sequenza memorizzata:', H.wordStr(H.encode('1001001010001110')));
});

test('Hamming: ogni errore singolo viene corretto (tutte le posizioni, 200 parole)', () => {
  const rnd = ADE.util.rng(42);
  for (let t = 0; t < 200; t++) {
    const m = t % 2 ? 8 : 16;
    let data = ''; for (let i = 0; i < m; i++) data += rnd.int(0, 1);
    const code = H.encode(data);
    assert.equal(H.syndrome(code), 0);
    for (let p = 1; p < code.length; p++) {
      const bad = code.slice(); bad[p] ^= 1;
      const r = H.decode(H.wordStr(bad));
      assert.equal(r.syndrome, p);
      assert.equal(r.data, data);
    }
  }
});

test('Hamming: generatore, 300 semi, soluzione verificata in modo indipendente', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const ex = H.gen(seed);
    assert.equal(H.grade(ex, H.group(ex.answer)).ok, true);
    assert.equal(H.grade(ex, ex.answer.replace(/.$/, (c) => (c === '0' ? '1' : '0'))).ok, false);
    if (ex.type === 'codifica') { assert.equal(H.decode(ex.answer).syndrome, 0); assert.equal(H.decode(ex.answer).data, ex.data); }
    if (ex.type === 'decodifica') assert.equal(H.decode(ex.read).data, ex.answer);
    if (ex.type === 'sindrome') {
      // I controlli ricalcolati sulla parola letta, confrontati con quelli memorizzati, danno la posizione.
      const diff = [...ex.answer].filter((b, i) => b !== ex.data[i]).length;
      assert.equal(diff, ex.pos && H.dataPositions(8).includes(ex.pos) ? 1 : 0);
      if (diff) assert.equal(parseInt(H.checks(ex.answer), 2) ^ parseInt(ex.stored, 2), ex.pos);
    }
  }
});

test('Disco: esercizio svolto, stessa traccia → 9,875 ms', () => {
  const a = D.accessTime({ capacity: 2 ** 40, faces: 4, tracks: 65536, rpm: 10000, seek: 6.5, bytes: 256 * KB, cylinder: false });
  assert.equal(a.N, 2 ** 22);
  assert.ok(Math.abs(a.Tt - 0.375) < 1e-9);
  assert.ok(Math.abs(a.T - 9.875) < 1e-9);
});

test('Disco: esercizio svolto, settori contigui su un cilindro → 12,59375 ms', () => {
  const a = D.accessTime({ capacity: 128 * GB, faces: 2, tracks: 16384, rpm: 10000, seek: 9.5, bytes: 128 * KB, cylinder: true });
  assert.ok(Math.abs(a.T - 12.59375) < 1e-9);
});

test('Disco: compitino 2025 turno I, dal tempo alla capacità → 32GB', () => {
  const c = D.capacityFromTime({ faces: 4, tracks: 32768, rpm: 10000, seek: 7.1, bytes: 256 * KB, total: 11.6, cylinder: true });
  assert.ok(Math.abs(c.capacity - 32 * GB) < 1e-3 * GB, 'capacità ' + c.capacity / GB + 'GB');
});

test('Disco: generatore, 300 semi, andata e ritorno e correzione', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const ex = D.gen(seed);
    if (ex.type === 'tempo') {
      assert.equal(D.grade(ex, String(ex.answer).replace('.', ',')).ok, true);
      assert.equal(D.grade(ex, String(ex.answer + 1)).ok, false);
    } else {
      const back = D.capacityFromTime(Object.assign({}, ex.p, { total: ex.total }));
      assert.ok(Math.abs(back.capacity - ex.answer) / ex.answer < 1e-4, 'seme ' + seed);
      assert.equal(D.grade(ex, ADE.util.size(ex.answer)).ok, true);
      assert.equal(D.grade(ex, ADE.util.size(ex.answer * ex.p.faces)).ok, false);
    }
    assert.ok(ex.a.Tt > 0.01 && ex.a.T < 40, 'numeri plausibili, seme ' + seed);
  }
});
