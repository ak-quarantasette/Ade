// Mappa del corso, divisa in due fasi nettamente separate:
//   fase 1 = argomenti del primo compitino, fase 2 = argomenti del secondo.
// L'ordine dell'elenco rispetta le dipendenze (un test lo verifica).
// "weight" è il peso stimato nel compitino (vedi ASSUNZIONI.md, A2).
(function (root) {
  const ADE = (root.ADE = root.ADE || {});

  const phases = {
    1: { id: 1, title: 'Primo compitino', short: '1ª parte', dateKey: 'examDate' },
    2: { id: 2, title: 'Secondo compitino', short: '2ª parte', dateKey: 'phase2Date' },
  };

  const T = (id, phase, short, title, deps, weight) => ({ id, phase, short, title, deps, weight, ready: false });
  const topics = [
    // ---- Fase 1: primo compitino ----
    T('intro', 1, 'Concetti base', 'Concetti base ed evoluzione dei calcolatori', [], 1),
    T('notazione', 1, 'Notazione e Boole', 'Notazione binaria, ottale, esadecimale e algebra di Boole', [], 1),
    T('componenti', 1, 'Componenti e interrupt', 'Componenti, ciclo fetch-execute e interruzioni', ['intro'], 1.5),
    T('bus', 1, 'Bus', 'Bus', ['componenti'], 1),
    T('qpi', 1, 'QPI', 'QuickPath Interconnect (QPI)', ['bus'], 1),
    T('cache', 1, 'Gerarchie e cache', 'Gerarchie di memoria e cache', ['componenti', 'notazione'], 3),
    T('mem-interne', 1, 'Memorie interne', 'Memorie interne e codice di Hamming', ['cache'], 2),
    T('mem-esterne', 1, 'Dischi, RAID, CD', 'Memorie esterne: dischi magnetici, RAID, CD-ROM', ['cache'], 2),
    T('ssd', 1, 'SSD', 'Dischi SSD', ['mem-interne', 'mem-esterne'], 1),
    T('io', 1, 'Gestione I/O', 'Gestione dell\'I/O', ['componenti', 'bus'], 1),
    // ---- Fase 2: secondo compitino ----
    T('aritmetica', 2, 'Aritmetica', 'Aritmetica del calcolatore', [], 1.5),
    T('virgola-mobile', 2, 'IEEE 754', 'Numeri reali e virgola mobile IEEE 754', ['aritmetica'], 2),
    T('linguaggio-macchina', 2, 'Linguaggio macchina', 'Linguaggio macchina', [], 1),
    T('indirizzamento', 2, 'Indirizzamento', 'Modi di indirizzamento', ['linguaggio-macchina'], 1.5),
    T('processore', 2, 'Processore', 'Struttura e funzione del processore', ['indirizzamento'], 1),
    T('pipeline', 2, 'Pipeline', 'Pipeline: hazard, stalli, forwarding', ['processore'], 3),
    T('risc-cisc', 2, 'RISC e CISC', 'RISC e CISC', ['pipeline'], 1),
    T('multicore', 2, 'Multicore', 'Processori multicore', ['pipeline'], 1),
  ];

  const course = { phases, topics, cards: [], pages: {}, pretests: {}, open: {}, mcq: {}, generators: [] };

  /**
   * Registra i contenuti di un argomento in forma compatta.
   * def.src:   { chiave: 'Titolo dispensa, pag. ' } prefissi delle fonti
   * def.cards: [[id, sub, domanda, risposta, 'chiave:pagine', perché?]]
   * def.mcq:   [[domanda, [opzioni], indiceGiusta, spiegazione, 'chiave:pagine']]
   *            le prime 4 fanno anche da pre-test; tutte entrano nel simulatore d'esame
   * def.open:  [[id, domanda, [punti della griglia], 'chiave:pagine']]
   */
  course.define = function (id, def) {
    const t = topics.find((x) => x.id === id);
    if (!t) throw new Error('argomento sconosciuto: ' + id);
    const src = (s) => String(s).split(';').map((part) => {
      const [k, p] = part.trim().split(':');
      if (!def.src[k]) throw new Error(id + ': fonte sconosciuta "' + k + '"');
      return def.src[k] + p;
    }).join('; ');
    t.ready = true;
    course.pages[id] = { intro: def.intro, sections: def.sections.map((s) => Object.assign({}, s, { src: src(s.src) })) };
    (def.cards || []).forEach(([cid, sub, q, a, s, why]) => course.cards.push({ id: id + '-' + cid, topic: id, sub, q, a, src: src(s), why }));
    course.mcq[id] = (def.mcq || []).map(([q, opts, ok, why, s], i) => ({ id: 'mcq-' + id + '-' + (i + 1), topic: id, q, opts, ok, why, src: src(s) }));
    course.pretests[id] = course.mcq[id].slice(0, 4);
    course.open[id] = (def.open || []).map(([oid, q, points, s]) => ({ id: 'open-' + id + '-' + oid, topic: id, q, points, src: src(s) }));
    (def.generators || []).forEach((g) => course.generators.push(Object.assign({ topic: id, kind: 'ex' }, g)));
  };

  course.topicsOf = (phase) => topics.filter((t) => t.phase === phase);
  course.phaseOf = (topicId) => (topics.find((t) => t.id === topicId) || {}).phase;

  ADE.course = course;
})(typeof globalThis !== 'undefined' ? globalThis : this);
