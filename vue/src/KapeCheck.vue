<script setup>
defineProps({ options: { type: Array, default: () => ["12 oz", "16 oz"] }, mode: { type: String, default: "radio" }, name: { type: String, required: true } });
const model = defineModel();
</script>

<template>
  <label v-for="s in options" :key="s" :class="mode === 'radio' ? 'kape-radio' : 'kape-check'">
    <input :type="mode" :name="name" :value="s" v-model="model" />
    <span v-text="s"></span>
  </label>
</template>
