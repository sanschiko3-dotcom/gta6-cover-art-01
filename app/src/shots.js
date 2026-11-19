export async function prepareScene(state) {
  const q=new URLSearchParams(location.search);
  for(const name of ['pier','boulevard']) {
    const image=new Image(); image.src=`samples/${name}.jpg`; await image.decode();
    state.photos.push({name,image});
  }
  const photo=q.get('photo')==='boulevard'?1:0;
  state.panels.forEach((p,i)=>p.photo=i===1?1-photo:photo);
  for(const key of ['layout','size']) if(q.has(key)) state[key]=q.get(key);
  if(q.has('caption')) state.title=q.get('caption');
  if(q.get('shot')==='cover') document.body.classList.add('cover-only');
}
