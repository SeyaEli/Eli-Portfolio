import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Four meaningful assemblies, each independently movable and selectable.
export function createLaptop() {
  const group = new THREE.Group();
  const materials = [0x494051,0x26222e,0x655f70].map(color => new THREE.MeshPhysicalMaterial({color,metalness:.72,roughness:.27,clearcoat:.65}));
  const dark = new THREE.MeshStandardMaterial({color:0x26222e,roughness:.6});
  const boardMaterial = new THREE.MeshStandardMaterial({color:0x302545,metalness:.4,roughness:.4});
  const silver = new THREE.MeshStandardMaterial({color:0xd8dbe4,metalness:.8,roughness:.3});
  const keysMaterial = new THREE.MeshStandardMaterial({color:0x494051,roughness:.65});
  const parts = Object.fromEntries(['display','keyboard','motherboard','chassis'].map(name => {
    const part = new THREE.Group(); part.userData.part = name; group.add(part); return [name,part];
  }));
  const box = (parent,w,h,d,material,x=0,y=0,z=0,r=.04) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),material);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  };
  box(parts.chassis,3.55,.21,2.3,materials[2]);
  const lightbar = new THREE.MeshBasicMaterial({color:0xbca4df});
  box(parts.chassis,3.43,.022,.018,lightbar,0,-.03,1.157,.006);
  for(const x of [-1.78,1.78])box(parts.chassis,.018,.022,2.12,lightbar,x,-.03,0,.006);
  box(parts.chassis,3.45,.18,.25,materials[1],0,.03,-1.17);
  for(let i=0;i<26;i++)box(parts.chassis,.075,.09,.018,dark,-1.55+i*.124,.04,-1.304,.006);
  box(parts.chassis,.9,.025,.05,dark,0,.079,1.12);
  for(const x of [-1.35,1.35]) for(const z of [-.84,.84]) box(parts.chassis,.28,.035,.13,dark,x,-.085,z);
  // Ports and a charging indicator live on the side, not painted onto a flat plane.
  for(const z of [-.65,-.25,.2]) box(parts.chassis,.018,.055,.22,dark,-1.781,0,z,.01);
  box(parts.keyboard,3.5,.1,2.25,materials[0]);
  box(parts.keyboard,2.98,.025,1.02,dark,0,.06,-.34);
  const keyGeometry = new RoundedBoxGeometry(.205,.035,.166,2,.015);
  const keys = new THREE.InstancedMesh(keyGeometry,keysMaterial,65);
  const matrix = new THREE.Matrix4();
  for(let row=0;row<5;row++) for(let col=0;col<13;col++) {
    matrix.makeTranslation((col-6)*.222,.09,-.72+row*.19);keys.setMatrixAt(row*13+col,matrix);
  }
  parts.keyboard.add(keys);
  box(parts.keyboard,1.05,.014,.5,materials[1],0,.06,.65);
  for(const x of [-1.59,1.59]) for(let i=0;i<12;i++) box(parts.keyboard,.045,.006,.018,dark,x,.056,-.7+i*.07,.003);
  box(parts.motherboard,3.28,.055,2.03,boardMaterial);
  box(parts.motherboard,.65,.09,.65,silver,-.5,.07,-.3);
  box(parts.motherboard,.46,.02,.46,dark,-.5,.125,-.3);
  for(let i=0;i<2;i++) box(parts.motherboard,.74,.065,.18,dark,.6,.065,-.46+i*.3);
  for(let i=0;i<3;i++) box(parts.motherboard,.82,.08,.58,dark,-.95+i*.95,.07,.55);
  // Circuit traces are sparse geometry; no external model or texture request is needed.
  for(let i=0;i<9;i++) {
    box(parts.motherboard,1.2,.008,.012,silver,.22,.032,-.86+i*.09,.002);
    box(parts.motherboard,.012,.008,.5,silver,-1.28+i*.055,.032,-.25,.002);
  }
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.07,40),dark);
  fan.position.set(1.05,.08,-.45);parts.motherboard.add(fan);
  for(let i=0;i<9;i++) {
    const blade=box(parts.motherboard,.21,.012,.045,silver,1.05,.12,-.45,.01);
    blade.position.x+=Math.cos(i/9*Math.PI*2)*.13;blade.position.z+=Math.sin(i/9*Math.PI*2)*.13;blade.rotation.y=-i/9*Math.PI*2;
  }
  const lid = new THREE.Group();parts.display.add(lid);
  box(lid,3.48,2.29,.1,materials[0],0,1.145,0);
  for(let i=0;i<3;i++){const slash=box(lid,.025,1.4,.008,materials[1],-.95+i*.15,1.05,-.055,.002);slash.rotation.z=-.35;}
  const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=128;
  const labelContext=labelCanvas.getContext('2d');labelContext.fillStyle='#bca4df';labelContext.font='bold italic 62px Arial';labelContext.fillText('ROG STRIX',18,85);
  const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;
  const badge=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.3),new THREE.MeshBasicMaterial({map:labelTexture,transparent:true}));badge.position.set(.7,1.55,-.057);badge.rotation.y=Math.PI;lid.add(badge);
  box(lid,3.29,2.12,.016,dark,0,1.145,.058);
  const textureCanvas = document.createElement('canvas');textureCanvas.width=1024;textureCanvas.height=640;
  const ctx=textureCanvas.getContext('2d');
  ctx.fillStyle='#eeedf5';ctx.fillRect(0,0,1024,640);
  ctx.fillStyle='#26222e';ctx.font='bold 38px Arial';ctx.fillText('eli.',45,62);
  ctx.font='18px Arial';ctx.fillText('Projects     Services     About',650,53);
  ctx.font='20px Arial';ctx.fillText('John Eliseo Cea / Full stack developer',46,150);
  ctx.font='bold 66px Arial';ctx.fillText('Thoughtful code.',44,246);ctx.fillText('Meaningful experiences.',44,320);
  ctx.fillStyle='#574077';ctx.beginPath();ctx.roundRect(46,362,225,54,27);ctx.fill();
  ctx.fillStyle='#f8f7fb';ctx.font='20px Arial';ctx.fillText('Explore my work  ↗',69,397);
  for(let i=0;i<3;i++) {ctx.fillStyle=['#d9d0e8','#d2dfdc','#d4dce5'][i];ctx.beginPath();ctx.roundRect(46+i*315,464,295,100,8);ctx.fill();ctx.fillStyle='#655f70';ctx.font='18px Arial';ctx.fillText(['Web applications','Information systems','APIs & integrations'][i],63+i*315,520);}
  const screenTexture = new THREE.CanvasTexture(textureCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.12,1.95),new THREE.MeshBasicMaterial({map:screenTexture}));
  screen.position.set(0,1.145,.069);lid.add(screen);
  const cameraDot=new THREE.Mesh(new THREE.SphereGeometry(.018,12,8),dark);cameraDot.position.set(0,2.22,.065);lid.add(cameraDot);
  box(parts.display,2.9,.08,.1,materials[1],0,0,0);

  function pose(split=0,opening=1) {
    parts.display.position.set(0,-.48+split*.84,-1.04-split*.2);
    lid.rotation.x=THREE.MathUtils.lerp(Math.PI/2,-.18,opening);
    parts.keyboard.position.y=-.56+split*.34;
    parts.motherboard.position.y=-.635-split*.35;
    parts.chassis.position.y=-.76-split*1.1;
  }
  function highlight(name) {
    for(const [key,part] of Object.entries(parts)) part.traverse(object => {
      if(object.isMesh && object.material.emissive) {
        // Clone shared materials once so selecting a layer doesn't light every layer.
        if(!object.userData.selectionMaterial) {object.material=object.material.clone();object.userData.selectionMaterial=true;}
        object.material.emissive.setHex(key===name?0x574077:0x000000);
        object.material.emissiveIntensity=key===name?.3:0;
      }
    });
  }
  function finish(values) {
    for(const part of Object.values(parts)) part.traverse(object=>{
      if(!object.isMesh)return;
      const sourceIndex=materials.findIndex(material=>object.material===material || object.material.userData.finishIndex===materials.indexOf(material));
      if(sourceIndex<0)return;
      object.material.userData.finishIndex=sourceIndex;
      object.material.color.setHex(values[sourceIndex].color);object.material.metalness=values[sourceIndex].metalness;object.material.roughness=values[sourceIndex].roughness;
    });
  }
  // Preserve finish identity when the part-selection materials are cloned.
  materials.forEach((material,i)=>material.userData.finishIndex=i);
  pose();
  return {group,parts,pose,highlight,finish,dispose(){
    const geometries=new Set(),mats=new Set(materials);
    group.traverse(object=>{if(object.isMesh){geometries.add(object.geometry);mats.add(object.material);}});
    geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());screenTexture.dispose();labelTexture.dispose();
  }};
}
