let listeners = [];

export const state = {
  mode: 'films',
  filters: [],
  view: 'grid',
  search: '',
  favoritesOnly: false,
  freeOnly: false,
};

export function subscribe(fn) {
  listeners.push(fn);
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach(fn => fn(state));
}

export function getState() {
  return state;
}
