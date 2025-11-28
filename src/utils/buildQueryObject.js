export function buildQueryObject(params) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }

  return Object.fromEntries(search.entries());
}
