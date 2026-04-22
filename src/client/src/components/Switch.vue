<template>
  <label class="UISwitch" :class="{ disabled: disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      :disabled="disabled"
    />
    <span class="UISwitchSlider"></span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: boolean;
  disabled?: boolean;
}>();

defineEmits(['update:modelValue']);
</script>
