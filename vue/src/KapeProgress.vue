<script setup>
defineProps({ value: { type: Number, default: 0 }, label: String });
</script>

<template>
  <span class="kape-progress" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100" :aria-label="label">
    <span :style="{ width: value + '%' }"></span>
  </span>
</template>
