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
    class="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
  >
    <ArrowLeft class="w-4 h-4" />
    <span>Back to Livestock Numbers</span>
  </button>

  <div class="flex items-center gap-3">
    <div class="text-xs text-stone-500">
      Previewing Accountant Schedule (Print / PDF)
    </div>
    <button
      onclick={trigger_print}
      class="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
    >
      <Printer class="w-4 h-4" />
      <span>Print / Save as PDF</span>
    </button>
  </div>
</div>

<!-- Printable Document Container (A4 Proportions) -->
<div class="print-only-container max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-stone-200 p-8 sm:p-12 text-stone-900 font-sans print:shadow-none print:border-none print:p-0">
  <!-- Document Header -->
  <div class="border-b-2 border-stone-900 pb-5 mb-6 text-center">
    <h1 class="text-2xl sm:text-3xl font-serif font-bold tracking-wide uppercase text-stone-950">
      {farm.farm_name || 'LIVESTOCK HOLDING'}
    </h1>
    <h2 class="text-sm sm:text-base font-semibold tracking-wider text-stone-700 uppercase mt-1">
      Livestock Numbers Reconciliation Schedule
    </h2>
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-stone-600 mt-2 font-medium">
      <span><strong>Enterprise:</strong> {period.species.toUpperCase()}</span>
      <span><strong>Period:</strong> {period.name} ({period.start_date} to {period.end_date})</span>
      {#if farm.cph_number}
        <span><strong>CPH Holding No:</strong> {farm.cph_number}</span>
      {/if}
      {#if farm.farmer_name}
        <span><strong>Proprietor:</strong> {farm.farmer_name}</span>
      {/if}
    </div>
  </div>

  <!-- Reconciled Inflows & Outflows Side-by-Side Schedule -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 keep-together">
    <!-- LEFT COLUMN: INFLOWS & ADDITIONS -->
    <div class="border border-stone-300 rounded-lg p-4 bg-stone-50/50">
      <div class="border-b border-stone-300 pb-2 mb-3 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider text-stone-800">
          1. Opening Stock & Additions (Inflows)
        </h3>
        <span class="text-xs font-mono font-bold text-emerald-800">Head Count</span>
      </div>

      <div class="space-y-3 text-xs">
        <!-- Opening Stock -->
        <div>
          <div class="font-semibold text-stone-700 mb-1">Opening Stock (as at {period.start_date})</div>
          {#each period.categories as cat}
            {#if cat.opening_stock > 0}
              <div class="flex justify-between pl-3 py-0.5 text-stone-600">
                <span>{cat.name}</span>
                <span class="font-mono">{cat.opening_stock}</span>
              </div>
            {/if}
          {/each}
          <div class="flex justify-between pl-3 font-semibold text-stone-800 pt-1 border-t border-stone-200">
            <span>Subtotal Opening Stock</span>
            <span class="font-mono">{summary.total_opening_stock}</span>
          </div>
        </div>

        <!-- Natural Increase (Births) -->
        <div class="pt-2 border-t border-stone-200">
          <div class="flex justify-between font-semibold text-stone-700">
            <span>Natural Increase (Births / Calves Born)</span>
            <span class="font-mono">{summary.total_births}</span>
          </div>
          {#each period.categories as cat}
            {#if cat.births > 0}
              <div class="flex justify-between pl-3 py-0.5 text-stone-600">
                <span>{cat.name}</span>
                <span class="font-mono">{cat.births}</span>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Purchases -->
        <div class="pt-2 border-t border-stone-200">
          <div class="flex justify-between font-semibold text-stone-700">
            <span>Purchases (Bought In)</span>
            <span class="font-mono">{summary.total_purchases}</span>
          </div>
          {#each period.categories as cat}
            {#if cat.purchases > 0}
              <div class="flex justify-between pl-3 py-0.5 text-stone-600">
                <span>{cat.name}</span>
                <span class="font-mono">{cat.purchases}</span>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Transfers In -->
        {#if summary.total_transfers_in > 0}
          <div class="pt-2 border-t border-stone-200">
            <div class="flex justify-between font-semibold text-stone-700">
              <span>Transfers In</span>
              <span class="font-mono">{summary.total_transfers_in}</span>
            </div>
          </div>
        {/if}

        <!-- Total Inflows Summary -->
        <div class="pt-3 border-t-2 border-stone-800 flex justify-between font-bold text-sm text-stone-950">
          <span>TOTAL INFLOWS (A)</span>
          <span class="font-mono text-base">{summary.total_inflows}</span>
        </div>
      </div>
    </div>

    <!-- RIGHT COLUMN: OUTFLOWS & CLOSING STOCK -->
    <div class="border border-stone-300 rounded-lg p-4 bg-stone-50/50">
      <div class="border-b border-stone-300 pb-2 mb-3 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider text-stone-800">
          2. Disposals & Closing Stock (Outflows)
        </h3>
        <span class="text-xs font-mono font-bold text-stone-800">Head Count</span>
      </div>

      <div class="space-y-3 text-xs">
        <!-- Sales -->
        <div>
          <div class="font-semibold text-stone-700 mb-1">Sales (Market / Abattoir)</div>
          {#each period.categories as cat}
            {#if cat.sales > 0}
              <div class="flex justify-between pl-3 py-0.5 text-stone-600">
                <span>{cat.name}</span>
                <span class="font-mono">{cat.sales}</span>
              </div>
            {/if}
          {/each}
          <div class="flex justify-between pl-3 font-semibold text-stone-800 pt-1 border-t border-stone-200">
            <span>Subtotal Sales</span>
            <span class="font-mono">{summary.total_sales}</span>
          </div>
        </div>

        <!-- Deaths / Casualties -->
        <div class="pt-2 border-t border-stone-200">
          <div class="flex justify-between font-semibold text-stone-700">
            <span>Casualties & Deaths</span>
            <span class="font-mono">{summary.total_deaths}</span>
          </div>
          <div class="pl-3 py-0.5 text-stone-600 flex justify-between">
            <span>Calves (&lt; 1 Year)</span>
            <span class="font-mono">{period.deaths_breakdown.under_one_year}</span>
          </div>
          <div class="pl-3 py-0.5 text-stone-600 flex justify-between">
            <span>Yearlings (1–2 Years)</span>
            <span class="font-mono">{period.deaths_breakdown.one_to_two_years}</span>
          </div>
          <div class="pl-3 py-0.5 text-stone-600 flex justify-between">
            <span>Mature Stock (&gt; 2 Years)</span>
            <span class="font-mono">{period.deaths_breakdown.over_two_years}</span>
          </div>
        </div>

        <!-- Own Consumption / Transfers Out -->
        {#if summary.total_own_consumption > 0 || summary.total_transfers_out > 0}
          <div class="pt-2 border-t border-stone-200">
            {#if summary.total_own_consumption > 0}
              <div class="flex justify-between text-stone-700">
                <span>Home Kill / Own Consumption</span>
                <span class="font-mono">{summary.total_own_consumption}</span>
              </div>
            {/if}
            {#if summary.total_transfers_out > 0}
              <div class="flex justify-between text-stone-700">
                <span>Transfers Out</span>
                <span class="font-mono">{summary.total_transfers_out}</span>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Closing Stock on Hand -->
        <div class="pt-2 border-t border-stone-200">
          <div class="font-semibold text-stone-700 mb-1">
            Closing Stock as at {period.end_date}
          </div>
          {#each period.categories as cat}
            {#if cat.actual_closing_stock > 0}
              <div class="flex justify-between pl-3 py-0.5 text-stone-600">
                <span>{cat.name}</span>
                <span class="font-mono">{cat.actual_closing_stock}</span>
              </div>
            {/if}
          {/each}
          <div class="flex justify-between pl-3 font-semibold text-stone-800 pt-1 border-t border-stone-200">
            <span>Subtotal Closing Stock Count</span>
            <span class="font-mono">{summary.actual_closing_stock}</span>
          </div>
        </div>

        <!-- Total Outflows + Closing Summary -->
        <div class="pt-3 border-t-2 border-stone-800 flex justify-between font-bold text-sm text-stone-950">
          <span>TOTAL OUTFLOWS & CLOSING (B)</span>
          <span class="font-mono text-base">{summary.total_outflows + summary.actual_closing_stock}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Grand Reconciliation Statement Box -->
  <div class="border-2 border-stone-900 rounded-lg p-5 mb-8 keep-together {summary.is_balanced ? 'bg-emerald-50/30' : 'bg-amber-50/40'}">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
        {#if summary.is_balanced}
          <CheckCircle2 class="w-4 h-4 text-emerald-700" />
          <span>Final Balancing Certificate: Reconciled</span>
        {:else}
          <AlertTriangle class="w-4 h-4 text-amber-700" />
          <span>Final Balancing Certificate: Variance Detected</span>
        {/if}
      </h3>
      <span class="font-mono font-bold text-xs px-2.5 py-1 rounded {summary.is_balanced ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-200 text-amber-950'}">
        Variance: {summary.discrepancy === 0 ? '0 (Fully Balanced)' : `${summary.discrepancy > 0 ? '+' : ''}${summary.discrepancy} Head`}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-4 text-center py-2 border-y border-stone-300 font-mono text-xs">
      <div>
        <div class="text-[10px] text-stone-500 uppercase font-sans">Total Inflows (A)</div>
        <div class="text-base font-bold text-stone-900 mt-0.5">{summary.total_inflows}</div>
      </div>
      <div>
        <div class="text-[10px] text-stone-500 uppercase font-sans">Total Disposals + Closing (B)</div>
        <div class="text-base font-bold text-stone-900 mt-0.5">{summary.total_outflows + summary.actual_closing_stock}</div>
      </div>
      <div>
        <div class="text-[10px] text-stone-500 uppercase font-sans">Discrepancy (B &minus; A)</div>
        <div class="text-base font-bold {summary.is_balanced ? 'text-emerald-700' : 'text-amber-800'} mt-0.5">
          {summary.discrepancy}
        </div>
      </div>
    </div>

    {#if period.period_notes}
      <div class="mt-3 text-xs text-stone-600 italic">
        <strong>Notes:</strong> {period.period_notes}
      </div>
    {/if}
  </div>

  <!-- Declaration & Sign-off Block -->
  <div class="grid grid-cols-2 gap-12 pt-4 border-t border-stone-300 text-xs keep-together">
    <div>
      <p class="font-semibold text-stone-800 mb-6">Farmer / Manager Declaration:</p>
      <div class="border-b border-stone-400 mb-1.5 h-6"></div>
      <div class="flex justify-between text-stone-500 text-[11px]">
        <span>Signature</span>
        <span>Date</span>
      </div>
    </div>
    <div>
      <p class="font-semibold text-stone-800 mb-6">Accountant / Auditor Confirmation:</p>
      <div class="border-b border-stone-400 mb-1.5 h-6"></div>
      <div class="flex justify-between text-stone-500 text-[11px]">
        <span>Signature</span>
        <span>Date</span>
      </div>
    </div>
  </div>

  <div class="mt-8 text-center text-[10px] text-stone-400 font-mono">
    Generated via {BRAND.name} &bull; {BRAND.tagline} &bull; Private On-Farm Records
  </div>
</div>
