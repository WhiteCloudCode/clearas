<script lang="ts">
  import type { FarmMetadata } from '../types/livestock';
  import {
    FolderOpen,
    Save,
    Download,
    FileSpreadsheet,
    FilePlus,
    Edit3,
    Check,
    FileText,
    HelpCircle,
    ZoomIn,
    ZoomOut,
    RotateCcw,
  } from '@lucide/svelte';
  import { BRAND } from '../config/brand';

  interface Props {
    farm: FarmMetadata;
    filename: string | null;
    is_dirty: boolean;
    active_view: 'onboarding' | 'editor' | 'report';
    on_open_file: () => void;
    on_save_file: () => void;
    on_save_file_as: () => void;
    on_new_farm: () => void;
    on_open_farm_modal: () => void;
    on_open_tour: () => void;
    on_toggle_view: (view: 'onboarding' | 'editor' | 'report') => void;
  }

  let {
    farm,
    filename,
    is_dirty,
    active_view,
    on_open_file,
    on_save_file,
    on_save_file_as,
    on_new_farm,
    on_open_farm_modal,
    on_open_tour,
    on_toggle_view,
  }: Props = $props();

  // Zoom scale state (1.0 = 100% default, from 0.8 = 80% up to 1.8 = 180%)
  let zoom_scale = $state<number>(1.0);
  let is_zoom_menu_open = $state(false);

  function apply_zoom(scale: number) {
    const clamped = Math.min(1.8, Math.max(0.8, Math.round(scale * 100) / 100));
    zoom_scale = clamped;
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--app-font-scale', clamped.toString());
    }
    try {
      localStorage.setItem(BRAND.text_zoom_key, clamped.toString());
    } catch {
      // Ignore storage errors
    }
  }

  function adjust_zoom(delta: number) {
    apply_zoom(zoom_scale + delta);
  }

  function reset_zoom() {
    apply_zoom(1.0);
  }

  // Restore saved zoom level on load
  $effect(() => {
    try {
      const saved = localStorage.getItem(BRAND.text_zoom_key);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0.8 && parsed <= 1.8) {
          apply_zoom(parsed);
          return;
        }
      }
    } catch {
      // Ignore
    }
    apply_zoom(1.0);
  });
</script>

<header class="bg-cast-iron text-white border-b border-cast-iron-light shadow-md no-print">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between min-h-16 py-2 gap-3 flex-wrap sm:flex-nowrap">
      <!-- Brand & Farm Title -->
      <div class="flex items-center gap-4 min-w-0">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-cast-iron-dark border border-galvanised/40 flex items-center justify-center font-bold font-mono text-ear-tag shadow-inner text-sm">
            {BRAND.initials}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-base tracking-wider uppercase text-white font-display">{BRAND.name}</span>
              <span class="text-[10px] uppercase font-semibold bg-cast-iron-light text-galvanised-light px-1.5 py-0.5 rounded tracking-wide border border-galvanised/30 font-mono">
                Livestock
              </span>
            </div>
            <p class="text-xs text-galvanised-light hidden sm:block">{BRAND.subtitle}</p>
          </div>
        </div>

        {#if active_view !== 'onboarding'}
          <div class="h-8 w-px bg-galvanised/30 hidden md:block"></div>

          <!-- Farm details pill -->
          <button
            onclick={on_open_farm_modal}
            class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cast-iron-light/60 hover:bg-cast-iron-light text-left border border-galvanised/30 transition-colors group cursor-pointer"
            title="Click to edit farm name & holding details"
          >
            <div>
              <div class="text-xs font-semibold text-trough flex items-center gap-1 group-hover:text-white">
                {farm.farm_name || 'Unnamed Farm'}
                <Edit3 class="w-3 h-3 text-galvanised-light group-hover:text-trough" />
              </div>
              <div class="text-[11px] text-galvanised-light font-mono">
                CPH: {farm.cph_number || 'Not specified'}
              </div>
            </div>
          </button>
        {/if}
      </div>

      <!-- File Status Badge (Hidden during onboarding) -->
      {#if active_view !== 'onboarding'}
        <div class="hidden xl:flex items-center gap-2 text-xs">
          <div class="px-2.5 py-1 rounded-full bg-cast-iron-light/70 border border-galvanised/30 flex items-center gap-1.5 text-galvanised-light font-mono">
            <span class="w-2 h-2 rounded-full {is_dirty ? 'bg-ear-tag animate-pulse' : 'bg-yard-green'}"></span>
            <span>{filename ? filename : 'Local Auto-Save'}</span>
            {#if is_dirty}
              <span class="text-[10px] text-ear-tag font-sans font-medium">(Unsaved)</span>
            {:else}
              <Check class="w-3 h-3 text-yard-green" />
            {/if}
          </div>
        </div>
      {/if}

      <!-- Actions & View Switcher -->
      <div class="flex items-center gap-2">
        {#snippet zoom_control()}
          <div class="relative flex items-center">
            <button
              type="button"
              onclick={() => (is_zoom_menu_open = !is_zoom_menu_open)}
              class="p-2 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer {is_zoom_menu_open
                ? 'bg-cast-iron-light text-white border-buttercup'
                : active_view === 'onboarding'
                  ? 'bg-cast-iron-light text-white border-ear-tag ring-2 ring-ear-tag ring-offset-2 ring-offset-cast-iron shadow-sm animate-pulse'
                  : 'bg-cast-iron-light/40 hover:bg-cast-iron-light text-trough hover:text-white border-galvanised/30'}"
              title={active_view === 'onboarding' ? 'Adjust text size (default 100%)' : 'Adjust text size for easier reading'}
              aria-expanded={is_zoom_menu_open}
            >
              <span class="font-display font-bold text-sm leading-none text-buttercup">A</span>
              <span class="{active_view === 'onboarding' ? 'inline' : 'hidden xl:inline'} text-xs">{Math.round(zoom_scale * 100)}%</span>
            </button>

            {#if is_zoom_menu_open}
              <!-- Backdrop to dismiss -->
              <button
                type="button"
                tabindex="-1"
                onclick={() => (is_zoom_menu_open = false)}
                class="fixed inset-0 z-40 cursor-default bg-transparent"
                aria-label="Close zoom menu"
              ></button>

              <!-- Zoom Controls Dropdown -->
              <div class="absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-3.5 bg-warm-milk text-peat rounded-xl shadow-xl border-2 border-dry-stone space-y-3 animate-in fade-in zoom-in-95 duration-100">
                <div class="flex items-center justify-between pb-2 border-b border-dry-stone">
                  <span class="font-display font-bold text-sm text-hedgerow">Text Size</span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-hedgerow-leaf/15 text-hedgerow font-mono">
                    {Math.round(zoom_scale * 100)}%
                  </span>
                </div>

                <!-- Quick Jump Presets -->
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[11px] text-oak font-semibold">
                    <span>Quick Jump</span>
                    <span class="text-[10px] text-oak/80">80% &ndash; 180%</span>
                  </div>
                  <div class="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onclick={() => apply_zoom(0.8)}
                      class="py-1 px-1 rounded text-xs font-bold border transition-colors cursor-pointer text-center {Math.round(zoom_scale * 100) === 80
                        ? 'bg-hedgerow text-white border-hedgerow shadow-2xs'
                        : 'bg-parchment hover:bg-dry-stone text-peat border-dry-stone'}"
                      title="Set text size to 80%"
                    >
                      80%
                    </button>
                    <button
                      type="button"
                      onclick={() => apply_zoom(1.0)}
                      class="py-1 px-1 rounded text-xs font-bold border transition-colors cursor-pointer text-center {Math.round(zoom_scale * 100) === 100
                        ? 'bg-hedgerow text-white border-hedgerow shadow-2xs'
                        : 'bg-parchment hover:bg-dry-stone text-peat border-dry-stone'}"
                      title="Set text size to default 100%"
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      onclick={() => apply_zoom(1.4)}
                      class="py-1 px-1 rounded text-xs font-bold border transition-colors cursor-pointer text-center {Math.round(zoom_scale * 100) === 140
                        ? 'bg-hedgerow text-white border-hedgerow shadow-2xs'
                        : 'bg-parchment hover:bg-dry-stone text-peat border-dry-stone'}"
                      title="Set text size to 140%"
                    >
                      140%
                    </button>
                    <button
                      type="button"
                      onclick={() => apply_zoom(1.8)}
                      class="py-1 px-1 rounded text-xs font-bold border transition-colors cursor-pointer text-center {Math.round(zoom_scale * 100) === 180
                        ? 'bg-hedgerow text-white border-hedgerow shadow-2xs'
                        : 'bg-parchment hover:bg-dry-stone text-peat border-dry-stone'}"
                      title="Set text size to 180%"
                    >
                      180%
                    </button>
                  </div>
                </div>

                <!-- Quick Steppers (+/- 10%) -->
                <div class="flex items-center gap-1.5 justify-between">
                  <button
                    type="button"
                    onclick={() => adjust_zoom(-0.1)}
                    disabled={zoom_scale <= 0.8}
                    class="flex-1 py-1.5 px-2 rounded-lg bg-parchment hover:bg-dry-stone text-peat border border-dry-stone disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Make text smaller (-10%)"
                  >
                    <ZoomOut class="w-3.5 h-3.5" />
                    <span>Smaller</span>
                  </button>

                  <button
                    type="button"
                    onclick={reset_zoom}
                    class="py-1.5 px-2 rounded-lg bg-parchment hover:bg-dry-stone text-oak border border-dry-stone font-semibold text-xs flex items-center justify-center cursor-pointer transition-colors"
                    title="Reset text size to 100% default"
                  >
                    <RotateCcw class="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onclick={() => adjust_zoom(0.1)}
                    disabled={zoom_scale >= 1.8}
                    class="flex-1 py-1.5 px-2 rounded-lg bg-parchment hover:bg-dry-stone text-peat border border-dry-stone disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Make text larger (+10%)"
                  >
                    <ZoomIn class="w-3.5 h-3.5" />
                    <span>Larger</span>
                  </button>
                </div>

                <!-- Continuous Slider with mathematically accurate percentage tick alignment -->
                <div class="space-y-1">
                  <div class="relative w-full h-3.5 text-[11px] text-oak font-semibold">
                    <span class="absolute left-0">80%</span>
                    <span class="absolute left-[20%] -translate-x-1/2">100%</span>
                    <span class="absolute left-[60%] -translate-x-1/2">140%</span>
                    <span class="absolute right-0">180%</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.8"
                    step="0.05"
                    value={zoom_scale}
                    oninput={(e) => apply_zoom(parseFloat(e.currentTarget.value))}
                    class="w-full accent-hedgerow cursor-pointer"
                  />
                </div>

                <p class="text-[11px] text-oak leading-tight m-0">
                  Saves automatically on this device.
                </p>
              </div>
            {/if}
          </div>
        {/snippet}

        {#if active_view === 'onboarding'}
          <!-- Setup Mode Header: Open button & Text Size Zoom -->
          <button
            onclick={on_open_file}
            class="px-3 py-1.5 rounded-lg bg-cast-iron-light hover:bg-cast-iron-light/80 text-trough hover:text-white border border-galvanised/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title={`Open an existing ${BRAND.name} file (${BRAND.file_extension}, .json)`}
          >
            <FolderOpen class="w-3.5 h-3.5" />
            <span>Open Existing File</span>
          </button>

          {@render zoom_control()}
        {:else}
          <!-- Standard Workspace Header Controls -->
          <div class="bg-cast-iron-dark p-0.5 rounded-lg flex items-center border border-galvanised/30 text-xs">
            <button
              onclick={() => on_toggle_view('editor')}
              class="px-2.5 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all {active_view === 'editor' ? 'bg-galvanised-dark text-white shadow-xs' : 'text-galvanised-light hover:text-white'}"
            >
              <FileSpreadsheet class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Livestock Numbers</span>
            </button>
            <button
              onclick={() => on_toggle_view('report')}
              class="px-2.5 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all {active_view === 'report' ? 'bg-galvanised-dark text-white shadow-xs' : 'text-galvanised-light hover:text-white'}"
            >
              <FileText class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Accountant Report</span>
            </button>
          </div>

          <!-- File Storage Buttons -->
          <div class="flex items-center gap-1 pl-2 border-l border-cast-iron-light">
            <button
              onclick={on_open_file}
              class="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-cast-iron-light/70 hover:bg-cast-iron-light text-trough hover:text-white border border-galvanised/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title={`Open an existing ${BRAND.name} file (${BRAND.file_extension}, .json)`}
            >
              <FolderOpen class="w-3.5 h-3.5" />
              <span class="hidden md:inline">Open</span>
            </button>

            <button
              onclick={on_save_file}
              class="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-ear-tag hover:bg-ear-tag-hover text-peat text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer border border-buttercup-border"
              title="Save your farm file (Ctrl+S)"
            >
              <Save class="w-3.5 h-3.5 text-peat" />
              <span class="hidden sm:inline">Save</span>
            </button>

            <button
              onclick={on_save_file_as}
              class="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-cast-iron-light/70 hover:bg-cast-iron-light text-trough hover:text-white border border-galvanised/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Save a copy of your farm file"
            >
              <Download class="w-3.5 h-3.5" />
              <span class="hidden lg:inline">Save As</span>
            </button>

            <!-- Text Size Zoom Control -->
            {@render zoom_control()}

            <button
              onclick={on_open_tour}
              class="p-2 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer bg-cast-iron-light/40 hover:bg-cast-iron-light text-galvanised-light hover:text-white border-galvanised/30"
              title="Help & Farm Setup Guide"
            >
              <HelpCircle class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Guide</span>
            </button>

            <button
              onclick={on_new_farm}
              class="p-2 rounded-lg bg-cast-iron-light/40 hover:bg-cast-iron-light text-galvanised-light hover:text-white border border-galvanised/30 transition-colors cursor-pointer"
              title="Start a new farm"
            >
              <FilePlus class="w-3.5 h-3.5" />
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>
