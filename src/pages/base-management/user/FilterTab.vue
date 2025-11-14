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
          <FilterInput label="사원명" v-model="localFilters.userName" />

          <FilterInput label="이메일" v-model="localFilters.userEmail" />

          <FilterSelect
            label="부서명"
            v-model="localFilters.userDepartment"
            :options="[
              { value: null, label: '전체' },
              { value: '영업 1팀', label: '영업 1팀' },
              { value: '영업 2팀', label: '영업 2팀' },
              { value: '생산 1팀', label: '생산 1팀' },
              { value: '생산 2팀', label: '생산 2팀' },
            ]"
          />

          <FilterInput label="전화번호" v-model="localFilters.userPhoneNumber" />

          <FilterSelect
            label="상태"
            v-model="localFilters.userStatus"
            :options="[
              { value: null, label: '전체' },
              { value: 'ACTIVE', label: '재직' },
              { value: 'LEAVE', label: '휴직' },
              { value: 'RESIGNED', label: '퇴사' },
            ]"
          />

          <FilterSelect
            label="권한"
            v-model="localFilters.userRole"
            :options="[
              { value: null, label: '전체' },
              { value: 'USER', label: '유저' },
              { value: 'MANAGER', label: '매니저' },
              { value: 'ADMIN', label: '관리자' },
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
import { reactive } from 'vue';

import FilterInput from '@/components/filter/FilterInput.vue';
import FilterSelect from '@/components/filter/FilterSelect.vue';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const emit = defineEmits(['search']);

const localFilters = reactive({
  userName: '',
  userEmail: '',
  userDepartment: null,
  userPhoneNumber: '',
  userStatus: null,
  userRole: null,
});
const applyFilters = () => {
  emit('search', { ...localFilters });
};

const resetFilters = () => {
  // 초기화하고 바로 조회
  Object.assign(localFilters, {
    userDepartment: null,
    userStatus: null,
    userRole: null,
    userPhoneNumber: '',
    userEmail: '',
  });
  emit('search', { ...localFilters });
};
</script>
