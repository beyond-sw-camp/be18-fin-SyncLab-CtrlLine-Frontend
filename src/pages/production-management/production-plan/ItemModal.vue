<template>
  <Dialog :open="open" @update:open="onDialogToggle">
    <DialogContent class="flex flex-col min-w-[700px] w-full">
      <DialogHeader>
        <DialogTitle>품목 선택</DialogTitle>
        <DialogDescription> 원하는 품목을 검색하거나 선택하세요. </DialogDescription>
      </DialogHeader>

      <div class="border-b pb-3">
        <Input
          type="text"
          v-model="searchText"
          placeholder="품목명을 입력하여 검색하세요"
          @keyup.enter="refetchSearch"
        />
      </div>
      <div class="flex flex-col">
        <div>
          <Table class="w-full table-fixed">
            <TableHeader class="border-b-2 border-primary">
              <TableRow>
                <TableHead class="text-center">품목코드</TableHead>
                <TableHead class="text-center">품목명</TableHead>
                <TableHead class="text-center">규격</TableHead>
                <TableHead class="text-center">단위</TableHead>
                <TableHead class="text-center">품목구분</TableHead>
                <TableHead class="text-center">사용여부</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        <div class="max-h-[300px] overflow-y-auto overflow-x-hidden">
          <Table class="w-full table-fixed">
            <TableBody v-if="data?.content">
              <TableRow
                v-for="item in data.content"
                :key="item.itemCode"
                class="hover:bg-gray-50 hover:font-medium hover:underline text-center transition-all border-b border-dotted border-gray-300 cursor-pointer"
                @click="selectItem(item)"
              >
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ item.itemCode }}
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ item.itemName }}
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ item.itemSpecification }}
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ item.itemUnit }}
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ item.itemStatus }}
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  <Badge
                    :class="
                      item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    "
                  >
                    {{ item.isActive ? '사용' : '미사용' }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div class="pt-4">
          <BasePagination v-model="page" :total-pages="data?.pageInfo?.totalPages ?? 1" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

import useGetItemList from '@/apis/query-hooks/item/useGetItemList';
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

const props = defineProps({
  open: Boolean,
  initialKeyword: String, // 시나리오별 입력창 keyword
});

const emit = defineEmits(['close', 'selected']);

const searchText = ref(props.initialKeyword ?? '');

const { data, filters, page, refetch } = useGetItemList({
  itemName: props.initialKeyword ?? '',
});

/* 모달 열릴 때 첫 검색 */
watch(
  () => props.open,
  async isOpen => {
    if (isOpen) {
      searchText.value = props.initialKeyword ?? '';
      filters.itemName = props.initialKeyword ?? '';
      page.value = 1;
      await refetch();
    }
  },
);

/* 페이징 시 재조회 */
watch(page, async () => {
  await refetch();
});

/* 검색 */
async function refetchSearch() {
  filters.itemName = searchText.value;
  page.value = 1;
  await refetch();
}

/* 선택 */
function selectItem(item) {
  emit('selected', item);
  emit('close');
}

/* 닫기 */
function onDialogToggle(val) {
  if (!val) emit('close');
}
</script>
