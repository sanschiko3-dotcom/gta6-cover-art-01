// Vice Cover Studio v2 renderer: 8 panel layouts, 6 skin-safe grades,
// halftone title block, heat-meter stars, palm band. Canvas only, no network.
export const layouts = {
  hero: 'Hero + side', columns: 'Three columns', strip: 'Hero + strip', slash: 'Slash',
  grid: '2 × 2 Grid', duo: 'Duo', triptych: 'Triptych', tilted: 'Tilted snapshots',
};

export const grades = {
  Sunset: ['#f461a4', '#ffad6d', '#382159'],
  Neon: ['#ed459c', '#ff9d78', '#383089'],
  Noir: ['#847789', '#d2c2b2', '#222131'],
  'Golden Hour': ['#d25765', '#ffc475', '#563452'],
  'Vice Pink': ['#ff69bd', '#ffc0a6', '#632f78'],
  'Teal Dawn': ['#407d99', '#ffc0a0', '#193f55'],
};

const boxes = {
  hero: [[0,0,.63,1],[.63,0,.37,.5],[.63,.5,.37,.5]],
  columns: [[0,0,.33,1],[.33,0,.34,1],[.67,0,.33,1]],
  strip: [[0,0,1,.68],[0,.68,.5,.32],[.5,.68,.5,.32]],
  slash: [[0,0,.52,1],[.52,0,.48,.53],[.52,.53,.48,.47]],
  grid: [[0,0,.5,.5],[.5,0,.5,.5],[0,.5,.5,.5],[.5,.5,.5,.5]],
  duo: [[0,0,.5,1],[.5,0,.5,1]],
  triptych: [[0,0,.30,.79],[.30,0,.4,.79],[.70,0,.30,.79],[0,.79,1,.21]],
  tilted: [[.025,.09,.33,.67,-.12],[.35,.035,.34,.76,.065],[.68,.14,.29,.65,.13]],
};

export function panelGeometry(layout, width, height, over = true, position = 'bottom') {
  const unit = Math.min(width, height);
  const margin = unit * .026;
  const reserve = over ? 0 : height * .29;
  const top = margin + (position === 'top' ? reserve : 0);
  const available = height - 2 * margin - reserve;
  const usable = width - 2 * margin;
  const slope = layout === 'slash' ? unit * .22 : 0;
  return boxes[layout].map(([x,y,w,h,rotation = 0]) => {
    const left = margin + x * usable;
    const right = left + w * usable;
    const upper = top + y * available;
    const lower = upper + h * available;
    const skew = (edge, row) => edge + (edge === margin || Math.abs(edge - (width - margin)) < 1 ? 0 : slope * (.5 - row));
    const centerX = (left + right) / 2;
    const centerY = (upper + lower) / 2;
    const corners = [[skew(left,y), upper], [skew(right,y), upper],
      [skew(right,y+h), lower], [skew(left,y+h), lower]];
    const path = new Path2D();
    corners.forEach(([px, py], i) => {
      const dx = px - centerX;
      const dy = py - centerY;
      const X = centerX + dx * Math.cos(rotation) - dy * Math.sin(rotation);
      const Y = centerY + dx * Math.sin(rotation) + dy * Math.cos(rotation);
      if (i === 0) path.moveTo(X,Y);
      else path.lineTo(X,Y);
    });
    path.closePath();
    const pad = slope / 2;
    return { path, left: left - pad, top: upper, width: right - left + 2 * pad, height: lower - upper };
  });
}

function randomSequence(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function palm(ctx, x, y, size, lean) {
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(size * lean,size);
  ctx.beginPath();
  ctx.moveTo(-.08,0);
  ctx.quadraticCurveTo(-.12,-.53,.17,-.99);
  ctx.quadraticCurveTo(-.04,-.60,.06,0);
  ctx.fill();
  ctx.translate(.17,-.96);
  for (let branch = 0; branch < 8; branch++) {
    const angle = -3.15 + branch * .47;
    ctx.save();
    ctx.rotate(angle);
    const length = .29 + (branch % 3) * .072;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.quadraticCurveTo(length * .57,-.18,length,.055);
    for (let tip = 5; tip > 0; tip--) {
      ctx.lineTo(length * tip / 6,.052 - tip * .01);
      ctx.lineTo(length * (tip - .45) / 6,.083 - tip * .009);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function paintSkyline(ctx, width, height, palette, unit) {
  const sky = ctx.createLinearGradient(0,0,0,height);
  sky.addColorStop(0,palette[0]);
  sky.addColorStop(.47,palette[1]);
  sky.addColorStop(1,palette[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0,0,width,height);
  ctx.fillStyle = '#ffdf9d';
  ctx.beginPath();
  ctx.arc(width * .76,height * .33,unit * .21,0,Math.PI * 2);
  ctx.fill();
  const random = randomSequence(19);
  const baseline = height * .79;
  for (let x = 0; x < width; ) {
    const w = unit * (.018 + random() * .052);
    const h = unit * (.025 + random() * .17);
    ctx.fillStyle = '#342143';
    ctx.fillRect(x,baseline-h,w, h + height * .21);
    ctx.fillStyle = '#f2ae9188';
    for (let y = baseline-h+unit*.012; y < baseline; y += unit*.016) {
      ctx.fillRect(x+w*.18,y,w*.55,unit*.002);
    }
    x += w + unit*.006;
  }
}

function paintPanel(ctx, frame, crop, image, palette, unit) {
  ctx.save();
  ctx.clip(frame.path);
  if (image) {
    const { left, top, width, height } = frame;
    const scale = (crop.fit ? Math.min : Math.max)(width/image.naturalWidth,height/image.naturalHeight) * crop.zoom;
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    ctx.drawImage(image,left+(width-w)/2+crop.x*width,top+(height-h)/2+crop.y*height,w,h);
    const grade = ctx.createLinearGradient(left,top,left+width,top+height);
    grade.addColorStop(0,palette[0]);
    grade.addColorStop(.55,palette[1]);
    grade.addColorStop(1,palette[2]);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = .53;
    ctx.fillStyle = grade;
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.strokeStyle = '#170f22';
  ctx.lineWidth = unit * .021;
  ctx.stroke(frame.path);
  ctx.strokeStyle = palette[1];
  ctx.lineWidth = unit * .004;
  ctx.stroke(frame.path);
  ctx.restore();
}

function texture(ctx, width, height, unit) {
  const shade = ctx.createRadialGradient(width*.5,height*.38,unit*.19,width*.5,height*.45,width*.67);
  shade.addColorStop(0,'#1a0b2300');
  shade.addColorStop(1,'#190d28b8');
  ctx.fillStyle = shade;
  ctx.fillRect(0,0,width,height);
  const random = randomSequence(84);
  for (let i=0; i<4200; i++) {
    ctx.fillStyle = i % 2 ? '#fff2aa26' : '#13091c32';
    ctx.fillRect(random()*width,random()*height,unit*.0019,unit*.0015);
  }
}

function paintTitle(ctx, state, width, height, unit, palette) {
  const y = state.position === 'top' ? height * .245 : height * .815;
  const size = { small: .115, medium: .153, large: .18 }[state.letterSize] * unit;
  const title = state.title.trim().toUpperCase();
  ctx.save();
  ctx.translate(width*.5,y);
  ctx.transform(1,-.039,0,1,0,0);
  const block = Math.min(width*.87,Math.max(width*.56,title.length*size*.54));
  const backing = ctx.createLinearGradient(-block/2,0,block/2,0);
  backing.addColorStop(0,'#180c29dd');
  backing.addColorStop(.55,'#2a1439f5');
  backing.addColorStop(1,'#160e2be8');
  ctx.fillStyle = backing;
  ctx.fillRect(-block/2,-size*.93,block,size*1.2);
  ctx.fillStyle = '#f55dac50';
  for (let x = -block/2+unit*.009; x < block/2; x += unit*.012) {
    for (let dy = -size*.86; dy < size*.22; dy += unit*.012) {
      ctx.beginPath();
      ctx.arc(x,dy,unit*.0018,0,Math.PI*2);
      ctx.fill();
    }
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '1000 ' + size + 'px Impact, "Arial Narrow", "DejaVu Sans", sans-serif';
  ctx.lineJoin = 'round';
  const limit = block * .91;
  ctx.strokeStyle = '#0e0918';
  ctx.lineWidth = unit*.026;
  ctx.strokeText(title,unit*.011,unit*.013,limit);
  ctx.strokeStyle = '#f857a1';
  ctx.lineWidth = unit*.018;
  ctx.strokeText(title,0,0,limit);
  ctx.strokeStyle = '#271332';
  ctx.lineWidth = unit*.012;
  ctx.strokeText(title,0,0,limit);
  const lettering = ctx.createLinearGradient(0,-size*.76,0,0);
  lettering.addColorStop(0,'#fff8d4');
  lettering.addColorStop(.46,'#ffdc9b');
  lettering.addColorStop(1,palette[0]);
  ctx.fillStyle = lettering;
  ctx.fillText(title,0,0,limit);
  ctx.font = 'italic bold ' + unit*.058 + 'px "Snell Roundhand", "Brush Script MT", cursive';
  ctx.strokeStyle = '#20122d';
  ctx.lineWidth = unit*.012;
  ctx.strokeText(state.subtitle,0,size*.33,limit);
  ctx.shadowColor = '#6fffee';
  ctx.shadowBlur = unit*.012;
  ctx.fillStyle = '#acfff0';
  ctx.fillText(state.subtitle,0,size*.33,limit);
  ctx.restore();
}

function paintPosterDetails(ctx, state, w, h, unit, palette) {
  const band = unit*.107;
  ctx.fillStyle = '#171027';
  ctx.fillRect(0,h-band*.56,w,band*.56);
  for (let x=0, i=0; x<w; x+=unit*.185, i++) {
    ctx.fillStyle = i%2 ? '#251436' : '#1c112d';
    palm(ctx,x+unit*.08,h,unit*(.11+(i%3)*.025),i%2 ? -1 : 1);
  }
  const ribbon = unit*.045;
  ctx.fillStyle = '#1c102b';
  ctx.fillRect(unit*.045,unit*.043,unit*.378,ribbon);
  ctx.strokeStyle = palette[1];
  ctx.lineWidth = unit*.002;
  ctx.strokeRect(unit*.045,unit*.043,unit*.378,ribbon);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = 'bold '+unit*.017+'px monospace';
  ctx.fillStyle = '#fff0ba';
  ctx.fillText('★ VICE CITY ★ EST. 2026',unit*.064,unit*.066);
  ctx.textAlign = 'right';
  ctx.font = 'bold '+unit*.032+'px sans-serif';
  for (let i=0;i<5;i++) {
    const x = w-unit*(.049+(4-i)*.035);
    ctx.strokeStyle = '#20142e';
    ctx.lineWidth = unit*.008;
    ctx.strokeText('★',x,unit*.067);
    ctx.fillStyle = i<state.heat ? '#ffe298' : '#77657e';
    ctx.fillText('★',x,unit*.067);
  }
  ctx.font = 'bold '+unit*.017+'px monospace';
  ctx.fillStyle = '#ffabc9';
  ctx.fillText(state.tags,w-unit*.05,h-unit*.028,w*.42);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff0d1';
  ctx.fillText(state.quote ? '“'+state.quote+'”' : '',unit*.05,h-unit*.028,w*.44);
}

export function renderCover(canvas, state, width, height) {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  const unit = Math.min(width,height);
  const palette = grades[state.grade];
  paintSkyline(ctx,width,height,palette,unit);
  const panels = panelGeometry(state.layout,width,height,state.over,state.position);
  panels.forEach((frame,index) => {
    const crop = state.panels[index];
    paintPanel(ctx,frame,crop,state.images.get(crop.photo)?.image,palette,unit);
  });
  texture(ctx,width,height,unit);
  paintPosterDetails(ctx,state,width,height,unit,palette);
  paintTitle(ctx,state,width,height,unit,palette);
  return panels;
}
