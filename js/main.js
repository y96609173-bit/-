/* ================================================
   شركة أجواد الأولى - JavaScript الرئيسي
   (نسخة محسّنة للأداء)
   ================================================ */

'use strict';

// ============ DOM Ready ============
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initScrollHandler();   // << دمج كل scroll listeners في واحدة
  initMobileMenu();
  initScrollAnimations();
  initParticles();
  initCounters();
  initContactForm();
  initSmoothScroll();
  updateFooterYear();
  initBrandsFilter();
  addActiveNavStyle();
});

// ============ Loading Screen ============
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (!loadingScreen) return;
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    document.body.style.overflow = '';
  }, 1800);
}

// ============ UNIFIED SCROLL HANDLER (أداء مثالي) ============
// دمج كل scroll events في listener واحدة مع rAF
function initScrollHandler() {
  const navbar    = document.getElementById('navbar');
  const scrollBtn = document.getElementById('scrollTop');
  const sections  = [...document.querySelectorAll('section[id]')];
  const navLinks  = [...document.querySelectorAll('.navbar-menu a')];

  // Pre-calculate heights to prevent layout thrashing on every scroll event
  let sectionOffsets = [];
  function calculateOffsets() {
    sectionOffsets = sections.map(sec => ({
      id: sec.id,
      top: sec.offsetTop
    }));
  }

  window.addEventListener('resize', calculateOffsets);
  calculateOffsets();
  setTimeout(calculateOffsets, 500); // Recalculate after page finishes rendering fully

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(processScroll);
      ticking = true;
    }
  }

  function processScroll() {
    const scrollY = window.pageYOffset;
    
    // Experimental Editorial Parallax Animations
    const heroBg = document.getElementById('heroBg');
    const heroTitleWrap = document.getElementById('heroTitleWrap');
    const heroProjCard = document.getElementById('heroProjCard');
    const archBorder = document.getElementById('archBorder');
    const archImg = document.getElementById('archImg');
    const floatProjectBadge = document.getElementById('floatProjectBadge');
    
    const editorialBorder = document.querySelector('.editorial-frame-border');
    const editorialImg = document.querySelector('.editorial-img-photo');
    const heroHeight = window.innerHeight;

    if (scrollY < heroHeight + 100) {
      // 1. Background image zooms in slowly
      if (heroBg) {
        const bgScale = 1 + (scrollY * 0.00025);
        heroBg.style.transform = `scale(${bgScale}) translate3d(0, 0, 0)`;
      }

      // 2. Title block slides up and fades out
      if (heroTitleWrap) {
        const titleY = scrollY * 0.32;
        const titleOpacity = Math.max(0, 1 - (scrollY * 0.0022));
        heroTitleWrap.style.transform = `translate3d(0, ${titleY}px, 0)`;
        heroTitleWrap.style.opacity = titleOpacity;
      }

      // 3. Floating project card slides right and down
      if (heroProjCard) {
        const cardX = scrollY * 0.12;
        const cardY = scrollY * 0.16;
        heroProjCard.style.transform = `translate3d(${cardX}px, ${cardY}px, 0)`;
      }

      // Legacy support for other pages if needed
      if (archBorder) {
        const borderY = scrollY * 0.12;
        const borderRot = scrollY * 0.012;
        archBorder.style.transform = `translate3d(0, ${borderY}px, 0) rotate(${borderRot}deg)`;
      }
      if (archImg) {
        const imgScale = 1 + (scrollY * 0.0002);
        const imgY = scrollY * 0.06;
        archImg.style.transform = `scale(${imgScale}) translate3d(0, ${imgY}px, 0)`;
      }
      if (floatProjectBadge) {
        const badgeX = scrollY * 0.12;
        const badgeY = scrollY * 0.18;
        floatProjectBadge.style.transform = `translate3d(${badgeX}px, ${badgeY}px, 0)`;
      }
    }

    // 4. Overlapping editorial images parallax (about section)
    if (editorialBorder && editorialImg) {
      const parentRect = editorialImg.getBoundingClientRect();
      if (parentRect.top < window.innerHeight && parentRect.bottom > 0) {
        const elementVisibleOffset = window.innerHeight - parentRect.top;
        const borderY = elementVisibleOffset * 0.05;
        const imgScale = 1 + (elementVisibleOffset * 0.00008);
        
        editorialBorder.style.transform = `translate3d(0, ${borderY}px, 0)`;
        editorialImg.style.transform = `scale(${imgScale})`;
      }
    }

    // 1. Navbar scrolled style toggle
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 80);
    }

    // 2. Scroll-to-top button visibility
    if (scrollBtn) {
      scrollBtn.classList.toggle('visible', scrollY > 400);
    }

    // 3. Highlight current navbar active link (using cached offsets!)
    if (navLinks.length) {
      const pos = scrollY + 120;
      let currentId = '';
      for (const sec of sectionOffsets) {
        if (pos >= sec.top) {
          currentId = sec.id;
        }
      }
      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('active', isActive);
      });
    }

    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Scroll-to-top button click
  scrollBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============ Mobile Menu ============
function initMobileMenu() {
  const toggle     = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn   = document.getElementById('mobileClose');

  if (!toggle || !mobileMenu) return;

  const openMenu  = () => { toggle.classList.add('active'); mobileMenu.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { toggle.classList.remove('active'); mobileMenu.classList.remove('active'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', () => mobileMenu.classList.contains('active') ? closeMenu() : openMenu());
  closeBtn?.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', closeMenu));
  mobileMenu.addEventListener('click', e => { if (e.target === mobileMenu) closeMenu(); });
}

// ============ Scroll Animations (Intersection Observer) ============
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ============ Hero Particles (عدد أقل + will-change) ============
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  // تقليل العدد من 25 إلى 12 للأداء
  const count = 12;
  const frag  = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 2;
    p.style.cssText =
      `width:${size}px;height:${size}px;` +
      `left:${Math.random() * 100}%;` +
      `top:${Math.random() * 100}%;` +
      `animation-duration:${Math.random() * 12 + 8}s;` +
      `animation-delay:${Math.random() * 6}s;` +
      `opacity:${Math.random() * 0.4 + 0.15};`;
    frag.appendChild(p);
  }
  container.appendChild(frag);
}

// ============ Number Counters ============
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target')) || 0;
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutQuart للحصول على تأثير طبيعي
    const eased    = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ============ Contact Form ============
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const successEl = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('fullName')?.value.trim();
    const phone = document.getElementById('phoneNumber')?.value.trim();

    if (!name || name.length < 2)   { showFieldError('fullName',  'الرجاء إدخال اسم صحيح');         return; }
    if (!phone || phone.length < 10) { showFieldError('phoneNumber', 'الرجاء إدخال رقم هاتف صحيح'); return; }

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled  = true;

    await new Promise(r => setTimeout(r, 1500));

    form.style.display    = 'none';
    successEl.style.display = 'block';

    setTimeout(() => {
      form.reset();
      form.style.display    = 'block';
      successEl.style.display = 'none';
      submitBtn.innerHTML  = '<i class="fas fa-paper-plane"></i> إرسال الرسالة';
      submitBtn.disabled   = false;
    }, 5000);
  });

  form.querySelectorAll('.form-control').forEach(inp =>
    inp.addEventListener('input', () => { inp.style.borderColor = ''; })
  );
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#e74c3c';
  el.focus();

  const prev = el.nextElementSibling;
  if (prev?.classList.contains('field-error')) prev.remove();

  const err = document.createElement('small');
  err.className = 'field-error';
  err.style.cssText = 'color:#e74c3c;font-size:0.8rem;display:block;margin-top:4px;';
  err.textContent   = msg;
  el.parentNode.appendChild(err);

  setTimeout(() => { el.style.borderColor = ''; err.remove(); }, 3000);
}

// ============ Smooth Scroll ============
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = (document.getElementById('navbar')?.offsetHeight || 80);
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
    });
  });
}

// ============ Update Footer Year ============
function updateFooterYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

// ============ Brands hover pause ============
// ============ Interactive Brands Filter (UX) ============
function initBrandsFilter() {
  const tabs = document.querySelectorAll('.filter-tab-btn');
  const cards = document.querySelectorAll('.brand-card-ux');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active states
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-category');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || (cat && cat.split(' ').includes(filter))) {
          card.classList.remove('hide');
          card.style.animation = 'none';
          card.offsetHeight; // Trigger reflow
          card.style.animation = 'cardFadeIn 0.4s ease forwards';
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
}

function initBrandsHover() {
  const track = document.getElementById('brandsTrack');
  if (!track) return;
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
}

// ============ Active Nav CSS ============
function addActiveNavStyle() {
  const s = document.createElement('style');
  s.textContent =
    '.navbar-menu a.active{color:var(--gold-primary)!important;}' +
    '.navbar-menu a.active::after{width:100%!important;}';
  document.head.appendChild(s);
}

// ============ Service Modal ============
const serviceData = {
  1: {
    icon: '<i class="fas fa-paint-roller"></i>',
    title: 'أعمال التشطيبات والخرفيات',
    body: 'نوفر أفخم وأجود مواد التشطيب من أكبر موردين عالميين، مع فريق تركيب محترف يضمن أعلى معايير الإتقان والجودة.',
    items: ['سيراميك وبورسلان إيطالي وإسباني', 'رخام طبيعي وصناعي فاخر', 'أعمال جبسية وديكور داخلي', 'دهانات وورق جدران عالي الجودة', 'أسقف مستعارة وجبس بورد']
  },
  2: {
    icon: '<i class="fas fa-seedling"></i>',
    title: 'تنسيق الحدائق والمساحات الخضراء',
    body: 'نحوّل مساحتك الخارجية إلى تحفة فنية حية بأيدي مصممين محترفين وفق أحدث توجهات اللاندسكيب العالمية.',
    items: ['تصميم وتأسيس حدائق جديدة', 'زراعة أشجار ونباتات متنوعة', 'أنظمة ري ذكية وموفرة للمياه', 'ترميم وتأهيل المساحات القائمة', 'مسابح ونوافير ديكورية']
  },
  3: {
    icon: '<i class="fas fa-bolt"></i>',
    title: 'أعمال الطاقة الكهربائية والسباكة',
    body: 'حلول كهربائية وسباكة متكاملة بأدق المعدات وأجودها، مع فريق مهندسين معتمدين لضمان السلامة والكفاءة.',
    items: ['تركيب لوحات كهربائية ذكية', 'أنظمة توزيع طاقة عالية الكفاءة', 'شبكات سباكة وصرف صحي', 'طاقة شمسية وأنظمة موفرة للطاقة', 'صيانة دورية وطوارئ 24/7']
  },
  4: {
    icon: '<i class="fas fa-shield-alt"></i>',
    title: 'أنظمة الأمن والمراقبة الذكية',
    body: 'نوفر الحماية الشاملة لمشاريعكم بأحدث أنظمة المراقبة والتحكم الذكي من كبرى العلامات العالمية.',
    items: ['كاميرات مراقبة فائقة الدقة', 'أنظمة إنذار حريق وسرقة', 'تحكم بالدخول وبصمة الوجه', 'مراقبة عن بعد عبر الهاتف', 'حماية محيطية متكاملة']
  },
  5: {
    icon: '<i class="fas fa-lightbulb"></i>',
    title: 'أنظمة الإنارة العصرية',
    body: 'نجلب أحدث تقنيات الإنارة من المصادر العالمية المعتمدة لتوفير بيئة مضيئة مريحة وموفرة للطاقة.',
    items: ['إنارة داخلية LED عالية الكفاءة', 'إنارة خارجية وحدائق', 'تحكم ذكي بالإضاءة (Dimmer)', 'إنارة معمارية وفنية', 'توفير 60% في استهلاك الطاقة']
  },
  6: {
    icon: '<i class="fas fa-truck-moving"></i>',
    title: 'اللوجستية والاستيراد',
    body: 'نتولى استيراد جميع مواد البناء ومستلزمات مشاريعكم من أفضل المصادر العالمية بأسعار تنافسية وتوصيل سريع.',
    items: ['استيراد من الصين وأوروبا وتركيا', 'إجراءات جمركية متكاملة', 'تخزين ومستودعات متطورة', 'توصيل لموقع المشروع مباشرة', 'ضمان جودة الشحنات والمطابقة']
  },
  7: {
    icon: '<i class="fas fa-hard-hat"></i>',
    title: 'أعمال العظم والمقاولات',
    body: 'ننفذ أعمال الهيكل الإنشائي والمقاولات العامة بأعلى معايير الجودة والسلامة، وفق المواصفات الهندسية المعتمدة في المملكة.',
    items: ['حفر وتأسيس وخوازيق', 'أعمال الخرسانة والحديد', 'رفع المباني التجارية والسكنية', 'إشراف هندسي ومتابعة يومية', 'الالتزام بالجداول الزمنية']
  },
  8: {
    icon: '<i class="fas fa-laptop-house"></i>',
    title: 'الأتمتة والمنازل الذكية',
    body: 'نحوّل منزلك أو مشروعك إلى بيئة ذكية متكاملة تتحكم بها بضغطة زر من أي مكان في العالم.',
    items: ['تحكم موحد عبر تطبيق واحد', 'أتمتة الإضاءة والتكييف', 'أنظمة صوت وترفيه متكاملة', 'تكامل مع Alexa وGoogle Home', 'صيانة ودعم فني متخصص']
  }
};

(function initServiceModal() {
  const overlay = document.getElementById('serviceModalOverlay');
  const closeBtn = document.getElementById('serviceModalClose');
  const modalIcon = document.getElementById('serviceModalIcon');
  const modalTitle = document.getElementById('serviceModalTitle');
  const modalBody = document.getElementById('serviceModalBody');
  const modalList = document.getElementById('serviceModalList');
  const modalCta = document.getElementById('serviceModalCta');
  if (!overlay) return;

  function openModal(id) {
    const data = serviceData[id];
    if (!data) return;
    modalIcon.innerHTML = data.icon;
    modalTitle.textContent = data.title;
    modalBody.textContent = data.body;
    modalList.innerHTML = data.items.map(i => `<li>${i}</li>`).join('');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.service-card[data-modal]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.modal));
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  if (modalCta) modalCta.addEventListener('click', closeModal);
})();
