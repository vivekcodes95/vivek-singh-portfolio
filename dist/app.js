const menu=document.querySelector('.menu-toggle');
const sidebar=document.querySelector('.sidebar');
function closeMenu(){sidebar.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';sidebar.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));if(open)requestAnimationFrame(()=>moveNavIndicator(links.find(link=>link.hasAttribute('aria-current')),false));});
matchMedia('(max-width:1100px)').addEventListener('change',closeMenu);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('menu-open')){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!sidebar.contains(e.target))closeMenu();});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const pointerMotion=matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
const cue=document.querySelector('.cursor-cue');
let destroyStack=()=>{};
let aboutDeckOpened=false;
const tigerCompanion=document.querySelector('.sidebar-bottom');
const tigerSizeObserver=new ResizeObserver(()=>sizePhotographyTiger());
const uxMascotSizeObserver=new ResizeObserver(()=>sizeUxMascot());
let martenGazeFactory=null,destroyMartenGaze=()=>{};
let martenTooltipFactory=null,destroyMartenTooltip=()=>{};
let pageChromePlaced=false;
function inkEdges(element,context){
  const style=getComputedStyle(element),rect=element.getBoundingClientRect();
  context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics=context.measureText(element.textContent);
  const ascent=metrics.fontBoundingBoxAscent??parseFloat(style.fontSize)*.8;
  const descent=metrics.fontBoundingBoxDescent??parseFloat(style.fontSize)*.2;
  const leading=(parseFloat(style.lineHeight)-ascent-descent)/2;
  return {top:rect.top+leading+ascent-metrics.actualBoundingBoxAscent,bottom:rect.bottom-leading-descent+metrics.actualBoundingBoxDescent};
}
function sizePhotographyTiger(){
  const copy=document.querySelector('.photography-heading-copy');
  if(!copy)return;
  // Match visible letter edges, excluding the font's extra space above/below lines.
  const context=document.createElement('canvas').getContext('2d');
  const top=inkEdges(copy.querySelector('h1'),context).top,bottom=inkEdges(copy.querySelector('p'),context).bottom;
  const header=document.querySelector('.photography-heading');
  // Bound the companion's width so larger text cannot create a resize loop:
  // a taller tiger would otherwise narrow the copy and make it taller again.
  const maxHeight=header.clientWidth*.27*1213/843;
  header.style.setProperty('--photo-tiger-height',`${Math.min(bottom-top,maxHeight)}px`);
  header.style.setProperty('--photo-tiger-offset',`${top-copy.getBoundingClientRect().top}px`);
}
function sizeUxMascot(){
  const copy=document.querySelector('.ux-heading-copy');if(!copy)return;
  const context=document.createElement('canvas').getContext('2d');
  const top=inkEdges(copy.querySelector('h1'),context).top,bottom=inkEdges(copy.querySelector('p'),context).bottom;
  const header=document.querySelector('.ux-heading'),copyRect=copy.getBoundingClientRect();
  header.style.setProperty('--ux-mascot-height',`${bottom-top}px`);
  header.style.setProperty('--ux-mascot-offset',`${top-copyRect.top}px`);
}
function initMartenGaze(){destroyMartenGaze();destroyMartenGaze=martenGazeFactory?.(document.querySelector('.ux-mascot'))||(()=>{});}
function initMartenTooltip(){destroyMartenTooltip();destroyMartenTooltip=martenTooltipFactory?.()||(()=>{});}
function alignPageChrome(){
  const control=document.querySelector('.weather-control'),main=document.querySelector('main');
  if(!control||!main)return;
  const current=control.getBoundingClientRect(),width=current.width||168;
  const homeX=innerWidth-width-(innerWidth<=1200?18:50);
  const edge=document.querySelector('.collection-grid')||document.querySelector('.article')||main;
  const target=main.classList.contains('home')?homeX:edge.getBoundingClientRect().right-width;
  const start=current.left;

  control.classList.remove('weather-control-moving');
  control.style.right='auto';
  control.style.left=`${Math.round(start)}px`;
  if(!pageChromePlaced||reduced.matches||Math.abs(start-target)<1){
    control.classList.remove('weather-control-moving');
    control.style.left=`${Math.round(target)}px`;
    pageChromePlaced=true;
    return;
  }

  pageChromePlaced=true;
  void control.offsetWidth;
  control.classList.add('weather-control-moving');
  control.style.left=`${Math.round(target)}px`;
}
document.fonts.ready.then(()=>{sizePhotographyTiger();sizeUxMascot();});
function placeTiger(){
  tigerSizeObserver.disconnect();
  const slot=document.querySelector('.photography-tiger-slot,.product-tiger-slot');
  (slot||sidebar).append(tigerCompanion);
  tigerCompanion.hidden=false;
  tigerCompanion.classList.toggle('tiger-in-heading',Boolean(slot));
  if(slot?.matches('.photography-tiger-slot')){sizePhotographyTiger();tigerSizeObserver.observe(document.querySelector('.photography-heading-copy'));}
}
function bindCard(card){
    card.addEventListener('pointermove',e=>{
      if(!pointerMotion.matches||card.closest('.stack-live')?.dataset.shuffling==='true')return;
      const print=card.querySelector('.print');
      const rect=print.getBoundingClientRect(),tilt=((e.clientX-rect.left)/rect.width-.5)*3;
      if(card.closest('.stack-live')?.dataset.open!=='false')print.style.transform=`translateY(-7px) rotate(${tilt}deg)`;
      cue.textContent=card.classList.contains('photo-card')?'View photo':'Read ↗';
      cue.style.transform=`translate(${Math.min(e.clientX+18,innerWidth-85)}px,${Math.min(e.clientY+18,innerHeight-45)}px)`;
      cue.classList.add('active');
    });
    const reset=()=>{card.querySelector('.print').style.transform='';cue.classList.remove('active');};
    card.addEventListener('pointerleave',reset);card.addEventListener('click',reset);
  }
function initPhotoModal(){
  const dialog=document.querySelector('.photo-modal');
  if(!dialog)return;
  const photos=[...document.querySelectorAll('.photo-card[data-photo-src]')];
  if(!photos.length)return;
  const image=dialog.querySelector('img'),title=dialog.querySelector('h2'),description=dialog.querySelector('.photo-modal-copy p');
  const location=dialog.querySelector('.photo-modal-location'),camera=dialog.querySelector('.photo-modal-camera'),date=dialog.querySelector('time');
  let index=0,returnFocus=null;
  function render(next){
    index=(next+photos.length)%photos.length;
    const card=photos[index],source=card.querySelector('.art img'),cardDate=card.querySelector('.meta time');
    image.src=card.dataset.photoSrc;image.alt=source.alt;
    title.textContent=card.dataset.photoTitle;
    description.textContent=card.dataset.photoDescription;
    location.textContent=card.querySelector('.photo-location').textContent;
    camera.textContent=card.querySelector('.meta>span').textContent;
    date.textContent=cardDate.textContent;date.dateTime=cardDate.dateTime;
  }
  function open(card){
    returnFocus=card;render(photos.indexOf(card));dialog.showModal();
  }
  photos.forEach(card=>card.addEventListener('click',event=>{event.preventDefault();open(card);}));
  dialog.querySelector('.photo-modal-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();render(index+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();render(index-1);}
  });
  dialog.addEventListener('close',()=>{image.removeAttribute('src');returnFocus?.focus({preventScroll:true});});
}
function initContent(){
  placeTiger();
  uxMascotSizeObserver.disconnect();const uxCopy=document.querySelector('.ux-heading-copy');if(uxCopy){sizeUxMascot();uxMascotSizeObserver.observe(uxCopy);}
  initMartenGaze();
  initMartenTooltip();
  alignPageChrome();
  destroyStack();document.querySelectorAll('[data-card]').forEach(bindCard);
  initPhotoModal();
  const grid=document.querySelector('.home-grid');destroyStack=grid?createDeck(grid,bindCard):()=>{};
}
function createDeck(grid,bindCard){
  const cards=[...grid.querySelectorAll(':scope > .card:not(.home-card-extra)')];
  let metrics=[],progress=aboutDeckOpened||reduced.matches?1:0,alive=true,frame=0,resolveMotion=null;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
  function stopMotion(){cancelAnimationFrame(frame);frame=0;if(resolveMotion){resolveMotion(false);resolveMotion=null;}}
  function render(p){
    progress=p;grid.dataset.progress=p.toFixed(3);grid.dataset.open=String(p>.92);
    cards.forEach((card,i)=>{
      const m=metrics[i];if(!m)return;
      card.style.setProperty('--stack-x',`${m.x*(1-p)}px`);
      card.style.setProperty('--stack-y',`${m.y*(1-p)}px`);
      card.style.setProperty('--stack-r',`${m.r*(1-p)}deg`);
      card.style.setProperty('--stack-scale',String(1-m.s*(1-p)));
      card.style.zIndex=p>.98?'':String(cards.length-i);
      card.inert=i!==0&&p<.88;
    });
  }
  function animateTo(to,duration=650){
    stopMotion();const from=progress;
    if(reduced.matches||Math.abs(to-from)<.002){render(to);return Promise.resolve(true);}
    return new Promise(resolve=>{
      resolveMotion=resolve;const begin=performance.now();
      function tick(now){if(!alive){resolve(false);return;}const p=clamp((now-begin)/duration);render(from+(to-from)*smooth(p));if(p<1)frame=requestAnimationFrame(tick);else{frame=0;resolveMotion=null;resolve(true);}}
      frame=requestAnimationFrame(tick);
    });
  }
  function measure(){
    // Keep the leading card calm and upright, then reveal the rest of the
    // deck as a balanced fan from both sides. The final card sits deepest in
    // the stack so six cards still read as one compact object.
    const spread=[0,-34,34,-66,66,0],lift=[0,8,8,18,18,27],rotation=[0,-4,4,-8,8,1.5];
    metrics=cards.map((card,i)=>({
      x:(grid.clientWidth-card.offsetWidth)/2-card.offsetLeft+spread[i]*(innerWidth<=620?.45:1),
      y:lift[i]-card.offsetTop,
      r:rotation[i]*(innerWidth<=620?.62:1),
      s:i===0?0:.022+(i%3)*.008
    }));
    render(progress);
  }
  function openDeck(){
    if(aboutDeckOpened)return Promise.resolve(true);
    aboutDeckOpened=true;
    return animateTo(1);
  }
  function handleScroll(){if(scrollY>0)openDeck();}
  function handleHover(){if(pointerMotion.matches)openDeck();}
  function handleFocus(event){if(event.target.closest('.home-card'))openDeck();}
  function motionChanged(){if(reduced.matches){aboutDeckOpened=true;stopMotion();render(1);}}
  grid.classList.add('stack-live');grid.dataset.entering='false';
  const observer=new ResizeObserver(measure);observer.observe(grid);
  grid.addEventListener('focusin',handleFocus);
  grid.addEventListener('pointerenter',handleHover);
  addEventListener('scroll',handleScroll,{passive:true});addEventListener('resize',measure);reduced.addEventListener('change',motionChanged);
  measure();if(scrollY>0)openDeck();
  document.fonts.ready.then(()=>{if(alive)measure();});
  return ()=>{alive=false;stopMotion();observer.disconnect();grid.removeEventListener('focusin',handleFocus);grid.removeEventListener('pointerenter',handleHover);removeEventListener('scroll',handleScroll);removeEventListener('resize',measure);reduced.removeEventListener('change',motionChanged);};
}

function updateProgress(){const p=document.querySelector('.reading-progress');if(p){const range=document.documentElement.scrollHeight-innerHeight;p.style.transform=`scaleX(${range>0?Math.min(1,scrollY/range):1})`;}}
addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);
addEventListener('resize',()=>{pageChromePlaced=false;alignPageChrome();});
addEventListener('blur',()=>cue.classList.remove('active'));
initContent();updateProgress();
document.fonts.ready.then(alignPageChrome);

// The painted companion stays in place across page navigation.
const logo=document.querySelector('.logo-tiger');
import('/tiger-gaze.js').then(m=>m.createSeatedTiger(logo)).catch(console.error);
import('/marten-gaze.js').then(m=>{martenGazeFactory=m.createMartenGaze;initMartenGaze();}).catch(console.error);
import('/marten-tooltip.js').then(m=>{martenTooltipFactory=m.initMartenTooltip;initMartenTooltip();}).catch(console.error);
import('/tiger-tooltip.js').then(m=>m.initTigerTooltip()).catch(console.error);
const navigation=document.querySelector('nav[aria-label="Main navigation"]');
const links=[...navigation.querySelectorAll('a')];let controller=null,profileExitTimer=0;
const navIndicator=navigation.querySelector('.nav-indicator');
let navIndicatorY=null,navIndicatorAnimation=null;
function moveNavIndicator(link,animate=true){
  if(!link||!navIndicator)return;
  const target=link.offsetTop+(link.offsetHeight-navIndicator.offsetHeight)/2;
  if(navIndicatorY===null||!animate||reduced.matches){
    navIndicatorAnimation?.cancel();navIndicatorAnimation=null;navIndicatorY=target;
    navIndicator.style.transform=`translateY(${target}px)`;
    return;
  }
  const start=navIndicatorY,distance=target-start;
  if(Math.abs(distance)<.5)return;
  navIndicatorAnimation?.cancel();
  const turning=.2,keyframes=[
    {transform:`translateY(${start}px) rotate(0deg)`,offset:0},
    {transform:`translateY(${start}px) rotate(45deg)`,offset:turning}
  ];
  if(distance>0){
    // Free fall: displacement grows with time squared under constant gravity.
    for(let step=1;step<=8;step++){
      const time=step/8,position=start+distance*time*time;
      keyframes.push({transform:`translateY(${position}px) rotate(${45+315*time}deg)`,offset:turning+.66*time});
    }
    keyframes.push(
      {transform:`translateY(${target+3}px) rotate(360deg) scaleX(1.18) scaleY(.76)`,offset:.9},
      {transform:`translateY(${target-2}px) rotate(360deg) scaleX(.94) scaleY(1.08)`,offset:.95},
      {transform:`translateY(${target}px) rotate(360deg) scale(1)`,offset:1}
    );
  }else{
    // Moving upward behaves like a small launch against gravity: fast first,
    // then progressively slower as it reaches the selected tab.
    for(let step=1;step<=8;step++){
      const time=step/8,position=start+distance*(2*time-time*time);
      keyframes.push({transform:`translateY(${position}px) rotate(${45+315*time}deg)`,offset:turning+.76*time});
    }
    keyframes.push({transform:`translateY(${target}px) rotate(360deg)`,offset:1});
  }
  const travel=Math.sqrt(2*Math.abs(distance)/1700)*1000;
  navIndicatorAnimation=navIndicator.animate(keyframes,{duration:Math.max(430,Math.min(760,170+travel+120)),easing:'linear'});
  navIndicatorY=target;
  navIndicatorAnimation.addEventListener('finish',()=>{navIndicator.style.transform=`translateY(${target}px)`;navIndicatorAnimation=null;},{once:true});
}
document.fonts.ready.then(()=>moveNavIndicator(links.find(link=>link.hasAttribute('aria-current')),false));
addEventListener('resize',()=>moveNavIndicator(links.find(link=>link.hasAttribute('aria-current')),false));
async function navigate(url,{push=true}={}){
  controller?.abort();controller=new AbortController();const signal=controller.signal;
  const nextLink=links.find(a=>a.pathname===url.pathname)||links.find(a=>a.pathname!=='/'&&url.pathname.startsWith(a.pathname))||links[0];
  moveNavIndicator(nextLink,true);
  try{
    const response=await fetch(url,{signal});if(!response.ok)throw Error('Page unavailable');
    const html=new DOMParser().parseFromString(await response.text(),'text/html');if(signal.aborted)return;
    const main=html.querySelector('main');if(!main)throw Error('Missing page');
    // The full signature writes only on the initial Me landing. A fetched
    // Me page receives the completed signature immediately.
    main.querySelector('.personal-name')?.classList.remove('signature-intro');
    const wasHome=document.querySelector('main').classList.contains('home');
    document.querySelector('main').replaceWith(main);document.title=html.title;
    const showSidebarProfile=!main.classList.contains('home');
    clearTimeout(profileExitTimer);sidebar.classList.remove('profile-arriving','profile-leaving');
    if(showSidebarProfile){
      sidebar.classList.add('has-profile');
      if(wasHome&&!reduced.matches){void sidebar.offsetWidth;sidebar.classList.add('profile-arriving');}
    }else if(!wasHome&&sidebar.classList.contains('has-profile')&&!reduced.matches){
      sidebar.classList.add('profile-leaving');
      profileExitTimer=setTimeout(()=>sidebar.classList.remove('has-profile','profile-leaving'),520);
    }else sidebar.classList.remove('has-profile');
    document.querySelector('meta[name="description"]').content=html.querySelector('meta[name="description"]').content;
    links.forEach(a=>a.removeAttribute('aria-current'));nextLink.setAttribute('aria-current','page');
    if(push)history.pushState({},'',url);
    scrollTo({top:0,behavior:'instant'});closeMenu();cue.classList.remove('active');initContent();updateProgress();main.focus({preventScroll:true});
  }catch(error){if(error.name!=='AbortError')location.assign(url);}
}
for(const link of [...links,document.querySelector('.sidebar-profile')])link.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();if(link.pathname===location.pathname){scrollTo({top:0,behavior:'smooth'});return;}
  navigate(new URL(link.href));
});
addEventListener('popstate',()=>navigate(new URL(location.href),{push:false}));
