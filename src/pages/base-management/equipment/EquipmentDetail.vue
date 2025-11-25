<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">설비 상세 조회</h3>
  </div>

  <div class="flex flex-col gap-10 md:flex-row">
    <Form
      v-if="equipmentDetail"
      id="equipmentUpdateForm"
      :validation-schema="formSchema"
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
        // maintenanceHistory: equipmentDetail.maintenanceHistory, // 유지보수 이력?
        totalCount: equipmentDetail.totalCount, // 누적투입수량
        defectiveCount: equipmentDetail.defectiveCount, // 누적불량수량
        // 유지보수이력
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
                <Input type="text" v-bind="componentField" disabled autocomplete="equipment-name" />
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

          <div class="hidden md:block"></div>

          <FormField name="userName" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>담당자</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" :disabled="!isAdmin" />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="userDepartment">
            <FormItem>
              <FormLabel>부서</FormLabel>
              <FormControl>
                <Select v-bind="componentField" disabled>
                  <SelectTrigger class="custom-input w-full">
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
              <FormLabel>설비사용여부</FormLabel>
              <FormControl>
                <RadioGroup v-bind="componentField" class="flex">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem :disabled="!isAdmin" value="true" id="r1" />
                    <Label for="r1" class="font-normal">설비코드 사용</Label>
                  </div>

                  <div class="flex items-center space-x-2">
                    <RadioGroupItem :disabled="!isAdmin" value="false" id="r2" />
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
              <FormLabel>누적가동시간</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="maintenanceHistory" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>유지보수이력</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="totalCount" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>누적투입수량</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="defectiveCount" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>누적불량수량</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>
    </Form>
  </div>
  <div class="flex justify-end pt-6 pb-5">
    <Button
      type="submit"
      form="equipmentUpdateForm"
      class="bg-primary text-white hover:bg-primary-600"
      :disabled="!isAdmin"
    >
      Save
    </Button>
  </div>
</template>

<script setup>
import { toast } from 'vue-sonner';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useUserStore } from '@/stores/useUserStore';
import { updateEquipment } from '@/apis/query-functions/equipment';

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

// 현재 로그인한 사용자 정보
const userStore = useUserStore();
const isAdmin = userStore.userRole == 'ADMIN';

// 유지보수 이력 없음
const equipmentDetail = {
  equipmentCode: 'F1-CL1-AU001',
  equipmentName: '조립설비',
  equipmentType: 'FEOL',
  userDepartment: '영업 1팀',
  userName: '이인화',
  isActive: true,
  equipmentPpm: 80.0,
  empNo: '202510001',
  operatingDate: '2025-11-13T15:04:50',
  totalCount: 0.0,
  defectiveCount: 0.0,
};

const formSchema = toTypedSchema(
  z.object({
    equipmentCode: z.string().optional(),
    equipmentName: z.string().optional(),
    equipmentType: z.string().optional(),
    userName: z.string({ required_error: '사원명은 필수입니다.' }),
    userDepartment: z.string().optional(),
    isActive: z.string().optional(),
    equipmentPpm: z.number().optional(),
    operatingDate: z.number().optional(),
    totalCount: z.number().optional(),
    defectiveCount: z.number().optional(),
  }),
);

const onSubmit = async values => {
  if (!isAdmin) {
    toast.error('권한이 없습니다. 관리자만 수정할 수 있습니다.');
    return;
  }

  const params = {
    equipmentCode: values.equipmentCode,
    equipmentName: values.equipmentName,
    equipmentType: values.equipmentType,
    userDepartment: values.userDepartment,
    userName: values.userName,
    isActive: values.isActive === 'true',
    equipmentPpm: values.equipmentPpm,
    operatingDate: values.operatingDate,
    totalCount: values.totalCount,
    defectiveCount: values.defectiveCount,
  };

  try {
    const updated = await updateEquipment(values.equipmentCode, params);
    console.log('updated', updated);
    toast.success('저장되었습니다.');
  } catch (err) {
    console.error(err);
    toast.error('저장 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped></style>
