# Spendism — Product Requirements Document

## Overview

**Spendism** is a minimalist, frontend-only personal finance web application that helps individuals track expenses, manage income, and stay within budget. All data is stored locally in the browser (localStorage) and can be exported/imported as CSV or JSON — no backend, no sign-up, no cloud.

---

## Goals

- Give users a clear picture of where their money goes
- Make adding transactions fast and frictionless
- Provide budget guardrails that alert before overspending
- Work entirely offline with full data portability

## Non-Goals

- Multi-user / shared finances (see Splitism for that)
- Bank account syncing or open-banking APIs
- Server-side storage, authentication, or accounts
- Mobile native apps (web-only, but mobile-responsive)

---

## User Personas

| Persona | Description |
|---------|-------------|
| **The Tracker** | Logs every expense manually; wants detailed history and category breakdowns |
| **The Budgeter** | Sets monthly limits per category; wants warnings before hitting the limit |
| **The Overview Seeker** | Only checks weekly to see net balance; needs a clean dashboard snapshot |

---

## Feature Specification

### 1. Dashboard

**Purpose:** High-level financial snapshot at a glance.

**Components:**
- **Net Balance** — all-time income minus expenses (hero stat)
- **Monthly Summary** — current month income, expenses, and savings rate
- **Budget Ring Progress** — top 3 budgeted categories with visual ring progress
- **Recent Transactions** — last 5 transactions with category icon, amount, and date
- **Monthly Trend Chart** — 6-month bar chart of income vs expenses

### 2. Transactions

**Purpose:** Full ledger of all financial activity.

**Components:**
- **Search bar** — full-text search across description, category, tags
- **Filters** — by type (expense/income), category, time period (daily/weekly/monthly/yearly/all)
- **Transaction list** — sorted newest-first, with category badge, amount, date, description
- **Add/Edit/Delete** — modal form with validation
- **Bulk operations** — none (keep it simple)

**Transaction fields:**
| Field | Type | Required |
|-------|------|---------|
| Type | expense / income | Yes |
| Amount | positive number | Yes |
| Category | from category list | Yes |
| Description | text | No |
| Date | calendar date | Yes (default today) |
| Recurrence | none/daily/weekly/monthly/yearly | No (default none) |
| Tags | comma-separated strings | No |

### 3. Budget Management

**Purpose:** Set spending limits per category and track adherence.

**Components:**
- **Budget cards** — one per budgeted category showing spent/limit, ring progress, status badge
- **Add/Edit Budget** — modal to set category, amount, period (monthly/yearly)
- **Alert states:**
  - Green: < 80% spent
  - Amber warning: 80–99% spent
  - Red over-budget: ≥ 100% spent
- **Empty state** — prompt to add first budget

### 4. Reports & Analytics

**Purpose:** Understand spending patterns over time.

**Components:**
- **Income vs Expenses chart** — 6-month bar chart (Recharts)
- **Category breakdown** — donut chart of expenses by category for selected period
- **Period selector** — monthly/yearly/all
- **Top categories table** — ranked list with amount and percentage
- **Savings rate** — highlighted metric card

### 5. Settings

**Purpose:** Personalise the app and manage data.

**Components:**
- **Currency selector** — dropdown of common currencies
- **Week start day** — Sunday or Monday
- **Export Transactions CSV** — download all transactions
- **Export Full Backup JSON** — download complete app data
- **Import Transactions CSV** — upload and merge transactions
- **Import Full Backup JSON** — restore app data from backup
- **Reset All Data** — confirmation-guarded destructive action

---

## Data Model

### Transaction
```
id           string     nanoid(10)
type         expense | income
amount       number     positive float
categoryId   string     references Category.id
description  string     free text
date         string     YYYY-MM-DD
tags         string[]   optional labels
recurrence   none | daily | weekly | monthly | yearly
createdAt    ISO string
updatedAt    ISO string
```

### Budget
```
id           string
categoryId   string
amount       number     monthly or yearly limit
period       monthly | yearly
year         number
month        number?    0–11 (for monthly budgets only)
```

### Category
```
id           string
name         string
icon         string     lucide icon name
color        string     color key (orange, blue, teal, ...)
type         expense | income | both
isDefault    boolean
```

### AppSettings
```
currency         string    ISO 4217 code (USD, EUR, ...)
currencySymbol   string    display symbol ($, €, ...)
weekStartsOn     0 | 1    0=Sunday, 1=Monday
```

---

## UX Flows

### Adding a Transaction
1. Tap/click **+** button (FAB on mobile, button in header on desktop)
2. Toggle expense/income
3. Enter amount → category → description → date
4. Optionally set recurrence
5. Submit → transaction appears at top of list, dashboard totals update

### Setting a Budget
1. Navigate to Budget tab
2. Tap **Add Budget**
3. Select category, enter amount, select period
4. Confirm → card appears with ring progress at 0%

### Importing Data
1. Navigate to Settings
2. Choose **Import Transactions CSV** or **Import Full Backup**
3. Select file → preview import count → confirm
4. Data merges (CSV) or replaces (JSON backup) — user is warned for JSON

---

## Design System

- **Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **Components:** shadcn/ui + Lucide React icons
- **Charts:** Recharts (client-only rendering)
- **Fonts:** DM Sans (UI) + DM Mono (numbers)
- **Color palette:** Warm cream background, teal primary (#0f5c57), amber accent
- **Layout:** Mobile-first; bottom tab bar on mobile, 220px sidebar on desktop (lg+)
- **Animation:** Staggered fade-slide-in for list items (30–240ms delays)
- **Persistence:** localStorage with schema versioning

---

## Technical Constraints

- No server-side code — all logic runs in the browser
- localStorage is the sole persistence layer (CSV/JSON for portability)
- Charts must not cause SSR errors (`dynamic` import with `ssr: false` if needed)
- Must work offline after initial page load
- No external API calls of any kind

---

## Success Metrics (Qualitative)

- User can add a transaction in under 10 seconds
- Dashboard loads in under 1 second on a cold start
- Budget alerts are visible without navigating away from dashboard
- CSV round-trip (export → import) preserves all data

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-05-25 | Initial release — core expense/income/budget tracking |
