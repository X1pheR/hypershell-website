const navMenu = document.querySelector('[data-nav-menu]');
const navToggle = navMenu?.querySelector('summary');
const navigation = document.querySelector('[data-mobile-nav]');
const header = document.querySelector('[data-header]');

function closeNavigation({ restoreFocus = false } = {}) {
  if (!(navMenu instanceof HTMLDetailsElement) || !navMenu.open) return;
  navMenu.open = false;
  if (restoreFocus && navToggle instanceof HTMLElement) navToggle.focus();
}

if (navMenu instanceof HTMLDetailsElement && navigation) {
  navigation.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) closeNavigation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation({ restoreFocus: true });
  });

  document.addEventListener('click', (event) => {
    if (!navMenu.open || navMenu.contains(event.target)) return;
    closeNavigation();
  });
}

function updateHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 16);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const legacySpinyGlitch = document.querySelector('[data-spiny-glitch]');

if (legacySpinyGlitch) {
  if (reducedMotion) {
    legacySpinyGlitch.classList.remove('is-glitching');
  } else {
    window.setTimeout(() => {
      legacySpinyGlitch.classList.remove('is-glitching');
    }, 3700);
  }
}

const heroSpinyGlitch = document.querySelector('[data-hero-spiny-glitch]');
const heroTitleGlitch = document.querySelector('[data-hero-title-glitch]');

if (!reducedMotion && heroSpinyGlitch instanceof HTMLElement && heroTitleGlitch instanceof HTMLElement && window.PowerGlitch) {
  const spinyEffect = window.PowerGlitch.glitch(heroSpinyGlitch, {
    createContainers: false,
    playMode: 'manual',
    hideOverflow: false,
    timing: { duration: 560, iterations: 1 },
    glitchTimeSpan: { start: 0.08, end: 0.92 },
    shake: { velocity: 18, amplitudeX: 0.035, amplitudeY: 0.008 },
    slice: { count: 5, velocity: 18, minHeight: 0.025, maxHeight: 0.14, hueRotate: false, cssFilters: '' },
    pulse: false,
  });

  const titleEffect = window.PowerGlitch.glitch(heroTitleGlitch, {
    createContainers: false,
    playMode: 'manual',
    hideOverflow: false,
    timing: { duration: 440, iterations: 1 },
    glitchTimeSpan: { start: 0.08, end: 0.92 },
    shake: { velocity: 19, amplitudeX: 0.008, amplitudeY: 0.003 },
    slice: { count: 4, velocity: 20, minHeight: 0.035, maxHeight: 0.16, hueRotate: false, cssFilters: '' },
    pulse: false,
  });

  [heroSpinyGlitch, heroTitleGlitch].forEach((container) => {
    container.querySelectorAll('[data-islayer]').forEach((layer) => layer.setAttribute('aria-hidden', 'true'));
  });

  function scaleSliceOffsets(container, scale) {
    container.querySelectorAll('[data-islayer]').forEach((layer) => {
      layer.getAnimations().forEach((animation) => {
        const effect = animation.effect;
        if (!(effect instanceof KeyframeEffect)) return;
        const keyframes = effect.getKeyframes();
        let changed = false;
        const adjusted = keyframes.map((frame) => {
          if (typeof frame.transform !== 'string') return frame;
          const transform = frame.transform.replace(
            /translate3d\((-?[\d.]+)%,\s*(-?[\d.]+)%,\s*0(?:px)?\)/,
            (_, x, y) => {
              changed = true;
              return `translate3d(${(Number(x) * scale).toFixed(3)}%,${y}%,0)`;
            },
          );
          return { ...frame, transform };
        });
        if (changed) effect.setKeyframes(adjusted);
      });
    });
  }

  const effects = [
    { name: 'spiny', weight: 0.6, duration: 560, offsetScale: 0.72, container: heroSpinyGlitch, effect: spinyEffect },
    { name: 'title', weight: 0.4, duration: 440, offsetScale: 0.16, container: heroTitleGlitch, effect: titleEffect },
  ];
  const effectsByName = Object.fromEntries(effects.map((effect) => [effect.name, effect]));
  const heroSection = document.querySelector('.hero');
  let heroGlitchTimer = 0;
  let activeStopTimer = 0;
  let heroIsVisible = true;
  let startupPending = true;

  function clearHeroGlitchTimers() {
    window.clearTimeout(heroGlitchTimer);
    window.clearTimeout(activeStopTimer);
    heroGlitchTimer = 0;
    activeStopTimer = 0;
  }

  function stopHeroGlitches() {
    effects.forEach(({ effect }) => effect.stopGlitch());
    delete document.documentElement.dataset.heroGlitchActive;
  }

  function scheduleHeroGlitch(delay) {
    if (document.hidden || !heroIsVisible) return;
    const wait = typeof delay === 'number' ? delay : 1000 + Math.random() * 2000;
    heroGlitchTimer = window.setTimeout(runHeroGlitch, wait);
  }

  function playEffect(selected, onDone) {
    stopHeroGlitches();
    document.documentElement.dataset.heroGlitchActive = selected.name;
    selected.effect.startGlitch();
    scaleSliceOffsets(selected.container, selected.offsetScale);
    activeStopTimer = window.setTimeout(() => {
      selected.effect.stopGlitch();
      delete document.documentElement.dataset.heroGlitchActive;
      onDone();
    }, selected.duration + 40);
  }

  function runHeroGlitch() {
    const selected = Math.random() < effects[0].weight ? effects[0] : effects[1];
    playEffect(selected, scheduleHeroGlitch);
  }

  function runStartupSequence() {
    if (document.hidden || !heroIsVisible) return;
    startupPending = false;
    playEffect(effectsByName.spiny, () => {
      heroGlitchTimer = window.setTimeout(() => {
        playEffect(effectsByName.title, scheduleHeroGlitch);
      }, 160 + Math.random() * 100);
    });
  }

  document.addEventListener('visibilitychange', () => {
    clearHeroGlitchTimers();
    stopHeroGlitches();
    if (!document.hidden && heroIsVisible) {
      if (startupPending) runStartupSequence();
      else scheduleHeroGlitch();
    }
  });

  if (heroSection instanceof HTMLElement && 'IntersectionObserver' in window) {
    const heroGlitchObserver = new IntersectionObserver(([entry]) => {
      const nextVisible = Boolean(entry?.isIntersecting);
      if (nextVisible === heroIsVisible) return;
      heroIsVisible = nextVisible;
      clearHeroGlitchTimers();
      stopHeroGlitches();
      if (heroIsVisible && !document.hidden) {
        if (startupPending) runStartupSequence();
        else scheduleHeroGlitch();
      }
    }, { threshold: 0.08 });
    heroGlitchObserver.observe(heroSection);
  }

  heroGlitchTimer = window.setTimeout(runStartupSequence, 180);
}

const projectFilterBar = document.querySelector('[data-project-filters]');
const projectFilterStatus = document.querySelector('[data-project-filter-status]');
const projectFilterButtons = Array.from(document.querySelectorAll('[data-project-filter]'));
const repositoryCards = Array.from(document.querySelectorAll('.repository-card[data-project-category]'));

if (projectFilterBar instanceof HTMLElement && projectFilterButtons.length && repositoryCards.length) {
  projectFilterBar.hidden = false;

  function applyProjectFilter(category) {
    let visibleCount = 0;
    repositoryCards.forEach((card) => {
      const visible = category === 'all' || card.dataset.projectCategory === category;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    projectFilterButtons.forEach((button) => {
      const active = button.dataset.projectFilter === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (projectFilterStatus) {
      projectFilterStatus.textContent = `Showing ${visibleCount} of ${repositoryCards.length} projects`;
    }
  }

  projectFilterButtons.forEach((button) => {
    button.addEventListener('click', () => applyProjectFilter(button.dataset.projectFilter || 'all'));
  });
}

const revealGroups = [
  ['.section-heading', 0],
  ['.domain-card', 90],
  ['.why-copy, .why-point', 100],
  ['.project-card', 110],
  ['.project-activity', 110],
  ['.architecture-stack, .principles', 130],
  ['.about-copy, .profile-card', 140],
];

const revealElements = [];

revealGroups.forEach(([selector, stagger]) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index * stagger, 420)}ms`);
    revealElements.push(element);
  });
});

document.documentElement.classList.add('reveal-ready');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -9% 0px',
  });

  revealElements.forEach((element) => revealObserver.observe(element));
}

const sectionLinks = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
const trackedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter((section) => section instanceof HTMLElement);
let scrollSpyFrame = 0;

function updateActiveSection() {
  scrollSpyFrame = 0;
  const marker = window.scrollY + window.innerHeight * 0.34;
  let activeSection = null;

  trackedSections.forEach((section) => {
    if (section.offsetTop <= marker) activeSection = section;
  });

  sectionLinks.forEach((link) => {
    const isActive = activeSection && link.getAttribute('href') === `#${activeSection.id}`;
    link.classList.toggle('is-active', Boolean(isActive));
    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function queueScrollSpyUpdate() {
  if (scrollSpyFrame) return;
  scrollSpyFrame = window.requestAnimationFrame(updateActiveSection);
}

updateActiveSection();
window.addEventListener('scroll', queueScrollSpyUpdate, { passive: true });
window.addEventListener('resize', queueScrollSpyUpdate);
