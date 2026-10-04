<script lang="ts">
  import type { AccountingPeriod, LivestockCategory } from '../types/livestock';
  import {
    calculate_category_discrepancy,
    calculate_category_expected_closing,
    calculate_category_inflows,
    calculate_category_outflows,
    summarise_period,
    validate_deaths_breakdown,
  } from '../utils/calculations';
  import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    AlertCircle,
    Info,
    Calendar,
    Baby,
    ShoppingCart,
    TrendingDown,
    Skull,
    ArrowLeftRight,
    ClipboardCheck,
    Sparkles,
    Shield,
    TrendingUp,
  } from '@lucide/svelte';
  import QuickNumberStepper from './QuickNumberStepper.svelte';

  interface Props {
    period: AccountingPeriod;
    on_switch_to_spreadsheet: () => void;
  }

  let { period = $bindable(), on_switch_to_spreadsheet }: Props = $props();

  // Wizard steps definition
  const STEPS = [
    { id: 'opening', title: '1. Opening Stock', subtitle: 'Numbers on farm at period start', icon: Calendar },
    { id: 'births', title: '2. Calves Born', subtitle: 'Births during the period', icon: Baby },
    { id: 'purchases', title: '3. Purchases', subtitle: 'Stock bought in (marts & private)', icon: ShoppingCart },
    { id: 'sales', title: '4. Sales', subtitle: 'Animals sold (stores, fat, cull)', icon: TrendingDown },
    { id: 'deaths', title: '5. Deaths & Losses', subtitle: 'Casualties and disease removals', icon: Skull },
    { id: 'transfers', title: '6. Transfers & Kill', subtitle: 'Internal movement & own consumption', icon: ArrowLeftRight },
    { id: 'closing', title: '7. Final Count', subtitle: 'Physical head count at end of period', icon: ClipboardCheck },
    { id: 'review', title: '8. Balance Check', subtitle: 'Review reconciliation & discrepancies', icon: Sparkles },
  ] as const;

  let current_step_index = $state(0);
  let active_step = $derived(STEPS[current_step_index]);

  let breeding_categories = $derived(
    period.categories.filter((c) => c.classification === 'breeding_herd')
  );
  let trading_categories = $derived(
    period.categories.filter((c) => c.classification === 'trading_stock')
  );

  let summary = $derived(summarise_period(period));
  let deaths_check = $derived(validate_deaths_breakdown(period));

  function next_step() {
    if (current_step_index < STEPS.length - 1) {
      current_step_index++;
      // Auto-focus first input of the new step
      setTimeout(() => focus_input_index(0), 50);
    }
  }

  function previous_step() {
    if (current_step_index > 0) {
      current_step_index--;
      setTimeout(() => focus_input_index(0), 50);
    }
  }

  function jump_to_step(idx: number) {
    current_step_index = idx;
    setTimeout(() => focus_input_index(0), 50);
  }

  function focus_input_index(idx: number, step_name?: string) {
    const selector = step_name
      ? `[data-step="${step_name}"][data-idx="${idx}"] input[type="number"]`
      : `[data-step="${active_step.id}"][data-idx="${idx}"] input[type="number"]`;
    const el = document.querySelector(selector) as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.select();
    } else {
      // If we've reached the end of inputs in this step, advance to next step
      if (idx > 0) {
        next_step();
      }
    }
  }

  // Auto-sync deaths breakdown helper when user updates category deaths in wizard
  function sync_deaths_breakdown_by_category() {
    let calves = 0;
    let yearlings = 0;
    let mature = 0;

    for (const cat of period.categories) {
      const deaths = Number(cat.deaths || 0);
      if (deaths <= 0) continue;
      const lower = cat.name.toLowerCase();
      if (lower.includes('calf') || lower.includes('calves') || lower.includes('< 1')) {
        calves += deaths;
      } else if (lower.includes('youngstock') || lower.includes('1-2') || lower.includes('yearling')) {
        yearlings += deaths;
      } else {
        mature += deaths;
      }
    }

    period.deaths_breakdown.under_one_year = calves;
    period.deaths_breakdown.one_to_two_years = yearlings;
    period.deaths_breakdown.over_two_years = mature;
  }

  // Quick Zero Fill helpers for steps where farmer had no activity
  function clear_step_field(field_key: 'births' | 'purchases' | 'sales' | 'deaths' | 'transfers_in' | 'transfers_out' | 'own_consumption') {
    for (const cat of period.categories) {
      cat[field_key] = 0;
    }
    if (field_key === 'deaths') {
      period.deaths_breakdown.under_one_year = 0;
      period.deaths_breakdown.one_to_two_years = 0;
      period.deaths_breakdown.over_two_years = 0;
      period.deaths_breakdown.tb_reactors = 0;
    }
  }

  // Quick copy expected closing into actual count
  function match_actual_to_expected() {
    for (const cat of period.categories) {
      cat.actual_closing_stock = calculate_category_expected_closing(cat);
    }
  }
</script>

<div class="bg-white rounded-xl shadow-xs border border-trough overflow-hidden mb-6 no-print">
  <!-- Wizard Header & Progress Bar -->
  <div class="p-6 border-b border-trough bg-chalk/60">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-ear-tag/15 text-ear-tag font-display">
            Step {current_step_index + 1} of {STEPS.length}
          </span>
          <h2 class="text-lg font-bold text-cast-iron font-display tracking-tight">
            {active_step.title}
          </h2>
        </div>
        <p class="text-xs text-galvanised mt-1">
          {active_step.subtitle}
        </p>
      </div>

      <div class="flex items-center gap-2 self-start md:self-auto">
        <button
          type="button"
          onclick={on_switch_to_spreadsheet}
          class="px-3 py-1.5 rounded-lg border border-trough bg-white hover:bg-trough text-cast-iron text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Switch to detailed full-width spreadsheet view"
        >
          <span>Spreadsheet View</span>
        </button>
      </div>
    </div>

    <!-- Stepper Navigation Pills -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
      {#each STEPS as step, idx}
        {@const Icon = step.icon}
        <button
          type="button"
          onclick={() => jump_to_step(idx)}
          class="flex flex-col items-center p-2 rounded-lg text-left transition-all cursor-pointer border {current_step_index === idx
            ? 'bg-cast-iron text-white border-cast-iron shadow-2xs'
            : current_step_index > idx
            ? 'bg-yard-green-light/40 border-yard-green-border text-cast-iron hover:bg-yard-green-light'
            : 'bg-white border-trough text-galvanised hover:border-galvanised-light'}"
        >
          <div class="flex items-center gap-1">
            <Icon class="w-3.5 h-3.5 {current_step_index === idx ? 'text-ear-tag' : current_step_index > idx ? 'text-yard-green' : 'text-galvanised'}" />
            <span class="text-[11px] font-semibold font-display truncate">{idx + 1}. {step.title.split('. ')[1] || step.title}</span>
          </div>
        </button>
      {/each}
    </div>

    <!-- Friendly Speed Hint for Keyboard & Touch -->
    <div class="mt-3 flex items-center justify-between text-[11px] text-galvanised bg-white/70 px-3 py-1.5 rounded-lg border border-trough/60">
      <span class="flex items-center gap-1">
        <kbd class="px-1.5 py-0.5 rounded bg-chalk border border-trough font-mono text-[10px] text-cast-iron font-bold">Enter</kbd>
        moves to next row
      </span>
      <span>Tap <strong>0 / None</strong> or use <strong>+ / &minus;</strong> for quick entry</span>
    </div>
  </div>

  <!-- Wizard Content Container -->
  <div class="p-6">
    <!-- STEP 1: OPENING STOCK -->
    {#if active_step.id === 'opening'}
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="p-4 rounded-xl bg-chalk border border-trough text-xs text-galvanised space-y-1">
          <p class="font-semibold text-cast-iron flex items-center gap-1.5">
            <Info class="w-4 h-4 text-ear-tag" />
            Check your starting numbers
          </p>
          <p>
            These are the head counts on farm at the start of {period.name} ({period.start_date}). If you completed a rollover from last year, these numbers were carried forward automatically.
          </p>
        </div>

        <div class="space-y-4">
          <div class="border border-trough rounded-xl overflow-hidden divide-y divide-trough">
            <div class="bg-chalk px-4 py-2 font-bold text-xs uppercase font-display text-cast-iron flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-galvanised" />
              Breeding Herd (Capital Stock)
            </div>
            {#each breeding_categories as category, idx}
              <div class="p-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-chalk/40 transition-colors">
                <span class="text-xs font-semibold text-cast-iron">{category.name}</span>
                <div data-step="opening" data-idx={idx}>
                  <QuickNumberStepper
                    bind:value={category.opening_stock}
                    on_enter_next={() => focus_input_index(idx + 1, 'opening')}
                  />
                </div>
              </div>
            {/each}
          </div>

          <div class="border border-trough rounded-xl overflow-hidden divide-y divide-trough">
            <div class="bg-chalk px-4 py-2 font-bold text-xs uppercase font-display text-cast-iron flex items-center gap-1.5">
              <TrendingUp class="w-3.5 h-3.5 text-galvanised" />
              Trading Cattle (Commercial Stock)
            </div>
            {#each trading_categories as category, idx}
              {@const overall_idx = breeding_categories.length + idx}
              <div class="p-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-chalk/40 transition-colors">
                <span class="text-xs font-semibold text-cast-iron">{category.name}</span>
                <div data-step="opening" data-idx={overall_idx}>
                  <QuickNumberStepper
                    bind:value={category.opening_stock}
                    on_enter_next={() => focus_input_index(overall_idx + 1, 'opening')}
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

    <!-- STEP 2: BIRTHS -->
    {:else if active_step.id === 'births'}
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="p-4 rounded-xl bg-chalk border border-trough text-xs text-galvanised space-y-1">
          <p class="font-semibold text-cast-iron flex items-center gap-1.5">
            <Baby class="w-4 h-4 text-ear-tag" />
            Calves born during this period
          </p>
          <p>
            Enter total calves born and tagged. Calves are normally recorded under <em>Calves (&lt; 1 yr)</em> or dairy/beef replacements.
          </p>
        </div>

        <div class="border border-trough rounded-xl overflow-hidden divide-y divide-trough">
          {#each period.categories as category, idx}
            <div class="p-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-chalk/40 transition-colors">
              <div>
                <span class="text-xs font-semibold text-cast-iron">{category.name}</span>
                <span class="block text-[11px] text-galvanised capitalize">{category.classification.replace('_', ' ')}</span>
              </div>
              <div data-step="births" data-idx={idx}>
                <QuickNumberStepper
                  bind:value={category.births}
                  on_enter_next={() => focus_input_index(idx + 1, 'births')}
                />
              </div>
            </div>
          {/each}
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            onclick={() => clear_step_field('births')}
            class="text-xs text-galvanised hover:text-cast-iron underline cursor-pointer"
          >
            Clear all births to 0
          </button>
        </div>
      </div>

    <!-- STEP 3: PURCHASES -->
    {:else if active_step.id === 'purchases'}
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="p-4 rounded-xl bg-chalk border border-trough text-xs text-galvanised space-y-1">
          <p class="font-semibold text-cast-iron flex items-center gap-1.5">
            <ShoppingCart class="w-4 h-4 text-ear-tag" />
            Stock bought into the farm
          </p>
          <p>
            Enter head counts purchased from marts, farm dispersals, or private acquisitions during the period.
          </p>
        </div>

        <div class="border border-trough rounded-xl overflow-hidden divide-y divide-trough">
          {#each period.categories as category, idx}
            <div class="p-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-chalk/40 transition-colors">
              <div>
                <span class="text-xs font-semibold text-cast-iron">{category.name}</span>
                <span class="block text-[11px] text-galvanised capitalize">{category.classification.replace('_', ' ')}</span>
              </div>
              <div data-step="purchases" data-idx={idx}>
                <QuickNumberStepper
                  bind:value={category.purchases}
                  on_enter_next={() => focus_input_index(idx + 1, 'purchases')}
                />
              </div>
            </div>
          {/each}
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            onclick={() => clear_step_field('purchases')}
            class="text-xs text-galvanised hover:text-cast-iron underline cursor-pointer"
          >
            Clear all purchases to 0
          </button>
        </div>
      </div>

    <!-- STEP 4: SALES -->
    {:else if active_step.id === 'sales'}
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="p-4 rounded-xl bg-chalk border border-trough text-xs text-galvanised space-y-1">
          <p class="font-semibold text-cast-iron flex items-center gap-1.5">
            <TrendingDown class="w-4 h-4 text-ear-tag" />
            Livestock sold during the period
          </p>
          <p>
            Enter total animals sold. For breeding cows or stock bulls, these disposals feed HMRC Herd Basis substantial reduction calculations (BIM55540).
          </p>
        </div>

        <div class="border border-trough rounded-xl overflow-hidden divide-y divide-trough">
          {#each period.categories as category, idx}
            <div class="p-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-chalk/40 transition-colors">
              <div>
                <span class="text-xs font-semibold text-cast-iron">{category.name}</span>
                <span class="block text-[11px] text-galvanised capitalize">{category.classification.replace('_', ' ')}</span>
              </div>
              <div data-step="sales" data-idx={idx}>
                <QuickNumberStepper
                  bind:value={category.sales}
                  on_enter_next={() => focus_input_index(idx + 1, 'sales')}
                />
              </div>
            </div>
          {/each}
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            onclick={() => clear_step_field('sales')}
            class="text-xs text-galvanised hover:text-cast-iron underline cursor-pointer"
          >
            Clear all sales to 0
          </button>
        </div>
      </div>

    <!-- STEP 5: DEATHS & CASUALTIES (INTEGRATED) -->
    {:else if active_step.id === 'deaths'}
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="p-4 rounded-xl bg-chalk border border-trough text-xs text-galvanised space-y-1">
          <p class="font-semibold text-cast-iron flex items-center gap-1.5">
            <Skull class="w-4 h-4 text-ear-tag" />
            Casualties, On-Farm Deaths & Disease Removals
          </p>
          <p>
            Enter any livestock deaths by category. The wizard automatically aligns them with HMRC age breakdown requirements below to prevent discrepancies.
          </p>
        </div>

        <!-- 1. Deaths per category -->
        <div class="border border-trough rounded-xl overflow-hidden divide-y divide-trough">
          <div class="bg-chalk px-4 py-2 font-bold text-xs uppercase font-display text-cast-iron">
            Deaths by Animal Category
          </div>
          {#each period.categories as category, idx}
            <div class="p-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-chalk/40 transition-colors">
              <span class="text-xs font-semibold text-cast-iron">{category.name}</span>
              <div data-step="deaths" data-idx={idx}>
                <QuickNumberStepper
                  bind:value={category.deaths}
                  on_change={sync_deaths_breakdown_by_category}
                  on_enter_next={() => focus_input_index(idx + 1, 'deaths')}
                />
              </div>
            </div>
          {/each}
        </div>

        <!-- 2. Integrated HMRC Deaths Age Breakdown -->
        <div class="p-4 rounded-xl border {deaths_check.is_matching ? 'bg-yard-green-light/20 border-yard-green-border' : 'bg-cull-red-light/20 border-cull-red-border'} space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-xs font-bold text-cast-iron font-display uppercase tracking-wide">
                HMRC Age Group Breakdown
              </h4>
              <p class="text-[11px] text-galvanised">
                Must equal total deaths above ({deaths_check.recorded_total} recorded).
              </p>
            </div>
            {#if deaths_check.is_matching}
              <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-yard-green-light text-yard-green font-semibold">
                <CheckCircle2 class="w-3.5 h-3.5" />
                Balanced ({deaths_check.recorded_total})
              </span>
            {:else}
              <button
                type="button"
                onclick={sync_deaths_breakdown_by_category}
                class="px-2.5 py-1 rounded-lg bg-ear-tag hover:bg-ear-tag-hover text-white text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Auto-Align Breakdown
              </button>
            {/if}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label for="step-calves-deaths" class="block text-[11px] font-semibold text-galvanised uppercase tracking-wider mb-1 font-display">
                Calves (&lt; 1 Yr)
              </label>
              <QuickNumberStepper
                id="step-calves-deaths"
                bind:value={period.deaths_breakdown.under_one_year}
                show_zero_button={false}
              />
            </div>
            <div>
              <label for="step-yearlings-deaths" class="block text-[11px] font-semibold text-galvanised uppercase tracking-wider mb-1 font-display">
                Yearlings (1–2 Yrs)
              </label>
              <QuickNumberStepper
                id="step-yearlings-deaths"
                bind:value={period.deaths_breakdown.one_to_two_years}
                show_zero_button={false}
              />
            </div>
            <div>
              <label for="step-mature-deaths" class="block text-[11px] font-semibold text-galvanised uppercase tracking-wider mb-1 font-display">
                Mature (&gt; 2 Yrs)
              </label>
              <QuickNumberStepper
                id="step-mature-deaths"
                bind:value={period.deaths_breakdown.over_two_years}
                show_zero_button={false}
              />
            </div>
            <div>
              <label for="step-tb-deaths" class="block text-[11px] font-semibold text-galvanised uppercase tracking-wider mb-1 font-display">
                TB / Compulsory
              </label>
              <QuickNumberStepper
                id="step-tb-deaths"
                bind:value={period.deaths_breakdown.tb_reactors}
                show_zero_button={false}
              />
            </div>
          </div>
        </div>
      </div>

    <!-- STEP 6: TRANSFERS & OWN CONSUMPTION -->
    {:else if active_step.id === 'transfers'}
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="p-4 rounded-xl bg-chalk border border-trough text-xs text-galvanised space-y-1">
          <p class="font-semibold text-cast-iron flex items-center gap-1.5">
            <ArrowLeftRight class="w-4 h-4 text-ear-tag" />
            Internal Transfers & Home Consumption
          </p>
          <p>
            Use this step for animals moving between categories (such as heifers joining the breeding herd upon calving), or animals slaughtered for personal home use. <strong>If you did not have any of these, click Next to continue.</strong>
          </p>
        </div>

        <div class="border border-trough rounded-xl overflow-hidden divide-y divide-trough">
          {#each period.categories as category}
            <div class="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-chalk/40 transition-colors">
              <span class="text-xs font-semibold text-cast-iron">{category.name}</span>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] text-galvanised">Transfer In:</span>
                  <QuickNumberStepper
                    bind:value={category.transfers_in}
                    show_zero_button={false}
                  />
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] text-galvanised">Transfer Out:</span>
                  <QuickNumberStepper
                    bind:value={category.transfers_out}
                    show_zero_button={false}
                  />
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] text-galvanised">Home Kill:</span>
                  <QuickNumberStepper
                    bind:value={category.own_consumption}
                    show_zero_button={false}
                  />
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

    <!-- STEP 7: CLOSING PHYSICAL COUNT -->
    {:else if active_step.id === 'closing'}
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="p-4 rounded-xl bg-chalk border border-trough text-xs text-galvanised space-y-1">
          <p class="font-semibold text-cast-iron flex items-center gap-1.5">
            <ClipboardCheck class="w-4 h-4 text-ear-tag" />
            Physical Stock Count on Farm
          </p>
          <p>
            Enter the actual head count recorded on the farm at the period end ({period.end_date}). The expected calculated figure is shown for comparison.
          </p>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            onclick={match_actual_to_expected}
            class="px-3 py-1.5 bg-chalk hover:bg-trough text-cast-iron border border-trough rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            title="Sets actual counts equal to calculated closing numbers"
          >
            <Sparkles class="w-3.5 h-3.5 text-ear-tag" />
            <span>Set All to Expected Counts</span>
          </button>
        </div>

        <div class="border border-trough rounded-xl overflow-hidden divide-y divide-trough">
          <div class="grid grid-cols-12 bg-chalk px-4 py-2 font-bold text-xs uppercase font-display text-cast-iron">
            <span class="col-span-5">Category</span>
            <span class="col-span-3 text-right">Expected</span>
            <span class="col-span-4 text-right">Actual Count on Farm</span>
          </div>
          {#each period.categories as category, idx}
            {@const expected = calculate_category_expected_closing(category)}
            {@const diff = calculate_category_discrepancy(category)}
            <div class="grid grid-cols-12 items-center p-3 sm:px-4 hover:bg-chalk/40 transition-colors">
              <div class="col-span-5">
                <span class="text-xs font-semibold text-cast-iron">{category.name}</span>
                {#if diff !== 0}
                  <span class="block text-[10px] text-cull-red font-semibold font-mono">
                    Difference: {diff > 0 ? `+${diff}` : diff}
                  </span>
                {/if}
              </div>
              <div class="col-span-3 text-right font-mono text-xs font-semibold text-galvanised pr-4">
                {expected}
              </div>
              <div class="col-span-4 flex justify-end" data-step="closing" data-idx={idx}>
                <QuickNumberStepper
                  bind:value={category.actual_closing_stock}
                  on_enter_next={() => focus_input_index(idx + 1, 'closing')}
                />
              </div>
            </div>
          {/each}
        </div>
      </div>

    <!-- STEP 8: RECONCILIATION REVIEW -->
    {:else if active_step.id === 'review'}
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="p-5 rounded-xl border {summary.is_balanced ? 'bg-yard-green-light/40 border-yard-green-border' : 'bg-cull-red-light/40 border-cull-red-border'} text-cast-iron">
          <div class="flex items-start gap-3">
            {#if summary.is_balanced}
              <div class="p-2 rounded-full bg-yard-green text-white shrink-0 shadow-xs">
                <CheckCircle2 class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-bold text-base text-cast-iron font-display uppercase tracking-wide">
                  Schedule Fully Balanced
                </h3>
                <p class="text-xs text-galvanised-dark mt-1">
                  Your livestock movements balance perfectly with a zero discrepancy. All inflows match outflows plus the physical stock count.
                </p>
              </div>
            {:else}
              <div class="p-2 rounded-full bg-cull-red text-white shrink-0 shadow-xs">
                <AlertCircle class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-bold text-base text-cull-red font-display uppercase tracking-wide">
                  Unresolved Discrepancy: {summary.discrepancy > 0 ? `+${summary.discrepancy}` : summary.discrepancy} Head
                </h3>
                <p class="text-xs text-galvanised-dark mt-1">
                  Check your numbers: your total numbers in ({summary.total_inflows}) do not balance with your disposals ({summary.total_outflows}) plus closing count ({summary.actual_closing_stock}).
                </p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Metric highlights -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-chalk rounded-lg border border-trough">
            <span class="block text-[11px] font-semibold text-galvanised uppercase font-display">Total In</span>
            <span class="text-xl font-bold font-mono text-cast-iron">{summary.total_inflows}</span>
          </div>
          <div class="p-3 bg-chalk rounded-lg border border-trough">
            <span class="block text-[11px] font-semibold text-galvanised uppercase font-display">Total Out</span>
            <span class="text-xl font-bold font-mono text-cast-iron">{summary.total_outflows}</span>
          </div>
          <div class="p-3 bg-chalk rounded-lg border border-trough">
            <span class="block text-[11px] font-semibold text-galvanised uppercase font-display">Closing Count</span>
            <span class="text-xl font-bold font-mono text-cast-iron">{summary.actual_closing_stock}</span>
          </div>
          <div class="p-3 bg-chalk rounded-lg border border-trough">
            <span class="block text-[11px] font-semibold text-galvanised uppercase font-display">Variance</span>
            <span class="text-xl font-bold font-mono {summary.is_balanced ? 'text-yard-green' : 'text-cull-red'}">
              {summary.discrepancy === 0 ? '0' : summary.discrepancy}
            </span>
          </div>
        </div>

        <!-- Next Actions -->
        <div class="p-4 bg-white border border-trough rounded-xl flex items-center justify-between">
          <div>
            <h4 class="text-xs font-bold text-cast-iron font-display uppercase tracking-wider">Need to fine-tune or view all columns?</h4>
            <p class="text-xs text-galvanised">You can jump to the accountant spreadsheet view at any time.</p>
          </div>
          <button
            type="button"
            onclick={on_switch_to_spreadsheet}
            class="px-3.5 py-2 bg-cast-iron text-white rounded-lg text-xs font-semibold hover:bg-cast-iron/90 cursor-pointer shadow-2xs transition-colors"
          >
            Open Spreadsheet View
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Wizard Footer Navigation Buttons -->
  <div class="p-4 sm:px-6 bg-chalk border-t border-trough flex items-center justify-between">
    <button
      type="button"
      onclick={previous_step}
      disabled={current_step_index === 0}
      class="px-3.5 py-2 rounded-lg border border-trough text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-trough text-cast-iron"
    >
      <ArrowLeft class="w-3.5 h-3.5" />
      <span>Back</span>
    </button>

    <div class="text-xs font-medium text-galvanised hidden sm:block">
      Step {current_step_index + 1} of {STEPS.length}
    </div>

    {#if current_step_index < STEPS.length - 1}
      <button
        type="button"
        onclick={next_step}
        class="px-4 py-2 rounded-lg bg-ear-tag hover:bg-ear-tag-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
      >
        <span>Next Step</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    {:else}
      <button
        type="button"
        onclick={on_switch_to_spreadsheet}
        class="px-4 py-2 rounded-lg bg-yard-green hover:bg-yard-green-dark text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
      >
        <Check class="w-3.5 h-3.5" />
        <span>Finished &mdash; View Spreadsheet</span>
      </button>
    {/if}
  </div>
</div>
