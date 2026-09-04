<script setup>
defineProps({
  label: { type: String, default: "Order now" },
  variant: { type: String, default: "default" },
  icon: { type: String, default: null },
  disabled: Boolean,
});
</script>

<template>
  <button
    class="kape-btn"
    :class="{ 'kape-btn--primary': variant === 'primary', 'kape-btn--ghost': variant === 'ghost' }"
    :disabled="disabled"
    @click="$emit('click', $event)">
    <KapeIcon v-if="icon" :name="icon" :size="20" />
    <span v-text="label"></span>
  </button>
</template>
