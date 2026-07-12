const root = document.documentElement;
const STORAGE_KEY = 'design-media-library-theme';

let current = (() => {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
})() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function apply() {
  root.setAttribute('data-theme', current);
}

export function getTheme() { return current; }

export function toggleTheme() {
  current = current === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(STORAGE_KEY, current); } catch {}
  apply();
}

export function initTheme() { apply(); }
