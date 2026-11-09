// Ripetizione distanziata: SM-2 (Wozniak, 1990) con due adattamenti dichiarati in METODO.md:
//  1. quattro voti invece di sei (1 = sbagliato, 3 = difficile, 4 = bene, 5 = facile);
//  2. gli intervalli sono limitati dalla data d'esame, così ogni carta torna almeno
//     una volta prima del compitino.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;

  const GRADES = [1, 3, 4, 5];

  function initCard() {
    return { ef: 2.5, interval: 0, reps: 0, lapses: 0, due: null, last: null };
  }

  /**
   * Aggiorna una carta dopo una risposta.
   * @param card  stato precedente (non viene modificato)
   * @param q     voto: 1, 3, 4 o 5
   * @param today YYYY-MM-DD
   * @param opts  { examDate } facoltativo
   */
  function review(card, q, today, opts) {
    if (!GRADES.includes(q)) throw new Error('voto non valido: ' + q);
    const c = Object.assign(initCard(), card);
    const prev = c.interval;
    // Formula SM-2 per il fattore di facilità, con minimo 1.3.
    c.ef = Math.max(1.3, +(c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))).toFixed(4));

    if (q < 3) {
      c.reps = 0;
      c.lapses += 1;
      c.interval = 1;
    } else {
      c.reps += 1;
      if (c.reps === 1) c.interval = 1;
      else if (c.reps === 2) c.interval = 3;
      else c.interval = Math.max(prev + 1, Math.round(prev * (q === 3 ? 1.2 : c.ef)));
      if (q === 5 && c.reps <= 2) c.interval += 1;
    }

    // Tetto legato all'esame: l'ultima ripetizione deve cadere al più tardi il giorno prima.
    const exam = opts && opts.examDate;
    if (exam) {
      const left = U.diffDays(today, exam);
      if (left > 1) c.interval = Math.min(c.interval, left - 1);
    }
    c.last = today;
    c.due = U.addDays(today, c.interval);
    return c;
  }

  /**
   * Stima della probabilità di ricordare oggi (0..1).
   * Euristica: decadimento esponenziale tarato perché valga 0.9 allo scadere dell'intervallo.
   * È una stima grossolana, non una misura: serve solo a ordinare cosa sta decadendo.
   */
  function retrievability(card, today) {
    if (!card || !card.last) return 0;
    const t = Math.max(0, U.diffDays(card.last, today));
    return Math.pow(0.9, t / Math.max(1, card.interval));
  }

  function isDue(card, today) {
    return !!(card && card.due && U.diffDays(card.due, today) >= 0);
  }

  ADE.scheduler = { GRADES, initCard, review, retrievability, isDue };
})(typeof globalThis !== 'undefined' ? globalThis : this);
