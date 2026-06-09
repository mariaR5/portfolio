document.addEventListener('DOMContentLoaded', () => {
  // Accessibility check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     CUSTOM CURSOR PHYSICS LOOP
     ========================================================================== */
  const customCursor = document.getElementById('customCursor');
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  if (customCursor && !prefersReducedMotion) {
    // Track cursor coordinates
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Lerp loop (~80ms lag factor)
    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;

      customCursor.style.left = `${cursorX}px`;
      customCursor.style.top = `${cursorY}px`;

      requestAnimationFrame(updateCursor);
    };
    
    requestAnimationFrame(updateCursor);

    // Dynamic hover listeners for cursor scale expansions
    const interactiveSelectors = 'a, button, .project-media-wrapper, .accordion-trigger, [role="button"]';
    const addHoverListeners = () => {
      document.querySelectorAll(interactiveSelectors).forEach(element => {
        if (element.dataset.cursorBound) return;
        element.dataset.cursorBound = "true";

        element.addEventListener('mouseenter', () => {
          customCursor.classList.add('cursor-expand');
        });
        element.addEventListener('mouseleave', () => {
          customCursor.classList.remove('cursor-expand');
        });
      });
    };

    addHoverListeners();

    // Observe body elements to bind cursor states on dynamic updates
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ==========================================================================
     STICKY HEADER & NAV SCROLL ACTIONS
     ========================================================================== */
  const navContainer = document.querySelector('.nav-container');

  const checkScroll = () => {
    const scrollY = window.scrollY;
    
    if (scrollY > 55) {
      navContainer.classList.add('scrolled');
    } else {
      navContainer.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', checkScroll);
  checkScroll();

  /* ==========================================================================
     POSTER PARALLAX DEPTH SHIFTS (Cinematic Scroll)
     ========================================================================== */
  const posterGlow = document.querySelector('.portrait-radial-glow');
  const posterImg = document.querySelector('.poster-portrait-img');
  const posterTitle = document.querySelector('.poster-main-title');
  const posterSubtitle = document.querySelector('.poster-subtitle');
  const posterHeader = document.querySelector('.poster-header-meta');

  if (!prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      // Depth translations for different elements
      if (posterGlow) {
        posterGlow.style.transform = `translateX(-50%) translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0005})`;
      }
      if (posterImg) {
        posterImg.style.transform = `translateY(${scrollY * 0.18}px)`;
      }
      if (posterTitle) {
        posterTitle.style.transform = `translateY(${scrollY * 0.28}px)`;
        posterTitle.style.opacity = Math.max(0, 1 - scrollY / 600);
      }
      if (posterSubtitle) {
        posterSubtitle.style.transform = `translateY(${scrollY * 0.25}px)`;
        posterSubtitle.style.opacity = Math.max(0, 1 - scrollY / 500);
      }
      if (posterHeader) {
        posterHeader.style.transform = `translateY(${scrollY * 0.12}px)`;
        posterHeader.style.opacity = Math.max(0, 1 - scrollY / 300);
      }
    });
  }

  /* ==========================================================================
     INTERSECTION OBSERVER - SCROLL REVEALS
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================================
     INTERSECTION OBSERVER - ACTIVE NAVIGATION HIGHLIGHTS
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '-20% 0px -50% 0px'
  });

  sections.forEach(sec => activeObserver.observe(sec));

  /* ==========================================================================
     ACCORDION LOGIC (Exclusive Expand)
     ========================================================================== */
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other elements
      accordionItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
          const otherPanel = otherItem.querySelector('.accordion-panel');
          otherPanel.style.maxHeight = '0px';
          otherPanel.setAttribute('aria-hidden', 'true');
        }
      });

      // Toggle click target
      if (isOpen) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0px';
        panel.setAttribute('aria-hidden', 'true');
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
        panel.setAttribute('aria-hidden', 'false');
      }
    });
  });

  /* ==========================================================================
     PROJECTS LIGHTBOX MODAL
     ========================================================================== */
  const lightbox = document.getElementById('videoLightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const projectMediaWrappers = document.querySelectorAll('.project-media-wrapper');

  if (lightbox && lightboxClose) {
    projectMediaWrappers.forEach(wrapper => {
      wrapper.addEventListener('click', (e) => {
        if (e.target.closest('.project-actions') || e.target.closest('.project-link-btn')) {
          return;
        }

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  /* ==========================================================================
     CLICK-TO-COPY EMAIL INTERACTION
     ========================================================================== */
  const emailBtn = document.getElementById('emailBtn');
  const copyTooltip = document.getElementById('copyTooltip');
  let tooltipTimeout;

  if (emailBtn && copyTooltip) {
    emailBtn.addEventListener('click', () => {
      const email = emailBtn.textContent.trim();
      
      navigator.clipboard.writeText(email)
        .then(() => {
          copyTooltip.textContent = "Copied ✓";
          copyTooltip.classList.add('show');
          
          clearTimeout(tooltipTimeout);
          
          tooltipTimeout = setTimeout(() => {
            copyTooltip.classList.remove('show');
            setTimeout(() => {
              copyTooltip.textContent = "Copy to clipboard";
            }, 300);
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          copyTooltip.textContent = "Click to copy";
        });
    });

    emailBtn.addEventListener('mouseleave', () => {
      if (!copyTooltip.classList.contains('show')) {
        copyTooltip.textContent = "Copy to clipboard";
      }
    });
    
    emailBtn.addEventListener('mouseenter', () => {
      if (!copyTooltip.classList.contains('show')) {
        copyTooltip.classList.add('show');
      }
    });

    emailBtn.addEventListener('mouseleave', () => {
      if (copyTooltip.classList.contains('show') && copyTooltip.textContent !== "Copied ✓") {
        copyTooltip.classList.remove('show');
      }
    });
  }
});
