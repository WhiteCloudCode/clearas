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

<div class="bg-white rounded-xl shadow-xs border border-trough overflow-hidden mb-6 no-print">
  <!-- Top Banner: Reconciled or Discrepancy Status -->
  <div
    class="px-5 py-4 border-b transition-colors {summary.is_balanced
      ? 'bg-yard-green-light/60 border-yard-green-border text-cast-iron'
      : 'bg-cull-red-light/60 border-cull-red-border text-cast-iron'}"
  >
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-start sm:items-center gap-3">
        {#if summary.is_balanced}
          <div class="p-2 rounded-full bg-yard-green text-white shrink-0 shadow-xs">
            <CheckCircle2 class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base text-cast-iron font-display uppercase tracking-wide">Reconciled</h3>
              <span class="text-[11px] bg-yard-green text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider font-display">
                Balanced (0 Variance)
              </span>
            </div>
            <p class="text-xs text-galvanised-dark mt-0.5">
              Opening stock plus inflows matches outflows plus actual closing stock. No variance detected.
            </p>
          </div>
        {:else}
          <div class="p-2 rounded-full bg-cull-red text-white shrink-0 shadow-xs">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base text-cull-red font-display uppercase tracking-wide">
                Unresolved Discrepancy: {summary.discrepancy > 0 ? `+${summary.discrepancy}` : summary.discrepancy} Head
              </h3>
              <span class="text-[11px] bg-cull-red text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider font-display">
                Variance Detected
              </span>
            </div>
            <p class="text-xs text-galvanised-dark mt-0.5 max-w-2xl">
              {diagnostic_text}
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Key Metrics 4-Column Grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-trough bg-chalk">
    <!-- 1. Total Inflows -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-galvanised mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
          <TrendingUp class="w-3.5 h-3.5 text-galvanised" />
          Total Numbers In
        </span>
      </div>
      <div class="text-2xl font-bold text-cast-iron font-mono tabular-nums">
        {summary.total_inflows}
      </div>
      <div class="text-[11px] text-galvanised mt-1">
        Opening ({summary.total_opening_stock}) + Births ({summary.total_births}) + Bought ({summary.total_purchases}) + Trans In ({summary.total_transfers_in})
      </div>
    </div>

    <!-- 2. Total Outflows -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-galvanised mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
          <TrendingDown class="w-3.5 h-3.5 text-galvanised" />
          Total Numbers Out
        </span>
      </div>
      <div class="text-2xl font-bold text-cast-iron font-mono tabular-nums">
        {summary.total_outflows}
      </div>
      <div class="text-[11px] text-galvanised mt-1">
        Sales ({summary.total_sales}) + Deaths ({summary.total_deaths}) + Own Kill ({summary.total_own_consumption}) + Trans Out ({summary.total_transfers_out})
      </div>
    </div>

    <!-- 3. Calculated Closing Stock -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-galvanised mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
          <Scale class="w-3.5 h-3.5 text-galvanised" />
          Expected Closing
        </span>
      </div>
      <div class="text-2xl font-bold text-cast-iron font-mono tabular-nums">
        {summary.reconciled_closing_stock}
      </div>
      <div class="text-[11px] text-galvanised mt-1">
        Theoretical balance (In &minus; Out)
      </div>
    </div>

    <!-- 4. Actual Physical Count & Variance -->
    <div class="p-4 {summary.is_balanced ? 'bg-yard-green-light/20' : 'bg-cull-red-light/20'}">
      <div class="flex items-center justify-between text-xs text-galvanised mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
          Actual Closing Count
        </span>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-cast-iron font-mono tabular-nums">
          {summary.actual_closing_stock}
        </span>
        {#if !summary.is_balanced}
          <span class="text-xs font-semibold px-2 py-0.5 rounded font-mono tabular-nums bg-cull-red text-white">
            {summary.discrepancy > 0 ? `+${summary.discrepancy}` : summary.discrepancy} head
          </span>
        {/if}
      </div>
      <div class="text-[11px] text-galvanised mt-1">
        Physical count entered on farm
      </div>
    </div>
  </div>

  <!-- Casualty / Deaths Check Alert (if deaths breakdown does not match category sum) -->
  {#if !deaths_check.is_matching}
    <div class="px-5 py-2.5 bg-cull-red-light border-t border-cull-red-border text-cast-iron text-xs flex items-center justify-between">
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-cull-red shrink-0" />
        <span>
          <strong class="font-semibold">Casualty numbers do not match:</strong> Schedule records {deaths_check.recorded_total} deaths, but age breakdown totals {deaths_check.breakdown_total}.
        </span>
      </div>
      <span class="font-semibold text-cull-red underline cursor-pointer">
        Review Deaths Breakdown Below
      </span>
    </div>
  {/if}
</div>
