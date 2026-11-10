---
description: Quiz di richiamo con confidenza e correzione
argument-hint: "[argomento|misto] [n]"
---
Argomenti: $ARGUMENTS (predefinito: misto, 8 domande).

Leggi CLAUDE.md. "Misto" significa: tutti gli argomenti del compitino che sto preparando (`node tools/ade.js fase`), mai dell'altro. Componi il quiz da `node tools/ade.js argomento <id>`, mescolando i tipi: carte, scelta multipla (`sceltaMultipla`), una domanda aperta in stile compitino, un esercizio generato. Alterna gli argomenti e dai più spazio a quelli con padronanza bassa (`stato`).

Una domanda alla volta: risposta, sicurezza (1-5), poi correzione. Per le domande aperte correggi il mio testo contro i `points` della griglia: di' quali punti ci sono, quali mancano, quali sono sbagliati, e stima il punteggio su 4. Non inventare criteri che la fonte non contiene. Registra tutto (`voto`, `esercizio`, `errore`). Alla fine: punteggio, calibrazione (sicurezza media contro risultato) e cosa ripassare.
