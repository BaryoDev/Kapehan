<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
const props = defineProps({
  commands: { type: Array, default: () => [] },
  open: Boolean,
  hotkey: { type: String, default: "k" },
  placeholder: { type: String, default: "Type a command or search" },
});
const emit = defineEmits(["update:open"]);

const el = ref(null);
const field = ref(null);
const q = ref("");
const cursor = ref(0);
let opener = null;

const hits = computed(() => props.commands.filter((c) => c.label.toLowerCase().includes(q.value.toLowerCase())));
const groups = computed(() => [...new Set(hits.value.map((c) => c.group))]);

const onHotkey = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === props.hotkey) {
    e.preventDefault();
    opener = document.activeElement;
    emit("update:open", !props.open);
  }
};
onMounted(() => window.addEventListener("keydown", onHotkey));
onBeforeUnmount(() => window.removeEventListener("keydown", onHotkey));

watch(() => props.open, async (o) => {
  if (!el.value) return;
  if (o) { el.value.showModal(); q.value = ""; cursor.value = 0; await nextTick(); field.value?.focus(); }
  else { el.value.close(); opener?.focus(); }
});
watch(hits, () => { cursor.value = 0; });

const move = (n) => {
  if (hits.value.length) cursor.value = (cursor.value + n + hits.value.length) % hits.value.length;
};
const run = () => {
  const c = hits.value[cursor.value];
  if (!c) return;
  emit("update:open", false);
  c.run();
};
const onKeydown = (e) => {
  if (e.key === "ArrowDown") { move(1); e.preventDefault(); }
  else if (e.key === "ArrowUp") { move(-1); e.preventDefault(); }
  else if (e.key === "Enter") { run(); e.preventDefault(); }
};
</script>

<template>
  <dialog ref="el" class="kape-cmdk" aria-label="Command palette" @close="emit('update:open', false)">
    <label>
      <KapeIcon name="grinder" :size="18" />
      <input
        ref="field"
        v-model="q"
        :placeholder="placeholder"
        role="combobox"
        aria-expanded="true"
        aria-controls="kape-cmdk-list"
        :aria-activedescendant="hits[cursor] ? 'kape-cmd-' + hits[cursor].id : undefined"
        @keydown="onKeydown" />
      <kbd>esc</kbd>
    </label>

    <ul id="kape-cmdk-list" role="listbox">
      <template v-for="g in groups" :key="g">
        <li class="kape-cmdk__group" role="presentation" v-text="g"></li>
        <li
          v-for="c in hits.filter((h) => h.group === g)"
          :id="'kape-cmd-' + c.id"
          :key="c.id"
          role="option"
          :aria-selected="hits[cursor]?.id === c.id"
          @mousedown.prevent="cursor = hits.indexOf(c); run()">
          <span v-text="c.label"></span>
        </li>
      </template>
    </ul>

    <footer>
      <kbd>&uarr;&darr;</kbd> move <kbd>&crarr;</kbd> run <kbd>esc</kbd> close
      <span class="kape-sr" aria-live="polite"><span v-text="hits.length"></span> results</span>
    </footer>
  </dialog>
</template>
