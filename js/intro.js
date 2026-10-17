(() => {
  const root = document.documentElement;
  const intro = document.querySelector('.entry-intro');
  if (!intro) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const skip = intro.querySelector('.entry-skip');
  const replay = document.querySelector('.replay-intro');
  const background = [...document.querySelectorAll('body > .skip, body > .header, body > main, body > footer')];
  let timer, exitTimer, priorFocus, playing = false, leaving = false;
  let revealAnimations = [];

  function finish() {
    if (!playing) return;
    clearTimeout(timer);
    clearTimeout(exitTimer);
    revealAnimations.forEach(animation => animation.cancel());
    revealAnimations = [];
    playing = false;
    leaving = false;
    const restoreFocus = intro.contains(document.activeElement);
    intro.hidden = true;
    intro.classList.remove('is-playing', 'is-leaving');
    root.classList.remove('intro-active');
    background.forEach(element => { element.inert = false; });
    if (restoreFocus) (priorFocus || document.querySelector('.hero-copy .button'))?.focus({preventScroll:true});
    window.dispatchEvent(new Event('portfolio:intro-complete'));
  }

  function leave(immediate = false) {
    if (!playing) return;
    if (immediate || reduced.matches) return finish();
    if (leaving) return;
    clearTimeout(timer);
    leaving = true;
    intro.classList.add('is-leaving');
    // Reveal the real page beneath the fading intro, so there is no hard handoff.
    if (scrollY < 100) {
      const reveal = (selector, from, duration, delay) => {
        document.querySelectorAll(selector).forEach(element => revealAnimations.push(element.animate(
          [from, {opacity:1, transform:'translate3d(0,0,0) scale(1)'}],
          {duration, delay, easing:'cubic-bezier(.22,1,.36,1)', fill:'backwards'}
        )));
      };
      reveal('.hero-layout', {opacity:0, transform:'translate3d(0,24px,0) scale(1.025)'}, 1550, 350);
      reveal('.header, .hero-top, .hero-bottom', {opacity:0, transform:'translate3d(0,10px,0)'}, 1350, 500);
    }
    exitTimer = setTimeout(finish, 1950);
  }

  function play(replaying = false) {
    if (playing || reduced.matches) return;
    clearTimeout(window.portfolioIntroWatchdog);
    priorFocus = replaying ? document.activeElement : null;
    playing = true;
    root.classList.add('intro-active');
    intro.hidden = false;
    background.forEach(element => { element.inert = true; });
    intro.dataset.started=String(performance.now());
    intro.classList.add('is-playing');
    window.dispatchEvent(new Event('portfolio:intro-start'));
    skip.focus({preventScroll:true});
    try { sessionStorage.setItem('eli:intro-seen', '1'); } catch { /* Storage can be unavailable. */ }
    timer = setTimeout(() => leave(), 4100);
  }

  skip.addEventListener('click', () => leave(true));
  intro.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); leave(true); }
    // The skip button is the dialog's only interactive element.
    if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  intro.addEventListener('pointermove', event => {
    intro.style.setProperty('--intro-x', (event.clientX / innerWidth - .5).toFixed(3));
    intro.style.setProperty('--intro-y', (event.clientY / innerHeight - .5).toFixed(3));
  });
  intro.addEventListener('pointerleave', () => {
    intro.style.removeProperty('--intro-x');
    intro.style.removeProperty('--intro-y');
  });
  replay?.addEventListener('click', () => play(true));
  reduced.addEventListener('change', () => { if (reduced.matches) leave(true); });
  window.addEventListener('pagehide', finish);
  root.classList.add('intro-available');
  if (root.classList.contains('intro-active')) play();
})();
