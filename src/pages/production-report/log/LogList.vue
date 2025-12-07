<template>
  <div class="flex justify-between items-center">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">로그 현황</h3>
    <Button size="sm" class="cursor-pointer w-[70px]" @click="exportCsv" :disabled="!hasSearched">
      Export
    </Button>
  </div>

  <FilterTab :filters="filters" @search="onSearch" @reset="onReset" />

  <div class="flex flex-col mt-4">
    <div class="min-h-[550px] flex-1">
      <div class="overflow-x-auto">
        <Table class="w-full">
          <TableHeader class="border-b-2 border-primary">
            <TableRow>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 일자 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 테이블 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 담당자 </TableHead>
              <TableHead class="text-center whitespace-nowrap overflow-hidden"> 속성 </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody v-if="!hasSearched">
            <TableRow>
              <TableCell colspan="4" class="text-center py-10 text-gray-500">
                필터를 설정한 뒤 조회 버튼을 눌러주세요.
              </TableCell>
            </TableRow>
          </TableBody>

          <TableBody v-else-if="isLogsLoading">
            <TableRow>
              <TableCell colspan="4" class="text-center py-10 text-gray-500">
                로그 데이터를 불러오는 중입니다...
              </TableCell>
            </TableRow>
          </TableBody>

          <TableBody v-else-if="logList && logList.length">
            <TableRow
              v-for="log in logList"
              :key="log.logId"
              class="text-center transition-all border-b border-dotted border-gray-300 hover:bg-gray-50"
            >
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ formatDate(log.createdAt) }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ log.entityName }}
              </TableCell>
              <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                {{
                  userNameMap[log.userId]
                    ? `${userNameMap[log.userId]} (${log.userId})`
                    : `사용자 #${log.userId}`
                }}
              </TableCell>
              <TableCell
                class="py-3 whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-primary"
              >
                {{ log.actionType }}
              </TableCell>
            </TableRow>
          </TableBody>

          <TableBody v-else>
            <TableRow>
              <TableCell colspan="4" class="text-center py-10 text-gray-500">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { getUser, getUserList } from '@/apis/query-functions/user';
import useGetLogList from '@/apis/query-hooks/log/useGetLogList';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterTab from '@/pages/production-report/log/FilterTab.vue';
import { buildQueryObject } from '@/utils/buildQueryObject';
import formatDate from '@/utils/formatDate';

const route = useRoute();
const router = useRouter();

const initialFilters = {
  formDate: null,
  toDate: null,
  entityName: '',
  userId: '',
  actionType: null,
};

const hasSearched = ref(false);

const {
  data: logList,
  isFetching: isLogsLoading,
  filters,
} = useGetLogList(initialFilters, hasSearched);

const resolveUserId = async keyword => {
  const trimmed = (keyword ?? '').trim();

  // 아무 것도 안 넣으면 필터 없음
  if (!trimmed) return '';

  // 전부 숫자면 그대로 userId로 사용
  if (/^\d+$/.test(trimmed)) {
    return trimmed; // 문자열로 두어도 백엔드에서 숫자로 파싱 가능할 듯
  }

  // 이름인 경우: 이름으로 유저 목록 조회
  try {
    const result = await getUserList({
      userName: trimmed,
    });

    const matches = result?.content ?? [];
    const total = result?.pageInfo?.totalElements ?? matches.length;

    // 결과 없음
    if (total === 0) {
      toast.error('해당 이름의 사용자를 찾을 수 없습니다. userId로 다시 입력해주세요.');
      return null;
    }

    // 동명이인 여러 명
    if (total > 1) {
      toast.error('동명이인이 여러 명입니다. userId로 검색해주세요.');
      return null;
    }

    //  딱 한 명일 때 그 사람 id 사용
    const user = matches[0];
    return String(user.id);
  } catch (e) {
    console.error(e);
    toast.error('사용자 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    return null; // 에러 나면 검색 중단
  }
};

const userNameMap = reactive({});
// 중복 요청 방지용
const pendingUserFetch = new Set();

const fetchUserName = async userId => {
  if (!userId) return;
  // 이미 가지고 있거나 요청 중이면 스킵
  if (userNameMap[userId] || pendingUserFetch.has(userId)) return;

  pendingUserFetch.add(userId);
  try {
    const user = await getUser(userId);
    userNameMap[userId] = user?.userName ?? `사용자 #${userId}`;
  } catch {
    userNameMap[userId] = `사용자 #${userId}`;
  } finally {
    pendingUserFetch.delete(userId);
  }
};

watch(
  logList,
  logs => {
    if (!logs) return;
    logs.forEach(log => {
      const id = log.userId;
      if (id != null) {
        fetchUserName(id);
      }
    });
  },
  { immediate: true },
);

const onSearch = async newFilters => {
  // 담당자 인풋에 들어온 값 (이름 or id)
  const keyword = newFilters.userId;

  // 이름/숫자 해석해서 실제 userId 결정
  const resolvedUserId = await resolveUserId(keyword);

  // null이면 (에러 or 동명이인) → 검색 중단
  if (resolvedUserId === null) {
    return;
  }

  Object.assign(filters, {
    ...filters,
    ...newFilters,
    userId: resolvedUserId, // 👈 백엔드로 나가는 건 항상 이 값
  });

  hasSearched.value = true;
  syncQuery();
};

const onReset = newFilters => {
  Object.assign(filters, newFilters);
  hasSearched.value = false;
  router.replace({ path: route.path, query: {} });
};

const syncQuery = () => {
  const query = buildQueryObject({
    ...filters,
  });

  router.replace({ query });
};

const exportCsv = () => {
  // 아직 조회 전이면 막기
  if (!hasSearched.value || !logList.value || logList.value.length === 0) {
    return;
  }

  const logs = logList.value ?? [];

  // 헤더 정의
  const headers = ['일자', '테이블', '담당자', '속성'];

  // CSV 특수문자 이스케이프 함수
  const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

  // 로그 → CSV row 변환
  const rows = logs.map(log => {
    const userLabel = userNameMap[log.userId]
      ? `${userNameMap[log.userId]} (${log.userId})`
      : `사용자 #${log.userId}`;

    return [formatDate(log.createdAt), log.entityName ?? '', userLabel, log.actionType ?? ''];
  });

  // 최종 CSV 문자열 만들기
  const csvContent = [headers.map(escapeCsv).join(',')]
    .concat(rows.map(row => row.map(escapeCsv).join(',')))
    .join('\n');

  // Blob + 다운로드 트리거
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `logs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

onMounted(() => {
  // 쿼리스트링이 남아 쿼리 비우기
  if (Object.keys(route.query).length > 0) {
    router.replace({
      path: route.path, // 현재 경로 유지
      query: {},
    });
  }
});
</script>

<style scoped></style>
