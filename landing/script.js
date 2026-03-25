/* ================================================================
   DailyClip — script.js
   담당: Intersection Observer (fade-in), 모달, smooth scroll
   ================================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     1. Intersection Observer — fade-in
     ────────────────────────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeEls.forEach((el) => observer.observe(el));
  } else {
    /* IntersectionObserver 미지원 환경 폴백 */
    fadeEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ──────────────────────────────────────────────
     2. 모달
     ────────────────────────────────────────────── */
  const modal        = document.getElementById('modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.getElementById('modal-close');
  const modalConfirm = document.getElementById('modal-confirm');

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* CTA 버튼 — Hero / Banner: 로그인 여부에 따라 분기 */
  function handleCta() {
    const dest = localStorage.getItem('token')
      ? '../app/index.html'
      : '../app/login.html';
    location.href = dest;
  }

  const ctaHero = document.getElementById('cta-hero');
  if (ctaHero) ctaHero.addEventListener('click', handleCta);

  const ctaBanner = document.getElementById('cta-banner-btn');
  if (ctaBanner) ctaBanner.addEventListener('click', handleCta);

  /* 닫기: 닫기 버튼 */
  if (modalClose) modalClose.addEventListener('click', closeModal);

  /* 닫기: 확인 버튼 */
  if (modalConfirm) modalConfirm.addEventListener('click', closeModal);

  /* 닫기: 오버레이 클릭 */
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  /* 닫기: ESC 키 */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* ──────────────────────────────────────────────
     3. "둘러보기" smooth scroll
        (CSS scroll-behavior: smooth 가 선언되어 있으나
         href="#..." anchor 방식으로 동작하므로 JS 보완)
     ────────────────────────────────────────────── */
  const scrollLinks = document.querySelectorAll('a[href^="#"]');

  scrollLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);

      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
