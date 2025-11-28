<template>
  <div class="flex flex-col gap-1">
    <div class="flex gap-2">
      <div ref="autocompleteRef" class="relative w-full">
        <!-- 입력 -->
        <Input
          type="text"
          :placeholder="`${label}을 입력하세요`"
          v-model="textInput"
          @input="onInput"
          @compositionstart="isComposing = true"
          @compositionend="onCompositionEnd"
          @keydown.enter.prevent="onEnter"
          class="pr-8 text-sm"
          :disabled="disabled"
        />

        <!-- 검색 아이콘 -->
        <Button
          variant="ghost"
          type="button"
          size="xs"
          @click="openModal"
          class="absolute right-2 top-1/2 -translate-y-1/2"
          :disabled="disabled"
        >
          <SearchIcon class="w-4 h-4" />
        </Button>

        <!-- 자동완성 -->
        <ul
          v-if="autoItems.length > 0 && !isItemSelected"
          class="absolute left-0 top-full mt-1 w-full bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-auto"
        >
          <li
            v-for="item in autoItems"
            :key="item[keyField]"
            @click="selectItem(item)"
            class="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs"
          >
            {{ item[nameField] }}
          </li>
        </ul>
      </div>

      <Input type="text" v-bind="componentField" readonly class="w-28 bg-gray-100 text-sm" />
    </div>

    <SelectModal
      :open="showModal"
      :label="label"
      :initialKeyword="textInput"
      :fetchList="fetchList"
      :keyField="keyField"
      :nameField="nameField"
      :fields="fields"
      :tableHeaders="tableHeaders"
      @selected="onModalSelect"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core';
import { SearchIcon } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import SelectModal from '@/components/auto-complete/SelectModal.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


const props = defineProps({
  label: { type: String, required: true },
  value: [Object, String, Number],
  setValue: Function,
  fetchList: { type: Function, required: true },
  keyField: { type: String, required: true },
  nameField: { type: String, required: true },
  fields: { type: Array, required: true },
  tableHeaders: { type: Array, required: true },
  emitFullItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  initialText: { type: String, default: '' },
  componentField: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['selectedFullItem', 'clear']);

const textInput = ref('');
const autoItems = ref([]);
const showModal = ref(false);
const isComposing = ref(false);
const isItemSelected = ref(false);
const autocompleteRef = ref(null);

const { data, filters, refetch } = props.fetchList();

// 입력 이벤트 핸들러
function onInput() {
  isItemSelected.value = false;

  if (!isComposing.value) {
    performAutoCompleteDebounced();
  }
}

function onCompositionEnd() {
  isComposing.value = false;
  isItemSelected.value = false;
  performAutoCompleteDebounced();
}

const performAutoCompleteDebounced = useDebounceFn(async () => {
  // 이미 항목을 선택한 상태면 자동완성 안 함
  if (isItemSelected.value) {
    return;
  }

  const keyword = textInput.value.trim();

  if (!keyword) {
    autoItems.value = [];
    return;
  }

  filters[props.nameField] = keyword;
  await refetch();
  autoItems.value = data.value?.content ?? [];
}, 500);

// 항목 선택
function selectItem(item) {
  isItemSelected.value = true;
  textInput.value = item[props.nameField];
  props.setValue(item[props.keyField]);

  if (props.emitFullItem) {
    emit('selectedFullItem', item);
  }

  autoItems.value = [];
}

// 입력 초기화
function clearInput() {
  textInput.value = '';
  autoItems.value = [];
  isItemSelected.value = false;
  props.setValue('');
  emit('clear');
}

// 엔터키 처리
async function onEnter() {
  if (isComposing.value || !textInput.value.trim()) {
    return;
  }

  // 1) 자동완성 결과가 1개 → 바로 선택
  if (autoItems.value.length === 1) {
    selectItem(autoItems.value[0]);
    return;
  }

  // 2) 자동완성 결과가 여러 개 → 모달 열기
  if (autoItems.value.length > 1) {
    openModal();
    return;
  }

  // 3) 자동완성 결과 없음 → 전체 검색
  await searchAndHandle();
}

// 전체 검색 후 결과 처리
async function searchAndHandle() {
  filters[props.nameField] = textInput.value.trim();
  await refetch();

  const list = data.value?.content ?? [];

  if (list.length === 0) {
    toast.info('검색 결과가 없습니다.');
  } else if (list.length === 1) {
    selectItem(list[0]);
  } else {
    openModal();
  }
}

function openModal() {
  autoItems.value = [];
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

// 모달에서 항목 선택
function onModalSelect(item) {
  selectItem(item);
  closeModal();
}

// initialText 변경 감지
watch(
  () => props.initialText,
  (newText) => {
    if (newText) {
      textInput.value = newText;
      isItemSelected.value = true;
    }
  },
  { immediate: true }
);

// value 외부 변경 감지
watch(
  () => props.value,
  (newValue) => {
    const isEmpty = newValue === '' || newValue === null || newValue === undefined;

    if (isEmpty && textInput.value) {
      clearInput();
    }
  }
);

// textInput 직접 변경 감지
watch(textInput, (newValue) => {
  if (!newValue) {
    clearInput();
  }
});
</script>
