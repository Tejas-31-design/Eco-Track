/* =============================================
   EcoTrack – script.js  (v2 – Enhanced)
   ============================================= */

'use strict';

/* =============================================
   1. ECO TIPS TICKER
   ============================================= */
const ecoTips = [
  'Turn off lights when you leave a room — it saves up to 10% on your electricity bill.',
  'A 5-minute shorter shower saves around 50 litres of water every day.',
  'Switching to a plant-based meal once a week can save 100 kg of CO₂ per year.',
  'Carrying a reusable bag eliminates ~500 plastic bags per person per year.',
  'Unplugging chargers when not in use reduces phantom energy drain by up to 10%.',
  'Cycling instead of driving for 10 km saves roughly 2.5 kg of CO₂ per trip.',
  'Buying second-hand reduces manufacturing demand — one of the biggest emission sources.',
  'Composting food waste keeps methane-producing waste out of landfills.',
  'Air-drying clothes instead of tumble-drying saves around 150 kg CO₂ per year.',
  'Eating local, seasonal produce can cut food-related emissions by up to 20%.',
];

let tipIndex = 0;
const tickerText  = document.getElementById('tickerText');
const tickerClose = document.getElementById('tickerClose');
const tipsTicker  = document.getElementById('tipsTicker');

function rotateTip() {
  if (tickerText) {
    tickerText.style.opacity = '0';
    setTimeout(() => {
      tipIndex = (tipIndex + 1) % ecoTips.length;
      tickerText.textContent = ecoTips[tipIndex];
      tickerText.style.transition = 'opacity .4s ease';
      tickerText.style.opacity = '1';
    }, 300);
  }
}

if (tickerText) {
  tickerText.textContent = ecoTips[0];
  setInterval(rotateTip, 7000);
}
if (tickerClose) {
  tickerClose.addEventListener('click', () => {
    tipsTicker.classList.add('hidden');
  });
}

/* =============================================
   2. DARK MODE TOGGLE
   ============================================= */
const darkToggle  = document.getElementById('darkToggle');
const toggleIcon  = darkToggle ? darkToggle.querySelector('.toggle-icon') : null;
const html        = document.documentElement;

// Persist preference
const saved = localStorage.getItem('ecoTheme');
if (saved) {
  html.setAttribute('data-theme', saved);
  if (toggleIcon) toggleIcon.textContent = saved === 'dark' ? '☀️' : '🌙';
}

if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ecoTheme', next);
    if (toggleIcon) toggleIcon.textContent = next === 'dark' ? '☀️' : '🌙';
    showToast(next === 'dark' ? '🌙 Dark mode on' : '☀️ Light mode on');
  });
}

/* =============================================
   3. NAVBAR: scroll shadow + active link
   ============================================= */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);

  // Scroll-to-top button visibility
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}, { passive: true });

/* =============================================
   4. HAMBURGER MENU
   ============================================= */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

/* =============================================
   5. SMOOTH SCROLL
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* =============================================
   6. SCROLL-TO-TOP BUTTON
   ============================================= */
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   7. FADE-IN OBSERVER
   ============================================= */
const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

const fadeTargets = document.querySelectorAll(
  '.feature-card, .step, .about-badge, .value-item, .dash-stat, .dash-progress-card, .dash-activity-card, .faq-item, .testimonial-card, .lb-rank-card, .lb-badges-card'
);
fadeTargets.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity .45s ease ${i * 55}ms, transform .45s ease ${i * 55}ms`;
  fadeObserver.observe(el);
});

/* =============================================
   8. DASHBOARD COUNTERS + PROGRESS BARS
   ============================================= */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      animateProgressBars();
      counterObserver.disconnect();
    }
  });
}, { threshold: 0.25 });

const dashSection = document.querySelector('.dashboard');
if (dashSection) counterObserver.observe(dashSection);

function animateCounters() {
  document.querySelectorAll('.dash-value[data-target]').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    const suffix = counter.getAttribute('data-suffix') || '';
    let start  = 0;
    const duration = 1400;
    const steps     = duration / 16;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { start = target; clearInterval(timer); }
      counter.textContent = Math.round(start) + suffix;
    }, 16);
  });
}

function animateProgressBars() {
  document.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.getAttribute('data-width') + '%'; }, 100);
  });
}

/* =============================================
   9. HERO RING ANIMATION
   ============================================= */
window.addEventListener('load', () => {
  const ring = document.getElementById('heroRing');
  if (ring) {
    ring.style.transition = 'none';
    ring.style.strokeDashoffset = '314';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ring.style.transition = 'stroke-dashoffset 1.6s ease';
        ring.style.strokeDashoffset = '88'; // 314 * (1 - 0.72)
      });
    });
  }
});

/* =============================================
   10. CARBON CALCULATOR
   ============================================= */
const sliders = {
  car:    { el: document.getElementById('carSlider'),    val: document.getElementById('carVal'),    factor: 0.00021 * 4.33 }, // kg CO₂/km → t/yr
  flight: { el: document.getElementById('flightSlider'), val: document.getElementById('flightVal'), factor: 0.255  },          // t CO₂/flight (avg)
  elec:   { el: document.getElementById('elecSlider'),   val: document.getElementById('elecVal'),   factor: 0.00023 * 12 },   // t/kWh/month → /yr
  meat:   { el: document.getElementById('meatSlider'),   val: document.getElementById('meatVal'),   factor: 0.0027 * 52 },    // t CO₂/meal → /yr
  shop:   { el: document.getElementById('shopSlider'),   val: document.getElementById('shopVal'),   factor: 0.03  * 12 },     // t CO₂/order → /yr
};

const calcRing     = document.getElementById('calcRing');
const calcTonnes   = document.getElementById('calcTonnes');
const calcRating   = document.getElementById('calcRating');
const bkTransport  = document.getElementById('bkTransport');
const bkEnergy     = document.getElementById('bkEnergy');
const bkDiet       = document.getElementById('bkDiet');
const bkShop       = document.getElementById('bkShop');

// Circumference = 2π*66 ≈ 414.69
const CIRC = 414.69;
const MAX_TONNES = 20; // scale ring to 20t

function updateCalculator() {
  const carKm   = parseFloat(sliders.car.el.value);
  const flights  = parseFloat(sliders.flight.el.value);
  const kWh      = parseFloat(sliders.elec.el.value);
  const meat     = parseFloat(sliders.meat.el.value);
  const shop     = parseFloat(sliders.shop.el.value);

  // Update displayed values
  sliders.car.val.textContent    = carKm;
  sliders.flight.val.textContent = flights;
  sliders.elec.val.textContent   = kWh;
  sliders.meat.val.textContent   = meat;
  sliders.shop.val.textContent   = shop;

  // Calculate breakdown (tonnes CO₂/yr)
  const tTransport = +(carKm * sliders.car.factor + flights * sliders.flight.factor).toFixed(2);
  const tEnergy    = +(kWh   * sliders.elec.factor).toFixed(2);
  const tDiet      = +(meat  * sliders.meat.factor).toFixed(2);
  const tShopping  = +(shop  * sliders.shop.factor).toFixed(2);
  const total      = +(tTransport + tEnergy + tDiet + tShopping).toFixed(2);

  // Update breakdown text
  if (bkTransport) bkTransport.textContent = tTransport.toFixed(1) + ' t';
  if (bkEnergy)    bkEnergy.textContent    = tEnergy.toFixed(1) + ' t';
  if (bkDiet)      bkDiet.textContent      = tDiet.toFixed(1) + ' t';
  if (bkShop)      bkShop.textContent      = tShopping.toFixed(1) + ' t';
  if (calcTonnes)  calcTonnes.textContent  = total.toFixed(1);

  // Ring animation
  if (calcRing) {
    const pct    = Math.min(total / MAX_TONNES, 1);
    const offset = CIRC * (1 - pct);
    calcRing.style.strokeDashoffset = offset;

    // Colour shift: green → yellow → red
    if (pct < 0.3)       calcRing.style.stroke = '#22c55e';
    else if (pct < 0.6)  calcRing.style.stroke = '#fbbf24';
    else                 calcRing.style.stroke = '#f87171';
  }

  // Rating text
  if (calcRating) {
    let icon = '🟢', text = 'Below Average';
    if      (total < 2.5) { icon = '🟢'; text = 'Very Low — Excellent!'; }
    else if (total < 4.8) { icon = '🟢'; text = 'Below Global Average'; }
    else if (total < 7)   { icon = '🟡'; text = 'Around Global Average'; }
    else if (total < 10)  { icon = '🟠'; text = 'Above Average'; }
    else                  { icon = '🔴'; text = 'High Impact — Let\'s Improve!'; }
    calcRating.innerHTML = `<span class="rating-icon">${icon}</span><span class="rating-text">${text}</span>`;
  }
}

Object.values(sliders).forEach(s => {
  if (s.el) s.el.addEventListener('input', updateCalculator);
});
updateCalculator(); // initial render

// Animate ring on first view
const calcObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      updateCalculator();
      calcObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
const calcSection = document.querySelector('.calculator');
if (calcSection) calcObserver.observe(calcSection);

/* =============================================
   11. TESTIMONIAL SLIDER
   ============================================= */
const track      = document.getElementById('testimonialTrack');
const dotsWrap   = document.getElementById('sliderDots');
const prevBtn    = document.getElementById('prevBtn');
const nextBtn    = document.getElementById('nextBtn');

if (track) {
  const cards       = track.querySelectorAll('.testimonial-card');
  let   current     = 0;
  let   perView     = window.innerWidth <= 768 ? 1 : 2;
  const totalSlides = Math.ceil(cards.length / perView);
  let   autoTimer;

  // Build dots
  if (dotsWrap) {
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    current = (idx + totalSlides) % totalSlides;
    const offset = current * (100 / perView) * perView;
    track.style.transform = `translateX(-${offset}%)`;
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAuto()  { clearInterval(autoTimer); }

  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  // Touch support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });

  window.addEventListener('resize', () => {
    const newPer = window.innerWidth <= 768 ? 1 : 2;
    if (newPer !== perView) { perView = newPer; goTo(0); }
  });

  startAuto();
}

/* =============================================
   12. FAQ ACCORDION
   ============================================= */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});

/* =============================================
   13. CONTACT FORM VALIDATION
   ============================================= */
const form        = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

function showError(inputId, errorId, message) {
  const el  = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  if (el && err) { el.classList.add('invalid'); err.textContent = message; }
}
function clearError(inputId, errorId) {
  const el  = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  if (el && err) { el.classList.remove('invalid'); err.textContent = ''; }
}
function validateField(id) {
  const el = document.getElementById(id);
  if (!el) return true;
  const val = el.value.trim();
  if (id === 'name') {
    if (!val) { showError('name', 'nameError', 'Please enter your name.'); return false; }
    clearError('name', 'nameError'); return true;
  }
  if (id === 'email') {
    if (!val) { showError('email', 'emailError', 'Please enter your email.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { showError('email', 'emailError', 'Please enter a valid email address.'); return false; }
    clearError('email', 'emailError'); return true;
  }
  if (id === 'message') {
    if (!val) { showError('message', 'messageError', 'Please enter a message.'); return false; }
    if (val.length < 10) { showError('message', 'messageError', 'Message must be at least 10 characters.'); return false; }
    clearError('message', 'messageError'); return true;
  }
  return true;
}

['name','email','message'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur',  () => validateField(id));
  el.addEventListener('input', () => { if (el.classList.contains('invalid')) validateField(id); });
});

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = validateField('name') & validateField('email') & validateField('message');
    if (!ok) return;

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;

    setTimeout(() => {
      form.reset();
      submitBtn.textContent = 'Send Message 🌿';
      submitBtn.disabled    = false;
      formSuccess.style.display = 'block';
      showToast('✅ Message sent successfully!', 'green');
      setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
    }, 1200);
  });
}

/* =============================================
   14. NEWSLETTER FORM
   ============================================= */
const nlForm    = document.getElementById('newsletterForm');
const nlEmail   = document.getElementById('nlEmail');
const nlSuccess = document.getElementById('nlSuccess');

if (nlForm) {
  nlForm.addEventListener('submit', e => {
    e.preventDefault();
    const val = nlEmail.value.trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      nlEmail.style.borderColor = '#f87171';
      nlEmail.focus();
      return;
    }
    nlEmail.style.borderColor = '';
    nlForm.style.display = 'none';
    nlSuccess.style.display = 'block';
    showToast('🎉 Subscribed! Welcome to the EcoTrack community.', 'green');
  });
}

/* =============================================
   15. TOAST NOTIFICATION UTILITY
   ============================================= */
const toastEl = document.getElementById('toast');
let   toastTimer;

function showToast(message, type = '') {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className   = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3500);
}

/* =============================================
   16. FEATURE CARD: subtle 3-D tilt
   ============================================= */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});
