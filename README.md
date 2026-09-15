# Luisa Style Guide

# LUISA SPAGNOLI — FW 2026/2027 TRAINING WEB APP (MOBILE-FIRST)

Crea una Web App mobile-first elegante, performante e bilingue (Inglese come lingua predefinita, con possibilità di switch rapido in Russo) per la formazione interna del personale retail di Luisa Spagnoli.

Il titolo dell'applicazione è:

"Training Material Fall Winter 2026/2027" (EN) / "Учебные материалы Осень-Зима 2026/2027" (RU).

---

## 1. ARCHITETTURA TECNICA & STACK

- **Framework**: React (Vite) + TypeScript

- **Stile**: Tailwind CSS (mobile-first, palette lusso: panna, oro satinato/champagne, nero grafite, bordeaux)

- **Componenti UI**: Lucide React Icons, Shadcn UI (Select, Card, Accordion, Tabs, Badge, Button)

- **Stato lingua**: React Context (`en` predefinito, `ru` alternativo) con persistenza in `localStorage`.

- **Database/Data Source**: File CSV o JSON incorporato contenente i campi del dataset (`Nome Modello`, `Descrizione`, `Descrizione Eng`, `Colori`, `Styling / Abbinamenti`, `Styling / Abbinamenti Eng`, `Consigli di Vendita`, `Consigli di Vendita Eng`, `Gestione Obiezioni`, `Gestione Obiezioni Eng`).

---

## 2. LOGICA DI PARSING DATI (CRITICA)

### A. Pulizia URL dallo Styling (Requisito Fondamentale):

Nei testi di styling non devono MAI comparire gli URL grezzi `https://...`.

- Crea una funzione helper `parseStylingText(rawText: string)` che:

  1. Estrae tutti gli URL delle immagini per mostrarli come anteprime/thumbnail visive sotto ogni look.

  2. Rimuove tutte le stringhe di URL tra parentesi tonde o isolate: `/\((https?:\/\/[^\s)]+)\)/gi` e `https?:\/\/[^\s)]+/gi`.

  3. Pulisce eventuali residui come `( )` o doppi spazi.

  4. Separa i singoli Total Look usando come delimitatore ` | ` o newline. Se nel testo sono presenti riferimenti a vetrine o lookbook (es. `Look 211`, `Vetrina 59`), crea card dedicate per ciascun outfit.

### B. Gestione Varianti Colore:

- I colori sono formattati come: `Nome Colore (Codice): URL | Nome Colore 2 (Codice): URL`.

- Fai il parsing in array di oggetti: `{ name: string, code: string, imageUrl: string }`.

- Se l'URL è `URL non disponibile` o assente, mostra un placeholder grafico sobrio con il nome del colore e l'icona di un abito o palette.

### C. Consigli di Vendita (3 punti tattici):

- Separati dal carattere pipe ` | `.

- Mostrali come 3 card numerate con iconografia lusso (es. Sparkles, Award, TrendingUp).

### D. Gestione Obiezioni (Anti-Truncate & Word Wrap):

- Separati da ` || `.

- Ogni obiezione segue il pattern: `[Obiezione cliente] -> Risposta sales assistant`.

- **REQUISITO CRITICO LAYOUT**: Nessun testo deve essere troncato (`truncate` vietato). 

  - Usa `whitespace-normal`, `break-words`, `h-auto`, `overflow-visible`.

  - Ogni card o elemento accordion deve avere altezza automatica che si adatta dinamicamente alla lunghezza del testo sia in EN che in RU.

---

## 3. STRUTTURA DELLE PAGINE E UI MOBILE-FIRST

### Header Fisso Superiore:

- Logo o scritta tipografica: **LUISA SPAGNOLI** (serif, spaziata, elegante).

- Titolo sottostante: *Training Material Fall Winter 2026/2027*.

- Selettore Lingua compatto: toggle pill **[ EN | RU ]** posizionato in alto a destra.

### Barra di Selezione & Ricerca:

- Un menu a tendina (`Select` o `Combobox` ricercabile) con l'elenco alfabetico di tutti i modelli presenti nel dataset (es. *Cadino, Capire, Caprese B, Caserta, Cassina, Cavina, Cetello, Cinguettio, Cips, Cirillo, Costanzo, Cremina, Cremona, Cromatura, Cufra, Damiana, Damiera, Decalco, Decibel, Dindi B, Discordia, Faggi, Fattura B, Faustin, Felis, Ferriera, Fidente, Fiordaliso, Fiorini, Fondazione, Fragolino, Franchezza, Frazione, Fumaiolo, Galalite, Gallerie, Gardana, Genialita, Ghedi, Ghiglia, Gotica, Gradis, Graffiti, Gray, Guizzante, Ialofane, Iroise, Latteria, Leonidas, Liquorosa, Lucentezza, Lunotto, Mabels, Macaria, Madelin, Maestosita, Maggiolone, Magnesite, Maizena, Malvia, Mancante, Manografo, Mantecare, Mantes, Mantisia, Marostica, Marsan, Marsela, Matri, Maurilia, Meduna, Meleti, Merina, Met, Micologia, Mimesia, Minuccio A, Mira, Mirko, Miss A, Misterioso, Mity, Modici, Mormorare, Mossa G, Muni A, Munia, Murcia, Murice, Nagorno, Niccioleta, Niccone, Norrisia, Notabili, Nuevitas, Nuttidi, Odrisi, Offida, Olap, Olinda, Olino, Olivetano, Oneta, Ontani, Orilia, Ortesi, Osiglia, Ottana, Salottino, Salve A, Sauris, Scalare, Scansione, Sciantal, Scolpito, Scoprire, Serenella, Serieta, Sigilli, Sindi, Sinuosita, Situazione, Soana, Socio, Solvente, Soppalco, Soresina, Soriano, Sostenuto, Spareggio, Spartiti, Spettatore, Spidy, Spillatrice, Strass, Summit, Supporre, Svolta, Zano, Zenone, ecc.*).

- Pulsante di azione: **"SEARCH"** (in EN) / **"ПОИСК"** (in RU), stile luxury con sfondo nero e dettagli oro.

---

### Sezione Scheda Modello (Una volta selezionato il capo):

#### 1. Intestazione & Foto Principale:

- Titolo sezione: **ANALYSIS: [Nome Modello]** (EN) / **АНАЛИЗ: [Nome Modello]** (RU).

- Immagine hero grande ottimizzata per mobile, con badge di categoria (es. *Maglieria, Capispalla, Abiti, Pantaloni*).

#### 2. ОПИСАНИЕ / DESCRIPTION:

- Paragrafo completo e scorrevole con interlinea rilassata (`leading-relaxed`), testo giustificato/fluido senza interruzioni forzate.

#### 3. ВАРИАНТЫ ЦВЕТА / COLOR PALETTE:

- Titolo: **2. COLOR VARIANTS** / **2. ВАРИАНТЫ ЦВЕТА**.

- Griglia a 2 colonne su mobile con card visiva:

  - Miniatura dell'immagine del colore con angoli arrotondati e funzione tap-to-zoom (modal lightbox).

  - Nome del colore e codice tra parentesi (es. *Blu Inchiostro (2544)*).

#### 4. СТАЙЛИНГ И СОЧЕТАНИЯ / STYLING & OUTFITS:

- Titolo: **3. STYLING & COMBINATIONS** / **3. СТАЙЛИНГ И СОЧЕТАНИЯ**.

- Per ogni Total Look / Vetrina identificata:

  - **Box Outfit**: testo pulito al 100% **SENZA ALCUN LINK O URL VISIBILE** (es. *"Total Look 211: Caserta 2544 in abbinamento a pantaloni Olap 0214, bracciale Navigero 0002..."*).

  - **Gallery Capi Abbinati**: sotto al testo dell'outfit, genera uno slider orizzontale o una mini-griglia con le immagini e i nomi dei capi correlati estratti dal testo.

#### 5. СОВЕТЫ ПО ПРОДАЖАМ / SALES PITCH & ADVICE:

- Titolo: **4. SALES ADVICE** / **4. СОВЕТЫ ПО ПРОДАЖАМ**.

- 3 card ben spaziate e numerate (01, 02, 03) con bordo leggero oro satinato, evidenziando i punti di forza del tessuto, della vestibilità e delle occasioni d'uso.

#### 6. УПРАВЛЕНИЕ ВОЗРАЖЕНИЯМИ / OBJECTION HANDLING:

- Titolo: **5. OBJECTION HANDLING** / **5. УПРАВЛЕНИЕ ВОЗРАЖЕНИЯМИ**.

- Mostra le 5 obiezioni in **Card espandibili (Accordion)** o **Card complete a flusso verticale**:

  - **Box Obiezione Cliente**: sfondo grigio chiaro o champagne tenue, icona domanda, testo in grassetto scuro (`font-semibold text-stone-900`, `break-words`).

  - **Box Risposta / Argomentazione di Vendita**: sfondo panna/bianco con bordo sinistro color oro, icona check/consiglio, spiegazione esaustiva perfettamente visibile (`text-stone-700 leading-relaxed text-sm`).

  - **Nessuna casella a dimensione fissa**: il box si estende liberamente in base al testo in russo o inglese per garantire leggibilità al 100%.

---

## 4. DESIGN SYSTEM & REGOLE CSS

- **Colori primari**:

  - Background: `#FAF8F5` (Panna/Alabastro)

  - Card & Container: `#FFFFFF` con leggera ombra `shadow-sm` e bordo `#E7E2DA`

  - Testo principale: `#1C1917` (Stone 900)

  - Dettagli & Accenti: `#A37D45` (Oro Satinato Luisa Spagnoli)

- **Tipografia**:

  - Titoli: Playfair Display o Cormorant Garamond (Serif classica ed elegante)

  - Testi e tabelle: Inter o Montserrat (Sans-serif moderna, leggibile su mobile)

- **Responsive Padding**:

  - Padding laterale di pagina: `px-4 py-6` per non sprecare spazio sugli schermi di smartphone.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ls-training-luxe.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ad827b5-a7cf-46bb-9f0f-322c517c6d33).

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
