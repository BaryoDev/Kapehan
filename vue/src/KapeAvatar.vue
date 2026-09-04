<script setup>
defineProps({ people: { type: Array, default: () => [] }, max: { type: Number, default: 2 } });
</script>

<template>
  <div class="kape-avatars">
    <span v-for="c in people.slice(0, max)" :key="c.id" class="kape-avatar" v-text="c.initials"></span>
    <span v-if="people.length > max" class="kape-avatar" :title="people.length - max + ' more'">+<span v-text="people.length - max"></span></span>
  </div>
</template>
