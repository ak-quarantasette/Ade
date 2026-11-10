// Integrazioni dopo il confronto con le slide complete del docente (a.a. 2025/26):
// argomenti che le lezioni trattano e che mancavano, più correzioni dove le slide dicono altro.
(function (root) {
  const course = root.ADE.course;

  // ================= PRIMA PARTE =================
  course.extend('bus', {
    src: { l: 'Slide Lez. 3 «Componenti e connessioni», ' },
    sections: [{ title: 'Chi decide chi trasmette: l\'arbitro del bus', src: 'l:«Bus Controller»', html:
      '<p>Poiché un solo dispositivo alla volta può usare il bus, serve un sistema di controllo, il <strong>bus controller</strong> o arbitro. Può essere <strong>centralizzato</strong> (un modulo separato o una parte della CPU) oppure <strong>distribuito</strong> (ogni modulo ha una propria logica di accesso: più complicato).</p>' }],
    cards: [['arbitro', 'bus', 'Cos\'è l\'arbitro del bus e in quali due modi può essere realizzato?', 'È il sistema di controllo che decide quale dispositivo può usare il bus in un dato istante. Centralizzato: un modulo separato o parte della CPU. Distribuito: ogni modulo ha una propria logica di accesso (più complicato).', 'l:«Bus Controller»']],
    mcq: [['Con un arbitraggio del bus distribuito…', ['decide sempre la CPU', 'ogni modulo ha una propria logica di accesso', 'non serve alcun controllo', 'possono trasmettere due moduli insieme', 'il bus è punto a punto'], 1, 'Nel caso centralizzato decide un modulo unico; nel distribuito la logica è in ogni modulo.', 'l:«Bus Controller»']],
  });

  course.extend('notazione', {
    src: { l: 'Slide Lez. 2 «Notazione binaria, ottale, esadecimale», ', e: 'Slide «Esercizi rappresentazione binaria, ottale, esadecimale»' },
    open: [['basi', 'Spiegare come si rappresenta un numero in base 2, 8 e 16 e come si passa da una base all\'altra.', ['Valore posizionale: ogni cifra pesa una potenza della base', 'Con n bit si rappresentano i valori da 0 a 2ⁿ − 1', 'Da decimale a binario: divisioni successive per 2', 'Ottale: una cifra ogni 3 bit, da destra', 'Esadecimale: una cifra ogni 4 bit, da destra', 'Esempio svolto di conversione'], 'l:«Notazione ottale» e «Notazione esadecimale»; e:']],
  });

  course.extend('mem-interne', {
    src: { e: 'Slide «Codici di correzione degli errori», ' },
    cards: [
      ['dove-ecc', 'hamming', 'Dove viene usato in pratica il codice di correzione degli errori (ECC)?', 'Nella RAM di server e workstation e nelle cache di molte CPU (per esempio AMD Zen, Intel Xeon/Core).', 'e:pag. 2'],
      ['perche-k', 'hamming', 'Perché la condizione sui bit di controllo è 2^K ≥ M + K + 1?', 'Ognuno degli M + K bit (dati o controllo) può essere quello errato, e in più va distinto il caso "nessun errore": servono M + K + 1 combinazioni diverse della sindrome, che ha K bit.', 'e:pag. 4', 'Quanto vale K per una parola di 1024 bit?'],
      ['sindrome-letta', 'hamming', 'Come si interpreta la sindrome in base a quanti bit ha a 1?', 'Tutti 0: nessun errore. Un solo bit a 1: l\'errore è in un bit di controllo, i dati sono corretti. Più bit a 1: il valore indica la posizione del bit di dati errato, che va invertito.', 'e:pag. 6'],
    ],
    mcq: [['Quanti bit di controllo di Hamming servono per una parola di 1024 bit?', ['8', '10', '11', '12', '1024'], 2, '2^11 = 2048 ≥ 1024 + 11 + 1; con 10 bit si avrebbe 1024 < 1035.', 'e:esercizio 3']],
  });

  course.extend('mem-esterne', {
    src: { l: 'Slide Lez. 6 «Memorie esterne», ', e: 'Slide «Esercizi sui dischi magnetici», ' },
    replace: { 'RAID': { src: 'l:«RAID 0» – «Recap»', html:
      '<p><strong>RAID</strong> (Redundant Array of Independent Disks): un insieme di dischi fisici visto dal sistema operativo come un solo dispositivo logico, con i dati distribuiti sui dischi e, tranne nel livello 0, capacità ridondante per recuperare i dati se un disco si rompe. Sette livelli (0-6), non gerarchici.</p>' +
      '<div class="scroll"><table><thead><tr><th>Livello</th><th>Come funziona</th><th>Dischi</th><th>Note</th></tr></thead><tbody>' +
      '<tr><td>0</td><td>dati divisi in strisce (strip) distribuite a turno su tutti i dischi; nessuna ridondanza</td><td>N</td><td>il più veloce; un guasto fa perdere i dati</td></tr>' +
      '<tr><td>1</td><td>mirroring: due copie su dischi separati</td><td>2N</td><td>recupero semplice, nessun fermo; costoso</td></tr>' +
      '<tr><td>2</td><td>dischi sincronizzati, strisce piccole (byte/parola), codice di Hamming su più dischi di parità</td><td>N + m</td><td>molta ridondanza, non commercializzato</td></tr>' +
      '<tr><td>3</td><td>come il 2 ma con un solo disco ridondante: un bit di parità per ogni insieme di bit corrispondenti</td><td>N + 1</td><td>trasferimento molto veloce; dischi sincronizzati</td></tr>' +
      '<tr><td>4</td><td>dischi indipendenti, strisce grandi, parità su un disco dedicato</td><td>N + 1</td><td>il disco di parità è un collo di bottiglia; non commercializzato</td></tr>' +
      '<tr><td>5</td><td>come il 4 ma con la parità distribuita a turno su tutti i dischi</td><td>N + 1</td><td>niente collo di bottiglia; comune sui server di rete</td></tr>' +
      '<tr><td>6</td><td>due calcoli di parità distinti, in blocchi separati su dischi diversi</td><td>N + 2</td><td>i dati si perdono solo con tre dischi guasti; scrittura molto più lenta</td></tr></tbody></table></div>' +
      '<p>I livelli 2 e 3 usano un accesso <em>parallelo</em> (tutti i dischi partecipano a ogni richiesta); 4, 5 e 6 un accesso <em>indipendente</em>, adatto a molte richieste di I/O.</p>' } },
    sections: [
      { title: 'Scegliere la prossima richiesta: FCFS, SSF, ascensore', src: 'e:esercizio 4', html:
        '<p>Quando ci sono più richieste in attesa su cilindri diversi, l\'ordine in cui si servono cambia il tempo di posizionamento:</p><ul>' +
        '<li><strong>First-Come First-Served</strong>: nell\'ordine di arrivo.</li><li><strong>Shortest Seek First</strong>: ogni volta la richiesta più vicina al cilindro corrente.</li>' +
        '<li><strong>Elevator Algorithm</strong>: la testina prosegue nella stessa direzione finché ci sono richieste da quella parte, poi inverte.</li></ul>' +
        '<p>Esempio: testina sul 15, richieste 10, 20, 15, 5, 40, 8, 35, 5 ms per cilindro. FCFS: 124 spostamenti = 620 ms. SSF: 45 spostamenti = 225 ms. Ascensore verso l\'alto: 60 spostamenti = 300 ms.</p>' },
      { title: 'Memoria virtuale, settori da 4K, DVD e nastri', src: 'l:«Intuizione memoria virtuale», «Nuovo standard con blocco 4K», «Tecnologia DVD», «Nastro magnetico»', html:
        '<p><strong>Memoria virtuale</strong>: la memoria principale fa da "cache" della memoria di massa, per lo stesso principio di località. Il blocco si chiama <em>pagina</em>, il miss <em>page fault</em>; il processore genera indirizzi virtuali tradotti in indirizzi fisici.</p>' +
        '<p><strong>Settori da 4K</strong> al posto di 512 byte: più spazio utile (circa 97% contro 89%) e miglior correzione degli errori.</p>' +
        '<p><strong>CD</strong>: le aree lisce (land) riflettono molto, le fosse (pit) poco; l\'inizio o la fine di un pit vale 1, nessun cambiamento vale 0. <strong>DVD</strong>: più strati e laser a lunghezza d\'onda minore, quindi più densità: 4,7GB per strato, 8,5GB su due strati, 17GB su due facce.</p>' +
        '<p><strong>Nastro magnetico</strong>: accesso seriale, molto economico, usato per backup e archiviazione; registrazione a serpentina.</p>' },
    ],
    dropCards: ['raid345', 'raid6', 'raid2'],
    cards: [
      ['raid-def', 'raid', 'Cos\'è un RAID dal punto di vista del sistema operativo?', 'Un insieme di dischi fisici visto come un unico dispositivo logico, con i dati distribuiti sui dischi e (tranne il livello 0) capacità ridondante per memorizzare informazioni di parità e recuperare i dati dopo un guasto.', 'l:«RAID»'],
      ['raid23', 'raid', 'RAID 2 e RAID 3: in cosa si somigliano e in cosa differiscono?', 'Entrambi usano dischi sincronizzati e strisce piccole, con tutti i dischi coinvolti in ogni richiesta. RAID 2 usa codici di Hamming su più dischi di parità (molta ridondanza, non commercializzato). RAID 3 usa un solo disco ridondante con un semplice bit di parità: trasferimento molto veloce.', 'l:«RAID 2», «RAID 3»'],
      ['raid45', 'raid', 'RAID 4 e RAID 5: qual è la differenza e perché conta?', 'Entrambi hanno dischi indipendenti e parità a blocchi. Nel RAID 4 la parità sta su un disco dedicato, che diventa un collo di bottiglia. Nel RAID 5 la parità è distribuita a turno su tutti i dischi, eliminando il collo di bottiglia.', 'l:«RAID 4», «RAID 5»'],
      ['raid6b', 'raid', 'RAID 6: quanti dischi servono per N dischi di dati, e quanti guasti servono per perdere i dati?', 'N + 2 dischi: due calcoli di parità distinti in blocchi separati. I dati si perdono solo se si guastano tre dischi. Prezzo: scrittura molto più lenta.', 'l:«RAID 6»'],
      ['sched', 'scheduling', 'Descrivi i tre algoritmi di selezione della prossima richiesta di cilindro.', 'FCFS: nell\'ordine di arrivo. Shortest Seek First: la richiesta più vicina al cilindro corrente. Elevator: si prosegue in una direzione finché ci sono richieste pendenti da quella parte, poi si inverte.', 'e:esercizio 4', 'Quale dei tre può far aspettare all\'infinito una richiesta lontana?'],
      ['virtuale', 'altro', 'Cos\'è la memoria virtuale, e come si chiamano blocco e miss?', 'La memoria principale usata come "cache" della memoria di massa, grazie al principio di località. Il blocco è la pagina, il miss è il page fault. Gli indirizzi virtuali generati dal processore vengono tradotti in indirizzi fisici.', 'l:«Intuizione memoria virtuale»'],
      ['dvd', 'cd', 'Perché un DVD contiene più dati di un CD? Quanto?', 'Laser a lunghezza d\'onda minore (maggiore densità) e più strati. 4,7GB per strato, 8,5GB con due strati, 17GB su due facce.', 'l:«Tecnologia DVD»'],
      ['pit1', 'cd', 'In un CD, come si distinguono gli 0 dagli 1?', 'La superficie viene letta a intervalli regolari: l\'inizio o la fine di un pit vale 1, nessun cambiamento di altezza vale 0. I land riflettono molta luce, i pit poca.', 'l:«Operazioni CD»'],
      ['nastro', 'altro', 'Caratteristiche e uso del nastro magnetico.', 'Accesso seriale, molto economico, usato per backup e archiviazione. Registrazione a serpentina: la testina percorre tutto il nastro, poi torna indietro scrivendo in direzione opposta.', 'l:«Nastro magnetico»'],
    ],
    mcq: [
      ['Per perdere i dati in un RAID 6 devono guastarsi…', ['un disco', 'due dischi', 'tre dischi', 'tutti i dischi', 'il solo disco di parità'], 2, 'Con doppia parità si sopravvive a due guasti.', 'l:«RAID 6»'],
      ['Quale algoritmo serve sempre la richiesta più vicina al cilindro corrente?', ['FCFS', 'Shortest Seek First', 'Elevator', 'Round robin', 'LRU'], 1, 'Definizione di SSF.', 'e:esercizio 4'],
      ['Nella memoria virtuale, un "page fault" corrisponde a…', ['un hit di cache', 'un miss', 'un errore di parità', 'un interrupt del timer', 'un guasto del disco'], 1, 'La pagina richiesta non è in memoria principale.', 'l:«Intuizione memoria virtuale»'],
    ],
    generators: [
      { id: 'gen:disco-byte', sub: 'disco-byte', title: 'Byte trasferiti e settori coinvolti', desc: 'Il problema inverso sui tempi del disco.' },
      { id: 'gen:scheduling', sub: 'scheduling', title: 'Algoritmi di posizionamento della testina', desc: 'FCFS, Shortest Seek First, Elevator.' },
    ],
  });

  course.extend('io', {
    src: { l: 'Slide Lez. 7 «Input/Output», ' },
    sections: [
      { title: 'DMA: cosa comunica la CPU e come è collegato', src: 'l:«Operazioni DMA», «Configurazioni DMA»', html:
        '<p>La CPU comunica al controllore DMA quattro cose: <strong>lettura o scrittura</strong>, <strong>indirizzo del dispositivo</strong>, <strong>indirizzo iniziale in memoria</strong> del blocco, <strong>quantità di dati</strong>. Poi fa altro; a trasferimento finito riceve un interrupt.</p>' +
        '<p>Tre configurazioni:</p><ul><li><strong>Bus singolo, DMA isolato</strong>: ogni trasferimento usa il bus due volte (da I/O a DMA, poi da DMA a memoria); la CPU perde il bus due volte.</li>' +
        '<li><strong>Bus singolo, DMA integrato con l\'I/O</strong>: può controllare più dispositivi; il bus si usa una volta sola.</li>' +
        '<li><strong>Bus di I/O separato</strong>: una sola interfaccia per il DMA; il bus di sistema si usa una volta sola.</li></ul>' },
      { title: 'Evoluzione dell\'I/O e canali di I/O', src: 'l:«Evoluzione delle funzioni di I/O», «Canali I/O»', html:
        '<ol><li>La CPU controlla direttamente la periferica.</li><li>Si aggiunge un modulo di I/O; I/O da programma senza interruzioni.</li><li>Stessa configurazione, con interruzioni.</li><li>Il modulo accede direttamente alla memoria (DMA).</li>' +
        '<li>Il modulo diventa un processore con istruzioni specializzate per l\'I/O.</li><li>Il modulo ha anche memoria propria: è un computer a sé.</li></ol>' +
        '<p>I punti 5 e 6 sono i <strong>canali di I/O</strong>: la CPU non esegue istruzioni di I/O, ma indica al canale quale programma di I/O eseguire (dispositivi coinvolti, aree di memoria, priorità, azioni in caso di errore). Due tipi: <strong>selettore</strong> (un dispositivo alla volta) e <strong>multiplexer</strong> (più dispositivi insieme).</p>' },
    ],
    cards: [
      ['dma-info', 'io', 'Quali informazioni comunica la CPU al controllore DMA per avviare un trasferimento?', 'Se è una lettura o una scrittura; l\'indirizzo del dispositivo; l\'indirizzo iniziale in memoria del blocco di dati; la quantità di dati da trasferire.', 'l:«Operazioni DMA»'],
      ['dma-conf', 'io', 'Quali sono le tre configurazioni DMA e quante volte ciascuna usa il bus di sistema per trasferimento?', 'Bus singolo con DMA isolato: due volte. Bus singolo con DMA integrato con l\'I/O: una volta. Bus di I/O separato: una volta.', 'l:«Configurazioni DMA»'],
      ['evoluzione', 'io', 'Elenca i sei passi dell\'evoluzione delle funzioni di I/O.', '1) CPU controlla direttamente la periferica. 2) Modulo di I/O, I/O da programma. 3) Interruzioni. 4) DMA. 5) Modulo di I/O come processore con istruzioni specializzate. 6) Modulo con memoria propria: un computer a sé.', 'l:«Evoluzione delle funzioni di I/O»'],
      ['canali', 'io', 'Cos\'è un canale di I/O e quali due tipi esistono?', 'Un\'evoluzione del DMA: un processore dedicato esegue programmi di I/O in memoria principale; la CPU non esegue istruzioni di I/O, indica solo quale programma eseguire. Tipi: selettore (un dispositivo alla volta) e multiplexer (più dispositivi insieme).', 'l:«Canali I/O»'],
      ['mm-pro', 'io', 'Vantaggi e svantaggi dell\'I/O memory-mapped.', 'Vantaggi: nessuna istruzione speciale, software di controllo scrivibile in linguaggi ad alto livello, protezione più agevole. Svantaggi: non si presta alla cache (va disabilitata selettivamente) e non è compatibile con architetture a bus multipli (gli indirizzi vanno filtrati e instradati).', 'l:«Confronto fra I/O memory mapped e separato»'],
    ],
    mcq: [
      ['Con bus singolo e controllore DMA isolato, quante volte un trasferimento usa il bus?', ['Mai', 'Una', 'Due', 'Tre', 'Dipende dal blocco'], 2, 'Da I/O a DMA e poi da DMA a memoria.', 'l:«Configurazioni DMA»'],
      ['Un canale di I/O di tipo selettore…', ['opera su un solo dispositivo alla volta', 'opera su più dispositivi insieme', 'non usa la memoria', 'è un tipo di interrupt', 'richiede l\'I/O da programma'], 0, 'Il multiplexer gestisce più dispositivi per volta.', 'l:«Canali I/O»'],
    ],
    open: [['canali', 'Descrivere l\'evoluzione delle funzioni di I/O fino ai canali di I/O.', ['Controllo diretto della periferica da parte della CPU', 'Modulo di I/O con I/O da programma', 'Introduzione delle interruzioni', 'DMA: accesso diretto alla memoria', 'Modulo di I/O come processore con istruzioni proprie', 'Modulo con memoria locale: canale di I/O', 'Canali selettore e multiplexer'], 'l:«Evoluzione delle funzioni di I/O», «Canali I/O»']],
  });

  // ================= SECONDA PARTE =================
  course.extend('virgola-mobile', {
    src: { e: 'Slide «Esercizi sulla rappresentazione in virgola mobile», ' },
    sections: [{ title: 'Formati ridotti: come li usa il docente negli esercizi', src: 'e:esercizi 1-3', html:
      '<p>Negli esercizi si usa spesso un formato piccolo: 1 bit di segno, <strong>k bit di esponente</strong>, m bit di mantissa. La polarizzazione è sempre <span class="mono">2^(k−1) − 1</span>: con 3 bit vale 3, con 7 bit vale 63. In questi esercizi tutte le configurazioni si leggono come numeri normalizzati (niente zero o infinito speciali).</p>' +
      '<p>Esempio con 3 bit di esponente e 4 di mantissa: <span class="mono">0 101 1011</span> = +1,1011 · 2^(5−3) = 110,11 = 6,75. Al contrario: 6,5 = 110,1 = 1,101 · 2² → <span class="mono">0 101 1010</span>.</p>' +
      '<p>Se il numero non è rappresentabile esattamente si tronca la mantissa: −7,3 = −111,01001… → <span class="mono">1 101 1101</span> (approssimato).</p>' +
      '<p>Estremi con questo formato: esponente da −3 a +4, mantissa da 1,0000 a 1,1111 (1,9375). Massimo positivo 1,9375 · 2⁴ = 31; minimo positivo 1 · 2⁻³ = 0,125.</p>' }],
    cards: [
      ['bias-k', 'formato', 'Quanto vale la polarizzazione con k bit di esponente? E con 3 bit?', '2^(k−1) − 1. Con 3 bit vale 3; con 8 bit 127; con 7 bit 63.', 'e:esercizi 1 e 3'],
      ['mini-dec', 'conversione', 'Con 3 bit di esponente e 4 di mantissa, quanto vale 0 101 1011?', '+1,1011 · 2^(5−3) = 110,11 in binario = 6 + 0,5 + 0,25 = 6,75.', 'e:esercizio 1'],
      ['mini-estremi', 'formato', 'Con 3 bit di esponente e 4 di mantissa (senza valori speciali), qual è il più grande e il più piccolo numero positivo?', 'Esponente da −3 a +4; mantissa da 1,0000 a 1,1111 = 1,9375. Massimo 1,9375 · 2⁴ = 31; minimo 1 · 2⁻³ = 0,125.', 'e:esercizio 3', 'E i due estremi negativi?'],
    ],
    mcq: [['Con 3 bit per l\'esponente, quanto vale la polarizzazione?', ['1', '3', '4', '7', '127'], 1, '2^(3−1) − 1 = 3.', 'e:esercizio 1']],
    generators: [{ id: 'gen:fpmini', sub: 'fpmini', title: 'Virgola mobile in formato ridotto', desc: '3 bit di esponente e 4 di mantissa, come negli esercizi del docente.' }],
  });

  course.extend('pipeline', {
    src: { l: 'Slide Lez. 11 «Pipeline», ', e: 'Slide «Esercizi sulla pipeline RISC-V», ', r: 'Slide Lez. 13 «RISC-V», ' },
    sections: [
      { title: 'Prestazioni: tempo di ciclo e speedup', src: 'l:«Pipeline performance»; e:pag. 4-5', html:
        '<p class="formula">τ = max τᵢ + d &nbsp;&nbsp;&nbsp; Tₖ = (k + n − 1) · τ &nbsp;&nbsp;&nbsp; Sₖ = n·k / (k + n − 1)</p>' +
        '<p>τ è il <strong>tempo di ciclo</strong>: lo stadio più lento più il ritardo d dei registri tra gli stadi. Con k stadi e n istruzioni (senza salti) servono k cicli per la prima e uno per ciascuna delle altre. Lo <strong>speedup</strong> rispetto all\'esecuzione senza pipeline tende a k quando n cresce. La pipeline non accorcia la singola istruzione: aumenta il throughput. Più stadi danno più throughput ma più overhead e più problemi con i salti.</p>' },
      { title: 'Tipi di dipendenza dai dati e sbilanciamento', src: 'l:«Data hazards», «Sbilanciamento delle fasi», «Problemi strutturali»', html:
        '<ul><li><strong>RAW</strong> (read after write): l\'istruzione i+1 legge prima che i abbia scritto. È il caso normale.</li><li><strong>WAW</strong> (write after write): i+1 scrive prima che i abbia scritto.</li><li><strong>WAR</strong> (write after read): i+1 scrive prima che i abbia letto; raro in pipeline.</li></ul>' +
        '<p>Le dipendenze sono proprietà del programma, non della pipeline; se creano stalli dipende dall\'architettura.</p>' +
        '<p><strong>Sbilanciamento</strong>: la suddivisione in fasi si fa sull\'istruzione più onerosa; rimedi: dividere le fasi lunghe in sottofasi, o duplicare gli esecutori (per esempio ALU intera e ALU in virgola mobile). <strong>Problemi strutturali</strong>: rimedi sono le fasi non operative o memorie separate, una cache per le istruzioni e una per i dati.</p>' },
      { title: 'Riordino delle istruzioni', src: 'l:«Riordino delle istruzioni»; e:esercizio 3', html:
        '<p>Il compilatore può spostare un\'istruzione indipendente tra una LW e l\'istruzione che ne usa il risultato, così lo stallo sparisce senza cambiare il significato del programma. Si può spostare solo ciò che non legge né scrive registri coinvolti nelle istruzioni scavalcate.</p>' },
    ],
    cards: [
      ['tau', 'prestazioni', 'Come si calcola il tempo di ciclo di una pipeline?', 'τ = max τᵢ + d: il tempo dello stadio più oneroso più il ritardo di commutazione dei registri tra gli stadi.', 'l:«Pipeline performance»'],
      ['tk', 'prestazioni', 'Quanto tempo serve a una pipeline di k stadi per eseguire n istruzioni senza salti?', 'Tₖ = (k + n − 1) · τ: k cicli per completare la prima istruzione, poi un ciclo per ciascuna delle altre n − 1.', 'l:«Pipeline performance ideali»'],
      ['speedup', 'prestazioni', 'Formula dello speedup ideale e suo limite.', 'Sₖ = n·k / (k + n − 1). Al crescere del numero di istruzioni tende a k, il numero di stadi.', 'l:«Pipeline performance ideali - Speedup»', 'Perché allora non si fanno pipeline da 100 stadi?'],
      ['raw-waw', 'hazard', 'Definisci le dipendenze RAW, WAW e WAR.', 'RAW: l\'istruzione successiva legge un dato prima che la precedente lo abbia scritto. WAW: la successiva scrive prima che la precedente abbia scritto. WAR: la successiva scrive prima che la precedente abbia letto (raro in pipeline).', 'l:«Data hazards»'],
      ['sbilanciamento', 'hazard', 'Come si rimedia allo sbilanciamento delle fasi e ai problemi strutturali?', 'Sbilanciamento: decomporre le fasi onerose in sottofasi o duplicare gli esecutori (ALU intera e ALU in virgola mobile). Strutturali: fasi non operative, oppure memorie separate (cache istruzioni e cache dati).', 'l:«Sbilanciamento delle fasi», «Problemi strutturali»'],
      ['riordino', 'esercizio', 'Quando si può riordinare un\'istruzione per togliere uno stallo?', 'Quando l\'istruzione spostata non legge né scrive registri usati dalle istruzioni che scavalca, così il programma non cambia significato. Tipicamente si mette un\'istruzione indipendente tra una LW e chi ne usa il risultato.', 'e:esercizio 3'],
      ['lw-sw', 'esercizio', 'lw x6, 16(x3) seguita da sw x6, 416(x3): servono stalli con il forwarding?', 'Sì, uno: il valore di x6 è disponibile solo dopo la fase MEM della lw, e la sw lo richiede al più tardi in EX. Dopo lo stallo si usa il forwarding da MEM/WB (MEM/WB.RegisterRd = ID/EX.RegisterRs2). Senza forwarding servirebbero 2 stalli.', 'r:«hardware propagazione store»'],
      ['regwrite', 'esercizio', 'Perché nelle condizioni di forwarding compare RegWrite?', 'Invece di controllare il codice operativo si controlla il segnale RegWrite dell\'istruzione più avanti nella pipeline: vale 1 per le istruzioni che scrivono un registro (formato R e load), le uniche che possono generare una dipendenza RAW.', 'r:«Condizioni per riconoscere dipendenza»'],
      ['penalita', 'salti', 'Cos\'è la penalità di salto (branch penalty)?', 'I cicli persi quando un salto viene preso: le istruzioni prelevate dopo il salto vanno scartate e la pipeline si svuota in parte, perché solo alla fine dell\'esecuzione del salto si conosce la prossima istruzione.', 'l:«Salto condizionato»'],
    ],
    mcq: [
      ['Una pipeline ha stadi da 30, 50, 40 ns e registri con ritardo 5 ns. Quanto vale il tempo di ciclo?', ['40 ns', '50 ns', '55 ns', '120 ns', '125 ns'], 2, 'Stadio più lento più ritardo: 50 + 5.', 'l:«Pipeline performance»'],
      ['Quanti cicli servono a una pipeline di 5 stadi per eseguire 10 istruzioni senza stalli?', ['10', '14', '15', '50', '5'], 1, 'k + n − 1 = 5 + 10 − 1.', 'l:«Pipeline performance ideali»'],
      ['"L\'istruzione successiva legge un registro prima che la precedente lo abbia scritto" è una dipendenza…', ['WAW', 'WAR', 'RAW', 'strutturale', 'dal controllo'], 2, 'Read After Write.', 'l:«Data hazards»'],
    ],
    generators: [{ id: 'gen:prestazioni', sub: 'prestazioni', title: 'Tempo di ciclo e speedup', desc: 'τ, tempo totale e speedup ideale.' }],
  });

  course.extend('risc-cisc', {
    src: { l: 'Slide Lez. 12 «Filosofia RISC», ' },
    cards: [
      ['taglia', 'cisc', 'I programmi CISC sono davvero più corti di quelli RISC?', 'Hanno meno istruzioni, ma non meno bit: molte istruzioni richiedono codici operativi più lunghi, e i riferimenti a registri occupano meno bit di quelli alla memoria. La taglia dei programmi compilati risulta simile.', 'l:«CISC o RISC?»'],
      ['file-cache', 'risc', 'Banco di registri a finestre e cache: che differenze ci sono?', 'Registri: tutti gli scalari locali, variabili individuali, salvataggio in base alla profondità di annidamento, indirizzamento a registro. Cache: solo gli scalari usati di recente, blocchi di memoria, sostituzione decisa dall\'algoritmo della cache, indirizzamento a memoria.', 'l:«Register File contro Cache»'],
      ['ibridi', 'cisc', 'Fai due esempi di CPU commerciali che mescolano le due filosofie.', 'PowerPC: architettura RISC con elementi CISC. Pentium II: architettura CISC con elementi RISC.', 'l:«CISC o RISC?»'],
    ],
  });

  course.define('riscv', {
    src: { r: 'Slide Lez. 13 «RISC-V», ' },
    intro: 'È l\'architettura su cui sono scritti gli esercizi di pipeline: conviene saperne leggere le istruzioni senza esitare.',
    sections: [
      { title: 'Caratteristiche', src: 'r:«RISC-V (a 32 bit)»', html:
        '<p>Tutte le istruzioni sono di <strong>32 bit</strong>. Le operazioni sui dati sono solo <strong>da registro a registro</strong>; alla memoria accedono solo <strong>load e store</strong>; nessuna operazione memoria-memoria. Ci sono <strong>32 registri da 32 bit</strong>, x0…x31, e <strong>x0 vale sempre 0</strong>.</p>' },
      { title: 'Formati delle istruzioni', src: 'r:«RISC-V: Formati principali» – «Formato U»', html:
        '<p>Sei formati, di cui quattro principali. Codice operativo e campi dei registri hanno dimensione e posizione fisse: questo semplifica la decodifica e la lettura degli operandi, che possono avvenire insieme.</p>' +
        '<div class="scroll"><table><thead><tr><th>Formato</th><th>Usato per</th><th>Campi</th><th>Esempio</th></tr></thead><tbody>' +
        '<tr><td>R</td><td>aritmetiche e logiche tra registri</td><td>funct7, rs2, rs1, funct3, rd, opcode (7+5+5+3+5+7 bit)</td><td class="mono">add x1, x2, x3</td></tr>' +
        '<tr><td>I</td><td>load, operazioni con costante, jalr</td><td>immediato 12 bit, rs1, funct3, rd, opcode</td><td class="mono">lw x1, 1000(x2)<br>addi x1, x8, 4</td></tr>' +
        '<tr><td>S</td><td>store</td><td>immediato diviso in due parti (7 + 5 bit), rs2, rs1, funct3, opcode</td><td class="mono">sw x1, 1000(x2)</td></tr>' +
        '<tr><td>B (sottoformato di S)</td><td>salti condizionati</td><td>come S; l\'immediato è un offset con segno sommato al PC</td><td class="mono">beq x1, x2, 16</td></tr>' +
        '<tr><td>U</td><td>caricamento di costanti grandi</td><td>immediato 20 bit, rd, opcode</td><td></td></tr>' +
        '<tr><td>J (sottoformato di U)</td><td>salto incondizionato</td><td>offset con segno, rd riceve PC+4</td><td class="mono">jal x5, …</td></tr></tbody></table></div>' +
        '<p>Salti condizionati: <span class="mono">beq</span>/<span class="mono">bne</span> (uguali/diversi), <span class="mono">blt</span>/<span class="mono">bge</span> (minore/maggiore o uguale), con le varianti senza segno.</p>' },
      { title: 'Cosa fa ogni stadio', src: 'r:«Ciclo esecutivo di un\'istruzione RISC-V»', html:
        '<ol><li><strong>IF</strong>: IR ← Mem[PC]; NPC ← PC + 4.</li><li><strong>ID</strong>: decodifica; A ← Regs[rs1], B ← Regs[rs2]; Imm ← campo immediato esteso.</li>' +
        '<li><strong>EX</strong>: la ALU calcola A op B, oppure A + Imm (indirizzo per load/store), oppure la condizione di salto (A − B = 0) e l\'indirizzo di destinazione.</li>' +
        '<li><strong>MEM</strong>: load: LMD ← Mem[ALUOutput]; store: Mem[ALUOutput] ← B; salti: aggiornamento del PC.</li><li><strong>WB</strong>: Regs[rd] ← ALUOutput oppure LMD.</li></ol>' +
        '<p>Tra gli stadi stanno i registri IF/ID, ID/EX, EX/MEM, MEM/WB. Le memorie di istruzioni e dati sono separate (due cache), così IF e MEM non si ostacolano. I registri si scrivono nella prima metà del ciclo e si leggono nella seconda.</p>' },
    ],
    cards: [
      ['caratteristiche', 'riscv', 'Quali sono le caratteristiche di base di RISC-V a 32 bit?', 'Istruzioni tutte di 32 bit; operazioni sui dati solo tra registri; solo load e store accedono alla memoria; 32 registri da 32 bit (x0…x31), con x0 sempre uguale a 0.', 'r:«RISC-V (a 32 bit)»'],
      ['formato-r', 'formati', 'Quali campi ha un\'istruzione in formato R e per cosa si usa?', 'funct7, rs2, rs1, funct3, rd, opcode (7, 5, 5, 3, 5, 7 bit). Per le istruzioni aritmetiche e logiche tra registri, come add x1, x2, x3.', 'r:«Istruzioni – Formato R»'],
      ['formato-i', 'formati', 'Per quali istruzioni si usa il formato I e cosa contiene?', 'Load, operazioni aritmetiche con costante, jalr. Contiene un immediato di 12 bit (spiazzamento o costante), rs1, funct3, rd, opcode.', 'r:«Istruzioni – Formato I»'],
      ['formato-s', 'formati', 'Perché le store hanno un formato diverso dalle load?', 'Una store non scrive registri: ha due registri sorgente (rs1 per l\'indirizzo, rs2 per il dato) e nessun rd. Per lasciare rs1 e rs2 nella stessa posizione degli altri formati, l\'immediato è diviso in due parti (7 e 5 bit).', 'r:«Istruzioni – Formato S»', 'Che vantaggio dà avere i campi dei registri sempre nella stessa posizione?'],
      ['salti', 'formati', 'Come sono codificati i salti condizionati in RISC-V e come si calcola la destinazione?', 'Formato B, sottoformato di S: confrontano due registri (beq, bne, blt, bge…). L\'immediato è un offset con segno che viene sommato al PC.', 'r:«Formato S – sottoformato B»'],
      ['x0', 'riscv', 'Cosa ha di speciale il registro x0, e perché conta nelle condizioni di forwarding?', 'Contiene sempre 0 e scriverci non ha effetto. Per questo le condizioni di forwarding e di stallo richiedono RegisterRd ≠ 0: una "scrittura" su x0 non crea dipendenze.', 'r:«RISC-V (a 32 bit)»'],
      ['stadi-dett', 'stadi', 'Cosa calcola la ALU nello stadio EX per: una add, una lw, una beq?', 'add: A op B. lw (e sw): A + Imm, cioè l\'indirizzo di memoria. beq: la condizione (A − B = 0) e, con un sommatore, l\'indirizzo di destinazione del salto.', 'r:«Ciclo esecutivo di un\'istruzione RISC-V»'],
      ['meta-ciclo', 'stadi', 'Perché un\'istruzione in ID può leggere un registro scritto nello stesso ciclo da un\'istruzione in WB?', 'Perché il banco dei registri viene scritto nella prima metà del ciclo e letto nella seconda: "prima scrive poi legge".', 'r:«prima scrive poi legge»'],
    ],
    mcq: [
      ['Quanti registri ha RISC-V a 32 bit e quanto vale x0?', ['16 registri, x0 qualsiasi', '32 registri, x0 sempre 0', '32 registri, x0 è il PC', '64 registri, x0 sempre 0', '8 registri, x0 è l\'accumulatore'], 1, '32 registri da 32 bit; x0 è cablato a 0.', 'r:«RISC-V (a 32 bit)»'],
      ['Quale formato usa l\'istruzione sw x1, 1000(x2)?', ['R', 'I', 'S', 'U', 'J'], 2, 'Le store usano il formato S.', 'r:«Istruzioni – Formato S»'],
      ['In quale stadio una lw legge il dato dalla memoria?', ['IF', 'ID', 'EX', 'MEM', 'WB'], 3, 'LMD ← Mem[ALUOutput] in MEM.', 'r:«Ciclo esecutivo di un\'istruzione RISC-V»'],
      ['Quale formato usa add x1, x2, x3?', ['R', 'I', 'S', 'B', 'U'], 0, 'Aritmetica tra registri.', 'r:«Istruzioni – Formato R»'],
    ],
    open: [['riscv', 'Descrivere i formati delle istruzioni RISC-V e i vantaggi di avere campi di dimensione e posizione fissa.', ['Tutte le istruzioni sono di 32 bit', 'Formato R: aritmetiche e logiche tra registri', 'Formato I: load e operazioni con immediato', 'Formato S: store, con immediato diviso; sottoformato B per i salti condizionati', 'Formato U e sottoformato J', 'Campi fissi: decodifica e lettura dei registri in parallelo', 'Più formati rispetto a MIPS per tenere i campi sempre nella stessa posizione'], 'r:«RISC-V: Formati principali»']],
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
