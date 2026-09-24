import * as T from './vendor/three/three.module.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

const clamp = T.MathUtils.clamp;
const smooth = t => { t=clamp(t,0,1);return t*t*(3-2*t); };

// The mesh is a genuine skinned tiger. Each paw is driven by a two-bone solver;
// the slow gait moves the weighted mesh through its joints, not a flat sprite.
export async function createTiger(host) {
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-1.376,1.376,.91,-.91,.01,30);
  camera.position.set(-6,.72,.06);camera.lookAt(0,.72,.06);
  const renderer = new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(372,246);
  renderer.domElement.style.width='124px';renderer.domElement.style.height='82px';
  renderer.setClearColor(0xffffff,0);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
  const gltf = await new GLTFLoader().loadAsync('/assets/tiger-rig.glb');
  const model = gltf.scene;
  const animal = new T.Group();animal.add(model);scene.add(animal);
  const mixer=new T.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play();mixer.setTime(0);
  model.updateMatrixWorld(true);
  const bones={};const rest=new Map();
  const coatInk={value:new T.Color()},coatPaper={value:new T.Color()};
  function themeCoat(){
    const palette=getComputedStyle(document.documentElement);
    coatInk.value.set(palette.getPropertyValue('--tiger-ink').trim());coatPaper.value.set(palette.getPropertyValue('--page').trim());
    host.dataset.ink=coatInk.value.getHexString();renderer.render(scene,camera);
  }
  themeCoat();addEventListener('portfolio-themechange',themeCoat);
  model.traverse(node=>{
    if(node.isBone){bones[node.name]=node;rest.set(node,{p:node.position.clone(),q:node.quaternion.clone(),s:node.scale.clone(),w:node.getWorldPosition(new T.Vector3()),wq:node.getWorldQuaternion(new T.Quaternion())});}
    if(node.isMesh){
      const material=new T.MeshBasicMaterial({map:node.material.map,side:T.FrontSide});
      material.onBeforeCompile=shader=>{
        shader.uniforms.coatInk=coatInk;shader.uniforms.coatPaper=coatPaper;
        shader.fragmentShader='uniform vec3 coatInk; uniform vec3 coatPaper;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', `
          #include <map_fragment>
          vec3 coat = (texture2D(map,vMapUv+vec2(.0015,0.)).rgb + texture2D(map,vMapUv-vec2(.0015,0.)).rgb + texture2D(map,vMapUv+vec2(0.,.0015)).rgb + texture2D(map,vMapUv-vec2(0.,.0015)).rgb) * .25;
          float ink = smoothstep(0.07, 0.115, dot(coat, vec3(0.25,0.60,0.15)));
          diffuseColor.rgb = mix(coatPaper, coatInk, ink);
        `);
      };
      node.material=material;node.frustumCulled=false;
    }
  });
  const bone = prefix => Object.values(bones).find(b=>b.name.startsWith(prefix));
  const root=bone('c_root_01');
  const spine=bone('c_spine_00');
  const neck=bone('c_neck_00');
  const head=bone('c_head_00');
  const tail=Object.values(bones).filter(b=>/^c_tail_\d/.test(b.name));
  const legs=[];
  for(const side of ['l','r'])for(const front of [false,true]) {
    const suffix=front?'Front':'';
    const upper=bone(`${side}_femurRibbon${suffix}_00`);
    const lower=bone(`${side}_tibiaRibbon${suffix}_00`);
    const paw=bone(`${side}_ball${suffix}_00`);
    legs.push({upper,lower,paw,front,side,phase:front?(side==='l'?.75:.25):(side==='l'?0:.5),origin:rest.get(paw).w.clone(),a:rest.get(upper).w.distanceTo(rest.get(lower).w),b:rest.get(lower).w.distanceTo(rest.get(paw).w)});
  }
  const world = n => n.getWorldPosition(new T.Vector3());
  function pointJoint(joint, end, target) {
    const p=world(joint);
    const from=world(end).sub(p).normalize();const to=target.clone().sub(p).normalize();
    const delta=new T.Quaternion().setFromUnitVectors(from,to);
    const q=delta.multiply(joint.getWorldQuaternion(new T.Quaternion()));
    const parentQ=joint.parent.getWorldQuaternion(new T.Quaternion()).invert();
    joint.quaternion.copy(parentQ.multiply(q));joint.updateMatrixWorld(true);
  }
  function placePaw(leg,target) {
    const hip=world(leg.upper);
    const direction=target.clone().sub(hip);const distance=clamp(direction.length(),.03,leg.a+leg.b-.003);direction.normalize();
    const along=(leg.a*leg.a-leg.b*leg.b+distance*distance)/(2*distance);
    const height=Math.sqrt(Math.max(0,leg.a*leg.a-along*along));
    // Foreleg elbows bend back; hind knees bend forward.
    const bend=new T.Vector3(0,0,leg.front?-1:1);
    bend.addScaledVector(direction,-bend.dot(direction)).normalize();
    const knee=hip.clone().addScaledVector(direction,along).addScaledVector(bend,height);
    pointJoint(leg.upper,leg.lower,knee);pointJoint(leg.lower,leg.paw,target);
    const parentQ=leg.paw.parent.getWorldQuaternion(new T.Quaternion()).invert();
    leg.paw.quaternion.copy(parentQ.multiply(rest.get(leg.paw).wq));leg.paw.updateMatrixWorld(true);
  }

  // Slow lateral-sequence walk: hind paw, same-side forepaw, then the other side.
  // The long support phase and short, low swing keep the body quiet and grounded.
  const spines=[0,1,2,3].map(i=>bone('c_spine_0'+i));
  const scapulas=['l','r'].map(side=>bone(side+'_scapula_00'));
  const yAxis=new T.Vector3(0,1,0),xAxis=new T.Vector3(1,0,0),zAxis=new T.Vector3(0,0,1);
  function rotateWorld(joint,axis,angle){
    const parentQ=joint.parent.getWorldQuaternion(new T.Quaternion());
    joint.quaternion.premultiply(parentQ.clone().invert().multiply(new T.Quaternion().setFromAxisAngle(axis,angle)).multiply(parentQ));
    joint.updateMatrixWorld(true);
  }
  function translateWorld(joint,delta){
    joint.position.copy(joint.parent.worldToLocal(world(joint).add(delta)));
    joint.updateMatrixWorld(true);
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let raf=0,disposed=false,last=0,elapsed=0;
  function draw(time=0,walking=true){
    for(const [node,r] of rest){node.position.copy(r.p);node.quaternion.copy(r.q);node.scale.copy(r.s);}
    animal.rotation.set(0,0,0);
    const phase=time/3.2,cycle=phase*Math.PI*2,amount=walking?1:0;
    root.position.y+=amount*(.65*Math.cos(cycle*2)-.35);
    root.position.x+=amount*.8*Math.sin(cycle);
    model.updateMatrixWorld(true);
    rotateWorld(root,zAxis,amount*.012*Math.sin(cycle));
    spines.forEach((joint,i)=>rotateWorld(joint,yAxis,amount*.012*Math.sin(cycle-i*.55)));
    for(const [i,scapula] of scapulas.entries()){
      const roll=cycle+i*Math.PI;
      translateWorld(scapula,new T.Vector3(0,amount*.012*Math.sin(roll),amount*.022*Math.cos(roll)));
      rotateWorld(scapula,xAxis,amount*.055*Math.cos(roll));
    }
    for(const leg of legs){
      const p=(phase+leg.phase)%1,stance=.68;
      let stride=0,lift=0,toe=0;
      if(p<stance){stride=.19-.38*p/stance;}
      else {
        const swing=(p-stance)/(1-stance);
        stride=-.19+.38*smooth(swing);
        lift=.095*Math.pow(Math.sin(Math.PI*swing),1.25);
        toe=.20*Math.sin(Math.PI*swing);
      }
      const target=leg.origin.clone();
      target.z+=amount*stride;target.y+=amount*lift;
      // Shoulder and hip joints lead the reaching limb; the skin follows the rig.
      translateWorld(leg.upper,new T.Vector3(0,amount*.007*Math.cos((p-.1)*Math.PI*2),amount*.012*Math.sin(p*Math.PI*2)));
      placePaw(leg,target);
      rotateWorld(leg.paw,xAxis,-toe*amount);
    }
    // Counter-motion through neck/head keeps the gaze steady as weight transfers.
    rotateWorld(neck,xAxis,amount*.025*Math.sin(cycle*2+.6));
    rotateWorld(head,xAxis,-amount*.018*Math.sin(cycle*2+.6));
    rotateWorld(neck,yAxis,amount*(.025*Math.sin(time*.7)+.045*Math.pow(Math.max(0,Math.sin(time*.32)),6)));
    tail.forEach((joint,i)=>{
      rotateWorld(joint,yAxis,amount*(.07+i*.008)*Math.sin(time*2.1-i*.48));
      rotateWorld(joint,xAxis,amount*.05*Math.sin(time*2.1-i*.48+.8));
    });
    spine.scale.y*=1+.003*Math.sin(time*1.4)*amount;
    model.updateMatrixWorld(true);renderer.render(scene,camera);
    host.dataset.pose=walking?'walking':'standing';
    host.dataset.phase=(phase%1).toFixed(3);
    host.dataset.facing='right';
  }
  function tick(now){
    if(disposed)return;
    if(!document.hidden){elapsed+=last?Math.min((now-last)/1000,.06):0;draw(elapsed);}
    last=now;raf=requestAnimationFrame(tick);
  }
  function motionChanged(){
    cancelAnimationFrame(raf);last=0;
    draw(elapsed,!reduced.matches);
    if(!reduced.matches)raf=requestAnimationFrame(tick);
  }
  reduced.addEventListener('change',motionChanged);motionChanged();
  return {draw,dispose(){disposed=true;cancelAnimationFrame(raf);reduced.removeEventListener('change',motionChanged);renderer.dispose();}};
}
