// Mappa del corso. L'ordine dell'elenco rispetta le dipendenze (ogni argomento
// viene dopo quelli da cui dipende): un test lo verifica.
// "weight" è il peso stimato nel compitino (vedi ASSUNZIONI.md, A2); "ready" indica
// se i contenuti dell'argomento sono già nel sito.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});

  const topics = [
    // ---- Fase 1: primo compitino ----
    { id: 'intro', short: 'Concetti base', phase: 1, title: 'Concetti base ed evoluzione dei calcolatori', deps: [], weight: 1, ready: false },
    { id: 'notazione', short: 'Notazione e Boole', phase: 1, title: 'Notazione binaria, ottale, esadecimale e algebra di Boole', deps: [], weight: 1, ready: false },
    { id: 'componenti', short: 'Componenti e interrupt', phase: 1, title: 'Componenti, ciclo fetch-execute e interrupt', deps: ['intro'], weight: 1.5, ready: false },
    { id: 'bus', short: 'Bus', phase: 1, title: 'Bus', deps: ['componenti'], weight: 1, ready: false },
    { id: 'qpi', short: 'QPI', phase: 1, title: 'QuickPath Interconnect (QPI)', deps: ['bus'], weight: 1, ready: false },
    { id: 'cache', short: 'Gerarchie e cache', phase: 1, title: 'Gerarchie di memoria e cache', deps: ['componenti', 'notazione'], weight: 3, ready: true },
    { id: 'mem-interne', short: 'Memorie interne', phase: 1, title: 'Memorie interne e codice di Hamming', deps: ['cache'], weight: 2, ready: false },
    { id: 'mem-esterne', short: 'Dischi magnetici', phase: 1, title: 'Memorie esterne: dischi magnetici', deps: ['cache'], weight: 2, ready: false },
    { id: 'ssd', short: 'SSD', phase: 1, title: 'Dischi SSD', deps: ['mem-interne', 'mem-esterne'], weight: 1, ready: false },
    // ---- Fase 2: secondo compitino (data da definire) ----
    { id: 'aritmetica', short: 'Aritmetica', phase: 2, title: 'Aritmetica del calcolatore', deps: ['notazione'], weight: 1, ready: false },
    { id: 'virgola-mobile', short: 'IEEE 754', phase: 2, title: 'Virgola mobile IEEE 754', deps: ['aritmetica'], weight: 2, ready: false },
    { id: 'linguaggio-macchina', short: 'Linguaggio macchina', phase: 2, title: 'Linguaggio macchina', deps: ['componenti'], weight: 1, ready: false },
    { id: 'indirizzamento', short: 'Indirizzamento', phase: 2, title: 'Modi di indirizzamento', deps: ['linguaggio-macchina'], weight: 1.5, ready: false },
    { id: 'processore', short: 'Processore', phase: 2, title: 'Struttura e funzione del processore', deps: ['indirizzamento'], weight: 1, ready: false },
    { id: 'pipeline', short: 'Pipeline', phase: 2, title: 'Pipeline: hazard, stalli, forwarding', deps: ['processore'], weight: 3, ready: false },
    { id: 'risc-cisc', short: 'RISC e CISC', phase: 2, title: 'RISC e CISC', deps: ['pipeline'], weight: 1, ready: false },
    { id: 'multicore', short: 'Multicore', phase: 2, title: 'Processori multicore', deps: ['pipeline'], weight: 1, ready: false },
  ];

  ADE.course = { topics, cards: [], pages: {}, pretests: {}, open: {}, generators: [] };
})(typeof globalThis !== 'undefined' ? globalThis : this);
