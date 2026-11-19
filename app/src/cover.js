const GRADE_PALETTES = {
  Sunset: { sky: ['#351550', '#e54775', '#ffad62'], tint: '#ff6e87', accent: '#77f2de', glow: '#ffbd71', ink: '#191229' },
  Neon: { sky: ['#141946', '#7a1d78', '#ff4b88'], tint: '#ef4a9f', accent: '#68f4e8', glow: '#ff9c75', ink: '#100e2e' },
  Noir: { sky: ['#111a2c', '#4f3d53', '#b87980'], tint: '#a0b6bd', accent: '#bce4da', glow: '#f0cf9e', ink: '#10121d' },
  'Golden Hour': { sky: ['#34203c', '#c15954', '#f7bc70'], tint: '#eaa067', accent: '#95efdc', glow: '#ffe1a3', ink: '#26162c' },
  'Vice Pink': { sky: ['#351545', '#d72f87', '#ffacbc'], tint: '#ff5ea8', accent: '#9af8e0', glow: '#ffd0b5', ink: '#24102f' },
  'Teal Dawn': { sky: ['#102741', '#207d8b', '#d18b8f'], tint: '#4ec0b2', accent: '#ff8fb1', glow: '#ffcf9c', ink: '#102333' }
};

const LAYOUT_NAMES = {
  hero: 'HERO COMPOSITION', columns: 'THREE COLUMN CUT', strip: 'HERO + STRIP', slash: 'SLASHED STORIES',
  grid: '2 × 2 CONTACT SHEET', duo: 'DUO PORTRAITS', triptych: 'TRIPTYCH EDITION', tilted: 'TILTED SNAPSHOTS'
};

function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }

function getGradePalette(grade) { return GRADE_PALETTES[grade] || GRADE_PALETTES.Sunset; }

function getLayoutPanels(layout, width, height) {
  const g = Math.max(7, Math.round(Math.min(width, height) * 0.012));
  const topBand = Math.round(height * 0.045);
  const panels = [];
  if (layout === 'hero') {
    panels.push({ x: g, y: g + topBand, w: width * .65 - g * 1.5, h: height - g * 2 - topBand, role: 'hero' });
    panels.push({ x: width * .65 + g * .5, y: g + topBand, w: width * .35 - g * 1.5, h: height * .45, role: 'side' });
    panels.push({ x: width * .65 + g * .5, y: height * .45 + g * 1.2, w: width * .35 - g * 1.5, h: height * .55 - g * 2.2, role: 'side' });
  } else if (layout === 'columns') {
    for (let i = 0; i < 3; i++) panels.push({ x: g + i * (width / 3), y: g + topBand, w: width / 3 - g * 1.5, h: height - g * 2 - topBand, role: i === 1 ? 'hero' : 'side' });
  } else if (layout === 'strip') {
    panels.push({ x: g, y: g + topBand, w: width - g * 2, h: height * .68, role: 'hero' });
    for (let i = 0; i < 3; i++) panels.push({ x: g + i * (width / 3), y: height * .7, w: width / 3 - g * 1.5, h: height * .3 - g * 1.5, role: 'strip' });
  } else if (layout === 'slash') {
    panels.push({ x: g, y: g + topBand, w: width * .58, h: height - g * 2 - topBand, role: 'hero', skew: -width * .055 });
    panels.push({ x: width * .56, y: g + topBand, w: width * .22, h: height - g * 2 - topBand, role: 'side', skew: -width * .035 });
    panels.push({ x: width * .77, y: g + topBand, w: width * .23 - g, h: height - g * 2 - topBand, role: 'side', skew: -width * .02 });
  } else if (layout === 'grid') {
    panels.push({ x: g, y: g + topBand, w: width / 2 - g * 1.5, h: height / 2 - g * 1.3, role: 'hero' });
    panels.push({ x: width / 2 + g * .5, y: g + topBand, w: width / 2 - g * 1.5, h: height / 2 - g * 1.3, role: 'side' });
    panels.push({ x: g, y: height / 2 + g * .5, w: width / 2 - g * 1.5, h: height / 2 - g * 1.5, role: 'side' });
    panels.push({ x: width / 2 + g * .5, y: height / 2 + g * .5, w: width / 2 - g * 1.5, h: height / 2 - g * 1.5, role: 'side' });
  } else if (layout === 'duo') {
    panels.push({ x: g, y: g + topBand, w: width / 2 - g * 1.5, h: height - g * 2 - topBand, role: 'hero' });
    panels.push({ x: width / 2 + g * .5, y: g + topBand, w: width / 2 - g * 1.5, h: height - g * 2 - topBand, role: 'side' });
  } else if (layout === 'triptych') {
    for (let i = 0; i < 3; i++) panels.push({ x: g + i * width / 3, y: g + topBand, w: width / 3 - g * 1.5, h: height * .79 - g * 1.5, role: i === 1 ? 'hero' : 'side' });
    panels.push({ x: g, y: height * .82, w: width - g * 2, h: height * .18 - g * 1.5, role: 'strip' });
  } else {
    panels.push({ x: width * .06, y: height * .16, w: width * .56, h: height * .7, role: 'hero', tilt: -.055 });
    panels.push({ x: width * .43, y: height * .08, w: width * .42, h: height * .68, role: 'side', tilt: .07 });
    panels.push({ x: width * .56, y: height * .47, w: width * .35, h: height * .4, role: 'strip', tilt: .02 });
  }
  return panels;
}

function drawSkyBackdrop(ctx, width, height, palette) {
  const sky = ctx.createLinearGradient(0, 0, width, height);
  sky.addColorStop(0, palette.sky[0]); sky.addColorStop(.47, palette.sky[1]); sky.addColorStop(1, palette.sky[2]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = .18;
  const haze = ctx.createRadialGradient(width * .72, height * .38, 0, width * .72, height * .38, width * .8);
  haze.addColorStop(0, '#ffe6bd'); haze.addColorStop(1, '#ff8ca000'); ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1;
  const sunX = width * .72, sunY = height * .33, sunR = Math.max(28, Math.min(width, height) * .13);
  ctx.save(); ctx.globalAlpha = .24; ctx.fillStyle = palette.glow; ctx.beginPath(); ctx.arc(sunX, sunY, sunR * 1.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = .88;
  ctx.fillStyle = palette.glow; ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  drawDistantSkyline(ctx, width, height, palette.ink);
}

function drawDistantSkyline(ctx, width, height, ink) {
  const base = height * .68;
  ctx.save(); ctx.globalAlpha = .48; ctx.fillStyle = ink; ctx.beginPath();
  ctx.moveTo(0, base);
  const blocks = [[.03,.12,.11],[.15,.2,.08],[.24,.12,.07],[.33,.26,.1],[.45,.15,.06],[.53,.29,.08],[.64,.17,.08],[.75,.22,.11],[.89,.13,.08]];
  blocks.forEach(([at, tall, span]) => { const x = at * width; ctx.lineTo(x, base); ctx.lineTo(x, base - tall * height); ctx.lineTo(x + span * width, base - tall * height); ctx.lineTo(x + span * width, base); });
  ctx.lineTo(width, base); ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = .7; ctx.strokeStyle = '#ffd69577'; ctx.lineWidth = Math.max(1, width / 900);
  for (let i = 0; i < 22; i++) { const x = width * (.03 + (i * .043) % .92); const y = base - height * (.06 + (i % 5) * .03); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + width * .008, y); ctx.stroke(); } ctx.restore();
}

function drawPalmSilhouette(ctx, x, base, scale, ink) {
  ctx.save(); ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, scale * 4); ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + scale * .08, base - scale * .45, x - scale * .01, base - scale); ctx.stroke();
  const topX = x - scale * .01, topY = base - scale;
  for (let i = 0; i < 9; i++) { const a = -Math.PI * .95 + i * Math.PI * .23; ctx.beginPath(); ctx.moveTo(topX, topY); ctx.quadraticCurveTo(topX + Math.cos(a) * scale * .38, topY + Math.sin(a) * scale * .25, topX + Math.cos(a) * scale * (1.1 + (i % 2) * .15), topY + Math.sin(a) * scale * (1.1 + (i % 2) * .15)); ctx.stroke(); }
  ctx.restore();
}

function drawPalmBand(ctx, width, height, ink, accent) {
  const y = height * .91; ctx.save(); ctx.globalAlpha = .92; ctx.fillStyle = ink; ctx.beginPath(); ctx.moveTo(0, y + height * .04);
  ctx.lineTo(0, y); for (let i = 0; i < 12; i++) { const x = width * i / 11; const h = height * (.035 + (i % 3) * .015); ctx.lineTo(x, y - h); ctx.lineTo(x + width / 25, y - h * .75); } ctx.lineTo(width, y); ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = .55; ctx.strokeStyle = accent; ctx.lineWidth = Math.max(1, width / 700); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); drawPalmSilhouette(ctx, width * .11, y + height * .03, height * .1, ink); drawPalmSilhouette(ctx, width * .88, y + height * .03, height * .08, ink); ctx.restore();
}

function drawPhotoInPanel(ctx, panel, image, crop, palette) {
  ctx.save();
  if (panel.tilt) { ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2); ctx.rotate(panel.tilt); ctx.translate(-panel.w / 2, -panel.h / 2); } else ctx.translate(panel.x, panel.y);
  const x = 0, y = 0, w = panel.w, h = panel.h;
  ctx.fillStyle = '#252034'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath();
  if (panel.skew) {
    const upper = Math.max(0, -panel.skew), lower = Math.max(0, panel.skew);
    ctx.moveTo(upper + 2, 2); ctx.lineTo(w - 2, 2); ctx.lineTo(w - lower - 2, h - 2); ctx.lineTo(2, h - 2); ctx.closePath();
  } else ctx.rect(x + 2, y + 2, w - 4, h - 4);
  ctx.clip();
  if (image && image.complete && image.naturalWidth) {
    const iw = image.naturalWidth, ih = image.naturalHeight, fit = crop?.fit || 'fill', zoom = crop?.zoom || 1;
    const base = fit === 'fit' ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih);
    const drawW = iw * base * zoom, drawH = ih * base * zoom;
    const px = (w - drawW) * .5 + (crop?.panX || 0) * w, py = (h - drawH) * .5 + (crop?.panY || 0) * h;
    ctx.drawImage(image, px, py, drawW, drawH);
  } else {
    const fallback = ctx.createLinearGradient(0, 0, w, h); fallback.addColorStop(0, palette.sky[1]); fallback.addColorStop(1, palette.sky[0]); ctx.fillStyle = fallback; ctx.fillRect(0, 0, w, h); drawDistantSkyline(ctx, w, h, palette.ink);
  }
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .26; ctx.fillStyle = palette.tint; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .11; ctx.fillStyle = palette.accent; ctx.fillRect(0, h * .72, w, h * .28); ctx.restore();
  ctx.beginPath();
  if (panel.skew) { const upper = Math.max(0, -panel.skew), lower = Math.max(0, panel.skew); ctx.moveTo(upper + 4, 4); ctx.lineTo(w - 4, 4); ctx.lineTo(w - lower - 4, h - 4); ctx.lineTo(4, h - 4); ctx.closePath(); }
  else ctx.rect(4, 4, w - 8, h - 8);
  ctx.globalAlpha = .48; ctx.strokeStyle = palette.accent; ctx.lineWidth = Math.max(1, w / 420); ctx.stroke();
  ctx.beginPath();
  if (panel.skew) { const upper = Math.max(0, -panel.skew), lower = Math.max(0, panel.skew); ctx.moveTo(upper, 0); ctx.lineTo(w, 0); ctx.lineTo(w - lower, h); ctx.lineTo(0, h); ctx.closePath(); }
  else ctx.rect(0, 0, w, h);
  ctx.globalAlpha = 1; ctx.strokeStyle = '#100d1f'; ctx.lineWidth = Math.max(3, w / 170); ctx.stroke(); ctx.restore();
}

function drawHalftone(ctx, x, y, width, height, color, density = 9) {
  ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = color;
  for (let yy = y; yy < y + height; yy += density) for (let xx = x; xx < x + width; xx += density) { const d = ((xx + yy) / density) % 3 ? 1.1 : 2; ctx.beginPath(); ctx.arc(xx, yy, d, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function fitTitle(ctx, title, maxWidth, preferred) { let size = preferred; ctx.font = `900 ${size}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`; while (ctx.measureText(title).width > maxWidth && size > 18) { size -= 1; ctx.font = `900 ${size}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`; } return size; }

function drawTitleTreatment(ctx, state, width, height, palette, panels) {
  const title = (state.title || 'SUNSET HEIST').toUpperCase(); const top = state.titlePosition === 'top'; const titleY = top ? height * .13 : height * .78; const maxWidth = width * .78; const titleSize = fitTitle(ctx, title, maxWidth, Math.max(34, width * .095));
  const blockW = Math.min(maxWidth + width * .08, width * .9), blockH = titleSize * 1.42; const blockX = top ? width * .05 : width * .06; const blockY = titleY - titleSize * .95;
  if (state.titleOverArt !== false) { ctx.save(); ctx.fillStyle = '#170e25d9'; ctx.strokeStyle = palette.accent; ctx.lineWidth = Math.max(1.2, width / 500); ctx.fillRect(blockX, blockY, blockW, blockH); ctx.strokeRect(blockX, blockY, blockW, blockH); drawHalftone(ctx, blockX, blockY, blockW, blockH, palette.accent, Math.max(7, width / 125)); ctx.restore(); }
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `900 ${titleSize}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`;
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(10, titleSize * .17); ctx.strokeStyle = '#100c1d'; ctx.strokeText(title, blockX + width * .025, titleY);
  ctx.lineWidth = Math.max(5, titleSize * .08); ctx.strokeStyle = palette.accent; ctx.strokeText(title, blockX + width * .025, titleY);
  const fill = ctx.createLinearGradient(0, titleY - titleSize, 0, titleY + titleSize * .2); fill.addColorStop(0, '#ffe2ee'); fill.addColorStop(.45, '#ff8eb4'); fill.addColorStop(1, palette.glow); ctx.fillStyle = fill; ctx.fillText(title, blockX + width * .025, titleY);
  ctx.globalAlpha = .4; ctx.fillStyle = '#fff'; ctx.fillText(title, blockX + width * .025 + 2, titleY - 2); ctx.restore();
  const subtitle = state.subtitle || 'Vice City, after dark'; ctx.save(); ctx.textAlign = 'left'; ctx.font = `${Math.max(18, titleSize * .32)}px "Segoe Script", "Brush Script MT", cursive`; ctx.fillStyle = palette.accent; ctx.shadowColor = palette.accent; ctx.shadowBlur = 13; ctx.fillText(subtitle, blockX + width * .025, titleY + titleSize * .45); ctx.shadowBlur = 0; ctx.restore();
  drawBadgeRibbon(ctx, width, height, palette, title); drawMetadata(ctx, state, width, height, palette, top ? height * .88 : height * .12); drawHeatMeter(ctx, state.heat, width, height, palette, top ? width * .87 : width * .87, top ? height * .9 : height * .2);
}

function drawBadgeRibbon(ctx, width, height, palette, title) {
  const x = width * .06, y = height * .05, w = Math.min(width * .28, 250), h = Math.max(22, height * .045); ctx.save(); ctx.translate(x, y); ctx.fillStyle = palette.ink; ctx.strokeStyle = palette.accent; ctx.lineWidth = Math.max(1, width / 700); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w - h * .7, h / 2); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffe6a5'; ctx.font = `800 ${Math.max(9, h * .37)}px system-ui`; ctx.letterSpacing = '1px'; ctx.fillText('★  VICE CITY  ★  EST. 2026', h * .35, h * .65); ctx.restore();
}

function drawMetadata(ctx, state, width, height, palette, y) {
  const quote = state.quote || 'No rules after the sun goes down.'; const tags = state.tags || '#VICE  #LEONIDA  #AFTERHOURS'; ctx.save(); ctx.font = `600 ${Math.max(10, width * .012)}px system-ui`; ctx.fillStyle = '#ffe8e6'; ctx.globalAlpha = .9; ctx.fillText(`“${quote}”`, width * .07, y); ctx.font = `800 ${Math.max(9, width * .009)}px system-ui`; ctx.fillStyle = palette.accent; ctx.fillText(tags.toUpperCase(), width * .07, y + Math.max(17, width * .018)); ctx.restore();
}

function drawHeatMeter(ctx, heat, width, height, palette, x, y) {
  const count = clamp(Number(heat) || 0, 0, 5); ctx.save(); ctx.textAlign = 'right'; ctx.font = `800 ${Math.max(9, width * .012)}px system-ui`; ctx.fillStyle = '#ffe8b7'; ctx.fillText('HEAT', x, y); for (let i = 0; i < 5; i++) { ctx.fillStyle = i < count ? '#ffc664' : '#5a4359'; ctx.shadowColor = i < count ? '#ffbd55' : 'transparent'; ctx.shadowBlur = i < count ? 7 : 0; ctx.fillText('★', x - (i + 1) * Math.max(14, width * .018), y); } ctx.restore();
}

function drawGrainAndVignette(ctx, width, height, palette) {
  ctx.save(); ctx.globalAlpha = .07; for (let i = 0; i < width * height / 1500; i++) { const x = Math.random() * width, y = Math.random() * height, v = Math.random() > .5 ? 255 : 20; ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(x, y, 1, 1); } ctx.globalAlpha = 1; const vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * .25, width / 2, height / 2, Math.max(width, height) * .72); vignette.addColorStop(0, '#0000'); vignette.addColorStop(1, '#090613b8'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height); ctx.restore();
}

export function renderCover(canvas, state, width = canvas.width || 1920, height = canvas.height || 1080) {
  canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); const palette = getGradePalette(state.grade); ctx.clearRect(0, 0, width, height); drawSkyBackdrop(ctx, width, height, palette);
  const panels = getLayoutPanels(state.layout || 'hero', width, height); const photos = state.photos || []; const crops = state.crops || {};
  panels.forEach((panel, index) => { const photo = photos[(state.assignments?.[index] ?? index) % Math.max(1, photos.length)]; drawPhotoInPanel(ctx, panel, photo?.img || photo, crops[index] || {}, palette); });
  if (state.layout === 'tilted') { ctx.save(); ctx.globalAlpha = .32; ctx.strokeStyle = palette.accent; ctx.lineWidth = Math.max(1, width / 420); ctx.strokeRect(width * .04, height * .11, width * .9, height * .78); ctx.restore(); }
  drawPalmBand(ctx, width, height, palette.ink, palette.accent); drawHalftone(ctx, 0, 0, width, height * .25, palette.accent, Math.max(8, width / 140)); drawTitleTreatment(ctx, state, width, height, palette, panels); drawGrainAndVignette(ctx, width, height, palette); return canvas;
}

export function sizeFromString(value) { const match = String(value || '').match(/(\d+)x(\d+)/); return match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 1920, height: 1080 }; }

export function layoutLabel(layout) { return LAYOUT_NAMES[layout] || LAYOUT_NAMES.hero; }

export function layoutPanelsForState(state, width, height) { return getLayoutPanels(state.layout || 'hero', width, height); }
