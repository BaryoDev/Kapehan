<script setup>
import { ref } from "vue";
const props = defineProps({ options: { type: Array, default: () => ["All", "Hot", "Iced"] } });
const pick = ref(props.options[0]);
</script>

<template>
  <button
    v-for="c in options"
    :key="c"
    class="kape-chip"
    :aria-pressed="pick === c"
    @click="pick = c"
    v-text="c"></button>
</template>
