/**
 * Clearas Livestock Types and Data Contracts
 * Uses UK English throughout (reconciliation, categorisation, etc.)
 */

export type LivestockSpecies = 'cattle' | 'sheep' | 'pigs' | 'other';

export type LivestockClassification = 'breeding_herd' | 'trading_stock';

export interface LivestockCategory {
  id: string;
  name: string;
  classification: LivestockClassification; // 'breeding_herd' (HMRC Herd Basis capital) vs 'trading_stock' (revenue)
  opening_stock: number;
  births: number;
  purchases: number;
  transfers_in: number;
  sales: number;
  deaths: number;
  own_consumption: number;
  transfers_out: number;
  actual_closing_stock: number;
  notes?: string;
}

export interface DeathsBreakdown {
  under_one_year: number; // calves (< 1 year)
  one_to_two_years: number; // yearlings (1–2 years)
  over_two_years: number; // mature stock (> 2 years)
  notes?: string;
}

export interface AccountingPeriod {
  id: string;
  name: string; // e.g. "Tax Year 2025 - 2026"
  species: LivestockSpecies;
  start_date: string; // e.g. "2025-04-06"
  end_date: string;   // e.g. "2026-04-05"
  categories: LivestockCategory[];
  deaths_breakdown: DeathsBreakdown;
  period_notes?: string;
}

export interface FarmMetadata {
  farm_name: string;
  cph_number: string; // County Parish Holding number (standard UK holding ID)
  farmer_name: string;
  holding_address?: string;
  accountant_firm?: string;
  currency: string;
}

export interface MasterFarmFile {
  format_version: number;
  application: string;
  last_modified: string;
  farm: FarmMetadata;
  periods: AccountingPeriod[];
  active_period_id: string;
}

export interface PeriodReconciliationSummary {
  total_opening_stock: number;
  total_births: number;
  total_purchases: number;
  total_transfers_in: number;
  total_inflows: number;

  total_sales: number;
  total_deaths: number;
  total_own_consumption: number;
  total_transfers_out: number;
  total_outflows: number;

  reconciled_closing_stock: number; // calculated: total_inflows - total_outflows
  actual_closing_stock: number;     // physical count recorded on farm
  discrepancy: number;              // actual_closing_stock - reconciled_closing_stock
  is_balanced: boolean;             // discrepancy === 0
}
