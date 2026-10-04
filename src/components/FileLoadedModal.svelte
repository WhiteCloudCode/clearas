<script lang="ts">
  import { Clock, FolderOpen, ArrowRight, CheckCircle2 } from '@lucide/svelte';
  import { format_uk_datetime } from '../utils/storage';

  interface Props {
    is_open: boolean;
    filename: string;
    farm_name: string;
    cph_number: string;
    last_modified?: string;
    period_count: number;
    on_confirm: () => void;
    on_choose_different: () => void;
  }

  let {
    is_open,
    filename,
    farm_name,
    cph_number,
    last_modified,
    period_count,
    on_confirm,
    on_choose_different,
  }: Props = $props();
</script>

{#if is_open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-cast-iron/70 backdrop-blur-xs p-4 no-print animate-in fade-in duration-150">
    <div class="bg-warm-milk rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-dry-stone flex flex-col animate-in zoom-in-95 duration-150 text-peat">
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-hedgerow text-buttercup shrink-0 mt-0.5 shadow-xs">
            <CheckCircle2 class="w-6 h-6" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-bold text-hedgerow font-display leading-tight">
              Farm File Loaded
            </h3>
            <p class="text-xs text-oak mt-1 leading-relaxed">
              Please verify this is the version you wish to work on before continuing.
            </p>
          </div>
        </div>

        <!-- Details Card -->
        <div class="mt-5 bg-white/90 rounded-xl p-4 border border-dry-stone space-y-3 text-xs">
          <!-- File Name -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-dry-stone/70">
            <span class="text-oak font-semibold">File Name:</span>
            <span class="font-mono font-bold text-hedgerow text-[11px] sm:text-xs truncate max-w-xs" title={filename}>
              {filename}
            </span>
          </div>

          <!-- Last Saved Timestamp -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-dry-stone/70">
            <span class="text-oak font-semibold flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-hedgerow" />
              <span>Last Saved:</span>
            </span>
            <span class="font-semibold text-peat">
              {format_uk_datetime(last_modified, 'full')}
            </span>
          </div>

          <!-- Farm Holding Details -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-dry-stone/70">
            <span class="text-oak font-semibold">Farm Holding:</span>
            <span class="font-semibold text-peat">
              {farm_name || 'Unnamed Farm'}
              {#if cph_number}
                <span class="text-oak font-normal">(CPH: {cph_number})</span>
              {/if}
            </span>
          </div>

          <!-- Records Count -->
          <div class="flex items-center justify-between gap-1">
            <span class="text-oak font-semibold">Accounting Records:</span>
            <span class="font-semibold text-peat">
              {period_count} {period_count === 1 ? 'accounting period' : 'accounting periods'}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="px-6 py-4 bg-parchment border-t border-dry-stone flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onclick={on_choose_different}
          class="px-3.5 py-2 rounded-lg bg-warm-milk hover:bg-dry-stone text-peat text-xs font-semibold border border-dry-stone flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FolderOpen class="w-3.5 h-3.5" />
          <span>Choose Different File</span>
        </button>

        <button
          type="button"
          onclick={on_confirm}
          class="px-4 py-2 rounded-lg bg-ear-tag hover:bg-ear-tag-hover text-peat text-xs font-bold border border-buttercup-border flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <span>Continue to Farm</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
{/if}
