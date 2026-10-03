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
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-cast-iron/70 backdrop-blur-xs p-4 no-print animate-in fade-in duration-150">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-trough flex flex-col">
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 bg-cast-iron text-white border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="p-1.5 rounded-lg bg-slate-800 text-slate-200">
            <Building2 class="w-5 h-5 text-ear-tag" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white leading-tight font-display">Farm & Holding Details</h2>
            <p class="text-xs text-galvanised">Holding identifier and farm ownership</p>
          </div>
        </div>
        <button
          onclick={on_close}
          class="p-1.5 rounded-lg text-galvanised hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label for="farm-name-input" class="block text-xs font-semibold text-galvanised uppercase tracking-wider mb-1">
            Farm / Holding Name
          </label>
          <div class="relative">
            <Building2 class="w-4 h-4 absolute left-3 top-3 text-galvanised" />
            <input
              id="farm-name-input"
              type="text"
              bind:value={farm.farm_name}
              placeholder="e.g. Hilltop Farm"
              class="w-full pl-9 pr-3 py-2 border border-trough rounded-lg focus:ring-2 focus:ring-ear-tag focus:border-ear-tag text-sm bg-white text-cast-iron placeholder:text-slate-400"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="cph-number-input" class="block text-xs font-semibold text-galvanised uppercase tracking-wider mb-1">
              CPH Holding Number
            </label>
            <div class="relative">
              <Hash class="w-4 h-4 absolute left-3 top-3 text-galvanised" />
              <input
                id="cph-number-input"
                type="text"
                bind:value={farm.cph_number}
                placeholder="e.g. 12/345/6789"
                class="w-full pl-9 pr-3 py-2 border border-trough rounded-lg focus:ring-2 focus:ring-ear-tag focus:border-ear-tag text-sm font-mono text-cast-iron placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label for="farmer-name-input" class="block text-xs font-semibold text-galvanised uppercase tracking-wider mb-1">
              Farmer / Proprietor
            </label>
            <div class="relative">
              <User class="w-4 h-4 absolute left-3 top-3 text-galvanised" />
              <input
                id="farmer-name-input"
                type="text"
                bind:value={farm.farmer_name}
                placeholder="e.g. J. Smith & Sons"
                class="w-full pl-9 pr-3 py-2 border border-trough rounded-lg focus:ring-2 focus:ring-ear-tag focus:border-ear-tag text-sm bg-white text-cast-iron placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div>
          <label for="holding-address-input" class="block text-xs font-semibold text-galvanised uppercase tracking-wider mb-1">
            Holding Address & Postcode
          </label>
          <div class="relative">
            <MapPin class="w-4 h-4 absolute left-3 top-3 text-galvanised" />
            <input
              id="holding-address-input"
              type="text"
              bind:value={farm.holding_address}
              placeholder="e.g. High Street, Rural Town, AB12 3CD"
              class="w-full pl-9 pr-3 py-2 border border-trough rounded-lg focus:ring-2 focus:ring-ear-tag focus:border-ear-tag text-sm bg-white text-cast-iron placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label for="accountant-firm-input" class="block text-xs font-semibold text-galvanised uppercase tracking-wider mb-1">
            Agricultural Accountant / Firm
          </label>
          <div class="relative">
            <Briefcase class="w-4 h-4 absolute left-3 top-3 text-galvanised" />
            <input
              id="accountant-firm-input"
              type="text"
              bind:value={farm.accountant_firm}
              placeholder="e.g. Rural Accounts & Co"
              class="w-full pl-9 pr-3 py-2 border border-trough rounded-lg focus:ring-2 focus:ring-ear-tag focus:border-ear-tag text-sm bg-white text-cast-iron placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-chalk border-t border-trough flex justify-end gap-2">
        <button
          onclick={on_close}
          class="px-4 py-2 bg-ear-tag hover:bg-ear-tag-hover text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
        >
          Save Details
        </button>
      </div>
    </div>
  </div>
{/if}
