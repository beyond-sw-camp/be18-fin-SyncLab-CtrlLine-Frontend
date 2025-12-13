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
            :options="departmentOptions"
          />

          <div v-if="isAdmin">
            <FilterInput label="전화번호" v-model="localFilters.userPhoneNumber" />
          </div>

          <FilterSelect
            label="상태"
            v-model="localFilters.userStatus"
            :options="userStatusOptions"
          />

          <FilterSelect label="권한" v-model="localFilters.userRole" :options="userRoleOptions" />
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
import { computed, reactive } from 'vue';

import FilterInput from '@/components/filter/FilterInput.vue';
import FilterSelect from '@/components/filter/FilterSelect.vue';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { DEPARTMENT_LABELS, EMPLOYMENT_STATUS_LABELS, ROLE_LABELS } from '@/constants/enumLabels';
import { canView } from '@/utils/canView';

const emit = defineEmits(['search']);
const isAdmin = canView(['ADMIN']);

const localFilters = reactive({
  userName: '',
  userEmail: '',
  userDepartment: null,
  userPhoneNumber: '',
  userStatus: null,
  userRole: null,
});

const userStatusOptions = computed(() => {
  const options = Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  options.unshift({ value: null, label: '전체' });

  return options;
});

const userRoleOptions = computed(() => {
  const options = Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  options.unshift({ value: null, label: '전체' });

  return options;
});

const departmentOptions = computed(() => {
  const options = Object.entries(DEPARTMENT_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  options.unshift({ value: null, label: '전체' });

  return options;
});

const applyFilters = () => {
  emit('search', { ...localFilters });
};

const resetFilters = () => {
  // 초기화하고 바로 조회
  Object.assign(localFilters, {
    userName: null,
    userDepartment: null,
    userStatus: null,
    userRole: null,
    userPhoneNumber: '',
    userEmail: '',
  });
  emit('search', { ...localFilters });
};
</script>
