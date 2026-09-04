<script setup>
defineProps({ items: { type: Array, default: () => [] }, openFirst: Boolean });
</script>

<template>
  <details v-for="(f, i) in items" :key="f.id" class="kape-acc" :open="openFirst && i === 0">
    <summary v-text="f.q"></summary>
    <p v-text="f.a"></p>
  </details>
</template>
