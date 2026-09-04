<script setup>
import { ref, watch, nextTick } from "vue";
const props = defineProps({
  open: Boolean,
  title: String,
  lines: { type: Array, default: () => [] },
  side: { type: String, default: "right" },
});
const emit = defineEmits(["close", "refund", "ready"]);

const el = ref(null);
const closer = ref(null);
let opener = null;

watch(() => props.open, async (o) => {
  if (!el.value) return;
  if (o) {
    opener = document.activeElement;
    el.value.showModal();
    await nextTick();
    closer.value?.focus();
  } else {
    el.value.close();
    opener?.focus();
  }
});

const total = () => props.lines.reduce((n, l) => n + Number(String(l.total).replace(/[^0-9.]/g, "")), 0);
</script>

<template>
  <dialog
    ref="el"
    class="kape-drawer"
    :style="side === 'left' ? { inset: '0 auto 0 0', borderLeft: 0, borderRight: '1px solid var(--line)' } : null"
    aria-labelledby="kape-drawer-title"
    @close="emit('close')"
    @cancel="emit('close')">
    <header>
      <span id="kape-drawer-title" v-text="title"></span>
      <button ref="closer" aria-label="Close" @click="emit('close')">&times;</button>
    </header>

    <div class="kape-drawer__body">
      <div v-for="l in lines" :key="l.id" class="kape-line">
        <span><span v-text="l.qty"></span> &times; <span v-text="l.name"></span></span>
        <span class="num" v-text="l.total"></span>
      </div>
      <div class="kape-line kape-line--total">
        <span>Total</span>
        <span class="num" v-text="total()"></span>
      </div>
    </div>

    <footer>
      <button class="kape-btn kape-btn--ink" @click="emit('ready')">Mark ready</button>
      <button class="kape-btn" @click="emit('refund')">Refund</button>
    </footer>
  </dialog>
</template>
