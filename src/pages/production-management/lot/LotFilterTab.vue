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

          <FilterInput label="생산실적 전표번호" v-model="localFilters.performanceDocumentNo" />

          <FilterSelect label="공장" v-model="localFilters.factoryCode" :options="factoryOptions" />

          <FilterSelect label="라인" v-model="localFilters.lineCode" :options="lineOptions" />
          <div>
            <Label class="text-xs">품목</Label>
            <CreateAutoCompleteSelect
              label="품목"
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

          <div>
            <Label class="text-xs">생성일</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[150px]">
                <FilterInput
                  type="date"
                  v-model="localFilters.createdAtFrom"
                  placeholder="시작일"
                />
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
                <FilterInput
                  type="date"
                  v-model="localFilters.updatedAtFrom"
                  placeholder="시작일"
                />
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
import { ref, computed, reactive, watch } from 'vue';

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
  lotNo: props.filters.lotNo ?? '',
  itemCode: props.filters.itemCode ?? '',
  factoryCode: props.filters.factoryCode ? props.filters.factoryCode : null,
  lineCode: props.filters.lineCode ?? '',
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

const onItemSelected = item => {
  selectedItemId.value = item?.id ?? null;
};

const onItemCleared = () => {
  selectedItemId.value = null;
};

const setItemCodeFilter = newCode => {
  localFilters.itemCode = newCode;
  if (!newCode) {
    selectedItemId.value = null;
  }
};

const selectedFactoryId = ref(null);
const selectedItemId = ref(null);

const { data: factoryList } = useGetFactoryList();
const { data: lineList } = useGetLineList({ factoryId: selectedFactoryId, itemId: selectedItemId });

const factoryOptions = computed(() => {
  if (!factoryList.value || !factoryList.value.content) {
    return [{ value: null, label: '전체', id: null }];
  }

  return [
    { value: null, label: '전체', id: null },
    ...factoryList.value.content.map(factory => ({
      value: factory.factoryCode,
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

const resetFilters = () => {
  Object.assign(localFilters, {
    lotNo: '',
    itemCode: '',
    factoryCode: null,
    lineCode: '',
    performanceDocumentNo: '',
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
  });
  emit('search', { ...localFilters });
};

watch(
  () => localFilters.factoryCode,
  (newCode, oldCode) => {
    const match = factoryList.value?.content?.find(factory => factory.factoryCode === newCode);
    selectedFactoryId.value = match?.factoryId ?? null;
    if (newCode !== oldCode) {
      localFilters.lineCode = null;
    }
  },
  { immediate: true },
);
</script>
