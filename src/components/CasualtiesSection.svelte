<script lang="ts">
  import type { AccountingPeriod } from '../types/livestock';
  import { validate_deaths_breakdown } from '../utils/calculations';
  import { Skull, AlertCircle, CheckCircle2 } from '@lucide/svelte';

  interface Props {
    period: AccountingPeriod;
  }

  let { period = $bindable() }: Props = $props();

  let deaths_check = $derived(validate_deaths_breakdown(period));
</script>

<div class="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden mb-6 no-print">
  <div class="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Skull class="w-4 h-4 text-stone-600" />
      <div>
        <h3 class="font-bold text-sm text-stone-900">Deaths & Casualties by Age Group</h3>
        <p class="text-xs text-stone-500">
          HMRC breakdown of casualties by age group.
        </p>
      </div>
    </div>

    <!-- Match Status Badge -->
    <div>
      {#if deaths_check.is_matching}
        <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
          <CheckCircle2 class="w-3.5 h-3.5" />
          Matches numbers table ({deaths_check.recorded_total})
        </span>
      {:else}
        <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold">
          <AlertCircle class="w-3.5 h-3.5" />
          Mismatch: Table shows {deaths_check.recorded_total}, Age groups show {deaths_check.breakdown_total}
        </span>
      {/if}
    </div>
  </div>

  <div class="p-6">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div>
        <label for="calves-deaths-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
          Calves (&lt; 1 Year)
        </label>
        <input
          id="calves-deaths-input"
          type="number"
          min="0"
          bind:value={period.deaths_breakdown.under_one_year}
          class="w-full text-right py-2 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono font-bold text-sm"
        />
      </div>

      <div>
        <label for="yearlings-deaths-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
          Yearlings (1–2 Years)
        </label>
        <input
          id="yearlings-deaths-input"
          type="number"
          min="0"
          bind:value={period.deaths_breakdown.one_to_two_years}
          class="w-full text-right py-2 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono font-bold text-sm"
        />
      </div>

      <div>
        <label for="mature-deaths-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
          Mature Stock (&gt; 2 Years)
        </label>
        <input
          id="mature-deaths-input"
          type="number"
          min="0"
          bind:value={period.deaths_breakdown.over_two_years}
          class="w-full text-right py-2 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono font-bold text-sm"
        />
      </div>
    </div>

    <div>
      <label for="casualty-notes-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
        Casualty Notes (Optional)
      </label>
      <input
        id="casualty-notes-input"
        type="text"
        bind:value={period.deaths_breakdown.notes}
        placeholder="e.g. 1 calf lost at turnout, 1 yearling casualty post-purchase"
        class="w-full py-2 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs"
      />
    </div>
  </div>
</div>
