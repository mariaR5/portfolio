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
    const interactiveSelectors = 'a, button, .project-poster-frame, .exp-tab-item, .paper-card, [role="button"], .poster-main-title, .scrapbook-sticker';
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
     EXPERIENCE TABS & CINEMATIC FILM STRIPS
     ========================================================================== */
  const expTabItems = document.querySelectorAll('.exp-tab-item');
  const filmStrips = document.querySelectorAll('.film-strip');
  const shutterFlash = document.getElementById('shutterFlash');

  expTabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      // 1. Deactivate all tabs
      expTabItems.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      // 2. Activate clicked tab
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // 3. Hide all film strips & reset their frame position
      filmStrips.forEach(strip => {
        strip.classList.remove('active', 'next-frame');
        strip.style.display = 'none';
      });

      // 4. Show corresponding film strip
      const trackId = tab.getAttribute('data-track');
      const targetStrip = document.getElementById(`film-strip-${trackId}`);
      if (targetStrip) {
        targetStrip.style.display = 'block';
        // trigger reflow
        void targetStrip.offsetWidth;
        targetStrip.classList.add('active');
      }
    });
  });

  // Handle film strip click to trigger shutter flash & slide to next frame
  filmStrips.forEach(strip => {
    strip.addEventListener('click', (e) => {
      // Ignore click if clicking links or interactive elements inside
      if (e.target.closest('a') || e.target.closest('button')) return;

      if (shutterFlash) {
        // Prevent double trigger during active flash
        if (shutterFlash.classList.contains('flash-active')) return;

        shutterFlash.classList.add('flash-active');

        // Swap the active frame display at peak brightness (150ms)
        setTimeout(() => {
          strip.classList.toggle('next-frame');
        }, 150);

        // Remove flash class once animation finishes
        const onAnimationEnd = () => {
          shutterFlash.classList.remove('flash-active');
          shutterFlash.removeEventListener('animationend', onAnimationEnd);
        };
        shutterFlash.addEventListener('animationend', onAnimationEnd);
      } else {
        // Fallback if flash element is missing
        strip.classList.toggle('next-frame');
      }
    });
  });

  /* ==========================================================================
     PROJECTS LIGHTBOX MODAL
     ========================================================================== */
  const lightbox = document.getElementById('videoLightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const projectMediaWrappers = document.querySelectorAll('.project-poster-frame');

  if (lightbox && lightboxClose) {
    projectMediaWrappers.forEach(wrapper => {
      wrapper.addEventListener('click', (e) => {
        if (e.target.closest('.project-ticket-btn')) {
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

  /* ==========================================================================
     EDUCATION — Film Frame Expand / Reel Spin
     ========================================================================== */
  const eduSection    = document.querySelector('.education-section');
  const reelSvg       = document.querySelector('.reel-svg');
  const filmFrames    = document.querySelectorAll('.edu-film-frame');

  if (filmFrames.length && reelSvg) {
    // Helper: start reel for a moment then slow to pause
    let reelTimer = null;
    const spinReel = () => {
      reelSvg.style.animationPlayState = 'running';
      if (reelTimer) clearTimeout(reelTimer);
      // If no frame is open, stop after 2s
      const anyOpen = () => [...filmFrames].some(f => f.classList.contains('is-open'));
      reelTimer = setTimeout(() => {
        if (!anyOpen()) reelSvg.style.animationPlayState = 'paused';
      }, 2000);
    };

    filmFrames.forEach(frame => {
      const toggle = () => {
        const isOpen = frame.classList.contains('is-open');

        // Close all frames first
        filmFrames.forEach(f => {
          f.classList.remove('is-open');
          f.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          frame.classList.add('is-open');
          frame.setAttribute('aria-expanded', 'true');
          // Spin reel continuously while a frame is open
          reelSvg.style.animationPlayState = 'running';
        } else {
          // Was open → now closed; slow reel to pause
          spinReel();
        }
      };

      frame.addEventListener('click', toggle);
      frame.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });

    // Brief spin when section scrolls into view
    const reelObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          reelSvg.style.animationPlayState = 'running';
          setTimeout(() => {
            if (![...filmFrames].some(f => f.classList.contains('is-open'))) {
              reelSvg.style.animationPlayState = 'paused';
            }
          }, 2400);
        }
      });
    }, { threshold: 0.25 });

    if (eduSection) reelObserver.observe(eduSection);
  }

  // Add film frames to cursor hover listeners
  document.querySelectorAll('.edu-film-frame').forEach(el => {
    if (customCursor && !el.dataset.cursorBound) {
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => customCursor.classList.add('cursor-expand'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-expand'));
    }
  });
});
