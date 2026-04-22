<template>
  <button
    class="btn UIButton"
    :class="[colorClass, { 'mobile-only': mobileOnly }]"
    :style="buttonStyle"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link' | 'transparent';
  mobileOnly?: boolean;
}>(), {
  color: 'primary',
  mobileOnly: false
});

const colorClass = computed(() => `btn-${props.color}`);
const buttonStyle = computed(() => props.color === 'transparent' ? { backgroundColor: 'transparent' } : {});
</script>
