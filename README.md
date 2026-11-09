# AdE Studio

Sistema di studio per Architettura degli Elaboratori: richiamo attivo, ripetizione distanziata, esercizi generati con correzione passo-passo. Sito statico, nessuna dipendenza, funziona offline.

## Aprire il sito
- **In locale**: apri `index.html` con un doppio clic. Non serve un server.
- **GitHub Pages**: Settings → Pages → Source "Deploy from a branch" → scegli il branch e la cartella `/ (root)`.

I progressi restano nel browser (localStorage). Browser o dispositivi diversi hanno progressi separati: usa **Dati → Esporta/Importa JSON** per spostarli e per il backup.

## Come si usa
1. **Oggi**: cosa fare, in ordine. 2. **Mappa → argomento**: pre-test, spiegazione, poi pratica. 3. **Ripasso**: le carte in scadenza, mescolate. Tasti `1`-`5` per la sicurezza, poi `1`-`4` per il voto. 4. **Esercizi**: svolto → guidato → libero. 5. **Errori**: ciò che hai sbagliato torna finché non lo risolvi due volte.

## Comandi in chat (Claude Code)
`/studia [argomento]`, `/ripasso`, `/quiz [argomento|misto] [n]`, `/errori`, `/simula-esame`, `/piano`, `/aggiorna-materiale`. Usano `progress/state.json`: prima di una sessione in chat esporta dal sito e salva lì il file; dopo, reimportalo.

## Test
```bash
npm test
```
Richiede solo Node 18 o superiore. I test verificano scheduler, stato, piano, e che il simulatore di cache riproduca le soluzioni del corso (Esercizio cache 5, Esercizi 1-4, domanda 8 del compitino 2025) su 300 esercizi generati.

## Documenti
`METODO.md` (tecniche di studio e limiti), `ASSUNZIONI.md` (cosa è stato assunto), `GAPS.md` (cosa manca), `CLAUDE.md` (regole del progetto).
