import { ref } from 'vue';

import formatDate from '@/utils/formatDate';

export function useScheduleRangeManager(availableFilters, selectedFilters) {
  const selectedDate = ref(new Date());
  const currentView = ref('TimelineDay');

  function computeRange(view, date) {
    let start, end;

    if (view === 'TimelineDay') {
      start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }

    if (view === 'TimelineWeek') {
      const day = date.getDay(); // Sunday = 0
      const sunday = date.getDate() - day;
      start = new Date(date.getFullYear(), date.getMonth(), sunday);
      end = new Date(date.getFullYear(), date.getMonth(), sunday + 7);
    }

    if (view === 'TimelineMonth') {
      start = new Date(date.getFullYear(), date.getMonth(), 1);
      end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }

    return {
      start: formatDate(start, 'local-datetime'),
      end: formatDate(end, 'local-datetime'),
    };
  }

  function applyRangeToFilters(view, date) {
    const { start, end } = computeRange(view, date);
    availableFilters.startTime = start;
    availableFilters.endTime = end;

    selectedFilters.startTime = start;
    selectedFilters.endTime = end;
  }

  function onNavigation(inst) {
    console.log(inst);
    selectedDate.value = inst.selectedDate;
    currentView.value = inst.currentView;
    applyRangeToFilters(currentView.value, selectedDate.value);
  }

  return { selectedDate, onNavigation };
}
