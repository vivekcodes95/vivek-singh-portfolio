import {createRopeRenderer} from './rope-renderer.js';
// A short weighted rope: Verlet integration, distance constraints and a fixed anchor.
export function initWeatherControl(onChange){
  const host=document.querySelector('.weather-control');
  const modes=['day','night','rain'],labels=['Day','Night','Rain'];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const defs=`<defs><radialGradient id="sun-clay" cx="32%" cy="24%" r="78%"><stop stop-color="#fff6ba"/><stop offset=".48" stop-color="#f3cc69"/><stop offset="1" stop-color="#bf812d"/></radialGradient><linearGradient id="moon-clay" x2=".8" y2="1"><stop stop-color="#fff9e5"/><stop offset=".52" stop-color="#d9d5c8"/><stop offset="1" stop-color="#8e99a7"/></linearGradient><radialGradient id="cloud-clay" cx="30%" cy="20%" r="85%"><stop stop-color="#e1dfe4"/><stop offset=".45" stop-color="#a7a4b2"/><stop offset="1" stop-color="#555365"/></radialGradient><linearGradient id="bolt-clay" x2=".7" y2="1"><stop stop-color="#fff6bc"/><stop offset="1" stop-color="#e8b24b"/></linearGradient></defs>`;
  const sun=`<g stroke="#edbd59" stroke-width="4.5" stroke-linecap="round"><path d="M32 7v4m0 42v4M7 32h4m42 0h4M14 14l3 3m30 30 3 3M14 50l3-3m30-30 3-3"/></g><circle cx="32" cy="32" r="17" fill="url(#sun-clay)"/><ellipse cx="27" cy="24" rx="9" ry="5" fill="#fff9d3" opacity=".3"/>`;
  const moon=`<path d="M42 7C25 5 12 18 13 34c1 16 18 28 34 20 5-3 8-7 10-11-15 5-29-5-29-18 0-8 5-14 14-18Z" fill="url(#moon-clay)"/><path d="M21 22c-6 13 2 27 14 29" fill="none" stroke="#fff" opacity=".3" stroke-width="2" stroke-linecap="round"/>`;
  const storm=`<g fill="url(#cloud-clay)"><ellipse cx="31" cy="32" rx="26" ry="15"/><circle cx="19" cy="25" r="13"/><circle cx="33" cy="19" r="15"/><circle cx="47" cy="28" r="12"/><circle cx="16" cy="35" r="11"/><circle cx="37" cy="34" r="14"/></g><path d="m32 36-9 15h9l-4 12 17-19h-11l6-8Z" fill="url(#bolt-clay)" stroke="#c49441" stroke-width=".5"/>`;
  host.innerHTML=`<svg width="0" height="0" class="weather-defs" aria-hidden="true">${defs}</svg><div class="weather-bar" role="group" aria-label="Choose weather">${modes.map((mode,i)=>`<button type="button" data-weather="${mode}" aria-label="${labels[i]} mode" aria-pressed="false" title="${labels[i]} mode"><svg viewBox="0 0 64 64" aria-hidden="true">${[sun,moon,storm][i]}</svg></button>`).join('')}</div><canvas class="weather-rope" aria-hidden="true"></canvas><button class="rope-knot" type="button" aria-label="Pull rope to change weather" title="Pull to change weather"></button><span class="visually-hidden weather-status" role="status" aria-live="polite"></span>`;
  const knot=host.querySelector('.rope-knot'),drawRope=createRopeRenderer(host.querySelector('.weather-rope'));
host.insertAdjacentHTML('beforeend',`<canvas class="weather-rope rope-grip-overlay" aria-hidden="true"></canvas><button class="rope-monkey" type="button" aria-label="Lion Tailed Monkey — learn about this species" aria-describedby="monkey-tooltip"><img src="/assets/lion-tailed-monkey-cordless.png" alt="" width="128" height="128" draggable="false"></button><div class="monkey-tooltip" id="monkey-tooltip" role="tooltip" hidden><img class="monkey-tooltip-photo" src="/assets/lion-tailed-monkey-engraving-square.png" alt="Black-and-white engraving of a lion-tailed monkey among rainforest branches" width="120" height="120"><div class="monkey-tooltip-copy"><strong>Lion Tailed Monkey</strong><span class="monkey-population"><span class="visually-hidden">Approximately 2,500 left in the wild</span><span class="monkey-population-visible" aria-hidden="true"><span>≈</span><span class="monkey-population-count">2,500</span><span>left in the wild</span></span></span><p>Historically known as the beard ape, is found exclusively in the tropical rainforests of Western Ghats in India</p><small class="monkey-population-source">Source: Centre for Wildlife Studies, 2020.</small></div></div>`);
  const monkey=host.querySelector('.rope-monkey'),tooltip=host.querySelector('.monkey-tooltip');
  const drawGripRope=createRopeRenderer(host.querySelector('.rope-grip-overlay'));
  const populationCount=host.querySelector('.monkey-population-count');
  let tooltipTimer=0,suppressMonkeyClick=false,populationFrame=0;
  function animatePopulation(){
    cancelAnimationFrame(populationFrame);
    if(reduced.matches){populationCount.textContent='2,500';return;}
    populationCount.textContent='9,999';
    const start=performance.now();
    function tickPopulation(now){
      const elapsed=Math.max(0,now-start),fastDuration=400,settleDuration=850;
      let value;
      if(elapsed<fastDuration){
        const progress=elapsed/fastDuration,eased=1-Math.pow(1-progress,3);
        value=9999-6999*eased;
      }else{
        const progress=Math.min((elapsed-fastDuration)/settleDuration,1);
        const eased=progress*progress*(3-2*progress);
        value=3000-500*eased;
      }
      populationCount.textContent=Math.round(value).toLocaleString('en-US');
      populationFrame=elapsed<fastDuration+settleDuration?requestAnimationFrame(tickPopulation):0;
    }
    populationFrame=requestAnimationFrame(tickPopulation);
  }
  function showTooltip(restart=false){
    clearTimeout(tooltipTimer);
    if(drag)return;
    const opening=tooltip.hidden;tooltip.hidden=false;
    if(opening||restart)animatePopulation();
  }
  function hideTooltip(){clearTimeout(tooltipTimer);cancelAnimationFrame(populationFrame);populationFrame=0;populationCount.textContent='2,500';tooltip.hidden=true;}
  function queueTooltipHide(){clearTimeout(tooltipTimer);tooltipTimer=setTimeout(hideTooltip,180);}
  monkey.addEventListener('pointerenter',()=>showTooltip(true));
  tooltip.addEventListener('pointerenter',()=>showTooltip());
  for(const element of [monkey,tooltip])element.addEventListener('pointerleave',queueTooltipHide);
  monkey.addEventListener('focus',()=>showTooltip());monkey.addEventListener('blur',queueTooltipHide);
  monkey.addEventListener('click',()=>{if(!suppressMonkeyClick)showTooltip();suppressMonkeyClick=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hideTooltip();});
  document.addEventListener('pointerdown',event=>{if(!monkey.contains(event.target)&&!tooltip.contains(event.target))hideTooltip();});
  const count=13,length=6;let anchor=140,targetAnchor=140,frame=0,drag=null,lastTime=0,accumulator=0,initialized=false,windClock=0;
  const points=Array.from({length:count},(_,i)=>({x:anchor,y:49+i*length,px:anchor,py:49+i*length}));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function alongRope(distance){
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.y-a.y);
      if(distance<=length){const t=distance/(length||1);return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
      distance-=length;
    }
    return points.at(-1);
  }
  function render(){
    drawRope(points);
    const tip=points.at(-1);
    const prev=points.at(-2),angle=Math.atan2(tip.x-prev.x,tip.y-prev.y)*-180/Math.PI;
    knot.style.left=`${tip.x-56}px`;knot.style.top=`${tip.y}px`;knot.style.transform=`translate(-50%,-8px) rotate(${angle}deg)`;
    // Both hands follow a fixed-length span of cord, even when it is pulled.
    const monkeySize=innerWidth<=1100?80:96,scale=monkeySize/128;
    const grip=alongRope(18),lowerGrip=alongRope(18+33*scale),lean=-Math.atan2(lowerGrip.x-grip.x,lowerGrip.y-grip.y)*180/Math.PI;
    // Mirrored hands grip the same textured canvas cord; no separate rope asset.
    const handX=(128-94)*scale,handY=9*scale;
    monkey.style.left=`${grip.x-56-handX}px`;monkey.style.top=`${grip.y-handY}px`;monkey.style.transformOrigin=`${handX}px ${handY}px`;monkey.style.transform=`rotate(${lean}deg)`;
    tooltip.style.top=`${Math.max(160,grip.y+monkeySize)}px`;
    drawGripRope(points,[[18+7*scale,18+27*scale],[18+41*scale,18+58*scale]]);
  }
  function step(){
    anchor+=(targetAnchor-anchor)*.12;points[0].x=anchor;points[0].y=49;
    windClock+=1/60;
    const breeze=!drag?(Math.sin(windClock*.34)+Math.sin(windClock*.13+1.4)*.28)*.0032:0;
    for(let i=1;i<count;i++){const p=points[i],vx=(p.x-p.px)*.976,vy=(p.y-p.py)*.976,depth=i/(count-1);p.px=p.x;p.py=p.y;p.x+=vx+breeze*depth*depth;p.y+=vy+.13;}
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
    if(moving||!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
  function sync(mode,announce=false){
    host.querySelectorAll('[data-weather]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.weather===mode)));
    targetAnchor=84+56*modes.indexOf(mode);
    if(!initialized||reduced.matches){anchor=targetAnchor;points.forEach((p,i)=>Object.assign(p,{x:anchor,px:anchor,y:49+i*length,py:49+i*length}));render();initialized=true;if(!reduced.matches)wake();}else wake();
    if(announce)host.querySelector('.weather-status').textContent=`${labels[modes.indexOf(mode)]} mode`;
  }
  function cycle(){onChange(modes[(modes.indexOf(document.documentElement.dataset.theme)+1)%3]);}
  host.querySelectorAll('[data-weather]').forEach(b=>b.addEventListener('click',()=>onChange(b.dataset.weather)));
  for(const handle of [knot,monkey]){
    handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();hideTooltip();suppressMonkeyClick=false;handle.setPointerCapture(e.pointerId);const tip=points.at(-1);drag={x:tip.x,y:tip.y,startY:e.clientY,startX:e.clientX,tipX:tip.x,tipY:tip.y,pull:0};host.dataset.pulling='true';wake();});
    handle.addEventListener('pointermove',e=>{if(!drag)return;drag.x=clamp(drag.tipX+e.clientX-drag.startX,64,216);drag.y=clamp(drag.tipY+e.clientY-drag.startY,65,202);drag.pull=Math.max(0,e.clientY-drag.startY);if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)suppressMonkeyClick=true;host.dataset.ready=String(drag.pull>28);wake();});
    handle.addEventListener('pointerup',()=>release());handle.addEventListener('pointercancel',()=>release(true));handle.addEventListener('lostpointercapture',()=>release(true));
  }
  function release(cancel=false){if(!drag)return;const change=!cancel&&drag.pull>28;drag=null;delete host.dataset.pulling;delete host.dataset.ready;if(change)cycle();if(reduced.matches)sync(document.documentElement.dataset.theme);else wake();}
  // Keyboard and assistive-technology activation use the same cycle without dragging.
  knot.addEventListener('click',e=>{if(e.detail===0)cycle();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release(true);cancelAnimationFrame(frame);frame=0;}else wake();});
  reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0;sync(document.documentElement.dataset.theme);}else wake();});
  render();return sync;
}
