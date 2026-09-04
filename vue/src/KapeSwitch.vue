<script setup>
defineProps({ label: String, disabled: Boolean });
const on = defineModel({ type: Boolean, default: false });
</script>

<template>
  <label class="kape-switch">
    <input type="checkbox" v-model="on" :disabled="disabled" />
  </label>
  <span v-text="label"></span>
</template>
