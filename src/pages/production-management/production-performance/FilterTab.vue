<template>
  <Accordion type="single" collapsible>
    <AccordionItem value="filters">
      <div class="flex w-fit px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
        <AccordionTrigger class="p-0 hover:no-underline cursor-pointer">
          Filter by
        </AccordionTrigger>
      </div>

      <AccordionContent class="p-4 border-b-2 border-t-2 my-3">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label class="text-xs">생산실적 전표번호</Label>
            <div class="flex items-center gap-1 mt-1">
              <FilterInput
                type="text"
                v-model="localFilters.documentDateFrom"
                placeholder="생산실적 전표번호 시작"
                class="w-1/2"
              />
              <span class="block text-gray-400">~</span>
              <FilterInput
                type="text"
                v-model="localFilters.documentDateTo"
                placeholder="생산실적 전표번호 종료"
                class="w-1/2"
              />
            </div>
          </div>

          <FilterSelect
            label="공장명"
            v-model="localFilters.factoryName"
            :options="factoryOptions"
          />

          <FilterSelect label="라인명" v-model="localFilters.lineName" :options="lineOptions" />

          <FilterInput label="생산계획 전표번호" v-model="localFilters.productionPlanDocumentNo" />

          <FilterInput label="Lot No." v-model="localFilters.lotNo" />

          <FilterInput label="불량 전표번호" v-model="localFilters.defectiveDocumentNo" />

          <FilterInput label="생산담당자" v-model="localFilters.producerManagerName" />

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

          <FilterInput label="영업 담당자" v-model="localFilters.salesManagerName" />

          <div>
            <Label class="text-xs">생산 시작시각</Label>
            <div class="flex items-center gap-1 mt-1">
              <FilterInput
                type="datetime-local"
                v-model="localFilters.startTimeFrom"
                placeholder="시작일시"
                class="w-1/2"
              />
              <span class="block text-gray-400">~</span>
              <FilterInput
                type="datetime-local"
                v-model="localFilters.startTimeTo"
                placeholder="종료일시"
                class="w-1/2"
              />
            </div>
          </div>

          <div>
            <Label class="text-xs">생산 종료시각</Label>
            <div class="flex items-center gap-1 mt-1">
              <FilterInput
                type="datetime-local"
                v-model="localFilters.endTimeFrom"
                placeholder="시작일시"
                class="w-1/2"
              />
              <span class="block text-gray-400">~</span>
              <FilterInput
                type="datetime-local"
                v-model="localFilters.endTimeTo"
                placeholder="종료일시"
                class="w-1/2"
              />
            </div>
          </div>

          <div>
            <Label class="text-xs">투입수량</Label>
            <div class="flex items-center gap-1 mt-1">
              <FilterInput
                type="number"
                v-model="localFilters.minTotalQty"
                placeholder="최소"
                class="w-1/2"
              />
              <span class="block text-gray-400">~</span>
              <FilterInput
                type="number"
                v-model="localFilters.maxTotalQty"
                placeholder="최대"
                class="w-1/2"
              />
            </div>
          </div>

          <div>
            <Label class="text-xs">실적수량</Label>
            <div class="flex items-center gap-1 mt-1">
              <FilterInput
                type="number"
                v-model="localFilters.minPerformanceQty"
                placeholder="최소"
                class="w-1/2"
              />
              <span class="block text-gray-400">~</span>
              <FilterInput
                type="number"
                v-model="localFilters.maxPerformanceQty"
                placeholder="최대"
                class="w-1/2"
              />
            </div>
          </div>

          <div>
            <Label class="text-xs">불량률 (%)</Label>
            <div class="flex items-center gap-1 mt-1">
              <FilterInput
                type="number"
                v-model="localFilters.minDefectRate"
                placeholder="최소"
                class="w-1/2"
              />
              <span class="block text-gray-400">~</span>
              <FilterInput
                type="number"
                v-model="localFilters.maxDefectRate"
                placeholder="최대"
                class="w-1/2"
              />
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

const selectedFactoryId = ref(null);
const selectedItemId = ref(null);

const localFilters = reactive({
  // 기간 필드
  documentDateFrom: props.filters.documentDateFrom ?? null,
  documentDateTo: props.filters.documentDateTo ?? null, // 오타 수정 완료

  // 전표/Lot 번호
  productionPlanDocumentNo: props.filters.productionPlanDocumentNo ?? '',
  defectiveDocumentNo: props.filters.defectiveDocumentNo ?? '',
  lotNo: props.filters.lotNo ?? '',

  // 공장/라인 (Name 기준으로 UI 바인딩)
  factoryName: props.filters.factoryName ?? null,
  lineName: props.filters.lineName ?? '',
  itemCode: props.filters.itemCode ?? '',
  itemName: props.filters.itemName ?? '',

  // 담당자
  producerManagerName: props.filters.producerManagerName ?? '',
  salesManagerName: props.filters.salesManagerName ?? '',

  // 시간 기간 필드
  startTimeFrom: props.filters.startTimeFrom ?? null,
  startTimeTo: props.filters.startTimeTo ?? null,
  endTimeFrom: props.filters.endTimeFrom ?? null,
  endTimeTo: props.filters.endTimeTo ?? null, // endTimeFrom/To 추가
  dueDateFrom: props.filters.dueDateFrom ?? null,
  dueDateTo: props.filters.dueDateTo ?? null,

  // 수량/비율 필드
  minTotalQty: props.filters.minTotalQty ?? null,
  maxTotalQty: props.filters.maxTotalQty ?? null,
  minPerformanceQty: props.filters.minPerformanceQty ?? null,
  maxPerformanceQty: props.filters.maxPerformanceQty ?? null,
  minDefectRate: props.filters.minDefectRate ?? null,
  maxDefectRate: props.filters.maxDefectRate ?? null,
});

const { data: factoryList } = useGetFactoryList();
const { data: lineList } = useGetLineList({ factoryId: selectedFactoryId, itemId: selectedItemId });

// --- Computed Options ---

const factoryOptions = computed(() => {
  if (!factoryList.value || !factoryList.value.content)
    return [{ value: null, label: '전체', id: null }];

  return [
    { value: null, label: '전체', id: null },
    ...factoryList.value.content.map(factory => ({
      value: factory.factoryName, // value: Name (드롭다운 선택 값)
      label: factory.factoryName, // label: Name (UI 표시)
      id: factory.factoryId,
    })),
  ];
});

const lineOptions = computed(() => {
  if (!lineList.value || !lineList.value.content) return [{ value: null, label: '전체', id: null }];

  // 공장이 선택되지 않았을 때 (null) 또는 선택되었을 때 모두 라인명으로 표시
  const options = lineList.value.content.map(line => ({
    value: line.lineName, // value: Name (드롭다운 선택 값)
    label: line.lineName, // label: Name (UI 표시)
    id: line.lineId,
    code: line.lineCode, // DTO에 lineCode가 필요하다면 이 값이 전송되어야 함
  }));

  // 라인 이름 중복 제거 로직 (필요시 추가)
  const uniqueOptions = options.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        t => t.value === item.value, // lineName 기준으로 중복 제거
      ),
  );

  return [{ value: null, label: '전체', id: null }, ...uniqueOptions];
});

// --- Functions ---

function onItemSelected(item) {
  selectedItemId.value = item.id;
  localFilters.itemCode = item.itemCode;
  localFilters.itemName = item.itemName;
}

function onItemCleared() {
  selectedItemId.value = null;
  localFilters.itemCode = '';
  localFilters.itemName = '';
}

const setItemCodeFilter = newCode => {
  localFilters.itemCode = newCode;
  localFilters.itemName = '';
  if (!newCode) {
    selectedItemId.value = null;
  }
};

const applyFilters = () => {
  // DTO가 factoryName과 lineName을 받는다면 그대로 전송
  emit('search', { ...localFilters });
};

const resetFilters = () => {
  Object.assign(localFilters, {
    documentDateFrom: null,
    documentDateTo: null,

    productionPlanDocumentNo: '',
    defectiveDocumentNo: '',
    lotNo: '',

    factoryName: null,
    lineName: '',
    salesManagerName: '',
    producerManagerName: '',
    itemCode: '',
    itemName: '',
    startTimeFrom: null,
    startTimeTo: null,
    endTimeFrom: null,
    endTimeTo: null,
    dueDateFrom: null,
    dueDateTo: null,
    minTotalQty: null,
    maxTotalQty: null,
    minPerformanceQty: null,
    maxPerformanceQty: null,
    minDefectRate: null,
    maxDefectRate: null,
  });

  selectedFactoryId.value = null;
  selectedItemId.value = null;

  emit('reset', { ...localFilters });
};

// --- Watchers ---
watch(
  () => localFilters.factoryName,
  newFactoryName => {
    // 공장명에 해당하는 ID를 찾아 selectedFactoryId에 할당하여 라인 리스트 업데이트
    const selectedFactory = factoryOptions.value.find(factory => factory.value === newFactoryName);
    selectedFactoryId.value = selectedFactory ? selectedFactory.id : null;

    // 공장이 변경되었으므로 라인 필터 초기화
    localFilters.lineName = '';
  },
);

watch(
  () => props.filters,
  newVal => {
    Object.assign(localFilters, newVal);
  },
  { deep: true },
);
</script>
