<script setup>
defineProps({
  total: { type: Number, default: 10 },
  filled: { type: Number, default: 0 },
  label: { type: String, default: "Loyalty card" },
  icon: { type: String, default: "coffee-bean" },
});
</script>

<template>
  <div class="kape-stamps" role="group" :aria-label="label">
    <span v-for="i in total" :key="i" :data-on="i <= filled ? '' : null" aria-hidden="true">
      <KapeIcon v-if="i <= filled" :name="icon" :size="16" />
    </span>
  </div>
  <p class="kape-sr">
    <span v-text="filled"></span> of <span v-text="total"></span> stamps earned
  </p>
</template>
