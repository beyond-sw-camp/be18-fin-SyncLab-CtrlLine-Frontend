<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">사용자 목록</h3>
    <RouterLink to="/base-management/users/new">
      <Button size="sm"> New <ChevronRightIcon class="ml-1" /> </Button>
    </RouterLink>
  </div>

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
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

        <TableBody v-if="userList && userList.content">
          <!-- 유저는 semibold로 변경 goToDetail 이벤트 동작 못하게 막기 -->
          <TableRow
            v-for="(user, index) in userList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(user.id)"
          >
            <TableCell class="py-3">{{ user.userName }}</TableCell>
            <TableCell>{{ user.userEmail }}</TableCell>
            <TableCell>{{ user.userDepartment }}</TableCell>
            <TableCell>{{ user.userPhoneNumber }}</TableCell>
            <TableCell>
              <span
                :class="{
                  'text-[#095A8C]': EMPLOYMENT_STATUS_LABELS[user.userStatus] === '재직',
                  'text-[#8B5401]': EMPLOYMENT_STATUS_LABELS[user.userStatus] === '휴직',
                  'text-[#969696]': EMPLOYMENT_STATUS_LABELS[user.userStatus] === '퇴사',
                }"
              >
                {{ EMPLOYMENT_STATUS_LABELS[user.userStatus] }}
              </span>
            </TableCell>
            <TableCell>{{ ROLE_LABELS[user.userRole] }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="userList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { ChevronRightIcon } from 'lucide-vue-next';
import { RouterLink, useRouter } from 'vue-router';

import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EMPLOYMENT_STATUS_LABELS, ROLE_LABELS } from '@/constants/enumLabels';

const router = useRouter();
const { data: userList, page } = useGetUserList();

const goToDetail = userId => {
  router.push(`/base-management/users/${userId}`);
};
</script>

<style scoped></style>
