import {initWeatherControl} from './weather-control.js';
const root=document.documentElement;
let syncControl=()=>{};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=document.createElement('canvas');canvas.className='night-scene';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
const ctx=canvas.getContext('2d');
let width=innerWidth,height=innerHeight,flies=[],frame=0,last=0,clock=0,eyeSlots=[],nextBlinkAllowed=0;
const random=(min,max)=>min+Math.random()*(max-min);
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const night=()=>root.dataset.theme==='night';
const home=()=>location.pathname==='/' || location.pathname==='/index.html';
const dark=()=>root.dataset.theme!=='day';
const lightningTiming={
  firstStorm:Number(globalThis.__RAIN_LIGHTNING_TIMING__?.firstStorm??2),
  cycle:Number(globalThis.__RAIN_LIGHTNING_TIMING__?.cycle??3),
  doubleGap:Number(globalThis.__RAIN_LIGHTNING_TIMING__?.doubleGap??.2)
};
let drops=[],splashes=[],lightning=null,nextLightning=Infinity,lightningQueue=[],doubleBurstNext=true,lightningCount=0;
function resize(){
  width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,1.75);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx?.setTransform(ratio,0,0,ratio,0,0);
  const count=Math.max(12,Math.min(36,Math.round(width*height/40000)));
  flies=Array.from({length:count},()=>({x:random(0,width),y:random(0,height),depth:random(.35,1),heading:random(0,Math.PI*2),phase:random(0,Math.PI*2),cycle:random(4.5,9),offset:random(0,10),speed:random(7,19),drift:random(.15,.5)}));
  drops=Array.from({length:Math.min(260,Math.round(width*height/4200))},()=>({x:random(0,width+80),y:random(-height,height),z:random(.25,1),speed:random(560,950)}));splashes=[];
  resetEyes(.3);
}
function drawFly(f,t,dt){
  // Smooth steering and a brief, asymmetric biological light pulse.
  f.heading+=(Math.sin(t*f.drift+f.phase)*.45+Math.cos(t*.31+f.phase)*.22)*dt;
  f.x+=Math.cos(f.heading)*f.speed*f.depth*dt;f.y+=(Math.sin(f.heading)*f.speed*f.depth+Math.sin(t*1.5+f.phase)*2)*dt;
  if(f.x < -25)f.x=width+25;if(f.x>width+25)f.x=-25;if(f.y < -25)f.y=height+25;if(f.y>height+25)f.y=-25;
  const phase=((t+f.offset)%f.cycle)/f.cycle;
  const light=smooth(phase/.15)*(1-smooth((phase-.21)/.28));
  if(light<.005||eyeSlots.some(s=>s.eye&&Math.hypot(f.x-s.eye.x,f.y-s.eye.y)<85))return;
  const radius=11+f.depth*16,strength=light*(.38+f.depth*.6);
  ctx.save();ctx.translate(f.x,f.y);ctx.globalCompositeOperation='lighter';
  const glow=ctx.createRadialGradient(0,0,0,0,0,radius);
  glow.addColorStop(0,`rgba(221,244,133,${strength*.36})`);glow.addColorStop(.13,`rgba(182,225,96,${strength*.2})`);glow.addColorStop(.42,`rgba(139,190,60,${strength*.055})`);glow.addColorStop(1,'rgba(115,166,45,0)');
  ctx.fillStyle=glow;ctx.fillRect(-radius,-radius,radius*2,radius*2);
  ctx.rotate(f.heading+Math.PI/2);ctx.globalCompositeOperation='source-over';
  // A tiny dark body above the lantern and barely visible beating wings.
  if(f.depth>.65){
    ctx.fillStyle=`rgba(128,155,115,${strength*.17})`;
    const wing=1.8+Math.sin(t*47+f.phase)*.65;
    ctx.beginPath();ctx.ellipse(-1.4,-1.2,wing,.65,-.5,0,Math.PI*2);ctx.ellipse(1.4,-1.2,wing,.65,.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(30,43,25,${strength*.8})`;ctx.beginPath();ctx.ellipse(0,-1.6,.65,1.6,0,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=`rgba(239,251,174,${strength})`;ctx.shadowColor='#e4f49a';ctx.shadowBlur=3*f.depth;
  ctx.beginPath();ctx.ellipse(0,.65,.55+f.depth*.7,.8+f.depth*.55,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function occupiedAreas(){
  return [...document.querySelectorAll('.sidebar,.weather-control,.rope-knot,.rope-monkey,.monkey-tooltip,.portrait,h1,h2,h3,p,.card,.article,.intro-lines,.location,.deck-controls,.collection-rule,.page-kicker,.collection-note,main a,main time,main small,main span')].map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<height);
}
function clearSpot(x,y,occupied){return !occupied.some(r=>x+36>r.left-12&&x-36<r.right+12&&y+19>r.top-12&&y-19<r.bottom+12);}
function minimumEyeSeparation(){
  const sidebar=width>620?parseFloat(getComputedStyle(root).getPropertyValue('--sidebar')):0;
  return Math.min(280,Math.max(width<=620?120:190,(width-sidebar)*.18));
}
function findQuietSpot(occupied,previous,region,otherEyes=[]){
  const sidebar=width>620?parseFloat(getComputedStyle(root).getPropertyValue('--sidebar')):0;
  const left=sidebar+42,right=width-42,top=90,bottom=height-45;
  const midX=(left+right)/2,midY=(top+bottom)/2;
  const xRange=region%2?[midX+20,right]:[left,midX-20];
  const yRange=region<2?[top,midY-20]:[midY+20,bottom];
  // Each pair owns a separate quarter of the available page. Choose a clear
  // candidate far from its last position; never fall back into another quarter.
  let best=null,bestDistance=-1;
  for(let i=0;i<240;i++){
    const x=random(...xRange),y=random(...yRange);
    if(!clearSpot(x,y,occupied))continue;
    if(otherEyes.some(eye=>Math.hypot(x-eye.x,y-eye.y)<minimumEyeSeparation()))continue;
    const distance=previous?Math.hypot(x-previous.x,y-previous.y):Math.random();
    if(distance>bestDistance){bestDistance=distance;best={x,y,start:clock,scale:random(.6,.7),region};}
  }
  return best;
}
function resetEyes(delay=1){
  eyeSlots=Array.from({length:3},(_,i)=>({id:i,reddish:i%2===1,next:clock+delay,nextBlink:clock+delay+.65+i*.7,blinkStart:-Infinity}));
  nextBlinkAllowed=clock+delay+.55;
  canvas.dataset.eyes='hidden';canvas.dataset.eyePairs='[]';canvas.dataset.blinkingEyes='[]';
}
function drawEyes(t){
  const occupied=occupiedAreas();
  for(const slot of eyeSlots){
    const liveEyes=eyeSlots.filter(s=>s!==slot&&s.eye).map(s=>s.eye);
    const acceptedEyes=eyeSlots.filter(s=>s.id<slot.id&&s.eye).map(s=>s.eye);
    const others=liveEyes.map(eye=>({left:eye.x-65,right:eye.x+65,top:eye.y-36,bottom:eye.y+36}));
    const areas=[...occupied,...others];
    const tooClose=slot.eye&&acceptedEyes.some(eye=>Math.hypot(slot.eye.x-eye.x,slot.eye.y-eye.y)<minimumEyeSeparation());
    if(slot.eye&&(t-slot.eye.start>slot.eye.duration||!clearSpot(slot.eye.x,slot.eye.y,areas)||tooClose)){slot.previous=slot.eye;slot.eye=null;slot.next=t+.18;}
    if(!slot.eye&&t>=slot.next){const spot=findQuietSpot(areas,slot.previous,slot.id,liveEyes);if(spot)slot.eye={...spot,reddish:slot.reddish,duration:3.6+slot.id*.35};else slot.next=t+.15;}
  }
  let blinking=eyeSlots.find(slot=>slot.eye&&t-slot.blinkStart>=0&&t-slot.blinkStart<=.15);
  if(!blinking&&t>=nextBlinkAllowed){
    blinking=eyeSlots.filter(slot=>slot.eye&&t>=slot.nextBlink).sort((a,b)=>a.nextBlink-b.nextBlink)[0];
    if(blinking){blinking.blinkStart=t;blinking.nextBlink=t+random(2.8,4);nextBlinkAllowed=t+.7;}
  }
  eyeSlots.forEach(slot=>{if(slot.eye)drawEye(slot.eye,t,slot===blinking?slot.blinkStart:null);});
  const visible=eyeSlots.flatMap(s=>s.eye?[{id:s.id,region:s.id,x:s.eye.x,y:s.eye.y,scale:s.eye.scale,color:s.reddish?'reddish':'gold'}]:[]);
  canvas.dataset.eyes=visible.length?'visible':'hidden';canvas.dataset.eyePairs=JSON.stringify(visible);canvas.dataset.eyeMinDistance=String(minimumEyeSeparation());canvas.dataset.blinkingEyes=JSON.stringify(blinking?[blinking.id]:[]);
}
function eyeShape(){
  ctx.beginPath();ctx.moveTo(-14,-5);ctx.bezierCurveTo(-5,-5.5,8,-2,14,4);ctx.bezierCurveTo(8,13,-11,12,-14,-5);ctx.closePath();
}
function drawEye(eyes,t,blinkStart=null){
  const age=t-eyes.start;

  // A decisive eyelid close, brief shut, and quick reopening (150 ms total).
  const blink=()=>{const d=blinkStart===null?-1:t-blinkStart;if(d<0||d>.15)return 0;if(d<.045)return smooth(d/.045);if(d<.08)return 1;return 1-smooth((d-.08)/.07);};
  const opening=1-blink();
  const reddish=eyes.reddish;
  ctx.save();ctx.translate(eyes.x+Math.sin(age*.5)*1.7,eyes.y);ctx.scale(eyes.scale,eyes.scale);ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.globalCompositeOperation='source-over';
  for(const sign of [-1,1]){
    ctx.save();ctx.translate(sign*24,0);ctx.scale(-sign,Math.max(.001,opening));
    eyeShape();ctx.clip();ctx.fillStyle=reddish?'#e87650':'#edc34a';ctx.fillRect(-16,-10,32,25);
    ctx.fillStyle='#050607';ctx.beginPath();ctx.moveTo(-4,-8);ctx.bezierCurveTo(-4,0,-2,4,-.5,2);ctx.bezierCurveTo(1,-1,1,-6,1,-8);ctx.closePath();ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function drawRain(dt){
  updateLightningSequence();drawLightning();
  const wind=65+Math.sin(clock*.35)*22;
  ctx.lineCap='round';
  for(const drop of drops){
    drop.x-=wind*drop.z*dt;drop.y+=drop.speed*drop.z*dt;
    if(drop.y>height+30){
      if(drop.z>.65)splashes.push({x:drop.x,y:height-random(2,24),age:0,z:drop.z});
      drop.y=random(-180,-30);drop.x=random(0,width+100);
    }
    if(drop.x< -30)drop.x=width+30;
    const length=9+drop.z*23;
    const shine=ctx.createLinearGradient(drop.x,drop.y-length,drop.x,drop.y);
    shine.addColorStop(0,'rgba(180,199,213,0)');shine.addColorStop(1,`rgba(180,199,213,${.08+drop.z*.23})`);
    ctx.strokeStyle=shine;ctx.lineWidth=.45+drop.z*.75;
    ctx.beginPath();ctx.moveTo(drop.x+wind/drop.speed*length,drop.y-length);ctx.lineTo(drop.x,drop.y);ctx.stroke();
  }
  splashes=splashes.filter(s=>s.age<.4);
  for(const s of splashes){s.age+=dt;ctx.strokeStyle=`rgba(174,192,207,${(1-s.age/.4)*.13})`;ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(s.x,s.y,2+s.age*22,1+s.age*4,0,Math.PI,Math.PI*2);ctx.stroke();}
  canvas.dataset.rain='true';
}
function spawnLightning(){
  const sidebar=width>620?parseFloat(getComputedStyle(root).getPropertyValue('--sidebar')):0;
  const left=Math.min(width-28,sidebar+35),right=Math.max(left,width-28);
  const x=random(left,right),endY=random(height*.28,height*.57),points=[{x,y:-15}],branches=[];
  for(let i=1;i<=12;i++){
    const previous=points.at(-1),y=i*endY/12;
    points.push({x:Math.max(sidebar+10,Math.min(width-10,previous.x+random(-23,23))),y});
    if(i===4||i===7){
      const start=points.at(-1),direction=i===4?-1:1;
      branches.push([start,{x:start.x+direction*random(16,30),y:y+12},{x:start.x+direction*random(32,46),y:y+34},{x:start.x+direction*random(45,66),y:y+55}]);
    }
  }
  lightning={start:clock,points,branches,x};lightningCount+=1;
  canvas.dataset.lightningCount=String(lightningCount);canvas.dataset.lightningX=String(Math.round(x));
}
function updateLightningSequence(){
  if(clock>=nextLightning){
    const burstAt=clock;
    lightningQueue.push(burstAt);
    if(doubleBurstNext)lightningQueue.push(burstAt+lightningTiming.doubleGap);
    canvas.dataset.lightningSequence=doubleBurstNext?'double':'single';
    doubleBurstNext=!doubleBurstNext;nextLightning=clock+lightningTiming.cycle;
  }
  while(lightningQueue.length&&clock>=lightningQueue[0]){lightningQueue.shift();spawnLightning();}
  canvas.dataset.nextLightning=Number.isFinite(nextLightning)?String(nextLightning):'';
}
function drawLightning(){
  if(!lightning){canvas.dataset.lightning='false';return;}
  const age=clock-lightning.start;
  if(age>.58){lightning=null;canvas.dataset.lightning='false';return;}
  canvas.dataset.lightning='true';
  // One short discharge and a gentle afterglow; no repeated strobing.
  const flash=Math.min(1,age/.025)*Math.exp(-age*11);
  ctx.save();
  const sky=ctx.createRadialGradient(lightning.x,0,0,lightning.x,0,width*.8);
  sky.addColorStop(0,`rgba(192,221,209,${flash*.11})`);sky.addColorStop(.4,`rgba(135,180,169,${flash*.045})`);sky.addColorStop(1,'rgba(135,180,169,0)');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const stroke=(points,lineWidth,opacity)=>{
    ctx.lineWidth=lineWidth;ctx.strokeStyle=`rgba(212,237,227,${flash*opacity})`;ctx.beginPath();
    points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  };
  ctx.lineJoin='round';ctx.lineCap='round';ctx.shadowColor='#a3d0bf';ctx.shadowBlur=15;
  stroke(lightning.points,2.2,.52);lightning.branches.forEach(branch=>stroke(branch,.8,.25));
  ctx.shadowBlur=0;stroke(lightning.points,.7,.9);ctx.restore();
}
function tick(now){
  frame=0;if(!dark()||reduced.matches||document.hidden||!ctx)return;
  const elapsed=(now-last)/1000,dt=Math.min(elapsed,.045);last=now;clock+=elapsed;
  ctx.clearRect(0,0,width,height);if(night()){flies.forEach(f=>drawFly(f,clock,dt));if(home())drawEyes(clock);else{canvas.dataset.eyes='hidden';canvas.dataset.eyePairs='[]';canvas.dataset.blinkingEyes='[]';}}else{drawRain(dt);canvas.dataset.eyes='hidden';canvas.dataset.eyePairs='[]';canvas.dataset.blinkingEyes='[]';}
  canvas.dataset.running='true';frame=requestAnimationFrame(tick);
}
function syncAnimation(){
  cancelAnimationFrame(frame);frame=0;
  if(dark()&&!reduced.matches&&!document.hidden&&ctx){last=performance.now();frame=requestAnimationFrame(tick);}
  else{ctx?.clearRect(0,0,width,height);canvas.dataset.running='false';resetEyes(.3);lightning=null;canvas.dataset.lightning='false';}
}
function applyTheme(value,persist=true){
  const mode=['day','night','rain'].includes(value)?value:'day';root.dataset.theme=mode;
  document.querySelector('meta[name="theme-color"]').content=mode==='night'?'#050607':mode==='rain'?'#080f0b':'#ffffff';
  syncControl(mode,persist);
  if(persist)try{localStorage.setItem('portfolio-theme',mode);}catch{}
  clock=0;resetEyes(1);canvas.dataset.rain=String(mode==='rain');lightning=null;lightningQueue=[];lightningCount=0;doubleBurstNext=true;
  if(mode==='rain'){lightningQueue.push(0);nextLightning=lightningTiming.firstStorm;canvas.dataset.lightningSequence='entry';}
  else{nextLightning=Infinity;canvas.dataset.lightningSequence='';}
  canvas.dataset.lightning='false';canvas.dataset.lightningCount='0';canvas.dataset.lightningX='';canvas.dataset.nextLightning=Number.isFinite(nextLightning)?String(nextLightning):'';
  dispatchEvent(new CustomEvent('portfolio-themechange',{detail:{night:mode==='night',mode}}));syncAnimation();
}
syncControl=initWeatherControl(applyTheme);
addEventListener('resize',resize);document.addEventListener('visibilitychange',syncAnimation);reduced.addEventListener('change',syncAnimation);
addEventListener('storage',event=>{if(event.key==='portfolio-theme')applyTheme(event.newValue,false);});
resize();applyTheme(root.dataset.theme,false);
