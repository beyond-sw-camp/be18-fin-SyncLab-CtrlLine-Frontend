<template>
  <Table class="w-full table-fixed">
    <TableHeader class="border-b-2 border-primary">
      <TableRow>
        <TableHead class="text-center">불량코드</TableHead>
        <TableHead class="text-center">불량명</TableHead>
        <TableHead class="text-center">불량타입</TableHead>
        <TableHead class="text-center">불량수량</TableHead>
        <TableHead class="text-center">불량률(%)</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody v-if="props.defectiveDetail?.length">
      <TableRow
        v-for="(row, idx) in props.defectiveDetail"
        :key="idx"
        class="text-center border-b border-dotted border-gray-300"
      >
        <TableCell>{{ row.defectiveCode }}</TableCell>
        <TableCell>{{ row.defectiveName }}</TableCell>
        <TableCell>{{ row.defectiveType }}</TableCell>
        <TableCell>{{ row.defectiveQty }}</TableCell>
        <TableCell>{{ row.defectiveRate }}</TableCell>
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

const props = defineProps({
  defectiveDetail: {
    type: Array,
    default: () => [],
  },
});
</script>
