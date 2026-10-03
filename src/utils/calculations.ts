import type { AccountingPeriod, LivestockCategory, PeriodReconciliationSummary } from '../types/livestock';

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
