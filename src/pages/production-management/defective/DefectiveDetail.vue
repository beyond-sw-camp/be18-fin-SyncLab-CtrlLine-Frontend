<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">불량 상세 조회</h3>

    <div class="flex gap-2">
      <Badge v-if="defectiveDetail" variant="secondary">
        {{ defectiveDetail.defectiveDocNo }}
      </Badge>
    </div>
  </div>

  <div v-if="defectiveDetail" class="flex flex-col gap-8 md:flex-row">
    <div class="flex-1 flex flex-col gap-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="flex flex-col">
          <Label class="text-sm font-medium mb-1" for="factoryName">공장</Label>
          <Input
            id="factoryName"
            type="text"
            :model-value="defectiveDetail.factoryName"
            class="text-sm"
            readonly
          />
        </div>

        <div class="flex flex-col">
          <Label class="text-sm font-medium mb-1" for="lineName">라인</Label>
          <Input
            id="lineName"
            type="text"
            :model-value="defectiveDetail.lineName"
            readonly
            class="text-sm"
          />
        </div>

        <div class="flex flex-col">
          <Label for="itemName" class="text-sm font-medium mb-1">품목코드</Label>
          <Input
            id="itemName"
            type="text"
            :model-value="`${defectiveDetail.itemCode}`"
            readonly
            class="text-sm"
          />
        </div>

        <div class="flex flex-col">
          <Label for="itemName" class="text-sm font-medium mb-1">품목명</Label>
          <Input
            id="itemName"
            type="text"
            :model-value="`${defectiveDetail.itemName}`"
            readonly
            class="text-sm"
          />
        </div>

        <div class="flex flex-col">
          <Label for="itemSpecification" class="text-sm font-medium mb-1">규격</Label>
          <Input
            id="itemSpecification"
            class="text-sm"
            type="text"
            :model-value="defectiveDetail.itemSpecification"
            readonly
          />
        </div>

        <div class="flex flex-col">
          <Label for="itemUnit" class="text-sm font-medium mb-1">단위</Label>
          <Input
            id="itemUnit"
            class="text-sm"
            type="text"
            :model-value="defectiveDetail.itemUnit"
            readonly
          />
        </div>

        <div class="flex flex-col">
          <Label for="performanceDocNo" class="text-sm font-medium mb-1">생산실적 전표번호</Label>
          <Input
            id="performanceDocNo"
            class="text-sm"
            type="text"
            :model-value="defectiveDetail.performanceDocNo"
            readonly
          />
        </div>

        <div class="flex flex-col">
          <Label for="lotNo" class="text-sm font-medium mb-1">Lot No.</Label>
          <Input
            id="lotNo"
            class="text-sm"
            type="text"
            :model-value="defectiveDetail.lotNo"
            readonly
          />
        </div>
      </div>

      <div class="mt-6">
        <h4 class="text-base font-semibold mb-3 border-b pb-2">불량 상세 내역</h4>
        <DefectiveTable :defectives="defectiveDetail.defectives" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

import useGetDefective from '@/apis/query-hooks/defective/useGetDefective';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DefectiveTable from '@/pages/production-management/defective/DefectiveTable.vue';

const route = useRoute();
const { data: defectiveDetail } = useGetDefective(route.params.planDefectiveId);
</script>
