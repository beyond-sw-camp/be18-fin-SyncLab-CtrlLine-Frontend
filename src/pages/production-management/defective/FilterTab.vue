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
          <FilterSelect label="공장" v-model="localFilters.factoryName" :options="factoryOptions" />

          <FilterSelect label="라인" v-model="localFilters.lineCode" :options="lineOptions" />

          <FilterInput label="불량 전표번호" v-model="localFilters.defectiveDocNo" />

          <FilterInput label="실적전표" v-model="localFilters.productionPerformanceDocNo" />

          <FilterInput label="품목코드" v-model="localFilters.itemCode" />

          <FilterInput label="품목명" v-model="localFilters.itemName" />

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
import { computed, reactive, watch, ref } from 'vue';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
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

const selectedFactoryId = ref(null);
const emit = defineEmits(['search']);

const { data: factoryList } = useGetFactoryList();
const { data: lineList } = useGetLineList({ factoryId: selectedFactoryId });

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

const lineOptions = computed(() => {
  if (!lineList.value || !lineList.value.content) {
    return [{ value: null, label: '전체' }];
  }

  const entries = lineList.value.content;
  const relevantLines = entries;

  const uniqueLines = new Map();
  for (const line of relevantLines) {
    if (!uniqueLines.has(line.lineCode)) {
      uniqueLines.set(line.lineCode, line);
    }
  }

  const options = Array.from(uniqueLines.values()).map(line => ({
    value: line.lineCode,
    label: `${line.lineName} (${line.lineCode})`,
  }));

  return [{ value: null, label: '전체' }, ...options];
});

const localFilters = reactive({
  defectiveDocNo: props.filters.defectiveDocNo ?? '',
  factoryName: props.filters.factoryName ?? null,
  itemCode: props.filters.itemCode ?? '',
  itemName: props.filters.itemName ?? '',
  lineName: props.filters.lineName ?? null,
  lineCode: props.filters.lineCode ?? null,
  productionPerformanceDocNo: props.filters.productionPerformanceDocNo ?? '',
  fromDate: props.filters.fromDate ?? null,
  toDate: props.filters.toDate ?? null,
});

watch(
  () => localFilters.factoryName,
  newFactoryName => {
    const selectedFactory = factoryOptions.value.find(factory => factory.value === newFactoryName);
    selectedFactoryId.value = selectedFactory ? selectedFactory.id : null;

    localFilters.lineName = null;
  },
);

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

const resetFilters = () => {
  Object.assign(localFilters, {
    defectiveDocNo: '',
    factoryName: null,
    itemCode: '',
    itemName: '',
    lineName: null,
    lineCode: null,
    productionPerformanceDocNo: '',
    fromDate: null,
    toDate: null,
  });

  selectedFactoryId.value = null;

  emit('search', { ...localFilters });
};
</script>

<style scoped></style>
