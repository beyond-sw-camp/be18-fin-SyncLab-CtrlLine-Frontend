<template>
  <Accordion type="single" collapsible>
    <AccordionItem value="filters">
      <div class="flex w-fit px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
        <AccordionTrigger class="p-0 hover:no-underline cursor-pointer">
          Filter by
        </AccordionTrigger>
      </div>

      <AccordionContent class="p-4 border-b-2 border-t-2 my-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label class="text-xs">생성일자</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[180px]">
                <FilterInput type="date" v-model="localFilters.formDate" placeholder="시작일" />
              </div>

              <span class="block text-gray-400 w-full lg:w-fit">~</span>

              <div class="flex-1 min-w-[180px]">
                <FilterInput type="date" v-model="localFilters.toDate" placeholder="종료일" />
              </div>
            </div>
          </div>
          <FilterInput label="테이블" v-model="localFilters.entityName" />
          <FilterInput label="담당자" v-model="localFilters.userId" />

          <FilterSelect
            label="속성"
            v-model="localFilters.actionType"
            :options="[
              { value: null, label: '전체' },
              { value: 'CREATE', label: 'CREATE' },
              { value: 'UPDATE', label: 'UPDATE' },
              { value: 'DELETE', label: 'DELETE' },
            ]"
          />
        </div>

        <div class="flex justify-end mt-4 gap-2">
          <Button
            variant="outline"
            @click="resetFilters"
            size="xs"
            class="text-sm font-normal px-6"
          >
            초기화
          </Button>
          <Button
            class="bg-primary text-white text-sm font-normal px-6"
            @click="applyFilters"
            size="xs"
          >
            조회
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup>
import { reactive, watch } from 'vue';

import FilterInput from '@/components/filter/FilterInput.vue';
import FilterSelect from '@/components/filter/FilterSelect.vue';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const props = defineProps({
  filters: { type: Object, required: true },
  userOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(['search', 'reset']);

const localFilters = reactive({
  formDate: props.filters.formDate ?? null,
  toDate: props.filters.toDate ?? null,
  entityName: props.filters.entityName ?? '',
  userId: props.filters.userId ?? '',
  actionType: props.filters.actionType ?? null,
});

watch(
  () => props.filters,
  newVal => {
    Object.assign(localFilters, newVal);
  },
  { deep: true },
);

const applyFilters = () => {
  emit('search', { ...localFilters });
};

const resetFilters = () => {
  // 초기화하고 바로 조회
  Object.assign(localFilters, {
    formDate: null,
    toDate: null,
    entityName: '',
    userId: '',
    actionType: null,
  });
  emit('reset', { ...localFilters });
};
</script>
