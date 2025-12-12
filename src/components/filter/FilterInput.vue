<template>
  <div>
    <Label :for="label" class="text-xs">{{ label }}</Label>
    <div :class="['relative mt-1', searchIcon ? 'filter-input-wrapper' : '']">
      <span
        v-if="searchIcon"
        class="filter-icon flex h-5 w-5 items-center justify-center text-gray-400"
      >
        <SearchIcon class="w-4 h-4" />
      </span>
      <Input
        class="w-full border rounded-lg px-3 py-2 h-7 text-xs"
        :class="searchIcon ? 'pr-9' : ''"
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
import { SearchIcon } from 'lucide-vue-next';

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
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
</style>
