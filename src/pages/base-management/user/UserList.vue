<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">사용자 목록</h3>
    <RouterLink to="/base-management/users/new">
      <Button size="sm"> New <ChevronRightIcon class="ml-1" /> </Button>
    </RouterLink>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">사원명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">Email</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">부서명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">연락처</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">상태</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">권한</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="userList && userList.content">
          <TableRow
            v-for="(user, index) in userList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(user.id)"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ user.userName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ user.userEmail }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ user.userDepartment }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ user.userPhoneNumber }}
            </TableCell>
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
  <AlertDialog v-model:open="deniedModal">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          <div class="flex items-center gap-2"><InfoIcon :size="20" />접근 권한</div>
        </AlertDialogTitle>
        <AlertDialogDescription>
          매니저 이상만 사용자 상세 페이지에 접근할 수 있습니다.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogAction @click="deniedModal = false"> 확인 </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup>
import { ChevronRightIcon, InfoIcon } from 'lucide-vue-next';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import FilterTab from '@/pages/base-management/user/FilterTab.vue';

const router = useRouter();
const deniedModal = ref(false);

const { data: userList, refetch, page, filters } = useGetUserList();

const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1; // 첫 페이지 부터 조회
  refetch();
};

const goToDetail = userId => {
  router.push(`/base-management/users/${userId}`);
};
</script>

<style scoped></style>
