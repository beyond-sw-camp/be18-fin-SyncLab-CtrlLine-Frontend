<template>
  <Accordion type="single" collapsible>
    <AccordionItem value="filters">
      <div class="flex w-fit px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
        <AccordionTrigger class="p-0 hover:no-underline cursor-pointer">
          Filter by
        </AccordionTrigger>
      </div>
      <!--조인해서 가져오는 품목, 라인만 필터링이 안됨.. 왜 그러는 걸까요. AI: 백엔드 문제일 것 같아~!-->
      <AccordionContent class="p-4 border-b-2 border-t-2 my-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilterInput label="전표번호" v-model="localFilters.defectiveDocNo" />
          <FilterInput label="품목코드" v-model="localFilters.itemCode" />
          <FilterInput label="품목명" v-model="localFilters.itemName" />
          <FilterInput label="라인명" v-model="localFilters.lineName" />
          <FilterInput label="실적전표" v-model="localFilters.productionPerformanceDocNo" />
          <div>
            <Label class="text-xs">생산기간</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[180px]">
                <FilterInput type="date" v-model="localFilters.fromDate" placeholder="시작일" />
              </div>

              <span class="block text-gray-400 w-full lg:w-fit">~</span>

              <div class="flex-1 min-w-[180px]">
                <FilterInput type="date" v-model="localFilters.toDate" placeholder="종료일" />
              </div>
            </div>
          </div>
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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const props = defineProps({
  filters: { type: Object, required: true },
});

const emit = defineEmits(['search']);

// 불량 필터 구조
const localFilters = reactive({
  defectiveDocNo: props.filters.defectiveDocNo ?? '',
  itemCode: props.filters.itemCode ?? '',
  itemName: props.filters.itemName ?? '',
  lineName: props.filters.lineName ?? '',
  productionPerformanceDocNo: props.filters.productionPerformanceDocNo ?? '',
  fromDate: props.filters.fromDate ?? null,
  toDate: props.filters.toDate ?? null,
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
    defectiveDocNo: '',
    itemCode: '',
    itemName: '',
    lineName: '',
    productionPerformanceDocNo: '',
    fromDate: null,
    toDate: null,
  });
  emit('search', { ...localFilters });
};
</script>
