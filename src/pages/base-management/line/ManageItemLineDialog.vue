<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button size="sm" class="bg-[#6B8865] hover:bg-[#485945]" :disabled="!lineCode">
        생산 가능 품목 등록
      </Button>
    </DialogTrigger>

    <DialogContent class="rounded-2xl p-6 sm:max-w-[720px]">
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold">생산 가능 품목 관리</DialogTitle>
        <DialogDescription class="text-sm text-gray-600">
          라인에 생산 가능 품목으로 등록할 대상 품목을 선택하세요.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3 py-3 text-sm text-gray-600">
        <div class="flex justify-between items-center">
          <p>
            선택된 품목
            <span class="font-semibold text-gray-900">{{ selectedCount }}</span>
            / {{ allItems.length }}
          </p>
          <div class="flex items-center gap-2" @click.stop>
            <Checkbox
              :modelValue="isAllChecked"
              @update:modelValue="toggleAll"
              class="border-[1.5px]"
              :disabled="allItems.length === 0"
            />
            <span class="text-xs">전체 선택</span>
          </div>
        </div>
        <Input
          v-model="searchKeyword"
          placeholder="품목코드 또는 품목명을 검색하세요."
          class="h-9"
        />
      </div>

      <div class="border rounded-xl">
        <div v-if="isLoading" class="p-8 text-center text-sm text-muted-foreground">
          품목 정보를 불러오는 중입니다...
        </div>
        <div v-else class="max-h-[420px] overflow-y-auto">
          <Table class="w-full table-fixed">
            <TableHeader class="border-b border-gray-200">
              <TableRow>
                <TableHead class="w-12 text-center">선택</TableHead>
                <TableHead class="text-center w-1/4">품목코드</TableHead>
                <TableHead class="text-center w-1/4">품목명</TableHead>
                <TableHead class="text-center">규격</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody v-if="filteredItems.length">
              <TableRow
                v-for="item in filteredItems"
                :key="item.itemCode"
                class="text-center border-b border-dotted border-gray-200"
              >
                <TableCell class="py-3">
                  <Checkbox
                    :modelValue="isChecked(item.itemCode)"
                    @update:modelValue="checked => toggleItem(checked, item.itemCode)"
                    class="border-[1.5px]"
                  />
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ item.itemCode }}
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ item.itemName }}
                </TableCell>
                <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ item.itemSpecification || '-' }}
                </TableCell>
              </TableRow>
            </TableBody>
            <TableBody v-else>
              <TableRow>
                <TableCell colspan="4" class="text-center py-10 text-gray-500">
                  {{ allItems.length ? '검색 결과가 없습니다.' : '등록된 품목이 없습니다.' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <DialogFooter class="flex mt-5">
        <DialogClose as-child>
          <Button variant="outline">취소</Button>
        </DialogClose>
        <Button type="button" @click="onSave" :disabled="isSubmitDisabled">
          {{ isUpdating ? '저장 중...' : '저장' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, ref, toRefs, watch } from 'vue';

import useGetAllItems from '@/apis/query-hooks/item/useGetAllItems';
import useGetItemLineList from '@/apis/query-hooks/item-line/useGetItemLineList';
import useUpdateItemLine from '@/apis/query-hooks/item-line/useUpdateItemLine';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  lineCode: {
    type: String,
    required: true,
  },
});

const { lineCode } = toRefs(props);

const isDialogOpen = ref(false);
const selectedItemCodes = ref(new Set());
const searchKeyword = ref('');

const {
  data: allItemList,
  isLoading: isItemsLoading,
  isFetching: isItemsFetching,
  refetch: refetchAllItems,
} = useGetAllItems(isDialogOpen);
const {
  data: itemLineList,
  isLoading: isItemLineLoading,
  isFetching: isItemLineFetching,
  refetch: refetchItemLines,
} = useGetItemLineList(lineCode, isDialogOpen);

const allItems = computed(() => allItemList.value?.content ?? []);
const filteredItems = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return allItems.value;

  return allItems.value.filter(item => {
    const code = item.itemCode?.toLowerCase() ?? '';
    const name = item.itemName?.toLowerCase() ?? '';
    const spec = item.itemSpecification?.toLowerCase() ?? '';
    return code.includes(keyword) || name.includes(keyword) || spec.includes(keyword);
  });
});
const selectedCount = computed(() => selectedItemCodes.value.size);
const isLoading = computed(() => isItemsLoading.value || isItemLineLoading.value);
const isFetching = computed(() => isItemsFetching.value || isItemLineFetching.value);

const isChecked = itemCode => {
  return selectedItemCodes.value.has(itemCode);
};

const toggleItem = (checked, itemCode) => {
  const next = new Set(selectedItemCodes.value);
  if (checked) {
    next.add(itemCode);
  } else {
    next.delete(itemCode);
  }
  selectedItemCodes.value = next;
};

const isAllChecked = computed(() => {
  if (filteredItems.value.length === 0) return false;

  return filteredItems.value.every(item => selectedItemCodes.value.has(item.itemCode));
});

const toggleAll = checked => {
  const next = new Set(selectedItemCodes.value);

  if (checked) {
    filteredItems.value.forEach(item => next.add(item.itemCode));
  } else {
    filteredItems.value.forEach(item => next.delete(item.itemCode));
  }

  selectedItemCodes.value = next;
};

const initializeSelection = () => {
  if (!itemLineList.value) return;
  selectedItemCodes.value = new Set(itemLineList.value.map(item => item.itemCode));
};

watch(itemLineList, () => {
  initializeSelection();
});

watch(lineCode, () => {
  if (isDialogOpen.value) {
    refetchItemLines();
  }
});

watch(isDialogOpen, open => {
  if (open) {
    searchKeyword.value = '';
    initializeSelection();
    refetchAllItems();
    refetchItemLines();
  }
});

const { mutate: updateItemLine, isPending: isUpdating } = useUpdateItemLine(lineCode);

const isSubmitDisabled = computed(
  () => !lineCode.value || isUpdating.value || isFetching.value,
);

const onSave = () => {
  if (isSubmitDisabled.value || !lineCode.value) return;

  const itemCodes = Array.from(selectedItemCodes.value);
  updateItemLine(
    { itemCodes },
    {
      onSuccess: () => {
        isDialogOpen.value = false;
      },
    },
  );
};

</script>
