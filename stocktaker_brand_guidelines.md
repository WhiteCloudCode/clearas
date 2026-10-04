# Stocktaker — Brand Guidelines Specification
**Version:** 2.0  
**Status:** Approved for Implementation (Rural Field & Hedgerow Theme)

---

## 1. Brand Essence & Positioning

### 1.1 The Stance
Stocktaker exists to do one job properly: balance the farm books and reconcile livestock numbers to audit standard without the usual headaches. It is an uncomplicated, welcoming, and trustworthy ledger tool crafted specifically for UK farmers and agricultural accountants.

It speaks with the reassuring warmth, patience, and directness of a good neighbour who knows their numbers and respects your time. It never patronises, uses zero software jargon, and prioritises large, high-legibility numerals for ease of use in farm offices and kitchen tables.

* **Positioning:** Uncomplicated, rural, audit-grade livestock reconciliation.
* **Tagline:** *Every head counted. Every book balanced.*
* **Secondary Lockup:** *No gaps. No guesswork.*

---

## 2. Logo Rules & Geometry

The Stocktaker visual mark is **The Stanchion**: an interlocking tally mark that forms both a cattle race silhouette and an unshakeable mathematical equals sign.

```
       │   │   │   /
       │   │   │  /
   ────┼───┼───┼─/────
       │   │   │/
       │   │   /
```

### 2.1 Logo Lockups
* **Primary Lockup:** Mark positioned to the left of the title-case or uppercase wordmark `Stocktaker`.
* **Stacked Lockup:** Mark centred directly above the wordmark. Reserved strictly for square formats, mobile splash screens, and app drawer icons.
* **Mark Only (Favicon / App Icon):** Standalone mark enclosed within a rounded square (`border-radius: 22%`) on Hedgerow Green background with warm Parchment or Buttercup stroke.

### 2.2 Clear Space
* The minimum exclusion zone around the mark and wordmark is equal to the height of the capital letter **‘S’** in the wordmark (`1S`).
* No typography, secondary marks, table borders, or sheet edges may intrude into this clearance envelope.

### 2.3 Minimum Reproduction Sizes
* **Digital:**
  * Full lockup: Minimum width `140px` at 72dpi.
  * Standalone mark: Minimum width `16px × 16px` (hand-hinted SVGs to avoid pixel blur on low-DPI displays).
* **Print:**
  * Full lockup: Minimum width `38mm`.
  * Standalone mark: Minimum width `8mm`.

### 2.4 Logo Rules
* Terminal corners remain clean and deliberate.
* Render in Hedgerow Green, Parchment White, Buttercup, or deep Charcoal.
* Never tilt, skew, or apply artificial decorative shadows.
* Never stick a cartoon animal silhouette, tractor, or novelty graphic alongside it.

---

## 3. Colour Palette & Hierarchy

The palette takes its inspiration from the British agricultural landscape: deep hedgerow foliage, warm parchment paper ledgers, rich oak timber, and bright buttercup accents for primary actions. Every colour pairing guarantees high contrast (WCAG AAA compliant for primary reading) to comfortably support older eyes.

### 3.1 Core Palette (Field & Hedgerow)

| Role | Colour Name | Hex | RGB | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Brand / Header** | *Hedgerow Green* | `#2E4A2B` | `46, 74, 43` | Top navigation, main section headings, brand grounds |
| **Primary Brand Light** | *Hedgerow Leaf* | `#3E613A` | `62, 97, 58` | Hover states, active tabs |
| **Primary Brand Dark** | *Deep Forest* | `#1E331C` | `30, 51, 28` | Navbar base, dark accents |
| **Action / Primary Button** | *Buttercup Yellow* | `#F2C94C` | `242, 201, 76` | Primary buttons, active indicators, focus rings |
| **Action Border / Hover** | *Golden Gorse* | `#D4A82A` | `212, 168, 42` | Button borders, hover shading |
| **Neutral Deep Text** | *Charcoal Peat* | `#2B2A22` | `43, 42, 34` | Primary body copy, table figures, button labels |
| **Mid-Neutral / Labels** | *Oak Brown* | `#6B4F32` | `107, 79, 50` | Column headers, secondary metadata, helper text |
| **Light Neutral / Border** | *Dry Stone* | `#DDD6C1` | `221, 214, 193` | Table gridlines, card borders, dividers |
| **Surface / Card Ground** | *Warm Milk* | `#FFFDF6` | `255, 253, 246` | Data cards, modal sheets, input field grounds |
| **Canvas** | *Parchment* | `#F7F4EA` | `247, 244, 234` | Main page background, application body |

### 3.2 Audit & Validation Status Palette
Used for livestock reconciliation balances and ledger verification. Color is always reinforced with plain symbols (`✓`, `✗`) and explicit plain words so no user relies on colour alone.

* **Reconciled / Balanced (`#1F7A3A` on `#DFEEDD` ground — Clover Green):** Used when `Opening + In - Out = Closing` balances with zero variance. Always accompanied by `✓ Balanced`.
* **Discrepancy / Unresolved (`#A8322A` on `#F5DDD9` ground — Rust Red):** Used when numbers do not reconcile. Always accompanied by `✗ [N] missing / extra`.
* **Pending / Count Needed (`#7A4E0E` on `#F8E8BF` ground — Harvest Amber):** Temporary states awaiting closing tally counts.

### 3.3 Application Rules & Distribution
* **65% Canvas & Surface:** Parchment (`#F7F4EA`) and Warm Milk (`#FFFDF6`) dominant for a warm, easy-on-the-eyes background.
* **25% Structure & Copy:** Hedgerow Green (`#2E4A2B`) and Charcoal Peat (`#2B2A22`) for sharp definition and effortless legibility.
* **10% Action & Verification:** Buttercup Yellow (`#F2C94C`), Clover Green (`#1F7A3A`), and Rust Red (`#A8322A`) reserved strictly for user actions and balancing states.

---

## 4. Typography System

Older farmers should never have to squint or reach for a magnifying glass. Typography prioritises large type sizes, open proportions, zero visual clutter, and unmistakable digit differentiation.

### 4.1 Typeface Selection (Offline-First via Fontsource)
* **Display & Headings:** **Bitter** (Sturdy slab serif with warm rustic character, reminiscent of traditional agricultural books and ledgers).
* **Body, Controls & Numerals:** **Atkinson Hyperlegible Next** (Engineered specifically by the Braille Institute for low-vision and senior readers; shapes for `0`, `O`, `1`, `I`, `l`, `8`, `3`, `5` are distinctly sculpted to prevent confusion).
* **Self-Contained & Offline:** Bundled directly with the application using `@fontsource/bitter` and `@fontsource/atkinson-hyperlegible-next`. Zero reliance on Google Fonts CDN for complete privacy and offline resilience.

### 4.2 Type Hierarchy Spec

| Level | Typeface | Weight | Size / Line Height | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Main Title** | Bitter | Bold (700) | `26px / 34px` | Section titles, farm holding name |
| **Section Headings (H2/H3)**| Bitter | SemiBold (600) | `20px – 22px / 28px`| Category headings, modal headers |
| **Body Copy** | Atkinson Hyperlegible Next | Regular (400) | `16px – 17px / 24px`| Explanations, helper guidance, notices |
| **Table Column Headers** | Atkinson Hyperlegible Next | SemiBold (600) | `15px / 20px` | Category, Inflows, Outflows, Balances |
| **Data Cells (Figures)** | Atkinson Hyperlegible Next | SemiBold (600) | `16px – 17px / 22px`| Tabular numbers, head counts |
| **Primary Button Labels** | Atkinson Hyperlegible Next | Bold (700) | `16px / 20px` | Action buttons (min 48px height touch target) |
| **Status Badges** | Atkinson Hyperlegible Next | SemiBold (600) | `14px – 15px / 18px`| Clear badges with icon + text label |

---

## 5. Tone of Voice & Copy Standards

Stocktaker speaks like a trusted neighbour who has farmed for forty years and happens to be brilliant with accounts: warm, calm, plain-spoken, and respectful.

### 5.1 The Principles
1. **Plain British farming English:** Use natural terms farmers actually use (*heifers in calf*, *stores*, *beast*, *casualties*, *holding number*).
2. **Helpful and reassuring:** Never scold or show alarming red warning banners. If a group does not balance, explain clearly where the difference lies and how to check it.
3. **Never patronise:** Farmers run complex businesses in all weathers. Keep instructions simple, direct, and unpretentious.
4. **No software buzzwords:** Eliminate modern tech jargon. No *frictionless*, *onboarding*, *optimised*, *synergy*, or *dashboards*. Use *Getting started*, *Farm ledger*, *Summary*, *Balances*.
5. **Calm guidance:** Always keep punctuation calm. No exclamation marks in error dialogues.

### 5.2 Copy Comparison Examples

| Context | Cold / Technical | Warm Rural Stocktaker Standard |
| :--- | :--- | :--- |
| **Reconciliation Complete** | "Zero variance detected. Records reconciled." | **Everything balances.** All head accounted for across your records. |
| **Discrepancy Error** | "Arithmetic validation error: -2 head variance." | **2 head out of balance.** The numbers in and out leave 26, but your closing count shows 24. Take a look at deaths or sales for this group. |
| **Empty State** | "No records in database. Click to initialise." | **No stock recorded yet.** Enter your opening head count or load an existing farm file to begin. |
| **Save Confirmation** | "File exported to local filesystem." | **Farm file saved.** Your records are safely saved on your computer. |