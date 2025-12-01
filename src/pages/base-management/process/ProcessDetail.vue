<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">공정 상세 조회</h3>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Form
      v-if="processDetail?.processCode"
      id="processUpdateForm"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-10"
      :initial-values="initialValues"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField v-slot="{ componentField, errorMessage }" name="processCode">
          <FormItem>
            <FormLabel>공정코드</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="process-code" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="processName">
          <FormItem>
            <FormLabel>공정명</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="process-name" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, componentField, setValue, errorMessage }" name="empNo">
          <FormItem>
            <FormLabel>담당자</FormLabel>
            <FormControl>
              <UpdateAutoCompleteSelect
                :key="`empNo-${processDetail.empNo}`"
                label="담당자"
                :value="value"
                :componentField="componentField"
                :setValue="setValue"
                :fetchList="() => useGetUserList({ userStatus: 'ACTIVE' })"
                key-field="empNo"
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
                :initialText="processDetail.userName"
                :emitFullItem="true"
                @selectedFullItem="item => (selectedUserName = item.userName)"
              />
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
            <FormLabel>공정 사용여부</FormLabel>
            <FormControl>
              <RadioGroup v-bind="componentField" class="flex">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="r1" />
                  <Label for="r1" class="font-normal">공정 사용</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="r2" />
                  <Label for="r2" class="font-normal">공정 미사용</Label>
                </div>
              </RadioGroup>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>
      </div>
      <div class="flex justify-end pt-6 pb-5">
        <Button
          type="submit"
          form="processUpdateForm"
          class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
        >
          Save
        </Button>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

import useGetProcess from '@/apis/query-hooks/process/useGetProcess.js';
import useUpdateProcess from '@/apis/query-hooks/process/useUpdateProcess.js';
import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
import UpdateAutoCompleteSelect from '@/components/auto-complete/UpdateAutoCompleteSelect.vue';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const route = useRoute();
const { data: processDetail } = useGetProcess(route.params.processCode);
const { mutate: updateProcess } = useUpdateProcess(route.params.processCode);

const initialValues = computed(() => {
  if (!processDetail.value) return {};

  return {
    processCode: processDetail.value.processCode,
    processName: processDetail.value.processName,
    department: processDetail.value.userDepartment,
    // name: processDetail.value.userName,
    empNo: processDetail.value.empNo,
    isActive: processDetail.value.isActive ? 'true' : 'false',
  };
});

const selectedUserName = ref('');
watch(
  processDetail,
  val => {
    if (val) {
      selectedUserName.value = val.userName;
    }
  },
  { immediate: true },
);

const onSubmit = values => {
  const params = {
    userName: selectedUserName.value,
    empNo: values.empNo,
    isActive: values.isActive === 'true',
    processCode: values.processCode,
  };
  // @ts-ignore
  updateProcess(params);
};
</script>

<style scoped></style>
