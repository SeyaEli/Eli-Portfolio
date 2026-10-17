/* Native scrolling remains in charge; ScrollTrigger only maps its position to visuals. */
(() => {
  const {gsap, ScrollTrigger} = window;
  const hero = document.querySelector('.hero');
  const gallery = document.querySelector('.work-gallery');
  if (!gsap || !ScrollTrigger || !hero || !gallery) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize: true});
  const media = gsap.matchMedia();
  const desktop = '(min-width: 901px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)';
  let galleryAnimation;
  const sceneMotion = {progress:0};
  const updateScene = () => {
    hero.dataset.sceneProgress = sceneMotion.progress.toFixed(4);
    hero.classList.toggle('is-scene-dark',hero.classList.contains('scroll-stage') && sceneMotion.progress>.48);
    window.dispatchEvent(new CustomEvent('portfolio:hero-progress',{detail:sceneMotion.progress}));
  };

  media.add(desktop, () => {
    hero.classList.add('scroll-stage');
    gallery.classList.add('scroll-gallery');
    const heroCopy = hero.querySelector('.hero-copy');
    const heroTimeline = gsap.timeline({
      defaults: {ease: 'none'},
      scrollTrigger: {
        id: 'hero-story', trigger: hero, start: 'top top',
        end: () => `+=${innerHeight * 2}`, pin: true, scrub: .8,
        anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => { heroCopy.inert = self.progress > .45; }
      }
    });
    gsap.set('.hero-story', {autoAlpha: 0, yPercent: -38});
    gsap.set('.hero-shade', {opacity: 0});
    heroTimeline
      .to(sceneMotion, {progress:1,duration:1,onUpdate:updateScene}, 0)
      .to('.hero-copy', {y: -70, opacity: 0, duration: .35}, 0)
      .to('.hero-top', {opacity: 0, duration: .25}, 0)
      .to('.hero-shade', {opacity: 1, duration: .65}, .15)
      .to('.hero-story', {autoAlpha: 1, yPercent: -50, duration: .4}, .45)
      .to('.hero-progress span', {scaleX: 1, duration: 1}, 0);

    const track = gallery.querySelector('.gallery-track');
    const windowEl = gallery.querySelector('.gallery-window');
    const panels = [...gallery.querySelectorAll('.work-panel')];
    const steps = [...gallery.querySelectorAll('[data-project-index]')];
    const progress = gallery.querySelector('.gallery-progress span');
    const current = gallery.querySelector('.gallery-current');
    const distance = () => Math.max(0, track.scrollWidth - windowEl.clientWidth);
    let active = -1;
    const updatePosition = () => {
      if (!galleryAnimation) return;
      const value = galleryAnimation.progress();
      progress.style.transform = `scaleX(${value})`;
      const index = Math.round(value * (panels.length - 1));
      if (index !== active) {
        active = index;
        current.textContent = String(index + 1).padStart(2, '0');
        steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      }
    };
    galleryAnimation = gsap.to(track, {
      x: () => -distance(), ease: 'none', onUpdate: updatePosition,
      scrollTrigger: {
        id: 'project-gallery', trigger: gallery, start: 'top top',
        end: () => `+=${Math.max(1, distance() * 1.05)}`,
        pin: true, scrub: .85, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
    // Frames change perspective as they enter and leave the viewing area.
    panels.forEach(panel => {
      gsap.fromTo(panel.querySelector('.work-frame'),
        {rotationY: -6, rotationZ: .75, scale: .94},
        {rotationY: 6, rotationZ: -.75, scale: .98, ease: 'none',
          scrollTrigger: {trigger: panel, containerAnimation: galleryAnimation,
            start: 'left right', end: 'right left', scrub: true}});
    });
    const goTo = (index, instant = false) => {
      const trigger = galleryAnimation.scrollTrigger;
      const ratio = index / (panels.length - 1);
      window.scrollTo({top: trigger.start + (trigger.end - trigger.start) * ratio, behavior: instant ? 'instant' : 'smooth'});
      if (instant) {ScrollTrigger.update(); galleryAnimation.progress(ratio);}
    };
    const chooseProject = event => {
      const button = event.target.closest('[data-project-index]');
      if (button) goTo(Number(button.dataset.projectIndex));
    };
    // Dragging the gallery maps directly to native scroll. A short click still opens a project.
    let drag = null, suppressClick = false;
    const dragStart = event => {
      if(event.pointerType!=='mouse'||event.button!==0)return;
      suppressClick=false;
      drag={x:event.clientX,y:event.clientY,scroll:scrollY,id:event.pointerId,moved:false};
    };
    const dragMove = event => {
      if(!drag||event.pointerId!==drag.id)return;
      const dx=event.clientX-drag.x;
      if(!drag.moved&&Math.abs(dx)>8){drag.moved=true;windowEl.setPointerCapture(event.pointerId);gallery.classList.add('is-dragging')}
      if(!drag.moved)return;
      event.preventDefault();
      const st=galleryAnimation.scrollTrigger;
      const target=gsap.utils.clamp(st.start,st.end,drag.scroll-dx*(st.end-st.start)/Math.max(1,distance()));
      window.scrollTo({top:target,behavior:'instant'});
    };
    const dragEnd = () => {if(drag?.moved)suppressClick=true;drag=null;gallery.classList.remove('is-dragging')};
    const preventDragClick = event => {if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false}};
    const preventNativeDrag = event => event.preventDefault();
    const arrowNavigation = event => {
      if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
      event.preventDefault();
      const index=gsap.utils.clamp(0,steps.length-1,active+(event.key==='ArrowRight'?1:-1));
      goTo(index,true);steps[index].focus({preventScroll:true});
    };
    // Tabbing to an off-screen case study brings that project into view.
    const revealFocus = event => {
      const panel = event.target.closest('.work-panel');
      if (panel&&!drag) goTo(panels.indexOf(panel), true);
    };
    const skipHero = event => {
      const link = event.target.closest('a[href="#selected"]');
      if (!link) return;
      event.preventDefault();
      goTo(0, true);
      steps[0].focus({preventScroll: true});
    };
    gallery.addEventListener('click', chooseProject);
    windowEl.addEventListener('pointerdown',dragStart);
    windowEl.addEventListener('pointermove',dragMove);
    windowEl.addEventListener('pointerup',dragEnd);
    windowEl.addEventListener('pointercancel',dragEnd);
    windowEl.addEventListener('lostpointercapture',dragEnd);
    windowEl.addEventListener('click',preventDragClick,true);
    windowEl.addEventListener('dragstart',preventNativeDrag);
    gallery.querySelector('.gallery-steps').addEventListener('keydown',arrowNavigation);
    track.addEventListener('focusin', revealFocus);
    hero.addEventListener('click', skipHero);
    updatePosition();
    return () => {
      gallery.removeEventListener('click', chooseProject);
      windowEl.removeEventListener('pointerdown',dragStart);
      windowEl.removeEventListener('pointermove',dragMove);
      windowEl.removeEventListener('pointerup',dragEnd);
      windowEl.removeEventListener('pointercancel',dragEnd);
      windowEl.removeEventListener('lostpointercapture',dragEnd);
      windowEl.removeEventListener('click',preventDragClick,true);
      windowEl.removeEventListener('dragstart',preventNativeDrag);
      gallery.querySelector('.gallery-steps').removeEventListener('keydown',arrowNavigation);
      track.removeEventListener('focusin', revealFocus);
      hero.removeEventListener('click', skipHero);
      heroCopy.inert = false;
      hero.classList.remove('scroll-stage');
      gallery.classList.remove('scroll-gallery');
      progress.style.removeProperty('transform');
      galleryAnimation = undefined;
      sceneMotion.progress=0;updateScene();
    };
  });

  media.add('(prefers-reduced-motion: no-preference)', () => {
    if(scrollY<100 && !document.documentElement.classList.contains('intro-active')) gsap.from('.headline-line',{y:30,opacity:0,duration:.85,stagger:.11,ease:'power3.out'});
    const intro = document.querySelector('.intro-section');
    gsap.fromTo(intro.querySelectorAll('h2 span'), {opacity: .22, y: 35}, {
      opacity: 1, y: 0, stagger: .25, ease: 'none',
      scrollTrigger: {trigger: intro, start: 'top 75%', end: 'center 60%', scrub: .6}
    });
    gsap.to('.about-orbit', {rotation: 100, y: 100, ease: 'none',
      scrollTrigger: {trigger: intro, start: 'top bottom', end: 'bottom top', scrub: true}});
  });

  media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const cleanup=[];
    gallery.querySelectorAll('.work-visual').forEach(visual=>{
      const tilt=visual.querySelector('.frame-tilt');
      if(!tilt)return;
      const move=event=>{
        if(gallery.classList.contains('is-dragging'))return;
        const r=visual.getBoundingClientRect();
        tilt.style.setProperty('--tilt-x',`${-((event.clientY-r.top)/r.height-.5)*9}deg`);
        tilt.style.setProperty('--tilt-y',`${((event.clientX-r.left)/r.width-.5)*12}deg`);
      };
      const reset=()=>{tilt.style.removeProperty('--tilt-x');tilt.style.removeProperty('--tilt-y')};
      visual.addEventListener('pointermove',move);visual.addEventListener('pointerleave',reset);
      cleanup.push(()=>{visual.removeEventListener('pointermove',move);visual.removeEventListener('pointerleave',reset);reset()});
    });
    return ()=>cleanup.forEach(fn=>fn());
  });

  media.add('(max-width: 900px) and (prefers-reduced-motion: no-preference), (max-height: 719px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(sceneMotion,{progress:0},{progress:1,ease:'none',onUpdate:updateScene,
      scrollTrigger:{trigger:'.hero-art',start:'top 85%',end:'bottom top',scrub:.8}});
    gallery.querySelectorAll('.work-frame').forEach(frame => {
      gsap.fromTo(frame, {y: 20, rotationZ: 2, scale: .94}, {
        y: -12, rotationZ: -1, scale: 1, ease: 'none',
        scrollTrigger: {trigger: frame.closest('.work-visual'), start: 'top bottom', end: 'bottom top', scrub: .5}
      });
    });
  });

  let refreshFrame;
  const refresh = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete) {img.addEventListener('load', refresh, {once: true}); img.addEventListener('error', refresh, {once: true});}
  });
  window.addEventListener('load', refresh, {once: true});
  document.fonts?.ready.then(refresh);
  // Native details can change page height after the timelines have been measured.
  document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', refresh));
  refresh();
  document.documentElement.dataset.motionReady = 'true';
})();
