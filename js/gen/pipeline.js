// Pipeline a 5 stadi (IF ID EX MEM WB) come nell'esempio ufficiale di secondo compitino:
//  - scrittura e successiva lettura dei registri nello stesso ciclo di clock;
//  - senza forwarding un'istruzione resta in ID finché il produttore del dato non è in WB;
//  - con forwarding serve uno stallo solo dopo una LW il cui risultato è usato subito (load-use);
//  - gli operandi (anche di SW e BEQ) servono all'ingresso dello stadio EX;
//  - i salti sono considerati non presi, senza penalità.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;

  const OPS = {
    LW: { dest: true, load: true, src: (i) => [['rs1', i.rs1]], fmt: (i) => 'LW x' + i.rd + ', ' + i.imm + '(x' + i.rs1 + ')' },
    SW: { src: (i) => [['rs1', i.rs1], ['rs2', i.rs2]], fmt: (i) => 'SW x' + i.rs2 + ', ' + i.imm + '(x' + i.rs1 + ')' },
    ADD: { dest: true, src: (i) => [['rs1', i.rs1], ['rs2', i.rs2]], fmt: (i) => 'ADD x' + i.rd + ', x' + i.rs1 + ', x' + i.rs2 },
    SUB: { dest: true, src: (i) => [['rs1', i.rs1], ['rs2', i.rs2]], fmt: (i) => 'SUB x' + i.rd + ', x' + i.rs1 + ', x' + i.rs2 },
    ADDI: { dest: true, src: (i) => [['rs1', i.rs1]], fmt: (i) => 'ADDI x' + i.rd + ', x' + i.rs1 + ', ' + i.imm },
    BEQ: { src: (i) => [['rs1', i.rs1], ['rs2', i.rs2]], fmt: (i) => 'BEQ x' + i.rs1 + ', x' + i.rs2 + ', ' + i.imm },
  };
  const text = (i) => OPS[i.op].fmt(i);

  /** "LW x1, 0(x2)" → { op, rd, rs1, rs2, imm } */
  function parse(line) {
    const m = /^\s*(\w+)\s+(.*)$/.exec(line), op = m[1].toUpperCase(), a = m[2].replace(/\s/g, '');
    const r = (s) => Number(s.replace(/x/i, ''));
    let k;
    if (op === 'LW' && (k = /^x(\d+),(\w+)\(x(\d+)\)$/i.exec(a))) return { op, rd: +k[1], imm: k[2], rs1: +k[3] };
    if (op === 'SW' && (k = /^x(\d+),(\w+)\(x(\d+)\)$/i.exec(a))) return { op, rs2: +k[1], imm: k[2], rs1: +k[3] };
    const p = a.split(',');
    if (op === 'ADD' || op === 'SUB') return { op, rd: r(p[0]), rs1: r(p[1]), rs2: r(p[2]) };
    if (op === 'ADDI') return { op, rd: r(p[0]), rs1: r(p[1]), imm: p[2] };
    if (op === 'BEQ') return { op, rs1: r(p[0]), rs2: r(p[1]), imm: p[2] };
    throw new Error('istruzione non riconosciuta: ' + line);
  }

  /**
   * Calcola il diagramma temporale.
   * Restituisce per ogni istruzione: if0 (primo ciclo di IF), id0 (primo di ID), ex, mem, wb, stalli,
   * e le dipendenze: { reg, port, from (indice produttore), how: 'registri' | 'stallo' | 'EX/MEM' | 'MEM/WB' }.
   */
  function schedule(prog, forwarding) {
    const rows = [];
    prog.forEach((ins, i) => {
      const prev = rows[i - 1];
      const if0 = i === 0 ? 1 : prev.id0;
      const id0 = i === 0 ? 2 : Math.max(if0 + 1, prev.ex);
      let ex = id0 + 1;
      const deps = [];
      for (const [port, reg] of OPS[ins.op].src(ins)) {
        if (!reg) continue; // x0 vale sempre 0
        let j = -1;
        for (let k = i - 1; k >= 0; k--) if (OPS[prog[k].op].dest && prog[k].rd === reg) { j = k; break; }
        if (j < 0) continue;
        const pr = rows[j];
        const need = forwarding ? (OPS[prog[j].op].load ? pr.mem + 1 : pr.ex + 1) : pr.wb + 1;
        deps.push({ reg, port, from: j, need });
        ex = Math.max(ex, need);
      }
      const row = { i, ins, if0, id0, ex, mem: ex + 1, wb: ex + 2, stalls: ex - (id0 + 1), deps };
      for (const d of deps) {
        const pr = rows[d.from];
        // Se il produttore ha già scritto (WB entro l'ultimo ciclo di ID) il dato arriva dal banco dei registri.
        if (pr.wb <= ex - 1) d.how = 'registri';
        else if (!forwarding) d.how = 'registri';
        else if (pr.mem === ex) d.how = 'EX/MEM';
        else d.how = 'MEM/WB';
        d.stall = d.need > id0 + 1; // questa dipendenza ha imposto almeno uno stallo
      }
      rows.push(row);
    });
    return { rows, cycles: rows[rows.length - 1].wb, forwarding };
  }

  function stageAt(row, c) {
    if (c < row.if0) return '';
    if (c < row.id0) return 'IF';
    if (c < row.ex) return 'ID';
    return { 0: 'EX', 1: 'MEM', 2: 'WB' }[c - row.ex] || '';
  }

  /** Tabella HTML del diagramma (gli stadi ripetuti sono gli stalli). */
  function tableHtml(prog, sch) {
    let h = '<div class="scroll"><table class="pipe"><thead><tr><th></th>';
    for (let c = 1; c <= sch.cycles; c++) h += '<th>' + c + '</th>';
    h += '</tr></thead><tbody>';
    sch.rows.forEach((r) => {
      h += '<tr><td>' + text(r.ins) + '</td>';
      for (let c = 1; c <= sch.cycles; c++) { const s = stageAt(r, c), rep = s && s === stageAt(r, c - 1); h += '<td' + (rep ? ' class="st"' : '') + '>' + s + '</td>'; }
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  /** Commenti alla soluzione, nello stile della tabella ufficiale. */
  function comments(prog, sch) {
    const out = [];
    sch.rows.forEach((r) => r.deps.forEach((d) => {
      const pr = sch.rows[d.from], pin = prog[d.from];
      const rs = d.port === 'rs1' ? 'Rs1' : 'Rs2';
      if (sch.forwarding) {
        if (d.stall) out.push({ cycle: pr.ex, instr: r.ins.op, reg: d.reg, unit: 'Hazard Detection Unit', cond: 'ID/EX.MemRead and ID/EX.RegisterRd≠0 and ID/EX.RegisterRd=IF/ID.Register' + rs, action: 'stallo' });
        if (d.how !== 'registri') out.push({ cycle: r.ex, instr: r.ins.op, reg: d.reg, unit: 'Forwarding Unit', cond: d.how + '.RegWrite and ' + d.how + '.RegisterRd≠0 and ' + d.how + '.RegisterRd=ID/EX.Register' + rs,
          action: 'forwarding ' + d.how + '.' + (d.how === 'EX/MEM' ? 'ALUOut' : OPS[pin.op].load ? 'LMD' : 'ALUOut') + ' → ' + (d.port === 'rs1' ? 'TopALUIn' : 'BottomALUIn') });
      } else if (d.stall) out.push({ cycle: r.id0, instr: r.ins.op, reg: d.reg, unit: 'nessun forwarding', cond: 'il valore di x' + d.reg + ' è scritto da ' + text(pin) + ' nel ciclo ' + pr.wb, action: 'resta in ID fino al ciclo ' + pr.wb });
    }));
    return out.sort((a, b) => a.cycle - b.cycle);
  }

  // ---------- Generatore ----------
  function randomProgram(rnd, n) {
    const reg = () => rnd.int(1, 5);
    const prog = [];
    let last = reg();
    for (let i = 0; i < n; i++) {
      const op = i === 0 ? rnd.pick(['LW', 'ADD', 'LW']) : rnd.pick(['LW', 'SW', 'ADD', 'SUB', 'ADDI', 'ADD', 'BEQ', 'SW']);
      // Con buona probabilità si riusa il registro appena scritto, per creare dipendenze.
      const use = () => (rnd.next() < 0.6 ? last : reg());
      const ins = { op, imm: String(rnd.pick([0, 3, 4, 8, 11, 21, 24])) };
      if (OPS[op].dest) ins.rd = reg();
      ins.rs1 = use();
      if (op !== 'LW' && op !== 'ADDI') ins.rs2 = use();
      if (OPS[op].dest) last = ins.rd;
      prog.push(ins);
    }
    return prog;
  }

  /** Esercizio grande (8 punti): pipeline con forwarding, stalli e circuiti di by-pass. */
  function gen(seed) {
    const rnd = U.rng(seed);
    for (let t = 0; t < 300; t++) {
      const prog = randomProgram(rnd, rnd.int(5, 7));
      const sch = schedule(prog, true);
      const fw = sch.rows.flatMap((r) => r.deps).filter((d) => d.how !== 'registri').length;
      const st = sch.rows.reduce((a, r) => a + r.stalls, 0);
      if (fw >= 3 && st >= 1 && st <= 2) return { kind: 'pipeline', seed, prog, sch, none: schedule(prog, false) };
    }
    throw new Error('generazione fallita per il seme ' + seed);
  }

  /** Esercizio breve: quanti cicli si risparmiano con il forwarding (domanda a scelta multipla dell'esempio). */
  function genCount(seed) {
    const rnd = U.rng(seed);
    for (let t = 0; t < 300; t++) {
      const prog = randomProgram(rnd, 4);
      const a = schedule(prog, false), b = schedule(prog, true);
      if (a.cycles - b.cycles >= 1 && a.cycles - b.cycles <= 5) return { kind: 'conta', seed, prog, none: a, sch: b, answer: a.cycles - b.cycles };
    }
    throw new Error('generazione fallita per il seme ' + seed);
  }

  /**
   * Correzione dell'esercizio grande. answers[i] = { stalls, wb, rs1, rs2 } con rs1/rs2 in
   * '' (nessun forwarding) | 'EX/MEM' | 'MEM/WB'.
   */
  function grade(ex, answers) {
    const items = ex.sch.rows.map((r, i) => {
      const a = answers[i] || {}, errs = [];
      if (Number(a.stalls) !== r.stalls || a.stalls === '' || a.stalls === undefined) errs.push('Stalli: erano ' + r.stalls + '. ' + (r.stalls ? 'Il dato viene da una LW immediatamente precedente: è disponibile solo dopo MEM, quindi serve uno stallo anche con il forwarding.' : 'Con il forwarding lo stallo serve solo quando si usa subito il risultato di una LW.'));
      if (Number(a.wb) !== r.wb) errs.push('Ciclo di WB: era ' + r.wb + '. Gli stalli delle istruzioni precedenti ritardano anche le successive.');
      for (const port of ['rs1', 'rs2']) {
        const d = r.deps.find((x) => x.port === port);
        const exp = d && d.how !== 'registri' ? d.how : '';
        if ((a[port] || '') !== exp) {
          const pr = d ? ex.sch.rows[d.from] : null;
          errs.push((port === 'rs1' ? 'Primo operando' : 'Secondo operando') + ': ' + (exp
            ? 'serviva il forwarding da ' + exp + ' (x' + d.reg + ' è prodotto da “' + text(pr.ins) + '”, che durante questo EX è in ' + (exp === 'EX/MEM' ? 'MEM' : 'WB') + ').'
            : d ? 'nessun forwarding: “' + text(pr.ins) + '” ha già scritto x' + d.reg + ' nel ciclo ' + pr.wb + ', e la lettura in ID nello stesso ciclo vede il valore nuovo.' : 'nessun forwarding: nessuna istruzione precedente scrive questo registro.'));
        }
      }
      return { label: (i + 1) + '. ' + text(r.ins), ok: errs.length === 0, detail: errs.length ? errs.join(' ') : 'Corretto.' };
    });
    return { score: items.filter((x) => x.ok).length / items.length, items };
  }

  ADE.pipeline = { OPS, parse, text, schedule, stageAt, tableHtml, comments, gen, genCount, grade };
})(typeof globalThis !== 'undefined' ? globalThis : this);
