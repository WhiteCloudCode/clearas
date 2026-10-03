# Clear As Mud: In-Browser Livestock Numbers Reconciliation

A privacy-focused, zero-backend web tool for UK livestock farmers to effortlessly reconcile herd numbers, track stock movements across periods, and produce pristine, accountant-ready reconciliation schedules.

## Background
Livestock reconciliation is an essential annual/periodic requirement for agricultural accountants, HMRC tax returns (under herd basis and trading stock rules), and farm management. Traditional methods often rely on fragile spreadsheets or manual paper records, resulting in calculation errors, balancing discrepancies, and messy reports.

Clear As Mud eliminates these issues by running entirely in the browser without any server infrastructure. All records are retained locally and can be imported from or exported to a single portable master file.

## Key Features
- **100% In-Browser & Private:** Zero backend server; all farm data remains strictly on the farmer's machine.
- **Single Master Storage File:** Import and export all historical periods (months, quarters, tax years) into a compact, compressed binary `.cam` archive (utilising the browser-native `CompressionStream` API). Not human-readable in text editors to prevent accidental tampering, with transparent auto-detection for older `.clearas`, `.agribook`, `.farform` and plain `.json` files.
- **Automated Mathematical Balancing:** Real-time formula validation ensuring `Opening Stock + Inflows = Outflows + Closing Stock`.
- **UK Tax & Agricultural Alignment:** Formatted around UK tax years (6 April to 5 April) and HMRC standard livestock categorisations (Breeding Herd capital vs Trading Stock revenue).
- **Casualties & Deaths Breakdown:** Granular age breakdown (< 1 year, 1–2 years, > 2 years) with automated cross-validation against movement tables.
- **Period Management & UK Tax Year Presets:** Dedicated period editor allowing custom names, date pickers, UK tax year presets (6 April to 5 April), enterprise species selection, and accountant schedule notes.
- **Duplicate Period Prevention:** Strict validation prevents duplicate period names (case-insensitive and trimmed) or identical date ranges for the same enterprise, avoiding double-counting in multi-year files.
- **Period Rollover:** One-click annual rollover that automatically sets next year's opening stock to current closing stock and calculates UK tax year dates.
- **Standard UK Cattle Defaults with Easy Customisation:** Pre-populated with the 7 standard HMRC categories (Breeding Herd: *Stock Bulls*, *Beef Cows / In-calf Heifers*; Trading Stock: *Fat Bullocks / Steers*, *Fat Heifers*, *Store Cattle*, *Cull Cows*, *Calves < 1 yr*). Farmers can easily delete, rename, or add bespoke categories with 1 click.
- **Zero Browser Pop-ups & Seamless UX:** Native browser `alert()`, `confirm()`, and `prompt()` pop-ups have been eliminated in favour of inline table row creation and stylish in-app confirmation dialogs.
- **Dedicated First-Time Setup & Guide View:** A distraction-free full-screen view guiding farmers through how the application works, entering farm & CPH holding details, and reviewing livestock categories with one-click UK presets and direct access to open existing farm files.
- **Accountant-Ready PDF & Print:** Produces clean, professional A4 reports with zero formatting discrepancies or stray pages.
- **Single-Source Brand Configuration:** All application naming, initials, file extensions, storage cache keys, document titles, and accountant report headers are centralised in [`src/config/brand.ts`](file:///Users/iainwhite/repos-personal/clearas/src/config/brand.ts). Future renames take effect instantly across the entire application by editing this single file.
- **Crash Protection:** Automatic debounced persistence to local browser storage (`localStorage`) so progress is never lost.

## Quick Start & Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run automated tests
npm test

# Run type check and diagnostics
npm run check

# Build production bundle
npm run build
```

## Deployment (GitHub Pages)

The application automatically deploys to GitHub Pages via the workflow defined in [`.github/workflows/deploy.yml`](file:///Users/iainwhite/repos-personal/clearas/.github/workflows/deploy.yml).

### One-Time Repository Setup:
1. In your GitHub repository, navigate to **Settings** &rarr; **Pages**.
2. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
3. Any push to `main` will automatically build, test, and publish to `https://whitecloudcode.github.io/clearas/`.

For comprehensive architectural design, requirements, and domain logic, see [GEMINI.md](file:///Users/iainwhite/repos-personal/clearas/GEMINI.md).
