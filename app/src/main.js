import {renderCover,panels} from './cover.js';
import {prepareScene} from './shots.js';

const $=id=>document.getElementById(id);
const state={photos:[],panels:Array.from({length:3},()=>({photo:0,x:0,y:0,zoom:1,fit:false})),layout:'hero',theme:'Sunset',title:'Sunset Heist',subtitle:'No rules. Just the coast.',position:'bottom',size:'1080x1080'};
let selected=0;
const canvas=$('cover');
function paint() {
  const [w,h]=state.size.split('x').map(Number);
  renderCover(canvas,state,w,h);
  $('panelName').textContent=`PANEL 0${selected+1}`;
  $('zoom').value=state.panels[selected].zoom;
}
function gallery() {
  $('photos').replaceChildren(...state.photos.map((p,i)=>{
    const thumb=document.createElement('img'); thumb.src=p.image.src; thumb.alt=`Assign ${p.name} to selected panel`; thumb.tabIndex=0;
    thumb.onclick=()=>{state.panels[selected].photo=i;paint();};
    thumb.onkeydown=e=>{if(e.key==='Enter')thumb.click();};
    return thumb;
  }));
}
async function load(files) {
  for(const file of files) if(file.type.startsWith('image/')) {
    try {
      const image=new Image(); image.src=URL.createObjectURL(file); await image.decode();
      state.photos.push({name:file.name,image}); state.panels[selected].photo=state.photos.length-1;
    } catch { $('status').textContent='That image could not be opened.'; }
  }
  gallery(); paint();
}
$('upload').onchange=e=>load(e.target.files);
document.ondragover=e=>e.preventDefault();
document.ondrop=e=>{e.preventDefault();load(e.dataTransfer.files);};
for(const key of ['layout','theme','title','subtitle','position','size']) $(key).oninput=e=>{state[key]=e.target.value;paint();};
$('zoom').oninput=e=>{state.panels[selected].zoom=Number(e.target.value);paint();};
$('fit').onclick=()=>{state.panels[selected].fit=!state.panels[selected].fit;paint();};
$('reset').onclick=()=>{Object.assign(state.panels[selected],{x:0,y:0,zoom:1});paint();};
let drag=null;
canvas.onpointerdown=e=>{
  const r=canvas.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*canvas.width,y=(e.clientY-r.top)/r.height*canvas.height;
  const hit=panels(state.layout,canvas.width,canvas.height).findIndex(([px,py,w,h])=>x>=px&&x<=px+w&&y>=py&&y<=py+h);
  if(hit<0)return;
  selected=hit; drag={x:e.clientX,y:e.clientY}; canvas.setPointerCapture(e.pointerId);paint();
};
canvas.onpointermove=e=>{
  if(!drag)return;
  const r=canvas.getBoundingClientRect(), p=state.panels[selected], box=panels(state.layout,r.width,r.height)[selected];
  p.x+=(e.clientX-drag.x)/box[2]; p.y+=(e.clientY-drag.y)/box[3]; drag={x:e.clientX,y:e.clientY};paint();
};
canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
canvas.addEventListener('wheel',e=>{e.preventDefault();const p=state.panels[selected];p.zoom=Math.max(.5,Math.min(4,p.zoom-e.deltaY*.001));paint();},{passive:false});
$('export').onclick=()=>{
  const output=document.createElement('canvas'),[w,h]=state.size.split('x').map(Number);
  renderCover(output,state,w,h);
  output.toBlob(blob=>{
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`vice-cover-${state.size}.png`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent=`Exported ${w} × ${h} PNG.`;
  },'image/png');
};
await prepareScene(state);
for(const key of ['layout','theme','title','subtitle','position','size']) $(key).value=state[key];
gallery();paint();window.__shotReady=true;
