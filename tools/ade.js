#!/usr/bin/env node
// Riga di comando usata dai comandi di chat (.claude/commands). Legge e scrive
// progress/state.json con le stesse funzioni del sito, così i due restano coerenti.
// Uso: node tools/ade.js <comando> [argomenti]   (senza argomenti stampa l'elenco)
const fs = require('node:fs');
const path = require('node:path');
const ADE = require('../tests/helper');
const { util: U, state: ST, plan: PLAN, cache: C, course } = ADE;

const FILE = path.join(__dirname, '..', 'progress', 'state.json');
const today = process.env.ADE_TODAY || U.todayStr();
const load = () => ST.normalize(fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : null);
const save = (st) => fs.writeFileSync(FILE, JSON.stringify(st, null, 2) + '\n');
const out = (x) => console.log(JSON.stringify(x, null, 2));
const cardsOf = (id) => course.cards.filter((c) => c.topic === id);
const need = (v, msg) => { if (v === undefined || v === '' || Number.isNaN(v)) { console.error('Errore: ' + msg); process.exit(1); } return v; };

const cmds = {
  /** Riepilogo: scadenze, padronanza per argomento, errori aperti, calibrazione. */
  stato() {
    const st = load();
    const q = ST.queue(st, course.cards, today);
    out({
      oggi: today, esame: st.settings.examDate, giorniAllEsame: U.diffDays(today, st.settings.examDate),
      carteInScadenza: q.due.length, carteNuoveOggi: q.fresh.length, maiViste: q.freshTotal,
      serie: ST.streak(st, today), accuratezza: ST.accuracy(st),
      argomenti: course.topics.filter((t) => t.ready).map((t) => Object.assign({ id: t.id }, ST.mastery(st, cardsOf(t.id), today))),
      erroriAperti: st.errors.filter((e) => !e.resolved),
      calibrazione: ST.calibration(st), illusioni: ST.illusions(st),
    });
  },
  /** Carte da fare oggi, già mescolate (interleaving). Argomento facoltativo. */
  scadenze(topicId) {
    const st = load();
    const pool = topicId ? cardsOf(topicId) : course.cards;
    const q = ST.queue(st, pool, today);
    out(ST.interleave(q.due.concat(q.fresh), (c) => c.topic + '/' + c.sub, Math.random));
  },
  /** Tutte le carte, domande aperte e pre-test di un argomento (per /studia e /quiz). */
  argomento(topicId) {
    need(course.pages[topicId], 'argomento senza contenuti: ' + topicId);
    out({ pagina: course.pages[topicId], pretest: course.pretests[topicId], aperte: course.open[topicId], carte: cardsOf(topicId), generatori: course.generators.filter((g) => g.topic === topicId) });
  },
  /** voto <idCarta> <1|3|4|5> <confidenza 1-5> */
  voto(id, q, conf) {
    const st = load();
    const card = need(course.cards.find((c) => c.id === id), 'carta inesistente: ' + id);
    out(ST.recordCard(st, card, Number(q), need(Number(conf), 'confidenza mancante'), today));
    save(st);
  },
  /** esercizio <id> <punteggio 0-1> <confidenza 1-5>: per generatori (gen:...) e domande aperte (open-...). */
  esercizio(id, score, conf) {
    const st = load();
    const gen = course.generators.find((g) => g.id === id);
    const open = Object.entries(course.open).flatMap(([t, qs]) => qs.map((o) => ({ id: o.id, topic: t, kind: 'open' }))).find((o) => o.id === id);
    const ex = need(gen || open, 'esercizio inesistente: ' + id);
    out(ST.recordExercise(st, ex, need(Number(score), 'punteggio mancante'), need(Number(conf), 'confidenza mancante'), today));
    save(st);
  },
  /** pretest <argomento> <punteggio 0-1> */
  pretest(topicId, score) { const st = load(); ST.recordPretest(st, topicId, Number(score), [], today); save(st); out(st.pretest[topicId]); },
  /** errore <argomento> <riferimento> <concetto|calcolo|distrazione> [nota...] */
  errore(topicId, ref, kind, ...note) { const st = load(); out(ST.addError(st, { topic: topicId, ref, kind, note: note.join(' ') }, today)); save(st); },
  /** riprova <idErrore> <1|0> */
  riprova(id, ok) { const st = load(); out(ST.retryError(st, id, ok === '1', today)); save(st); },
  /** Piano di studio ricalcolato sullo stato attuale. */
  piano() {
    const st = load();
    const mastery = {};
    course.topics.forEach((t) => { mastery[t.id] = ST.mastery(st, cardsOf(t.id), today).value; });
    out(PLAN.buildPlan({ today, examDate: st.settings.examDate, topics: course.topics.filter((t) => t.phase === 1), mastery }));
  },
  /** genera <traccia|campi> [seme]: esercizio con soluzione e spiegazione passo-passo. */
  genera(type, seed) {
    seed = seed ? Number(seed) : Math.floor(Math.random() * 1e9);
    if (type === 'campi') return out(C.genFields(seed));
    const ex = C.genTrace(seed);
    out({ seed, testo: ex.text, cfg: ex.cfg,
      accessi: ex.accesses.map((a) => ({ ind: U.hex(a.addr, 3), bin: U.bin(a.addr, 12), op: a.op, byte: a.op === 's' ? U.hex(a.data) : undefined })),
      memoria: Object.fromEntries(Object.entries(ex.memory).map(([a, b]) => [U.hex(Number(a), 3), U.hex(b)])),
      soluzione: ex.sim.steps.map((s) => ({ passo: s.i + 1, hit: s.hit, set: s.set, linea: s.way, memoria: C.memStr(s), spiegazione: C.explainStep(ex.cfg, s),
        cache: s.after.map((set) => set.map((l) => C.lineStr(l) + (l.valid ? ' tag ' + U.bin(l.tag, ex.cfg.tagBits) : ''))) })) });
  },
};

const [name, ...args] = process.argv.slice(2);
if (!cmds[name]) { console.log('Comandi: ' + Object.keys(cmds).join(', ') + '\nStato: ' + FILE); process.exit(name ? 1 : 0); }
cmds[name](...args);
