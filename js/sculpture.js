import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const art = document.querySelector('.hero-art');
const viewport = art?.querySelector('.sculpture-viewport');
const canvas = art?.querySelector('.sculpture-canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function createSculpture() {
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 60);
  camera.position.set(0, .15, 7.6);
  camera.lookAt(0, 0, 0);

  // A generated studio environment supplies long, natural reflections on the bevels.
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .85;
  room.dispose();
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xfff5ff, 2.5);
  key.position.set(-3, 5, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb5a1f2, 3.5);
  rim.position.set(4, 1, -3);
  scene.add(rim, new THREE.HemisphereLight(0xffffff, 0x746387, .85));

  // The same closed outline is used for every layer, so the assembled E reads as one object.
  const points = [
    [-1.3,-1.6],[1.3,-1.6],[1.3,-.96],[-.52,-.96],[-.52,-.32],
    [1.02,-.32],[1.02,.32],[-.52,.32],[-.52,.96],[1.3,.96],[1.3,1.6],[-1.3,1.6]
  ].map(p=>new THREE.Vector2(...p));
  const shape = new THREE.Shape();
  points.forEach((point,i)=>{
    const prev = points[(i+points.length-1)%points.length];
    const next = points[(i+1)%points.length];
    const inPoint = point.clone().lerp(prev, .10 / point.distanceTo(prev));
    const outPoint = point.clone().lerp(next, .10 / point.distanceTo(next));
    if(i===0) shape.moveTo(inPoint.x,inPoint.y); else shape.lineTo(inPoint.x,inPoint.y);
    shape.quadraticCurveTo(point.x,point.y,outPoint.x,outPoint.y);
  });
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth:.21, steps:1, curveSegments:10, bevelEnabled:true,
    bevelThickness:.065, bevelSize:.065, bevelSegments:5
  });
  geometry.center();
  const materials = [
    new THREE.MeshPhysicalMaterial({color:0xbca2dd, metalness:.55, roughness:.24, clearcoat:1, clearcoatRoughness:.16, iridescence:.18, iridescenceIOR:1.3, iridescenceThicknessRange:[160,280]}),
    new THREE.MeshPhysicalMaterial({color:0x837095, metalness:.82, roughness:.26, clearcoat:.65}),
    new THREE.MeshPhysicalMaterial({color:0xb5a8cb, metalness:.9, roughness:.2, clearcoat:.8})
  ];
  const group = new THREE.Group();
  const layers = materials.map((material,i)=>{
    const mesh = new THREE.Mesh(geometry,material);
    mesh.position.z = (1-i)*.35;
    group.add(mesh);
    return mesh;
  });
  scene.add(group);

  // A restrained contact shadow grounds the floating mark without an expensive shadow pass.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64,64,2,64,64,64);
  gradient.addColorStop(0,'rgba(48,37,69,.27)');
  gradient.addColorStop(.45,'rgba(48,37,69,.12)');
  gradient.addColorStop(1,'rgba(48,37,69,0)');
  ctx.fillStyle = gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.5,1.1),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));
  shadow.position.set(.15,-2.1,-.8);
  scene.add(shadow);

  const state = {yaw:0,pitch:0,pointerX:0,pointerY:0,split:0,scroll:Number(document.querySelector('.hero').dataset.sceneProgress||0),finish:'pearl'};
  const actual = {yaw:0,pitch:0,split:reduced.matches?0:.6,scroll:state.scroll,pointerX:0,pointerY:0};
  let raf=0, previous=performance.now(), visible=true, disposed=false, contextLost=false, dragging=false, pointerId=null;
  let lastX=0,lastY=0, drift=0, stillFrames=0;
  const status = art.querySelector('.sculpture-status');
  const layersButton = art.querySelector('.layers-toggle');
  const wake = () => {if(!raf&&!disposed&&!contextLost&&visible&&!document.hidden){previous=performance.now();raf=requestAnimationFrame(render)}};
  function render(now) {
    raf=0;
    if(disposed||contextLost||!visible||document.hidden)return;
    const dt = Math.min((now-previous)/1000,.05);previous=now;
    const ease = reduced.matches?1:1-Math.exp(-dt*9);
    const targetSplit = Math.max(state.split, state.scroll);
    const changes = Math.abs(actual.yaw-state.yaw)+Math.abs(actual.pitch-state.pitch)+Math.abs(actual.split-targetSplit)+Math.abs(actual.scroll-state.scroll)+Math.abs(actual.pointerX-state.pointerX)+Math.abs(actual.pointerY-state.pointerY);
    actual.yaw += (state.yaw-actual.yaw)*ease;
    actual.pitch += (state.pitch-actual.pitch)*ease;
    actual.split += (targetSplit-actual.split)*ease;
    actual.scroll += (state.scroll-actual.scroll)*ease;
    actual.pointerX += (state.pointerX-actual.pointerX)*ease;
    actual.pointerY += (state.pointerY-actual.pointerY)*ease;
    // Idle movement stops after a brief settling moment; the scene runs on demand thereafter.
    if(!reduced.matches) drift += dt;
    const settle = reduced.matches?0:Math.sin(Math.min(drift,Math.PI)*2)*Math.max(0,1-drift/Math.PI)*.055;
    group.rotation.set(.12+actual.pitch+actual.pointerY*.04, -.38+actual.yaw+actual.pointerX*.08-actual.split*.35-actual.scroll*.12, -.10+actual.scroll*.16);
    group.position.set(actual.scroll*.10, .10+settle, 0);
    layers.forEach((mesh,i)=>{
      const offset=1-i;
      mesh.position.z=offset*(.35+actual.split*.95);
      mesh.position.x=-offset*actual.split*.46;
      mesh.position.y=offset*actual.split*.18;
      mesh.rotation.y=offset*actual.split*.055;
    });
    camera.position.z=7.6+actual.split*1.1;
    key.position.x=-3+actual.pointerX*1.8;
    key.position.y=5-actual.pointerY;
    shadow.material.opacity=1-actual.scroll*.8;
    renderer.render(scene,camera);
    if(changes<.0005)stillFrames++;else stillFrames=0;
    if((!reduced.matches&&(drift<Math.PI||stillFrames<3))||dragging) wake();
  }
  const resize = () => {
    const {width,height}=viewport.getBoundingClientRect();
    if(!width||!height)return;
    camera.aspect=width/height;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);wake();
  };
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0}}, {rootMargin:'100px'});
  intersection.observe(viewport);
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()};
  document.addEventListener('visibilitychange',onVisibility);
  const onScroll=event=>{state.scroll=event.detail;wake()};
  window.addEventListener('portfolio:hero-progress',onScroll);
  const onReduced=()=>{state.pointerX=state.pointerY=0;wake()};
  reduced.addEventListener('change',onReduced);
  const onDown=event=>{
    if(!event.isPrimary||event.button!==0)return;
    dragging=true;pointerId=event.pointerId;lastX=event.clientX;lastY=event.clientY;
    viewport.setPointerCapture(pointerId);viewport.classList.add('is-dragging');wake();
  };
  const onMove=event=>{
    if(dragging&&event.pointerId===pointerId){
      state.yaw+=(event.clientX-lastX)*.008;
      state.pitch=THREE.MathUtils.clamp(state.pitch+(event.clientY-lastY)*.006,-.65,.65);
      lastX=event.clientX;lastY=event.clientY;
    }else if(!reduced.matches&&event.pointerType!=='touch'){
      const r=viewport.getBoundingClientRect();
      state.pointerX=(event.clientX-r.left)/r.width*2-1;
      state.pointerY=(event.clientY-r.top)/r.height*2-1;
    }
    wake();
  };
  const onUp=()=>{dragging=false;pointerId=null;viewport.classList.remove('is-dragging');wake()};
  const onLeave=()=>{if(!dragging){state.pointerX=state.pointerY=0;wake()}};
  const reset=()=>{state.yaw=state.pitch=state.pointerX=state.pointerY=state.split=0;layersButton.setAttribute('aria-pressed','false');layersButton.textContent='Separate layers';status.textContent='Sculpture view reset.';wake()};
  const onKey=event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='Home'){reset();return}
    state.yaw+=(event.key==='ArrowRight'?.22:event.key==='ArrowLeft'?-.22:0);
    state.pitch=THREE.MathUtils.clamp(state.pitch+(event.key==='ArrowDown'?.15:event.key==='ArrowUp'?-.15:0),-.65,.65);wake();
  };
  const toggleLayers=()=>{state.split=state.split?0:1;layersButton.setAttribute('aria-pressed',String(Boolean(state.split)));layersButton.textContent=state.split?'Join layers':'Separate layers';status.textContent=state.split?'Three layers separated.':'Layers joined. Scroll position also controls their separation.';wake()};
  const finishes = {
    pearl: [{color:0xbca2dd,metalness:.55,roughness:.24},{color:0x837095,metalness:.82,roughness:.26},{color:0xb5a8cb,metalness:.9,roughness:.2}],
    titanium: [{color:0xaab3c4,metalness:.96,roughness:.19},{color:0x343746,metalness:.9,roughness:.25},{color:0xd8dbe4,metalness:.95,roughness:.17}]
  };
  const finishClick=event=>{
    const button=event.target.closest('[data-finish]');if(!button)return;
    state.finish=button.dataset.finish;
    finishes[state.finish].forEach((finish,i)=>{materials[i].color.setHex(finish.color);materials[i].metalness=finish.metalness;materials[i].roughness=finish.roughness;materials[i].iridescence=state.finish==='pearl'&&i===0?.18:0});
    art.querySelectorAll('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    status.textContent=`${button.textContent.trim()} finish selected.`;wake();
  };
  viewport.addEventListener('pointerdown',onDown);viewport.addEventListener('pointermove',onMove);
  viewport.addEventListener('pointerup',onUp);viewport.addEventListener('pointercancel',onUp);viewport.addEventListener('lostpointercapture',onUp);
  viewport.addEventListener('pointerleave',onLeave);viewport.addEventListener('keydown',onKey);
  layersButton.addEventListener('click',toggleLayers);
  art.querySelector('.reset-sculpture').addEventListener('click',reset);
  art.querySelector('.finish-picker').addEventListener('click',finishClick);
  const loseContext=event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(raf);raf=0;art.classList.remove('has-webgl');art.dataset.sculptureState='fallback';status.textContent='3D preview is unavailable; a simplified sculpture is shown.'};
  const restoreContext=()=>{contextLost=false;art.classList.add('has-webgl');art.dataset.sculptureState='ready';wake()};
  canvas.addEventListener('webglcontextlost',loseContext);canvas.addEventListener('webglcontextrestored',restoreContext);
  const dispose=()=>{
    disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();intersection.disconnect();
    window.removeEventListener('portfolio:hero-progress',onScroll);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onReduced);
    geometry.dispose();materials.forEach(m=>m.dispose());shadow.geometry.dispose();shadow.material.dispose();shadowTexture.dispose();environment.dispose();renderer.dispose();
  };
  window.addEventListener('pagehide',event=>{if(!event.persisted)dispose()});
  art.classList.add('has-webgl');art.dataset.sculptureState='ready';
  resize();wake();
}

if(art&&canvas){try{createSculpture()}catch{art.dataset.sculptureState='fallback';art.classList.remove('has-webgl')}}
