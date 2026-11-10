# Assunzioni

Tutto ciò che ho assunto senza una conferma esplicita nel materiale. Se una è sbagliata, dimmelo: cambia contenuti o codice.

| # | Assunzione | Da dove viene | Rischio |
|---|---|---|---|
| A1 | Il primo compitino 2026 ha il formato del 19/11/2025: Moodle, 90 minuti, 8 domande, 32 punti (3 a scelta multipla da circa 2,67; 4 aperte da 4; 1 esercizio cache da 8) | I due turni del 2025; hai confermato "uguale, stesso professore" | Basso |
| A2 | I pesi degli argomenti nel piano (cache 3; memorie interne e dischi 2; componenti 1,5; gli altri 1. Seconda parte: pipeline 3; IEEE 754 2; aritmetica e indirizzamento 1,5; gli altri 1) | Stima mia su due prove e un esempio | Medio |
| A3 | Parola più grande di un byte: bit di byte = log₂(byte per parola), bit di parola = log₂(parole per blocco). Con blocco 8B e parola 2B: parola 2 bit, byte 1 bit | Esercizio 8bis di «AdE semplice», pag. 91 | Medio: il commento del docente sul compitino 2025 dice "parola 1 bit, byte 2 bit" per quel caso, cioè l'inverso. La somma è la stessa; se all'esame capita, scrivi anche come hai ragionato |
| A4 | Al rimpiazzo di una linea sporca il sito accetta sia l'intero blocco sia i soli byte cambiati | Le fonti usano tutte e due le forme | Basso |
| A5 | Tra più linee libere di un set si usa quella di indice minore | Esercizi cache 1-4, pag. 4 | Basso |
| A6 | Un miss in scrittura è sempre gestito con write allocate | Tutti gli esercizi del corso | Basso |
| A7 | Con associazione diretta la politica di rimpiazzo indicata nel testo non ha effetto | Logica; coincide con la correzione del docente | Basso |
| A8 | Disco, settori contigui su un cilindro: il tempo di trasferimento si divide per il numero di facce. Dati su una stessa traccia: non si divide | Esercizi svolti in «AdE semplice», pag. 88 e 94; con questa regola il compitino 2025 turno I dà 32GB, coerente con Moodle | Basso. Resta inspiegato l'altro turno 2025: con i numeri che leggo nessuna opzione torna (probabile variante Moodle difettosa o mia lettura errata dell'immagine) |
| A9 | Niente studio dopo le 18; il piano propone circa 2-3 ore di blocchi al giorno, il resto è libero | Tua indicazione | Basso |
| A10 | Il sito cita slide del docente e appunti «AdE semplice» per titolo e pagina, e non pubblica alcun PDF | Tue indicazioni, lette così | Medio: se non vuoi citazioni degli appunti, le tolgo |
| A11 | La soluzione dell'Esercizio cache 4 è un'immagine: il test relativo è derivato dalle regole della stessa slide | Esercizi cache 1-4, pag. 4-6 | Basso |
| A12 | Il secondo compitino ha la struttura dell'esempio 2025/26 (3 scelta multipla, 4 aperte, 1 esercizio pipeline) e, come il primo, 90 minuti e 32 punti con gli stessi pesi | La struttura viene dall'esempio; durata e punti **non** sono scritti nell'esempio | Medio |
| A13 | Pipeline: operandi necessari all'ingresso di EX (anche per SW e BEQ); senza forwarding l'ultimo ciclo di ID coincide con il WB di chi produce il dato; con forwarding uno stallo solo dopo una LW usata subito; salti non presi senza penalità | Soluzioni dell'esempio di compitino (es3 ed es8), riprodotte dai test | Basso per esercizi come quelli dell'esempio; i salti presi non sono modellati |
| A14 | Negli esercizi di simulazione Hamming, disco, IEEE 754 e cicli risparmiati si scrive il risultato invece di scegliere tra opzioni | Scelta mia: è più difficile e non permette di andare per esclusione | Basso |
| A15 | Seconda parte e gestione dell'I/O, RAID e CD-ROM: contenuti dagli appunti «AdE semplice», perché non ci sono slide del docente | Tua indicazione | Medio: gli appunti dichiarano di non garantire la correttezza |
| A16 | La griglia della domanda "perché è difficile confrontare RISC e CISC" viene dal libro di testo (Stallings, cap. 15), non dagli appunti | La domanda è nell'esempio di compitino; non ho trovato la risposta negli appunti | Medio: verifica sulle slide quando le avrai |
| A17 | Il ripasso propone solo le carte degli argomenti già aperti (pre-test fatto) | Scelta mia: partendo da zero, 100 carte nuove tutte insieme non servono | Basso |
