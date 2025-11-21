export default function formatDate(value, type = 'full') {
  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return '';

  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  if (type === 'date') {
    return `${yyyy}-${MM}-${dd}`;
  }

  if (type === 'time') {
    return `${hh}:${mm}:${ss}`;
  }

  if (type === 'datetime-local') {
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  }

  // full
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
}
