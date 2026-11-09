// Il simulatore di cache deve riprodurre le soluzioni del materiale del corso.
// Se uno di questi test fallisce, vince il materiale: va corretto il simulatore.
const test = require('node:test');
const assert = require('node:assert/strict');
const ADE = require('./helper');
const C = ADE.cache;

const mem = (rows) => {
  const m = {};
  rows.forEach(([base, bytes]) => bytes.split(' ').forEach((b, i) => (m[base + i] = parseInt(b, 16))));
  return m;
};
const acc = (bin, op, data) => ({ addr: parseInt(bin.replace(/ /g, ''), 2), op, data: data === undefined ? undefined : parseInt(data, 16) });
const writes = (st) => st.memWrites.map((w) => w.addr.toString(16).toUpperCase() + '=' + w.val.toString(16).toUpperCase().padStart(2, '0'));
const line = (sim, i, set, way) => C.lineStr(sim.steps[i].after[set][way]);

test('Esercizio cache 5 (soluzione ufficiale): 2 vie, LRU, write-back', () => {
  const cfg = C.makeConfig({ cacheBytes: 16, blockBytes: 2, ways: 2, repl: 'LRU', write: 'back' });
  assert.deepEqual([cfg.tagBits, cfg.setBits, cfg.wordBits, cfg.sets], [9, 2, 1, 4]);
  const memory = mem([
    [0x100, '08 D0 07 02 00 00 00 00 AE 13 A1 23 A1 42 90 75'],
    [0x110, 'BB 16 00 00 0A 87 03 71 3E 13 A1 23 A1 82 90 15'],
    [0x120, 'F9 86 A0 00 E9 16 05 00'],
  ]);
  const sim = C.simulate(cfg, memory, [
    acc('000100001000', 's', '43'), acc('000100001100', 's', '3F'), acc('000100001111', 'l'), acc('000100001101', 'l'),
    acc('000100010100', 'l'), acc('000100011111', 's', 'AE'), acc('000100000111', 's', 'CD'), acc('000100100110', 'l'),
  ]);
  assert.deepEqual(sim.steps.map((s) => s.hit), [false, false, false, true, false, false, false, false]);
  assert.deepEqual(sim.steps.map((s) => s.set), [0, 2, 3, 2, 2, 3, 3, 3]);
  assert.deepEqual(sim.steps.map((s) => s.way), [0, 0, 0, 0, 1, 1, 0, 1]);
  assert.equal(line(sim, 0, 0, 0), '[43 13]*');
  assert.equal(line(sim, 1, 2, 0), '[3F 42]*');
  assert.equal(line(sim, 2, 3, 0), '[90 75]');
  assert.equal(line(sim, 4, 2, 1), '[0A 87]');
  assert.equal(line(sim, 5, 3, 1), '[90 AE]*');
  assert.equal(line(sim, 6, 3, 0), '[00 CD]*');   // LRU rimpiazza la linea 0, pulita
  assert.equal(line(sim, 7, 3, 1), '[05 00]');    // LRU rimpiazza la linea 1, sporca
  for (let i = 0; i < 7; i++) assert.deepEqual(writes(sim.steps[i]), []);
  assert.deepEqual(writes(sim.steps[7]), ['11E=90', '11F=AE']);
  assert.equal(sim.steps[6].after[3][0].tag, 0b000100000);
  assert.equal(sim.steps[7].after[3][1].tag, 0b000100100);
});

test('Primo compitino 19/11/2025, domanda 8: associazione diretta, write-back', () => {
  const cfg = C.makeConfig({ cacheBytes: 16, blockBytes: 8, ways: 1, repl: 'FIFO', write: 'back' });
  assert.deepEqual([cfg.tagBits, cfg.setBits, cfg.wordBits, cfg.sets], [8, 1, 3, 2]);
  const memory = mem([
    [0x100, '08 D0 07 02 00 00 00 00 0E DF AA B3 F1 C2 C3 C5'],
    [0x110, 'BB 16 00 00 0A 87 03 71 3E 13 A1 23 A1 82 9B FF'],
    [0x120, 'F9 86 A0 00 E9 16 05 00'],
  ]);
  const sim = C.simulate(cfg, memory, [
    acc('0001 0000 0011', 's', '04'), acc('0001 0000 0101', 's', 'FF'), acc('0001 0001 1001', 'l'), acc('0001 0010 0011', 'l'),
    acc('0001 0010 0110', 'l'), acc('0001 0001 1100', 'l'), acc('0001 0001 0011', 'l'), acc('0001 0001 0110', 'l'),
  ]);
  assert.deepEqual(sim.steps.map((s) => s.hit), [false, true, false, false, true, true, false, true]);
  assert.deepEqual(sim.steps.map((s) => s.set), [0, 0, 1, 0, 0, 1, 0, 0]);
  assert.equal(line(sim, 0, 0, 0), '[08 D0 07 04 00 00 00 00]*');
  assert.equal(line(sim, 1, 0, 0), '[08 D0 07 04 00 FF 00 00]*');
  assert.equal(line(sim, 2, 1, 0), '[3E 13 A1 23 A1 82 9B FF]');
  assert.equal(line(sim, 3, 0, 0), '[F9 86 A0 00 E9 16 05 00]');
  assert.equal(line(sim, 6, 0, 0), '[BB 16 00 00 0A 87 03 71]');
  // La correzione del docente riporta solo i byte cambiati: M[103]=04, M[105]=FF.
  assert.deepEqual(sim.steps[3].memWrites.filter((w) => w.changed).map((w) => [w.addr, w.val]), [[0x103, 0x04], [0x105, 0xff]]);
  assert.deepEqual(sim.steps.map((s) => s.memWrites.length > 0), [false, false, false, true, false, false, false, false]);
});

test('Esercizio cache 4: 2 vie, LRU, write-through (tracciato derivato dal testo della soluzione)', () => {
  const cfg = C.makeConfig({ cacheBytes: 16, blockBytes: 4, ways: 2, repl: 'LRU', write: 'through' });
  assert.deepEqual([cfg.tagBits, cfg.setBits, cfg.wordBits, cfg.sets], [9, 1, 2, 2]);
  const memory = mem([[0x100, '0C 00 07 02 00 00 00 00 AE 13 A1 23 A1 42 90 75'], [0x110, 'B9 16 00 00 0A 07 03 71']]);
  const sim = C.simulate(cfg, memory, [
    acc('000100000000', 'l'), acc('000100001000', 'l'), acc('000100001100', 's', 'B1'), acc('000100001100', 'l'),
    acc('000100010000', 's', 'B4'), acc('000100010000', 'l'), acc('000100010100', 's', 'B7'),
  ]);
  assert.deepEqual(sim.steps.map((s) => s.hit), [false, false, false, true, false, true, false]);
  assert.deepEqual(sim.steps.map((s) => [s.set, s.way]), [[0, 0], [0, 1], [1, 0], [1, 0], [0, 0], [0, 0], [1, 1]]);
  assert.deepEqual(sim.steps.map(writes), [[], [], ['10C=B1'], [], ['110=B4'], [], ['114=B7']]);
  assert.equal(sim.steps[6].after[1][1].tag, 0b000100010); // tag riportato nella slide della soluzione
  assert.equal(sim.memory[0x10c], 0xb1);
});

test('Esercizi cache 1-3: divisione dell\'indirizzo in campi', () => {
  let c = C.makeConfig({ addrBits: 20, cacheBytes: 4096, blockBytes: 64, ways: 8 });
  assert.deepEqual([c.tagBits, c.setBits, c.wordBits], [11, 3, 6]);              // Es. 1
  c = C.makeConfig({ addrBits: 24, cacheBytes: 16384, blockBytes: 32, ways: 4 });
  assert.deepEqual([c.tagBits, c.setBits, c.wordBits], [12, 7, 5]);              // Es. 2: 16MB
  c = C.makeConfig({ addrBits: 18, cacheBytes: 4096, blockBytes: 64, ways: 4 });
  assert.deepEqual([c.tagBits, c.setBits, c.wordBits], [8, 4, 6]);               // Es. 3
  assert.notEqual(C.split(c, 0x30e5c).set, C.split(c, 0x17a87).set);             // Es. 3a: set diversi
  assert.equal(C.split(c, 0x05abc).blockAddr, 0x05a80);                          // Es. 3b: blocco 05A80-05ABF
});

test('FIFO e LRU scelgono vittime diverse quando un hit rinfresca la linea più vecchia', () => {
  const run = (repl) => {
    const cfg = C.makeConfig({ cacheBytes: 16, blockBytes: 8, ways: 2, repl });
    return C.simulate(cfg, {}, [{ addr: 0x100, op: 'l' }, { addr: 0x108, op: 'l' }, { addr: 0x100, op: 'l' }, { addr: 0x110, op: 'l' }]).steps[3];
  };
  assert.equal(run('LRU').evicted.blockAddr, 0x108);
  assert.equal(run('FIFO').evicted.blockAddr, 0x100);
});

test('generatore traccia: 300 semi, soluzioni coerenti e autocorrezione a punteggio pieno', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const ex = C.genTrace(seed);
    const again = C.genTrace(seed);
    assert.deepEqual(ex.accesses, again.accesses, 'stesso seme, stesso esercizio');
    const { cfg, sim } = ex;
    assert.equal(cfg.tagBits + cfg.setBits + cfg.wordBits + cfg.byteBits, 12);
    // Invariante: a fine sequenza, memoria + linee sporche = memoria che si otterrebbe scrivendo direttamente.
    const direct = Object.assign({}, ex.memory);
    ex.accesses.forEach((a) => { if (a.op === 's') direct[a.addr] = a.data; });
    const eff = Object.assign({}, sim.memory);
    sim.steps[sim.steps.length - 1].after.forEach((set, s) => set.forEach((l) => {
      if (!l.valid) return;
      const base = ((l.tag << cfg.setBits) | s) << cfg.offBits;
      l.data.forEach((b, k) => { eff[base + k] = b; });
      if (cfg.write === 'through') assert.equal(l.dirty, false);
    }));
    assert.deepEqual(eff, direct, 'seme ' + seed);
    // Ogni lettura in hit vede l'ultimo valore scritto.
    // La risposta corretta deve ottenere il massimo; una risposta sbagliata no.
    const answers = { tag: cfg.tagBits, set: cfg.setBits, word: cfg.wordBits, byte: cfg.byteBits, sets: cfg.sets,
      steps: sim.steps.map((st) => ({ hit: st.hit, set: st.set, way: st.way, mem: C.memStr(st).startsWith('nessuna') ? '/' : C.memStr(st) })) };
    assert.equal(C.gradeTrace(ex, answers).score, 1, 'seme ' + seed);
    answers.steps[0].hit = !answers.steps[0].hit;
    const g = C.gradeTrace(ex, answers);
    assert.ok(g.score < 1 && g.steps[0].errs.length === 1);
  }
});

test('correzione memoria: accetta blocco intero o soli byte cambiati, rifiuta formati errati', () => {
  assert.deepEqual([...C.parseMem('M[11E]=90, 11f=ae')], [[0x11e, 0x90], [0x11f, 0xae]]);
  assert.equal(C.parseMem('/').size, 0);
  assert.equal(C.parseMem('boh'), null);
});

test('generatore campi: 300 semi, somma dei campi e spiegazione coerenti', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const ex = C.genFields(seed);
    const s = ex.solution;
    assert.equal(s.tag + s.set + s.word, s.addr);
    assert.ok(s.tag > 0, 'tag positivo, seme ' + seed);
    assert.equal(2 ** (s.set + s.word) * ex.cfg.ways, ex.cfg.cacheBytes);
    assert.equal(C.gradeFields(ex, s).score, 1);
    assert.equal(C.gradeFields(ex, { tag: s.tag + 1, set: s.set, word: s.word, addr: s.addr + 1 }).points, 2);
  }
});

test('parola più grande di un byte: campi parola e byte separati (esercizio 8bis degli appunti)', () => {
  // Parola di 4 byte, blocco di 2 parole, cache 32B a 2 vie, indirizzi di 12 bit:
  // tag 8, set 1, "word 3, di cui gli ultimi 2 indicano la posizione del byte nella parola".
  const c = C.makeConfig({ cacheBytes: 32, blockBytes: 8, wordBytes: 4, ways: 2 });
  assert.deepEqual([c.tagBits, c.setBits, c.wordBits, c.byteBits, c.sets], [8, 1, 1, 2, 2]);
  // Stessa cache con parola di un byte (esercizio 8): blocco 4B → tag 8, set 2, parola 2.
  const d = C.makeConfig({ cacheBytes: 32, blockBytes: 4, ways: 2 });
  assert.deepEqual([d.tagBits, d.setBits, d.wordBits, d.byteBits, d.sets], [8, 2, 2, 0, 4]);
  // Il generatore produce davvero anche esercizi con parola > 1 byte, e li corregge.
  let multi = 0;
  for (let seed = 1; seed <= 200; seed++) if (C.genTrace(seed).cfg.wordBytes > 1) multi++;
  assert.ok(multi > 10 && multi < 120, 'esercizi con parola > 1 byte: ' + multi);
});
