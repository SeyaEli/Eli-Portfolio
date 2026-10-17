document.querySelectorAll('.service-explorer').forEach(explorer=>{
  const tabs=[...explorer.querySelectorAll('.service-tab')];
  const panels=[...explorer.querySelectorAll('.service-panel')];
  const tablist=explorer.querySelector('.service-tabs');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:800px)');
  let current=-1;
  const pending=new Map();
  const animate=(element,keyframes,options)=>reduced.matches?null:element.animate(keyframes,options);
  const orientation=()=>tablist.setAttribute('aria-orientation',mobile.matches?'horizontal':'vertical');
  tablist.setAttribute('role','tablist');orientation();mobile.addEventListener('change',orientation);
  panels.forEach((panel,i)=>{panel.setAttribute('role','tabpanel');panel.setAttribute('tabindex','0');tabs[i].setAttribute('role','tab');tabs[i].setAttribute('aria-controls',panel.id)});
  const activate=(index,focus=false)=>{
    if(index===current){if(focus)tabs[index].focus();return}
    if(current>=0){pending.get(panels[current])?.();panels[current].getAnimations({subtree:true}).forEach(animation=>animation.cancel())}
    current=index;
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index});
    if(focus)tabs[index].focus({preventScroll:true});
    animate(panels[index],[{opacity:.45,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.2,.7,.2,1)'});
    // Refresh the home page's scroll measurements when the service content changes height.
    requestAnimationFrame(()=>window.ScrollTrigger?.refresh());
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',event=>{event.preventDefault();activate(index)});
    tab.addEventListener('keydown',event=>{
      const keys=['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End',' '];
      if(!keys.includes(event.key))return;event.preventDefault();
      let next=index;
      if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%tabs.length;
      if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
      activate(next,true);
    });
  });
  explorer.classList.add('is-enhanced');
  reduced.addEventListener('change',()=>{if(reduced.matches)explorer.getAnimations({subtree:true}).forEach(animation=>animation.cancel())});
  const initial=panels.findIndex(panel=>`#${panel.id}`===location.hash);
  activate(initial>=0?initial:0);
  window.addEventListener('hashchange',()=>{const index=panels.findIndex(panel=>`#${panel.id}`===location.hash);if(index>=0)activate(index)});

  panels.forEach(panel=>{
    const art=panel.querySelector('.service-art');
    const stage=panel.querySelector('.service-stage');
    const button=panel.querySelector('.demo-action');
    const status=panel.querySelector('.demo-status');
    const buttonText=text=>{button.firstChild.textContent=text};
    let step=0;
    button.addEventListener('click',()=>{
      if(button.getAttribute('aria-disabled')==='true')return;
      const type=button.dataset.demo;
      if(type==='web'){
        const isMobile=art.classList.toggle('is-mobile');
        button.setAttribute('aria-pressed',String(isMobile));
        buttonText(isMobile?'Try desktop view':'Try mobile view');
        status.textContent=isMobile?'Same workspace. A smaller screen.':'A layout that adapts.';
      }
      if(type==='systems'){
        step=(step+1)%4;
        panel.querySelectorAll('.demo-node').forEach((node,i)=>node.classList.toggle('is-active',step>0&&i===step-1));
        status.textContent=['Ready to receive a request.','Request recorded.','Assigned for review.','Resolved, with a clear record.'][step];
        buttonText(['Route a request','Assign for review','Resolve request','Start another request'][step]);
      }
      if(type==='deployment'){
        step=(step+1)%4;art.dataset.release=step;
        panel.querySelectorAll('[data-release-step]').forEach((node,i)=>node.classList.toggle('is-complete',i<step));
        status.textContent=['A release, one step at a time.','Checks passed in this illustration.','Build prepared in this illustration.','Release is live in this illustration.'][step];
        buttonText(['Start a release','Build release','Deploy release','Reset illustration'][step]);
      }
      if(type==='api'){
        const packet=panel.querySelector('.request-packet');
        const response=panel.querySelector('.demo-response code');
        const nodes=[...panel.querySelectorAll('.demo-node')];
        let timer,animation;
        const complete=()=>{
          nodes.forEach(node=>node.classList.add('is-active'));response.textContent='200 OK · Sample response';
          status.textContent='Round trip complete. No data was sent.';button.removeAttribute('aria-disabled');buttonText('Send again');pending.delete(panel);
        };
        if(reduced.matches){complete();return}
        button.setAttribute('aria-disabled','true');buttonText('Sending…');status.textContent='Following a sample request and response.';
        response.textContent='Waiting for response';nodes.forEach(node=>node.classList.remove('is-active'));
        animation=animate(packet,[{opacity:0,transform:'translateX(0)'},{opacity:1,offset:.15},{opacity:1,transform:`translateX(${art.clientWidth*.65}px)`,offset:.5},{opacity:1,transform:'translateX(0)',offset:.9},{opacity:0,transform:'translateX(0)'}],{duration:1100,easing:'ease-in-out'});
        timer=setTimeout(complete,1100);
        pending.set(panel,()=>{clearTimeout(timer);animation?.cancel();response.textContent='Ready to connect';status.textContent='Illustrated request; no data is sent.';button.removeAttribute('aria-disabled');buttonText('Send sample request');pending.delete(panel)});
      }
    });
    if(button.dataset.demo==='web')button.setAttribute('aria-pressed','false');
    const resetTilt=()=>{art.style.removeProperty('--scene-x');art.style.removeProperty('--scene-y')};
    stage.addEventListener('pointermove',event=>{
      if(reduced.matches||event.pointerType==='touch')return;
      const r=stage.getBoundingClientRect();
      art.style.setProperty('--scene-x',`${-((event.clientY-r.top)/r.height-.5)*7}deg`);
      art.style.setProperty('--scene-y',`${((event.clientX-r.left)/r.width-.5)*10}deg`);
    });
    stage.addEventListener('pointerleave',resetTilt);
    reduced.addEventListener('change',()=>{resetTilt();pending.get(panel)?.()});
  });
});
