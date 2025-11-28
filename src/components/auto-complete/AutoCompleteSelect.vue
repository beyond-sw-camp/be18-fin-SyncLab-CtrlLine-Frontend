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

      <!-- 코드 표시 영역 -->
      <Input type="text" :value="value" readonly class="w-28 bg-gray-100 text-sm" />
    </div>

    <!-- 에러메시지는 FormField에서 출력하므로 여기서는 제외 -->

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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import SelectModal from './SelectModal.vue';

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
  onItemCleared: { type: Function, default: null },
});

const textInput = ref('');
const autoItems = ref([]);
const showModal = ref(false);
const isComposing = ref(false);
const isItemSelected = ref(false);

const { data, filters, refetch } = props.fetchList();
const emit = defineEmits(['selectedFullItem', 'clear']);

// 입력 이벤트
function onInput() {
  isItemSelected.value = false; // 사용자가 직접 입력하면 선택 상태 해제

  if (!isComposing.value) {
    performAutoCompleteDebounced();
  }
}

function onCompositionEnd() {
  isComposing.value = false;
  isItemSelected.value = false; // 한글 입력도 직접 입력으로 간주
  performAutoCompleteDebounced();
}

// 실시간 자동완성 검색
async function performAutoComplete() {
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
}

const performAutoCompleteDebounced = useDebounceFn(performAutoComplete, 500);

// 자동완성 항목 선택
function selectItem(item) {
  isItemSelected.value = true;
  textInput.value = item[props.nameField];
  props.setValue(item[props.keyField]);

  if (props.emitFullItem) {
    emit('selectedFullItem', item); // 전체 객체 전달
  }

  autoItems.value = [];
}

// 엔터키 처리
async function onEnter() {
  if (isComposing.value) return; // 한글 입력 중이면 무시
  if (!textInput.value.trim()) return;

  // 1. 자동완성 결과가 1개면 바로 선택
  if (autoItems.value.length === 1) {
    selectItem(autoItems.value[0]);
    return;
  }

  // 2. 자동완성 결과가 2개 이상이면 모달 오픈
  if (autoItems.value.length > 1) {
    autoItems.value = []; // 자동완성 드롭다운 숨김
    showModal.value = true;
    return;
  }

  // 3. 자동완성 결과가 없으면 강제 검색
  filters[props.nameField] = textInput.value;
  await refetch();

  const list = data.value?.content ?? [];

  if (list.length === 1) {
    selectItem(list[0]);
  } else if (list.length > 1) {
    showModal.value = true;
  } else {
    toast.info('검색 결과가 없습니다.');
  }
}

function openModal() {
  autoItems.value = []; // 자동완성 드롭다운 숨김
  showModal.value = true;
}

function onModalSelect(item) {
  props.setValue(item[props.keyField]);
  textInput.value = item[props.nameField];
  isItemSelected.value = true; // 모달에서 선택 시에도 선택 상태로 표시

  if (props.emitFullItem) {
    emit('selectedFullItem', item); // 전체 객체 전달
  }

  showModal.value = false;
}

// 모달 열릴 때 자동완성 드롭다운 숨김
watch(showModal, isOpen => {
  if (isOpen) {
    autoItems.value = [];
  }
});

// 입력값 초기화 시 코드도 초기화
watch(textInput, v => {
  if (!v) {
    props.setValue('');
    autoItems.value = [];
    isItemSelected.value = false; // 입력값 지우면 선택 상태 해제
    emit('clear');
  }
});

watch(
  () => props.value,
  newVal => {
    // 외부에서 값이 비워졌을 때 ('' | null | undefined)
    if (newVal === '' || newVal === null || newVal === undefined) {
      textInput.value = '';
      autoItems.value = [];
      isItemSelected.value = false;
      emit('clear'); // 부모 onItemCleared 호출
    }
  },
);
</script>
