<script setup>
defineProps({ text: { type: String, required: true } });
</script>

<template>
  <button class="kape-btn kape-tip" :data-tip="text" :aria-describedby="null" :aria-label="undefined">
    <slot />
  </button>
</template>
