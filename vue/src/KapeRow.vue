<script setup>
defineProps({ items: { type: Array, default: () => [] } });
const emit = defineEmits(["pick"]);
</script>

<template>
  <div v-for="d in items" :key="d.id" class="kape-row" @click="emit('pick', d)">
    <span class="kape-row__art"><KapeIcon :name="d.icon" :size="40" colour /></span>
    <div class="kape-row__body">
      <p class="kape-row__title">
        <span v-text="d.name"></span>
        <span v-if="d.badge" class="kape-badge" v-text="d.badge"></span>
      </p>
      <p class="kape-row__sub" v-text="d.sub"></p>
    </div>
    <span class="kape-row__price" v-text="d.price"></span>
  </div>
</template>
