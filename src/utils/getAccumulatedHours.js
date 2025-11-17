export default function getAccumulatedHours(operatingDate) {
  if (!operatingDate) return 0;

  const start = new Date(operatingDate);
  const now = new Date();

  const diffMs = now.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60)); // 총 시간
}
