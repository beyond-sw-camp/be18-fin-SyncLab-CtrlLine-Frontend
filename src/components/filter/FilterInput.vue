<template>
  <div>
    <Label :for="label" class="text-xs">{{ label }}</Label>
    <Input
      class="w-full border rounded-lg px-3 py-2 mt-1 h-7 text-xs"
      :id="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

defineProps({
  label: String,
  modelValue: String,
});
defineEmits(['update:modelValue']);
</script>
