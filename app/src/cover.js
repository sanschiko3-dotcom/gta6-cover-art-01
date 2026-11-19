export function panels(layout, w, h) {
  const g = w * .012;
  if (layout === 'columns') return [0,1,2].map(i => [g+i*w/3,g,w/3-g*2,h-g*2]);
  if (layout === 'strip') return [[g,g,w-g*2,h*.66],[g,h*.67,w*.49,h*.33-g],[w*.51,h*.67,w*.49-g,h*.33-g]];
  return [[g,g,w*.65,h-g*2],[w*.67,g,w*.33-g,h*.49],[w*.67,h*.51,w*.33-g,h*.49-g]];
}

function palm(c,x,y,s) {
  c.save(); c.translate(x,y); c.scale(s,s); c.fillStyle='#130f25';
  c.beginPath(); c.moveTo(-7,180); c.quadraticCurveTo(12,70,0,0); c.lineTo(8,0); c.quadraticCurveTo(30,80,14,180); c.fill();
  for(let i=0;i<7;i++) {
    c.save(); c.rotate(i*.65-2.1); c.beginPath(); c.moveTo(0,0);
    c.quadraticCurveTo(55,-45,105,10); c.quadraticCurveTo(55,-9,0,6); c.fill(); c.restore();
  }
  c.restore();
}

export function renderCover(canvas,state,w,h) {
  canvas.width=w; canvas.height=h;
  const c=canvas.getContext('2d');
  c.fillStyle='#100c20'; c.fillRect(0,0,w,h);
  panels(state.layout,w,h).forEach(([x,y,pw,ph],i)=>{
    c.save(); c.beginPath(); c.rect(x,y,pw,ph); c.clip();
    const sky=c.createLinearGradient(0,y,0,y+ph);
    sky.addColorStop(0,'#672c86'); sky.addColorStop(.48,'#ef7996'); sky.addColorStop(1,'#ffc18c');
    c.fillStyle=sky; c.fillRect(x,y,pw,ph);
    const p=state.panels[i], img=state.photos[p.photo]?.image;
    if(img) {
      const scale=(p.fit?Math.min:Math.max)(pw/img.width,ph/img.height)*p.zoom;
      c.drawImage(img,x+(pw-img.width*scale)/2+p.x*pw,y+(ph-img.height*scale)/2+p.y*ph,img.width*scale,img.height*scale);
    }
    c.globalCompositeOperation=state.theme==='Noir'?'saturation':'soft-light';
    c.fillStyle=state.theme==='Noir'?'#777':state.theme==='Neon'?'#b42dcd':'#ff7d87'; c.fillRect(x,y,pw,ph);
    c.globalCompositeOperation='source-over';
    c.globalAlpha=.3; c.fillStyle='#ffdfaa'; c.beginPath(); c.arc(x+pw*.72,y+ph*.22,pw*.17,0,Math.PI*2); c.fill(); c.globalAlpha=1;
    const shade=c.createLinearGradient(0,y,0,y+ph); shade.addColorStop(0,'#170d2900'); shade.addColorStop(1,'#130f28dd');
    c.fillStyle=shade; c.fillRect(x,y,pw,ph);
    palm(c,x+pw*.12,y+ph*.14,pw/600);
    if(i===0) palm(c,x+pw*.95,y+ph*.23,-pw/780);
    c.fillStyle='#110f23';
    for(let j=0;j<18;j++) c.fillRect(x+j*pw/18,y+ph*(.88-(j*7%9)/110),pw/22,ph*.2);
    c.fillStyle='#fbc6b0'; c.globalAlpha=.11;
    for(let dx=0;dx<pw;dx+=w/130) for(let dy=0;dy<ph;dy+=w/130) { c.beginPath(); c.arc(x+dx,y+dy,w/1100,0,7); c.fill(); }
    c.globalAlpha=1; c.strokeStyle=state.theme==='Neon'?'#75f5ec':'#f8b2bd'; c.lineWidth=w*.0015; c.strokeRect(x+4,y+4,pw-8,ph-8);
    c.restore();
  });
  const top=state.position==='top';
  c.textAlign='center'; c.fillStyle='#ffe5ce'; c.font=`bold ${w*.014}px Arial`; c.letterSpacing=`${w*.004}px`;
  c.fillText('A VICE CITY ORIGINAL  /  AFTER HOURS',w/2,top?h*.055:h*.63);
  c.letterSpacing='0px';
  const words=(state.title||'UNTITLED').toUpperCase().split(' ');
  const lines=words.length>1?[words.slice(0,Math.ceil(words.length/2)).join(' '),words.slice(Math.ceil(words.length/2)).join(' ')]:words;
  let font=w*.145; c.font=`900 ${font}px Impact, Arial Black, sans-serif`;
  const widest=Math.max(...lines.map(t=>c.measureText(t).width));
  font*=Math.min(1,w*.87/widest);
  c.font=`900 ${font}px Impact, Arial Black, sans-serif`; c.lineJoin='round';
  lines.forEach((t,i)=>{
    const y=(top?h*.08:h*.66)+font*(i+.88)*.95;
    c.strokeStyle='#110d22'; c.lineWidth=w*.02; c.strokeText(t,w/2+w*.005,y+w*.009);
    c.strokeStyle='#ffe3c2'; c.lineWidth=w*.009; c.strokeText(t,w/2,y);
    const ink=c.createLinearGradient(0,y-font,0,y); ink.addColorStop(0,state.theme==='Neon'?'#a4fff1':'#fff2cd'); ink.addColorStop(1,state.theme==='Noir'?'#aaaaaa':'#f18ca8');
    c.fillStyle=ink; c.fillText(t,w/2,y);
  });
  // Keep the closing line legible across square, portrait, and wide exports.
  c.font=`bold ${w*.018}px Arial`; c.fillStyle='#ffddc8';
  c.fillText(state.subtitle.toUpperCase(),w/2,top?h*.43:h*.965,w*.85);
}
