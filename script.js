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
    const interactiveSelectors = 'a, button, .project-media-wrapper, .sleeve-wrapper, [role="button"], .poster-main-title, .scrapbook-sticker';
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

    // Observe body mutations to bind cursor triggers on dynamic shifts
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    /* ==========================================================================
       HERO PORTRAIT HOVER LENS MASK (Distance-based trigger)
       ========================================================================== */
    const portraitImg = document.querySelector('.poster-portrait-img-color');
    if (portraitImg) {
      window.addEventListener('mousemove', (e) => {
        const rect = portraitImg.getBoundingClientRect();

        // Calculate the horizontal center of the portrait container
        const imgCenterX = rect.left + rect.width / 2;
        const distanceX = Math.abs(e.clientX - imgCenterX);

        // Active threshold width (e.g. 350px on desktop, proportional on mobile)
        const thresholdX = Math.min(300, window.innerWidth * 0.4);

        // Check if cursor is horizontally near and vertically within the portrait bounds
        const isNear = distanceX < thresholdX && e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (isNear) {
          customCursor.classList.add('cursor-hover-image');

          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const maskSize = 90; // Half of cursor diameter (180px)
          const maskStr = `radial-gradient(circle ${maskSize}px at ${x}px ${y}px, transparent 99%, black 100%)`;

          portraitImg.style.webkitMaskImage = maskStr;
          portraitImg.style.maskImage = maskStr;
        } else {
          customCursor.classList.remove('cursor-hover-image');
          portraitImg.style.webkitMaskImage = 'none';
          portraitImg.style.maskImage = 'none';
        }
      });

      document.addEventListener('mouseleave', () => {
        customCursor.classList.remove('cursor-hover-image');
        portraitImg.style.webkitMaskImage = 'none';
        portraitImg.style.maskImage = 'none';
      });
    }
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
  const posterContainer = document.querySelector('.poster-portrait-container');
  const posterTitle = document.querySelector('.poster-main-title');
  const posterSubtitle = document.querySelector('.poster-subtitle');
  const posterHeader = document.querySelector('.poster-header-meta');

  if (!prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      if (posterGlow) {
        posterGlow.style.transform = `translateX(-50%) translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0005})`;
      }
      if (posterContainer) {
        posterContainer.style.transform = `translateX(-50%) translateY(${scrollY * 0.18}px)`;
      }
      if (posterTitle) {
        posterTitle.style.transform = `translateY(${scrollY * 0.28}px)`;
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
    threshold: 0.1,
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
    threshold: 0.15,
    rootMargin: '-20% 0px -40% 0px'
  });

  sections.forEach(sec => activeObserver.observe(sec));

  /* ==========================================================================
     VINYL DISCOGRAPHY INTERACTIONS (Cool work experience swap)
     ========================================================================== */
  const sleeveWrappers = document.querySelectorAll('.sleeve-wrapper');
  const linerNotesSheets = document.querySelectorAll('.liner-notes-sheet');

  sleeveWrappers.forEach(sleeve => {
    sleeve.addEventListener('click', () => {
      // 1. Remove active state from all sleeves and toggle status labels
      sleeveWrappers.forEach(sw => {
        sw.classList.remove('active');
        sw.setAttribute('aria-selected', 'false');
        const status = sw.querySelector('.sleeve-status');
        if (status) status.textContent = 'CUE';
      });

      // 2. Set active state on clicked sleeve
      sleeve.classList.add('active');
      sleeve.setAttribute('aria-selected', 'true');
      const status = sleeve.querySelector('.sleeve-status');
      if (status) status.textContent = 'PLAYING';

      // 3. Hide all liner notes inserts
      linerNotesSheets.forEach(sheet => {
        sheet.classList.remove('active');
        sheet.style.display = 'none';
      });

      // 4. Slide up corresponding details sheet
      const trackId = sleeve.getAttribute('data-track');
      const targetSheet = document.getElementById(`notes-panel-${trackId}`);
      if (targetSheet) {
        targetSheet.style.display = 'flex';
        // trigger reflow
        void targetSheet.offsetWidth;
        targetSheet.classList.add('active');
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
