<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">내 정보</h3>
    <Button
      type="submit"
      form="myInfoUpdateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
      size="sm"
    >
      Save
    </Button>
  </div>

  <div class="pb-10">
    <Form
      v-if="myInfo"
      id="myInfoUpdateForm"
      :validation-schema="formSchema"
      class="flex flex-col gap-10"
      :initial-values="{
        empNo: myInfo.empNo,
        name: myInfo.userName,
        department: myInfo.userDepartment,
        status: myInfo.userStatus,
        role: myInfo.userRole,
        position: myInfo.userPosition,
        phoneNumber: myInfo.userPhoneNumber,
        email: myInfo.userEmail,
        address: myInfo.userAddress,
        extension: myInfo.userExtension,
        hiredDate: myInfo.hiredDate,
        terminationDate: myInfo.terminationDate,
      }"
      @submit="onSubmit"
    >
      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">기본 정보</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField v-slot="{ componentField, errorMessage }" name="name">
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="홍길동"
                  v-bind="componentField"
                  autocomplete="name"
                />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="empNo">
            <FormItem>
              <FormLabel>사번</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="20250001"
                  v-bind="componentField"
                  autocomplete="off"
                  disabled
                />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

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

          <FormField v-slot="{ componentField, errorMessage }" name="email">
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  v-bind="componentField"
                  autocomplete="email"
                  disabled
                />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="address">
            <FormItem class="md:col-span-2">
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

      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">보안 설정</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 비밀번호 -->
          <FormField v-slot="{ componentField, errorMessage }" name="password">
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  v-bind="componentField"
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

          <FormField v-slot="{ componentField, errorMessage }" name="extension">
            <FormItem>
              <FormLabel>내선번호</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="내선번호를 입력하세요."
                  v-bind="componentField"
                  class="w-full"
                  disabled
                />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="position">
            <FormItem>
              <FormLabel>직급</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full" disabled>
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

          <FormField v-slot="{ componentField, errorMessage }" name="role">
            <FormItem>
              <FormLabel>권한</FormLabel>
              <FormControl>
                <Select v-bind="componentField" disabled>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="권한을 선택하세요." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="(label, value) in ROLE_LABELS" :key="value" :value="value">
                      {{ label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="status">
            <FormItem>
              <FormLabel>상태</FormLabel>
              <FormControl>
                <Select v-bind="componentField" disabled>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="재직 상태를 선택하세요." />
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

      <div>
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
                <Input type="date" v-bind="componentField" disabled />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import useGetMyInfo from '@/apis/query-hooks/user/useGetMyInfo';
import useUpdateMyInfo from '@/apis/query-hooks/user/useUpdateMyInfo';
import { Button } from '@/components/ui/button';
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

const formSchema = toTypedSchema(
  z
    .object({
      name: z
        .string({ required_error: '이름은 필수입니다.' })
        .nonempty('이름은 필수입니다.')
        .optional(),
      email: z.string().optional(),
      phoneNumber: z
        .string({ required_error: '연락처는 필수입니다.' })
        .min(8, '연락처는 필수입니다.')
        .regex(/^010-\d{4}-\d{4}$/, '유효하지 않은 전화번호 형식입니다. (예: 010-1234-5678)')
        .optional(),
      address: z
        .string({ required_error: '주소는 필수입니다.' })
        .nonempty('주소는 필수입니다.')
        .optional(),
      department: z.string().optional(),
      extension: z.string().optional(),
      position: z.string().optional(),
      role: z.string().optional(),
      status: z.string().optional(),
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

const { data: myInfo } = useGetMyInfo();

const { mutate: updateMyInfo } = useUpdateMyInfo();

// 이름, 주소, 패스워드, 연락처 수정 가능
const onSubmit = (values, { setFieldValue }) => {
  const params = {
    userName: values.name,
    userEmail: values.email,
    userPassword: values.password,
    userPasswordConfirm: values.passwordConfirm,
    userPhoneNumber: values.phoneNumber,
    userAddress: values.address,
  };

  updateMyInfo(params, {
    onSuccess: () => {
      setFieldValue('password', undefined);
      setFieldValue('passwordConfirm', undefined);
    },
  });
};
</script>

<style scoped></style>
