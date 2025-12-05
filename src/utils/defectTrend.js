const MS_PER_DAY = 24 * 60 * 60 * 1000;

const normalizeRate = rate => {
  const value = Number(rate ?? 0);
  if (Number.isNaN(value)) return 0;
  return value <= 1 ? value * 100 : value;
};

const parseRecordDate = record => {
  const raw = record?.createdAt ?? record?.dueDate;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getISOWeekInfo = date => {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp - yearStart) / MS_PER_DAY + 1) / 7);

  const start = new Date(tmp);
  const startDay = start.getUTCDay() || 7;
  start.setUTCDate(tmp.getUTCDate() - startDay + 1);
  return { year: tmp.getUTCFullYear(), week, start: new Date(start.getTime()) };
};

const getBucketKey = (date, mode) => {
  if (mode === 'day') {
    return {
      key: date.toISOString().slice(0, 10),
      label: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(
        2,
        '0',
      )}`,
      sortKey: date.getTime(),
    };
  }
  if (mode === 'week') {
    const info = getISOWeekInfo(date);
    const start = info.start;
    const yearShort = String(info.year % 100).padStart(2, '0');
    const monthIndex =
      typeof start.getUTCMonth === 'function' ? start.getUTCMonth() : start.getMonth();
    const month = String(monthIndex + 1).padStart(2, '0');
    const day =
      typeof start.getUTCDate === 'function' ? start.getUTCDate() : start.getDate();
    const weekOfMonth = Math.floor((day - 1) / 7) + 1;
    return {
      key: `${info.year}-W${String(info.week).padStart(2, '0')}`,
      label: `${yearShort}년 ${month}월 ${weekOfMonth}주차`,
      sortKey: info.start.getTime(),
    };
  }

  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  return {
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    label: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`,
    sortKey: first.getTime(),
  };
};

const isValidMode = mode => ['day', 'week', 'month'].includes(mode);
const clampRange = (mode, sortedBuckets) => {
  const limit = mode === 'day' ? 7 : mode === 'week' ? 6 : 6;
  if (sortedBuckets.length <= limit) return sortedBuckets;
  return sortedBuckets.slice(-limit);
};

export function buildDefectRateTrend(records = [], preferredMode) {
  const entries = records
    .map(record => ({
      date: parseRecordDate(record),
      rate: normalizeRate(record?.defectiveTotalRate),
    }))
    .filter(entry => entry.date);

  if (!entries.length) return [];

  entries.sort((a, b) => a.date - b.date);

  const min = entries[0].date;
  const max = entries[entries.length - 1].date;
  const spanDays = Math.max(1, Math.round((max - min) / MS_PER_DAY) + 1);

  let mode = spanDays <= 7 ? 'day' : spanDays <= 42 ? 'week' : 'month';
  if (isValidMode(preferredMode)) {
    mode = preferredMode;
  }

  const buckets = new Map();
  entries.forEach(entry => {
    const keyInfo = getBucketKey(entry.date, mode);
    const bucket = buckets.get(keyInfo.key) || { ...keyInfo, sum: 0, count: 0 };
    bucket.sum += entry.rate;
    bucket.count += 1;
    buckets.set(keyInfo.key, bucket);
  });

  const sortedBuckets = Array.from(buckets.values()).sort((a, b) => a.sortKey - b.sortKey);
  const limitedBuckets = clampRange(mode, sortedBuckets);
  return limitedBuckets.map((bucket, index) => ({
    index,
    label: bucket.label,
    value: bucket.count ? bucket.sum / bucket.count : 0,
    sortKey: bucket.sortKey,
  }));
}
