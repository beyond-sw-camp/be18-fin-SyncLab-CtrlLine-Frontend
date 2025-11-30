<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">라인 목록</h3>
  </div>

  <FilterTab :filters="filters" @search="onSearch" />

  <div class="flex flex-col">
    <div class="min-h-[600px] flex-1">
      <Table class="w-full table-fixed">
        <TableHeader class="border-b-2 border-primary">
          <TableRow>
<<<<<<< HEAD
            <TableHead class="text-center"><Checkbox /></TableHead>
            <TableHead class="text-center">라인코드</TableHead>
            <TableHead class="text-center">라인명</TableHead>
            <TableHead class="text-center">담당부서</TableHead>
            <TableHead class="text-center">담당자</TableHead>
            <TableHead class="text-center">사용여부</TableHead>
=======
            <TableHead class="text-center whitespace-nowrap overflow-hidden w-10">
              <Checkbox class="size-4 border-[1.5px]" />
            </TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">라인코드</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">라인명</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당부서</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">담당자</TableHead>
            <TableHead class="text-center whitespace-nowrap overflow-hidden">사용여부</TableHead>
>>>>>>> aa81ce4a176fcbb0241daff421729b16a3ccceb7
          </TableRow>
        </TableHeader>

        <TableBody v-if="lineList && lineList.content">
          <TableRow
            v-for="(line, index) in lineList.content"
            :key="index"
            class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            @click="goToDetail(line.lineCode)"
          >
<<<<<<< HEAD
            <TableCell class="table-checkbox-cell py-3 whitespace-nowrap" @click.stop>
              <Checkbox />
            </TableCell>
=======
            <TableCell
              class="py-3 whitespace-nowrap overflow-hidden text-ellipsis flex justify-center"
              @click.stop
            >
              <Checkbox class="size-4 border-[1.5px]" />
            </TableCell>

>>>>>>> aa81ce4a176fcbb0241daff421729b16a3ccceb7
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ line.lineCode }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ line.lineName }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ line.userDepartment }}
            </TableCell>
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
              {{ line.userName }}
            </TableCell>
<<<<<<< HEAD
            <TableCell class="whitespace-nowrap overflow-hidden text-ellipsis">
=======
            <TableCell class="whitespace-nowrap overflow-hidden">
>>>>>>> aa81ce4a176fcbb0241daff421729b16a3ccceb7
              <Badge
                class="w-[50px] mx-auto"
                :class="
                  line.isActive
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                "
              >
                {{ line.isActive ? '사용' : '미사용' }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <BasePagination v-model="page" :total-pages="lineList?.pageInfo?.totalPages ?? 1" />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import BasePagination from '@/components/pagination/BasePagination.vue';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterTab from '@/pages/base-management/line/FilterTab.vue';
<<<<<<< HEAD
import { buildQueryObject } from '@/utils/buildQueryObject';
=======
>>>>>>> aa81ce4a176fcbb0241daff421729b16a3ccceb7

const route = useRoute();
const router = useRouter();

<<<<<<< HEAD
const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  page.value = 1;
  refetch();
};

=======
const initialFilters = {
  lineName: route.query.lineName || '',
  userName: route.query.userName || '',
  userDepartment: route.query.userDepartment || null,
};

const { data: lineList, page, filters } = useGetLineList(initialFilters);

>>>>>>> aa81ce4a176fcbb0241daff421729b16a3ccceb7
const goToDetail = lineCode => {
  router.push(`/base-management/lines/${lineCode}`);
};

<<<<<<< HEAD
const { data: lineList, refetch, page, filters } = useGetLineList();

if (route.query.page) {
  const p = Number(route.query.page);
  if (!Number.isNaN(p) && p > 0) {
    page.value = p;
  }
}

const syncQuery = () => {
  const query = buildQueryObject({
    page: page.value,
    ...filters,
  });

  router.replace({ query });
};

// page / status 변경 시
watch([page], () => {
  syncQuery();
});
=======
const onSearch = newFilters => {
  Object.assign(filters, newFilters);
  syncQuery();
  page.value = 1;
};

const syncQuery = () => {
  const query = {
    ...filters,
    page: page.value,
  };

  const cleaned = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== null && v !== '' && v !== undefined),
  );

  router.replace({ query: cleaned });
};

watch(
  () => ({ ...filters }),
  () => {
    syncQuery();
  },
  { deep: true },
);

watch(page, () => {
  syncQuery();
});

watch(
  () => route.query,
  newQuery => {
    page.value = Number(newQuery.page ?? 1);

    filters.lineName = newQuery.lineName ?? '';
    filters.userName = newQuery.userName ?? '';
    filters.userDepartment = newQuery.userDepartment ?? null;
  },
);
>>>>>>> aa81ce4a176fcbb0241daff421729b16a3ccceb7
</script>

<style lang="scss" scoped></style>
