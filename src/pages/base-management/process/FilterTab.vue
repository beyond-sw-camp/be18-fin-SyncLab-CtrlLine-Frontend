<template>
  <Accordion type="single" collapsible>
    <AccordionItem value="filters">
      <div class="flex w-fit px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
        <AccordionTrigger class="p-0 hover:no-underline cursor-pointer">
          Filter by
        </AccordionTrigger>
      </div>

      <AccordionContent class="p-4 border-b-2 border-t-2 my-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilterInput label="공정명" v-model="localFilters.processName" />

          <!-- 담당자 -->
          <FilterInput label="담당자" v-model="localFilters.userName" />

          <!-- 담당부서 -->
          <FilterSelect
            label="담당부서"
            v-model="localFilters.userDepartment"
            :options="[
              { value: null, label: '전체' },
              { value: '영업 1팀', label: '영업 1팀' },
              { value: '영업 2팀', label: '영업 2팀' },
              { value: '생산 1팀', label: '생산 1팀' },
              { value: '생산 2팀', label: '생산 2팀' },
            ]"
          />
        </div>

        <div class="flex justify-end mt-4 gap-2">
          <Button
            variant="outline"
            @click="resetFilters"
            size="xs"
            class="text-sm font-normal px-6"
          >
            초기화
          </Button>
          <Button
            class="bg-primary text-white text-sm font-normal px-6"
            @click="applyFilters"
            size="xs"
          >
            조회
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup>
import { reactive, watch } from 'vue';

import FilterInput from '@/components/filter/FilterInput.vue';
import FilterSelect from '@/components/filter/FilterSelect.vue';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const props = defineProps({
  filters: { type: Object, required: true },
});

const emit = defineEmits(['search']);

// 공정용 필터 구조
const localFilters = reactive({
  processName: props.filters.processName ?? '',
  userName: props.filters.userName ?? '',
  userDepartment: props.filters.userDepartment ?? null,
});

watch(
  () => props.filters,
  newVal => {
    Object.assign(localFilters, newVal);
  },
  { deep: true },
);

const applyFilters = () => {
  emit('search', { ...localFilters });
};

// 초기화
const resetFilters = () => {
  Object.assign(localFilters, {
    processName: '',
    userName: '',
    userDepartment: null,
  });
  emit('search', { ...localFilters });
};
</script>
