import type {
  AccountingPeriod,
  FarmMetadata,
  LivestockCategory,
  LivestockSpecies,
  MasterFarmFile,
} from '../types/livestock';
import { compress_data, decompress_data } from './compression';
import {
  BRAND,
  get_open_file_picker_types,
  get_save_file_picker_types,
  normalise_download_filename,
} from '../config/brand';

const FORMAT_VERSION = 1;

export interface CattleCategoryPreset {
  id: string;
  name: string;
  classification: 'breeding_herd' | 'trading_stock';
  included_by_default: boolean;
}

/**
 * Single catalogue of UK cattle categories used for both the default farm template
 * and the onboarding quick-add options.
 *
 * Herd basis (BIM55220): a female animal only joins the production herd once mature,
 * i.e. after producing her first calf. Unserved and in-calf heifers therefore sit in
 * Trading Stock and are moved into the Breeding Herd via Transfers Out / Transfers In
 * when they calve.
 */
export const CATTLE_CATEGORY_PRESETS: readonly CattleCategoryPreset[] = [
  { id: 'stock-bulls', name: 'Stock Bulls', classification: 'breeding_herd', included_by_default: true },
  { id: 'beef-cows', name: 'Beef Cows (calved)', classification: 'breeding_herd', included_by_default: true },
  { id: 'dairy-cows', name: 'Dairy Cows (calved)', classification: 'breeding_herd', included_by_default: false },

  { id: 'replacement-heifers', name: 'Replacement Heifers (unserved / in-calf)', classification: 'trading_stock', included_by_default: true },
  { id: 'fat-bullocks', name: 'Fat Bullocks / Steers', classification: 'trading_stock', included_by_default: true },
  { id: 'fat-heifers', name: 'Fat Heifers', classification: 'trading_stock', included_by_default: true },
  { id: 'store-cattle', name: 'Store Cattle', classification: 'trading_stock', included_by_default: true },
  { id: 'cull-cows', name: 'Cull Cows', classification: 'trading_stock', included_by_default: true },
  { id: 'calves-under-1-yr', name: 'Calves (under 1 year)', classification: 'trading_stock', included_by_default: true },
  { id: 'youngstock-1-2-yrs', name: 'Youngstock (1–2 years)', classification: 'trading_stock', included_by_default: false },
  { id: 'young-bulls', name: 'Young Bulls / Bull Beef', classification: 'trading_stock', included_by_default: false },
  { id: 'cull-bulls', name: 'Cull Bulls', classification: 'trading_stock', included_by_default: false },
];

export const DEFAULT_BREEDING_CATEGORY_PRESETS = CATTLE_CATEGORY_PRESETS.filter(
  (preset) => preset.classification === 'breeding_herd'
).map((preset) => preset.name);

export const DEFAULT_TRADING_CATEGORY_PRESETS = CATTLE_CATEGORY_PRESETS.filter(
  (preset) => preset.classification === 'trading_stock'
).map((preset) => preset.name);

/**
 * Creates a blank category with zeroed initial balances
 */
export function create_blank_category(
  name: string,
  classification: 'breeding_herd' | 'trading_stock'
): LivestockCategory {
  return {
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    classification,
    opening_stock: 0,
    births: 0,
    purchases: 0,
    transfers_in: 0,
    sales: 0,
    deaths: 0,
    own_consumption: 0,
    transfers_out: 0,
    actual_closing_stock: 0,
    opening_value_per_head: 0,
    closing_value_per_head: 0,
  };
}

/**
 * Creates a blank trading stock category with zeroed initial balances
 */
export function create_trading_category(name: string): LivestockCategory {
  return create_blank_category(name, 'trading_stock');
}

/**
 * Creates a blank breeding herd category with zeroed initial balances
 */
export function create_breeding_category(name: string): LivestockCategory {
  return create_blank_category(name, 'breeding_herd');
}

export interface PeriodValidationResult {
  is_valid: boolean;
  name_error: string | null;
  date_error: string | null;
}

/**
 * Validates accounting period uniqueness and date consistency within a farm file.
 * Prevents duplicate period names or duplicate date ranges for the same livestock enterprise.
 */
export function validate_period_uniqueness(
  target_id: string,
  draft: {
    name: string;
    start_date: string;
    end_date: string;
    species: LivestockSpecies;
  },
  existing_periods: AccountingPeriod[]
): PeriodValidationResult {
  const trimmed = draft.name.trim().toLowerCase();
  let name_error: string | null = null;
  if (!trimmed) {
    name_error = 'Period name cannot be empty.';
  } else if (
    existing_periods.some((p) => p.id !== target_id && p.name.trim().toLowerCase() === trimmed)
  ) {
    name_error = `A period named "${draft.name.trim()}" already exists in this farm file.`;
  }

  let date_error: string | null = null;
  if (!draft.start_date || !draft.end_date) {
    date_error = 'Start and end dates are required.';
  } else if (draft.start_date >= draft.end_date) {
    date_error = 'Start date must be before end date.';
  } else if (
    existing_periods.some(
      (p) =>
        p.id !== target_id &&
        p.start_date === draft.start_date &&
        p.end_date === draft.end_date &&
        p.species === draft.species
    )
  ) {
    date_error = `A period covering ${draft.start_date} to ${draft.end_date} already exists for this enterprise.`;
  }

  return {
    is_valid: !name_error && !date_error,
    name_error,
    date_error,
  };
}

/**
 * Creates the default template categories for UK cattle farms from the presets
 * flagged `included_by_default`. Stable ids keep default categories traceable
 * across period rollovers. Farmers can delete, rename, or add bespoke categories.
 */
export function create_default_cattle_categories(): LivestockCategory[] {
  return CATTLE_CATEGORY_PRESETS.filter((preset) => preset.included_by_default).map((preset) => ({
    ...create_blank_category(preset.name, preset.classification),
    id: preset.id,
  }));
}

/**
 * Creates a brand new empty farm configuration
 */
export function create_empty_farm_data(name: string = ''): MasterFarmFile {
  const initial_period: AccountingPeriod = {
    id: `period-${Date.now()}`,
    name: 'Tax Year 2025 - 2026',
    species: 'cattle',
    start_date: '2025-04-06',
    end_date: '2026-04-05',
    categories: create_default_cattle_categories(),
    deaths_breakdown: {
      under_one_year: 0,
      one_to_two_years: 0,
      over_two_years: 0,
      tb_reactors: 0,
      notes: '',
    },
    period_notes: '',
  };

  return {
    format_version: FORMAT_VERSION,
    application: BRAND.name,
    last_modified: new Date().toISOString(),
    farm: {
      farm_name: name,
      cph_number: '',
      farmer_name: '',
      holding_address: '',
      accountant_firm: '',
      currency: '£',
    },
    periods: [initial_period],
    active_period_id: initial_period.id,
  };
}

/**
 * Automatically creates a new accounting period by rolling over closing stock from the previous period
 */
export function rollover_period(
  previous_period: AccountingPeriod,
  new_name: string,
  start_date: string,
  end_date: string
): AccountingPeriod {
  const new_categories = previous_period.categories.map((cat) => ({
    ...cat,
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    opening_stock: Number(cat.actual_closing_stock || 0),
    births: 0,
    purchases: 0,
    transfers_in: 0,
    sales: 0,
    deaths: 0,
    own_consumption: 0,
    transfers_out: 0,
    actual_closing_stock: Number(cat.actual_closing_stock || 0),
    opening_value_per_head: Number(cat.closing_value_per_head || 0),
    closing_value_per_head: Number(cat.closing_value_per_head || 0),
  }));

  return {
    id: `period-${Date.now()}`,
    name: new_name,
    species: previous_period.species,
    start_date,
    end_date,
    categories: new_categories,
    deaths_breakdown: {
      under_one_year: 0,
      one_to_two_years: 0,
      over_two_years: 0,
      tb_reactors: 0,
    },
    period_notes: `Rolled over from ${previous_period.name}. Opening stock matches previous actual closing stock.`,
  };
}

/**
 * Saves current farm state to browser local storage for crash protection
 */
export function save_to_local_cache(data: MasterFarmFile): void {
  try {
    const payload = JSON.stringify({
      ...data,
      last_modified: new Date().toISOString(),
    });
    localStorage.setItem(BRAND.storage_cache_key, payload);
  } catch (error) {
    console.error('Failed to save to local cache:', error);
  }
}

/**
 * Loads farm state from browser local storage
 */
export function load_from_local_cache(): MasterFarmFile | null {
  try {
    let raw = localStorage.getItem(BRAND.storage_cache_key);
    if (!raw) {
      for (const legacy_key of BRAND.legacy_storage_cache_keys) {
        raw = localStorage.getItem(legacy_key);
        if (raw) break;
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.farm && Array.isArray(parsed.periods)) {
      return parsed as MasterFarmFile;
    }
  } catch (error) {
    console.error('Failed to load from local cache:', error);
  }
  return null;
}

/**
 * Checks if the browser supports the File System Access API
 */
export function supports_file_system_access(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

/**
 * Prompts the user to pick and open an existing .clearas, .agribook, .farform or .json storage file
 */
export async function open_file_via_picker(): Promise<{
  file_handle: FileSystemFileHandle | null;
  data: MasterFarmFile;
  filename: string;
}> {
  if (supports_file_system_access()) {
    const [file_handle] = await (window as any).showOpenFilePicker({
      types: get_open_file_picker_types(),
      multiple: false,
    });

    const file = await file_handle.getFile();
    const buffer = await file.arrayBuffer();
    const data = await decompress_data(buffer);
    return { file_handle, data, filename: file.name };
  }

  throw new Error('File System Access API is not supported in this browser.');
}

/**
 * Saves master data directly to an open FileSystemFileHandle as compressed binary
 */
export async function save_to_file_handle(
  file_handle: FileSystemFileHandle,
  data: MasterFarmFile
): Promise<void> {
  data.last_modified = new Date().toISOString();
  const compressed_bytes = await compress_data(data);
  const writable = await (file_handle as any).createWritable();
  await writable.write(compressed_bytes);
  await writable.close();
}

/**
 * Prompts the user for a save location using File System Access API
 */
export async function save_file_as_via_picker(
  data: MasterFarmFile,
  suggested_name: string
): Promise<{ file_handle: FileSystemFileHandle; filename: string }> {
  if (supports_file_system_access()) {
    const file_handle = await (window as any).showSaveFilePicker({
      suggestedName: suggested_name,
      types: get_save_file_picker_types(),
    });

    await save_to_file_handle(file_handle, data);
    const file = await file_handle.getFile();
    return { file_handle, filename: file.name };
  }

  throw new Error('File System Access API is not supported in this browser.');
}

/**
 * Universal fallback download method for browsers that do not support the File System Access API
 */
export async function download_farm_file(data: MasterFarmFile, filename: string): Promise<void> {
  data.last_modified = new Date().toISOString();
  const compressed_bytes = await compress_data(data);
  const blob = new Blob([compressed_bytes as any], {
    type: 'application/octet-stream',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = normalise_download_filename(filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads and decompresses a Clearas, Agribook, Farform, or JSON file from a standard HTML file input
 */
export async function read_file_from_input(file: File): Promise<MasterFarmFile> {
  const buffer = await file.arrayBuffer();
  return await decompress_data(buffer);
}

/**
 * Formats an ISO 8601 date string into a user-friendly UK English timestamp
 * e.g. "4 October 2026 at 13:20" (full) or "4 Oct, 13:20" (compact)
 */
export function format_uk_datetime(
  iso_date?: string,
  style: 'full' | 'compact' = 'full'
): string {
  if (!iso_date) return 'Unknown date';
  const date = new Date(iso_date);
  if (isNaN(date.getTime())) return 'Unknown date';

  if (style === 'compact') {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  const date_part = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  const time_part = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${date_part} at ${time_part}`;
}
