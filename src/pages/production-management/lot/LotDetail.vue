<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Lot No. 상세</h3>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="goBack">뒤로가기</Button>
      </div>
    </div>

    <div v-if="isPending" class="border rounded-lg p-6 text-center text-sm text-muted-foreground">
      로드 중입니다...
    </div>

    <div v-else-if="lotDetail" class="flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <h4 class="text-lg font-semibold">기본 정보</h4>
        <div class="grid gap-4 md:grid-cols-3">
          <div v-for="field in basicFields" :key="field.label" class="flex flex-col gap-2">
            <span class="text-xs text-muted-foreground tracking-wide">{{ field.label }}</span>
            <div
              class="rounded-lg border bg-muted/15 px-4 py-3 text-base font-medium break-words"
              :class="field.isStatus ? field.statusWrapperClass : ''"
            >
              {{ displayValue(field.value) }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <h4 class="text-lg font-semibold">품목 및 수량</h4>
        <div class="grid gap-4 md:grid-cols-3">
          <div v-for="field in quantityFields" :key="field.label" class="flex flex-col gap-2">
            <span class="text-xs text-muted-foreground tracking-wide">{{ field.label }}</span>
            <div class="rounded-lg border bg-muted/15 px-4 py-3 text-base font-medium break-words">
              {{ displayValue(field.value) }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <Button variant="outline" class="w-fit" @click="viewSerialNumbers">
          {{ showSerials ? '시리얼 번호 닫기' : '시리얼 번호 조회' }}
        </Button>
      </div>

      <section v-if="showSerials" class="border rounded-lg p-6">
        <h4 class="text-lg font-semibold mb-4">시리얼 번호</h4>
        <div v-if="isSerialLoading" class="text-sm text-muted-foreground">조회 중입니다...</div>
        <div v-else-if="hasSerialError" class="text-sm text-red-500">
          시리얼 번호를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.
        </div>
        <div v-else-if="serialNumbers.length === 0" class="text-sm text-muted-foreground">
          등록된 시리얼 번호가 없습니다.
        </div>
        <div v-else class="max-h-72 overflow-auto border rounded">
          <Table class="w-full">
            <TableHeader>
              <TableRow>
                <TableHead class="w-20 text-center">No.</TableHead>
                <TableHead>시리얼 번호</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(serial, index) in serialNumbers" :key="`${serial}-${index}`">
                <TableCell class="text-center font-medium">{{ index + 1 }}</TableCell>
                <TableCell class="font-mono text-sm">{{ serial }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>

    <div v-else class="border rounded-lg p-6 text-center text-sm text-muted-foreground">
      Lot 정보를 불러오지 못했습니다. 목록으로 돌아가 다시 시도해 주세요.
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import useGetLotDetail from '@/apis/query-hooks/lot/useGetLotDetail';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const route = useRoute();
const router = useRouter();

const lotId = computed(() => route.params.lotId);

const { data: lotDetail, isPending } = useGetLotDetail(lotId);
const showSerials = ref(false);
const serialNumbers = ref([]);
const isSerialLoading = ref(false);
const hasSerialError = ref(false);

const goBack = () => {
  router.back();
};

function formatNumber(value) {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString();
}

function formatRate(value) {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `${num.toFixed(2)}%`;
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

const basicFields = computed(() => {
  const detail = lotDetail.value ?? {};
  return [
    { label: 'Lot No.', value: detail.lotNo },
    { label: '공장 코드', value: detail.factoryCode },
    { label: '라인 코드', value: detail.lineCode },
    { label: '생산담당자 사번', value: detail.productionManagerNo },
    { label: '실적 전표번호', value: detail.productionPerformanceDocNo },
    {
      label: '상태',
      value: detail.isDeleted ? '삭제' : '사용중',
      isStatus: true,
      statusWrapperClass: detail.isDeleted
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-green-50 text-green-700 border-green-200',
    },
  ];
});

const quantityFields = computed(() => {
  const detail = lotDetail.value ?? {};
  return [
    { label: '품목 코드', value: detail.itemCode },
    { label: '품목명', value: detail.itemName },
    { label: '투입 수량', value: formatNumber(detail.lotQty) },
    { label: '생산 수량', value: formatNumber(detail.performanceQty) },
    { label: '불량 수량', value: formatNumber(detail.defectiveQty) },
    { label: '불량률', value: formatRate(calculateDefectiveRate(detail)) },
  ];
});

function calculateDefectiveRate(detail) {
  const defectiveQty = Number(detail.defectiveQty ?? 0);
  const lotQty = Number(
    detail.lotQty ??
      (detail.performanceQty !== undefined && detail.defectiveQty !== undefined
        ? Number(detail.performanceQty) + Number(detail.defectiveQty)
        : 0),
  );

  if (!lotQty) return 0;
  return (defectiveQty / lotQty) * 100;
}

const viewSerialNumbers = async () => {
  if (!lotDetail.value?.serialFilePath) {
    toast.info('등록된 시리얼 번호가 없습니다.');
    return;
  }

  if (showSerials.value) {
    showSerials.value = false;
    return;
  }

  isSerialLoading.value = true;
  hasSerialError.value = false;

  try {
    const response = await fetch(lotDetail.value.serialFilePath);
    if (!response.ok) {
      throw new Error('failed to fetch');
    }
    const text = await response.text();
    serialNumbers.value = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    showSerials.value = true;
  } catch {
    hasSerialError.value = true;
    toast.error('시리얼 번호를 불러오지 못했습니다.');
  } finally {
    isSerialLoading.value = false;
  }
};
</script>
