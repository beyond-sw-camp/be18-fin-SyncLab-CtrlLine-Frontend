<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">사용자 등록</h3>
  </div>

  <div>
    <Form
      id="userCreateForm"
      @submit="onSubmit"
      :validation-schema="formSchema"
      class="flex flex-col gap-10"
      :initial-values="{
        status: 'ACTIVE',
      }"
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
                  placeholder="이름을 입력해주세요."
                  v-bind="componentField"
                  autocomplete="name"
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
                  placeholder="이메일을 입력해주세요."
                  v-bind="componentField"
                  autocomplete="email"
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

      <div>
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
                <Select v-bind="componentField">
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
                <Select v-bind="componentField">
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

          <FormField v-slot="{ componentField, errorMessage }" name="role">
            <FormItem>
              <FormLabel>권한</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
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
                <Select v-bind="componentField">
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

      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">입사 정보</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField v-slot="{ componentField, errorMessage }" name="hiredDate">
            <FormItem>
              <FormLabel>입사일</FormLabel>
              <FormControl>
                <Input type="date" v-bind="componentField" />
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
  <div class="flex justify-end pt-6 pb-5">
    <Button
      type="submit"
      size="sm"
      form="userCreateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
    >
      Save
    </Button>
  </div>
</template>

<script setup>
// @ts-nocheck
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import useCreateUser from '@/apis/query-hooks/user/useCreateUser';
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
      name: z.string({ required_error: '이름은 필수입니다.' }).nonempty('이름은 필수입니다.'),
      email: z
        .string({ required_error: '이메일은 필수입니다.' })
        .email('이메일 형식이 올바르지 않습니다.'),
      phoneNumber: z
        .string({ required_error: '연락처는 필수입니다.' })
        .min(8, '연락처는 필수입니다.')
        .regex(/^010-\d{4}-\d{4}$/, '유효하지 않은 전화번호 형식입니다. (예: 010-1234-5678)'),
      address: z.string({ required_error: '주소는 필수입니다.' }).nonempty('주소는 필수입니다.'),
      department: z.string({ required_error: '부서는 필수입니다.' }),
      extension: z
        .string({ required_error: '내선 번호는 필수입니다.' })
        .length(5, '내선 번호는 5자리여야 합니다.'),
      position: z.string({ required_error: '직급 필수입니다.' }),
      role: z.string({ required_error: '권한 설정은 필수입니다.' }),
      status: z.string().optional(),
      hiredDate: z.string({ required_error: '입사일 필수입니다.' }),
      terminationDate: z.string().optional(),
      password: z
        .string({ required_error: '비밀번호 필수입니다.' })
        .min(8, '비밀번호는 8자 이상이어야 합니다.'),
      passwordConfirm: z
        .string({ required_error: '비밀번호 확인은 필수입니다.' })
        .min(8, '비밀번호 확인을 입력해주세요.'),
    })
    .refine(data => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: '비밀번호가 일치하지 않습니다.',
    }),
);

const { mutate: createUser } = useCreateUser();

const onSubmit = values => {
  const params = {
    userName: values.name,
    userEmail: values.email,
    userPassword: values.password,
    userPhoneNumber: values.phoneNumber,
    userDepartment: values.department,
    userExtension: values.extension,
    userPosition: values.position,
    userRole: values.role,
    userAddress: values.address,
    userHiredDate: values.hiredDate,
    userStatus: values.status,
    userTerminationDate: values.terminationDate,
  };
  createUser(params);
};
</script>

<style scoped></style>
