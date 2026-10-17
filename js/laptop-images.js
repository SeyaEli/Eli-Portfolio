// Component masks and assembly paths come from the user-supplied animation.
(() => {
  const art=document.querySelector('.photo-art');
  if(!art)return;
  const stage=art.querySelector('.laptop-photo-stage');
  const slider=art.querySelector('input[type=range]');
  const toggle=art.querySelector('.layers-toggle');
  const hotspots=art.querySelector('.photo-hotspots');
  const layers=[...art.querySelectorAll('.assembly-layer')];
  const smooth=(a,b,value)=>{const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*(3-2*t);};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const descriptions={
    display:['Display','Where I design interfaces, review layouts, and see my code come to life.'],
    keyboard:['Keyboard','Where ideas turn into code, one line at a time.'],
    motherboard:['Motherboard','The hardware connecting the tools I use to build and run my projects.'],
    cooling:['Cooling','Keeps my coding sessions, local builds, and test runs moving.'],
    battery:['Battery','For taking my work beyond the desk and picking up where I left off.'],
    chassis:['Chassis','The frame that brings my everyday coding setup together.']
  };
  let current=0,target=0,manual=null,manualScroll=0,manualUntil=0,scrollProgress=0,raf=0,last=0;
  function paint(){
    stage.style.setProperty('--reveal',current.toFixed(4));
    const separation=smooth(0,1,current);
    const blend=smooth(.025,.23,current);
    stage.style.setProperty('--assembled-opacity',(1-blend).toFixed(4));
    stage.style.setProperty('--parts-opacity',blend.toFixed(4));
    layers.forEach(layer=>{
      const x=Number(layer.dataset.offsetX)*(1-separation),y=Number(layer.dataset.offsetY)*(1-separation);
      layer.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      layer.style.opacity=art.dataset.selectedPart && layer.dataset.layer!==art.dataset.selectedPart?'.24':'1';
    });
    art.dataset.explosion=current.toFixed(3);
    const expanded=current>.55;
    art.classList.toggle('is-exploded',expanded);
    // Transfer focus before disabling markers when the photo returns to assembled.
    if(!expanded && hotspots.contains(document.activeElement))toggle.focus({preventScroll:true});
    hotspots.inert=!expanded;
    toggle.setAttribute('aria-pressed',String(target>.5));
    toggle.innerHTML=target>.5?'Join layers <span aria-hidden="true">↙</span>':'Separate layers <span aria-hidden="true">↗</span>';
    slider.value=String(Math.round(current*100));
    slider.setAttribute('aria-valuetext',current<.02?'Assembled':current>.98?'Exploded':`${Math.round(current*100)}% exploded`);
    art.querySelector('.photo-state').textContent=current<.02?'Assembled':current>.98?'Exploded':target>=current?'Separating layers':'Assembling layers';
  }
  function frame(now){
    raf=0;
    const dt=Math.min((now-last)/1000,.05);last=now;
    current=reduced.matches?target:current+(target-current)*(1-Math.exp(-dt*5));
    if(Math.abs(current-target)<.001)current=target;
    paint();
    if(current!==target)raf=requestAnimationFrame(frame);
  }
  function wake(){
    if(reduced.matches){current=target;paint();return;}
    if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}
  }
  function setView(value){manual=value;manualScroll=scrollProgress;manualUntil=performance.now()+1200;target=value;wake();}
  function select(name){
    if(!descriptions[name])return;
    art.dataset.selectedPart=name;
    art.querySelectorAll('[data-part]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.part===name)));
    art.querySelector('.part-title').textContent=descriptions[name][0];
    art.querySelector('.part-description').textContent=descriptions[name][1];
    setView(1);
  }
  function reset(){
    delete art.dataset.selectedPart;
    art.querySelectorAll('[data-part]').forEach(button=>button.setAttribute('aria-pressed','false'));
    art.querySelector('.part-title').textContent='My everyday coding companion.';
    art.querySelector('.part-description').textContent='My tool for writing code, testing ideas, and bringing projects to life.';
    setView(0);
  }
  art.addEventListener('click',event=>{const button=event.target.closest('[data-part]');if(button)select(button.dataset.part);});
  toggle.addEventListener('click',()=>target>.5?reset():setView(1));
  art.querySelector('.reset-photo').addEventListener('click',reset);
  slider.addEventListener('input',()=>{
    cancelAnimationFrame(raf);raf=0;
    current=Number(slider.value)/100;
    manual=target=current;manualScroll=scrollProgress;manualUntil=performance.now()+1200;paint();
  });
  window.addEventListener('portfolio:hero-progress',event=>{
    const value=Number(event.detail);
    if(performance.now()>manualUntil && Math.abs(value-manualScroll)>.025)manual=null;
    scrollProgress=value;
    const scrollView=value<.4?Math.min(1,value/.4):value<.6?1:1-smooth(.6,.96,value);
    target=manual===null?scrollView:manual;wake();
  });
  window.addEventListener('wheel',()=>{manual=null;},{passive:true});
  window.addEventListener('touchmove',event=>{if(!event.target.closest('.photo-controls'))manual=null;},{passive:true});
  stage.addEventListener('pointermove',event=>{
    if(reduced.matches||event.pointerType==='touch')return;
    const r=stage.getBoundingClientRect();
    stage.style.setProperty('--photo-x',((event.clientX-r.left)/r.width-.5).toFixed(3));
    stage.style.setProperty('--photo-y',((event.clientY-r.top)/r.height-.5).toFixed(3));
  });
  stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--photo-x',0);stage.style.setProperty('--photo-y',0);});
  reduced.addEventListener('change',()=>{stage.style.setProperty('--photo-x',0);stage.style.setProperty('--photo-y',0);wake();});
  // No continuous animation, WebGL dependency, or simulated rotation of a flat image.
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;});
  window.addEventListener('pageshow',()=>{if(current!==target)wake();});
  art.classList.add('is-photo-enhanced');
  art.dataset.sculptureState='ready';
  paint();
})();
