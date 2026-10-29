/* =========================================================
   WESTWING — script.js (v2)
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- 1. Menu mobile ----- */
  function initMobileMenu() {
    const toggle = $('.menu-toggle');
    const nav = $('.main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    $$('.main-nav a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  /* ----- 2. Header shadow ao rolar ----- */
  function initHeaderScroll() {
    const header = $('.header-main');
    if (!header) return;

    const onScroll = () => {
      header.style.boxShadow = window.pageYOffset > 10
        ? '0 4px 20px rgba(0,0,0,.06)'
        : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----- 3. Scroll suave com offset do header sticky ----- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.getElementById(href.slice(1));
        if (!target) return;

        e.preventDefault();
        const header = $('.site-header');
        const offset = header ? header.offsetHeight + 16 : 90;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
        if (history.pushState) history.pushState(null, '', href);
      });
    });
  }

  /* ----- 4. Reveal ao rolar ----- */
  function initReveal() {
    if (reduced || !('IntersectionObserver' in window)) return;

    const targets = $$('.category-card, .feature-card, .store-card, .inst-card, .privacy-item, .lifestyle-tile');
    if (!targets.length) return;

    targets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
    });

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    targets.forEach((el) => io.observe(el));
  }

  /* ----- 5. Contador do carrinho (demo interativo) ----- */
  function initCart() {
    const btn = $('.cart-btn');
    const count = $('.cart-count');
    if (!btn || !count) return;

    let n = 0;
    btn.addEventListener('click', () => {
      n += 1;
      count.textContent = String(n);
      count.style.transform = 'scale(1.3)';
      setTimeout(() => { count.style.transform = 'scale(1)'; }, 200);
    });
  }

  /* ----- 6. Favoritos (toggle de ícone) ----- */
  function initWishlist() {
    const btn = $('.icon-btn[aria-label="Favoritos"]');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;

    btn.addEventListener('click', () => {
      const active = icon.classList.contains('fa-solid');
      icon.classList.toggle('fa-solid', !active);
      icon.classList.toggle('fa-regular', active);
      btn.style.color = active ? '' : 'var(--coral)';
    });
  }

  /* ----- 7. Busca (foco visual) ----- */
  function initSearch() {
    const btn = $('.icon-btn[aria-label="Buscar"]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-active');
      if (btn.classList.contains('is-active')) {
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      } else {
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
      }
    });
  }

  /* ----- 8. Ano dinâmico ----- */
  function initYear() {
    const el = $('.footer-bottom-inner p');
    if (!el) return;
    const y = new Date().getFullYear();
    el.innerHTML = el.innerHTML.replace(/©\s*\d{4}/, '© ' + y);
  }

  /* ----- Bootstrap ----- */
  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initReveal();
    initCart();
    initWishlist();
    initSearch();
    initYear();
  });
})();
