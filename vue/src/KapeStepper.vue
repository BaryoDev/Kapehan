<script setup>
const props = defineProps({ min: { type: Number, default: 1 }, max: { type: Number, default: 99 } });
const qty = defineModel({ type: Number, default: 1 });
const step = (n) => { qty.value = Math.min(props.max, Math.max(props.min, qty.value + n)); };
</script>

<template>
  <div class="kape-stepper" @keydown.up.prevent="step(1)" @keydown.down.prevent="step(-1)">
    <button aria-label="Fewer" :disabled="qty <= min" @click="step(-1)">&minus;</button>
    <output aria-live="polite" v-text="qty"></output>
    <button aria-label="More" :disabled="qty >= max" @click="step(1)">+</button>
  </div>
</template>
