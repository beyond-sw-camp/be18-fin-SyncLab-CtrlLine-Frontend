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

      <DialogContent class="max-w-[1040px] rounded-3xl border border-gray-300 p-8 shadow-xl">
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
        <table class="w-full min-w-[720px] table-fixed">
          <thead class="text-sm font-semibold text-gray-600">
            <tr class="border-b border-gray-200">
              <th class="px-4 py-3 text-left">전표번호</th>
              <th class="px-4 py-3 text-left">품목 코드</th>
              <th class="px-4 py-3 text-left">품목명</th>
              <th class="px-4 py-3 text-left">공장</th>
              <th class="px-4 py-3 text-left">라인</th>
              <th class="px-4 py-3 text-right">불량률</th>
              <th class="px-4 py-3 text-left">생산 담당자</th>
              <th class="px-4 py-3 text-left">영업 담당자</th>
            </tr>
          </thead>

          <tbody v-if="!hasSearched">
            <tr>
              <td class="px-4 py-10 text-center text-sm text-gray-400" colspan="8">
                필터를 설정한 뒤 조회 버튼을 눌러주세요.
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="isLoading">
            <tr>
              <td class="px-4 py-10 text-center text-sm text-gray-500" colspan="8">
                불량 데이터를 불러오는 중입니다...
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="visibleRecords.length">
            <tr
              v-for="record in visibleRecords"
              :key="record.planDefectiveId"
              class="border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50"
            >
              <td class="px-4 py-3 font-medium text-[#2765C4]">
                {{ record.productionPerformanceDocNo || record.defectiveDocNo }}
              </td>
              <td class="px-4 py-3">{{ record.itemCode }}</td>
              <td class="px-4 py-3">{{ record.itemName }}</td>
              <td class="px-4 py-3">{{ record.factoryName }}</td>
              <td class="px-4 py-3">{{ record.lineName }}</td>
              <td class="px-4 py-3 text-right font-semibold text-[#5B6D4C]">
                {{ formatPercent(record.defectiveTotalRate) }}
              </td>
              <td class="px-4 py-3">{{ record.productionManagerName }}</td>
              <td class="px-4 py-3">{{ record.salesManagerName }}</td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td class="px-4 py-10 text-center text-sm text-gray-400" colspan="8">
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
import { ChevronDown, Search } from 'lucide-vue-next';
import { computed, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';

import { getDefectiveAll } from '@/apis/query-functions/defective';
import { Button } from '@/components/ui/button';
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

  const headers = ['전표번호', '품목 코드', '품목명', '공장', '라인', '불량률', '생산 담당자', '영업 담당자'];
  const rows = visibleRecords.value.map(record => [
    record.productionPerformanceDocNo || record.defectiveDocNo,
    record.itemCode,
    record.itemName,
    record.factoryName,
    record.lineName,
    formatPercent(record.defectiveTotalRate),
    record.productionManagerName,
    record.salesManagerName,
  ]);

  const csvContent = [headers.map(escapeCsv).join(',')]
    .concat(rows.map(row => row.map(escapeCsv).join(',')))
    .join('\n');

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
