<script setup>
defineProps({ lines: { type: Number, default: 3 }, width: { type: String, default: "60%" }, loading: { type: Boolean, default: true } });
</script>

<template>
  <div :aria-busy="loading">
    <template v-if="loading">
      <span v-for="i in lines" :key="i" class="kape-skeleton" :style="{ width }"></span>
    </template>
    <slot v-else />
  </div>
</template>
