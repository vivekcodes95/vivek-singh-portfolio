export function initMartenTooltip(){
  const trigger=document.querySelector('.ux-mascot-info'),tooltip=document.querySelector('#marten-tooltip');
  if(!trigger||!tooltip)return ()=>{};
  let hideTimer=0;
  function position(){
    if(tooltip.hidden)return;
    const anchor=trigger.closest('.ux-mascot-slot').getBoundingClientRect(),bounds=tooltip.getBoundingClientRect();
    tooltip.style.left=`${Math.max(18,Math.min(anchor.left,innerWidth-bounds.width-18))}px`;
    const below=anchor.bottom+12,above=anchor.top-bounds.height-12;
    tooltip.style.top=`${below+bounds.height<=innerHeight-18?below:Math.max(18,above)}px`;
  }
  function show(){clearTimeout(hideTimer);tooltip.hidden=false;trigger.setAttribute('aria-expanded','true');position();}
  function hide(){clearTimeout(hideTimer);tooltip.hidden=true;trigger.setAttribute('aria-expanded','false');}
  function queueHide(){clearTimeout(hideTimer);hideTimer=setTimeout(hide,180);}
  function handleKeydown(event){if(event.key==='Escape')hide();}
  function handlePointerDown(event){if(!trigger.contains(event.target)&&!tooltip.contains(event.target))hide();}
  function handleVisibility(){if(document.hidden)hide();}
  trigger.setAttribute('aria-expanded','false');
  trigger.addEventListener('pointerenter',show);trigger.addEventListener('pointerleave',queueHide);
  trigger.addEventListener('focus',show);trigger.addEventListener('blur',queueHide);trigger.addEventListener('click',show);
  tooltip.addEventListener('pointerenter',show);tooltip.addEventListener('pointerleave',queueHide);
  document.addEventListener('keydown',handleKeydown);
  document.addEventListener('pointerdown',handlePointerDown);
  addEventListener('resize',position);addEventListener('scroll',position,{passive:true});
  document.addEventListener('visibilitychange',handleVisibility);
  return ()=>{
    clearTimeout(hideTimer);
    trigger.removeEventListener('pointerenter',show);trigger.removeEventListener('pointerleave',queueHide);
    trigger.removeEventListener('focus',show);trigger.removeEventListener('blur',queueHide);trigger.removeEventListener('click',show);
    tooltip.removeEventListener('pointerenter',show);tooltip.removeEventListener('pointerleave',queueHide);
    document.removeEventListener('keydown',handleKeydown);document.removeEventListener('pointerdown',handlePointerDown);
    removeEventListener('resize',position);removeEventListener('scroll',position);
    document.removeEventListener('visibilitychange',handleVisibility);
    tooltip.hidden=true;
  };
}
