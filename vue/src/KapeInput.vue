<script setup>
defineProps({ placeholder: { type: String, default: "Search the menu" }, icon: { type: String, default: "grinder" }, type: { type: String, default: "search" } });
const model = defineModel({ type: String, default: "" });
</script>

<template>
  <label class="kape-input">
    <KapeIcon v-if="icon" :name="icon" :size="18" />
    <input v-model="model" :type="type" :placeholder="placeholder" />
  </label>
</template>
