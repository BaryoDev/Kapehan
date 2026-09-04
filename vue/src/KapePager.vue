<script setup>
import { computed } from "vue";
const props = defineProps({ page: { type: Number, default: 1 }, pages: { type: Number, default: 1 } });
const emit = defineEmits(["change"]);
const list = computed(() => Array.from({ length: props.pages }, (_, i) => i + 1));
</script>

<template>
  <nav class="kape-pager" aria-label="Pages">
    <button :disabled="page === 1" aria-label="Previous" @click="emit('change', page - 1)">&lsaquo;</button>
    <button v-for="p in list" :key="p" :aria-current="p === page ? 'page' : undefined" @click="emit('change', p)" v-text="p"></button>
    <button :disabled="page === pages" aria-label="Next" @click="emit('change', page + 1)">&rsaquo;</button>
  </nav>
</template>
