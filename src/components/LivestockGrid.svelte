<script lang="ts">
  import type { AccountingPeriod, LivestockCategory } from '../types/livestock';
  import {
    calculate_category_discrepancy,
    calculate_category_expected_closing,
    calculate_category_inflows,
    calculate_category_outflows,
  } from '../utils/calculations';
  import { Plus, Trash2, HelpCircle, Shield, TrendingUp, TrendingDown } from '@lucide/svelte';

  interface Props {
    period: AccountingPeriod;
    on_add_category: (classification: 'breeding_herd' | 'trading_stock') => void;
    on_delete_category: (id: string) => void;
  }

  let { period = $bindable(), on_add_category, on_delete_category }: Props = $props();

  let breeding_categories = $derived(
    period.categories.filter((c) => c.classification === 'breeding_herd')
  );
  let trading_categories = $derived(
    period.categories.filter((c) => c.classification === 'trading_stock')
  );
</script>

<div class="bg-white rounded-xl shadow-xs border border-trough overflow-hidden mb-6 no-print">
  <div class="px-6 py-4 border-b border-trough bg-chalk flex items-center justify-between">
    <div>
      <h2 class="font-bold text-base text-cast-iron font-display uppercase tracking-wide">Livestock Movements & Balances</h2>
      <p class="text-xs text-galvanised mt-0.5">
        Enter stock numbers across categories. Reconciliations balance in real time.
      </p>
    </div>
    <div class="flex items-center gap-2">
      <button
        onclick={() => on_add_category('trading_stock')}
        class="px-2.5 py-1.5 bg-chalk hover:bg-trough text-cast-iron border border-trough rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5 text-ear-tag" />
        Add Trading Category
      </button>
      <button
        onclick={() => on_add_category('breeding_herd')}
        class="px-2.5 py-1.5 bg-chalk hover:bg-trough text-cast-iron border border-trough rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5 text-ear-tag" />
        Add Breeding Category
      </button>
    </div>
  </div>

  <div class="overflow-x-auto scrollbar-thin">
    <table class="w-full text-xs text-left border-collapse min-w-[980px]">
      <thead>
        <!-- Header Grouping -->
        <tr class="bg-chalk border-b border-trough text-galvanised font-semibold uppercase text-[10px] tracking-wider font-display">
          <th class="py-2.5 px-3 w-48 border-r border-trough" rowspan="2">Livestock Category</th>
          <th class="text-center py-1.5 px-2 bg-trough/50 border-r border-trough text-cast-iron" colspan="5">
            Numbers In (Additions)
          </th>
          <th class="text-center py-1.5 px-2 bg-trough/40 border-r border-trough text-cast-iron" colspan="5">
            Numbers Out (Disposals)
          </th>
          <th class="text-center py-1.5 px-2 bg-trough/60 border-r border-trough text-cast-iron" colspan="3">
            Closing Stock & Balance
          </th>
          <th class="w-10 text-center py-1.5 px-1" rowspan="2"></th>
        </tr>
        <!-- Sub-headers -->
        <tr class="bg-chalk/80 border-b border-trough text-galvanised font-medium text-[11px] font-display uppercase tracking-wider">
          <!-- Inflows -->
          <th class="py-2 px-2 text-right w-16">Opening</th>
          <th class="py-2 px-2 text-right w-16">Births</th>
          <th class="py-2 px-2 text-right w-16">Bought</th>
          <th class="py-2 px-2 text-right w-16">Trans In</th>
          <th class="py-2 px-2 text-right w-16 bg-trough/50 font-bold text-cast-iron border-r border-trough">
            Total In
          </th>
          <!-- Outflows -->
          <th class="py-2 px-2 text-right w-16">Sales</th>
          <th class="py-2 px-2 text-right w-16">Deaths</th>
          <th class="py-2 px-2 text-right w-16">Own Kill</th>
          <th class="py-2 px-2 text-right w-16">Trans Out</th>
          <th class="py-2 px-2 text-right w-16 bg-trough/50 font-bold text-cast-iron border-r border-trough">
            Total Out
          </th>
          <!-- Closing -->
          <th class="py-2 px-2 text-right w-20 font-bold text-cast-iron">Expected</th>
          <th class="py-2 px-2 text-right w-20 font-bold text-cast-iron">Count on Farm</th>
          <th class="py-2 px-2 text-right w-20 font-bold border-r border-trough">Difference</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-trough">
        <!-- 1. Breeding Herd Section -->
        <tr class="bg-cast-iron-light/10 font-bold text-cast-iron text-xs font-display uppercase tracking-wider">
          <td colspan="15" class="py-2 px-3 flex items-center gap-1.5">
            <Shield class="w-3.5 h-3.5 text-galvanised" />
            <span>Breeding Herd (Capital Assets &mdash; HMRC Herd Basis)</span>
          </td>
        </tr>

        {#if breeding_categories.length === 0}
          <tr>
            <td colspan="15" class="py-3 px-4 text-center text-galvanised italic">
              No breeding stock recorded in this period.
            </td>
          </tr>
        {:else}
          {#each breeding_categories as category (category.id)}
            {@const inflows = calculate_category_inflows(category)}
            {@const outflows = calculate_category_outflows(category)}
            {@const calculated_closing = calculate_category_expected_closing(category)}
            {@const discrepancy = calculate_category_discrepancy(category)}
            <tr class="hover:bg-chalk/80 transition-colors">
              <td class="py-2 px-3 border-r border-trough font-medium text-cast-iron">
                <input
                  type="text"
                  bind:value={category.name}
                  class="w-full bg-transparent border-0 border-b border-transparent hover:border-galvanised-light focus:border-ear-tag focus:ring-0 p-0 text-xs font-medium"
                />
              </td>
              <!-- Inflows -->
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.opening_stock}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.births}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.purchases}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.transfers_in}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-2 px-2 text-right bg-trough/30 font-mono font-bold text-cast-iron border-r border-trough tabular-nums">
                {inflows}
              </td>
              <!-- Outflows -->
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.sales}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.deaths}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.own_consumption}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.transfers_out}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-2 px-2 text-right bg-trough/30 font-mono font-bold text-cast-iron border-r border-trough tabular-nums">
                {outflows}
              </td>
              <!-- Closing -->
              <td class="py-2 px-2 text-right bg-trough/50 font-mono font-bold text-cast-iron tabular-nums">
                {calculated_closing}
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.actual_closing_stock}
                  class="w-full text-right py-1 px-1.5 font-bold border border-trough rounded bg-chalk focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs text-cast-iron"
                />
              </td>
              <td class="py-2 px-2 text-right border-r border-trough font-mono font-bold">
                {#if discrepancy === 0}
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-yard-green-light text-yard-green font-mono font-bold">
                    0
                  </span>
                {:else}
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-cull-red-light text-cull-red font-mono font-bold">
                    {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                  </span>
                {/if}
              </td>
              <td class="py-2 px-1 text-center">
                <button
                  onclick={() => on_delete_category(category.id)}
                  class="text-galvanised-light hover:text-cull-red transition-colors cursor-pointer"
                  title="Remove row"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          {/each}
        {/if}

        <!-- 2. Trading Stock Section -->
        <tr class="bg-cast-iron-light/10 font-bold text-cast-iron text-xs font-display uppercase tracking-wider">
          <td colspan="15" class="py-2 px-3 flex items-center gap-1.5">
            <TrendingUp class="w-3.5 h-3.5 text-galvanised" />
            <span>Trading Cattle (Revenue Stock &mdash; Stores, Fat Cattle & Calves)</span>
          </td>
        </tr>

        {#if trading_categories.length === 0}
          <tr>
            <td colspan="15" class="py-6 px-4 text-center bg-chalk">
              <div class="max-w-md mx-auto space-y-2">
                <p class="text-xs font-semibold text-cast-iron font-display uppercase tracking-wide">No trading cattle recorded.</p>
                <p class="text-[11px] text-galvanised">
                  Enter revenue cattle categories (e.g. Stores, Fat Bullocks, Calves) to begin reconciliation.
                </p>
                <button
                  type="button"
                  onclick={() => on_add_category('trading_stock')}
                  class="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ear-tag hover:bg-ear-tag-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add First Trading Category</span>
                </button>
              </div>
            </td>
          </tr>
        {:else}
          {#each trading_categories as category (category.id)}
            {@const inflows = calculate_category_inflows(category)}
            {@const outflows = calculate_category_outflows(category)}
            {@const calculated_closing = calculate_category_expected_closing(category)}
            {@const discrepancy = calculate_category_discrepancy(category)}
            <tr class="hover:bg-chalk/80 transition-colors">
              <td class="py-2 px-3 border-r border-trough font-medium text-cast-iron">
                <input
                  type="text"
                  bind:value={category.name}
                  class="w-full bg-transparent border-0 border-b border-transparent hover:border-galvanised-light focus:border-ear-tag focus:ring-0 p-0 text-xs font-medium"
                />
              </td>
              <!-- Inflows -->
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.opening_stock}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.births}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.purchases}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.transfers_in}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-2 px-2 text-right bg-trough/30 font-mono font-bold text-cast-iron border-r border-trough tabular-nums">
                {inflows}
              </td>
              <!-- Outflows -->
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.sales}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.deaths}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.own_consumption}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.transfers_out}
                  class="w-full text-right py-1 px-1.5 border border-trough rounded focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs"
                />
              </td>
              <td class="py-2 px-2 text-right bg-trough/30 font-mono font-bold text-cast-iron border-r border-trough tabular-nums">
                {outflows}
              </td>
              <!-- Closing -->
              <td class="py-2 px-2 text-right bg-trough/50 font-mono font-bold text-cast-iron tabular-nums">
                {calculated_closing}
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.actual_closing_stock}
                  class="w-full text-right py-1 px-1.5 font-bold border border-trough rounded bg-chalk focus:ring-1 focus:ring-ear-tag focus:border-ear-tag font-mono tabular-nums text-xs text-cast-iron"
                />
              </td>
              <td class="py-2 px-2 text-right border-r border-trough font-mono font-bold">
                {#if discrepancy === 0}
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-yard-green-light text-yard-green font-mono font-bold">
                    0
                  </span>
                {:else}
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-cull-red-light text-cull-red font-mono font-bold">
                    {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                  </span>
                {/if}
              </td>
              <td class="py-2 px-1 text-center">
                <button
                  onclick={() => on_delete_category(category.id)}
                  class="text-galvanised-light hover:text-cull-red transition-colors cursor-pointer"
                  title="Remove row"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
