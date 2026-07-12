import { state, setState } from './state.js';
import { readURL, writeURL } from './url.js';
import { debounce } from './utils.js';
import { getSavedItems } from './filters.js';
import { renderShelves, renderSavedShelf } from './render.js';
import { loadFavorites, saveFavorites, exportAsText, generateShareURL, readSharedFavorites } from './storage.js';
import { initTheme, toggleTheme } from './theme.js';
import filmsData from '../data/films.json';
import booksData from '../data/books.json';

const data = { films: filmsData, books: booksData };
const favorites = loadFavorites();

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const shelves = $('#shelves');
const emptyState = $('#emptyState');
const searchInput = $('#searchInput');
const navTabs = $$('.nav-tab');
const bottomTabs = $$('.bottomnav-tab');

// --- Onboarding ---
function initOnboarding() {
  const onboarding = document.getElementById('onboarding');
  if (!onboarding) return;

  try {
    if (localStorage.getItem('dml_onboarded')) {
      onboarding.classList.add('hidden');
    }
  } catch (e) { /* localStorage unavailable */ }

  document.addEventListener('click', function(e) {
    if (e.target.closest('#onboardingStart')) {
      try { localStorage.setItem('dml_onboarded', '1'); } catch (e) {}
      onboarding.classList.add('hidden');
    }
    if (e.target.closest('.brand-mark')) {
      onboarding.classList.remove('hidden');
    }
  });
}

// --- Render ---
function renderCurrentMode() {
  if (state.mode === 'saved') {
    const savedItems = getSavedItems(data, favorites);
    renderSavedShelf(savedItems, shelves, favorites);
  } else {
    renderShelves(data, state.mode, shelves, favorites);
  }
  initShelfScroll();
  applyFilters();
}

// --- Shelf horizontal scroll ---
function initShelfScroll() {
  $$('.shelf').forEach(shelf => {
    const track = shelf.querySelector('.shelf-track');
    const prev = shelf.querySelector('.shelf-prev');
    const next = shelf.querySelector('.shelf-next');
    if (!track) return;

    const scrollAmount = track.clientWidth * 0.7;

    prev?.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    next?.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  });
}

// --- Filters ---
function applyFilters() {
  const q = state.search.toLowerCase();
  let visibleCards = 0;
  let visibleShelves = 0;

  $$('.shelf').forEach(shelf => {
    let shelfVisible = false;
    shelf.querySelectorAll('.shelf-card').forEach(card => {
      const textOk = !q || card.textContent.toLowerCase().includes(q);
      const favOk = !state.favoritesOnly || favorites.has(card.dataset.id);
      const freeOk = !state.freeOnly || card.dataset.free === 'true';
      const show = textOk && favOk && freeOk;
      card.classList.toggle('hidden', !show);
      if (show) { visibleCards++; shelfVisible = true; }
    });
    shelf.classList.toggle('hidden', !shelfVisible);
    if (shelfVisible) visibleShelves++;
  });

  emptyState.classList.toggle('hidden', visibleCards !== 0);
  writeURL();
}

// --- Mode switching ---
function setMode(mode) {
  setState({ mode });
  // Sync top nav
  navTabs.forEach(tab => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  // Sync bottom nav
  bottomTabs.forEach(tab => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  renderCurrentMode();
}

// --- Event handlers ---
navTabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
bottomTabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

// Shelf collapse/expand
document.addEventListener('click', e => {
  const toggle = e.target.closest('.shelf-toggle');
  if (!toggle) return;
  toggle.closest('.shelf').classList.toggle('collapsed');
});

const debouncedSearch = debounce(() => applyFilters(), 250);
searchInput.addEventListener('input', () => {
  state.search = searchInput.value;
  debouncedSearch();
});

$('#themeToggle')?.addEventListener('click', toggleTheme);

// Favorite toggling via delegation
document.addEventListener('click', e => {
  // Export button
  const exportBtn = e.target.closest('#exportBtn');
  if (exportBtn) {
    const savedItems = getSavedItems(data, favorites);
    exportAsText(savedItems);
    return;
  }
  // Shelf download button
  const downloadBtn = e.target.closest('[data-download]');
  if (downloadBtn) {
    const mode = downloadBtn.dataset.download;
    const all = getSavedItems(data, favorites);
    const savedItems = mode ? all.filter(item => item._mode === mode) : all;
    exportAsText(savedItems);
    return;
  }
  // Bookmark toggle
  const btn = e.target.closest('[data-favorite]');
  if (!btn) return;
  const id = btn.dataset.favorite;
  if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
  saveFavorites(favorites);
  btn.classList.toggle('active', favorites.has(id));
  // Update bookmark SVG fill
  const svg = btn.querySelector('svg');
  if (svg) svg.setAttribute('fill', favorites.has(id) ? 'currentColor' : 'none');
  applyFilters();
});

// --- Share buttons ---
document.addEventListener('click', e => {
  const shareBtn = e.target.closest('[data-share]');
  if (!shareBtn) return;
  const mode = shareBtn.dataset.share || null;
  const url = generateShareURL(favorites, mode);
  if (!url) return;
  if (navigator.share) {
    navigator.share({ title: 'Design Media Library', url });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      shareBtn.classList.add('copied');
      setTimeout(() => shareBtn.classList.remove('copied'), 1500);
    });
  }
});

// --- Init ---
export function init() {
  initTheme();
  initOnboarding();

  // Handle shared favorites from URL
  const sharedIds = readSharedFavorites();
  if (sharedIds) {
    sharedIds.forEach(id => favorites.add(id));
    saveFavorites(favorites);
    history.replaceState(null, '', location.pathname);
    setMode('saved');
    return;
  }

  readURL();
  setMode(state.mode);
}
