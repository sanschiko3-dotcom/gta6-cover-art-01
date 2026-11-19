const SHOT_DEFAULTS = {
  layout: 'hero', grade: 'Sunset', size: '1920x1080', caption: 'SUNSET HEIST', photo: 'boulevard', heat: 4
};

function readInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export function readShotConfig(search = window.location.search) {
  const params = new URLSearchParams(search);
  const shotName = params.get('shot');
  if (!shotName) return { mode: 'editor', ...SHOT_DEFAULTS };
  const dimensions = (params.get('size') || SHOT_DEFAULTS.size).match(/^(\d+)x(\d+)$/);
  return {
    mode: shotName === 'cover' ? 'cover' : 'editor',
    layout: params.get('layout') || SHOT_DEFAULTS.layout,
    grade: params.get('grade') || SHOT_DEFAULTS.grade,
    size: dimensions ? `${dimensions[1]}x${dimensions[2]}` : SHOT_DEFAULTS.size,
    width: dimensions ? readInteger(dimensions[1], 1920) : 1920,
    height: dimensions ? readInteger(dimensions[2], 1080) : 1080,
    caption: params.get('caption') || SHOT_DEFAULTS.caption,
    photo: params.get('photo') || SHOT_DEFAULTS.photo,
    heat: Math.max(0, Math.min(5, Number(params.get('heat') ?? SHOT_DEFAULTS.heat)))
  };
}
