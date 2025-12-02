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
          <FilterInput label="Lot No." v-model="localFilters.lotNo" />
          <FilterInput label="품목 코드" v-model="localFilters.itemCode" />
          <FilterSelect
            label="공장 코드"
            v-model="localFilters.factoryCode"
            :options="factoryOptions"
          />
          <FilterInput label="라인 코드" v-model="localFilters.lineCode" />
          <FilterInput label="생산담당자 사번" v-model="localFilters.productionManagerNo" />
          <FilterInput
            label="생산실적 전표번호"
            v-model="localFilters.performanceDocumentNo"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <Label class="text-xs">생성일</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[150px]">
                <FilterInput type="date" v-model="localFilters.createdAtFrom" placeholder="시작일" />
              </div>
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <div class="flex-1 min-w-[150px]">
                <FilterInput type="date" v-model="localFilters.createdAtTo" placeholder="종료일" />
              </div>
            </div>
          </div>

          <div>
            <Label class="text-xs">수정일</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[150px]">
                <FilterInput type="date" v-model="localFilters.updatedAtFrom" placeholder="시작일" />
              </div>
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <div class="flex-1 min-w-[150px]">
                <FilterInput type="date" v-model="localFilters.updatedAtTo" placeholder="종료일" />
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
import { computed, reactive, watch } from 'vue';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
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
  lotNo: props.filters.lotNo ?? '',
  itemCode: props.filters.itemCode ?? '',
  factoryCode: props.filters.factoryCode ? props.filters.factoryCode : null,
  lineCode: props.filters.lineCode ?? '',
  productionManagerNo: props.filters.productionManagerNo ?? '',
  performanceDocumentNo: props.filters.performanceDocumentNo ?? '',
  createdAtFrom: props.filters.createdAtFrom ?? null,
  createdAtTo: props.filters.createdAtTo ?? null,
  updatedAtFrom: props.filters.updatedAtFrom ?? null,
  updatedAtTo: props.filters.updatedAtTo ?? null,
});

watch(
  () => props.filters,
  newVal => {
    localFilters.lotNo = newVal.lotNo ?? '';
    localFilters.itemCode = newVal.itemCode ?? '';
    localFilters.factoryCode = newVal.factoryCode ? newVal.factoryCode : null;
    localFilters.lineCode = newVal.lineCode ?? '';
    localFilters.productionManagerNo = newVal.productionManagerNo ?? '';
    localFilters.performanceDocumentNo = newVal.performanceDocumentNo ?? '';
    localFilters.createdAtFrom = newVal.createdAtFrom ?? null;
    localFilters.createdAtTo = newVal.createdAtTo ?? null;
    localFilters.updatedAtFrom = newVal.updatedAtFrom ?? null;
    localFilters.updatedAtTo = newVal.updatedAtTo ?? null;
  },
  { deep: true },
);

const applyFilters = () => {
  emit('search', { ...localFilters });
};

const { data: factoryList } = useGetFactoryList();

const factoryOptions = computed(() => {
  if (!factoryList.value || !factoryList.value.content) {
    return [{ value: null, label: '전체' }];
  }

  return [
    { value: null, label: '전체' },
    ...factoryList.value.content.map(factory => ({
      value: factory.factoryCode,
      label: `${factory.factoryCode} (${factory.factoryName})`,
    })),
  ];
});

const resetFilters = () => {
  Object.assign(localFilters, {
    lotNo: '',
    itemCode: '',
    factoryCode: null,
    lineCode: '',
    productionManagerNo: '',
    performanceDocumentNo: '',
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
  });
  emit('search', { ...localFilters });
};
</script>
