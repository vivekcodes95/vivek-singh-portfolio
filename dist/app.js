const menu=document.querySelector('.menu-toggle');
const sidebar=document.querySelector('.sidebar');
function closeMenu(){sidebar.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';sidebar.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));});
matchMedia('(max-width:1100px)').addEventListener('change',closeMenu);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('menu-open')){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!sidebar.contains(e.target))closeMenu();});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const pointerMotion=matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
const cue=document.querySelector('.cursor-cue');
let destroyStack=()=>{};
const tigerCompanion=document.querySelector('.sidebar-bottom');
const tigerSizeObserver=new ResizeObserver(()=>sizePhotographyTiger());
function sizePhotographyTiger(){
  const copy=document.querySelector('.photography-heading-copy');
  if(!copy)return;
  // Match visible letter edges, excluding the font's extra space above/below lines.
  const context=document.createElement('canvas').getContext('2d');
  function inkEdges(element){
    const style=getComputedStyle(element),rect=element.getBoundingClientRect();
    context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics=context.measureText(element.textContent);
    const ascent=metrics.fontBoundingBoxAscent??parseFloat(style.fontSize)*.8;
    const descent=metrics.fontBoundingBoxDescent??parseFloat(style.fontSize)*.2;
    const leading=(parseFloat(style.lineHeight)-ascent-descent)/2;
    return {top:rect.top+leading+ascent-metrics.actualBoundingBoxAscent,bottom:rect.bottom-leading-descent+metrics.actualBoundingBoxDescent};
  }
  const top=inkEdges(copy.querySelector('h1')).top,bottom=inkEdges(copy.querySelector('p')).bottom;
  const header=document.querySelector('.photography-heading');
  // Bound the companion's width so larger text cannot create a resize loop:
  // a taller tiger would otherwise narrow the copy and make it taller again.
  const maxHeight=header.clientWidth*.27*1213/843;
  header.style.setProperty('--photo-tiger-height',`${Math.min(bottom-top,maxHeight)}px`);
  header.style.setProperty('--photo-tiger-offset',`${top-copy.getBoundingClientRect().top}px`);
}
document.fonts.ready.then(sizePhotographyTiger);
function placeTiger(){
  tigerSizeObserver.disconnect();
  const slot=document.querySelector('.photography-tiger-slot');
  (slot||sidebar).append(tigerCompanion);
  tigerCompanion.hidden=!slot;
  tigerCompanion.classList.toggle('tiger-in-heading',Boolean(slot));
  if(slot){sizePhotographyTiger();tigerSizeObserver.observe(document.querySelector('.photography-heading-copy'));}
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
    title.textContent=card.querySelector('h2').textContent;
    description.textContent=card.querySelector('.card-copy p').textContent;
    location.textContent=card.querySelector('.photo-location>span').textContent;
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
  destroyStack();document.querySelectorAll('[data-card]').forEach(bindCard);
  initPhotoModal();
  const grid=document.querySelector('.home-grid');destroyStack=grid?createDeck(grid,bindCard):()=>{};
}
function createDeck(grid,bindCard){
  const template=document.querySelector('#article-deck');
  const pool=template?[...template.content.children]:[];
  const shuffleButton=document.querySelector('[data-shuffle]');
  const status=document.querySelector('[data-deck-status]');
  let cards=[...grid.children],metrics=[],start=0,range=1,progress=0,hovered=false,keyboardOpen=false,shuffledOpen=false;
  let busy=false,alive=true,frame=0,resolveMotion=null,entrance=[],samples=[],cooldown=0,queue=[],shuffleFrame=0,finishShuffle=null;
  let fog=null;
  import('/fog.js').then(module=>{if(alive)fog=module.createShuffleFog(grid);}).catch(()=>{});
  const clamp=v=>Math.max(0,Math.min(1,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
  function stopMotion(){cancelAnimationFrame(frame);frame=0;if(resolveMotion){resolveMotion(false);resolveMotion=null;}}
  function cancelEntrance(){grid.dataset.entering='false';entrance.forEach(a=>a.cancel());entrance=[];}
  function render(p){
    progress=p;grid.dataset.progress=p.toFixed(3);grid.dataset.open=String(p>.92);
    cards.forEach((card,i)=>{
      const m=metrics[i];if(!m)return;
      card.style.setProperty('--stack-x',`${m.x*(1-p)}px`);
      card.style.setProperty('--stack-y',`${m.y*(1-p)}px`);
      card.style.setProperty('--stack-r',`${[-7,0,7][i]*(innerWidth<=620?.55:1)*(1-p)}deg`);
      card.style.setProperty('--stack-scale',String(i===1?1:1-(innerWidth<=620?.065:.025)*(1-p)));
      card.inert=i!==1&&p<.88;
    });
  }
  function desired(){return reduced.matches||keyboardOpen||hovered||shuffledOpen?1:smooth((scrollY-start)/range);}
  function animateTo(to,duration=430){
    stopMotion();const from=progress;
    if(reduced.matches||Math.abs(to-from)<.002){render(to);return Promise.resolve(true);}
    return new Promise(resolve=>{
      resolveMotion=resolve;const begin=performance.now();
      function tick(now){if(!alive){resolve(false);return;}const p=clamp((now-begin)/duration);render(from+(to-from)*smooth(p));if(p<1)frame=requestAnimationFrame(tick);else{frame=0;resolveMotion=null;resolve(true);}}
      frame=requestAnimationFrame(tick);
    });
  }
  function update(){if(busy)return;cancelEntrance();animateTo(desired());}
  function measure(){
    const top=grid.getBoundingClientRect().top+scrollY;
    start=Math.max(0,top-innerHeight*.72);
    const available=document.documentElement.scrollHeight-innerHeight-start;
    range=Math.max(1,Math.min(420,innerHeight*.45,available-65));
    metrics=cards.map((card,i)=>({x:(grid.clientWidth-card.offsetWidth)/2-card.offsetLeft+(i-1)*(innerWidth<=620?8:32),y:(i===1?0:18)-card.offsetTop}));
    if(available<85)keyboardOpen=true;
    if(!busy)render(frame?progress:desired());
  }
  async function deal(initial=false){
    cancelEntrance();
    if(reduced.matches||keyboardOpen)return;
    grid.dataset.entering='true';
    const lift=initial?Math.max(140,Math.min(380,innerHeight-grid.getBoundingClientRect().top+90)):100;
    entrance=cards.map((card,i)=>card.animate([
      {opacity:0,translate:`${(i-1)*35}px ${lift}px`,scale:'.92',offset:0},
      {opacity:1,translate:`${(i-1)*7}px -8px`,scale:'1.01',offset:.76},
      {opacity:1,translate:'0px 0px',scale:'1',offset:1}
    ],{duration:initial?760:540,delay:[0,140,70][i],easing:'cubic-bezier(.2,.72,.2,1)',fill:'both'}));
    await Promise.all(entrance.map(a=>a.finished)).catch(()=>{});
    if(alive)cancelEntrance();
  }
  function nextThree(){
    const current=new Set(cards.map(a=>a.getAttribute('href')));
    queue=queue.filter(a=>!current.has(a.getAttribute('href')));
    if(queue.length<3){
      queue=pool.filter(a=>!current.has(a.getAttribute('href')));
      for(let i=queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}
    }
    return queue.splice(0,3).map(a=>document.importNode(a,true));
  }
  function replaceContent(card,replacement){
    card.href=replacement.href;
    // Keep the physical card and its image frame mounted. Adopt the already
    // decoded painting in a single frame, instead of rebuilding the whole card.
    const image=replacement.querySelector('.art img');
    if(image)card.querySelector('.art img').replaceWith(image);
    for(const selector of ['.print-label','.card-copy']){
      card.querySelector(selector).innerHTML=replacement.querySelector(selector).innerHTML;
    }
  }
  function weaveStack(replacements){
    if(reduced.matches){cards.forEach((card,i)=>replaceContent(card,replacements[i]));return Promise.resolve();}
    // Move the front card around the outside before changing its depth. The other
    // two advance while it slips behind them, so no card vanishes or gets re-dealt.
    const order=[0,2,1],slots=[0,2,1],cycleLength=560;
    const rect=grid.getBoundingClientRect(),center=rect.left+rect.width/2;
    const spacing=innerWidth<=620?8:32,rotation=innerWidth<=620?.55:1;
    const poses=slots.map(i=>({x:(i-1)*spacing,y:i===1?0:18,r:[-7,0,7][i]*rotation,s:i===1?1:(innerWidth<=620?.935:.975)}));
    cards.forEach(card=>{card.style.height=`${card.offsetHeight}px`;card.style.overflow='hidden';});
    let cycle=0,began=performance.now(),changed=false;
    const mix=(a,b,p)=>Object.fromEntries(Object.keys(a).map(k=>[k,a[k]+(b[k]-a[k])*p]));
    function pose(card,p){
      const x=(grid.clientWidth-card.offsetWidth)/2-card.offsetLeft+p.x,y=p.y-card.offsetTop;
      card.style.transform=`translate3d(${x}px,${y}px,0) rotate(${p.r}deg) scale(${p.s})`;
    }
    function clean(){
      cancelAnimationFrame(shuffleFrame);shuffleFrame=0;
      cards.forEach((card,i)=>{if(card.href!==replacements[i].href)replaceContent(card,replacements[i]);for(const property of ['transform','z-index','height','overflow'])card.style.removeProperty(property);});
      measure();render(reduced.matches?1:0);
    }
    return new Promise(resolve=>{
      finishShuffle=()=>{clean();finishShuffle=null;resolve();};
      function tick(now){
        if(!alive||reduced.matches){finishShuffle();return;}
        const t=Math.min(1,(now-began)/cycleLength),side=cycle===1?-1:1;
        // Update only the next card, while the current front card still covers
        // it. Its new article is then revealed by the physical forward motion.
        if(!changed){const incoming=order[1];replaceContent(cards[incoming],replacements[incoming]);changed=true;}
        const outgoing=order[2],card=cards[outgoing];
        const available=side>0?innerWidth-center-card.offsetWidth/2-18:center-card.offsetWidth/2-18;
        const reach=Math.max(24,Math.min(card.offsetWidth*1.06+20,available));
        const excursion={x:side*reach,y:-22,r:side*11,s:.96};
        const outward=t<.5;
        const poseFront=outward?mix(poses[2],excursion,smooth(t*2)):mix(excursion,poses[0],smooth((t-.5)*2));
        pose(card,poseFront);card.style.zIndex=outward?'4':'0';
        for(let slot=0;slot<2;slot++){
          const advancing=cards[order[slot]];
          pose(advancing,mix(poses[slot],poses[slot+1],smooth(t)));advancing.style.zIndex=String(slot+1);
        }
        if(t>=1){
          order.unshift(order.pop());cycle++;changed=false;began=now;
          if(cycle===3){finishShuffle();return;}
        }
        shuffleFrame=requestAnimationFrame(tick);
      }
      shuffleFrame=requestAnimationFrame(tick);
    });
  }
  async function reshuffle(pointer){
    if(busy||!alive||pool.length<6)return;
    if(pointer?.fog)fog?.burst(pointer.x,pointer.y);
    busy=true;samples=[];cancelEntrance();cue.classList.remove('active');
    grid.dataset.shuffling='true';shuffleButton?.setAttribute('aria-busy','true');
    cards.forEach(a=>a.querySelector('.print').style.transform='');
    const replacements=nextThree();
    // Decode the next paintings before showing them; keep the existing cards mounted.
    const ready=Promise.all(replacements.flatMap(card=>[...card.querySelectorAll('img')].map(img=>img.decode().catch(()=>{}))));
    const gathered=await animateTo(0,460);if(!gathered||!alive){busy=false;return;}
    await ready;if(!alive)return;
    fog?.release();
    await weaveStack(replacements);if(!alive)return;
    grid.dataset.deal=String(Number(grid.dataset.deal||0)+1);
    if(status)status.textContent='Three more articles: '+cards.map(a=>a.querySelector('h2').textContent).join(', ')+'.';
    shuffledOpen=true;busy=false;grid.dataset.shuffling='false';shuffleButton?.removeAttribute('aria-busy');cooldown=performance.now()+1800;
    animateTo(desired(),650);
  }
  function pointerEnter(e){if(e.pointerType==='mouse'&&pointerMotion.matches){hovered=true;update();}}
  function pointerLeave(){hovered=false;update();}
  function pointerMove(e){
    if(!pointerMotion.matches||e.pointerType!=='mouse'||busy||performance.now()<cooldown||grid.contains(document.activeElement)&&document.activeElement.matches(':focus-visible'))return;
    const bounds=grid.getBoundingClientRect();if(bounds.top>=innerHeight||bounds.bottom<=0)return;
    const now=performance.now(),last=samples.at(-1);
    if(last&&Math.hypot(e.clientX-last.x,e.clientY-last.y)<4)return;
    samples.push({x:e.clientX,y:e.clientY,t:now});samples=samples.filter(s=>now-s.t<700);
    let distance=0,reversals=0,previous=null;
    for(let i=1;i<samples.length;i++){
      const dx=samples[i].x-samples[i-1].x,dy=samples[i].y-samples[i-1].y,length=Math.hypot(dx,dy);
      distance+=length;const direction={x:dx/length,y:dy/length};
      if(previous&&previous.x*direction.x+previous.y*direction.y<-.35)reversals++;
      previous=direction;
    }
    // Match the rapid back-and-forth gesture used to locate the macOS pointer.
    // Browsers do not expose the operating system's enlarged-cursor state.
    if(reversals>=2&&distance>120&&now-samples[0].t<500)fog?.trail(e.clientX,e.clientY);
    if(reversals>=4&&distance>220&&now-samples[0].t>140)reshuffle({fog:true,x:e.clientX,y:e.clientY});
  }
  function focus(e){if(e.target.matches(':focus-visible')){keyboardOpen=true;cancelEntrance();stopMotion();render(1);}}
  function motionChanged(){if(reduced.matches){fog?.clear();cancelEntrance();stopMotion();finishShuffle?.();busy=false;grid.dataset.shuffling='false';shuffleButton?.removeAttribute('aria-busy');render(1);}else measure();}
  grid.classList.add('stack-live');grid.dataset.entering=String(!reduced.matches);
  const observer=new ResizeObserver(measure);observer.observe(grid);
  grid.addEventListener('pointerenter',pointerEnter);grid.addEventListener('pointerleave',pointerLeave);grid.addEventListener('focusin',focus);addEventListener('pointermove',pointerMove,{passive:true});
  shuffleButton?.addEventListener('click',reshuffle);
  addEventListener('scroll',update,{passive:true});addEventListener('resize',measure);reduced.addEventListener('change',motionChanged);
  measure();document.fonts.ready.then(()=>{if(alive&&desired()<.02)deal(true);else if(alive)cancelEntrance();});
  return ()=>{alive=false;fog?.destroy();stopMotion();cancelEntrance();finishShuffle?.();observer.disconnect();removeEventListener('scroll',update);removeEventListener('resize',measure);removeEventListener('pointermove',pointerMove);reduced.removeEventListener('change',motionChanged);shuffleButton?.removeEventListener('click',reshuffle);};
}

function updateProgress(){const p=document.querySelector('.reading-progress');if(p){const range=document.documentElement.scrollHeight-innerHeight;p.style.transform=`scaleX(${range>0?Math.min(1,scrollY/range):1})`;}}
addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);
addEventListener('blur',()=>cue.classList.remove('active'));
initContent();updateProgress();

// The painted companion stays in place across page navigation.
const logo=document.querySelector('.logo-tiger');
import('/tiger-gaze.js').then(m=>m.createSeatedTiger(logo)).catch(console.error);
import('/tiger-tooltip.js').then(m=>m.initTigerTooltip()).catch(console.error);
const navigation=document.querySelector('nav[aria-label="Main navigation"]');
const links=[...navigation.querySelectorAll('a')];let controller=null,profileExitTimer=0;
async function navigate(url,{push=true}={}){
  controller?.abort();controller=new AbortController();const signal=controller.signal;
  const nextLink=links.find(a=>a.pathname===url.pathname)||links.find(a=>a.pathname!=='/'&&url.pathname.startsWith(a.pathname))||links[0];
  try{
    const response=await fetch(url,{signal});if(!response.ok)throw Error('Page unavailable');
    const html=new DOMParser().parseFromString(await response.text(),'text/html');if(signal.aborted)return;
    const main=html.querySelector('main');if(!main)throw Error('Missing page');
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
