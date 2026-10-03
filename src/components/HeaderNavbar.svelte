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
</script>

<header class="bg-cast-iron text-white border-b border-cast-iron-light shadow-md no-print">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16 gap-4">
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
        {#if active_view === 'onboarding'}
          <!-- Setup Mode Header: Only Open button -->
          <button
            onclick={on_open_file}
            class="px-3 py-1.5 rounded-lg bg-cast-iron-light hover:bg-cast-iron-light/80 text-trough hover:text-white border border-galvanised/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title={`Open an existing ${BRAND.name} file (${BRAND.file_extension}, .json)`}
          >
            <FolderOpen class="w-3.5 h-3.5" />
            <span>Open Existing File</span>
          </button>
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
              class="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-ear-tag hover:bg-ear-tag-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Save your farm file (Ctrl+S)"
            >
              <Save class="w-3.5 h-3.5" />
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
