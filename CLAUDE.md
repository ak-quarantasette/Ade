# AdE Studio

Sistema di studio personale per l'esame di Architettura degli Elaboratori (Informatica, Padova). Sito statico più comandi di chat che condividono lo stesso stato.

## Regole
- **Lingua**: italiano, tono diretto. Lo studente parte da zero.
- **Fonte**: ogni carta, spiegazione ed esercizio cita dispensa del docente e pagina (campo `src`). Il materiale è nella repo `ak-quarantasette/WEBbox` (radice). Non citare né pubblicare gli appunti di altri studenti, non pubblicare i PDF.
- **Se materiale e codice discordano, vince il materiale**: aggiungi il caso a `tests/`, correggi, avvisa.
- **Nessuna supposizione silenziosa**: ogni assunzione va in `ASSUNZIONI.md`, ogni lacuna in `GAPS.md`.
- **Didattica**: prima la domanda, poi la risposta. Chiedi sempre la sicurezza (1-5) prima di correggere. Feedback sul passaggio sbagliato, non solo la soluzione. Niente "stili di apprendimento". Vedi `METODO.md`.
- **Tecnica**: HTML/CSS/JS puro, nessuna dipendenza, nessun CDN, nessun modulo ES (deve aprirsi da `file://`). Ogni script si aggancia a `globalThis.ADE`.

## Struttura
- `index.html`, `css/style.css`: guscio del sito.
- `js/core/`: logica pura. `scheduler.js` (SM-2), `state.js` (stato, coda, calibrazione, errori), `plan.js` (piano a ritroso).
- `js/gen/`: generatori di esercizi con correzione passo-passo (`cache.js`).
- `js/data/`: contenuti. `course.js` (mappa argomenti), un file per argomento (`cache.js`).
- `js/ui/`: `app.js` (viste), `diagrams.js` (SVG).
- `tests/`: `npm test`. Ogni generatore ha test, compresi i casi con soluzione ufficiale.
- `tools/ade.js`: riga di comando per i comandi di chat.
- `progress/state.json`: stato dello studio, stesso formato dell'export del sito.

## Stato condiviso
Il sito salva in localStorage (chiave `ade-state-v1`); i comandi leggono e scrivono `progress/state.json` solo tramite `node tools/ade.js`. Non modificare il JSON a mano. Il passaggio tra i due è manuale: Dati → Esporta/Importa. A fine sessione di chat ricorda allo studente di importare il file nel sito, e fai commit di `progress/state.json`.

Comandi di `tools/ade.js`: `stato`, `scadenze [arg]`, `argomento <id>`, `voto <carta> <1|3|4|5> <conf>`, `esercizio <id> <0-1> <conf>`, `pretest <arg> <0-1>`, `errore <arg> <rif> <concetto|calcolo|distrazione> [nota]`, `riprova <idErrore> <1|0>`, `piano`, `genera <traccia|campi> [seme]`.

## Aggiungere un argomento
1. Leggi le dispense per intero. 2. Crea `js/data/<id>.js` sul modello di `cache.js` (pagina, carte con `src` e `sub`, pre-test, domande aperte con griglia). 3. Aggiungilo a `index.html` e `tests/helper.js`, metti `ready: true` in `course.js`. 4. Se ha un procedimento, scrivi il generatore in `js/gen/` con test contro un esercizio risolto del corso. 5. `npm test`, apri il sito e prova la pagina, controlla 5 carte contro la fonte.

## Fasi
Fase 1: primo compitino, 18 novembre 2026. Fase 2: secondo compitino, data da definire. Stato dei lavori in fondo a `GAPS.md`.
