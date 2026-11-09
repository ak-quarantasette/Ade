# Assunzioni

Tutto ciò che ho assunto senza una conferma esplicita nel materiale. Se una è sbagliata, dimmelo: cambia contenuti o codice.

| # | Assunzione | Da dove viene | Rischio |
|---|---|---|---|
| A1 | Il primo compitino 2026 ha il formato del 19/11/2025: Moodle, 90 minuti, 8 domande, 32 punti (3 a scelta multipla da circa 2,67; 4 aperte da 4; 1 esercizio cache da 8) | I due turni del 2025; hai confermato "uguale, stesso professore" | Basso |
| A2 | I pesi degli argomenti nel piano (cache 3; memorie interne e dischi 2; componenti 1,5; gli altri 1) riflettono quel formato | Stima mia sui due turni | Medio: due prove sono poche |
| A3 | Nei generatori la parola è sempre di 1 byte, quindi i campi sono tag / set (o linea) / parola. Nel compitino 2025 la parola era di 2 byte e il docente ha voluto i campi "tag 8, linea 1, parola 1, byte 2" | Esercizi cache 1-5; commento del docente sul compitino | **Alto**: con blocco 8B e parola 2B mi aspetterei parola 2 bit e byte 1 bit, non il contrario. Finché non è chiarito, il generatore evita il caso. Chiedilo al docente o a un tutor |
| A4 | Al rimpiazzo di una linea sporca il sito accetta sia l'intero blocco (soluzione dell'Esercizio 5: M[11E]=90, M[11F]=AE) sia i soli byte cambiati (correzione del compitino: M[103]=04, M[105]=FF) | Le due fonti usano forme diverse | Basso |
| A5 | Tra più linee libere di un set si usa quella di indice minore | Esercizi cache 1-4, pag. 4 ("scelta arbitraria") | Basso |
| A6 | Un miss in scrittura è sempre gestito con write allocate | Tutti gli esercizi del corso | Basso |
| A7 | Con associazione diretta e "politica FIFO" (testo del compitino) la politica non ha effetto | Logica: la linea è unica; coincide con la correzione del docente | Basso |
| A8 | Domanda sul disco: per settori contigui su un cilindro il tempo di trasferimento si divide per il numero di facce. Con questa convenzione il turno svolto dà 32GB, senza dà 128GB; Moodle ha segnato errata "nessuna delle altre" | Formulario di uno studente più l'esito di Moodle | **Alto**: nell'altro turno nessuna delle due convenzioni dà una delle opzioni. Il generatore sui dischi (stadio 3) partirà dalle slide «Memorie esterne» e questo punto resterà segnalato |
| A9 | Niente studio dopo le 18; fino a circa 3 ore di blocchi pianificati al giorno, il resto libero | Tua indicazione | Basso |
| A10 | Il sito cita le dispense del docente per titolo e pagina; non cita gli appunti di altri studenti e non pubblica alcun PDF | Tua richiesta ("non citare i PDF"), letta così | Medio: se intendevi nessuna citazione, le tolgo |
| A11 | La soluzione dell'Esercizio cache 4 nelle slide è un'immagine non leggibile come testo; il test relativo è derivato dalle regole enunciate nella stessa slide | Esercizi cache 1-4, pag. 4-6 | Basso |
