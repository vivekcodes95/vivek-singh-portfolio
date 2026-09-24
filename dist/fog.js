// Layered, noise-shaped vapor: transparent edges, drifting wisps and no hard discs.
const textures=[];
const ease=t=>t*t*(3-2*t);
function makeTexture(){
  const size=144,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const context=canvas.getContext('2d'),pixels=context.createImageData(size,size);
  const fields=[5,9,17,33].map(n=>({n,values:Float32Array.from({length:n*n},()=>Math.random())}));
  function noise(x,y){
    let total=0,weight=.56;
    for(const {n,values} of fields){
      const px=x*(n-1),py=y*(n-1),ix=Math.floor(px),iy=Math.floor(py),fx=ease(px-ix),fy=ease(py-iy);
      const a=values[iy*n+ix],b=values[iy*n+Math.min(ix+1,n-1)],c=values[Math.min(iy+1,n-1)*n+ix],d=values[Math.min(iy+1,n-1)*n+Math.min(ix+1,n-1)];
      total+=((a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy)*weight;weight*=.5;
    }
    return total;
  }
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const nx=x/(size-1),ny=y/(size-1),n=noise(nx,ny);
    const radius=Math.hypot((nx-.5)*2,(ny-.5)*2);
    const edge=Math.max(0,1-radius),density=Math.pow(edge,1.35)*Math.max(0,(n-.16)*1.9);
    const color=221+n*34,i=(y*size+x)*4;
    pixels.data[i]=color;pixels.data[i+1]=color+2;pixels.data[i+2]=color+3;pixels.data[i+3]=Math.min(230,density*360);
  }
  context.putImageData(pixels,0,0);return canvas;
}

export function createShuffleFog(grid){
  const canvas=document.createElement('canvas');canvas.className='shuffle-fog';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
  const context=canvas.getContext('2d');
  if(!context){canvas.remove();return {trail(){},burst(){},release(){},clear(){},destroy(){}};}
  if(!textures.length)for(let i=0;i<3;i++)textures.push(makeTexture());
  let particles=[],frame=0,lastTime=0,releaseAt=0,activeUntil=0,previous=null,destroyed=false,coverUntil=0;
  const random=(a,b)=>a+Math.random()*(b-a);
  function resize(){const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.ceil(innerWidth*ratio);canvas.height=Math.ceil(innerHeight*ratio);context.setTransform(ratio,0,0,ratio,0,0);}
  function emit(x,y,count,spread=1){
    const rect=grid.getBoundingClientRect(),targetX=rect.left+rect.width/2,targetY=rect.top+Math.min(rect.height,350)*.45;
    for(let i=0;i<count;i++)particles.push({x:x+random(-9,9),y:y+random(-7,7),vx:random(-90,90)*spread+(targetX-x)*.28,vy:random(-72,15)+(targetY-y)*.16,age:0,life:random(.65,1),size:random(75,140)*spread,grow:random(100,190),angle:random(0,Math.PI*2),spin:random(-.35,.35),phase:random(0,Math.PI*2),alpha:random(.28,.48),texture:textures[Math.floor(Math.random()*textures.length)]});
    if(particles.length>90)particles.splice(0,particles.length-90);
    canvas.dataset.active='true';if(!frame){lastTime=performance.now();frame=requestAnimationFrame(tick);}
  }
  function tick(now){
    frame=0;if(destroyed)return;
    const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;
    context.clearRect(0,0,innerWidth,innerHeight);
    const fade=releaseAt?Math.max(0,1-(now-releaseAt)/210):1;
    particles=particles.filter(p=>p.age<p.life&&fade>0);
    for(const p of particles){
      p.age+=dt;
      if(p.cover){const travel=1-Math.pow(1-Math.min(1,p.age/.3),3);p.x=p.fromX+(p.targetX-p.fromX)*travel+Math.sin(p.phase+p.age*2)*12;p.y=p.fromY+(p.targetY-p.fromY)*travel-Math.sin(p.age*2+p.phase)*10;}
      else{p.x+=(p.vx+Math.sin(p.phase+p.age*3)*21)*dt;p.y+=(p.vy-Math.cos(p.phase+p.age*2)*12)*dt;}
      p.angle+=p.spin*dt;
      const t=p.age/p.life,envelope=Math.min(1,p.age/.12)*(p.cover?1:Math.pow(Math.max(0,1-t),.75)),size=p.size+p.age*p.grow+(1-fade)*75;
      context.save();context.globalAlpha=p.alpha*envelope*fade*fade;context.translate(p.x,p.y);context.rotate(p.angle);context.drawImage(p.texture,-size/2,-size*.36,size,size*.72);context.restore();
    }
    if(particles.length)frame=requestAnimationFrame(tick);else{canvas.dataset.active='false';releaseAt=0;previous=null;}
  }
  function trail(x,y){
    if(destroyed||matchMedia('(prefers-reduced-motion: reduce)').matches||releaseAt)return;
    const now=performance.now();if(previous&&now-previous.t<14)return;
    const steps=previous?Math.min(5,Math.ceil(Math.hypot(x-previous.x,y-previous.y)/17)):1;
    for(let i=1;i<=steps;i++){const t=i/steps;emit(previous?previous.x+(x-previous.x)*t:x,previous?previous.y+(y-previous.y)*t:y,2);}
    previous={x,y,t:now};
  }
  function burst(x,y){
    if(destroyed||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    releaseAt=0;activeUntil=performance.now()+420;coverUntil=performance.now()+950;trail(x,y);emit(x,y,24,1.7);
    const rect=grid.getBoundingClientRect(),height=Math.min(rect.height,520),size=Math.max(300,rect.width*.48);
    for(let row=0;row<3;row++)for(let col=0;col<5;col++)for(let layer=0;layer<2;layer++){
      particles.push({cover:true,fromX:x,fromY:y,x,y,targetX:rect.left+rect.width*(col+.3)/4.6+random(-30,30),targetY:rect.top+height*(row+.3)/2.6+random(-16,16),age:0,life:2,size:size*random(.9,1.2),grow:25,angle:random(-.35,.35),spin:random(-.12,.12),phase:random(0,Math.PI*2),alpha:random(.7,.9),texture:textures[Math.floor(Math.random()*textures.length)]});
    }
  }
  function move(e){if(performance.now()<activeUntil)trail(e.clientX,e.clientY);}
  function release(){activeUntil=0;if(particles.length)releaseAt=performance.now();}
  function clear(){cancelAnimationFrame(frame);frame=0;particles=[];previous=null;releaseAt=0;activeUntil=0;context.clearRect(0,0,innerWidth,innerHeight);canvas.dataset.active='false';}
  resize();addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});addEventListener('blur',clear);
  return {trail,burst,release,clear,remaining:()=>Math.max(0,coverUntil-performance.now()),destroy(){destroyed=true;clear();removeEventListener('resize',resize);removeEventListener('pointermove',move);removeEventListener('blur',clear);canvas.remove();}};
}
