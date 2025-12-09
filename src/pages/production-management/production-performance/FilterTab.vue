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
          <div>
            <Label class="text-xs">생산실적 전표번호</Label>
            <div class="flex items-center gap-1 mt-1">
              <FilterInput
                type="text"
                v-model="localFilters.documentDateFrom"
                placeholder="시작일"
                class="w-1/2"
              />
              <span class="block text-gray-400">~</span>
              <FilterInput
                type="text"
                v-model="localFilters.documentDateTo"
                placeholder="종료일"
                class="w-1/2"
              />
            </div>
          </div>

          <FilterInput label="생산계획 전표번호" v-model="localFilters.producerManagerNo" />

          <FilterInput label="불량 전표번호" v-model="localFilters.defectiveDocumentNo" />

          <FilterInput label="로트 번호" v-model="localFilters.lotNo" />

          <FilterSelect
            label="공장명"
            v-model="localFilters.factoryName"
            :options="factoryOptions"
          />

          <FilterSelect label="라인" v-model="localFilters.lineCode" :options="lineOptions" />
          <div>
            <Label class="text-xs">납기일자</Label>
            <div class="flex items-center gap-1 mt-1">
              <FilterInput
                type="date"
                v-model="localFilters.dueDateFrom"
                placeholder="시작일"
                class="w-1/2"
              />
              <span class="block text-gray-400">~</span>
              <FilterInput
                type="date"
                v-model="localFilters.dueDateTo"
                placeholder="종료일"
                class="w-1/2"
              />
            </div>
          </div>
          <div>
            <Label class="text-xs">품목명</Label>
            <CreateAutoCompleteSelect
              label="품목명"
              :value="localFilters.itemCode"
              :setValue="setItemCodeFilter"
              :fetchList="() => useGetItemList({ isActive: true })"
              keyField="itemCode"
              nameField="itemName"
              :fields="[
                'itemCode',
                'itemName',
                'itemSpecification',
                'itemUnit',
                'itemStatus',
                'isActive',
              ]"
              :tableHeaders="['품목코드', '품목명', '규격', '단위', '품목구분', '사용여부']"
              :emitFullItem="true"
              @selectedFullItem="onItemSelected"
              @clear="onItemCleared"
              class="h-7 placeholder:text-xs text-xs"
              inputClass="h-7 text-xs placeholder:text-xs"
              iconClass="!w-3 !h-3"
            />
          </div>

          <FilterInput label="생산담당자" v-model="localFilters.producerManagerNo" />

          <FilterInput label="영업담당자" v-model="localFilters.salesManagerNo" />

          <div>
            <Label class="text-xs">생산 시작 기간</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[180px]">
                <FilterInput
                  type="datetime-local"
                  v-model="localFilters.startTimeFrom"
                  placeholder="생산 시작"
                />
              </div>

              <span class="block text-gray-400 w-full lg:w-fit">~</span>

              <div class="flex-1 min-w-[180px]">
                <FilterInput
                  type="datetime-local"
                  v-model="localFilters.startTimeTo"
                  placeholder="생산 시자"
                />
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
import { computed, reactive, ref, watch } from 'vue';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import useGetItemList from '@/apis/query-hooks/item/useGetItemList';
import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import CreateAutoCompleteSelect from '@/components/auto-complete/CreateAutoCompleteSelect.vue';
import FilterInput from '@/components/filter/FilterInput.vue';
import FilterSelect from '@/components/filter/FilterSelect.vue';
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

const localFilters = reactive({
  documentDateFrom: props.filters.documentDateFrom ?? null,
  documentDateTo: props.filters.ducoumentDateTo ?? null,

  productionPlanDocument: props.filters.productionPlanDocument ?? '',
  defectiveDocumentNo: props.filters.defectiveDocumentNo ?? '',
  lotNo: props.filters.lotNo ?? '',

  factoryName: props.filters.factoryName ?? null,
  lineCode: props.filters.lineCode ?? '',
  itemCode: props.filters.itemCode ?? '',
  itemName: props.filters.itemName ?? '',
  producerManagerNo: props.filters.producerManagerNo ?? '',
  salesManagerNo: props.filters.salesManagerNo ?? '',

  startTimeFrom: props.filters.startTimeFrom ?? null,
  startTimeTo: props.filters.startTimeTo ?? null,
  dueDateFrom: props.filters.dueDateFrom ?? null,
  dueDateTo: props.filters.dueDateTo ?? null,

  minTotalQty: props.filters.minTotalQty ?? null,
  maxTotalQty: props.filters.maxTotalQty ?? null,
  minPerformanceQty: props.filters.minPerformanceQty ?? null,
  maxPerformanceQty: props.filters.maxPerformanceQty ?? null,
  minDefectRate: props.filters.minDefectRate ?? null,
  maxDefectRate: props.filters.maxDefectRate ?? null,
});

watch(
  () => props.filters,
  newVal => {
    Object.assign(localFilters, newVal);
  },
  { deep: true },
);

const { data: factoryList } = useGetFactoryList();

const factoryOptions = computed(() => {
  if (!factoryList.value || !factoryList.value.content)
    return [{ value: null, label: '전체', id: null }];

  return [
    { value: null, label: '전체', id: null },
    ...factoryList.value.content.map(factory => ({
      value: factory.factoryName,
      label: factory.factoryName,
      id: factory.factoryId,
    })),
  ];
});

const applyFilters = () => {
  emit('search', { ...localFilters });
};

const resetFilters = () => {
  Object.assign(localFilters, {
    documentDateFrom: null,
    documentDateTo: null,

    productionPlanDocumentNo: '',
    defectiveDocumentNo: '',

    factoryName: null,
    lineCode: '',
    lotNo: '',

    salesManagerNo: '',
    producerManagerNo: '',
    itemCode: '',
    itemName: '',

    // 기간 필드 초기화
    startTimeFrom: null,
    startTimeTo: null,
    dueDateFrom: null,
    dueDateTo: null,

    // 수량/비율 필드 초기화
    minTotalQty: null,
    maxTotalQty: null,
    minPerformanceQty: null,
    maxPerformanceQty: null,
    minDefectRate: null,
    maxDefectRate: null,
  });

  emit('search', { ...localFilters });
};

watch(
  () => props.filters,
  newVal => {
    Object.assign(localFilters, newVal);
  },
  { deep: true },
);
</script>

<style scoped></style>
