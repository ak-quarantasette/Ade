// Esercizi risolti dal docente (raccolte a.a. 2025/26): i generatori devono dare gli stessi risultati.
const test = require('node:test');
const assert = require('node:assert/strict');
const ADE = require('./helper');
const { hamming: H, disco: D, aritmetica: A, pipeline: P, cache: C } = ADE;
const KB = 2 ** 10, GB = 2 ** 30, near = (a, b, t) => assert.ok(Math.abs(a - b) < (t || 1e-3), a + ' ≠ ' + b);

test('Hamming, esercizi 2 e 3: parola letta e numero di bit di controllo', () => {
  // Es. 2: 00111001, controlli 0111, ricalcolati 1101 → sindrome 1010 = posizione 10 = D6 invertito.
  const syn = 0b0111 ^ 0b1101;
  assert.equal(syn, 10);
  assert.equal(H.dataPositions(8).indexOf(10) + 1, 6);
  const w = H.encode('00111001'); w[10] ^= 1;
  assert.equal(H.decode(H.wordStr(w)).data, '00111001');
  assert.equal(H.checkBits(1024), 11);                         // Es. 3
  assert.equal(H.checks('11001010').length, 4);                // Es. 1
  assert.equal(H.wordStr(H.encode('0101000000111001')).length, 21); // Es. 4
  for (let s = 1; s <= 200; s++) { const ex = H.gen(s, 'quanti'); assert.ok(2 ** ex.k >= ex.m + ex.k + 1 && 2 ** (ex.k - 1) < ex.m + ex.k); assert.equal(H.grade(ex, String(ex.k)).ok, true); assert.equal(H.grade(ex, String(ex.k - 1)).ok, false); }
});

test('Dischi, esercizio 1: dal tempo alla capacità (singola traccia) → 256GB', () => {
  const c = D.capacityFromTime({ faces: 1, tracks: 524288, rpm: 4200, seek: 0.8, bytes: 64 * KB, total: 9.728571, cylinder: false });
  near(c.TL, 7.142857); near(c.N / KB, 512, 0.01); near(c.capacity / GB, 256, 0.01);
});

test('Dischi, esercizi 2 e 5: singola traccia e cilindro', () => {
  const p2 = { capacity: 512 * GB, faces: 8, tracks: 524288, rpm: 10000, seek: 1.4, bytes: 32 * KB };
  near(D.accessTime(Object.assign({ cylinder: false }, p2)).T, 5.9);
  near(D.accessTime(Object.assign({ cylinder: true }, p2)).T, 4.5875);
  const p5 = { capacity: 128 * GB, faces: 8, tracks: 65536, rpm: 7200, seek: 8.5, bytes: 64 * KB };
  near(D.accessTime(Object.assign({ cylinder: false }, p5)).T, 14.75, 0.001);
  near(D.accessTime(Object.assign({ cylinder: true }, p5)).T, 12.927, 0.001);
});

test('Dischi, esercizio 3: byte trasferiti e settori', () => {
  const a = D.accessTime({ capacity: 128 * GB, faces: 4, tracks: 65536, rpm: 4200, seek: 2.8, bytes: 64 * KB, cylinder: false });
  near(a.T, 11.728571, 1e-5);
  assert.equal(a.N, 2 ** 19);
  assert.equal(64 * KB / (a.N / 2048), 256);
  for (let s = 1; s <= 200; s++) { const ex = D.genBytes(s); assert.equal(D.gradeBytes(ex, { b: ADE.util.size(ex.answer), s: String(ex.nSectors) }).score, 1); assert.ok(Number.isInteger(ex.nSectors)); assert.equal(D.gradeBytes(ex, { b: ADE.util.size(ex.answer * 2), s: String(ex.nSectors) }).score, 0.5); }
});

test('Dischi, esercizio 4: FCFS 620 ms, SSF 225 ms, ascensore 300 ms (su) e 225 ms (giù)', () => {
  const reqs = [10, 20, 15, 5, 40, 8, 35];
  assert.equal(D.schedule('FCFS', 15, reqs).moves * 5, 620);
  assert.deepEqual(D.schedule('SSF', 15, reqs), { order: [15, 10, 8, 5, 20, 35, 40], moves: 45 });
  assert.deepEqual(D.schedule('EA', 15, reqs, 'su'), { order: [15, 20, 35, 40, 10, 8, 5], moves: 60 });
  assert.equal(D.schedule('EA', 15, reqs, 'giu').moves, 45);
  for (let s = 1; s <= 200; s++) { const ex = D.genSched(s), r = ex.res;
    for (const k of ['FCFS', 'SSF', 'EA']) assert.deepEqual(r[k].order.slice().sort((a, b) => a - b), ex.reqs.slice().sort((a, b) => a - b));
    assert.equal(D.gradeSched(ex, { FCFS: r.FCFS.moves * ex.cost, SSF: r.SSF.moves * ex.cost, EA: r.EA.moves * ex.cost }).score, 1); }
});

test('Virgola mobile ridotta (3 bit esponente, 4 mantissa): esercizi 1, 2 e 3', () => {
  const v = (b) => A.miniValue(b, 3);
  assert.deepEqual(['11111111', '01011011', '01101111', '01111011', '11001011', '01011111'].map(v), [-31, 6.75, 15.5, 27, -3.375, 7.75]);
  assert.equal(A.miniEncode(6.5, 3, 4), '01011010');
  assert.equal(A.miniEncode(2.25, 3, 4), '01000010');
  assert.equal(A.miniEncode(-7.3, 3, 4), '11011101');   // approssimato per troncamento
  assert.equal(A.miniEncode(2.3, 3, 4), '01000010');
  assert.equal(A.miniEncode(-0.25, 3, 4), '10010000');
  assert.equal(v('01111111'), 31);                       // massimo positivo
  assert.equal(v('00000000'), 0.125);                    // minimo positivo
  for (let s = 1; s <= 200; s++) { const ex = A.genMini(s); assert.equal(A.miniEncode(ex.x, 3, 4), ex.bits);
    assert.equal(A.gradeMini(ex, { a: ex.type === 'decodifica' ? String(ex.x).replace('.', ',') : ex.bits }).score, 1); }
});

test('Complemento a 2: esercizi del docente', () => {
  assert.deepEqual(['00011', '01111', '11100', '11010', '00000', '10000'].map(A.fromC2), [3, 15, -4, -6, 0, -16]);
  assert.deepEqual([6, -6, 13, -1, 0].map((x) => A.toC2(x, 8)), ['00000110', '11111010', '00001101', '11111111', '00000000']);
});

test('Pipeline, esercizio 3 sequenza 1: senza forwarding 17 cicli, con forwarding 12 e un solo stallo', () => {
  const p = ['SUB x2, x7, x5', 'LW x1, 7(x2)', 'ADD x2, x1, x8', 'SW x3, 73(x1)', 'ADDI x2, x3, -4', 'ADDI x7, x3, 8', 'ADD x1, x7, x2'].map(P.parse);
  const none = P.schedule(p, false), fw = P.schedule(p, true);
  assert.deepEqual(none.rows.map((r) => r.stalls), [0, 2, 2, 0, 0, 0, 2]);
  assert.equal(none.cycles, 17);
  assert.deepEqual(none.rows.map((r) => r.wb), [5, 8, 11, 12, 13, 14, 17]);
  assert.deepEqual(fw.rows.map((r) => r.stalls), [0, 0, 1, 0, 0, 0, 0]);
  assert.equal(fw.cycles, 12);
  // Forwarding indicati nella soluzione: x2 per la LW da EX/MEM; per l'ultima ADD x7 da EX/MEM (Top) e x2 da MEM/WB (Bottom).
  const c = P.comments(p, fw).map((x) => x.instr + ' x' + x.reg + ' ' + x.action);
  assert.ok(c.includes('LW x2 forwarding EX/MEM.ALUOut → TopALUIn'));
  assert.ok(c.includes('ADD x7 forwarding EX/MEM.ALUOut → TopALUIn') && c.includes('ADD x2 forwarding MEM/WB.ALUOut → BottomALUIn'));
});

test('Pipeline: lw seguita da sw dello stesso registro, 1 stallo con forwarding e 2 senza (Lez. 13)', () => {
  const p = ['LW x6, 16(x3)', 'SW x6, 416(x3)'].map(P.parse);
  assert.equal(P.schedule(p, true).rows[1].stalls, 1);
  assert.equal(P.schedule(p, false).rows[1].stalls, 2);
  assert.equal(P.schedule(p, true).rows[1].deps.find((d) => d.port === 'rs2').how, 'MEM/WB');
});

test('Pipeline: prestazioni ideali (9 istruzioni, 6 stadi → 14 cicli)', () => {
  const r = P.perf([1, 1, 1, 1, 1, 1], 0, 9);
  assert.equal(r.Tk, 14);
  near(r.speedup, 54 / 14);
  for (let s = 1; s <= 200; s++) { const ex = P.genPerf(s); assert.equal(P.gradePerf(ex, { tau: ex.r.tau, T: ex.r.Tk, S: ex.r.speedup.toFixed(2) }).score, 1); assert.ok(ex.r.speedup < ex.r.k); }
});

test('Cache, parola di 4 byte: la scrittura sostituisce l\'intera parola (esercizio 8bis degli appunti, stessa forma dell\'Esercizio 6 del docente)', () => {
  const cfg = C.makeConfig({ cacheBytes: 32, blockBytes: 8, wordBytes: 4, ways: 2, repl: 'LRU', write: 'back' });
  const mem = {}; '08 0A D7 02 1F 00 80 E0 AE 73 AF 23 A1 42 90 75'.split(' ').forEach((b, i) => { mem[0x100 + i] = parseInt(b, 16); });
  const sim = C.simulate(cfg, mem, [{ addr: 0x108, op: 's', data: [0xd4, 0xff, 0x03, 0x2a] }, { addr: 0x10c, op: 'l' }]);
  assert.equal(sim.steps[0].set, 1);
  assert.equal(sim.steps[0].tag, 0x10);                  // "tag: 10 HEX" nell'Esercizio 6
  assert.equal(C.lineStr(sim.steps[0].after[1][0]), '[D4 FF 03 2A A1 42 90 75]*');
  assert.equal(sim.steps[1].hit, true);
  let seen = 0;
  for (let s = 1; s <= 400; s++) { const ex = C.genTrace(s); if (ex.cfg.wordBytes === 4) { seen++; ex.accesses.filter((a) => a.op === 's').forEach((a) => { assert.equal(a.data.length, 4); assert.equal(a.addr % 4, 0); }); } }
  assert.ok(seen > 5);
});
