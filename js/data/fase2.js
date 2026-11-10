// SECONDA PARTE (secondo compitino). Il docente non ha dispense per questi argomenti nella repo:
// i contenuti vengono dagli appunti «AdE semplice (per davvero)» e dall'esempio ufficiale di compitino.
(function (root) {
  const course = root.ADE.course;
  // Fonte principale: le lezioni del docente (indicate per titolo). I numeri di pagina rimandano agli
  // appunti «AdE semplice», che seguono le stesse slide e su cui le schede sono state scritte.
  const L = (lez) => ({ ap: 'Slide ' + lez + '; appunti «AdE semplice», pag. ', ec: 'Esempio di compitino seconda parte 2025/26, ' });

  course.define('aritmetica', {
    src: L('Lez. 8 «Aritmetica del calcolatore»'),
    intro: 'Base per la virgola mobile. Il complemento a 2 si sbaglia facilmente per distrazione: allenalo con il generatore.',
    sections: [
      { title: 'Modulo e segno', src: 'ap:96', html: '<p>Il bit più a sinistra è il segno (0 positivo, 1 negativo), gli altri il modulo: <span class="mono">+18 = 00010010</span>, <span class="mono">−18 = 10010010</span>. Due difetti: nelle operazioni vanno trattati a parte segni e moduli, e lo zero ha due rappresentazioni (+0 e −0).</p>' },
      { title: 'Complemento a 2', src: 'ap:97-99', html:
        '<p>Il bit più a sinistra pesa <strong>−2ⁿ⁻¹</strong>, gli altri sono positivi. Con n bit si va da <span class="mono">−2ⁿ⁻¹</span> a <span class="mono">+2ⁿ⁻¹ − 1</span>. I positivi si scrivono come in modulo e segno.</p>' +
        '<p><strong>Da k a −k</strong>: complemento bit a bit, poi somma 1. Esempio su 4 bit: 2 = 0010 → 1101 → 1110 = −2. Scorciatoia: da destra si copiano i bit fino al primo 1 compreso, poi si invertono gli altri.</p>' +
        '<p>Vantaggi: un solo zero, negazione facile, e la somma funziona senza guardare i segni.</p>' },
      { title: 'Estensione, somma, overflow', src: 'ap:100-102', html:
        '<p><strong>Estensione</strong> a più bit: si replica il bit più significativo. −18 su 8 bit è 11101110, su 16 bit è 11111111 11101110.</p>' +
        '<p><strong>Somma</strong>: somma binaria normale, il riporto finale si ignora. <strong>Sottrazione</strong>: A − B = A + (−B), quindi bastano i circuiti per somma e complemento (un sommatore con XOR sugli ingressi di B e riporto iniziale 1). Esempio su 4 bit: 7 − 5 = 0111 + 1011 = 0010.</p>' +
        '<p><strong>Overflow</strong>: solo sommando due numeri dello stesso segno; si riconosce perché il risultato ha segno opposto.</p>' },
      { title: 'Moltiplicazione e divisione', src: 'ap:102-106', html:
        '<p>Moltiplicazione senza segno: prodotti parziali (uno per ogni 1 del moltiplicatore, traslato) sommati; il prodotto di due numeri da n bit può richiedere 2n bit. Con numeri in complemento a 2 il metodo diretto non funziona se un fattore è negativo: si usa l\'<strong>algoritmo di Booth</strong>, che riduce somme e sottrazioni trattando le sequenze di 1.</p>' +
        '<p>Divisione: traslazioni, sottrazioni e ripristini ripetuti (divisione con ripristino), con quoziente in Q e resto in A.</p>' },
    ],
    cards: [
      ['ms', 'interi', 'Quali sono i due difetti della rappresentazione in modulo e segno?', 'Per le operazioni bisogna considerare separatamente moduli e segni; lo zero ha due rappresentazioni (+0 e −0).', 'ap:96'],
      ['intervallo', 'interi', 'Quale intervallo si rappresenta in complemento a 2 su n bit? E su 8 bit?', 'Da −2ⁿ⁻¹ a +2ⁿ⁻¹ − 1. Su 8 bit: da −128 a +127.', 'ap:97'],
      ['negare', 'interi', 'Come si ottiene −k dalla rappresentazione di k in complemento a 2?', 'Complemento bit a bit e somma di 1. Scorciatoia: da destra si copiano i bit fino al primo 1 incluso, poi si complementano i restanti.', 'ap:98-99', 'Perché applicando due volte la regola si torna al numero di partenza?'],
      ['peso', 'interi', 'Quanto pesa il bit più a sinistra in complemento a 2 su n bit?', '−2ⁿ⁻¹. Tutti gli altri bit hanno il loro peso positivo.', 'ap:97'],
      ['estensione', 'interi', 'Come si estende un numero in complemento a 2 da 8 a 16 bit?', 'Si replica il bit più significativo nelle nuove posizioni a sinistra (estensione del segno).', 'ap:100'],
      ['overflow', 'operazioni', 'Quando c\'è overflow in una somma in complemento a 2 e come si riconosce?', 'Solo se gli operandi hanno lo stesso segno e il risultato non è rappresentabile: lo si riconosce perché il risultato ha segno opposto a quello degli operandi.', 'ap:102'],
      ['sottrazione', 'operazioni', 'Come si esegue A − B in complemento a 2 con un solo circuito?', 'A + (−B): si complementa B (XOR con la linea di controllo) e si somma con riporto iniziale 1. Lo stesso sommatore fa somme e sottrazioni.', 'ap:100-101'],
      ['vantaggi', 'interi', 'Tre vantaggi del complemento a 2 rispetto a modulo e segno.', 'Una sola rappresentazione dello zero; operazioni aritmetiche semplici (la somma non guarda i segni); negazione facile.', 'ap:99'],
      ['booth', 'operazioni', 'Perché serve l\'algoritmo di Booth e su quale idea si basa?', 'La moltiplicazione a prodotti parziali non funziona direttamente con fattori negativi in complemento a 2. Booth tratta le sequenze di 1 del moltiplicatore: sottrae all\'inizio di una sequenza di 1, somma alla fine, e trasla soltanto quando il bit è uguale al precedente.', 'ap:104'],
    ],
    mcq: [
      ['Quale numero rappresenta 11100 in complemento a 2 su 5 bit?', ['28', '−4', '−12', '−3', '12'], 1, '−16 + 8 + 4 = −4.', 'ap:99'],
      ['Qual è il numero più piccolo rappresentabile in complemento a 2 su 8 bit?', ['−127', '−128', '−255', '−256', '0'], 1, '−2⁷ = −128.', 'ap:97'],
      ['In complemento a 2, sommando un positivo e un negativo…', ['c\'è sempre overflow', 'non può esserci overflow', 'c\'è overflow se c\'è riporto', 'dipende dal numero di bit', 'il risultato è sempre negativo'], 1, 'L\'overflow richiede operandi dello stesso segno.', 'ap:102'],
      ['Come si rappresenta −1 in complemento a 2 su 8 bit?', ['10000001', '11111110', '11111111', '10000000', '01111111'], 2, 'Tutti 1.', 'ap:99'],
      ['Quante rappresentazioni ha lo zero in modulo e segno?', ['Nessuna', 'Una', 'Due', 'Dipende dai bit', 'Infinite'], 2, '+0 e −0.', 'ap:96'],
    ],
    open: [
      ['c2', 'Descrivere la rappresentazione in complemento a 2 e i suoi vantaggi rispetto a modulo e segno.', ['Bit più significativo con peso negativo −2ⁿ⁻¹', 'Intervallo da −2ⁿ⁻¹ a 2ⁿ⁻¹ − 1', 'Negazione: complemento e somma 1', 'Un solo zero', 'Somma e sottrazione con lo stesso circuito, senza trattare i segni', 'Overflow: operandi concordi e risultato di segno opposto'], 'ap:96-102'],
    ],
    generators: [{ id: 'gen:c2', sub: 'c2', title: 'Complemento a 2', desc: 'Codifica, decodifica, somma con overflow.' }],
  });

  course.define('virgola-mobile', {
    src: L('Lez. 8 «Aritmetica del calcolatore»'),
    intro: 'Nell\'esempio di compitino: una domanda di calcolo (conversione in IEEE 754) e una aperta (divisione in virgola mobile).',
    sections: [
      { title: 'L\'idea della virgola mobile', src: 'ap:107-108', html:
        '<p>Come la notazione scientifica: <span class="mono">± S × B^(±E)</span>, con S significando (mantissa), B base, E esponente. Il numero si <strong>normalizza</strong> spostando la virgola finché resta un solo 1 prima di essa; quell\'1 è sempre presente, quindi non si memorizza.</p>' +
        '<p>Più bit all\'esponente allargano l\'intervallo ma i numeri diventano più radi (meno precisione): la precisione cresce solo aumentando i bit totali.</p>' },
      { title: 'Formato IEEE 754', src: 'ap:109; ec:es2', diagram: 'ieee', html:
        '<p><strong>Singola precisione</strong>, 32 bit: 1 di segno, 8 di esponente, 23 di mantissa. <strong>Doppia</strong>, 64 bit: 1, 11, 52. L\'esponente è <strong>polarizzato</strong>: si memorizza esponente + 127 (2⁷ − 1).</p>' +
        '<p>Conversione di −7,28515625:</p><ol><li>in binario: −111,01001001;</li><li>normalizzato: −1,1101001001 · 2²;</li><li>esponente: 2 + 127 = 129 = 10000001;</li><li>mantissa: 1101001001 completata a 23 bit con zeri;</li><li>segno 1 perché negativo.</li></ol><p class="formula">1 10000001 11010010010000000000000</p>' },
      { title: 'Casi speciali', src: 'ap:109', html:
        '<ul><li>esponente da 1 a 254: numero normalizzato ±1,f · 2^(e−127);</li><li>esponente 0, mantissa 0: <strong>zero</strong> (positivo o negativo);</li><li>esponente 0, mantissa non nulla: numero <strong>denormalizzato</strong> ±0,f · 2⁻¹²⁶;</li><li>esponente tutto a 1, mantissa 0: <strong>infinito</strong>;</li><li>esponente tutto a 1, mantissa non nulla: <strong>NaN</strong>.</li></ul>' },
      { title: 'Operazioni', src: 'ap:109-111', html:
        '<p><strong>Somma e sottrazione</strong>, quattro fasi: controllo dello zero; allineamento delle mantisse (si rendono uguali gli esponenti); somma o sottrazione delle mantisse; normalizzazione del risultato.</p>' +
        '<p><strong>Moltiplicazione</strong>: controllo dello zero, somma degli esponenti e sottrazione della polarizzazione (contata due volte), moltiplicazione delle mantisse, normalizzazione, arrotondamento.</p>' +
        '<p><strong>Divisione</strong>: controllo dello zero (dividendo 0 → risultato 0; divisore 0 → errore o infinito), sottrazione dell\'esponente del divisore da quello del dividendo e <em>ri-somma</em> della polarizzazione, divisione delle mantisse, normalizzazione, arrotondamento.</p>' +
        '<p>I <strong>bit di guardia</strong> (bit in più a destra nei registri della ALU) evitano di perdere cifre durante le traslazioni.</p>' },
    ],
    cards: [
      ['formato', 'formato', 'Come sono divisi i 32 bit della singola precisione IEEE 754? E i 64 della doppia?', 'Singola: 1 segno, 8 esponente, 23 mantissa. Doppia: 1 segno, 11 esponente, 52 mantissa.', 'ap:109'],
      ['bias', 'formato', 'Cos\'è l\'esponente polarizzato e quanto vale la polarizzazione in singola precisione?', 'Si memorizza l\'esponente vero più una costante, così il campo è sempre non negativo. In singola precisione la costante è 2⁷ − 1 = 127.', 'ap:109; ec:es2', 'Quali esponenti veri si possono rappresentare, quindi?'],
      ['implicito', 'formato', 'Perché l\'1 prima della virgola non si memorizza?', 'Il numero è normalizzato, quindi il bit prima della virgola è sempre 1: non serve scriverlo e si guadagna un bit di precisione.', 'ap:107'],
      ['passi', 'conversione', 'Quali sono i passi per convertire un decimale in IEEE 754 singola precisione?', '1) Convertire in binario parte intera e frazionaria. 2) Normalizzare a 1,xxx · 2^e. 3) Esponente polarizzato e + 127 su 8 bit. 4) Mantissa: bit dopo la virgola, completati a 23 con zeri. 5) Bit di segno.', 'ec:es2'],
      ['speciali', 'formato', 'Cosa rappresentano: esponente 0 e mantissa 0; esponente tutto 1 e mantissa 0; esponente tutto 1 e mantissa non nulla?', 'Zero (±); infinito (±); NaN (Not a Number).', 'ap:109'],
      ['denorm', 'formato', 'Cos\'è un numero denormalizzato?', 'Esponente 0 e mantissa non nulla: il bit prima della virgola è 0 e l\'esponente vero è −126. Vale ±0,f · 2⁻¹²⁶ e serve per i numeri molto vicini a zero.', 'ap:109'],
      ['somma', 'operazioni', 'Quali sono le quattro fasi della somma in virgola mobile?', 'Controllo dello zero; allineamento delle mantisse (stessi esponenti); somma o sottrazione delle mantisse; normalizzazione del risultato.', 'ap:109'],
      ['divisione', 'operazioni', 'Schema della divisione tra numeri in virgola mobile IEEE 754.', 'Controllo dello zero (dividendo 0 → 0; divisore 0 → errore/infinito); sottrazione degli esponenti e ri-somma della polarizzazione; divisione delle mantisse; normalizzazione; arrotondamento.', 'ap:110; ec:es4', 'Perché nella divisione la polarizzazione va ri-sommata e nella moltiplicazione sottratta?'],
      ['guardia', 'operazioni', 'A cosa servono i bit di guardia?', 'Sono bit aggiuntivi a destra nei registri della ALU: permettono di non perdere cifre quando le mantisse vengono traslate a destra, migliorando la precisione prima dell\'arrotondamento.', 'ap:111'],
      ['densita', 'formato', 'Cosa succede a intervallo e precisione se si danno più bit all\'esponente a parità di bit totali?', 'L\'intervallo rappresentabile si allarga, ma i numeri sono più distanti tra loro: meno precisione.', 'ap:108'],
    ],
    mcq: [
      ['Quanto vale la polarizzazione dell\'esponente in singola precisione?', ['63', '127', '128', '255', '1023'], 1, '2⁷ − 1.', 'ec:es2'],
      ['Quanti bit ha la mantissa in singola precisione?', ['8', '11', '23', '24', '52'], 2, '1 + 8 + 23 = 32.', 'ap:109'],
      ['Esponente tutto a 1 e mantissa non nulla rappresentano…', ['zero', 'infinito', 'NaN', 'un numero denormalizzato', 'il massimo numero'], 2, 'Not a Number.', 'ap:109'],
      ['Qual è il campo esponente di 1,0 in singola precisione?', ['00000000', '01111111', '10000000', '11111111', '00000001'], 1, 'Esponente vero 0 → 0 + 127 = 01111111.', 'ap:109'],
      ['Nella somma in virgola mobile, cosa si fa subito dopo il controllo dello zero?', ['Si normalizza', 'Si allineano le mantisse', 'Si sommano gli esponenti', 'Si arrotonda', 'Si sottrae la polarizzazione'], 1, 'Prima si rendono uguali gli esponenti.', 'ap:109'],
    ],
    open: [
      ['divisione', 'Si spieghi in dettaglio lo schema per realizzare la divisione fra numeri a virgola mobile nello standard IEEE 754.', ['Controllo dello zero: dividendo 0 → risultato 0', 'Divisore 0 → errore o infinito', 'Sottrazione dell\'esponente del divisore da quello del dividendo', 'Ri-somma della polarizzazione (la sottrazione l\'ha eliminata)', 'Controllo di overflow/underflow dell\'esponente', 'Divisione delle mantisse', 'Normalizzazione e arrotondamento; segno dal confronto dei segni'], 'ap:110; ec:es4'],
      ['formato', 'Descrivere il formato IEEE 754 a singola precisione e i valori speciali.', ['1 bit di segno, 8 di esponente, 23 di mantissa', 'Esponente polarizzato di 127', 'Mantissa normalizzata con 1 implicito', 'Zero: esponente e mantissa a 0', 'Denormalizzati: esponente 0, mantissa non nulla', 'Infinito e NaN: esponente tutto a 1'], 'ap:109'],
      ['somma', 'Descrivere le fasi della somma di due numeri in virgola mobile.', ['Controllo dello zero', 'Allineamento: si trasla la mantissa del numero con esponente minore', 'Somma algebrica delle mantisse', 'Normalizzazione', 'Arrotondamento e bit di guardia', 'Possibile overflow/underflow dell\'esponente'], 'ap:109-111'],
    ],
    generators: [{ id: 'gen:ieee', sub: 'ieee', title: 'Virgola mobile IEEE 754', desc: 'Conversione in entrambi i versi: la domanda di calcolo dell\'esempio di compitino.' }],
  });

  course.define('linguaggio-macchina', {
    src: L('Lez. 9 «Linguaggio macchina»'),
    intro: 'Teoria di contorno: serve per capire indirizzamento e pipeline.',
    sections: [
      { title: 'Elementi di un\'istruzione', src: 'ap:112-113', html:
        '<p>Quattro elementi: <strong>codice operativo</strong> (cosa fare), riferimento all\'<strong>operando sorgente</strong>, riferimento all\'<strong>operando risultato</strong>, riferimento all\'<strong>istruzione successiva</strong> (di solito implicito).</p>' +
        '<p>Gli operandi possono stare in: memoria centrale (serve l\'indirizzo), registri della CPU, nell\'istruzione stessa (dato immediato), dispositivi di I/O.</p>' },
      { title: 'Tipi di istruzione e numero di indirizzi', src: 'ap:113-114', html:
        '<p>Tipi: elaborazione dati (aritmetiche e logiche), immagazzinamento (da e verso la memoria), trasferimento (I/O), controllo del flusso (salti).</p>' +
        '<p>Indirizzi per istruzione: 3 (due operandi e risultato), 2 (un operando fa anche da risultato), 1 (il secondo è implicito: accumulatore), 0 (tutti impliciti: pila; <span class="mono">c = a + b</span> diventa push a, push b, add, pop c).</p>' +
        '<p><strong>Meno indirizzi</strong>: istruzioni più corte e CPU più semplice, ma più istruzioni per programma. <strong>Più indirizzi</strong>: istruzioni più complesse, programmi più corti.</p>' },
      { title: 'Operazioni', src: 'ap:116-117', html:
        '<p>Trasferimento dati, aritmetiche, logiche (AND come maschera), shift e rotazioni, trasferimento del controllo: salto condizionato (branch), skip, <strong>chiamata e ritorno</strong> da procedura.</p>' +
        '<p>L\'indirizzo di ritorno può essere salvato in un registro, all\'inizio della procedura, o in cima alla <strong>pila</strong> (l\'unica soluzione che regge procedure annidate e ricorsive).</p>' },
      { title: 'Assembly ed endianness', src: 'ap:118', html:
        '<p>L\'assembly usa simboli al posto dei codici binari; l\'assemblatore lo traduce. <strong>Big endian</strong>: il byte più significativo all\'indirizzo più basso. <strong>Little endian</strong>: il meno significativo all\'indirizzo più basso.</p>' },
    ],
    cards: [
      ['elementi', 'istruzioni', 'Quali sono i quattro elementi di un\'istruzione macchina?', 'Codice operativo; riferimento all\'operando sorgente; riferimento all\'operando risultato; riferimento all\'istruzione successiva.', 'ap:112'],
      ['dove', 'istruzioni', 'Dove possono trovarsi gli operandi di un\'istruzione?', 'In memoria centrale (o virtuale), nei registri della CPU, nell\'istruzione stessa come dato immediato, in un dispositivo di I/O.', 'ap:113'],
      ['tipi', 'istruzioni', 'Quali sono i quattro tipi di istruzione?', 'Elaborazione dati; immagazzinamento dei dati in memoria e viceversa; trasferimento dati (I/O); controllo del flusso.', 'ap:113'],
      ['indirizzi', 'istruzioni', 'Che compromesso c\'è nel numero di indirizzi per istruzione?', 'Meno indirizzi: istruzioni più elementari e corte, CPU meno complessa, ma più istruzioni per lo stesso programma. Più indirizzi: istruzioni più complesse e lunghe, programmi più brevi.', 'ap:114'],
      ['zero-ind', 'istruzioni', 'Come funziona una macchina a zero indirizzi?', 'Tutti gli indirizzi sono impliciti: gli operandi stanno in cima a una pila. c = a + b diventa push a, push b, add, pop c.', 'ap:113'],
      ['ritorno', 'istruzioni', 'Dove si può memorizzare l\'indirizzo di ritorno di una procedura, e quale scelta supporta l\'annidamento?', 'In un registro, all\'inizio della procedura chiamata, o in cima alla pila. Solo la pila gestisce bene chiamate annidate e ricorsive.', 'ap:117'],
      ['endian', 'istruzioni', 'Differenza tra big endian e little endian.', 'Big endian: il byte più significativo è all\'indirizzo più basso. Little endian: all\'indirizzo più basso c\'è il byte meno significativo.', 'ap:118'],
    ],
    mcq: [
      ['Quale elemento di un\'istruzione specifica l\'operazione da eseguire?', ['L\'operando sorgente', 'Il codice operativo', 'Il program counter', 'L\'indirizzo di ritorno', 'Il registro di stato'], 1, 'Opcode.', 'ap:112'],
      ['In una macchina a un indirizzo, dov\'è il secondo operando?', ['In cima alla pila', 'Nell\'accumulatore (implicito)', 'Nel program counter', 'Non esiste', 'In memoria all\'indirizzo successivo'], 1, 'Indirizzo implicito: accumulatore.', 'ap:113'],
      ['Meno indirizzi per istruzione comportano…', ['programmi più corti', 'istruzioni più lunghe', 'più istruzioni per lo stesso programma', 'CPU più complessa', 'nessuna differenza'], 2, 'Istruzioni più semplici ma più numerose.', 'ap:114'],
      ['In little endian, all\'indirizzo più basso si trova…', ['il byte più significativo', 'il byte meno significativo', 'il bit di segno', 'l\'opcode', 'dipende dal dato'], 1, 'Definizione.', 'ap:118'],
    ],
    open: [
      ['indirizzi', 'Discutere il numero di indirizzi in un\'istruzione macchina e le conseguenze della scelta.', ['Fino a quattro riferimenti: due operandi, risultato, istruzione successiva', 'Tre, due, uno (accumulatore), zero indirizzi (pila)', 'Esempio di c = a + b a zero indirizzi', 'Meno indirizzi: istruzioni corte, CPU semplice, più istruzioni', 'Più indirizzi: istruzioni complesse, programmi brevi', 'Registri al posto di indirizzi di memoria: meno bit'], 'ap:113-114'],
    ],
  });

  course.define('indirizzamento', {
    src: L('Lez. 9 «Linguaggio macchina»'),
    intro: 'Nell\'esempio di compitino: una domanda a scelta multipla sugli accessi in memoria e una aperta sullo spiazzamento.',
    sections: [
      { title: 'I modi di base', src: 'ap:118-119; ec:es1', html:
        '<div class="scroll"><table><thead><tr><th>Modo</th><th>Dove sta l\'operando</th><th>Accessi in memoria per l\'operando</th><th>Pro / contro</th></tr></thead><tbody>' +
        '<tr><td>Immediato</td><td>nell\'istruzione</td><td>0</td><td>veloce / valore limitato dal campo</td></tr>' +
        '<tr><td>Diretto</td><td>in memoria, all\'indirizzo scritto nell\'istruzione</td><td>1</td><td>semplice / spazio di indirizzamento limitato</td></tr>' +
        '<tr><td>Indiretto</td><td>in memoria, all\'indirizzo contenuto nella cella indicata</td><td>2</td><td>grande spazio / due accessi</td></tr>' +
        '<tr><td>Registro</td><td>in un registro</td><td>0</td><td>veloce, pochi bit / pochi registri</td></tr>' +
        '<tr><td>Registro indiretto</td><td>in memoria, all\'indirizzo contenuto nel registro</td><td>1</td><td>grande spazio, un accesso in meno dell\'indiretto</td></tr>' +
        '<tr><td>Spiazzamento</td><td>in memoria, all\'indirizzo A + (R)</td><td>1</td><td>flessibile / serve una somma</td></tr>' +
        '<tr><td>Pila</td><td>in cima alla pila</td><td>1</td><td>indirizzo implicito</td></tr></tbody></table></div>' +
        '<p>Per contare gli accessi di un\'istruzione intera si aggiunge <strong>1 per il fetch</strong> dell\'istruzione. Esempio: un operando a registro indiretto e uno a registro → 1 + 1 + 0 = 2 accessi.</p>' },
      { title: 'Indirizzamento con spiazzamento', src: 'ap:120; ec:es5', html:
        '<p>Combina diretto e registro: il campo indirizzo ha due parti, un valore <strong>A</strong> e un registro <strong>R</strong>; l\'indirizzo effettivo è <span class="mono">A + (R)</span>. Tre varianti:</p><ul>' +
        '<li><strong>Relativo</strong>: R è il PC. L\'operando sta ad A celle dall\'istruzione corrente; sfrutta la località e rende il codice rilocabile.</li>' +
        '<li><strong>Registro base</strong>: R contiene l\'indirizzo base (per esempio di un segmento), A lo spiazzamento.</li>' +
        '<li><strong>Indicizzazione</strong>: A è l\'indirizzo base di una struttura, R è l\'indice incrementato a ogni accesso: comodo per scorrere i vettori.</li></ul>' +
        '<p>Pregi: flessibilità, un solo accesso in memoria, strutture dati e codice rilocabile. Difetti: serve una somma per ogni accesso; con campo A piccolo lo spiazzamento è limitato, con campo grande l\'istruzione si allunga.</p>' },
      { title: 'Formato delle istruzioni', src: 'ap:121-123', html:
        '<p>La lunghezza delle istruzioni condiziona ed è condizionata da organizzazione della memoria e complessità della CPU: è un compromesso tra repertorio potente e risparmio di spazio. I bit si dividono tra codice operativo e operandi in base a: numero di modi di indirizzamento, numero di operandi, registri contro memoria, numero di banchi di registri, intervallo e granularità degli indirizzi. Formati a lunghezza fissa (PDP-8, RISC) o variabile (PDP-11, VAX, x86).</p>' },
    ],
    cards: [
      ['immediato', 'modi', 'Indirizzamento immediato: dov\'è l\'operando, vantaggio e svantaggio.', 'L\'operando è nel campo indirizzo dell\'istruzione. Vantaggio: nessun accesso in memoria per prenderlo. Svantaggio: valore limitato dalla dimensione del campo.', 'ap:118'],
      ['diretto', 'modi', 'Indirizzamento diretto: come funziona e quanti accessi richiede?', 'Il campo indirizzo contiene l\'indirizzo dell\'operando. Un accesso in memoria. Limite: spazio di indirizzamento limitato dal campo.', 'ap:118'],
      ['indiretto', 'modi', 'Indirizzamento indiretto: come funziona, vantaggio e svantaggio.', 'Il campo indirizzo punta a una cella di memoria che contiene l\'indirizzo dell\'operando. Vantaggio: grande spazio di indirizzamento. Svantaggio: due accessi in memoria.', 'ap:119'],
      ['registro', 'modi', 'Differenza tra indirizzamento registro e registro indiretto.', 'Registro: l\'operando è nel registro, zero accessi in memoria. Registro indiretto: il registro contiene l\'indirizzo dell\'operando, un accesso in memoria (uno in meno dell\'indiretto).', 'ap:119'],
      ['accessi', 'modi', 'Quante volte si accede alla memoria per prelevare ed eseguire un\'istruzione con un operando a registro indiretto e uno a registro?', 'Due: uno per il fetch dell\'istruzione, uno per l\'operando a registro indiretto. L\'operando a registro non richiede accessi.', 'ec:es1', 'E se il primo operando fosse a indirizzamento indiretto?'],
      ['spiazzamento', 'modi', 'Come si calcola l\'indirizzo effettivo nell\'indirizzamento con spiazzamento?', 'Indirizzo = A + (R): un valore A nel campo indirizzo sommato al contenuto di un registro R. Combina indirizzamento diretto e a registro.', 'ap:120'],
      ['varianti', 'modi', 'Quali sono le tre varianti dell\'indirizzamento con spiazzamento?', 'Relativo (R = PC); registro base (R contiene la base, A lo spiazzamento); indicizzazione (A è la base, R l\'indice che si incrementa).', 'ap:120', 'Quale useresti per scorrere un vettore, e perché?'],
      ['pila', 'modi', 'Perché l\'indirizzamento a pila è un caso di registro indiretto?', 'L\'operando è in cima alla pila, il cui indirizzo è nel registro stack pointer: si accede alla memoria all\'indirizzo contenuto in un registro.', 'ap:120'],
      ['formato', 'formato', 'Da cosa dipende l\'allocazione dei bit nel formato di un\'istruzione?', 'Numero di modi di indirizzamento, numero di operandi, uso di registri o memoria, numero di banchi di registri, intervallo degli indirizzi, granularità degli indirizzi (byte o parola).', 'ap:121'],
    ],
    mcq: [
      ['Quante volte la CPU accede alla memoria quando preleva ed esegue un\'istruzione con un operando a registro indiretto e uno a registro?', ['1', '2', '3', '4', 'nessuna delle risposte precedenti'], 1, 'Fetch (1) + registro indiretto (1) + registro (0).', 'ec:es1'],
      ['Quale modo di indirizzamento richiede due accessi in memoria per ottenere l\'operando?', ['Immediato', 'Diretto', 'Indiretto', 'Registro', 'Registro indiretto'], 2, 'Prima l\'indirizzo, poi l\'operando.', 'ap:119'],
      ['Nell\'indirizzamento relativo, quale registro si somma al campo indirizzo?', ['Lo stack pointer', 'Il program counter', 'L\'accumulatore', 'Un registro indice', 'Nessuno'], 1, 'Indirizzo = A + (PC).', 'ap:120'],
      ['Quale modo non richiede alcun accesso in memoria per l\'operando?', ['Diretto', 'Indiretto', 'Registro indiretto', 'Immediato', 'Spiazzamento'], 3, 'L\'operando è nell\'istruzione (vale anche per il modo registro).', 'ap:118'],
      ['Per scorrere gli elementi di un vettore il modo più adatto è…', ['immediato', 'indicizzazione', 'indiretto', 'registro', 'diretto'], 1, 'Base fissa più indice incrementato.', 'ap:120'],
    ],
    open: [
      ['spiazzamento', 'Si illustri nel dettaglio l\'indirizzamento con spiazzamento. Discuterne pregi e difetti.', ['Il campo indirizzo ha due parti: valore A e registro R', 'Indirizzo effettivo = A + (R)', 'Relativo: R è il PC', 'Registro base: R contiene la base, A lo spiazzamento', 'Indicizzazione: A base, R indice incrementato', 'Pregi: flessibile, un accesso in memoria, vettori e codice rilocabile', 'Difetti: somma a ogni accesso, compromesso sulla dimensione del campo A'], 'ap:120; ec:es5'],
      ['modi', 'Descrivere i principali modi di indirizzamento, indicando per ciascuno il numero di accessi in memoria.', ['Immediato: 0 accessi, valore limitato', 'Diretto: 1 accesso, spazio limitato', 'Indiretto: 2 accessi, spazio grande', 'Registro: 0 accessi, pochi registri', 'Registro indiretto: 1 accesso', 'Spiazzamento: 1 accesso più una somma', 'Pila: operando in cima, indirizzo implicito'], 'ap:118-120'],
    ],
  });

  course.define('processore', {
    src: L('Lez. 10 «Struttura e funzione della CPU»'),
    intro: 'Registri e ciclo dell\'istruzione: premessa alla pipeline.',
    sections: [
      { title: 'Compiti della CPU e registri', src: 'ap:124-126', html:
        '<p>La CPU preleva le istruzioni, le interpreta, preleva i dati, li elabora e scrive i risultati. I <strong>registri</strong> sono il livello più alto della gerarchia di memoria e si dividono in:</p><ul>' +
        '<li><strong>registri visibili all\'utente</strong>: usati dal programmatore per dati, indirizzi, codici di condizione. Possono essere a uso generale (più flessibilità, ma istruzioni più lunghe) o specializzati (istruzioni più corte e veloci);</li>' +
        '<li><strong>registri di controllo e di stato</strong>: usati dall\'unità di controllo e dal sistema operativo (PC, IR, MAR, MBR, PSW).</li></ul>' +
        '<p>Quanti registri? Di solito tra 8 e 32: meno di 8 obbligano a più accessi in memoria, più di 32 non li riducono ancora e occupano spazio. Quanto lunghi? Abbastanza per un indirizzo e per una parola intera.</p>' },
      { title: 'Codici di condizione e PSW', src: 'ap:126', html:
        '<p>I <strong>codici di condizione</strong> sono bit impostati dalla CPU in base all\'ultimo risultato (segno, zero, riporto, uguale, overflow). I programmi li leggono implicitamente (salta se zero) ma di norma non li scrivono. Stanno nella <strong>Program Status Word</strong>, insieme a bit come abilitazione delle interruzioni e modalità supervisore.</p>' },
      { title: 'Ciclo dell\'istruzione e flusso dei dati', src: 'ap:127-128', html:
        '<p>Fetch, eventuale ciclo di <strong>indirettezza</strong> (accessi aggiuntivi per ricavare l\'indirizzo dell\'operando), execute, ciclo di interruzione.</p>' +
        '<p>Fetch: il PC va in MAR; l\'indirizzo esce sul bus indirizzi; l\'unità di controllo chiede una lettura; il dato arriva in MBR e passa in IR; intanto il PC viene incrementato.</p>' },
    ],
    cards: [
      ['compiti', 'cpu', 'Quali sono i compiti della CPU nell\'eseguire un programma?', 'Prelevare le istruzioni, interpretarle, prelevare i dati, elaborarli, scrivere i risultati.', 'ap:124'],
      ['reg-tipi', 'registri', 'In quali due grandi categorie si dividono i registri della CPU?', 'Registri visibili all\'utente (dati, indirizzi, codici di condizione) e registri di controllo e di stato (usati dall\'unità di controllo e dal sistema operativo).', 'ap:124'],
      ['generale', 'registri', 'Registri a uso generale o specializzati: qual è il compromesso?', 'Uso generale: più flessibilità per il programmatore, ma istruzioni più lunghe e complesse (va indicato il registro). Specializzati: istruzioni più piccole e veloci, meno flessibilità.', 'ap:125'],
      ['quanti', 'registri', 'Quanti registri ha tipicamente una CPU e perché non di più o di meno?', 'Tra 8 e 32. Meno di 8 costringono a più accessi alla memoria; più di 32 non riducono ulteriormente gli accessi e occupano spazio nella CPU.', 'ap:125'],
      ['psw', 'registri', 'Cosa sono i codici di condizione e dove si trovano?', 'Bit impostati dalla CPU come effetto dell\'ultima operazione (segno, zero, riporto, uguale, overflow). Stanno nella Program Status Word, con bit di abilitazione delle interruzioni e di modalità supervisore.', 'ap:126'],
      ['fetch-dati', 'ciclo', 'Descrivi il flusso dei dati nella fase di fetch.', 'Il PC è copiato in MAR; l\'indirizzo va sul bus indirizzi; l\'unità di controllo richiede la lettura; il risultato arriva sul bus dati, viene copiato in MBR e poi in IR; nel frattempo il PC è incrementato.', 'ap:127'],
      ['indiretto', 'ciclo', 'Cos\'è il ciclo di indirettezza?', 'Un sottociclo tra fetch ed execute: con l\'indirizzamento indiretto servono accessi aggiuntivi in memoria per ottenere l\'indirizzo effettivo dell\'operando.', 'ap:127'],
    ],
    mcq: [
      ['Quale di questi è un registro di controllo e non un registro visibile all\'utente?', ['Un registro dati', 'Un registro indirizzi', 'L\'instruction register (IR)', 'Un registro a uso generale', 'Nessuno'], 2, 'IR è usato dall\'unità di controllo.', 'ap:124'],
      ['I codici di condizione sono impostati…', ['dal programmatore', 'dal compilatore', 'dalla CPU come effetto delle operazioni', 'dal modulo di I/O', 'dalla cache'], 2, 'I programmi li leggono ma di norma non li scrivono.', 'ap:126'],
      ['Durante il fetch, in quale registro viene copiato per primo il contenuto del PC?', ['IR', 'MBR', 'MAR', 'AC', 'PSW'], 2, 'MAR contiene l\'indirizzo da leggere.', 'ap:127'],
      ['Avere meno di 8 registri comporta…', ['istruzioni più lunghe', 'più riferimenti alla memoria', 'nessuna differenza', 'pipeline più veloci', 'meno interruzioni'], 1, 'Gli operandi vanno tenuti in memoria.', 'ap:125'],
    ],
    open: [
      ['registri', 'Descrivere l\'organizzazione dei registri di una CPU.', ['Registri visibili all\'utente: dati, indirizzi, codici di condizione', 'Registri a uso generale e specializzati, con compromesso', 'Numero tipico tra 8 e 32 e motivazione', 'Lunghezza: un indirizzo, una parola', 'Registri di controllo e stato: PC, IR, MAR, MBR', 'Program Status Word e codici di condizione'], 'ap:124-126'],
    ],
  });

  course.define('pipeline', {
    src: L('Lez. 11 «Pipeline» e Lez. 13 «RISC-V»'),
    intro: 'L\'argomento più pesante della seconda parte: nell\'esempio di compitino valgono una domanda di calcolo, una aperta e l\'esercizio finale.',
    sections: [
      { title: 'L\'idea', src: 'ap:130-132', diagram: 'pipeline', html:
        '<p>Come una catena di montaggio: l\'esecuzione di un\'istruzione è divisa in fasi, ogni fase ha la sua unità, e nello stesso istante <strong>istruzioni diverse sono in fasi diverse</strong>. A regime si completa un\'istruzione per ciclo usando meno risorse della replicazione totale.</p>' +
        '<p>Già il semplice <em>prefetch</em> (prelevare la prossima istruzione mentre si esegue la corrente) aiuta, ma non raddoppia le prestazioni: l\'esecuzione dura più del fetch, e dopo un salto l\'istruzione prelevata va scartata.</p>' +
        '<p>Pipeline MIPS / RISC-V a 5 stadi: <strong>IF</strong> (fetch), <strong>ID</strong> (decodifica e lettura registri), <strong>EX</strong> (esecuzione o calcolo dell\'indirizzo), <strong>MEM</strong> (accesso alla memoria, completamento dei salti), <strong>WB</strong> (scrittura del risultato nei registri).</p>' },
      { title: 'Perché non si raggiunge il parallelismo massimo', src: 'ap:134-137', html:
        '<ol><li><strong>Sbilanciamento delle fasi</strong>: le fasi non durano uguale; il ciclo di clock si adatta alla più lenta, più l\'overhead dei registri tra gli stadi.</li>' +
        '<li><strong>Problemi strutturali</strong> (structural hazard): due fasi vogliono la stessa risorsa nello stesso ciclo (per esempio la memoria).</li>' +
        '<li><strong>Dipendenza dai dati</strong> (data hazard): un\'istruzione ha bisogno di un risultato che un\'istruzione precedente, ancora in pipeline, non ha ancora scritto.</li>' +
        '<li><strong>Dipendenza dal controllo</strong> (control hazard): salti, chiamate e ritorni cambiano quale istruzione viene dopo, e quelle già prelevate possono essere sbagliate.</li></ol>' +
        '<p>Uno <strong>stallo</strong> (bolla) è un ciclo in cui uno stadio non fa lavoro utile: si blocca l\'istruzione e quelle dietro, e si inserisce una fase non operativa.</p>' },
      { title: 'Risolvere le dipendenze dai dati', src: 'ap:138-142; ec:es3', html:
        '<ul><li><strong>Stallo (nop)</strong>: l\'istruzione aspetta in ID finché il dato è stato scritto. Se registri si scrivono nella prima metà del ciclo e si leggono nella seconda, basta che ID coincida con il WB di chi produce il dato.</li>' +
        '<li><strong>Data forwarding (by-pass)</strong>: il risultato viene portato direttamente dai registri di pipeline EX/MEM o MEM/WB all\'ingresso della ALU, senza aspettare il WB.</li>' +
        '<li><strong>Riordino delle istruzioni</strong> da parte del compilatore.</li></ul>' +
        '<p>Con il forwarding resta un solo caso di stallo: una <strong>LW seguita subito da un\'istruzione che ne usa il risultato</strong>. Il dato esiste solo dopo MEM, quindi serve <strong>uno stallo</strong> più il forwarding da MEM/WB.</p>' },
      { title: 'Le due unità di controllo', src: 'ec:es8; ap:167-196', html:
        '<p><strong>Hazard Detection Unit</strong> (in ID): inserisce lo stallo se <span class="mono">ID/EX.MemRead and ID/EX.RegisterRd≠0 and ID/EX.RegisterRd = IF/ID.RegisterRs1 (o Rs2)</span>.</p>' +
        '<p><strong>Forwarding Unit</strong> (in EX): sceglie l\'ingresso della ALU.</p><ul>' +
        '<li>da <strong>EX/MEM.ALUOut</strong> se <span class="mono">EX/MEM.RegWrite and EX/MEM.RegisterRd≠0 and EX/MEM.RegisterRd = ID/EX.RegisterRs</span> (dato prodotto dall\'istruzione precedente);</li>' +
        '<li>da <strong>MEM/WB</strong> (ALUOut, o LMD se era una LW) se la stessa condizione vale per MEM/WB (dato prodotto due istruzioni prima).</li></ul>' +
        '<p>Rs1 entra nell\'ingresso alto della ALU (TopALUIn), Rs2 in quello basso (BottomALUIn).</p>' },
      { title: 'Salti', src: 'ap:143-150', html:
        '<p>Finché non si conosce l\'esito di un salto non si sa quale istruzione prelevare. Soluzioni: mettere in stallo; flussi multipli; prefetch dell\'istruzione target; <strong>loop buffer</strong>; <strong>predizione</strong>; <strong>salto ritardato</strong> (delayed branch: si esegue comunque l\'istruzione che segue il salto, scelta dal compilatore).</p>' +
        '<p>Predizione <strong>statica</strong>: mai preso, sempre preso, in base al codice operativo. <strong>Dinamica</strong>: 1 o 2 bit di storia per ogni salto; con 2 bit servono due errori consecutivi per cambiare predizione. La storia sta nel <strong>branch history table</strong>, vicino allo stadio di fetch, con l\'indirizzo di destinazione.</p>' },
    ],
    cards: [
      ['idea', 'concetti', 'Qual è il principio della pipeline?', 'Dividere l\'esecuzione di un\'istruzione in fasi eseguite da unità diverse, così che nello stesso istante istruzioni diverse siano in fasi diverse. A regime si completa un\'istruzione per ciclo.', 'ap:130-131'],
      ['stadi', 'concetti', 'Quali sono i 5 stadi della pipeline MIPS/RISC-V e cosa fa ciascuno?', 'IF: preleva l\'istruzione. ID: decodifica e legge i registri. EX: esegue l\'operazione o calcola l\'indirizzo. MEM: accede alla memoria (e completa i salti). WB: scrive il risultato nei registri.', 'ap:170'],
      ['problemi', 'hazard', 'Quali sono i quattro motivi per cui la pipeline non raggiunge il parallelismo massimo?', 'Sbilanciamento delle fasi; problemi strutturali (stessa risorsa nello stesso ciclo); dipendenza dai dati; dipendenza dal controllo (salti).', 'ap:134-137'],
      ['stallo', 'hazard', 'Cos\'è uno stallo e a cosa serve?', 'Un ciclo in cui un\'istruzione viene tenuta ferma in uno stadio (e con lei quelle che seguono), inserendo una fase non operativa (bolla). Serve ad aspettare che un dato o l\'esito di un salto siano disponibili, garantendo un risultato corretto.', 'ap:134; ec:es7', 'Quale unità lo decide, e in quale stadio?'],
      ['soluzioni', 'hazard', 'Tre modi di risolvere una dipendenza dai dati.', 'Stallo (fasi non operative); data forwarding o by-pass (il dato è propagato in avanti prima del WB); riordino delle istruzioni da parte del compilatore.', 'ap:138'],
      ['senza-fw', 'esercizio', 'Senza forwarding (ma con scrittura e lettura dei registri nello stesso ciclo), fino a quando un\'istruzione resta in ID?', 'Finché l\'istruzione che produce il dato non è in WB: l\'ultimo ciclo di ID coincide con quel WB. Per istruzioni consecutive sono 2 cicli di stallo.', 'ec:es3'],
      ['load-use', 'esercizio', 'Con il forwarding, in quale caso serve comunque uno stallo e perché?', 'Quando un\'istruzione usa subito il risultato di una LW: il dato è disponibile solo alla fine di MEM, quindi serve uno stallo e poi il forwarding da MEM/WB.', 'ec:es3; ec:es8', 'Perché dopo una ADD invece non serve?'],
      ['hdu', 'esercizio', 'Qual è la condizione della Hazard Detection Unit?', 'ID/EX.MemRead and ID/EX.RegisterRd≠0 and ID/EX.RegisterRd = IF/ID.RegisterRs1 (oppure Rs2): l\'istruzione in EX è una load e scrive un registro letto dall\'istruzione in ID.', 'ec:es8'],
      ['fwu', 'esercizio', 'Quali sono le condizioni della Forwarding Unit e da dove prende il dato?', 'EX/MEM.RegWrite and EX/MEM.RegisterRd≠0 and EX/MEM.RegisterRd = ID/EX.RegisterRs → da EX/MEM.ALUOut. Stessa condizione su MEM/WB → da MEM/WB.ALUOut (o LMD se il dato viene da una LW). Rs1 va a TopALUIn, Rs2 a BottomALUIn.', 'ec:es8'],
      ['distanza3', 'esercizio', 'Un\'istruzione usa un registro scritto tre istruzioni prima (senza stalli in mezzo). Serve il forwarding?', 'No: chi lo produce è in WB mentre l\'istruzione è in ID, e con scrittura e lettura nello stesso ciclo il banco dei registri fornisce già il valore nuovo.', 'ec:es8'],
      ['salti', 'salti', 'Elenca le tecniche per gestire i salti in una pipeline.', 'Stallo; flussi multipli; prefetch dell\'istruzione target; loop buffer; predizione dei salti (statica o dinamica); salto ritardato.', 'ap:143-150'],
      ['pred-din', 'salti', 'Come funziona la predizione dinamica a 2 bit?', 'A ogni istruzione di salto sono associati 2 bit che ricordano l\'esito delle ultime esecuzioni. Per invertire la predizione servono due errori consecutivi: in un ciclo si sbaglia una sola volta, all\'uscita.', 'ap:145-147'],
      ['bht', 'salti', 'Cosa contiene il branch history table?', 'Per ogni salto: l\'indirizzo dell\'istruzione di salto, i bit di storia, e l\'indirizzo di destinazione (o l\'istruzione target), così con predizione "preso" il fetch prosegue subito dalla destinazione.', 'ap:149'],
      ['delayed', 'salti', 'Cos\'è il salto ritardato?', 'L\'istruzione subito dopo il salto (branch delay slot) viene eseguita comunque, prima che il salto abbia effetto. Il compilatore ci mette un\'istruzione utile che non dipende dal salto, evitando lo stallo.', 'ap:150'],
    ],
    mcq: [
      ['In quale stadio della pipeline a 5 stadi si leggono i registri?', ['IF', 'ID', 'EX', 'MEM', 'WB'], 1, 'Instruction Decode / register fetch.', 'ap:170'],
      ['Con il forwarding, quanti stalli servono tra una LW e una ADD successiva che ne usa il risultato?', ['0', '1', '2', '3', 'dipende dal registro'], 1, 'Il dato esiste dopo MEM: uno stallo più forwarding da MEM/WB.', 'ec:es8'],
      ['Senza forwarding (con scrittura e lettura dei registri nello stesso ciclo), quanti stalli tra una ADD e una SUB successiva che ne usa il risultato?', ['0', '1', '2', '3', '4'], 2, 'L\'ID della seconda deve coincidere con il WB della prima.', 'ec:es3'],
      ['Un salto condizionato crea una dipendenza…', ['dai dati', 'strutturale', 'dal controllo', 'di sbilanciamento', 'nessuna'], 2, 'Control hazard.', 'ap:137'],
      ['Con predizione dinamica a 2 bit, quanti errori consecutivi servono per invertire la predizione?', ['1', '2', '3', '4', 'nessuno'], 1, 'Due.', 'ap:145'],
      ['Da quale registro di pipeline arriva il dato se è prodotto dalla ADD immediatamente precedente?', ['IF/ID', 'ID/EX', 'EX/MEM', 'MEM/WB', 'Dal banco dei registri'], 2, 'EX/MEM.ALUOut.', 'ec:es8'],
    ],
    open: [
      ['stallo', 'Nel contesto della pipeline del processore MIPS, spiegare nel dettaglio cos\'è uno stallo e a cosa serve.', ['Ciclo in cui un\'istruzione è bloccata in uno stadio e si inserisce una bolla (nop)', 'Anche le istruzioni successive restano ferme', 'Serve a garantire la correttezza con dipendenze dai dati', 'Caso tipico: uso del risultato di una LW nell\'istruzione successiva', 'Hazard Detection Unit e sua condizione', 'Serve anche per le dipendenze dal controllo (salti)', 'Costo: cicli persi; il forwarding ne riduce il numero'], 'ap:134-142; ec:es7'],
      ['hazard', 'Descrivere i tipi di criticità (hazard) di una pipeline e le tecniche per risolverli.', ['Sbilanciamento delle fasi e overhead', 'Strutturali: conflitto sulle risorse', 'Dati: risultato non ancora scritto', 'Soluzioni dati: stallo, forwarding, riordino', 'Controllo: salti', 'Soluzioni controllo: predizione, salto ritardato, prefetch del target'], 'ap:134-150'],
      ['predizione', 'Descrivere le tecniche di predizione dei salti.', ['Scopo: evitare lo stallo in attesa dell\'esito del salto', 'Statica: mai preso, sempre preso, per codice operativo', 'Dinamica: bit di storia per ogni salto', '2 bit: due errori consecutivi per cambiare', 'Branch history table con indirizzo di destinazione', 'Se la predizione è errata si scartano le istruzioni prelevate'], 'ap:144-149'],
      ['forwarding', 'Spiegare cos\'è il data forwarding e quando non basta.', ['Propaga il risultato prima che sia scritto nel registro', 'Sorgenti: EX/MEM.ALUOut e MEM/WB (ALUOut o LMD)', 'Destinazione: ingressi della ALU, Top per Rs1 e Bottom per Rs2', 'Condizioni della Forwarding Unit', 'Non basta dopo una LW usata subito: serve uno stallo', 'Con scrittura/lettura nello stesso ciclo la distanza 3 non richiede forwarding'], 'ec:es3; ec:es8'],
    ],
    generators: [
      { id: 'gen:conta', sub: 'conta', title: 'Cicli risparmiati con il forwarding', desc: 'La domanda di calcolo dell\'esempio di compitino.' },
      { id: 'gen:pipeline', sub: 'pipeline', title: 'Evoluzione della pipeline con forwarding', desc: 'L\'esercizio finale del compitino: stalli e circuiti di by-pass.' },
    ],
  });

  course.define('risc-cisc', {
    src: L('Lez. 12 «Filosofia RISC»'),
    intro: 'Domanda aperta dell\'esempio di compitino: perché è difficile confrontare RISC e CISC.',
    sections: [
      { title: 'Da dove nasce il RISC', src: 'ap:158-159', html:
        '<p>I linguaggi ad alto livello hanno spinto verso istruzioni macchina sempre più complesse (CISC), per semplificare i compilatori. Gli studi sui programmi reali hanno mostrato invece che: predominano gli <strong>assegnamenti</strong> e le istruzioni <strong>condizionali</strong>; gli operandi sono per lo più <strong>scalari locali</strong>; le <strong>chiamate di procedura</strong> sono le operazioni che costano più tempo.</p>' +
        '<p>Conclusione: non avvicinare le istruzioni macchina al linguaggio ad alto livello, ma rendere veloci le operazioni più frequenti.</p>' },
      { title: 'Caratteristiche RISC', src: 'ap:159, 165', html:
        '<ol><li><strong>Molti registri</strong>, o uso dei registri ottimizzato dal compilatore, per ridurre gli accessi in memoria.</li><li><strong>Pipeline</strong> curata con attenzione.</li><li><strong>Set di istruzioni ridotto e semplice</strong>.</li></ol>' +
        '<p>In dettaglio: un\'istruzione per ciclo macchina; operazioni <strong>da registro a registro</strong> (solo LOAD e STORE toccano la memoria); <strong>pochi e semplici modi di indirizzamento</strong>; <strong>formato fisso</strong> e semplice; controllo cablato invece che microprogrammato.</p>' },
      { title: 'Finestre di registri', src: 'ap:161-164', html:
        '<p>Per rendere veloci le chiamate di procedura: i registri sono divisi in gruppi di taglia fissa e ogni procedura vede una <strong>finestra</strong>. Ogni finestra ha registri dei parametri, registri locali e registri temporanei; i temporanei del chiamante coincidono con i parametri del chiamato (<strong>finestre sovrapposte</strong>), quindi i parametri passano senza copie. Le finestre sono organizzate a <strong>buffer circolare</strong>; le variabili globali stanno in un gruppo di registri a parte.</p>' +
        '<p>Alternativa software: pochi registri (16-32) assegnati dal compilatore con la <strong>colorazione di un grafo</strong> di interferenza.</p>' },
      { title: 'CISC e il confronto', src: 'ap:165; ec:es6', html:
        '<p>CISC: molte istruzioni complesse per semplificare il compilatore e accorciare i programmi. Ma il controllo microprogrammato richiede spazio e rallenta anche le istruzioni semplici, che restano le più frequenti.</p>' +
        '<p><strong>Perché il confronto è difficile</strong>: non esistono due macchine RISC e CISC confrontabili per costo, tecnologia, complessità dei circuiti, qualità del compilatore e supporto del sistema operativo; non c\'è un insieme di programmi di prova condiviso; è difficile separare l\'effetto dell\'hardware da quello del compilatore; molti confronti sono stati fatti su macchine sperimentali. In più, i progetti recenti <strong>convergono</strong>: i RISC hanno aggiunto istruzioni, i CISC adottano tecniche RISC.</p>' },
    ],
    cards: [
      ['studi', 'risc', 'Cosa hanno mostrato gli studi sull\'esecuzione dei programmi che hanno motivato il RISC?', 'Predominano gli assegnamenti e le istruzioni condizionali; gli operandi sono soprattutto scalari locali; le chiamate di procedura sono le operazioni più costose in tempo.', 'ap:158-159'],
      ['tre', 'risc', 'Quali sono i tre elementi chiave di un\'architettura RISC?', 'Ampio numero di registri (o uso ottimizzato dal compilatore); pipeline progettata con cura; set di istruzioni semplificato e ridotto.', 'ap:159'],
      ['caratteristiche', 'risc', 'Quattro caratteristiche delle istruzioni RISC.', 'Un\'istruzione per ciclo macchina; operazioni da registro a registro (solo LOAD e STORE accedono alla memoria); pochi e semplici modi di indirizzamento; formato fisso e semplice.', 'ap:165', 'Perché ciascuna di queste aiuta la pipeline?'],
      ['finestre', 'risc', 'Come funzionano le finestre di registri?', 'Ogni procedura ha una finestra di registri divisa in parametri, locali e temporanei. Le finestre di procedure adiacenti si sovrappongono: i temporanei del chiamante sono i parametri del chiamato, così i parametri passano senza copie. L\'insieme è gestito come buffer circolare.', 'ap:161-162'],
      ['colorazione', 'risc', 'Qual è l\'alternativa software alle finestre di registri?', 'L\'ottimizzazione dei registri nel compilatore tramite colorazione di un grafo: i nodi sono i registri simbolici, un arco unisce due registri vivi insieme; i colori sono i registri reali. I nodi non colorabili vanno in memoria.', 'ap:164-165'],
      ['cisc', 'cisc', 'Qual era la motivazione del CISC e quali sono i suoi costi?', 'Istruzioni complesse per semplificare il compilatore e avere programmi più corti e veloci. Costi: unità di controllo microprogrammata più grande, che rallenta anche le istruzioni semplici, le più frequenti; difficile sfruttare bene le istruzioni complesse.', 'ap:165'],
      ['confronto', 'cisc', 'Perché è difficile confrontare con precisione le prestazioni di RISC e CISC?', 'Non esistono coppie di macchine confrontabili per costo, tecnologia, complessità, compilatore e sistema operativo; manca un insieme definitivo di programmi di prova; è difficile separare gli effetti dell\'hardware da quelli del compilatore; molti confronti riguardano macchine sperimentali; le due filosofie stanno convergendo.', 'ec:es6'],
    ],
    mcq: [
      ['In un\'architettura RISC, quali istruzioni accedono alla memoria?', ['Tutte', 'Solo LOAD e STORE', 'Solo i salti', 'Solo le aritmetiche', 'Nessuna'], 1, 'Le altre operano da registro a registro.', 'ap:165'],
      ['Le finestre di registri servono a rendere più veloci…', ['i salti condizionati', 'le chiamate di procedura', 'le operazioni in virgola mobile', 'gli accessi al disco', 'le interruzioni'], 1, 'Passaggio dei parametri senza copie.', 'ap:161'],
      ['Quale caratteristica NON è tipica del RISC?', ['Formato fisso delle istruzioni', 'Pochi modi di indirizzamento', 'Controllo microprogrammato complesso', 'Molti registri', 'Un\'istruzione per ciclo'], 2, 'È tipica del CISC.', 'ap:165'],
      ['Secondo gli studi sui programmi, quale operazione consuma più tempo?', ['L\'assegnamento', 'La chiamata di procedura', 'Il salto incondizionato', 'La moltiplicazione', 'L\'I/O'], 1, 'Per questo il RISC le ottimizza con i registri.', 'ap:159'],
    ],
    open: [
      ['confronto', 'Spiegare perché è difficile confrontare con precisione le prestazioni delle architetture CISC e RISC.', ['Non esistono due macchine confrontabili per costo, tecnologia e complessità', 'Qualità diversa di compilatori e sistemi operativi', 'Manca un insieme condiviso di programmi di prova', 'Difficile separare l\'effetto dell\'hardware da quello del compilatore', 'Molti confronti su macchine sperimentali, non commerciali', 'Convergenza: i RISC si arricchiscono, i CISC adottano tecniche RISC'], 'ec:es6'],
      ['risc', 'Descrivere le caratteristiche principali di un\'architettura RISC e le motivazioni che l\'hanno originata.', ['Analisi dei programmi: assegnamenti, condizionali, operandi scalari locali, chiamate costose', 'Molti registri o registri ottimizzati dal compilatore', 'Finestre di registri sovrapposte', 'Set di istruzioni ridotto, un\'istruzione per ciclo', 'Operazioni registro-registro, solo LOAD/STORE in memoria', 'Pochi modi di indirizzamento e formato fisso', 'Pipeline efficiente'], 'ap:158-165'],
    ],
  });

  course.define('multicore', {
    src: L('Lez. 14 «Multicore»'),
    intro: 'Argomento breve di chiusura del corso.',
    sections: [
      { title: 'Perché i multicore', src: 'ap:197', html:
        '<p>Le prestazioni sono cresciute con pipeline, superscalari (più istruzioni avviate nello stesso ciclo) e multithreading. Ma più complessità significa logica più difficile da progettare e verificare, più area, e soprattutto <strong>potenza</strong>: cresce con la densità del chip e con la frequenza di clock.</p>' +
        '<p><strong>Regola di Pollack</strong>: le prestazioni crescono circa come la radice quadrata dell\'aumento di complessità; raddoppiare la complessità di un core rende circa il 40% in più. Più core semplici possono invece dare un miglioramento quasi lineare.</p>' },
      { title: 'I limiti del software', src: 'ap:197', html:
        '<p>Il guadagno dipende da quanto codice è davvero parallelo: con il <strong>10% di codice seriale</strong>, 8 processori danno un incremento di sole <strong>4,7 volte</strong>. Si aggiungono i costi di comunicazione, distribuzione del lavoro e coerenza delle cache.</p>' },
      { title: 'Organizzazione delle cache', src: 'ap:198', html:
        '<p>Varianti: cache L1 dedicata a ogni core; L2 dedicata; <strong>L2 condivisa</strong>; L3 condivisa.</p><p>Vantaggi della cache condivisa: meno miss totali; i dati condivisi non sono duplicati; lo spazio si ripartisce dinamicamente tra i core (i thread con meno località ne usano di più); comunicazione tra processi più facile; il problema della coerenza resta confinato a L1. Le L2 dedicate danno però accessi più rapidi e vanno meglio per thread con forte località.</p>' },
    ],
    cards: [
      ['perche', 'multicore', 'Perché si è passati a più core invece di core sempre più complessi?', 'Aumentare la complessità di un singolo core rende poco (regola di Pollack) e fa crescere molto la potenza dissipata, oltre a rendere il progetto più difficile. Più core semplici possono dare un miglioramento quasi lineare.', 'ap:197'],
      ['pollack', 'multicore', 'Cosa dice la regola di Pollack?', 'Le prestazioni di un core sono circa proporzionali alla radice quadrata dell\'aumento di complessità: raddoppiare la complessità dà circa il 40% in più.', 'ap:197'],
      ['seriale', 'multicore', 'Con il 10% di codice seriale, quanto si guadagna su 8 processori?', 'Circa 4,7 volte, non 8: anche poco codice seriale limita molto il guadagno.', 'ap:197', 'A quale valore tende il guadagno se i processori diventano moltissimi?'],
      ['overhead', 'multicore', 'Quali costi aggiuntivi limitano il guadagno di un multicore?', 'Comunicazione tra core, distribuzione del lavoro, mantenimento della coerenza delle cache.', 'ap:197'],
      ['cache', 'multicore', 'Quali sono le alternative di organizzazione delle cache in un multicore?', 'L1 dedicata per core; L2 dedicata per core; L2 condivisa tra i core; L3 condivisa (con L1 e L2 dedicate).', 'ap:198'],
      ['condivisa', 'multicore', 'Vantaggi di una cache L2 condivisa rispetto a L2 dedicate.', 'Meno miss totali; dati condivisi non duplicati; spazio assegnato dinamicamente ai core; comunicazione tra processi facilitata; coerenza delle cache confinata a L1. Le dedicate sono però più rapide e migliori con forte località.', 'ap:198'],
      ['superscalare', 'multicore', 'Cos\'è un processore superscalare?', 'Un processore con più unità per stadio, capace di avviare più istruzioni nello stesso ciclo di clock e di superare il ritmo di un\'istruzione per ciclo.', 'ap:197'],
    ],
    mcq: [
      ['Secondo la regola di Pollack, raddoppiando la complessità di un core le prestazioni aumentano di circa…', ['10%', '40%', '100%', '200%', '0%'], 1, 'Radice di 2 ≈ 1,4.', 'ap:197'],
      ['Con il 10% di codice seriale e 8 processori, l\'incremento di prestazioni è circa…', ['8 volte', '7,2 volte', '4,7 volte', '2 volte', '10 volte'], 2, '1 / (0,1 + 0,9/8) ≈ 4,7.', 'ap:197'],
      ['Quale NON è un vantaggio della cache L2 condivisa?', ['Meno miss totali', 'Dati condivisi non duplicati', 'Accesso più rapido rispetto a una L2 dedicata', 'Allocazione dinamica dello spazio', 'Coerenza confinata a L1'], 2, 'L\'accesso più rapido è il vantaggio delle L2 dedicate.', 'ap:198'],
      ['Cosa cresce con la densità del chip e la frequenza di clock, limitando i core singoli?', ['La cache', 'La potenza dissipata', 'Il numero di registri', 'La latenza del disco', 'La lunghezza delle istruzioni'], 1, 'Problema di potenza e calore.', 'ap:197'],
    ],
    open: [
      ['multicore', 'Discutere le motivazioni dei processori multicore e le alternative di organizzazione delle cache.', ['Limiti dei core singoli: complessità, area, potenza', 'Regola di Pollack', 'Miglioramento quasi lineare con più core', 'Limite del codice seriale (esempio 10% → 4,7× con 8 processori)', 'Overhead di comunicazione e coerenza delle cache', 'Cache L1/L2 dedicate, L2 o L3 condivise', 'Vantaggi della cache condivisa e quando conviene la dedicata'], 'ap:197-198'],
    ],
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
