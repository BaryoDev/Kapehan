<script setup>
import { onMounted } from "vue";
const props = defineProps({ message: String, tone: { type: String, default: "info" }, actionLabel: { type: String, default: null }, timeout: { type: Number, default: 6000 } });
const emit = defineEmits(["close", "action"]);
onMounted(() => {
  if (props.timeout > 0 && props.tone !== "warn") setTimeout(() => emit("close"), props.timeout);
});
</script>

<template>
  <div class="kape-toast" :class="{ 'kape-toast--warn': tone === 'warn' }" :role="tone === 'warn' ? 'alert' : 'status'">
    <KapeIcon :name="tone === 'warn' ? 'coffee-bean' : 'coffee-cup'" :size="20" />
    <span class="kape-toast__text" v-text="message"></span>
    <button v-if="actionLabel" class="kape-toast__action" @click="emit('action')" v-text="actionLabel"></button>
  </div>
</template>
