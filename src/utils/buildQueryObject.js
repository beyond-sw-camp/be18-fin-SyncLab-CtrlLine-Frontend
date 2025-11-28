export function buildQueryObject(params) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value) && key === 'sort') {
      value.forEach(sortItem => {
        search.append('sort', sortItem);
      });
    } else {
      search.set(key, String(value));
    }
  }

  return Object.fromEntries(search.entries());
}
