<template>
  <div class="flex-1">
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
    </Table>

    <div class="max-h-[390px] overflow-auto">
      <Table class="w-full table-fixed">
        <TableBody>
          <TableRow
            v-for="(defective, idx) in props.defectives"
            :key="idx"
            class="text-center border-b border-dotted border-gray-300"
          >
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.defectiveCode }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.defectiveName }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.defectiveType }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.defectiveQty }}
            </TableCell>
            <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ defective.defectiveRate }}
            </TableCell>
          </TableRow>
          <TableRow v-if="props.defectives.length === 0" class="border-b">
            <TableCell :colspan="5" class="text-center py-8 text-gray-500">
              불량 데이터가 없습니다.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
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

console.log(props.defectives);
</script>
