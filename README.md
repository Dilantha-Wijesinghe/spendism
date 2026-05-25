# Spendism

[![CI](https://github.com/Dilantha-Wijesinghe/spendism/actions/workflows/ci.yml/badge.svg)](https://github.com/Dilantha-Wijesinghe/spendism/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A private, frontend-only personal finance app — track expenses, set budgets, and see where your money goes.

No account. No backend. No ads. Your data lives in your browser.

---

## Features

- **Dashboard** — net balance, monthly summary, budget ring progress, recent transactions, and a 6-month income vs expense trend chart
- **Transaction tracking** — add, edit, and delete expenses and income with categories, tags, and recurrence
- **Budget management** — set monthly or yearly limits per category with visual progress tracking and overspend alerts
- **Reports** — spending breakdowns by category and time-range trend charts
- **Multi-currency** — USD, EUR, GBP, LKR, AUD, CAD, INR, JPY
- **CSV & JSON export/import** — back up and restore your full data set
- **Offline-first** — everything runs in the browser, no internet required after load
- **Mobile-first** — designed for on-the-go use, works on desktop too

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Primitives | [Radix UI](https://www.radix-ui.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Validation | [Zod](https://zod.dev/) |
| CSV Parsing | [Papa Parse](https://www.papaparse.com/) |
| Icons | [Lucide React](https://lucide.dev/) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/Dilantha-Wijesinghe/spendism.git
cd spendism
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

## Checks

```bash
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router (layout, page, global styles)
├── components/ui/          # Reusable UI primitives (Button, Card, Input, etc.)
├── features/spendism/      # Main application shell, views, and components
└── lib/
    ├── types.ts            # Core data types (Transaction, Budget, Category, ...)
    ├── storage.ts          # localStorage persistence with schema versioning
    ├── calculations.ts     # Financial calculations (balances, summaries, trends)
    ├── categories.ts       # Default category definitions
    ├── csv.ts              # CSV export and import
    ├── money.ts            # Currency formatting and parsing
    └── ids.ts              # Stable ID generation
```

## Data & Privacy

All data is stored exclusively in your browser's `localStorage`. Nothing is sent to any server. Exporting a CSV or JSON file is the only way to back up or transfer your data.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

MIT — see [LICENSE](LICENSE) for details.
