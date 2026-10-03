# Stocktaker — Brand Guidelines Specification
**Version:** 1.0  
**Status:** Approved for Implementation  

---

## 1. Brand Essence & Positioning

### 1.1 The Stance
Stocktaker exists to do one job properly: balance the farm books and reconcile livestock numbers to audit standard without the usual headaches. It is not an "agritech lifestyle experience"; it is an exact, unyielding ledger tool built for people who have zero patience for software that loses numbers between the crush and the spreadsheet.

* **Positioning:** Heavy-duty, audit-grade livestock reconciliation.
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
* **Primary Lockup:** Mark positioned to the left of the uppercase wordmark `STOCKTAKER`.
* **Stacked Lockup:** Mark centred directly above the wordmark. Reserved strictly for square formats, mobile splash screens, and app drawer icons.
* **Mark Only (Favicon / App Icon):** Standalone mark enclosed within a rounded square (`border-radius: 22%`) on Slate background.

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

### 2.4 Logo Misuse — What Not To Do
* **Never** round off the sharp terminal corners of the tally lines.
* **Never** tilt, rotate, skew, or apply a drop shadow.
* **Never** render the mark in decorative greens, reds, or gradients.
* **Never** replace the wordmark font with standard system Arial or Helvetica.
* **Never** stick a cartoon animal silhouette, tractor, or ear-tag graphic alongside it.

---

## 3. Colour Palette & Hierarchy

The palette takes its cues from galvanised steel, dark cast iron, and high-visibility ear tags. It remains legibly high-contrast under direct shed lighting or grease-marked field displays.

### 3.1 Core Palette

| Role | Colour Name | Hex | RGB | CMYK | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Base** | *Cast Iron* | `#1E242B` | `30, 36, 43` | `75, 65, 56, 68` | Headers, primary text, brand mark ground |
| **Accent / Action** | *Ear Tag Amber* | `#E67E22` | `230, 126, 34` | `4, 60, 98, 0` | Primary buttons, active row indicators, focus rings |
| **Mid-Neutral** | *Galvanised Slate* | `#64748B` | `100, 116, 139` | `60, 43, 27, 2` | Column headers, subtle borders, metadata labels |
| **Light Neutral** | *Trough Grey* | `#E2E8F0` | `226, 232, 240` | `12, 8, 7, 0` | Table gridlines, card strokes, alternating row fills |
| **Canvas** | *Chalk White* | `#F8FAFC` | `248, 250, 252` | `2, 1, 1, 0` | Main application background, report sheets |

### 3.2 Audit & Validation Status Palette
Used solely for reconciliation balances and audit discrepancies. Never use these for decorative styling.

* **Reconciled / Balanced (`#15803D` — Yard Green):** Used when `Opening + In - Out = Closing` resolves to zero variance.
* **Discrepancy / Unmatched (`#B91C1C` — Cull Red):** Used when tag counts, CTS movements, or valuation figures fail to balance.
* **Pending Verification (`#D97706` — Warning Ochre):** Temporary records awaiting ear-tag allocation or movement confirmation.

### 3.3 Application Rules & Distribution
* **60% Canvas & Sheet:** White and Chalk White dominant for maximum legibility of dense numbers.
* **30% Structure & Text:** Cast Iron and Galvanised Slate providing razor-sharp definition.
* **10% Accent & Status:** Amber, Yard Green, and Cull Red reserved strictly for actions and verification states.

---

## 4. Typography System

Legibility of figures is paramount. Ambiguous digits cost real money when an HMRC audit lands.

### 4.1 Typeface Selection
* **Primary Interface & Headings:** **DIN 2014** or **Barlow Semi Condensed**
* **Body & Explanatory Copy:** **Inter** (UK English features enabled: tabular lining figures available).
* **Reconciliation Grids & Ear Tag Codes:** **JetBrains Mono** or **Geist Mono**

### 4.2 Type Hierarchy Spec

| Level | Typeface | Weight | Size / Line Height | Case / Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Section** | DIN 2014 | Bold (700) | `24px / 32px` | Sentence case, `-0.01em` |
| **Table Headings** | DIN 2014 | Medium (500) | `13px / 18px` | Uppercase, `+0.05em` |
| **Body Text** | Inter | Regular (400) | `14px / 20px` | Sentence case, normal |
| **Data Cells (Text)** | Inter | Regular (400) | `13px / 18px` | Sentence case, normal |
| **Data Cells (Figures)** | JetBrains Mono | Medium (500) | `13px / 18px` | Tabular numbers, `0.00em` |
| **Status / Badge** | DIN 2014 | Bold (700) | `11px / 14px` | Uppercase, `+0.08em` |

---

## 5. Tone of Voice & Copy Standards

Stocktaker speaks like an experienced agricultural accountant who grew up on a farm: bone-dry, polite, highly competent, and allergic to waffle.

### 5.1 The Principles
1. **Never guess, never blag:** If a field is missing, say it’s missing. Don't smooth over data gaps with cheerful assumptions.
2. **Economy of language:** If three words do the job, using ten is just wasting daylight.
3. **No tech buzzwords:** Ban words like *seamless, synergise, delight, frictionless, bespoke,* and *disrupt*. 
4. **Use proper terminology:** Refer to stock correctly (stores, bullocks, heifers in calf, casualties, deemed cost, opening book).
5. **Keep your head:** When a ledger doesn't balance, report the arithmetic calmly. Don't panic, and never use exclamation marks in error states.

### 5.2 Copy Comparison Examples

| Context | Avoid (SaaS Fluff) | Stocktaker Standard (Direct & Dry) |
| :--- | :--- | :--- |
| **Reconciliation Complete** | "Awesome job! You've successfully crushed your stock reconciliations for this quarter! 🎉" | **Reconciled.** 214 head accounted for. No variance detected across CTS records. |
| **Discrepancy Error** | "Oopsie! Looks like our smart system couldn't find a couple of furry friends." | **Unresolved discrepancy:** 3 head missing between CTS movements and closing count. Check pen 4 casualty records. |
| **Empty State** | "Ready to start your magical livestock journey? Add your first cow below!" | **No stock recorded.** Enter opening head count or import herd register CSV to begin. |
| **Deemed Cost Toggle** | "Let our AI magically guess your stock valuation based on the latest market vibes!" | **Valuation basis:** HMRC deemed cost applied at 60% of open market value (BIM55410). |