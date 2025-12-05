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
          <FilterSelect
            label="공장명"
            v-model="localFilters.factoryName"
            :options="factoryOptions"
          />
          <FilterInput label="납기일자" type="date" v-model="localFilters.dueDate" />

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

          <FilterInput label="생산담당자" v-model="localFilters.productionManagerName" />

          <FilterSelect label="라인명" v-model="localFilters.lineName" :options="lineOptions" />

          <FilterInput label="영업담당자" v-model="localFilters.salesManagerName" />

          <div>
            <Label class="text-xs">생산기간</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[180px]">
                <FilterInput
                  type="datetime-local"
                  v-model="localFilters.startTime"
                  placeholder="시작일"
                />
              </div>

              <span class="block text-gray-400 w-full lg:w-fit">~</span>

              <div class="flex-1 min-w-[180px]">
                <FilterInput
                  type="datetime-local"
                  v-model="localFilters.endTime"
                  placeholder="종료일"
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
  factoryCode: props.filters.factoryCode ?? null,
  factoryName: props.filters.factoryName ?? null,
  lineCode: props.filters.lineCode ?? '',
  lineName: props.filters.lineName ?? '',
  itemCode: props.filters.itemCode ?? '',
  itemName: props.filters.itemName ?? '',
  productionManagerName: props.filters.productionManagerName ?? '',
  salesManagerName: props.filters.salesManagerName ?? '',
  dueDate: props.filters.dueDate ?? null,
  startTime: props.filters.startTime ?? null,
  endTime: props.filters.endTime ?? null,
});

const selectedFactoryId = ref(null);
const selectedItemId = ref(null);

const { data: factoryList } = useGetFactoryList();
const { data: lineList } = useGetLineList({ factoryId: selectedFactoryId, itemId: selectedItemId });

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

  if (selectedFactoryId.value === null || localFilters.factoryName === null) {
    // 라인 이름만 추출하여 Set으로 중복을 제거 (9개 -> 3개 이름만)
    const uniqueLineNames = new Set(lineList.value.content.map(line => line.lineName));

    // 이름만 포함하는 간결한 옵션 목록을 생성
    const simpleOptions = Array.from(uniqueLineNames).map(name => ({
      value: name,
      label: name,
    }));

    return [{ value: null, label: '전체' }, ...simpleOptions];
  }

  return [
    { value: null, label: '전체' },
    ...lineList.value.content.map(line => ({
      value: `${line.lineName}_${line.lineCode}`,
      label: `${line.lineName}`,
    })),
  ];
});

function onItemSelected(item) {
  selectedItemId.value = item.id;
}

function onItemCleared() {
  selectedItemId.value = null;
}

const setItemCodeFilter = newCode => {
  localFilters.itemCode = newCode;
  localFilters.itemName = '';

  if (!newCode) {
    localFilters.itemName = '';
    selectedItemId.value = null;
  }
};

const applyFilters = () => {
  emit('search', { ...localFilters });
};

const resetFilters = () => {
  Object.assign(localFilters, {
    factoryName: null,
    lineName: '',
    salesManagerName: '',
    productionManagerName: '',
    itemCode: '',
    dueDate: null,
    startTime: null,
    endTime: null,
  });

  selectedFactoryId.value = null;
  selectedItemId.value = null;

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
