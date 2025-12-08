<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산실적 상세 조회</h3>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <form
      v-if="productionPerformanceDetail?.id"
      id="productionPerformanceForm"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-10"
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

        <FormField name="remark" v-slot="{ componentField }">
          <FormItem class="md:col-span-3">
            <FormLabel>비고</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" />
            </FormControl>
          </FormItem>
        </FormField>
      </div>

      <div class="mt-6 border-t pt-4">
        <h4 class="scroll-m-20 text-xl font-semibold mb-4">품목 및 생산, 불량 정보</h4>
        <PPTable :PPDetail="PPDetail" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import useGetProductionPerformance from '@/apis/query-hooks/production-performance/useGetProductionPerformance';
import useUpdateProductionPerformances from '@/apis/query-hooks/production-performance/useUpdateProductionPerformance';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import PPTable from '@/pages/production-management/production-performance/PPTable.vue';

const route = useRoute();
const { data: productionPerformanceDetail } = useGetProductionPerformance(route.params.id);
const { mutate: updateProductionPerformance } = useUpdateProductionPerformances(
  route.params.productionPerformanceId,
);

const form = useForm();
const PPDetail = ref({});

const onSubmit = form.handleSubmit(values => {
  const params = {
    remark: values.remark,
  };

  // @ts-ignore
  updateProductionPerformance(params);
});

watch(
  productionPerformanceDetail,
  val => {
    if (!val) return;
    form.setValues({
      factoryName: `${val.factoryName} (${val.factoryCode})`,
      lineName: `${val.lineName} (${val.lineCode})`,
      itemName: val.itemName,
      dueDate: val.dueDate,
      salesManagerName: `${val.salesManagerName} (${val.salesManagerNo})`,
      productionManagerName: `${val.productionManagerName} (${val.productionManagerNo})`,
      startTime: val.startTime,
      endTime: val.endTime,
      lotNo: val.lotNo,
      remark: val.remark,
    });

    PPDetail.value = {
      itemCode: val.itemCode,
      itemName: val.itemName,
      itemSpecification: val.itemSpecification,
      itemUnit: val.itemUnit,
      totalQty: val.totalQty,
      performanceQty: val.performanceQty,
      defectiveQty: val.defectiveQty,
      defectiveRate: val.defectRate,
    };
  },
  { immediate: true },
);
</script>

<style scoped></style>
