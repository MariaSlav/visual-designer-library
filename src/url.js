import { state } from './state.js';

export function readURL() {
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  if (mode && ['films', 'books', 'saved'].includes(mode)) state.mode = mode;
  state.filters = (params.get('filter') || '').split(',').map(v => v.trim()).filter(Boolean);
  state.view = params.get('view') === 'list' ? 'list' : 'grid';
  state.search = params.get('q') || '';
  state.favoritesOnly = params.get('savedOnly') === '1';
  state.freeOnly = params.get('freeOnly') === '1';
}

export function writeURL() {
  const params = new URLSearchParams();
  params.set('mode', state.mode);
  if (state.filters.length) params.set('filter', state.filters.join(','));
  if (state.view !== 'grid') params.set('view', state.view);
  if (state.search) params.set('q', state.search);
  if (state.favoritesOnly) params.set('savedOnly', '1');
  if (state.freeOnly) params.set('freeOnly', '1');
  const query = params.toString();
  history.replaceState(null, '', query ? `${location.pathname}?${query}` : location.pathname);
}
