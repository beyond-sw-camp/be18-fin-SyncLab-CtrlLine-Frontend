<template>
  <Table class="w-full table-fixed">
    <TableHeader class="border-b-2 border-primary">
      <TableRow>
        <TableHead class="text-center">품목코드</TableHead>
        <TableHead class="text-center">품목명</TableHead>
        <TableHead class="text-center">규격</TableHead>
        <TableHead class="text-center">단위</TableHead>
        <TableHead class="text-center">총 수량</TableHead>
        <TableHead class="text-center">생산 실적 수량</TableHead>
        <TableHead class="text-center">불량 수량</TableHead>
        <TableHead class="text-center">불량률</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody v-if="PPDetail">
      <TableRow class="text-center border-b border-dotted border-gray-300">
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ PPDetail.itemCode }}
        </TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ PPDetail.itemName }}
        </TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ PPDetail.itemSpecification }}
        </TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ PPDetail.itemUnit }}
        </TableCell>

        <TableCell class="py-3 text-end">
          {{ PPDetail.totalQty }}
        </TableCell>
        <TableCell class="py-3 text-end">
          {{ PPDetail.performanceQty }}
        </TableCell>
        <TableCell class="py-3 text-end">
          {{ PPDetail.defectiveQty }}
        </TableCell>
        <TableCell class="py-3 text-end">
          {{ PPDetail.defectiveRate }}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup>
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// defineProps 이름 itemDetail -> PPDetail로 변경
defineProps({
  PPDetail: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});
</script>
