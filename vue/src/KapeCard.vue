<script setup>
defineProps({ item: { type: Object, required: true }, size: { type: Number, default: 64 } });
const emit = defineEmits(["add"]);
</script>

<template>
  <article class="kape-card">
    <KapeIcon :name="item.icon" :size="size" colour />
    <p class="kape-card__title" v-text="item.name"></p>
    <p class="kape-card__sub">{{" "}}<span v-text="item.size"></span> &middot; <span v-text="item.temp"></span></p>
    <div class="kape-card__foot">
      <span class="kape-row__price" v-text="item.price"></span>
      <button class="kape-btn kape-btn--primary" @click="emit('add', item)">Add</button>
    </div>
  </article>
</template>
