# Stocktaker: In-Browser Livestock Numbers Reconciliation

A privacy-focused, zero-backend web tool for UK livestock farmers to effortlessly reconcile herd numbers, track stock movements across periods, and produce pristine, accountant-ready reconciliation schedules.

## Background
Livestock reconciliation is an essential annual/periodic requirement for agricultural accountants, HMRC tax returns (under herd basis and trading stock rules), and farm management. Traditional methods often rely on fragile spreadsheets or manual paper records, resulting in calculation errors, balancing discrepancies, and messy reports.

Stocktaker eliminates these issues by running entirely in the browser without any server infrastructure. All records are retained locally and can be imported from or exported to a single portable master file.

## Key Features
- **100% In-Browser & Private:** Zero backend server; all farm data remains strictly on the farmer's machine.
- **File Load Version Verification Modal:** When opening an existing farm file, a dedicated confirmation modal presents the file name, exact UK date and time it was last saved, farm holding name, CPH number, and number of accounting periods. If the user notices it is an older version, they can choose a different file immediately with a single click.
- **Single Master Storage File:** Import and export all historical periods (months, quarters, tax years) into a compact, compressed binary `.stocktaker` archive (utilising the browser-native `CompressionStream` API). Not human-readable in text editors to prevent accidental tampering, with transparent auto-detection for older `.cam`, `.stk`, `.clearas`, `.agribook`, `.farform` and plain `.json` files.
- **Automated Mathematical Balancing:** Real-time formula validation ensuring `Opening Stock + Inflows = Outflows + Closing Stock`.
- **UK Tax & Agricultural Alignment:** Formatted around UK tax years (6 April to 5 April) and HMRC standard livestock categorisations (Breeding Herd capital vs Trading Stock revenue).
- **Automated 20% "Substantial Reduction" Indicator (BIM55525 / BIM55540):** Real-time monitoring of breeding herd head count shifts across the accounting period. Automatically flags substantial contractions ($\ge 20\%$) where disposals are treated as capital receipts outside taxable trading profits (BIM55540), distinguishes minor contractions ($< 20\%$) treated as revenue receipts (BIM55535), and tracks capital herd expansion (BIM55530).
- **One-Click HMRC Box 103 Text Export:** One-click clipboard copy generating a ready-to-paste schedule specifically formatted for HMRC Self Assessment SA103F Box 103 ("Any other information"), Corporation Tax CT600, and Partnership SA104F Box 3.116.
- **Optional Balance Sheet Valuations (£) Mode (HS232 / Cost Basis):** Optional per-head opening and closing valuations (£/head) supporting HMRC Helpsheet HS232 (Deemed Cost / Market Value scales / Cost). Segregates capital fixed assets (Breeding Herd) from revenue trading inventory (Trading Stock) and tracks P&L stock movements with automatic annual rollover.
- **Statutory TB & Compulsory Disease Slaughter Tagging (BIM55560 / HS224):** Granular tracking for Bovine TB reactors and compulsory disease removals under statutory animal health powers, ensuring proper cross-referencing in casualty breakdowns and audit schedules to claim statutory replacement election relief.
- **Dual Data Entry Experiences (Guided Wizard & Decluttered Spreadsheet):**
  - **Guided Step-by-Step Flow (Default):** Breaks complex reconciliations into 8 intuitive stages aligned with real-world farm records: 1. Opening Stock, 2. Calves Born, 3. Purchases, 4. Sales, 5. Deaths & Losses (with integrated HMRC age brackets and statutory TB tagging), 6. Transfers & Kill, 7. Final Count on Farm, and 8. Balance Check. Featuring clear stepper buttons, large inputs, and one-click helpers.
  - **Decluttered Spreadsheet Schedule:** Full multi-column spreadsheet for accountants and power users, with collapsible columns for rarely used movements (Transfers and Home Kill) and valuations.
  - **One-Click Mode Toggle:** Switch seamlessly between Guided and Spreadsheet modes at any point without losing progress.
- **Casualties & Deaths Breakdown:** Granular age breakdown (< 1 year, 1–2 years, > 2 years) with automated cross-validation against movement tables.
- **Period Management & UK Tax Year Presets:** Dedicated period editor allowing custom names, date pickers, UK tax year presets (6 April to 5 April), enterprise species selection, and accountant schedule notes.
- **Duplicate Period Prevention:** Strict validation prevents duplicate period names (case-insensitive and trimmed) or identical date ranges for the same enterprise, avoiding double-counting in multi-year files.
- **Period Rollover:** One-click annual rollover that automatically sets next year's opening stock to current closing stock, carries forward per-head valuations, and calculates UK tax year dates.
- **Standard UK Cattle Defaults with Easy Customisation:** Pre-populated with 8 standard HMRC categories (Breeding Herd: *Stock Bulls*, *Beef Cows (calved)*; Trading Stock: *Replacement Heifers (unserved / in-calf)*, *Fat Bullocks / Steers*, *Fat Heifers*, *Store Cattle*, *Cull Cows*, *Calves < 1 yr*), plus one-click options for *Dairy Cows (calved)*, *Youngstock (1–2 years)*, *Young Bulls / Bull Beef* and *Cull Bulls*. Heifers stay in Trading Stock until their first calf (BIM55220), then move into the Breeding Herd via Transfers Out / Transfers In. Farmers can easily delete, rename, or add bespoke categories with 1 click.
- **Zero Browser Pop-ups & Seamless UX:** Native browser `alert()`, `confirm()`, and `prompt()` pop-ups have been eliminated in favour of inline table row creation and stylish in-app confirmation dialogs.
- **Dedicated First-Time Setup & Guide View:** A distraction-free full-screen view guiding farmers through how the application works, entering farm & CPH holding details, and reviewing livestock categories with one-click UK presets and direct access to open existing farm files. Clean session routing ensures the exit button to the workspace is only displayed when explicitly navigating from an active workspace via the Guide button.
- **Welcoming Rural Brand Identity & Accessible Typography:** Designed specifically for UK farming and agricultural accounting. Combines *Bitter* for warm agricultural headings (and brand mentions styled in Extra Bold 800 to match the official logo wordmark) with *Atkinson Hyperlegible Next* (Braille Institute high-legibility sans with tabular figures for senior readers, bundled 100% offline via Fontsource with zero external web tracking). Uses an authentic *Field & Hedgerow* palette (*Hedgerow Green*, *Buttercup Yellow* high-contrast actions, *Oak Brown*, and warm *Parchment*), pairing *Clover Green* with `✓ Balanced` for zero-variance reconciliations and *Rust Red* with `✗` for discrepancies. Showcases the official horizontal logo (`stocktaker-logo-no-bg.svg`) across the top navigation bar and uses the circular brand mark (`stocktaker-brand-mark.svg`) as the browser favicon.
- **Accessible Text Zoom (100% Default with 80%–180% Range):** Baseline typography defaults to 100% at a comfortable 17.6px base font size for instant readability on farm screens, with flexible scaling from 80% up to 180% (`1.8`). Accessible right from initial launch (including during first-time onboarding, where the header control is highlighted alongside an explanatory reading comfort guide). Features an accessible navbar control with quick-jump presets (`80%`, `100% Default`, `140%`, `180%`), accelerated &plusmn;10% `Smaller` / `Larger` steppers, reset button, and a continuous 80%–180% slider with mathematically aligned percentage tick marks that automatically saves to `localStorage`. Layout containers include responsive wrapping safeguards to prevent horizontal clipping under high zoom factors. Dedicated print/PDF output remains locked to standard A4 10.5pt.
- **Accountant-Ready PDF & Print:** Produces clean, professional A4 reports with zero formatting discrepancies or stray pages.
- **Single-Source Brand Configuration:** All application naming, initials, file extensions, storage cache keys, document titles, and accountant report headers are centralised in [`src/config/brand.ts`](file:///Users/iainwhite/repos-personal/clearas/src/config/brand.ts). Future renames take effect instantly across the entire application by editing this single file.
- **Crash Protection:** Automatic debounced persistence to local browser storage (`localStorage`) so progress is never lost.
- **Support the Project:** Tasteful rural footer with a Buy Me a Coffee link (`buymeacoffee.com/iainwhite`), automatically hidden during report printing.

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
3. Any push to `main` will automatically build, test, and publish to `https://whitecloudcode.github.io/stocktaker/`.

For comprehensive architectural design, requirements, and domain logic, see [GEMINI.md](file:///Users/iainwhite/repos-personal/clearas/GEMINI.md).
