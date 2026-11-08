(() => {
  const {gsap,ScrollTrigger}=window;
  if(!gsap || !ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  const desktop='(min-width:1101px) and (min-height:900px) and (prefers-reduced-motion:no-preference)';
  const page=document.body.dataset.page;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  if(page==='Projects'){
    const section=document.querySelector('.projects-cinema');
    const cards=[...section.querySelectorAll('.project')];
    media.add(desktop,()=>{
      section.classList.add('is-project-pinned');
      const progress=section.querySelector('.project-scroll-line span');
      const previous=section.querySelector('[data-project-prev]');
      const next=section.querySelector('[data-project-next]');
      let timeline,visible=[],active=-1,filterFrame;
      const activate=index=>{
        if(index===active)return;
        active=index;
        cards.forEach(card=>{const selected=card===visible[index];card.inert=!selected;card.setAttribute('aria-hidden',String(!selected));card.getAnimations({subtree:true}).forEach(animation=>animation.cancel());gsap.set(card,{autoAlpha:selected?1:0,x:0,scale:1});});
        visible[index].querySelector('.project-image').animate([{opacity:.55,transform:'translate3d(48px,0,0) scale(.97)'},{opacity:1,transform:'translate3d(0,0,0) scale(1)'}],{duration:700,easing:'cubic-bezier(.22,1,.36,1)'});
        visible[index].querySelector('.project-meta').animate([{opacity:0,transform:'translateX(20px)'},{opacity:1,transform:'translateX(0)'}],{duration:500,easing:'ease-out'});
        section.querySelector('.project-current').textContent=String(index+1).padStart(2,'0');
        previous.disabled=index===0;next.disabled=index===visible.length-1;
      };
      const rebuild=()=>{
        timeline?.scrollTrigger?.kill();timeline?.kill();
        visible=cards.filter(card=>!card.hidden);active=-1;
        gsap.set(cards,{clearProps:'opacity,visibility,transform'});
        section.querySelector('.project-total').textContent=String(visible.length).padStart(2,'0');
        timeline=gsap.timeline({scrollTrigger:{id:'projects-cinema',trigger:section,start:'top top',
          end:()=>`+=${Math.max(1,visible.length-1)*innerHeight*.85}`,pin:true,scrub:.8,invalidateOnRefresh:true,
          onUpdate:self=>{activate(Math.round(self.progress*(visible.length-1)));progress.style.transform=`scaleX(${self.progress})`;}
        }});
        timeline.to({p:0},{p:1,duration:Math.max(1,visible.length-1),ease:'none'});
        active=-1;
        activate(0);ScrollTrigger.refresh();
      };
      const go=offset=>{
        const index=clamp(active+offset,0,visible.length-1),trigger=timeline.scrollTrigger;
        window.scrollTo({top:trigger.start+(visible.length===1?0:index/(visible.length-1))*(trigger.end-trigger.start),behavior:'smooth'});
      };
      const back=()=>go(-1),forward=()=>go(1);
      const filter=()=>{cancelAnimationFrame(filterFrame);filterFrame=requestAnimationFrame(()=>{
        const wasInStage=timeline.scrollTrigger.isActive;
        rebuild();if(wasInStage)window.scrollTo({top:timeline.scrollTrigger.start,behavior:'instant'});
      });};
      previous.addEventListener('click',back);next.addEventListener('click',forward);
      section.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',filter));
      rebuild();
      return ()=>{
        cancelAnimationFrame(filterFrame);timeline?.scrollTrigger?.kill();timeline?.kill();
        previous.removeEventListener('click',back);next.removeEventListener('click',forward);
        section.querySelectorAll('[data-filter]').forEach(button=>button.removeEventListener('click',filter));
        cards.forEach(card=>{card.getAnimations({subtree:true}).forEach(animation=>animation.cancel());card.inert=false;card.removeAttribute('aria-hidden');});
        gsap.set(cards,{clearProps:'opacity,visibility,transform'});
        section.classList.remove('is-project-pinned');progress.style.removeProperty('transform');
      };
    });
  }

  document.querySelectorAll('.service-explorer').forEach(explorer=>{
    const section=explorer.closest('.services-section');
    if(!section)return;
    const tabs=[...explorer.querySelectorAll('.service-tab')];
    media.add(desktop,()=>{
      section.classList.add('is-service-pinned');
      const rail=section.querySelector('.service-scroll-rail');
      let active=-1,manualUntil=0;
      const trigger=ScrollTrigger.create({id:'services-journey',trigger:section,start:'top top',
        end:()=>`+=${innerHeight*3.2}`,pin:true,invalidateOnRefresh:true,
        onUpdate:self=>{
          const index=clamp(Math.floor(self.progress*4),0,3);
          rail.querySelector('.service-scroll-line span').style.transform=`scaleX(${self.progress})`;
          if(index===active || performance.now()<manualUntil)return;
          active=index;
          explorer.dispatchEvent(new CustomEvent('portfolio:select-service',{detail:{index}}));
          rail.querySelector('.service-scroll-current').textContent=String(index+1).padStart(2,'0');
        }
      });
      const changed=event=>{
        const {index,source}=event.detail;active=index;
        rail.querySelector('.service-scroll-current').textContent=String(index+1).padStart(2,'0');
        if(source!=='user')return;
        manualUntil=performance.now()+250;
        window.scrollTo({top:trigger.start+(index+.2)/4*(trigger.end-trigger.start),behavior:'instant'});
      };
      explorer.addEventListener('portfolio:service-change',changed);
      const selected=tabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true');
      active=Math.max(0,selected);rail.querySelector('.service-scroll-current').textContent=String(active+1).padStart(2,'0');
      ScrollTrigger.refresh();
      return ()=>{explorer.removeEventListener('portfolio:service-change',changed);trigger.kill();section.classList.remove('is-service-pinned');};
    });
  });

  const journey=document.querySelector('.about-journey');
  if(journey){
    const chapters=[...journey.querySelectorAll('.about-chapter')];
    const links=[...journey.querySelectorAll('[data-about-index]')];
    media.add(desktop,()=>{
      journey.classList.add('is-about-pinned');
      let active=-1;
      const activate=index=>{
        if(index===active)return;
        active=index;
        chapters.forEach((chapter,i)=>{chapter.inert=i!==index;chapter.setAttribute('aria-hidden',String(i!==index));chapter.getAnimations().forEach(animation=>animation.cancel());gsap.set(chapter,{autoAlpha:i===index?1:0,x:0});});
        chapters[index].animate([{opacity:0,transform:'translateX(30px)'},{opacity:1,transform:'translateX(0)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
        links.forEach((link,i)=>link.setAttribute('aria-current',String(i===index)));
        journey.querySelector('.about-chapter-count').textContent=`0${index+1} / 03`;
      };
      const timeline=gsap.timeline({scrollTrigger:{id:'about-journey',trigger:journey,start:'top top',
        end:()=>`+=${innerHeight*2.5}`,pin:true,scrub:.85,invalidateOnRefresh:true,
        onUpdate:self=>{activate(Math.round(self.progress*2));journey.querySelector('.about-scroll-line span').style.transform=`scaleX(${self.progress})`;}
      }});
      timeline.fromTo('.journey-portrait img',{scale:1.06,y:14},{scale:1,y:-14,duration:2,ease:'none'},0);
      const go=event=>{
        const link=event.target.closest('[data-about-index]');if(!link)return;
        event.preventDefault();const index=Number(link.dataset.aboutIndex),trigger=timeline.scrollTrigger;
        window.scrollTo({top:trigger.start+index/2*(trigger.end-trigger.start),behavior:'smooth'});
      };
      journey.querySelector('.about-chapter-nav').addEventListener('click',go);
      active=-1;activate(Math.round(timeline.scrollTrigger.progress*2));
      return ()=>{
        journey.querySelector('.about-chapter-nav').removeEventListener('click',go);
        chapters.forEach(chapter=>{chapter.getAnimations().forEach(animation=>animation.cancel());chapter.inert=false;chapter.removeAttribute('aria-hidden');gsap.set(chapter,{clearProps:'opacity,visibility,transform'});});
        links.forEach(link=>link.removeAttribute('aria-current'));
        journey.classList.remove('is-about-pinned');
      };
    });
  }

  // Narrow screens keep ordinary reading order; scroll still moves the imagery.
  media.add('(max-width:1100px) and (prefers-reduced-motion:no-preference), (max-height:899px) and (prefers-reduced-motion:no-preference)',()=>{
    document.querySelectorAll('.projects-cinema .project-image img,.journey-portrait img').forEach(image=>{
      gsap.fromTo(image,{y:18},{y:-18,ease:'none',scrollTrigger:{trigger:image.parentElement,start:'top bottom',end:'bottom top',scrub:.8}});
    });
  });
  const skillRows=[...document.querySelectorAll('.skills .skill-row')];
  if(skillRows.length){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      skillRows.forEach(row=>row.classList.toggle('is-skill-active',row===entry.target));
      document.querySelectorAll('.skill-navigation a').forEach(link=>link.setAttribute('aria-current',String(link.hash===`#${entry.target.id}`)));
    }),{rootMargin:'-20% 0px -35% 0px'});
    skillRows.forEach(row=>observer.observe(row));
  }
  let refreshFrame;
  const refresh=()=>{cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>ScrollTrigger.refresh());};
  document.querySelectorAll('img').forEach(image=>{if(!image.complete)image.addEventListener('load',refresh,{once:true});});
  document.fonts?.ready.then(refresh);window.addEventListener('load',refresh,{once:true});
  document.documentElement.dataset.pageExperiences='ready';
})();
