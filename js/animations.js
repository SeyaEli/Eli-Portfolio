/**
 * animations.js — GSAP scroll reveals & transitions
 */

const Animations = (() => {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Scroll reveal via IntersectionObserver ──────────────────────────
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  }

  // ─── Preloader ────────────────────────────────────────────────────────
  function initPreloader(onComplete) {
    const loader = document.getElementById('preloader');
    if (!loader) { onComplete && onComplete(); return; }

    const nameSpan = loader.querySelector('.preloader__name span');
    const fill     = loader.querySelector('.preloader__bar-fill');

    if (isReduced) {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(onComplete, 300);
      return;
    }

    if (!window.gsap) {
      loader.style.display = 'none';
      onComplete && onComplete();
      return;
    }

    const tl = window.gsap.timeline({
      onComplete: () => {
        window.gsap.to(loader, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            onComplete && onComplete();
          },
        });
      },
    });

    tl.to(nameSpan, { y: '0%', duration: 0.8, ease: 'power3.out' })
      .to(fill,     { width: '100%', duration: 0.6, ease: 'power2.inOut' }, '-=0.2')
      .to(fill,     { opacity: 0, duration: 0.2 }, '+=0.1');
  }

  // ─── Hero entrance ────────────────────────────────────────────────────
  function animateHeroEntrance() {
    if (!window.gsap) return;
    if (isReduced) {
      document.querySelectorAll('.hero__eyebrow, .hero__title-word, .hero__subtitle, .hero__actions, .hero__scroll')
        .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const tl = window.gsap.timeline({ delay: 0.1 });

    tl.to('.hero__eyebrow', {
        opacity: 1, duration: 0.6, ease: 'power2.out',
      })
      .to('.hero__title-word', {
        y: '0%', duration: 0.9, ease: 'power3.out', stagger: 0.07,
      }, '-=0.3')
      .to('.hero__subtitle', {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      }, '-=0.5')
      .to('.hero__actions', {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      }, '-=0.4')
      .to('.hero__scroll', {
        opacity: 1, duration: 0.6,
      }, '-=0.3');
  }

  // ─── Nav scroll behavior ──────────────────────────────────────────────
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('nav--scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ─── Active nav link ──────────────────────────────────────────────────
  function initActiveNav() {
    const links = document.querySelectorAll('.nav__link');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ─── Mobile menu ──────────────────────────────────────────────────────
  function initMobileMenu() {
    const hamburger   = document.querySelector('.nav__hamburger');
    const mobileMenu  = document.querySelector('.nav__mobile');
    const mobileLinks = document.querySelectorAll('.nav__mobile-link');

    if (!hamburger || !mobileMenu) return;

    let open = false;

    const toggle = () => {
      open = !open;
      hamburger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';

      if (open && !isReduced && window.gsap) {
        window.gsap.fromTo(mobileLinks,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.1 }
        );
      }
    };

    hamburger.addEventListener('click', toggle);
    hamburger.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle(); });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        open = true;
        toggle();
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) toggle();
    });
  }

  // ─── Custom cursor ────────────────────────────────────────────────────
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    let cx = 0, cy = 0;

    window.addEventListener('mousemove', e => {
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
    });

    // Enlarge on interactive elements
    const interactives = 'a, button, [role="button"], .project-card, .project-row, .filter-btn';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactives)) {
        cursor.classList.add('cursor--large');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactives)) {
        cursor.classList.remove('cursor--large');
      }
    });
  }

  // ─── Number counter ───────────────────────────────────────────────────
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };

        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
  }

  // ─── Page transition link intercept ──────────────────────────────────
  function initPageTransitions() {
    if (!window.gsap || isReduced) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; background: #0C0C0E;
      z-index: 9997; pointer-events: none; opacity: 0;
    `;
    document.body.appendChild(overlay);

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      // Only internal .html links or root-relative
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;

      link.addEventListener('click', e => {
        e.preventDefault();
        window.gsap.to(overlay, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.inOut',
          onComplete: () => { window.location.href = href; },
        });
      });
    });

    // Fade in on load
    window.gsap.to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.out' });
  }

  // ─── Public API ───────────────────────────────────────────────────────
  return {
    init() {
      initNavScroll();
      initActiveNav();
      initMobileMenu();
      if (!isReduced) initCursor();
      initReveal();
      initCounters();
    },
    preloader: initPreloader,
    heroEntrance: animateHeroEntrance,
    pageTransitions: initPageTransitions,
  };
})();

window.Animations = Animations;
