<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h3 class="text-2xl font-semibold text-gray-900">불량 현황</h3>
      </div>

      <div class="flex items-center">
        <Button
          class="rounded-full bg-[#5B6D4C] px-6 py-2 text-white hover:bg-[#4C5C3F]"
          :disabled="!hasSearched || isLoading || !visibleRecords.length"
          @click="exportCsv"
        >
          Export
        </Button>
      </div>
    </header>

    <Dialog v-model:open="isFilterOpen">
      <DialogTrigger as-child>
        <button
          class="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-200"
        >
          Filter by
          <ChevronDown class="size-4" />
        </button>
      </DialogTrigger>

      <DialogContent class="w-full max-w-[1040px] sm:max-w-[1040px] rounded-3xl border border-gray-300 p-8 shadow-xl">
        <DialogHeader class="flex items-center justify-between p-0">
          <DialogTitle class="text-lg font-semibold text-gray-800">필터 설정</DialogTitle>
        </DialogHeader>

        <div class="mt-4 space-y-5">
          <div class="space-y-3">
            <div class="filter-line">
              <span class="filter-chip">시작 일자</span>
              <input
                v-model="filterForm.fromDate"
                type="date"
                class="filter-input flex-1 min-w-[220px]"
                placeholder="연도. 월. 일."
              />
            </div>

            <div class="filter-line">
              <span class="filter-chip">종료 일자</span>
              <input
                v-model="filterForm.toDate"
                type="date"
                class="filter-input flex-1 min-w-[220px]"
                placeholder="연도. 월. 일."
              />
            </div>

            <div class="filter-line">
              <span class="filter-chip">납기 일자</span>
              <input
                v-model="filterForm.dueDate"
                type="date"
                class="filter-input flex-1 min-w-[220px]"
                placeholder="연도. 월. 일."
              />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div class="filter-grid-item">
              <span class="filter-chip">생산 공장</span>
              <div class="relative flex-1">
                <Search class="filter-icon" />
                <input
                  v-model="filterForm.factoryCode"
                  placeholder="공장 코드 검색"
                  class="filter-input filter-input--icon w-full"
                  type="text"
                />
              </div>
            </div>

            <div class="filter-grid-item">
              <span class="filter-chip">생산 라인</span>
              <div class="relative flex-1">
                <Search class="filter-icon" />
                <input
                  v-model="filterForm.lineCode"
                  placeholder="라인 코드 검색"
                  class="filter-input filter-input--icon w-full"
                  type="text"
                />
              </div>
            </div>

            <div class="filter-grid-item">
              <span class="filter-chip">품목 ID</span>
              <div class="relative flex-1">
                <Search class="filter-icon" />
                <input
                  v-model="filterForm.itemId"
                  placeholder="품목 ID 또는 코드"
                  class="filter-input filter-input--icon w-full"
                  type="text"
                />
              </div>
            </div>

            <div class="filter-grid-item">
              <span class="filter-chip">생산 담당자</span>
              <div class="relative flex-1">
                <Search class="filter-icon" />
                <input
                  v-model="filterForm.productionManagerNo"
                  placeholder="사번 검색"
                  class="filter-input filter-input--icon w-full"
                  type="text"
                />
              </div>
            </div>

            <div class="filter-grid-item">
              <span class="filter-chip">영업 담당자</span>
              <div class="relative flex-1">
                <Search class="filter-icon" />
                <input
                  v-model="filterForm.salesManagerNo"
                  placeholder="사번 검색"
                  class="filter-input filter-input--icon w-full"
                  type="text"
                />
              </div>
            </div>

            <div class="filter-grid-item">
              <span class="filter-chip">전표 번호</span>
              <div class="relative flex-1">
                <Search class="filter-icon" />
                <input
                  v-model="filterForm.productionPerformanceDocNo"
                  placeholder="전표 번호"
                  class="filter-input filter-input--icon w-full"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="mt-6 flex justify-end gap-2">
          <Button variant="outline" class="rounded-full px-6" @click="resetFilters">초기화</Button>
          <Button
            class="rounded-full bg-[#5B6D4C] px-6 py-2 text-white hover:bg-[#4C5C3F]"
            :disabled="isApplying"
            @click="applyFilters"
          >
            조회
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
                  :style="{ backgroundColor: pieChartConfig[item.label]?.color || CHART_COLORS[index % CHART_COLORS.length] }"
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

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-gray-500">
          총 <span class="font-semibold text-gray-900">{{ visibleRecords.length }}</span
          >건
        </p>
        <div class="relative w-full sm:w-64">
          <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="tableSearch"
            placeholder="전표, 품목, 공장 검색"
            class="filter-input filter-input--icon w-full"
            type="text"
          />
        </div>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="w-full min-w-[920px] table-fixed">
          <thead class="text-sm font-semibold text-gray-600">
            <tr class="border-b border-gray-200">
              <th class="px-4 py-3 text-center w-[160px]">전표번호</th>
              <th class="px-4 py-3 text-center w-[150px]">품목 코드</th>
              <th class="px-4 py-3 text-center w-[180px]">품목명</th>
              <th class="px-4 py-3 text-center">공장</th>
              <th class="px-4 py-3 text-center w-[140px]">라인</th>
              <th class="px-4 py-3 text-center">불량률</th>
              <th class="px-4 py-3 text-center">생산 담당자</th>
              <th class="px-4 py-3 text-center">영업 담당자</th>
              <th class="px-4 py-3 text-center">비고</th>
            </tr>
          </thead>

          <tbody v-if="!hasSearched">
            <tr>
              <td class="px-4 py-10 text-center text-sm text-gray-400" colspan="9">
                필터를 설정한 뒤 조회 버튼을 눌러주세요.
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="isLoading">
            <tr>
              <td class="px-4 py-10 text-center text-sm text-gray-500" colspan="9">
                불량 데이터를 불러오는 중입니다...
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="visibleRecords.length">
            <tr
              v-for="record in visibleRecords"
              :key="detailKeyOf(record)"
              class="border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-center font-medium">
                <button
                  class="text-[#2765C4] underline-offset-2 hover:underline"
                  @click="goToDefectiveDetail(record.defectiveDocNo || record.productionPerformanceDocNo)"
                >
                  {{ record.productionPerformanceDocNo || record.defectiveDocNo }}
                </button>
              </td>
              <td class="px-4 py-3 text-center">{{ record.itemCode }}</td>
              <td class="px-4 py-3 text-center">{{ record.itemName }}</td>
              <td class="px-4 py-3 text-center">{{ record.factoryName }}</td>
              <td class="px-4 py-3 text-center">{{ record.lineName }}</td>
              <td class="px-4 py-3 text-center font-semibold text-[#5B6D4C]">
                {{ formatPercent(record.defectiveTotalRate) }}
              </td>
              <td class="px-4 py-3 text-center">{{ record.productionManagerName }}</td>
              <td class="px-4 py-3 text-center">{{ record.salesManagerName }}</td>
              <td class="px-4 py-3 whitespace-pre-wrap text-center text-gray-600">
                {{ remarksMap[remarkKeyOf(record)] ?? '' }}
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td class="px-4 py-10 text-center text-sm text-gray-400" colspan="9">
                조건에 맞는 불량 데이터가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { VisDonut, VisSingleContainer, VisXYContainer, VisAxis, VisLine } from '@unovis/vue';
import { ChevronDown, Search } from 'lucide-vue-next';
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { getDefectiveAll, getDefectiveDetail } from '@/apis/query-functions/defective';
import { getProductionPerformanceList } from '@/apis/query-functions/productionPerformance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartCrosshair,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { buildQueryObject } from '@/utils/buildQueryObject';

const isFilterOpen = ref(false);
const isApplying = ref(false);
const hasSearched = ref(false);
const router = useRouter();

const filterForm = reactive({
  fromDate: '',
  toDate: '',
  dueDate: '',
  factoryCode: '',
  lineCode: '',
  itemId: '',
  productionManagerNo: '',
  salesManagerNo: '',
  productionPerformanceDocNo: '',
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
});

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
const tableSearch = ref('');

const visibleRecords = computed(() => {
  if (!hasSearched.value) return [];
  const keyword = tableSearch.value.trim().toLowerCase();
  if (!keyword) return defectiveRows.value;

  return defectiveRows.value.filter(record => {
    const candidates = [
      record.productionPerformanceDocNo,
      record.defectiveDocNo,
      record.itemCode,
      record.itemName,
      record.factoryName,
      record.lineName,
    ]
      .filter(Boolean)
      .map(value => String(value).toLowerCase());

    return candidates.some(value => value.includes(keyword));
  });
});

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
  if (!value) return '';
  const num = Number(value);
  return Number.isNaN(num) ? '' : num;
};

const resetFilters = () => {
  Object.assign(filterForm, {
    fromDate: '',
    toDate: '',
    dueDate: '',
    factoryCode: '',
    lineCode: '',
    itemId: '',
    productionManagerNo: '',
    salesManagerNo: '',
    productionPerformanceDocNo: '',
  });
};

const applyFilters = async () => {
  if (isApplying.value) return;

  try {
    isApplying.value = true;

    Object.assign(activeFilters, {
      fromDate: filterForm.fromDate || '',
      toDate: filterForm.toDate || '',
      dueDate: filterForm.dueDate || '',
      factoryCode: filterForm.factoryCode.trim(),
      lineCode: filterForm.lineCode.trim(),
      itemId: sanitizeNumber(filterForm.itemId),
      productionManagerNo: filterForm.productionManagerNo.trim(),
      salesManagerNo: filterForm.salesManagerNo.trim(),
      productionPerformanceDocNo: filterForm.productionPerformanceDocNo.trim(),
    });

    hasSearched.value = true;
    await refetch();
    isFilterOpen.value = false;
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

  const display =
    numeric > 1 ? numeric : numeric * 100; // API가 비율(0~1) 또는 %값 모두 대비
  return `${display.toFixed(1)}%`;
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
        lineChartData.value.map(entry => [
          entry.label,
          Number(entry.rate ?? 0).toFixed(1),
        ]),
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

const goToDefectiveDetail = docNo => {
  if (!docNo) {
    toast.error('전표번호가 없습니다.');
    return;
  }
  router.push(`/production-management/defectives/${docNo}`);
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
    .map(record => ({ date: parseRecordDate(record), rate: normalizeRate(record.defectiveTotalRate) }))
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
.filter-line {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-chip {
  flex-shrink: 0;
  border-radius: 999px;
  background-color: #5b6d4c;
  padding: 0.5rem 0.9rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  min-width: 96px;
}

.filter-grid-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 0.75rem;
  background-color: #fbfbfb;
}

.filter-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

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

.filter-input--icon {
  padding-left: 2.5rem;
}
</style>
