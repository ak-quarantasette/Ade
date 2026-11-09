// Argomenti: notazione e Boole, memorie esterne (dischi, RAID, CD-ROM), SSD, gestione dell'I/O.
(function (root) {
  const course = root.ADE.course;
  const AP = 'Appunti «AdE semplice (per davvero)», pag. ';

  course.define('notazione', {
    src: { n: 'Slide «Notazione binaria, ottale, esadecimale. Algebra di Boole», pag. ' },
    intro: 'Non è una domanda a sé, ma serve in ogni esercizio: indirizzi di cache, Hamming, dimensioni.',
    sections: [
      { title: 'Valore di un numero binario', src: 'n:1-2', html:
        '<p>Ogni cifra pesa una potenza della base: <span class="mono">0101101₂ = 32 + 8 + 4 + 1 = 45</span>. Con n bit si rappresentano i valori da 0 a <span class="mono">2ⁿ − 1</span>.</p>' +
        '<p>Da decimale a binario: divisioni successive per 2, i resti letti dal basso verso l\'alto.</p>' },
      { title: 'Ottale ed esadecimale', src: 'n:3', html:
        '<p>Sono scritture compatte del binario: una cifra <strong>ottale</strong> ogni <strong>3 bit</strong>, una cifra <strong>esadecimale</strong> ogni <strong>4 bit</strong>, raggruppando da destra.</p>' +
        '<p class="formula">1011 0101 0011₂ = B53₁₆ &nbsp;&nbsp; 101 101 010 011₂ = 5523₈</p>' },
      { title: 'Kilo, Mega, Giga, Tera', src: 'n:2', html:
        '<p>1 byte = 8 bit. K = 2¹⁰ = 1024, M = 2²⁰, G = 2³⁰, T = 2⁴⁰, P = 2⁵⁰. Negli esercizi conviene scrivere tutto come potenze di 2 e sommare o sottrarre gli esponenti: <span class="mono">4KB / 64B = 2¹² / 2⁶ = 2⁶</span>.</p>' },
      { title: 'Algebra di Boole', src: 'n:4-6', html:
        '<p>Variabili che valgono 0 (falso) o 1 (vero) e tre operazioni di base: <strong>AND</strong> (1 solo se entrambi 1), <strong>OR</strong> (1 se almeno uno è 1), <strong>NOT</strong> (inverte). Derivate: <strong>NAND</strong>, <strong>NOR</strong>, <strong>XOR</strong> (1 se gli ingressi sono diversi: è l\'operazione usata nel codice di Hamming).</p>' },
    ],
    cards: [
      ['max', 'basi', 'Qual è il valore massimo rappresentabile con n bit (senza segno)?', '2ⁿ − 1 (n cifre tutte a 1). I valori possibili sono 2ⁿ, da 0 a 2ⁿ − 1.', 'n:2'],
      ['hex', 'basi', 'Come si passa da binario a esadecimale? Converti 101101010011.', 'Si raggruppano i bit a 4 a 4 da destra, una cifra per gruppo: 1011 0101 0011 = B53.', 'n:3'],
      ['ott', 'basi', 'Come si passa da binario a ottale? Converti 101101010011.', 'Gruppi di 3 bit da destra: 101 101 010 011 = 5523.', 'n:3'],
      ['prefissi', 'basi', 'A quali potenze di 2 corrispondono K, M, G, T?', 'K = 2¹⁰, M = 2²⁰, G = 2³⁰, T = 2⁴⁰.', 'n:2', 'Quanti bit di indirizzo servono per 256KB di memoria?'],
      ['xor', 'boole', 'Quando vale 1 lo XOR di due bit? E lo XOR di più bit?', 'Di due bit: quando sono diversi. Di più bit: quando il numero di 1 è dispari.', 'n:5'],
      ['nand', 'boole', 'Tabella di verità di NAND e NOR.', 'NAND: 0 solo se entrambi gli ingressi sono 1. NOR: 1 solo se entrambi gli ingressi sono 0.', 'n:5'],
    ],
    mcq: [
      ['Quanto vale 2F in esadecimale, in decimale?', ['29', '45', '47', '215', '32'], 2, '2·16 + 15 = 47.', 'n:3'],
      ['Quanti bit servono per indirizzare 1MB di memoria a byte?', ['10', '16', '20', '24', '30'], 2, '1MB = 2²⁰ byte.', 'n:2'],
      ['Qual è la scrittura ottale di 110101?', ['35', '53', '65', '56', '311'], 2, '110 101 = 6 5.', 'n:3'],
      ['1 XOR 1 XOR 1 vale…', ['0', '1', '3', 'indefinito', '11'], 1, 'Numero dispari di 1 → 1.', 'n:5'],
    ],
    open: [],
    generators: [{ id: 'gen:basi', sub: 'basi', title: 'Conversioni di base', desc: 'Binario, ottale, esadecimale, decimale.' }],
  });

  course.define('mem-esterne', {
    src: { e: 'Slide «Memoria esterna», pag. ', ap: AP },
    intro: 'Al compitino: una domanda a scelta multipla di calcolo sul disco e spesso una di teoria (CD-ROM nel 2025).',
    sections: [
      { title: 'Com\'è fatto un disco magnetico', src: 'e:1-3', diagram: 'disco', html:
        '<p>Piatto (oggi di vetro) rivestito di materiale magnetico. La <strong>testina</strong> è una bobina: in scrittura la corrente crea un campo magnetico; in lettura oggi si usa un sensore magneto-resistivo separato. La testina sta ferma, il disco ruota.</p>' +
        '<p>I dati stanno in <strong>tracce</strong> concentriche divise in <strong>settori</strong> (blocco minimo = un settore), separate da spazi. Con più piatti, le tracce nella stessa posizione formano un <strong>cilindro</strong>: una testina per faccia, tutte allineate.</p>' },
      { title: 'Velocità angolare costante e zone', src: 'e:4-5', html:
        '<p>I bit vicini al centro passano sotto la testina più lentamente. Soluzione classica: stesso numero di bit per traccia, più distanziati all\'esterno, così il disco gira a <strong>velocità angolare costante</strong> e ogni settore è indirizzabile. Costo: spazio sprecato nelle tracce esterne. Rimedio: <strong>registrazione a più zone</strong>, ognuna con un numero fisso di bit per traccia.</p>' },
      { title: 'Tempi di accesso', src: 'e:9; ap:88-94', html:
        '<ul><li><strong>Tempo di posizionamento</strong> (seek) Ts: la testina raggiunge la traccia.</li><li><strong>Latenza rotazionale</strong> TL: attesa del settore; in media <strong>mezzo giro</strong>. A 3600 rpm un giro dura 16,7 ms, TL = 8,35 ms.</li><li><strong>Tempo di trasferimento</strong>: <span class="mono">Tt = b / (r · N)</span>, con b byte da trasferire, N byte per traccia, r giri al secondo.</li></ul>' +
        '<p class="formula">T = Ts + TL + Tt</p>' +
        '<p>N si ricava così: capacità / facce = byte per faccia; byte per faccia / tracce = N. Se i dati sono in <strong>settori contigui di un cilindro</strong>, le facce si leggono insieme e <strong>Tt si divide per il numero di facce</strong>.</p>' },
      { title: 'RAID', src: 'ap:57-63', html:
        '<p>Più dischi in parallelo per prestazioni e/o affidabilità.</p><div class="scroll"><table><thead><tr><th>Livello</th><th>Idea</th><th>Dischi persi tollerati</th></tr></thead><tbody>' +
        '<tr><td>0</td><td>striping, nessuna ridondanza</td><td>0</td></tr><tr><td>1</td><td>mirroring: copia identica</td><td>1</td></tr>' +
        '<tr><td>2</td><td>striping a bit + codice di Hamming su dischi dedicati</td><td>1</td></tr><tr><td>3</td><td>striping a byte + un disco di parità</td><td>1</td></tr>' +
        '<tr><td>4</td><td>striping a blocchi + un disco di parità (collo di bottiglia in scrittura)</td><td>1</td></tr>' +
        '<tr><td>5</td><td>striping a blocchi + parità distribuita su tutti i dischi (minimo 3)</td><td>1</td></tr>' +
        '<tr><td>6</td><td>come il 5 con doppia parità (minimo 4)</td><td>2</td></tr></tbody></table></div>' },
      { title: 'CD-ROM', src: 'ap:75-78', html:
        '<p>Disco di <strong>policarbonato</strong> rivestito di materiale riflettente. I dati sono <strong>pit</strong> (pozzetti) e <strong>land</strong> lungo un\'unica traccia a spirale, letti da un laser. <strong>Densità di memorizzazione costante</strong> e <strong>velocità lineare costante</strong>: il disco cambia velocità di rotazione secondo la posizione. Per questo l\'accesso casuale è difficile. Sola lettura; CD-R scrivibile una volta, CD-RW riscrivibile.</p>' },
    ],
    cards: [
      ['testina', 'disco', 'Come avvengono scrittura e lettura su un disco magnetico?', 'Scrittura: la corrente nella bobina della testina produce un campo magnetico che magnetizza la superficie (0 e 1 come campi di direzione opposta). Lettura moderna: testina separata con sensore magneto-resistivo, la cui resistenza dipende dalla direzione del campo.', 'e:2'],
      ['traccia', 'disco', 'Definisci traccia, settore e cilindro.', 'Traccia: anello concentrico sulla superficie. Settore: porzione di traccia, dimensione minima di blocco. Cilindro: insieme delle tracce nella stessa posizione su tutte le facce.', 'e:3'],
      ['cav', 'disco', 'Perché si usa la velocità angolare costante, e che svantaggio ha?', 'Così ogni settore passa sotto la testina nello stesso tempo e tracce e settori sono indirizzabili direttamente. Svantaggio: le tracce esterne hanno minore densità, quindi spazio sprecato. Rimedio: registrazione a più zone.', 'e:4'],
      ['tempi', 'disco', 'Quali sono i tre tempi che compongono l\'accesso a un disco?', 'Posizionamento (seek): la testina va sulla traccia. Latenza rotazionale: attesa del settore, in media mezzo giro. Trasferimento: Tt = b / (r·N).', 'e:9'],
      ['latenza', 'disco', 'Quanto vale la latenza media a 10000 rpm? Come si calcola?', 'Un giro dura 60000 / 10000 = 6 ms; la latenza media è mezzo giro: 3 ms.', 'e:9', 'Perché mezzo giro e non un giro intero?'],
      ['n', 'disco', 'Nella formula Tt = b / (r·N), come ricavi N dai dati del disco?', 'N = byte per traccia = capacità totale / numero di facce / tracce per faccia.', 'ap:89'],
      ['cilindro', 'disco', 'Cosa cambia nel calcolo se i dati sono in settori contigui su un cilindro?', 'I settori nella stessa posizione su facce diverse si leggono insieme: il tempo di trasferimento va diviso per il numero di facce.', 'ap:94', 'Perché posizionamento e latenza non si dividono?'],
      ['testine', 'disco', 'Differenza tra testina fissa e testina mobile.', 'Fissa: una testina per traccia, su braccio fisso (rara). Mobile: una testina per faccia, su braccio mobile.', 'e:7'],
      ['raid01', 'raid', 'RAID 0 e RAID 1: cosa fanno e cosa tollerano?', 'RAID 0: striping, dati distribuiti sui dischi; massime prestazioni, nessuna ridondanza: un guasto fa perdere tutto. RAID 1: mirroring, ogni disco ha una copia; tollera un guasto, ma la capacità utile è la metà.', 'ap:57-58'],
      ['raid345', 'raid', 'Differenza tra RAID 3, 4 e 5.', 'RAID 3: striping a byte con un disco di parità. RAID 4: striping a blocchi con un disco di parità dedicato (collo di bottiglia in scrittura). RAID 5: striping a blocchi con parità distribuita su tutti i dischi.', 'ap:60-62'],
      ['raid6', 'raid', 'Cosa aggiunge il RAID 6 al RAID 5?', 'Un secondo blocco di parità: tollera il guasto di due dischi insieme. Minimo 4 dischi; scritture più lente.', 'ap:62-63'],
      ['raid2', 'raid', 'Quale livello RAID usa il codice di Hamming?', 'RAID 2: striping a livello di bit con dischi di ridondanza per il codice di correzione. Costoso e in disuso.', 'ap:59'],
      ['cd', 'cd', 'Come sono memorizzati e letti i dati in un CD-ROM?', 'Come pit (pozzetti) e land lungo un\'unica traccia a spirale su un disco di policarbonato riflettente; un laser a bassa potenza li legge perché riflettono in modo diverso.', 'ap:76'],
      ['clv', 'cd', 'CD-ROM e disco magnetico: quale ha velocità lineare costante e quale angolare? Con quale conseguenza?', 'CD-ROM: velocità lineare costante e densità costante (la rotazione cambia con la posizione), quindi accesso casuale difficile. Disco magnetico: velocità angolare costante, densità variabile.', 'ap:76-77; e:4'],
    ],
    mcq: [
      ['Quale fra le seguenti caratteristiche NON appartiene ai CD-ROM?', ['Sono dischi di policarbonato', 'Hanno densità di memorizzazione variabile', 'Usano velocità lineare costante', 'I dati sono memorizzati tramite pit e land', 'Tutte le altre opzioni sono caratteristiche dei CD-ROM'], 1, 'La densità di memorizzazione dei CD-ROM è costante.', 'ap:76'],
      ['A 7500 rpm, quanto vale la latenza rotazionale media?', ['2 ms', '4 ms', '8 ms', '7,5 ms', '16 ms'], 1, 'Un giro = 60000/7500 = 8 ms; mezzo giro = 4 ms.', 'e:9'],
      ['Quale livello RAID non offre alcuna ridondanza?', ['RAID 0', 'RAID 1', 'RAID 3', 'RAID 5', 'RAID 6'], 0, 'Solo striping.', 'ap:57'],
      ['Un insieme di tracce nella stessa posizione su tutte le facce è…', ['un settore', 'un cilindro', 'una zona', 'un blocco', 'un piatto'], 1, 'Definizione di cilindro.', 'e:3'],
      ['Quale livello RAID distribuisce la parità su tutti i dischi?', ['RAID 1', 'RAID 3', 'RAID 4', 'RAID 5', 'RAID 0'], 3, 'RAID 5: striping a blocchi con parità distribuita.', 'ap:61'],
      ['Quanti dischi guasti contemporaneamente tollera un RAID 6?', ['0', '1', '2', '3', 'Tutti tranne uno'], 2, 'Doppia parità.', 'ap:62'],
    ],
    open: [
      ['disco', 'Descrivere l\'organizzazione dei dati su un disco magnetico e i parametri che ne determinano le prestazioni.', ['Tracce concentriche, settori, spazi tra tracce', 'Cilindro con piatti multipli; una testina per faccia', 'Velocità angolare costante, densità variabile; registrazione a zone', 'Tempo di posizionamento (seek)', 'Latenza rotazionale: mezzo giro in media', 'Tempo di trasferimento Tt = b/(rN)', 'Tempo totale = somma dei tre'], 'e:3-9'],
      ['raid', 'Descrivere i livelli RAID, indicando per ciascuno come ottiene prestazioni o affidabilità.', ['Scopo: più dischi in parallelo per prestazioni e/o affidabilità', 'RAID 0: striping senza ridondanza', 'RAID 1: mirroring', 'RAID 2: Hamming a livello di bit', 'RAID 3 e 4: disco di parità dedicato (byte / blocchi)', 'RAID 5: parità distribuita', 'RAID 6: doppia parità, tollera due guasti'], 'ap:57-63'],
      ['cd', 'Descrivere come sono memorizzati e letti i dati in un CD-ROM e confrontarlo con un disco magnetico.', ['Policarbonato con strato riflettente', 'Pit e land su una traccia a spirale', 'Lettura con laser', 'Densità costante e velocità lineare costante', 'Accesso casuale difficile', 'Disco magnetico: tracce concentriche e velocità angolare costante'], 'ap:75-78; e:4'],
    ],
    generators: [{ id: 'gen:disco', sub: 'disco', title: 'Tempi e capacità di un disco', desc: 'La domanda di calcolo a scelta multipla del compitino.' }],
  });

  course.define('ssd', {
    src: { s: 'Slide «Dischi SSD», pag. ' },
    intro: 'Domanda aperta uscita in entrambi i turni del 2025: struttura e funzionamento degli SSD.',
    sections: [
      { title: 'La cella flash', src: 's:1', html:
        '<p>Un SSD è memoria a semiconduttore <strong>non volatile</strong>, senza parti meccaniche. La cella è un transistor con un secondo gate isolato, il <strong>floating gate</strong>:</p><ul>' +
        '<li>non attivo, non interferisce con il control gate: la cella vale <strong>1</strong>;</li><li>applicando un voltaggio alto intrappola elettroni, che restano anche senza alimentazione: la cella vale <strong>0</strong>.</li></ul>' +
        '<p><strong>NAND</strong> flash: transistor in serie, in array da 16 o 32; la bit line va a 0 solo se tutti i transistor delle linee di parola sono attivi; letture e scritture riguardano l\'intera parola. È la tecnologia degli SSD. La <strong>NOR</strong> ha celle in parallelo, accessibili singolarmente.</p>' },
      { title: 'Vantaggi rispetto agli HDD', src: 's:1-2', html:
        '<ul><li>molte più operazioni di I/O al secondo (IOPS);</li><li>meno sensibili a urti e vibrazioni; nessuna usura meccanica;</li><li>consumo inferiore; più silenziosi e freddi;</li><li>tempi di accesso e latenza molto più bassi.</li></ul><p>Gli HDD restano in vantaggio per costo per bit e capacità, con differenze in riduzione.</p>' },
      { title: 'Organizzazione', src: 's:2', html:
        '<p>Il sistema operativo passa dal file system e dal software di I/O all\'interfaccia fisica. Dentro l\'SSD: <strong>controller</strong> (interfaccia ed esecuzione del firmware), <strong>indirizzamento</strong> (selezione dei componenti flash), <strong>buffer/cache dati</strong> (RAM veloce), <strong>correzione degli errori</strong>, <strong>componenti di memoria flash</strong> (chip NAND).</p>' },
      { title: 'I due problemi pratici', src: 's:3', html:
        '<p><strong>1. Le prestazioni calano con l\'uso.</strong> I file stanno in pagine da 4KB; il blocco flash è di 512KB (128 pagine). Per scrivere una pagina: (1) si legge l\'intero blocco in un buffer RAM e si aggiorna la pagina; (2) si <strong>cancella l\'intero blocco</strong> flash; (3) si riscrive il blocco. Con l\'uso i file si frammentano e le scritture rallentano. Rimedi: over-provisioning, cancellazione delle pagine inattive, comando TRIM.</p>' +
        '<p><strong>2. Numero limitato di scritture</strong>, circa 100.000 per cella. Rimedi: cache davanti alla flash per ritardare e raggruppare le scritture, distribuzione uniforme delle scritture (wear leveling), gestione dei blocchi esauriti, RAID, stima della vita residua.</p>' },
    ],
    cards: [
      ['cella', 'ssd', 'Come memorizza un bit una cella di memoria flash?', 'Con un transistor dotato di floating gate isolato. Senza elettroni intrappolati la cella vale 1; un voltaggio alto intrappola elettroni nel floating gate (che restano senza alimentazione) e la cella vale 0.', 's:1'],
      ['nand', 'ssd', 'Come è organizzata una flash NAND?', 'Transistor in serie, in array da 16 o 32. La bit line va a 0 solo se tutti i transistor delle linee di parola corrispondenti sono attivi. Letture e scritture coinvolgono l\'intera parola.', 's:1'],
      ['vantaggi', 'ssd', 'Vantaggi degli SSD rispetto agli HDD (almeno quattro).', 'Più IOPS; resistenza a urti e vibrazioni; nessuna usura meccanica; consumo inferiore; più silenziosi e freddi; tempi di accesso molto più bassi.', 's:1-2', 'In cosa restano in vantaggio gli HDD?'],
      ['organizzazione', 'ssd', 'Quali componenti contiene un SSD?', 'Controller, logica di indirizzamento, buffer/cache dati in RAM, logica di correzione degli errori, componenti di memoria flash NAND; più l\'interfaccia verso il sistema.', 's:2'],
      ['scrittura', 'ssd', 'Quali sono i tre passi per scrivere una pagina in un SSD?', '1) Leggere l\'intero blocco che contiene la pagina in un buffer RAM e aggiornare la pagina. 2) Cancellare l\'intero blocco in flash. 3) Riscrivere l\'intero blocco dal buffer.', 's:3', 'Perché questo fa calare le prestazioni man mano che il disco si riempie?'],
      ['numeri', 'ssd', 'Dimensione tipica di pagina e di blocco in un SSD?', 'Pagina 4KB; blocco 512KB, cioè 128 pagine.', 's:3'],
      ['degrado', 'ssd', 'Perché le prestazioni di un SSD decadono con l\'uso e come si rimedia?', 'I file si frammentano su blocchi diversi e ogni scrittura richiede leggere, cancellare e riscrivere blocchi interi. Rimedi: over-provisioning, cancellazione delle pagine inattive, comando TRIM.', 's:3'],
      ['usura', 'ssd', 'Qual è il limite di scritture di una cella flash e come si allunga la vita dell\'SSD?', 'Circa 100.000 scritture. Rimedi: cache front-end per ritardare e raggruppare le scritture, distribuzione uniforme delle scritture (wear leveling), gestione dei blocchi esauriti, RAID, stima della vita dei blocchi.', 's:3'],
    ],
    mcq: [
      ['In una cella flash, gli elettroni intrappolati nel floating gate rappresentano…', ['il bit 1', 'il bit 0', 'un errore', 'una cella cancellata', 'una linea sporca'], 1, 'Floating gate carico = 0; non attivo = 1.', 's:1'],
      ['Quale operazione è necessaria prima di riscrivere un blocco in memoria flash?', ['Deframmentarlo', 'Cancellare l\'intero blocco', 'Cancellare solo la pagina', 'Fare il refresh', 'Nessuna'], 1, 'La flash si cancella a blocchi interi.', 's:3'],
      ['Quante pagine da 4KB contiene un blocco flash da 512KB?', ['64', '128', '256', '512', '1024'], 1, '512 / 4 = 128.', 's:3'],
      ['Quale di questi NON è un vantaggio degli SSD rispetto agli HDD?', ['Più IOPS', 'Minor consumo', 'Minor costo per bit', 'Resistenza agli urti', 'Silenziosità'], 2, 'Il costo per bit è ancora a favore degli HDD.', 's:2'],
      ['Il comando TRIM serve a…', ['correggere errori', 'indicare all\'SSD le pagine non più in uso', 'aumentare il voltaggio', 'duplicare i dati', 'cifrare il disco'], 1, 'Permette di cancellare in anticipo le pagine inattive.', 's:3'],
    ],
    open: [
      ['ssd', 'Descrivere la struttura e il funzionamento dei dischi SSD.', ['Memoria a semiconduttore non volatile, senza parti meccaniche', 'Cella flash: transistor con floating gate; elettroni intrappolati = 0', 'Flash NAND: transistor in serie, accesso a parola/pagina', 'Organizzazione: controller, indirizzamento, buffer/cache, correzione errori, chip flash', 'Pagine da 4KB, blocchi da 512KB; la cancellazione è a blocchi', 'Scrittura: leggi blocco in RAM, cancella blocco, riscrivi', 'Problema 1: degrado con l\'uso; rimedi (over-provisioning, TRIM)', 'Problema 2: scritture limitate (circa 100.000); rimedi (wear leveling, cache, blocchi esauriti)'], 's:1-3'],
    ],
  });

  course.define('io', {
    src: { ap: AP, c2: 'Slide «Componenti e connessioni» parte 2, pag. ' },
    intro: 'Non c\'è una dispensa del docente: i contenuti vengono dagli appunti. Nel 2025 è uscita una domanda a scelta multipla sull\'I/O interrupt driven.',
    sections: [
      { title: 'Il modulo di I/O', src: 'ap:80-81', html:
        '<p>Le periferiche sono tante, diverse per formato e velocità, e più lente di CPU e RAM: tra loro e il bus sta un <strong>modulo di I/O</strong>. Funzioni: controllo e temporizzazione, comunicazione con il processore (decodifica comandi, stato, riconoscimento dell\'indirizzo), comunicazione con i dispositivi, <strong>buffering</strong> dei dati, rilevamento degli errori.</p>' },
      { title: 'I/O da programma', src: 'ap:81-83', html:
        '<p>La CPU controlla tutto: richiede l\'operazione, il modulo la esegue e imposta i <strong>bit di stato</strong>; la CPU li <strong>controlla periodicamente</strong> finché l\'operazione è finita. Il modulo non informa e non interrompe la CPU. Difetto: la CPU spreca tempo in attesa.</p>' +
        '<p>Indirizzamento dei dispositivi: <strong>memory-mapped</strong> (un solo spazio di indirizzi per memoria e I/O, stesse istruzioni; non si presta alla cache) oppure <strong>isolato</strong> (linee di comando separate, spazi di indirizzi distinti).</p>' },
      { title: 'I/O guidato da interrupt', src: 'ap:83-84', diagram: 'io', html:
        '<ol><li>La CPU rilascia il comando di lettura e passa ad altro lavoro.</li><li>Il modulo ottiene i dati dalla periferica.</li><li>Il modulo <strong>interrompe</strong> la CPU quando è pronto.</li><li>La CPU, a fine istruzione, rileva l\'interruzione, salva il contesto e richiede i dati.</li><li>Il modulo trasferisce i dati; la CPU li scrive in memoria e riprende.</li></ol>' +
        '<p>Niente attesa e niente controllo ripetuto dello stato. Ma ogni operazione è avviata dalla CPU e <strong>il trasferimento dei dati passa comunque per la CPU</strong>.</p>' },
      { title: 'Accesso diretto alla memoria (DMA)', src: 'ap:85-86', html:
        '<p>Un controllore DMA trasferisce un blocco intero direttamente tra dispositivo e memoria. La CPU interviene solo <strong>all\'inizio</strong> (avvia il trasferimento) e <strong>alla fine</strong> (riceve un interrupt).</p>' +
        '<ul><li><strong>Cycle stealing</strong>: il DMA prende il bus per un ciclo e trasferisce una parola; la CPU resta sospesa appena prima di usare il bus. Non è un\'interruzione: nessun cambio di contesto.</li><li><strong>Burst</strong>: il DMA tiene il bus per tutto il blocco.</li><li><strong>Trasparente</strong>: usa il bus solo quando la CPU non ne ha bisogno.</li></ul>' },
    ],
    cards: [
      ['modulo', 'io', 'Perché serve un modulo di I/O e quali funzioni svolge?', 'Le periferiche sono molte, diverse per formato e velocità, più lente di CPU e RAM. Funzioni: controllo e temporizzazione, comunicazione con il processore, comunicazione con i dispositivi, buffering dei dati, rilevamento degli errori.', 'ap:80'],
      ['tecniche', 'io', 'Quali sono le tre tecniche di gestione dell\'I/O?', 'I/O da programma; I/O guidato da interrupt; accesso diretto alla memoria (DMA).', 'ap:81'],
      ['programma', 'io', 'Come funziona l\'I/O da programma e qual è il suo difetto?', 'La CPU richiede l\'operazione; il modulo la esegue e imposta i bit di stato; la CPU controlla periodicamente lo stato fino al completamento. Il modulo non interrompe la CPU. Difetto: tempo di CPU sprecato in attesa.', 'ap:82'],
      ['mapped', 'io', 'Differenza tra I/O memory-mapped e I/O isolato.', 'Memory-mapped: un unico spazio di indirizzi per memoria e dispositivi, stesse istruzioni. Isolato: linee di comando distinte dicono se l\'indirizzo è di memoria o di I/O; i due spazi di indirizzi sono separati.', 'ap:82-83'],
      ['interrupt', 'io', 'Elenca i passi dell\'I/O guidato da interrupt.', 'La CPU rilascia il comando di lettura e fa altro; il modulo ottiene i dati dalla periferica; il modulo interrompe la CPU; la CPU richiede i dati; il modulo li trasferisce alla CPU.', 'ap:84', 'Chi è responsabile del trasferimento dei dati: la CPU o il modulo?'],
      ['int-limiti', 'io', 'Cosa migliora l\'I/O interrupt driven rispetto a quello da programma, e cosa resta a carico della CPU?', 'Migliora: nessuna attesa e nessun controllo ripetuto dello stato. Resta: ogni operazione è iniziata dalla CPU e i dati transitano per la CPU, che li scrive in memoria.', 'ap:83-84'],
      ['dma', 'io', 'Cos\'è il DMA e quando interviene la CPU?', 'Un controllore trasferisce un blocco di dati direttamente tra dispositivo e memoria, senza passare per la CPU. La CPU interviene solo all\'inizio (avvio) e alla fine (interrupt di completamento).', 'ap:85-86'],
      ['cycle', 'io', 'Cos\'è il cycle stealing e perché non è un\'interruzione?', 'Il controllore DMA prende il bus per un ciclo e trasferisce una parola, sospendendo la CPU appena prima che acceda al bus. La CPU non cambia contesto: è solo rallentata.', 'ap:85'],
      ['burst', 'io', 'Differenza tra modalità burst, cycle stealing e trasparente del DMA.', 'Burst: il bus è rilasciato solo a fine trasferimento. Cycle stealing: una parola per volta, cedendo il bus tra una e l\'altra. Trasparente: il DMA usa il bus solo quando il processore non lo richiede.', 'ap:85'],
    ],
    mcq: [
      ['Quale fra le seguenti affermazioni è falsa nella gestione I/O interrupt driven?', ['Il trasferimento dei dati non è responsabilità della CPU', 'Ogni operazione di I/O è iniziata dalla CPU', 'Nessun controllo ripetuto dello stato del dispositivo da parte della CPU', 'Il modulo di I/O interrompe la CPU quando è pronto', 'Evita l\'attesa da parte della CPU'], 0, 'I dati passano comunque per la CPU, che li richiede al modulo e li scrive in memoria. È il DMA a toglierle questo compito.', 'ap:84'],
      ['Nell\'I/O da programma, come sa la CPU che l\'operazione è terminata?', ['Riceve un interrupt', 'Controlla periodicamente i bit di stato', 'Lo comunica il DMA', 'Scade un timer', 'Non lo sa'], 1, 'Il modulo imposta i bit di stato e non interrompe la CPU.', 'ap:82'],
      ['Con il DMA, quando viene coinvolta la CPU?', ['Per ogni parola trasferita', 'Solo all\'inizio e alla fine del trasferimento', 'Mai', 'Solo in caso di errore', 'A ogni ciclo di clock'], 1, 'Avvia il trasferimento e riceve l\'interrupt finale.', 'ap:86'],
      ['Nel cycle stealing la CPU…', ['salva il contesto ed esegue un gestore', 'resta sospesa per un ciclo senza cambiare contesto', 'viene spenta', 'continua a usare il bus', 'trasferisce lei la parola'], 1, 'Non è un\'interruzione.', 'ap:85'],
      ['Nell\'I/O memory-mapped…', ['servono istruzioni speciali di I/O', 'memoria e dispositivi condividono un unico spazio di indirizzi', 'i dispositivi non hanno indirizzo', 'la cache funziona senza accorgimenti', 'non si possono usare interruzioni'], 1, 'Stesse istruzioni per memoria e I/O.', 'ap:82'],
    ],
    open: [
      ['tecniche', 'Descrivere e confrontare le tre tecniche di gestione dell\'I/O.', ['Ruolo del modulo di I/O', 'I/O da programma: la CPU controlla periodicamente lo stato; attesa attiva', 'I/O interrupt driven: la CPU fa altro e viene interrotta quando il modulo è pronto', 'Interrupt driven: i dati passano ancora per la CPU', 'DMA: trasferimento diretto dispositivo-memoria; CPU solo all\'inizio e alla fine', 'Cycle stealing e burst', 'Confronto in termini di tempo di CPU impegnato'], 'ap:81-86'],
      ['dma', 'Spiegare cos\'è il DMA e come interagisce con la CPU.', ['Trasferisce blocchi direttamente tra dispositivo e memoria', 'La CPU avvia il trasferimento e poi fa altro', 'Interrupt alla fine del blocco', 'Cycle stealing: una parola per ciclo, CPU sospesa senza cambio di contesto', 'Modalità burst e trasparente', 'Vantaggio rispetto all\'I/O a interrupt per grandi quantità di dati'], 'ap:85-86'],
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
