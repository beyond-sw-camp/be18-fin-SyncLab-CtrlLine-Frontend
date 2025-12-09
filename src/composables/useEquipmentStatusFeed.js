import { EventSourcePolyfill } from 'event-source-polyfill';
import { onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

import { getEquipmentStatuses } from '@/apis/query-functions/equipment';
import { useAuthStore } from '@/stores/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const SSE_PATH = '/api/v1/equipments/status-stream';
const POLLING_INTERVAL = 5000;
const RECONNECT_DELAY = 3000;

export default function useEquipmentStatusFeed(factoryIdRef, factoryCodeRef = null) {
  const statusMap = ref({});
  const isSseConnected = ref(false);
  const authStore = useAuthStore();
  const getStoredAccessToken = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('access_token');
  };

  let eventSource = null;
  let pollingTimer = null;
  let reconnectTimer = null;

  // Map the various state tags emitted by the backend SSE stream to the color levels we display.
  const levelMapping = {
    STOPPED: 1,
    STOP: 1,
    IDLE: 1,
    HALT: 1,
    PAUSED: 1,
    RUNNING: 2,
    OPERATING: 2,
    EXECUTE: 2,
    STARTING: 2,
    WORKING: 2,
    LOW_WARNING: 3,
    WARNING: 3,
    MINOR: 3,
    HIGH_WARNING: 4,
    SEVERE: 4,
    CRITICAL: 4,
  };

  const normaliseLevel = level => {
    if (level === null || level === undefined) return undefined;
    const normalized = `${level}`.toUpperCase();
    if (levelMapping[normalized]) {
      return levelMapping[normalized];
    }
    const numeric = Number(normalized);
    if (!Number.isNaN(numeric) && [1, 2, 3, 4].includes(numeric)) {
      return numeric;
    }
    return undefined;
  };

  const flattenPayload = payload => {
    if (!payload) return [];
    if (Array.isArray(payload)) {
      return payload.flatMap(flattenPayload);
    }
    if (typeof payload !== 'object') return [];
    if (Array.isArray(payload.records)) {
      return payload.records.flatMap(record =>
        flattenPayload(record?.value ?? record?.data ?? record),
      );
    }
    if (payload.value && typeof payload.value === 'object' && !Array.isArray(payload.value)) {
      return flattenPayload(payload.value);
    }
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      return flattenPayload(payload.data);
    }
    if (payload.payload && typeof payload.payload === 'object') {
      return flattenPayload(payload.payload);
    }
    return [payload];
  };

  const pickValue = (item, paths) => {
    for (const path of paths) {
      const value = path.split('.').reduce((acc, key) => {
        if (acc === null || acc === undefined) return undefined;
        return acc[key];
      }, item);
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return undefined;
  };

  const normaliseStatusEntries = payload => {
    const rawItems = flattenPayload(payload);
    return rawItems
      .map(item => {
        const code = pickValue(item, [
          'equipmentCode',
          'equipment_code',
          'equipment.code',
          'code',
        ]);
        const id = pickValue(item, ['equipmentId', 'equipment_id', 'id', 'equipment.equipmentId']);
        const levelCandidates = [
          pickValue(item, ['runtimeStatusLevel', 'runtime_status_level']),
          pickValue(item, ['runtimeStatus', 'runtime_status']),
          pickValue(item, ['statusLevel', 'status_level']),
          pickValue(item, ['status', 'equipmentStatus', 'equipment_status']),
          pickValue(item, ['state']),
          pickValue(item, ['level']),
          pickValue(item, ['alarmLevel', 'alarm_level']),
        ];
        const level = levelCandidates.reduce((acc, candidate) => {
          if (acc !== undefined) return acc;
          return normaliseLevel(candidate);
        }, undefined);
        return { code, id, level };
      })
      .filter(entry => entry.level !== undefined && (entry.code || entry.id));
  };

  const updateStatusMap = entries => {
    if (!Array.isArray(entries) || entries.length === 0) return;
    const next = { ...statusMap.value };
    entries.forEach(({ code, id, level }) => {
      if (code) next[code] = level;
      if (id) next[`#id:${id}`] = level;
    });
    statusMap.value = next;
  };

  const fetchStatuses = async () => {
    const factoryId = unref(factoryIdRef);
    if (!factoryId) return;
    try {
      const list = await getEquipmentStatuses({ factoryId });
      updateStatusMap(normaliseStatusEntries(list));
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
    const factoryCode = unref(factoryCodeRef);
    if (factoryId) {
      void fetchStatuses();
    }
    if (!factoryId && !factoryCode) {
      startPolling();
      return;
    }

    const url = new URL(SSE_PATH, API_BASE_URL);
    if (factoryId) {
      url.searchParams.append('factoryId', factoryId);
    }
    if (factoryCode) {
      url.searchParams.append('factoryCode', factoryCode);
    }
    const accessToken = authStore.accessToken ?? getStoredAccessToken();

    try {
      const options = {
        withCredentials: true,
        heartbeatTimeout: 0,
      };
      if (accessToken) {
        url.searchParams.append('access_token', accessToken);
        options.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      eventSource = new EventSourcePolyfill(url.toString(), options);
    } catch (error) {
      console.error('Failed to create SSE connection', error);
      startPolling();
      scheduleReconnect();
      return;
    }

    const handleEquipmentEvent = event => {
      if (!event?.data) return;
      if (event.type === 'keepalive' || event.data === 'connected') return;
      try {
        const payload = JSON.parse(event.data);
        const factoryCode = unref(factoryCodeRef);
        if (factoryCode && payload?.factoryCode && payload.factoryCode !== factoryCode) {
          return;
        }
        const entries = normaliseStatusEntries(payload);
        updateStatusMap(entries);
      } catch (error) {
        console.error('Failed to parse SSE payload', error);
      }
    };

    eventSource.onopen = () => {
      isSseConnected.value = true;
      stopPolling();
    };

    eventSource.onmessage = handleEquipmentEvent;
    eventSource.addEventListener('equipment-status', handleEquipmentEvent);
    eventSource.addEventListener('keepalive', () => {});

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
    () => [unref(factoryIdRef), unref(factoryCodeRef)],
    ([nextFactoryId, nextFactoryCode]) => {
      dispose();
      if (nextFactoryId || nextFactoryCode) {
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
