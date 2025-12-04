<template>
  <Card class="flex flex-col overflow-hidden text-left">
    <CardContent class="flex flex-col gap-4 py-4">
      <div class="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span>NG 유형 분포</span>
        <span class="text-[11px] text-muted-foreground/80">실시간</span>
      </div>

      <NgDistributionDetail :data="data" :config="config" :show-list="false" />

      <div class="flex justify-end">
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline" size="sm" class="text-primary">NG 분포 상세보기</Button>
          </DialogTrigger>
          <DialogContent class="max-w-4xl">
            <DialogHeader>
              <DialogTitle>NG 분포 상세보기</DialogTitle>
              <DialogDescription>선택한 공장의 NG 유형 분포를 자세히 확인합니다.</DialogDescription>
            </DialogHeader>

            <div class="max-h-[70vh] overflow-y-auto pr-2">
              <NgDistributionDetail :data="data" :config="config" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CardContent>
    <CardFooter class="bg-muted/50 py-3 text-xs text-muted-foreground">
      NG Type 현황
    </CardFooter>
  </Card>
</template>

<script setup>
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PIE_CHART_CONFIG } from '@/constants/chartConfig';
import NgDistributionDetail from '@/pages/dashboard/NgDistributionDetail.vue';

defineProps({
  data: { type: Array, required: true },
  config: {
    type: Object,
    default: () => PIE_CHART_CONFIG,
  },
});
</script>
