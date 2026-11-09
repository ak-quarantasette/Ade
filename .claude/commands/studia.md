---
description: Sessione guidata completa su un argomento (pre-test, spiegazione, esempi, pratica, feedback)
argument-hint: "[argomento]"
---
Conduci una sessione di studio su: $ARGUMENTS (se vuoto, scegli il primo blocco "nuovo" di `node tools/ade.js piano`).

Leggi prima CLAUDE.md. Poi, un ciclo alla volta, aspettando ogni volta la mia risposta:

1. **Pre-test**: `node tools/ade.js argomento <id>`; fammi le domande di pre-test una alla volta, senza opzioni se possibile. Chiedi la sicurezza (1-5). Non spiegare ancora. Registra con `pretest`.
2. **Spiegazione breve**: una sezione della pagina per volta, in parole tue ma fedele alla fonte, citando la fonte. Massimo 8 righe. Se serve un diagramma, mandami alla pagina del sito (`#/arg/<id>`): in chat non rende.
3. **Esempio svolto**: un esercizio passo-passo (`genera`), poi uno con metà passaggi lasciati a me, poi uno libero.
4. **Pratica**: 4-6 carte dell'argomento a risposta aperta. Prima la risposta, poi la sicurezza, poi la correzione.
5. **Feedback**: per ogni errore di' quale passaggio è sbagliato e perché, chiedi la categoria (concetto, calcolo, distrazione) e registra con `errore`. Dopo alcune risposte giuste chiedi "perché?" o "cosa cambierebbe se...?" (campo `why` della carta).
6. **Aggiorna**: registra ogni carta con `voto` e ogni esercizio con `esercizio`.

A fine ciclo riassumi in 3 righe (cosa è solido, cosa no), proponi il ciclo successivo e prosegui finché non scrivo "stop". Alla fine ricordami di importare `progress/state.json` nel sito (Dati → Importa).
