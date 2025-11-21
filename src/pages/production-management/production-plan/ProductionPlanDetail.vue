<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 상세 조회</h3>
    <div class="flex gap-2">
      <div class="flex items-center text-xs font-medium bg-gray-100 px-2 py-1 rounded-xl">
        {{ productionPlanDetail.planDocumentNo }}
      </div>
      <Button variant="outline" size="sm" class="cursor-pointer w-[60px]"> Delete </Button>
      <Button
        type="submit"
        form="productionPlanUpdateForm"
        class="bg-primary text-white hover:bg-primary-600 cursor-pointer w-[60px]"
        size="sm"
      >
        Save
      </Button>
    </div>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Form
      v-if="productionPlanDetail"
      id="productionPlanUpdateForm"
      :validation-schema="formSchema"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-2"
      :initial-values="{
        factoryCode: productionPlanDetail.factoryCode,
        dueDate: productionPlanDetail.dueDate,
        productionManagerNo: productionPlanDetail.productionManagerNo,
        itemCode: productionPlanDetail.itemCode,
        startTime: productionPlanDetail.startTime.slice(0, 16),
        salesManagerNo: productionPlanDetail.salesManagerNo,
        lineCode: productionPlanDetail.lineCode,
        lineName: productionPlanDetail.lineName,
        endTime: productionPlanDetail.endTime,
        status: productionPlanDetail.status,
        remark: productionPlanDetail.remark,
        plannedQty: productionPlanDetail.plannedQty,
      }"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <FormField v-slot="{ componentField, errorMessage }" name="factoryCode">
          <FormItem>
            <FormLabel>공장명</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="custom-input w-full">
                  <SelectValue placeholder="공장을 선택해주세요." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem
                    v-for="factory in factoryList?.content ?? []"
                    :key="factory.factoryCode"
                    :value="factory.factoryCode"
                  >
                    {{ factory.factoryName }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="dueDate">
          <FormItem>
            <FormLabel>납기일자</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" autocomplete="due-date" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="productionManagerNo" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>생산담당자</FormLabel>
            <FormControl>
              <div class="flex gap-2 items-center">
                <Input
                  type="text"
                  v-model="productionPlanDetail.productionManagerName"
                  placeholder="생산담당자를 입력하세요"
                  class="flex-1"
                />
                <Input type="text" v-bind="componentField" class="w-28 bg-gray-100" readonly />
              </div>
            </FormControl>
            <p class="text-red-500 text-xs">{{ errorMessage }}</p>
          </FormItem>
        </FormField>

        <FormField name="itemCode" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>품목명</FormLabel>
            <FormControl>
              <div class="flex gap-2 items-center">
                <Input
                  type="text"
                  v-model="productionPlanDetail.itemName"
                  placeholder="품목명을 입력하세요"
                  class="flex-1"
                />
                <Input type="text" v-bind="componentField" class="w-28 bg-gray-100" readonly />
              </div>
            </FormControl>
            <p class="text-red-500 text-xs">{{ errorMessage }}</p>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="startTime">
          <FormItem>
            <FormLabel>생산시작시간</FormLabel>
            <FormControl>
              <Input type="datetime-local" v-bind="componentField" readonly />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="salesManagerNo" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>영업담당자</FormLabel>
            <FormControl>
              <div class="flex gap-2 items-center">
                <Input
                  type="text"
                  v-model="productionPlanDetail.salesManagerName"
                  placeholder="영업담당자를 입력하세요"
                  class="flex-1"
                />
                <Input type="text" v-bind="componentField" class="w-28 bg-gray-100" readonly />
              </div>
            </FormControl>
            <p class="text-red-500 text-xs">{{ errorMessage }}</p>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="lineCode">
          <FormItem>
            <FormLabel>라인명</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="custom-input w-full">
                  <SelectValue placeholder="라인을 선택해주세요." />
                </SelectTrigger>
                <!-- 라인으로 변경 필요 -->
                <SelectContent>
                  <SelectItem
                    v-for="factory in factoryList?.content ?? []"
                    :key="factory.factoryCode"
                    :value="factory.factoryCode"
                  >
                    {{ factory.factoryName }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="endTime">
          <FormItem>
            <FormLabel>생산종료시간</FormLabel>
            <FormControl>
              <Input type="datetime-local" v-bind="componentField" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="status">
          <FormItem>
            <FormLabel>상태</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="custom-input w-full">
                  <SelectValue placeholder="상태를 선택하세요." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="(label, value) in PRODUCTION_PLAN_STATUS"
                    :key="value"
                    :value="value"
                  >
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <div class="col-span-3">
          <FormField v-slot="{ componentField, errorMessage }" name="remark">
            <FormItem>
              <FormLabel>비고</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" autocomplete="remark" />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>
      <ItemTable :itemDetail="productionPlanDetail" />
    </Form>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCTION_PLAN_STATUS } from '@/constants/enumLabels';
import ItemTable from '@/pages/production-management/production-plan/ItemTable.vue';

const productionPlanDetail = {
  id: 8,
  planDocumentNo: '2025/11/18-1',
  dueDate: '2000-01-01',
  status: 'PENDING',
  salesManagerNo: '202510001',
  salesManagerName: '이인화',
  productionManagerNo: '202510002',
  productionManagerName: '서현원',
  startTime: '2025-11-18T13:30:27',
  endTime: '2025-11-18T14:20:00',
  factoryCode: 'F0001',
  factoryName: '제1공장',
  itemCode: 'CELL-C-21700-NCM-5.0',
  itemName: '원형 셀 21700 5.0Ah (NCM)',
  plannedQty: 1000000.0,
  lineCode: 'CL0001',
  lineName: '원형전지생산라인',
  remark: '생산 일정 조정',
};

const formSchema = toTypedSchema(
  z.object({
    factoryCode: z.string({ required_error: '공장명은 필수입니다.' }),
    dueDate: z.string({ required_error: '납기일자는 필수입니다.' }),
    productionManagerNo: z.string({ required_error: '생산담당자는 필수입니다.' }),
    itemCode: z.string({ required_error: '품목명은 필수입니다.' }),
    startTime: z.string({ required_error: '생산시작시간은 필수입니다.' }),
    salesManagerNo: z.string({ required_error: '영업담당자는 필수입니다.' }),
    lineCode: z.string({ required_error: '라인명은 필수입니다.' }),
    endTime: z.string().optional(),
    status: z.string({ required_error: '상태는 필수입니다.' }),
    plannedQty: z.coerce
      .number({ required_error: '생산계획수량은 필수입니다.' })
      .positive('생산계획수량은 1 이상이어야 합니다.'),
  }),
);

const { data: factoryList } = useGetFactoryList();

const onSubmit = values => {
  const params = {
    factoryCode: values.factoryCode,
    dueDate: values.itemName,
    productionManagerNo: values.productionManagerNo,
    itemCode: values.itemCode,
    startTime: values.startTime,
    salesManagerNo: values.salesManagerNo,
    lineCode: values.lineCode,
    status: values.status,
    remark: values.remark,
    plannedQty: values.plannedQty,
  };

  console.log(params);
  // updateFactoryStatus(params);
};
</script>

<style scoped></style>
