import { describe, expect, it } from 'vitest';
import { BRAND } from '../config/brand';
import {
  create_empty_farm_data,
  rollover_period,
  validate_period_uniqueness,
  create_trading_category,
  create_breeding_category,
  create_blank_category,
  format_uk_datetime,
} from './storage';

describe('Storage and Period Rollover Management', () => {
  it('creates valid empty farm data with the standard 8 UK cattle categories pre-populated by default', () => {
    const data = create_empty_farm_data();
    expect(data.application).toBe(BRAND.name);
    expect(data.farm.farm_name).toBe('');
    expect(data.periods.length).toBe(1);

    const categories = data.periods[0].categories;
    expect(categories.length).toBe(8);

    const breeding_categories = categories.filter((c) => c.classification === 'breeding_herd');
    expect(breeding_categories.length).toBe(2);
    expect(breeding_categories.map((c) => c.name)).toContain('Stock Bulls');
    expect(breeding_categories.map((c) => c.name)).toContain('Beef Cows (calved)');

    const trading_categories = categories.filter((c) => c.classification === 'trading_stock');
    expect(trading_categories.length).toBe(6);
    expect(trading_categories.map((c) => c.name)).toContain('Store Cattle');
    // Heifers are immature (not yet calved) so they are trading stock, not herd basis (BIM55220)
    expect(trading_categories.map((c) => c.name)).toContain('Replacement Heifers (unserved / in-calf)');

    // All initial numbers should be 0
    for (const cat of categories) {
      expect(cat.opening_stock).toBe(0);
      expect(cat.actual_closing_stock).toBe(0);
    }
  });

  it('correctly creates new categories with create_blank_category, create_trading_category, and create_breeding_category', () => {
    const trade_cat = create_trading_category('Store Cattle');
    expect(trade_cat.name).toBe('Store Cattle');
    expect(trade_cat.classification).toBe('trading_stock');
    expect(trade_cat.opening_stock).toBe(0);
    expect(trade_cat.actual_closing_stock).toBe(0);

    const breed_cat = create_breeding_category('Dairy Cows (calved)');
    expect(breed_cat.name).toBe('Dairy Cows (calved)');
    expect(breed_cat.classification).toBe('breeding_herd');
    expect(breed_cat.opening_stock).toBe(0);
    expect(breed_cat.actual_closing_stock).toBe(0);
  });

  it('correctly rolls over closing stock to next period opening stock', () => {
    const initial_data = create_empty_farm_data('Test Farm');
    const period_1 = initial_data.periods[0];

    // Set closing stock and valuation on first category
    period_1.categories[0].actual_closing_stock = 42;
    period_1.categories[0].closing_value_per_head = 1450;
    period_1.deaths_breakdown.tb_reactors = 5;

    const period_2 = rollover_period(
      period_1,
      'Tax Year 2026 - 2027',
      '2026-04-06',
      '2027-04-05'
    );

    expect(period_2.name).toBe('Tax Year 2026 - 2027');
    expect(period_2.start_date).toBe('2026-04-06');
    expect(period_2.end_date).toBe('2027-04-05');

    // Rolled over category opening stock should match previous closing stock (42)
    expect(period_2.categories[0].opening_stock).toBe(42);
    expect(period_2.categories[0].opening_value_per_head).toBe(1450);
    expect(period_2.categories[0].purchases).toBe(0);
    expect(period_2.categories[0].sales).toBe(0);
    expect(period_2.categories[0].deaths).toBe(0);

    // Deaths breakdown should be reset to 0
    expect(period_2.deaths_breakdown.under_one_year).toBe(0);
    expect(period_2.deaths_breakdown.one_to_two_years).toBe(0);
    expect(period_2.deaths_breakdown.tb_reactors).toBe(0);
  });

  describe('Period Validation and Duplicate Prevention', () => {
    const sample_data = create_empty_farm_data('Highland Farm');
    const period_1 = sample_data.periods[0]; // 'Tax Year 2025 - 2026', cattle, 2025-04-06 to 2026-04-05

    it('allows a period to keep its own name and dates without self-collision', () => {
      const res = validate_period_uniqueness(
        period_1.id,
        {
          name: period_1.name,
          start_date: period_1.start_date,
          end_date: period_1.end_date,
          species: period_1.species,
        },
        sample_data.periods
      );
      expect(res.is_valid).toBe(true);
      expect(res.name_error).toBeNull();
      expect(res.date_error).toBeNull();
    });

    it('flags duplicate period names case-insensitively and with trimmed whitespace', () => {
      const res = validate_period_uniqueness(
        'new-period-id',
        {
          name: '  tax year 2025 - 2026  ',
          start_date: '2026-04-06',
          end_date: '2027-04-05',
          species: 'cattle',
        },
        sample_data.periods
      );
      expect(res.is_valid).toBe(false);
      expect(res.name_error).toContain('already exists');
    });

    it('flags empty period names', () => {
      const res = validate_period_uniqueness(
        'new-period-id',
        {
          name: '   ',
          start_date: '2026-04-06',
          end_date: '2027-04-05',
          species: 'cattle',
        },
        sample_data.periods
      );
      expect(res.is_valid).toBe(false);
      expect(res.name_error).toBe('Period name cannot be empty.');
    });

    it('flags chronological date errors where start date is on or after end date', () => {
      const res = validate_period_uniqueness(
        'new-period-id',
        {
          name: 'Tax Year 2027 - 2028',
          start_date: '2027-04-06',
          end_date: '2027-04-06',
          species: 'cattle',
        },
        sample_data.periods
      );
      expect(res.is_valid).toBe(false);
      expect(res.date_error).toBe('Start date must be before end date.');
    });

    it('flags duplicate date ranges for the same species enterprise', () => {
      const res = validate_period_uniqueness(
        'new-period-id',
        {
          name: 'Different Name But Same Dates',
          start_date: '2025-04-06',
          end_date: '2026-04-05',
          species: 'cattle',
        },
        sample_data.periods
      );
      expect(res.is_valid).toBe(false);
      expect(res.date_error).toContain('already exists for this enterprise');
    });

    it('allows identical date ranges if the species enterprise differs', () => {
      const res = validate_period_uniqueness(
        'new-period-id',
        {
          name: 'Sheep Enterprise 2025/26',
          start_date: '2025-04-06',
          end_date: '2026-04-05',
          species: 'sheep',
        },
        sample_data.periods
      );
      expect(res.is_valid).toBe(true);
      expect(res.name_error).toBeNull();
      expect(res.date_error).toBeNull();
    });
  });

  describe('format_uk_datetime', () => {
    it('returns "Unknown date" for undefined, null, or invalid strings', () => {
      expect(format_uk_datetime(undefined)).toBe('Unknown date');
      expect(format_uk_datetime('')).toBe('Unknown date');
      expect(format_uk_datetime('invalid-date')).toBe('Unknown date');
    });

    it('formats valid ISO dates into full UK English string', () => {
      const formatted = format_uk_datetime('2026-10-04T13:20:00Z', 'full');
      expect(formatted).toContain('October 2026');
      expect(formatted).toContain('at');
    });

    it('formats valid ISO dates into compact UK English string', () => {
      const formatted = format_uk_datetime('2026-10-04T13:20:00Z', 'compact');
      expect(formatted).toContain('Oct');
    });
  });
});
