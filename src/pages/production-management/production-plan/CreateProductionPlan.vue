<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 등록</h3>
    <Button
      type="submit"
      form="productionPlanCreateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
      size="sm"
    >
      Save
    </Button>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <Form
      id="productionPlanCreateForm"
      :validation-schema="formSchema"
      @submit="onSubmit"
      class="flex-1 flex flex-col gap-2"
      :initial-values="{
        status: 'PENDING',
        plannedQty: 0,
      }"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <FormField v-slot="{ componentField, errorMessage }" name="factoryCode">
          <FormItem>
            <FormLabel>공장명</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="custom-input w-full">
                  <SelectValue placeholder="공장을 선택해주세요." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem
                    v-for="factory in factoryList?.content ?? []"
                    :key="factory.factoryCode"
                    :value="factory.factoryCode"
                  >
                    {{ factory.factoryName }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="dueDate">
          <FormItem>
            <FormLabel>납기일자</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" autocomplete="due-date" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="productionManagerNo" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>생산담당자</FormLabel>
            <FormControl>
              <div class="flex gap-2 items-center">
                <Input type="text" placeholder="생산담당자를 입력하세요" class="flex-1" />
                <Input type="text" v-bind="componentField" class="w-28 bg-gray-100" readonly />
              </div>
            </FormControl>
            <p class="text-red-500 text-xs">{{ errorMessage }}</p>
          </FormItem>
        </FormField>

        <FormField name="itemCode" v-slot="{ value, setValue, errorMessage }">
          <FormItem>
            <FormLabel>품목명</FormLabel>
            <FormControl>
              <div class="flex gap-2">
                <div class="relative w-full">
                  <Input
                    type="text"
                    placeholder="품목명을 입력하세요"
                    v-model="itemNameInput"
                    @compositionstart="isComposing = true"
                    @compositionend="onCompositionEnd"
                    @input="onItemAutoInput"
                    @keydown.enter.prevent="onEnter(setValue)"
                    class="pr-8"
                  />
                  <Button
                    variant="ghost"
                    type="button"
                    @click="onSearchIconClick(setValue)"
                    size="xs"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:bg-transparent"
                  >
                    <SearchIcon class="w-4 h-4" />
                  </Button>
                  <ul
                    v-if="autoCompleteItems.length > 0"
                    class="absolute left-0 top-full mt-1 w-full bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-auto"
                  >
                    <li
                      v-for="item in autoCompleteItems"
                      :key="item.itemCode"
                      @click="selectItemFromAutoComplete(item, setValue)"
                      class="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs"
                    >
                      {{ item.itemName }}
                    </li>
                  </ul>
                </div>
                <Input type="text" :value="value" readonly class="w-28 bg-gray-100" />
              </div>
            </FormControl>
            <p class="text-red-500 text-xs">{{ errorMessage }}</p>
          </FormItem>
        </FormField>

        <ItemModal
          :open="showItemModal"
          :initialKeyword="itemNameInput"
          @close="showItemModal = false"
          @selected="onModalSelect"
        />

        <FormField v-slot="{ componentField, errorMessage }" name="startTime">
          <FormItem>
            <FormLabel>생산시작시간</FormLabel>
            <FormControl>
              <!-- UI 표시용 -->
              <Input type="datetime-local" :value="componentField" readonly />
              <!-- 실제 값 업데이트용 -->
              <input type="hidden" v-bind="componentField" />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="salesManagerNo" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>영업담당자</FormLabel>
            <FormControl>
              <div class="flex gap-2 items-center">
                <Input type="text" placeholder="영업담당자를 입력하세요" class="flex-1" />
                <Input type="text" v-bind="componentField" class="w-28 bg-gray-100" readonly />
              </div>
            </FormControl>
            <p class="text-red-500 text-xs">{{ errorMessage }}</p>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="lineCode">
          <FormItem>
            <FormLabel>라인명</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="custom-input w-full">
                  <SelectValue placeholder="라인을 선택해주세요." />
                </SelectTrigger>
                <!-- 라인으로 변경 필요 -->
                <SelectContent>
                  <SelectItem
                    v-for="factory in factoryList?.content ?? []"
                    :key="factory.factoryCode"
                    :value="factory.factoryCode"
                  >
                    {{ factory.factoryName }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="endTime">
          <FormItem>
            <FormLabel>생산종료시간</FormLabel>
            <FormControl>
              <Input type="datetime-local" :value="componentField" disabled />
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="status">
          <FormItem>
            <FormLabel>상태</FormLabel>
            <FormControl>
              <Select v-bind="componentField" disabled>
                <SelectTrigger class="custom-input w-full pointer-events-none">
                  <SelectValue placeholder="상태를 선택하세요." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="(label, value) in PRODUCTION_PLAN_STATUS"
                    :key="value"
                    :value="value"
                  >
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormControl>
          </FormItem>
        </FormField>

        <div class="col-span-3">
          <FormField v-slot="{ componentField, errorMessage }" name="remark">
            <FormItem>
              <FormLabel>비고</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" autocomplete="remark" />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>
      <ItemTable :itemDetail="{}" />
    </Form>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { SearchIcon } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import { z } from 'zod';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import useGetItemList from '@/apis/query-hooks/item/useGetItemList';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCTION_PLAN_STATUS } from '@/constants/enumLabels';
import ItemModal from '@/pages/production-management/production-plan/ItemModal.vue';
import ItemTable from '@/pages/production-management/production-plan/ItemTable.vue';

const formSchema = toTypedSchema(
  z.object({
    factoryCode: z.string({ required_error: '공장명은 필수입니다.' }),
    dueDate: z.string({ required_error: '납기일자는 필수입니다.' }),
    productionManagerNo: z.string({ required_error: '생산담당자는 필수입니다.' }),
    itemCode: z.string({ required_error: '품목명은 필수입니다.' }),
    salesManagerNo: z.string({ required_error: '영업담당자는 필수입니다.' }),
    lineCode: z.string({ required_error: '라인명은 필수입니다.' }),
    status: z.string({ required_error: '상태는 필수입니다.' }),
    plannedQty: z.coerce
      .number({ required_error: '생산계획수량은 필수입니다.' })
      .positive('생산계획수량은 1 이상이어야 합니다.'),
  }),
);

// 품목 선택
const itemNameInput = ref(''); // 입력창
const autoCompleteItems = ref([]); // 자동완성 목록
const showItemModal = ref(false); // 모달 열림
const selectedSetValue = ref(null); // vee-validate setter 저장
const isComposing = ref(false);

const { data: factoryList } = useGetFactoryList();

const { data: fullItemList, filters, refetch } = useGetItemList();

function onCompositionEnd(e) {
  isComposing.value = false;
  itemNameInput.value = e.target.value; // 최종 텍스트 반영

  // 조합이 끝나면 자동완성 다시 실행
  onItemAutoInput();
}

async function onEnter(setValue) {
  if (isComposing.value) return; // 조합 중이면 엔터 무시

  await onItemEnter(setValue);
}

// 품목 자동 완성 입력 처리
async function onItemAutoInput() {
  if (isComposing.value) return;

  const keyword = itemNameInput.value;

  if (!keyword.trim()) {
    autoCompleteItems.value = [];
    return;
  }

  filters.itemName = keyword;
  await refetch();
  autoCompleteItems.value = fullItemList.value?.content ?? [];
}

// 자동완성 선택
function selectItemFromAutoComplete(item, setValue) {
  itemNameInput.value = item.itemName;
  setValue(item.itemCode);
  autoCompleteItems.value = [];
}

async function onItemEnter(setValue) {
  const keyword = itemNameInput.value.trim();
  if (!keyword) return;

  // 자동완성 목록 기준으로 먼저 판단
  if (autoCompleteItems.value.length === 1) {
    selectItemFromAutoComplete(autoCompleteItems.value[0], setValue);
    return;
  }

  if (autoCompleteItems.value.length > 1) {
    selectedSetValue.value = setValue;
    autoCompleteItems.value = [];
    showItemModal.value = true;
    return;
  }

  // 자동완성 데이터 없으면 API 호출
  filters.itemName = keyword;
  await refetch();

  const list = fullItemList.value?.content ?? [];

  if (list.length === 1) {
    selectItemFromAutoComplete(list[0], setValue);
    return;
  }

  if (list.length > 1) {
    selectedSetValue.value = setValue;
    showItemModal.value = true;
    return;
  }

  toast.info('검색 결과가 없습니다.');
}

// 돋보기 클릭
function onSearchIconClick(setValue) {
  selectedSetValue.value = setValue;
  autoCompleteItems.value = [];
  showItemModal.value = true;
}

function onModalSelect(item) {
  if (selectedSetValue.value) {
    selectedSetValue.value(item.itemCode);
  }

  itemNameInput.value = item.itemName;
  autoCompleteItems.value = [];
  showItemModal.value = false;
}

watch(itemNameInput, val => {
  if (val === '' && selectedSetValue.value) {
    selectedSetValue.value('');
  }
});

const onSubmit = values => {
  const params = {
    factoryCode: values.factoryCode,
    dueDate: values.itemName,
    productionManagerNo: values.productionManagerNo,
    itemCode: values.itemCode,
    startTime: values.startTime,
    salesManagerNo: values.salesManagerNo,
    lineCode: values.lineCode,
    status: values.status,
    remark: values.remark,
    plannedQty: values.plannedQty,
  };

  console.log(params);
  // updateFactoryStatus(params);
};
</script>

<style scoped></style>
