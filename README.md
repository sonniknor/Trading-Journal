# Trading Journal Pro 📈

En webbasert, profesjonell Trading Journal bygget for **Index Futures** og spesifikt skreddersydd for tradere som benytter seg av **SMC / ICT** konsepter. Appen fungerer både som en komplett logg, et analyseverktøy for å finne "edge", og en digital disiplin-vaktbikkje.

Bygget med **Next.js 15**, **React**, **Tailwind CSS**, **Prisma** og **SQLite**.

---

## 🎯 Nøkkelfunksjoner

- **Sømløs Tradovate Integrasjon**: Dra og slipp Tradovate CSV-eksporten din rett inn i appen. Parseren håndterer tidsstempler, formatering og PnL automatisk.
- **Premium Dashboard**: Interaktiv Equity Curve (Recharts) og KPIer som Win Rate, Profit Factor, Current Drawdown og Net PnL. *(Trades under $50 filtreres som Break Even).*
- **Kalendervisning (Heatmap)**: Få rask oversikt over månedens ytelse med fargekodede dager (Grønn, Rød eller Grå for Break Even).
- **Avansert Journalføring**: Suppler automatisk data med manuelle parametere:
  - Setups (Orderblock, Breakerblock, FVG, IFVG, CSD)
  - Timeframe kombinasjoner
  - HTF Bias (Pro/Counter-trend)
  - SMT Divergence
  - MFE / MAE & Planned R:R
  - Emosjonell tilstand & Karakter (Grade)
- **Bildeopplasting**: Last opp skjermbilder av grafene/utførelsen direkte i journalen din.
- **Playbook Galleri**: Et eksklusivt, visuelt bibliotek som automatisk samler alle trades du har markert med karakteren "A". Perfekt for tape-reading og mønstergjenkjenning!
- **Rules Engine (Disiplin-vaktbikkje)**: Overvåker tradingen din i sanntid og gir visuelle, fargekodede advarsler hvis du bryter reglene dine:
  - Maks 2 tap per dag (Låser mentalt UI).
  - Halv risiko-varsel etter 1 tap.
  - Maks 2 røde dager per uke.
  - Varsel ved manglende SMT-bekreftelse.

---

## 🚀 Kom i gang (Lokal Installasjon)

Siden appen bruker en lokal SQLite-database, kjører alt trygt og raskt på din egen maskin uten at finansiell data forlater datamaskinen din.

### 1. Klon prosjektet og installer avhengigheter
```bash
git clone <din-repo-url>
cd journal
npm install
```

### 2. Sett opp databasen (Prisma + SQLite)
Dette vil generere Prisma-klienten og opprette den lokale `dev.db` filen (som git ignorerer automatisk).
```bash
npx prisma db push
```

### 3. Start utviklingsserveren
```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren din for å se applikasjonen.

---

## 📂 Brukerveiledning

1. Eksporter tradinghistorikken din fra Tradovate i `.csv`-format.
2. Gå til fanen **Opplasting** og dra filen inn i slippsonen for å populere databasen.
3. Gå til **Journal**, klikk på en trade for å åpne sidepanelet, og fyll ut detaljene for strategien din (setup, session, skjermbilde, notater).
4. Sjekk **Dashboard** og **Kalender** for å analysere resultatene dine over tid.
5. Bruk **Playbook** for å studere "A"-setups.

---

## 🛠️ Teknologistakk
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Recharts, Lucide Icons, Date-fns.
- **Backend / Database**: Server Actions, Prisma ORM, SQLite.
- **Design**: Dark Mode Glassmorphism UI.

*Utviklet med fokus på kapitalbevaring og disiplin.*
