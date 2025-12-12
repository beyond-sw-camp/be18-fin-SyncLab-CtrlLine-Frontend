<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">라인 상세 조회</h3>
  </div>

  <div class="flex flex-col">
    <form
      v-if="lineDetail?.lineCode"
      id="lineUpdateForm"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-2"
    >
      <fieldset :disabled="!isAdmin">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div class="order-1 md:order-0">
            <FormField v-slot="{ componentField, errorMessage }" name="lineCode">
              <FormItem>
                <FormLabel>라인코드</FormLabel>
                <FormControl>
                  <Input type="text" v-bind="componentField" autocomplete="line-code" disabled />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-4 md:order-0">
            <FormField v-slot="{ componentField, errorMessage }" name="lineName">
              <FormItem>
                <FormLabel>라인명</FormLabel>
                <FormControl>
                  <Input type="text" v-bind="componentField" autocomplete="line-name" disabled />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-7 md:order-0">
            <FormField v-slot="{ value, componentField, setValue, errorMessage }" name="empNo">
              <FormItem>
                <FormLabel>담당자</FormLabel>
                <FormControl>
                  <UpdateAutoCompleteSelect
                    :key="`empNo-${lineDetail.empNo}`"
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
                    :initialText="lineDetail.userName"
                    :emitFullItem="true"
                    @selectedFullItem="onUserSelected"
                    @clear="onUserCleared"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-7 md:order-0">
            <FormField v-slot="{ componentField, errorMessage }" name="userDepartment">
              <FormItem>
                <FormLabel>담당부서</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    v-bind="componentField"
                    autocomplete="userDepartment"
                    disabled
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-7 md:order-0">
            <FormField v-slot="{ componentField, errorMessage }" name="isActive">
              <FormItem>
                <FormLabel>라인 사용여부</FormLabel>
                <FormControl :disabled="!isAdmin">
                  <RadioGroup v-bind="componentField" class="flex">
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="r1" class="cursor-pointer" />
                      <Label for="r1" class="font-normal cursor-pointer">라인 사용</Label>
                    </div>

                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="r2" class="cursor-pointer" />
                      <Label for="r2" class="font-normal cursor-pointer">라인 미사용</Label>
                    </div>
                  </RadioGroup>
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
        </div>
      </fieldset>

      <!--담당자 MANAGER 권한 이상 부터 가능하다~ -->
      <div class="mt-8 pt-6 border-t" v-if="isAdmin">
        <ManageItemLineDialog
          v-if="lineDetail?.lineCode"
          :line-code="lineDetail.lineCode"
        />
      </div>

      <div class="flex justify-end pt-6 pb-5" v-if="isAdmin">
        <Button
          type="submit"
          size="sm"
          form="lineUpdateForm"
          class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
        >
          Save
        </Button>
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

import useGetLine from '@/apis/query-hooks/line/useGetLine.js';
import useUpdateLine from '@/apis/query-hooks/line/useUpdateLine.js';
import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
import UpdateAutoCompleteSelect from '@/components/auto-complete/UpdateAutoCompleteSelect.vue';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ManageItemLineDialog from '@/pages/base-management/line/ManageItemLineDialog.vue';
import { canView } from '@/utils/canView';

const formSchema = toTypedSchema(
  z.object({
    lineCode: z.string().optional(),
    lineName: z.string().optional(),
    empNo: z.string({ required_error: '담당자는 필수입니다.' }).min(1, '담당자는 필수입니다.'),
    userName: z.string().optional(),
    userDepartment: z
      .string({ required_error: '담당부서는 필수입니다.' })
      .min(1, '담당부서는 필수입니다.'),
    isActive: z.string().optional(),
  }),
);

const route = useRoute();
const { data: lineDetail } = useGetLine(route.params.lineCode);
const { mutate: updateLine } = useUpdateLine(route.params.lineCode);
const isAdmin = canView(['ADMIN']);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {},
});

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
  };

  // @ts-ignore
  updateLine(params);
});

watch(
  lineDetail,
  val => {
    if (!val) return;

    form.setValues({
      lineCode: lineDetail.value.lineCode,
      lineName: lineDetail.value.lineName,
      userDepartment: lineDetail.value.userDepartment,
      userName: lineDetail.value.userName,
      empNo: lineDetail.value.empNo,
      isActive: lineDetail.value.isActive ? 'true' : 'false',
    });
  },
  { immediate: true },
);
</script>

<style scoped></style>
