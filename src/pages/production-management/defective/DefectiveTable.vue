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

    <TableBody>
      <TableRow
        v-for="(defective, idx) in props.defectives"
        :key="idx"
        class="text-center border-b border-dotted border-gray-300"
      >
        <TableCell>{{ defective.defectiveCode }}</TableCell>
        <TableCell>{{ defective.defectiveName }}</TableCell>
        <TableCell>{{ defective.defectiveType }}</TableCell>
        <TableCell>{{ defective.defectiveQty }}</TableCell>
        <TableCell>{{ defective.defectiveRate }}</TableCell>
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
  defectives: {
    type: Array,
    default: () => [],
  },
});
</script>
