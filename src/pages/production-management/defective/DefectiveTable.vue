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

    <TableBody v-if="defectiveDetail">
      <TableRow class="text-center border-b border-dotted border-gray-300">
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ defectiveDetail.defectiveCode }}
        </TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ defectiveDetail.defectiveName }}
        </TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ defectiveDetail.defectiveType }}
        </TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ defectiveDetail.defectiveQty }}
        </TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ defectiveDetail.defectiveRate }}
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

defineProps({
  defectiveDetail: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});
</script>
