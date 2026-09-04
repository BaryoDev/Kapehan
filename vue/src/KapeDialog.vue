<script setup>
import { ref, watch } from "vue";
const props = defineProps({ open: Boolean, title: String, body: String, confirmLabel: { type: String, default: "Confirm" } });
const emit = defineEmits(["confirm", "close"]);
const el = ref(null);
watch(() => props.open, (o) => {
  if (!el.value) return;
  if (o) el.value.showModal();
  else el.value.close();
});
</script>

<template>
  <dialog ref="el" class="kape-dialog" aria-labelledby="kape-dialog-title" @close="emit('close')" @cancel="emit('close')">
    <h2 id="kape-dialog-title" v-text="title"></h2>
    <p v-text="body"></p>
    <div class="kape-dialog__actions">
      <button class="kape-btn kape-btn--ghost" autofocus @click="emit('close')">Keep it</button>
      <button class="kape-btn kape-btn--ink" @click="emit('confirm')" v-text="confirmLabel"></button>
    </div>
  </dialog>
</template>
