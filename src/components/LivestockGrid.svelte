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

<div class="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden mb-6 no-print">
  <div class="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
    <div>
      <h2 class="font-bold text-base text-stone-900">Livestock Movements & Balances</h2>
      <p class="text-xs text-stone-500 mt-0.5">
        Enter your animal numbers. Totals and differences calculate automatically.
      </p>
    </div>
    <div class="flex items-center gap-2">
      <button
        onclick={() => on_add_category('trading_stock')}
        class="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Trading Category
      </button>
      <button
        onclick={() => on_add_category('breeding_herd')}
        class="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Breeding Category
      </button>
    </div>
  </div>

  <div class="overflow-x-auto scrollbar-thin">
    <table class="w-full text-xs text-left border-collapse min-w-[980px]">
      <thead>
        <!-- Header Grouping -->
        <tr class="bg-stone-100 border-b border-stone-300 text-stone-700 font-semibold uppercase text-[10px] tracking-wider">
          <th class="py-2.5 px-3 w-48 border-r border-stone-200" rowspan="2">Livestock Category</th>
          <th class="text-center py-1.5 px-2 bg-emerald-50/70 border-r border-stone-200 text-emerald-900" colspan="5">
            Numbers In (Additions)
          </th>
          <th class="text-center py-1.5 px-2 bg-stone-100 border-r border-stone-200 text-stone-800" colspan="5">
            Numbers Out (Disposals)
          </th>
          <th class="text-center py-1.5 px-2 bg-blue-50/60 border-r border-stone-200 text-blue-900" colspan="3">
            Closing Stock & Balance
          </th>
          <th class="w-10 text-center py-1.5 px-1" rowspan="2"></th>
        </tr>
        <!-- Sub-headers -->
        <tr class="bg-stone-50 border-b border-stone-300 text-stone-600 font-medium text-[11px]">
          <!-- Inflows -->
          <th class="py-2 px-2 text-right w-16">Opening</th>
          <th class="py-2 px-2 text-right w-16">Births</th>
          <th class="py-2 px-2 text-right w-16">Bought</th>
          <th class="py-2 px-2 text-right w-16">Trans In</th>
          <th class="py-2 px-2 text-right w-16 bg-emerald-100/50 font-bold text-emerald-900 border-r border-stone-200">
            Total In
          </th>
          <!-- Outflows -->
          <th class="py-2 px-2 text-right w-16">Sales</th>
          <th class="py-2 px-2 text-right w-16">Deaths</th>
          <th class="py-2 px-2 text-right w-16">Own Kill</th>
          <th class="py-2 px-2 text-right w-16">Trans Out</th>
          <th class="py-2 px-2 text-right w-16 bg-stone-200/50 font-bold text-stone-900 border-r border-stone-200">
            Total Out
          </th>
          <!-- Closing -->
          <th class="py-2 px-2 text-right w-20 font-bold text-blue-950">Expected</th>
          <th class="py-2 px-2 text-right w-20 font-bold text-stone-900">Count on Farm</th>
          <th class="py-2 px-2 text-right w-20 font-bold border-r border-stone-200">Difference</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-stone-200">
        <!-- 1. Breeding Herd Section -->
        <tr class="bg-emerald-900/10 font-bold text-emerald-950 text-xs">
          <td colspan="15" class="py-2 px-3 flex items-center gap-1.5">
            <Shield class="w-3.5 h-3.5 text-emerald-700" />
            <span>Breeding Herd (Cows & Bulls - Herd Basis)</span>
          </td>
        </tr>

        {#if breeding_categories.length === 0}
          <tr>
            <td colspan="15" class="py-3 px-4 text-center text-stone-400 italic">
              No breeding stock recorded in this period.
            </td>
          </tr>
        {:else}
          {#each breeding_categories as category (category.id)}
            {@const inflows = calculate_category_inflows(category)}
            {@const outflows = calculate_category_outflows(category)}
            {@const calculated_closing = calculate_category_expected_closing(category)}
            {@const discrepancy = calculate_category_discrepancy(category)}
            <tr class="hover:bg-stone-50/80 transition-colors">
              <td class="py-2 px-3 border-r border-stone-200 font-medium text-stone-800">
                <input
                  type="text"
                  bind:value={category.name}
                  class="w-full bg-transparent border-0 border-b border-transparent hover:border-stone-300 focus:border-emerald-500 focus:ring-0 p-0 text-xs font-medium"
                />
              </td>
              <!-- Inflows -->
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.opening_stock}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.births}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.purchases}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.transfers_in}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-2 px-2 text-right bg-emerald-50/60 font-mono font-bold text-emerald-950 border-r border-stone-200">
                {inflows}
              </td>
              <!-- Outflows -->
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.sales}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.deaths}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.own_consumption}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.transfers_out}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-2 px-2 text-right bg-stone-100 font-mono font-bold text-stone-900 border-r border-stone-200">
                {outflows}
              </td>
              <!-- Closing -->
              <td class="py-2 px-2 text-right bg-blue-50/40 font-mono font-bold text-blue-950">
                {calculated_closing}
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.actual_closing_stock}
                  class="w-full text-right py-1 px-1.5 font-bold border border-stone-300 rounded bg-amber-50/30 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-2 px-2 text-right border-r border-stone-200 font-mono font-bold">
                {#if discrepancy === 0}
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">
                    0
                  </span>
                {:else}
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] {discrepancy > 0 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}">
                    {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                  </span>
                {/if}
              </td>
              <td class="py-2 px-1 text-center">
                <button
                  onclick={() => on_delete_category(category.id)}
                  class="text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove row"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          {/each}
        {/if}

        <!-- 2. Trading Stock Section -->
        <tr class="bg-stone-200/50 font-bold text-stone-900 text-xs">
          <td colspan="15" class="py-2 px-3 flex items-center gap-1.5">
            <TrendingUp class="w-3.5 h-3.5 text-stone-700" />
            <span>Trading Cattle (Stores, Fat Cattle & Calves)</span>
          </td>
        </tr>

        {#if trading_categories.length === 0}
          <tr>
            <td colspan="15" class="py-6 px-4 text-center bg-stone-50/50">
              <div class="max-w-md mx-auto space-y-2">
                <p class="text-xs font-semibold text-stone-700">No trading cattle categories added yet.</p>
                <p class="text-[11px] text-stone-500">
                  Add cattle categories (e.g. Fat Bullocks, Store Cattle, Calves) to record your numbers.
                </p>
                <button
                  type="button"
                  onclick={() => on_add_category('trading_stock')}
                  class="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
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
            <tr class="hover:bg-stone-50/80 transition-colors">
              <td class="py-2 px-3 border-r border-stone-200 font-medium text-stone-800">
                <input
                  type="text"
                  bind:value={category.name}
                  class="w-full bg-transparent border-0 border-b border-transparent hover:border-stone-300 focus:border-emerald-500 focus:ring-0 p-0 text-xs font-medium"
                />
              </td>
              <!-- Inflows -->
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.opening_stock}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.births}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.purchases}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.transfers_in}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-2 px-2 text-right bg-emerald-50/60 font-mono font-bold text-emerald-950 border-r border-stone-200">
                {inflows}
              </td>
              <!-- Outflows -->
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.sales}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.deaths}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.own_consumption}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.transfers_out}
                  class="w-full text-right py-1 px-1.5 border border-stone-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-2 px-2 text-right bg-stone-100 font-mono font-bold text-stone-900 border-r border-stone-200">
                {outflows}
              </td>
              <!-- Closing -->
              <td class="py-2 px-2 text-right bg-blue-50/40 font-mono font-bold text-blue-950">
                {calculated_closing}
              </td>
              <td class="py-1 px-1.5 text-right">
                <input
                  type="number"
                  min="0"
                  bind:value={category.actual_closing_stock}
                  class="w-full text-right py-1 px-1.5 font-bold border border-stone-300 rounded bg-amber-50/30 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </td>
              <td class="py-2 px-2 text-right border-r border-stone-200 font-mono font-bold">
                {#if discrepancy === 0}
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">
                    0
                  </span>
                {:else}
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] {discrepancy > 0 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}">
                    {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                  </span>
                {/if}
              </td>
              <td class="py-2 px-1 text-center">
                <button
                  onclick={() => on_delete_category(category.id)}
                  class="text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
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
