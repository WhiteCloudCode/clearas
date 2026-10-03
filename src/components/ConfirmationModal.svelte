<script lang="ts">
  import { AlertTriangle, Info } from '@lucide/svelte';

  interface Props {
    is_open: boolean;
    title: string;
    message: string;
    confirm_text?: string;
    cancel_text?: string;
    is_destructive?: boolean;
    is_alert_only?: boolean;
    on_confirm: () => void;
    on_cancel: () => void;
  }

  let {
    is_open,
    title,
    message,
    confirm_text = 'Confirm',
    cancel_text = 'Cancel',
    is_destructive = false,
    is_alert_only = false,
    on_confirm,
    on_cancel,
  }: Props = $props();
</script>

{#if is_open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 no-print animate-in fade-in duration-150">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 flex flex-col animate-in zoom-in-95 duration-150">
      <div class="p-6">
        <div class="flex items-start gap-3.5">
          <div class="p-2.5 rounded-xl {is_destructive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'} shrink-0 mt-0.5">
            {#if is_destructive}
              <AlertTriangle class="w-5 h-5" />
            {:else}
              <Info class="w-5 h-5" />
            {/if}
          </div>
          <div>
            <h3 class="text-base font-bold text-stone-900 leading-snug">{title}</h3>
            <p class="text-xs text-stone-600 mt-1.5 leading-relaxed whitespace-pre-line">{message}</p>
          </div>
        </div>
      </div>

      <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
        {#if !is_alert_only}
          <button
            type="button"
            onclick={on_cancel}
            class="px-3.5 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {cancel_text}
          </button>
        {/if}
        <button
          type="button"
          onclick={on_confirm}
          class="px-4 py-1.5 rounded-lg text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 {is_destructive ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-700 hover:bg-emerald-800'}"
        >
          {#if is_alert_only}
            <span>Understood</span>
          {:else}
            <span>{confirm_text}</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
