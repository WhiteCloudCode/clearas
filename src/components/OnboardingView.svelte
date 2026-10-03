<script lang="ts">
  import type { FarmMetadata, LivestockCategory } from '../types/livestock';
  import {
    DEFAULT_BREEDING_CATEGORY_PRESETS,
    DEFAULT_TRADING_CATEGORY_PRESETS,
  } from '../utils/storage';
  import { BRAND, mark_onboarding_completed } from '../config/brand';
  import {
    Sparkles,
    Building2,
    TrendingUp,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Check,
    Plus,
    Trash2,
    Hash,
    User,
    MapPin,
    Briefcase,
    Shield,
    Scale,
    Save,
    AlertCircle,
    FolderOpen,
    ArrowRight,
    ArrowLeft,
  } from '@lucide/svelte';

  interface CategoryItem {
    name: string;
    classification: 'breeding_herd' | 'trading_stock';
  }

  interface Props {
    farm: FarmMetadata;
    categories: LivestockCategory[];
    has_active_session: boolean;
    on_complete: (updated_farm: FarmMetadata, updated_categories: CategoryItem[]) => void;
    on_open_file: () => void;
    on_cancel?: () => void;
  }

  let {
    farm,
    categories,
    has_active_session,
    on_complete,
    on_open_file,
    on_cancel,
  }: Props = $props();

  let current_step = $state(0);

  // Draft Farm Details
  let draft_farm = $state<FarmMetadata>({
    farm_name: '',
    cph_number: '',
    farmer_name: '',
    holding_address: '',
    accountant_firm: '',
    currency: '£',
  });

  // Draft Categories
  let draft_categories = $state<CategoryItem[]>([]);
  let custom_breeding_input = $state('');
  let custom_trading_input = $state('');
  let category_error = $state<string | null>(null);

  // Filtered draft categories
  let draft_breeding = $derived(
    draft_categories.filter((c) => c.classification === 'breeding_herd')
  );
  let draft_trading = $derived(
    draft_categories.filter((c) => c.classification === 'trading_stock')
  );

  // Synchronise drafts with initial props
  $effect(() => {
    draft_farm = {
      farm_name: farm.farm_name || '',
      cph_number: farm.cph_number || '',
      farmer_name: farm.farmer_name || '',
      holding_address: farm.holding_address || '',
      accountant_firm: farm.accountant_firm || '',
      currency: farm.currency || '£',
    };

    draft_categories = categories.map((c) => ({
      name: c.name,
      classification: c.classification,
    }));
  });

  let step_badge = $derived(
    current_step === 0
      ? 'How It Works'
      : current_step === 1
        ? 'Farm Details'
        : 'Livestock Categories'
  );

  let step_title = $derived(
    current_step === 0
      ? `Welcome to ${BRAND.name}`
      : current_step === 1
        ? 'Farm & Holding Details'
        : 'Review Livestock Categories'
  );

  function add_preset(preset: string, classification: 'breeding_herd' | 'trading_stock') {
    if (draft_categories.some((c) => c.name.trim().toLowerCase() === preset.trim().toLowerCase())) {
      category_error = `"${preset}" has already been added.`;
      return;
    }
    draft_categories = [...draft_categories, { name: preset, classification }];
    category_error = null;
  }

  function add_custom(name: string, classification: 'breeding_herd' | 'trading_stock') {
    const trimmed = name.trim();
    if (!trimmed) {
      category_error = 'Please enter a category name.';
      return;
    }
    if (draft_categories.some((c) => c.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      category_error = `"${trimmed}" is already in your categories.`;
      return;
    }
    draft_categories = [...draft_categories, { name: trimmed, classification }];
    if (classification === 'breeding_herd') custom_breeding_input = '';
    else custom_trading_input = '';
    category_error = null;
  }

  function remove_category(name: string) {
    draft_categories = draft_categories.filter((c) => c.name !== name);
  }

  function next_step() {
    if (current_step < 2) {
      current_step += 1;
    } else {
      handle_finish();
    }
  }

  function prev_step() {
    if (current_step > 0) {
      current_step -= 1;
    }
  }

  function handle_finish() {
    mark_onboarding_completed();
    on_complete(draft_farm, draft_categories);
  }
</script>

<div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
  <div class="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
    <!-- Header with Breadcrumb Steps -->
    <div class="px-6 sm:px-8 py-6 bg-emerald-950 text-white border-b border-emerald-900">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Step {current_step + 1} of 3 • {step_badge}
            </span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-white">
            {step_title}
          </h1>
        </div>

        {#if has_active_session && on_cancel}
          <button
            type="button"
            onclick={on_cancel}
            class="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-medium border border-emerald-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </button>
        {/if}
      </div>

      <!-- Step Stepper Indicators -->
      <div class="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-emerald-900/60 text-xs">
        <button
          type="button"
          onclick={() => (current_step = 0)}
          class="flex items-center gap-2 text-left cursor-pointer transition-colors {current_step === 0 ? 'text-white font-bold' : 'text-emerald-400/80 hover:text-emerald-200'}"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] {current_step === 0 ? 'bg-emerald-500 text-emerald-950 font-bold' : 'bg-emerald-900 text-emerald-300'}">
            1
          </span>
          <span class="hidden sm:inline">How It Works</span>
        </button>

        <button
          type="button"
          onclick={() => (current_step = 1)}
          class="flex items-center gap-2 text-left cursor-pointer transition-colors {current_step === 1 ? 'text-white font-bold' : 'text-emerald-400/80 hover:text-emerald-200'}"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] {current_step === 1 ? 'bg-emerald-500 text-emerald-950 font-bold' : 'bg-emerald-900 text-emerald-300'}">
            2
          </span>
          <span class="hidden sm:inline">Farm Details</span>
        </button>

        <button
          type="button"
          onclick={() => (current_step = 2)}
          class="flex items-center gap-2 text-left cursor-pointer transition-colors {current_step === 2 ? 'text-white font-bold' : 'text-emerald-400/80 hover:text-emerald-200'}"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] {current_step === 2 ? 'bg-emerald-500 text-emerald-950 font-bold' : 'bg-emerald-900 text-emerald-300'}">
            3
          </span>
          <span class="hidden sm:inline">Livestock Categories</span>
        </button>
      </div>
    </div>

    <!-- View Body -->
    <div class="p-6 sm:p-8 space-y-6">
      <!-- Step 0: Overview & Entry Paths -->
      {#if current_step === 0}
        <div class="space-y-6">
          <div class="bg-emerald-50/60 rounded-xl p-5 border border-emerald-100 flex items-start gap-4">
            <div class="p-2.5 rounded-xl bg-emerald-700 text-white shadow-xs shrink-0">
              <Sparkles class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-base font-bold text-stone-900 mb-1">
                Simple, Private Livestock Numbers
              </h2>
              <p class="text-sm text-stone-600 leading-relaxed">
                {BRAND.name} helps you balance your cattle and sheep numbers for the year without messy spreadsheets or paper notes. Everything stays private on your computer.
              </p>
            </div>
          </div>

          <!-- The Core Pillars -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <div>
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <CheckCircle2 class="w-4 h-4" />
                </div>
                <h3 class="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                  Automatic Balancing
                </h3>
                <p class="text-xs text-stone-600 leading-relaxed">
                  Just enter what came in and what went out. The app calculates your expected stock and flags if any animals are unaccounted for.
                </p>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <div>
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Shield class="w-4 h-4" />
                </div>
                <h3 class="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                  100% Private to Your Farm
                </h3>
                <p class="text-xs text-stone-600 leading-relaxed">
                  Your farm records stay on your computer. No login accounts, no cloud databases, and no internet needed.
                </p>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <div>
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Save class="w-4 h-4" />
                </div>
                <h3 class="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                  One Single File
                </h3>
                <p class="text-xs text-stone-600 leading-relaxed">
                  All your years are kept together in one file on your machine (<code class="bg-stone-200 px-1 py-0.5 rounded text-[11px]">{BRAND.file_extension}</code>). Quick save anytime with <kbd class="px-1 py-0.5 rounded bg-stone-200 font-mono text-[10px]">Ctrl+S</kbd>.
                </p>
              </div>
            </div>
          </div>

          <!-- Direct Pathways Banner -->
          <div class="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50/80 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8">
            <div class="text-xs text-stone-600">
              <span class="font-bold text-stone-900">Already have a farm file?</span>
              <span>Open your existing file to view and update your numbers.</span>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onclick={on_open_file}
                class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold border border-stone-300 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FolderOpen class="w-4 h-4 text-stone-600" />
                <span>Open Existing File</span>
              </button>

              <button
                type="button"
                onclick={next_step}
                class="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Start New Farm Setup</span>
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Step 1: Farm & Holding Details -->
      {#if current_step === 1}
        <div class="space-y-5">
          <p class="text-xs text-stone-600">
            Enter your farm and holding details. These personalise your records and appear on your year-end accountant schedule.
          </p>

          <div class="space-y-4">
            <div>
              <label for="setup-farm-name" class="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Farm / Holding Name
              </label>
              <div class="relative">
                <Building2 class="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  id="setup-farm-name"
                  type="text"
                  bind:value={draft_farm.farm_name}
                  placeholder="e.g. Hilltop Farm"
                  class="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs font-medium bg-stone-50/50"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="setup-cph-number" class="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  CPH Holding Number
                </label>
                <div class="relative">
                  <Hash class="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    id="setup-cph-number"
                    type="text"
                    bind:value={draft_farm.cph_number}
                    placeholder="e.g. 12/345/6789"
                    class="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs font-mono bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label for="setup-farmer-name" class="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Farmer / Business Name
                </label>
                <div class="relative">
                  <User class="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    id="setup-farmer-name"
                    type="text"
                    bind:value={draft_farm.farmer_name}
                    placeholder="e.g. J. Smith & Sons"
                    class="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label for="setup-holding-address" class="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Holding Address & Postcode
              </label>
              <div class="relative">
                <MapPin class="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  id="setup-holding-address"
                  type="text"
                  bind:value={draft_farm.holding_address}
                  placeholder="e.g. Rural Way, North Riding, YO12 4AB"
                  class="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label for="setup-accountant-firm" class="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Agricultural Accountant / Advisory Firm
              </label>
              <div class="relative">
                <Briefcase class="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  id="setup-accountant-firm"
                  type="text"
                  bind:value={draft_farm.accountant_firm}
                  placeholder="e.g. Rural Chartered Accountants LLP"
                  class="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          <!-- Navigation Footer -->
          <div class="pt-6 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onclick={prev_step}
              class="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>Back: How It Works</span>
            </button>

            <button
              type="button"
              onclick={next_step}
              class="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span>Next: Livestock Categories</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      {/if}

      <!-- Step 2: Livestock Categories Review -->
      {#if current_step === 2}
        <div class="space-y-6">
          <p class="text-xs text-stone-600">
            Standard UK cattle categories are pre-loaded according to HMRC rules. Customise them to match your herd: click the quick presets, add your own categories, or remove ones you don't keep.
          </p>

          {#if category_error}
            <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
              <span>{category_error}</span>
            </div>
          {/if}

          <!-- 1. Breeding Herd Section -->
          <div class="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Shield class="w-4 h-4 text-emerald-800" />
                <h3 class="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Breeding Herd (Cows & Bulls - Herd Basis)
                </h3>
              </div>
              <span class="text-xs font-semibold text-emerald-700">
                {draft_breeding.length} categories
              </span>
            </div>

            <!-- Quick Presets -->
            <div class="flex flex-wrap gap-2">
              {#each DEFAULT_BREEDING_CATEGORY_PRESETS as preset}
                {@const already_added = draft_breeding.some(
                  (c) => c.name.trim().toLowerCase() === preset.trim().toLowerCase()
                )}
                <button
                  type="button"
                  onclick={() => add_preset(preset, 'breeding_herd')}
                  disabled={already_added}
                  class="px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer {already_added
                    ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                    : 'bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'}"
                >
                  {#if already_added}
                    <Check class="w-3 h-3 text-emerald-600" />
                  {:else}
                    <Plus class="w-3 h-3 text-emerald-700" />
                  {/if}
                  <span>{preset}</span>
                </button>
              {/each}
            </div>

            <!-- Custom Breeding Input -->
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={custom_breeding_input}
                onkeydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    add_custom(custom_breeding_input, 'breeding_herd');
                  }
                }}
                placeholder="Add custom category (e.g. In-calf Heifers)..."
                class="flex-1 px-3.5 py-2 border border-emerald-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onclick={() => add_custom(custom_breeding_input, 'breeding_herd')}
                class="px-4 py-2 bg-emerald-850 hover:bg-emerald-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <!-- Active Breeding Categories List -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each draft_breeding as cat}
                <div class="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white border border-emerald-100 text-xs text-stone-800 shadow-2xs">
                  <span class="font-medium">{cat.name}</span>
                  <button
                    type="button"
                    onclick={() => remove_category(cat.name)}
                    class="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    title="Remove category"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              {/each}
            </div>
          </div>

          <!-- 2. Trading Stock Section -->
          <div class="p-5 rounded-2xl bg-stone-100/70 border border-stone-200 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <TrendingUp class="w-4 h-4 text-stone-700" />
                <h3 class="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Trading Cattle (Stores, Fat Cattle & Calves)
                </h3>
              </div>
              <span class="text-xs font-semibold text-stone-600">
                {draft_trading.length} categories
              </span>
            </div>

            <!-- Quick Presets -->
            <div class="flex flex-wrap gap-2">
              {#each DEFAULT_TRADING_CATEGORY_PRESETS as preset}
                {@const already_added = draft_trading.some(
                  (c) => c.name.trim().toLowerCase() === preset.trim().toLowerCase()
                )}
                <button
                  type="button"
                  onclick={() => add_preset(preset, 'trading_stock')}
                  disabled={already_added}
                  class="px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer {already_added
                    ? 'bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed'
                    : 'bg-white hover:bg-stone-200 text-stone-800 border-stone-300 shadow-2xs'}"
                >
                  {#if already_added}
                    <Check class="w-3 h-3 text-stone-600" />
                  {:else}
                    <Plus class="w-3 h-3 text-stone-700" />
                  {/if}
                  <span>{preset}</span>
                </button>
              {/each}
            </div>

            <!-- Custom Trading Input -->
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={custom_trading_input}
                onkeydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    add_custom(custom_trading_input, 'trading_stock');
                  }
                }}
                placeholder="Add custom category (e.g. Grazing Bullocks)..."
                class="flex-1 px-3.5 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onclick={() => add_custom(custom_trading_input, 'trading_stock')}
                class="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <!-- Active Trading Categories List -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each draft_trading as cat}
                <div class="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white border border-stone-200 text-xs text-stone-800 shadow-2xs">
                  <span class="font-medium">{cat.name}</span>
                  <button
                    type="button"
                    onclick={() => remove_category(cat.name)}
                    class="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    title="Remove category"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              {/each}
            </div>
          </div>

          <!-- Navigation Footer -->
          <div class="pt-6 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onclick={prev_step}
              class="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>Back: Farm Details</span>
            </button>

            <button
              type="button"
              onclick={handle_finish}
              class="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <span>Save Categories & View Numbers</span>
              <CheckCircle2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
