# Michì Menu Master

Crea "Michì Menu Manager": un'app gestionale in italiano per il locale **MICHÍ — CAFFÈ & CUCINA** che permette di gestire il menu del giorno con i prezzi e di generare la grafica del menu pronta per Instagram/WhatsApp.

Usa Lovable Cloud per database, autenticazione e storage. Tutta l'interfaccia in italiano, mobile-first (verrà usata dal titolare dal telefono la mattina presto).

## IDENTITÀ VISIVA (rispettala rigorosamente)
- Colore primario (verde salvia/petrolio del brand): #527879
- Oro/ottone del marchio: #DCA963
- Testo su fondo verde: bianco puro #FFFFFF
- Sfondo app (area gestionale): crema chiaro #F7F4EF con testi #2E3A3A
- Tipografia: serif elegante ad alto contrasto (tipo Cormorant Garamond o Playfair Display) per titoli, nomi piatti e per tutta la grafica del menu; sans-serif leggero solo per i controlli dell'interfaccia
- Stile: essenziale, elegante, molto arioso, tutto centrato nella grafica del menu

## FUNZIONALITÀ 1 — MENU DEL GIORNO (a rotazione, cambia ogni giorno)
Schermata principale con selettore data (default: oggi). Per ogni data si gestiscono sezioni di piatti, ognuna con nome piatto e prezzo (numero, senza simbolo €, es. 9, 10, 11, 12, 14):
- Antipasti
- Primi
- Secondi
- Dolci
Ogni sezione: aggiungi/modifica/elimina piatto, riordina con drag & drop, prezzo modificabile inline.
Inoltre per ogni giorno: campo "Pane del giorno" (testo libero, es. "Integrale e Noci") e "Messaggio di chiusura" (default "Buon Pranzo ☀️", selezionabile anche "Buona Cena 🌙" o testo libero).
Stato del menu: Bozza / Pubblicato.

Strumenti per velocizzare l'inserimento quotidiano:
- Pulsante "Duplica da…" per copiare il menu di un'altra data (es. lunedì scorso) sulla data corrente
- "Ricettario": archivio di tutti i piatti già usati con il loro prezzo abituale; cercando il nome si aggiunge il piatto al menu del giorno con prezzo precompilato (poi modificabile). Ogni piatto nuovo entra automaticamente nel ricettario.
- Archivio: elenco dei menu dei giorni passati, consultabili e riutilizzabili

## FUNZIONALITÀ 2 — MENU FISSI (non cambiano ogni giorno)
Sezione separata con due menu permanenti, entrambi con voci e prezzi modificabili e riordinabili:
- **COLAZIONE**
- **APERITIVO**
Ogni menu fisso può avere sottosezioni personalizzabili (es. per la colazione: Caffetteria, Lievitati, Salato; per l'aperitivo: Drink, Taglieri, Stuzzichini) e ogni voce ha nome, descrizione opzionale e prezzo. Si possono attivare/disattivare singole voci senza cancellarle.

## FUNZIONALITÀ 3 — GENERATORE GRAFICA MENU (è la parte più importante)
Anteprima live che si aggiorna mentre si digita e riproduce esattamente questo layout:
- Sfondo pieno color #527879
- In alto, centrato: il logo Michì (vedi sezione Logo qui sotto)
- Sotto il logo, la data in bianco grassetto nel formato `15 • 09 • 2026`
- Poi l'elenco dei piatti, tutto centrato, una riga per piatto, nel formato: `• Nome del piatto **12**` — il nome in bianco regolare, il prezzo in bianco grassetto, senza simbolo €. Le righe lunghe vanno a capo restando centrate.
- Tra un gruppo e l'altro (antipasti / primi / secondi / dolci) una riga separatrice con un singolo puntino `•` centrato
- In fondo, più piccolo e in grassetto: `Pane del giorno: Integrale e Noci.`
- Ultima riga, in serif grande color oro #DCA963: `Buon Pranzo ☀️`
- Il testo si adatta automaticamente: se ci sono molti piatti la dimensione del carattere si riduce per far stare tutto nel formato senza tagli

Formati esportabili (pulsanti di download PNG ad alta risoluzione, usa html-to-image):
- Storia / Reel 1080×1920
- Post quadrato 1080×1080
- Post verticale 1080×1350
Stesso generatore anche per i menu fissi (grafica Colazione e grafica Aperitivo).

Pulsante "Copia testo" che copia il menu formattato in testo semplice, pronto da incollare su WhatsApp o come caption Instagram.

## FUNZIONALITÀ 4 — PAGINA PUBBLICA
Pagina accessibile senza login su `/menu`: mostra il menu del giorno pubblicato, più i menu fissi Colazione e Aperitivo in due schede. Stessa identità visiva (fondo verde, logo, serif). Nella sezione impostazioni genera un QR code che punta a questa pagina, da stampare e mettere sui tavoli.

## LOGO
Il logo è: un cerchio irregolare "a impronta di tazzina" color oro #DCA963 sopra la scritta **MICHÍ** in maiuscolo serif ad alto contrasto, e sotto **CAFFÈ & CUCINA** in maiuscolo serif spaziato più piccolo.
Nelle Impostazioni crea una sezione "Logo" dove si possono caricare due file PNG (salvati nello storage):
- "Logo versione chiara" (bianco e oro, da usare sul fondo verde e nelle grafiche)
- "Logo versione scura" (verde e oro, da usare su fondi chiari)
Finché non vengono caricati, mostra un logo segnaposto ricostruito in CSS/SVG con esattamente quella composizione (anello oro + MICHÍ + CAFFÈ & CUCINA), in modo che l'app sia già utilizzabile e la grafica già corretta.

## ACCESSO
Autenticazione email + password con Lovable Cloud per il personale (area gestionale protetta). La pagina `/menu` resta pubblica. Nessuna verifica email obbligatoria, login veloce.

## DATI DI PARTENZA (precarica come menu di esempio della data di oggi)
Antipasti: Caprese Michì 9 · Culatello e burratina artigianale 10 · Bresaola, battuto di rucola, pomodorini arrosto e stracciatella 11
Primi: Pasta, sugo fresco ai 3 pomodori e basilico 10 · Riso Jasmine, salmone affumicato e uova strapazzate 12 · Pasta e fagioli 12
Secondi: Carpaccio di Black Angus, chutney al mango e pepe rosa, rucola e Feta 12 · Pollo marinato, peperoni e salsa Tzatziky 12 · Trancio di tonno scottato, misticanza asiatica e maionese al rafano 14
Dolci: Cheesecake Homemade 6
Pane del giorno: Integrale e Noci.
Messaggio: Buon Pranzo ☀️

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://michi-menu-magic.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b44a5867-3adc-4549-b5aa-2ef4f5be3c51).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
