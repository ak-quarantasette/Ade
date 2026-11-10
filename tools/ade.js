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
// Fase su cui lavorare: 1 = primo compitino, 2 = secondo. Si prende dallo stato (settings.phase),
// oppure si forza con la variabile d'ambiente ADE_FASE.
const phaseOf = (st) => Number(process.env.ADE_FASE) || st.settings.phase || 1;
const inPhase = (st, topicId) => course.phaseOf(topicId) === phaseOf(st);
const active = (st) => course.cards.filter((c) => inPhase(st, c.topic) && (st.pretest[c.topic] || (st.items[c.id] && st.items[c.id].last)));
const load = () => ST.normalize(fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : null);
const save = (st) => fs.writeFileSync(FILE, JSON.stringify(st, null, 2) + '\n');
const out = (x) => console.log(JSON.stringify(x, null, 2));
const cardsOf = (id) => course.cards.filter((c) => c.topic === id);
const need = (v, msg) => { if (v === undefined || v === '' || Number.isNaN(v)) { console.error('Errore: ' + msg); process.exit(1); } return v; };

const cmds = {
  /** Riepilogo: scadenze, padronanza per argomento, errori aperti, calibrazione. */
  stato() {
    const st = load();
    const q = ST.queue(st, active(st), today);
    const date = st.settings[course.phases[phaseOf(st)].dateKey];
    out({
      oggi: today, fase: phaseOf(st), compitino: course.phases[phaseOf(st)].title, esame: date, giorniAllEsame: date ? U.diffDays(today, date) : null,
      carteInScadenza: q.due.length, carteNuoveOggi: q.fresh.length, maiViste: q.freshTotal,
      serie: ST.streak(st, today), accuratezza: ST.accuracy(st),
      argomenti: course.topicsOf(phaseOf(st)).filter((t) => t.ready).map((t) => Object.assign({ id: t.id }, ST.mastery(st, cardsOf(t.id), today))),
      erroriAperti: st.errors.filter((e) => !e.resolved && inPhase(st, e.topic)),
      simulazioni: st.exams.filter((e) => e.phase === phaseOf(st)),
      calibrazione: ST.calibration(st), illusioni: ST.illusions(st),
    });
  },
  /** Carte da fare oggi, già mescolate (interleaving). Argomento facoltativo. */
  scadenze(topicId) {
    const st = load();
    const pool = topicId ? cardsOf(topicId) : active(st);
    const q = ST.queue(st, pool, today);
    out(ST.interleave(q.due.concat(q.fresh), (c) => c.topic + '/' + c.sub, Math.random));
  },
  /** Tutte le carte, domande aperte e pre-test di un argomento (per /studia e /quiz). */
  argomento(topicId) {
    need(course.pages[topicId], 'argomento senza contenuti: ' + topicId);
    out({ fase: course.phaseOf(topicId), pagina: course.pages[topicId], pretest: course.pretests[topicId], sceltaMultipla: course.mcq[topicId], aperte: course.open[topicId], carte: cardsOf(topicId), generatori: course.generators.filter((g) => g.topic === topicId) });
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
    const date = st.settings[course.phases[phaseOf(st)].dateKey];
    if (!date) return out({ days: [], warnings: ['Data del ' + course.phases[phaseOf(st)].title.toLowerCase() + ' non impostata (settings.' + course.phases[phaseOf(st)].dateKey + ').'] });
    out(PLAN.buildPlan({ today, examDate: date, topics: course.topicsOf(phaseOf(st)), mastery }));
  },
  /** fase [1|2]: mostra o cambia il compitino su cui si sta lavorando. */
  fase(n) { const st = load(); if (n) { st.settings.phase = Number(n) === 2 ? 2 : 1; save(st); } out({ fase: st.settings.phase, compitino: course.phases[st.settings.phase].title, argomenti: course.topicsOf(st.settings.phase).map((t) => t.id) }); },
  /** data <1|2> <YYYY-MM-DD>: imposta la data di un compitino. */
  data(n, d) { const st = load(); st.settings[course.phases[Number(n)].dateKey] = need(d, 'data mancante'); save(st); out(st.settings); },
  /** esercizi: elenco dei generatori della fase corrente. */
  esercizi() { const st = load(); out(course.generators.filter((g) => inPhase(st, g.topic)).map((g) => ({ id: g.id, tipo: g.sub, titolo: g.title, argomento: g.topic }))); },
  /** genera <tipo> [seme]: esercizio con soluzione e procedimento (tipi: vedi "esercizi"). */
  genera(type, seed) {
    seed = seed ? Number(seed) : Math.floor(Math.random() * 1e9);
    const R = ADE.exercises[type];
    if (R) {
      const ex = R.make(seed);
      const strip = (h) => String(h).replace(/<\/(p|li|pre|tr)>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').trim();
      return out({ tipo: type, seed, consegna: strip(R.prompt(ex)), campi: R.fields(ex).map((f) => f.label), procedimento: R.steps(ex), esercizio: ex.sch ? { programma: ex.prog.map(ADE.pipeline.text), cicli: ex.sch.cycles, cicliSenzaForwarding: ex.none && ex.none.cycles, righe: ex.sch.rows.map((r) => ({ istr: ADE.pipeline.text(r.ins), stalli: r.stalls, ex: r.ex, wb: r.wb })) } : { risposta: ex.answer, dettagli: ex.enc || ex.solution || undefined } });
    }
    need(type === 'traccia' ? 1 : undefined, 'tipo sconosciuto: ' + type + ' (usa "esercizi" per l\'elenco)');
    const ex = C.genTrace(seed);
    out({ seed, testo: ex.text, cfg: ex.cfg,
      accessi: ex.accesses.map((a) => ({ ind: U.hex(a.addr, 3), bin: U.bin(a.addr, 12), op: a.op, byte: a.op === 's' ? C.dataStr(a.data) : undefined })),
      memoria: Object.fromEntries(Object.entries(ex.memory).map(([a, b]) => [U.hex(Number(a), 3), U.hex(b)])),
      soluzione: ex.sim.steps.map((s) => ({ passo: s.i + 1, hit: s.hit, set: s.set, linea: s.way, memoria: C.memStr(s), spiegazione: C.explainStep(ex.cfg, s),
        cache: s.after.map((set) => set.map((l) => C.lineStr(l) + (l.valid ? ' tag ' + U.bin(l.tag, ex.cfg.tagBits) : ''))) })) });
  },
};

const [name, ...args] = process.argv.slice(2);
if (!cmds[name]) { console.log('Comandi: ' + Object.keys(cmds).join(', ') + '\nStato: ' + FILE); process.exit(name ? 1 : 0); }
cmds[name](...args);
