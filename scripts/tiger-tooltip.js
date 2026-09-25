export function initTigerTooltip(){
  const trigger=document.querySelector('.tiger-info');
  if(!trigger)return;
  const host=trigger.closest('.sidebar-bottom');
  host.insertAdjacentHTML('beforeend',`<div class="monkey-tooltip tiger-tooltip" id="tiger-tooltip" role="tooltip" hidden>
    <img class="monkey-tooltip-photo" src="/assets/royal-bengal-tiger-roaring.png" alt="Charcoal-style close-up drawing of a roaring Royal Bengal tiger" width="120" height="120">
    <div class="monkey-tooltip-copy">
      <strong>Royal Bengal Tiger</strong>
      <span class="monkey-population"><span class="visually-hidden">About 4,300 Bengal tigers left in the wild</span><span class="monkey-population-visible" aria-hidden="true"><span>≈</span><span class="tiger-population-count">4,300</span><span>left in the wild</span></span></span>
      <p>An endangered big cat at home among the tidal creeks and mangrove forests of the Sundarbans, shared by India and Bangladesh.</p>
      <small class="tiger-population-source">Worldwide estimate · WWF, 2024</small>
    </div>
  </div>`);
  const tooltip=host.querySelector('#tiger-tooltip'),counter=tooltip.querySelector('.tiger-population-count');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let hideTimer=0,frame=0;
  function positionTooltip(){
    if(tooltip.hidden)return;
    if(!host.classList.contains('tiger-in-heading')){tooltip.style.top='';tooltip.style.bottom='';tooltip.style.left='';return;}
    const rect=trigger.getBoundingClientRect(),bounds=tooltip.getBoundingClientRect();
    tooltip.style.left=`${Math.max(18,Math.min(rect.left,innerWidth-bounds.width-18))}px`;
    tooltip.style.top=`${Math.max(18,Math.min(rect.bottom+12,innerHeight-bounds.height-18))}px`;
    tooltip.style.bottom='auto';
  }
  function animateCount(){
    cancelAnimationFrame(frame);
    if(reduced.matches){counter.textContent='4,300';return;}
    // Rounded total of WWF's 2024 country estimates: 3,682 + 355 + 131 + 114.
    // Intermediate counter frames are decorative, not historic population figures.
    counter.textContent='9,999';
    const start=performance.now();
    function tick(now){
      const elapsed=now-start;
      const fast=Math.min(elapsed/400,1),slow=Math.min(Math.max(elapsed-400,0)/850,1);
      const value=elapsed<400?9999-5199*(1-(1-fast)**3):4800-500*(slow*slow*(3-2*slow));
      counter.textContent=Math.round(value).toLocaleString('en-US');
      frame=elapsed<1250?requestAnimationFrame(tick):0;
    }
    frame=requestAnimationFrame(tick);
  }
  function show(){
    clearTimeout(hideTimer);
    if(tooltip.hidden){tooltip.hidden=false;animateCount();}
    positionTooltip();
  }
  function hide(){
    clearTimeout(hideTimer);cancelAnimationFrame(frame);frame=0;
    tooltip.hidden=true;counter.textContent='4,300';
  }
  function queueHide(){clearTimeout(hideTimer);hideTimer=setTimeout(hide,180);}
  trigger.addEventListener('pointerenter',show);
  trigger.addEventListener('pointerleave',queueHide);
  trigger.addEventListener('focus',show);
  trigger.addEventListener('blur',queueHide);
  trigger.addEventListener('click',show);
  tooltip.addEventListener('pointerenter',show);
  tooltip.addEventListener('pointerleave',queueHide);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  document.addEventListener('pointerdown',event=>{if(!trigger.contains(event.target)&&!tooltip.contains(event.target))hide();});
  addEventListener('popstate',hide);
  addEventListener('resize',positionTooltip);
  addEventListener('scroll',positionTooltip,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
  reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(frame);counter.textContent='4,300';}});
}
