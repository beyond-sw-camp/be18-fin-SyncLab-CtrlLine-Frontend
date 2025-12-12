<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">사용자 상세 조회</h3>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Card
      v-if="userDetail && canView(['USER', 'MANAGER', 'ADMIN'])"
      class="w-full md:w-[260px] h-fit"
    >
      <CardContent class="flex flex-col gap-8 md:h-[500px] items-center">
        <div class="flex justify-center">
          <UserProfile />
        </div>

        <ul class="flex flex-col gap-4 w-full px-4">
          <li
            v-for="item in userInfo"
            :key="item.label"
            class="flex items-center justify-center gap-4 md:justify-between"
          >
            <span class="text-gray-600 text-sm whitespace-nowrap text-right w-10">
              {{ item.label }}
            </span>
            <span class="text-sm truncate max-w-[250px] md:flex-1">
              {{ item.value }}
            </span>
          </li>
        </ul>
        <div class="flex w-full mt-auto text-xs text-gray-500 pt-4 justify-end">
          {{ formatDate(userDetail.createdAt, 'full') }}
        </div>
      </CardContent>
    </Card>
    <Form
      v-if="userDetail"
      id="userUpdateForm"
      @submit="onSubmit"
      :validation-schema="formSchema"
      class="flex-1 flex flex-col gap-10"
      :initial-values="{
        phoneNumber: userDetail.userPhoneNumber,
        department: userDetail.userDepartment,
        position: userDetail.userPosition,
        role: userDetail.userRole,
        status: userDetail.userStatus,
        address: userDetail.userAddress,
        hiredDate: userDetail.hiredDate,
        terminationDate: userDetail.terminationDate,
        extension: userDetail.userExtension,
      }"
    >
      <fieldset :disabled="!isEditable">
        <div v-if="canView(['ADMIN'])">
          <h4 class="text-base font-semibold mb-4 border-b pb-2">기본 정보</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField v-slot="{ componentField, errorMessage }" name="phoneNumber">
              <FormItem>
                <FormLabel>연락처</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="010-1234-5678"
                    pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                    v-bind="componentField"
                    autocomplete="tel"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField, errorMessage }" name="address">
              <FormItem>
                <FormLabel>주소</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="주소를 입력해주세요."
                    v-bind="componentField"
                    autocomplete="street-address"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
        </div>

        <div v-if="canView(['ADMIN'])">
          <h4 class="text-base font-semibold mb-4 border-b pb-2">보안 설정</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField v-slot="{ componentField, errorMessage }" name="password">
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="비밀번호를 입력해주세요."
                    v-bind="componentField"
                    autocomplete="new-password"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField, errorMessage }" name="passwordConfirm">
              <FormItem>
                <FormLabel>비밀번호 확인</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="비밀번호를 다시 입력해주세요."
                    v-bind="componentField"
                    autocomplete="new-password"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
        </div>
        <div>
          <h4 class="text-base font-semibold mb-4 border-b pb-2">소속 정보</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField v-slot="{ componentField, errorMessage }" name="department">
              <FormItem>
                <FormLabel>부서</FormLabel>
                <FormControl>
                  <Select v-bind="componentField" :disabled="!isEditable">
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

            <FormField v-slot="{ componentField, errorMessage }" name="extension">
              <FormItem>
                <FormLabel>내선번호</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="내선번호를 입력하세요."
                    v-bind="componentField"
                    class="w-full"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField, errorMessage }" name="position">
              <FormItem>
                <FormLabel>직급</FormLabel>
                <FormControl>
                  <Select v-bind="componentField" :disabled="!isEditable">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="직급을 선택하세요." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="(label, value) in POSITION_LABELS"
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

            <div v-if="canView(['ADMIN'])">
              <FormField v-slot="{ componentField, errorMessage }" name="role">
                <FormItem>
                  <FormLabel>권한</FormLabel>
                  <FormControl>
                    <Select v-bind="componentField" :disabled="!isEditable">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="권한을 선택하세요." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="(label, value) in ROLE_LABELS"
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
            </div>

            <FormField v-slot="{ componentField, errorMessage }" name="status">
              <FormItem>
                <FormLabel>상태</FormLabel>
                <FormControl>
                  <Select v-bind="componentField" :disabled="!isEditable">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="재직 상태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="(label, value) in EMPLOYMENT_STATUS_LABELS"
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
          </div>
        </div>

        <div v-if="canView(['ADMIN'])">
          <h4 class="text-base font-semibold mb-4 border-b pb-2">입사 정보</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField v-slot="{ componentField, errorMessage }" name="hiredDate">
              <FormItem>
                <FormLabel>입사일</FormLabel>
                <FormControl>
                  <Input type="date" v-bind="componentField" disabled />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField, errorMessage }" name="terminationDate">
              <FormItem>
                <FormLabel>퇴사일</FormLabel>
                <FormControl>
                  <Input type="date" v-bind="componentField" />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
        </div>
      </fieldset>
    </Form>
  </div>
  <div class="flex justify-end pt-6 pb-5">
    <Button
      v-if="isEditable"
      type="submit"
      size="sm"
      form="userUpdateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
    >
      Save
    </Button>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { z } from 'zod';

import useGetUser from '@/apis/query-hooks/user/useGetUser';
import useUpdateUser from '@/apis/query-hooks/user/useUpdateUser';
import UserProfile from '@/assets/user-profile.svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEPARTMENT_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  POSITION_LABELS,
  ROLE_LABELS,
} from '@/constants/enumLabels';
import { canView } from '@/utils/canView';
import formatDate from '@/utils/formatDate';

const formSchema = toTypedSchema(
  z
    .object({
      phoneNumber: z
        .string({ required_error: '연락처는 필수입니다.' })
        .min(8, '연락처는 필수입니다.')
        .regex(/^010-\d{4}-\d{4}$/, '유효하지 않은 전화번호 형식입니다. (예: 010-1234-5678)')
        .optional(),
      address: z
        .string({ required_error: '주소는 필수입니다.' })
        .nonempty('주소는 필수입니다.')
        .optional(),
      department: z.string({ required_error: '부서는 필수입니다.' }),
      extension: z
        .string({ required_error: '내선 번호는 필수입니다.' })
        .length(5, '내선 번호는 5자리여야 합니다.')
        .optional(),
      position: z.string({ required_error: '직급 필수입니다.' }).optional(),
      role: z.string({ required_error: '권한 설정은 필수입니다.' }).optional(),
      status: z.string({ required_error: '재직 상태 설정은 필수입니다.' }).optional(),
      hiredDate: z.string().optional(),
      terminationDate: z.string().optional(),
      password: z
        .string({ required_error: '비밀번호 필수입니다.' })
        .min(8, '비밀번호는 8자 이상이어야 합니다.')
        .optional(),
      passwordConfirm: z
        .string({ required_error: '비밀번호 확인은 필수입니다.' })
        .min(8, '비밀번호 확인을 입력해주세요.')
        .optional(),
    })
    .refine(data => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: '비밀번호가 일치하지 않습니다.',
    }),
);

const route = useRoute();

const { data: userDetail } = useGetUser(route.params.userId);
const { mutate: updateUser } = useUpdateUser(route.params.userId);
const isResigned = computed(() => userDetail.value.userStatus === 'RESIGNED');
const isEditable = computed(() => {
  return canView(['ADMIN']) && !isResigned.value;
});

const userInfo = computed(() => [
  { label: '사번', value: userDetail.value.empNo },
  { label: '이름', value: userDetail.value.userName },
  { label: '이메일', value: userDetail.value.userEmail },
]);

const onSubmit = values => {
  const params = {
    userPassword: values.password,
    userPhoneNumber: values.phoneNumber,
    userDepartment: values.department,
    userExtension: values.extension,
    userPosition: values.position,
    userRole: values.role,
    userAddress: values.address,
    userStatus: values.status,
    userTerminationDate: values.terminationDate,
  };
  updateUser(params);
};
</script>

<style scoped></style>
