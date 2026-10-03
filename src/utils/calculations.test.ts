import { describe, expect, it } from 'vitest';
import type { AccountingPeriod, LivestockCategory } from '../types/livestock';
import {
  calculate_category_discrepancy,
  calculate_category_expected_closing,
  calculate_category_inflows,
  calculate_category_outflows,
  diagnose_discrepancy,
  summarise_period,
  validate_deaths_breakdown,
} from './calculations';

describe('Livestock Reconciliation Calculations', () => {
  it('correctly calculates inflows and outflows for a single category', () => {
    const category: LivestockCategory = {
      id: 'fat-bullocks',
      name: 'Bought Bullocks',
      classification: 'trading_stock',
      opening_stock: 100,
      births: 0,
      purchases: 41,
      transfers_in: 0,
      sales: 88,
      deaths: 1,
      own_consumption: 0,
      transfers_out: 0,
      actual_closing_stock: 52,
    };

    expect(calculate_category_inflows(category)).toBe(141);
    expect(calculate_category_outflows(category)).toBe(89);
    expect(calculate_category_expected_closing(category)).toBe(52);
    expect(calculate_category_discrepancy(category)).toBe(0);
  });

  it('detects an unreconciled discrepancy when physical stock exceeds inflows minus outflows', () => {
    const test_period: AccountingPeriod = {
      id: 'test-period-unbalanced',
      name: 'Tax Year 2025 - 2026',
      species: 'cattle',
      start_date: '2025-04-06',
      end_date: '2026-04-05',
      categories: [
        {
          id: 'stock-bulls',
          name: 'Stock Bulls',
          classification: 'breeding_herd',
          opening_stock: 0,
          births: 0,
          purchases: 1,
          transfers_in: 0,
          sales: 0,
          deaths: 0,
          own_consumption: 0,
          transfers_out: 0,
          actual_closing_stock: 0,
        },
        {
          id: 'beef-cows',
          name: 'Beef Cows',
          classification: 'breeding_herd',
          opening_stock: 0,
          births: 47,
          purchases: 0,
          transfers_in: 0,
          sales: 5,
          deaths: 0,
          own_consumption: 0,
          transfers_out: 0,
          actual_closing_stock: 0,
        },
        {
          id: 'trading-cattle',
          name: 'Trading Cattle',
          classification: 'trading_stock',
          opening_stock: 255,
          births: 0,
          purchases: 73,
          transfers_in: 0,
          sales: 135,
          deaths: 2,
          own_consumption: 0,
          transfers_out: 0,
          actual_closing_stock: 244,
        },
      ],
      deaths_breakdown: {
        under_one_year: 1,
        one_to_two_years: 1,
        over_two_years: 0,
      },
    };

    const summary = summarise_period(test_period);

    // Inflows: 255 (opening) + 47 (births) + 74 (purchases: 73 + 1) = 376
    expect(summary.total_inflows).toBe(376);

    // Outflows: 140 (sales: 135 + 5) + 2 (deaths) = 142 outflows
    expect(summary.total_sales).toBe(140);
    expect(summary.total_deaths).toBe(2);
    expect(summary.total_outflows).toBe(142);

    // Expected closing: 376 - 142 = 234
    expect(summary.reconciled_closing_stock).toBe(234);

    // Actual closing stock is 244
    expect(summary.actual_closing_stock).toBe(244);

    // Discrepancy is 244 - 234 = +10
    expect(summary.discrepancy).toBe(10);
    expect(summary.is_balanced).toBe(false);

    // Check deaths breakdown validation
    const deaths_check = validate_deaths_breakdown(test_period);
    expect(deaths_check.is_matching).toBe(true);
    expect(deaths_check.breakdown_total).toBe(2);

    // Check diagnostic message
    const diagnosis = diagnose_discrepancy(summary);
    expect(diagnosis).toContain('Surplus: You have recorded 10 more animals');
  });

  it('confirms a balanced reconciliation when closing stock matches formula', () => {
    const balanced_period: AccountingPeriod = {
      id: 'balanced-2025-2026',
      name: 'Cattle 2025 - 2026',
      species: 'cattle',
      start_date: '2025-04-06',
      end_date: '2026-04-05',
      categories: [
        {
          id: 'trading',
          name: 'Trading Stock',
          classification: 'trading_stock',
          opening_stock: 255,
          births: 47,
          purchases: 74,
          transfers_in: 0,
          sales: 140,
          deaths: 2,
          own_consumption: 0,
          transfers_out: 0,
          actual_closing_stock: 234, // Correct closing count
        },
      ],
      deaths_breakdown: {
        under_one_year: 1,
        one_to_two_years: 1,
        over_two_years: 0,
      },
    };

    const summary = summarise_period(balanced_period);
    expect(summary.discrepancy).toBe(0);
    expect(summary.is_balanced).toBe(true);
    expect(diagnose_discrepancy(summary)).toContain('fully balanced');
  });
});
