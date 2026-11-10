# AdE Studio

Sistema di studio personale per l'esame di Architettura degli Elaboratori (Informatica, Padova). Sito statico più comandi di chat che condividono lo stesso stato.

## Le due parti
Il corso è diviso in due parti che non si mescolano mai: argomenti, ripasso, esercizi, errori, piano, simulazione e progressi riguardano sempre **un solo compitino alla volta**.
- **Fase 1, primo compitino** (18 novembre 2026): concetti base, notazione, componenti e interruzioni, bus, QPI, gerarchie e cache, memorie interne e Hamming, dischi/RAID/CD-ROM, SSD, gestione I/O.
- **Fase 2, secondo compitino** (data da definire): aritmetica, IEEE 754, linguaggio macchina, indirizzamento, processore, pipeline, RISC/CISC, RISC-V, multicore.

La fase corrente è `settings.phase` nello stato (selettore in alto nel sito, `node tools/ade.js fase [1|2]` in chat). Ogni argomento ha `phase` in `js/data/course.js`; le dipendenze non attraversano le parti (c'è un test).

## Regole
- **Lingua**: italiano, tono diretto. Lo studente parte da zero.
- **Fonte**: ogni carta, spiegazione ed esercizio cita la fonte e la pagina (campo `src`). Ordine di priorità: slide del docente; dove mancano o sono ambigue, gli appunti «AdE semplice (per davvero)» (scelta esplicita dello studente); per il formato, i compitini. Il materiale è nella repo `ak-quarantasette/WEBbox` (radice). Non pubblicare i PDF nel sito.
- **Se materiale e codice discordano, vince il materiale**: aggiungi il caso a `tests/`, correggi, avvisa.
- **Nessuna supposizione silenziosa**: ogni assunzione va in `ASSUNZIONI.md`, ogni lacuna in `GAPS.md`.
- **Didattica**: prima la domanda, poi la risposta. Chiedi sempre la sicurezza (1-5) prima di correggere. Feedback sul passaggio sbagliato, non solo la soluzione. Niente "stili di apprendimento". Vedi `METODO.md`.
- **Tecnica**: HTML/CSS/JS puro, nessuna dipendenza, nessun CDN, nessun modulo ES (deve aprirsi da `file://`). Ogni script si aggancia a `globalThis.ADE`.

## Struttura
- `index.html`, `css/style.css`: guscio del sito.
- `js/core/`: logica pura. `scheduler.js` (SM-2), `state.js` (stato, coda, calibrazione, errori, simulazioni), `plan.js` (piano a ritroso).
- `js/gen/`: generatori con correzione passo-passo. Parte 1: `cache.js`, `hamming.js`, `disco.js` (tempi, byte e settori, scheduling), `basi.js`. Parte 2: `aritmetica.js` (complemento a 2, IEEE 754, formato ridotto), `pipeline.js` (diagrammi, forwarding, prestazioni). `registry.js` li espone con un'interfaccia unica (`ADE.exercises`).
- `js/data/`: contenuti. `course.js` (fasi, argomenti, `course.define`). Parte 1: `intro.js`, `cache.js`, `memorie.js`, `esterne.js`. Parte 2: `fase2.js`. `integrazioni.js` aggiunge a entrambe le parti ciò che è emerso dal confronto con le slide complete del docente (`course.extend`).
- `js/ui/`: `app.js` (viste), `diagrams.js` (SVG).
- `tests/`: `npm test`. Ogni generatore ha test, compresi i casi con soluzione ufficiale.
- `tools/ade.js`: riga di comando per i comandi di chat.
- `progress/state.json`: stato dello studio, stesso formato dell'export del sito.

## Stato condiviso
Il sito salva in localStorage (chiave `ade-state-v1`); i comandi leggono e scrivono `progress/state.json` solo tramite `node tools/ade.js`. Non modificare il JSON a mano. Il passaggio tra i due è manuale: Dati → Esporta/Importa. A fine sessione di chat ricorda allo studente di importare il file nel sito, e fai commit di `progress/state.json`.

Comandi di `tools/ade.js`: `fase [1|2]`, `data <1|2> <YYYY-MM-DD>`, `stato`, `scadenze [arg]`, `argomento <id>`, `esercizi`, `genera <tipo> [seme]`, `voto <carta> <1|3|4|5> <conf>`, `esercizio <id> <0-1> <conf>`, `pretest <arg> <0-1>`, `errore <arg> <rif> <concetto|calcolo|distrazione> [nota]`, `riprova <idErrore> <1|0>`, `piano`. `ADE_FASE=2` forza la fase per un singolo comando.

## Aggiungere o cambiare un argomento
1. Leggi la fonte per intero. 2. Scrivi i contenuti con `course.define(id, {...})` (sezioni, carte con `sub`, scelta multipla: le prime 4 fanno da pre-test, domande aperte con griglia di almeno 5 punti). 3. Se è un file nuovo aggiungilo a `index.html` e `tests/helper.js`. 4. Se ha un procedimento, scrivi il generatore in `js/gen/`, registralo in `registry.js`, e testalo contro un esercizio risolto del corso. 5. `npm test`, apri il sito e prova la pagina, controlla 5 carte contro la fonte.
