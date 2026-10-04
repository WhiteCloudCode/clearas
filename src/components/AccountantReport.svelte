<script lang="ts">
  import type { AccountingPeriod, FarmMetadata } from '../types/livestock';
  import {
    calculate_category_expected_closing,
    calculate_category_inflows,
    calculate_category_outflows,
    summarise_period,
    generate_hmrc_box103_text,
  } from '../utils/calculations';
  import { Printer, ArrowLeft, CheckCircle2, AlertTriangle, Copy, Check } from '@lucide/svelte';
  import { BRAND } from '../config/brand';

  interface Props {
    farm: FarmMetadata;
    period: AccountingPeriod;
    on_back_to_editor: () => void;
  }

  let { farm, period, on_back_to_editor }: Props = $props();

  let summary = $derived(summarise_period(period));
  let copied_box103 = $state(false);

  function trigger_print() {
    window.print();
  }

  async function copy_box103_text() {
    const text = generate_hmrc_box103_text(farm, period);
    try {
      await navigator.clipboard.writeText(text);
      copied_box103 = true;
      setTimeout(() => {
        copied_box103 = false;
      }, 2500);
    } catch (err) {
      console.error('Failed to copy HMRC Box 103 text:', err);
    }
  }
</script>

<!-- Screen Controls Bar (Hidden during Print) -->
<div class="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
  <button
    onclick={on_back_to_editor}
    class="px-4 py-2 rounded-lg bg-border/60 hover:bg-border text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
  >
    <ArrowLeft class="w-4 h-4" />
    <span>Back to Livestock Numbers</span>
  </button>

  <div class="flex items-center gap-2.5">
    <button
      onclick={copy_box103_text}
      class="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
      title="Copy formatted schedule text for HMRC SA103F Box 103 / CT600 / SA104F Box 3.116"
    >
      {#if copied_box103}
        <Check class="w-4 h-4 text-emerald-400" />
        <span class="text-emerald-400 font-bold">Copied Box 103 Text!</span>
      {:else}
        <Copy class="w-4 h-4 text-accent" />
        <span>Copy HMRC Box 103 Text</span>
      {/if}
    </button>
    <button
      onclick={trigger_print}
      class="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-text text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs cursor-pointer border border-accent-border"
    >
      <Printer class="w-4 h-4 text-text" />
      <span>Print / Save as PDF</span>
    </button>
  </div>
</div>

<!-- Printable Document Container (A4 Proportions) -->
<div class="print-only-container max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-border p-8 sm:p-12 text-primary font-sans print:shadow-none print:border-none print:p-0">
  <!-- Document Header -->
  <div class="border-b-2 border-primary pb-5 mb-6 text-center">
    <h1 class="text-2xl sm:text-3xl font-display font-bold tracking-wide uppercase text-primary">
      {farm.farm_name || 'LIVESTOCK HOLDING'}
    </h1>
    <h2 class="text-xs sm:text-sm font-semibold tracking-wider text-text-muted uppercase mt-1">
      Livestock Numbers Reconciliation Schedule
    </h2>
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-text-muted mt-2 font-medium">
      <span><strong class="text-primary">Enterprise:</strong> {period.species.toUpperCase()}</span>
      <span><strong class="text-primary">Period:</strong> {period.name} ({period.start_date} to {period.end_date})</span>
      {#if farm.cph_number}
        <span><strong class="text-primary">CPH Holding No:</strong> {farm.cph_number}</span>
      {/if}
      {#if farm.farmer_name}
        <span><strong class="text-primary">Proprietor:</strong> {farm.farmer_name}</span>
      {/if}
    </div>
  </div>

  <!-- Reconciled Inflows & Outflows Side-by-Side Schedule -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 keep-together">
    <!-- LEFT COLUMN: INFLOWS & ADDITIONS -->
    <div class="border border-border rounded-lg p-4 bg-canvas/60">
      <div class="border-b border-border pb-2 mb-3 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider text-primary font-display">
          1. Opening Stock & Additions (Inflows)
        </h3>
        <span class="text-xs font-mono font-bold text-text-muted">Head Count</span>
      </div>

      <div class="space-y-3 text-xs">
        <!-- Opening Stock -->
        <div>
          <div class="font-semibold text-primary mb-1">Opening Stock (as at {period.start_date})</div>
          {#each period.categories as cat}
            {#if cat.opening_stock > 0}
              <div class="flex justify-between pl-3 py-0.5 text-slate-700">
                <span>{cat.name}</span>
                <span class="font-mono tabular-nums">{cat.opening_stock}</span>
              </div>
            {/if}
          {/each}
          <div class="flex justify-between pl-3 font-semibold text-primary pt-1 border-t border-border">
            <span>Subtotal Opening Stock</span>
            <span class="font-mono tabular-nums">{summary.total_opening_stock}</span>
          </div>
        </div>

        <!-- Natural Increase (Births) -->
        <div class="pt-2 border-t border-border">
          <div class="flex justify-between font-semibold text-primary">
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
        <div class="pt-2 border-t border-border">
          <div class="flex justify-between font-semibold text-primary">
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
          <div class="pt-2 border-t border-border">
            <div class="flex justify-between font-semibold text-primary">
              <span>Transfers In</span>
              <span class="font-mono tabular-nums">{summary.total_transfers_in}</span>
            </div>
          </div>
        {/if}

        <!-- Total Inflows Summary -->
        <div class="pt-3 border-t-2 border-primary flex justify-between font-bold text-sm text-primary">
          <span class="font-display uppercase tracking-wider">TOTAL INFLOWS (A)</span>
          <span class="font-mono tabular-nums text-base">{summary.total_inflows}</span>
        </div>
      </div>
    </div>

    <!-- RIGHT COLUMN: OUTFLOWS & CLOSING STOCK -->
    <div class="border border-border rounded-lg p-4 bg-canvas/60">
      <div class="border-b border-border pb-2 mb-3 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider text-primary font-display">
          2. Disposals & Closing Stock (Outflows)
        </h3>
        <span class="text-xs font-mono font-bold text-text-muted">Head Count</span>
      </div>

      <div class="space-y-3 text-xs">
        <!-- Sales -->
        <div>
          <div class="font-semibold text-primary mb-1">Sales (Market / Abattoir)</div>
          {#each period.categories as cat}
            {#if cat.sales > 0}
              <div class="flex justify-between pl-3 py-0.5 text-slate-700">
                <span>{cat.name}</span>
                <span class="font-mono tabular-nums">{cat.sales}</span>
              </div>
            {/if}
          {/each}
          <div class="flex justify-between pl-3 font-semibold text-primary pt-1 border-t border-border">
            <span>Subtotal Sales</span>
            <span class="font-mono tabular-nums">{summary.total_sales}</span>
          </div>
        </div>

        <!-- Deaths / Casualties -->
        <div class="pt-2 border-t border-border">
          <div class="flex justify-between font-semibold text-primary">
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
          {#if (period.deaths_breakdown.tb_reactors ?? 0) > 0}
            <div class="pl-3 py-0.5 text-amber-800 flex justify-between font-medium">
              <span>&bull; Statutory TB / Disease Slaughter (BIM55560)</span>
              <span class="font-mono tabular-nums">{period.deaths_breakdown.tb_reactors}</span>
            </div>
          {/if}
        </div>

        <!-- Own Consumption / Transfers Out -->
        {#if summary.total_own_consumption > 0 || summary.total_transfers_out > 0}
          <div class="pt-2 border-t border-border">
            {#if summary.total_own_consumption > 0}
              <div class="flex justify-between text-primary">
                <span>Home Kill / Own Consumption</span>
                <span class="font-mono tabular-nums">{summary.total_own_consumption}</span>
              </div>
            {/if}
            {#if summary.total_transfers_out > 0}
              <div class="flex justify-between text-primary">
                <span>Transfers Out</span>
                <span class="font-mono tabular-nums">{summary.total_transfers_out}</span>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Closing Stock on Hand -->
        <div class="pt-2 border-t border-border">
          <div class="font-semibold text-primary mb-1">
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
          <div class="flex justify-between pl-3 font-semibold text-primary pt-1 border-t border-border">
            <span>Subtotal Closing Stock Count</span>
            <span class="font-mono tabular-nums">{summary.actual_closing_stock}</span>
          </div>
        </div>

        <!-- Total Outflows + Closing Summary -->
        <div class="pt-3 border-t-2 border-primary flex justify-between font-bold text-sm text-primary">
          <span class="font-display uppercase tracking-wider">TOTAL OUTFLOWS & CLOSING (B)</span>
          <span class="font-mono tabular-nums text-base">{summary.total_outflows + summary.actual_closing_stock}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Grand Reconciliation Statement Box -->
  <div class="border-2 rounded-lg p-5 mb-8 keep-together {summary.is_balanced ? 'border-success bg-success/5' : 'border-danger bg-danger/5'}">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-bold text-xs uppercase tracking-wider font-display flex items-center gap-2 {summary.is_balanced ? 'text-success' : 'text-danger'}">
        {#if summary.is_balanced}
          <CheckCircle2 class="w-4 h-4 text-success" />
          <span>Final Balancing Certificate: Reconciled</span>
        {:else}
          <AlertTriangle class="w-4 h-4 text-danger" />
          <span>Final Balancing Certificate: Variance Detected</span>
        {/if}
      </h3>
      <span class="font-mono tabular-nums font-bold text-xs px-2.5 py-1 rounded {summary.is_balanced ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}">
        Variance: {summary.discrepancy === 0 ? '0 (Fully Balanced)' : `${summary.discrepancy > 0 ? '+' : ''}${summary.discrepancy} Head`}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-4 text-center py-2 border-y border-border font-mono tabular-nums text-xs">
      <div>
        <div class="text-[10px] text-text-muted uppercase font-sans tracking-wider">Total Inflows (A)</div>
        <div class="text-base font-bold text-primary mt-0.5">{summary.total_inflows}</div>
      </div>
      <div>
        <div class="text-[10px] text-text-muted uppercase font-sans tracking-wider">Total Disposals + Closing (B)</div>
        <div class="text-base font-bold text-primary mt-0.5">{summary.total_outflows + summary.actual_closing_stock}</div>
      </div>
      <div>
        <div class="text-[10px] text-text-muted uppercase font-sans tracking-wider">Discrepancy (B &minus; A)</div>
        <div class="text-base font-bold {summary.is_balanced ? 'text-success' : 'text-danger'} mt-0.5">
          {summary.discrepancy}
        </div>
      </div>
    </div>

    {#if period.period_notes}
      <div class="mt-3 text-xs text-text-muted italic">
        <strong class="text-primary font-semibold not-italic">Notes:</strong> {period.period_notes}
      </div>
    {/if}
  </div>

  <!-- 3. HMRC Herd Basis Capital Statement (ITTOIA 2005 / BIM55500) -->
  {#if summary.herd_basis.status !== 'none'}
    <div class="border border-border rounded-lg p-5 mb-8 bg-canvas/40 keep-together">
      <div class="border-b border-border pb-2 mb-3 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider text-primary font-display">
          3. HMRC Herd Basis Capital Statement (ITTOIA 2005 / BIM55500)
        </h3>
        <span
          class="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-wide
          {summary.herd_basis.status === 'substantial_reduction'
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : summary.herd_basis.status === 'minor_reduction'
            ? 'bg-slate-200 text-primary border border-border'
            : summary.herd_basis.status === 'expansion'
            ? 'bg-accent/15 text-accent border border-accent/30'
            : 'bg-success-light/40 text-success border border-success/30'}"
        >
          {summary.herd_basis.status_badge} [{summary.herd_basis.tax_rule}]
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center py-2 border-y border-border font-mono tabular-nums text-xs mb-3 bg-white rounded">
        <div>
          <div class="text-[10px] text-text-muted uppercase font-sans tracking-wider">Opening Herd</div>
          <div class="text-sm font-bold text-primary mt-0.5">{summary.herd_basis.opening_head} head</div>
        </div>
        <div>
          <div class="text-[10px] text-text-muted uppercase font-sans tracking-wider">Closing Herd</div>
          <div class="text-sm font-bold text-primary mt-0.5">{summary.herd_basis.closing_head} head</div>
        </div>
        <div>
          <div class="text-[10px] text-text-muted uppercase font-sans tracking-wider">Net Change</div>
          <div class="text-sm font-bold {summary.herd_basis.net_change_head >= 0 ? 'text-primary' : 'text-amber-800'} mt-0.5">
            {summary.herd_basis.net_change_head >= 0 ? `+${summary.herd_basis.net_change_head}` : summary.herd_basis.net_change_head} head
          </div>
        </div>
        <div>
          <div class="text-[10px] text-text-muted uppercase font-sans tracking-wider">Shift %</div>
          <div class="text-sm font-bold {summary.herd_basis.percentage_change >= 0 ? 'text-primary' : 'text-amber-800'} mt-0.5">
            {summary.herd_basis.percentage_change >= 0 ? `+${summary.herd_basis.percentage_change}` : summary.herd_basis.percentage_change}%
          </div>
        </div>
      </div>

      <div class="text-xs text-text-muted space-y-1">
        <p><strong class="text-primary">Statutory Tax Treatment:</strong> {summary.herd_basis.tax_treatment}</p>
        {#if (period.deaths_breakdown.tb_reactors ?? 0) > 0}
          <div class="mt-2.5 p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
            <strong>Statutory Disease Relief (BIM55560 / HS224):</strong> {period.deaths_breakdown.tb_reactors} head compulsorily slaughtered under statutory animal health disease powers (Bovine TB). Special replacement election and compensation tax deferral rules apply.
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- 4. Balance Sheet Stock Valuation Schedule (HS232 / Cost Basis) -->
  {#if summary.valuations.has_valuations}
    <div class="border border-border rounded-lg p-5 mb-8 bg-canvas/40 keep-together">
      <div class="border-b border-border pb-2 mb-3 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider text-primary font-display">
          4. Balance Sheet Valuations (£) (HS232 Deemed Cost / Cost Basis)
        </h3>
        <span class="text-xs font-mono font-bold text-text-muted">GBP (£)</span>
      </div>

      <div class="overflow-x-auto mb-3">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="border-b border-border text-text-muted text-[10px] uppercase font-display">
              <th class="py-1.5 font-bold">Category</th>
              <th class="py-1.5 font-bold">Classification</th>
              <th class="py-1.5 text-right font-bold">Opening (£/hd)</th>
              <th class="py-1.5 text-right font-bold">Opening Total</th>
              <th class="py-1.5 text-right font-bold">Closing (£/hd)</th>
              <th class="py-1.5 text-right font-bold">Closing Total</th>
              <th class="py-1.5 text-right font-bold">Net Movement</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/50">
            {#each period.categories as cat}
              {#if (cat.opening_stock > 0 && (cat.opening_value_per_head ?? 0) > 0) || (cat.actual_closing_stock > 0 && (cat.closing_value_per_head ?? 0) > 0)}
                {@const open_val = (cat.opening_stock || 0) * (cat.opening_value_per_head || 0)}
                {@const close_val = (cat.actual_closing_stock || 0) * (cat.closing_value_per_head || 0)}
                {@const diff = close_val - open_val}
                <tr class="py-1">
                  <td class="py-1.5 font-medium text-primary">{cat.name}</td>
                  <td class="py-1.5 text-text-muted">{cat.classification === 'breeding_herd' ? 'Breeding Herd (Capital)' : 'Trading Stock (Revenue)'}</td>
                  <td class="py-1.5 text-right font-mono tabular-nums">{cat.opening_value_per_head ? `£${cat.opening_value_per_head.toLocaleString()}` : '—'}</td>
                  <td class="py-1.5 text-right font-mono tabular-nums font-semibold">£{open_val.toLocaleString()}</td>
                  <td class="py-1.5 text-right font-mono tabular-nums">{cat.closing_value_per_head ? `£${cat.closing_value_per_head.toLocaleString()}` : '—'}</td>
                  <td class="py-1.5 text-right font-mono tabular-nums font-semibold">£{close_val.toLocaleString()}</td>
                  <td class="py-1.5 text-right font-mono tabular-nums font-semibold {diff >= 0 ? 'text-success' : 'text-danger'}">
                    {diff >= 0 ? `+£${diff.toLocaleString()}` : `-£${Math.abs(diff).toLocaleString()}`}
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border text-xs">
        <div class="p-2.5 rounded bg-white border border-border">
          <div class="text-[10px] text-text-muted uppercase font-sans font-semibold">Breeding Herd (Capital Asset)</div>
          <div class="text-sm font-bold font-mono text-primary mt-1">
            £{summary.valuations.breeding_closing_value.toLocaleString()}
          </div>
          <div class="text-[10px] text-text-muted mt-0.5">
            Opening: £{summary.valuations.breeding_opening_value.toLocaleString()} &bull; Mov: {summary.valuations.breeding_movement >= 0 ? '+' : ''}£{summary.valuations.breeding_movement.toLocaleString()}
          </div>
        </div>

        <div class="p-2.5 rounded bg-white border border-border">
          <div class="text-[10px] text-text-muted uppercase font-sans font-semibold">Trading Stock (Revenue Inventory)</div>
          <div class="text-sm font-bold font-mono text-primary mt-1">
            £{summary.valuations.trading_closing_value.toLocaleString()}
          </div>
          <div class="text-[10px] text-text-muted mt-0.5">
            Opening: £{summary.valuations.trading_opening_value.toLocaleString()} &bull; P&L Movement: {summary.valuations.trading_movement >= 0 ? '+' : ''}£{summary.valuations.trading_movement.toLocaleString()}
          </div>
        </div>

        <div class="p-2.5 rounded bg-white border border-border">
          <div class="text-[10px] text-text-muted uppercase font-sans font-semibold">Total Stock Valuation</div>
          <div class="text-sm font-bold font-mono text-primary mt-1">
            £{summary.valuations.total_closing_value.toLocaleString()}
          </div>
          <div class="text-[10px] text-text-muted mt-0.5">
            Opening: £{summary.valuations.total_opening_value.toLocaleString()} &bull; Net Movement: {summary.valuations.total_movement >= 0 ? '+' : ''}£{summary.valuations.total_movement.toLocaleString()}
          </div>
        </div>
      </div>

      <p class="text-[10px] text-text-muted italic mt-3">
        Note: Trading stock inventory adjustments flow into commercial Farm Trading Profit & Loss. Breeding Herd capital movements under HMRC Herd Basis rules (ITTOIA 2005) represent fixed asset adjustments not taxable as trading revenue.
      </p>
    </div>
  {/if}

  <!-- Declaration & Sign-off Block -->
  <div class="grid grid-cols-2 gap-12 pt-4 border-t border-border text-xs keep-together">
    <div>
      <p class="font-semibold text-primary mb-6">Farmer / Manager Declaration:</p>
      <div class="border-b border-text-muted/40 mb-1.5 h-6"></div>
      <div class="flex justify-between text-text-muted text-[11px]">
        <span>Signature</span>
        <span>Date</span>
      </div>
    </div>
    <div>
      <p class="font-semibold text-primary mb-6">Accountant / Auditor Confirmation:</p>
      <div class="border-b border-text-muted/40 mb-1.5 h-6"></div>
      <div class="flex justify-between text-text-muted text-[11px]">
        <span>Signature</span>
        <span>Date</span>
      </div>
    </div>
  </div>

  <div class="mt-8 text-center text-[10px] text-text-muted font-mono">
    Generated via <span class="font-display font-extrabold">{BRAND.name}</span> &bull; {BRAND.tagline} &bull; Private On-Farm Records
  </div>
</div>
