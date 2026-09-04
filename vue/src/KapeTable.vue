<script setup>
defineProps({ rows: { type: Array, default: () => [] }, caption: String });
</script>

<template>
  <table class="kape-table">
    <caption class="kape-sr" v-text="caption"></caption>
    <thead>
      <tr><th scope="col">Order</th><th scope="col">Items</th><th scope="col">Status</th><th scope="col" class="num">Total</th></tr>
    </thead>
    <tbody>
      <tr v-for="o in rows" :key="o.id">
        <td>#<span v-text="o.id"></span></td>
        <td v-text="o.summary"></td>
        <td><span class="kape-tag" :class="{ 'kape-tag--accent': o.status === 'making' }" v-text="o.status"></span></td>
        <td class="num" v-text="o.total"></td>
      </tr>
    </tbody>
  </table>
</template>
