const STORAGE_KEY = 'design-media-library-saved';

export function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  } catch { /* quota exceeded — silent */ }
}

export function exportAsText(savedItems) {
  if (!savedItems.length) return;
  const lines = ['Сохранённые материалы — Design Media Library', ''];
  savedItems.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.title}${item.title_ru ? ' / ' + item.title_ru : ''}`);
    lines.push(`Раздел: ${item._mode === 'films' ? 'Фильмы' : 'Книги'}`);
    lines.push(`Категория: ${item._categoryTitle}`);
    if (item.year) lines.push(`Год: ${item.year}`);
    if (item.desc) lines.push(`Описание: ${item.desc}`);
    if (item.primary?.href) lines.push(`Открыть: ${item.primary.href}`);
    if (item.sources?.length) lines.push(`Источники: ${item.sources.map(s => `${s.label} — ${s.href}`).join(' | ')}`);
    lines.push('');
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'design-media-library-saved-list.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function generateShareURL(favorites, mode) {
  const base = location.origin + location.pathname;
  const ids = [...favorites];
  const filtered = mode ? ids.filter(id => id.startsWith(mode + '::')) : ids;
  if (!filtered.length) return null;
  const encoded = btoa(unescape(encodeURIComponent(filtered.join(','))));
  return `${base}?shared=${encoded}`;
}

export function readSharedFavorites() {
  const params = new URLSearchParams(location.search);
  const shared = params.get('shared');
  if (!shared) return null;
  try {
    const decoded = decodeURIComponent(escape(atob(shared)));
    return decoded.split(',').filter(Boolean);
  } catch { return null; }
}
