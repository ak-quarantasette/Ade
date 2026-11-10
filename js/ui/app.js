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
  // ---- Fase corrente: tutto il sito mostra solo gli argomenti del compitino selezionato ----
  const phase = () => (state.settings.phase === 2 ? 2 : 1);
  const phaseInfo = () => course.phases[phase()];
  const inPhase = (topicId) => course.phaseOf(topicId) === phase();
  const phaseCards = () => course.cards.filter((c) => inPhase(c.topic));
  const phaseGens = () => course.generators.filter((g) => inPhase(g.topic));
  const phaseOpen = () => course.topicsOf(phase()).flatMap((t) => course.open[t.id] || []);
  const examDate = () => state.settings[phaseInfo().dateKey];
  // Carte "attive": quelle degli argomenti già aperti (pre-test fatto) o già viste almeno una volta.
  const activeCards = () => phaseCards().filter((c) => state.pretest[c.topic] || (state.items[c.id] && state.items[c.id].last));
  const phaseTag = () => '<p class="phasetag"><span class="badge s-phase' + phase() + '">' + phaseInfo().title + '</span></p>';
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
    const q = ST.queue(state, activeCards(), t);
    const date = examDate();
    const left = date ? U.diffDays(t, date) : null;
    const errDue = state.errors.filter((e) => !e.resolved && inPhase(e.topic) && U.diffDays(e.due, t) >= 0).length;
    const genDue = phaseGens().filter((g) => { const it = state.items[g.id]; return !it || SCH.isDue(it, t); });
    const acc = ST.accuracy(state, (r) => inPhase(r.topic));
    const plan = buildPlan();
    const day = plan.days[0];
    const ready = course.topicsOf(phase()).filter((x) => x.ready).length;
    main.className = '';
    main.innerHTML = phaseTag() +
      '<h1>Oggi, ' + dateIt(t) + '</h1>' +
      '<p class="muted">' + (left === null ? 'La data del ' + phaseInfo().title.toLowerCase() + ' non è ancora fissata: quando la sai, impostala in <a href="#/dati">Dati</a> e il piano si calcola da solo.'
        : left > 0 ? 'Mancano <strong>' + left + ' giorni</strong> al ' + phaseInfo().title.toLowerCase() + ' (' + dateIt(date) + ').'
        : 'La data del ' + phaseInfo().title.toLowerCase() + ' è passata. ' + (phase() === 1 ? 'Passa al secondo compitino con il selettore in alto.' : 'Aggiornala in Dati.')) + '</p>' +
      (storageOk ? '' : '<p class="msg warn">Il browser non permette di salvare i dati (navigazione privata?). I progressi di questa sessione andranno persi: esporta il JSON da Dati prima di chiudere.</p>') +
      '<div class="tiles">' +
        '<div class="tile"><b>' + q.due.length + '</b><span>carte in scadenza</span></div>' +
        '<div class="tile"><b>' + q.fresh.length + '</b><span>carte nuove oggi (su ' + q.freshTotal + ' mai viste)</span></div>' +
        '<div class="tile"><b>' + errDue + '</b><span>errori da riprovare</span></div>' +
        '<div class="tile"><b>' + ST.streak(state, t) + '</b><span>giorni di fila</span></div>' +
        '<div class="tile"><b>' + pct(acc) + '</b><span>accuratezza in questa parte</span></div>' +
      '</div>' +
      '<div class="row"><a class="btn primary" href="#/ripasso">Inizia il ripasso (' + (q.due.length + q.fresh.length) + ')</a>' +
        (errDue ? '<a class="btn" href="#/errori">Quaderno degli errori</a>' : '') + '<a class="btn" href="#/mappa">Argomenti (' + ready + ')</a></div>' +
      '<p class="small muted">Le carte nuove sono quelle degli argomenti che hai già aperto dalla Mappa: prima il pre-test e la spiegazione, poi le carte.</p>' +
      (genDue.length ? '<h2>Esercizi da fare oggi</h2><ul>' + genDue.map((g) => '<li><a href="#/es/' + g.sub + '">' + g.title + '</a> <span class="muted small">' + g.desc + '</span></li>').join('') + '</ul>' : '') +
      (day ? '<h2>Piano di oggi</h2><ol>' + day.blocks.map(blockLi).join('') + '</ol><p class="small muted">Totale ' + day.total + ' minuti, a blocchi brevi con pause. <a href="#/piano">Piano completo</a></p>' : '');
  }
  const blockHref = (b) => ({ ripasso: '#/ripasso', nuovo: '#/arg/' + b.topic, esercizi: '#/es', errori: '#/errori', simulazione: '#/esame', aperte: '#/aperte' }[b.type]);
  const blockLi = (b) => '<li><a href="' + blockHref(b) + '">' + esc(b.title) + '</a> <span class="muted small">' + b.min + ' min</span></li>';
  function buildPlan() {
    if (!examDate()) return { days: [], warnings: ['Data del ' + phaseInfo().title.toLowerCase() + ' non impostata.'] };
    const mastery = {};
    course.topics.forEach((t) => { mastery[t.id] = ST.mastery(state, cardsOf(t.id), today()).value; });
    return PLAN.buildPlan({ today: today(), examDate: examDate(), topics: course.topicsOf(phase()), mastery });
  }

  // ---------- Vista: Mappa (solo la fase corrente) ----------
  function viewMappa() {
    main.className = 'wide';
    const list = course.topicsOf(phase());
    const other = course.phases[phase() === 1 ? 2 : 1];
    const nodes = list.map((t) => ({ id: t.id, short: t.short, deps: t.deps, cls: 'f-' + status(t.id).cls }));
    main.innerHTML = phaseTag() + '<h1>Argomenti del ' + phaseInfo().title.toLowerCase() + '</h1><p class="muted">Le frecce vanno da ciò che serve prima a ciò che ne dipende. Il colore indica la padronanza; il dettaglio è nella tabella.</p>' +
      D.mappa(nodes) + '<div class="scroll"><table><thead><tr><th>Argomento</th><th>Stato</th><th class="num">Ritenzione stimata</th><th class="num">Carte viste</th><th class="num">In scadenza</th><th>Dipende da</th></tr></thead><tbody>' +
      list.map((t) => { const s = status(t.id); return '<tr><td><a href="#/arg/' + t.id + '">' + esc(t.title) + '</a></td><td>' + badge(s) + '</td><td class="num">' + (s.m.seen ? pct(s.m.value) : '–') +
        '</td><td class="num">' + s.m.seen + ' / ' + s.m.total + '</td><td class="num">' + s.m.decaying + '</td><td class="small muted">' + (t.deps.map((d) => topic(d).short).join(', ') || '–') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<p class="small muted">La ritenzione è una stima (decadimento esponenziale dall\'ultima risposta), non una misura. “In scadenza” sono le carte che stanno uscendo dalla memoria e vanno richiamate oggi.</p>' +
      '<p class="msg">Qui ci sono solo gli argomenti del ' + phaseInfo().title.toLowerCase() + '. Quelli del ' + other.title.toLowerCase() + ' sono separati: <button class="quiet" data-phase="' + other.id + '">passa al ' + other.title.toLowerCase() + '</button></p>';
    on('[data-phase]', 'click', (e) => setPhase(Number(e.currentTarget.dataset.phase)));
  }

  // ---------- Vista: pagina dell'argomento ----------
  function viewArg(id) {
    const t = topic(id);
    main.className = '';
    if (!t) return (main.innerHTML = '<h1>Argomento non trovato</h1>');
    if (t.phase !== phase()) { state.settings.phase = t.phase; save(); drawPhase(); }
    if (!t.ready) return (main.innerHTML = phaseTag() + '<h1>' + esc(t.title) + '</h1><p class="msg">Contenuti non ancora disponibili per questo argomento.</p>');
    const page = course.pages[id];
    const pre = state.pretest[id];
    const s = status(id);
    const diagram = (name) => (name === 'campi' ? D.campi(C.makeConfig({ addrBits: 20, cacheBytes: 4096, blockBytes: 64, ways: 8 })) : D[name] ? D[name]() : '');
    const gens = course.generators.filter((g) => g.topic === id);
    const nOpen = (course.open[id] || []).length;
    const body = page.sections.map((sec) => '<section><h2>' + esc(sec.title) + '</h2>' + (sec.diagram && diagram(sec.diagram) ? '<div class="two"><div>' + sec.html + '</div>' + diagram(sec.diagram) + '</div>' : sec.html) + '<p class="src">' + esc(sec.src) + '</p></section>').join('');
    main.innerHTML = phaseTag() + '<p class="small muted"><a href="#/mappa">Argomenti</a> / ' + esc(t.short) + '</p><h1>' + esc(t.title) + '</h1><p>' + badge(s) + ' <span class="muted">' + esc(page.intro) + '</span></p>' +
      (pre ? '' : '<div class="card" id="prebox"><h2>Prima di leggere: pre-test</h2><p>Qualche domanda su cose che non hai ancora studiato. Sbagliare qui è previsto: provare a rispondere prima prepara la memoria a trattenere la spiegazione.</p><div class="row"><button class="primary" id="startpre">Fai il pre-test</button><button class="quiet" id="skippre">Salta e leggi</button></div></div>') +
      '<div id="content"' + (pre ? '' : ' hidden') + '>' + (pre ? '<p class="small muted">Pre-test fatto il ' + dateIt(pre.d) + ': ' + pct(pre.score) + '.</p>' : '') + body +
      '<h2>Ora mettiti alla prova</h2><p>Rileggere dà l\'impressione di sapere; rispondere a libro chiuso è ciò che fissa il ricordo.</p>' +
      '<div class="row"><a class="btn primary" href="#/ripasso/' + id + '">Flashcard dell\'argomento (' + cardsOf(id).length + ')</a>' +
      (id === 'cache' ? '<a class="btn" href="#/es/traccia/svolto">Esempio svolto</a>' : '') + gens.map((g) => '<a class="btn" href="#/es/' + g.sub + '">Esercizio: ' + esc(g.title) + '</a>').join('') +
      (nOpen ? '<a class="btn" href="#/aperte/' + id + '">Domande aperte (' + nOpen + ')</a>' : '') + '</div></div>';
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
    const pool = only ? cardsOf(only) : activeCards();
    const q = ST.queue(state, pool, t);
    // Se si ripassa un solo argomento a richiesta, si includono anche le carte non in scadenza.
    let list = q.due.concat(q.fresh);
    if (only && !list.length) list = pool.slice();
    const sess = { items: ST.interleave(list, (c) => c.topic + '/' + c.sub, Math.random).map((c) => ({ card: c })), i: 0, right: 0, wrong: 0, phase: 'q', conf: 0 };
    if (!sess.items.length) {
      const started = phaseCards().some((c) => state.items[c.id] && state.items[c.id].last) || course.topicsOf(phase()).some((x) => state.pretest[x.id]);
      main.innerHTML = phaseTag() + '<h1>Ripasso</h1>' + (started
        ? '<p class="msg ok">Niente in scadenza oggi. Usa il tempo per un <a href="#/es">esercizio</a>, una <a href="#/aperte">domanda aperta</a> o un <a href="#/mappa">argomento nuovo</a>: ripassare carte non scadute rende meno.</p>'
        : '<p class="msg">Non hai ancora iniziato nessun argomento di questa parte. Le carte entrano nel ripasso dopo che hai aperto l\'argomento e fatto il pre-test.</p><div class="row"><a class="btn primary" href="#/mappa">Scegli il primo argomento</a></div>');
      return;
    }
    const draw = () => {
      if (sess.i >= sess.items.length) return finish();
      const it = sess.items[sess.i], c = it.card;
      const head = phaseTag() + '<h1>Ripasso' + (only ? ': ' + esc(topic(only).short) : '') + '</h1><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + sess.items.length + '" aria-valuenow="' + sess.i + '"><i style="width:' + (100 * sess.i / sess.items.length) + '%"></i></div>' +
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
        '<div class="row"><a class="btn primary" href="#/es">Esercizi</a><a class="btn" href="#/aperte">Domanda aperta</a><a class="btn" href="#/">Oggi</a></div>';
    };
    draw();
  }

  // ---------- Esercizi sulla cache ----------
  const hex3 = (n) => U.hex(n, 3);

  function accessTable(ex) {
    return '<table><thead><tr><th>#</th><th>indirizzo (binario)</th><th>hex</th><th>l/s</th><th>dato scritto (hex)</th></tr></thead><tbody>' +
      ex.accesses.map((a, i) => '<tr><td>' + (i + 1) + '</td><td class="mono">' + U.bin(a.addr, ex.cfg.addrBits).replace(/(.{4})(?=.)/g, '$1 ') + '</td><td class="mono">' + hex3(a.addr) + '</td><td>' + a.op + '</td><td class="mono">' + (a.op === 's' ? C.dataStr(a.data) : '') + '</td></tr>').join('') + '</tbody></table>';
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
    return '<div class="card"><h3>Passo ' + (st.i + 1) + ': ' + (st.op === 's' ? 'scrittura di ' + C.dataStr(st.data) + ' in ' : 'lettura di ') + hex3(st.addr) + ' → ' + (st.hit ? 'hit' : 'miss') + '</h3><ul>' +
      C.explainStep(ex.cfg, st).map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul><p><strong>Memoria:</strong> <span class="mono">' + C.memStr(st) + '</span></p><div class="scroll">' + cacheTable(ex.cfg, st.after) + '</div></div>';
  }
  function statement(ex, title, src) {
    return '<h1>' + title + '</h1><p>Sia data la seguente sequenza di indirizzi in lettura (l) o scrittura (s) emessi dalla CPU, e la memoria con il contenuto esadecimale mostrato. ' + esc(ex.text) + '</p>' +
      (src ? '<p class="src">' + esc(src) + '</p>' : '') + '<div class="two"><div class="scroll">' + accessTable(ex) + '</div><div class="scroll">' + memTable(ex.memory) + '</div></div>';
  }
  // Modulo di risposta dell'esercizio traccia, usato dalle pagine di esercizio e dal simulatore d'esame.
  const traceStatement = (ex) => '<p>Sia data la seguente sequenza di indirizzi in lettura (l) o scrittura (s) emessi dalla CPU, e la memoria con il contenuto esadecimale mostrato. ' + esc(ex.text) + '</p><div class="two"><div class="scroll">' + accessTable(ex) + '</div><div class="scroll">' + memTable(ex.memory) + '</div></div>';
  function traceFields(ex, req) {
    const cfg = ex.cfg, r = req ? ' required' : '', setName = cfg.ways === 1 ? 'linea' : 'set';
    const inp = (label, name) => '<label>' + label + ' <input class="num" name="' + name + '" inputmode="numeric"' + r + '></label>';
    return '<div class="row">' + inp('bit di tag', 'tag') + inp('bit di ' + setName, 'set') + inp('bit di parola', 'word') + (cfg.byteBits ? inp('bit di byte', 'byte') : '') + inp('numero di ' + (cfg.ways === 1 ? 'linee' : 'set'), 'sets') + '</div>';
  }
  function traceRows(ex, from, req) {
    const cfg = ex.cfg, r = req ? ' required' : '', setName = cfg.ways === 1 ? 'linea' : 'set';
    const rows = ex.sim.steps.map((st, i) => i < from ? '' :
      '<tr data-row="' + i + '"><td>' + (i + 1) + '</td><td class="mono">' + hex3(st.addr) + ' ' + st.op + (st.op === 's' ? ' ' + C.dataStr(st.data) : '') + '</td>' +
      '<td><select name="hit' + i + '"' + r + ' aria-label="Passo ' + (i + 1) + ': hit o miss"><option value="">…</option><option value="1">hit</option><option value="0">miss</option></select></td>' +
      '<td><input class="num" name="set' + i + '" inputmode="numeric"' + r + ' aria-label="Passo ' + (i + 1) + ': ' + setName + '"></td>' +
      (cfg.ways > 1 ? '<td><input class="num" name="way' + i + '" inputmode="numeric"' + r + ' aria-label="Passo ' + (i + 1) + ': linea nel set"></td>' : '') +
      '<td><input class="memin" name="mem' + i + '" placeholder="/ oppure M[103]=04, M[105]=FF" aria-label="Passo ' + (i + 1) + ': modifiche alla memoria"></td></tr>').join('');
    return '<p class="small muted">Tieni la cache su carta, come all\'esame. Linee libere: si usa quella di indice minore. Memoria: scrivi <span class="mono">/</span> se non cambia.</p>' +
      '<div class="scroll"><table><thead><tr><th>#</th><th>accesso</th><th>hit/miss</th><th>' + setName + '</th>' + (cfg.ways > 1 ? '<th>linea nel set</th>' : '') + '<th>modifica memoria</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  const traceForm = (ex, from, req) => '<h3>Campi dell\'indirizzo</h3>' + traceFields(ex, req) + '<h3>Evoluzione</h3>' + traceRows(ex, from, req);
  // Una riga lasciata vuota (possibile solo nel simulatore) conta come sbagliata: hit = null non coincide mai.
  const readTrace = (fd, ex) => ({ tag: fd.get('tag'), set: fd.get('set'), word: fd.get('word'), byte: fd.get('byte'), sets: fd.get('sets'),
    steps: ex.sim.steps.map((_, i) => ({ hit: fd.get('hit' + i) === '' || fd.get('hit' + i) === null ? null : fd.get('hit' + i) === '1', set: fd.get('set' + i) === '' ? NaN : fd.get('set' + i), way: fd.get('way' + i) === '' ? NaN : fd.get('way' + i), mem: fd.get('mem' + i) })) });

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
    main.innerHTML = modeNav(mode) + statement(ex, guided ? 'Esercizio guidato' : 'Esercizio libero') +
      '<form id="tf"><h2>1. Campi dell\'indirizzo</h2>' + (guided
        ? '<p>Campi (già calcolati): tag ' + cfg.tagBits + ' bit, ' + setName + ' ' + cfg.setBits + ' bit, parola ' + cfg.wordBits + ' bit' + (cfg.byteBits ? ', byte ' + cfg.byteBits + ' bit' : '') + '; ' + cfg.sets + ' ' + (cfg.ways === 1 ? 'linee' : 'set da ' + cfg.ways + ' linee') + '.</p>' + D.campi(cfg, ex.accesses[from].addr)
        : traceFields(ex, true)) +
      '<h2>2. Evoluzione</h2>' + (guided ? '<p>I primi 4 passi sono svolti. Continua tu dal passo 5, partendo dallo stato della cache dopo il passo 4.</p>' + sim.steps.slice(0, from).map((st) => stepBlock(ex, st)).join('') : '') +
      traceRows(ex, from, true) +
      '<div class="row"><label>Quanto sei sicuro del risultato? <select name="conf" required><option value="">…</option>' + [1, 2, 3, 4, 5].map((n) => '<option>' + n + '</option>').join('') + '</select></label><button class="primary">Correggi</button><a class="btn quiet" href="#/es/traccia/' + mode + '" id="again">Altro esercizio</a></div></form><div id="res" aria-live="polite"></div>';
    on('#again', 'click', (e) => { e.preventDefault(); viewTraccia(mode); });
    $('#tf').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const ans = readTrace(fd, ex);
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
      $('#res').innerHTML = '<h2>Correzione: ' + pct(g.score) + '</h2><p class="muted">Un passo conta solo se è giusto in ogni parte. Risposte singole giuste: ' + g.points + ' su ' + g.max + '.</p>' +
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

  // ---------- Domande aperte con griglia di autovalutazione ----------
  function viewAperte(id) {
    main.className = '';
    // Senza argomento: tutte le domande aperte della fase corrente, mescolando gli argomenti.
    const qs = id ? course.open[id] || [] : phaseOpen();
    if (!qs.length) return (main.innerHTML = phaseTag() + '<h1>Domande aperte</h1><p class="msg">Nessuna domanda per questo argomento.</p>');
    // Si propone la domanda fatta meno di recente.
    const lastDone = (q) => { const it = state.items[q.id]; return it && it.last ? it.last : ''; };
    const q = qs.slice().sort((a, b) => lastDone(a).localeCompare(lastDone(b)))[0];
    let secs = 600;
    main.innerHTML = phaseTag() + '<h1>Domanda aperta</h1><p class="small muted">' + esc(topic(q.topic).short) + ' · Al compitino vale 4 punti. Scrivi come all\'esame, senza guardare gli appunti: hai 10 minuti.</p><div class="card"><p class="q"><strong>' + esc(q.q) + '</strong></p>' +
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
        '<p class="small muted">La griglia è un\'autovalutazione. Per una correzione vera del testo, usa il comando <span class="mono">/quiz ' + q.topic + '</span> in chat con Claude Code.</p>';
      $('#gf').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const n = $$('#gf input:checked').length, score = n / q.points.length;
        ST.recordExercise(state, { id: q.id, topic: q.topic, kind: 'open' }, score, conf, today()); save();
        $('#res').innerHTML = '<p class="msg ' + (score >= 0.6 ? 'ok' : 'bad') + '">' + n + ' punti su ' + q.points.length + ' (circa ' + (4 * score).toFixed(1) + ' su 4).' + (score < 1 ? ' Rileggi i punti mancanti e ripeti la risposta a voce.' : '') + '</p>' +
          (score < 0.6 ? '<div id="ekbox">' + errorPicker('ek') + '</div>' : '') + '<div class="row"><button class="primary" id="more">Altra domanda</button><a class="btn" href="#/">Oggi</a></div>';
        on('#more', 'click', () => viewAperte(id));
        on('[data-ek]', 'click', (e2) => { ST.addError(state, { topic: q.topic, ref: q.id, kind: e2.currentTarget.dataset.ek, note: 'punti mancanti nella risposta aperta' }, today()); save(); $('#ekbox').innerHTML = '<p class="msg">Registrato.</p>'; });
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
    const mine = state.errors.filter((e) => inPhase(e.topic));
    const open = mine.filter((e) => !e.resolved);
    const byKind = ST.ERROR_KINDS.map((k) => [k, mine.filter((e) => e.kind === k).length]);
    const advice = { concetto: 'Torna alla spiegazione e all\'esempio svolto prima di riprovare.', calcolo: 'Il metodo c\'è: rifai il conto scrivendo ogni passaggio.', distrazione: 'Rileggi la consegna e controlla la risposta prima di consegnare.' };
    main.innerHTML = phaseTag() + '<h1>Quaderno degli errori</h1><p class="muted">Ogni errore torna in rotazione finché non lo risolvi due volte di fila, a distanza di giorni.</p>' +
      '<div class="tiles">' + byKind.map(([k, n]) => '<div class="tile"><b>' + n + '</b><span>' + k + '</span></div>').join('') + '</div>' +
      (open.length ? open.map((e) => { const r = refLabel(e.ref); const due = U.diffDays(e.due, t) >= 0; return '<div class="card" data-err="' + e.id + '"><p><span class="badge s-' + (due ? 'bad' : 'none') + '">' + (due ? 'da riprovare oggi' : 'torna il ' + dateIt(e.due)) + '</span> <label class="small muted">tipo <select data-kind aria-label="Tipo di errore">' + ST.ERROR_KINDS.map((k) => '<option' + (k === e.kind ? ' selected' : '') + '>' + k + '</option>').join('') + '</select></label> <span class="small muted">' + esc(topic(e.topic).short) + ' · ' + dateIt(e.d) + ' · successi ' + e.wins + '/2</span></p><p><strong>' + esc(r.text) + '</strong></p>' +
        (e.note ? '<p class="small muted">' + esc(e.note) + '</p>' : '') + '<p class="small">' + advice[e.kind] + '</p>' +
        (r.card ? '<details><summary>Riprova: rispondi, poi apri per controllare</summary><p>' + esc(r.card.a) + '</p><p class="src">' + esc(r.card.src) + '</p><div class="row"><button data-retry="1">Ora giusta</button><button data-retry="0">Ancora sbagliata</button></div></details>'
          : '<div class="row"><a class="btn" href="' + (r.href || '#/') + '">Rifai un esercizio di questo tipo</a><button data-retry="1">L\'ho rifatto giusto</button><button data-retry="0">Ancora sbagliato</button></div>') + '</div>'; }).join('')
        : '<p class="msg ok">Nessun errore aperto.</p>') +
      (mine.length > open.length ? '<p class="small muted">' + (mine.length - open.length) + ' errori risolti.</p>' : '');
    on('[data-kind]', 'change', (e) => { const err = state.errors.find((x) => x.id === e.target.closest('[data-err]').dataset.err); err.kind = e.target.value; save(); viewErrori(); });
    on('[data-retry]', 'click', (e) => { ST.retryError(state, e.target.closest('[data-err]').dataset.err, e.target.dataset.retry === '1', t); save(); viewErrori(); });
  }

  // ---------- Piano ----------
  function viewPiano() {
    main.className = '';
    const plan = buildPlan();
    main.innerHTML = phaseTag() + '<h1>Piano di studio</h1><p class="muted">' + (examDate() ? 'Calcolato a ritroso dal ' + dateIt(examDate()) : 'In attesa della data') + ' e ricalcolato a ogni apertura in base ai tuoi risultati. Blocchi brevi e di tipo diverso, con pausa tra uno e l\'altro; niente studio dopo le 18.</p>' +
      plan.warnings.map((w) => '<p class="msg warn">' + esc(w) + '</p>').join('') +
      plan.days.map((d, i) => '<div class="day"><h3>' + (i === 0 ? 'Oggi, ' : '') + dateIt(d.date) + ' <span class="small muted">· ' + d.total + ' min</span></h3><ol>' + d.blocks.map(blockLi).join('') + '</ol></div>').join('') +
      '<p class="small muted">Un argomento esce dal piano quando la ritenzione stimata delle sue carte supera il 60%.</p>';
  }

  // ---------- Progressi (della fase corrente) ----------
  function viewProgressi() {
    main.className = '';
    const scoped = Object.assign({}, state, { reviews: state.reviews.filter((r) => inPhase(r.topic)) });
    const cal = ST.calibration(scoped), ill = ST.illusions(scoped);
    const n = scoped.reviews.filter((r) => r.kind !== 'pretest').length;
    const hi = cal.filter((r) => r.conf >= 4 && r.n), hiN = hi.reduce((s, r) => s + r.n, 0), hiAcc = hiN ? hi.reduce((s, r) => s + r.accuracy * r.n, 0) / hiN : null;
    const kinds = [['card', 'Flashcard'], ['ex', 'Esercizi'], ['open', 'Domande aperte'], ['mcq', 'Scelta multipla']];
    const exams = state.exams.filter((e) => e.phase === phase());
    main.innerHTML = phaseTag() + '<h1>Progressi</h1><div class="tiles"><div class="tile"><b>' + n + '</b><span>risposte registrate</span></div><div class="tile"><b>' + pct(ST.accuracy(scoped)) + '</b><span>accuratezza</span></div><div class="tile"><b>' + ST.streak(state, today()) + '</b><span>giorni di fila</span></div></div>' +
      '<h2>Accuratezza per tipo</h2><table><tbody>' + kinds.map(([k, l]) => '<tr><td>' + l + '</td><td class="num">' + pct(ST.accuracy(scoped, (r) => r.kind === k)) + '</td><td class="num muted">' + scoped.reviews.filter((r) => r.kind === k).length + ' risposte</td></tr>').join('') + '</tbody></table>' +
      '<h2>Calibrazione</h2><p class="muted">Quando dici di essere sicuro, hai ragione? Se a sicurezza 5 l\'accuratezza è molto sotto il 100%, stai sopravvalutando ciò che sai.</p>' +
      '<table><thead><tr><th>Sicurezza dichiarata</th><th class="num">Risposte</th><th class="num">Giuste</th><th>Lettura</th></tr></thead><tbody>' + cal.map((r) => { const gap = r.n >= 5 ? r.accuracy - r.expected : null;
        return '<tr><td>' + r.conf + ' su 5</td><td class="num">' + r.n + '</td><td class="num">' + pct(r.accuracy) + '</td><td class="small">' + (gap === null ? '<span class="muted">servono almeno 5 risposte</span>' : gap < -0.2 ? '<span class="badge s-bad">troppo sicuro</span>' : gap > 0.25 ? '<span class="badge s-mid">più bravo di quanto pensi</span>' : '<span class="badge s-ok">calibrato</span>') + '</td></tr>'; }).join('') + '</tbody></table>' +
      (hiAcc !== null ? '<p>Con sicurezza alta (4-5) hai risposto giusto nel <strong>' + pct(hiAcc) + '</strong> dei casi (' + hiN + ' risposte).</p>' : '') +
      '<h2>Illusioni di competenza</h2>' + (ill.length ? '<p class="muted">Elementi su cui eri sicuro (4-5) e hai sbagliato:</p><ul>' + ill.slice(0, 10).map((x) => '<li>' + esc(refLabel(x.id).text) + ' <span class="muted small">' + x.n + ' volte</span></li>').join('') + '</ul>' : '<p class="muted">Nessuna finora.</p>') +
      '<h2>Simulazioni d\'esame</h2>' + (exams.length ? '<table><thead><tr><th>Data</th><th class="num">Punteggio</th><th>Argomenti più deboli</th></tr></thead><tbody>' + exams.map((e) => '<tr><td>' + dateIt(e.d) + '</td><td class="num">' + e.score.toFixed(1) + ' / ' + e.max + '</td><td class="small">' + esc((e.weak || []).join(', ') || '–') + '</td></tr>').join('') + '</tbody></table>' : '<p class="muted">Nessuna finora.</p>');
  }

  // ---------- Esercizi: indice e pagina generica ----------
  function viewEsercizi() {
    main.className = '';
    const t = today();
    const rows = phaseGens().map((g) => { const it = state.items[g.id]; const due = !it || SCH.isDue(it, t);
      return '<tr><td><a href="#/es/' + g.sub + '">' + esc(g.title) + '</a><br><span class="small muted">' + esc(g.desc) + '</span></td><td class="small">' + esc(topic(g.topic).short) + '</td><td>' + (due ? '<span class="badge s-mid">da fare oggi</span>' : '<span class="badge s-none">torna il ' + dateIt(it.due) + '</span>') + '</td></tr>'; }).join('');
    const opens = course.topicsOf(phase()).filter((x) => (course.open[x.id] || []).length);
    main.innerHTML = phaseTag() + '<h1>Esercizi</h1><p class="muted">Esercizi con numeri sempre diversi e correzione passo per passo. Alternali: non fare dieci volte di fila lo stesso tipo.</p>' +
      '<div class="scroll"><table><thead><tr><th>Esercizio</th><th>Argomento</th><th>Stato</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<h2>Domande aperte</h2><div class="row"><a class="btn primary" href="#/aperte">Una domanda a caso</a></div><ul>' + opens.map((x) => '<li><a href="#/aperte/' + x.id + '">' + esc(x.short) + '</a> <span class="small muted">' + course.open[x.id].length + ' domande</span></li>').join('') + '</ul>';
  }

  const fieldInput = (f, pre) => '<label>' + esc(f.label) + ' <input name="' + pre + f.name + '" class="' + (f.wide === false ? 'num' : 'ans') + '" autocomplete="off" required' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '></label>';
  const resultItems = (g) => g.items.map((it) => '<p class="msg ' + (it.ok ? 'ok' : 'bad') + '"><strong>' + esc(it.label) + ':</strong> ' + esc(it.detail) + '</p>').join('');

  function viewGen(sub) {
    main.className = '';
    const R = ADE.exercises[sub];
    const gen = course.generators.find((g) => g.sub === sub);
    if (!R || !gen) return (main.innerHTML = '<h1>Esercizio non trovato</h1><p><a href="#/es">Tutti gli esercizi</a></p>');
    if (!inPhase(gen.topic)) { state.settings.phase = course.phaseOf(gen.topic); save(); drawPhase(); }
    const ex = R.make(Math.floor(Math.random() * 1e9));
    main.innerHTML = phaseTag() + '<p class="small muted"><a href="#/es">Esercizi</a> / ' + esc(topic(gen.topic).short) + '</p><h1>' + esc(R.title) + '</h1>' + R.prompt(ex) +
      '<form id="gf"><div class="row">' + R.fields(ex).map((f) => fieldInput(f, '')).join('') + '</div>' + (R.form ? R.form(ex) : '') +
      '<div class="row"><label>Quanto sei sicuro? <select name="conf" required><option value="">…</option>' + [1, 2, 3, 4, 5].map((n) => '<option>' + n + '</option>').join('') + '</select></label><button class="primary">Correggi</button></div></form><div id="res" aria-live="polite"></div>';
    const first = $('#gf input'); if (first) first.focus();
    $('#gf').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const g = R.grade(ex, Object.fromEntries(fd.entries()));
      ST.recordExercise(state, gen, g.score, Number(fd.get('conf')), today()); save();
      $$('#gf input, #gf select, #gf button').forEach((el) => (el.disabled = true));
      $('#res').innerHTML = resultItems(g) + (g.score < 1 ? '<div id="ekbox">' + errorPicker('ek') + '</div>' : '') +
        '<details' + (g.score < 1 ? ' open' : '') + '><summary>Procedimento completo</summary>' + (R.solution ? R.solution(ex) : '<ol>' + R.steps(ex).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol>') + '</details>' +
        '<p class="src">' + esc(R.src) + '</p><div class="row"><button class="primary" id="more">Altro esercizio <kbd>n</kbd></button><a class="btn" href="#/es">Cambia tipo di esercizio</a></div>';
      on('#more', 'click', () => viewGen(sub));
      keys = (k) => { if (k === 'n') { viewGen(sub); return true; } };
      on('[data-ek]', 'click', (ev) => {
        ST.addError(state, { topic: gen.topic, ref: gen.id, kind: ev.currentTarget.dataset.ek, note: g.items.filter((i) => !i.ok).map((i) => i.label).join(', ') }, today()); save();
        $('#ekbox').innerHTML = '<p class="msg">Registrato nel quaderno degli errori.</p>';
      });
      $('#more').focus();
    });
  }

  // ---------- Simulatore d'esame ----------
  // Formato per fase (ASSUNZIONI.md, A1 e A12): 3 domande da 8/3 punti, 4 aperte da 4, 1 esercizio da 8.
  const SIM = {
    1: { minutes: 90, calc: ['hamming', 'disco'], big: 'traccia', bigTitle: 'esercizio sulla cache' },
    2: { minutes: 90, calc: ['ieee', 'conta'], big: 'pipeline', bigTitle: 'esercizio sulla pipeline' },
  };
  const pickN = (arr, n) => arr.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).slice(0, n).map((x) => x[1]);

  function viewEsame() {
    main.className = '';
    const cfg = SIM[phase()];
    const ready = course.topicsOf(phase()).filter((t) => t.ready);
    const missing = cfg.calc.concat(phase() === 1 ? [] : [cfg.big]).filter((k) => !ADE.exercises[k]);
    const past = state.exams.filter((e) => e.phase === phase());
    main.innerHTML = phaseTag() + '<h1>Simulazione del ' + phaseInfo().title.toLowerCase() + '</h1>' +
      '<p>' + cfg.minutes + ' minuti, 8 domande, 32 punti, come nelle prove del corso:</p><ul><li>3 domande da circa 2,67 punti: una di teoria a scelta multipla e due di calcolo;</li><li>4 domande aperte da 4 punti;</li><li>1 ' + cfg.bigTitle + ' da 8 punti.</li></ul>' +
      '<p class="small muted">All\'esame le domande di calcolo sono a scelta multipla; qui devi scrivere il risultato, che è più difficile e non ti permette di andare per esclusione. Le domande aperte si correggono con la griglia.</p>' +
      (missing.length || !ready.length ? '<p class="msg warn">Contenuti non ancora disponibili per questa parte.</p>' : '<div class="row"><button class="primary" id="start">Inizia: partono i ' + cfg.minutes + ' minuti</button></div><p class="small muted">Chiudi appunti e slide. Tieni carta e penna.</p>') +
      (past.length ? '<p class="small muted">Simulazioni fatte: ' + past.map((e) => e.score.toFixed(1) + '/' + e.max).join(', ') + '. Dettagli in <a href="#/progressi">Progressi</a>.</p>' : '');
    on('#start', 'click', runEsame);
  }

  function runEsame() {
    main.className = 'wide';
    const cfg = SIM[phase()];
    const topicsReady = course.topicsOf(phase()).filter((t) => t.ready).map((t) => t.id);
    const mcq = pickN(topicsReady.flatMap((t) => course.mcq[t] || []), 1)[0];
    const calc = cfg.calc.map((k) => ({ key: k, R: ADE.exercises[k], ex: ADE.exercises[k].make(Math.floor(Math.random() * 1e9)) }));
    // Domande aperte da argomenti diversi.
    const opens = pickN(topicsReady.filter((t) => (course.open[t] || []).length), 4).map((t) => pickN(course.open[t], 1)[0]);
    const bigTrace = cfg.big === 'traccia';
    const big = bigTrace ? C.genTrace(Math.floor(Math.random() * 1e9)) : ADE.exercises[cfg.big].make(Math.floor(Math.random() * 1e9));
    const BR = bigTrace ? null : ADE.exercises[cfg.big];
    const P3 = 8 / 3;
    const end = Date.now() + cfg.minutes * 60000;
    const qhead = (n, pts) => '<h2>Domanda ' + n + ' <span class="small muted">· ' + pts + ' punti</span></h2>';
    main.innerHTML = phaseTag() + '<div class="clock" id="clock" role="timer" aria-live="off"></div><h1>Simulazione del ' + phaseInfo().title.toLowerCase() + '</h1><form id="xf">' +
      qhead(1, '2,67') + '<fieldset class="q"><legend>' + esc(mcq.q) + '</legend>' + mcq.opts.map((o, k) => '<div><label><input type="radio" name="mcq" value="' + k + '"> ' + esc(o) + '</label></div>').join('') + '</fieldset>' +
      calc.map((c, i) => qhead(i + 2, '2,67') + c.R.prompt(c.ex) + '<div class="row">' + c.R.fields(c.ex).map((f) => fieldInput(f, 'c' + i + '_').replace(' required', '')).join('') + '</div>').join('') +
      opens.map((o, i) => qhead(i + 4, '4') + '<p><strong>' + esc(o.q) + '</strong></p><textarea name="o' + i + '" style="min-height:9rem" aria-label="Risposta alla domanda ' + (i + 4) + '"></textarea>').join('') +
      qhead(8, '8') + (bigTrace ? traceStatement(big) + traceForm(big, 0, false) : BR.prompt(big) + BR.form(big)) +
      '<div class="row"><button class="primary">Consegna</button></div></form><div id="res"></div>';
    const tick = () => { const left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), s2 = Math.floor(left / 1000) % 60; const el = $('#clock'); if (!el) return clearInterval(timer);
      el.textContent = left ? 'Tempo rimasto ' + m + ':' + String(s2).padStart(2, '0') : 'Tempo scaduto: consegna ora'; el.classList.toggle('late', left < 5 * 60000); };
    tick(); timer = setInterval(tick, 1000);
    window.onbeforeunload = () => 'Simulazione in corso';

    $('#xf').addEventListener('submit', (e) => {
      e.preventDefault();
      clearInterval(timer); window.onbeforeunload = null;
      const fd = new FormData(e.target);
      const used = Math.round((cfg.minutes * 60000 - Math.max(0, end - Date.now())) / 60000);
      $$('#xf input, #xf select, #xf textarea, #xf button').forEach((el) => (el.disabled = true));
      const results = []; // { n, title, topic, pts, max, html, ref, kind }
      const mOk = fd.get('mcq') !== null && Number(fd.get('mcq')) === mcq.ok;
      results.push({ n: 1, title: 'Scelta multipla', topic: mcq.topic, pts: mOk ? P3 : 0, max: P3, ref: mcq.id, kind: 'mcq',
        html: '<p class="msg ' + (mOk ? 'ok' : 'bad') + '">' + (mOk ? 'Giusta. ' : 'Sbagliata: la risposta era “' + esc(mcq.opts[mcq.ok]) + '”. ') + esc(mcq.why) + ' <span class="src">' + esc(mcq.src) + '</span></p>' });
      calc.forEach((c, i) => {
        const vals = {}; c.R.fields(c.ex).forEach((f) => { vals[f.name] = fd.get('c' + i + '_' + f.name); });
        const g = c.R.grade(c.ex, vals);
        results.push({ n: i + 2, title: c.R.title, topic: course.generators.find((x) => x.sub === c.key).topic, pts: g.score * P3, max: P3, ref: c.R.id, kind: 'ex', score: g.score,
          html: resultItems(g) + '<details><summary>Procedimento</summary><ol>' + c.R.steps(c.ex).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol></details>' });
      });
      let bg, bigHtml;
      if (bigTrace) {
        bg = C.gradeTrace(big, readTrace(fd, big), 0);
        const wf = bg.fields.filter((f) => !f.ok), ws = bg.steps.filter((x) => !x.ok);
        bigHtml = (wf.length || ws.length ? wf.map((f) => '<p class="msg bad"><strong>' + f.label + ':</strong> era ' + f.exp + '. ' + esc(f.why) + '</p>').join('') + ws.map((x) => '<div class="msg bad"><strong>Passo ' + (x.i + 1) + '</strong><ul>' + x.errs.map((y) => '<li>' + esc(y) + '</li>').join('') + '</ul></div>').join('') : '<p class="msg ok">Tutto corretto.</p>') +
          '<details><summary>Soluzione completa</summary>' + D.campi(big.cfg, big.accesses[0].addr) + big.sim.steps.map((st) => stepBlock(big, st)).join('') + '</details>';
      } else {
        bg = BR.grade(big, Object.fromEntries(fd.entries()));
        bigHtml = resultItems(bg) + '<details><summary>Soluzione completa</summary>' + BR.solution(big) + '</details>';
      }
      const bigGen = course.generators.find((x) => x.sub === cfg.big);
      results.push({ n: 8, title: bigGen.title, topic: bigGen.topic, pts: bg.score * 8, max: 8, ref: bigGen.id, kind: 'ex', score: bg.score, html: bigHtml });

      // Le aperte si valutano con la griglia: la simulazione si chiude dopo l'autovalutazione.
      $('#res').innerHTML = '<h1>Correzione</h1><p class="muted">Tempo usato: ' + used + ' minuti su ' + cfg.minutes + '.</p>' +
        results.filter((r) => r.n < 4).map((r) => '<h2>Domanda ' + r.n + ': ' + esc(r.title) + ' <span class="small muted">· ' + r.pts.toFixed(2) + ' / ' + r.max.toFixed(2) + '</span></h2>' + r.html).join('') +
        '<form id="of">' + opens.map((o, i) => '<h2>Domanda ' + (i + 4) + ' <span class="small muted">· aperta, 4 punti</span></h2><p><strong>' + esc(o.q) + '</strong></p><p class="small muted">La tua risposta: ' + (esc(fd.get('o' + i) || '') || '<em>vuota</em>') + '</p><p>Spunta i punti che hai davvero scritto:</p>' +
          o.points.map((pt, k) => '<div><label><input type="checkbox" name="o' + i + 'p' + k + '"> ' + esc(pt) + '</label></div>').join('') + '<p class="src">' + esc(o.src) + '</p>').join('') +
        '<h2>Domanda 8: ' + esc(bigGen.title) + ' <span class="small muted">· ' + results[results.length - 1].pts.toFixed(2) + ' / 8</span></h2>' + results[results.length - 1].html +
        '<div class="row"><button class="primary">Calcola il punteggio finale</button></div></form><div id="final" aria-live="polite"></div>';
      $('#res').scrollIntoView();
      $('#of').addEventListener('submit', (ev) => {
        ev.preventDefault();
        opens.forEach((o, i) => { const n = $$('#of input[name^="o' + i + 'p"]:checked').length, sc = n / o.points.length;
          results.push({ n: i + 4, title: 'Aperta', topic: o.topic, pts: sc * 4, max: 4, ref: o.id, kind: 'open', score: sc }); });
        $$('#of input, #of button').forEach((el) => (el.disabled = true));
        const t = today();
        const total = results.reduce((a, r) => a + r.pts, 0);
        const by = {};
        results.forEach((r) => { by[r.topic] = by[r.topic] || { pts: 0, max: 0 }; by[r.topic].pts += r.pts; by[r.topic].max += r.max; });
        // Registrazione: ogni domanda aggiorna lo stato come se fosse stata fatta singolarmente (sicurezza non rilevata).
        results.forEach((r) => {
          if (r.kind === 'mcq') state.reviews.push({ d: t, kind: 'mcq', id: r.ref, topic: r.topic, ok: r.pts > 0 ? 1 : 0, conf: 0 });
          else ST.recordExercise(state, { id: r.ref, topic: r.topic, kind: r.kind }, r.score, 0, t);
          if (r.pts / r.max < 0.6) ST.addError(state, { topic: r.topic, ref: r.ref, kind: 'concetto', note: 'dalla simulazione d\'esame, domanda ' + r.n }, t);
        });
        const weak = Object.keys(by).filter((k) => by[k].pts / by[k].max < 0.6).map((k) => topic(k).short);
        ST.recordExam(state, { phase: phase(), score: +total.toFixed(2), max: 32, minutes: used, weak }, t); save();
        const vote = (total / 32) * 30;
        $('#final').innerHTML = '<h1>Punteggio: ' + total.toFixed(1) + ' su 32</h1><p class="muted">In trentesimi circa ' + vote.toFixed(0) + '. La soglia indicata nelle slide introduttive per il compitino è 17.</p>' +
          '<h2>Per argomento</h2><table><thead><tr><th>Argomento</th><th class="num">Punti</th><th></th></tr></thead><tbody>' + Object.keys(by).map((k) => '<tr><td><a href="#/arg/' + k + '">' + esc(topic(k).title) + '</a></td><td class="num">' + by[k].pts.toFixed(1) + ' / ' + by[k].max.toFixed(1) + '</td><td>' + (by[k].pts / by[k].max < 0.6 ? '<span class="badge s-bad">da ripassare</span>' : '<span class="badge s-ok">ok</span>') + '</td></tr>').join('') + '</tbody></table>' +
          '<p>Le domande sotto il 60% sono finite nel <a href="#/errori">quaderno degli errori</a> come errori di concetto: cambia la categoria lì se era un errore di calcolo o di distrazione.</p><div class="row"><a class="btn primary" href="#/errori">Vai agli errori</a><a class="btn" href="#/">Oggi</a></div>';
        $('#final').scrollIntoView();
      });
    });
  }

  // ---------- Dati: impostazioni, backup ----------
  function viewDati() {
    main.className = '';
    main.innerHTML = '<h1>Dati e impostazioni</h1><p class="muted">Tutto resta nel tuo browser. Il file JSON esportato è lo stesso formato di <span class="mono">progress/state.json</span> usato dai comandi in chat.</p>' +
      '<h2>Date dei compitini</h2><div class="row"><label>Primo compitino <input type="date" id="exam" value="' + state.settings.examDate + '"></label><label>Secondo compitino <input type="date" id="exam2" value="' + (state.settings.phase2Date || '') + '"></label></div>' +
      '<div class="row"><label>Carte nuove al giorno <input class="num" type="number" min="0" max="80" id="npd" value="' + state.settings.newPerDay + '"></label></div>' +
      '<h2>Backup</h2><div class="row"><button class="primary" id="exp">Esporta JSON</button><label class="btn">Importa JSON <input type="file" id="imp" accept="application/json,.json" hidden></label></div><p class="small muted">Per usare i comandi in chat: esporta, salva il file come <span class="mono">progress/state.json</span> nella repo, e a fine sessione reimporta quello aggiornato.</p><div id="msg" aria-live="polite"></div>' +
      '<h2>Azzera</h2><div class="row"><button id="reset">Cancella tutti i progressi</button></div>';
    on('#exam', 'change', (e) => { if (e.target.value) { state.settings.examDate = e.target.value; save(); } });
    on('#exam2', 'change', (e) => { state.settings.phase2Date = e.target.value || null; save(); });
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
        state = st; save(); drawPhase(); applyTheme(); $('#msg').innerHTML = '<p class="msg ok">Importato.</p>';
      }).catch((err) => { $('#msg').innerHTML = '<p class="msg bad">File non valido: ' + esc(err.message) + '</p>'; });
    });
    on('#reset', 'click', () => { if (confirm('Cancellare tutti i progressi? Non si può annullare (esporta prima un backup).')) { const s = state.settings; state = ST.defaultState(); state.settings = s; save(); route(); } });
  }

  // ---------- Selettore di fase ----------
  const phaseBox = document.getElementById('phase');
  function drawPhase() {
    phaseBox.innerHTML = [1, 2].map((p) => '<button type="button" data-p="' + p + '" aria-pressed="' + (phase() === p) + '">' + course.phases[p].title + '</button>').join('');
    document.documentElement.setAttribute('data-phase', phase());
  }
  function setPhase(p) { state.settings.phase = p; save(); drawPhase(); if (location.hash && location.hash !== '#/') location.hash = '#/'; else route(); }
  phaseBox.addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) setPhase(Number(b.dataset.p)); });

  // ---------- Navigazione ----------
  const NAV = [['#/', 'Oggi'], ['#/mappa', 'Argomenti'], ['#/ripasso', 'Ripasso'], ['#/es', 'Esercizi'], ['#/errori', 'Errori'], ['#/piano', 'Piano'], ['#/esame', 'Simulazione'], ['#/progressi', 'Progressi'], ['#/dati', 'Dati']];
  function route() {
    keys = null; clearInterval(timer); window.onbeforeunload = null;
    const [p, a, b] = (location.hash || '#/').slice(2).split('/');
    const cur = '#/' + (p === 'arg' ? 'mappa' : p === 'aperte' ? 'es' : p || '');
    document.getElementById('nav').innerHTML = NAV.map(([h, l]) => '<a href="' + h + '"' + (h === cur ? ' aria-current="page"' : '') + '>' + l + '</a>').join('');
    if (!p) viewOggi();
    else if (p === 'mappa') viewMappa();
    else if (p === 'arg') viewArg(a);
    else if (p === 'ripasso') viewRipasso(a);
    else if (p === 'es' && !a) viewEsercizi();
    else if (p === 'es' && a === 'traccia') {
      if (phase() !== 1) { state.settings.phase = 1; save(); drawPhase(); }
      // Senza livello esplicito: svolto la prima volta, poi guidato, poi libero.
      const it = state.items['gen:cache-traccia'];
      const mode = b || (it && it.last ? 'libero' : state.reviews.some((r) => r.kind === 'guided' && r.ok >= 0.9) ? 'libero' : state.reviews.some((r) => r.kind === 'guided') ? 'guidato' : 'svolto');
      if (mode === 'svolto') viewSvolto(); else viewTraccia(mode);
    }
    else if (p === 'es') viewGen(a);
    else if (p === 'aperte') viewAperte(a);
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
  drawPhase();
  route();
  ADE.ui = { getState: () => state };
})();
