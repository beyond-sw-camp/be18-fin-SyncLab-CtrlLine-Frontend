<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산실적 상세 조회</h3>

    <!-- 전표번호 표시 -->
    <div
      v-if="detail"
      class="flex items-center text-xs font-medium bg-gray-100 px-2 py-1 rounded-xl"
    >
      {{ detail.documentNo }}
    </div>
  </div>

  <!-- 상단 - 기본 정보 -->
  <div v-if="detail" class="flex flex-col gap-8 md:flex-row">
    <form class="flex-1 flex flex-col gap-2">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <!-- 공장명 -->
        <FormItem>
          <FormLabel>공장명</FormLabel>
          <FormControl>
            <Input
              type="text"
              :value="`${detail.factoryName} (${detail.factoryCode})`"
              readonly
              class="text-sm"
            />
          </FormControl>
        </FormItem>

        <!-- 라인명 -->
        <FormItem>
          <FormLabel>라인명</FormLabel>
          <FormControl>
            <Input
              type="text"
              :value="`${detail.lineName} (${detail.lineCode})`"
              readonly
              class="text-sm"
            />
          </FormControl>
        </FormItem>

        <!-- 납기일 -->
        <FormItem>
          <FormLabel>납기일</FormLabel>
          <FormControl>
            <Input type="date" :value="detail.dueDate" readonly class="text-sm" />
          </FormControl>
        </FormItem>

        <!-- 영업담당자 -->
        <FormItem>
          <FormLabel>영업담당자</FormLabel>
          <FormControl>
            <Input
              type="text"
              :value="`${detail.salesManagerName} (${detail.salesManagerNo})`"
              readonly
              class="text-sm"
            />
          </FormControl>
        </FormItem>

        <!-- 생산담당자 -->
        <FormItem>
          <FormLabel>생산담당자</FormLabel>
          <FormControl>
            <Input
              type="text"
              :value="`${detail.productionManagerName} (${detail.productionManagerNo})`"
              readonly
              class="text-sm"
            />
          </FormControl>
        </FormItem>

        <!-- 생산 시작시각 -->
        <FormItem>
          <FormLabel>생산 시작시각</FormLabel>
          <FormControl>
            <Input type="datetime-local" :value="detail.startTime" readonly class="text-sm" />
          </FormControl>
        </FormItem>

        <!-- 생산 종료시각 -->
        <FormItem>
          <FormLabel>생산 종료시각</FormLabel>
          <FormControl>
            <Input type="datetime-local" :value="detail.endTime" readonly class="text-sm" />
          </FormControl>
        </FormItem>

        <!-- LOT 번호 -->
        <FormItem>
          <FormLabel>LOT 번호</FormLabel>
          <FormControl>
            <Input type="text" :value="detail.lotNo" readonly class="text-sm" />
          </FormControl>
        </FormItem>

        <!-- 비고 -->
        <FormItem class="md:col-span-3">
          <FormLabel>비고</FormLabel>
          <FormControl>
            <Input type="text" :value="detail.remark" readonly class="text-sm" />
          </FormControl>
        </FormItem>
      </div>

      <!-- 하단: 품목 및 생산정보 -->
      <div class="mt-6 border-t pt-4">
        <h4 class="scroll-m-20 text-xl font-semibold mb-4">품목 및 생산 정보</h4>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <!-- 품목코드 -->
          <FormItem>
            <FormLabel>품목코드</FormLabel>
            <FormControl>
              <Input type="text" :value="detail.itemCode" readonly class="text-sm" />
            </FormControl>
          </FormItem>

          <!-- 품목명 -->
          <FormItem>
            <FormLabel>품목명</FormLabel>
            <FormControl>
              <Input type="text" :value="detail.itemName" readonly class="text-sm" />
            </FormControl>
          </FormItem>

          <!-- 규격 -->
          <FormItem>
            <FormLabel>규격</FormLabel>
            <FormControl>
              <Input type="text" :value="detail.itemSpecification" readonly class="text-sm" />
            </FormControl>
          </FormItem>

          <!-- 단위 -->
          <FormItem>
            <FormLabel>단위</FormLabel>
            <FormControl>
              <Input type="text" :value="detail.itemUnit" readonly class="text-sm" />
            </FormControl>
          </FormItem>

          <!-- 총 투입수량 -->
          <FormItem>
            <FormLabel>총 투입수량 (EA)</FormLabel>
            <FormControl>
              <Input type="number" :value="detail.totalQty" readonly class="text-sm" />
            </FormControl>
          </FormItem>

          <!-- 실적수량 -->
          <FormItem>
            <FormLabel>실적수량 (EA)</FormLabel>
            <FormControl>
              <Input type="number" :value="detail.performanceQty" readonly class="text-sm" />
            </FormControl>
          </FormItem>

          <!-- 불량수량 -->
          <FormItem>
            <FormLabel>불량수량 (EA)</FormLabel>
            <FormControl>
              <Input type="number" :value="detail.defectiveQty" readonly class="text-sm" />
            </FormControl>
          </FormItem>

          <!-- 불량률 -->
          <FormItem>
            <FormLabel>불량률 (%)</FormLabel>
            <FormControl>
              <Input type="text" :value="detail.defectiveRate" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

import useGetProductionPerformance from '@/apis/query-hooks/production-performance/useGetProductionPerformance';
import { FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const route = useRoute();
const { data: detail } = useGetProductionPerformance(route.params.performanceId);
</script>

<style scoped></style>
