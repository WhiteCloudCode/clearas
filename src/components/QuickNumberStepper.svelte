<script lang="ts">
  import { Plus, Minus } from '@lucide/svelte';

  interface Props {
    value?: number;
    id?: string;
    on_change?: (new_val: number) => void;
    on_enter_next?: () => void;
    min?: number;
    step?: number;
    unit_label?: string;
    show_zero_button?: boolean;
    class_extra?: string;
  }

  let {
    value = $bindable(0),
    id,
    on_change,
    on_enter_next,
    min = 0,
    step = 1,
    unit_label,
    show_zero_button = true,
    class_extra = '',
  }: Props = $props();

  function update_value(new_val: number) {
    const clamped = Math.max(min, isNaN(new_val) ? 0 : Math.round(new_val));
    value = clamped;
    if (on_change) on_change(clamped);
  }

  function increment() {
    update_value(Number(value || 0) + step);
  }

  function decrement() {
    update_value(Number(value || 0) - step);
  }

  function set_zero_and_advance() {
    update_value(0);
    if (on_enter_next) on_enter_next();
  }

  function handle_focus(e: FocusEvent) {
    const target = e.target as HTMLInputElement;
    // Auto-select text on click/tap so user doesn't have to backspace existing 0
    target.select();
  }

  function handle_keydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (on_enter_next) {
        on_enter_next();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    }
  }

  function handle_input(e: Event) {
    const target = e.target as HTMLInputElement;
    const raw = target.value.trim();
    if (raw === '') {
      update_value(0);
    } else {
      update_value(parseInt(raw, 10));
    }
  }
</script>

<div class="inline-flex items-center gap-1.5 {class_extra}">
  {#if show_zero_button}
    <button
      type="button"
      onclick={set_zero_and_advance}
      tabindex="-1"
      class="px-2 py-1.5 rounded-lg border border-trough bg-white hover:bg-trough text-galvanised hover:text-cast-iron text-[11px] font-semibold transition-colors cursor-pointer active:scale-95 shadow-2xs"
      title="Set to 0 and jump down"
    >
      0 / None
    </button>
  {/if}

  <div class="inline-flex items-center rounded-lg border border-trough bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-ear-tag focus-within:border-ear-tag">
    <!-- Tactile Decrement Button -->
    <button
      type="button"
      onclick={decrement}
      disabled={Number(value || 0) <= min}
      tabindex="-1"
      class="w-8 h-9 flex items-center justify-center bg-chalk hover:bg-trough text-cast-iron disabled:opacity-30 disabled:cursor-not-allowed border-r border-trough transition-colors cursor-pointer active:bg-trough-dark"
      title="Decrease by 1"
    >
      <Minus class="w-3.5 h-3.5" />
    </button>

    <!-- Number Input with auto-select on focus & Enter to advance -->
    <input
      {id}
      type="number"
      {min}
      value={value}
      onfocus={handle_focus}
      onkeydown={handle_keydown}
      oninput={handle_input}
      class="w-20 text-center py-1.5 px-1 font-mono font-bold text-sm text-cast-iron bg-transparent border-0 focus:ring-0 focus:outline-hidden"
    />

    <!-- Tactile Increment Button -->
    <button
      type="button"
      onclick={increment}
      tabindex="-1"
      class="w-8 h-9 flex items-center justify-center bg-chalk hover:bg-trough text-cast-iron border-l border-trough transition-colors cursor-pointer active:bg-trough-dark"
      title="Increase by 1"
    >
      <Plus class="w-3.5 h-3.5" />
    </button>
  </div>

  {#if unit_label}
    <span class="text-xs text-galvanised font-medium hidden sm:inline ml-1">
      {unit_label}
    </span>
  {/if}
</div>
