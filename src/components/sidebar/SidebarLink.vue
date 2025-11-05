<template>
  <div
    @click="go"
    :class="[
      'cursor-pointer px-3 py-1.5 rounded transition-all select-none',
      isCurrentPage
        ? 'bg-primary-600 text-white font-semibold'
        : 'hover:bg-primary-400 hover:font-semibold',
    ]"
  >
    {{ label }}
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  label: String,
  to: String,
});

const route = useRoute();
const router = useRouter();

const isCurrentPage = computed(() => route.path === props.to);

const go = () => {
  if (props.to && route.path !== props.to) {
    router.push(props.to);
  }
};
</script>
