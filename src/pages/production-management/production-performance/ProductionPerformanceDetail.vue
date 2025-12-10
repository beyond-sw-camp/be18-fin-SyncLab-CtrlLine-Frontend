<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산실적 상세 조회</h3>
    <div class="flex gap-2">
      <Badge v-if="productionPerformanceDetail" variant="secondary">
        {{ productionPerformanceDetail.documentNo }}
      </Badge>

      <Button
        v-if="canEdit"
        type="submit"
        form="productionPerformanceForm"
        class="bg-primary text-white hover:bg-primary-600 cursor-pointer w-[60px]"
        size="sm"
      >
        Save
      </Button>
    </div>
  </div>

  <div class="flex flex-col gap-8 md:flex-row w-full">
    <form
      v-if="productionPerformanceDetail?.id"
      id="productionPerformanceForm"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-10 w-full"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-2">
        <div class="order-1 md:order-0">
          <FormField name="factoryName" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>공장</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" readonly class="text-sm" />
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-4 md:order-0">
          <FormField name="dueDate" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>납기일자</FormLabel>
              <FormControl>
                <Input type="date" v-bind="componentField" readonly class="text-sm" />
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <FormField
          name="productionManagerNo"
          v-slot="{ value, componentField, setValue, errorMessage }"
        >
          <FormItem class="w-full">
            <FormLabel>생산 담당자</FormLabel>
            <FormControl class="w-full min-w-0">
              <UpdateAutoCompleteSelect
                :key="`productionManagerNo-${productionPerformanceDetail?.productionManagerNo}`"
                label="생산 담당자"
                :value="value"
                :componentField="componentField"
                :setValue="setValue"
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
                :initialText="productionPerformanceDetail.productionManagerName"
                :disabled="!canEdit"
              />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="itemCode" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>품목</FormLabel>
            <FormControl>
              <UpdateAutoCompleteSelect
                :key="`itemCode-${productionPerformanceDetail?.itemCode}`"
                label="품목"
                :componentField="componentField"
                :setValue="setValue"
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
                :initialText="productionPerformanceDetail.itemName"
                :disabled="!canEdit"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="startTime" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>생산 시작 시각</FormLabel>
            <FormControl>
              <Input type="datetime-local" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="salesManagerNo" v-slot="{ value, componentField, setValue, errorMessage }">
          <FormItem class="w-full">
            <FormLabel>영업 담당자</FormLabel>
            <FormControl class="w-full min-w-0">
              <UpdateAutoCompleteSelect
                :key="`salesManagerNo-${productionPerformanceDetail?.salesManagerNo}`"
                label="영업 담당자"
                :value="value"
                :componentField="componentField"
                :setValue="setValue"
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
                :initialText="productionPerformanceDetail.salesManagerName"
                :disabled="!canEdit"
              />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="lineName" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>라인</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="endTime" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>생산 종료 시각</FormLabel>
            <FormControl>
              <Input type="datetime-local" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="remark" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>비고</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" :readonly="!canEdit" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="productionPlanDocumentNo" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>생산계획 전표번호</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="lotNo" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Lot No.</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" readonly class="text-sm" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="defectiveDocumentNo" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>불량 전표번호</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" readonly class="text-sm" />
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
import { setValue } from '@syncfusion/ej2-base';
import { useForm } from 'vee-validate';
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

import useGetItemList from '@/apis/query-hooks/item/useGetItemList';
import useGetProductionPerformance from '@/apis/query-hooks/production-performance/useGetProductionPerformance';
import useupdateProductionPerformance from '@/apis/query-hooks/production-performance/useUpdateProductionPerformance';
import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
import UpdateAutoCompleteSelect from '@/components/auto-complete/UpdateAutoCompleteSelect.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import PPTable from '@/pages/production-management/production-performance/PPTable.vue';
import { useUserStore } from '@/stores/useUserStore';

const route = useRoute();
const { data: productionPerformanceDetail } = useGetProductionPerformance(route.params.id);
const { mutate: updateProductionPerformance } = useupdateProductionPerformance(route.params.id);

const userStore = useUserStore();
const form = useForm({
  initialValues: {
    salesManagerNo: productionPerformanceDetail.value?.salesManagerNo,
    productionManagerNo: productionPerformanceDetail.value?.productionManagerNo,
  },
});
const PPDetail = ref({});

const canEdit = computed(() => {
  const role = userStore.userRole;
  return role === 'ADMIN';
});

const onSubmit = form.handleSubmit(values => {
  const params = {
    remark: values.remark,
  };

  // @ts-ignore
  updateProductionPerformance(params);
});

const formatQuantity = (quantity, unit) => {
  if (quantity === null || quantity === undefined) return '';
  const formattedQty = Number(quantity).toLocaleString('ko-KR');
  return `${formattedQty} ${unit || ''}`.trim();
};

watch(
  productionPerformanceDetail,
  val => {
    if (!val) return;

    form.setValues({
      factoryName: val.factoryName,
      factoryCode: val.factoryCode,
      lineName: val.lineName,
      lineCode: val.lineCode,
      itemName: val.itemName,
      itemCode: val.itemCode,
      dueDate: val.dueDate,
      salesManagerName: val.salesManagerName,
      salesManagerNo: val.salesManagerNo,
      productionManagerName: val.productionManagerName,
      productionManagerNo: val.productionManagerNo,
      startTime: val.startTime,
      endTime: val.endTime,
      lotNo: val.lotNo,
      defectiveDocumentNo: val.defectiveDocumentNo,
      productionPlanDocumentNo: val.productionPlanDocumentNo,
      remark: val.remark,
    });

    PPDetail.value = {
      itemCode: val.itemCode,
      itemName: val.itemName,
      itemSpecification: val.itemSpecification,
      itemUnit: val.itemUnit,
      totalQty: formatQuantity(val.totalQty),
      performanceQty: formatQuantity(val.performanceQty),
      defectiveQty: formatQuantity(val.defectiveQty),
      defectiveRate: val.defectiveRate,
    };
  },
  { immediate: true },
);
</script>

<style scoped></style>
