const MS_PER_DAY = 24 * 60 * 60 * 1000;

const WEEKDAY_OFFSET = 1; // Treat Monday as start of week

const parseProductionDate = record => {
  const raw = record?.endTime ?? record?.startTime ?? record?.dueDate ?? record?.createdAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeQuantity = record => {
  const value = Number(record?.performanceQty ?? record?.totalQty ?? record?.qty ?? 0);
  return Number.isNaN(value) ? 0 : value;
};

const getWeekStart = date => {
  const day = date.getDay() || 7; // Sunday -> 7
  const diff = day - WEEKDAY_OFFSET;
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getBucketKey = (date, mode) => {
  if (mode === 'day') {
    const keyDate = new Date(date);
    keyDate.setHours(0, 0, 0, 0);
    return {
      key: keyDate.toISOString(),
      label: `${String(keyDate.getMonth() + 1).padStart(2, '0')}/${String(keyDate.getDate()).padStart(
        2,
        '0',
      )}`,
      sortKey: keyDate.getTime(),
    };
  }

  if (mode === 'week') {
    const start = getWeekStart(date);
    const weekOfMonth = Math.floor((start.getDate() - 1) / 7) + 1;
    return {
      key: `W-${start.toISOString()}`,
      label: `${String(start.getFullYear()).slice(-2)}년 ${String(start.getMonth() + 1).padStart(
        2,
        '0',
      )}월 ${weekOfMonth}주차`,
      sortKey: start.getTime(),
    };
  }

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  return {
    key: `M-${monthStart.toISOString()}`,
    label: `${monthStart.getFullYear()}.${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
    sortKey: monthStart.getTime(),
  };
};

const isValidMode = mode => ['day', 'week', 'month'].includes(mode);

const formatTickLabel = (mode, value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  switch (mode) {
    case 'day':
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(
        2,
        '0',
      )}`;
    case 'week': {
      const start = getWeekStart(date);
      const weekOfMonth = Math.floor((start.getDate() - 1) / 7) + 1;
      return `${String(start.getFullYear()).slice(-2)}년 ${String(start.getMonth() + 1).padStart(
        2,
        '0',
      )}월 ${weekOfMonth}주차`;
    }
    default:
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
};

const clampRange = (mode, sortedBuckets) => {
  const limit = mode === 'day' ? 7 : mode === 'week' ? 6 : 6;
  if (sortedBuckets.length <= limit) return sortedBuckets;
  return sortedBuckets.slice(-limit);
};

export function buildProductionVolumeSeries(records = [], preferredMode) {
  const entries = records
    .map(record => ({
      date: parseProductionDate(record),
      quantity: normalizeQuantity(record),
    }))
    .filter(entry => entry.date && Number.isFinite(entry.quantity));

  if (!entries.length) {
    return {
      data: [],
      mode: 'month',
    };
  }

  entries.sort((a, b) => a.date - b.date);

  const min = entries[0].date;
  const max = entries[entries.length - 1].date;
  const spanDays = Math.max(1, Math.round((max - min) / MS_PER_DAY) + 1);

  let mode = 'day';
  if (spanDays > 42) {
    mode = 'month';
  } else if (spanDays > 7) {
    mode = 'week';
  }
  if (isValidMode(preferredMode)) {
    mode = preferredMode;
  }

  const buckets = new Map();
  entries.forEach(entry => {
    const keyInfo = getBucketKey(entry.date, mode);
    const bucket = buckets.get(keyInfo.key) || { ...keyInfo, sum: 0 };
    bucket.sum += entry.quantity;
    buckets.set(keyInfo.key, bucket);
  });

  const sortedBuckets = Array.from(buckets.values()).sort((a, b) => a.sortKey - b.sortKey);
  const limitedBuckets = clampRange(mode, sortedBuckets);
  const data = limitedBuckets.map(bucket => ({
    date: new Date(bucket.sortKey),
    desktop: bucket.sum,
    label: bucket.label,
  }));

  return {
    data,
    mode,
  };
}

export function formatProductionTick(mode, value) {
  return formatTickLabel(mode, value);
}
