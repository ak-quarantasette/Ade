// Argomenti: QPI, memorie interne e codice di Hamming.
(function (root) {
  const course = root.ADE.course;

  course.define('qpi', {
    src: { q: 'Slide «QPI», pag. ' },
    intro: 'Domanda aperta uscita nel 2025: schema di interconnessione con 4 core e livelli del QPI.',
    sections: [
      { title: 'Dal bus condiviso al punto a punto', src: 'q:1', diagram: 'qpi', html:
        '<p>Il QPI (Intel QuickPath Interconnect) è un\'interconnessione <strong>punto a punto</strong>. Tre caratteristiche:</p><ul>' +
        '<li><strong>Connessioni dirette multiple</strong>: più componenti hanno collegamenti diretti a coppie con altri componenti, senza un bus condiviso da arbitrare.</li>' +
        '<li><strong>Architettura di protocollo a strati</strong>, come nelle reti.</li>' +
        '<li><strong>Trasferimento dati a pacchetto</strong>: non un flusso di bit grezzo ma pacchetti con intestazioni di controllo e codici di controllo degli errori.</li></ul>' +
        '<p>In un sistema a 4 core ogni core è collegato via QPI agli altri core e ha la propria memoria (DRAM) su memory bus. Gli <strong>I/O Hub</strong> (IOH) sono collegati ai core via QPI e fanno da commutatori verso i dispositivi di I/O, raggiunti con PCI Express. Se due core non sono collegati direttamente, la richiesta passa per un core intermedio che la inoltra.</p>' },
      { title: 'I quattro livelli', src: 'q:1-3', html:
        '<ol><li><strong>Fisico</strong>: cavi, circuiti e logica per trasmettere e ricevere i bit. Unità: <strong>Phit</strong> da 20 bit. 20 linee per direzione più una di clock; segnalazione differenziale. I flit sono distribuiti sulle linee a turno (distribuzione multilinea).</li>' +
        '<li><strong>Link</strong>: trasmissione affidabile e controllo del flusso. Unità: <strong>Flit</strong> da 80 bit = 72 di dati o messaggio + 8 di codice di controllo dell\'errore (CRC).</li>' +
        '<li><strong>Routing</strong>: decide il percorso dei pacchetti, con tabelle di instradamento definite dal firmware.</li>' +
        '<li><strong>Protocollo</strong>: regole di alto livello per lo scambio di <strong>pacchetti</strong> (un numero intero di flit); supporta il protocollo di coerenza delle cache.</li></ol>' },
      { title: 'Le due funzioni del livello link', src: 'q:2', html:
        '<ul><li><strong>Controllo del flusso</strong>: sistema a crediti. Il mittente riceve un numero di crediti; ne consuma uno per ogni flit inviato e ne riottiene uno quando il destinatario libera un buffer. Così non invia più di quanto l\'altro possa ricevere.</li>' +
        '<li><strong>Controllo dell\'errore</strong>: il destinatario ricalcola il CRC sui 72 bit; se non coincide chiede la ritrasmissione del flit errato (e di quelli inviati dopo).</li></ul>' },
    ],
    cards: [
      ['cosa', 'qpi', 'Quali sono le tre caratteristiche che distinguono il QPI da un bus condiviso?', 'Connessioni dirette multiple (punto a punto, a coppie); architettura di protocollo a strati; trasferimento dati a pacchetto.', 'q:1'],
      ['schema', 'qpi', 'Descrivi lo schema di interconnessione QPI con una CPU a 4 core.', 'I core sono collegati tra loro con link QPI diretti; ogni core ha la sua DRAM su memory bus. Gli I/O Hub sono collegati ai core via QPI e ai dispositivi di I/O via PCI Express, facendo da commutatori. Tra core non collegati direttamente la richiesta è inoltrata da un core intermedio.', 'q:1', 'Cosa cambia per un sistema con 8 o più processori?'],
      ['livelli', 'qpi', 'Elenca i quattro livelli del QPI dal basso verso l\'alto, con l\'unità di trasferimento.', 'Fisico (Phit, 20 bit); Link (Flit, 80 bit); Routing; Protocollo (pacchetto = numero intero di flit).', 'q:1'],
      ['flit', 'qpi', 'Com\'è composto un flit?', '80 bit: 72 di dati o messaggio più 8 di codice per il controllo dell\'errore (CRC).', 'q:2'],
      ['flusso', 'qpi', 'Come funziona il controllo del flusso nel livello link?', 'Con un sistema a crediti: il mittente ha un numero di crediti, ne spende uno per ogni flit inviato e ne riceve uno quando il destinatario libera un buffer. Evita di inviare più dati di quanti il destinatario possa ricevere.', 'q:2'],
      ['errore', 'qpi', 'Come funziona il controllo dell\'errore nel livello link?', 'Il mittente calcola un CRC di 8 bit sui 72 bit e lo inserisce nel flit; il destinatario lo ricalcola e, se non coincide, chiede la ritrasmissione del flit errato e dei successivi.', 'q:2'],
      ['routing', 'qpi', 'Cosa fa il livello routing e su cosa si appoggia?', 'Determina il percorso dei pacchetti nel sistema, usando tabelle di instradamento definite dal firmware; utile soprattutto nei sistemi grandi.', 'q:3'],
      ['protocollo', 'qpi', 'Due caratteristiche del livello protocollo.', 'Il contenuto del pacchetto è definito in modo flessibile; supporta il protocollo di coerenza della cache tra le cache dei core e la memoria principale.', 'q:3'],
    ],
    mcq: [
      ['Qual è l\'unità di trasferimento del livello fisico del QPI?', ['Flit da 80 bit', 'Phit da 20 bit', 'Pacchetto', 'Byte', 'Parola da 72 bit'], 1, 'Phit = unità fisica, 20 bit.', 'q:1'],
      ['Quanti bit di un flit sono dedicati al controllo dell\'errore?', ['4', '8', '20', '72', 'Nessuno'], 1, '72 di dati + 8 di CRC = 80.', 'q:2'],
      ['Quale livello del QPI è responsabile del controllo del flusso?', ['Fisico', 'Link', 'Routing', 'Protocollo', 'Nessuno'], 1, 'Il livello link: trasmissione affidabile e controllo del flusso.', 'q:1-2'],
      ['Nel QPI, con quale tecnologia l\'I/O Hub raggiunge i dispositivi di I/O?', ['QPI', 'Memory bus', 'PCI Express', 'Bus di sistema condiviso', 'DMA'], 2, 'Tra IOH e dispositivi si usa PCI Express.', 'q:1'],
      ['Quale affermazione sul QPI è falsa?', ['È un\'interconnessione punto a punto', 'Ha un\'architettura a livelli', 'Trasferisce i dati come flusso di bit non elaborato', 'Usa un sistema a crediti', 'Supporta la coerenza delle cache'], 2, 'I dati viaggiano a pacchetti, non come flusso grezzo.', 'q:1'],
    ],
    open: [
      ['schema', 'Descrivere lo schema di interconnessione (cioè come sono connesse le varie componenti coinvolte, ipotizzando una CPU con 4 core) del QPI, ed elencare i livelli che lo compongono.', ['Interconnessione punto a punto con connessioni dirette a coppie', 'I 4 core collegati tra loro da link QPI; inoltro tramite core intermedi se manca il link diretto', 'Ogni core con la propria DRAM su memory bus', 'I/O Hub collegati ai core via QPI, dispositivi di I/O via PCI Express', 'Livello fisico (Phit 20 bit)', 'Livello link (Flit 80 bit; controllo di flusso ed errore)', 'Livello routing (instradamento)', 'Livello protocollo (pacchetti, coerenza delle cache)'], 'q:1-3'],
    ],
  });

  course.define('mem-interne', {
    src: { m: 'Slide «Memoria centrale a semiconduttore», pag. ', ap: 'Appunti «AdE semplice (per davvero)», pag. ' },
    intro: 'Al compitino: una domanda a scelta multipla sul codice di Hamming (2,67 punti), possibile domanda aperta su SRAM e DRAM.',
    sections: [
      { title: 'RAM dinamica e RAM statica', src: 'm:1-5', html:
        '<p>La RAM è ad accesso casuale, si legge e si scrive, è <strong>volatile</strong>.</p><div class="scroll"><table><thead><tr><th></th><th>DRAM (dinamica)</th><th>SRAM (statica)</th></tr></thead><tbody>' +
        '<tr><th>Come memorizza</th><td>carica in un condensatore (un condensatore per bit)</td><td>porte logiche (flip-flop), più elementi per bit</td></tr>' +
        '<tr><th>Refresh</th><td>necessario: la carica decade</td><td>non serve</td></tr>' +
        '<tr><th>Costo e densità</th><td>più semplice, più piccola, più densa, meno costosa</td><td>più complessa e costosa</td></tr>' +
        '<tr><th>Velocità</th><td>più lenta</td><td>più veloce</td></tr><tr><th>Uso</th><td>memoria principale</td><td>cache</td></tr></tbody></table></div>' +
        '<p>DRAM, lettura: si attiva la linea indirizzo, la carica del condensatore fluisce sulla linea di bit verso un amplificatore che la confronta con un riferimento; poi la carica va ristabilita.</p>' },
      { title: 'ROM e derivate', src: 'm:6', html:
        '<p>Memorie <strong>non volatili</strong>, usate per microprogrammi, subroutine di libreria, programmi di sistema (BIOS), funzioni tabulate.</p><ul>' +
        '<li><strong>ROM</strong>: scritta in produzione; costosa per pochi pezzi.</li><li><strong>PROM</strong>: programmabile una sola volta, con strumentazione apposita.</li>' +
        '<li><strong>EPROM</strong>: si cancella per intero con raggi ultravioletti.</li><li><strong>EEPROM</strong>: cancellabile elettricamente; scrittura molto più lenta della lettura.</li>' +
        '<li><strong>Flash</strong>: cancellazione elettrica a blocchi.</li></ul>' },
      { title: 'Errori e codice di Hamming', src: 'm:7-10', diagram: 'hamming', html:
        '<p>Guasti <em>hardware</em> (permanenti) ed errori <em>software</em> (casuali, non distruttivi). Si rilevano e correggono aggiungendo bit di controllo.</p>' +
        '<p><strong>Quanti bit di controllo?</strong> Il minimo K tale che <span class="mono">2^K − 1 ≥ M + K</span>: 8 dati → 4; 16 → 5; 32 → 6; 64 → 7.</p>' +
        '<p><strong>Disposizione</strong>: posizioni numerate da 1; i bit di controllo stanno nelle posizioni potenze di 2 (1, 2, 4, 8…), i dati nelle altre (D1 in posizione 3). Ogni bit di controllo è lo XOR dei dati la cui posizione, in binario, ha a 1 il bit corrispondente.</p>' +
        '<p><strong>In lettura</strong>: si ricalcolano i controlli e si fa lo XOR con quelli memorizzati. Il risultato (<em>sindrome</em>) è 0 se non ci sono errori, altrimenti è il <strong>numero della posizione errata</strong>. Se la posizione è una potenza di 2 l\'errore è in un bit di controllo e i dati sono giusti.</p>' +
        '<p><strong>SEC-DED</strong>: con un bit di parità in più si corregge un errore singolo e si rilevano gli errori doppi.</p>' },
    ],
    cards: [
      ['dram', 'ram', 'Come memorizza un bit una DRAM e quale conseguenza ha?', 'Come carica in un condensatore. La carica decade col tempo, quindi serve il refresh periodico (anche con alimentazione presente) e circuiti dedicati.', 'm:2'],
      ['sram', 'ram', 'Come memorizza un bit una SRAM?', 'Con porte logiche (flip-flop): stati stabili, nessuna perdita di carica, nessun refresh. Più elementi per bit, quindi più complessa e costosa, ma più veloce.', 'm:4'],
      ['confronto', 'ram', 'SRAM e DRAM: quale si usa per la cache, quale per la memoria principale, e perché?', 'SRAM per la cache (più veloce). DRAM per la memoria principale (più densa e meno costosa, quindi più capiente). Entrambe sono volatili.', 'm:5', 'Perché non si costruisce tutta la memoria centrale in SRAM?'],
      ['dram-read', 'ram', 'Cosa succede durante la lettura di una cella DRAM?', 'Si attiva la linea indirizzo (transistor chiuso); la carica del condensatore fluisce sulla linea di bit verso un amplificatore che la confronta con un riferimento per decidere 0 o 1; poi la carica va ristabilita.', 'm:3'],
      ['rom-usi', 'rom', 'Per cosa si usano le ROM?', 'Microprogrammi, subroutine di libreria, programmi di sistema (BIOS), funzioni tabulate. Sono non volatili.', 'm:6'],
      ['rom-tipi', 'rom', 'Differenze tra PROM, EPROM, EEPROM e Flash.', 'PROM: programmabile una sola volta. EPROM: cancellabile per intero con ultravioletti. EEPROM: cancellabile elettricamente, scrittura molto più lenta della lettura. Flash: cancellazione elettrica a blocchi.', 'm:6'],
      ['errori', 'hamming', 'Differenza tra guasto hardware ed errore software in una memoria.', 'Guasto hardware (hard failure): permanente. Errore software (soft error): casuale, non distruttivo, non lascia danni permanenti.', 'm:7'],
      ['k', 'hamming', 'Quale disuguaglianza dà il numero K di bit di controllo per M bit di dati? Quanto vale K per 8 e per 16 bit?', '2^K − 1 ≥ M + K. Per 8 bit K = 4; per 16 bit K = 5 (32 → 6, 64 → 7).', 'm:8'],
      ['posizioni', 'hamming', 'Dove si mettono i bit di controllo e i bit di dati in una parola di Hamming?', 'Posizioni numerate da 1. Controlli nelle posizioni potenze di 2 (1, 2, 4, 8, …), dati nelle altre in ordine: D1 in 3, D2 in 5, D3 in 6, D4 in 7, D5 in 9…', 'm:9'],
      ['calcolo', 'hamming', 'Come si calcola il bit di controllo C4?', 'È lo XOR di tutti i bit di dati la cui posizione ha il bit di peso 4 a 1: posizioni 5, 6, 7, 12 (e 13, 14, 15, 20… per parole più lunghe).', 'm:9', 'Quali posizioni controlla C1?'],
      ['sindrome', 'hamming', 'In lettura, cosa indica la sindrome?', 'È lo XOR tra controlli memorizzati e ricalcolati. 0 = nessun errore. Altrimenti è il numero della posizione errata: se è una potenza di 2 è sbagliato un bit di controllo (dati corretti), se no va invertito quel bit di dati.', 'm:8-9'],
      ['secded', 'hamming', 'Cosa significa SEC-DED e come si ottiene?', 'Single Error Correction, Double Error Detection: corregge un errore singolo e rileva due errori. Si ottiene aggiungendo un bit di parità al codice di Hamming.', 'm:10'],
    ],
    mcq: [
      ['Quale tipo di RAM ha bisogno di refresh?', ['SRAM', 'DRAM', 'Entrambe', 'Nessuna', 'Solo la cache'], 1, 'La carica dei condensatori decade.', 'm:2'],
      ['Quanti bit di controllo di Hamming servono per 16 bit di dati?', ['3', '4', '5', '6', '16'], 2, '2^5 − 1 = 31 ≥ 16 + 5.', 'm:8'],
      ['In una parola di Hamming, in quale posizione sta il primo bit di dati D1?', ['1', '2', '3', '4', '5'], 2, 'Le posizioni 1 e 2 sono di controllo.', 'm:9'],
      ['La sindrome vale 0100 (cioè 4). Cosa significa?', ['Nessun errore', 'Errore nel dato D4', 'Errore in un bit di controllo, i dati sono corretti', 'Due errori', 'Errore nel dato D1'], 2, 'La posizione 4 è una potenza di 2: contiene C4.', 'm:9'],
      ['Quale memoria si cancella per intero con raggi ultravioletti?', ['PROM', 'EPROM', 'EEPROM', 'Flash', 'DRAM'], 1, 'Erasable Programmable ROM.', 'm:6'],
      ['Quale affermazione sulle SRAM è falsa?', ['Sono più veloci delle DRAM', 'Usano flip-flop', 'Non hanno bisogno di refresh', 'Sono non volatili', 'Si usano per la cache'], 3, 'SRAM e DRAM sono entrambe volatili.', 'm:5'],
    ],
    open: [
      ['sram-dram', 'Descrivere le differenze tra memorie RAM statiche e dinamiche e i rispettivi impieghi.', ['Entrambe volatili, ad accesso casuale', 'DRAM: carica in un condensatore, un condensatore per bit', 'DRAM: la carica decade, serve refresh e circuiti dedicati', 'DRAM: più semplice, densa, economica, più lenta → memoria principale', 'SRAM: flip-flop, stati stabili, nessun refresh', 'SRAM: più complessa e costosa, più veloce → cache'], 'm:1-5'],
      ['hamming', 'Spiegare come funziona il codice di correzione di Hamming per una parola di 8 bit.', ['Scopo: rilevare e correggere errori singoli', 'Numero di bit di controllo: 2^K − 1 ≥ M + K, quindi 4', 'Controlli nelle posizioni potenze di 2, dati nelle altre', 'Ogni controllo è lo XOR dei dati la cui posizione ha quel bit a 1', 'In lettura: XOR tra controlli memorizzati e ricalcolati (sindrome)', 'Sindrome = posizione del bit errato; 0 = nessun errore; potenza di 2 = errore nel controllo', 'SEC-DED con un bit in più'], 'm:7-10'],
    ],
    generators: [{ id: 'gen:hamming', sub: 'hamming', title: 'Codice di Hamming', desc: 'Codifica, sindrome, decodifica: la domanda a scelta multipla del compitino.' }],
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
