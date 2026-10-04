<script lang="ts">
  import type { AccountingPeriod } from '../types/livestock';
  import { validate_deaths_breakdown } from '../utils/calculations';
  import { Skull, AlertCircle, CheckCircle2, Info } from '@lucide/svelte';

  interface Props {
    period: AccountingPeriod;
  }

  let { period = $bindable() }: Props = $props();

  let deaths_check = $derived(validate_deaths_breakdown(period));

  function block_invalid_number_keys(e: KeyboardEvent) {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  }

  function handle_sanitise(e: Event, key: 'under_one_year' | 'one_to_two_years' | 'over_two_years' | 'tb_reactors') {
    const target = e.target as HTMLInputElement;
    const clean = target.value.replace(/[^0-9]/g, '');
    if (clean !== target.value) {
      target.value = clean;
    }
    period.deaths_breakdown[key] = clean === '' ? 0 : parseInt(clean, 10);
  }
</script>

<div class="bg-white rounded-xl shadow-xs border border-border overflow-hidden mb-6 no-print">
  <div class="px-6 py-4 border-b border-border bg-canvas flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Skull class="w-4 h-4 text-text-muted" />
      <div>
        <h3 class="font-bold text-sm text-primary font-display uppercase tracking-wide">Deaths & Casualties by Age Group</h3>
        <p class="text-xs text-text-muted">
          HMRC casualty breakdown by age category and statutory disease removals.
        </p>
      </div>
    </div>

    <!-- Match Status Badge -->
    <div>
      {#if deaths_check.is_matching}
        <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-success-light text-success font-semibold">
          <CheckCircle2 class="w-3.5 h-3.5" />
          Matches movement schedule ({deaths_check.recorded_total})
        </span>
      {:else}
        <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-danger-light text-danger font-semibold">
          <AlertCircle class="w-3.5 h-3.5" />
          Discrepancy: Schedule records {deaths_check.recorded_total}, breakdown totals {deaths_check.breakdown_total}
        </span>
      {/if}
    </div>
  </div>

  <div class="p-6">
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
      <div>
        <label for="calves-deaths-input" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 font-display">
          Calves (&lt; 1 Year)
        </label>
        <input
          id="calves-deaths-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          value={period.deaths_breakdown.under_one_year}
          onkeydown={block_invalid_number_keys}
          oninput={(e) => handle_sanitise(e, 'under_one_year')}
          class="w-full text-right py-2 px-3 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent font-mono font-bold text-sm tabular-nums text-primary bg-canvas/50"
        />
      </div>

      <div>
        <label for="yearlings-deaths-input" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 font-display">
          Yearlings (1–2 Years)
        </label>
        <input
          id="yearlings-deaths-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          value={period.deaths_breakdown.one_to_two_years}
          onkeydown={block_invalid_number_keys}
          oninput={(e) => handle_sanitise(e, 'one_to_two_years')}
          class="w-full text-right py-2 px-3 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent font-mono font-bold text-sm tabular-nums text-primary bg-canvas/50"
        />
      </div>

      <div>
        <label for="mature-deaths-input" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 font-display">
          Mature Stock (&gt; 2 Years)
        </label>
        <input
          id="mature-deaths-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          value={period.deaths_breakdown.over_two_years}
          onkeydown={block_invalid_number_keys}
          oninput={(e) => handle_sanitise(e, 'over_two_years')}
          class="w-full text-right py-2 px-3 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent font-mono font-bold text-sm tabular-nums text-primary bg-canvas/50"
        />
      </div>

      <div>
        <label for="tb-reactors-input" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 font-display flex items-center justify-between">
          <span>TB / Compulsory</span>
          <span class="text-[10px] text-accent font-mono uppercase font-bold">BIM55560</span>
        </label>
        <input
          id="tb-reactors-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          value={period.deaths_breakdown.tb_reactors || ''}
          placeholder="0"
          title="Count of statutory compulsory slaughter removals included in losses (triggers HS224 replacement rules)"
          onkeydown={block_invalid_number_keys}
          oninput={(e) => handle_sanitise(e, 'tb_reactors')}
          class="w-full text-right py-2 px-3 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent font-mono font-bold text-sm tabular-nums text-primary bg-canvas/50"
        />
      </div>
    </div>

    <div>
      <label for="casualty-notes-input" class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 font-display">
        Casualty Notes (Optional)
      </label>
      <input
        id="casualty-notes-input"
        type="text"
        bind:value={period.deaths_breakdown.notes}
        placeholder="e.g. 1 calf lost at turnout, 2 Bovine TB reactors slaughtered under APHA direction"
        class="w-full py-2 px-3 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent text-xs text-primary bg-canvas/50"
      />
    </div>

    {#if (period.deaths_breakdown.tb_reactors || 0) > 0}
      <div class="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/30 text-xs text-primary flex items-center gap-2">
        <Info class="w-4 h-4 text-accent shrink-0" />
        <span>
          <strong>HMRC Statutory Relief (BIM55560 / HS224):</strong>
          {period.deaths_breakdown.tb_reactors} compulsory disease slaughter removals recorded. Statutory compensation and replacement rules apply, enabling fresh herd basis elections or roll-over relief.
        </span>
      </div>
    {/if}
  </div>
</div>
