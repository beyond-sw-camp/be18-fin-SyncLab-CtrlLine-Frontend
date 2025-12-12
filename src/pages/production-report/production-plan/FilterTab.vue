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
              :value="localFilters.productionManagerNo"
              :setValue="setProducerManagerFilter"
              :fetchList="
                () =>
                  useGetUserList({
                    userStatus: 'ACTIVE',
                    userDepartment: '생산',
                  })
              "
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

          <FilterSelect label="라인" v-model="localFilters.lineCode" :options="lineOptions" />

          <div>
            <Label class="text-xs">영업 담당자</Label>
            <CreateAutoCompleteSelect
              label="영업 담당자"
              :value="localFilters.salesManagerNo"
              :setValue="setSalesManagerFilter"
              :fetchList="
                () =>
                  useGetUserList({
                    userStatus: 'ACTIVE',
                    userDepartment: '영업',
                  })
              "
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
            <Label class="text-xs">생산 시작 시각 ~ 생산 종료 시각</Label>
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

const localFilters = reactive({
  factoryCode: props.filters.factoryCode ?? null,
  factoryName: props.filters.factoryName ?? null,
  lineCode: props.filters.lineCode ?? '',
  lineName: props.filters.lineName ?? '',
  itemCode: props.filters.itemCode ?? '',
  itemName: props.filters.itemName ?? '',
  productionManagerName: props.filters.productionManagerName ?? '',
  productionManagerNo: props.filters.productionManagerNo ?? '',
  salesManagerName: props.filters.salesManagerName ?? '',
  salesManagerNo: props.filters.salesManagerNo ?? '',
  dueDateFrom: props.filters.dueDateFrom ?? null,
  dueDateTo: props.filters.dueDateTo ?? null,
  startTime: props.filters.startTime ?? null,
  endTime: props.filters.endTime ?? null,
});

function onProducerManagerSelected(manager) {
  localFilters.productionManagerName = manager.userName; // UI 표시용 이름 저장
  localFilters.productionManagerNo = manager.empNo; // DTO 전송용 사번 저장
}

function onProducerManagerCleared() {
  localFilters.productionManagerName = '';
  localFilters.productionManagerNo = '';
}

const setProducerManagerFilter = newName => {
  localFilters.productionManagerName = newName;
  localFilters.productionManagerNo = '';
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
    lineCode: null,
    salesManagerName: '',
    salesManagerNo: '',
    productionManagerName: '',
    productionManagerNo: '',
    itemCode: '',
    dueDateFrom: null,
    dueDateTo: null,
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
