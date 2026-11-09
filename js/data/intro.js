// Argomenti: concetti base, evoluzione dei calcolatori, componenti e interruzioni, bus.
(function (root) {
  const course = root.ADE.course;

  course.define('intro', {
    src: { cb: 'Slide «Introduzione (cap. 1)», pag. ', ev1: 'Slide «L\'evoluzione dei calcolatori» parte 1, pag. ', ev2: 'Slide «L\'evoluzione dei calcolatori» parte 2, pag. ' },
    intro: 'Poche pagine, ma alimentano le domande aperte di apertura (CPU, von Neumann, architettura e organizzazione).',
    sections: [
      { title: 'Architettura e organizzazione', src: 'cb:1-2', html:
        '<p><strong>Architettura</strong>: ciò che il programmatore vede. Istruzioni, numero di bit per rappresentare i dati, tecniche di indirizzamento della memoria.</p>' +
        '<p><strong>Organizzazione</strong>: le unità operative e come sono connesse. Interfacce con le periferiche, tecnologia delle memorie.</p>' +
        '<p>Esempio: decidere <em>se</em> esiste un\'istruzione di moltiplicazione è architettura; decidere <em>come</em> realizzarla (circuito dedicato o somme ripetute) è organizzazione. Modelli diversi della stessa famiglia (IBM 370) hanno stessa architettura e organizzazioni diverse.</p>' },
      { title: 'Funzioni e struttura di un calcolatore', src: 'cb:3-5', html:
        '<p>Quattro <strong>funzioni</strong>: elaborazione dati, memorizzazione dati, trasmissione dati (I/O o verso dispositivi remoti), controllo delle altre tre.</p>' +
        '<p>Quattro <strong>componenti</strong>: CPU, memoria centrale, I/O, interconnessioni.</p>' +
        '<p>La <strong>CPU</strong> a sua volta contiene: unità di controllo (decide la sequenza delle operazioni), ALU (elabora i dati), registri (memoria interna), interconnessioni interne (bus interno).</p>' },
      { title: 'Macchina di von Neumann e IAS', src: 'ev1:5-9', html:
        '<p>Idea del <strong>programma memorizzato</strong>: le istruzioni stanno in memoria come i dati. Struttura: memoria (dati e istruzioni), unità aritmetico-logica, unità di controllo, organi di ingresso e uscita.</p>' +
        '<p>Lo <strong>IAS</strong> (1952): 1000 parole da 40 bit; un numero = bit di segno + 39 bit; ogni parola contiene due istruzioni da 20 bit (8 di codice operativo + 12 di indirizzo). Registri: MBR (parola da leggere o scrivere), MAR (indirizzo), IR (codice operativo corrente), IBR (istruzione destra in attesa), PC (prossima coppia di istruzioni), AC e MQ (operandi e risultati).</p>' },
      { title: 'Generazioni e legge di Moore', src: 'ev2:1-9', html:
        '<p>Tubi a vuoto (1946-57) → transistor (1958-64) → circuiti integrati a scala sempre maggiore (dal 1965) → microprocessore (Intel 4004, 1971).</p>' +
        '<p><strong>Legge di Moore</strong> (1965): il numero di transistor in un chip raddoppia ogni anno; dal 1970 ogni 18 mesi. Conseguenze: costo del chip invariato quindi costo totale minore, circuiti più vicini quindi più velocità, calcolatori più piccoli, meno raffreddamento e alimentazione.</p>' },
    ],
    cards: [
      ['arch-org', 'concetti', 'Differenza tra architettura e organizzazione di un calcolatore, con un esempio.', 'Architettura: caratteristiche visibili al programmatore (istruzioni, bit per i dati, indirizzamento). Organizzazione: unità operative e loro connessioni (interfacce, tecnologia delle memorie). Esempio: avere la moltiplicazione è architettura; realizzarla con un circuito o con somme ripetute è organizzazione.', 'cb:1-2', 'Perché una stessa architettura può durare decenni mentre l\'organizzazione cambia?'],
      ['funzioni', 'concetti', 'Quali sono le quattro funzioni basilari di un calcolatore?', 'Elaborazione dati, memorizzazione dati, trasmissione dati, controllo.', 'cb:3'],
      ['componenti', 'concetti', 'Quali sono le quattro componenti principali di un calcolatore?', 'CPU, memoria centrale, I/O, interconnessioni tra loro.', 'cb:3'],
      ['cpu', 'concetti', 'Cos\'è la CPU e quali sono, ad alto livello, le sue componenti?', 'È l\'unità che esegue le funzioni di elaborazione dati. Componenti: unità di controllo (controlla la sequenza di operazioni), ALU (elaborazione dati), registri (memoria interna della CPU), interconnessioni tra questi (bus interno).', 'cb:4-5'],
      ['vn', 'storia', 'Qual è l\'idea chiave della macchina di von Neumann e quali sono le sue parti?', 'Programma memorizzato come i dati. Parti: memoria (dati e istruzioni), unità aritmetico-logica, unità di controllo, organi di ingresso e uscita.', 'ev1:5', 'Cosa bisognava fare per "riprogrammare" l\'ENIAC, che non aveva il programma in memoria?'],
      ['ias-mem', 'storia', 'IAS: quante parole di memoria, di quanti bit, e com\'è fatta un\'istruzione?', '1000 parole da 40 bit. Ogni parola contiene due istruzioni; ogni istruzione ha 8 bit di codice operativo e 12 bit di indirizzo.', 'ev1:6'],
      ['ias-reg', 'storia', 'A cosa servono MBR, MAR, IR, PC nello IAS?', 'MBR: parola da scrivere in memoria o appena letta. MAR: indirizzo della parola coinvolta. IR: codice operativo dell\'istruzione in corso. PC: indirizzo della prossima coppia di istruzioni.', 'ev1:7'],
      ['generazioni', 'storia', 'Quali tecnologie distinguono le prime tre generazioni di calcolatori?', 'Prima: tubi a vuoto. Seconda: transistor. Terza: circuiti integrati.', 'ev2:1-9'],
      ['moore', 'storia', 'Enuncia la legge di Moore e due sue conseguenze.', 'Il numero di transistor in un chip raddoppia ogni anno (dal 1970 ogni 18 mesi). Conseguenze: costo del chip invariato e quindi minor costo totale; circuiti più vicini e quindi più veloci; calcolatori più piccoli; meno raffreddamento e alimentazione.', 'ev2:8'],
    ],
    mcq: [
      ['Quale di questi aspetti appartiene all\'organizzazione e non all\'architettura?', ['Il repertorio delle istruzioni', 'Il numero di bit usati per i dati', 'La tecnologia usata per la memoria', 'Le tecniche di indirizzamento', 'Nessuno'], 2, 'La tecnologia delle memorie non è visibile al programmatore.', 'cb:1'],
      ['Quale di queste NON è una delle componenti interne della CPU?', ['Unità di controllo', 'ALU', 'Registri', 'Memoria centrale', 'Bus interno'], 3, 'La memoria centrale è una componente del calcolatore, esterna alla CPU.', 'cb:4'],
      ['Nello IAS, quante istruzioni contiene una parola di memoria?', ['Una', 'Due', 'Quattro', 'Dipende dall\'istruzione', 'Nessuna: le istruzioni non stanno in memoria'], 1, 'Due istruzioni da 20 bit in una parola da 40.', 'ev1:6'],
      ['Secondo la legge di Moore (versione dal 1970), ogni quanto raddoppia il numero di transistor in un chip?', ['6 mesi', '18 mesi', '5 anni', '10 anni', 'Non raddoppia'], 1, 'Ogni anno nella formulazione del 1965, ogni 18 mesi dal 1970.', 'ev2:8'],
      ['Quale registro dello IAS contiene l\'indirizzo della prossima coppia di istruzioni?', ['MAR', 'MBR', 'IR', 'PC', 'AC'], 3, 'Il program counter.', 'ev1:7'],
    ],
    open: [
      ['cpu', 'Cos\'è la CPU e quali sono, ad alto livello, le sue componenti principali?', ['È il componente che esegue l\'elaborazione dei dati e controlla il funzionamento del calcolatore', 'Unità di controllo: controlla la sequenza delle operazioni', 'ALU: esegue le operazioni aritmetiche e logiche', 'Registri: memoria interna alla CPU', 'Interconnessioni interne (bus interno) tra unità di controllo, ALU e registri', 'Collocazione: una delle quattro componenti del calcolatore, con memoria, I/O e interconnessioni'], 'cb:3-5'],
      ['funzioni', 'Quali sono, al massimo livello, le funzioni basilari di un calcolatore?', ['Elaborazione dati', 'Memorizzazione dati', 'Trasmissione dati (I/O e verso dispositivi remoti)', 'Controllo delle tre funzioni precedenti', 'Collegamento con le componenti: CPU, memoria, I/O, interconnessioni'], 'cb:3'],
      ['arch-org', 'Descrivere la differenza tra architettura e organizzazione di un calcolatore.', ['Architettura: attributi visibili al programmatore', 'Esempi di architettura: istruzioni, bit per i dati, indirizzamento', 'Organizzazione: unità operative e connessioni', 'Esempi di organizzazione: interfacce, tecnologia delle memorie', 'Esempio della moltiplicazione', 'Stessa architettura con organizzazioni diverse (famiglia IBM 370)'], 'cb:1-2'],
      ['vn', 'Descrivere in cosa consiste l\'architettura di von Neumann.', ['Programma memorizzato: dati e istruzioni nella stessa memoria', 'Memoria accessibile per indirizzo', 'Unità aritmetico-logica che opera su dati binari', 'Unità di controllo che interpreta ed esegue le istruzioni in sequenza', 'Dispositivi di ingresso e uscita', 'Confronto con il programma cablato'], 'ev1:5; cb:3'],
    ],
  });

  course.define('componenti', {
    src: { c1: 'Slide «Componenti e connessioni» parte 1, pag. ', c2: 'Slide «Componenti e connessioni» parte 2, pag. ' },
    intro: 'Le interruzioni sono una domanda aperta ricorrente (primo compitino 2025, domanda 5).',
    sections: [
      { title: 'Programma cablato e programma software', src: 'c1:2-5', html:
        '<p><strong>Cablato</strong>: i componenti logici sono costruiti per un solo compito; per cambiare programma va cambiato l\'hardware.</p>' +
        '<p><strong>Software</strong>: hardware generico più una parte che preleva il codice di un\'istruzione e genera i segnali di controllo corrispondenti. CPU = interprete delle istruzioni + modulo generico per operazioni aritmetico-logiche.</p>' },
      { title: 'Ciclo fetch-execute', src: 'c1:6-9', diagram: 'ciclo', html:
        '<p>Due passi ripetuti: <strong>fetch</strong> (prelievo) ed <strong>execute</strong> (esecuzione).</p><ol><li>Il PC contiene l\'indirizzo della prossima istruzione.</li><li>L\'istruzione viene letta dalla memoria e messa in IR; il PC viene incrementato.</li><li>L\'operazione viene eseguita.</li></ol>' +
        '<p>Quattro tipi di operazione: processore-memoria, processore-I/O, elaborazione dati, controllo (altera la sequenza: salti).</p>' },
      { title: 'Interruzioni', src: 'c2:1-4', html:
        '<p>Meccanismo con cui altri moduli (per esempio l\'I/O) interrompono la normale sequenza di esecuzione. Servono a non far attendere la CPU: i dispositivi esterni sono molto più lenti del processore.</p>' +
        '<p>Quattro classi: <strong>program</strong> (overflow, divisione per zero), <strong>timer</strong>, <strong>I/O</strong> (fine di un\'operazione), <strong>guasto hardware</strong> (mancanza di alimentazione).</p>' +
        '<p><strong>Ciclo di interruzione</strong>, aggiunto dopo l\'execute: la CPU controlla se ci sono interruzioni pendenti. Se sì: sospende il programma, salva il contesto (almeno l\'indirizzo della prossima istruzione), mette nel PC l\'indirizzo del programma di gestione, lo esegue, ripristina il contesto e riprende.</p>' },
      { title: 'Interruzioni multiple', src: 'c2:6-7', html:
        '<ul><li><strong>Disabilitare le interruzioni</strong> mentre se ne gestisce una: le altre restano pendenti e vengono servite dopo, in sequenza.</li><li><strong>Priorità</strong>: un\'interruzione può essere interrotta da una di priorità più alta (annidate); finita quella, si torna alla precedente.</li></ul>' },
      { title: 'Connessioni dei moduli', src: 'c2:8-10', html:
        '<p><strong>Memoria</strong>: riceve indirizzi, dati e segnali di lettura/scrittura; restituisce dati. <strong>Modulo di I/O</strong>: per la CPU è simile a una memoria; riceve indirizzi (numero di porta della periferica) e controlli, scambia dati, manda segnali di interruzione. <strong>CPU</strong>: legge istruzioni e dati, scrive dati, manda segnali di controllo, riceve interruzioni.</p>' },
    ],
    cards: [
      ['cablato', 'programma', 'Differenza tra programma cablato e programmazione software.', 'Cablato: hardware costruito per un compito, non modificabile. Software: hardware generico che riceve codici di istruzione, li interpreta e genera i segnali di controllo; per cambiare programma basta cambiare le istruzioni.', 'c1:2-5'],
      ['fetch', 'ciclo', 'Descrivi il ciclo fetch-execute nominando i registri coinvolti.', 'Fetch: l\'istruzione all\'indirizzo contenuto nel PC viene prelevata dalla memoria e messa in IR; il PC viene incrementato. Execute: l\'operazione indicata viene eseguita. Poi si ripete.', 'c1:6-7', 'In quale punto del ciclo un\'istruzione di salto cambia il flusso?'],
      ['tipi-op', 'ciclo', 'Quali sono i quattro tipi di operazione che un\'istruzione può richiedere?', 'Processore-memoria, processore-I/O, elaborazione dati, controllo (alterazione della sequenza).', 'c1:7'],
      ['int-cosa', 'interruzioni', 'Cos\'è un\'interruzione e perché esiste?', 'Un meccanismo con cui altri moduli interrompono la normale sequenza di esecuzione. Migliora l\'efficienza: la CPU non resta in attesa di dispositivi molto più lenti di lei.', 'c2:1'],
      ['int-classi', 'interruzioni', 'Quali sono le quattro classi di interruzione? Un esempio per ciascuna.', 'Program (overflow, divisione per zero); timer (generata da un timer interno); I/O (fine di un\'operazione di I/O); guasto hardware (mancanza di alimentazione).', 'c2:1'],
      ['int-ciclo', 'interruzioni', 'Cosa fa la CPU quando, nel ciclo di interruzione, trova un\'interruzione pendente?', 'Sospende il programma corrente; salva il contesto (es. indirizzo della prossima istruzione); imposta il PC all\'inizio del programma di gestione; lo esegue; ripristina il contesto e riprende il programma interrotto.', 'c2:3', 'Perché il controllo avviene dopo l\'execute e non a metà di un\'istruzione?'],
      ['int-multiple', 'interruzioni', 'Due modi di gestire interruzioni multiple.', 'Disabilitarle durante la gestione (restano pendenti, servite in sequenza); oppure definire priorità (una di priorità più alta interrompe quella in corso: gestione annidata).', 'c2:6'],
      ['conn-io', 'connessioni', 'Cosa riceve e cosa manda un modulo di I/O?', 'Riceve dalla CPU dati, segnali di controllo e indirizzi (numero di porta della periferica); riceve dati dalle periferiche. Manda dati alla CPU e alle periferiche, segnali di controllo alle periferiche e segnali di interruzione alla CPU.', 'c2:9-10'],
    ],
    mcq: [
      ['Dopo il prelievo di un\'istruzione, in quale registro si trova?', ['PC', 'IR', 'MAR', 'AC', 'Nella ALU'], 1, 'L\'instruction register contiene l\'istruzione in corso.', 'c1:7'],
      ['Una divisione per zero genera un\'interruzione di tipo…', ['timer', 'I/O', 'program', 'guasto hardware', 'nessuna interruzione'], 2, 'È una condizione nata dall\'esecuzione di un\'istruzione.', 'c2:1'],
      ['Quando la CPU controlla se ci sono interruzioni pendenti?', ['Prima del fetch di ogni programma', 'Al termine dell\'esecuzione di ogni istruzione', 'Solo quando il timer scade', 'In continuazione, anche a metà istruzione', 'Mai: è il modulo di I/O a fermarla'], 1, 'Il ciclo di interruzione è aggiunto dopo l\'execute.', 'c2:3'],
      ['Con interruzioni disabilitate durante la gestione, che fine fa una seconda interruzione?', ['Viene persa', 'Resta pendente e viene gestita dopo la prima', 'Interrompe subito la prima', 'Causa un guasto hardware', 'Viene gestita in parallelo'], 1, 'Gestione sequenziale: resta pendente.', 'c2:6'],
      ['Quale di queste NON fa parte del salvataggio e ripristino per un\'interruzione?', ['Salvare l\'indirizzo della prossima istruzione', 'Caricare nel PC l\'indirizzo del gestore', 'Riavviare il programma interrotto dall\'inizio', 'Ripristinare il contesto', 'Eseguire il programma di gestione'], 2, 'Il programma riprende da dove era stato interrotto.', 'c2:3'],
    ],
    open: [
      ['interrupt', 'Spiegare a cosa serve il meccanismo delle interruzioni e come funziona.', ['Altri moduli possono interrompere la normale sequenza di esecuzione', 'Scopo: efficienza, la CPU non attende dispositivi lenti', 'Classi: program, timer, I/O, guasto hardware', 'Ciclo di interruzione: controllo delle interruzioni pendenti dopo l\'execute', 'Salvataggio del contesto e salto al programma di gestione', 'Ripristino del contesto e ripresa del programma', 'Interruzioni multiple: disabilitazione o priorità'], 'c2:1-7'],
      ['ciclo', 'Descrivere il ciclo di esecuzione di un\'istruzione, anche in presenza di interruzioni.', ['Fetch: prelievo dell\'istruzione all\'indirizzo nel PC, caricamento in IR', 'Incremento del PC', 'Execute: esecuzione dell\'operazione', 'Tipi di operazione: processore-memoria, processore-I/O, elaborazione, controllo', 'Ciclo di interruzione dopo l\'execute', 'Cosa accade se c\'è un\'interruzione pendente'], 'c1:6-9; c2:3'],
    ],
  });

  course.define('bus', {
    src: { b: 'Slide «Bus», pag. ' },
    intro: 'Breve. Serve soprattutto come premessa al QPI.',
    sections: [
      { title: 'Cos\'è un bus', src: 'b:1', html:
        '<p>Un mezzo di trasmissione <strong>condiviso</strong> che collega due o più dispositivi. Un segnale trasmesso da un dispositivo è disponibile a tutti gli altri; può trasmettere <strong>un solo dispositivo alla volta</strong>, altrimenti i segnali si sovrappongono. È fatto di più linee, ognuna trasmette uno 0 o un 1: insieme trasmettono in parallelo.</p>' },
      { title: 'Bus di sistema: dati, indirizzi, controllo', src: 'b:1-3', diagram: 'bus', html:
        '<p>Collega CPU, memoria e I/O con da 50 a qualche centinaio di linee, in tre gruppi:</p><ul>' +
        '<li><strong>Dati</strong>: trasporta dati e istruzioni. L\'ampiezza conta per l\'efficienza: con poche linee servono più accessi per un dato.</li>' +
        '<li><strong>Indirizzi</strong>: indica sorgente o destinazione dei dati. L\'ampiezza determina la massima memoria indirizzabile.</li>' +
        '<li><strong>Controllo</strong>: regola accesso e uso delle altre linee. Esempi: memory write, memory read, richiesta bus, bus grant, interrupt request, clock.</li></ul>' },
      { title: 'Uso del bus, bus multipli, temporizzazione', src: 'b:4-6', html:
        '<p>Per <strong>inviare</strong> dati un modulo deve ottenere l\'uso del bus e poi trasferire i dati. Per <strong>ricevere</strong> deve mandare una richiesta sulle linee di controllo e attendere.</p>' +
        '<p>Con un solo bus e molti dispositivi nascono ritardi e congestione: per questo si usano <strong>più bus</strong> organizzati in gerarchia.</p>' +
        '<p><strong>Temporizzazione sincrona</strong>: gli eventi sono scanditi da una linea di clock (sequenza alternata di 0 e 1 di uguale durata; una sequenza 1-0 è un ciclo); tutti i dispositivi la leggono e ogni evento parte all\'inizio di un ciclo.</p>' },
    ],
    cards: [
      ['cosa', 'bus', 'Cos\'è un bus e qual è il suo vincolo principale?', 'Un mezzo di trasmissione condiviso che collega due o più dispositivi; un segnale trasmesso è disponibile a tutti. Vincolo: può trasmettere un solo dispositivo alla volta.', 'b:1'],
      ['gruppi', 'bus', 'Quali sono i tre gruppi di linee del bus di sistema?', 'Linee dati, linee indirizzi, linee di controllo.', 'b:1'],
      ['dati-amp', 'bus', 'Cosa determina l\'ampiezza del bus dati? E quella del bus indirizzi?', 'Bus dati: l\'efficienza (con poche linee servono più accessi per trasferire un dato). Bus indirizzi: la massima quantità di memoria indirizzabile.', 'b:2', 'Con 16 linee di indirizzo quante locazioni si possono indirizzare?'],
      ['controllo', 'bus', 'Cita almeno quattro segnali del bus di controllo.', 'Memory write, memory read, richiesta bus (bus request), bus grant, interrupt request, clock.', 'b:3'],
      ['uso', 'bus', 'Cosa deve fare un modulo per inviare dati? E per riceverli?', 'Inviare: ottenere l\'uso del bus, poi trasferire i dati. Ricevere: mandare una richiesta all\'altro modulo sulle linee di controllo e attendere l\'invio.', 'b:4'],
      ['multipli', 'bus', 'Perché si usano bus multipli?', 'Con un solo bus condiviso da molti dispositivi si hanno ritardi e congestione.', 'b:4'],
      ['sincrona', 'bus', 'Come funziona la temporizzazione sincrona di un bus?', 'Una linea di clock porta una sequenza alternata di 0 e 1 di uguale durata; una sequenza 1-0 è un ciclo di clock. Tutti i dispositivi leggono il clock e ogni evento parte all\'inizio di un ciclo.', 'b:6'],
    ],
    mcq: [
      ['Quanti dispositivi possono trasmettere contemporaneamente su un bus?', ['Uno', 'Due', 'Tutti quelli collegati', 'Dipende dall\'ampiezza del bus', 'Nessuno senza clock'], 0, 'Altrimenti i segnali si sovrappongono.', 'b:1'],
      ['L\'ampiezza del bus indirizzi determina…', ['la velocità del clock', 'la massima memoria indirizzabile', 'il numero di periferiche', 'la dimensione della cache', 'il numero di interruzioni'], 1, 'Con n linee si indirizzano 2^n locazioni.', 'b:2'],
      ['Quale di questi NON è un segnale di controllo del bus?', ['Bus grant', 'Interrupt request', 'Memory read', 'Tag', 'Clock'], 3, 'Il tag è un campo dell\'indirizzo di cache.', 'b:3'],
      ['Nella temporizzazione sincrona, quando partono gli eventi?', ['In qualunque momento', 'All\'inizio di un ciclo di clock', 'Quando il bus è libero', 'Alla fine di un\'interruzione', 'Dopo un bus grant'], 1, 'Tutti gli eventi partono dall\'inizio di un ciclo.', 'b:6'],
    ],
    open: [
      ['bus', 'Descrivere la struttura e il funzionamento del bus di sistema.', ['Mezzo di trasmissione condiviso; un solo dispositivo trasmette alla volta', 'Linee dati: trasportano dati e istruzioni; l\'ampiezza influisce sull\'efficienza', 'Linee indirizzi: sorgente/destinazione; l\'ampiezza fissa la memoria indirizzabile', 'Linee di controllo, con esempi di segnali', 'Come un modulo invia o riceve dati', 'Bus multipli contro ritardi e congestione', 'Temporizzazione sincrona con clock'], 'b:1-6'],
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
