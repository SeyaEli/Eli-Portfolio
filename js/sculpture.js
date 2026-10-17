import * as THREE from 'three';
import {createLaptop} from './laptop.js';
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
  camera.position.set(0, 2.4, 7.6);
  camera.lookAt(0, .12, 0);

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

  const laptop = createLaptop();
  const group = laptop.group;
  scene.add(group);
  const introElement = document.querySelector('.entry-intro');
  const introCanvas = document.querySelector('.entry-laptop-canvas');
  let introRenderer;
  const introCamera = new THREE.PerspectiveCamera(35,1,.1,60);
  introCamera.position.set(0,1.9,5.8);introCamera.lookAt(0,.15,0);
  try {
    introRenderer = new THREE.WebGLRenderer({canvas:introCanvas,alpha:true,antialias:true,powerPreference:'low-power'});
    introRenderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
    introRenderer.outputColorSpace=THREE.SRGBColorSpace;
    introRenderer.toneMapping=THREE.ACESFilmicToneMapping;introRenderer.toneMappingExposure=1.08;
    introElement.classList.add('has-laptop-preview');
    introCanvas.addEventListener('webglcontextlost',()=>introElement.classList.remove('has-laptop-preview'));
  } catch { /* The vector laptop remains visible when a second context is unavailable. */ }
  const introActive=()=>Boolean(introRenderer && document.documentElement.classList.contains('intro-active'));

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

  const state = {yaw:0,pitch:0,pointerX:0,pointerY:0,split:0,scroll:Number(document.querySelector('.hero').dataset.sceneProgress||0),finish:'eclipse'};
  const actual = {yaw:0,pitch:0,split:0,scroll:state.scroll,pointerX:0,pointerY:0};
  let raf=0, previous=performance.now(), visible=true, disposed=false, contextLost=false, dragging=false, pointerId=null;
  let lastX=0,lastY=0, downX=0,downY=0, drift=0, stillFrames=0;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const descriptions={display:['Display / Frontend','Clear interfaces built with React, Vue.js, and thoughtful interaction design.'],keyboard:['Keyboard / Interaction','Accessible forms, intuitive workflows, and the details that make software feel effortless.'],motherboard:['Motherboard / Backend','Laravel, APIs, and databases connecting the interface to the systems behind it.'],chassis:['Chassis / Delivery','Deployment, configuration, and practical support that keep an application working.']};
  function selectPart(name, separate=true){
    if(!descriptions[name])return;
    if(separate){state.split=1;layersButton.setAttribute('aria-pressed','true');layersButton.textContent='Join layers';}
    laptop.highlight(name);art.dataset.selectedPart=name;
    art.querySelectorAll('[data-part]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.part===name)));
    art.querySelector('.part-title').textContent=descriptions[name][0];
    art.querySelector('.part-description').textContent=descriptions[name][1];
    wake();
  }
  function pick(event){
    const bounds=viewport.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObject(group,true)[0];let object=hit?.object;
    while(object&&!object.userData.part)object=object.parent;return object?.userData.part;
  }
  const status = art.querySelector('.sculpture-status');
  const layersButton = art.querySelector('.layers-toggle');
  const wake = () => {if(!raf&&!disposed&&!contextLost&&(visible||introActive())&&!document.hidden){previous=performance.now();raf=requestAnimationFrame(render)}};
  function render(now) {
    raf=0;
    if(disposed||contextLost||(!visible&&!introActive())||document.hidden)return;
    const dt = Math.min((now-previous)/1000,.05);previous=now;
    const ease = reduced.matches?1:1-Math.exp(-dt*9);
    const scrollSplit=state.scroll<.75?Math.min(1,state.scroll/.55):1-THREE.MathUtils.smoothstep(state.scroll,.75,1);
    const targetSplit = Math.max(state.split, scrollSplit);
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
    laptop.pose(actual.split,1);
    camera.position.z=7.6+actual.split*3.2;
    camera.lookAt(0,.12+actual.split*.2,0);
    key.position.x=-3+actual.pointerX*1.8;
    key.position.y=5-actual.pointerY;
    shadow.material.opacity=1-actual.scroll*.8;
    renderer.render(scene,camera);
    art.dataset.explosion=actual.split.toFixed(3);
    if(introActive()) {
      const width=introCanvas.clientWidth,height=introCanvas.clientHeight;
      if(width && height) {
        if(introCanvas.width!==Math.round(width*introRenderer.getPixelRatio()) || introCanvas.height!==Math.round(height*introRenderer.getPixelRatio())) {
          introRenderer.setSize(width,height,false);introCamera.aspect=width/height;introCamera.updateProjectionMatrix();
        }
        const elapsed=(performance.now()-Number(introElement.dataset.started||performance.now()))/1000;
        const position=group.position.clone(),rotation=group.rotation.clone();
        laptop.pose(0,reduced.matches?1:THREE.MathUtils.smoothstep(elapsed,.25,2.9));
        group.position.set(0,-.05,0);group.rotation.set(.05,-.42+Math.min(elapsed/3,1)*.15,-.03);
        shadow.material.opacity=1;
        introRenderer.render(scene,introCamera);
        group.position.copy(position);group.rotation.copy(rotation);laptop.pose(actual.split,1);
      }
    }
    if(changes<.0005)stillFrames++;else stillFrames=0;
    if((!reduced.matches&&(drift<Math.PI||stillFrames<3))||dragging||introActive()) wake();
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
    dragging=true;pointerId=event.pointerId;lastX=downX=event.clientX;lastY=downY=event.clientY;
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
      const name=pick(event);if(name&&name!==art.dataset.selectedPart)selectPart(name,false);
    }
    wake();
  };
  const onUp=event=>{if(event.type==='pointerup'&&dragging&&Math.hypot(event.clientX-downX,event.clientY-downY)<7){const name=pick(event);if(name)selectPart(name);}dragging=false;pointerId=null;viewport.classList.remove('is-dragging');wake()};
  const onLeave=()=>{if(!dragging){state.pointerX=state.pointerY=0;wake()}};
  const reset=()=>{state.yaw=state.pitch=state.pointerX=state.pointerY=state.split=0;layersButton.setAttribute('aria-pressed','false');layersButton.textContent='Separate layers';status.textContent='Laptop view reset.';selectPart('display',false);wake()};
  const onKey=event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='Home'){reset();return}
    state.yaw+=(event.key==='ArrowRight'?.22:event.key==='ArrowLeft'?-.22:0);
    state.pitch=THREE.MathUtils.clamp(state.pitch+(event.key==='ArrowDown'?.15:event.key==='ArrowUp'?-.15:0),-.65,.65);wake();
  };
  const toggleLayers=()=>{state.split=state.split?0:1;layersButton.setAttribute('aria-pressed',String(Boolean(state.split)));layersButton.textContent=state.split?'Join layers':'Separate layers';status.textContent=state.split?'Four laptop assemblies separated. Select a part to explore.':'Layers joined. Scroll position also controls their separation.';wake()};
  const finishes = {
    eclipse: [{color:0x494051,metalness:.72,roughness:.27},{color:0x26222e,metalness:.72,roughness:.27},{color:0x655f70,metalness:.72,roughness:.27}],
    titanium: [{color:0xaab3c4,metalness:.96,roughness:.19},{color:0x343746,metalness:.9,roughness:.25},{color:0xd8dbe4,metalness:.95,roughness:.17}]
  };
  const finishClick=event=>{
    const button=event.target.closest('[data-finish]');if(!button)return;
    state.finish=button.dataset.finish;
    laptop.finish(finishes[state.finish]);
    art.querySelectorAll('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    status.textContent=`${button.textContent.trim()} finish selected.`;wake();
  };
  viewport.addEventListener('pointerdown',onDown);viewport.addEventListener('pointermove',onMove);
  viewport.addEventListener('pointerup',onUp);viewport.addEventListener('pointercancel',onUp);viewport.addEventListener('lostpointercapture',onUp);
  viewport.addEventListener('pointerleave',onLeave);viewport.addEventListener('keydown',onKey);
  layersButton.addEventListener('click',toggleLayers);
  art.querySelector('.part-picker').addEventListener('click',event=>{const button=event.target.closest('[data-part]');if(button)selectPart(button.dataset.part);});
  const onIntroStart=()=>wake();window.addEventListener('portfolio:intro-start',onIntroStart);
  art.querySelector('.reset-sculpture').addEventListener('click',reset);
  art.querySelector('.finish-picker').addEventListener('click',finishClick);
  const loseContext=event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(raf);raf=0;art.classList.remove('has-webgl');art.dataset.sculptureState='fallback';status.textContent='3D preview is unavailable; a simplified laptop is shown.'};
  const restoreContext=()=>{contextLost=false;art.classList.add('has-webgl');art.dataset.sculptureState='ready';wake()};
  canvas.addEventListener('webglcontextlost',loseContext);canvas.addEventListener('webglcontextrestored',restoreContext);
  const dispose=()=>{
    disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();intersection.disconnect();
    window.removeEventListener('portfolio:hero-progress',onScroll);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onReduced);
    window.removeEventListener('portfolio:intro-start',onIntroStart);laptop.dispose();introRenderer?.dispose();shadow.geometry.dispose();shadow.material.dispose();shadowTexture.dispose();environment.dispose();renderer.dispose();
  };
  window.addEventListener('pagehide',event=>{if(!event.persisted)dispose()});
  art.classList.add('has-webgl');art.dataset.sculptureState='ready';
  selectPart('display',false);resize();wake();
}

if(art&&canvas){try{createSculpture()}catch{art.dataset.sculptureState='fallback';art.classList.remove('has-webgl')}}
