# Lacune

Cosa manca nel materiale o nel sito, aggiornato al 10 novembre 2026.

## Prima parte: fonti usate
| Argomento | Fonte | Esercizi generati |
|---|---|---|
| Concetti base ed evoluzione | Slide «Introduzione», «Evoluzione dei calcolatori» 1-2 | – |
| Notazione e Boole | Slide «Notazione binaria, ottale, esadecimale. Algebra di Boole» | conversioni |
| Componenti e interruzioni | Slide «Componenti e connessioni» 1-2 | – |
| Bus | Slide «Bus» | – |
| QPI | Slide «QPI» | – |
| Gerarchie e cache | Slide «Gerarchie di memoria» 1, 1b, 2; esercizi cache 1-5 | campi, traccia |
| Memorie interne e Hamming | Slide «Memoria centrale a semiconduttore» | Hamming |
| Dischi, RAID, CD-ROM | Slide «Memoria esterna» per i dischi; **appunti** per RAID e CD-ROM | disco |
| SSD | Slide «Dischi SSD» | – |
| Gestione I/O | **Solo appunti** (pag. 80-86) | – |

## Seconda parte: fonti usate
Nessuna slide del docente nella repo: tutti gli otto argomenti vengono dagli appunti «AdE semplice» (pag. 96-198) e dall'esempio ufficiale di compitino 2025/26. Esercizi generati: complemento a 2, IEEE 754, cicli risparmiati con il forwarding, evoluzione della pipeline.

## Cosa manca nel materiale
- **Slide del docente** su: gestione dell'I/O, RAID, CD-ROM, e tutta la seconda parte. Quando le carichi, `/aggiorna-materiale` le rende la fonte principale.
- **Compitini veri della seconda parte**: c'è solo un esempio, senza punteggi.
- **Soluzione dell'altro turno 2025** per la domanda sul disco (ASSUNZIONI A8).

## Punti non coperti o coperti poco
- Algebra di Boole e reti logiche: solo le operazioni di base; i "contenuti integrativi" su circuiti e microprogrammazione non sono trattati.
- Moltiplicazione (Booth) e divisione binaria: spiegate, senza esercizio generato.
- Pipeline: salti presi, predizione e salto ritardato sono solo teoria (carte e domande aperte), non entrano nell'esercizio.
- Architettura MIPS-32 in dettaglio (datapath, segnali di controllo): solo ciò che serve per stalli e forwarding.
- Dubbio aperto: campi parola/byte quando la parola è più grande di un byte (ASSUNZIONI A3).

## Limiti del sito
- Sito e comandi di chat si sincronizzano solo con export/import manuale del JSON.
- Flashcard e domande aperte sono autovalutate; nel simulatore le aperte si correggono con la griglia.
- Le carte sono state confrontate con la fonte mentre le scrivevo, non una seconda volta a campione da una persona: se una ti sembra sbagliata rispetto alle slide, vince la slide e va segnalata.
