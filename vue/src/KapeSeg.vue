<script setup>
defineProps({ options: { type: Array, default: () => ["Pick up", "Deliver"] } });
const mode = defineModel({ type: String, default: "Pick up" });
</script>

<template>
  <div class="kape-seg" role="group" aria-label="Fulfilment">
    <button v-for="m in options" :key="m" :aria-pressed="mode === m" @click="mode = m" v-text="m"></button>
  </div>
</template>
