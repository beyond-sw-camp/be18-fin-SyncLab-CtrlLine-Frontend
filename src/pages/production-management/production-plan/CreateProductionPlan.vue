<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 등록</h3>
    <Button
      type="submit"
      form="productionPlanCreateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
      size="sm"
    >
      Save
    </Button>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Form
      id="productionPlanCreateForm"
      :validation-schema="formSchema"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-2"
      :initial-values="{
        status: 'PENDING',
        plannedQty: 0,
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
                <Input type="text" placeholder="생산담당자를 입력하세요" class="flex-1" />
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
                <Input type="text" placeholder="품목명을 입력하세요" class="flex-1" />
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
              <!-- UI 표시용 -->
              <Input type="datetime-local" :value="componentField" readonly />
              <!-- 실제 값 업데이트용 -->
              <input type="hidden" v-bind="componentField" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="salesManagerNo" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>영업담당자</FormLabel>
            <FormControl>
              <div class="flex gap-2 items-center">
                <Input type="text" placeholder="영업담당자를 입력하세요" class="flex-1" />
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
              <Input type="datetime-local" :value="componentField" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="status">
          <FormItem>
            <FormLabel>상태</FormLabel>
            <FormControl>
              <Select v-bind="componentField" disabled>
                <SelectTrigger class="custom-input w-full pointer-events-none">
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
      <ItemTable :itemDetail="{}" />
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


const formSchema = toTypedSchema(
  z.object({
    factoryCode: z.string({ required_error: '공장명은 필수입니다.' }),
    dueDate: z.string({ required_error: '납기일자는 필수입니다.' }),
    productionManagerNo: z.string({ required_error: '생산담당자는 필수입니다.' }),
    itemCode: z.string({ required_error: '품목명은 필수입니다.' }),
    salesManagerNo: z.string({ required_error: '영업담당자는 필수입니다.' }),
    lineCode: z.string({ required_error: '라인명은 필수입니다.' }),
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
