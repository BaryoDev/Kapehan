<script setup>
defineProps({ label: String, tone: { type: String, default: "default" } });
</script>

<template>
  <span class="kape-tag" :class="{ 'kape-tag--accent': tone === 'accent', 'kape-tag--ink': tone === 'ink' }" v-text="label"></span>
</template>
