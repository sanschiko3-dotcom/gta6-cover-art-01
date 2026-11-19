import { renderCover, layouts, grades } from './cover.js';
import { configureShot, formats } from './shots.js';

const byId = id => document.getElementById(id);
const canvas = byId('cover');
const images = new Map();
const newCrop = photo => ({ photo, zoom: 1, x: 0, y: 0, fit: false });
let state = {
  layout: 'hero', grade: 'Sunset', format: '1920x1080', selected: 0,
  title: 'Paradise Run', subtitle: 'The Leonida Files', quote: 'Every sunset has a getaway.',
  tags: '#VICE #LEONIDA', position: 'bottom', letterSize: 'large', over: true, heat: 5,
  panels: ['boulevard','pier','boulevard','pier'].map(newCrop),
};
const before = [];
const after = [];
const choiceGroups = [];
let frames = [];
let pending = 0;
let gesture;
let wheelTimer;
let uploadSerial = 0;

async function loadPhoto(id, label, src) {
  const image = new Image();
  image.src = src;
  await image.decode();
  images.set(id, { label, src, image });
}

function remember(snapshot = structuredClone(state)) {
  before.push(snapshot);
  if (before.length > 50) before.shift();
  after.length = 0;
}

function change(update) {
  remember();
  update();
  refresh();
}

function travel(source, destination) {
  if (!source.length) return;
  destination.push(structuredClone(state));
  state = source.pop();
  refresh();
}

function choices(container, values, property) {
  const buttons = Object.entries(values).map(([value,label]) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = () => change(() => {
      state[property] = value;
      if (property === 'layout') state.selected = 0;
    });
    byId(container).append(button);
    return [value,button];
  });
  choiceGroups.push([property,buttons]);
}

function renderLibrary() {
  const library = byId('library');
  library.replaceChildren();
  for (const [id, photo] of images) {
    const button = document.createElement('button');
    const thumbnail = document.createElement('img');
    thumbnail.src = photo.src;
    thumbnail.alt = '';
    button.append(thumbnail,photo.label);
    button.title = photo.label;
    button.dataset.photo = id;
    button.onclick = () => change(() => { state.panels[state.selected] = newCrop(id); });
    library.append(button);
  }
}

const fields = ['title','subtitle','quote','tags','position','letterSize','over','heat','zoom'];
const crop = () => state.panels[state.selected];

function refresh() {
  const active = crop();
  for (const id of fields) {
    const input = byId(id);
    if (id === 'over') input.checked = state.over;
    else {
      const value = String(id === 'zoom' ? active.zoom : state[id]);
      if (input.value !== value) input.value = value;
    }
  }
  for (const [property,buttons] of choiceGroups) {
    for (const [value,button] of buttons) button.setAttribute('aria-pressed',state[property] === value);
  }
  for (const button of byId('library').children) button.setAttribute('aria-pressed',button.dataset.photo === active.photo);
  byId('heatValue').value = state.heat + ' / 5';
  byId('zoomValue').value = active.zoom.toFixed(2) + '×';
  byId('fit').setAttribute('aria-pressed',active.fit);
  byId('fill').setAttribute('aria-pressed',!active.fit);
  byId('panelLabel').textContent = 'Panel ' + (state.selected + 1) + ' crop';
  byId('undo').disabled = !before.length;
  byId('redo').disabled = !after.length;
  if (pending) cancelAnimationFrame(pending);
  pending = requestAnimationFrame(paint);
}

let proof = false;

function paint() {
  pending = 0;
  const [w,h] = formats[state.format];
  frames = renderCover(canvas,{...state,images},w,h);
  if (!proof) {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.strokeStyle = '#afffee';
    ctx.lineWidth = 3;
    ctx.setLineDash([12,8]);
    ctx.stroke(frames[state.selected].path);
    ctx.restore();
  }
  window.__shotReady = true;
}

for (const id of fields) {
  const input = byId(id);
  let snapshot;
  input.addEventListener('input', () => {
    if (!snapshot) {
      snapshot = structuredClone(state);
      remember(snapshot);
    }
    if (id === 'zoom') crop().zoom = Number(input.value);
    else if (id === 'heat') state.heat = Number(input.value);
    else state[id] = id === 'over' ? input.checked : input.value;
    refresh();
  });
  input.addEventListener('change', () => { snapshot = null; });
  input.addEventListener('blur', () => { snapshot = null; });
}

function clamp(value, min, max) {
  return Math.max(min,Math.min(max,value));
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return [(event.clientX-rect.left)*canvas.width/rect.width,(event.clientY-rect.top)*canvas.height/rect.height];
}

canvas.onpointerdown = event => {
  if (proof || event.button !== 0) return;
  const [x,y] = canvasPoint(event);
  const ctx = canvas.getContext('2d');
  const index = frames.findLastIndex(frame => ctx.isPointInPath(frame.path,x,y));
  if (index < 0) return;
  const snapshot = structuredClone(state);
  state.selected = index;
  gesture = { id:event.pointerId, x, y, snapshot, original:{...crop()}, frame:frames[index] };
  canvas.setPointerCapture(event.pointerId);
  refresh();
};

canvas.onpointermove = event => {
  if (gesture?.id !== event.pointerId) return;
  const [x,y] = canvasPoint(event);
  if (!gesture.moved && Math.hypot(x-gesture.x,y-gesture.y) < 3) return;
  if (!gesture.moved) remember(gesture.snapshot);
  gesture.moved = true;
  crop().x = clamp(gesture.original.x+(x-gesture.x)/gesture.frame.width,-1,1);
  crop().y = clamp(gesture.original.y+(y-gesture.y)/gesture.frame.height,-1,1);
  refresh();
};

canvas.onlostpointercapture = () => { gesture = null; };

canvas.addEventListener('wheel',event => {
  if (proof) return;
  event.preventDefault();
  if (!wheelTimer) remember();
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelTimer = 0; },220);
  crop().zoom = clamp(crop().zoom * Math.exp(-event.deltaY*.002),1,4);
  refresh();
},{passive:false});

canvas.addEventListener('keydown',event => {
  const direction = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
  if (!direction) return;
  event.preventDefault();
  change(() => {
    crop().x = clamp(crop().x+direction[0]*.014,-1,1);
    crop().y = clamp(crop().y+direction[1]*.014,-1,1);
  });
});

async function addPhotos(files) {
  let first;
  let failures = 0;
  for (const file of files) {
    const id = 'upload-' + ++uploadSerial;
    const url = URL.createObjectURL(file);
    try {
      await loadPhoto(id,file.name,url);
      first ??= id;
    } catch {
      URL.revokeObjectURL(url);
      failures++;
    }
  }
  if (first) {
    renderLibrary();
    change(() => { state.panels[state.selected] = newCrop(first); });
  }
  byId('status').textContent = failures ? 'Some files could not be opened as photos.' : 'Photos added to the library.';
}

byId('upload').onchange = event => {
  addPhotos([...event.target.files]);
  event.target.value = '';
};
window.addEventListener('dragover',event => {
  event.preventDefault();
  byId('stage').classList.add('dragover');
});
window.addEventListener('dragleave',event => {
  if (!event.relatedTarget) byId('stage').classList.remove('dragover');
});
window.addEventListener('drop',event => {
  event.preventDefault();
  byId('stage').classList.remove('dragover');
  if (event.dataTransfer.files.length) addPhotos(event.dataTransfer.files);
});

byId('undo').onclick = () => travel(before,after);
byId('redo').onclick = () => travel(after,before);
window.addEventListener('keydown',event => {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return;
  event.preventDefault();
  if (event.shiftKey) travel(after,before);
  else travel(before,after);
});

byId('fit').onclick = () => change(() => { crop().fit = true; });
byId('fill').onclick = () => change(() => { crop().fit = false; });
byId('reset').onclick = () => change(() => { state.panels[state.selected] = newCrop(crop().photo); });

const pick = values => values[Math.floor(Math.random()*values.length)];
byId('surprise').onclick = () => change(() => {
  state.layout = pick(Object.keys(layouts).filter(key => key !== state.layout));
  state.grade = pick(Object.keys(grades).filter(key => key !== state.grade));
  state.selected = 0;
  state.panels = state.panels.map(() => newCrop(pick([...images.keys()])));
  const captions = [
    ['Midnight Signal','No Sleep in Vice'],
    ['Pink Horizon','A Leonida Story'],
    ['Bayfront Saints','Trouble in Paradise'],
    ['Last Light','Meet Me at the Pier'],
  ];
  [state.title,state.subtitle] = pick(captions.filter(([title]) => title !== state.title));
});

function encodePNG(canvas) {
  return new Promise((resolve,reject) => canvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error('PNG encoding failed')),
    'image/png',
  ));
}

async function exportPosters(sizes) {
  const snapshot = {...structuredClone(state),images};
  const status = byId('status');
  const buttons = [byId('export'),byId('all')];
  buttons.forEach(button => { button.disabled = true; });
  status.textContent = 'Rendering PNG…';
  const offscreen = document.createElement('canvas');
  try {
    for (const size of sizes) {
      renderCover(offscreen,snapshot,...formats[size]);
      const url = URL.createObjectURL(await encodePNG(offscreen));
      const link = document.createElement('a');
      link.href = url;
      const name = snapshot.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      link.download = (name || 'vice-cover') + '-' + size + '.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url),30000);
    }
    status.textContent = sizes.length === 1 ? 'PNG ready.' : 'All three PNGs ready.';
  } catch {
    status.textContent = 'Could not export. Please try again.';
  } finally {
    buttons.forEach(button => { button.disabled = false; });
  }
}

byId('export').onclick = () => exportPosters([state.format]);
byId('all').onclick = () => exportPosters(Object.keys(formats));

choices('layouts',layouts,'layout');
choices('grades',Object.fromEntries(Object.keys(grades).map(name => [name,name])),'grade');
choices('formats',Object.fromEntries(Object.keys(formats).map(size => [size,size.replace('x','×')])),'format');
await Promise.allSettled([
  loadPhoto('boulevard','Boulevard','./samples/boulevard.jpg'),
  loadPhoto('pier','Pier','./samples/pier.jpg'),
]);
proof = configureShot(state,layouts,grades);
renderLibrary();
byId('status').textContent = 'Select a panel to crop, or drop photos to add them.';
refresh();
