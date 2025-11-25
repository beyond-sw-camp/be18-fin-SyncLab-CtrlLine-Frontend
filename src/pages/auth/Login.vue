<template>
  <div class="grid grid-cols-2 md:grid-cols-2 h-screen">
    <div class="flex justify-center items-center">
      <div class="max-w-sm w-full px-6">
        <div class="flex flex-col gap-1 mb-4">
          <div class="flex justify-end">
            <Dialog>
              <DialogTrigger as-child class="border-primary">
                <Button variant="outline" class="text-primary">가입문의</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    <div class="flex items-center gap-1"><InfoIcon />가입문의</div>
                  </DialogTitle>
                  <DialogDescription class="flex flex-col items-center gap-2 text-black">
                    <p>CtrlLine</p>
                    <p>02-111-1234</p>
                    <p>beyond@synclab.com</p>
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose as-child>
                    <Button type="button" variant="secondary" class="cursor-pointer">확인</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <img src="@/assets/logo.png" class="h-[60px] w-fit" alt="logo" />
          <h2 class="text-2xl mt-6">환영합니다</h2>
          <h3 class="text-xl">로그인</h3>
        </div>
        <Form @submit="onSubmit" :validation-schema="formSchema" class="flex flex-col gap-8">
          <FormField v-slot="{ componentField, errorMessage }" name="email">
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="이메일을 입력해주세요."
                  v-bind="componentField"
                  autocomplete="email"
                  class="w-full"
                />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="password">
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  v-bind="componentField"
                  autocomplete="password"
                  class="w-full"
                />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>

          <Button
            type="submit"
            class="mt-8 w-full bg-primary text-white hover:bg-primary-600 cursor-pointer"
          >
            로그인
          </Button>
        </Form>
      </div>
    </div>

    <div>
      <img
        src="@/assets/login-side-illustration.png"
        alt="login-side-illustration"
        class="w-full h-full object-cover max-h-screen"
      />
    </div>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { InfoIcon } from 'lucide-vue-next';
import { z } from 'zod';

import useLogin from '@/apis/query-hooks/auth/useLogin';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: '이메일은 필수입니다.' })
      .email('이메일 형식이 올바르지 않습니다.'),
    password: z
      .string({ required_error: '비밀번호는 필수입니다.' })
      .min(8, '비밀번호는 8자 이상이어야 합니다.'),
  }),
);

const { mutate: login } = useLogin();

const onSubmit = values => {
  login(values);
};
</script>

<style lang="scss" scoped></style>
