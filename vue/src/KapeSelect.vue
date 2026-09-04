<script setup>
defineProps({ options: { type: Array, default: () => [] } });
const model = defineModel({ type: String });
</script>

<template>
  <label class="kape-select">
    <select v-model="model">
      <option v-for="b in options" :key="b.id" :value="b.id" v-text="b.name"></option>
    </select>
  </label>
</template>
