import type {
  AccountingPeriod,
  FarmMetadata,
  HerdBasisSummary,
  LivestockCategory,
  PeriodReconciliationSummary,
  ValuationSummary,
} from '../types/livestock';

/**
 * Calculates total inflows for a specific category:
 * Opening Stock + Births + Purchases + Transfers In
 */
export function calculate_category_inflows(category: LivestockCategory): number {
  return (
    Number(category.opening_stock || 0) +
    Number(category.births || 0) +
    Number(category.purchases || 0) +
    Number(category.transfers_in || 0)
  );
}

/**
 * Calculates total outflows for a specific category:
 * Sales + Deaths + Own Consumption + Transfers Out
 */
export function calculate_category_outflows(category: LivestockCategory): number {
  return (
    Number(category.sales || 0) +
    Number(category.deaths || 0) +
    Number(category.own_consumption || 0) +
    Number(category.transfers_out || 0)
  );
}

/**
 * Calculates the expected closing stock based on inflows and outflows
 */
export function calculate_category_expected_closing(category: LivestockCategory): number {
  return calculate_category_inflows(category) - calculate_category_outflows(category);
}

/**
 * Calculates category discrepancy between actual physical count and expected closing stock
 */
export function calculate_category_discrepancy(category: LivestockCategory): number {
  return Number(category.actual_closing_stock || 0) - calculate_category_expected_closing(category);
}

/**
 * Analyzes the HMRC Herd Basis position for capital breeding stock
 * Enforces BIM55525 (20% Substantial Reduction rule), BIM55530 (Additions), and BIM55535 (Minor reductions)
 */
export function calculate_herd_basis_summary(period: AccountingPeriod): HerdBasisSummary {
  const breeding_categories = period.categories.filter((c) => c.classification === 'breeding_herd');

  const opening_head = breeding_categories.reduce((acc, c) => acc + Number(c.opening_stock || 0), 0);
  const closing_head = breeding_categories.reduce((acc, c) => acc + Number(c.actual_closing_stock || 0), 0);
  const net_change_head = closing_head - opening_head;

  if (opening_head === 0 && closing_head === 0) {
    return {
      opening_head: 0,
      closing_head: 0,
      net_change_head: 0,
      percentage_change: 0,
      status: 'none',
      status_badge: 'No Breeding Herd',
      tax_rule: 'N/A',
      tax_treatment: 'No capital breeding livestock recorded in this accounting period.',
    };
  }

  if (opening_head === 0 && closing_head > 0) {
    return {
      opening_head: 0,
      closing_head,
      net_change_head: closing_head,
      percentage_change: 100,
      status: 'expansion',
      status_badge: 'New Herd Established',
      tax_rule: 'BIM55530',
      tax_treatment: 'Initial cost of establishing the production herd is non-deductible capital expenditure.',
    };
  }

  const percentage_change = Math.round(((closing_head - opening_head) / opening_head) * 1000) / 10;

  if (net_change_head > 0) {
    return {
      opening_head,
      closing_head,
      net_change_head,
      percentage_change,
      status: 'expansion',
      status_badge: `Herd Expansion (+${net_change_head} Head)`,
      tax_rule: 'BIM55530',
      tax_treatment: `Net increase of ${net_change_head} head (+${percentage_change}%). Costs of herd additions are non-deductible capital expenditure.`,
    };
  }

  if (net_change_head === 0) {
    return {
      opening_head,
      closing_head,
      net_change_head: 0,
      percentage_change: 0,
      status: 'stable',
      status_badge: 'Stable Herd Size (0% Variance)',
      tax_rule: 'BIM55505',
      tax_treatment: 'Breeding herd head count is fully maintained. Disposals were matched by replacements.',
    };
  }

  // Reductions
  const reduction_percentage = Math.abs(percentage_change);
  if (reduction_percentage >= 20) {
    return {
      opening_head,
      closing_head,
      net_change_head,
      percentage_change,
      status: 'substantial_reduction',
      status_badge: `Substantial Reduction (-${reduction_percentage}%)`,
      tax_rule: 'BIM55540',
      tax_treatment: `Substantial contraction of 20% or more (-${Math.abs(net_change_head)} head). Profit or loss on disposal without replacement is excluded from taxable trading profits (capital receipt under BIM55540).`,
    };
  }

  return {
    opening_head,
    closing_head,
    net_change_head,
    percentage_change,
    status: 'minor_reduction',
    status_badge: `Minor Reduction (-${reduction_percentage}%)`,
    tax_rule: 'BIM55535',
    tax_treatment: `Minor contraction of under 20% (-${Math.abs(net_change_head)} head). Net profit or loss on disposal without replacement is treated as revenue and included in trading profits under BIM55535.`,
  };
}

/**
 * Calculates financial balance sheet valuations and P&L stock movements (£) under HS232
 */
export function calculate_valuations_summary(period: AccountingPeriod): ValuationSummary {
  let has_valuations = false;
  let breeding_opening_value = 0;
  let breeding_closing_value = 0;
  let trading_opening_value = 0;
  let trading_closing_value = 0;

  for (const cat of period.categories) {
    const op_val_rate = Number(cat.opening_value_per_head || 0);
    const cl_val_rate = Number(cat.closing_value_per_head || 0);

    if (op_val_rate > 0 || cl_val_rate > 0) {
      has_valuations = true;
    }

    const op_total = Number(cat.opening_stock || 0) * op_val_rate;
    const cl_total = Number(cat.actual_closing_stock || 0) * cl_val_rate;

    if (cat.classification === 'breeding_herd') {
      breeding_opening_value += op_total;
      breeding_closing_value += cl_total;
    } else {
      trading_opening_value += op_total;
      trading_closing_value += cl_total;
    }
  }

  return {
    has_valuations,
    breeding_opening_value,
    breeding_closing_value,
    breeding_movement: breeding_closing_value - breeding_opening_value,
    trading_opening_value,
    trading_closing_value,
    trading_movement: trading_closing_value - trading_opening_value,
    total_opening_value: breeding_opening_value + trading_opening_value,
    total_closing_value: breeding_closing_value + trading_closing_value,
    total_movement: (breeding_closing_value + trading_closing_value) - (breeding_opening_value + trading_opening_value),
  };
}

/**
 * Computes a complete reconciliation summary for an accounting period
 */
export function summarise_period(period: AccountingPeriod): PeriodReconciliationSummary {
  let total_opening_stock = 0;
  let total_births = 0;
  let total_purchases = 0;
  let total_transfers_in = 0;

  let total_sales = 0;
  let total_deaths = 0;
  let total_own_consumption = 0;
  let total_transfers_out = 0;
  let actual_closing_stock = 0;

  for (const category of period.categories) {
    total_opening_stock += Number(category.opening_stock || 0);
    total_births += Number(category.births || 0);
    total_purchases += Number(category.purchases || 0);
    total_transfers_in += Number(category.transfers_in || 0);

    total_sales += Number(category.sales || 0);
    total_deaths += Number(category.deaths || 0);
    total_own_consumption += Number(category.own_consumption || 0);
    total_transfers_out += Number(category.transfers_out || 0);

    actual_closing_stock += Number(category.actual_closing_stock || 0);
  }

  const total_inflows = total_opening_stock + total_births + total_purchases + total_transfers_in;
  const total_outflows = total_sales + total_deaths + total_own_consumption + total_transfers_out;
  const reconciled_closing_stock = total_inflows - total_outflows;
  const discrepancy = actual_closing_stock - reconciled_closing_stock;

  const herd_basis = calculate_herd_basis_summary(period);
  const valuations = calculate_valuations_summary(period);

  return {
    total_opening_stock,
    total_births,
    total_purchases,
    total_transfers_in,
    total_inflows,

    total_sales,
    total_deaths,
    total_own_consumption,
    total_transfers_out,
    total_outflows,

    reconciled_closing_stock,
    actual_closing_stock,
    discrepancy,
    is_balanced: discrepancy === 0,

    herd_basis,
    valuations,
  };
}

/**
 * Validates whether the detailed deaths breakdown matches total recorded category deaths
 */
export function validate_deaths_breakdown(period: AccountingPeriod): {
  is_matching: boolean;
  breakdown_total: number;
  recorded_total: number;
} {
  const breakdown_total =
    Number(period.deaths_breakdown.under_one_year || 0) +
    Number(period.deaths_breakdown.one_to_two_years || 0) +
    Number(period.deaths_breakdown.over_two_years || 0);

  const recorded_total = period.categories.reduce(
    (total, category) => total + Number(category.deaths || 0),
    0
  );

  return {
    is_matching: breakdown_total === recorded_total,
    breakdown_total,
    recorded_total,
  };
}

/**
 * Returns user-friendly UK English diagnostic guidance when a discrepancy occurs
 */
export function diagnose_discrepancy(summary: PeriodReconciliationSummary): string {
  if (summary.is_balanced) {
    return 'The livestock schedule is fully balanced. Numbers in match numbers out plus your closing count on farm.';
  }

  const absolute_diff = Math.abs(summary.discrepancy);
  const animal_word = absolute_diff === 1 ? 'animal' : 'animals';

  if (summary.discrepancy > 0) {
    return `Surplus: You have recorded ${absolute_diff} more ${animal_word} than your numbers account for. Check whether any births or purchases were missed, or if the closing count on farm was over-estimated.`;
  }

  return `Shortfall: You have ${absolute_diff} fewer ${animal_word} than expected from your numbers in and out. Check whether unrecorded deaths, private sales, or home kills occurred, or if the closing count on farm was under-estimated.`;
}

/**
 * Generates an accountant-ready text schedule formatted specifically for
 * HMRC SA103F Box 103 (Any Other Information) / CT600 / SA104F Box 3.116
 */
export function generate_hmrc_box103_text(farm: FarmMetadata, period: AccountingPeriod): string {
  const summary = summarise_period(period);
  const herd = summary.herd_basis;
  const vals = summary.valuations;
  const tb_count = Number(period.deaths_breakdown.tb_reactors || 0);

  const lines: string[] = [
    `=== HMRC LIVESTOCK RECONCILIATION SCHEDULE (SA103F BOX 103 / CT600) ===`,
    `Farm / Holding: ${farm.farm_name || 'Livestock Holding'}${farm.cph_number ? ` (CPH: ${farm.cph_number})` : ''}`,
    `Proprietor: ${farm.farmer_name || 'N/A'}${farm.accountant_firm ? ` | Accountant: ${farm.accountant_firm}` : ''}`,
    `Accounting Period: ${period.name} (${period.start_date} to ${period.end_date}) | Enterprise: ${period.species.toUpperCase()}`,
    ``,
    `1. PHYSICAL RECONCILIATION SUMMARY (HEAD COUNT):`,
    `   Opening Stock Count: ${summary.total_opening_stock}`,
    `   + Natural Increase (Births): ${summary.total_births}`,
    `   + Purchases (Bought In): ${summary.total_purchases}`,
    `   + Transfers In: ${summary.total_transfers_in}`,
    `   = TOTAL INFLOWS (A): ${summary.total_inflows}`,
    ``,
    `   Disposals & Outflows:`,
    `   - Sales: ${summary.total_sales}`,
    `   - Casualties & Deaths: ${summary.total_deaths} (Calves <1yr: ${period.deaths_breakdown.under_one_year}, Yearlings 1-2yr: ${period.deaths_breakdown.one_to_two_years}, Mature >2yr: ${period.deaths_breakdown.over_two_years}${tb_count > 0 ? `, incl. ${tb_count} statutory TB/compulsory slaughter` : ''})`,
    `   - Home Consumption / Farm Kill: ${summary.total_own_consumption}`,
    `   - Transfers Out: ${summary.total_transfers_out}`,
    `   + Closing Stock on Hand: ${summary.actual_closing_stock}`,
    `   = TOTAL DISPOSALS & CLOSING (B): ${summary.total_outflows + summary.actual_closing_stock}`,
    `   Reconciliation Discrepancy (B - A): ${summary.discrepancy} (${summary.is_balanced ? 'Fully Balanced' : 'Variance Detected'})`,
    ``,
    `2. HMRC HERD BASIS CAPITAL SCHEDULE (ITTOIA 2005 / BIM55500):`,
    `   Breeding Herd: ${herd.opening_head} Opening -> ${herd.closing_head} Closing (Net Change: ${herd.net_change_head >= 0 ? '+' : ''}${herd.net_change_head} Head, ${herd.percentage_change}%)`,
    `   Statutory Classification: ${herd.status_badge} [HMRC ${herd.tax_rule}]`,
    `   Tax Treatment: ${herd.tax_treatment}`,
  ];

  if (tb_count > 0) {
    lines.push(
      ``,
      `3. STATUTORY COMPULSORY SLAUGHTER (BIM55560 / HS224):`,
      `   ${tb_count} head compulsorily slaughtered under statutory animal health disease powers (Bovine TB). Statutory replacement and election relief provisions apply under BIM55560.`
    );
  }

  if (vals.has_valuations) {
    lines.push(
      ``,
      `4. BALANCE SHEET VALUATIONS (£) (HS232 DEEMED COST / COST BASIS):`,
      `   Breeding Herd Capital Asset: Opening £${vals.breeding_opening_value.toLocaleString()} | Closing £${vals.breeding_closing_value.toLocaleString()} (Net Capital Movement: £${vals.breeding_movement.toLocaleString()})`,
      `   Trading Stock Revenue Inventory: Opening £${vals.trading_opening_value.toLocaleString()} | Closing £${vals.trading_closing_value.toLocaleString()} (P&L Stock Movement: £${vals.trading_movement.toLocaleString()})`,
      `   Total Livestock Stock Valuation: Opening £${vals.total_opening_value.toLocaleString()} | Closing £${vals.total_closing_value.toLocaleString()}`
    );
  }

  lines.push(
    ``,
    `Certified private on-farm record generated via Stocktaker (UK Agricultural Standards).`
  );

  return lines.join('\n');
}
