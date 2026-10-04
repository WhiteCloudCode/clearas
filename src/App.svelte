<script lang="ts">
  import { onMount } from 'svelte';
  import type { MasterFarmFile, LivestockCategory, AccountingPeriod, FarmMetadata, LivestockSpecies } from './types/livestock';
  import {
    create_empty_farm_data,
    load_from_local_cache,
    save_to_local_cache,
    open_file_via_picker,
    save_to_file_handle,
    save_file_as_via_picker,
    download_farm_file,
    read_file_from_input,
    rollover_period,
    validate_period_uniqueness,
    create_trading_category,
    create_blank_category,
  } from './utils/storage';
  import {
    BRAND,
    get_export_filename,
    FILE_INPUT_ACCEPT,
    is_onboarding_completed,
  } from './config/brand';
  import HeaderNavbar from './components/HeaderNavbar.svelte';
  import PeriodBar from './components/PeriodBar.svelte';
  import ReconciliationSummaryCard from './components/ReconciliationSummaryCard.svelte';
  import LivestockGrid from './components/LivestockGrid.svelte';
  import CasualtiesSection from './components/CasualtiesSection.svelte';
  import AccountantReport from './components/AccountantReport.svelte';
  import FarmDetailsModal from './components/FarmDetailsModal.svelte';
  import OnboardingView from './components/OnboardingView.svelte';
  import PeriodModal from './components/PeriodModal.svelte';
  import ConfirmationModal from './components/ConfirmationModal.svelte';
  import GuidedEntryWizard from './components/GuidedEntryWizard.svelte';
  import FileLoadedModal from './components/FileLoadedModal.svelte';
  import { ListFilter, TableProperties, Coffee } from '@lucide/svelte';

  // Core application state
  let data = $state<MasterFarmFile>(create_empty_farm_data());
  let file_handle = $state<FileSystemFileHandle | null>(null);
  let filename = $state<string | null>(null);
  let is_dirty = $state(false);
  let active_view = $state<'onboarding' | 'editor' | 'report'>('editor');
  let editor_mode = $state<'guided' | 'spreadsheet'>('guided');
  let opened_from_workspace = $state(false);
  let is_farm_modal_open = $state(false);
  let is_period_modal_open = $state(false);
  let is_file_loaded_modal_open = $state(false);

  // In-app Confirmation Dialog State
  let confirmation_state = $state<{
    is_open: boolean;
    title: string;
    message: string;
    confirm_text?: string;
    cancel_text?: string;
    is_destructive?: boolean;
    is_alert_only?: boolean;
    action?: () => void;
  }>({
    is_open: false,
    title: '',
    message: '',
    confirm_text: 'Confirm',
    cancel_text: 'Cancel',
    is_destructive: false,
    is_alert_only: false,
  });

  function show_notice(title: string, message: string) {
    confirmation_state = {
      is_open: true,
      title,
      message,
      is_alert_only: true,
      confirm_text: 'Understood',
      action: () => {
        confirmation_state.is_open = false;
      },
    };
  }

  function show_confirm(opts: {
    title: string;
    message: string;
    confirm_text?: string;
    cancel_text?: string;
    is_destructive?: boolean;
    on_confirm: () => void;
  }) {
    confirmation_state = {
      is_open: true,
      title: opts.title,
      message: opts.message,
      confirm_text: opts.confirm_text || 'Confirm',
      cancel_text: opts.cancel_text || 'Cancel',
      is_destructive: opts.is_destructive || false,
      is_alert_only: false,
      action: opts.on_confirm,
    };
  }

  function handle_dialog_confirm() {
    const act = confirmation_state.action;
    confirmation_state.is_open = false;
    if (act) act();
  }

  function handle_dialog_cancel() {
    confirmation_state.is_open = false;
  }

  // Hidden file input reference for browser fallback
  let file_input: HTMLInputElement | null = null;

  // Active period derived state
  let active_period = $derived(
    data.periods.find((p) => p.id === data.active_period_id) || data.periods[0]
  );

  // Restore cached work on initial mount if available
  onMount(() => {
    const cached = load_from_local_cache();
    if (cached) {
      data = cached;
      filename = null; // cached state in browser storage
    }

    // Default to onboarding view if setup is incomplete or no active farm records exist
    if (!is_onboarding_completed() || !cached || !cached.farm.farm_name) {
      opened_from_workspace = false;
      active_view = 'onboarding';
    }

    // Keyboard shortcut for Ctrl+S / Cmd+S
    const handle_keydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save_file();
      }
    };
    window.addEventListener('keydown', handle_keydown);
    return () => window.removeEventListener('keydown', handle_keydown);
  });

  // Automatically sync to local browser storage on change
  $effect(() => {
    // Reading data JSON to track all nested changes
    JSON.stringify(data);
    save_to_local_cache(data);
  });

  // File Operations
  async function open_file() {
    try {
      const result = await open_file_via_picker();
      data = result.data;
      file_handle = result.file_handle;
      filename = result.filename;
      is_dirty = false;
      opened_from_workspace = false;
      active_view = 'editor';
      is_file_loaded_modal_open = true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        // Fallback to traditional file input
        file_input?.click();
      }
    }
  }

  async function handle_file_input_change(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      try {
        const file = target.files[0];
        const loaded_data = await read_file_from_input(file);
        data = loaded_data;
        file_handle = null;
        filename = file.name;
        is_dirty = false;
        active_view = 'editor';
        is_file_loaded_modal_open = true;
      } catch (err) {
        show_notice(
          'File Load Error',
          `Failed to read file. Please ensure it is a valid ${BRAND.name} (${FILE_INPUT_ACCEPT.split(',').join(', ')}) file.`
        );
      }
    }
  }

  async function save_file() {
    if (file_handle) {
      try {
        await save_to_file_handle(file_handle, data);
        is_dirty = false;
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    // If no existing file handle, run Save As
    await save_file_as();
  }

  async function save_file_as() {
    const default_name = get_export_filename(data.farm.farm_name);
    try {
      const result = await save_file_as_via_picker(data, default_name);
      file_handle = result.file_handle;
      filename = result.filename;
      is_dirty = false;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        // Fallback to browser blob download
        await download_farm_file(data, default_name);
        filename = default_name;
        is_dirty = false;
      }
    }
  }

  function new_farm() {
    show_confirm({
      title: 'Start a New Farm?',
      message: 'Are you sure you want to start a new farm? Any unsaved changes in your current session will be lost. Please make sure you have saved your file first.',
      confirm_text: 'Start New Farm',
      on_confirm: () => {
        data = create_empty_farm_data();
        file_handle = null;
        filename = null;
        is_dirty = false;
        opened_from_workspace = false;
        active_view = 'onboarding';
      },
    });
  }

  function handle_complete_setup(
    updated_farm: FarmMetadata,
    category_items: { name: string; classification: 'breeding_herd' | 'trading_stock' }[]
  ) {
    data.farm = { ...updated_farm };

    if (active_period) {
      const existing_map = new Map(
        active_period.categories.map((c) => [`${c.classification}:${c.name.trim().toLowerCase()}`, c])
      );

      const merged: LivestockCategory[] = category_items.map((item) => {
        const key = `${item.classification}:${item.name.trim().toLowerCase()}`;
        const existing = existing_map.get(key);
        if (existing) {
          return { ...existing, name: item.name.trim(), classification: item.classification };
        }
        return create_blank_category(item.name.trim(), item.classification);
      });

      active_period.categories = merged;
    }

    is_dirty = true;
    opened_from_workspace = false;
    active_view = 'editor';
  }

  // Period Actions
  function select_period(id: string) {
    data.active_period_id = id;
  }

  function add_blank_period() {
    let year = new Date().getFullYear();
    while (
      data.periods.some(
        (p) =>
          p.name.trim().toLowerCase() === `Tax Year ${year} - ${year + 1}`.toLowerCase() ||
          p.start_date === `${year}-04-06`
      )
    ) {
      year++;
    }

    const next_tax_year = `Tax Year ${year} - ${year + 1}`;
    const new_period: AccountingPeriod = {
      id: `period-${Date.now()}`,
      name: next_tax_year,
      species: 'cattle',
      start_date: `${year}-04-06`,
      end_date: `${year + 1}-04-05`,
      categories: data.periods[0]
        ? data.periods[0].categories.map((c) => ({
            ...c,
            id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            opening_stock: 0,
            births: 0,
            purchases: 0,
            transfers_in: 0,
            sales: 0,
            deaths: 0,
            own_consumption: 0,
            transfers_out: 0,
            actual_closing_stock: 0,
          }))
        : [],
      deaths_breakdown: {
        under_one_year: 0,
        one_to_two_years: 0,
        over_two_years: 0,
      },
    };

    data.periods.push(new_period);
    data.active_period_id = new_period.id;
    is_dirty = true;
    is_period_modal_open = true;
  }

  function handle_save_period(updated: {
    name: string;
    start_date: string;
    end_date: string;
    species: LivestockSpecies;
    period_notes?: string;
  }) {
    if (!active_period) return;
    active_period.name = updated.name;
    active_period.start_date = updated.start_date;
    active_period.end_date = updated.end_date;
    active_period.species = updated.species;
    active_period.period_notes = updated.period_notes;
    is_dirty = true;
  }

  function trigger_rollover() {
    if (!active_period) return;

    // Parse start and end years to compute next year's dates
    const current_end_year = parseInt(active_period.end_date.split('-')[0]) || new Date().getFullYear();
    const next_start_year = current_end_year;
    const next_end_year = current_end_year + 1;

    const next_name = `Tax Year ${next_start_year} - ${next_end_year}`;
    const next_start_date = `${next_start_year}-04-06`;
    const next_end_date = `${next_end_year}-04-05`;

    // Prevent duplicate rollover
    const rollover_check = validate_period_uniqueness(
      '',
      {
        name: next_name,
        start_date: next_start_date,
        end_date: next_end_date,
        species: active_period.species,
      },
      data.periods
    );

    if (!rollover_check.is_valid) {
      show_notice(
        'Cannot Rollover Year',
        rollover_check.name_error || rollover_check.date_error || 'Duplicate period detected.'
      );
      return;
    }

    show_confirm({
      title: `Rollover to ${next_name}?`,
      message: `This will start a new tax year (${next_start_date} to ${next_end_date}) and copy this year's closing counts into next year's opening stock automatically.`,
      confirm_text: 'Rollover to Next Year',
      on_confirm: () => {
        const rolled_over = rollover_period(
          active_period,
          next_name,
          next_start_date,
          next_end_date
        );
        data.periods.push(rolled_over);
        data.active_period_id = rolled_over.id;
        is_dirty = true;
      },
    });
  }

  function delete_period(id: string) {
    if (data.periods.length <= 1) {
      show_notice('Cannot Delete Period', 'A farm must maintain at least one accounting period.');
      return;
    }
    const target = data.periods.find((p) => p.id === id);
    show_confirm({
      title: 'Delete Accounting Period?',
      message: `Are you sure you want to delete "${target?.name}"? All livestock numbers for this period will be permanently removed.`,
      confirm_text: 'Delete Period',
      is_destructive: true,
      on_confirm: () => {
        data.periods = data.periods.filter((p) => p.id !== id);
        data.active_period_id = data.periods[0].id;
        is_dirty = true;
      },
    });
  }

  // Category Actions: inline row addition without popups
  function add_category(classification: 'breeding_herd' | 'trading_stock') {
    if (!active_period) return;
    const default_name =
      classification === 'breeding_herd'
        ? 'New Breeding Category'
        : 'New Trading Category';

    const new_cat = create_blank_category(default_name, classification);
    active_period.categories.push(new_cat);
    is_dirty = true;
  }

  function delete_category(category_id: string) {
    if (!active_period) return;
    active_period.categories = active_period.categories.filter((c) => c.id !== category_id);
    is_dirty = true;
  }
</script>

<svelte:head>
  <title>{BRAND.name} — {BRAND.tagline}</title>
</svelte:head>

<!-- Hidden fallback file input -->
<input
  type="file"
  accept={FILE_INPUT_ACCEPT}
  bind:this={file_input}
  onchange={handle_file_input_change}
  class="hidden"
/>

<!-- Main App Layout -->
<div class="min-h-screen flex flex-col bg-canvas text-primary">
  <HeaderNavbar
    farm={data.farm}
    {filename}
    {is_dirty}
    {active_view}
    on_open_file={open_file}
    on_save_file={save_file}
    on_save_file_as={save_file_as}
    on_new_farm={new_farm}
    on_open_farm_modal={() => (is_farm_modal_open = true)}
    on_open_tour={() => {
      opened_from_workspace = true;
      active_view = 'onboarding';
    }}
    on_toggle_view={(view) => {
      opened_from_workspace = false;
      active_view = view;
    }}
  />

  {#if active_view === 'editor'}
    <PeriodBar
      periods={data.periods}
      active_period_id={data.active_period_id}
      on_select_period={select_period}
      on_add_period={add_blank_period}
      on_edit_period={() => (is_period_modal_open = true)}
      on_rollover_period={trigger_rollover}
      on_delete_period={delete_period}
    />
  {/if}

  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {#if active_view === 'onboarding'}
      <!-- Dedicated Full-Screen Onboarding & Setup View -->
      <OnboardingView
        farm={data.farm}
        categories={active_period ? active_period.categories : []}
        has_active_session={opened_from_workspace}
        on_complete={handle_complete_setup}
        on_open_file={open_file}
        on_cancel={() => {
          opened_from_workspace = false;
          active_view = 'editor';
        }}
      />
    {:else if active_period}
      {#if active_view === 'editor'}
        <!-- Mode Switcher Pill (Guided Flow vs Spreadsheet View) -->
        <div class="mb-4 flex items-center justify-between no-print">
          <div class="inline-flex p-1 bg-white border border-border rounded-xl shadow-2xs">
            <button
              type="button"
              onclick={() => (editor_mode = 'guided')}
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {editor_mode === 'guided'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-text-muted hover:text-primary hover:bg-canvas'}"
            >
              <ListFilter class="w-3.5 h-3.5 {editor_mode === 'guided' ? 'text-accent' : ''}" />
              <span>Guided Entry (Step-by-Step)</span>
            </button>
            <button
              type="button"
              onclick={() => (editor_mode = 'spreadsheet')}
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {editor_mode === 'spreadsheet'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-text-muted hover:text-primary hover:bg-canvas'}"
            >
              <TableProperties class="w-3.5 h-3.5 {editor_mode === 'spreadsheet' ? 'text-accent' : ''}" />
              <span>Spreadsheet View (All Numbers)</span>
            </button>
          </div>

          <span class="text-xs text-text-muted hidden sm:inline">
            {editor_mode === 'guided' ? 'Simplified question-by-question entry' : 'Complete multi-column schedule'}
          </span>
        </div>

        <!-- Reconciliation Monitor Card -->
        <ReconciliationSummaryCard period={active_period} />

        {#if editor_mode === 'guided'}
          <!-- Guided Step-by-Step Entry Wizard -->
          <GuidedEntryWizard
            bind:period={active_period}
            on_switch_to_spreadsheet={() => (editor_mode = 'spreadsheet')}
          />
        {:else}
          <!-- Movement Grid -->
          <LivestockGrid
            bind:period={active_period}
            on_add_category={add_category}
            on_delete_category={delete_category}
          />

          <!-- Casualties Breakdown -->
          <CasualtiesSection bind:period={active_period} />
        {/if}
      {:else if active_view === 'report'}
        <!-- Professional Print & PDF Schedule -->
        <AccountantReport
          farm={data.farm}
          period={active_period}
          on_back_to_editor={() => (active_view = 'editor')}
        />
      {/if}
    {/if}
  </main>

  <!-- Application Footer (Buy Me a Coffee & Rural Identity, hidden during print) -->
  <footer class="mt-auto border-t border-border/70 bg-surface/80 py-5 text-xs text-text no-print">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-text-muted text-center sm:text-left">
        <span class="font-display font-extrabold text-primary text-sm">{BRAND.name}</span>
        <span>•</span>
        <span>Free, zero-backend, privacy-first livestock reconciliation for British farming.</span>
      </div>
      <a
        href="https://buymeacoffee.com/iainwhite"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-text font-semibold border border-accent-border transition-colors shadow-2xs cursor-pointer"
        title="Support Stocktaker development on Buy Me a Coffee"
      >
        <Coffee class="w-4 h-4 text-text" />
        <span>Buy me a coffee</span>
      </a>
    </div>
  </footer>
</div>

<!-- Farm Details Modal -->
<FarmDetailsModal
  bind:farm={data.farm}
  is_open={is_farm_modal_open}
  on_close={() => {
    is_farm_modal_open = false;
    is_dirty = true;
  }}
/>

<!-- Period Edit Modal -->
{#if active_period}
  <PeriodModal
    period={active_period}
    existing_periods={data.periods}
    is_open={is_period_modal_open}
    on_save={handle_save_period}
    on_close={() => (is_period_modal_open = false)}
  />
{/if}

<!-- Reusable In-App Confirmation / Notice Modal -->
<ConfirmationModal
  is_open={confirmation_state.is_open}
  title={confirmation_state.title}
  message={confirmation_state.message}
  confirm_text={confirmation_state.confirm_text}
  cancel_text={confirmation_state.cancel_text}
  is_destructive={confirmation_state.is_destructive}
  is_alert_only={confirmation_state.is_alert_only}
  on_confirm={handle_dialog_confirm}
  on_cancel={handle_dialog_cancel}
/>

<!-- File Load Confirmation Modal -->
<FileLoadedModal
  is_open={is_file_loaded_modal_open}
  filename={filename || 'Farm File'}
  farm_name={data.farm.farm_name}
  cph_number={data.farm.cph_number}
  last_modified={data.last_modified}
  period_count={data.periods.length}
  on_confirm={() => (is_file_loaded_modal_open = false)}
  on_choose_different={() => {
    is_file_loaded_modal_open = false;
    open_file();
  }}
/>
