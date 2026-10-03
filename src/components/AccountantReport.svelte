<script lang="ts">
  import type { AccountingPeriod, FarmMetadata } from '../types/livestock';
  import {
    calculate_category_expected_closing,
    calculate_category_inflows,
    calculate_category_outflows,
    summarise_period,
  } from '../utils/calculations';
  import { Printer, ArrowLeft, CheckCircle2, AlertTriangle } from '@lucide/svelte';
  import { BRAND } from '../config/brand';

  interface Props {
    farm: FarmMetadata;
    period: AccountingPeriod;
    on_back_to_editor: () => void;
  }

  let { farm, period, on_back_to_editor }: Props = $props();

  let summary = $derived(summarise_period(period));

  function trigger_print() {
    window.print();
  }
</script>

<!-- Screen Controls Bar (Hidden during Print) -->
<div class="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print">
  <button
    onclick={on_back_to_editor}
    class="px-4 py-2 rounded-lg bg-trough/60 hover:bg-trough text-cast-iron text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
  >
    <ArrowLeft class="w-4 h-4" />
    <span>Back to Livestock Numbers</span>
  </button>

  <div class="flex items-center gap-3">
    <div class="text-xs text-galvanised">
      Previewing Accountant Schedule (Print / PDF)
    </div>
    <button
      onclick={trigger_print}
      class="px-5 py-2.5 rounded-lg bg-ear-tag hover:bg-ear-tag-hover text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
    >
      <Printer class="w-4 h-4" />
      <span>Print / Save as PDF</span>
    </button>
  </div>
</div>

<!-- Printable Document Container (A4 Proportions) -->
<div class="print-only-container max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-trough p-8 sm:p-12 text-cast-iron font-sans print:shadow-none print:border-none print:p-0">
  <!-- Document Header -->
  <div class="border-b-2 border-cast-iron pb-5 mb-6 text-center">
    <h1 class="text-2xl sm:text-3xl font-display font-bold tracking-wide uppercase text-cast-iron">
      {farm.farm_name || 'LIVESTOCK HOLDING'}
    </h1>
    <h2 class="text-xs sm:text-sm font-semibold tracking-wider text-galvanised uppercase mt-1">
      Livestock Numbers Reconciliation Schedule
    </h2>
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-galvanised mt-2 font-medium">
      <span><strong class="text-cast-iron">Enterprise:</strong> {period.species.toUpperCase()}</span>
      <span><strong class="text-cast-iron">Period:</strong> {period.name} ({period.start_date} to {period.end_date})</span>
      {#if farm.cph_number}
        <span><strong class="text-cast-iron">CPH Holding No:</strong> {farm.cph_number}</span>
      {/if}
      {#if farm.farmer_name}
        <span><strong class="text-cast-iron">Proprietor:</strong> {farm.farmer_name}</span>
      {/if}
    </div>
  </div>

  <!-- Reconciled Inflows & Outflows Side-by-Side Schedule -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 keep-together">
    <!-- LEFT COLUMN: INFLOWS & ADDITIONS -->
    <div class="border border-trough rounded-lg p-4 bg-chalk/60">
      <div class="border-b border-trough pb-2 mb-3 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider text-cast-iron font-display">
          1. Opening Stock & Additions (Inflows)
        </h3>
        <span class="text-xs font-mono font-bold text-galvanised">Head Count</span>
      </div>

      <div class="space-y-3 text-xs">
        <!-- Opening Stock -->
        <div>
          <div class="font-semibold text-cast-iron mb-1">Opening Stock (as at {period.start_date})</div>
          {#each period.categories as cat}
            {#if cat.opening_stock > 0}
              <div class="flex justify-between pl-3 py-0.5 text-slate-700">
                <span>{cat.name}</span>
                <span class="font-mono tabular-nums">{cat.opening_stock}</span>
              </div>
            {/if}
          {/each}
          <div class="flex justify-between pl-3 font-semibold text-cast-iron pt-1 border-t border-trough">
            <span>Subtotal Opening Stock</span>
            <span class="font-mono tabular-nums">{summary.total_opening_stock}</span>
          </div>
        </div>

        <!-- Natural Increase (Births) -->
        <div class="pt-2 border-t border-trough">
          <div class="flex justify-between font-semibold text-cast-iron">
            <span>Natural Increase (Births / Calves Born)</span>
            <span class="font-mono tabular-nums">{summary.total_births}</span>
          </div>
          {#each period.categories as cat}
            {#if cat.births > 0}
              <div class="flex justify-between pl-3 py-0.5 text-slate-700">
                <span>{cat.name}</span>
                <span class="font-mono tabular-nums">{cat.births}</span>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Purchases -->
        <div class="pt-2 border-t border-trough">
          <div class="flex justify-between font-semibold text-cast-iron">
            <span>Purchases (Bought In)</span>
            <span class="font-mono tabular-nums">{summary.total_purchases}</span>
          </div>
          {#each period.categories as cat}
            {#if cat.purchases > 0}
              <div class="flex justify-between pl-3 py-0.5 text-slate-700">
                <span>{cat.name}</span>
                <span class="font-mono tabular-nums">{cat.purchases}</span>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Transfers In -->
        {#if summary.total_transfers_in > 0}
          <div class="pt-2 border-t border-trough">
            <div class="flex justify-between font-semibold text-cast-iron">
              <span>Transfers In</span>
              <span class="font-mono tabular-nums">{summary.total_transfers_in}</span>
            </div>
          </div>
        {/if}

        <!-- Total Inflows Summary -->
        <div class="pt-3 border-t-2 border-cast-iron flex justify-between font-bold text-sm text-cast-iron">
          <span class="font-display uppercase tracking-wider">TOTAL INFLOWS (A)</span>
          <span class="font-mono tabular-nums text-base">{summary.total_inflows}</span>
        </div>
      </div>
    </div>

    <!-- RIGHT COLUMN: OUTFLOWS & CLOSING STOCK -->
    <div class="border border-trough rounded-lg p-4 bg-chalk/60">
      <div class="border-b border-trough pb-2 mb-3 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider text-cast-iron font-display">
          2. Disposals & Closing Stock (Outflows)
        </h3>
        <span class="text-xs font-mono font-bold text-galvanised">Head Count</span>
      </div>

      <div class="space-y-3 text-xs">
        <!-- Sales -->
        <div>
          <div class="font-semibold text-cast-iron mb-1">Sales (Market / Abattoir)</div>
          {#each period.categories as cat}
            {#if cat.sales > 0}
              <div class="flex justify-between pl-3 py-0.5 text-slate-700">
                <span>{cat.name}</span>
                <span class="font-mono tabular-nums">{cat.sales}</span>
              </div>
            {/if}
          {/each}
          <div class="flex justify-between pl-3 font-semibold text-cast-iron pt-1 border-t border-trough">
            <span>Subtotal Sales</span>
            <span class="font-mono tabular-nums">{summary.total_sales}</span>
          </div>
        </div>

        <!-- Deaths / Casualties -->
        <div class="pt-2 border-t border-trough">
          <div class="flex justify-between font-semibold text-cast-iron">
            <span>Casualties & Deaths</span>
            <span class="font-mono tabular-nums">{summary.total_deaths}</span>
          </div>
          <div class="pl-3 py-0.5 text-slate-700 flex justify-between">
            <span>Calves (&lt; 1 Year)</span>
            <span class="font-mono tabular-nums">{period.deaths_breakdown.under_one_year}</span>
          </div>
          <div class="pl-3 py-0.5 text-slate-700 flex justify-between">
            <span>Yearlings (1–2 Years)</span>
            <span class="font-mono tabular-nums">{period.deaths_breakdown.one_to_two_years}</span>
          </div>
          <div class="pl-3 py-0.5 text-slate-700 flex justify-between">
            <span>Mature Stock (&gt; 2 Years)</span>
            <span class="font-mono tabular-nums">{period.deaths_breakdown.over_two_years}</span>
          </div>
        </div>

        <!-- Own Consumption / Transfers Out -->
        {#if summary.total_own_consumption > 0 || summary.total_transfers_out > 0}
          <div class="pt-2 border-t border-trough">
            {#if summary.total_own_consumption > 0}
              <div class="flex justify-between text-cast-iron">
                <span>Home Kill / Own Consumption</span>
                <span class="font-mono tabular-nums">{summary.total_own_consumption}</span>
              </div>
            {/if}
            {#if summary.total_transfers_out > 0}
              <div class="flex justify-between text-cast-iron">
                <span>Transfers Out</span>
                <span class="font-mono tabular-nums">{summary.total_transfers_out}</span>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Closing Stock on Hand -->
        <div class="pt-2 border-t border-trough">
          <div class="font-semibold text-cast-iron mb-1">
            Closing Stock as at {period.end_date}
          </div>
          {#each period.categories as cat}
            {#if cat.actual_closing_stock > 0}
              <div class="flex justify-between pl-3 py-0.5 text-slate-700">
                <span>{cat.name}</span>
                <span class="font-mono tabular-nums">{cat.actual_closing_stock}</span>
              </div>
            {/if}
          {/each}
          <div class="flex justify-between pl-3 font-semibold text-cast-iron pt-1 border-t border-trough">
            <span>Subtotal Closing Stock Count</span>
            <span class="font-mono tabular-nums">{summary.actual_closing_stock}</span>
          </div>
        </div>

        <!-- Total Outflows + Closing Summary -->
        <div class="pt-3 border-t-2 border-cast-iron flex justify-between font-bold text-sm text-cast-iron">
          <span class="font-display uppercase tracking-wider">TOTAL OUTFLOWS & CLOSING (B)</span>
          <span class="font-mono tabular-nums text-base">{summary.total_outflows + summary.actual_closing_stock}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Grand Reconciliation Statement Box -->
  <div class="border-2 rounded-lg p-5 mb-8 keep-together {summary.is_balanced ? 'border-yard-green bg-yard-green/5' : 'border-cull-red bg-cull-red/5'}">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-bold text-xs uppercase tracking-wider font-display flex items-center gap-2 {summary.is_balanced ? 'text-yard-green' : 'text-cull-red'}">
        {#if summary.is_balanced}
          <CheckCircle2 class="w-4 h-4 text-yard-green" />
          <span>Final Balancing Certificate: Reconciled</span>
        {:else}
          <AlertTriangle class="w-4 h-4 text-cull-red" />
          <span>Final Balancing Certificate: Variance Detected</span>
        {/if}
      </h3>
      <span class="font-mono tabular-nums font-bold text-xs px-2.5 py-1 rounded {summary.is_balanced ? 'bg-yard-green/10 text-yard-green border border-yard-green/20' : 'bg-cull-red/10 text-cull-red border border-cull-red/20'}">
        Variance: {summary.discrepancy === 0 ? '0 (Fully Balanced)' : `${summary.discrepancy > 0 ? '+' : ''}${summary.discrepancy} Head`}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-4 text-center py-2 border-y border-trough font-mono tabular-nums text-xs">
      <div>
        <div class="text-[10px] text-galvanised uppercase font-sans tracking-wider">Total Inflows (A)</div>
        <div class="text-base font-bold text-cast-iron mt-0.5">{summary.total_inflows}</div>
      </div>
      <div>
        <div class="text-[10px] text-galvanised uppercase font-sans tracking-wider">Total Disposals + Closing (B)</div>
        <div class="text-base font-bold text-cast-iron mt-0.5">{summary.total_outflows + summary.actual_closing_stock}</div>
      </div>
      <div>
        <div class="text-[10px] text-galvanised uppercase font-sans tracking-wider">Discrepancy (B &minus; A)</div>
        <div class="text-base font-bold {summary.is_balanced ? 'text-yard-green' : 'text-cull-red'} mt-0.5">
          {summary.discrepancy}
        </div>
      </div>
    </div>

    {#if period.period_notes}
      <div class="mt-3 text-xs text-galvanised italic">
        <strong class="text-cast-iron font-semibold not-italic">Notes:</strong> {period.period_notes}
      </div>
    {/if}
  </div>

  <!-- Declaration & Sign-off Block -->
  <div class="grid grid-cols-2 gap-12 pt-4 border-t border-trough text-xs keep-together">
    <div>
      <p class="font-semibold text-cast-iron mb-6">Farmer / Manager Declaration:</p>
      <div class="border-b border-galvanised/40 mb-1.5 h-6"></div>
      <div class="flex justify-between text-galvanised text-[11px]">
        <span>Signature</span>
        <span>Date</span>
      </div>
    </div>
    <div>
      <p class="font-semibold text-cast-iron mb-6">Accountant / Auditor Confirmation:</p>
      <div class="border-b border-galvanised/40 mb-1.5 h-6"></div>
      <div class="flex justify-between text-galvanised text-[11px]">
        <span>Signature</span>
        <span>Date</span>
      </div>
    </div>
  </div>

  <div class="mt-8 text-center text-[10px] text-galvanised font-mono">
    Generated via {BRAND.name} &bull; {BRAND.tagline} &bull; Private On-Farm Records
  </div>
</div>
