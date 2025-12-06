<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">품목 상세 조회</h3>
  </div>

  <div v-if="itemDetail" class="flex flex-col gap-8 md:flex-row">
    <Form
      id="itemUpdateForm"
      :validation-schema="formSchema"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-10"
      :initial-values="initialValues"
    >
      <fieldset :disabled="!isAdmin">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField v-slot="{ componentField, errorMessage }" name="itemCode">
            <FormItem>
              <FormLabel
                >품목코드
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><InfoIcon :size="15" /></TooltipTrigger>
                    <TooltipContent side="top">
                      <p>품목 코드 수정 시, 품목명과 규격을 수정해주세요.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
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
                      <p>품목 코드와 유사하게 품목명을 수정해주세요.</p>
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
                      <p>품목 코드에 작성한 규격으로 수정해주세요.</p>
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
                <Select v-bind="componentField" :disabled="!isAdmin">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="품목 구분을 선택하세요." />
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
              <FormLabel>품목 사용여부</FormLabel>
              <FormControl>
                <RadioGroup v-bind="componentField" class="flex">
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
      </fieldset>
      <div class="flex justify-end pt-6 pb-5" v-if="isAdmin">
        <Button
          type="submit"
          size="sm"
          form="itemUpdateForm"
          class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
        >
          Save
        </Button>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { InfoIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { z } from 'zod';

import useGetItem from '@/apis/query-hooks/item/useGetItem.js';
import useUpdateItem from '@/apis/query-hooks/item/useUpdateItem.js';
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
import { ITEM_STATUS_LABELS } from '@/constants/enumLabels';
import { canView } from '@/utils/canView';

const route = useRoute();
const { data: itemDetail } = useGetItem(route.params.itemId);
const { mutate: updateItem } = useUpdateItem(route.params.itemId);
const isAdmin = canView(['ADMIN']);

const initialValues = computed(() => {
  if (!itemDetail.value) return {};

  return {
    itemCode: itemDetail.value.itemCode,
    itemName: itemDetail.value.itemName,
    itemSpecification: itemDetail.value.itemSpecification,
    itemUnit: itemDetail.value.itemUnit,
    itemStatus: itemDetail.value.itemStatus,
    isActive: itemDetail.value.isActive ? 'true' : 'false',
  };
});

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
    isActive: z.string({ required_error: '사용여부는 필수입니다.' }),
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

  // @ts-ignore
  updateItem(params);
};
</script>

<style scoped></style>
