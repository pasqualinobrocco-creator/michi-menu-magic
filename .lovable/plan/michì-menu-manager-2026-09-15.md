# Michì Menu Manager

App gestionale in italiano per **MICHÍ — CAFFÈ & CUCINA**: si prepara il menu del giorno dal telefono e si scarica la grafica pronta per Instagram e WhatsApp.

## Identità visiva

- Verde brand #527879, oro #DCA963, bianco puro sul verde
- Area gestionale su crema #F7F4EF con testo #2E3A3A
- Titoli e grafiche in serif elegante (Cormorant Garamond), sans-serif leggero solo per i controlli
- Tutto molto arioso e centrato

## Cosa viene costruito

### 1. Menu del giorno
- Selettore data (di default oggi) con sezioni Antipasti, Primi, Secondi, Dolci
- Per ogni piatto: nome e prezzo senza simbolo €, modifica inline, elimina, riordino con trascinamento
- Campi "Pane del giorno" e "Messaggio di chiusura" (Buon Pranzo ☀️ / Buona Cena 🌙 / testo libero)
- Stato Bozza o Pubblicato
- "Duplica da…": copia il menu di un'altra data su quella corrente
- "Ricettario": archivio dei piatti già usati con prezzo abituale, ricerca e inserimento con prezzo precompilato; ogni piatto nuovo entra da solo nel ricettario
- Archivio dei giorni passati, consultabili e riutilizzabili

### 2. Menu fissi
- COLAZIONE e APERITIVO, con sottosezioni personalizzabili
- Ogni voce: nome, descrizione facoltativa, prezzo; riordino e attivazione/disattivazione senza cancellare

### 3. Generatore grafica (la parte centrale)
Anteprima live che si aggiorna mentre si digita:
- Fondo verde pieno, logo in alto centrato
- Data in bianco grassetto nel formato `15 • 09 • 2026`
- Una riga per piatto: `• Nome del piatto **12**`, nome regolare e prezzo grassetto, a capo centrato se lungo
- Un puntino `•` centrato come separatore tra i gruppi
- In fondo `Pane del giorno: …` in piccolo grassetto
- Ultima riga in serif grande oro: `Buon Pranzo ☀️`
- Il carattere si rimpicciolisce da solo quando i piatti sono molti, così nulla viene tagliato

Download PNG ad alta risoluzione nei formati 1080×1920, 1080×1080, 1080×1350, anche per Colazione e Aperitivo. Pulsante "Copia testo" per WhatsApp/Instagram.

### 4. Pagina pubblica `/menu`
Senza login: menu del giorno pubblicato più due schede Colazione e Aperitivo, stessa grafica. Nelle Impostazioni un QR code stampabile che punta a questa pagina.

### 5. Logo
Segnaposto fedele ricostruito in SVG (anello oro "a impronta di tazzina" + MICHÍ + CAFFÈ & CUCINA). Nelle Impostazioni si possono caricare le due versioni PNG (chiara e scura), che sostituiscono il segnaposto.

### 6. Accesso
Email e password, senza verifica email, login rapido. Solo l'area gestionale è protetta; `/menu` resta pubblica.

### 7. Dati di partenza
Il menu di esempio indicato (antipasti, primi, secondi, dolci, pane "Integrale e Noci", "Buon Pranzo ☀️") viene precaricato sulla data odierna.

## Dettagli tecnici

- Lovable Cloud: tabelle `daily_menus`, `daily_menu_items`, `recipe_book`, `fixed_menus`, `fixed_menu_sections`, `fixed_menu_items`, `settings` (logo chiaro/scuro). RLS: lettura pubblica solo dei menu pubblicati e dei menu fissi attivi; scrittura riservata agli utenti autenticati. GRANT espliciti per anon/authenticated/service_role.
- Storage bucket pubblico `branding` per i due loghi.
- Rotte: `/` gestione menu del giorno, `/fissi`, `/archivio`, `/impostazioni` (protette sotto il gate autenticato), `/menu` pubblica, `/auth`.
- Esportazione PNG con `html-to-image` a scala elevata; auto-fit tramite misurazione dell'altezza del contenuto.
- Riordino con `@dnd-kit`, QR con `qrcode` , date con `date-fns`.
- Token colore e font definiti in `src/styles.css`, font caricato con `<link>` nel root route.

## Assunzioni

- Il menu di esempio viene inserito come dati iniziali nella migrazione, sulla data del giorno in cui l'app viene creata.
- Chiunque si registri con email e password ha accesso alla gestione (locale piccolo, nessun sistema di ruoli).
