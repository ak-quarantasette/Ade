# AdE Studio

Sistema di studio per Architettura degli Elaboratori: richiamo attivo, ripetizione distanziata, esercizi generati con correzione passo-passo, simulazione d'esame a tempo. Sito statico, nessuna dipendenza, funziona offline.

## Due parti separate
In alto c'è il selettore **Primo compitino / Secondo compitino**. Tutto ciò che vedi (argomenti, ripasso, esercizi, errori, piano, simulazione, progressi) riguarda solo la parte selezionata.

| | Primo compitino | Secondo compitino |
|---|---|---|
| Argomenti | concetti base, notazione, componenti e interruzioni, bus, QPI, cache, memorie interne e Hamming, dischi/RAID/CD-ROM, SSD, gestione I/O | aritmetica, IEEE 754, linguaggio macchina, indirizzamento, processore, pipeline, RISC/CISC, multicore |
| Esercizi generati | campi dell'indirizzo, traccia della cache, Hamming, disco, conversioni | complemento a 2, IEEE 754, cicli risparmiati, pipeline con forwarding |
| Data | 18 novembre 2026 | da impostare in Dati |

## Aprire il sito
- **In locale**: apri `index.html` con un doppio clic. Non serve un server.
- **GitHub Pages**: Settings → Pages → Source "Deploy from a branch" → scegli il branch e la cartella `/ (root)`.

I progressi restano nel browser (localStorage). Browser o dispositivi diversi hanno progressi separati: usa **Dati → Esporta/Importa JSON** per spostarli e per il backup.

## Come si usa
1. **Oggi**: cosa fare, in ordine.
2. **Argomenti → un argomento**: pre-test, spiegazione, poi pratica. Le carte di un argomento entrano nel ripasso dopo che l'hai aperto.
3. **Ripasso**: le carte in scadenza, mescolate. Tasti `1`-`5` per la sicurezza, poi `1`-`4` per il voto.
4. **Esercizi**: numeri sempre diversi, correzione che indica il passaggio sbagliato. Per la cache: svolto → guidato → libero.
5. **Errori**: ciò che hai sbagliato torna finché non lo risolvi due volte.
6. **Simulazione**: 90 minuti, 32 punti, nel formato del compitino.

## Comandi in chat (Claude Code)
`/studia [argomento]`, `/ripasso`, `/quiz [argomento|misto] [n]`, `/errori`, `/simula-esame`, `/piano`, `/aggiorna-materiale`. Usano `progress/state.json`: prima di una sessione in chat esporta dal sito e salva lì il file; dopo, reimportalo.

## Test
```bash
npm test
```
Richiede solo Node 18 o superiore. I test verificano scheduler, stato, piano, completezza dei contenuti, e che i generatori riproducano le soluzioni del corso: esercizi cache 1-5, domande 2, 3 e 8 del primo compitino 2025, esercizi 2, 3 e 8 dell'esempio di secondo compitino, più 300 esercizi casuali per ogni generatore.

## Documenti
`METODO.md` (tecniche di studio e limiti), `ASSUNZIONI.md` (cosa è stato assunto), `GAPS.md` (cosa manca), `CLAUDE.md` (regole del progetto).
