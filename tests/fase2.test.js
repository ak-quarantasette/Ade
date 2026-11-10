// Seconda parte: i generatori devono riprodurre l'esempio ufficiale di compitino (2025/26).
const test = require('node:test');
const assert = require('node:assert/strict');
const ADE = require('./helper');
const A = ADE.aritmetica, P = ADE.pipeline;

test('IEEE 754: −7,28515625 → 1 10000001 11010010010000000000000 (esempio di compitino, es2)', () => {
  const e = A.encodeIEEE(-7.28515625);
  assert.deepEqual([e.sign, e.exp, e.frac], ['1', '10000001', '11010010010000000000000']);
  assert.equal(A.decodeIEEE('11000000111010010010000000000000'), -7.28515625);
});

test('IEEE 754: generatore, 300 semi, andata e ritorno e correzione', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const ex = A.genIEEE(seed);
    assert.equal(A.decodeIEEE(ex.enc.bits), ex.x, 'numero rappresentabile esattamente, seme ' + seed);
    assert.equal(parseInt(ex.enc.exp, 2) - 127, ex.expo);
    if (ex.type === 'codifica') {
      assert.equal(A.gradeIEEE(ex, { s: ex.enc.sign, e: ex.enc.exp, f: ex.enc.frac }).score, 1);
      assert.equal(A.gradeIEEE(ex, { s: ex.enc.sign, e: ex.enc.exp, f: ex.enc.frac.replace(/0+$/, '') }).score, 1, 'zeri finali facoltativi');
      assert.ok(A.gradeIEEE(ex, { s: ex.enc.sign, e: '00000000', f: ex.enc.frac }).score < 1);
    } else {
      assert.equal(A.gradeIEEE(ex, { a: String(ex.x).replace('.', ',') }).score, 1);
      assert.equal(A.gradeIEEE(ex, { a: String(-ex.x) }).score, 0);
    }
    // Il procedimento mostrato arriva davvero alla sequenza corretta.
    assert.ok(ex.steps.join(' ').includes(ex.type === 'codifica' ? ex.enc.frac : String(Math.abs(ex.x)).replace('.', ',')));
  }
});

test('Complemento a 2: esempi degli appunti', () => {
  assert.equal(A.toC2(-6, 8), '11111010');
  assert.equal(A.toC2(13, 8), '00001101');
  assert.equal(A.toC2(-1, 8), '11111111');
  assert.equal(A.toC2(-18, 16), '1111111111101110');
  assert.deepEqual(['00011', '01111', '11100', '00000', '10000'].map(A.fromC2), [3, 15, -4, 0, -16]);
  assert.equal(A.toC2(7 + -5, 4), '0010'); // 0111 + 1011 = 0010
});

test('Complemento a 2: generatore, 300 semi', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const ex = A.genC2(seed);
    if (ex.type === 'codifica') { assert.equal(A.fromC2(ex.answer), ex.v); assert.equal(A.gradeC2(ex, { a: ex.answer }).score, 1); }
    if (ex.type === 'decodifica') { assert.equal(A.fromC2(ex.bits), ex.answer); assert.equal(A.gradeC2(ex, { a: String(ex.answer) }).score, 1); assert.equal(A.gradeC2(ex, { a: String(ex.answer + 1) }).score, 0); }
    if (ex.type === 'somma') {
      const real = ex.a + ex.b, lo = -(2 ** (ex.n - 1)), hi = 2 ** (ex.n - 1) - 1;
      assert.equal(ex.overflow, real < lo || real > hi);
      if (!ex.overflow) assert.equal(A.fromC2(ex.answer), real);
      assert.equal(A.gradeC2(ex, { a: ex.answer, o: ex.overflow ? 'sì' : 'no' }).score, 1);
      assert.equal(A.gradeC2(ex, { a: ex.answer, o: ex.overflow ? 'no' : 'sì' }).score, 0.5);
    }
  }
});

const prog = (lines) => lines.map(P.parse);
const stages = (sch) => sch.rows.map((r) => { let s = []; for (let c = 1; c <= sch.cycles; c++) s.push(P.stageAt(r, c) || '--'); return s.join(' '); });

test('Pipeline: esempio di compitino es3, senza e con forwarding → 3 cicli risparmiati', () => {
  const p = prog(['LW x3, 3(x1)', 'SUB x1, x4, x3', 'SW x1, 11(x3)', 'ADDI x3, x1, 24']);
  const none = P.schedule(p, false), fw = P.schedule(p, true);
  // Diagramma senza forwarding riportato nella soluzione ufficiale.
  assert.deepEqual(stages(none), [
    'IF ID EX MEM WB -- -- -- -- -- -- --',
    '-- IF ID ID ID EX MEM WB -- -- -- --',
    '-- -- IF IF IF ID ID ID EX MEM WB --',
    '-- -- -- -- -- IF IF IF ID EX MEM WB']);
  assert.equal(none.cycles, 12);
  assert.equal(fw.cycles, 9);            // "1 stallo + data forward" e poi "basta il data forward"
  assert.deepEqual(fw.rows.map((r) => r.stalls), [0, 1, 0, 0]);
});

test('Pipeline: esempio di compitino es8, diagramma e tabella dei forwarding ufficiali', () => {
  const p = prog(['LW x1, 0(x2)', 'ADD x2, x3, x1', 'SW x2, 21(x1)', 'BEQ x2, x1, 11', 'ADD x3, x2, x2', 'ADD x1, x1, x3', 'SW x3, 0(x1)']);
  const sch = P.schedule(p, true);
  assert.deepEqual(stages(sch), [
    'IF ID EX MEM WB -- -- -- -- -- -- --',
    '-- IF ID ID EX MEM WB -- -- -- -- --',
    '-- -- IF IF ID EX MEM WB -- -- -- --',
    '-- -- -- -- IF ID EX MEM WB -- -- --',
    '-- -- -- -- -- IF ID EX MEM WB -- --',
    '-- -- -- -- -- -- IF ID EX MEM WB --',
    '-- -- -- -- -- -- -- IF ID EX MEM WB']);
  assert.equal(sch.rows[6].wb, 12);
  const c = P.comments(p, sch).map((x) => [x.cycle, x.instr, 'x' + x.reg, x.action]);
  assert.deepEqual(c, [
    [3, 'ADD', 'x1', 'stallo'],
    [5, 'ADD', 'x1', 'forwarding MEM/WB.LMD → BottomALUIn'],
    [6, 'SW', 'x2', 'forwarding EX/MEM.ALUOut → BottomALUIn'],
    [7, 'BEQ', 'x2', 'forwarding MEM/WB.ALUOut → TopALUIn'],
    [9, 'ADD', 'x3', 'forwarding EX/MEM.ALUOut → BottomALUIn'],
    [10, 'SW', 'x1', 'forwarding EX/MEM.ALUOut → TopALUIn'],
    [10, 'SW', 'x3', 'forwarding MEM/WB.ALUOut → BottomALUIn'],
  ]);
  const cond = P.comments(p, sch)[0].cond;
  assert.equal(cond, 'ID/EX.MemRead and ID/EX.RegisterRd≠0 and ID/EX.RegisterRd=IF/ID.RegisterRs2');
});

test('Pipeline: generatori, 300 semi, invarianti del diagramma e correzione', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const ex = P.gen(seed);
    for (const sch of [ex.sch, ex.none]) {
      sch.rows.forEach((r, i) => {
        assert.ok(r.if0 < r.id0 && r.id0 < r.ex);
        if (i) { const pv = sch.rows[i - 1]; assert.ok(r.ex > pv.ex && r.if0 >= pv.if0 + 1 && r.id0 >= pv.ex, 'uno stadio ospita una sola istruzione, seme ' + seed); }
        // Ogni dato è letto solo dopo essere stato prodotto.
        r.deps.forEach((d) => { const pr = sch.rows[d.from];
          if (!sch.forwarding) assert.ok(pr.wb <= r.ex - 1);
          else assert.ok(r.ex > (P.OPS[pr.ins.op].load ? pr.mem : pr.ex)); });
      });
    }
    assert.ok(ex.sch.cycles <= ex.none.cycles);
    const right = ex.sch.rows.map((r) => ({ stalls: r.stalls, wb: r.wb, rs1: (r.deps.find((d) => d.port === 'rs1' && d.how !== 'registri') || {}).how || '', rs2: (r.deps.find((d) => d.port === 'rs2' && d.how !== 'registri') || {}).how || '' }));
    assert.equal(P.grade(ex, right).score, 1);
    right[1].wb += 1;
    assert.ok(P.grade(ex, right).score < 1);
    const cnt = P.genCount(seed);
    assert.equal(cnt.answer, cnt.none.cycles - cnt.sch.cycles);
  }
});
