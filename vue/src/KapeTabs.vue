<script setup>
const props = defineProps({ tabs: { type: Array, default: () => ["Menu", "Beans", "Our shop"] } });
const tab = defineModel({ type: String, default: "Menu" });
const move = (n) => {
  const i = props.tabs.indexOf(tab.value);
  tab.value = props.tabs[(i + n + props.tabs.length) % props.tabs.length];
};
</script>

<template>
  <div class="kape-tabs" role="tablist" @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
    <button
      v-for="t in tabs"
      :key="t"
      role="tab"
      :aria-selected="tab === t"
      :tabindex="tab === t ? 0 : -1"
      @click="tab = t"
      v-text="t"></button>
  </div>
</template>
