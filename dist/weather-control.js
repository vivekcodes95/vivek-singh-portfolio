// A short weighted rope: Verlet integration, distance constraints and a fixed anchor.
export function initWeatherControl(onChange){
  const host=document.querySelector('.weather-control');
  const modes=['day','night','rain'],labels=['Day','Night','Rain'];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const defs=`<defs><radialGradient id="sun-clay" cx="32%" cy="24%" r="78%"><stop stop-color="#fff6ba"/><stop offset=".48" stop-color="#f3cc69"/><stop offset="1" stop-color="#bf812d"/></radialGradient><linearGradient id="moon-clay" x2=".8" y2="1"><stop stop-color="#fff9e5"/><stop offset=".52" stop-color="#d9d5c8"/><stop offset="1" stop-color="#8e99a7"/></linearGradient><radialGradient id="cloud-clay" cx="30%" cy="20%" r="85%"><stop stop-color="#e1dfe4"/><stop offset=".45" stop-color="#a7a4b2"/><stop offset="1" stop-color="#555365"/></radialGradient><linearGradient id="bolt-clay" x2=".7" y2="1"><stop stop-color="#fff6bc"/><stop offset="1" stop-color="#e8b24b"/></linearGradient></defs>`;
  const sun=`<g stroke="#edbd59" stroke-width="4.5" stroke-linecap="round"><path d="M32 7v4m0 42v4M7 32h4m42 0h4M14 14l3 3m30 30 3 3M14 50l3-3m30-30 3-3"/></g><circle cx="32" cy="32" r="17" fill="url(#sun-clay)"/><ellipse cx="27" cy="24" rx="9" ry="5" fill="#fff9d3" opacity=".3"/>`;
  const moon=`<path d="M42 7C25 5 12 18 13 34c1 16 18 28 34 20 5-3 8-7 10-11-15 5-29-5-29-18 0-8 5-14 14-18Z" fill="url(#moon-clay)"/><path d="M21 22c-6 13 2 27 14 29" fill="none" stroke="#fff" opacity=".3" stroke-width="2" stroke-linecap="round"/>`;
  const storm=`<g fill="url(#cloud-clay)"><ellipse cx="31" cy="32" rx="26" ry="15"/><circle cx="19" cy="25" r="13"/><circle cx="33" cy="19" r="15"/><circle cx="47" cy="28" r="12"/><circle cx="16" cy="35" r="11"/><circle cx="37" cy="34" r="14"/></g><path d="m32 36-9 15h9l-4 12 17-19h-11l6-8Z" fill="url(#bolt-clay)" stroke="#c49441" stroke-width=".5"/>`;
  host.innerHTML=`<svg width="0" height="0" class="weather-defs" aria-hidden="true">${defs}</svg><div class="weather-bar" role="group" aria-label="Choose weather">${modes.map((mode,i)=>`<button type="button" data-weather="${mode}" aria-label="${labels[i]} mode" aria-pressed="false" title="${labels[i]} mode"><svg viewBox="0 0 64 64" aria-hidden="true">${[sun,moon,storm][i]}</svg></button>`).join('')}</div><svg class="weather-rope" viewBox="0 0 280 240" aria-hidden="true"><path class="rope-shadow"/><path class="rope-fibre"/><path class="rope-twist"/></svg><button class="rope-knot" type="button" aria-label="Pull rope to change weather" title="Pull to change weather"><svg viewBox="0 0 28 34" aria-hidden="true"><path d="M14 2v6m-4 17-1 6m5-6v7m4-7 2 5" stroke="#aa9775" stroke-width="2" stroke-linecap="round"/><path d="M9 9c-6 4-4 13 4 16 9-1 12-9 6-15-4-4-9-3-10 2-2 5 3 8 8 7" fill="#c4b18d" stroke="#927e5e" stroke-width="2.5"/><path d="m8 12 12 6M8 17l10 5" fill="none" stroke="#eee0bc" stroke-width="2" stroke-linecap="round"/></svg></button><span class="visually-hidden weather-status" role="status" aria-live="polite"></span>`;
  const knot=host.querySelector('.rope-knot'),paths=host.querySelectorAll('.weather-rope path');
  const count=13,length=6;let anchor=140,targetAnchor=140,frame=0,drag=null,lastTime=0,accumulator=0,initialized=false;
  const points=Array.from({length:count},(_,i)=>({x:anchor,y:49+i*length,px:anchor,py:49+i*length}));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function render(){
    let d=`M${points[0].x},${points[0].y}`;
    for(let i=1;i<points.length-1;i++){const p=points[i],q=points[i+1];d+=` Q${p.x},${p.y} ${(p.x+q.x)/2},${(p.y+q.y)/2}`;}
    const tip=points.at(-1);d+=` L${tip.x},${tip.y}`;paths.forEach(p=>p.setAttribute('d',d));
    const prev=points.at(-2),angle=Math.atan2(tip.x-prev.x,tip.y-prev.y)*-180/Math.PI;
    knot.style.left=`${tip.x-56}px`;knot.style.top=`${tip.y}px`;knot.style.transform=`translate(-50%,-8px) rotate(${angle}deg)`;
  }
  function step(){
    anchor+=(targetAnchor-anchor)*.12;points[0].x=anchor;points[0].y=49;
    for(let i=1;i<count;i++){const p=points[i],vx=(p.x-p.px)*.976,vy=(p.y-p.py)*.976;p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+.13;}
    const segment=drag?Math.max(length,Math.hypot(drag.x-anchor,drag.y-49)/(count-1)):length;
    for(let iteration=0;iteration<12;iteration++){
      points[0].x=anchor;points[0].y=49;
      if(drag){points.at(-1).x=drag.x;points.at(-1).y=drag.y;}
      for(let i=0;i<count-1;i++){
        const a=points[i],b=points[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,error=(d-segment)/d;
        const aFixed=i===0,bFixed=Boolean(drag&&i===count-2);
        if(!aFixed){a.x+=dx*error*(bFixed?1:.5);a.y+=dy*error*(bFixed?1:.5);}
        if(!bFixed){b.x-=dx*error*(aFixed?1:.5);b.y-=dy*error*(aFixed?1:.5);}
      }
    }
    // Keep the knot reachable at narrow viewport edges and below its mounting bar.
    const bounds=host.getBoundingClientRect(),minX=56+48-bounds.left,maxX=56+innerWidth-48-bounds.left;
    for(let i=1;i<count;i++){const p=points[i];p.x=clamp(p.x,minX,maxX);p.y=Math.max(49+i*2,p.y);}
  }
  function tick(now){
    frame=0;if(document.hidden)return;
    accumulator+=Math.min((now-lastTime)||16.67,50);lastTime=now;
    while(accumulator>=16.67){step();accumulator-=16.67;}
    render();const moving=drag||Math.abs(targetAnchor-anchor)>.05||points.some(p=>Math.abs(p.x-p.px)+Math.abs(p.y-p.py)>.035);
    if(moving)frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
  function sync(mode,announce=false){
    host.querySelectorAll('[data-weather]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.weather===mode)));
    targetAnchor=84+56*modes.indexOf(mode);
    if(!initialized||reduced.matches){anchor=targetAnchor;points.forEach((p,i)=>Object.assign(p,{x:anchor,px:anchor,y:49+i*length,py:49+i*length}));render();initialized=true;}else wake();
    if(announce)host.querySelector('.weather-status').textContent=`${labels[modes.indexOf(mode)]} mode`;
  }
  function cycle(){onChange(modes[(modes.indexOf(document.documentElement.dataset.theme)+1)%3]);}
  host.querySelectorAll('[data-weather]').forEach(b=>b.addEventListener('click',()=>onChange(b.dataset.weather)));
  knot.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();knot.setPointerCapture(e.pointerId);const tip=points.at(-1);drag={x:tip.x,y:tip.y,startY:e.clientY,startX:e.clientX,tipX:tip.x,tipY:tip.y,pull:0};host.dataset.pulling='true';wake();});
  knot.addEventListener('pointermove',e=>{if(!drag)return;drag.x=clamp(drag.tipX+e.clientX-drag.startX,64,216);drag.y=clamp(drag.tipY+e.clientY-drag.startY,65,202);drag.pull=Math.max(0,e.clientY-drag.startY);host.dataset.ready=String(drag.pull>28);wake();});
  function release(cancel=false){if(!drag)return;const change=!cancel&&drag.pull>28;drag=null;delete host.dataset.pulling;delete host.dataset.ready;if(change)cycle();if(reduced.matches)sync(document.documentElement.dataset.theme);else wake();}
  knot.addEventListener('pointerup',()=>release());knot.addEventListener('pointercancel',()=>release(true));knot.addEventListener('lostpointercapture',()=>release(true));
  // Keyboard and assistive-technology activation use the same cycle without dragging.
  knot.addEventListener('click',e=>{if(e.detail===0)cycle();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release(true);cancelAnimationFrame(frame);frame=0;}else wake();});
  render();return sync;
}
