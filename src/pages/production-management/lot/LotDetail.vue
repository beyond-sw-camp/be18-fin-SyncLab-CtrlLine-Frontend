<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Lot No. 상세</h3>
        <p class="text-sm text-muted-foreground" v-if="lotDetail?.lotNo">
          Lot No. {{ lotDetail.lotNo }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="goBack">뒤로가기</Button>
      </div>
    </div>

    <div v-if="isPending" class="border rounded-lg p-6 text-center text-sm text-muted-foreground">
      로드 중입니다...
    </div>

    <div v-else-if="lotDetail" class="flex flex-col gap-6">
      <section class="border rounded-lg p-6">
        <h4 class="text-lg font-semibold mb-4">기본 정보</h4>
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="field in basicFields"
            :key="field.label"
            class="flex flex-col gap-1"
          >
            <span class="text-xs text-muted-foreground">{{ field.label }}</span>
            <span class="text-base font-medium break-words" :class="field.valueClass">
              {{ displayValue(field.value) }}
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-1 mt-4">
          <span class="text-xs text-muted-foreground">비고</span>
          <span class="text-base font-medium break-words">
            {{ displayValue(lotDetail.remark) }}
          </span>
        </div>
      </section>

      <section class="border rounded-lg p-6">
        <h4 class="text-lg font-semibold mb-4">품목 및 수량</h4>
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="field in quantityFields"
            :key="field.label"
            class="flex flex-col gap-1"
          >
            <span class="text-xs text-muted-foreground">{{ field.label }}</span>
            <span class="text-base font-medium break-words">
              {{ displayValue(field.value) }}
            </span>
          </div>
        </div>
      </section>

      <section class="border rounded-lg p-6">
        <h4 class="text-lg font-semibold mb-4">기타</h4>
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="field in miscFields"
            :key="field.label"
            class="flex flex-col gap-1"
          >
            <span class="text-xs text-muted-foreground">{{ field.label }}</span>
            <span class="text-base font-medium break-words">
              {{ displayValue(field.value) }}
            </span>
          </div>
        </div>
      </section>
    </div>

    <div
      v-else
      class="border rounded-lg p-6 text-center text-sm text-muted-foreground"
    >
      Lot 정보를 불러오지 못했습니다. 목록으로 돌아가 다시 시도해 주세요.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetLotDetail from '@/apis/query-hooks/lot/useGetLotDetail';
import { Button } from '@/components/ui/button';

const route = useRoute();
const router = useRouter();

const lotId = computed(() => route.params.lotId);

const { data: lotDetail, isPending } = useGetLotDetail(lotId);

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

function formatDateTime(value) {
  if (!value) return '-';
  const formatted = new Date(value);
  return Number.isNaN(formatted.getTime())
    ? value
    : formatted.toLocaleString();
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
      valueClass: detail.isDeleted ? 'text-red-500' : 'text-emerald-600',
    },
  ];
});

const quantityFields = computed(() => {
  const detail = lotDetail.value ?? {};
  return [
    { label: '품목 코드', value: detail.itemCode },
    { label: '품목명', value: detail.itemName },
    { label: 'LOT 수량', value: formatNumber(detail.lotQty) },
    { label: '생산 수량', value: formatNumber(detail.performanceQty) },
    { label: '불량 수량', value: formatNumber(detail.defectiveQty) },
    { label: '불량률', value: formatRate(detail.defectiveRate) },
  ];
});

const miscFields = computed(() => {
  const detail = lotDetail.value ?? {};
  return [
    { label: 'Serial 파일 경로', value: detail.serialFilePath ?? '-' },
    { label: '생성일', value: formatDateTime(detail.createdAt) },
    { label: '수정일', value: formatDateTime(detail.updatedAt) },
  ];
});
</script>
