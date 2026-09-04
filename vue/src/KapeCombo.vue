<script setup>
import { ref, computed } from "vue";
const props = defineProps({ options: { type: Array, default: () => [] }, placeholder: { type: String, default: "Add…" } });
const picked = defineModel({ type: Array, default: () => [] });

const q = ref("");
const open = ref(false);
const cursor = ref(0);

const hits = computed(() => props.options.filter((a) => a.name.toLowerCase().includes(q.value.toLowerCase())));
const byId = (id) => props.options.find((a) => a.id === id);

const toggle = (id) => {
  picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id];
};
const move = (n) => {
  if (!hits.value.length) return;
  cursor.value = (cursor.value + n + hits.value.length) % hits.value.length;
};
const onKeydown = (e) => {
  if (e.key === "ArrowDown") { open.value = true; move(1); e.preventDefault(); }
  else if (e.key === "ArrowUp") { move(-1); e.preventDefault(); }
  else if (e.key === "Enter" && open.value) { toggle(hits.value[cursor.value].id); e.preventDefault(); }
  else if (e.key === "Escape") { open.value = false; }
  else if (e.key === "Backspace" && !q.value && picked.value.length) { picked.value = picked.value.slice(0, -1); }
};
</script>

<template>
  <div class="kape-combo" role="combobox" :aria-expanded="open" aria-haspopup="listbox" aria-controls="kape-combo-list">
    <div class="kape-combo__field">
      <span v-for="id in picked" :key="id" class="kape-chip">
        <span v-text="byId(id)?.name"></span>
        <button :aria-label="'Remove ' + byId(id)?.name" @click="toggle(id)">&times;</button>
      </span>
      <input
        v-model="q"
        :placeholder="placeholder"
        :aria-activedescendant="open && hits[cursor] ? 'kape-opt-' + hits[cursor].id : undefined"
        @focus="open = true"
        @keydown="onKeydown" />
    </div>
    <ul v-if="open" id="kape-combo-list" class="kape-combo__list" role="listbox" aria-multiselectable="true">
      <li
        v-for="(a, i) in hits"
        :id="'kape-opt-' + a.id"
        :key="a.id"
        role="option"
        :aria-selected="picked.includes(a.id)"
        :class="{ 'is-active': i === cursor }"
        @mousedown.prevent="toggle(a.id)">
        <span v-text="a.name"></span>
        <small>+<span v-text="a.price"></span></small>
      </li>
    </ul>
  </div>
</template>
