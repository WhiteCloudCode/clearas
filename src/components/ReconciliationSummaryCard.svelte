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
    Shield,
  } from '@lucide/svelte';

  interface Props {
    period: AccountingPeriod;
  }

  let { period }: Props = $props();

  let summary = $derived(summarise_period(period));
  let deaths_check = $derived(validate_deaths_breakdown(period));
  let diagnostic_text = $derived(diagnose_discrepancy(summary));
</script>

<div class="bg-white rounded-xl shadow-xs border border-border overflow-hidden mb-6 no-print">
  <!-- Top Banner: Reconciled or Discrepancy Status -->
  <div
    class="px-5 py-4 border-b transition-colors {summary.is_balanced
      ? 'bg-success-light/60 border-success-border text-primary'
      : 'bg-danger-light/60 border-danger-border text-primary'}"
  >
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-start sm:items-center gap-3">
        {#if summary.is_balanced}
          <div class="p-2 rounded-full bg-success text-white shrink-0 shadow-xs">
            <CheckCircle2 class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base text-primary font-display uppercase tracking-wide">Reconciled</h3>
              <span class="text-[11px] bg-success text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider font-display">
                Balanced (0 Variance)
              </span>
            </div>
            <p class="text-xs text-text mt-0.5">
              Opening stock plus inflows matches outflows plus actual closing stock. No variance detected.
            </p>
          </div>
        {:else}
          <div class="p-2 rounded-full bg-danger text-white shrink-0 shadow-xs">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base text-danger font-display uppercase tracking-wide">
                Unresolved Discrepancy: {summary.discrepancy > 0 ? `+${summary.discrepancy}` : summary.discrepancy} Head
              </h3>
              <span class="text-[11px] bg-danger text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider font-display">
                Variance Detected
              </span>
            </div>
            <p class="text-xs text-text mt-0.5 max-w-2xl">
              {diagnostic_text}
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Key Metrics 4-Column Grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border bg-canvas">
    <!-- 1. Total Inflows -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-text-muted mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
          <TrendingUp class="w-3.5 h-3.5 text-text-muted" />
          Total Numbers In
        </span>
      </div>
      <div class="text-2xl font-bold text-primary font-mono tabular-nums">
        {summary.total_inflows}
      </div>
      <div class="text-[11px] text-text-muted mt-1">
        Opening ({summary.total_opening_stock}) + Births ({summary.total_births}) + Bought ({summary.total_purchases}) + Trans In ({summary.total_transfers_in})
      </div>
    </div>

    <!-- 2. Total Outflows -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-text-muted mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
          <TrendingDown class="w-3.5 h-3.5 text-text-muted" />
          Total Numbers Out
        </span>
      </div>
      <div class="text-2xl font-bold text-primary font-mono tabular-nums">
        {summary.total_outflows}
      </div>
      <div class="text-[11px] text-text-muted mt-1">
        Sales ({summary.total_sales}) + Deaths ({summary.total_deaths}) + Own Kill ({summary.total_own_consumption}) + Trans Out ({summary.total_transfers_out})
      </div>
    </div>

    <!-- 3. Calculated Closing Stock -->
    <div class="p-4">
      <div class="flex items-center justify-between text-xs text-text-muted mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
          <Scale class="w-3.5 h-3.5 text-text-muted" />
          Expected Closing
        </span>
      </div>
      <div class="text-2xl font-bold text-primary font-mono tabular-nums">
        {summary.reconciled_closing_stock}
      </div>
      <div class="text-[11px] text-text-muted mt-1">
        Theoretical balance (In &minus; Out)
      </div>
    </div>

    <!-- 4. Actual Physical Count & Variance -->
    <div class="p-4 {summary.is_balanced ? 'bg-success-light/20' : 'bg-danger-light/20'}">
      <div class="flex items-center justify-between text-xs text-text-muted mb-1">
        <span class="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
          Actual Closing Count
        </span>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-primary font-mono tabular-nums">
          {summary.actual_closing_stock}
        </span>
        {#if !summary.is_balanced}
          <span class="text-xs font-semibold px-2 py-0.5 rounded font-mono tabular-nums bg-danger text-white">
            {summary.discrepancy > 0 ? `+${summary.discrepancy}` : summary.discrepancy} head
          </span>
        {/if}
      </div>
      <div class="text-[11px] text-text-muted mt-1">
        Physical count entered on farm
      </div>
    </div>
  </div>

  <!-- HMRC Herd Basis Capital Position Banner (BIM55500) -->
  {#if summary.herd_basis.status !== 'none'}
    <div class="px-5 py-3 border-t border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2.5">
        <Shield class="w-4 h-4 text-text-muted shrink-0" />
        <div>
          <span class="font-bold text-primary font-display uppercase tracking-wider">HMRC Herd Basis (Capital Stock):</span>
          <span class="text-text-muted ml-1 font-mono">
            {summary.herd_basis.opening_head} Opening &rarr; {summary.herd_basis.closing_head} Closing
            ({summary.herd_basis.net_change_head >= 0 ? `+${summary.herd_basis.net_change_head}` : summary.herd_basis.net_change_head} head,
            {summary.herd_basis.percentage_change >= 0 ? `+${summary.herd_basis.percentage_change}` : summary.herd_basis.percentage_change}%)
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span
          class="px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wide
          {summary.herd_basis.status === 'substantial_reduction'
            ? 'bg-warning/20 text-warning border border-warning/30'
            : summary.herd_basis.status === 'minor_reduction'
            ? 'bg-slate-200 text-primary border border-border'
            : summary.herd_basis.status === 'expansion'
            ? 'bg-accent/15 text-accent border border-accent/30'
            : 'bg-success-light/40 text-success border border-success/30'}"
          title={summary.herd_basis.tax_treatment}
        >
          {summary.herd_basis.status_badge} [{summary.herd_basis.tax_rule}]
        </span>
      </div>
    </div>
  {/if}

  <!-- Balance Sheet Valuation Summary (if entered) -->
  {#if summary.valuations.has_valuations}
    <div class="px-5 py-2.5 border-t border-border bg-canvas/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-muted">
        <span class="font-sans font-semibold text-primary uppercase text-[11px] tracking-wider">Stock Valuation (£):</span>
        <span>Opening: £{summary.valuations.total_opening_value.toLocaleString()}</span>
        <span>&bull;</span>
        <span>Closing: £{summary.valuations.total_closing_value.toLocaleString()}</span>
      </div>
      <div class="text-primary font-semibold">
        P&L Trading Movement:
        <span class="{summary.valuations.trading_movement >= 0 ? 'text-success' : 'text-danger'}">
          {summary.valuations.trading_movement >= 0 ? '+' : ''}£{summary.valuations.trading_movement.toLocaleString()}
        </span>
      </div>
    </div>
  {/if}

  <!-- Casualty / Deaths Check Alert (if deaths breakdown does not match category sum) -->
  {#if !deaths_check.is_matching}
    <div class="px-5 py-2.5 bg-danger-light border-t border-danger-border text-primary text-xs flex items-center justify-between">
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-danger shrink-0" />
        <span>
          <strong class="font-semibold">Casualty numbers do not match:</strong> Schedule records {deaths_check.recorded_total} deaths, but age breakdown totals {deaths_check.breakdown_total}.
        </span>
      </div>
      <span class="font-semibold text-danger underline cursor-pointer">
        Review Deaths Breakdown Below
      </span>
    </div>
  {/if}
</div>
