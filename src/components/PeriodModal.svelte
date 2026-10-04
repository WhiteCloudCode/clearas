<script lang="ts">
  import type { AccountingPeriod, LivestockSpecies } from '../types/livestock';
  import { validate_period_uniqueness } from '../utils/storage';
  import { X, Calendar, AlertCircle, Check, Sparkles, Tag, FileText } from '@lucide/svelte';

  interface Props {
    period: AccountingPeriod;
    existing_periods: AccountingPeriod[];
    is_open: boolean;
    on_save: (updated: {
      name: string;
      start_date: string;
      end_date: string;
      species: LivestockSpecies;
      period_notes?: string;
    }) => void;
    on_close: () => void;
  }

  let { period, existing_periods, is_open, on_save, on_close }: Props = $props();

  // Local draft state
  let draft_name = $state('');
  let draft_start_date = $state('');
  let draft_end_date = $state('');
  let draft_species = $state<LivestockSpecies>('cattle');
  let draft_notes = $state('');

  // Synchronise draft whenever modal opens or period changes
  $effect(() => {
    if (is_open && period) {
      draft_name = period.name;
      draft_start_date = period.start_date;
      draft_end_date = period.end_date;
      draft_species = period.species;
      draft_notes = period.period_notes || '';
    }
  });

  // UK Tax Year quick presets
  const presets = [
    { label: '2023 / 24', start: '2023-04-06', end: '2024-04-05', name: 'Tax Year 2023 - 2024' },
    { label: '2024 / 25', start: '2024-04-06', end: '2025-04-05', name: 'Tax Year 2024 - 2025' },
    { label: '2025 / 26', start: '2025-04-06', end: '2026-04-05', name: 'Tax Year 2025 - 2026' },
    { label: '2026 / 27', start: '2026-04-06', end: '2027-04-05', name: 'Tax Year 2026 - 2027' },
    { label: '2027 / 28', start: '2027-04-06', end: '2028-04-05', name: 'Tax Year 2027 - 2028' },
  ];

  function apply_preset(p: { label: string; start: string; end: string; name: string }) {
    draft_name = p.name;
    draft_start_date = p.start;
    draft_end_date = p.end;
  }

  // Period validation & duplicate checks
  let validation = $derived(
    validate_period_uniqueness(
      period?.id || '',
      {
        name: draft_name,
        start_date: draft_start_date,
        end_date: draft_end_date,
        species: draft_species,
      },
      existing_periods
    )
  );

  let duplicate_name_error = $derived(validation.name_error);
  let duplicate_date_error = $derived(validation.date_error);
  let is_valid = $derived(validation.is_valid);

  function handle_submit(e: Event) {
    e.preventDefault();
    if (!is_valid) return;
    on_save({
      name: draft_name.trim(),
      start_date: draft_start_date,
      end_date: draft_end_date,
      species: draft_species,
      period_notes: draft_notes.trim(),
    });
    on_close();
  }
</script>

{#if is_open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-primary/70 backdrop-blur-xs p-4 no-print animate-in fade-in duration-150">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-border flex flex-col">
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-primary text-white flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="p-1.5 rounded-lg bg-slate-800 text-slate-200">
            <Calendar class="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white leading-tight font-display">Edit Accounting Period</h2>
            <p class="text-xs text-text-muted">Set your tax year dates and livestock type</p>
          </div>
        </div>

        <button
          onclick={on_close}
          class="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Form Body -->
      <form onsubmit={handle_submit} class="p-6 space-y-5">
        <!-- Quick UK Tax Year Presets -->
        <div>
          <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-accent" />
            Quick UK Tax Year Presets (6 Apr &rarr; 5 Apr)
          </label>
          <div class="grid grid-cols-5 gap-1.5">
            {#each presets as p}
              <button
                type="button"
                onclick={() => apply_preset(p)}
                class="py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer {draft_name === p.name
                  ? 'bg-primary text-white border-primary shadow-2xs'
                  : 'bg-canvas hover:bg-slate-100 text-primary border-border'}"
              >
                {p.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Period Name / Title -->
        <div>
          <label for="period-name-input" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag class="w-3.5 h-3.5 text-text-muted" />
            Period Name / Label
          </label>
          <input
            id="period-name-input"
            type="text"
            bind:value={draft_name}
            placeholder="e.g. Tax Year 2024 - 2025"
            class="w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-sm font-medium bg-white text-primary {duplicate_name_error ? 'border-danger bg-danger/5' : 'border-border'}"
            required
          />
          {#if duplicate_name_error}
            <div class="flex items-center gap-1 text-xs text-danger mt-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" />
              <span>{duplicate_name_error}</span>
            </div>
          {/if}
        </div>

        <!-- Start & End Date Pickers -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="period-start-date" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              id="period-start-date"
              type="date"
              bind:value={draft_start_date}
              class="w-full py-2 px-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-sm font-mono bg-white text-primary"
              required
            />
          </div>

          <div>
            <label for="period-end-date" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              id="period-end-date"
              type="date"
              bind:value={draft_end_date}
              class="w-full py-2 px-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-sm font-mono bg-white text-primary"
              required
            />
          </div>
        </div>

        {#if duplicate_date_error}
          <div class="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{duplicate_date_error}</span>
          </div>
        {/if}

        <!-- Species / Enterprise -->
        <div>
          <label for="period-species-select" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Livestock Type
          </label>
          <select
            id="period-species-select"
            bind:value={draft_species}
            class="w-full py-2 px-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white text-primary"
          >
            <option value="cattle">Cattle (Bulls, Cows, Bullocks, Heifers, Calves)</option>
            <option value="sheep">Sheep (Rams, Ewes, Lambs)</option>
            <option value="other">Other Livestock</option>
          </select>
        </div>

        <!-- Notes for Accountant -->
        <div>
          <label for="period-notes-textarea" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
            <FileText class="w-3.5 h-3.5 text-text-muted" />
            Notes for your Accountant (Optional)
          </label>
          <textarea
            id="period-notes-textarea"
            bind:value={draft_notes}
            rows="2"
            placeholder="e.g. Closing numbers checked against annual CTS holding register."
            class="w-full py-2 px-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-xs bg-white text-primary"
          ></textarea>
        </div>

        <!-- Modal Actions -->
        <div class="pt-4 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onclick={on_close}
            class="px-4 py-2 bg-border/60 hover:bg-border text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!is_valid}
            class="px-5 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-text text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer border border-accent-border"
          >
            <Check class="w-4 h-4 text-text" />
            Save Period
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
