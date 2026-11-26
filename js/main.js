// ===== PRELOADER LOGIC =====
(function () {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Disable scrolling while preloader is visible
  document.body.style.overflow = 'hidden';

  const minDisplayTime = 2200;
  const startTime = Date.now();

  function hidePreloader() {
    if (preloader.classList.contains('preloader-hidden')) return;
    preloader.classList.add('preloader-hidden');
    document.body.style.overflow = '';

    setTimeout(() => {
      if (preloader && preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
    }, 700);
  }

  function triggerHide() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDisplayTime - elapsed);
    setTimeout(hidePreloader, remaining);
  }

  if (document.readyState === 'complete') {
    triggerHide();
  } else {
    window.addEventListener('load', triggerHide);
    setTimeout(triggerHide, 2800);
  }
})();

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(theme) {
  if (theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
  themeToggle.setAttribute(
    'aria-label',
    theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
  );
  try {
    localStorage.setItem('theme', theme === 'light' ? 'light' : 'dark');
  } catch (e) { /* ignore */ }
}

applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
  const isLight = root.getAttribute('data-theme') === 'light';
  applyTheme(isLight ? 'dark' : 'light');
});

// ===== AOS Init =====
AOS.init({
  duration: 700,
  easing: 'ease-out-cubic',
  once: true,
  offset: 80
});

// ===== Typing Animation =====
const roles = ['Software Engineer', 'Web Developer', 'Flutter Developer'];
let roleIndex = 0, charIndex = 0, isDeleting = false;
const typedEl = document.getElementById('typed-role');

function type() {
  const current = roles[roleIndex];
  typedEl.textContent = isDeleting
    ? current.substring(0, charIndex--)
    : current.substring(0, charIndex++);

  let speed = isDeleting ? 55 : 95;
  if (!isDeleting && charIndex === current.length + 1) {
    speed = 2000; isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    speed = 500;
  }
  setTimeout(type, speed);
}
// يبدأ بعد ما الحروف تخلص
setTimeout(type, 1400);

// ===== Progress Bars: animate on scroll =====
const bars = document.querySelectorAll('.progress-bar-custom');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target;
      const width = target.style.width;
      target.style.width = '0';
      // small trick: force reflow then set width
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { target.style.width = width; });
      });
      barObserver.unobserve(target);
    }
  });
}, { threshold: 0.3 });
bars.forEach(b => barObserver.observe(b));

// ===== About Tabs =====
const aboutTabBtns = document.querySelectorAll('.about-tab-btn');
const aboutTabPanels = document.querySelectorAll('.about-tab-panel');

aboutTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    aboutTabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    aboutTabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('panel-' + target);
    if (panel) panel.classList.add('active');
  });
});

// ===== Animated Stat Counter =====
const statNumbers = document.querySelectorAll('.stat-number[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.target;
      let current = 0;
      const step = Math.ceil(target / 30);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 40);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNumbers.forEach(el => counterObserver.observe(el));

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active-link');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active-link');
  });
});

// ===== Portfolio Sub-sections Sliders =====
function setupPortfolioSlider(trackId, prevBtnId, nextBtnId) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);
  if (!track || !prevBtn || !nextBtn) return;

  let slideIndex = 0;

  function getPerView() {
    if (window.innerWidth < 575) return 1;
    if (window.innerWidth < 992) return 2;
    return 3;
  }

  function updateSlider() {
    const cards = track.querySelectorAll('.portfolio-slider-card');
    const perView = getPerView();
    const maxSlide = Math.max(0, cards.length - perView);
    slideIndex = Math.min(Math.max(0, slideIndex), maxSlide);

    const wrapperWidth = track.parentElement.offsetWidth;
    const cardWidth = wrapperWidth / perView;
    track.style.transform = `translateX(-${slideIndex * cardWidth}px)`;

    prevBtn.disabled = slideIndex === 0;
    nextBtn.disabled = slideIndex >= maxSlide;

    const navContainer = prevBtn.parentElement;
    if (navContainer) {
      if (cards.length <= perView) {
        navContainer.style.opacity = '0.3';
        navContainer.style.pointerEvents = 'none';
      } else {
        navContainer.style.opacity = '1';
        navContainer.style.pointerEvents = 'auto';
      }
    }
  }

  prevBtn.addEventListener('click', () => {
    if (slideIndex > 0) {
      slideIndex--;
      updateSlider();
    }
  });

  nextBtn.addEventListener('click', () => {
    const cards = track.querySelectorAll('.portfolio-slider-card');
    const maxSlide = Math.max(0, cards.length - getPerView());
    if (slideIndex < maxSlide) {
      slideIndex++;
      updateSlider();
    }
  });

  window.addEventListener('resize', () => {
    slideIndex = 0;
    updateSlider();
  });

  updateSlider();
}

setupPortfolioSlider('webTrack', 'webPrev', 'webNext');
setupPortfolioSlider('mobileTrack', 'mobilePrev', 'mobileNext');

// ===== Project Details Modal =====
const projectOverlay = document.getElementById('projectModalOverlay');
const projectModalClose = document.getElementById('projectModalClose');
const projectModalImg = document.getElementById('projectModalImg');
const projectModalBadge = document.getElementById('projectModalBadge');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalTech = document.getElementById('projectModalTech');
const projectModalDesc = document.getElementById('projectModalDesc');
const projectModalLiveBtn = document.getElementById('projectModalLiveBtn');
const projectModalGithubBtn = document.getElementById('projectModalGithubBtn');

document.querySelectorAll('.portfolio-details-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const card = btn.closest('.portfolio-slider-card');
    if (!card) return;

    projectModalTitle.textContent = card.dataset.title || 'Project Details';
    projectModalImg.src = card.dataset.img || 'https://placehold.co/400x250';

    // Badge
    projectModalBadge.textContent = card.dataset.badge || 'Project';
    projectModalBadge.className = 'portfolio-card-badge ' + (card.dataset.badgeClass || 'web-badge');

    // Tech Pills
    projectModalTech.innerHTML = '';
    const techList = (card.dataset.tech || '').split(',');
    techList.forEach(tech => {
      if (!tech.trim()) return;
      const pill = document.createElement('span');
      pill.className = 'tech-pill';
      pill.textContent = tech.trim();
      projectModalTech.appendChild(pill);
    });

    // Description
    projectModalDesc.textContent = card.dataset.desc || '';

    // Links
    if (card.dataset.link && card.dataset.link !== '#') {
      projectModalLiveBtn.href = card.dataset.link;
      projectModalLiveBtn.style.display = 'inline-flex';
    } else {
      projectModalLiveBtn.style.display = 'none';
    }

    if (card.dataset.github) {
      projectModalGithubBtn.href = card.dataset.github;
      projectModalGithubBtn.style.display = 'inline-flex';
    } else {
      projectModalGithubBtn.style.display = 'none';
    }

    projectOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

if (projectModalClose) {
  projectModalClose.addEventListener('click', closeProjectModal);
}
if (projectOverlay) {
  projectOverlay.addEventListener('click', (e) => {
    if (e.target === projectOverlay) closeProjectModal();
  });
}

function closeProjectModal() {
  if (projectOverlay) projectOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== Certificates Carousel =====
const detailCards = document.querySelectorAll('.cert-detail-card');
let currentSlide = 0;
const track = document.getElementById('certTrack');
const prevBtn = document.getElementById('certPrev');
const nextBtn = document.getElementById('certNext');

function getVisibleCards() {
  return [...detailCards].filter(c => c.style.display !== 'none');
}
function getCardsPerView() {
  if (window.innerWidth < 576) return 1;
  if (window.innerWidth < 992) return 2;
  return 3;
}
function updateCarousel() {
  const cards = getVisibleCards();
  const perView = getCardsPerView();
  const maxSlide = Math.max(0, cards.length - perView);
  currentSlide = Math.min(currentSlide, maxSlide);
  const cardWidth = track.parentElement.offsetWidth / perView;
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  updateCarouselBtns();
}
function updateCarouselBtns() {
  const cards = getVisibleCards();
  const perView = getCardsPerView();
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide >= cards.length - perView;
}
prevBtn.addEventListener('click', () => { currentSlide--; updateCarousel(); });
nextBtn.addEventListener('click', () => { currentSlide++; updateCarousel(); });
window.addEventListener('resize', () => { currentSlide = 0; updateCarousel(); });
updateCarouselBtns();

// ===== Certificates Modal =====
const overlay = document.getElementById('certModalOverlay');
const modalClose = document.getElementById('certModalClose');
const modalImg = document.getElementById('certModalImg');
const modalTitle = document.getElementById('certModalTitle');
const modalMeta = document.getElementById('certModalMeta');
const modalBody = document.getElementById('certModalBody');

document.querySelectorAll('.cert-view-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.cert-detail-card');
    const img = card.querySelector('.cert-card-img');
    if (img) modalImg.src = img.src;
    modalTitle.textContent = card.dataset.title;
    modalMeta.textContent = card.dataset.org + ' · ' + card.dataset.date;
    modalBody.textContent = card.dataset.desc;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});
modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
function closeModal() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== Custom Scrollbar =====
(function () {
  const track = document.getElementById('sb-track');
  const thumb = document.getElementById('sb-thumb');
  if (!track || !thumb) return;

  function update() {
    const sh = document.documentElement.scrollHeight;
    const vh = window.innerHeight;
    const st = window.scrollY;
    const th = track.clientHeight;
    const tbh = Math.max(45, (vh / sh) * th * 0.9);
    const tbt = sh > vh ? (st / (sh - vh)) * (th - tbh) : 0;
    thumb.style.height = tbh + 'px';
    thumb.style.top = tbt + 'px';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Click track to jump
  track.addEventListener('click', function (e) {
    if (e.target === thumb) return;
    const r = track.getBoundingClientRect();
    const p = (e.clientY - r.top) / track.clientHeight;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: p * maxScroll, behavior: 'smooth' });
  });

  // Drag thumb (Ultra Smooth)
  let drag = false, sy = 0, ss = 0, rafId = null;

  thumb.addEventListener('mousedown', function (e) {
    drag = true;
    sy = e.clientY;
    ss = window.scrollY;
    thumb.classList.add('sb-drag');
    thumb.style.transition = 'none';
    document.documentElement.style.scrollBehavior = 'auto'; // Disable smooth scroll while dragging
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!drag) return;
    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(function () {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const availableTrack = track.clientHeight - thumb.clientHeight;
      if (availableTrack <= 0) return;

      const delta = e.clientY - sy;
      const newScroll = ss + (delta / availableTrack) * maxScroll;
      window.scrollTo(0, Math.max(0, Math.min(newScroll, maxScroll)));
    });
  });

  document.addEventListener('mouseup', function () {
    if (!drag) return;
    drag = false;
    if (rafId) cancelAnimationFrame(rafId);
    thumb.classList.remove('sb-drag');
    thumb.style.transition = '';
    document.documentElement.style.scrollBehavior = ''; // Restore smooth scroll
    document.body.style.userSelect = '';
  });

  // Wheel over track scrolls page
  track.addEventListener('wheel', function (e) {
    window.scrollBy({ top: e.deltaY });
  }, { passive: true });
})();

// ===== CONTACT SECTION INTERACTIVITY & TOAST =====
(function () {
  const contactForm = document.getElementById('contactForm');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('contactToast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer = null;

  function showToast(msg, isError = false) {
    if (!toast || !toastMessage || !toastIcon) return;
    toastMessage.textContent = msg;

    if (isError) {
      toast.classList.add('toast-error');
      toastIcon.className = 'fa-solid fa-circle-xmark toast-icon text-danger';
    } else {
      toast.classList.remove('toast-error');
      toastIcon.className = 'fa-solid fa-circle-check toast-icon text-success';
    }

    toast.classList.add('toast-show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('toast-show');
    }, 3500);
  }

  // --- Copy Email ---
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      const email = 'tareknabilhelmy1122@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email address copied to clipboard! 📋');
        }).catch(() => {
          fallbackCopy(email);
        });
      } else {
        fallbackCopy(email);
      }
    });
  }

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast('Email address copied to clipboard! 📋');
    } catch (err) {
      showToast('Failed to copy email', true);
    }
    document.body.removeChild(input);
  }

  // --- Form Submit ---
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      const submitBtn = document.getElementById('contactSubmitBtn');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        showToast('Please fill out all fields before sending.', true);
        return;
      }

      // Simple Email Regex Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', true);
        return;
      }

      // Loading state
      const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
      const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

      if (submitBtn) {
        if (btnText) btnText.classList.add('d-none');
        if (btnSpinner) btnSpinner.classList.remove('d-none');
        submitBtn.disabled = true;
      }

      try {
        const response = await fetch('https://formsubmit.co/ajax/tareknabilhelmy1122@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            message: message,
            _subject: 'New Portfolio Message from ' + name,
            _template: 'table',
            _captcha: 'false'
          })
        });

        const data = await response.json();

        if (response.ok && (data.success === 'true' || data.success === true)) {
          showToast('Thank you, ' + name + '! Your message has been sent successfully. ✨');
          contactForm.reset();
        } else {
          // If server returned a specific message (e.g. activation required)
          const errorMsg = data.message || 'Failed to send message. Please check if activation is needed.';
          showToast(errorMsg, true);
        }
      } catch (error) {
        console.error('Contact Form Error:', error);
        // If fetch fails (e.g. opened from local file:///), fallback to standard form submit
        if (window.location.protocol === 'file:') {
          showToast('Notice: file:/// protocol blocks direct AJAX. Submitting form...', false);
          contactForm.action = 'https://formsubmit.co/tareknabilhelmy1122@gmail.com';
          contactForm.method = 'POST';
          contactForm.submit();
          return;
        }
        showToast('Connection error. Please check your internet or try again.', true);
      } finally {
        if (submitBtn) {
          if (btnText) btnText.classList.remove('d-none');
          if (btnSpinner) btnSpinner.classList.add('d-none');
          submitBtn.disabled = false;
        }
      }
    });
  }
})();

