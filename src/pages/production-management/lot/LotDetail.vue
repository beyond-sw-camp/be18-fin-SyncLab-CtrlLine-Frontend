<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Lot No. 상세</h3>
    </div>

    <div v-if="isPending" class="border rounded-lg p-6 text-center text-sm text-muted-foreground">
      로드 중입니다...
    </div>

    <div v-else-if="lotDetail" class="flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <h4 class="text-lg font-semibold">기본 정보</h4>
        <div class="grid gap-4 md:grid-cols-3">
          <div v-for="field in basicFields" :key="field.label" class="flex flex-col gap-2">
            <Label>{{ field.label }}</Label>
            <div
              class="border rounded-md px-3 py-2 text-sm"
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
            <Label>{{ field.label }}</Label>
            <div class="border rounded-md px-3 py-2 text-sm">
              {{ displayValue(field.value) }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <Button variant="outline" class="w-fit" @click="toggleSerialModal">
          {{ isSerialModalOpen ? '시리얼 번호 닫기' : '시리얼 번호 조회' }}
        </Button>
      </div>

      <Dialog :open="isSerialModalOpen" @update:open="handleSerialModalToggle">
        <DialogContent class="sm:max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>시리얼 번호</DialogTitle>
            <DialogDescription>
              Lot {{ lotDetail?.lotNo || '-' }}의 시리얼 번호를 확인하세요.
            </DialogDescription>
          </DialogHeader>

          <div class="flex-1 flex flex-col gap-4 min-h-[200px]">
            <div v-if="isSerialLoading" class="text-sm text-muted-foreground">조회 중입니다...</div>
            <div v-else-if="hasSerialError" class="text-sm text-red-500">
              시리얼 번호를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.
            </div>
            <div v-else-if="serialNumbers.length === 0" class="text-sm text-muted-foreground">
              등록된 시리얼 번호가 없습니다.
            </div>
            <template v-else>
              <div class="flex flex-col gap-3 border rounded-lg p-4 bg-muted/30">
                <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span class="font-medium text-foreground">총 {{ totalSerialCount }}건</span>
                  <span v-if="filteredSerialCount !== totalSerialCount">
                    검색 결과 {{ filteredSerialCount }}건
                  </span>
                </div>
                <div class="flex flex-col md:flex-row gap-3">
                  <Input
                    v-model="serialSearchQuery"
                    placeholder="시리얼 번호 검색"
                    class="md:max-w-xs"
                  />
                  <div class="flex gap-2">
                    <Button variant="outline" size="sm" @click="serialSearchQuery = ''">
                      검색 초기화
                    </Button>
                    <Button size="sm" @click="copyAllSerials">전체 복사</Button>
                  </div>
                </div>
              </div>
              <div v-if="filteredSerials.length === 0" class="text-sm text-muted-foreground">
                검색 조건에 해당하는 시리얼 번호가 없습니다.
              </div>
              <div v-else class="border rounded-lg overflow-auto">
                <table class="w-full text-sm">
                  <thead class="bg-muted/70 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th class="w-16 px-3 py-2 text-center font-medium">No.</th>
                      <th class="px-3 py-2 font-medium text-left">시리얼 번호</th>
                      <th class="w-28 px-3 py-2 text-center font-medium">동작</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(serial, index) in filteredSerials"
                      :key="`${serial}-${index}`"
                      class="border-t odd:bg-white even:bg-muted/20 hover:bg-muted/40"
                    >
                      <td class="px-3 py-2 text-center font-medium text-muted-foreground">
                        {{ index + 1 }}
                      </td>
                      <td class="px-3 py-2 font-mono text-base text-foreground break-all">
                        {{ serial }}
                      </td>
                      <td class="px-3 py-2 text-center">
                        <Button variant="ghost" size="sm" class="h-8" @click="copySerial(serial)">
                          복사
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <div v-else class="border rounded-lg p-6 text-center text-sm text-muted-foreground">
      Lot 정보를 불러오지 못했습니다. 목록으로 돌아가 다시 시도해 주세요.
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

import { getLotSerials } from '@/apis/query-functions/lot';
import useGetLotDetail from '@/apis/query-hooks/lot/useGetLotDetail';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const route = useRoute();
const lotId = computed(() => route.params.lotId);

const { data: lotDetail, isPending } = useGetLotDetail(lotId);
const isSerialModalOpen = ref(false);
const serialNumbers = ref([]);
const isSerialLoading = ref(false);
const hasSerialError = ref(false);
const serialSearchQuery = ref('');

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

const toggleSerialModal = () => {
  if (isSerialModalOpen.value) {
    handleSerialModalToggle(false);
    return;
  }
  openSerialModal();
};

const handleSerialModalToggle = value => {
  isSerialModalOpen.value = value;
  if (!value) {
    serialSearchQuery.value = '';
  }
};

const openSerialModal = async () => {
  if (!lotDetail.value?.serialFilePath) {
    toast.info('등록된 시리얼 번호가 없습니다.');
    return;
  }

  handleSerialModalToggle(true);
  isSerialLoading.value = true;
  hasSerialError.value = false;

  try {
    const currentLotId = lotId.value ?? lotId;
    if (!currentLotId) {
      throw new Error('invalid lot id');
    }
    const response = await getLotSerials(currentLotId);
    serialNumbers.value = response?.serialList ?? [];
    serialSearchQuery.value = '';
  } catch (error) {
    hasSerialError.value = true;
    console.error('Failed to load serial numbers', error);
    toast.error('시리얼 번호를 불러오지 못했습니다.');
  } finally {
    isSerialLoading.value = false;
  }
};

const filteredSerials = computed(() => {
  const keyword = serialSearchQuery.value.trim().toLowerCase();
  if (!keyword) {
    return serialNumbers.value;
  }
  return serialNumbers.value.filter(serial => serial.toLowerCase().includes(keyword));
});

const totalSerialCount = computed(() => serialNumbers.value.length);
const filteredSerialCount = computed(() => filteredSerials.value.length);

const copySerial = async serial => {
  try {
    await navigator.clipboard.writeText(serial);
    toast.success('시리얼 번호를 복사했습니다.');
  } catch (error) {
    console.error('Failed to copy serial', error);
    toast.error('복사에 실패했습니다.');
  }
};

const copyAllSerials = async () => {
  if (!filteredSerials.value.length) {
    toast.info('복사할 시리얼 번호가 없습니다.');
    return;
  }

  try {
    await navigator.clipboard.writeText(filteredSerials.value.join('\n'));
    toast.success('시리얼 번호 전체를 복사했습니다.');
  } catch (error) {
    console.error('Failed to copy serials', error);
    toast.error('복사에 실패했습니다.');
  }
};
</script>
