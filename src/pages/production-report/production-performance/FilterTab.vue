<template>
  <Accordion type="single" collapsible>
    <AccordionItem value="filters">
      <div class="flex w-fit px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
        <AccordionTrigger class="p-0 hover:no-underline cursor-pointer">Filter by</AccordionTrigger>
      </div>

      <AccordionContent class="p-4 border-b-2 border-t-2 my-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilterInput label="전표번호" v-model="localFilters.documentNo" />

          <FilterInput label="생산 계획번호" v-model="localFilters.productionPlanDocumentNo" />

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
            <Label class="text-xs">실적수량</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="number"
                v-model="localFilters.minPerformanceQty"
                placeholder="최소"
                class="flex-1 min-w-[180px]"
              />
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <FilterInput
                type="number"
                v-model="localFilters.maxPerformanceQty"
                placeholder="최대"
                class="flex-1 min-w-[180px]"
              />
            </div>
          </div>

          <div>
            <Label class="text-xs">생산 담당자</Label>
            <CreateAutoCompleteSelect
              label="생산 담당자"
              :value="localFilters.productionManagerEmpNo"
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
            <Label class="text-xs">영업 담당자</Label>
            <CreateAutoCompleteSelect
              label="영업 담당자"
              :value="localFilters.salesManagerEmpNo"
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
            <Label class="text-xs">불량률 (%)</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="number"
                v-model="localFilters.minDefectiveRate"
                placeholder="최소"
                class="flex-1 min-w-[180px]"
              />
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <FilterInput
                type="number"
                v-model="localFilters.maxDefectiveRate"
                placeholder="최대"
                class="flex-1 min-w-[180px]"
              />
            </div>
          </div>

          <div>
            <Label class="text-xs">생산 시작 시간</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="datetime-local"
                v-model="localFilters.startDateTimeStart"
                class="flex-1 min-w-[180px]"
                placeholder="From"
              />
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <FilterInput
                type="datetime-local"
                v-model="localFilters.startDateTimeEnd"
                class="flex-1 min-w-[180px]"
                placeholder="To"
              />
            </div>
          </div>

          <div>
            <Label class="text-xs">생산 종료 시간</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <FilterInput
                type="datetime-local"
                v-model="localFilters.endDateTimeStart"
                class="flex-1 min-w-[180px]"
                placeholder="From"
              />
              <span class="block text-gray-400 w-full lg:w-fit">~</span>
              <FilterInput
                type="datetime-local"
                v-model="localFilters.endDateTimeEnd"
                class="flex-1 min-w-[180px]"
                placeholder="To"
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
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const props = defineProps({
  filters: { type: Object, required: true },
});

const emit = defineEmits(['search', 'reset']);

function onProducerManagerSelected(manager) {
  localFilters.productionManagerName = manager.userName; // UI 표시용 이름 저장
  localFilters.productionManagerEmpNo = manager.empNo; // DTO 전송용 사번 저장
}

function onProducerManagerCleared() {
  localFilters.productionManagerName = '';
  localFilters.productionManagerEmpNo = '';
}

const setProducerManagerFilter = newName => {
  localFilters.productionManagerName = newName;
  localFilters.productionManagerEmpNo = '';
};

// 영업 담당자 관련 함수 (변경 없음)
function onSalesManagerSelected(manager) {
  localFilters.salesManagerName = manager.userName;
  localFilters.salesManagerEmpNo = manager.empNo;
}

function onSalesManagerCleared() {
  localFilters.salesManagerName = '';
  localFilters.salesManagerEmpNo = '';
}

const setSalesManagerFilter = newName => {
  localFilters.salesManagerName = newName;
  localFilters.salesManagerEmpNo = '';
};

const localFilters = reactive({
  factoryCode: props.filters.factoryCode ?? null,
  lineCode: props.filters.lineCode ?? null,
  documentNo: props.filters.documentNo ?? '',
  productionPlanDocumentNo: props.filters.productionPlanDocumentNo ?? '',
  itemCode: props.filters.itemCode ?? '',

  productionManagerEmpNo: props.filters.productionManagerEmpNo ?? '',
  productionManagerName: props.filters.productionManagerName ?? '',
  salesManagerEmpNo: props.filters.salesManagerEmpNo ?? '',
  salesManagerName: props.filters.salesManagerName ?? '',

  minPerformanceQty: props.filters.minPerformanceQty ?? null,
  maxPerformanceQty: props.filters.maxPerformanceQty ?? null,
  minDefectiveRate: props.filters.minDefectiveRate ?? null,
  maxDefectiveRate: props.filters.maxDefectiveRate ?? null,

  startDateTimeStart: props.filters.startDateTimeStart ?? null,
  startDateTimeEnd: props.filters.startDateTimeEnd ?? null,
  endDateTimeStart: props.filters.endDateTimeStart ?? null,
  endDateTimeEnd: props.filters.endDateTimeEnd ?? null,
});

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

const normalizeNumber = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
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

const applyFilters = () => {
  const startFrom = localFilters.startDateTimeStart;
  const startTo = localFilters.startDateTimeEnd;
  const endFrom = localFilters.endDateTimeStart;
  const endTo = localFilters.endDateTimeEnd;

  emit('search', {
    factoryCode: localFilters.factoryCode,
    lineCode: localFilters.lineCode,
    documentNo: localFilters.documentNo,
    productionPlanDocumentNo: localFilters.productionPlanDocumentNo,
    itemCode: localFilters.itemCode,

    productionManagerEmpNo: localFilters.productionManagerEmpNo,
    productionManagerName: localFilters.productionManagerName,
    salesManagerEmpNo: localFilters.salesManagerEmpNo,
    salesManagerName: localFilters.salesManagerName,

    minPerformanceQty: normalizeNumber(localFilters.minPerformanceQty),
    maxPerformanceQty: normalizeNumber(localFilters.maxPerformanceQty),
    minDefectiveRate: normalizeNumber(localFilters.minDefectiveRate),
    maxDefectiveRate: normalizeNumber(localFilters.maxDefectiveRate),

    startDateTimeStart: startFrom,
    startDateTimeEnd: startTo,
    endDateTimeStart: endFrom,
    endDateTimeEnd: endTo,
  });
};

const resetFilters = () => {
  Object.assign(localFilters, {
    factoryCode: null,
    lineCode: null,
    documentNo: '',
    productionPlanDocumentNo: '',
    itemCode: '',

    productionManagerEmpNo: '',
    productionManagerName: '',
    salesManagerEmpNo: '',
    salesManagerName: '',

    minPerformanceQty: null,
    maxPerformanceQty: null,
    minDefectiveRate: null,
    maxDefectiveRate: null,

    startDateTimeStart: null,
    startDateTimeEnd: null,
    endDateTimeStart: null,
    endDateTimeEnd: null,
  });

  selectedFactoryId.value = null;
  selectedItemId.value = null;

  emit('reset', {
    factoryCode: null,
    lineCode: null,
    documentNo: '',
    productionPlanDocumentNo: '',
    itemCode: '',
    productionManagerEmpNo: '',
    productionManagerName: '',
    salesManagerEmpNo: '',
    salesManagerName: '',
    minPerformanceQty: null,
    maxPerformanceQty: null,
    minDefectiveRate: null,
    maxDefectiveRate: null,

    startDateTimeStart: null,
    startDateTimeEnd: null,
    endDateTimeStart: null,
    endDateTimeEnd: null,
  });
};

const assignFilters = newFilters => {
  const managerName = newFilters.productionManagerEmpNo ?? newFilters.productionManagerName ?? '';
  const salesName = newFilters.salesManagerEmpNo ?? newFilters.salesManagerName ?? '';

  Object.assign(localFilters, {
    ...newFilters,
    productionManagerEmpNo: managerName,
    productionManagerName: newFilters.productionManagerName ?? managerName ?? '',
    salesManagerEmpNo: salesName,
    salesManagerName: newFilters.salesManagerName ?? salesName ?? '',
  });
};

watch(
  () => props.filters,
  newFilters => {
    assignFilters(newFilters);
  },
  { deep: true },
);

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

<style scoped></style>
