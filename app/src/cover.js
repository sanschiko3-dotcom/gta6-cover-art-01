export function panelRects(layout) {
  if (layout === 'columns') return [[0,0,.34,1],[.34,0,.33,1],[.67,0,.33,1]];
  if (layout === 'strip') return [[0,0,1,.68],[0,.68,.5,.32],[.5,.68,.5,.32]];
  return [[0,0,.66,1],[.66,0,.34,.5],[.66,.5,.34,.5]];
}

function palm(c,x,y,s) {
  c.save();
  c.translate(x,y);
  c.scale(s,s);
  c.fillStyle = '#171126';
  c.beginPath();
  c.moveTo(-7,0);
  c.quadraticCurveTo(18,-90,0,-180);
  c.lineTo(8,-180);
  c.quadraticCurveTo(34,-90,9,0);
  c.fill();
  for (let i=0;i<8;i++) {
    const a = i*Math.PI/4;
    c.beginPath();
    c.moveTo(4,-178);
    c.quadraticCurveTo(Math.cos(a)*65,-210+Math.sin(a)*30,Math.cos(a)*100,-165+Math.sin(a)*65);
    c.quadraticCurveTo(Math.cos(a)*30,-190,4,-178);
    c.fill();
  }
  c.restore();
}

export function renderCover(canvas,state,width,height) {
  canvas.width = width;
  canvas.height = height;
  const c = canvas.getContext('2d');
  const s = width/1080;
  c.fillStyle = '#140d23';
  c.fillRect(0,0,width,height);
  panelRects(state.layout).forEach(([rx,ry,rw,rh],i)=>{
    const x=rx*width+7*s, y=ry*height+7*s;
    const w=rw*width-14*s, h=rh*height-14*s;
    const p=state.panels[i], image=state.photos[p.photo]?.image;
    c.save();
    c.beginPath();
    c.rect(x,y,w,h);
    c.clip();
    const sky=c.createLinearGradient(0,y,0,y+h);
    sky.addColorStop(0,state.theme==='Neon'?'#5338bb':'#bf438d');
    sky.addColorStop(.48,'#ffab76');
    sky.addColorStop(1,'#36234f');
    c.fillStyle=sky;
    c.fillRect(x,y,w,h);
    if(image) {
      const scale=(p.fit?Math.min(w/image.width,h/image.height):Math.max(w/image.width,h/image.height))*p.zoom;
      const pw=image.width*scale, ph=image.height*scale;
      c.filter=state.theme==='Noir'?'grayscale(1) contrast(1.3)':'saturate(1.35) contrast(1.15)';
      c.drawImage(image,x+(w-pw)/2+p.x*w,y+(h-ph)/2+p.y*h,pw,ph);
      c.filter='none';
    }
    c.globalCompositeOperation='soft-light';
    c.fillStyle=sky;
    c.fillRect(x,y,w,h);
    c.globalCompositeOperation='source-over';
    c.strokeStyle=state.theme==='Neon'?'#82ffec':'#ffd3ac';
    c.lineWidth=2*s;
    c.strokeRect(x+3*s,y+3*s,w-6*s,h-6*s);
    c.restore();
  });
  c.save();
  c.globalAlpha=.12;
  c.fillStyle='#1c1030';
  for(let y=0;y<height;y+=8*s) {
    for(let x=0;x<width;x+=8*s) {
      c.beginPath();
      c.arc(x,y,.8*s,0,Math.PI*2);
      c.fill();
    }
  }
  c.restore();
  const shade=c.createLinearGradient(0,height*.55,0,height);
  shade.addColorStop(0,'#120d2200');
  shade.addColorStop(1,'#120d22ee');
  c.fillStyle=shade;
  c.fillRect(0,0,width,height);
  palm(c,width*.94,height*.88,1.2*s);
  palm(c,width*.07,height*.88,.8*s);
  c.fillStyle='#171126';
  for(let i=0;i<24;i++) {
    const h=(18+(i*37)%65)*s;
    c.fillRect(i*width/24,height*.88-h,width/24+1,h);
  }
  c.fillStyle='#fff1d7';
  c.font=`bold ${15*s}px Arial`;
  c.fillText('VICE / ORIGINAL STORIES',35*s,40*s);
  c.textAlign='right';
  c.fillText('VOL. 01',width-35*s,40*s);
  const words=(state.title.trim()||'YOUR STORY').toUpperCase().split(/\s+/);
  const mid=Math.ceil(words.length/2);
  const lines=words.length>1?[words.slice(0,mid).join(' '),words.slice(mid).join(' ')]:words;
  let size=Math.min(width*.2,height*.17);
  do {
    c.font=`900 ${size}px Impact, Arial Black, sans-serif`;
    if(Math.max(...lines.map(t=>c.measureText(t).width))<width*.88) break;
    size-=2;
  } while(size>12);
  c.textAlign='center';
  c.lineJoin='round';
  const start=state.position==='top'?height*.2:height*.9-size*(lines.length-1);
  lines.forEach((line,i)=>{
    const y=start+i*size*.94;
    c.strokeStyle='#160c26';
    c.lineWidth=18*s;
    c.strokeText(line,width/2+5*s,y+8*s);
    c.strokeStyle='#fff1cf';
    c.lineWidth=8*s;
    c.strokeText(line,width/2,y);
    const ink=c.createLinearGradient(0,y-size,0,y);
    ink.addColorStop(0,state.theme==='Neon'?'#9ffff0':'#fff4d6');
    ink.addColorStop(1,state.theme==='Noir'?'#aaa4b4':'#ff839f');
    c.fillStyle=ink;
    c.fillText(line,width/2,y);
  });
  c.fillStyle='#fff0d9';
  c.font=`bold ${18*s}px Arial`;
  c.fillText(state.subtitle.toUpperCase(),width/2,state.position==='top'?start+size*lines.length:height*.96,width*.87);
}
