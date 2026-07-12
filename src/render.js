import { esc, itemId } from './utils.js';

const modeTitles = { books: 'Книги', films: 'Фильмы', saved: 'Избранное' };
const modeDescs = {
  books: 'Подборки книг о дизайне, типографике, брендинге и UX/UI',
  films: 'Подборки фильмов о дизайне, типографике, брендинге и UX/UI',
  saved: 'Материалы, которые вы сохранили'
};

export function renderShelves(data, mode, container, favorites) {
  const heading = `<div class="page-heading"><h1 class="page-title">${modeTitles[mode]}</h1><p class="page-desc">${modeDescs[mode]}</p></div>`;
  container.innerHTML = heading + data[mode].map((category, i) => renderShelf(category, mode, favorites, i > 0)).join('');
}

export function renderSavedShelf(savedItems, container, favorites) {
  const grouped = { books: [], films: [] };
  savedItems.forEach(item => {
    if (grouped[item._mode]) grouped[item._mode].push(item);
  });

  const allActions = savedItems.length
    ? `<div class="heading-actions">
        <button class="shelf-share" type="button" data-share="" aria-label="Поделиться всем">${shareIcon}</button>
        <button class="shelf-download" type="button" data-download="" aria-label="Скачать всё">${downloadIcon}</button>
       </div>`
    : '';
  const heading = `<div class="page-heading"><div class="page-heading-row"><div><h1 class="page-title">${modeTitles.saved}</h1><p class="page-desc">${modeDescs.saved}</p></div>${allActions}</div></div>`;

  if (!savedItems.length) {
    container.innerHTML = heading + '<div class="empty-state"><div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div><p>Избранных материалов пока нет</p><p class="empty-hint">Нажмите на значок закладки на любой карточке</p></div>';
    return;
  }

  const modeLabels = { films: 'Фильмы', books: 'Книги' };

  container.innerHTML = heading + ['books', 'films']
    .filter(mode => grouped[mode].length > 0)
    .map((mode, i) => {
      const items = grouped[mode];
      return renderShelf({ slug: mode, title: modeLabels[mode], items }, 'saved', favorites, i > 0, mode);
    }).join('');
}

const shareIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
const downloadIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

function renderShelf(category, mode, favorites, collapsed = false, shareMode) {
  const cards = category.items.map(item => {
    const id = mode === 'saved' ? item._id : itemId(mode, item);
    const favorite = favorites.has(id);
    return renderShelfCard(item, id, favorite, mode);
  }).join('');

  const shareBtn = shareMode
    ? `<button class="shelf-share" type="button" data-share="${esc(shareMode)}" aria-label="Поделиться подборкой">${shareIcon}</button>`
    : '';
  const downloadBtn = shareMode
    ? `<button class="shelf-download" type="button" data-download="${esc(shareMode)}" aria-label="Скачать подборку">${downloadIcon}</button>`
    : '';

  return `
    <section class="shelf ${collapsed ? 'collapsed' : ''}" data-category="${esc(category.slug)}">
      <div class="shelf-header">
        <button class="shelf-toggle" type="button" aria-label="Свернуть/развернуть">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <h2 class="shelf-title">${esc(category.title)}</h2>
        <span class="shelf-count">${category.items.length}</span>
        ${shareBtn}${downloadBtn}
        <div class="shelf-nav">
          <button class="shelf-arrow shelf-prev" type="button" aria-label="Назад">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="shelf-arrow shelf-next" type="button" aria-label="Вперёд">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div class="shelf-track">${cards}</div>
    </section>`;
}

function renderShelfCard(item, id, favorite, mode) {
  const author = item.meta?.[1] || '';
  const year = item.year || '';
  const tags = (item.meta || []).filter((t, i) => !(i === 0 && t === item.year));
  const categoryTag = mode === 'saved' && item._categoryTitle ? item._categoryTitle : '';

  return `
    <article class="shelf-card" data-id="${esc(id)}" data-free="${item.free ? 'true' : 'false'}">
      <button class="card-bookmark ${favorite ? 'active' : ''}" type="button" data-favorite="${esc(id)}" aria-label="${favorite ? 'Убрать из избранного' : 'В избранное'}">
        <svg viewBox="0 0 24 24" fill="${favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
      <h3 class="card-title">${esc(item.title)}</h3>
      ${author ? `<div class="card-author">${esc(author)}${year ? ` · ${esc(year)}` : ''}</div>` : ''}
      ${item.title_ru && item.title_ru !== item.title ? `<div class="card-alias">${esc(item.title_ru)}</div>` : ''}
      ${item.desc ? `<div class="card-desc">${esc(item.desc)}</div>` : ''}
      <div class="card-tags">
        ${categoryTag ? `<span class="card-tag category">${esc(categoryTag)}</span>` : ''}
        ${tags.map(t => `<span class="card-tag">${esc(t)}</span>`).join('')}
        ${item.free ? '<span class="card-tag free">Бесплатно</span>' : ''}
      </div>
      ${item.primary ? `<a class="card-link" href="${esc(item.primary.href)}" target="_blank" rel="noopener noreferrer">${esc(item.primary.label)}</a>` : ''}
    </article>`;
}

export function renderFilters(container, data, mode) {
  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'filter-btn';
  allBtn.dataset.filter = 'all';
  allBtn.textContent = mode === 'saved' ? 'Все разделы' : 'Все темы';
  container.appendChild(allBtn);

  if (mode === 'saved') {
    ['films', 'books'].forEach(key => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      btn.dataset.filter = key;
      btn.textContent = key === 'films' ? 'Фильмы' : 'Книги';
      container.appendChild(btn);
    });
  } else {
    data[mode].forEach(category => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      btn.dataset.filter = category.slug;
      btn.textContent = category.title;
      container.appendChild(btn);
    });
  }
}
