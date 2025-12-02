<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h3 class="text-2xl font-semibold text-gray-900">로그 조회</h3>
      </div>

      <div class="flex items-center">
        <Button
          class="rounded-full bg-[#5B6D4C] px-6 py-2 text-white hover:bg-[#4C5C3F]"
          :disabled="!hasSearched || isLogsLoading || !logRows.length"
          @click="exportCsv"
        >
          Export
        </Button>
      </div>
    </header>

    <Dialog v-model:open="isFilterOpen">
      <DialogTrigger as-child>
        <button
          class="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-200"
        >
          Filter by
          <ChevronDown class="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent class="max-w-[600px] rounded-3xl border border-gray-300 p-8 shadow-xl">
        <DialogHeader class="flex items-center justify-between p-0">
          <DialogTitle class="text-lg font-semibold text-gray-800">필터 설정</DialogTitle>
        </DialogHeader>

        <div class="mt-4 space-y-4">
          <div class="filter-row">
            <span class="filter-label">일자</span>
            <div class="flex flex-wrap items-center gap-2">
              <input v-model="filterForm.fromDate" type="date" class="filter-input w-36" />
              <span class="text-gray-400">~</span>
              <input v-model="filterForm.toDate" type="date" class="filter-input w-36" />
            </div>
          </div>

          <div class="filter-row">
            <span class="filter-label">테이블</span>
            <div class="relative flex-1">
              <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                v-model="filterForm.table"
                placeholder="검색"
                class="filter-input filter-input--icon w-full"
                type="text"
              />
            </div>
          </div>

          <div class="filter-row">
            <span class="filter-label">담당자</span>
            <div class="relative flex-1">
              <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                v-model="filterForm.user"
                placeholder="검색"
                class="filter-input filter-input--icon w-full"
                type="text"
              />
            </div>
          </div>

          <div class="filter-row">
            <span class="filter-label">속성</span>
            <div class="filter-field">
              <select v-model="filterForm.property" class="filter-input w-full">
                <option value="">전체</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter class="mt-6 flex justify-end">
          <Button
            class="rounded-full bg-[#5B6D4C] px-6 py-2 text-white hover:bg-[#4C5C3F]"
            :disabled="isApplying"
            @click="applyFilters"
          >
            조회
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="rounded-xl border border-gray-200 bg-white">
      <table class="w-full table-fixed">
        <thead class="text-sm font-semibold text-gray-600">
          <tr class="border-b border-gray-200">
            <th class="px-4 py-3 text-left">일자</th>
            <th class="px-4 py-3 text-left">테이블</th>
            <th class="px-4 py-3 text-left">담당자</th>
            <th class="px-4 py-3 text-left">속성</th>
          </tr>
        </thead>
        <tbody v-if="!hasSearched">
          <tr>
            <td class="px-4 py-10 text-center text-sm text-gray-400" colspan="4">
              필터를 설정한 뒤 조회 버튼을 눌러주세요.
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="isLogsLoading">
          <tr>
            <td class="px-4 py-10 text-center text-sm text-gray-400" colspan="4">
              로그 데이터를 불러오는 중입니다...
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="logRows.length">
          <tr
            v-for="log in logRows"
            :key="log.logId"
            class="border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50"
          >
            <td class="px-4 py-3">{{ formatDate(log.createdAt) }}</td>
            <td class="px-4 py-3">{{ log.entityName }}</td>
            <td class="px-4 py-3">
              {{ userNameMap[log.userId] ?? `사용자 #${log.userId}` }}
            </td>
            <td class="px-4 py-3 font-semibold text-[#5B6D4C]">{{ log.actionType }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td class="px-4 py-10 text-center text-sm text-gray-400" colspan="4">
              조건에 맞는 로그가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { ChevronDown, Search } from 'lucide-vue-next';
import { computed, reactive, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import { getLogList } from '@/apis/query-functions/log';
import { getUser, getUserList } from '@/apis/query-functions/user';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { buildQueryObject } from '@/utils/buildQueryObject';

const isFilterOpen = ref(false);
const isApplying = ref(false);
const hasSearched = ref(false);

const defaultFilter = () => ({
  fromDate: '',
  toDate: '',
  table: '',
  user: '',
  property: '',
});

const filterForm = reactive(defaultFilter());
const activeFilters = reactive({
  userId: null,
  entityName: '',
  actionType: '',
  fromDate: '',
  toDate: '',
});

const queryParams = computed(() =>
  buildQueryObject({
    userId: activeFilters.userId,
    entityName: activeFilters.entityName,
    actionType: activeFilters.actionType,
    fromDate: activeFilters.fromDate,
    toDate: activeFilters.toDate,
  }),
);

const {
  data: logList,
  isFetching: isLogsLoading,
  refetch: refetchLogs,
} = useQuery({
  queryKey: ['logList', queryParams],
  queryFn: () => getLogList(queryParams.value),
  enabled: false,
  placeholderData: keepPreviousData,
});

const logRows = computed(() => logList.value ?? []);
const userNameMap = reactive({});
const pendingUserFetch = new Set();

const fetchUserName = async userId => {
  if (!userId || pendingUserFetch.has(userId)) return;
  pendingUserFetch.add(userId);
  try {
    const user = await getUser(userId);
    userNameMap[userId] = user.userName ?? `사용자 #${userId}`;
  } catch {
    userNameMap[userId] = `사용자 #${userId}`;
  } finally {
    pendingUserFetch.delete(userId);
  }
};

watch(
  logRows,
  logs => {
    const missingIds = [
      ...new Set(logs.map(log => log.userId).filter(id => id && !userNameMap[id])),
    ];
    missingIds.forEach(fetchUserName);
  },
  { immediate: true },
);

const resolveUserId = async () => {
  const trimmed = filterForm.user.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const userResult = await getUserList({ userName: trimmed, page: 0, size: 5 });
  const matches = userResult?.content ?? [];

  if (!matches.length) {
    throw new Error('USER_NOT_FOUND');
  }

  const exactMatch = matches.find(user => user.userName === trimmed);

  if (!exactMatch && matches.length > 1) {
    throw new Error('USER_AMBIGUOUS');
  }

  const selected = exactMatch ?? matches[0];
  filterForm.user = selected.userName;
  return selected.id;
};

const applyFilters = async () => {
  if (isApplying.value) return;

  try {
    isApplying.value = true;
    let resolvedUserId = null;

    try {
      resolvedUserId = await resolveUserId();
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        toast.error('일치하는 담당자가 없습니다.');
        return;
      }
      if (error.message === 'USER_AMBIGUOUS') {
        toast.error('담당자 이름이 여러 명과 일치합니다. 전체 이름을 입력해주세요.');
        return;
      }
      throw error;
    }

    Object.assign(activeFilters, {
      userId: resolvedUserId,
      entityName: filterForm.table.trim(),
      actionType: filterForm.property,
      fromDate: filterForm.fromDate,
      toDate: filterForm.toDate,
    });

    hasSearched.value = true;
    await refetchLogs();
    isFilterOpen.value = false;
  } catch (error) {
    console.error(error);
    toast.error('필터 적용 중 오류가 발생했습니다.');
  } finally {
    isApplying.value = false;
  }
};

const exportCsv = () => {
  if (!hasSearched.value) {
    toast.error('먼저 조회를 실행해주세요.');
    return;
  }

  if (!logRows.value.length) {
    toast.error('내보낼 로그가 없습니다.');
    return;
  }

  const headers = ['일자', '테이블', '담당자', '속성'];

  const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const rows = logRows.value.map(log => [
    formatDate(log.createdAt),
    log.entityName ?? '',
    userNameMap[log.userId] ?? `사용자 #${log.userId}`,
    log.actionType ?? '',
  ]);

  const csvContent = [headers.map(escapeCsv).join(',')]
    .concat(rows.map(row => row.map(escapeCsv).join(',')))
    .join('\n');

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

const formatDate = value => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};
</script>

<style scoped>
.filter-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-label {
  width: 5rem;
  border-radius: 0.5rem;
  background-color: #5b6d4c;
  padding: 0.5rem 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

.filter-input {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: #f7f8f9;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #374151;
}

.filter-input:focus {
  border-color: #5b6d4c;
  background-color: #ffffff;
  outline: none;
}

.filter-input--icon {
  padding-left: 2.5rem;
}

.filter-field {
  flex: 1;
  width: 100%;
}
</style>
