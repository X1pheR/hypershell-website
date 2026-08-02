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
const spinyGlitch = document.querySelector('[data-spiny-glitch]');

if (spinyGlitch) {
  if (reducedMotion) {
    spinyGlitch.classList.remove('is-glitching');
  } else {
    window.setTimeout(() => {
      spinyGlitch.classList.remove('is-glitching');
    }, 3700);
  }
}

const revealGroups = [
  ['.section-heading', 0],
  ['.domain-card', 90],
  ['.project-card', 110],
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
