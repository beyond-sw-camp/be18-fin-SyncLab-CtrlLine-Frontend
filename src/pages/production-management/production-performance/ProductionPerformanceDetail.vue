<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산실적 상세 조회</h3>
    <div class="flex gap-2">
      <div
        class="flex items-center text-xs font-medium bg-gray-100 px-2 py-1 rounded-xl"
        v-if="detail"
      >
        {{ detail.documentNo }}
      </div>

      <!--수정: 생산실적은 remark 수정 가능-->
      <Button
        v-if="canEdit"
        type="submit"
        form="productionPerformanceUpdateForm"
        class="bg-primary text-white hover:bg-primary-600 cursor-pointer w-[60px]"
        size="sm"
      >
        Save
      </Button>
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
    id="productionPerformanceUpdateForm"
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
      productionPlanDocumentNo: detail.productionPlanDocumentNo,
      lotNo: detail.lotNo,
      defectiveDocumentNo: detail.defectiveDocumentNo,
      remark: detail.remark,

      // 하단 품목 및 생산 정보
      itemCode: detail.itemCode,
      itemName: detail.itemName,
      itemSpecification: detail.itemSpecification,
      itemUnit: detail.itemUnit,
      totalQty: detail.totalQty,
      performanceQty: detail.performanceQty,
      defectiveQty: detail.defectiveQty,
      defectiveRate: detail.defectiveRate,
    }"
    @submit="onSubmit"
    class="flex flex-col gap-8 md:flex-row"
  >
    <div class="flex-1 flex flex-col gap-2">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <FormField name="factoryName" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>공장명</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" class="text-sm" />
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

        <FormField name="dueDate" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>납기일</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" readonly class="text-sm" />
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

        <FormField name="productionManagerName" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>생산담당자</FormLabel>
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

        <FormField name="endTime" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>생산 종료시각</FormLabel>
            <FormControl>
              <Input type="datetime-local" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="productionPlanDocumentNo" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>생산계획전표번호</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" readonly class="text-sm" />
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

        <FormField name="defectiveDocumentNo" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>불량전표번호</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="remark" v-slot="{ componentField }">
          <FormItem class="md:col-span-3">
            <FormLabel>비고</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>
      </div>

      <div class="mt-6 border-t pt-4">
        <h4 class="scroll-m-20 text-xl font-semibold mb-4">품목 및 생산 정보</h4>

        <PerformanceItemTable :itemDetail="detail" />
      </div>
    </div>
  </Form>
</template>

<script setup>
import { Form } from 'vee-validate';
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import useGetProductionPerformance from '@/apis/query-hooks/production-performance/useGetProductionPerformance';
import useUpdatePerformanceRemark from '@/apis/query-hooks/production-performance/useUpdatePerformanceRemark';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import PerformanceItemTable from './PerformanceItemTable.vue';

const route = useRoute();

const {
  data: detail,
  isLoading, // 로딩 상태 추가
  isError, // 에러 상태 추가 // 에러 객체 추가
} = useGetProductionPerformance(route.params.id);

const { mutate: updateRemark } = useUpdatePerformanceRemark(route.params.id);

// 초기 렌더링용
const initialValues = computed(() => ({
  factoryName: `${detail.value?.factoryName} (${detail.value?.factoryCode})`,
  lineName: `${detail.value?.lineName} (${detail.value?.lineCode})`,
  salesManagerName: `${detail.value?.salesManagerName} (${detail.value?.salesManagerNo})`,
  productionManagerName: `${detail.value?.productionManagerName} (${detail.value?.productionManagerNo})`,
  startTime: detail.value?.startTime,
  endTime: detail.value?.endTime,
  dueDate: detail.value?.dueDate,
  lotNo: detail.value?.lotNo,
  planDocNo: detail.value?.planDocNo,
  defectiveDocNo: detail.value?.defectiveDocNo,
  remark: detail.value?.remark,
  itemCode: detail.value?.itemCode,
  itemName: detail.value?.itemName,
  itemSpecification: detail.value?.itemSpecification,
  itemUnit: detail.value?.itemUnit,
  totalQty: detail.value?.totalQty,
  performanceQty: detail.value?.performanceQty,
  defectiveQty: detail.value?.defectiveQty,
  defectiveRate: detail.value?.defectiveRate,
}));

// watch detail → form.setValues로 값 업데이트
watch(
  () => detail.value,
  (val) => {
    if (!val) return;
  },
  { immediate: true }
);

// remark 수정 submit
function onSubmit(values) {
  updateRemark(
    { remark: values.remark },
    {
      onSuccess: () => {
        alert('비고가 수정되었습니다.');
      },
    },
  );
}

const canEdit = true; // remark 수정 가능
</script>

<style scoped></style>
