// Piano di studio calcolato a ritroso dalla data d'esame.
// Funzione pura: stessi dati in ingresso, stesso piano. Si ricalcola a ogni apertura,
// quindi cambia da solo man mano che la padronanza degli argomenti cresce.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;

  /**
   * @param p.today, p.examDate  YYYY-MM-DD
   * @param p.topics   argomenti della fase, già in ordine di dipendenza: { id, title, weight, ready }
   * @param p.mastery  { topicId: 0..1 }
   * @returns { days: [{ date, blocks: [{ type, topic?, title, min }] }], warnings: [] }
   * Regole:
   *  - gli ultimi 2 giorni prima dell'esame sono riservati a simulazioni ed errori;
   *  - ogni giorno inizia con il ripasso in scadenza (richiamo distanziato);
   *  - gli argomenti nuovi sono distribuiti in proporzione al peso nell'esame;
   *  - blocchi brevi (25-45 minuti) e alternati, mai due blocchi "nuovo" di fila.
   */
  function buildPlan(p) {
    const left = U.diffDays(p.today, p.examDate);
    const warnings = [];
    if (left <= 0) return { days: [], warnings: ['La data d\'esame è oggi o è passata: imposta la prossima data in Dati.'] };

    const finalDays = left >= 5 ? 2 : left >= 2 ? 1 : 0;
    const learnDays = Math.max(1, left - finalDays);
    const todo = p.topics.filter((t) => (p.mastery[t.id] || 0) < 0.6);
    const weak = p.topics.filter((t) => (p.mastery[t.id] || 0) >= 0.6 && p.mastery[t.id] < 0.8);

    // Ripartizione per peso: ogni argomento occupa "weight" unità; si riempiono i giorni in ordine.
    const totalW = todo.reduce((s, t) => s + t.weight, 0);
    const perDay = totalW / learnDays;
    if (perDay > 4) warnings.push('Carico alto: ' + todo.length + ' argomenti in ' + learnDays + ' giorni. Dai priorità a quelli con più punti (cache, memorie esterne).');
    const days = [];
    let cursor = 0, acc = 0;
    for (let d = 0; d < left; d++) {
      const date = U.addDays(p.today, d);
      const blocks = [{ type: 'ripasso', title: 'Ripasso in scadenza (carte mescolate)', min: 25 }];
      if (d < learnDays) {
        const target = perDay * (d + 1);
        const todays = [];
        while (cursor < todo.length && (acc + todo[cursor].weight / 2 <= target || d === learnDays - 1)) {
          todays.push(todo[cursor]); acc += todo[cursor].weight; cursor++;
        }
        todays.forEach((t, k) => {
          blocks.push({ type: 'nuovo', topic: t.id, title: t.title + (t.ready ? '' : ' (contenuti in arrivo)'), min: t.weight >= 2 ? 45 : 30 });
          // Alternanza: dopo ogni argomento nuovo, pratica su argomenti già visti.
          if (k < todays.length - 1 || d > 0) blocks.push({ type: 'esercizi', title: 'Esercizi misti sugli argomenti già visti', min: 25 });
        });
        if (!todays.length) {
          const w = weak[d % Math.max(1, weak.length)];
          blocks.push({ type: 'esercizi', title: 'Esercizi misti' + (w ? ', con priorità a ' + w.title : ''), min: 40 });
          blocks.push({ type: 'aperte', title: 'Due domande aperte scritte a tempo (10 minuti l\'una)', min: 25 });
        }
        blocks.push({ type: 'errori', title: 'Quaderno degli errori', min: 15 });
      } else {
        blocks.push({ type: 'simulazione', title: 'Simulazione d\'esame completa (90 minuti)', min: 90 });
        blocks.push({ type: 'errori', title: 'Correzione e quaderno degli errori', min: 30 });
      }
      days.push({ date, blocks, total: blocks.reduce((s, b) => s + b.min, 0) });
    }
    return { days, warnings };
  }

  ADE.plan = { buildPlan };
})(typeof globalThis !== 'undefined' ? globalThis : this);
