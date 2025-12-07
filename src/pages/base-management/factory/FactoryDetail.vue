<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">공장 상세 조회</h3>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Form
      v-if="factoryDetail"
      id="factoryUpdateForm"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-10"
      :initial-values="{
        factoryCode: factoryDetail.factoryCode,
        factoryName: factoryDetail.factoryName,
        department: factoryDetail.department,
        name: factoryDetail.name,
        isActive: factoryDetail.isActive ? 'true' : 'false',
      }"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField v-slot="{ componentField, errorMessage }" name="factoryCode">
          <FormItem>
            <FormLabel>공장코드</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="factory-code" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="factoryName">
          <FormItem>
            <FormLabel>공장명</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="factory-name" disabled />
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

        <FormField v-slot="{ componentField, errorMessage }" name="name">
          <FormItem>
            <FormLabel>담당자</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="name" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="isActive">
          <FormItem>
            <FormLabel>공장 사용여부</FormLabel>
            <FormControl :disabled="!isAdmin">
              <RadioGroup v-bind="componentField" class="flex">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="r1" />
                  <Label for="r1" class="font-normal">공장 사용</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="r2" />
                  <Label for="r2" class="font-normal">공장 미사용</Label>
                </div>
              </RadioGroup>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>
      </div>
    </Form>
  </div>
  <div class="flex justify-end pt-6 pb-5" v-if="isAdmin">
    <Button
      type="submit"
      form="factoryUpdateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
    >
      Save
    </Button>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

import useGetFactory from '@/apis/query-hooks/factory/useGetFactory.js';
import useUpdateFactoryStatus from '@/apis/query-hooks/factory/useUpdateFactoryStatus';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { canView } from '@/utils/canView';

const route = useRoute();

const { data: factoryDetail } = useGetFactory(route.params.factoryCode);
const { mutate: updateFactoryStatus } = useUpdateFactoryStatus(route.params.factoryCode);
const isAdmin = canView(['ADMIN']);

const onSubmit = values => {
  const params = {
    isActive: values.isActive === 'true',
  };
  updateFactoryStatus(params);
};
</script>

<style scoped></style>
