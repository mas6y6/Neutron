<template>
  <div :class="[masterClass, { show: visible }]">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  masterClass?: string;
}>();

const visible = ref(false);
const masterClass = props.masterClass ?? "Modal";

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true;
  });
});

function hideModal() {
  visible.value = false;
}

defineExpose({
  hideModal
});
</script>
