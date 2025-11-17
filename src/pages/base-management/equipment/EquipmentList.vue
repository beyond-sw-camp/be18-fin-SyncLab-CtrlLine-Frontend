<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">설비 목록 조회</h3>
  </div>

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
            <TableHead class="text-center">설비코드</TableHead>
            <TableHead class="text-center">설비명</TableHead>
            <TableHead class="text-center">설비유형</TableHead>
            <TableHead class="text-center">담당부서</TableHead>
            <TableHead class="text-center">담당자</TableHead>
            <TableHead class="text-center">사용여부</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="equipmentList && equipmentList.content">
          <TableRow
            v-for="(equipment, index) in equipmentList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(equipment.equipmentCode)"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.equipmentCode }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.equipmentName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.equipmentType }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.userDepartment }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ equipment.userName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              <Badge
                class="w-[50px]"
                :class="
                  equipment.isActive
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                "
              >
                {{ equipment.isActive ? '사용' : '미사용' }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="equipmentList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import BasePagination from '@/components/pagination/BasePagination.vue';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const router = useRouter();

const page = ref(1);
const equipmentList = ref({
  content: [
    {
      equipmentCode: 'F1-CL1-AU001',
      equipmentName: '조립설비',
      equipmentType: 'FEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-AU002',
      equipmentName: '조립설비',
      equipmentType: 'FEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-CCP001',
      equipmentName: '셀세정기',
      equipmentType: 'BEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-CCP002',
      equipmentName: '셀세정기',
      equipmentType: 'BEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-EU001',
      equipmentName: '전극설비',
      equipmentType: 'FEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-EU002',
      equipmentName: '전극설비',
      equipmentType: 'FEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-FAU001',
      equipmentName: '활성화설비',
      equipmentType: 'FEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-FAU002',
      equipmentName: '활성화설비',
      equipmentType: 'FEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-FIP001',
      equipmentName: '검사기',
      equipmentType: 'BEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
    {
      equipmentCode: 'F1-CL1-FIP001',
      equipmentName: '검사기',
      equipmentType: 'BEOL',
      userDepartment: '영업 1팀',
      userName: '이인화',
      empNo: '202510001',
      isActive: true,
    },
  ],
  pageInfo: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 2,
    totalElements: 14,
    sort: [
      {
        sortBy: 'equipmentCode',
        direction: 'asc',
      },
    ],
  },
});

const goToDetail = equipmentCode => {
  router.push(`/base-management/equipments/${equipmentCode}`);
};
</script>

<style scoped></style>
