/**
 * Elena Thorne — Portfolio Interactivity Script
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Custom Lerp Cursor
  // ==========================================================================
  const cursor = document.getElementById('custom-cursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let hasMoved = false;
  const speed = 0.16; // Lerp lag factor (lower = more lag)

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!hasMoved) {
      cursorX = mouseX;
      cursorY = mouseY;
      hasMoved = true;
    }
  });

  // RequestAnimationFrame lerping loop
  function updateCursor() {
    if (hasMoved) {
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Dynamic hover class scaling on interactive nodes
  document.addEventListener('mouseover', (e) => {
    const interactive = e.target.closest('a, button, select, input, textarea, [role="button"], .project-card, .accordion-header, .project-thumbnail-wrapper');
    if (interactive) {
      cursor.classList.add('hovered');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const interactive = e.target.closest('a, button, select, input, textarea, [role="button"], .project-card, .accordion-header, .project-thumbnail-wrapper');
    if (interactive) {
      // Prevent flicker when crossing borders within the same interactive block
      if (e.relatedTarget && e.relatedTarget.closest('a, button, select, input, textarea, [role="button"], .project-card, .accordion-header, .project-thumbnail-wrapper') === interactive) {
        return;
      }
      cursor.classList.remove('hovered');
    }
  });

  // Hide cursor on scroll to avoid alignment artifacts
  window.addEventListener('scroll', () => {
    cursor.classList.remove('hovered');
  });


  // ==========================================================================
  // 2. Hero Name Splitter & Staggered Load
  // ==========================================================================
  const heroLines = document.querySelectorAll('.hero-name-line');
  const hero = document.getElementById('hero');
  let totalCharCount = 0;

  heroLines.forEach((line) => {
    const text = line.textContent.trim();
    line.innerHTML = '';
    
    for (let char of text) {
      const span = document.createElement('span');
      span.className = 'char';
      
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }
      
      // Compute delay (30ms stagger)
      span.style.transitionDelay = `${totalCharCount * 30}ms`;
      line.appendChild(span);
      totalCharCount++;
    }
  });

  // Set delayed start coordinates for other hero content blocks
  const startDelay = totalCharCount * 30;
  
  const tagline = document.getElementById('hero-tagline');
  tagline.style.transitionDelay = `${startDelay + 150}ms`;

  const portrait = document.getElementById('hero-portrait');
  if (portrait) {
    portrait.style.transitionDelay = `${startDelay + 300}ms`;
  }

  const meta = document.getElementById('hero-meta');
  meta.style.transitionDelay = `${startDelay + 450}ms`;

  const scrollIndicator = document.getElementById('hero-scroll');
  scrollIndicator.style.transitionDelay = `${startDelay + 550}ms`;

  // Trigger load animation on next tick
  setTimeout(() => {
    hero.classList.add('animate-active');
  }, 100);


  // ==========================================================================
  // 3. Scroll Reveals & Navigation Active Dot Handler
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  const revealElements = document.querySelectorAll('.reveal');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links li');

  // Sticky Navbar class on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // IntersectionObserver for element reveals
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Reveal once
      }
    });
  }, {
    root: null,
    threshold: 0.15
  });

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });

  // IntersectionObserver for tracking active sections in Nav
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach((li) => {
          const anchor = li.querySelector('a');
          if (anchor && anchor.getAttribute('href') === `#${activeId}`) {
            li.classList.add('active');
          } else {
            li.classList.remove('active');
          }
        });
      }
    });
  }, {
    root: null,
    threshold: 0.2,
    rootMargin: '-25% 0px -45% 0px' // offset centered viewport
  });

  sections.forEach((sec) => {
    if (['about', 'experience', 'projects', 'contact'].includes(sec.id)) {
      navObserver.observe(sec);
    }
  });


  // ==========================================================================
  // 4. Parallax Hero Portrait
  // ==========================================================================
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        const portraitImg = document.querySelector('.hero-portrait-image');
        if (portraitImg && lastScrollY < window.innerHeight) {
          // Slide image slowly downward at 0.15 ratio
          portraitImg.style.transform = `translate3d(0, ${lastScrollY * 0.15}px, 0) scale(1.15)`;
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });


  // ==========================================================================
  // 5. Work Accordion Expandable Cards
  // ==========================================================================
  const accordionCards = document.querySelectorAll('.accordion-card');

  accordionCards.forEach((card) => {
    const header = card.querySelector('.accordion-header');
    const content = card.querySelector('.accordion-content');

    header.addEventListener('click', () => {
      const isExpanded = card.classList.contains('expanded');

      // Close all accordion cards
      accordionCards.forEach((c) => {
        c.classList.remove('expanded');
        c.querySelector('.accordion-content').style.maxHeight = null;
      });

      // Expand clicked card if it was collapsed
      if (!isExpanded) {
        card.classList.add('expanded');
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });


  // ==========================================================================
  // 6. Contact Email Clipboard Copy
  // ==========================================================================
  const emailBtn = document.getElementById('email-button');
  const tooltip = document.getElementById('copy-tooltip');

  if (emailBtn && tooltip) {
    emailBtn.addEventListener('click', () => {
      const email = emailBtn.getAttribute('data-email') || emailBtn.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        tooltip.classList.add('show');
        setTimeout(() => {
          tooltip.classList.remove('show');
        }, 1800);
      }).catch((err) => {
        console.error('Clipboard copy failed: ', err);
      });
    });
  }


  // ==========================================================================
  // 7. Projects Lightbox Modal Video Player
  // ==========================================================================
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxClose = document.getElementById('lightbox-close');
  const videoTriggers = document.querySelectorAll('[data-video-url]');

  videoTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const videoSrc = trigger.getAttribute('data-video-url');
      if (videoSrc && lightboxModal && lightboxVideo) {
        lightboxVideo.src = videoSrc;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
      }
    });
  });

  function closeVideoModal() {
    if (lightboxModal && lightboxVideo) {
      lightboxModal.classList.remove('active');
      lightboxVideo.pause();
      lightboxVideo.src = '';
      document.body.style.overflow = ''; // Unlock scroll
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeVideoModal);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeVideoModal();
      }
    });
  }

  // Handle ESC key press for closing modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeVideoModal();
    }
  });

});
