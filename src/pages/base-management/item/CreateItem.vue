<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">품목 등록</h3>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Form
      v-if="itemDetail"
      id="itemCreateForm"
      :validation-schema="formSchema"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-10"
      :initial-values="{
        isActive: 'true',
      }"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField v-slot="{ componentField, errorMessage }" name="itemCode">
          <FormItem>
            <FormLabel>품목코드</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="item-code" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="itemName">
          <FormItem>
            <FormLabel>품목명</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="item-name" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="itemSpecification">
          <FormItem>
            <FormLabel>규격</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="item-specification" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="itemUnit">
          <FormItem>
            <FormLabel>단위</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="item-unit" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="itemStatus">
          <FormItem>
            <FormLabel>품목구분</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="custom-input w-full">
                  <SelectValue placeholder="품목구분을 선택하세요." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="(label, value) in ITEM_STATUS_LABELS"
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

        <FormField v-slot="{ componentField, errorMessage }" name="isActive">
          <FormItem>
            <FormLabel>품목사용여부</FormLabel>
            <FormControl>
              <RadioGroup v-bind="componentField" class="flex" disabled>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="r1" />
                  <Label for="r1" class="font-normal">품목 사용</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="r2" />
                  <Label for="r2" class="font-normal">품목 미사용</Label>
                </div>
              </RadioGroup>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>
      </div>
    </Form>
  </div>
  <div class="flex justify-end pt-6 pb-5">
    <Button
      type="submit"
      form="itemCreateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
    >
      Save
    </Button>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ITEM_STATUS_LABELS } from '@/constants/enumLabels';

const itemDetail = {
  id: 1,
  itemCode: 'ABS123123123',
  itemName: '튀김쫄볶이(개선형)',
  itemSpecification: '에 계란김밥을 곁들인',
  itemUnit: 'KG',
  itemStatus: 'RAW_MATERIAL',
  isActive: true,
  createdAt: '2025-11-10 11:29',
  updatedAt: '2025-11-12 20:33',
};

const formSchema = toTypedSchema(
  z.object({
    itemCode: z
      .string({ required_error: '품목코드는 필수입니다.' })
      .nonempty('품목코드는 필수입니다.')
      .regex(/^CELL-/i, "품목코드는 'CELL-'로 시작해야 합니다."),
    itemName: z.string({ required_error: '품목명은 필수입니다.' }).nonempty('품목명은 필수입니다.'),
    itemSpecification: z
      .string({ required_error: '규격은 필수입니다.' })
      .nonempty('규격은 필수입니다.'),
    itemUnit: z.string({ required_error: '단위는 필수입니다.' }).nonempty('단위는 필수입니다.'),
    itemStatus: z.string({ required_error: '품목구분은 필수입니다.' }),
  }),
);

const onSubmit = values => {
  const params = {
    itemCode: values.itemCode,
    itemName: values.itemName,
    itemSpecification: values.itemSpecification,
    itemUnit: values.itemUnit,
    itemStatus: values.itemStatus,
    isActive: values.isActive === 'true',
  };

  console.log(params);
  // updateFactoryStatus(params);
};
</script>

<style scoped></style>
