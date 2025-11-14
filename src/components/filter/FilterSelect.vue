<template>
  <div>
    <Label :for="label" class="text-xs">{{ label }}</Label>
    <Select :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
      <SelectTrigger class="w-full max-h-7 px-3 py-2 mt-1 rounded-lg">
        <SelectValue :placeholder="placeholder" class="text-xs" />
      </SelectTrigger>

      <SelectContent class="text-xs">
        <SelectItem
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          class="text-xs py-1 px-2"
        >
          {{ opt.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup>
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';

defineProps({
  label: String,
  modelValue: [String, null],
  placeholder: { type: String, default: '전체' },
  options: { type: Array, required: true },
});

defineEmits(['update:modelValue']);
</script>
