/* =========================================================
   WESTWING — script.js (versão revisada)
   ========================================================= */
(function () {
  "use strict";

  /* ----- Utilitários ----- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- 1. Scroll suave com offset do header ----- */
  function initSmoothScroll() {
    const header = $(".main-header");
    const headerOffset = header ? header.offsetHeight + 12 : 80;

    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.getElementById(href.slice(1));
        if (!target) return;

        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: top,
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });

        if (history.pushState) history.pushState(null, "", href);
      });
    });
  }

  /* ----- 2. Menu ativo conforme seção visível ----- */
  function initActiveNavHighlight() {
    if (!("IntersectionObserver" in window)) return;

    const navLinks = $$('.main-nav a[href^="#"]');
    if (!navLinks.length) return;

    const linkById = new Map();
    const sections = [];

    navLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (section) {
        linkById.set(id, link);
        sections.push(section);
      }
    });

    if (!sections.length) return;

    const setActive = (id) => {
      navLinks.forEach((l) => l.classList.remove("is-active"));
      const active = linkById.get(id);
      if (active) active.classList.add("is-active");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ----- 3. Scroll reveal ----- */
  function initScrollReveal() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    const targets = $$(".card, .section-title, .privacy-content, .contact-card, .data-table");
    if (!targets.length) return;

    targets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ----- 4. Botão voltar ao topo ----- */
  function initBackToTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Voltar ao topo da página");
    btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);

    const toggle = () => {
      if (window.pageYOffset > 500) btn.classList.add("is-visible");
      else btn.classList.remove("is-visible");
    };

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  /* ----- 5. Tilt 3D nos cards ----- */
  function initCardTilt() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    $$(".info-card, .contact-card").forEach((card) => {
      let rafId = null;

      card.addEventListener("mousemove", (event) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const rotateX = ((y - cy) / cy) * -3;
          const rotateY = ((x - cx) / cx) * 3;
          card.style.transform =
            "translateY(-6px) perspective(900px) rotateX(" +
            rotateX +
            "deg) rotateY(" +
            rotateY +
            "deg)";
          rafId = null;
        });
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    });
  }

  /* ----- 6. Ripple ----- */
  function initRipple() {
    if (prefersReducedMotion) return;

    $$(".contact-card, .badge").forEach((el) => {
      const computed = window.getComputedStyle(el);
      if (computed.position === "static") el.style.position = "relative";
      el.style.overflow = "hidden";

      el.addEventListener("click", (event) => {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = size + "px";
        ripple.style.height = size + "px";
        ripple.style.left = event.clientX - rect.left - size / 2 + "px";
        ripple.style.top = event.clientY - rect.top - size / 2 + "px";
        el.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      });
    });
  }

  /* ----- 7. Ano dinâmico no footer ----- */
  function initDynamicYear() {
    const copy = $(".footer-copy");
    if (!copy) return;
    copy.innerHTML = "&copy; " + new Date().getFullYear() + " Westwing. Todos os direitos reservados.";
  }

  /* ----- 8. Copiar e-mail com feedback ----- */
  function initEmailCopy() {
    const emailCard = $$(".contact-card").find((card) => {
      const href = card.getAttribute("href") || "";
      return href.indexOf("mailto:") === 0;
    });
    if (!emailCard) return;

    const email = emailCard.getAttribute("href").replace("mailto:", "");
    const label = emailCard.querySelector("p");
    if (!label) return;

    emailCard.addEventListener("click", (event) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      event.preventDefault();

      const showFeedback = (text) => {
        label.textContent = text;
        label.style.color = "var(--color-accent)";
        setTimeout(() => {
          label.textContent = email;
          label.style.color = "";
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(email)
          .then(() => showFeedback("E-mail copiado! \u2713"))
          .catch(() => showFeedback("Falha ao copiar"));
      } else {
        showFeedback("Copie manualmente");
      }
    });
  }

  /* ----- Bootstrap ----- */
  document.addEventListener("DOMContentLoaded", () => {
    initSmoothScroll();
    initActiveNavHighlight();
    initScrollReveal();
    initBackToTop();
    initCardTilt();
    initRipple();
    initDynamicYear();
    initEmailCopy();
  });
})();
