<!--ONLU READ만 가능!!!-->
<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">불량 상세 조회</h3>
  </div>

  <div v-if="defectiveDetail" class="flex flex-col gap-8 md:flex-row">
    <Form class="flex-1 flex flex-col gap-2" :initial-values="initialValues">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <FormField v-slot="{ componentField, errorMessage }" name="factoryName">
          <FormItem>
            <FormLabel>공장명</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="factoryName" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="lineName">
          <FormItem>
            <FormLabel>라인명</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="line-name" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="itemCode" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>품목명</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="item-name" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
            <p class="text-red-500 text-xs">{{ errorMessage }}</p>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="defectiveDocNo">
          <FormItem>
            <FormLabel>불량 전표번호</FormLabel>
            <FormControl class="w-full">
              <Input type="text" v-bind="componentField" autocomplete="defectiveDocNo" disabled />
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
                    <p>이걸 발견한 당신!! APPROVE 해주세요! 이스터에그 같은거에여.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                autocomplete="item-specification"
                disabled
              />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="itemUnit">
          <FormItem>
            <FormLabel>단위</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="item-unit" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { InfoIcon } from 'lucide-vue-next';
import { Form } from 'vee-validate';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import useGetDefective from '@/apis/query-hooks/defective/useGetDefective';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const route = useRoute();

const { data: defectiveDetail } = useGetDefective(route.params.planDefectiveId);

const initialValues = computed(() => {
  if (!defectiveDetail.value) return {};

  return {
    factoryName: defectiveDetail.value.factoryName,
    lineName: defectiveDetail.value.lineName,
    itemCode: defectiveDetail.value.itemCode,
    defectiveDocNo: defectiveDetail.value.defectiveDocNo,
    itemSpecification: defectiveDetail.value.itemSpecification,
    itemUnit: defectiveDetail.value.itemUnit,
  };
});
</script>

<style scoped></style>
