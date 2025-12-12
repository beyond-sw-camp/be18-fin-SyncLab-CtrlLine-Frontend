<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between pb-4">
      <div>
        <h3 class="text-2xl font-semibold text-gray-900">불량 현황</h3>
      </div>

      <div class="flex items-center">
        <Button
          size="sm"
          class="cursor-pointer w-[70px]"
          :disabled="!hasSearched || isLoading || !visibleRecords.length"
          @click="exportCsv"
        >
          Export
        </Button>
      </div>
    </header>

    <Accordion type="single" collapsible class="mt-4">
      <AccordionItem value="defectiveFilters">
        <div class="flex w-fit px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
          <AccordionTrigger class="p-0 hover:no-underline cursor-pointer">
            Filter by
          </AccordionTrigger>
        </div>

        <AccordionContent class="p-4 border-t-2 border-b-2 my-3">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FilterInput label="전표 번호" v-model="filterForm.productionPerformanceDocNo" />
            <FilterInput
              label="시작 일자"
              type="date"
              placeholder="연도. 월. 일."
              v-model="filterForm.fromDate"
            />
            <FilterInput
              label="종료 일자"
              type="date"
              placeholder="연도. 월. 일."
              v-model="filterForm.toDate"
            />
            <FilterInput
              label="납기 일자"
              type="date"
              placeholder="연도. 월. 일."
              v-model="filterForm.dueDate"
            />
            <FilterSelect label="공장" v-model="filterForm.factoryCode" :options="factoryOptions" />
            <FilterSelect label="라인" v-model="filterForm.lineCode" :options="lineOptions" />
            <div class="flex flex-col gap-1">
              <Label class="text-xs">품목</Label>
              <CreateAutoCompleteSelect
                label="품목"
                :value="filterForm.itemCode"
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
            <div class="flex flex-col gap-1">
              <Label class="text-xs">생산 담당자</Label>
              <CreateAutoCompleteSelect
                label="생산 담당자"
                :value="filterForm.productionManagerNo"
                :setValue="setProductionManagerFilter"
                :fetchList="() => useGetUserList({ userStatus: 'ACTIVE', userDepartment: '생산' })"
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
                @selectedFullItem="onProductionManagerSelected"
                @clear="onProductionManagerCleared"
                class="h-7 placeholder:text-xs text-xs"
                inputClass="h-7 text-xs placeholder:text-xs"
                iconClass="!w-3 !h-3"
              />
            </div>
            <div class="flex flex-col gap-1">
              <Label class="text-xs">영업 담당자</Label>
              <CreateAutoCompleteSelect
                label="영업 담당자"
                :value="filterForm.salesManagerNo"
                :setValue="setSalesManagerFilter"
                :fetchList="() => useGetUserList({ userStatus: 'ACTIVE', userDepartment: '영업' })"
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
                  placeholder="최소"
                  v-model="filterForm.minDefectiveRate"
                  class="flex-1 min-w-[160px]"
                />
                <span class="block text-gray-400 w-full lg:w-fit text-center">~</span>
                <FilterInput
                  type="number"
                  placeholder="최대"
                  v-model="filterForm.maxDefectiveRate"
                  class="flex-1 min-w-[160px]"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              size="xs"
              class="text-sm font-normal px-6"
              @click="resetFilters"
            >
              초기화
            </Button>
            <Button
              size="xs"
              class="bg-primary text-white text-sm font-normal px-6"
              :disabled="isApplying"
              @click="applyFilters"
            >
              조회
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <div v-if="chartsVisible" class="grid gap-4 lg:grid-cols-2">
      <Card class="h-[340px]">
        <CardContent class="flex h-full items-center gap-4">
          <div v-if="pieChartData.length" class="h-[260px] w-1/2">
            <ChartContainer :config="pieChartConfig">
              <VisSingleContainer :data="pieChartVisData" :margin="{ top: 24, bottom: 24 }">
                <VisDonut
                  :value="d => d.value"
                  :color="d => pieChartConfig[d.type]?.color || CHART_COLORS[0]"
                  :arc-width="0"
                />
                <ChartTooltip :template="pieTooltipTemplate" />
              </VisSingleContainer>
            </ChartContainer>
          </div>
          <div v-else class="text-sm text-gray-400">표시할 NG 타입 데이터가 없습니다.</div>

          <div class="w-1/2 space-y-3">
            <div
              v-for="(item, index) in pieChartPercentages"
              :key="item.label"
              class="flex items-center justify-between rounded-xl border px-3 py-2 text-sm text-gray-600"
            >
              <div class="flex items-center gap-2">
                <span
                  class="h-3 w-3 rounded-full"
                  :style="{
                    backgroundColor:
                      pieChartConfig[item.label]?.color ||
                      CHART_COLORS[index % CHART_COLORS.length],
                  }"
                ></span>
                <span>{{ formatNgTypeLabel(item.label) }}</span>
              </div>
              <span class="font-semibold text-gray-800">{{ item.percent.toFixed(1) }}%</span>
            </div>
            <p v-if="!pieChartData.length" class="text-sm text-gray-400 text-center">
              데이터가 없습니다.
            </p>
          </div>
        </CardContent>
        <CardFooter class="justify-center text-sm text-gray-500">NG 타입 비율</CardFooter>
      </Card>

      <Card class="h-[340px]">
        <CardContent class="flex h-full flex-col justify-center">
          <div v-if="lineChartData.length" class="h-[260px] w-full">
            <ChartContainer :config="LINE_CHART_CONFIG" cursor>
              <VisXYContainer :data="lineChartData" :margin="{ left: 32, right: 16, bottom: 32 }">
                <VisLine
                  :x="d => d.index"
                  :y="d => d.rate"
                  :color="LINE_CHART_CONFIG.rate.color"
                  :line-width="3"
                />
                <VisAxis
                  type="x"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :tick-format="lineTickFormatter"
                  :tick-values="lineTickValues"
                />
                <VisAxis
                  type="y"
                  :num-ticks="4"
                  :tick-line="false"
                  :domain-line="false"
                  :tick-format="value => `${Number(value ?? 0).toFixed(1)}%`"
                />
                <ChartTooltip />
                <ChartCrosshair :template="lineTooltipTemplate" color="#0000" />
              </VisXYContainer>
            </ChartContainer>
          </div>
          <p v-else class="text-sm text-gray-400">표시할 불량률 데이터가 없습니다.</p>
        </CardContent>
        <CardFooter class="justify-center text-sm text-gray-500">불량률 추이</CardFooter>
      </Card>
    </div>

    <div class="mt-4 overflow-x-auto">
      <Table class="w-full min-w-[920px] table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead
              class="sticky left-0 z-10 min-w-28 bg-white shadow-md text-center whitespace-nowrap overflow-hidden"
            >
              전표번호
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden w-[150px]">
              품목 코드
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden w-[180px]">
              품목명
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 공장 </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden w-[140px]">
              라인
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 불량률 (%)</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              생산 담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">
              영업 담당자
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden"> 비고 </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="!hasSearched">
          <TableRow>
            <TableCell colspan="9" class="text-center py-10 text-sm text-gray-500">
              필터를 설정한 뒤 조회 버튼을 눌러주세요.
            </TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else-if="isLoading">
          <TableRow>
            <TableCell colspan="9" class="text-center py-10 text-sm text-gray-500">
              불량 데이터를 불러오는 중입니다...
            </TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else-if="visibleRecords.length">
          <TableRow
            v-for="record in visibleRecords"
            :key="detailKeyOf(record)"
            class="text-center transition-all border-b border-dotted border-gray-300 hover:bg-gray-50"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis font-medium">
              <button
                class="text-[#2765C4] underline-offset-2 hover:underline"
                @click="goToDefectiveDetail(record)"
              >
                {{ record.productionPerformanceDocNo || record.defectiveDocNo }}
              </button>
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ record.itemCode }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ record.itemName }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ record.factoryName }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ record.lineName }}
            </TableCell>
            <TableCell
              class="py-3 whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-[#5B6D4C]"
            >
              {{ formatPercent(record.defectiveTotalRate) }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ record.productionManagerName }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ record.salesManagerName }}
            </TableCell>
            <TableCell class="py-3 whitespace-pre-wrap whitespace-normal text-gray-600">
              {{ remarksMap[remarkKeyOf(record)] ?? '' }}
            </TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else>
          <TableRow>
            <TableCell colspan="9" class="text-center py-10 text-sm text-gray-400">
              조건에 맞는 불량 데이터가 없습니다.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </section>
</template>

<script setup>
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { VisDonut, VisSingleContainer, VisXYContainer, VisAxis, VisLine } from '@unovis/vue';
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { getDefectiveAll, getDefectiveDetail } from '@/apis/query-functions/defective';
import { getProductionPerformanceList } from '@/apis/query-functions/productionPerformance';
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
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartCrosshair,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { buildQueryObject } from '@/utils/buildQueryObject';

const isApplying = ref(false);
const hasSearched = ref(false);
const router = useRouter();

const filterForm = reactive({
  fromDate: '',
  toDate: '',
  dueDate: '',
  factoryCode: null,
  lineCode: null,
  itemId: '',
  itemCode: '',
  productionManagerNo: '',
  productionManagerName: '',
  salesManagerNo: '',
  salesManagerName: '',
  productionPerformanceDocNo: '',
  minDefectiveRate: '',
  maxDefectiveRate: '',
});

const selectedFactoryId = ref(null);
const selectedItemId = ref(null);

const { data: factoryList } = useGetFactoryList();
const { data: lineList } = useGetLineList({ factoryId: selectedFactoryId, itemId: selectedItemId });

const factoryOptions = computed(() => {
  const entries = factoryList.value?.content ?? [];
  if (!entries.length) {
    return [{ value: null, label: '전체', id: null }];
  }

  return [
    { value: null, label: '전체', id: null },
    ...entries.map(factory => ({
      value: factory.factoryCode,
      label: factory.factoryName,
      id: factory.factoryId,
    })),
  ];
});

const lineOptions = computed(() => {
  const entries = lineList.value?.content ?? [];
  if (!entries.length) return [{ value: null, label: '전체' }];

  const unique = new Map();
  entries.forEach(line => {
    if (!unique.has(line.lineCode)) {
      unique.set(line.lineCode, line);
    }
  });

  return [
    { value: null, label: '전체' },
    ...Array.from(unique.values()).map(line => ({
      value: line.lineCode,
      label: `${line.lineName} (${line.lineCode})`,
    })),
  ];
});

const activeFilters = reactive({
  fromDate: '',
  toDate: '',
  dueDate: '',
  factoryCode: '',
  lineCode: '',
  itemId: '',
  productionManagerNo: '',
  salesManagerNo: '',
  productionPerformanceDocNo: '',
  minDefectiveRate: '',
  maxDefectiveRate: '',
});

const onItemSelected = item => {
  filterForm.itemId = item?.id ?? '';
  filterForm.itemCode = item?.itemCode ? String(item.itemCode) : '';
  selectedItemId.value = item?.id ?? null;
};

const onItemCleared = () => {
  filterForm.itemId = '';
  filterForm.itemCode = '';
  selectedItemId.value = null;
};

const setItemCodeFilter = newCode => {
  filterForm.itemCode = newCode ? String(newCode) : '';
  if (!newCode) {
    filterForm.itemId = '';
    selectedItemId.value = null;
  }
};

const onProductionManagerSelected = manager => {
  filterForm.productionManagerName = manager?.userName ?? '';
  filterForm.productionManagerNo = manager?.empNo ? String(manager.empNo) : '';
};

const onProductionManagerCleared = () => {
  filterForm.productionManagerName = '';
  filterForm.productionManagerNo = '';
};

const setProductionManagerFilter = newValue => {
  filterForm.productionManagerNo = newValue ? String(newValue) : '';
  if (!newValue) {
    filterForm.productionManagerName = '';
  }
};

const onSalesManagerSelected = manager => {
  filterForm.salesManagerName = manager?.userName ?? '';
  filterForm.salesManagerNo = manager?.empNo ? String(manager.empNo) : '';
};

const onSalesManagerCleared = () => {
  filterForm.salesManagerName = '';
  filterForm.salesManagerNo = '';
};

const setSalesManagerFilter = newValue => {
  filterForm.salesManagerNo = newValue ? String(newValue) : '';
  if (!newValue) {
    filterForm.salesManagerName = '';
  }
};

const updateSelectedFactoryId = code => {
  const match = factoryList.value?.content?.find(factory => factory.factoryCode === code);
  selectedFactoryId.value = match?.factoryId ?? null;
};

watch(
  () => filterForm.factoryCode,
  (newCode, oldCode) => {
    updateSelectedFactoryId(newCode);
    if (oldCode !== undefined && newCode !== oldCode) {
      filterForm.lineCode = null;
    }
  },
  { immediate: true },
);

watch(
  factoryList,
  () => {
    updateSelectedFactoryId(filterForm.factoryCode);
  },
  { deep: true },
);

const queryParams = computed(() =>
  buildQueryObject({
    fromDate: activeFilters.fromDate,
    toDate: activeFilters.toDate,
    dueDate: activeFilters.dueDate,
    factoryCode: activeFilters.factoryCode,
    lineCode: activeFilters.lineCode,
    itemId: activeFilters.itemId,
    productionManagerNo: activeFilters.productionManagerNo,
    salesManagerNo: activeFilters.salesManagerNo,
    productionPerformanceDocNo: activeFilters.productionPerformanceDocNo,
    minDefectiveRate: activeFilters.minDefectiveRate,
    maxDefectiveRate: activeFilters.maxDefectiveRate,
  }),
);

const {
  data: defectiveData,
  isFetching,
  refetch,
} = useQuery({
  queryKey: ['defectiveAll', queryParams],
  queryFn: () => getDefectiveAll(queryParams.value),
  enabled: false,
  placeholderData: keepPreviousData,
});

const defectiveRows = computed(() => defectiveData.value ?? []);

const visibleRecords = computed(() => (hasSearched.value ? defectiveRows.value : []));

const isLoading = computed(() => isFetching.value);
const remarksMap = reactive({});
const pendingRemarkFetch = new Set();
const defectiveDetailMap = reactive({});
const pendingDetailFetch = new Set();
const detailKeyOf = record =>
  record.planDefectiveId || record.defectiveDocNo || record.productionPerformanceDocNo;
const detailPlanIdOf = record => record.planDefectiveId;

const remarkKeyOf = record => record.productionPerformanceDocNo || record.defectiveDocNo;

const fetchRemark = async docNo => {
  if (!docNo || remarksMap[docNo] !== undefined || pendingRemarkFetch.has(docNo)) return;

  pendingRemarkFetch.add(docNo);
  try {
    const response = await getProductionPerformanceList({
      defectiveDocumentNo: docNo,
      size: 1,
      page: 0,
    });

    const remark = response?.content?.[0]?.remark ?? '';
    remarksMap[docNo] = remark;
  } catch (error) {
    console.error('Failed to fetch remark for', docNo, error);
    remarksMap[docNo] = '';
  } finally {
    pendingRemarkFetch.delete(docNo);
  }
};

const fetchDefectiveDetail = async record => {
  const detailKey = detailKeyOf(record);
  const planId = detailPlanIdOf(record);

  if (
    !detailKey ||
    !planId ||
    defectiveDetailMap[detailKey] !== undefined ||
    pendingDetailFetch.has(detailKey)
  )
    return;

  pendingDetailFetch.add(detailKey);
  try {
    const detail = await getDefectiveDetail(planId);
    defectiveDetailMap[detailKey] = detail;
  } catch (error) {
    console.error('Failed to fetch defective detail for', planId, error);
    defectiveDetailMap[detailKey] = null;
  } finally {
    pendingDetailFetch.delete(detailKey);
  }
};

watch(
  defectiveRows,
  rows => {
    rows.forEach(row => {
      const key = remarkKeyOf(row);
      if (key) {
        fetchRemark(key);
      }
      if (detailPlanIdOf(row)) {
        fetchDefectiveDetail(row);
      }
    });
  },
  { immediate: true },
);

const sanitizeNumber = value => {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  return Number.isNaN(num) ? '' : num;
};

const sanitizeString = value => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const resetFilters = () => {
  Object.assign(filterForm, {
    fromDate: '',
    toDate: '',
    dueDate: '',
    factoryCode: null,
    lineCode: null,
    itemId: '',
    itemCode: '',
    productionManagerNo: '',
    productionManagerName: '',
    salesManagerNo: '',
    salesManagerName: '',
    productionPerformanceDocNo: '',
    minDefectiveRate: '',
    maxDefectiveRate: '',
  });
  selectedFactoryId.value = null;
  selectedItemId.value = null;
};

const applyFilters = async () => {
  if (isApplying.value) return;

  try {
    isApplying.value = true;

    Object.assign(activeFilters, {
      fromDate: filterForm.fromDate || '',
      toDate: filterForm.toDate || '',
      dueDate: filterForm.dueDate || '',
      factoryCode: sanitizeString(filterForm.factoryCode ?? ''),
      lineCode: sanitizeString(filterForm.lineCode ?? ''),
      itemId: sanitizeNumber(filterForm.itemId),
      productionManagerNo: filterForm.productionManagerNo.trim(),
      salesManagerNo: filterForm.salesManagerNo.trim(),
      productionPerformanceDocNo: filterForm.productionPerformanceDocNo.trim(),
      minDefectiveRate: sanitizeNumber(filterForm.minDefectiveRate),
      maxDefectiveRate: sanitizeNumber(filterForm.maxDefectiveRate),
    });

    hasSearched.value = true;
    await refetch();
  } catch (error) {
    console.error(error);
    toast.error('불량 데이터를 불러오지 못했습니다.');
  } finally {
    isApplying.value = false;
  }
};

const formatPercent = value => {
  if (value === null || value === undefined) return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);

  const display = numeric > 1 ? numeric : numeric * 100; // API가 비율(0~1) 또는 %값 모두 대비
  return `${display.toFixed(1)}`;
};

const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

const exportCsv = () => {
  if (!visibleRecords.value.length) return;

  const tableHeaders = [
    '전표번호',
    '품목 코드',
    '품목명',
    '공장',
    '라인',
    '불량률',
    '생산 담당자',
    '영업 담당자',
    '비고',
  ];
  const tableRows = visibleRecords.value.map(record => [
    record.productionPerformanceDocNo || record.defectiveDocNo,
    record.itemCode,
    record.itemName,
    record.factoryName,
    record.lineName,
    formatPercent(record.defectiveTotalRate),
    record.productionManagerName,
    record.salesManagerName,
    remarksMap[remarkKeyOf(record)] ?? '',
  ]);

  const tableData = [tableHeaders, ...tableRows];
  const pieData = pieChartPercentages.value.length
    ? [['NG 타입', '비율(%)']].concat(
        pieChartPercentages.value.map(item => [
          formatNgTypeLabel(item.label),
          item.percent.toFixed(1),
        ]),
      )
    : [];
  const lineData = lineChartData.value.length
    ? [['기간', '평균 불량률(%)']].concat(
        lineChartData.value.map(entry => [entry.label, Number(entry.rate ?? 0).toFixed(1)]),
      )
    : [];

  const includePie = pieData.length > 0;
  const includeLine = lineData.length > 0;
  const maxRows = Math.max(
    tableData.length,
    includePie ? pieData.length : 0,
    includeLine ? lineData.length : 0,
  );
  const csvRows = [];

  for (let i = 0; i < maxRows; i += 1) {
    const tableRow = tableData[i] ?? new Array(tableHeaders.length).fill('');
    const row = [...tableRow];

    if (includePie) {
      const pieRow = pieData[i] ?? ['', ''];
      row.push('', ...pieRow);
    }

    if (includeLine) {
      const lineRow = lineData[i] ?? ['', ''];
      row.push('', ...lineRow);
    }

    csvRows.push(row);
  }

  const csvContent = csvRows.map(row => row.map(escapeCsv).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `defectives-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const goToDefectiveDetail = record => {
  if (!record) {
    toast.error('불량 정보를 찾을 수 없습니다.');
    return;
  }

  const docNo = record.productionPerformanceDocNo || record.defectiveDocNo;
  const planId = record.planDefectiveId;

  if (!docNo) {
    toast.error('전표번호가 없습니다.');
    return;
  }
  if (!planId) {
    toast.error('불량 상세 ID를 찾을 수 없습니다.');
    return;
  }
  router.push({ name: 'DefectiveDetail', params: { planDefectiveId: planId } });
};

const CHART_COLORS = ['#5B6D4C', '#7F9C7A', '#AFC49A', '#D7E0C7', '#F1F3EA', '#94A57B'];

const chartRecords = computed(() => (hasSearched.value ? defectiveRows.value : []));

const pieChartData = computed(() => {
  if (!chartRecords.value.length) return [];
  const counts = {};

  chartRecords.value.forEach(record => {
    const detail = defectiveDetailMap[detailKeyOf(record)];
    const entries = Array.isArray(detail?.defectives) ? detail.defectives : [];

    if (!entries.length) return;

    entries.forEach(entry => {
      const type = entry?.defectiveType || entry?.defectiveName || '기타';
      const qty = Number(entry?.defectiveQty ?? 0);
      if (Number.isNaN(qty) || qty <= 0) return;
      counts[type] = (counts[type] || 0) + qty;
    });
  });

  return Object.entries(counts).map(([label, value], index) => ({
    label,
    value,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
});

const pieChartConfig = computed(() => {
  if (!pieChartData.value.length) {
    return { default: { label: '데이터 없음', color: CHART_COLORS[0] } };
  }
  return pieChartData.value.reduce((acc, item) => {
    acc[item.label] = { label: item.label, color: item.color };
    return acc;
  }, {});
});

const pieChartVisData = computed(() =>
  pieChartData.value.map(item => ({ type: item.label, value: item.value })),
);

const pieTooltipTemplate = computed(() =>
  componentToString(pieChartConfig.value, ChartTooltipContent, {
    hideLabel: false,
    valueFormatter: value => `${Number(value ?? 0).toFixed(1)}건`,
  }),
);

const pieChartPercentages = computed(() => {
  const total = pieChartData.value.reduce((sum, item) => sum + item.value, 0);
  if (!total) return [];
  return pieChartData.value.map(item => ({
    label: item.label,
    percent: (item.value / total) * 100,
  }));
});

const formatNgTypeLabel = type => {
  const text = String(type ?? '').trim();
  if (!text) return 'NG Type 미확인';
  return /^ng\s*type/i.test(text) ? text : `NG Type ${text}`;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getISOWeekInfo = date => {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp - yearStart) / MS_PER_DAY + 1) / 7);

  const start = new Date(tmp);
  const startDay = start.getUTCDay() || 7;
  start.setUTCDate(tmp.getUTCDate() - startDay + 1);
  return { year: tmp.getUTCFullYear(), week, start: new Date(start.getTime()) };
};

const getBucketKey = (date, mode) => {
  if (mode === 'day') {
    return {
      key: date.toISOString().slice(0, 10),
      label: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
      sortKey: date.getTime(),
    };
  }
  if (mode === 'week') {
    const info = getISOWeekInfo(date);
    const label = `${String(info.week).padStart(2, '0')}주`;
    return {
      key: `${info.year}-W${String(info.week).padStart(2, '0')}`,
      label,
      sortKey: info.start.getTime(),
    };
  }
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const label = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  return { key: label, label, sortKey: first.getTime() };
};

const normalizeRate = rate => {
  const value = Number(rate ?? 0);
  if (Number.isNaN(value)) return 0;
  return value <= 1 ? value * 100 : value;
};

const parseRecordDate = record => {
  const raw = record.createdAt || record.dueDate;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const lineChartData = computed(() => {
  if (!chartRecords.value.length) return [];
  const entries = chartRecords.value
    .map(record => ({
      date: parseRecordDate(record),
      rate: normalizeRate(record.defectiveTotalRate),
    }))
    .filter(entry => entry.date);

  if (!entries.length) return [];

  entries.sort((a, b) => a.date - b.date);

  const min = entries[0].date;
  const max = entries[entries.length - 1].date;
  const spanDays = Math.max(1, Math.round((max - min) / MS_PER_DAY) + 1);

  const mode = spanDays <= 7 ? 'day' : spanDays <= 42 ? 'week' : 'month';

  const buckets = new Map();
  entries.forEach(entry => {
    const keyInfo = getBucketKey(entry.date, mode);
    const bucket = buckets.get(keyInfo.key) || { ...keyInfo, sum: 0, count: 0 };
    bucket.sum += entry.rate;
    bucket.count += 1;
    buckets.set(keyInfo.key, bucket);
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((bucket, index) => ({
      index,
      label: bucket.label,
      rate: bucket.count ? bucket.sum / bucket.count : 0,
    }));
});

const lineTickValues = computed(() => lineChartData.value.map(item => item.index));

const lineTickFormatter = value => {
  const target = lineChartData.value.find(entry => entry.index === value);
  return target?.label ?? '';
};

const LINE_CHART_CONFIG = {
  rate: { label: '불량률', color: 'var(--chart-1)' },
};

const lineTooltipTemplate = componentToString(LINE_CHART_CONFIG, ChartTooltipContent, {
  hideLabel: true,
  valueFormatter: value => `${Number(value ?? 0).toFixed(1)}%`,
});

const chartsVisible = computed(() => hasSearched.value && chartRecords.value.length > 0);
</script>

<style scoped>
.filter-input {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: #f7f8f9;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #374151;
}

.filter-input:focus {
  border-color: #5b6d4c;
  background-color: #ffffff;
  outline: none;
}
</style>
