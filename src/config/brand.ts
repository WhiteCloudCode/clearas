/**
 * Application Brand & Identity Configuration
 * Single source of truth for application naming, branding initials,
 * file formats, storage keys, and document presentation.
 *
 * To rebrand the application in future, edit the values in this file.
 */

export const BRAND = {
  // Brand name displayed across navigation, dialogues, and reports
  name: 'Stocktaker',

  // 1-3 letter initials for the header logo badge
  initials: 'ST',

  // Primary domain tagline
  tagline: 'Every head counted. Every book balanced.',

  // Subtitle displayed in navbar header
  subtitle: 'No gaps. No guesswork.',

  // Primary file extension (including leading dot)
  file_extension: '.stocktaker',

  // Local storage cache keys
  storage_cache_key: 'stocktaker_active_farm_v1',
  onboarding_completed_key: 'stocktaker_onboarding_completed',
  text_zoom_key: 'stocktaker_text_zoom_scale',

  // Legacy backwards-compatibility identifiers
  legacy_extensions: ['.stk', '.cam', '.clearas', '.clearasmud', '.agribook', '.farform'] as const,
  legacy_storage_cache_keys: [
    'cam_active_farm_v2',
    'cam_active_farm_v1',
  ] as const,
  legacy_onboarding_keys: [
    'cam_onboarding_completed',
  ] as const,
} as const;

/**
 * Generates the default export filename based on farm name and the configured brand extension.
 */
export function get_export_filename(farm_name: string = ''): string {
  const clean_slug = farm_name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'farm';
  return `${clean_slug}-livestock${BRAND.file_extension}`;
}

/**
 * All supported file extensions for file pickers and file inputs.
 */
export const SUPPORTED_FILE_EXTENSIONS = [
  BRAND.file_extension,
  ...BRAND.legacy_extensions,
  '.json',
] as const;

/**
 * Accept attribute string for HTML <input type="file" />.
 */
export const FILE_INPUT_ACCEPT = SUPPORTED_FILE_EXTENSIONS.join(',');

/**
 * File picker options for the File System Access API (Open).
 */
export function get_open_file_picker_types() {
  return [
    {
      description: `${BRAND.name} Farm File (*${BRAND.file_extension}, ${BRAND.legacy_extensions.map((e) => `*${e}`).join(', ')}, *.json)`,
      accept: {
        'application/octet-stream': [BRAND.file_extension, ...BRAND.legacy_extensions],
        'application/json': ['.json'],
      },
    },
  ];
}

/**
 * File picker options for the File System Access API (Save As).
 */
export function get_save_file_picker_types() {
  return [
    {
      description: `${BRAND.name} Farm File (*${BRAND.file_extension})`,
      accept: {
        'application/octet-stream': [BRAND.file_extension],
      },
    },
  ];
}

/**
 * Normalises a filename for download, ensuring it ends with a supported extension or appends the brand extension.
 */
export function normalise_download_filename(filename: string): string {
  const is_supported = SUPPORTED_FILE_EXTENSIONS.some((ext) => filename.endsWith(ext));
  return is_supported ? filename : `${filename}${BRAND.file_extension}`;
}

/**
 * Checks whether onboarding has been completed across current or legacy keys.
 */
export function is_onboarding_completed(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    if (localStorage.getItem(BRAND.onboarding_completed_key)) return true;
    return BRAND.legacy_onboarding_keys.some((key) => Boolean(localStorage.getItem(key)));
  } catch {
    return false;
  }
}

/**
 * Marks onboarding as completed across current and legacy keys.
 */
export function mark_onboarding_completed(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(BRAND.onboarding_completed_key, 'true');
    for (const key of BRAND.legacy_onboarding_keys) {
      localStorage.setItem(key, 'true');
    }
  } catch {
    // Ignore storage errors
  }
}
