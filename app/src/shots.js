export const formats = {
  '1080x1080': [1080,1080],
  '1080x1350': [1080,1350],
  '1920x1080': [1920,1080],
};

export function configureShot(state, layouts, grades) {
  const params = new URLSearchParams(location.search);
  const scene = params.get('shot');
  if (scene !== 'cover' && scene !== 'editor') return false;
  const layout = params.get('layout');
  const grade = params.get('grade');
  const size = params.get('size');
  const photo = params.get('photo');
  if (Object.hasOwn(layouts,layout)) state.layout = layout;
  if (Object.hasOwn(grades,grade)) state.grade = grade;
  if (Object.hasOwn(formats,size)) state.format = size;
  if (params.has('caption')) state.title = params.get('caption').slice(0,55);
  const heat = Number(params.get('heat'));
  if (params.has('heat') && Number.isFinite(heat)) state.heat = Math.max(0,Math.min(5,Math.round(heat)));
  if (photo === 'pier' || photo === 'boulevard') {
    state.panels[0].photo = photo;
    state.panels[1].photo = photo === 'pier' ? 'boulevard' : 'pier';
    state.panels[2].photo = photo;
    if (state.layout === 'slash') {
      state.panels[1].y = .31;
      state.panels[2].fit = true;
      state.panels[2].zoom = .99;
      state.panels[2].x = .28;
    }
  }
  if (scene === 'cover') document.body.classList.add('proof');
  return scene === 'cover';
}
