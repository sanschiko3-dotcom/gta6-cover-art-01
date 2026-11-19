import { renderCover, sizeFromString, layoutLabel, layoutPanelsForState } from './cover.js';
import { readShotConfig } from './shots.js';

const canvas = document.querySelector('#coverCanvas');
const ctx = canvas.getContext('2d');
const photoLibrary = document.querySelector('#photoLibrary');
const layoutGrid = document.querySelector('#layoutGrid');
const gradeList = document.querySelector('#gradeList');
const toast = document.querySelector('#toast');
const layoutKeys = ['hero', 'columns', 'strip', 'slash', 'grid', 'duo', 'triptych', 'tilted'];
const gradeKeys = ['Sunset', 'Neon', 'Noir', 'Golden Hour', 'Vice Pink', 'Teal Dawn'];
const captionIdeas = ['SUNSET HEIST', 'OCEAN DRIVE', 'AFTER HOURS', 'VICE NIGHTS', 'GOLD COAST', 'NEON SAINTS'];
const shot = readShotConfig();

const state = {
  layout: shot.layout || 'hero', grade: shot.grade || 'Sunset', size: shot.size || '1920x1080',
  title: shot.caption || 'SUNSET HEIST', subtitle: 'Vice City, after dark', quote: 'No rules after the sun goes down.',
  tags: '#VICE  #LEONIDA  #AFTERHOURS', heat: Number(shot.heat ?? 4), titlePosition: 'bottom', titleOverArt: true,
  selectedPanel: 0, selectedPhoto: 0, assignments: [0, 1, 0, 1], crops: {}, fit: 'fill'
};
const library = [];
const undoStack = [];
const redoStack = [];
let pointer = null;
let toastTimer = 0;

function saveState(target) {
  return JSON.parse(JSON.stringify({ ...target, photos: undefined }));
}

function restoreState(saved) {
  Object.assign(state, saved);
  syncControls();
  draw();
}

function checkpoint() {
  undoStack.push(saveState(state));
  if (undoStack.length > 20) undoStack.shift();
  redoStack.length = 0;
  updateHistoryButtons();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(saveState(state));
  restoreState(undoStack.pop());
  updateHistoryButtons();
  showToast('Last poster change undone.');
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(saveState(state));
  restoreState(redoStack.pop());
  updateHistoryButtons();
  showToast('Poster change restored.');
}

function updateHistoryButtons() {
  document.querySelector('#undoButton').disabled = !undoStack.length;
  document.querySelector('#redoButton').disabled = !redoStack.length;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function getCanvasSize() {
  if (shot.mode === 'cover') return { width: shot.width || 1920, height: shot.height || 1080 };
  return sizeFromString(state.size);
}

function draw() {
  const { width, height } = getCanvasSize();
  renderCover(canvas, { ...state, photos: library }, width, height);
  document.querySelector('#stageCaption').textContent = state.title.toUpperCase();
  document.querySelector('#stageLayoutName').textContent = layoutLabel(state.layout);
  const ratio = width / height;
  const ratioName = Math.abs(ratio - 1) < .02 ? '1:1' : ratio > 1.2 ? '16:9' : '4:5';
  document.querySelector('#aspectTag').textContent = ratioName;
  document.querySelector('#ratioText').textContent = ratioName + (ratioName === '1:1' ? ' SQUARE' : ratioName === '4:5' ? ' PORTRAIT' : ' WIDE');
  document.querySelector('#panelLabel').textContent = `PANEL ${String(state.selectedPanel + 1).padStart(2, '0')}`;
  updateCropControls();
}

function syncControls() {
  document.querySelector('#titleInput').value = state.title;
  document.querySelector('#subtitleInput').value = state.subtitle;
  document.querySelector('#quoteInput').value = state.quote;
  document.querySelector('#tagsInput').value = state.tags;
  document.querySelector('#heatSlider').value = state.heat;
  document.querySelector('#sizeSelect').value = state.size;
  document.querySelector('#titleOverToggle').checked = state.titleOverArt;
  document.querySelectorAll('.layout-choice').forEach(button => button.classList.toggle('active', button.dataset.layout === state.layout));
  document.querySelectorAll('.grade-choice').forEach(button => button.classList.toggle('active', button.dataset.grade === state.grade));
  document.querySelectorAll('.position-choice').forEach(button => button.classList.toggle('active', button.dataset.position === state.titlePosition));
  document.querySelectorAll('.fit-toggle').forEach(button => button.classList.toggle('active', button.dataset.fit === state.fit));
  document.querySelector('#heatValue').textContent = `${String(state.heat).padStart(2, '0')} / 05`;
  document.querySelector('#heatStars').querySelectorAll('span').forEach((star, i) => star.classList.toggle('lit', i < state.heat));
  document.querySelector('#zoomSlider').value = selectedCrop().zoom;
  document.querySelector('#zoomValue').textContent = `${Math.round(selectedCrop().zoom * 100)}%`;
}

function selectedCrop() {
  if (!state.crops[state.selectedPanel]) state.crops[state.selectedPanel] = { zoom: 1.12, panX: 0, panY: 0, fit: state.fit };
  return state.crops[state.selectedPanel];
}

function updateCropControls() {
  const crop = selectedCrop();
  document.querySelector('#zoomSlider').value = crop.zoom;
  document.querySelector('#zoomValue').textContent = `${Math.round(crop.zoom * 100)}%`;
  document.querySelectorAll('.fit-toggle').forEach(button => button.classList.toggle('active', button.dataset.fit === crop.fit));
}

function createPhotoEntry(src, name, image) {
  return { src, name, img: image, id: library.length };
}

function addPhoto(src, name) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => {
      library.push(createPhotoEntry(src, name, image));
      resolve(library[library.length - 1]);
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function paintLibrary() {
  photoLibrary.replaceChildren();
  library.forEach((photo, index) => {
    const button = document.createElement('button');
    button.className = `photo-thumb${index === state.selectedPhoto ? ' selected' : ''}`;
    button.type = 'button'; button.title = `Use ${photo.name} in selected panel`;
    const image = document.createElement('img'); image.src = photo.src; image.alt = '';
    const name = document.createElement('span'); name.className = 'photo-name'; name.textContent = photo.name;
    button.append(image, name);
    button.addEventListener('click', () => {
      checkpoint(); state.selectedPhoto = index; state.assignments[state.selectedPanel] = index;
      paintLibrary(); draw(); showToast(`${photo.name} assigned to panel ${state.selectedPanel + 1}.`);
    });
    photoLibrary.append(button);
  });
  document.querySelector('#photoCount').textContent = String(library.length).padStart(2, '0');
}

function changeLayout(layout) {
  checkpoint(); state.layout = layout;
  const count = layout === 'columns' || layout === 'triptych' || layout === 'strip' || layout === 'slash' ? 4 : layout === 'grid' ? 4 : layout === 'duo' ? 2 : 3;
  state.assignments = Array.from({ length: count }, (_, index) => state.assignments[index] ?? index % Math.max(1, library.length));
  syncControls(); draw();
}

function setUpControls() {
  layoutGrid.addEventListener('click', event => { const button = event.target.closest('[data-layout]'); if (button) changeLayout(button.dataset.layout); });
  gradeList.addEventListener('click', event => { const button = event.target.closest('[data-grade]'); if (!button) return; checkpoint(); state.grade = button.dataset.grade; syncControls(); draw(); });
  document.querySelector('#titleInput').addEventListener('input', event => { checkpoint(); state.title = event.target.value || ' '; draw(); });
  document.querySelector('#subtitleInput').addEventListener('input', event => { checkpoint(); state.subtitle = event.target.value; draw(); });
  document.querySelector('#quoteInput').addEventListener('input', event => { checkpoint(); state.quote = event.target.value; draw(); });
  document.querySelector('#tagsInput').addEventListener('input', event => { checkpoint(); state.tags = event.target.value; draw(); });
  document.querySelector('#sizeSelect').addEventListener('change', event => { checkpoint(); state.size = event.target.value; draw(); });
  document.querySelector('#heatSlider').addEventListener('input', event => { checkpoint(); state.heat = Number(event.target.value); syncControls(); draw(); });
  document.querySelector('#titleOverToggle').addEventListener('change', event => { checkpoint(); state.titleOverArt = event.target.checked; draw(); });
  document.querySelectorAll('.position-choice').forEach(button => button.addEventListener('click', () => { checkpoint(); state.titlePosition = button.dataset.position; syncControls(); draw(); }));
  document.querySelector('#zoomSlider').addEventListener('input', event => { checkpoint(); selectedCrop().zoom = Number(event.target.value); draw(); });
  document.querySelectorAll('.fit-toggle').forEach(button => button.addEventListener('click', () => { checkpoint(); selectedCrop().fit = button.dataset.fit; draw(); }));
  document.querySelector('#resetCrop').addEventListener('click', () => { checkpoint(); state.crops[state.selectedPanel] = { zoom: 1, panX: 0, panY: 0, fit: 'fill' }; draw(); });
  document.querySelector('#undoButton').addEventListener('click', undo);
  document.querySelector('#redoButton').addEventListener('click', redo);
  document.querySelector('#surpriseButton').addEventListener('click', surpriseMe);
  document.querySelector('#photoUpload').addEventListener('change', uploadPhotos);
  document.querySelector('#exportButton').addEventListener('click', () => exportPng(state.size));
  document.querySelector('#exportAllButton').addEventListener('click', exportAllSizes);
  canvas.addEventListener('pointerdown', startPan);
  canvas.addEventListener('pointermove', movePan);
  window.addEventListener('pointerup', stopPan);
  canvas.addEventListener('wheel', zoomWithWheel, { passive: false });
  window.addEventListener('keydown', nudgeOrUndo);
  document.addEventListener('dragover', event => event.preventDefault());
  document.addEventListener('drop', event => { event.preventDefault(); if (event.dataTransfer?.files?.length) loadUploads([...event.dataTransfer.files]); });
}

function uploadPhotos(event) { loadUploads([...event.target.files]); event.target.value = ''; }

async function loadUploads(files) {
  const accepted = files.filter(file => file.type.startsWith('image/'));
  for (const file of accepted) {
    const src = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(null); reader.readAsDataURL(file); });
    if (src) await addPhoto(src, file.name);
  }
  if (accepted.length) { checkpoint(); state.selectedPhoto = library.length - 1; state.assignments[state.selectedPanel] = state.selectedPhoto; paintLibrary(); draw(); showToast(`${accepted.length} photo${accepted.length === 1 ? '' : 's'} added to your local roll.`); }
}

function surpriseMe() {
  checkpoint(); state.layout = layoutKeys[Math.floor(Math.random() * layoutKeys.length)]; state.grade = gradeKeys[Math.floor(Math.random() * gradeKeys.length)];
  state.title = captionIdeas[Math.floor(Math.random() * captionIdeas.length)]; state.heat = 2 + Math.floor(Math.random() * 4);
  state.assignments = Array.from({ length: 4 }, () => Math.floor(Math.random() * Math.max(1, library.length)));
  state.titlePosition = Math.random() > .5 ? 'bottom' : 'top'; syncControls(); paintLibrary(); draw(); showToast('Fresh layout, grade, and panel mix.');
}

function pointerPosition(event) {
  const bounds = canvas.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
}

function panelAt(point) {
  const panels = layoutPanelsForState(state, canvas.width, canvas.height);
  for (let i = panels.length - 1; i >= 0; i--) { const panel = panels[i]; if (point.x >= panel.x && point.x <= panel.x + panel.w && point.y >= panel.y && point.y <= panel.y + panel.h) return i; }
  return -1;
}

function startPan(event) {
  const point = pointerPosition(event); const hit = panelAt(point); if (hit < 0) return;
  if (hit !== state.selectedPanel) { state.selectedPanel = hit; updateCropControls(); document.querySelector('#panelLabel').textContent = `PANEL ${String(hit + 1).padStart(2, '0')}`; }
  checkpoint(); pointer = { x: point.x, y: point.y, moved: false }; canvas.setPointerCapture(event.pointerId);
}

function movePan(event) {
  if (!pointer) return;
  const point = pointerPosition(event); const crop = selectedCrop(); crop.panX += (point.x - pointer.x) / canvas.width; crop.panY += (point.y - pointer.y) / canvas.height;
  pointer.x = point.x; pointer.y = point.y; pointer.moved = true; draw();
}

function stopPan() { pointer = null; }

function zoomWithWheel(event) {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault(); checkpoint(); const crop = selectedCrop(); crop.zoom = Math.max(1, Math.min(2.5, crop.zoom + (event.deltaY < 0 ? .06 : -.06))); draw();
}

function nudgeOrUndo(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
  if (event.target.matches('input,textarea,select')) return;
  const moves = { ArrowLeft: [-.012, 0], ArrowRight: [.012, 0], ArrowUp: [0, -.012], ArrowDown: [0, .012] };
  if (!moves[event.key]) return; event.preventDefault(); checkpoint(); const crop = selectedCrop(); crop.panX += moves[event.key][0]; crop.panY += moves[event.key][1]; draw();
}

function exportPng(size) {
  const { width, height } = sizeFromString(size); const output = document.createElement('canvas'); renderCover(output, { ...state, photos: library }, width, height);
  output.toBlob(blob => { if (!blob) { showToast('PNG export did not finish. Try again.'); return; } downloadBlob(blob, `${slug(state.title)}-${width}x${height}.png`); showToast(`Exported ${width} × ${height} PNG.`); }, 'image/png');
}

function exportAllSizes() {
  ['1080x1080', '1080x1350', '1920x1080'].forEach((size, index) => setTimeout(() => exportPng(size), index * 320));
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function slug(value) { return (value || 'vice-cover').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'vice-cover'; }

function setShotMode() {
  if (shot.mode !== 'cover') return;
  document.body.classList.add('shot-cover');
  document.querySelector('#studio').classList.add('cover-only');
}

async function startStudio() {
  setUpControls(); setShotMode();
  await addPhoto('../samples/boulevard.jpg', 'Ocean Boulevard');
  await addPhoto('../samples/pier.jpg', 'Moonlit Pier');
  if (shot.photo === 'pier') state.selectedPhoto = 1;
  if (shot.photo === 'boulevard') state.selectedPhoto = 0;
  if (new URLSearchParams(window.location.search).has('shot')) state.assignments = state.assignments.map(() => state.selectedPhoto);
  if (shot.mode === 'editor') { state.layout = shot.layout || 'hero'; state.grade = shot.grade || 'Sunset'; }
  paintLibrary(); syncControls(); draw(); updateHistoryButtons();
  if (shot.mode === 'cover') document.documentElement.style.setProperty('--shot-ready', '1');
  window.__shotReady = true;
}

startStudio();
