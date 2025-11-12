<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">사용자 목록</h3>
      <Button type="button" size="sm">New<ChevronRightIcon /></Button>
    </div>

    <div>
      <Table class="w-full">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead>사원명</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>부서명</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>권한</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="(user, index) in users"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium text-center transition-all border-b border-dotted border-gray-300"
          >
            <TableCell class="py-3">{{ user.name }}</TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>{{ user.department }}</TableCell>
            <TableCell>{{ user.phone }}</TableCell>
            <TableCell>
              <span
                :class="{
                  'text-[#095A8C]': user.status === '재직',
                  'text-[#8B5401]': user.status === '휴직',
                  'text-[#969696]': user.status === '퇴사',
                }"
              >
                {{ user.status }}
              </span>
            </TableCell>
            <TableCell>{{ user.role }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup>
import { ChevronRightIcon } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const users = [
  {
    name: '김택곤',
    email: 'abc@naver.com',
    department: '생산 1팀',
    phone: '010-1111-1111',
    status: '재직',
    role: '관리자',
  },
  {
    name: '서현원',
    email: 'abc@naver.com',
    department: '생산 1팀',
    phone: '010-1111-1111',
    status: '휴직',
    role: '담당자',
  },
  {
    name: '이인화',
    email: 'abc@naver.com',
    department: '생산 1팀',
    phone: '010-1111-1111',
    status: '퇴사',
    role: '유저',
  },
  {
    name: '육세윤',
    email: 'abc@naver.com',
    department: '생산 2팀',
    phone: '010-1111-1111',
    status: '퇴사',
    role: '유저',
  },
  {
    name: '김대의',
    email: 'abc@naver.com',
    department: '생산 2팀',
    phone: '010-1111-1111',
    status: '재직',
    role: '유저',
  },
  {
    name: '최정필',
    email: 'abc@naver.com',
    department: '생산 3팀',
    phone: '010-1111-1111',
    status: '재직',
    role: '유저',
  },
  {
    name: '박채연',
    email: 'abc@naver.com',
    department: '생산 4팀',
    phone: '010-1111-1111',
    status: '퇴사',
    role: '유저',
  },
  {
    name: '윤동기',
    email: 'abc@naver.com',
    department: '생산 1팀',
    phone: '010-1111-1111',
    status: '재직',
    role: '유저',
  },
  {
    name: '김민준',
    email: 'abc@naver.com',
    department: '생산 2팀',
    phone: '010-1111-1111',
    status: '재직',
    role: '유저',
  },
  {
    name: '박종원',
    email: 'abc@naver.com',
    department: '생산 1팀',
    phone: '010-1111-1111',
    status: '재직',
    role: '담당자',
  },
];
</script>

<style scoped>
:deep(th),
:deep(td) {
  text-align: center;
  vertical-align: middle;
}
</style>
