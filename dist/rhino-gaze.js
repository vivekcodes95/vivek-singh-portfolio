// The rhino illustration remains fixed while its clipped pupil follows the pointer.
export function createRhinoGaze(host){
  if(!host)return ()=>{};
  host.querySelector('.rhino-eyes')?.remove();
  host.insertAdjacentHTML('beforeend',`<svg class="rhino-eyes" viewBox="0 0 1254 1254" aria-hidden="true">
    <defs>
      <clipPath id="rhino-left-eye"><path d="M388 322 427 331 427 369 397 370 388 349Z"/></clipPath>
      <clipPath id="rhino-right-eye"><path d="M616 319 717 310 700 382 639 386 616 353Z"/></clipPath>
    </defs>
    <g clip-path="url(#rhino-left-eye)"><g class="rhino-pupil" data-cx="408" data-cy="350"><ellipse cx="408" cy="350" rx="8" ry="12" fill="#241c16"/><ellipse cx="405" cy="346" rx="2.4" ry="2.4" fill="#fff3d4" opacity=".85"/></g></g>
    <g clip-path="url(#rhino-right-eye)"><g class="rhino-pupil" data-cx="663" data-cy="351"><ellipse cx="663" cy="351" rx="11" ry="14" fill="#241c16"/><ellipse cx="659" cy="346" rx="2.8" ry="2.8" fill="#fff3d4" opacity=".85"/></g></g>
  </svg>`);
  const eyes=[...host.querySelectorAll('.rhino-pupil')].map(pupil=>({pupil,cx:Number(pupil.dataset.cx),cy:Number(pupil.dataset.cy),x:0,y:0,targetX:0,targetY:0}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(any-pointer: fine)');
  let frame=0,last=0,pointer=null;
  function paint(){for(const eye of eyes)eye.pupil.setAttribute('transform',`translate(${eye.x.toFixed(3)} ${eye.y.toFixed(3)})`);}
  function tick(now){
    frame=0;const amount=1-Math.exp(-Math.min(now-last,50)/65);last=now;
    let moving=false;for(const eye of eyes){eye.x+=(eye.targetX-eye.x)*amount;eye.y+=(eye.targetY-eye.y)*amount;if(Math.hypot(eye.targetX-eye.x,eye.targetY-eye.y)<.015){eye.x=eye.targetX;eye.y=eye.targetY;}else moving=true;}
    paint();if(moving)frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  function update(){
    if(!pointer||reduced.matches||!fine.matches)return;
    const rect=host.getBoundingClientRect();for(const eye of eyes){const dx=pointer.x-(rect.left+rect.width*eye.cx/1254),dy=pointer.y-(rect.top+rect.height*eye.cy/1254);eye.targetX=10*dx/Math.hypot(dx,150);eye.targetY=7*dy/Math.hypot(dy,90);}wake();
  }
  function follow(event){if(event.pointerType==='touch'||!fine.matches||reduced.matches)return;pointer={x:event.clientX,y:event.clientY};update();}
  function reset(){pointer=null;for(const eye of eyes){eye.targetX=eye.targetY=0;}if(reduced.matches||document.hidden){cancelAnimationFrame(frame);frame=0;for(const eye of eyes){eye.x=eye.y=0;}paint();}else wake();}
  addEventListener('pointermove',follow,{passive:true});addEventListener('resize',update);
  document.documentElement.addEventListener('pointerleave',reset);addEventListener('blur',reset);
  document.addEventListener('visibilitychange',reset);reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
  return ()=>{cancelAnimationFrame(frame);removeEventListener('pointermove',follow);removeEventListener('resize',update);document.documentElement.removeEventListener('pointerleave',reset);removeEventListener('blur',reset);document.removeEventListener('visibilitychange',reset);reduced.removeEventListener('change',reset);fine.removeEventListener('change',reset);host.querySelector('.rhino-eyes')?.remove();};
}
