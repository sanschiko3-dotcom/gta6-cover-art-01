import {renderCover,panelRects} from './cover.js';
import {readScene,loadPhoto} from './shots.js';

const $=id=>document.getElementById(id);
const scene=readScene();
const canvas=$('cover');
const state={
  photos:[],
  panels:Array.from({length:3},(_,i)=>({photo:i%2,x:0,y:0,zoom:1,fit:false})),
  selected:0,
  layout:scene.layout,
  theme:'Sunset',
  title:scene.title,
  subtitle:'ONE LAST NIGHT. NO SECOND CHANCES.',
  position:'bottom',
  size:scene.size,
};
function paint() {
  const [w,h]=state.size.split('x').map(Number);
  renderCover(canvas,state,w,h);
  $('dimensions').textContent=`${w} × ${h}`;
  $('selected').textContent=`Panel 0${state.selected+1}`;
  $('zoom').value=state.panels[state.selected].zoom;
}
function thumbnails() {
  $('photos').replaceChildren();
  state.photos.forEach((photo,i)=>{
    const button=document.createElement('button');
    const img=document.createElement('img');
    img.src=photo.src;
    img.alt=photo.name;
    button.title=`Assign ${photo.name}`;
    button.append(img);
    button.onclick=()=>{
      state.panels[state.selected].photo=i;
      paint();
    };
    $('photos').append(button);
  });
}
async function addFiles(files) {
  for(const file of files) {
    if(!file.type.startsWith('image/')) continue;
    try {
      state.photos.push(await loadPhoto(URL.createObjectURL(file),file.name));
      state.panels[state.selected].photo=state.photos.length-1;
    } catch {
      $('status').textContent='Could not read image. Try PNG or JPG.';
    }
  }
  thumbnails();
  paint();
}
$('upload').onchange=e=>addFiles(e.target.files);
document.ondragover=e=>e.preventDefault();
document.ondrop=e=>{
  e.preventDefault();
  addFiles(e.dataTransfer.files);
};
for(const key of ['layout','theme','title','subtitle','position','size']) {
  $(key).value=state[key];
  $(key).oninput=e=>{
    state[key]=e.target.value;
    paint();
  };
}
$('zoom').oninput=e=>{
  state.panels[state.selected].zoom=Number(e.target.value);
  paint();
};
$('fit').onclick=()=>{
  const p=state.panels[state.selected];
  p.fit=!p.fit;
  $('fit').textContent=p.fit?'Fit ✓ / Fill':'Fit / Fill ✓';
  paint();
};
$('reset').onclick=()=>{
  Object.assign(state.panels[state.selected],{x:0,y:0,zoom:1,fit:false});
  paint();
};
let drag;
canvas.onpointerdown=e=>{
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  state.selected=Math.max(0,panelRects(state.layout).findIndex(([a,b,w,h])=>x>=a&&x<=a+w&&y>=b&&y<=b+h));
  drag={x:e.clientX,y:e.clientY};
  canvas.setPointerCapture(e.pointerId);
  paint();
};
canvas.onpointermove=e=>{
  if(!drag) return;
  const r=canvas.getBoundingClientRect(),p=state.panels[state.selected];
  const bounds=panelRects(state.layout)[state.selected];
  p.x+=(e.clientX-drag.x)/(r.width*bounds[2]);
  p.y+=(e.clientY-drag.y)/(r.height*bounds[3]);
  drag={x:e.clientX,y:e.clientY};
  paint();
};
canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;};
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const p=state.panels[state.selected];
  p.zoom=Math.max(.5,Math.min(4,p.zoom-e.deltaY*.001));
  paint();
},{passive:false});
$('export').onclick=()=>{
  paint();
  canvas.toBlob(blob=>{
    if(!blob) return;
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;
    a.download=`vice-cover-${state.size}.png`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('status').textContent=`Exported ${state.size} PNG.`;
  },'image/png');
};
state.photos=await Promise.all([
  loadPhoto(`samples/${scene.photo}.jpg`,scene.photo),
  loadPhoto(`samples/${scene.photo==='pier'?'boulevard':'pier'}.jpg`,'Alternate scene'),
]);
if(scene.mode==='cover') document.body.classList.add('cover-only');
thumbnails();
paint();
window.__shotReady=true;
window.__studio={state,paint};
