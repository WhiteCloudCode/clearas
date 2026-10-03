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

<div class="bg-white border-b border-trough shadow-xs no-print">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!-- Period Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
        <span class="text-xs font-semibold text-galvanised uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1 font-display">
          <CalendarDays class="w-4 h-4 text-galvanised" />
          Periods:
        </span>

        {#each periods as period (period.id)}
          <button
            onclick={() => on_select_period(period.id)}
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border {period.id === active_period_id
              ? 'bg-cast-iron text-white border-cast-iron shadow-xs font-semibold'
              : 'bg-chalk hover:bg-trough text-cast-iron border-trough'}"
          >
            {#if period.id === active_period_id}
              <span class="w-1.5 h-1.5 rounded-full bg-ear-tag"></span>
            {/if}
            <span>{period.name}</span>
          </button>
        {/each}

        <!-- Add blank period -->
        <button
          onclick={on_add_period}
          class="p-1.5 rounded-lg bg-chalk hover:bg-trough text-galvanised hover:text-cast-iron border border-trough text-xs transition-colors shrink-0 cursor-pointer"
          title="Add a new tax year or period"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Active Period Details & Rollover Button -->
      {#if active_period}
        <div class="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div class="flex items-center gap-2 text-xs text-galvanised">
            <button
              onclick={on_edit_period}
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-chalk hover:bg-trough border border-trough font-mono text-[11px] text-cast-iron transition-colors cursor-pointer"
              title="Click to edit dates or period name"
            >
              <Calendar class="w-3 h-3 text-galvanised" />
              <span>{active_period.start_date || '06/04/2025'} &rarr; {active_period.end_date || '05/04/2026'}</span>
              <Edit3 class="w-3 h-3 text-galvanised ml-0.5" />
            </button>

            <button
              onclick={on_edit_period}
              class="px-2 py-1 rounded-lg bg-chalk hover:bg-trough text-cast-iron text-xs font-semibold flex items-center gap-1 border border-trough transition-colors cursor-pointer"
              title="Edit Period Name & Dates"
            >
              <Edit3 class="w-3.5 h-3.5 text-galvanised" />
              <span class="hidden sm:inline">Edit Period</span>
            </button>
          </div>

          <!-- Rollover to next period -->
          <button
            onclick={on_rollover_period}
            class="px-3 py-1.5 rounded-lg bg-chalk hover:bg-trough text-cast-iron border border-trough hover:border-galvanised text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs group"
            title="Copy closing numbers to next year's opening numbers"
          >
            <ArrowRightLeft class="w-3.5 h-3.5 text-ear-tag group-hover:rotate-180 transition-transform" />
            <span>Rollover to Next Year</span>
          </button>

          {#if periods.length > 1}
            <button
              onclick={() => on_delete_period(active_period.id)}
              class="p-1.5 rounded-lg text-galvanised hover:text-cull-red hover:bg-cull-red-light border border-transparent hover:border-cull-red-border transition-colors cursor-pointer"
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
