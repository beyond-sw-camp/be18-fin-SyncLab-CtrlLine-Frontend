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
          <!-- 품목명 -->
          <FilterInput label="품목명" v-model="localFilters.itemName" />
          <!-- 품목코드 -->
          <FilterInput label="품목코드" v-model="localFilters.itemCode" />
          <!-- 규격 -->
          <FilterInput label="규격" v-model="localFilters.itemSpecification" />
          <!-- 단위 -->
          <FilterInput label="단위" v-model="localFilters.itemUnit" />
          <!-- 품목구분 -->
          <FilterSelect
            label="품목구분"
            v-model="localFilters.itemStatus"
            :options="[
              { value: null, label: '전체' },
              { value: 'RAW_MATERIAL', label: '원재료' },
              { value: 'AUXILIARY_MATERIAL', label: '부재료' },
              { value: 'SEMI_FINISHED_PRODUCT', label: '반제품' },
              { value: 'FINISHED_PRODUCT', label: '완제품' },
            ]"
          />
          <FilterSelect
            label="사용여부"
            v-model="localFilters.isActive"
            :options="[
              { value: null, label: '전체' },
              { value: true, label: '사용' },
              { value: false, label: '미사용' },
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

// 품목용 필터 구조
const localFilters = reactive({
  itemCode: props.filters.itemCode ?? '',
  itemName: props.filters.itemName ?? '',
  itemSpecification: props.filters.itemSpecification ?? null,
  itemUnit: props.filters.itemUnit ?? '',
  itemStatus: props.filters.itemStatus ?? null,
  isActive: props.filters.isActive ?? null,
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
    itemCode: '',
    itemName: '',
    itemSpecification: '',
    itemUnit: null,
    itemStatus: null,
    isActive: null,
  });
  emit('search', { ...localFilters });
};
</script>
