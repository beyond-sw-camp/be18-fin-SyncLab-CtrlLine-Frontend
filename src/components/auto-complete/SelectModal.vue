<template>
  <Dialog :open="open" @update:open="onDialogToggle">
    <DialogContent class="min-w-[700px] w-full flex flex-col">
      <DialogHeader>
        <DialogTitle>{{ label }} 선택</DialogTitle>
        <DialogDescription>{{ withObjectParticle(label) }} 검색하고 선택하세요.</DialogDescription>
      </DialogHeader>

      <!-- 검색창 (실시간 검색) -->
      <div class="border-b pb-3">
        <Input
          type="text"
          :value="searchText"
          :placeholder="`${label}을 입력하세요`"
          @input="onSearchInput"
          @compositionstart="isComposing = true"
          @compositionend="onCompositionEnd"
          @keydown.enter.prevent="onEnter"
        />
      </div>

      <div class="flex-1 max-h-[300px] overflow-auto">
        <Table class="table-fixed w-full">
          <TableHeader class="border-b-2 border-primary sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead v-for="(th, i) in props.tableHeaders" :key="i" class="text-center">
                {{ th }}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-if="flatContent.length === 0" class="border-b">
              <TableCell :colspan="props.fields.length" class="text-center py-8 text-gray-500">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
            <TableRow
              v-for="item in flatContent"
              :key="item[keyField]"
              @click="select(item)"
              class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
            >
              <TableCell
                v-for="(field, i) in props.fields"
                :key="i"
                class="py-3 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <template v-if="field === 'isActive'">
                  <Badge
                    :class="
                      item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    "
                  >
                    {{ item.isActive ? '사용' : '미사용' }}
                  </Badge>
                </template>
                <template v-else-if="field === 'userStatus'">
                  <span
                    :class="{
                      'text-[#095A8C]': EMPLOYMENT_STATUS_LABELS[item.userStatus] === '재직',
                      'text-[#8B5401]': EMPLOYMENT_STATUS_LABELS[item.userStatus] === '휴직',
                      'text-[#969696]': EMPLOYMENT_STATUS_LABELS[item.userStatus] === '퇴사',
                    }"
                  >
                    {{ EMPLOYMENT_STATUS_LABELS[item.userStatus] }}
                  </span>
                </template>

                <template v-else-if="field === 'userRole'">
                  {{ ROLE_LABELS[item.userRole] }}
                </template>

                <template v-else>
                  {{ item[field] }}
                </template>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <BasePagination v-model="page" :total-pages="data?.pageInfo?.totalPages ?? 1" class="pt-4" />
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';

import BasePagination from '@/components/pagination/BasePagination.vue';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EMPLOYMENT_STATUS_LABELS, ROLE_LABELS } from '@/constants/enumLabels';
import withObjectParticle from '@/utils/withObjectParticle';

const props = defineProps({
  open: Boolean,
  initialKeyword: String,
  label: String,
  fetchList: Function,
  keyField: String,
  nameField: String,
  fields: Array,
  tableHeaders: Array,
});

const emit = defineEmits(['selected', 'close']);

const searchText = ref('');
const isComposing = ref(false);
const { data, filters, page, refetch } = props.fetchList();

const flatContent = computed(() => {
  const content = data.value?.content ?? [];
  return Array.isArray(content[0]) ? content[0] : content;
});

// 모달 열릴 때 초기화 및 자동검색
watch(
  () => props.open,
  async open => {
    if (open) {
      searchText.value = props.initialKeyword ?? '';
      filters[props.nameField] = searchText.value;
      page.value = 1;
      await refetch();

      // 검색창에 포커스
      await nextTick();
    }
  },
);

// 실시간 검색 입력
function onSearchInput(e) {
  searchText.value = e.target.value;
  if (!isComposing.value) {
    performSearch();
  }
}

function onCompositionEnd(e) {
  isComposing.value = false;
  searchText.value = e.target.value;
  performSearch();
}

// 실시간 검색 실행
async function performSearch() {
  filters[props.nameField] = searchText.value;
  page.value = 1;
  await refetch();
}

// 엔터키 처리 (이미 실시간 검색 중이므로 별도 동작 없음)
function onEnter() {
  if (isComposing.value) return;
  // 엔터는 단순히 포커스만 이동하거나 첫 번째 항목 선택 등으로 활용 가능
}

function select(item) {
  emit('selected', item);
  emit('close');
}

function onDialogToggle(v) {
  if (!v) emit('close');
}

watch(page, refetch);
</script>
