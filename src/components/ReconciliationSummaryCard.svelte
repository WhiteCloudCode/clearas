<script lang="ts">
  import type { AccountingPeriod } from '../types/livestock';
  import {
    diagnose_discrepancy,
    summarise_period,
    validate_deaths_breakdown,
  } from '../utils/calculations';
  import {
    CheckCircle2,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Scale,
    Info,
    TrendingDown,
    TrendingUp,
  } from '@lucide/svelte';

  interface Props {
    period: AccountingPeriod;
  }

  let { period }: Props = $props();

  let summary = $derived(summarise_period(period));
  let deaths_check = $derived(validate_deaths_breakdown(period));
  let diagnostic_text = $derived(diagnose_discrepancy(summary));
</script>

<div class="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden mb-6 no-print">
  <!-- Top Banner: Reconciled or Discrepancy Status -->
  <div
    class="px-5 py-4 border-b transition-colors {summary.is_balanced
      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
      : 'bg-amber-50 border-amber-200 text-amber-950'}"
  >
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-start sm:items-center gap-3">
        {#if summary.is_balanced}
          <div class="p-2 rounded-full bg-emerald-600 text-white shrink-0 shadow-xs">
            <CheckCircle2 class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base text-emerald-900">Herd Numbers Balanced</h3>
              <span class="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                Balanced (0 Difference)
              </span>
            </div>
            <p class="text-xs text-emerald-700 mt-0.5">
              What came in matches what went out plus your closing count on farm.
            </p>
          </div>
        {:else}
          <div class="p-2 rounded-full bg-amber-500 text-white shrink-0 shadow-xs">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base text-amber-950">
                Difference: {summary.discrepancy > 0 ? `+${summary.discrepancy}` : summary.discrepancy} Animals
              </h3>
              <span class="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                Not Balanced Yet
              </span>
            </div>
            <p class="text-xs text-amber-800 mt-0.5 max-w-2xl">
              {diagnostic_text}
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Key Metrics 4-Column Grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200 bg-stone-50/50">
    <!-- 1. Total Inflows -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-stone-500 mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1">
          <TrendingUp class="w-3.5 h-3.5 text-emerald-600" />
          Total Numbers In
        </span>
      </div>
      <div class="text-2xl font-bold text-stone-900 font-mono">
        {summary.total_inflows}
      </div>
      <div class="text-[11px] text-stone-500 mt-1">
        Opening ({summary.total_opening_stock}) + Births ({summary.total_births}) + Bought ({summary.total_purchases}) + Trans In ({summary.total_transfers_in})
      </div>
    </div>

    <!-- 2. Total Outflows -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-stone-500 mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1">
          <TrendingDown class="w-3.5 h-3.5 text-stone-600" />
          Total Numbers Out
        </span>
      </div>
      <div class="text-2xl font-bold text-stone-900 font-mono">
        {summary.total_outflows}
      </div>
      <div class="text-[11px] text-stone-500 mt-1">
        Sales ({summary.total_sales}) + Deaths ({summary.total_deaths}) + Own Kill ({summary.total_own_consumption}) + Trans Out ({summary.total_transfers_out})
      </div>
    </div>

    <!-- 3. Calculated Closing Stock -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-stone-500 mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1">
          <Scale class="w-3.5 h-3.5 text-blue-600" />
          Expected Closing
        </span>
      </div>
      <div class="text-2xl font-bold text-stone-900 font-mono">
        {summary.reconciled_closing_stock}
      </div>
      <div class="text-[11px] text-stone-500 mt-1">
        What should be on farm (In &minus; Out)
      </div>
    </div>

    <!-- 4. Actual Physical Count & Variance -->
    <div class="p-4 {summary.is_balanced ? 'bg-emerald-50/40' : 'bg-amber-50/40'}">
      <div class="flex items-center justify-between text-xs text-stone-500 mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1">
          Actual Closing Count
        </span>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-stone-900 font-mono">
          {summary.actual_closing_stock}
        </span>
        {#if !summary.is_balanced}
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full {summary.discrepancy > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
            {summary.discrepancy > 0 ? `+${summary.discrepancy}` : summary.discrepancy} diff
          </span>
        {/if}
      </div>
      <div class="text-[11px] text-stone-500 mt-1">
        Count entered on farm
      </div>
    </div>
  </div>

  <!-- Casualty / Deaths Check Alert (if deaths breakdown does not match category sum) -->
  {#if !deaths_check.is_matching}
    <div class="px-5 py-2.5 bg-rose-50 border-t border-rose-200 text-rose-900 text-xs flex items-center justify-between">
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0" />
        <span>
          <strong>Casualty numbers do not match:</strong> Table records a total of {deaths_check.recorded_total} deaths, but age breakdown totals {deaths_check.breakdown_total}.
        </span>
      </div>
      <span class="font-semibold text-rose-700 underline cursor-pointer">
        Review Deaths Breakdown Below
      </span>
    </div>
  {/if}
</div>
