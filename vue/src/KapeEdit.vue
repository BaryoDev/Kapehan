<script setup>
import { ref, nextTick } from "vue";
defineProps({ rows: { type: Array, default: () => [] } });
const emit = defineEmits(["save"]);
const editing = ref(null);
const draft = ref("");
const field = ref(null);

const start = async (d) => {
  editing.value = d.id;
  draft.value = String(d.price);
  await nextTick();
  field.value?.[0]?.focus();
};
const commit = (d) => {
  const n = Number(draft.value);
  if (!Number.isNaN(n)) emit("save", d.id, n);
  editing.value = null;
};
const cancel = () => { editing.value = null; };
</script>

<template>
  <table class="kape-table kape-table--edit">
    <thead>
      <tr><th scope="col">Drink</th><th scope="col">Size</th><th scope="col" class="num">Price</th><th scope="col" class="num">Stock</th></tr>
    </thead>
    <tbody>
      <tr v-for="d in rows" :key="d.id" :class="{ 'is-editing': editing === d.id }"
        @dblclick="start(d)" @keydown.f2="start(d)">
        <td v-text="d.name"></td>
        <td v-text="d.size"></td>
        <td class="num">
          <input v-if="editing === d.id" ref="field" v-model="draft" inputmode="numeric"
            @keydown.enter.prevent="commit(d)" @keydown.esc.prevent="cancel" @blur="commit(d)" />
          <span v-else v-text="d.price"></span>
        </td>
        <td class="num">
          <span v-text="d.stock"></span>
          <button v-if="editing === d.id" class="kape-btn kape-btn--sm" @mousedown.prevent="commit(d)">Save</button>
        </td>
      </tr>
    </tbody>
  </table>
  <p class="kape-sr" aria-live="polite" v-text="status"></p>
</template>
