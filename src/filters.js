import { itemId } from './utils.js';

export function getSavedItems(data, favorites) {
  const all = [];
  ['films', 'books'].forEach(mode => {
    data[mode].forEach(category => {
      category.items.forEach(item => {
        const id = itemId(mode, item);
        if (favorites.has(id)) {
          all.push({
            ...item,
            _mode: mode,
            _categoryTitle: category.title,
            _categorySlug: category.slug,
            _id: id,
          });
        }
      });
    });
  });
  return all;
}

export function filterVisible(items, state, favorites) {
  const q = state.search.toLowerCase();
  return items.filter(item => {
    const textOk = !q || item.textContent.toLowerCase().includes(q);
    const favOk = !state.favoritesOnly || favorites.has(item.dataset.id);
    const freeOk = !state.freeOnly || item.dataset.free === 'true';
    return textOk && favOk && freeOk;
  });
}
