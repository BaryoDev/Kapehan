<script setup>
import { ref, computed } from "vue";
const props = defineProps({
  from: { type: Date, default: null },
  to: { type: Date, default: null },
  month: { type: Date, default: () => new Date() },
  presets: { type: Array, default: () => [] },
});
const emit = defineEmits(["apply", "cancel"]);

const open = ref(false);
const view = ref(new Date(props.month.getFullYear(), props.month.getMonth(), 1));
const draft = ref({ from: props.from, to: props.to });
const focused = ref(props.from ? new Date(props.from) : new Date());

const days = computed(() => {
  const first = new Date(view.value.getFullYear(), view.value.getMonth(), 1);
  const total = new Date(view.value.getFullYear(), view.value.getMonth() + 1, 0).getDate();
  return Array.from({ length: total }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1));
});
const stamp = (d) => (d ? d.setHours(0, 0, 0, 0) && d.getTime() : null);
const classOf = (d) => {
  const t = d.getTime(), a = draft.value.from?.getTime(), b = draft.value.to?.getTime();
  return [t === a && "is-start", t === b && "is-end", a && b && t > a && t < b && "in-range"].filter(Boolean).join(" ");
};
const pick = (d) => {
  const { from, to } = draft.value;
  draft.value = from && !to && d > from ? { from, to: d } : { from: d, to: null };
};
const shift = (days) => {
  const next = new Date(focused.value);
  next.setDate(next.getDate() + days);
  focused.value = next;
  view.value = new Date(next.getFullYear(), next.getMonth(), 1);
};
const onKeydown = (e) => {
  const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
  if (map[e.key]) { shift(map[e.key]); e.preventDefault(); }
  else if (e.key === "PageUp") { shift(-30); e.preventDefault(); }
  else if (e.key === "PageDown") { shift(30); e.preventDefault(); }
  else if (e.key === "Enter") { pick(focused.value); e.preventDefault(); }
  else if (e.key === "Escape") { draft.value = { from: props.from, to: props.to }; open.value = false; }
};
const fmt = (d) => d?.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const label = computed(() => (draft.value.from ? fmt(draft.value.from) + " to " + fmt(draft.value.to) : "Pick a range"));
</script>

<template>
  <div class="kape-range">
    <button class="kape-range__trigger" :aria-expanded="open" @click="open = !open">
      <KapeIcon name="stamp-card" :size="18" />
      <span v-text="label"></span>
    </button>

    <div v-if="open" class="kape-range__pop">
      <ul class="kape-range__presets">
        <li v-for="p in presets" :key="p.label" :aria-current="draft.from === p.from || undefined"
          @click="draft = { from: p.from, to: p.to }" v-text="p.label"></li>
      </ul>

      <div class="kape-cal" @keydown="onKeydown">
        <header>
          <button aria-label="Previous month" @click="shift(-30)">&lsaquo;</button>
          <span v-text="view.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })"></span>
          <button aria-label="Next month" @click="shift(30)">&rsaquo;</button>
        </header>
        <div class="kape-cal__grid" role="group" aria-label="Days">
          <button
            v-for="d in days"
            :key="d.getTime()"
            :class="classOf(d)"
            :aria-label="fmt(d)"
            :aria-pressed="classOf(d).includes('is-') || undefined"
            :tabindex="d.getDate() === focused.getDate() ? 0 : -1"
            @click="pick(d)"
            v-text="d.getDate()"></button>
        </div>
      </div>

      <footer>
        <button class="kape-btn" @click="open = false; emit('cancel')">Cancel</button>
        <button class="kape-btn kape-btn--ink" :disabled="!draft.from || !draft.to"
          @click="open = false; emit('apply', draft)">Apply</button>
      </footer>
    </div>
  </div>
</template>
