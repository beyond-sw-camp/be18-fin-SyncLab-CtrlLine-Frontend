import { onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

import { getEquipmentStatuses } from '@/apis/query-functions/equipment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const SSE_PATH = '/api/v1/equipments/status-stream';
const POLLING_INTERVAL = 5000;
const RECONNECT_DELAY = 3000;

export default function useEquipmentStatusFeed(factoryIdRef) {
  const statusMap = ref({});
  const isSseConnected = ref(false);

  let eventSource = null;
  let pollingTimer = null;
  let reconnectTimer = null;

  const normaliseLevel = level => {
    if (level === null || level === undefined) return undefined;
    const normalized = `${level}`.toUpperCase();
    if (['STOPPED', '1'].includes(normalized)) return 1;
    if (['RUNNING', '2'].includes(normalized)) return 2;
    if (['LOW_WARNING', 'WARNING', '3'].includes(normalized)) return 3;
    if (['HIGH_WARNING', 'SEVERE', '4'].includes(normalized)) return 4;
    return undefined;
  };

  const updateStatusMap = list => {
    if (!Array.isArray(list)) return;
    const next = { ...statusMap.value };
    list.forEach(item => {
      if (!item) return;
      const code = item.equipmentCode ?? item.code;
      if (!code) return;
      const level =
        normaliseLevel(item.runtimeStatusLevel) ??
        normaliseLevel(item.statusLevel) ??
        normaliseLevel(item.level);
      if (level !== undefined) {
        next[code] = level;
      }
    });
    statusMap.value = next;
  };

  const fetchStatuses = async () => {
    const factoryId = unref(factoryIdRef);
    if (!factoryId) return;
    try {
      const list = await getEquipmentStatuses({ factoryId });
      updateStatusMap(list);
    } catch (error) {
      console.error('Failed to fetch equipment statuses', error);
    }
  };

  const startPolling = () => {
    if (pollingTimer) return;
    fetchStatuses();
    pollingTimer = setInterval(fetchStatuses, POLLING_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  };

  const cleanupSse = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    isSseConnected.value = false;
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectSse();
    }, RECONNECT_DELAY);
  };

  const connectSse = () => {
    cleanupSse();
    const factoryId = unref(factoryIdRef);
    if (!factoryId) {
      startPolling();
      return;
    }

    const url = new URL(SSE_PATH, API_BASE_URL);
    url.searchParams.append('factoryId', factoryId);

    try {
      eventSource = new EventSource(url.toString(), { withCredentials: true });
    } catch (error) {
      console.error('Failed to create SSE connection', error);
      startPolling();
      scheduleReconnect();
      return;
    }

    eventSource.onopen = () => {
      isSseConnected.value = true;
      stopPolling();
    };

    eventSource.onmessage = event => {
      try {
        const payload = JSON.parse(event.data);
        updateStatusMap([payload]);
      } catch (error) {
        console.error('Failed to parse SSE payload', error);
      }
    };

    eventSource.onerror = () => {
      cleanupSse();
      startPolling();
      scheduleReconnect();
    };
  };

  const dispose = () => {
    stopPolling();
    cleanupSse();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  onMounted(() => {
    connectSse();
  });

  onBeforeUnmount(() => {
    dispose();
  });

  watch(
    () => unref(factoryIdRef),
    () => {
      dispose();
      if (unref(factoryIdRef)) {
        connectSse();
      }
    },
  );

  return {
    statusMap,
    isSseConnected,
    startPolling,
    stopPolling,
  };
}
