export function readScene() {
  const p = new URLSearchParams(location.search);
  return {
    mode: p.get('shot'),
    photo: p.get('photo') === 'boulevard' ? 'boulevard' : 'pier',
    title: p.get('caption') || 'Sunset Heist',
    layout: ['hero','columns','strip'].includes(p.get('layout')) ? p.get('layout') : 'hero',
    size: ['1080x1080','1080x1350','1920x1080'].includes(p.get('size')) ? p.get('size') : '1080x1080',
  };
}

export async function loadPhoto(src, name) {
  const image = new Image();
  image.src = src;
  await image.decode();
  return { image, src, name };
}
