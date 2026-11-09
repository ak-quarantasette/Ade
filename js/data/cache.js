// Contenuti dell'argomento "Gerarchie di memoria e cache".
// Ogni elemento riporta la fonte nelle slide del corso (titolo della dispensa e pagina).
(function (root) {
  const ADE = (root.ADE = root.ADE || {});
  const course = ADE.course;

  const G1 = 'Slide «Gerarchie di memoria» parte 1, pag. ';
  const G2 = 'Slide «Gerarchie di memoria» parte 2, pag. ';
  const ES = 'Slide «Esercizi cache 1-4», pag. ';
  const E5 = '«Esercizio cache 5» con soluzione, pag. ';

  // ---------- Pagina dell'argomento ----------
  course.pages.cache = {
    intro: 'Vale circa un quarto del compitino: un esercizio da 8 punti su 32, più quasi sempre una domanda aperta.',
    sections: [
      { title: 'Perché una gerarchia', src: G1 + '1-4', diagram: 'gerarchia', html:
        '<p>Una memoria ampia, veloce ed economica insieme non esiste. Si usano allora più livelli: in alto memorie piccole, veloci e costose (registri, cache), in basso memorie capienti, lente ed economiche (RAM, disco).</p>' +
        '<p>Funziona grazie alla <strong>località dei riferimenti</strong>: <em>spaziale</em> (dopo un indirizzo è probabile accedere a quelli vicini) e <em>temporale</em> (ciò che è stato usato da poco verrà probabilmente riusato). Congettura 90/10: un programma passa circa il 90% del tempo sul 10% delle sue istruzioni.</p>' },
      { title: 'Blocchi, hit, miss e tempo medio', src: G1 + '5-7', html:
        '<p>La memoria è divisa in <strong>blocchi</strong>: il blocco è la quantità minima che si copia dal livello inferiore. Un dato richiesto può essere in cache (<strong>hit</strong>) o no (<strong>miss</strong>); al miss l\'intero blocco viene portato in cache.</p>' +
        '<p class="formula">Ta = Th · Ph + Tm · (1 − Ph)</p>' +
        '<p>Th = tempo di accesso in cache, Tm = tempo medio in caso di miss, Ph = probabilità di hit (deve superare il 90% perché la cache convenga).</p>' },
      { title: 'Dove va un blocco: i tre tipi di associazione', src: G1 + '9-15; ' + G2 + '1-3', diagram: 'mapping', html:
        '<ul><li><strong>Diretta</strong>: ogni blocco ha una sola linea possibile (linea = numero di blocco mod numero di linee). Semplice e veloce, ma blocchi che cadono sulla stessa linea si scacciano a vicenda.</li>' +
        '<li><strong>Completa</strong> (fully associative): un blocco può stare in qualunque linea. Massima efficienza di allocazione, ma cercare il tag in tutte le linee è costoso.</li>' +
        '<li><strong>A gruppi</strong> (N-way set associative): il blocco ha un solo set possibile, ma dentro il set può stare in una qualunque delle N linee. Compromesso tra le due.</li></ul>' +
        '<p>In tutti i casi il <strong>tag</strong> salvato accanto alla linea dice quale blocco la occupa.</p>' },
      { title: 'L\'indirizzo diviso in campi', src: ES + '1-3', diagram: 'campi', html:
        '<p>Procedura fissa, sempre nello stesso ordine:</p><ol>' +
        '<li>bit dell\'indirizzo = log₂(dimensione della memoria);</li>' +
        '<li>bit di <strong>parola</strong> = log₂(dimensione del blocco);</li>' +
        '<li>linee = dimensione cache / dimensione blocco;</li>' +
        '<li>set = linee / vie → bit di <strong>set</strong> = log₂(set). Con associazione diretta le vie sono 1 e il campo si chiama <strong>linea</strong>;</li>' +
        '<li>bit di <strong>tag</strong> = totale − set − parola.</li></ol>' +
        '<p class="nota">Se la parola è più grande di un byte, il docente vuole anche il campo <strong>byte</strong> separato dal campo parola (correzione del compitino 2025). Vedi ASSUNZIONI, A3.</p>' },
      { title: 'Quale blocco togliere: politiche di rimpiazzo', src: G2 + '4', html:
        '<ul><li><strong>Casuale</strong>: occupazione omogenea.</li><li><strong>FIFO</strong>: esce il blocco in cache da più tempo.</li>' +
        '<li><strong>LFU</strong>: esce il blocco con meno accessi.</li><li><strong>LRU</strong>: esce il blocco non usato da più tempo; preserva la località temporale.</li></ul>' +
        '<p>Con associazione diretta non c\'è scelta: la linea è una sola.</p>' },
      { title: 'Il problema della scrittura', src: G2 + '5-7', html:
        '<p>Scrivere in cache rende il blocco diverso dalla copia in memoria.</p><ul>' +
        '<li><strong>Write-through</strong>: si scrive insieme in cache e in memoria. Dati sempre coerenti, ma più traffico se si scrive spesso nello stesso blocco (si attenua con buffer di scrittura).</li>' +
        '<li><strong>Write-back</strong>: si scrive solo in cache e si segna la linea come sporca; la memoria si aggiorna quando la linea viene rimpiazzata. Meno traffico, ma periodi di incoerenza (problemi con I/O e con più processori dotati di cache locale).</li></ul>' +
        '<p><strong>Write allocate</strong>: su un miss in scrittura prima si carica il blocco in cache, poi si scrive.</p>' },
      { title: 'I tre tipi di miss e come ridurli', src: G2 + '7-9', html:
        '<ul><li><strong>Primo accesso</strong>: inevitabile.</li><li><strong>Capacità</strong>: la cache non contiene tutti i blocchi che servono.</li><li><strong>Conflitto</strong>: più blocchi mappati sulla stessa linea o sullo stesso set.</li></ul>' +
        '<p>Rimedi: blocchi più grandi (sfruttano la località spaziale ma aumentano i conflitti), più associatività (ma hit più lento; regola del 2:1), cache multilivello, cache separate per dati e istruzioni, ottimizzazioni del compilatore.</p>' },
    ],
  };

  // ---------- Flashcard ----------
  const c = (id, sub, q, a, src, why) => course.cards.push({ id: 'cache-' + id, topic: 'cache', sub, q, a, src, why });

  c('loc-spaz', 'gerarchia', 'Cosa dice la località spaziale?', 'Gli accessi a indirizzi contigui a quello appena usato sono i più probabili.', G1 + '2', 'Quale scelta di progetto della cache la sfrutta direttamente?');
  c('loc-temp', 'gerarchia', 'Cosa dice la località temporale?', 'La zona di memoria usata più di recente è quella in cui è più probabile restare: ciò che è stato usato da poco verrà riusato.', G1 + '2', 'Quale politica di rimpiazzo è pensata per preservarla?');
  c('9010', 'gerarchia', 'Enuncia la congettura 90/10.', 'Un programma impiega in media il 90% del tempo di esecuzione su circa il 10% delle sue istruzioni.', G1 + '3');
  c('livelli', 'gerarchia', 'In una gerarchia di memoria, come cambiano capacità, velocità e costo scendendo di livello? Che relazione c\'è tra i contenuti dei livelli?', 'Scendendo: più capacità, meno velocità, meno costo. Ogni livello inferiore contiene tutti i dati dei livelli superiori (e altri). La CPU usa direttamente il livello più alto.', G1 + '4');
  c('blocco', 'gerarchia', 'Che cos\'è un blocco in una gerarchia di memoria?', 'La quantità minima indivisibile di dati che si copia dal livello inferiore. L\'indirizzo di un dato = indirizzo del blocco + posizione nel blocco.', G1 + '5');
  c('ta', 'gerarchia', 'Scrivi la formula del tempo medio di accesso e il significato dei termini.', 'Ta = Th·Ph + Tm·(1 − Ph). Th: tempo di accesso a un dato in cache; Tm: tempo medio per un dato non in cache; Ph: probabilità di hit.', G1 + '6', 'Cosa succede a Ta se si aumenta la dimensione del blocco? (Guarda da cosa dipendono Tm e Ph.)');
  c('miss-proc', 'gerarchia', 'Cosa succede, passo per passo, quando la CPU chiede un dato e c\'è un miss?', 'La cache chiede il dato al livello inferiore; il blocco che lo contiene viene copiato in cache; il dato viene fornito alla CPU.', G1 + '7');
  c('diretta', 'mapping', 'Associazione diretta: dove può andare un blocco? Con quale formula?', 'In una sola linea: indirizzo nel livello superiore = indirizzo nel livello inferiore mod N, con N numero di linee.', G1 + '9');
  c('diretta-pc', 'mapping', 'Vantaggi e svantaggi dell\'associazione diretta.', 'Vantaggi: traduzione semplice dell\'indirizzo, hit/miss determinato velocemente. Svantaggi: serve il tag per sapere quale blocco occupa la linea; swap frequenti quando si alternano blocchi che cadono sulla stessa linea.', G1 + '11', 'Costruisci una sequenza di soli due blocchi che dia miss a ogni accesso.');
  c('completa', 'mapping', 'Associazione completa: come funziona, vantaggi e svantaggi.', 'Ogni blocco può andare in qualunque linea; una tabella di N tag dice quale blocco c\'è in ogni linea. Vantaggio: massima efficienza di allocazione. Svantaggio: trovare la corrispondenza e verificare hit/miss è oneroso.', G1 + '11-13');
  c('gruppi', 'mapping', 'Associazione a gruppi a N vie: come funziona?', 'La cache è divisa in set di N linee. Un blocco può andare in un solo set, ma in una qualunque delle sue N linee. Buona efficienza di allocazione con una complessità di ricerca sopportabile.', G1 + '13-15', 'A cosa si riduce se N = 1? E se c\'è un solo set?');
  c('tag', 'mapping', 'A cosa serve il tag?', 'A distinguere quale blocco di memoria occupa in questo momento una linea, dato che più blocchi possono essere mappati sulla stessa linea (o sullo stesso set).', G1 + '11');
  c('campi-ordine', 'procedura', 'In che ordine calcoli i campi di un indirizzo per una cache a gruppi?', '1) bit totali = log₂(memoria). 2) parola = log₂(blocco). 3) linee = cache / blocco. 4) set = linee / vie, bit di set = log₂(set). 5) tag = totale − set − parola.', ES + '1');
  c('campi-es1', 'procedura', 'Cache 4KB, 8 vie, memoria 1MB, blocco 64B, parola di un byte. Campi dell\'indirizzo?', 'Indirizzo 20 bit. Parola 6 bit (64 = 2⁶). Linee 2¹²/2⁶ = 2⁶; set 2⁶/2³ = 2³ → set 3 bit. Tag 20 − 3 − 6 = 11 bit.', ES + '1');
  c('stesso-blocco', 'procedura', 'Se in cache c\'è la locazione 05ABC (blocchi da 64B), quali altre locazioni ci sono sicuramente?', 'Tutte quelle dello stesso blocco: si azzerano e si mettono a 1 i 6 bit di parola → da 05A80 a 05ABF.', ES + '3', 'Perché non si può dire nulla sulle locazioni dei blocchi vicini?');
  c('stesso-set', 'procedura', 'Come verifichi se due indirizzi possono finire nello stesso set?', 'Si scrivono in binario e si confrontano solo i bit del campo set (quelli tra tag e parola): stesso set solo se sono identici.', ES + '3');
  c('rimpiazzo', 'rimpiazzo', 'Elenca le quattro politiche di rimpiazzo e il criterio di ciascuna.', 'Casuale: occupazione omogenea. FIFO: esce il blocco in cache da più tempo. LFU: esce quello con meno accessi. LRU: esce quello non usato da più tempo (preserva la località temporale).', G2 + '4');
  c('fifo-lru', 'rimpiazzo', 'In un set a 2 vie entrano A poi B; poi c\'è un hit su A; poi arriva C. Chi esce con FIFO? E con LRU?', 'FIFO: esce A (caricato per primo; gli hit non contano). LRU: esce B (A è stato appena usato).', G2 + '4', 'Quale delle due scelte rispetta la località temporale, e perché?');
  c('wt', 'scrittura', 'Write-through: cosa fa, pregi e difetti.', 'Scrive contemporaneamente in cache e in memoria. Pregio: livelli sempre coerenti. Difetto: più traffico se si scrive spesso nello stesso blocco; si usano buffer di scrittura asincroni.', G2 + '5');
  c('wb', 'scrittura', 'Write-back: cosa fa, pregi e difetti.', 'Scrive solo in cache e ricorda che il blocco è stato modificato; la memoria è aggiornata al rimpiazzo della linea. Pregio: meno traffico tra i livelli. Difetto: periodi di incoerenza (problemi con moduli di I/O e multiprocessori con cache locale).', G2 + '5', 'In che tipo di carico write-back conviene di più?');
  c('walloc', 'scrittura', 'Cosa significa gestire un miss in scrittura con write allocate?', 'Prima si porta in cache il blocco che contiene la parola da scrivere, poi si esegue la scrittura (in cache, e in memoria secondo la politica di scrittura).', ES + '4');
  c('sporca', 'scrittura', 'Con write-back, in quale momento esatto la memoria viene modificata?', 'Solo quando una linea sporca (modificata) viene rimpiazzata: il suo blocco viene ricopiato in memoria prima di caricare quello nuovo. Se la linea rimpiazzata è pulita, nessuna scrittura.', E5 + '2', 'Cosa resta non aggiornato in memoria se la sequenza finisce con linee ancora sporche?');
  c('multi', 'scrittura', 'Più processori con cache locale e memoria condivisa: perché write-through non basta? Tre soluzioni.', 'Una scrittura invalida la parola anche nelle altre cache, non solo in memoria. Soluzioni: monitoraggio del bus con write-through; trasparenza hardware (la modifica alla memoria aggiorna tutte le cache); memoria condivisa non cacheable.', G2 + '6-7');
  c('miss-tipi', 'miss', 'Quali sono i tre tipi di miss?', 'Di primo accesso (inevitabile); per capacità insufficiente (la cache non contiene tutti i blocchi necessari); per conflitto (più blocchi mappati sullo stesso gruppo).', G2 + '7');
  c('miss-rimedi', 'miss', 'Blocchi più grandi e maggiore associatività riducono i miss: a quale prezzo?', 'Blocchi più grandi: sfruttano la località spaziale ma lasciano meno blocchi in cache, quindi più conflitti. Più associatività: aumenta il tempo per localizzare il dato nel gruppo (hit più lento).', G2 + '8');
  c('2a1', 'miss', 'Enuncia la regola del 2:1.', 'Una cache da N blocchi ad associazione diretta ha circa la stessa probabilità di miss di una cache da N/2 blocchi con associazione a 2 vie.', G2 + '8');
  c('altre', 'miss', 'Oltre a blocco e associatività, quali altre tecniche riducono i miss?', 'Cache multilivello (L1, L2, L3); cache separate per dati e istruzioni; ottimizzazioni del compilatore: posizionamento delle procedure, fusione di vettori in strutture, scambio di cicli annidati.', G2 + '8-9');

  // ---------- Pre-test (prima di studiare: è normale sbagliare) ----------
  course.pretests.cache = [
    { id: 'pre-cache-1', q: 'Una cache ad associazione diretta ha 4 linee e blocchi da 4 byte. In quale linea finisce l\'indirizzo binario 10110?', opts: ['Linea 0', 'Linea 1', 'Linea 2', 'Linea 3'], ok: 1,
      why: 'Gli ultimi 2 bit (10) scelgono la parola nel blocco; i 2 precedenti (01) la linea; il resto (1) è il tag.', src: G2 + '1' },
    { id: 'pre-cache-2', q: 'Con politica write-back, quando viene aggiornata la memoria centrale?', opts: ['A ogni scrittura', 'Quando la linea modificata viene rimpiazzata', 'A ogni miss, anche in lettura', 'Mai: la cache è l\'unica copia valida'], ok: 1,
      why: 'La scrittura è differita al rimpiazzo del blocco corrispondente.', src: G2 + '5' },
    { id: 'pre-cache-3', q: 'Cache da 4KB, blocchi da 64B, 8 vie. Quanti set ci sono?', opts: ['64', '512', '8', '32'], ok: 2,
      why: 'Linee = 4096/64 = 64; set = 64/8 = 8.', src: ES + '1' },
    { id: 'pre-cache-4', q: 'Quale politica di rimpiazzo è pensata per preservare la località temporale?', opts: ['FIFO', 'Casuale', 'LRU', 'LFU'], ok: 2,
      why: 'LRU tiene in cache ciò che è stato usato di recente.', src: G2 + '4' },
  ];

  // ---------- Domande aperte in stile compitino (4 punti l'una) ----------
  course.open.cache = [
    { id: 'open-cache-fifo', q: 'Nel contesto di una gerarchia di memoria, spiegare come funziona la politica di rimpiazzo di blocco FIFO. Discutere criticamente i pro e i contro che emergono nell\'adottarla.', src: G2 + '4; primo compitino 2025, domanda 6',
      points: ['Serve quando, a un miss, non ci sono linee libere dove il blocco può andare', 'FIFO sostituisce il blocco che è in cache da più tempo', 'Pro: semplice da realizzare, basta l\'ordine di caricamento', 'Contro: ignora quanto di recente o quanto spesso il blocco è usato, quindi non tiene conto della località temporale', 'Confronto con almeno un\'alternativa (LRU, LFU, casuale)', 'Con associazione diretta la politica è irrilevante: la linea è una sola'] },
    { id: 'open-cache-wtwb', q: 'Nel contesto di una gerarchia di memoria, spiegare le differenze tra le politiche di scrittura write-through e write-back. In che casi è più efficiente l\'una o l\'altra?', src: G2 + '5-7; primo compitino 2025 (altro turno), domanda 6',
      points: ['Il problema: la scrittura rende incoerenti il blocco in cache e quello in memoria', 'Write-through: scrittura contemporanea in cache e in memoria, dati sempre coerenti', 'Write-through: più traffico con scritture frequenti nello stesso blocco; buffer di scrittura', 'Write-back: scrittura in memoria differita al rimpiazzo; serve ricordare se il blocco è stato modificato', 'Write-back: meno traffico, ma periodi di incoerenza (I/O, multiprocessori con cache locale)', 'Quando conviene: write-back con molte scritture ripetute sugli stessi blocchi; write-through quando serve coerenza o le scritture sono poche'] },
    { id: 'open-cache-assoc', q: 'Descrivere le tre tecniche di associazione tra blocchi di memoria e linee di cache, indicando vantaggi e svantaggi di ciascuna.', src: G1 + '9-15',
      points: ['Diretta: ogni blocco in una sola linea (mod N)', 'Diretta: semplice e veloce, ma swap frequenti per blocchi sulla stessa linea', 'Completa: qualunque linea; massima efficienza di allocazione', 'Completa: ricerca del tag e verifica hit/miss onerose', 'A gruppi: un solo set, qualunque linea del set', 'A gruppi: compromesso tra efficienza di allocazione e complessità di ricerca', 'Ruolo del tag'] },
    { id: 'open-cache-miss', q: 'Classificare i miss di una cache e discutere le tecniche per ridurli, con i relativi costi.', src: G2 + '7-9',
      points: ['Primo accesso, inevitabile', 'Capacità insufficiente', 'Conflitto (associazione diretta o a gruppi)', 'Blocchi più grandi: località spaziale ma più conflitti', 'Maggiore associatività: hit più lento; regola del 2:1', 'Altre tecniche: multilivello, cache dati/istruzioni separate, compilatore'] },
    { id: 'open-cache-loc', q: 'Spiegare il principio di località dei riferimenti e perché rende conveniente una gerarchia di memoria.', src: G1 + '1-6',
      points: ['Non esiste una memoria ampia, veloce ed economica insieme', 'Località spaziale', 'Località temporale', 'Congettura 90/10', 'Livelli: in alto piccolo/veloce/costoso, in basso ampio/lento/economico', 'Il tempo medio di accesso dipende dalla probabilità di hit: Ta = Th·Ph + Tm·(1 − Ph)'] },
  ];

  // ---------- Esempio svolto: Esercizio cache 5, con la soluzione ufficiale ----------
  const row = (base, s) => s.split(' ').map((b, i) => [base + i, parseInt(b, 16)]);
  const memory = Object.fromEntries([
    ...row(0x100, '08 D0 07 02 00 00 00 00 AE 13 A1 23 A1 42 90 75'),
    ...row(0x110, 'BB 16 00 00 0A 87 03 71 3E 13 A1 23 A1 82 90 15'),
    ...row(0x120, 'F9 86 A0 00 E9 16 05 00'),
  ]);
  course.workedTrace = {
    title: 'Esercizio cache 5',
    src: E5 + '1-2',
    params: { cacheBytes: 16, blockBytes: 2, ways: 2, repl: 'LRU', write: 'back' },
    memory,
    accesses: [
      { addr: 0x108, op: 's', data: 0x43 }, { addr: 0x10c, op: 's', data: 0x3f }, { addr: 0x10f, op: 'l' }, { addr: 0x10d, op: 'l' },
      { addr: 0x114, op: 'l' }, { addr: 0x11f, op: 's', data: 0xae }, { addr: 0x107, op: 's', data: 0xcd }, { addr: 0x126, op: 'l' },
    ],
  };

  course.generators.push(
    { id: 'gen:cache-traccia', topic: 'cache', sub: 'traccia', title: 'Evoluzione di cache e memoria', desc: 'L\'esercizio da 8 punti del compitino.', kind: 'ex' },
    { id: 'gen:cache-campi', topic: 'cache', sub: 'campi', title: 'Campi dell\'indirizzo', desc: 'Tag, set e parola da dimensioni di cache, blocco e memoria.', kind: 'ex' }
  );
})(typeof globalThis !== 'undefined' ? globalThis : this);
