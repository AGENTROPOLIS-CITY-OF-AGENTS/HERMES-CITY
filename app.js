import * as THREE from "./assets/three.module.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const html = document.documentElement;
const tierButtons = [...document.querySelectorAll("[data-tier]")];

function setTier(tier){
  html.dataset.tier = tier;
  tierButtons.forEach((b)=>b.classList.toggle("active", b.dataset.tier === tier));
  localStorage.setItem("agentropolis-tier", tier);
}
const saved = localStorage.getItem("agentropolis-tier");
if (saved && ["full","adaptive","lite","minimum"].includes(saved)) setTier(saved);
tierButtons.forEach((b)=>b.addEventListener("click",()=>setTier(b.dataset.tier)));

function fallback(){
  const canvas=document.querySelector("#globe3d");
  if(canvas) canvas.style.display="none";
}

function createGlobe(){
  const canvas=document.querySelector("#globe3d");
  if(!canvas || html.dataset.tier==="minimum") return fallback();
  let renderer;
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:html.dataset.tier!=="lite"});
  }catch(e){return fallback();}
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);
  camera.position.set(0,1.2,9.5);

  renderer.setPixelRatio(Math.min(devicePixelRatio,html.dataset.tier==="full"?1.8:1.25));
  renderer.setSize(innerWidth,innerHeight);

  const group=new THREE.Group(); scene.add(group);
  const globe=new THREE.Mesh(
    new THREE.SphereGeometry(2.45, html.dataset.tier==="lite"?24:48, html.dataset.tier==="lite"?16:32),
    new THREE.MeshStandardMaterial({color:0x071118,metalness:.58,roughness:.55,emissive:0x06252a,emissiveIntensity:.35,wireframe:false})
  );
  group.add(globe);

  const wire=new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(2.48,24,16)),
    new THREE.LineBasicMaterial({color:0x19e6e6,transparent:true,opacity:.18})
  );
  group.add(wire);

  const ring=new THREE.Mesh(
    new THREE.TorusGeometry(3.45,.012,8,180),
    new THREE.MeshBasicMaterial({color:0x19e6e6,transparent:true,opacity:.32})
  );
  ring.rotation.x=Math.PI/2.6; ring.rotation.z=.35; group.add(ring);

  const nodes=[
    ["HERMES CITY",new THREE.Vector3(2.2,.8,1.3),0x19e6e6],
    ["CREATOR CORE",new THREE.Vector3(-1.6,1.7,1.6),0x19e6e6],
    ["AGENT MCP",new THREE.Vector3(-2.15,-.5,1.2),0x19e6e6],
    ["WORLDQ",new THREE.Vector3(.1,-2.2,1.5),0x19e6e6],
    ["AQUADUCT",new THREE.Vector3(1.2,1.9,-1.5),0x19e6e6],
    ["GAMING",new THREE.Vector3(-1.5,-1.4,-1.6),0x19e6e6]
  ];
  nodes.forEach(([name,pos,color],i)=>{
    const m=new THREE.Mesh(new THREE.SphereGeometry(i===0?.14:.08,12,12),new THREE.MeshBasicMaterial({color}));
    m.position.copy(pos); group.add(m);
    if(i===0){
      const pulse=new THREE.Mesh(new THREE.TorusGeometry(.26,.016,8,40),new THREE.MeshBasicMaterial({color:0x19e6e6,transparent:true,opacity:.6}));
      pulse.position.copy(pos); pulse.lookAt(camera.position); group.add(pulse);
    }
  });

  const starsGeo=new THREE.BufferGeometry();
  const count=html.dataset.tier==="lite"?120:360;
  const positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*44;positions[i*3+1]=(Math.random()-.5)*30;positions[i*3+2]=(Math.random()-.5)*30;}
  starsGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));
  scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x19e6e6,size:.025,transparent:true,opacity:.45})));

  scene.add(new THREE.AmbientLight(0xbad7e8,.65));
  const key=new THREE.PointLight(0x19e6e6,55,30); key.position.set(4,5,6); scene.add(key);
  const risk=new THREE.PointLight(0xff2a2a,18,22); risk.position.set(-5,-2,3); scene.add(risk);

  const clock=new THREE.Clock();
  function render(){
    const t=clock.getElapsedTime();
    group.rotation.y=reduced?-.65:-.65+t*.055;
    group.rotation.x=-.09;
    renderer.render(scene,camera);
    if(!reduced) requestAnimationFrame(render);
  }
  render();

  addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
}

addEventListener("load",createGlobe);
