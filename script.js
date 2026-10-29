/* =========================================================
   WESTWING — script.js
   Autor: Programador Sênior (30+ anos)
   Escopo: Interatividade, acessibilidade e micro-animações
   Dependências: Nenhuma (vanilla JS puro)
   ========================================================= */

(function () {
    'use strict';

    /* ---------------------------------------------------------
       1. UTILITÁRIOS
    --------------------------------------------------------- */
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------
       2. SCROLL SUAVE COM COMPENSAÇÃO DO HEADER STICKY
       — Evita que o título da seção fique escondido sob o header
    --------------------------------------------------------- */
    function initSmoothScroll() {
        const header = $('.main-header');
        const headerOffset = header ? header.offsetHeight + 12 : 80;

        $$('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetId = link.getAttribute('href');
                if (!targetId || targetId === '#') return;

                const target = document.getElementById(targetId.slice(1));
                if (!target) return;

                event.preventDefault();

                const targetPosition =
                    target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });

                // Atualiza o hash sem "pular" a página
                history.pushState(null, '', targetId);

                // Move o foco para acessibilidade (leitores de tela)
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            });
        });
    }

    /* ---------------------------------------------------------
       3. MENU ATIVO CONFORME A SEÇÃO VISÍVEL (IntersectionObserver)
    --------------------------------------------------------- */
    function initActiveNavHighlight() {
        const navLinks = $$('.main-nav a[href^="#"]');
        const sections = navLinks
            .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
            .filter(Boolean);

        if (!sections.length || !('IntersectionObserver' in window)) return;

        const linkBySectionId = new Map();
        navLinks.forEach((link) => {
            linkBySectionId.set(link.getAttribute('href').slice(1), link);
        });

        const setActive = (id) => {
            navLinks.forEach((link) => link.classList.remove('is-active'));
            const activeLink = linkBySectionId.get(id);
            if (activeLink) activeLink.classList.add('is-active');
        };

        const observer = new IntersectionObserver(
            (entries) => {
                // Pega a entrada mais visível
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible.length > 0) {
                    setActive(visible[0].target.id);
                }
            },
            {
                rootMargin: '-45% 0px -45% 0px',
                threshold: [0, 0.25, 0.5, 0.75, 1]
            }
        );

        sections.forEach((section) => observer.observe(section));
    }

    /* ---------------------------------------------------------
       4. ANIMAÇÃO DE ENTRADA AO ROLAR (fade + slide)
       — Aplicada apenas se o usuário não preferir movimento reduzido
    --------------------------------------------------------- */
    function initScrollReveal() {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

        const revealTargets = $$('.card, .section-title, .privacy-content, .contact-card, .data-table');
        if (!revealTargets.length) return;

        revealTargets.forEach((el) => el.classList.add('reveal'));

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal--visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        revealTargets.forEach((el) => observer.observe(el));
    }

    /* ---------------------------------------------------------
       5. BOTÃO "VOLTAR AO TOPO" DINÂMICO
    --------------------------------------------------------- */
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Voltar ao topo da página');
        btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        document.body.appendChild(btn);

        const toggleVisibility = () => {
            if (window.pageYOffset > 500) {
                btn.classList.add('is-visible');
            } else {
                btn.classList.remove('is-visible');
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();

        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    /* ---------------------------------------------------------
       6. EFEITO TILT SUAVE NOS CARDS (apenas desktop + mouse)
       — Puro CSS transform, sem bibliotecas
    --------------------------------------------------------- */
    function initCardTilt() {
        if (prefersReducedMotion) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const cards = $$('.info-card, .contact-card');

        cards.forEach((card) => {
            let rafId = null;

            card.addEventListener('mousemove', (event) => {
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -3;
                    const rotateY = ((x - centerX) / centerX) * 3;

                    card.style.transform = `translateY(-6px) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    rafId = null;
                });
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            });
        });
    }

    /* ---------------------------------------------------------
       7. EFEITO RIPPLE NOS CARDS DE CONTATO
       — Feedback visual imediato no clique
    --------------------------------------------------------- */
    function initRipple() {
        if (prefersReducedMotion) return;

        const rippleTargets = $$('.contact-card, .badge, .nav-privacy');

        rippleTargets.forEach((el) => {
            el.style.position = el.style.position || 'relative';
            el.style.overflow = 'hidden';

            el.addEventListener('click', (event) => {
                const rect = el.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const ripple = document.createElement('span');
                ripple.className = 'ripple';

                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

                el.appendChild(ripple);

                ripple.addEventListener('animationend', () => ripple.remove());
            });
        });
    }

    /* ---------------------------------------------------------
       8. ANO DINÂMICO NO FOOTER
    --------------------------------------------------------- */
    function initDynamicYear() {
        const copy = $('.footer-copy');
        if (!copy) return;
        const year = new Date().getFullYear();
        copy.textContent = `© ${year} Westwing. Todos os direitos reservados.`;
    }

    /* ---------------------------------------------------------
       9. COPIAR E-MAIL FISCAL COM FEEDBACK (extra de UX)
    --------------------------------------------------------- */
    function initEmailCopy() {
        const emailCard = $$('.contact-card').find((card) =>
            card.getAttribute('href')?.startsWith('mailto:')
        );
        if (!emailCard) return;

        const email = emailCard.getAttribute('href').replace('mailto:', '');
        const label = emailCard.querySelector('p');
        if (!label) return;

        emailCard.addEventListener('click', (event) => {
            // Em desktop, copia e mostra feedback; em mobile, deixa o mailto agir
            if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
            event.preventDefault();

            const showFeedback = (text) => {
                const original = email;
                label.textContent = text;
                label.style.color = 'var(--color-accent)';
                setTimeout(() => {
                    label.textContent = original;
                    label.style.color = '';
                }, 1800);
            };

            if (navigator.clipboard?.writeText) {
                navigator.clipboard
                    .writeText(email)
                    .then(() => showFeedback('E-mail copiado! ✓'))
                    .catch(() => showFeedback('Falha ao copiar'));
            } else {
                showFeedback('Copie manualmente');
            }
        });
    }

    /* ---------------------------------------------------------
       10. PROTEÇÃO CONTRA CONTEÚDO SEM JS
       — Só executa após o DOM estar pronto
    --------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
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
