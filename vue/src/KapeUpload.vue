<script setup>
import { ref } from "vue";
const props = defineProps({ accept: { type: String, default: ".csv,.xlsx" }, maxSize: { type: Number, default: 10485760 }, files: { type: Array, default: () => [] } });
const emit = defineEmits(["files"]);
const over = ref(false);
const take = (list) => {
  emit("files", Array.from(list).filter((f) => f.size <= props.maxSize));
};
</script>

<template>
  <label class="kape-drop" :class="{ 'is-over': over }"
    @dragover.prevent="over = true" @dragleave="over = false"
    @drop.prevent="over = false; take($event.dataTransfer.files)">
    <KapeIcon name="coffee-sack" :size="36" />
    <strong>Drop the menu sheet here</strong>
    <span>CSV or XLSX, up to 10 MB. Or <u>browse</u>.</span>
    <input type="file" :accept="accept" hidden @change="take($event.target.files)" />
  </label>

  <div v-for="f in files" :key="f.name" class="kape-file">
    <span class="kape-file__ext" v-text="f.ext"></span>
    <div class="kape-file__body">
      <span v-text="f.name"></span>
      <span class="kape-progress" role="progressbar" :aria-valuenow="f.pct" :aria-label="'Uploading ' + f.name">
        <span :style="{ width: f.pct + '%' }"></span>
      </span>
    </div>
    <button aria-label="Cancel" @click="$emit('cancel', f)">&times;</button>
  </div>
</template>
