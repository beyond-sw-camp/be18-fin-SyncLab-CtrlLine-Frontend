<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">라인 상세 조회</h3>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Form
      v-if="lineDetail?.lineCode"
      id="lineUpdateForm"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-10"
      :initial-values="initialValues"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField v-slot="{ componentField, errorMessage }" name="lineCode">
          <FormItem>
            <FormLabel>라인코드</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="line-code" disabled />
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

        <FormField v-slot="{ componentField, errorMessage }" name="name">
          <FormItem>
            <FormLabel>담당자</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="name" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="department">
          <FormItem>
            <FormLabel>담당부서</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="department" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="isActive">
          <FormItem>
            <FormLabel>라인 사용여부</FormLabel>
            <FormControl>
              <RadioGroup v-bind="componentField" class="flex">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="r1" />
                  <Label for="r1" class="font-normal">라인 사용</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="r2" />
                  <Label for="r2" class="font-normal">라인 미사용</Label>
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
      form="lineUpdateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
    >
      Save
    </Button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import useGetLine from '@/apis/query-hooks/line/useGetLine.js';
import useUpdateLine from '@/apis/query-hooks/line/useUpdateLine.js';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const route = useRoute();
const { data: lineDetail } = useGetLine(route.params.lineCode);
const { mutate: updateLine } = useUpdateLine(route.params.lineCode);

const initialValues = computed(() => {
  if (!lineDetail.value) return {};

  return {
    lineCode: lineDetail.value.lineCode,
    lineName: lineDetail.value.lineName,
    department: lineDetail.value.userDepartment,
    name: lineDetail.value.userName,
    empNo: lineDetail.value.empNo,
    isActive: lineDetail.value.isActive ? 'true' : 'false',
  };
});

const onSubmit = values => {
  const params = {
    isActive: values.isActive === 'true',
  };
  // @ts-ignore
  updateLine(params);
};
</script>

<style scoped></style>
