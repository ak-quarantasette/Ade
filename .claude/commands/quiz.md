---
description: Quiz di richiamo con confidenza e correzione
argument-hint: "[argomento|misto] [n]"
---
Argomenti: $ARGUMENTS (predefinito: misto, 8 domande).

Leggi CLAUDE.md. Componi il quiz da `node tools/ade.js argomento <id>` per ogni argomento coinvolto, mescolando i tipi: carte, una domanda aperta in stile compitino, un esercizio generato. In "misto" alterna gli argomenti e dai più spazio a quelli con padronanza bassa (`stato`).

Una domanda alla volta: risposta, sicurezza (1-5), poi correzione. Per le domande aperte correggi il mio testo contro i `points` della griglia: di' quali punti ci sono, quali mancano, quali sono sbagliati, e stima il punteggio su 4. Non inventare criteri che la fonte non contiene. Registra tutto (`voto`, `esercizio`, `errore`). Alla fine: punteggio, calibrazione (sicurezza media contro risultato) e cosa ripassare.
