<template>
  <Table class="w-full table-fixed">
    <TableHeader class="border-b-2 border-primary">
      <TableRow>
        <TableHead class="text-center">품목코드</TableHead>
        <TableHead class="text-center">품목명</TableHead>
        <TableHead class="text-center">규격</TableHead>
        <TableHead class="text-center">생산계획수량</TableHead>
        <TableHead class="text-center">단위</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody v-if="itemDetail">
      <TableRow class="text-center border-b border-dotted border-gray-300">
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">{{
          itemDetail.itemCode
        }}</TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">{{
          itemDetail.itemName
        }}</TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">{{
          itemDetail.itemSpecification
        }}</TableCell>
        <TableCell>
          <FormField name="plannedQty" v-slot="{ componentField, errorMessage }">
            <Input type="number" v-bind="componentField" class="text-end" />
            <p class="text-red-500 text-[10px] pt-1">{{ errorMessage }}</p>
          </FormField>
        </TableCell>
        <TableCell class="py-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ itemDetail.itemUnit }}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup>
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

defineProps({
  itemDetail: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});
</script>
