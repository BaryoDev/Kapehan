<script setup>
import { ref, computed } from "vue";
const props = defineProps({ options: { type: Array, default: () => [] }, max: { type: Number, default: null } });
const picked = defineModel({ type: Array, default: () => [] });

const open = ref(false);
const cursor = ref(0);
const full = computed(() => props.max !== null && picked.value.length >= props.max);
const byId = (id) => props.options.find((o) => o.id === id);
const blocked = (id) => full.value && !picked.value.includes(id);

const toggle = (id) => {
  if (blocked(id)) return;
  picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id];
};
const move = (n) => {
  cursor.value = (cursor.value + n + props.options.length) % props.options.length;
};
const onKeydown = (e) => {
  const k = e.key;
  if (k === "ArrowDown") { open.value = true; move(1); e.preventDefault(); }
  else if (k === "ArrowUp") { move(-1); e.preventDefault(); }
  else if (k === " " || k === "Enter") { open.value ? toggle(props.options[cursor.value].id) : (open.value = true); e.preventDefault(); }
  else if (k === "Home") { cursor.value = 0; e.preventDefault(); }
  else if (k === "End") { cursor.value = props.options.length - 1; e.preventDefault(); }
  else if (k === "Escape") { open.value = false; }
  else if (k === "Backspace" && picked.value.length) { picked.value = picked.value.slice(0, -1); }
};
</script>

<template>
  <div class="kape-combo" role="combobox" :aria-expanded="open" aria-haspopup="listbox"
    aria-controls="kape-multi-list" aria-describedby="kape-multi-count">
    <div class="kape-combo__field" tabindex="0" @keydown="onKeydown" @click="open = !open">
      <span v-for="id in picked" :key="id" class="kape-chip">
        <span v-text="byId(id)?.name"></span>
        <button :aria-label="'Remove ' + byId(id)?.name" @click.stop="toggle(id)">&times;</button>
      </span>
      <span v-if="!picked.length" class="kape-combo__hint">Pick your branches</span>
    </div>
    <ul v-if="open" id="kape-multi-list" class="kape-combo__list" role="listbox" aria-multiselectable="true">
      <li
        v-for="(o, i) in options"
        :key="o.id"
        role="option"
        :aria-selected="picked.includes(o.id)"
        :aria-disabled="blocked(o.id)"
        :class="{ 'is-active': i === cursor }"
        @mousedown.prevent="toggle(o.id)"
        v-text="o.name"></li>
    </ul>
    <p id="kape-multi-count" class="kape-sr" aria-live="polite">
      <span v-text="picked.length"></span> of <span v-text="options.length"></span> selected
    </p>
  </div>
</template>
