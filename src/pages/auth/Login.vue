<template>
  <div class="grid grid-cols-2 md:grid-cols-2 h-screen overflow-auto">
    <div class="flex flex-col justify-center w-full max-w-sm mx-auto px-6">
      <div class="flex flex-col gap-1 mb-4">
        <h1 class="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
          Synclab
        </h1>
        <h2 class="text-2xl mt-6">
          환영합니다
        </h2>
        <h3 class="text-xl">
          로그인
        </h3>
      </div>
      <Form @submit="onSubmit" :validation-schema="formSchema" class="flex flex-col gap-8">
        <FormField
          v-slot="{ componentField, errorMessage }"
          name="email"
        >
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="이메일을 입력해주세요."
                v-bind="componentField"
                class="w-full"
              />
              <p class="text-red-500 text-sm">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField, errorMessage }"
          name="password"
        >
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="비밀번호를 입력해주세요."
                v-bind="componentField"
                class="w-full"
              />
              <p class="text-red-500 text-sm">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <Button type="submit" class="mt-8 w-full cursor-pointer">
          로그인
        </Button>
      </Form>
    </div>
    <div class="flex justify-center items-center">
      <LoginSideIllustration class="w-full h-full object-contain max-h-screen" />
    </div>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

import LoginSideIllustration from '@/assets/login-side-illustration.svg' 
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = toTypedSchema(z.object({
  email: z
      .string({ required_error: '이메일은 필수입니다.' })
      .email('이메일 형식이 올바르지 않습니다.'),
    password: z
      .string({ required_error: '비밀번호는 필수입니다.' })
      .min(8, '비밀번호는 8자 이상이어야 합니다.'),
}))

const onSubmit = (values) => {
  console.log("submit", values)
};

</script>

<style lang="scss" scoped></style>
