const test = require('node:test');
const assert = require('node:assert/strict');
const ADE = require('./helper');
const { scheduler: S, state: ST, plan: P, util: U } = ADE;

test('date: somma e differenza di giorni', () => {
  assert.equal(U.addDays('2026-11-09', 9), '2026-11-18');
  assert.equal(U.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(U.diffDays('2026-11-09', '2026-11-18'), 9);
});

test('SM-2: gli intervalli si allungano con risposte giuste e si azzerano con un errore', () => {
  let c = S.review(undefined, 4, '2026-01-01');
  assert.equal(c.interval, 1);
  c = S.review(c, 4, c.due);
  assert.equal(c.interval, 3);
  c = S.review(c, 4, c.due);
  assert.ok(c.interval >= 7, 'terzo intervallo ≈ 3 × EF');
  const before = c.interval;
  c = S.review(c, 4, c.due);
  assert.ok(c.interval > before);
  const ef = c.ef;
  c = S.review(c, 1, c.due);
  assert.equal(c.interval, 1);
  assert.equal(c.reps, 0);
  assert.equal(c.lapses, 1);
  assert.ok(c.ef < ef && c.ef >= 1.3);
});

test('SM-2: "difficile" cresce meno di "bene", "facile" di più; EF non scende sotto 1.3', () => {
  const base = { ef: 2.5, interval: 6, reps: 3, lapses: 0, last: '2026-01-01', due: '2026-01-07' };
  const h = S.review(base, 3, '2026-01-07'), g = S.review(base, 4, '2026-01-07'), e = S.review(base, 5, '2026-01-07');
  assert.ok(h.interval < g.interval && g.interval <= e.interval);
  let c = base;
  for (let i = 0; i < 20; i++) c = S.review(c, 1, '2026-01-07');
  assert.equal(c.ef, 1.3);
  assert.throws(() => S.review(base, 2, '2026-01-07'));
});

test('SM-2: nessuna scadenza supera il giorno prima dell\'esame', () => {
  let c = { ef: 2.8, interval: 20, reps: 5, lapses: 0, last: '2026-11-01', due: '2026-11-09' };
  c = S.review(c, 5, '2026-11-09', { examDate: '2026-11-18' });
  assert.ok(U.diffDays(c.due, '2026-11-18') >= 1, 'scade prima dell\'esame: ' + c.due);
  // Dopo l'esame il tetto non si applica.
  c = S.review(c, 5, '2026-11-20', { examDate: '2026-11-18' });
  assert.ok(c.interval > 8);
});

test('ritenzione stimata: 0.9 allo scadere dell\'intervallo, decresce col tempo', () => {
  const c = { interval: 4, last: '2026-01-01', reps: 2 };
  assert.ok(Math.abs(S.retrievability(c, '2026-01-05') - 0.9) < 1e-9);
  assert.ok(S.retrievability(c, '2026-01-20') < S.retrievability(c, '2026-01-06'));
  assert.equal(S.retrievability(undefined, '2026-01-01'), 0);
});

test('stato: registrazione, coda del giorno, calibrazione, illusioni, serie', () => {
  const st = ST.defaultState();
  const cards = [1, 2, 3, 4].map((i) => ({ id: 'c' + i, topic: 't', sub: i % 2 ? 'a' : 'b' }));
  let q = ST.queue(st, cards, '2026-11-09');
  assert.equal(q.fresh.length, 4);
  assert.equal(q.due.length, 0);
  ST.recordCard(st, cards[0], 4, 5, '2026-11-09');
  ST.recordCard(st, cards[1], 1, 5, '2026-11-09');
  ST.recordCard(st, cards[2], 4, 2, '2026-11-09');
  q = ST.queue(st, cards, '2026-11-10');
  assert.deepEqual(q.due.map((c) => c.id).sort(), ['c1', 'c2', 'c3']);
  assert.equal(q.fresh.length, 1);
  const cal = ST.calibration(st);
  assert.equal(cal[4].n, 2);
  assert.equal(cal[4].accuracy, 0.5);
  assert.equal(cal[1].accuracy, 1);
  assert.deepEqual(ST.illusions(st), [{ id: 'c2', n: 1 }]);
  assert.equal(ST.streak(st, '2026-11-09'), 1);
  assert.equal(ST.streak(st, '2026-11-10'), 1);
  assert.equal(ST.streak(st, '2026-11-11'), 0);
  const m = ST.mastery(st, cards, '2026-11-09');
  assert.equal(m.seen, 3);
  assert.ok(m.value > 0 && m.value < 1);
});

test('stato: import/normalizzazione e quaderno degli errori', () => {
  const st = ST.normalize(JSON.parse(JSON.stringify(ST.defaultState())));
  assert.deepEqual(st, ST.defaultState());
  assert.throws(() => ST.normalize({ version: 99 }));
  assert.equal(ST.normalize({ settings: { theme: 'dark' } }).settings.examDate, '2026-11-18');
  const e = ST.addError(st, { topic: 'cache', ref: 'c1', kind: 'calcolo', note: 'x' }, '2026-11-09');
  assert.equal(e.due, '2026-11-10');
  assert.throws(() => ST.addError(st, { kind: 'sfortuna' }, '2026-11-09'));
  ST.retryError(st, e.id, true, '2026-11-10');
  assert.equal(st.errors[0].resolved, false);
  ST.retryError(st, e.id, false, '2026-11-11');
  assert.equal(st.errors[0].wins, 0);
  ST.retryError(st, e.id, true, '2026-11-12');
  ST.retryError(st, e.id, true, '2026-11-14');
  assert.equal(st.errors[0].resolved, true);
});

test('interleaving: mai due elementi dello stesso gruppo di fila quando è evitabile', () => {
  const items = [];
  for (const g of ['a', 'b', 'c']) for (let i = 0; i < 4; i++) items.push({ g, i });
  const out = ST.interleave(items, (x) => x.g);
  assert.equal(out.length, 12);
  for (let i = 1; i < out.length; i++) assert.notEqual(out[i].g, out[i - 1].g);
  // Con un gruppo dominante l'alternanza è impossibile, ma non si perde nulla.
  const skew = [{ g: 'a' }, { g: 'a' }, { g: 'a' }, { g: 'b' }];
  assert.equal(ST.interleave(skew, (x) => x.g).length, 4);
});

test('piano: copre tutti gli argomenti prima dell\'esame e si adatta alla padronanza', () => {
  const topics = ADE.course.topics.filter((t) => t.phase === 1);
  const plan = P.buildPlan({ today: '2026-11-09', examDate: '2026-11-18', topics, mastery: {} });
  assert.equal(plan.days.length, 9);
  assert.equal(plan.days[8].date, '2026-11-17');
  const planned = plan.days.flatMap((d) => d.blocks).filter((b) => b.type === 'nuovo').map((b) => b.topic);
  assert.deepEqual(planned, topics.map((t) => t.id), 'tutti, una volta, in ordine di dipendenza');
  assert.ok(plan.days.slice(-2).every((d) => d.blocks.some((b) => b.type === 'simulazione')));
  assert.ok(plan.days.slice(-2).every((d) => !d.blocks.some((b) => b.type === 'nuovo')));
  assert.ok(plan.days.every((d) => d.blocks[0].type === 'ripasso'));
  // Un argomento già padroneggiato non viene ripianificato come nuovo.
  const p2 = P.buildPlan({ today: '2026-11-12', examDate: '2026-11-18', topics, mastery: { cache: 0.9 } });
  assert.ok(!p2.days.flatMap((d) => d.blocks).some((b) => b.type === 'nuovo' && b.topic === 'cache'));
  assert.equal(P.buildPlan({ today: '2026-11-19', examDate: '2026-11-18', topics, mastery: {} }).days.length, 0);
});

test('contenuti: ogni carta ha fonte, argomento esistente e id unico', () => {
  const ids = new Set();
  const topicIds = new Set(ADE.course.topics.map((t) => t.id));
  assert.ok(ADE.course.cards.length >= 20);
  for (const c of ADE.course.cards) {
    assert.ok(!ids.has(c.id), 'id duplicato ' + c.id);
    ids.add(c.id);
    assert.ok(topicIds.has(c.topic), c.id);
    assert.ok(c.q && c.a && c.src && c.sub, 'carta incompleta ' + c.id);
  }
  for (const t of ADE.course.topics) for (const d of t.deps) assert.ok(topicIds.has(d), t.id + ' dipende da ' + d);
  // Le dipendenze precedono sempre l'argomento (ordine topologico).
  const pos = new Map(ADE.course.topics.map((t, i) => [t.id, i]));
  for (const t of ADE.course.topics) for (const d of t.deps) assert.ok(pos.get(d) < pos.get(t.id));
});

test('fasi: ogni argomento appartiene a una sola parte e le dipendenze non attraversano le parti', () => {
  const c = ADE.course;
  assert.deepEqual([...new Set(c.topics.map((t) => t.phase))].sort(), [1, 2]);
  for (const t of c.topics) for (const d of t.deps) assert.equal(c.phaseOf(d), t.phase, t.id + ' dipende da ' + d + ', che è nell\'altra parte');
  for (const t of c.topics) assert.ok(t.ready, 'argomento senza contenuti: ' + t.id);
  // La data limite degli intervalli è quella del compitino giusto.
  const st = ST.defaultState();
  st.settings.phase2Date = '2027-01-20';
  assert.equal(ST.examDateFor(st, { topic: 'cache' }), '2026-11-18');
  assert.equal(ST.examDateFor(st, { topic: 'pipeline' }), '2027-01-20');
});

test('contenuti: scelta multipla, domande aperte, pagine ed esercizi sono completi per ogni argomento', () => {
  const c = ADE.course;
  for (const t of c.topics) {
    assert.ok(c.pages[t.id].sections.length >= 3, t.id);
    for (const s of c.pages[t.id].sections) assert.ok(s.src && s.html && s.title, t.id);
    assert.ok(c.cards.filter((x) => x.topic === t.id).length >= 6, 'poche carte: ' + t.id);
    assert.ok(c.mcq[t.id].length >= 4 && c.pretests[t.id].length === 4, t.id);
    for (const q of c.mcq[t.id]) { assert.ok(q.ok >= 0 && q.ok < q.opts.length && q.why && q.src && q.topic === t.id, q.id); assert.equal(new Set(q.opts).size, q.opts.length, 'opzioni duplicate ' + q.id); }
    for (const o of c.open[t.id]) assert.ok(o.points.length >= 5 && o.src && o.topic === t.id, o.id);
  }
  const ids = new Set();
  for (const x of [].concat(c.cards, Object.values(c.mcq).flat(), Object.values(c.open).flat(), c.generators)) { assert.ok(!ids.has(x.id), 'id duplicato ' + x.id); ids.add(x.id); }
  // Ogni generatore elencato ha un esercizio registrato (la traccia di cache ha una pagina dedicata).
  for (const g of c.generators) if (g.sub !== 'traccia') {
    const R = ADE.exercises[g.sub];
    assert.ok(R && R.id === g.id, 'esercizio non registrato: ' + g.sub);
    const ex = R.make(123);
    assert.ok(R.prompt(ex).length > 20 && Array.isArray(R.fields(ex)) && R.steps(ex).length > 0, g.sub);
  }
  // Il simulatore ha abbastanza materiale in entrambe le parti: 4 argomenti con domande aperte e almeno una scelta multipla.
  for (const p of [1, 2]) assert.ok(c.topicsOf(p).filter((t) => c.open[t.id].length).length >= 4, 'parte ' + p);
});
