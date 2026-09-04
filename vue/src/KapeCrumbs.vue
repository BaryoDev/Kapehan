<script setup>
defineProps({ trail: { type: Array, default: () => [] }, label: { type: String, default: "Breadcrumb" } });
</script>

<template>
  <nav :aria-label="label">
    <ol class="kape-crumbs">
      <li v-for="(t, i) in trail" :key="t.href" :aria-current="i === trail.length - 1 ? 'page' : undefined">
        <a v-if="i < trail.length - 1" :href="t.href" v-text="t.label"></a>
        <span v-else v-text="t.label"></span>
      </li>
    </ol>
  </nav>
</template>
