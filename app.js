// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const contactForm = document.getElementById('contact-form');
const currentYearSpan = document.getElementById('current-year');

// Site data
let siteData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  loadSiteData();
  populateContent();
  setCurrentYear();

  setupNavigation();
  setupThemeToggle();
  setupSmoothScrolling();
  setupFormHandling();
  setupSectionAnimations();
});

/* --------------------------------------------------
   Load JSON data
--------------------------------------------------*/
function loadSiteData() {
  try {
    const dataScript = document.getElementById('site-data');
    if (dataScript && dataScript.textContent) {
      siteData = JSON.parse(dataScript.textContent);
    }
  } catch (err) {
    console.error('Failed to parse site data', err);
  }
}

/* --------------------------------------------------
   Navigation (hamburger)
--------------------------------------------------*/
function setupNavigation() {
  if (!navToggle || !navMenu) return;

  // Toggle mobile menu
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close after clicking a link
  navMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  // Ensure menu closes on resize >= 768px
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

/* --------------------------------------------------
   Theme toggle (light ↔ dark)
--------------------------------------------------*/
function setupThemeToggle() {
  if (!themeToggle) return;

  // Initialise icon state
  updateThemeIcon(document.body.classList.contains('dark-mode') ? 'dark' : 'light');

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    updateThemeIcon(isDark ? 'dark' : 'light');
  });
}

function updateThemeIcon(theme) {
  const iconEl = themeToggle.querySelector('.theme-toggle__icon');
  if (iconEl) {
    iconEl.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

/* --------------------------------------------------
   Smooth scrolling for internal anchors
--------------------------------------------------*/
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      targetEl.scrollIntoView({ behaviour: 'smooth', block: 'start' });
    });
  });
}

/* --------------------------------------------------
   Contact form handling
--------------------------------------------------*/
function setupFormHandling() {
  if (!contactForm) return;

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const message = formData.get('message').trim();

    if (!validateForm(name, email, message)) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      // Fake async to simulate remote request
      await new Promise(res => setTimeout(res, 800));

      alert('Message sent!');
      contactForm.reset();
    } catch (err) {
      console.error('Form submission error', err);
      alert('Oops! Something went wrong. Please try again.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

function validateForm(name, email, message) {
  clearFormErrors();
  let valid = true;

  if (name.length < 2) {
    showFieldError('name', 'Enter at least 2 characters');
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFieldError('email', 'Enter a valid email');
    valid = false;
  }

  if (message.length < 10) {
    showFieldError('message', 'Message too short');
    valid = false;
  }

  return valid;
}

function showFieldError(id, msg) {
  const field = document.getElementById(id);
  if (!field) return;

  field.style.borderColor = '#dc3545';
  let err = field.parentElement.querySelector('.error-message');
  if (!err) {
    err = document.createElement('div');
    err.className = 'error-message';
    err.style.color = '#dc3545';
    err.style.fontSize = '0.875rem';
    err.style.marginTop = '0.25rem';
    field.parentElement.appendChild(err);
  }
  err.textContent = msg;
}

function clearFormErrors() {
  document.querySelectorAll('.error-message').forEach(el => el.remove());
  contactForm.querySelectorAll('.form-control').forEach(ctrl => (ctrl.style.borderColor = ''));
}

/* --------------------------------------------------
   Intersection Observer animations
--------------------------------------------------*/
function setupSectionAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        if (entry.target.id === 'skills') animateSkillBars();
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.section').forEach(sec => observer.observe(sec));
}

function animateSkillBars() {
  document.querySelectorAll('.skill__progress').forEach((bar, i) => {
    setTimeout(() => {
      bar.style.width = bar.dataset.level + '%';
    }, i * 150);
  });
}

/* --------------------------------------------------
   Dynamic content builders
--------------------------------------------------*/
function populateContent() {
  if (!siteData) return;

  // Hero
  setText('hero-name', siteData.name);
  setText('hero-role', siteData.role);
  setText('hero-tagline', siteData.tagline);

  // About
  setText('about-bio', siteData.bio);
  setText('about-email', siteData.email);
  setText('about-location', siteData.location);

  // Skills & Projects & Social
  renderSkills(siteData.skills);
  renderProjects(siteData.projects);
  renderSocial(siteData.socialLinks);
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el && txt) el.textContent = txt;
}

function renderSkills(list = []) {
  const container = document.getElementById('skills-grid');
  if (!container) return;
  container.innerHTML = '';
  list.forEach(skill => {
    container.insertAdjacentHTML('beforeend', `
      <div class="skill">
        <div class="skill__header">
          <span class="skill__name">${skill.name}</span>
          <span class="skill__percentage">${skill.level}%</span>
        </div>
        <div class="skill__bar">
          <div class="skill__progress" data-level="${skill.level}"></div>
        </div>
      </div>
    `);
  });
}

function renderProjects(list = []) {
  const container = document.getElementById('projects-grid');
  if (!container) return;
  container.innerHTML = '';

  list.forEach(proj => {
    const tags = proj.tech.split(',').map(t => `<span class="project__tech-tag">${t.trim()}</span>`).join('');
    container.insertAdjacentHTML('beforeend', `
      <div class="project">
        <img src="${proj.image}" alt="${proj.title}" class="project__image" loading="lazy">
        <div class="project__content">
          <h3 class="project__title">${proj.title}</h3>
          <p class="project__description">${proj.description}</p>
          <div class="project__tech">${tags}</div>
          <div class="project__actions">
            <a href="${proj.repo}" target="_blank" rel="noopener noreferrer" class="project__link project__link--secondary">View Code</a>
            <a href="${proj.live}" target="_blank" rel="noopener noreferrer" class="project__link project__link--primary">Live Demo</a>
          </div>
        </div>
      </div>
    `);
  });
}

function renderSocial(links = []) {
  const contactWrapper = document.getElementById('contact-social');
  const footerWrapper = document.getElementById('footer-social');

  [contactWrapper, footerWrapper].forEach(wrapper => {
    if (!wrapper) return;
    wrapper.innerHTML = '';
    links.forEach(link => {
      wrapper.insertAdjacentHTML('beforeend', `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="${wrapper.id.includes('footer') ? 'footer__social-link' : 'contact__social-link'}">
          <span aria-hidden="true">${getSocialIcon(link.platform)}</span>
          <span>${link.platform}</span>
        </a>
      `);
    });
  });
}

function getSocialIcon(platform) {
  const map = {
    GitHub: '🐱',
    LinkedIn: '💼',
    Twitter: '🐦',
    Instagram: '📷'
  };
  return map[platform] || '🔗';
}

function setCurrentYear() {
  if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
}
