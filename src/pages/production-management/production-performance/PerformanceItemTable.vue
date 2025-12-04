<template>
  <Table class="w-full table-fixed">
    <TableHeader class="border-b-2 border-primary">
      <TableRow>
        <TableHead class="text-center">품목코드</TableHead>
        <TableHead class="text-center">품목명</TableHead>
        <TableHead class="text-center">규격</TableHead>
        <TableHead class="text-center">총 투입수량</TableHead>
        <TableHead class="text-center">실적수량</TableHead>
        <TableHead class="text-center">불량수량</TableHead>
        <TableHead class="text-center">불량률</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody v-if="itemDetail">
      <TableRow class="text-center border-b border-dotted border-gray-300">
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ itemDetail.itemCode }}</TableCell
        >
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">{{
          itemDetail.itemName
        }}</TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">{{
          itemDetail.itemSpecification
        }}</TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis"
          >{{ formatNumber(itemDetail.totalQty) }} {{ itemDetail.itemUnit }}</TableCell
        >
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis"
          >{{ formatNumber(itemDetail.performanceQty) }} {{ itemDetail.itemUnit }}</TableCell
        >
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis"
          >{{ formatNumber(itemDetail.defectiveQty) }} {{ itemDetail.itemUnit }}</TableCell
        >
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis"
          >{{ formatNumber(itemDetail.defectiveRate) }} %</TableCell
        >
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

defineProps({
  itemDetail: { type: Object, required: true },
});

const formatNumber = value => {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString(); // 수 3자리 콤마 자동 적용
};
</script>
