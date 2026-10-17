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
    <div class="hero-art" aria-label="Interactive geometric letter E">
      <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
      <div class="sculpture-stage"><div class="sculpture" aria-hidden="true"><div class="beam beam-one"></div><div class="beam beam-two"></div><div class="beam beam-three"></div><div class="spine"></div></div></div>
      <div class="sculpture-viewport" role="group" aria-label="Interactive 3D E" aria-describedby="sculpture-help" tabindex="0"><canvas class="sculpture-canvas" aria-hidden="true"></canvas></div>
      <div class="sculpture-ui"><p id="sculpture-help"><span aria-hidden="true">↔</span> Drag to rotate. Arrow keys work, too.</p><div class="sculpture-controls"><div class="finish-picker" role="group" aria-label="Sculpture finish"><button type="button" data-finish="pearl" aria-pressed="true"><span class="finish-dot pearl"></span>Pearl</button><button type="button" data-finish="titanium" aria-pressed="false"><span class="finish-dot titanium"></span>Titanium</button></div><button class="layers-toggle" type="button" aria-pressed="false">Separate layers</button><button class="reset-sculpture" type="button" aria-label="Reset sculpture view">↺</button></div><span class="sr-only sculpture-status" role="status"></span></div>
      <span class="art-caption">Ideas, taking shape.</span><button class="rotate-art" aria-label="Rotate geometric sculpture">Rotate ↻</button>
    </div>
    <div class="hero-story"><p>Every layer, connected.</p><h2>From interface<br>to infrastructure.</h2><p>Clear on the surface.<br>Considered all the way through.</p></div>
  </div>
  <div class="hero-bottom"><span class="scroll-invitation">Scroll to explore every layer.</span><a href="#selected">Skip to selected work ↓</a></div>
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
