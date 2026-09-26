// Animate the original painted eye pixels inside their existing eyelids.
// At rest these patches are pixel-identical to the illustration underneath.
export function gazeOffset(dx,dy,artworkWidth){
  // A shared distance preserves the actual angle to the pointer. Independent
  // axis saturation made distant positions all look diagonally down/right.
  const depth=Math.max(12,artworkWidth*.14);
  const distance=Math.hypot(dx/14,dy/10,depth/14);
  return {x:dx/distance,y:dy/distance};
}
export function createMartenGaze(host){
  if(!host)return ()=>{};
  const artwork=host.querySelector('img');
  host.querySelector('.marten-eyes')?.remove();
  const canvas=document.createElement('canvas');
  canvas.className='marten-eyes';canvas.width=canvas.height=1254;
  canvas.setAttribute('aria-hidden','true');host.append(canvas);
  const ctx=canvas.getContext('2d');
  const eyes=[
    {cx:507,cy:220,left:460,top:182,width:83,height:78,path:new Path2D('M475 198 Q494 186 511 197 Q528 207 533 241 Q513 256 492 245 Q470 231 475 198 Z')},
    {cx:696,cy:220,left:659,top:182,width:82,height:78,path:new Path2D('M672 241 Q678 207 693 197 Q711 186 728 198 Q734 229 713 245 Q691 256 672 241 Z')}
  ].map(eye=>({...eye,x:0,y:0,targetX:0,targetY:0}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(any-pointer: fine)');
  let frame=0,last=0,pointer=null,ready=false,alive=true;
  function paint(){
    if(!ready)return;
    ctx.clearRect(0,0,1254,1254);
    for(const eye of eyes){
      const {width,height,source,output}=eye;
      for(let y=0;y<height;y++)for(let x=0;x<width;x++){
        // Keep the pupil and its highlight together instead of stretching
        // their centre more than their edges; blend into the fixed eyelids.
        const radius=Math.hypot((x+eye.left-eye.cx-eye.x)/40,(y+eye.top-eye.cy-eye.y)/31);
        const blend=Math.max(0,Math.min(1,(radius-.48)/.52));
        const weight=1-blend*blend*(3-2*blend);
        const sx=Math.max(0,Math.min(width-1.001,x-eye.x*weight));
        const sy=Math.max(0,Math.min(height-1.001,y-eye.y*weight));
        const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
        const a=(iy*width+ix)*4,b=a+4,c=a+width*4,d=c+4,out=(y*width+x)*4;
        for(let channel=0;channel<4;channel++)output.data[out+channel]=
          (source.data[a+channel]*(1-fx)+source.data[b+channel]*fx)*(1-fy)+
          (source.data[c+channel]*(1-fx)+source.data[d+channel]*fx)*fy;
      }
      eye.patch.getContext('2d').putImageData(output,0,0);
      ctx.save();ctx.clip(eye.path);ctx.drawImage(eye.patch,eye.left,eye.top);ctx.restore();
    }
  }
  function tick(now){
    frame=0;const amount=1-Math.exp(-Math.min(now-last,50)/40);last=now;
    let moving=false;
    for(const eye of eyes){
      eye.x+=(eye.targetX-eye.x)*amount;eye.y+=(eye.targetY-eye.y)*amount;
      if(Math.hypot(eye.targetX-eye.x,eye.targetY-eye.y)<.015){eye.x=eye.targetX;eye.y=eye.targetY;}else moving=true;
    }
    paint();if(moving)frame=requestAnimationFrame(tick);
  }
  function wake(){if(ready&&!frame&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  function update(){
    if(!pointer||reduced.matches||!fine.matches)return;
    // Use the image bounds, including its transparent-margin offset.
    const rect=artwork.getBoundingClientRect();
    for(const eye of eyes){
      const dx=pointer.x-(rect.left+rect.width*eye.cx/1254),dy=pointer.y-(rect.top+rect.height*eye.cy/1254);
      const target=gazeOffset(dx,dy,rect.width);
      eye.targetX=target.x;eye.targetY=target.y;
    }
    wake();
  }
  function follow(event){if(event.pointerType==='touch'||!fine.matches||reduced.matches)return;pointer={x:event.clientX,y:event.clientY};update();}
  function reset(){
    pointer=null;for(const eye of eyes)eye.targetX=eye.targetY=0;
    if(reduced.matches||document.hidden){cancelAnimationFrame(frame);frame=0;for(const eye of eyes)eye.x=eye.y=0;paint();}else wake();
  }
  function initialize(){
    if(!alive||ready||!artwork.naturalWidth)return;
    const sourceCanvas=document.createElement('canvas');sourceCanvas.width=sourceCanvas.height=1254;
    const sourceContext=sourceCanvas.getContext('2d',{willReadFrequently:true});sourceContext.drawImage(artwork,0,0,1254,1254);
    for(const eye of eyes){
      eye.source=sourceContext.getImageData(eye.left,eye.top,eye.width,eye.height);
      eye.output=new ImageData(eye.width,eye.height);eye.patch=document.createElement('canvas');eye.patch.width=eye.width;eye.patch.height=eye.height;
    }
    ready=true;canvas.dataset.ready='true';paint();update();
  }
  artwork.addEventListener('load',initialize);if(artwork.complete)initialize();
  addEventListener('pointermove',follow,{passive:true});addEventListener('resize',update);addEventListener('scroll',update,{passive:true});
  document.documentElement.addEventListener('pointerleave',reset);addEventListener('blur',reset);
  document.addEventListener('visibilitychange',reset);reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
  return ()=>{alive=false;cancelAnimationFrame(frame);artwork.removeEventListener('load',initialize);removeEventListener('pointermove',follow);removeEventListener('resize',update);removeEventListener('scroll',update);document.documentElement.removeEventListener('pointerleave',reset);removeEventListener('blur',reset);document.removeEventListener('visibilitychange',reset);reduced.removeEventListener('change',reset);fine.removeEventListener('change',reset);canvas.remove();};
}
