// Diagrammi SVG generati nel sito (doppia codifica: figura accanto al testo).
// Colori e caratteri vengono dalle classi CSS, così seguono il tema chiaro/scuro.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const U = ADE.util;

  const fig = (svg, caption) => '<figure>' + svg + '<figcaption>' + caption + '</figcaption></figure>';
  const defs = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>';

  /** Piramide della gerarchia di memoria. */
  function gerarchia() {
    const levels = [['Registri', 150], ['Cache', 230], ['Memoria centrale', 310], ['Disco', 390]];
    let s = '<svg viewBox="0 0 560 230" role="img" aria-label="Gerarchia di memoria: registri in alto, poi cache, memoria centrale e disco">' + defs;
    levels.forEach(([name, w], i) => {
      const y = 14 + i * 50;
      s += '<rect class="' + (i === 1 ? 'box-acc' : 'box') + '" x="' + (230 - w / 2) + '" y="' + y + '" width="' + w + '" height="40" rx="5"/>' +
        '<text x="230" y="' + (y + 25) + '" text-anchor="middle"' + (i === 1 ? ' class="on-acc"' : '') + '>' + name + '</text>';
    });
    s += '<path class="wire" d="M470 200V22" marker-end="url(#ah)"/><text class="t-muted" x="482" y="40">più veloce</text><text class="t-muted" x="482" y="56">più costosa</text>' +
      '<text class="t-muted" x="482" y="180">più capiente</text><text class="t-muted" x="482" y="196">più lenta</text></svg>';
    return fig(s, 'Ogni livello inferiore contiene tutti i dati dei livelli superiori. La CPU usa direttamente il livello più alto.');
  }

  /** Dove può andare il blocco 5 di una memoria da 8 blocchi in una cache da 4 linee. */
  function mapping() {
    const panel = (x, title, targets, sets) => {
      let s = '<text x="' + (x + 85) + '" y="16" text-anchor="middle" font-weight="600">' + title + '</text>';
      for (let b = 0; b < 8; b++) {
        s += '<rect class="' + (b === 5 ? 'box-acc' : 'box') + '" x="' + x + '" y="' + (28 + b * 22) + '" width="46" height="18" rx="3"/>' +
          '<text class="t-muted' + (b === 5 ? ' on-acc' : '') + '" x="' + (x + 23) + '" y="' + (41 + b * 22) + '" text-anchor="middle">B' + b + '</text>';
      }
      for (let l = 0; l < 4; l++) {
        const y = 62 + l * 30 + (sets ? Math.floor(l / 2) * 10 : 0);
        s += '<rect class="' + (targets.includes(l) ? 'box-soft' : 'box') + '" x="' + (x + 118) + '" y="' + y + '" width="52" height="22" rx="3"/>' +
          '<text class="t-muted" x="' + (x + 144) + '" y="' + (y + 15) + '" text-anchor="middle">L' + l + '</text>';
        if (targets.includes(l)) s += '<path class="wire-acc" d="M' + (x + 48) + ' 147L' + (x + 115) + ' ' + (y + 11) + '" marker-end="url(#ah)"/>';
      }
      if (sets) s += '<text class="t-muted" x="' + (x + 176) + '" y="92">set 0</text><text class="t-muted" x="' + (x + 176) + '" y="162">set 1</text>';
      return s;
    };
    const s = '<svg viewBox="0 0 640 215" role="img" aria-label="Confronto tra associazione diretta, a gruppi e completa per il blocco 5">' + defs +
      panel(0, 'Diretta', [1]) + panel(215, 'A gruppi (2 vie)', [2, 3], true) + panel(445, 'Completa', [0, 1, 2, 3]) + '</svg>';
    return fig(s, 'Il blocco B5 con 4 linee di cache: una sola linea possibile (5 mod 4 = 1); le due linee del set 1 (5 mod 2 = 1); qualunque linea.');
  }

  /**
   * Barra dell'indirizzo divisa in campi. Se addr è dato mostra anche i bit.
   * cfg: { addrBits, tagBits, setBits, wordBits, ways }
   */
  function campi(cfg, addr) {
    const parts = [['tag', cfg.tagBits], [cfg.ways === 1 ? 'linea' : 'set', cfg.setBits], ['parola', cfg.wordBits], ['byte', cfg.byteBits || 0]].filter((p) => p[1] > 0);
    const W = 520, x0 = 20;
    const bits = addr === undefined ? null : U.bin(addr, cfg.addrBits);
    let s = '<svg viewBox="0 0 560 96" role="img" aria-label="Indirizzo di ' + cfg.addrBits + ' bit diviso in ' + parts.map((p) => p[0] + ' ' + p[1] + ' bit').join(', ') + '">';
    let x = x0, pos = 0;
    parts.forEach(([name, n], i) => {
      const w = Math.max(70, (W * n) / cfg.addrBits);
      s += '<rect class="' + (i === 1 && parts.length >= 3 ? 'box-soft' : 'box') + '" x="' + x + '" y="26" width="' + w + '" height="36" rx="4"/>' +
        '<text x="' + (x + w / 2) + '" y="18" text-anchor="middle" font-weight="600">' + name + '</text>' +
        '<text class="t-mono" x="' + (x + w / 2) + '" y="49" text-anchor="middle">' + (bits ? bits.slice(pos, pos + n) : n + ' bit') + '</text>' +
        '<text class="t-muted" x="' + (x + w / 2) + '" y="80" text-anchor="middle">' + (bits ? n + ' bit' : '') + '</text>';
      x += w; pos += n;
    });
    // Le larghezze minime possono far uscire la barra: si riscala il viewBox.
    s = s.replace('viewBox="0 0 560 96"', 'viewBox="0 0 ' + Math.max(560, x + 20) + ' 96"');
    return fig(s + '</svg>', 'Da sinistra: il tag identifica il blocco, il campo centrale sceglie ' + (cfg.ways === 1 ? 'la linea' : 'il set') + ', gli ultimi bit la posizione nel blocco.');
  }

  /** Mappa degli argomenti: colonne per profondità nelle dipendenze. nodes: [{ id, short, deps, cls, ready }] */
  function mappa(nodes) {
    const depth = {};
    nodes.forEach((n) => { depth[n.id] = n.deps.filter((d) => depth[d] !== undefined).reduce((m, d) => Math.max(m, depth[d] + 1), 0); });
    const cols = [];
    nodes.forEach((n) => { (cols[depth[n.id]] = cols[depth[n.id]] || []).push(n); });
    const bw = 150, bh = 38, gx = 44, gy = 16;
    const rows = Math.max(...cols.map((c) => c.length));
    const H = rows * (bh + gy) + 10, Wd = cols.length * (bw + gx);
    const pos = {};
    cols.forEach((col, ci) => col.forEach((n, ri) => {
      pos[n.id] = { x: ci * (bw + gx) + 4, y: 8 + ri * (bh + gy) + ((rows - col.length) * (bh + gy)) / 2 };
    }));
    let s = '<svg viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Mappa delle dipendenze tra argomenti">' + defs;
    nodes.forEach((n) => n.deps.forEach((d) => {
      if (!pos[d]) return;
      const a = pos[d], b = pos[n.id];
      const x1 = a.x + bw, y1 = a.y + bh / 2, x2 = b.x - 3, y2 = b.y + bh / 2, mx = (x1 + x2) / 2;
      s += '<path class="wire" d="M' + x1 + ' ' + y1 + 'C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2 + '" marker-end="url(#ah)"/>';
    }));
    nodes.forEach((n) => {
      const p = pos[n.id];
      s += '<a href="#/arg/' + n.id + '"><rect class="' + n.cls + '" x="' + p.x + '" y="' + p.y + '" width="' + bw + '" height="' + bh + '" rx="6" stroke-width="1.5"/>' +
        '<text x="' + (p.x + bw / 2) + '" y="' + (p.y + 24) + '" text-anchor="middle">' + n.short + '</text></a>';
    });
    return '<figure class="scroll">' + s + '</svg></figure>';
  }

  ADE.diagrams = { gerarchia, mapping, campi, mappa };
})(typeof globalThis !== 'undefined' ? globalThis : this);

// ---- Diagrammi degli altri argomenti ----
(function (root) {
  const D = root.ADE.diagrams;
  const fig = (svg, caption) => '<figure>' + svg + '<figcaption>' + caption + '</figcaption></figure>';
  const defs = '<defs><marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>';
  const box = (x, y, w, h, label, cls, sub) => '<rect class="' + (cls || 'box') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5"/><text x="' + (x + w / 2) + '" y="' + (y + h / 2 + (sub ? -2 : 5)) + '" text-anchor="middle"' + (cls === 'box-acc' ? ' class="on-acc"' : '') + '>' + label + '</text>' + (sub ? '<text class="t-muted" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 14) + '" text-anchor="middle">' + sub + '</text>' : '');

  D.ciclo = () => fig('<svg viewBox="0 0 560 150" role="img" aria-label="Ciclo fetch, execute, controllo interruzioni">' + defs +
    box(20, 50, 130, 50, 'Fetch', 'box-acc') + box(215, 50, 130, 50, 'Execute') + box(410, 50, 130, 50, 'Interruzioni?', 'box-soft') +
    '<path class="wire" d="M150 75H212" marker-end="url(#ah2)"/><path class="wire" d="M345 75H407" marker-end="url(#ah2)"/><path class="wire" d="M475 100V130H85V103" marker-end="url(#ah2)"/>' +
    '<text class="t-muted" x="85" y="40" text-anchor="middle">PC → IR, PC+1</text><text class="t-muted" x="475" y="40" text-anchor="middle">se sì: salva contesto, gestore</text></svg>',
    'A ogni giro: prelievo, esecuzione, poi controllo delle interruzioni pendenti.');

  D.bus = () => fig('<svg viewBox="0 0 560 190" role="img" aria-label="CPU, memoria e I/O collegati alle linee dati, indirizzi e controllo del bus">' + defs +
    box(40, 10, 120, 44, 'CPU', 'box-acc') + box(220, 10, 120, 44, 'Memoria') + box(400, 10, 120, 44, 'I/O') +
    ['Controllo', 'Indirizzi', 'Dati'].map((n, i) => '<rect class="box-soft" x="20" y="' + (86 + i * 34) + '" width="520" height="22" rx="4"/><text x="30" y="' + (102 + i * 34) + '" class="t-muted">' + n + '</text>').join('') +
    [100, 280, 460].map((x) => '<path class="wire" d="M' + x + ' 54V176"/>').join('') + '</svg>',
    'Tutti i moduli condividono le stesse linee: un solo dispositivo alla volta può trasmettere.');

  D.qpi = () => {
    const core = (x, y, n) => box(x, y, 80, 44, 'Core ' + n, 'box-acc');
    return fig('<svg viewBox="0 0 560 250" role="img" aria-label="Quattro core collegati tra loro con link QPI, ognuno con la sua DRAM, e due I/O Hub">' + defs +
      box(230, 4, 100, 34, 'I/O Hub', 'box-soft') + box(230, 212, 100, 34, 'I/O Hub', 'box-soft') +
      core(150, 70, 'A') + core(330, 70, 'B') + core(150, 140, 'C') + core(330, 140, 'D') +
      box(20, 75, 70, 34, 'DRAM') + box(470, 75, 70, 34, 'DRAM') + box(20, 145, 70, 34, 'DRAM') + box(470, 145, 70, 34, 'DRAM') +
      '<path class="wire-acc" d="M230 92H330M230 162H330M190 114V140M370 114V140M230 108L330 146M330 108L230 146M200 70L260 38M360 70L300 38M200 184L260 212M360 184L300 212"/>' +
      '<path class="wire" d="M90 92H150M90 162H150M410 92H470M410 162H470"/>' +
      '<text class="t-muted" x="280" y="60" text-anchor="middle">QPI</text><text class="t-muted" x="120" y="86" text-anchor="middle">bus</text></svg>',
      'Linee spesse: link QPI punto a punto tra core e verso gli I/O Hub. Linee sottili: memory bus verso la DRAM di ciascun core. Dagli I/O Hub ai dispositivi si usa PCI Express.');
  };

  D.hamming = () => {
    const names = ['D8', 'D7', 'D6', 'D5', 'C8', 'D4', 'D3', 'D2', 'C4', 'D1', 'C2', 'C1'];
    let s = '<svg viewBox="0 0 560 96" role="img" aria-label="Disposizione dei 12 bit di una parola di Hamming per 8 bit di dati">';
    names.forEach((n, i) => { const x = 14 + i * 44.5, chk = n[0] === 'C';
      s += '<text class="t-muted" x="' + (x + 20) + '" y="16" text-anchor="middle">' + (12 - i) + '</text><rect class="' + (chk ? 'box-acc' : 'box') + '" x="' + x + '" y="24" width="40" height="34" rx="4"/><text x="' + (x + 20) + '" y="46" text-anchor="middle"' + (chk ? ' class="on-acc"' : '') + '>' + n + '</text>' +
        '<text class="t-muted t-mono" x="' + (x + 20) + '" y="76" text-anchor="middle">' + (12 - i).toString(2).padStart(4, '0') + '</text>'; });
    return fig(s + '</svg>', 'Posizioni da 12 a 1. I controlli (evidenziati) stanno nelle potenze di 2. C4 copre le posizioni il cui numero binario ha il bit di peso 4 a 1: 5, 6, 7, 12.');
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

(function (root) {
  const D = root.ADE.diagrams;
  const fig = (svg, caption) => '<figure>' + svg + '<figcaption>' + caption + '</figcaption></figure>';
  D.pipeline = () => {
    const st = [['IF', 'preleva'], ['ID', 'decodifica, legge registri'], ['EX', 'ALU'], ['MEM', 'memoria dati'], ['WB', 'scrive registro']];
    let s = '<svg viewBox="0 0 560 120" role="img" aria-label="I cinque stadi della pipeline separati dai registri IF/ID, ID/EX, EX/MEM, MEM/WB">';
    st.forEach(([n, d], i) => { const x = 10 + i * 110;
      s += '<rect class="' + (i === 2 ? 'box-acc' : 'box') + '" x="' + x + '" y="20" width="84" height="44" rx="5"/><text x="' + (x + 42) + '" y="47" text-anchor="middle"' + (i === 2 ? ' class="on-acc"' : '') + '>' + n + '</text><text class="t-muted" x="' + (x + 42) + '" y="82" text-anchor="middle">' + d + '</text>';
      if (i < 4) s += '<rect class="box-soft" x="' + (x + 91) + '" y="14" width="12" height="56" rx="2"/><text class="t-muted" x="' + (x + 97) + '" y="104" text-anchor="middle">' + ['IF/ID', 'ID/EX', 'EX/MEM', 'MEM/WB'][i] + '</text>'; });
    return fig(s + '</svg>', 'Tra uno stadio e il successivo c\'è un registro di pipeline. Il forwarding porta i dati da EX/MEM e MEM/WB agli ingressi della ALU, nello stadio EX.');
  };
  D.ieee = () => fig('<svg viewBox="0 0 560 84" role="img" aria-label="I 32 bit IEEE 754: 1 di segno, 8 di esponente, 23 di mantissa">' +
    '<rect class="box-acc" x="10" y="24" width="34" height="34" rx="4"/><text class="on-acc" x="27" y="46" text-anchor="middle">s</text>' +
    '<rect class="box-soft" x="48" y="24" width="150" height="34" rx="4"/><text x="123" y="46" text-anchor="middle">esponente + 127</text>' +
    '<rect class="box" x="202" y="24" width="348" height="34" rx="4"/><text x="376" y="46" text-anchor="middle">mantissa (bit dopo la virgola)</text>' +
    '<text class="t-muted" x="27" y="76" text-anchor="middle">1</text><text class="t-muted" x="123" y="76" text-anchor="middle">8 bit</text><text class="t-muted" x="376" y="76" text-anchor="middle">23 bit</text></svg>',
    'Valore = (−1)^s · 1,mantissa · 2^(esponente − 127).');
})(typeof globalThis !== 'undefined' ? globalThis : this);
