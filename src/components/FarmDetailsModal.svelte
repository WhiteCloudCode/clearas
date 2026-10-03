<script lang="ts">
  import type { FarmMetadata } from '../types/livestock';
  import { X, Building2, User, Hash, MapPin, Briefcase } from '@lucide/svelte';

  interface Props {
    farm: FarmMetadata;
    is_open: boolean;
    on_close: () => void;
  }

  let { farm = $bindable(), is_open, on_close }: Props = $props();
</script>

{#if is_open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
      <div class="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white">
        <div class="flex items-center gap-2">
          <Building2 class="w-5 h-5" />
          <h2 class="text-lg font-semibold">Farm & Holding Details</h2>
        </div>
        <button
          onclick={on_close}
          class="p-1 rounded-lg hover:bg-emerald-700 transition-colors text-white"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label for="farm-name-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
            Farm / Holding Name
          </label>
          <div class="relative">
            <Building2 class="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              id="farm-name-input"
              type="text"
              bind:value={farm.farm_name}
              placeholder="e.g. Hilltop Farm"
              class="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="cph-number-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              CPH Number (Holding ID)
            </label>
            <div class="relative">
              <Hash class="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                id="cph-number-input"
                type="text"
                bind:value={farm.cph_number}
                placeholder="e.g. 12/345/6789"
                class="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label for="farmer-name-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Farmer / Business Name
            </label>
            <div class="relative">
              <User class="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                id="farmer-name-input"
                type="text"
                bind:value={farm.farmer_name}
                placeholder="e.g. J. Smith & Sons"
                class="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label for="holding-address-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
            Holding Address & Postcode
          </label>
          <div class="relative">
            <MapPin class="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              id="holding-address-input"
              type="text"
              bind:value={farm.holding_address}
              placeholder="e.g. High Street, Rural Town, AB12 3CD"
              class="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label for="accountant-firm-input" class="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
            Agricultural Accountant / Firm
          </label>
          <div class="relative">
            <Briefcase class="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              id="accountant-firm-input"
              type="text"
              bind:value={farm.accountant_firm}
              placeholder="e.g. Rural Accounts & Co"
              class="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
        <button
          onclick={on_close}
          class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
        >
          Save & Done
        </button>
      </div>
    </div>
  </div>
{/if}
