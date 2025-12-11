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

          <FilterInput label="생산계획 전표번호" v-model="localFilters.productionPlanDocumentNo" />

          <FilterInput label="Lot No." v-model="localFilters.lotNo" />

          <FilterSelect label="공장" v-model="localFilters.factoryName" :options="factoryOptions" />

          <FilterSelect label="라인" v-model="localFilters.lineName" :options="lineOptions" />

          <FilterInput label="불량 전표번호" v-model="localFilters.defectiveDocumentNo" />

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
            <Label class="text-xs">생산 담당자</Label>
            <CreateAutoCompleteSelect
              label="생산 담당자"
              :value="localFilters.producerManagerNo"
              :setValue="setProducerManagerFilter"
              :fetchList="() => useGetUserList({ userStatus: 'ACTIVE' })"
              keyField="empNo"
              nameField="userName"
              :fields="[
                'empNo',
                'userName',
                'userEmail',
                'userDepartment',
                'userPhoneNumber',
                'userStatus',
                'userRole',
              ]"
              :tableHeaders="['사번', '사원명', '이메일', '부서', '연락처', '상태', '권한']"
              :emitFullItem="true"
              @selectedFullItem="onProducerManagerSelected"
              @clear="onProducerManagerCleared"
              class="h-7 placeholder:text-xs text-xs"
              inputClass="h-7 text-xs placeholder:text-xs"
              iconClass="!w-3 !h-3"
            />
          </div>

          <div>
            <Label class="text-xs">생산 시작 시각</Label>
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
            <Label class="text-xs">영업 담당자</Label>
            <CreateAutoCompleteSelect
              label="영업 담당자"
              :value="localFilters.salesManagerNo"
              :setValue="setSalesManagerFilter"
              :fetchList="() => useGetUserList({ userStatus: 'ACTIVE' })"
              keyField="empNo"
              nameField="userName"
              :fields="[
                'empNo',
                'userName',
                'userEmail',
                'userDepartment',
                'userPhoneNumber',
                'userStatus',
                'userRole',
              ]"
              :tableHeaders="['사번', '사원명', '이메일', '부서', '연락처', '상태', '권한']"
              :emitFullItem="true"
              @selectedFullItem="onSalesManagerSelected"
              @clear="onSalesManagerCleared"
              class="h-7 placeholder:text-xs text-xs"
              inputClass="h-7 text-xs placeholder:text-xs"
              iconClass="!w-3 !h-3"
            />
          </div>

          <div>
            <Label class="text-xs">생산 종료 시각</Label>
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
            <Label class="text-xs">투입 수량</Label>
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
            <Label class="text-xs">실적 수량</Label>
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
import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
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
  documentDateTo: props.filters.documentDateTo ?? null,

  // 전표/Lot 번호
  productionPlanDocumentNo: props.filters.productionPlanDocumentNo ?? '',
  defectiveDocumentNo: props.filters.defectiveDocumentNo ?? '',
  lotNo: props.filters.lotNo ?? '',

  // 공장/라인/품목
  factoryName: props.filters.factoryName ?? null,
  lineName: props.filters.lineName ?? '',
  itemCode: props.filters.itemCode ?? '',
  itemName: props.filters.itemName ?? '',

  // 담당자
  producerManagerName: props.filters.producerManagerName ?? '',
  producerManagerNo: props.filters.producerManagerNo ?? '',
  salesManagerName: props.filters.salesManagerName ?? '',
  salesManagerNo: props.filters.salesManagerNo ?? '',

  // 시간 기간 필드
  startTimeFrom: props.filters.startTimeFrom ?? null,
  startTimeTo: props.filters.startTimeTo ?? null,
  endTimeFrom: props.filters.endTimeFrom ?? null,
  endTimeTo: props.filters.endTimeTo ?? null,
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

// --- Computed Options (변경 없음) ---

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
  if (!lineList.value || !lineList.value.content) return [{ value: null, label: '전체', id: null }];

  const options = lineList.value.content.map(line => ({
    value: line.lineName,
    label: line.lineName,
    id: line.lineId,
    code: line.lineCode,
  }));

  const uniqueOptions = options.filter(
    (item, index, self) => index === self.findIndex(t => t.value === item.value),
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

function onProducerManagerSelected(manager) {
  localFilters.producerManagerName = manager.userName; // UI 표시용 이름 저장
  localFilters.producerManagerNo = manager.empNo; // DTO 전송용 사번 저장
}

function onProducerManagerCleared() {
  localFilters.producerManagerName = '';
  localFilters.producerManagerNo = '';
}

const setProducerManagerFilter = newName => {
  localFilters.producerManagerName = newName;
  localFilters.producerManagerNo = '';
};

// 영업 담당자 관련 함수 (변경 없음)
function onSalesManagerSelected(manager) {
  localFilters.salesManagerName = manager.userName;
  localFilters.salesManagerNo = manager.empNo;
}

function onSalesManagerCleared() {
  localFilters.salesManagerName = '';
  localFilters.salesManagerNo = '';
}

const setSalesManagerFilter = newName => {
  localFilters.salesManagerName = newName;
  localFilters.salesManagerNo = '';
};

const applyFilters = () => {
  const filtersToSend = {
    ...localFilters,
    salesManagerName: undefined,
    producerManagerName: undefined,
  };

  const finalFilters = Object.fromEntries(
    Object.entries(filtersToSend).filter(
      ([value]) => value !== undefined && value !== null && value !== '',
    ),
  );

  emit('search', finalFilters);
};

const resetFilters = () => {
  Object.assign(localFilters, {
    documentDateFrom: null,
    documentDateTo: null,

    productionPlanDocumentNo: '',
    defectiveDocumentNo: '',
    lotNo: '',

    salesManagerName: '',
    salesManagerNo: '',
    producerManagerName: '',
    producerManagerNo: '',

    factoryName: null,
    lineName: '',
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

  emit('search', { ...localFilters });
};

watch(
  () => localFilters.factoryName,
  newFactoryName => {
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
