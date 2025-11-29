<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">설비 상세 조회</h3>
  </div>

  <div class="flex flex-col gap-10 md:flex-row">
    <Form
      as="form"
      v-if="equipmentDetail"
      id="equipmentUpdateForm"
      @submit="onSubmit"
      :initial-values="{
        equipmentCode: equipmentDetail.equipmentCode,
        equipmentName: equipmentDetail.equipmentName,
        equipmentType: equipmentDetail.equipmentType,
        userDepartment: equipmentDetail.userDepartment,
        userName: equipmentDetail.userName,
        isActive: equipmentDetail.isActive ? 'true' : 'false',
        equipmentPpm: equipmentDetail.equipmentPpm,
        operatingDate: getAccumulatedHours(equipmentDetail.operatingDate), // 누적 가동 시간
        maintenanceHistory: equipmentDetail.maintenanceHistory, // 유지보수 이력?
        totalCount: equipmentDetail.totalCount, // 누적투입수량
        defectiveCount: equipmentDetail.defectiveCount, // 누적불량수량
      }"
      class="flex-1 flex flex-col gap-12"
    >
      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">기본 정보</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="equipmentCode" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>설비코드</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="equipmentName" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>설비명</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="equipmentType" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>설비유형</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="userName" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>담당자</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" autocomplete="userName" />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="userDepartment">
            <FormItem>
              <FormLabel>부서</FormLabel>
              <FormControl>
                <Select v-bind="componentField" disabled>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="부서를 선택하세요." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="(label, value) in DEPARTMENT_LABELS"
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
              <FormLabel>설비 사용여부</FormLabel>
              <FormControl>
                <RadioGroup v-bind="componentField" class="flex">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="r1" />
                    <Label for="r1" class="font-normal">설비 사용</Label>
                  </div>

                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="r2" />
                    <Label for="r2" class="font-normal">설비 미사용</Label>
                  </div>
                </RadioGroup>
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>

      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">주요 지표</h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="equipmentPpm" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>PPM</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>

      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">누적 및 운영 정보</h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="operatingDate" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>누적 가동시간</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="maintenanceHistory" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>유지 보수이력</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="totalCount" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>누적 투입수량</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="defectiveCount" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>누적 불량수량</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>
      <div class="flex justify-end pt-6 pb-5">
        <Button
          type="submit"
          form="equipmentUpdateForm"
          class="bg-primary text-white hover:bg-primary-600"
        >
          Save
        </Button>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

import useGetEquipment from '@/apis/query-hooks/equipment/useGetEquipment';
import useUpdateEquipment from '@/apis/query-hooks/equipment/useUpdateEquipment.js';
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
import { DEPARTMENT_LABELS } from '@/constants/enumLabels';
import getAccumulatedHours from '@/utils/getAccumulatedHours';

const route = useRoute();
const { data: equipmentDetail } = useGetEquipment(route.params.equipmentCode);
const { mutate: updateEquipment } = useUpdateEquipment(route.params.equipmentCode);

const onSubmit = values => {
  const params = {
    userName: values.userName,
    isActive: values.isActive === 'true',
  };
  updateEquipment(params);
};
</script>

<style scoped></style>
