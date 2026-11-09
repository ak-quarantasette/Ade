// Interfaccia: un'unica pagina con navigazione via hash (#/ripasso, #/arg/cache, ...).
// Lo stato vive in localStorage sotto una sola chiave; tutta la logica sta in js/core.
(function () {
  const ADE = window.ADE;
  const { util: U, scheduler: SCH, state: ST, plan: PLAN, cache: C, course, diagrams: D } = ADE;
  const KEY = 'ade-state-v1';
  const main = document.getElementById('main');
  const today = () => U.todayStr();

  // ---------- Stato ----------
  let state, storageOk = true;
  try { state = ST.normalize(JSON.parse(localStorage.getItem(KEY) || 'null')); }
  catch (e) { state = ST.defaultState(); storageOk = false; }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { storageOk = false; }
  }

  // ---------- Aiuti ----------
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const pct = (x) => (x === null || x === undefined ? '–' : Math.round(x * 100) + '%');
  const topic = (id) => course.topics.find((t) => t.id === id);
  const cardsOf = (id) => course.cards.filter((c) => c.topic === id);
  const dateIt = (s) => new Date(s + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const $ = (sel, el) => (el || main).querySelector(sel);
  const $$ = (sel, el) => [...(el || main).querySelectorAll(sel)];
  const on = (sel, ev, fn) => $$(sel).forEach((el) => el.addEventListener(ev, fn));

  function status(id) {
    const m = ST.mastery(state, cardsOf(id), today());
    const t = topic(id);
    if (!t.ready) return { cls: 'none', label: 'contenuti in arrivo', m };
    if (!m.seen) return { cls: 'none', label: 'non iniziato', m };
    if (m.value < 0.4) return { cls: 'bad', label: 'debole', m };
    if (m.value < 0.75) return { cls: 'mid', label: 'in corso', m };
    return { cls: 'ok', label: 'solido', m };
  }
  const badge = (s) => '<span class="badge s-' + s.cls + '">' + s.label + '</span>';
  const confButtons = (name) => '<div class="row conf" role="group" aria-label="Quanto sei sicuro?"><span class="small muted">Quanto sei sicuro? (1 = per niente, 5 = certo)</span>' +
    [1, 2, 3, 4, 5].map((n) => '<button type="button" data-' + name + '="' + n + '">' + n + '</button>').join('') + '</div>';
  const errorPicker = (prefix) => '<div class="msg bad"><strong>Che tipo di errore è stato?</strong> Va nel quaderno degli errori e torna in rotazione.' +
    '<div class="row">' + ST.ERROR_KINDS.map((k) => '<button type="button" data-' + prefix + '="' + k + '">' +
      { concetto: 'Concetto (non lo sapevo o l\'avevo capito male)', calcolo: 'Calcolo (procedimento giusto, conto sbagliato)', distrazione: 'Distrazione (lo sapevo)' }[k] + '</button>').join('') + '</div></div>';

  // Scorciatoie da tastiera della vista corrente (azzerate a ogni cambio pagina).
  let keys = null;
  document.addEventListener('keydown', (e) => {
    if (!keys || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (keys(e.key) === true) e.preventDefault();
  });
  let timer = null;

  // ---------- Vista: Oggi ----------
  function viewOggi() {
    const t = today();
    const q = ST.queue(state, course.cards, t);
    const left = U.diffDays(t, state.settings.examDate);
    const errDue = state.errors.filter((e) => !e.resolved && U.diffDays(e.due, t) >= 0).length;
    const genDue = course.generators.filter((g) => { const it = state.items[g.id]; return !it || SCH.isDue(it, t); });
    const acc = ST.accuracy(state);
    const plan = buildPlan();
    const day = plan.days[0];
    main.className = '';
    main.innerHTML =
      '<h1>Oggi, ' + dateIt(t) + '</h1>' +
      '<p class="muted">' + (left > 0 ? 'Mancano <strong>' + left + ' giorni</strong> al primo compitino (' + dateIt(state.settings.examDate) + ').' : 'La data del compitino è passata: aggiornala in Dati.') + '</p>' +
      (storageOk ? '' : '<p class="msg warn">Il browser non permette di salvare i dati (navigazione privata?). I progressi di questa sessione andranno persi: esporta il JSON da Dati prima di chiudere.</p>') +
      '<div class="tiles">' +
        '<div class="tile"><b>' + q.due.length + '</b><span>carte in scadenza</span></div>' +
        '<div class="tile"><b>' + q.fresh.length + '</b><span>carte nuove oggi (su ' + q.freshTotal + ' mai viste)</span></div>' +
        '<div class="tile"><b>' + errDue + '</b><span>errori da riprovare</span></div>' +
        '<div class="tile"><b>' + ST.streak(state, t) + '</b><span>giorni di fila</span></div>' +
        '<div class="tile"><b>' + pct(acc) + '</b><span>accuratezza complessiva</span></div>' +
      '</div>' +
      '<div class="row"><a class="btn primary" href="#/ripasso">Inizia il ripasso (' + (q.due.length + q.fresh.length) + ')</a>' +
        (errDue ? '<a class="btn" href="#/errori">Quaderno degli errori</a>' : '') + '</div>' +
      (genDue.length ? '<h2>Esercizi da fare oggi</h2><ul>' + genDue.map((g) => '<li><a href="#/es/' + g.sub + '">' + g.title + '</a> <span class="muted small">' + g.desc + '</span></li>').join('') + '</ul>' : '') +
      (day ? '<h2>Piano di oggi</h2><ol>' + day.blocks.map(blockLi).join('') + '</ol><p class="small muted">Totale ' + day.total + ' minuti, a blocchi brevi con pause. <a href="#/piano">Piano completo</a></p>' : '');
  }
  const blockHref = (b) => ({ ripasso: '#/ripasso', nuovo: '#/arg/' + b.topic, esercizi: '#/es/traccia', errori: '#/errori', simulazione: '#/esame', aperte: '#/aperte/cache' }[b.type]);
  const blockLi = (b) => '<li><a href="' + blockHref(b) + '">' + esc(b.title) + '</a> <span class="muted small">' + b.min + ' min</span></li>';
  function buildPlan() {
    const mastery = {};
    course.topics.forEach((t) => { mastery[t.id] = ST.mastery(state, cardsOf(t.id), today()).value; });
    return PLAN.buildPlan({ today: today(), examDate: state.settings.examDate, topics: course.topics.filter((t) => t.phase === 1), mastery });
  }

  // ---------- Vista: Mappa ----------
  function viewMappa() {
    main.className = 'wide';
    const rowsOf = (phase) => course.topics.filter((t) => t.phase === phase);
    const nodes = rowsOf(1).map((t) => ({ id: t.id, short: t.short, deps: t.deps, cls: 'f-' + status(t.id).cls }));
    const table = (phase) => '<div class="scroll"><table><thead><tr><th>Argomento</th><th>Stato</th><th class="num">Ritenzione stimata</th><th class="num">Carte viste</th><th class="num">In scadenza</th><th>Dipende da</th></tr></thead><tbody>' +
      rowsOf(phase).map((t) => { const s = status(t.id); return '<tr><td><a href="#/arg/' + t.id + '">' + esc(t.title) + '</a></td><td>' + badge(s) + '</td><td class="num">' + (s.m.seen ? pct(s.m.value) : '–') +
        '</td><td class="num">' + s.m.seen + ' / ' + s.m.total + '</td><td class="num">' + s.m.decaying + '</td><td class="small muted">' + (t.deps.map((d) => topic(d).short).join(', ') || '–') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    main.innerHTML = '<h1>Mappa del corso</h1><p class="muted">Le frecce vanno da ciò che serve prima a ciò che ne dipende. Il colore indica la padronanza; il dettaglio è nella tabella.</p>' +
      '<h2>Fase 1: primo compitino</h2>' + D.mappa(nodes) + table(1) +
      '<p class="small muted">La ritenzione è una stima (decadimento esponenziale dall\'ultima risposta), non una misura. “In scadenza” sono le carte che stanno uscendo dalla memoria e vanno richiamate oggi.</p>' +
      '<h2>Fase 2: secondo compitino</h2><p class="muted">Data da definire. I contenuti arrivano dopo il primo compitino.</p>' + table(2);
  }

  // ---------- Vista: pagina dell'argomento ----------
  function viewArg(id) {
    const t = topic(id);
    main.className = '';
    if (!t) return (main.innerHTML = '<h1>Argomento non trovato</h1>');
    if (!t.ready) return (main.innerHTML = '<h1>' + esc(t.title) + '</h1><p class="msg">Contenuti in arrivo. Per ora l\'unico argomento completo è <a href="#/arg/cache">Gerarchie di memoria e cache</a>, che è il prototipo su cui decidere il formato degli altri.</p>');
    const page = course.pages[id];
    const pre = state.pretest[id];
    const s = status(id);
    const diagram = (name) => (name === 'campi' ? D.campi(C.makeConfig({ addrBits: 20, cacheBytes: 4096, blockBytes: 64, ways: 8 })) : D[name]());
    const body = page.sections.map((sec) => '<section><h2>' + esc(sec.title) + '</h2>' + (sec.diagram ? '<div class="two"><div>' + sec.html + '</div>' + diagram(sec.diagram) + '</div>' : sec.html) + '<p class="src">' + esc(sec.src) + '</p></section>').join('');
    main.innerHTML = '<p class="small muted"><a href="#/mappa">Mappa</a> / ' + esc(t.short) + '</p><h1>' + esc(t.title) + '</h1><p>' + badge(s) + ' <span class="muted">' + esc(page.intro) + '</span></p>' +
      (pre ? '' : '<div class="card" id="prebox"><h2>Prima di leggere: pre-test</h2><p>Quattro domande su cose che non hai ancora studiato. Sbagliare qui è previsto: provare a rispondere prima prepara la memoria a trattenere la spiegazione.</p><div class="row"><button class="primary" id="startpre">Fai il pre-test</button><button class="quiet" id="skippre">Salta e leggi</button></div></div>') +
      '<div id="content"' + (pre ? '' : ' hidden') + '>' + (pre ? '<p class="small muted">Pre-test fatto il ' + dateIt(pre.d) + ': ' + pct(pre.score) + '.</p>' : '') + body +
      '<h2>Ora mettiti alla prova</h2><p>Rileggere dà l\'impressione di sapere; rispondere a libro chiuso è ciò che fissa il ricordo.</p>' +
      '<div class="row"><a class="btn primary" href="#/ripasso/' + id + '">Flashcard dell\'argomento (' + cardsOf(id).length + ')</a>' +
      '<a class="btn" href="#/es/traccia/svolto">Esempio svolto</a><a class="btn" href="#/es/campi">Esercizio: campi</a><a class="btn" href="#/es/traccia">Esercizio: traccia</a><a class="btn" href="#/aperte/' + id + '">Domande aperte</a></div></div>';
    const show = () => { $('#content').hidden = false; const b = $('#prebox'); if (b) b.remove(); };
    on('#skippre', 'click', show);
    on('#startpre', 'click', () => runPretest(id, show));
  }

  function runPretest(id, done) {
    const qs = course.pretests[id];
    const box = $('#prebox');
    box.innerHTML = '<h2>Pre-test</h2><form id="pf">' + qs.map((q, i) => '<fieldset style="border:0;padding:0;margin:1rem 0"><legend><strong>' + (i + 1) + '.</strong> ' + esc(q.q) + '</legend>' +
      q.opts.map((o, k) => '<div><label><input type="radio" name="q' + i + '" value="' + k + '" required> ' + esc(o) + '</label></div>').join('') +
      '<label class="small muted">Sicurezza <select name="c' + i + '">' + [1, 2, 3, 4, 5].map((n) => '<option' + (n === 2 ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label></fieldset>').join('') +
      '<button class="primary">Correggi</button></form>';
    $('#pf').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const ans = qs.map((q, i) => ({ id: q.id, ok: Number(fd.get('q' + i)) === q.ok, conf: Number(fd.get('c' + i)) }));
      const score = ans.filter((a) => a.ok).length / qs.length;
      ST.recordPretest(state, id, score, ans, today()); save();
      box.innerHTML = '<h2>Pre-test: ' + ans.filter((a) => a.ok).length + ' su ' + qs.length + '</h2>' + qs.map((q, i) => '<div class="msg ' + (ans[i].ok ? 'ok' : 'bad') + '"><strong>' + (i + 1) + '. ' + (ans[i].ok ? 'Giusta' : 'Sbagliata') + '.</strong> Risposta: ' + esc(q.opts[q.ok]) + '. ' + esc(q.why) + ' <span class="src">' + esc(q.src) + '</span></div>').join('') +
        '<p>Il punteggio qui non conta. Leggi la spiegazione cercando le risposte alle domande che hai sbagliato.</p><button class="primary" id="go">Vai alla spiegazione</button>';
      on('#go', 'click', () => viewArg(id));
    });
  }

  // ---------- Vista: ripasso con flashcard ----------
  function viewRipasso(only) {
    main.className = '';
    const t = today();
    const pool = only ? cardsOf(only) : course.cards;
    const q = ST.queue(state, pool, t);
    // Se si ripassa un solo argomento a richiesta, si includono anche le carte non in scadenza.
    let list = q.due.concat(q.fresh);
    if (only && !list.length) list = pool.slice();
    const sess = { items: ST.interleave(list, (c) => c.topic + '/' + c.sub, Math.random).map((c) => ({ card: c })), i: 0, right: 0, wrong: 0, phase: 'q', conf: 0 };
    if (!sess.items.length) {
      main.innerHTML = '<h1>Ripasso</h1><p class="msg ok">Niente in scadenza oggi. Usa il tempo per un <a href="#/es/traccia">esercizio</a> o una <a href="#/aperte/cache">domanda aperta</a>: ripassare carte non scadute rende meno.</p>';
      return;
    }
    const draw = () => {
      if (sess.i >= sess.items.length) return finish();
      const it = sess.items[sess.i], c = it.card;
      const head = '<h1>Ripasso' + (only ? ': ' + esc(topic(only).short) : '') + '</h1><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + sess.items.length + '" aria-valuenow="' + sess.i + '"><i style="width:' + (100 * sess.i / sess.items.length) + '%"></i></div>' +
        '<p class="small muted">' + (sess.i + 1) + ' di ' + sess.items.length + ' · ' + esc(topic(c.topic).short) + (it.retry ? ' · secondo tentativo (non modifica il calendario)' : '') + '</p>';
      if (sess.phase === 'q') {
        main.innerHTML = head + '<div class="card fc"><p class="q">' + esc(c.q) + '</p><label class="small muted" for="mine">Rispondi prima di girare (scrivi qui, su carta o a voce)</label><textarea id="mine"></textarea>' +
          confButtons('conf') + '<p class="small muted">Scegliendo la sicurezza si mostra la risposta. Tasti <kbd>1</kbd>–<kbd>5</kbd></p></div>';
        const reveal = (n) => { sess.conf = n; sess.mine = $('#mine').value; sess.phase = 'a'; draw(); };
        on('[data-conf]', 'click', (e) => reveal(Number(e.target.dataset.conf)));
        keys = (k) => { if (/^[1-5]$/.test(k)) { reveal(Number(k)); return true; } };
        $('#mine').focus();
      } else {
        main.innerHTML = head + '<div class="card fc"><p class="q">' + esc(c.q) + '</p>' + (sess.mine ? '<p class="small muted">La tua risposta: ' + esc(sess.mine) + '</p>' : '') +
          '<div class="a" aria-live="polite"><p>' + esc(c.a) + '</p><p class="src">' + esc(c.src) + '</p>' +
          (c.why ? '<p class="msg"><strong>Perché? E se…</strong> ' + esc(c.why) + ' <span class="small muted">Rispondi a voce prima di valutarti.</span></p>' : '') + '</div>' +
          '<div class="row" role="group" aria-label="Com\'è andata?">' + (it.retry
            ? '<button data-g="1">Ancora no <kbd>1</kbd></button><button data-g="4" class="primary">Ora la so <kbd>2</kbd></button>'
            : '<button data-g="1">Sbagliata <kbd>1</kbd></button><button data-g="3">Giusta a fatica <kbd>2</kbd></button><button data-g="4" class="primary">Giusta <kbd>3</kbd></button><button data-g="5">Facile <kbd>4</kbd></button>') +
          '</div><div id="after"></div></div>';
        const grade = (g) => {
          if (it.retry) { if (g === 1) sess.items.push({ card: c, retry: true }); return next(); }
          ST.recordCard(state, c, g, sess.conf, t); save();
          if (g >= 3) { sess.right++; return next(); }
          sess.wrong++;
          sess.items.push({ card: c, retry: true });
          $$('[data-g]').forEach((b) => (b.disabled = true));
          $('#after').innerHTML = errorPicker('ek') + (sess.conf >= 4 ? '<p class="msg warn">Eri molto sicuro (' + sess.conf + '/5) ma la risposta era sbagliata: è un\'illusione di competenza, il tipo di errore che all\'esame costa di più.</p>' : '');
          on('[data-ek]', 'click', (e) => { ST.addError(state, { topic: c.topic, ref: c.id, kind: e.target.dataset.ek, note: sess.mine || '' }, t); save(); next(); });
          keys = null;
          $('[data-ek]').focus();
        };
        const next = () => { sess.i++; sess.phase = 'q'; sess.mine = ''; draw(); };
        on('[data-g]', 'click', (e) => grade(Number(e.currentTarget.dataset.g)));
        const map = it.retry ? { 1: 1, 2: 4 } : { 1: 1, 2: 3, 3: 4, 4: 5 };
        keys = (k) => { if (map[k]) { grade(map[k]); return true; } };
        $('.a').setAttribute('tabindex', '-1'); $('.a').focus();
      }
    };
    const finish = () => {
      keys = null;
      main.innerHTML = '<h1>Ripasso completato</h1><p>' + sess.right + ' giuste, ' + sess.wrong + ' sbagliate al primo tentativo.</p>' +
        '<p class="msg">Prossimo passo consigliato: un esercizio di tipo diverso da quello che hai appena fatto.</p>' +
        '<div class="row"><a class="btn primary" href="#/es/traccia">Esercizio: traccia della cache</a><a class="btn" href="#/aperte/cache">Domanda aperta</a><a class="btn" href="#/">Oggi</a></div>';
    };
    draw();
  }

  // ---------- Esercizi sulla cache ----------
  const hex3 = (n) => U.hex(n, 3);

  function accessTable(ex) {
    return '<table><thead><tr><th>#</th><th>indirizzo (binario)</th><th>hex</th><th>l/s</th><th>byte scritto</th></tr></thead><tbody>' +
      ex.accesses.map((a, i) => '<tr><td>' + (i + 1) + '</td><td class="mono">' + U.bin(a.addr, ex.cfg.addrBits).replace(/(.{4})(?=.)/g, '$1 ') + '</td><td class="mono">' + hex3(a.addr) + '</td><td>' + a.op + '</td><td class="mono">' + (a.op === 's' ? U.hex(a.data) : '') + '</td></tr>').join('') + '</tbody></table>';
  }
  function memTable(memory) {
    const addrs = Object.keys(memory).map(Number).sort((a, b) => a - b);
    let s = '<table class="mem mono"><thead><tr>' + '<th>ind</th><th>byte</th>'.repeat(4) + '</tr></thead><tbody>';
    for (let i = 0; i < addrs.length; i += 4) s += '<tr>' + addrs.slice(i, i + 4).map((a) => '<td>' + hex3(a) + '</td><td>' + U.hex(memory[a]) + '</td>').join('') + '</tr>';
    return s + '</tbody></table>';
  }
  function cacheTable(cfg, snap) {
    return '<table class="mono"><tbody>' + snap.map((set, s) => '<tr><th>' + (cfg.ways === 1 ? 'linea ' : 'set ') + s + '</th>' +
      set.map((l, w) => '<td>' + (cfg.ways > 1 ? '<span class="muted">l' + w + '</span> ' : '') + C.lineStr(l) + (l.valid ? '<br><span class="muted">tag ' + U.bin(l.tag, cfg.tagBits) + '</span>' : '') + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  }
  function stepBlock(ex, st) {
    return '<div class="card"><h3>Passo ' + (st.i + 1) + ': ' + (st.op === 's' ? 'scrittura di ' + U.hex(st.data) + ' in ' : 'lettura di ') + hex3(st.addr) + ' → ' + (st.hit ? 'hit' : 'miss') + '</h3><ul>' +
      C.explainStep(ex.cfg, st).map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul><p><strong>Memoria:</strong> <span class="mono">' + C.memStr(st) + '</span></p><div class="scroll">' + cacheTable(ex.cfg, st.after) + '</div></div>';
  }
  function statement(ex, title, src) {
    return '<h1>' + title + '</h1><p>Sia data la seguente sequenza di indirizzi in lettura (l) o scrittura (s) emessi dalla CPU, e la memoria con il contenuto esadecimale mostrato. ' + esc(ex.text) + '</p>' +
      (src ? '<p class="src">' + esc(src) + '</p>' : '') + '<div class="two"><div class="scroll">' + accessTable(ex) + '</div><div class="scroll">' + memTable(ex.memory) + '</div></div>';
  }
  const modeNav = (cur) => '<div class="row" role="group" aria-label="Livello di guida">' + [['svolto', '1. Svolto'], ['guidato', '2. Guidato'], ['libero', '3. Libero']].map(([m, l]) =>
    '<a class="btn' + (m === cur ? ' primary' : '') + '" href="#/es/traccia/' + m + '"' + (m === cur ? ' aria-current="true"' : '') + '>' + l + '</a>').join('') + '</div>' +
    '<p class="small muted">Prima un esempio svolto, poi un esercizio con metà dei passaggi già fatti, poi da solo. Passa al livello successivo quando quello attuale ti riesce.</p>';

  /** Livello 1: esempio svolto (Esercizio cache 5), un passo alla volta con previsione. */
  function viewSvolto() {
    main.className = 'wide';
    const w = course.workedTrace;
    const cfg = C.makeConfig(w.params);
    const ex = { cfg, memory: w.memory, accesses: w.accesses, sim: C.simulate(cfg, w.memory, w.accesses), text: 'Si assuma che la dimensione di parola coincida con un byte, e la presenza di una cache di ampiezza 16B, dimensione di blocco 2B, inizialmente vuota, e ad ' + C.policyText(cfg) + '.' };
    let shown = 0;
    const draw = (msg) => {
      main.innerHTML = modeNav('svolto') + statement(ex, 'Esempio svolto: ' + w.title, w.src) +
        '<h2>1. Campi dell\'indirizzo</h2><ul><li>Blocco di 2B = 2¹ byte → parola: 1 bit.</li><li>Linee = 16B / 2B = 8; set = 8 / 2 vie = 4 = 2² → set: 2 bit.</li><li>Tag = 12 − 2 − 1 = 9 bit.</li></ul>' + D.campi(cfg, w.accesses[0].addr) +
        '<h2>2. Evoluzione</h2><p class="small muted">Il segno * indica una linea sporca (modificata e non ancora ricopiata in memoria).</p>' +
        ex.sim.steps.slice(0, shown).map((st) => stepBlock(ex, st)).join('') +
        (shown < ex.sim.steps.length
          ? '<div class="card" id="pred"><h3>Passo ' + (shown + 1) + ': ' + (w.accesses[shown].op === 's' ? 'scrittura in ' : 'lettura di ') + hex3(w.accesses[shown].addr) + '</h3>' + (msg || '') + '<p>Prima di vedere la soluzione: hit o miss?</p><div class="row"><button data-p="1">Hit <kbd>h</kbd></button><button data-p="0">Miss <kbd>m</kbd></button></div></div>'
          : '<div class="msg ok"><strong>Fine.</strong> Perché l\'unica modifica alla memoria avviene all\'ultimo passo? Cosa sarebbe cambiato con write-through? Rispondi a voce, poi passa al livello guidato.</div><div class="row"><a class="btn primary" href="#/es/traccia/guidato">Livello 2: guidato</a></div>');
      const pred = (p) => {
        const st = ex.sim.steps[shown];
        const ok = !!p === st.hit;
        shown++;
        draw('<p class="msg ' + (ok ? 'ok' : 'bad') + '">Passo ' + shown + ': avevi previsto ' + (p ? 'hit' : 'miss') + ', ' + (ok ? 'corretto.' : 'invece era ' + (st.hit ? 'hit' : 'miss') + '. Leggi sopra il perché.') + '</p>');
        const el = $('#pred'); if (el) el.scrollIntoView({ block: 'center' });
      };
      on('[data-p]', 'click', (e) => pred(Number(e.currentTarget.dataset.p)));
      keys = shown < ex.sim.steps.length ? (k) => { if (k === 'h') { pred(1); return true; } if (k === 'm') { pred(0); return true; } } : null;
    };
    draw();
  }

  /** Livelli 2 e 3: esercizio generato. Nel guidato campi e primi 4 passi sono già svolti. */
  function viewTraccia(mode) {
    main.className = 'wide';
    const guided = mode === 'guidato';
    const from = guided ? 4 : 0;
    const ex = C.genTrace(Math.floor(Math.random() * 1e9));
    const { cfg, sim } = ex;
    const setName = cfg.ways === 1 ? 'linea' : 'set';
    const fieldsForm = guided
      ? '<p>Campi (già calcolati): tag ' + cfg.tagBits + ' bit, ' + setName + ' ' + cfg.setBits + ' bit, parola ' + cfg.wordBits + ' bit; ' + cfg.sets + ' ' + (cfg.ways === 1 ? 'linee' : 'set da ' + cfg.ways + ' linee') + '.</p>' + D.campi(cfg, ex.accesses[from].addr)
      : '<div class="row"><label>bit di tag <input class="num" name="tag" inputmode="numeric" required></label><label>bit di ' + setName + ' <input class="num" name="set" inputmode="numeric" required></label><label>bit di parola <input class="num" name="word" inputmode="numeric" required></label><label>numero di ' + (cfg.ways === 1 ? 'linee' : 'set') + ' <input class="num" name="sets" inputmode="numeric" required></label></div>';
    const rows = sim.steps.map((st, i) => i < from ? '' :
      '<tr data-row="' + i + '"><td>' + (i + 1) + '</td><td class="mono">' + hex3(st.addr) + ' ' + st.op + (st.op === 's' ? ' ' + U.hex(st.data) : '') + '</td>' +
      '<td><select name="hit' + i + '" required aria-label="Passo ' + (i + 1) + ': hit o miss"><option value="">…</option><option value="1">hit</option><option value="0">miss</option></select></td>' +
      '<td><input class="num" name="set' + i + '" inputmode="numeric" required aria-label="Passo ' + (i + 1) + ': ' + setName + '"></td>' +
      (cfg.ways > 1 ? '<td><input class="num" name="way' + i + '" inputmode="numeric" required aria-label="Passo ' + (i + 1) + ': linea nel set"></td>' : '') +
      '<td><input class="memin" name="mem' + i + '" placeholder="/ oppure M[103]=04, M[105]=FF" aria-label="Passo ' + (i + 1) + ': modifiche alla memoria"></td></tr>').join('');
    main.innerHTML = modeNav(mode) + statement(ex, guided ? 'Esercizio guidato' : 'Esercizio libero') +
      '<form id="tf"><h2>1. Campi dell\'indirizzo</h2>' + fieldsForm +
      '<h2>2. Evoluzione</h2>' + (guided ? '<p>I primi 4 passi sono svolti. Continua tu dal passo 5, partendo dallo stato della cache dopo il passo 4.</p>' + sim.steps.slice(0, from).map((st) => stepBlock(ex, st)).join('') : '') +
      '<p class="small muted">Tieni la cache su carta, come all\'esame. Linee libere: si usa quella di indice minore. Memoria: scrivi <span class="mono">/</span> se non cambia.</p>' +
      '<div class="scroll"><table><thead><tr><th>#</th><th>accesso</th><th>hit/miss</th><th>' + setName + '</th>' + (cfg.ways > 1 ? '<th>linea nel set</th>' : '') + '<th>modifica memoria</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="row"><label>Quanto sei sicuro del risultato? <select name="conf" required><option value="">…</option>' + [1, 2, 3, 4, 5].map((n) => '<option>' + n + '</option>').join('') + '</select></label><button class="primary">Correggi</button><a class="btn quiet" href="#/es/traccia/' + mode + '" id="again">Altro esercizio</a></div></form><div id="res" aria-live="polite"></div>';
    on('#again', 'click', (e) => { e.preventDefault(); viewTraccia(mode); });
    $('#tf').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const ans = { tag: fd.get('tag'), set: fd.get('set'), word: fd.get('word'), sets: fd.get('sets'),
        steps: sim.steps.map((_, i) => ({ hit: fd.get('hit' + i) === '1', set: fd.get('set' + i), way: fd.get('way' + i), mem: fd.get('mem' + i) })) };
      const g = C.gradeTrace(ex, ans, from);
      const conf = Number(fd.get('conf'));
      const gen = course.generators.find((x) => x.sub === 'traccia');
      // Il guidato non aggiorna il calendario dell'esercizio: è ancora pratica assistita.
      if (guided) { state.reviews.push({ d: today(), kind: 'guided', id: gen.id, topic: 'cache', ok: +g.score.toFixed(2), conf }); }
      else ST.recordExercise(state, gen, g.score, conf, today());
      save();
      $$('#tf input, #tf select, #tf button').forEach((el) => (el.disabled = true));
      g.steps.forEach((s) => { const tr = $('[data-row="' + s.i + '"]'); tr.className = s.ok ? 'right' : 'wrong'; });
      const wrongF = g.fields.filter((f) => !f.ok), wrongS = g.steps.filter((s) => !s.ok);
      const alt = C.simulate(C.makeConfig(Object.assign({}, cfg, { write: cfg.write === 'back' ? 'through' : 'back' })), ex.memory, ex.accesses);
      $('#res').innerHTML = '<h2>Correzione: ' + g.points + ' punti su ' + g.max + ' (' + pct(g.score) + ')</h2>' +
        (conf >= 4 && g.score < 0.6 ? '<p class="msg warn">Sicurezza ' + conf + '/5 con ' + pct(g.score) + ' di risposte giuste: qui la sensazione di sapere ti sta ingannando.</p>' : '') +
        (wrongF.length ? '<h3>Campi</h3>' + wrongF.map((f) => '<p class="msg bad"><strong>' + f.label + ':</strong> hai scritto ' + esc(f.got || '–') + ', era ' + f.exp + '. ' + esc(f.why) + '</p>').join('') : '') +
        (wrongS.length ? '<h3>Passi sbagliati</h3>' + wrongS.map((s) => '<div class="msg bad"><strong>Passo ' + (s.i + 1) + '</strong><ul>' + s.errs.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>').join('') : (wrongF.length ? '' : '<p class="msg ok">Tutto corretto.</p>')) +
        (g.score < 1 ? '<div id="ekbox">' + errorPicker('ek') + '</div>' : '') +
        '<details><summary>Soluzione completa passo per passo</summary>' + (guided ? '' : D.campi(cfg, ex.accesses[0].addr)) + sim.steps.slice(from).map((st) => stepBlock(ex, st)).join('') + '</details>' +
        '<details><summary>E se la politica di scrittura fosse ' + (cfg.write === 'back' ? 'write-through' : 'write-back') + '?</summary><p>Prova a prevedere quali passi modificherebbero la memoria, poi confronta:</p><ul class="mono">' +
        alt.steps.map((st) => '<li>' + (st.i + 1) + '. ' + C.memStr(st) + '</li>').join('') + '</ul><p class="small muted">Hit e miss non cambiano: la politica di scrittura decide solo quando la memoria viene aggiornata.</p></details>' +
        '<div class="row"><button class="primary" id="more">Altro esercizio</button>' + (guided && g.score >= 0.9 ? '<a class="btn" href="#/es/traccia/libero">Passa al livello libero</a>' : '') + (!guided && g.score < 0.6 ? '<a class="btn" href="#/es/traccia/guidato">Torna al livello guidato</a>' : '') + '</div>';
      on('#more', 'click', () => viewTraccia(mode));
      on('[data-ek]', 'click', (ev) => {
        const what = wrongF.map((f) => f.label).concat(wrongS.map((s) => 'passo ' + (s.i + 1) + ': ' + s.errs.map((x) => x.split(':')[0]).join(', '))).join('; ');
        ST.addError(state, { topic: 'cache', ref: gen.id, kind: ev.currentTarget.dataset.ek, note: what }, today()); save();
        $('#ekbox').innerHTML = '<p class="msg">Registrato nel quaderno degli errori.</p>';
      });
      $('#res').scrollIntoView({ block: 'start' });
    });
  }

  function viewCampi() {
    main.className = '';
    const ex = C.genFields(Math.floor(Math.random() * 1e9));
    const names = { tag: 'tag', set: ex.cfg.ways === 1 ? 'linea' : 'set', word: 'parola', addr: 'indirizzo' };
    const gen = course.generators.find((x) => x.sub === 'campi');
    main.innerHTML = '<h1>Esercizio: campi dell\'indirizzo</h1><p>' + esc(ex.text) + '</p><form id="ff"><div class="row">' +
      ex.asks.map((k) => '<label>bit di ' + names[k] + ' <input class="num" name="' + k + '" inputmode="numeric" required></label>').join('') + '</div>' +
      '<div class="row"><label>Quanto sei sicuro? <select name="conf" required><option value="">…</option>' + [1, 2, 3, 4, 5].map((n) => '<option>' + n + '</option>').join('') + '</select></label><button class="primary">Correggi</button></div></form><div id="res" aria-live="polite"></div>';
    $('input', $('#ff')).focus();
    $('#ff').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const g = C.gradeFields(ex, Object.fromEntries(ex.asks.map((k) => [k, fd.get(k)])));
      ST.recordExercise(state, gen, g.score, Number(fd.get('conf')), today()); save();
      $$('#ff input, #ff select, #ff button').forEach((el) => (el.disabled = true));
      $('#res').innerHTML = g.items.map((it) => '<p class="msg ' + (it.ok ? 'ok' : 'bad') + '"><strong>' + it.label + ':</strong> ' + (it.ok ? it.exp + ', corretto.' : 'hai scritto ' + esc(it.got) + ', era ' + it.exp + '. ' + esc(it.why)) + '</p>').join('') +
        (g.score < 1 ? '<div id="ekbox">' + errorPicker('ek') + '</div>' : '') +
        '<details' + (g.score < 1 ? ' open' : '') + '><summary>Procedimento completo</summary><ol>' + ex.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol>' + D.campi(ex.cfg) + '</details>' +
        '<p class="src">Procedimento come in Slide «Esercizi cache 1-4», pag. 1-2</p><div class="row"><button class="primary" id="more">Altro esercizio <kbd>n</kbd></button><a class="btn" href="#/es/traccia">Passa alla traccia</a></div>';
      on('#more', 'click', viewCampi);
      keys = (k) => { if (k === 'n') { viewCampi(); return true; } };
      on('[data-ek]', 'click', (ev) => {
        ST.addError(state, { topic: 'cache', ref: gen.id, kind: ev.currentTarget.dataset.ek, note: g.items.filter((i) => !i.ok).map((i) => i.label).join(', ') }, today()); save();
        $('#ekbox').innerHTML = '<p class="msg">Registrato nel quaderno degli errori.</p>';
      });
      $('#more').focus();
    });
  }

  // ---------- Domande aperte con griglia di autovalutazione ----------
  function viewAperte(id) {
    main.className = '';
    const qs = course.open[id] || [];
    if (!qs.length) return (main.innerHTML = '<h1>Domande aperte</h1><p class="msg">Nessuna domanda per questo argomento, per ora.</p>');
    // Si propone la domanda fatta meno di recente.
    const lastDone = (q) => { const it = state.items[q.id]; return it && it.last ? it.last : ''; };
    const q = qs.slice().sort((a, b) => lastDone(a).localeCompare(lastDone(b)))[0];
    let secs = 600;
    main.innerHTML = '<h1>Domanda aperta</h1><p class="small muted">Al compitino vale 4 punti. Scrivi come all\'esame, senza guardare gli appunti: hai 10 minuti.</p><div class="card"><p class="q"><strong>' + esc(q.q) + '</strong></p>' +
      '<label for="ans" class="small muted">La tua risposta</label><textarea id="ans" style="min-height:12rem"></textarea><p class="small muted" id="clock" aria-live="off">10:00</p>' + confButtons('conf') + '</div><div id="res" aria-live="polite"></div>';
    timer = setInterval(() => { secs = Math.max(0, secs - 1); const el = $('#clock'); if (el) el.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + (secs === 0 ? ' · tempo scaduto' : ''); }, 1000);
    $('#ans').focus();
    on('[data-conf]', 'click', (e) => {
      clearInterval(timer);
      const conf = Number(e.target.dataset.conf);
      $$('[data-conf]').forEach((b) => (b.disabled = true));
      $('#ans').readOnly = true;
      $('#res').innerHTML = '<h2>Confronta con la griglia</h2><p>Spunta solo i punti che hai davvero scritto, non quelli che “intendevi”.</p><form id="gf">' +
        q.points.map((p, i) => '<div><label><input type="checkbox" name="p' + i + '"> ' + esc(p) + '</label></div>').join('') +
        '<p class="src">' + esc(q.src) + '</p><div class="row"><button class="primary">Registra</button></div></form>' +
        '<p class="small muted">La griglia è un\'autovalutazione. Per una correzione vera del testo, usa il comando <span class="mono">/quiz cache</span> in chat con Claude Code.</p>';
      $('#gf').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const n = $$('#gf input:checked').length, score = n / q.points.length;
        ST.recordExercise(state, { id: q.id, topic: id, kind: 'open' }, score, conf, today()); save();
        $('#res').innerHTML = '<p class="msg ' + (score >= 0.6 ? 'ok' : 'bad') + '">' + n + ' punti su ' + q.points.length + ' (circa ' + (4 * score).toFixed(1) + ' su 4).' + (score < 1 ? ' Rileggi i punti mancanti e ripeti la risposta a voce.' : '') + '</p>' +
          (score < 0.6 ? '<div id="ekbox">' + errorPicker('ek') + '</div>' : '') + '<div class="row"><button class="primary" id="more">Altra domanda</button><a class="btn" href="#/">Oggi</a></div>';
        on('#more', 'click', () => viewAperte(id));
        on('[data-ek]', 'click', (e2) => { ST.addError(state, { topic: id, ref: q.id, kind: e2.currentTarget.dataset.ek, note: 'punti mancanti nella risposta aperta' }, today()); save(); $('#ekbox').innerHTML = '<p class="msg">Registrato.</p>'; });
      });
    });
  }

  // ---------- Quaderno degli errori ----------
  function refLabel(ref) {
    const c = course.cards.find((x) => x.id === ref);
    if (c) return { text: c.q, card: c };
    const g = course.generators.find((x) => x.id === ref);
    if (g) return { text: 'Esercizio: ' + g.title, href: '#/es/' + g.sub };
    for (const id in course.open) { const o = course.open[id].find((x) => x.id === ref); if (o) return { text: 'Domanda aperta: ' + o.q, href: '#/aperte/' + id }; }
    return { text: ref };
  }
  function viewErrori() {
    main.className = '';
    const t = today();
    const open = state.errors.filter((e) => !e.resolved);
    const byKind = ST.ERROR_KINDS.map((k) => [k, state.errors.filter((e) => e.kind === k).length]);
    const advice = { concetto: 'Torna alla spiegazione e all\'esempio svolto prima di riprovare.', calcolo: 'Il metodo c\'è: rifai il conto scrivendo ogni passaggio.', distrazione: 'Rileggi la consegna e controlla la risposta prima di consegnare.' };
    main.innerHTML = '<h1>Quaderno degli errori</h1><p class="muted">Ogni errore torna in rotazione finché non lo risolvi due volte di fila, a distanza di giorni.</p>' +
      '<div class="tiles">' + byKind.map(([k, n]) => '<div class="tile"><b>' + n + '</b><span>' + k + '</span></div>').join('') + '</div>' +
      (open.length ? open.map((e) => { const r = refLabel(e.ref); const due = U.diffDays(e.due, t) >= 0; return '<div class="card" data-err="' + e.id + '"><p><span class="badge s-' + (due ? 'bad' : 'none') + '">' + (due ? 'da riprovare oggi' : 'torna il ' + dateIt(e.due)) + '</span> <span class="badge s-none">' + e.kind + '</span> <span class="small muted">' + esc(topic(e.topic).short) + ' · ' + dateIt(e.d) + ' · successi ' + e.wins + '/2</span></p><p><strong>' + esc(r.text) + '</strong></p>' +
        (e.note ? '<p class="small muted">' + esc(e.note) + '</p>' : '') + '<p class="small">' + advice[e.kind] + '</p>' +
        (r.card ? '<details><summary>Riprova: rispondi, poi apri per controllare</summary><p>' + esc(r.card.a) + '</p><p class="src">' + esc(r.card.src) + '</p><div class="row"><button data-retry="1">Ora giusta</button><button data-retry="0">Ancora sbagliata</button></div></details>'
          : '<div class="row"><a class="btn" href="' + (r.href || '#/') + '">Rifai un esercizio di questo tipo</a><button data-retry="1">L\'ho rifatto giusto</button><button data-retry="0">Ancora sbagliato</button></div>') + '</div>'; }).join('')
        : '<p class="msg ok">Nessun errore aperto.</p>') +
      (state.errors.length > open.length ? '<p class="small muted">' + (state.errors.length - open.length) + ' errori risolti.</p>' : '');
    on('[data-retry]', 'click', (e) => { ST.retryError(state, e.target.closest('[data-err]').dataset.err, e.target.dataset.retry === '1', t); save(); viewErrori(); });
  }

  // ---------- Piano ----------
  function viewPiano() {
    main.className = '';
    const plan = buildPlan();
    main.innerHTML = '<h1>Piano di studio</h1><p class="muted">Calcolato a ritroso dal ' + dateIt(state.settings.examDate) + ' e ricalcolato a ogni apertura in base ai tuoi risultati. Blocchi brevi e di tipo diverso, con pausa tra uno e l\'altro; niente studio dopo le 18.</p>' +
      plan.warnings.map((w) => '<p class="msg warn">' + esc(w) + '</p>').join('') +
      plan.days.map((d, i) => '<div class="day"><h3>' + (i === 0 ? 'Oggi, ' : '') + dateIt(d.date) + ' <span class="small muted">· ' + d.total + ' min</span></h3><ol>' + d.blocks.map(blockLi).join('') + '</ol></div>').join('') +
      '<p class="small muted">Un argomento esce dal piano quando la ritenzione stimata delle sue carte supera il 60%.</p>';
  }

  // ---------- Progressi ----------
  function viewProgressi() {
    main.className = '';
    const cal = ST.calibration(state), ill = ST.illusions(state);
    const n = state.reviews.filter((r) => r.kind !== 'pretest').length;
    const hi = cal.filter((r) => r.conf >= 4 && r.n), hiN = hi.reduce((s, r) => s + r.n, 0), hiAcc = hiN ? hi.reduce((s, r) => s + r.accuracy * r.n, 0) / hiN : null;
    const kinds = [['card', 'Flashcard'], ['ex', 'Esercizi'], ['open', 'Domande aperte']];
    main.innerHTML = '<h1>Progressi</h1><div class="tiles"><div class="tile"><b>' + n + '</b><span>risposte registrate</span></div><div class="tile"><b>' + pct(ST.accuracy(state)) + '</b><span>accuratezza</span></div><div class="tile"><b>' + ST.streak(state, today()) + '</b><span>giorni di fila</span></div></div>' +
      '<h2>Accuratezza per tipo</h2><table><tbody>' + kinds.map(([k, l]) => '<tr><td>' + l + '</td><td class="num">' + pct(ST.accuracy(state, (r) => r.kind === k)) + '</td><td class="num muted">' + state.reviews.filter((r) => r.kind === k).length + ' risposte</td></tr>').join('') + '</tbody></table>' +
      '<h2>Calibrazione</h2><p class="muted">Quando dici di essere sicuro, hai ragione? Se a sicurezza 5 l\'accuratezza è molto sotto il 100%, stai sopravvalutando ciò che sai.</p>' +
      '<table><thead><tr><th>Sicurezza dichiarata</th><th class="num">Risposte</th><th class="num">Giuste</th><th>Lettura</th></tr></thead><tbody>' + cal.map((r) => { const gap = r.n >= 5 ? r.accuracy - r.expected : null;
        return '<tr><td>' + r.conf + ' su 5</td><td class="num">' + r.n + '</td><td class="num">' + pct(r.accuracy) + '</td><td class="small">' + (gap === null ? '<span class="muted">servono almeno 5 risposte</span>' : gap < -0.2 ? '<span class="badge s-bad">troppo sicuro</span>' : gap > 0.25 ? '<span class="badge s-mid">più bravo di quanto pensi</span>' : '<span class="badge s-ok">calibrato</span>') + '</td></tr>'; }).join('') + '</tbody></table>' +
      (hiAcc !== null ? '<p>Con sicurezza alta (4-5) hai risposto giusto nel <strong>' + pct(hiAcc) + '</strong> dei casi (' + hiN + ' risposte).</p>' : '') +
      '<h2>Illusioni di competenza</h2>' + (ill.length ? '<p class="muted">Elementi su cui eri sicuro (4-5) e hai sbagliato:</p><ul>' + ill.slice(0, 10).map((x) => '<li>' + esc(refLabel(x.id).text) + ' <span class="muted small">' + x.n + ' volte</span></li>').join('') + '</ul>' : '<p class="muted">Nessuna finora.</p>');
  }

  // ---------- Simulatore (stadio 3) ----------
  function viewEsame() {
    main.className = '';
    main.innerHTML = '<h1>Simulatore d\'esame</h1><p class="msg">In arrivo nel prossimo stadio, quando tutti gli argomenti della fase 1 avranno contenuti.</p>' +
      '<p>Formato del primo compitino, ricavato dalle due prove del 19 novembre 2025: 90 minuti su Moodle, 8 domande, 32 punti.</p><ul><li>3 domande a risposta multipla (circa 2,67 punti l\'una): una di teoria, una sul codice di Hamming, una sul calcolo di un disco;</li><li>4 domande aperte (4 punti l\'una);</li><li>1 esercizio sulla cache (8 punti).</li></ul>' +
      '<p>Nel frattempo puoi allenare la parte da 8 punti a tempo: datti 25 minuti per un <a href="#/es/traccia/libero">esercizio libero sulla cache</a>.</p>';
  }

  // ---------- Dati: impostazioni, backup ----------
  function viewDati() {
    main.className = '';
    main.innerHTML = '<h1>Dati e impostazioni</h1><p class="muted">Tutto resta nel tuo browser. Il file JSON esportato è lo stesso formato di <span class="mono">progress/state.json</span> usato dai comandi in chat.</p>' +
      '<h2>Date</h2><div class="row"><label>Primo compitino <input type="date" id="exam" value="' + state.settings.examDate + '"></label><label>Carte nuove al giorno <input class="num" type="number" min="0" max="60" id="npd" value="' + state.settings.newPerDay + '"></label></div>' +
      '<h2>Backup</h2><div class="row"><button class="primary" id="exp">Esporta JSON</button><label class="btn">Importa JSON <input type="file" id="imp" accept="application/json,.json" hidden></label></div><p class="small muted">Per usare i comandi in chat: esporta, salva il file come <span class="mono">progress/state.json</span> nella repo, e a fine sessione reimporta quello aggiornato.</p><div id="msg" aria-live="polite"></div>' +
      '<h2>Azzera</h2><div class="row"><button id="reset">Cancella tutti i progressi</button></div>';
    on('#exam', 'change', (e) => { if (e.target.value) { state.settings.examDate = e.target.value; save(); } });
    on('#npd', 'change', (e) => { state.settings.newPerDay = Math.max(0, Number(e.target.value) || 0); save(); });
    on('#exp', 'click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
      a.download = 'ade-stato-' + today() + '.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    on('#imp', 'change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((txt) => {
        const st = ST.normalize(JSON.parse(txt));
        if (!confirm('Sostituire i progressi attuali (' + state.reviews.length + ' risposte) con quelli del file (' + st.reviews.length + ' risposte)?')) return;
        state = st; save(); $('#msg').innerHTML = '<p class="msg ok">Importato.</p>';
      }).catch((err) => { $('#msg').innerHTML = '<p class="msg bad">File non valido: ' + esc(err.message) + '</p>'; });
    });
    on('#reset', 'click', () => { if (confirm('Cancellare tutti i progressi? Non si può annullare (esporta prima un backup).')) { const s = state.settings; state = ST.defaultState(); state.settings = s; save(); route(); } });
  }

  // ---------- Navigazione ----------
  const NAV = [['#/', 'Oggi'], ['#/mappa', 'Mappa'], ['#/ripasso', 'Ripasso'], ['#/es/traccia', 'Esercizi'], ['#/errori', 'Errori'], ['#/piano', 'Piano'], ['#/esame', 'Esame'], ['#/progressi', 'Progressi'], ['#/dati', 'Dati']];
  function route() {
    keys = null; clearInterval(timer);
    const parts = (location.hash || '#/').slice(2).split('/');
    const [p, a, b] = parts;
    const cur = '#/' + (p === 'arg' ? 'mappa' : p === 'aperte' ? 'es' : p || '');
    document.getElementById('nav').innerHTML = NAV.map(([h, l]) => '<a href="' + h + '"' + ((h === '#/' ? cur === '#/' : h.startsWith(cur) && cur !== '#/') ? ' aria-current="page"' : '') + '>' + l + '</a>').join('');
    if (!p) viewOggi();
    else if (p === 'mappa') viewMappa();
    else if (p === 'arg') viewArg(a);
    else if (p === 'ripasso') viewRipasso(a);
    else if (p === 'es' && a === 'campi') viewCampi();
    else if (p === 'es') {
      // Senza livello esplicito: svolto la prima volta, poi guidato, poi libero.
      const it = state.items['gen:cache-traccia'];
      const guidedOk = state.reviews.some((r) => r.kind === 'guided' && r.ok >= 0.9);
      const mode = b || (it && it.last ? 'libero' : guidedOk ? 'libero' : state.reviews.some((r) => r.kind === 'guided') ? 'guidato' : 'svolto');
      if (mode === 'svolto') viewSvolto(); else viewTraccia(mode);
    }
    else if (p === 'aperte') viewAperte(a || 'cache');
    else if (p === 'errori') viewErrori();
    else if (p === 'piano') viewPiano();
    else if (p === 'progressi') viewProgressi();
    else if (p === 'esame') viewEsame();
    else if (p === 'dati') viewDati();
    else main.innerHTML = '<h1>Pagina non trovata</h1><p><a href="#/">Torna a Oggi</a></p>';
    document.title = (main.querySelector('h1') ? main.querySelector('h1').textContent + ' · ' : '') + 'AdE Studio';
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', () => { route(); main.focus({ preventScroll: true }); });

  // ---------- Tema ----------
  const themeBtn = document.getElementById('theme');
  const labels = { auto: 'Tema: automatico', light: 'Tema: chiaro', dark: 'Tema: scuro' };
  function applyTheme() {
    const t = state.settings.theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    themeBtn.textContent = labels[t];
  }
  themeBtn.addEventListener('click', () => { state.settings.theme = { auto: 'light', light: 'dark', dark: 'auto' }[state.settings.theme]; save(); applyTheme(); });

  applyTheme();
  route();
  ADE.ui = { getState: () => state };
})();
