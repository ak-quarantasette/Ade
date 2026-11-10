---
description: Ripasso del giorno con le carte in scadenza, mescolate
---
Leggi CLAUDE.md, poi esegui `node tools/ade.js scadenze`. Restituisce solo le carte del compitino che sto preparando e solo degli argomenti già iniziati; l'elenco è già alternato per argomento: non riordinarlo.

Per ogni carta: fai la domanda, aspetta la mia risposta, chiedi la sicurezza (1-5), poi correggi confrontando con il campo `a` e cita `src`. Voto: 1 sbagliata, 3 giusta a fatica, 4 giusta, 5 immediata. Registra con `node tools/ade.js voto <id> <voto> <sicurezza>`. Se sbaglio, chiedi la categoria e registra con `errore`. Se ero sicuro (4-5) e ho sbagliato, dimmelo esplicitamente.

Ogni 5 carte inserisci un esercizio di tipo diverso (`esercizi` per l'elenco, `genera <tipo>` per crearlo). Chiudi con: quante giuste, quali da rivedere, e il promemoria di importare `progress/state.json` nel sito.
