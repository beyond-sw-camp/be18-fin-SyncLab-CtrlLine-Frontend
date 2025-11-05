<template>
  <RouterLink
    :to="to"
    @click="updateBreadcrumb"
    active-class="bg-primary-600 text-white font-semibold"
    class="flex cursor-pointer px-3 py-1.5 rounded transition-all select-none hover:bg-primary-400 hover:font-semibold"
  >
    {{ label }}
  </RouterLink>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore';

const props = defineProps({
  label: String,
  to: String,
  parentLabel: String, // 상위 메뉴 이름 전달
  rootLabel: String, // 루트 그룹 이름 전달
});

const route = useRoute();
const breadcrumbStore = useBreadcrumbStore();

const updateBreadcrumb = () => {
  breadcrumbStore.setBreadcrumbByPath(props.to);
};

onMounted(() => {
  breadcrumbStore.setBreadcrumbByPath(route.path);
});

// 경로 변경 시 자동 반영
watch(
  () => route.path,
  newPath => breadcrumbStore.setBreadcrumbByPath(newPath),
);
</script>
