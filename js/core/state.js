// Stato dello studio: un unico oggetto JSON, identico nel sito (localStorage)
// e nei comandi di chat (progress/state.json). Tutte le funzioni qui sono pure
// o modificano solo l'oggetto ricevuto: nessun accesso a DOM o disco.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;
  const S = ADE.scheduler;

  const VERSION = 1;
  const ERROR_KINDS = ['concetto', 'calcolo', 'distrazione'];

  function defaultState() {
    return {
      version: VERSION,
      updatedAt: null,
      settings: { theme: 'auto', phase: 1, examDate: '2026-11-18', phase2Date: null, newPerDay: 15 },
      items: {},     // id -> stato SM-2 (carte e generatori di esercizi)
      reviews: [],   // registro di ogni risposta: { d, kind, id, topic, ok, conf }
      errors: [],    // quaderno degli errori
      pretest: {},   // topic -> { d, score }
      exams: [],     // simulazioni d'esame: { d, phase, score, max, byTopic }
    };
  }

  /** Accetta un JSON importato e lo riporta alla forma corrente. */
  function normalize(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object') return base;
    if (raw.version > VERSION) throw new Error('File di stato creato da una versione più recente del sito.');
    const st = Object.assign(base, raw);
    st.settings = Object.assign(defaultState().settings, raw.settings || {});
    st.version = VERSION;
    for (const k of ['reviews', 'errors', 'exams']) if (!Array.isArray(st[k])) st[k] = [];
    for (const k of ['items', 'pretest']) if (!st[k] || typeof st[k] !== 'object') st[k] = {};
    return st;
  }

  /** Data d'esame della fase a cui appartiene un elemento (carta o esercizio): limita gli intervalli. */
  function examDateFor(state, item) {
    const phase = ADE.course && item && item.topic ? ADE.course.phaseOf(item.topic) : 1;
    return phase === 2 ? state.settings.phase2Date : state.settings.examDate;
  }

  function log(state, entry) {
    state.reviews.push(entry);
    state.updatedAt = new Date().toISOString();
  }

  /** Registra la risposta a una flashcard e aggiorna lo scheduler. q: 1/3/4/5, conf: 1..5. */
  function recordCard(state, card, q, conf, today) {
    state.items[card.id] = S.review(state.items[card.id], q, today, { examDate: examDateFor(state, card) });
    log(state, { d: today, kind: 'card', id: card.id, topic: card.topic, ok: q >= 3 ? 1 : 0, conf });
    return state.items[card.id];
  }

  /** Registra un esercizio (score 0..1). Anche i generatori hanno un loro intervallo. */
  function recordExercise(state, ex, score, conf, today) {
    const q = score >= 0.9 ? 4 : score >= 0.6 ? 3 : 1;
    state.items[ex.id] = S.review(state.items[ex.id], q, today, { examDate: examDateFor(state, ex) });
    log(state, { d: today, kind: ex.kind || 'ex', id: ex.id, topic: ex.topic, ok: +score.toFixed(2), conf });
    return state.items[ex.id];
  }

  function recordPretest(state, topic, score, answers, today) {
    state.pretest[topic] = { d: today, score: +score.toFixed(2) };
    for (const a of answers) log(state, { d: today, kind: 'pretest', id: a.id, topic, ok: a.ok ? 1 : 0, conf: a.conf });
  }

  function addError(state, e, today) {
    if (!ERROR_KINDS.includes(e.kind)) throw new Error('categoria errore non valida: ' + e.kind);
    const err = {
      id: 'e' + (state.errors.length + 1) + '-' + today,
      d: today, topic: e.topic, ref: e.ref, kind: e.kind, note: e.note || '',
      wins: 0, resolved: false, due: U.addDays(today, 1),
    };
    state.errors.push(err);
    state.updatedAt = new Date().toISOString();
    return err;
  }

  /** Esito di un nuovo tentativo su un errore: due successi di fila lo chiudono. */
  function retryError(state, id, ok, today) {
    const e = state.errors.find((x) => x.id === id);
    if (!e) throw new Error('errore non trovato: ' + id);
    if (ok) { e.wins += 1; e.resolved = e.wins >= 2; e.due = U.addDays(today, 2); }
    else { e.wins = 0; e.due = U.addDays(today, 1); }
    state.updatedAt = new Date().toISOString();
    return e;
  }

  /** Registra una simulazione d'esame conclusa. */
  function recordExam(state, exam, today) {
    state.exams.push(Object.assign({ d: today }, exam));
    state.updatedAt = new Date().toISOString();
  }

  /** Carte in scadenza oggi e carte mai viste (limitate da newPerDay). */
  function queue(state, cards, today) {
    const due = [], fresh = [];
    for (const c of cards) {
      const it = state.items[c.id];
      if (!it || !it.last) fresh.push(c);
      else if (S.isDue(it, today)) due.push(c);
    }
    const seenToday = new Set(state.reviews.filter((r) => r.d === today && r.kind === 'card').map((r) => r.id));
    const introduced = cards.filter((c) => seenToday.has(c.id) && state.items[c.id] && state.items[c.id].reps <= 1).length;
    const room = Math.max(0, state.settings.newPerDay - introduced);
    return { due, fresh: fresh.slice(0, room), freshTotal: fresh.length };
  }

  /**
   * Pratica alternata: riordina gli elementi in modo che due consecutivi
   * abbiano, quando possibile, un gruppo diverso (argomento o sotto-argomento).
   */
  function interleave(items, keyFn, rnd) {
    const groups = new Map();
    for (const it of items) {
      const k = keyFn(it);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(it);
    }
    if (rnd) for (const g of groups.values()) g.sort(() => rnd() - 0.5);
    const out = [];
    let last = null;
    while (out.length < items.length) {
      // Prende dal gruppo più pieno che non sia quello appena usato.
      const cand = [...groups.entries()].filter(([, g]) => g.length).sort((a, b) => b[1].length - a[1].length);
      const pick = cand.find(([k]) => k !== last) || cand[0];
      out.push(pick[1].shift());
      last = pick[0];
    }
    return out;
  }

  /** Padronanza di un argomento: media della ritenzione stimata sulle sue carte (0 se mai vista). */
  function mastery(state, topicCards, today) {
    if (!topicCards.length) return { value: 0, seen: 0, total: 0, decaying: 0 };
    let sum = 0, seen = 0, decaying = 0;
    for (const c of topicCards) {
      const it = state.items[c.id];
      if (it && it.last) {
        seen++;
        const r = it.reps === 0 ? 0.3 : S.retrievability(it, today);
        sum += r;
        if (S.isDue(it, today)) decaying++;
      }
    }
    return { value: sum / topicCards.length, seen, total: topicCards.length, decaying };
  }

  /** Calibrazione: per ogni livello di confidenza, quanto spesso la risposta era giusta. */
  function calibration(state) {
    const rows = [1, 2, 3, 4, 5].map((c) => ({ conf: c, n: 0, okSum: 0 }));
    for (const r of state.reviews) {
      if (!r.conf || r.kind === 'pretest') continue;
      rows[r.conf - 1].n++;
      rows[r.conf - 1].okSum += r.ok;
    }
    // Confidenza 1..5 letta come probabilità attesa 20%..100%.
    return rows.map((r) => ({ conf: r.conf, n: r.n, accuracy: r.n ? r.okSum / r.n : null, expected: r.conf / 5 }));
  }

  /** Illusioni di competenza: risposte date con confidenza alta (4-5) ma sbagliate. */
  function illusions(state) {
    const by = new Map();
    for (const r of state.reviews) {
      if (r.kind === 'pretest' || !(r.conf >= 4) || r.ok >= 0.6) continue;
      by.set(r.id, (by.get(r.id) || 0) + 1);
    }
    return [...by.entries()].map(([id, n]) => ({ id, n })).sort((a, b) => b.n - a.n);
  }

  function accuracy(state, filter) {
    const rs = state.reviews.filter((r) => r.kind !== 'pretest' && (!filter || filter(r)));
    if (!rs.length) return null;
    return rs.reduce((s, r) => s + r.ok, 0) / rs.length;
  }

  /** Giorni consecutivi di studio fino a oggi (o ieri, se oggi non hai ancora studiato). */
  function streak(state, today) {
    const days = new Set(state.reviews.map((r) => r.d));
    let d = days.has(today) ? today : U.addDays(today, -1);
    let n = 0;
    while (days.has(d)) { n++; d = U.addDays(d, -1); }
    return n;
  }

  ADE.state = {
    VERSION, ERROR_KINDS, defaultState, normalize, examDateFor, recordExam, recordCard, recordExercise, recordPretest,
    addError, retryError, queue, interleave, mastery, calibration, illusions, accuracy, streak,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
