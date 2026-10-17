import {assembly} from './assembly-content.mjs';
import {projects} from './projects-data.js';
import {readFileSync} from 'node:fs';

const featured = projects.slice(0, 4).map(project => {
  const png = readFileSync(new URL(`assets/images/projects/${project.image}`, import.meta.url));
  return {...project, width:png.readUInt32BE(16), height:png.readUInt32BE(20)};
});
export const home = services => `
<section class="hero">
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-top"><span class="availability"><i></i> Open to opportunities</span><span>Quezon City, Philippines <span class="local-time"></span></span></div>
  <div class="hero-layout">
    <div class="hero-copy">
      <p class="hello">Hi, I’m Eli — John Eliseo Cea</p>
      <h1><span class="headline-line">Thoughtful code.</span><span class="headline-line">Meaningful</span><span class="headline-line">experiences.</span></h1>
      <div class="hero-intro"><span class="asterisk" aria-hidden="true">✳</span><p>A full stack developer connecting thoughtful interfaces with the systems that make them work.</p></div>
      <a class="button" href="projects.html">Explore my work <span aria-hidden="true">↗</span></a>
    </div>
    <div class="hero-art photo-art" aria-label="Interactive photographs of my ROG Strix laptop">
      <div class="laptop-photo-stage" role="group" aria-label="ROG Strix assembled and exploded views" aria-describedby="photo-help">
        <img class="laptop-assembled" src="assets/images/laptop/rog-assembled-cutout.png" alt="ROG Strix laptop viewed from behind, with its lid open and RGB lighting" width="500" height="500" fetchpriority="high">
        <div class="exploded-scene">
          ${assembly}
          <div class="photo-hotspots" role="group" aria-label="Select a component in the exploded photograph" inert>
            <button type="button" data-part="display" class="hotspot hotspot-display" aria-label="Explore display layer"><span>Display</span></button>
            <button type="button" data-part="keyboard" class="hotspot hotspot-keyboard" aria-label="Explore keyboard layer"><span>Keyboard</span></button>
            <button type="button" data-part="cooling" class="hotspot hotspot-cooling" aria-label="Explore cooling layer"><span>Cooling</span></button>
            <button type="button" data-part="battery" class="hotspot hotspot-battery" aria-label="Explore battery layer"><span>Battery</span></button>
            <button type="button" data-part="motherboard" class="hotspot hotspot-motherboard" aria-label="Explore motherboard layer"><span>Motherboard</span></button>
            <button type="button" data-part="chassis" class="hotspot hotspot-chassis" aria-label="Explore chassis layer"><span>Chassis</span></button>
          </div>
        </div>
        <span class="photo-state" aria-hidden="true">Assembled</span>
      </div>
      <noscript><p><a class="text-link" href="assets/images/laptop/rog-exploded.png">View the exploded laptop photograph ↗</a></p></noscript>
      <div class="photo-controls">
        <p id="photo-help">ROG Strix G16 · Explore my everyday coding setup.</p>
        <div class="photo-view-controls"><button class="layers-toggle" type="button" aria-pressed="false">Separate layers <span aria-hidden="true">↗</span></button><button class="reset-photo" type="button" aria-label="Reset laptop view">↺</button></div>
        <label class="separation-control"><span>Assembled</span><input type="range" min="0" max="100" value="0" aria-label="Laptop exploded view" aria-valuetext="Assembled"><span>Exploded</span></label>
        <div class="part-picker" role="group" aria-label="Explore laptop layers"><button type="button" data-part="display" aria-pressed="false">Display</button><button type="button" data-part="keyboard" aria-pressed="false">Keyboard</button><button type="button" data-part="cooling" aria-pressed="false">Cooling</button><button type="button" data-part="motherboard" aria-pressed="false">Motherboard</button><button type="button" data-part="battery" aria-pressed="false">Battery</button><button type="button" data-part="chassis" aria-pressed="false">Chassis</button></div>
        <div class="part-detail" aria-live="polite" aria-atomic="true"><strong class="part-title">My everyday coding companion.</strong><p class="part-description">My tool for writing code, testing ideas, and bringing projects to life.</p></div>
      </div>
    </div>
    <div class="hero-story"><p>My coding setup</p><h2>The tool<br>I build with.</h2><p>My ROG Strix G16.<br>For ideas, code, and everything in between.</p></div>
  </div>
  <div class="hero-bottom"><span class="scroll-invitation">Scroll to explore my setup.</span><button class="replay-intro" type="button">Replay intro ↻</button><a href="#selected">Skip to selected work ↓</a></div>
  <div class="hero-progress" aria-hidden="true"><span></span></div>
</section>
<section class="work-gallery" id="selected" aria-labelledby="selected-heading">
  <div class="gallery-heading"><div><p>Explore the work</p><h2 id="selected-heading">Different challenges.<br>The same attention to detail.</h2></div><a class="text-link" href="projects.html">All 8 projects <span aria-hidden="true">↗</span></a></div>
  <div class="gallery-window"><div class="gallery-track">
    ${featured.map((p,i)=>`<article class="work-panel" id="featured-${p.id}"><div class="work-info"><span class="work-category">${p.category}${p.ongoing?' / In progress':''}</span><h3>${p.name}</h3><p>${p.summary}</p><div class="tags">${p.stack.slice(0,4).map(t=>`<span>${t}</span>`).join('')}</div><a class="button work-link" href="project-${p.id}.html">Explore case study <span aria-hidden="true">↗</span></a></div><a class="work-visual ${p.id}" href="project-${p.id}.html" aria-label="Explore ${p.name}" style="--preview-ratio:${p.width/p.height}"><div class="frame-tilt"><div class="work-frame"><div class="frame-bar" aria-hidden="true"><span></span><span></span><span></span><i>${p.name}</i></div><img src="assets/images/projects/${p.image}" alt="${p.name} interface" width="${p.width}" height="${p.height}" loading="eager"></div></div><span class="project-peek" aria-hidden="true">↗</span><span class="visual-caption">${String(i+1).padStart(2,'0')} / Selected project</span></a></article>`).join('')}
  </div></div>
  <div class="gallery-controls"><p class="gallery-hint">Scroll or drag to explore</p><div class="gallery-position"><span class="gallery-current">01</span><span> / 04</span></div><div class="gallery-steps" role="group" aria-label="Choose featured project">${featured.map((p,i)=>`<button type="button" data-project-index="${i}" aria-label="Show ${p.name}" aria-pressed="${i===0}"><span>${String(i+1).padStart(2,'0')}</span></button>`).join('')}</div><a href="#after-work" class="gallery-skip">Continue to about ↓</a></div>
  <div class="gallery-progress" aria-hidden="true"><span></span></div>
</section>
<section class="intro-section" id="after-work"><p class="section-kicker">A little about me</p><div><h2><span>Curious by nature.</span><br><span>Developer by craft.</span></h2><p>I’m John Eliseo Cea, a full stack developer based in Quezon City. From public service platforms to everyday tools, I enjoy turning complex requirements into applications that feel straightforward.</p><a class="text-link" href="about.html">More about me <span aria-hidden="true">↗</span></a></div><div class="about-orbit" aria-hidden="true"></div></section>
<section class="section services-section" id="services"><div class="section-heading"><h2>What I can help with</h2><a href="services.html" class="text-link">Explore services <span aria-hidden="true">↗</span></a></div>${services}</section>`;
