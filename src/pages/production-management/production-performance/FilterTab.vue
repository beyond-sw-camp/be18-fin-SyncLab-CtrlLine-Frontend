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
          <FilterInput label="전표번호" v-model="localFilters.productionPlanDocumentNo" />
          <FilterInput label="공장코드" v-model="localFilters.factoryCode" />
          <FilterInput label="라인코드" v-model="localFilters.lineCode" />
          <FilterInput label="품목코드" v-model="localFilters.itemCode" />
          <FilterInput label="영업 담당자" v-model="localFilters.salesManagerNo" />
          <FilterInput label="생산 담당자" v-model="localFilters.productionManagerNo" />

          <!-- ────────── 투입수량 ────────── -->
          <div>
            <Label class="text-xs">투입수량</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="number"
                v-model="localFilters.minTotalQty"
                placeholder="최소"
                class="flex-1 min-w-[180px]"
              />
              <span class="block text-gray-400 w-full lg:w-fit">~</span>

              <FilterInput
                type="number"
                v-model="localFilters.maxTotalQty"
                placeholder="최대"
                class="flex-1 min-w-[180px]"
              />
            </div>
          </div>

          <!-- ────────── 실적수량 ────────── -->
          <div>
            <Label class="text-xs">실적수량</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[180px]">
                <FilterInput
                  type="number"
                  v-model="localFilters.minPerformanceQty"
                  placeholder="최소"
                />
              </div>

              <span class="block text-gray-400 w-full lg:w-fit">~</span>

              <div class="flex-1 min-w-[180px]">
                <FilterInput
                  type="number"
                  v-model="localFilters.maxPerformanceQty"
                  placeholder="최대"
                />
              </div>
            </div>
          </div>

          <!-- ────────── 불량률 ────────── -->
          <div>
            <Label class="text-xs">불량률</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="number"
                v-model="localFilters.minDefectRate"
                placeholder="최소"
                class="flex-1 min-w-[180px]"
              />

              <span class="block text-gray-400 w-full lg:w-fit">~</span>

              <FilterInput
                type="number"
                v-model="localFilters.maxDefectRate"
                placeholder="최대"
                class="flex-1 min-w-[180px]"
              />
            </div>
          </div>

          <!-- ────────── 생산 시작시각 ────────── -->
          <div>
            <Label class="text-xs">생산 시작시각</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="datetime-local"
                v-model="localFilters.startTimeFrom"
                class="flex-1 min-w-[180px]"
                placeholder="From"
              />
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <FilterInput
                type="datetime-local"
                v-model="localFilters.startTimeTo"
                class="flex-1 min-w-[180px]"
                placeholder="To"
              />
            </div>
          </div>

          <!-- ────────── 생산 종료시각 ────────── -->
          <div>
            <Label class="text-xs">생산 종료시각</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="datetime-local"
                v-model="localFilters.endTimeFrom"
                class="flex-1 min-w-[180px]"
                placeholder="From"
              />
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <FilterInput
                type="datetime-local"
                v-model="localFilters.endTimeTo"
                class="flex-1 min-w-[180px]"
                placeholder="To"
              />
            </div>
          </div>

          <!-- ────────── 납기일자 ────────── -->
          <div>
            <Label class="text-xs">납기일자</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="date"
                v-model="localFilters.dueDateFrom"
                class="flex-1 min-w-[180px]"
                placeholder="From"
              />
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <FilterInput
                type="date"
                v-model="localFilters.dueDateTo"
                class="flex-1 min-w-[180px]"
                placeholder="To"
              />
            </div>
          </div>
          <!-- ────────── 비고 ────────── -->
          <FilterInput label="비고" v-model="localFilters.remark" />

          <!-- ────────── 삭제 여부 ────────── -->
          <div class="flex items-center gap-2">
            <Label class="text-xs">삭제 여부</Label>
            <input type="checkbox" v-model="localFilters.isDeleted" class="size-4" />
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
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const props = defineProps({
  filters: { type: Object, required: true },
});

const emit = defineEmits(['search']);

const localFilters = reactive({
  productionPlanDocumentNo: props.filters.productionPlanDocumentNo ?? '',
  lotNo: props.filters.lotNo ?? '',
  factoryCode: props.filters.factoryCode ?? '',
  lineCode: props.filters.lineCode ?? '',
  itemCode: props.filters.itemCode ?? '',
  salesManagerNo: props.filters.salesManagerNo ?? '',
  productionManagerNo: props.filters.productionManagerNo ?? '',

  minTotalQty: props.filters.minTotalQty ?? null,
  maxTotalQty: props.filters.maxTotalQty ?? null,

  minPerformanceQty: props.filters.minPerformanceQty ?? null,
  maxPerformanceQty: props.filters.maxPerformanceQty ?? null,

  minDefectRate: props.filters.minDefectRate ?? null,
  maxDefectRate: props.filters.maxDefectRate ?? null,

  startTimeFrom: props.filters.startTimeFrom ?? null,
  startTimeTo: props.filters.startTimeTo ?? null,

  endTimeFrom: props.filters.endTimeFrom ?? null,
  endTimeTo: props.filters.endTimeTo ?? null,

  dueDateFrom: props.filters.dueDateFrom ?? null,
  dueDateTo: props.filters.dueDateTo ?? null,

  remark: props.filters.remark ?? '',
  isDeleted: props.filters.isDeleted ?? null,
});

watch(
  () => props.filters,
  newVal => {
    Object.assign(localFilters, newVal);
  },
  { deep: true },
);

const normalizeNumber = value => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const applyFilters = () => {
  emit('search', {
    ...localFilters,
    minTotalQty: normalizeNumber(localFilters.minTotalQty),
    maxTotalQty: normalizeNumber(localFilters.maxTotalQty),
    minPerformanceQty: normalizeNumber(localFilters.minPerformanceQty),
    maxPerformanceQty: normalizeNumber(localFilters.maxPerformanceQty),
    minDefectRate: normalizeNumber(localFilters.minDefectRate),
    maxDefectRate: normalizeNumber(localFilters.maxDefectRate),
  });
};

// 초기화
const resetFilters = () => {
  Object.assign(localFilters, {
    productionPlanDocumentNo: '',
    lotNo: '',
    factoryCode: '',
    lineCode: '',
    itemCode: '',
    salesManagerNo: '',
    productionManagerNo: '',
    minTotalQty: null,
    maxTotalQty: null,
    minPerformanceQty: null,
    maxPerformanceQty: null,
    minDefectRate: null,
    maxDefectRate: null,
    startTimeFrom: null,
    startTimeTo: null,
    endTimeFrom: null,
    endTimeTo: null,
    dueDateFrom: null,
    dueDateTo: null,
    remark: '',
    isDeleted: null,
  });
};
</script>

<style scoped></style>
