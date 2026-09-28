# Trading Journal Pro 📈

A web-based, professional Trading Journal built for **Index Futures** and specifically tailored for traders utilizing **SMC / ICT** concepts. The app serves as a comprehensive log, an analytical tool to find your edge, and a digital discipline enforcer.

Built with **Next.js 15**, **React**, **Tailwind CSS**, **Prisma**, and **SQLite**.

---

## 🎯 Key Features

- **Seamless Tradovate Integration**: Drag and drop your Tradovate CSV export directly into the app. The parser handles timestamps, formatting, and PnL automatically.
- **Premium Dashboard**: Interactive Equity Curve (Recharts) and KPIs such as Win Rate, Profit Factor, Current Drawdown, and Net PnL. *(Trades under $50 are filtered as Break Even).*
- **Calendar View (Heatmap)**: Get a quick overview of your monthly performance with color-coded days (Green, Red, or Gray for Break Even).
- **Advanced Journaling**: Supplement automated data with manual parameters:
  - Setups (Orderblock, Breakerblock, FVG, IFVG, CSD)
  - Timeframe combinations
  - HTF Bias (Pro/Counter-trend)
  - SMT Divergence
  - MFE / MAE & Planned R:R
  - Emotional state & Grade
- **Image Uploads**: Upload screenshots of your charts/execution directly into your journal.
- **Playbook Gallery**: An exclusive, visual library that automatically collects all trades you've graded as "A". Perfect for tape-reading and pattern recognition!
- **Rules Engine (Discipline Enforcer)**: Monitors your trading in real-time and provides visual, color-coded warnings if you break your rules:
  - Max 2 losses per day (Mentally locks UI).
  - Half-risk warning after 1 loss.
  - Max 2 red days per week.
  - Warning for missing SMT confirmation.

---

## 🚀 Getting Started (Local Installation)

Since the app uses a local SQLite database, everything runs securely and quickly on your own machine without financial data leaving your computer.

### 1. Clone the project and install dependencies
```bash
git clone https://github.com/sonniknor/Trading-Journal.git
cd journal
npm install
```

### 2. Set up the database (Prisma + SQLite)
This will generate the Prisma client and create the local `dev.db` file (which git ignores automatically).
```bash
npx prisma db push
```

### 3. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 User Guide

1. Export your trading history from Tradovate in `.csv` format.
2. Go to the **Upload** tab and drag the file into the dropzone to populate the database.
3. Go to **Journal**, click on a trade to open the side panel, and fill in the details for your strategy (setup, session, screenshot, notes).
4. Check the **Dashboard** and **Calendar** to analyze your results over time.
5. Use the **Playbook** to study your "A" setups.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Recharts, Lucide Icons, Date-fns.
- **Backend / Database**: Server Actions, Prisma ORM, SQLite.
- **Design**: Dark Mode Glassmorphism UI.

*Developed with a focus on capital preservation and discipline.*
