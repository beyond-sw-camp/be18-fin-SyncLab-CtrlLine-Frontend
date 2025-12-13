<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">품목 등록</h3>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Form
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
            <FormLabel
              >품목명
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><InfoIcon :size="15" /></TooltipTrigger>
                  <TooltipContent side="top">
                    <p>품목 코드와 유사하게 품목명을 작성해주세요.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="item-name" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="itemSpecification">
          <FormItem>
            <FormLabel
              >규격
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><InfoIcon :size="15" /></TooltipTrigger>
                  <TooltipContent side="top">
                    <p>품목 코드에 작성한 규격으로 작성해주세요.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
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
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="품목구분을 선택하세요." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="FINISHED_PRODUCT" value="FINISHED_PRODUCT"> 완제품 </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="isActive">
          <FormItem>
            <FormLabel>품목 사용여부</FormLabel>
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
      size="sm"
      form="itemCreateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
    >
      Save
    </Button>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { InfoIcon } from 'lucide-vue-next';
import { z } from 'zod';

import useCreateItem from '@/apis/query-hooks/item/useCreateItem';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const { mutate: createItem } = useCreateItem();
const formSchema = toTypedSchema(
  z.object({
    itemCode: z
      .string({ required_error: '품목코드는 필수입니다. ex) CELL-C-12345-ABC-31.0' })
      .nonempty('품목코드는 필수입니다.')
      .regex(/^(CELL|PACK)-/i, "품목코드는 'CELL- 또는 PACK-'로 시작해야 합니다."),
    itemName: z
      .string({ required_error: '품목명은 필수입니다. ex) 원형 셀 12345 31.0Ah (ABC)' })
      .nonempty('품목명은 필수입니다.'),
    itemSpecification: z
      .string({
        required_error:
          '규격은 필수입니다. ex) Li-ion Cylindrical Cell 12345, ABC, Ø18×65 mm, 3.65V, 31.0Ah',
      })
      .nonempty('규격은 필수입니다.'),
    itemUnit: z
      .string({ required_error: '단위는 필수입니다. ex) EA' })
      .nonempty('단위는 필수입니다.'),
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
    isActive: true,
  };
  // @ts-ignore
  createItem(params);
  // updateFactoryStatus(params);
};
</script>

<style scoped></style>
