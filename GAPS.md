# Lacune

Cosa manca nel materiale o nel sito, aggiornato al 10 novembre 2026, dopo il confronto con le slide complete del docente (a.a. 2025/26).

## Materiale presente (repo WEBbox)
- **Lezioni**: 2 Notazione, 3 Componenti e connessioni (con bus e QPI), 4 Gerarchie di memoria, 5 Memorie interne, 6 Memorie esterne (con RAID, SSD, ottica), 7 Input/Output, 8 Aritmetica, 9 Linguaggio macchina, 10 Struttura e funzione della CPU, 11 Pipeline, 12 Filosofia RISC, 13 RISC-V, 14 Multicore; più le dispense della prima parte già usate.
- **Raccolte di esercizi**: 1 rappresentazione binaria/ottale/esadecimale, 2 e 3 cache, 4 codici di correzione, 5 dischi magnetici, 6 virgola mobile, 7 pipeline RISC-V, 8 pipeline con data forwarding e tabella delle condizioni; esercizi cache 5 (con soluzione) e 6 (parola di 4 byte, senza soluzione).
- **Prove**: due turni del primo compitino 2025, esempio del secondo compitino 2025/26.
- I laboratori non ci sono, per tua indicazione (non erano in esame).

## Esito del confronto
**Coincideva già**: procedimenti di cache, Hamming, tempi del disco (anche la divisione per le facce sul cilindro), complemento a 2, IEEE 754, pipeline con e senza forwarding, griglia RISC contro CISC, tre tecniche di I/O. I test ora riproducono 11 esercizi risolti del docente.

**Integrato perché mancava**:
- Prima parte: arbitro del bus; algoritmi FCFS / Shortest Seek First / ascensore con esercizio; esercizio "quanti byte e quanti settori"; memoria virtuale (intuizione), settori da 4K, DVD, nastro; configurazioni DMA, evoluzione dell'I/O, canali di I/O; quanti bit di controllo per M bit (esercizio); scrittura di parole da 4 byte nell'esercizio di cache.
- Seconda parte: virgola mobile in formato ridotto (esercizio); tempo di ciclo e speedup della pipeline (esercizio); dipendenze RAW/WAW/WAR; sbilanciamento e problemi strutturali; riordino delle istruzioni; nuovo argomento **RISC-V** (formati delle istruzioni, stadi).

**Corretto perché le slide dicono altro**: la tabella dei RAID (il livello 3 usa un bit di parità con dischi sincronizzati, non lo striping a byte; i livelli 2 e 4 non sono commercializzati; il RAID 6 richiede N+2 dischi e perde i dati solo con tre guasti).

## Cosa resta fuori
- **Datapath e segnali di controllo RISC-V/MIPS in dettaglio** (schemi dei multiplexer, unità di controllo): nel sito c'è cosa fa ogni stadio e le condizioni di forwarding e stallo, non gli schemi circuitali.
- **Formato dei settori del CD-ROM** (modi 0, 1, 2) e formato del disco Winchester: non trattati.
- **Tipi di dato e modi di indirizzamento x86, formati PDP-8/PDP-10/VAX**: solo citati.
- **Predizione dei salti, salti presi, salto ritardato**: carte e domande aperte, non entrano nell'esercizio di pipeline.
- **Intel 80486 e Core i7** (esempi di pipeline e di multicore): non trattati.
- **Moltiplicazione (Booth) e divisione binaria**: spiegate, senza esercizio.
- **Analisi delle dipendenze in un sorgente C** (esercizi 1 e 2 sulla pipeline) e **riordino** come esercizio: solo teoria.
- Lezioni 4, 5, 8, 9, 10, 12 e 14: ho confrontato l'indice delle slide e alcune pagine chiave, non ogni slide riga per riga.
- Soluzione dell'altro turno 2025 per la domanda sul disco (ASSUNZIONI A8) e campi parola/byte con parola da 2 byte (A3).

## Limiti del sito
- Sito e comandi di chat si sincronizzano solo con export/import manuale del JSON.
- Flashcard e domande aperte sono autovalutate; nel simulatore le aperte si correggono con la griglia.
- Per la seconda parte le citazioni indicano la lezione per titolo e la pagina degli appunti, non il numero della slide.
