/* =====================================================
   PORTFOLIO DESAIN GRAFIS — script.js
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Custom Cursor ───────────────────────────────────
  if (window.matchMedia('(hover: hover)').matches) {
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left  = mouseX - 4 + 'px';
      dot.style.top   = mouseY - 4 + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX - 16 + 'px';
      ring.style.top  = ringY - 16 + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .portfolio-card, .social-link').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width  = '50px';
        ring.style.height = '50px';
        ring.style.borderColor = 'var(--olive-dark)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width  = '32px';
        ring.style.height = '32px';
        ring.style.borderColor = 'var(--olive-main)';
      });
    });
  }

  // ─── Navbar Scroll ───────────────────────────────────
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 30);
  });

  // ─── Active Nav Link ─────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ─── Hamburger / Mobile Nav ───────────────────────────
  const hamburger  = document.querySelector('.hamburger');
  const mobileNav  = document.querySelector('.mobile-nav');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav?.classList.toggle('open');
    document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
  });

  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ─── Scroll Reveal ───────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));

  // ─── Portfolio Filter ─────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.filter;
      portfolioCards.forEach(card => {
        const match = category === 'all' || card.dataset.category === category;
        card.style.display = match ? '' : 'none';
        if (match) {
          card.style.animation = 'fadeIn 0.4s ease forwards';
        }
      });
    });
  });

  // ─── Contact Form Submit ───────────────────────────────
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name  = form.querySelector('[name="name"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const msg   = form.querySelector('[name="message"]')?.value.trim();

    if (!name || !email || !msg) {
      showToast('Harap isi semua bidang!', 'error');
      return;
    }

    showToast(`Pesan dikirim! Terima kasih, ${name} 🌿`);
    form.reset();
  });

  // ─── Toast Notification ───────────────────────────────
  function showToast(message, type = 'success') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.background = type === 'error' ? '#c0392b' : 'var(--olive-dark)';
    toast.classList.add('show');

    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // ─── Animated Counter (Hero Stats) ─────────────────────
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseInt(el.dataset.count);
      let start = 0;
      const step = Math.ceil(end / 50);
      const timer = setInterval(() => {
        start = Math.min(start + step, end);
        el.textContent = start + (el.dataset.suffix || '');
        if (start >= end) clearInterval(timer);
      }, 30);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ─── Expose showToast globally ────────────────────────
  window.showToast = showToast;
});

// ─── Session: Tampilkan Halo User + Logout di Navbar ──
document.addEventListener('DOMContentLoaded', () => {
  // Baca sesi — bisa dari API (key: username) atau manual (key: gs_session)
  const session =
    JSON.parse(localStorage.getItem('gs_session')   || 'null') ||
    JSON.parse(sessionStorage.getItem('gs_session') || 'null');

  const usernameRaw =
    localStorage.getItem('username') ||
    sessionStorage.getItem('username');

  const name = session?.name || usernameRaw || null;
  if (!name) return;

  const firstName = name.split(' ')[0];

  // Ganti tombol Login di desktop nav
  const btnLogin = document.querySelector('.nav-links .btn-login');
  if (btnLogin) {
    btnLogin.outerHTML = `
      <div class="nav-user">
        <span class="nav-greeting">👋 Halo, <strong>${firstName}</strong></span>
        <button class="btn-logout-nav" id="logoutNavBtn">Logout</button>
      </div>`;
    document.getElementById('logoutNavBtn')?.addEventListener('click', doLogout);
  }

  // Ganti link Login di mobile nav
  const mobileLoginLink = document.querySelector('.mobile-nav a[href="login/login.html"]');
  if (mobileLoginLink) {
    mobileLoginLink.outerHTML = `
      <span style="color:var(--olive-dark);font-weight:700;font-family:var(--font-display);font-size:1.5rem;">👋 Halo, ${firstName}</span>
      <button class="btn-logout-nav" id="logoutMobileBtn" style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;background:none;border:none;color:var(--black);cursor:pointer;">Logout</button>`;
    document.getElementById('logoutMobileBtn')?.addEventListener('click', doLogout);
  }

  function doLogout() {
    if (!confirm('Yakin ingin keluar?')) return;
    localStorage.removeItem('gs_session');
    localStorage.removeItem('username');
    sessionStorage.removeItem('gs_session');
    sessionStorage.removeItem('username');
    window.location.reload();
  }
});
