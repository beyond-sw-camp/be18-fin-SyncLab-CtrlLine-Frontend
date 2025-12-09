<template>
  <div>
    <Label :for="label" class="text-xs">{{ label }}</Label>
    <div :class="['relative', searchIcon ? 'filter-input-wrapper' : '']">
      <Search v-if="searchIcon" class="filter-icon" />
      <Input
        class="w-full border rounded-lg px-3 py-2 mt-1 h-7 text-xs"
        :class="searchIcon ? 'pl-9' : ''"
        :id="label"
        :type="type"
        :placeholder="placeholder"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { Search } from 'lucide-vue-next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

defineProps({
  label: String,
  modelValue: [String, Number, null],
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  searchIcon: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.filter-input-wrapper {
  position: relative;
}

.filter-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}
</style>
