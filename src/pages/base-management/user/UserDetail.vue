<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">사용자 상세 조회</h3>

    <Button
      type="submit"
      form="userUpdateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
      size="sm"
    >
      Save
    </Button>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Card v-if="userDetail" class="w-full md:w-[260px] h-fit">
      <CardContent class="flex flex-col gap-8 md:h-[500px] items-center">
        <div class="flex justify-center"><UserProfile /></div>
        <ul class="flex flex-col gap-4">
          <li v-for="item in userInfo" :key="item.label" class="flex">
            <span class="pr-2 w-15 text-right text-gray-600 text-sm">{{ item.label }}</span>
            <span
              class="block overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] md:max-w-[150px] text-sm"
            >
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
        // 상세 정보에 내선 번호, 입사일, 퇴사일, 주소, 비밀번호 없음
        // password: userDetail.userPassword,
        // address: userDetail.userAddress,
        // hiredDate: userDetail.hiredDate,
        // terminationDate: userDetail.terminationDate,
        // extension: userDetail.userExtension,
      }"
    >
      <div>
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

      <div>
        <h4 class="text-base font-semibold mb-4 border-b pb-2">소속 정보</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField v-slot="{ componentField, errorMessage }" name="department">
            <FormItem>
              <FormLabel>부서</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="custom-input w-full">
                    <SelectValue placeholder="부서를 선택하세요." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="영업 1팀">영업 1팀</SelectItem>
                    <SelectItem value="영업 2팀">영업 2팀</SelectItem>
                    <SelectItem value="생산 1팀">생산 1팀</SelectItem>
                    <SelectItem value="생산 2팀">생산 2팀</SelectItem>
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
                  class="custom-input w-full"
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
                  <SelectTrigger class="custom-input w-full">
                    <SelectValue placeholder="직급을 선택하세요." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSISTANT">주임</SelectItem>
                    <SelectItem value="ASSISTANT_MANAGER">대리</SelectItem>
                    <SelectItem value="MANAGER">과장</SelectItem>
                    <SelectItem value="GENERAL_MANAGER">부장</SelectItem>
                    <SelectItem value="DIRECTOR">이사</SelectItem>
                    <SelectItem value="CEO">대표</SelectItem>
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
                  <SelectTrigger class="custom-input w-full">
                    <SelectValue placeholder="권한을 선택하세요." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">유저</SelectItem>
                    <SelectItem value="MANAGER">담당자</SelectItem>
                    <SelectItem value="ADMIN">관리자</SelectItem>
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
                  <SelectTrigger class="custom-input w-full">
                    <SelectValue placeholder="재직 상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">재직</SelectItem>
                    <SelectItem value="LEAVE">휴직</SelectItem>
                    <SelectItem value="RESIGNED">퇴사</SelectItem>
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
                <Input type="date" v-bind="componentField" />
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
    </Form>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { z } from 'zod';

import useGetUser from '@/apis/query-hooks/user/useGetUser';
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
import formatDate from '@/utils/formatDate';

const formSchema = toTypedSchema(
  z
    .object({
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
      status: z.string({ required_error: '재직 상태 설정은 필수입니다.' }),
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

const route = useRoute();

const { data: userDetail } = useGetUser(route.params.userId);

console.log(userDetail);

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
  console.log(params);
  // createUser(params);
};
</script>

<style scoped></style>
