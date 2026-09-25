// The painted face stays still; only the two clipped pupils follow the pointer.
export function createSeatedTiger(host) {
  if (!host) return;
  host.insertAdjacentHTML('beforeend', `<svg class="tiger-eyes" viewBox="0 0 1254 1254" aria-hidden="true">
    <defs>
      <clipPath id="tiger-left-eye"><path d="M538 190Q568 198 600 201Q585 217 565 216Q545 212 538 190Z"/></clipPath>
      <clipPath id="tiger-right-eye"><path d="M678 203Q707 200 735 193Q730 215 710 217Q691 218 678 203Z"/></clipPath>
    </defs>
    <g clip-path="url(#tiger-left-eye)"><g class="tiger-pupil"><ellipse cx="568" cy="205" rx="9" ry="10" fill="#332019"/><ellipse cx="565" cy="202" rx="2" ry="2" fill="#fff0ce" opacity=".8"/></g></g>
    <g clip-path="url(#tiger-right-eye)"><g class="tiger-pupil"><ellipse cx="708" cy="207" rx="9" ry="10" fill="#332019"/><ellipse cx="705" cy="204" rx="2" ry="2" fill="#fff0ce" opacity=".8"/></g></g>
  </svg>`);
  const eyes=[...host.querySelectorAll('.tiger-pupil')].map((pupil,i)=>({pupil,cx:i?708:568,cy:i?207:205,x:0,y:0,targetX:0,targetY:0}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(any-pointer: fine)');
  let frame=0,last=0,pointer=null;
  function paint(){for(const eye of eyes)eye.pupil.setAttribute('transform',`translate(${eye.x.toFixed(3)} ${eye.y.toFixed(3)})`);}
  function tick(now){
    frame=0;
    const amount=1-Math.exp(-Math.min(now-last,50)/65);last=now;
    let moving=false;
    for(const eye of eyes){
      eye.x+=(eye.targetX-eye.x)*amount;eye.y+=(eye.targetY-eye.y)*amount;
      if(Math.hypot(eye.targetX-eye.x,eye.targetY-eye.y)<.015){eye.x=eye.targetX;eye.y=eye.targetY;}
      else moving=true;
    }
    paint();if(moving)frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  function follow(event){
    if(event.pointerType==='touch'||!fine.matches||reduced.matches)return;
    pointer={x:event.clientX,y:event.clientY};updateTargets();
  }
  function updateTargets(){
    if(!pointer||reduced.matches||!fine.matches)return;
    const rect=host.getBoundingClientRect();
    // Aim from each eye independently. Separate axis limits preserve vertical
    // movement even when the cursor is far across the page horizontally.
    for(const eye of eyes){
      const dx=pointer.x-(rect.left+rect.width*(eye.cx-181)/843);
      const dy=pointer.y-(rect.top+rect.height*(eye.cy-9)/1213);
      eye.targetX=12*dx/Math.hypot(dx,160);
      eye.targetY=7*dy/Math.hypot(dy,75);
    }
    wake();
  }
  function reset(){
    pointer=null;for(const eye of eyes){eye.targetX=eye.targetY=0;}
    if(reduced.matches||document.hidden){cancelAnimationFrame(frame);frame=0;for(const eye of eyes){eye.x=eye.y=0;}paint();}
    else wake();
  }
  addEventListener('pointermove',follow,{passive:true});
  addEventListener('resize',updateTargets);
  document.documentElement.addEventListener('pointerleave',reset);
  addEventListener('blur',reset);
  document.addEventListener('visibilitychange',reset);
  reduced.addEventListener('change',reset);
  fine.addEventListener('change',reset);
}
