<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산실적 상세 조회</h3>

    <div
      v-if="detail"
      class="flex items-center text-xs font-medium bg-gray-100 px-2 py-1 rounded-xl"
    >
      {{ detail.documentNo }}
    </div>
  </div>

  <div v-if="isLoading" class="text-center py-20 text-gray-500">
    <p>데이터를 불러오는 중입니다...</p>
  </div>
  <div v-else-if="isError" class="text-center py-20 text-red-600">
    <p>데이터 로딩 중 오류가 발생했습니다. (ID: {{ route.params.id }})</p>
  </div>

  <Form
    as="form"
    v-else-if="detail"
    :initial-values="{
      // 상단 기본 정보
      factoryName: `${detail.factoryName} (${detail.factoryCode})`,
      lineName: `${detail.lineName} (${detail.lineCode})`,
      dueDate: detail.dueDate,
      salesManagerName: `${detail.salesManagerName} (${detail.salesManagerNo})`,
      productionManagerName: `${detail.productionManagerName} (${detail.productionManagerNo})`,
      startTime: detail.startTime,
      endTime: detail.endTime,
      lotNo: detail.lotNo,
      remark: detail.remark,

      // 하단 품목 및 생산 정보
      itemCode: detail.itemCode,
      itemName: detail.itemName,
      itemSpecification: detail.itemSpecification,
      itemUnit: detail.itemUnit,
      totalQty: detail.totalQty,
      performanceQty: detail.performanceQty,
      defectiveQty: detail.defectiveQty,
      defectiveRate: detail.defectRate,
    }"
  >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div class="order-1 md:order-0">
        <FormField name="factoryName" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>공장명</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>
      </div>

      <div class="order-4 md:order-0">
        <FormField name="dueDate" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>납기일</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>
      </div>

      <FormField name="productionManagerName" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>생산담당자</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" readonly class="text-sm" />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField name="itemName" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>품목명</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" readonly class="text-sm" />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField name="startTime" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>생산 시작시각</FormLabel>
          <FormControl>
            <Input type="datetime-local" v-bind="componentField" readonly class="text-sm" />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField name="salesManagerName" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>영업담당자</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" readonly class="text-sm" />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField name="lineName" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>라인명</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" readonly class="text-sm" />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField name="endTime" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>생산 종료시각</FormLabel>
          <FormControl>
            <Input type="datetime-local" v-bind="componentField" readonly class="text-sm" />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField name="lotNo" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>LOT 번호</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" readonly class="text-sm" />
          </FormControl>
        </FormItem>
      </FormField>

      <div class="order-10 md:order-0 col-span-1 md:col-span-3">
        <FormField name="remark" v-slot="{ componentField }">
          <FormItem class="md:col-span-3">
            <FormLabel>비고</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" />
            </FormControl>
          </FormItem>
        </FormField>
      </div>
    </div>
  </Form>
</template>

<script setup>
import { Form } from 'vee-validate';
import { useRoute } from 'vue-router';

import useGetProductionPerformance from '@/apis/query-hooks/production-performance/useGetProductionPerformance';
import useUpdateProductionPerformance from '@/apis/query-hooks/production-performance/useUpdateProductionPerformance';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const route = useRoute();
const { mutate: updateProductionPerformance } = useUpdateProductionPerformance(
  route.params.productionPerformanceId,
);

const {
  data: detail,
  isLoading, // 로딩 상태 추가
  isError, // 에러 상태 추가 // 에러 객체 추가
} = useGetProductionPerformance(route.params.id);
</script>

<style scoped></style>
