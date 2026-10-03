<script lang="ts">
  import type { AccountingPeriod } from '../types/livestock';
  import { Calendar, Plus, ArrowRightLeft, Trash2, CalendarDays, Edit3 } from '@lucide/svelte';

  interface Props {
    periods: AccountingPeriod[];
    active_period_id: string;
    on_select_period: (id: string) => void;
    on_add_period: () => void;
    on_edit_period: () => void;
    on_rollover_period: () => void;
    on_delete_period: (id: string) => void;
  }

  let {
    periods,
    active_period_id,
    on_select_period,
    on_add_period,
    on_edit_period,
    on_rollover_period,
    on_delete_period,
  }: Props = $props();

  let active_period = $derived(periods.find((p) => p.id === active_period_id) || periods[0]);
</script>

<div class="bg-white border-b border-stone-200 shadow-xs no-print">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!-- Period Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
        <span class="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <CalendarDays class="w-4 h-4 text-emerald-700" />
          Periods:
        </span>

        {#each periods as period (period.id)}
          <button
            onclick={() => on_select_period(period.id)}
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border {period.id === active_period_id
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'}"
          >
            <span>{period.name}</span>
          </button>
        {/each}

        <!-- Add blank period -->
        <button
          onclick={on_add_period}
          class="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-300 text-xs transition-colors shrink-0 cursor-pointer"
          title="Add a new tax year or period"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Active Period Details & Rollover Button -->
      {#if active_period}
        <div class="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div class="flex items-center gap-2 text-xs text-stone-600">
            <button
              onclick={on_edit_period}
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 border border-stone-200 font-mono text-[11px] transition-colors cursor-pointer"
              title="Click to edit dates or period name"
            >
              <Calendar class="w-3 h-3 text-stone-500" />
              <span>{active_period.start_date || '06/04/2025'} &rarr; {active_period.end_date || '05/04/2026'}</span>
              <Edit3 class="w-3 h-3 text-stone-400 ml-0.5" />
            </button>

            <button
              onclick={on_edit_period}
              class="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 border border-stone-200 transition-colors cursor-pointer"
              title="Edit Period Name & Dates"
            >
              <Edit3 class="w-3.5 h-3.5 text-stone-500" />
              <span class="hidden sm:inline">Edit Period</span>
            </button>
          </div>

          <!-- Rollover to next period -->
          <button
            onclick={on_rollover_period}
            class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Copy closing numbers to next year's opening numbers"
          >
            <ArrowRightLeft class="w-3.5 h-3.5 text-emerald-600" />
            <span>Rollover to Next Year</span>
          </button>

          {#if periods.length > 1}
            <button
              onclick={() => on_delete_period(active_period.id)}
              class="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
              title="Delete this period"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
