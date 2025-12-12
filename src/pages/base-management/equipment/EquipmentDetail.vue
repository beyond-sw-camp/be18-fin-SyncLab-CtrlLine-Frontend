<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">설비 상세 조회</h3>
    <Button
      v-if="isAdmin"
      type="submit"
      size="sm"
      form="equipmentUpdateForm"
      class="bg-primary text-white hover:bg-primary-600"
    >
      Save
    </Button>
  </div>

  <div class="flex flex-col gap-10 md:flex-row">
    <form
      v-if="equipmentDetail"
      id="equipmentUpdateForm"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-12"
    >
      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">기본 정보</h4>
        <fieldset :disabled="!isAdmin">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div class="order-1 md:order-0">
              <FormField name="equipmentCode" v-slot="{ componentField, errorMessage }">
                <FormItem>
                  <FormLabel>설비코드</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="componentField" disabled />
                    <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>

            <div class="order-1 md:order-0">
              <FormField name="equipmentName" v-slot="{ componentField, errorMessage }">
                <FormItem>
                  <FormLabel>설비명</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="componentField" disabled />
                    <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>

            <div class="order-1 md:order-0">
              <FormField name="equipmentType" v-slot="{ componentField, errorMessage }">
                <FormItem>
                  <FormLabel>설비유형</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="componentField" disabled />
                    <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>

            <div class="order-1 md:order-0">
              <FormField name="empNo" v-slot="{ value, componentField, setValue, errorMessage }">
                <FormItem>
                  <FormLabel>담당자</FormLabel>
                  <FormControl>
                    <UpdateAutoCompleteSelect
                      :key="`empNo-${equipmentDetail?.empNo}`"
                      label="담당자"
                      :value="value"
                      :componentField="componentField"
                      :setValue="setValue"
                      :fetchList="() => useGetUserList({ userStatus: 'ACTIVE' })"
                      keyField="empNo"
                      nameField="userName"
                      :fields="[
                        'empNo',
                        'userName',
                        'userEmail',
                        'userDepartment',
                        'userPhoneNumber',
                        'userStatus',
                        'userRole',
                      ]"
                      :tableHeaders="['사번', '사원명', '이메일', '부서', '연락처', '상태', '권한']"
                      :initialText="equipmentDetail.userName"
                      :emitFullItem="true"
                      @selectedFullItem="onUserSelected"
                      @clear="onUserCleared"
                    />
                    <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>
            <div class="order-1 md:order-0">
              <FormField v-slot="{ componentField, errorMessage }" name="userDepartment">
                <FormItem>
                  <FormLabel>담당부서</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      v-bind="componentField"
                      autocomplete="userDepartment"
                      readonly
                    />
                    <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>

            <!-- <div class="order-1 md:order-0">
              <FormField v-slot="{ componentField, errorMessage }" name="isActive">
                <FormItem>
                  <FormLabel>설비 사용여부</FormLabel>
                  <FormControl>
                    <RadioGroup v-bind="componentField" class="flex">
                      <div class="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="r1" class="cursor-pointer" />
                        <Label for="r1" class="font-normal cursor-pointer">설비 사용</Label>
                      </div>

                      <div class="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="r2" class="cursor-pointer" />
                        <Label for="r2" class="font-normal cursor-pointer">설비 미사용</Label>
                      </div>
                    </RadioGroup>
                    <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                  </FormControl>
                </FormItem>
              </FormField>
            </div> -->
          </div>
        </fieldset>
      </div>
      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">주요 지표</h4>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div class="order-1 md:order-0">
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
      </div>

      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">누적 및 운영 정보</h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div class="order-1 md:order-0">
            <FormField name="operatingDate" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel>누적 가동시간</FormLabel>
                <FormControl>
                  <Input type="number" v-bind="componentField" disabled />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-1 md:order-0">
            <FormField name="maintenanceHistory" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel>유지 보수이력</FormLabel>
                <FormControl>
                  <Input type="text" v-bind="componentField" disabled />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-1 md:order-0">
            <FormField name="totalCount" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel>누적 투입수량</FormLabel>
                <FormControl>
                  <Input type="number" v-bind="componentField" disabled />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-1 md:order-0">
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
      </div>
    </form>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { z } from 'zod';

import useGetEquipment from '@/apis/query-hooks/equipment/useGetEquipment';
import useUpdateEquipment from '@/apis/query-hooks/equipment/useUpdateEquipment.js';
import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
import UpdateAutoCompleteSelect from '@/components/auto-complete/UpdateAutoCompleteSelect.vue';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { canView } from '@/utils/canView';
import getAccumulatedHours from '@/utils/getAccumulatedHours';

const formSchema = toTypedSchema(
  z.object({
    equipmentCode: z.string().optional(),
    equipmentName: z.string().optional(),
    equipmentType: z.string().optional(),
    userDepartment: z
      .string({ required_error: '담당부서는 필수입니다.' })
      .min(1, '담당부서는 필수입니다.'),
    userName: z.string().optional(),
    isActive: z.string().optional(),
    equipmentPpm: z.number().optional(),
    operatingDate: z.number().optional(), // 누적 가동 시간
    maintenanceHistory: z.string().optional(), // 유지보수 이력?
    totalCount: z.number().optional(), // 누적투입수량
    defectiveCount: z.number().optional(), // 누적불량수량
    empNo: z.string({ required_error: '담당자는 필수입니다.' }).min(1, '담당자는 필수입니다.'),
  }),
);

const route = useRoute();
const { data: equipmentDetail } = useGetEquipment(route.params.equipmentCode);
const { mutate: updateEquipment } = useUpdateEquipment(route.params.equipmentCode);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {},
});

const isAdmin = canView(['ADMIN']);

function onUserSelected(value) {
  form.setFieldValue('empNo', value.empNo);
  form.setFieldValue('userName', value.userName);
  form.setFieldValue('userDepartment', value.userDepartment);
}

function onUserCleared() {
  form.setFieldValue('empNo', '');
  form.setFieldValue('userName', '');
  form.setFieldValue('userDepartment', '');
}

const onSubmit = form.handleSubmit(values => {
  const params = {
    userName: values.userName,
    empNo: values.empNo,
    isActive: values.isActive === 'true',
    equipmentCode: values.equipmentCode,
  };

  // @ts-ignore
  updateEquipment(params);
});

watch(
  equipmentDetail,
  val => {
    if (!val) return;

    form.setValues({
      equipmentCode: val.equipmentCode,
      equipmentName: val.equipmentName,
      equipmentType: val.equipmentType,
      userDepartment: val.userDepartment,
      userName: val.userName,
      empNo: val.empNo,
      isActive: val.isActive ? 'true' : 'false',
      equipmentPpm: val.equipmentPpm,
      operatingDate: getAccumulatedHours(val.operatingDate),
      maintenanceHistory: val.maintenanceHistory,
      totalCount: val.totalCount,
      defectiveCount: val.defectiveCount,
    });
  },
  { immediate: true },
);
</script>

<style scoped></style>
