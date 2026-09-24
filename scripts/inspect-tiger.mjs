import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('qa/tiger-rig',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:600,height:400}});
page.on('console',m=>console.log(m.type(),m.text()));
await page.goto('http://127.0.0.1:4173/');
await page.evaluate(async()=>{
 document.body.innerHTML='';document.body.style.margin='0';
 const im=document.createElement('script');im.type='importmap';im.textContent=JSON.stringify({imports:{three:'/vendor/three/three.module.js'}});document.head.append(im);
 const T=await import('/vendor/three/three.module.js');const {GLTFLoader}=await import('/vendor/three/GLTFLoader.js');
 const g=await new GLTFLoader().loadAsync('/assets/tiger-rig.glb');
 const scene=new T.Scene();scene.background=new T.Color('white');scene.add(g.scene);
 const mixer=new T.AnimationMixer(g.scene);mixer.clipAction(g.animations[0]).play();mixer.setTime(0);scene.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(g.scene);const size=box.getSize(new T.Vector3());const center=box.getCenter(new T.Vector3());
 const camera=new T.OrthographicCamera(-size.length()*.55,size.length()*.55,size.length()*.367,-size.length()*.367,.01,10000);camera.position.copy(center).add(new T.Vector3(5,1,0));camera.lookAt(center);
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(600,400);document.body.append(renderer.domElement);
 scene.add(new T.HemisphereLight(0xffffff,0x999999,3));
 const light=new T.DirectionalLight(0xffffff,3);light.position.set(4,8,6);scene.add(light);
 window.rig={T,g,scene,mixer,camera,renderer,center,size};
 window.renderTime=(time,axis='x')=>{mixer.setTime(time);scene.updateMatrixWorld(true);camera.position.copy(center).add(axis==='x'?new T.Vector3(5,1,0):new T.Vector3(0,1,5));camera.lookAt(center);renderer.render(scene,camera);};
 renderTime(0);
});
const info=await page.evaluate(()=>({size:rig.size,center:rig.center,animations:rig.g.animations.map(a=>({name:a.name,duration:a.duration})),bones:(()=>{let o=[];rig.g.scene.traverse(n=>{if(n.isBone)o.push({name:n.name,position:n.position.toArray(),world:n.getWorldPosition(new rig.T.Vector3()).toArray(),rotation:n.rotation.toArray()});});return o;})()}));
await writeFile('qa/tiger-rig/info.json',JSON.stringify(info,null,2));
for(const time of [0,1,3,6,9,12,18,24,30,36,37,38,39]){await page.evaluate(t=>window.renderTime(t),time);await page.screenshot({path:`qa/tiger-rig/${time}.png`});}
await page.evaluate(()=>window.renderTime(0,'z'));await page.screenshot({path:'qa/tiger-rig/front.png'});
await browser.close();console.log(JSON.stringify({size:info.size,center:info.center,animations:info.animations}));
