<template>
  <input
    class="UIEntry"
    style="display: block"
    :type="type"
    v-bind="$attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: string;
  modelValue?: string;
}>(), {
  type: 'text',
  modelValue: ''
});

defineEmits(['update:modelValue']);
</script>
