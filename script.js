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
     EDUCATION — Retro Movie Projector & Slide Projection
     ========================================================================== */
  const ticketBtns = document.querySelectorAll('.edu-ticket-select');
  const projectSlides = document.querySelectorAll('.edu-projected-slide');
  const lensFlash = document.querySelector('.projector-lens-flash');
  const projectorBeam = document.querySelector('.projector-beam');

  if (lensFlash) {
    lensFlash.classList.add('flash-active');
  }
  if (projectorBeam) {
    projectorBeam.classList.add('flash-active');
  }

  if (ticketBtns.length && projectSlides.length) {
    ticketBtns.forEach(btn => {
      const targetId = btn.getAttribute('data-target');
      const targetSlide = document.getElementById(`slide-${targetId}`);

      const selectTab = () => {
        // 1. If ticket is already active, do nothing
        if (btn.classList.contains('active')) return;

        // 2. Flash the lens and dim/pulse the beam during transition
        if (lensFlash) {
          lensFlash.classList.remove('flash-active');
          void lensFlash.offsetWidth; // Trigger reflow to restart animation
          lensFlash.classList.add('flash-active');
        }

        if (projectorBeam) {
          projectorBeam.classList.remove('flash-active');
          projectorBeam.classList.add('transitioning');
        }

        // 3. Wait for transition duration (~700ms) before swapping slides
        setTimeout(() => {
          // Deactivate all tickets and slides
          ticketBtns.forEach(t => t.classList.remove('active'));
          projectSlides.forEach(s => s.classList.remove('active'));

          // Activate selected ticket and slide
          btn.classList.add('active');
          if (targetSlide) {
            targetSlide.classList.add('active');
          }

          // Update scrapbook sticker values dynamically based on target
          const eduStickerTitle = document.getElementById('eduStickerTitle');
          const eduStickerSerial = document.getElementById('eduStickerSerial');
          if (eduStickerTitle && eduStickerSerial) {
            if (targetId === 'cusat') {
              eduStickerTitle.textContent = 'CLASS OF 2027';
              eduStickerSerial.textContent = 'RM-ED-2027';
            } else if (targetId === 'gvhss') {
              eduStickerTitle.textContent = 'CLASS OF 2023';
              eduStickerSerial.textContent = 'RM-ED-2023';
            } else if (targetId === 'st_josephs') {
              eduStickerTitle.textContent = 'CLASS OF 2021';
              eduStickerSerial.textContent = 'RM-ED-2021';
            }
          }

          // Restore normal projector beam state
          if (projectorBeam) {
            projectorBeam.classList.remove('transitioning');
            void projectorBeam.offsetWidth; // Trigger reflow to restart animation
            projectorBeam.classList.add('flash-active');
          }
        }, 700);
      };

      btn.addEventListener('click', selectTab);
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectTab();
        }
      });
    });
  }

  // Bind new ticket buttons to custom cursor scaling
  document.querySelectorAll('.edu-ticket-select').forEach(el => {
    if (customCursor && !el.dataset.cursorBound) {
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => customCursor.classList.add('cursor-expand'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-expand'));
    }
  });

  /* ==========================================================================
     EDUCATION — Retro Scroll Modal Rollout
     ========================================================================== */
  const certBtns = document.querySelectorAll('.edu-certificate-btn');
  const scrollModal = document.getElementById('scrollModal');
  const scrollImage = document.getElementById('scrollImage');
  const closeScroll = document.getElementById('closeScrollBtn');

  if (certBtns.length && scrollModal && scrollImage) {
    const openParchment = (certName) => {
      scrollImage.src = `assets/${certName}.png`;
      scrollModal.classList.add('active');
      scrollModal.setAttribute('aria-hidden', 'false');
    };

    const closeParchment = () => {
      scrollModal.classList.remove('active');
      scrollModal.setAttribute('aria-hidden', 'true');
    };

    certBtns.forEach(btn => {
      const certName = btn.getAttribute('data-cert');
      btn.addEventListener('click', () => openParchment(certName));
    });

    if (closeScroll) {
      closeScroll.addEventListener('click', closeParchment);
    }

    // Close on backdrop overlay click
    scrollModal.addEventListener('click', (e) => {
      if (e.target === scrollModal) {
        closeParchment();
      }
    });

    // Keyboard Accessibility
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && scrollModal.classList.contains('active')) {
        closeParchment();
      }
    });
  }

  // Bind custom cursor to certificate buttons and close button
  document.querySelectorAll('.edu-certificate-btn, .scroll-close-btn').forEach(el => {
    if (customCursor && !el.dataset.cursorBound) {
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => customCursor.classList.add('cursor-expand'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-expand'));
    }
  });

  /* ==========================================================================
     HOBBIES — Tactile Scrapbook Layout
     ========================================================================== */
  // Initialize playlist status to READY on load
  setTimeout(() => {
    const statusEl = document.getElementById('playlistStatus');
    if (statusEl) {
      statusEl.textContent = "READY";
    }
  }, 400);

  // 2. Web Audio Synthesizer low-latency sound engine
  let audioCtx = null;
  let masterGainNode = null;
  let filterNode = null;
  let analyserNode = null;
  let masterVolumeValue = 0.5;
  let toneCutoffValue = 2000;
  let guitarTone = 'acoustic';

  // Single global audio element for cassette player integration
  const audioPlayer = new Audio();
  audioPlayer.crossOrigin = "anonymous";
  let audioSourceNode = null;

  const initAudio = () => {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();
    masterGainNode = audioCtx.createGain();
    filterNode = audioCtx.createBiquadFilter();
    analyserNode = audioCtx.createAnalyser();

    filterNode.type = 'lowpass';
    filterNode.frequency.value = toneCutoffValue;

    masterGainNode.gain.value = masterVolumeValue;
    analyserNode.fftSize = 32;

    try {
      audioSourceNode = audioCtx.createMediaElementSource(audioPlayer);
      audioSourceNode.connect(filterNode);
    } catch (e) {
      console.error("Failed to connect MediaElementSourceNode:", e);
    }

    filterNode.connect(analyserNode);
    analyserNode.connect(masterGainNode);
    masterGainNode.connect(audioCtx.destination);
  };

  const makeDistortionCurve = (amount) => {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  const playStringTone = (frequency) => {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (guitarTone === 'nylon') {
      // Nylon (Classical): Mellow fundamental, warm, fast decay
      const osc = audioCtx.createOscillator();
      const stringGain = audioCtx.createGain();
      const synthFilter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      stringGain.gain.setValueAtTime(0.45, audioCtx.currentTime);
      stringGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.75);

      synthFilter.type = 'lowpass';
      synthFilter.frequency.setValueAtTime(900, audioCtx.currentTime);

      osc.connect(synthFilter);
      synthFilter.connect(stringGain);
      stringGain.connect(filterNode);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } else if (guitarTone === 'electric') {
      // Electric: Overdriven, sustained, bright
      const osc = audioCtx.createOscillator();
      const stringGain = audioCtx.createGain();
      const synthFilter = audioCtx.createBiquadFilter();
      const dist = audioCtx.createWaveShaper();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      dist.curve = makeDistortionCurve(35);
      dist.oversample = '4x';

      stringGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      stringGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.6);

      synthFilter.type = 'bandpass';
      synthFilter.frequency.setValueAtTime(950, audioCtx.currentTime);
      synthFilter.Q.value = 1.2;

      osc.connect(dist);
      dist.connect(synthFilter);
      synthFilter.connect(stringGain);
      stringGain.connect(filterNode);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.65);
    } else if (guitarTone === 'jazz') {
      // Jazz: Hollow-body electric, warm, clean, bassy
      const osc = audioCtx.createOscillator();
      const stringGain = audioCtx.createGain();
      const synthFilter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      stringGain.gain.setValueAtTime(0.32, audioCtx.currentTime);
      stringGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4);

      synthFilter.type = 'lowpass';
      synthFilter.frequency.setValueAtTime(500, audioCtx.currentTime);

      osc.connect(synthFilter);
      synthFilter.connect(stringGain);
      stringGain.connect(filterNode);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.45);
    } else {
      // Acoustic (Steel String): Bright fundamental + short detuned pluck harmonic
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      const gain2 = audioCtx.createGain();
      const synthFilter = audioCtx.createBiquadFilter();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2, audioCtx.currentTime);

      gain1.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.3);

      gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      synthFilter.type = 'lowpass';
      synthFilter.frequency.setValueAtTime(2800, audioCtx.currentTime);
      synthFilter.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 1.0);

      osc1.connect(gain1);
      osc2.connect(gain2);

      gain1.connect(synthFilter);
      gain2.connect(synthFilter);
      synthFilter.connect(filterNode);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 1.35);
      osc2.stop(audioCtx.currentTime + 0.15);
    }
  };

  // Guitar strings 6 strings standard tuning (E2, A2, D3, G3, B3, E4)
  const stringNotes = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
  const guitarStrings = document.querySelectorAll('.guitar-string-wrapper');

  guitarStrings.forEach(str => {
    str.addEventListener('mouseenter', () => {
      const idx = parseInt(str.getAttribute('data-string'));
      if (!isNaN(idx) && stringNotes[idx]) {
        playStringTone(stringNotes[idx]);
      }
    });
  });

  // Rotatable controls knobs
  const knobVolume = document.getElementById('knobVolume');
  if (knobVolume) {
    let vol = 5;
    knobVolume.addEventListener('click', () => {
      vol = (vol % 10) + 1;
      masterVolumeValue = vol / 10;
      if (masterGainNode) {
        masterGainNode.gain.setValueAtTime(masterVolumeValue, audioCtx.currentTime);
      }
      knobVolume.style.transform = `rotate(${(vol - 1) * 30}deg)`;
      knobVolume.setAttribute('aria-valuenow', vol);
      playTypewriterClick();
    });
  }

  const knobTone = document.getElementById('knobTone');
  const guitarToneLabel = document.getElementById('guitarToneLabel');
  const toneModes = ['acoustic', 'nylon', 'electric', 'jazz'];

  if (knobTone) {
    let toneIdx = 0;
    knobTone.addEventListener('click', () => {
      toneIdx = (toneIdx + 1) % toneModes.length;
      guitarTone = toneModes[toneIdx];

      if (guitarToneLabel) {
        guitarToneLabel.textContent = guitarTone.toUpperCase();
      }

      knobTone.style.transform = `rotate(${toneIdx * 90}deg)`;
      knobTone.setAttribute('aria-valuenow', toneIdx + 1);
      playTypewriterClick();
    });
  }

  const playTypewriterClick = () => {
    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);

    filter.type = 'highpass';
    filter.frequency.value = 1000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainNode);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  };

  // 3. Tactile Scrapbook Ink-Stamps (Journaling)
  let activeStampType = 'memories';
  let activeStampColor = 'butter';

  const playStampSound = () => {
    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    // A low thud sound
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

    // Friction noise burst
    const bufferSize = audioCtx.sampleRate * 0.05;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 400;
    noiseFilter.Q.value = 2;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainNode);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGainNode);

    osc.start();
    noise.start();
    osc.stop(audioCtx.currentTime + 0.15);
    noise.stop(audioCtx.currentTime + 0.15);
  };

  // Stamp buttons selection
  const stampBtns = document.querySelectorAll('.stamp-btn');
  stampBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stampBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStampType = btn.getAttribute('data-stamp');
      playTypewriterClick(); // Play tiny feedback sound
    });
  });

  // Color wells selection
  const colorWells = document.querySelectorAll('.color-well');
  colorWells.forEach(well => {
    well.addEventListener('click', () => {
      colorWells.forEach(w => w.classList.remove('active'));
      well.classList.add('active');
      activeStampColor = well.getAttribute('data-color');
      playTypewriterClick();
    });
  });

  // Notebook Page Clicking
  const journalPage = document.getElementById('journalNotebookPage');
  if (journalPage) {
    journalPage.addEventListener('click', (e) => {
      // Get click position relative to page
      const rect = journalPage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create stamp element
      const stampEl = document.createElement('div');
      stampEl.className = `placed-stamp stamp-${activeStampType} color-${activeStampColor}`;
      stampEl.style.left = `${x}px`;
      stampEl.style.top = `${y}px`;

      // Apply random rotation for manual tactile print feel (-15 to +15 deg)
      const rot = Math.random() * 30 - 15;
      stampEl.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;

      // Set stamp content
      if (activeStampType === 'memories') {
        stampEl.textContent = 'MEMORIES';
      } else if (activeStampType === 'wanderlust') {
        stampEl.innerHTML = 'WANDER<br>LUST';
      } else if (activeStampType === 'creative') {
        stampEl.textContent = 'CREATIVE';
      } else if (activeStampType === 'approved') {
        stampEl.textContent = 'APPROVED';
      }

      // Add to DOM
      journalPage.appendChild(stampEl);
      playStampSound();
    });
  }

  // Clear button
  const btnJournalClear = document.getElementById('btnJournalClear');
  if (btnJournalClear && journalPage) {
    btnJournalClear.addEventListener('click', () => {
      // Remove all placed stamps
      const stamps = journalPage.querySelectorAll('.placed-stamp');
      stamps.forEach(s => s.remove());
      playTypewriterClick();
    });
  }

  // 4. Playlist and Cassette Deck Simulation (Music Listening)
  const songsData = [
    {
      name: "Fake Plastic Trees",
      artist: "Radiohead",
      genre: "Alternative",
      duration: "4:50",
      url: "assets/songs/Radiohead - Fake Plastic Trees [HQ].mp3",
      cover: "assets/album/fpt.jpeg",
      startOffset: 145
    },
    {
      name: "Scott Street",
      artist: "Phoebe Bridgers",
      genre: "Indie Folk",
      duration: "5:05",
      url: "assets/songs/Scott Street.mp3",
      cover: "assets/scott_street.jpeg",
      startOffset: 250
    },
    {
      name: "The Search (Edit)",
      artist: "NF",
      genre: "Hip Hop",
      duration: "3:30",
      url: "assets/songs/The Search (Edit).mp3",
      cover: "assets/album/the_search.jpg",
      startOffset: 78
    },
    {
      name: "Umi e (海へ)",
      artist: "syh",
      genre: "J-Pop",
      duration: "4:40",
      url: "assets/songs/syh - Umi e (海へ) (To The Sea) (KanRomEng) Lyrics歌詞.mp3",
      cover: "assets/album/umi_e.png",
      startOffset: 172
    }
  ];

  let currentSongIdx = -1;
  let isPlaying = false;
  let vuAnimationId = null;

  const updateVUMeter = () => {
    if (!isPlaying || !analyserNode) {
      document.querySelectorAll('.vu-bar').forEach(bar => {
        bar.style.height = '15%';
      });
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    const vuBars = document.querySelectorAll('.vu-bar');
    vuBars.forEach((bar, idx) => {
      const val = dataArray[idx] || 0;
      const heightPercent = 15 + (val / 255) * 85;
      bar.style.height = `${Math.min(heightPercent, 100)}%`;
    });

    vuAnimationId = requestAnimationFrame(updateVUMeter);
  };

  const songItems = document.querySelectorAll('.playlist-song-item');
  const playlistStatus = document.getElementById('playlistStatus');
  const tapeReelLeft = document.getElementById('tapeReelLeft');
  const tapeReelRight = document.getElementById('tapeReelRight');
  const btnPlayPause = document.getElementById('btnDeckPlayPause');

  const updateAlbumCover = (songIdx) => {
    const albumCoverDisplay = document.getElementById('albumCoverDisplay');
    if (albumCoverDisplay) {
      if (songIdx >= 0 && songIdx < songsData.length) {
        albumCoverDisplay.src = songsData[songIdx].cover;
      } else {
        albumCoverDisplay.src = "assets/hobby_music.png";
      }
    }
  };

  const startPlayback = (songIdx) => {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const isNewSong = (currentSongIdx !== songIdx) || !audioPlayer.src;

    currentSongIdx = songIdx;
    isPlaying = true;

    songItems.forEach((item, idx) => {
      if (idx === songIdx) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (playlistStatus) {
      playlistStatus.textContent = songsData[songIdx].name.toUpperCase();
    }

    if (tapeReelLeft) tapeReelLeft.classList.add('spinning');
    if (tapeReelRight) tapeReelRight.classList.add('spinning');

    if (isNewSong) {
      audioPlayer.src = songsData[songIdx].url;
      audioPlayer.load();
      audioPlayer.currentTime = songsData[songIdx].startOffset || 0;
    }

    audioPlayer.play().catch(err => {
      console.warn("Audio playback failed or was interrupted:", err);
    });

    if (!vuAnimationId) {
      updateVUMeter();
    }
    updatePlayPauseButton();
    updateAlbumCover(songIdx);
  };

  const stopPlayback = (isEnded = false) => {
    isPlaying = false;
    audioPlayer.pause();

    if (tapeReelLeft) tapeReelLeft.classList.remove('spinning');
    if (tapeReelRight) tapeReelRight.classList.remove('spinning');

    if (playlistStatus) {
      playlistStatus.textContent = isEnded ? "READY" : "PAUSED";
    }

    document.querySelectorAll('.vu-bar').forEach(bar => {
      bar.style.height = '15%';
    });

    if (vuAnimationId) {
      cancelAnimationFrame(vuAnimationId);
      vuAnimationId = null;
    }

    updatePlayPauseButton();

    if (isEnded) {
      songItems.forEach(item => item.classList.remove('active'));
      currentSongIdx = -1;
      updateAlbumCover(-1);
    }
  };

  songItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-song-idx'));
      if (!isNaN(idx)) {
        startPlayback(idx);
      }
    });
  });

  const updatePlayPauseButton = () => {
    if (!btnPlayPause) return;
    const playIcon = btnPlayPause.querySelector('.play-icon');
    const pauseIcon = btnPlayPause.querySelector('.pause-icon');
    if (isPlaying) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
    } else {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
    }
  };

  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', () => {
      if (isPlaying) {
        stopPlayback();
      } else {
        if (currentSongIdx === -1) {
          startPlayback(0);
        } else {
          startPlayback(currentSongIdx);
        }
      }
    });
  }

  // Handle track ending to reset player controls
  audioPlayer.addEventListener('ended', () => {
    stopPlayback(true);
  });

  // 5. Skills - Vintage Hi-Fi Turntable Console State Machine
  const skillSvgs = {
    python: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm-1 2.05c1.47-.07 2.92.51 3.9 1.62.9-.02 1.66.7 1.7 1.6v2c0 .4-.3.73-.7.73h-3.8c-.5-.03-.9.37-.9.88v1.17c0 .5.4.9.9.9h1.9c1 .03 1.8.85 1.8 1.88v2c0 .9-.7 1.67-1.6 1.7-1 .02-1.9-.74-1.9-1.74v-1.1c0-.5-.4-.9-.9-.9H9c-1-.03-1.8-.85-1.8-1.88v-2c0-.9.7-1.67 1.6-1.7 1-.02 1.9.74 1.9 1.74v1.1c0 .5.4.9.9.9h1.9c.5.03.9-.37.9-.88V9.12c0-.5-.4-.9-.9-.9H9c-1-.03-1.8-.85-1.8-1.88v-2C7.2 3.33 8.4 2.14 9.9 2.05c.37 0 .73 0 1.1 0z"/></svg>`,
    javascript: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M12 18h2.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5H12M10 11v3.5c0 .8-.7 1.5-1.5 1.5S7 15.3 7 14.5"/></svg>`,
    sql: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v5c0 1.66 3.13 3 7 3s7-1.34 7-3V5M5 10v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5"/></svg>`,
    dart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10h5L7 12 17 2h-5z"/></svg>`,
    cplusplus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3M16 12h3M17.5 10.5v3"/></svg>`,
    java: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10h11v5c0 2.5-2 4.5-4.5 4.5S7 17.5 7 15v-5M16 12h2a2.5 2.5 0 0 0 0-5h-2M10 2c0 1-1 2-1 3M13 1c0 1.5-1 2.5-1 3.5M7 3c0 1-.5 2-.5 3"/></svg>`,
    c: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M16 9a4 4 0 1 0 0 6"/></svg>`,
    llms: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 5V3M15 5V3M9 19v2M15 19v2M5 9H3M5 15H3M19 9h2M19 15h2M9 9h6v6H9z"/></svg>`,
    rag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5M16 15l3 3"/><circle cx="15" cy="14" r="2.5"/></svg>`,
    recsys: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`,
    llmeval: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M12 6v14M6 10l-3 4h6l-3-4zm12 0l-3 4h6l-3-4zM12 20a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z"/></svg>`,
    synthetic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4M12 2v7M6 22h12a2 2 0 0 0 2-2.5L15 8V4h-6v4L4 19.5A2 2 0 0 0 6 22z"/></svg>`,
    mlbasics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M18 9l-5 5-3-3-4 4"/><circle cx="18" cy="9" r="1.5" fill="currentColor"/><circle cx="13" cy="14" r="1.5" fill="currentColor"/><circle cx="10" cy="11" r="1.5" fill="currentColor"/></svg>`,
    fastapi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>`,
    langchain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    pandas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><circle cx="6.5" cy="7.5" r="2.5" fill="currentColor"/><circle cx="17.5" cy="7.5" r="2.5" fill="currentColor"/><circle cx="9.5" cy="12" r="1" fill="currentColor"/><circle cx="14.5" cy="12" r="1" fill="currentColor"/><path d="M10.5 15.5c1 1 2 1 3 0"/></svg>`,
    scikitlearn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><line x1="7.5" y1="8.5" x2="10.5" y2="15.5"/><line x1="16.5" y1="8.5" x2="13.5" y2="15.5"/><line x1="9" y1="6" x2="15" y2="6"/></svg>`,
    flutter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2l-10 10 3 3 10-10h-3zm3 7l-7 7 3 3 7-7h-3z"/></svg>`,
    reactvue: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(150 12 12)"/><path d="M12 9l-4 7h8l-4-7z"/></svg>`,
    node: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.5L18.5 8 12 11.5 5.5 8 12 4.5zM5 15.5v-6l7 3.8v6l-7-3.8z"/></svg>`,
    postgresql: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a8 8 0 0 0-8 8c0 3 2 5 4 6v2c0 1 2 1 3 0v-2h2c5 0 7-3 7-8a8 8 0 0 0-8-8zM8 12c-1 0-2 .5-2 1.5s1.5 2 2 1"/></svg>`,
    mysql: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18s3-3 6-3 6 3 9 3 5-3 5-3M4 14c2-4 6-7 11-5s7 4 7 4"/></svg>`,
    sqlite: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4S14 4 10 8 4 20 4 20s6-2 10-6 6-10 6-10z"/><line x1="8" y1="16" x2="16" y2="8"/></svg>`,
    azure: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 19 18 19 12 5"/><polygon points="2 19 10 19 6 11"/><polygon points="10 19 22 19 16 11"/></svg>`,
    docker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="14" width="6" height="4"/><rect x="14" y="14" width="6" height="4"/><rect x="9" y="8" width="6" height="4"/><path d="M2 18h20"/></svg>`,
    git: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="6" r="3"/><line x1="6" y1="9" x2="6" y2="15"/><path d="M6 15c0-4 4-6 9-6"/></svg>`,
    openai: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5-1-2-3-1-4.5s3.5-2 5-.5l5.5 5.5M19.5 7.5c1.5 1 2 3 1 4.5s-3.5 2-5 .5L10 7M7.5 4.5c1-1.5 3-2 4.5-1s2 3.5.5 5l-5.5 5.5M16.5 19.5c-1 1.5-3 2-4.5 1s-2-3.5-.5-5l5.5-5.5"/></svg>`,
    gemini: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 5 3 8 8 8-5 0-8 3-8 8 0-5-3-8-8-8 5 0 8-3 8-8z"/><path d="M7 6c0 2 1 3 3 3-2 0-3 1-3 3 0-2-1-3-3-3 2 0 3-1 3-3zM17 15c0 2 1 3 3 3-2 0-3 1-3 3 0-2-1-3-3-3 2 0 3-1 3-3z"/></svg>`,
    spotify: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 9.5c2-1 5-1 7 0M9.5 12c1.5-.7 3.5-.7 5 0M10.2 14.5c1-.5 2.5-.5 3.5 0"/></svg>`,
    dsa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="12" cy="19" r="2.5"/><line x1="10.5" y1="6.8" x2="7.5" y2="10.2"/><line x1="13.5" y1="6.8" x2="16.5" y2="10.2"/><line x1="6" y1="14.5" x2="6" y2="16.5"/><line x1="16.5" y1="13.8" x2="13.5" y2="17.2"/></svg>`,
    oop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="8" y="14" width="8" height="7" rx="1"/><line x1="10" y1="6.5" x2="14" y2="6.5"/><line x1="7" y1="10" x2="12" y2="14"/><line x1="17" y1="10" x2="12" y2="14"/></svg>`,
    dbms: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3M4 6v5c0 1.66 3.58 3 8 3s8-1.34 8-3V6M4 11v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5M4 16v3c0 1.66 3.58 3 8 3s8-1.34 8-3v-3"/></svg>`,
    os: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M7 13l3 2-3 2M13 17h4"/></svg>`
  };

  const skillsTabBtns = document.querySelectorAll('.skills-tab-btn');
  const vinylSleeves = document.querySelectorAll('.vinyl-sleeve-jacket');
  const platter = document.querySelector('.turntable-platter-rim');
  const vinylActiveIcon = document.getElementById('vinyl-active-icon');

  skillsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Deactivate other tabs
      skillsTabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      // 2. Activate current tab
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const category = btn.getAttribute('data-category');

      // 3. Lift Tone-arm (stop spinning/playing state temporarily)
      if (platter) {
        platter.classList.remove('playing');
      }

      // 4. Transition sleeves
      vinylSleeves.forEach(sleeve => {
        sleeve.classList.remove('active');
      });

      const targetSleeve = document.getElementById(`jacket-${category}`);
      if (targetSleeve) {
        targetSleeve.classList.add('active');

        // Swap record center label to the first skill of the new sleeve
        const firstTrack = targetSleeve.querySelector('.track-item');
        if (firstTrack) {
          const skillName = firstTrack.getAttribute('data-skill');
          if (skillName && vinylActiveIcon) {
            vinylActiveIcon.innerHTML = skillSvgs[skillName] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8m-4-4v8" stroke-linecap="round"/></svg>`;
          }
        }
      }

      // Play click sound feedback
      playTypewriterClick();

      // 5. Drop the stylus tone-arm back onto record after 650ms delay
      setTimeout(() => {
        if (platter) {
          platter.classList.add('playing');
        }
      }, 650);
    });
  });

  // Track hover listeners to swap active vinyl icon
  const trackItems = document.querySelectorAll('.track-item');
  trackItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const skillName = item.getAttribute('data-skill');
      if (skillName && vinylActiveIcon) {
        const svgContent = skillSvgs[skillName] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8m-4-4v8" stroke-linecap="round"/></svg>`;
        // Trigger micro-scale pop animation
        vinylActiveIcon.classList.add('pop-effect');
        setTimeout(() => {
          vinylActiveIcon.innerHTML = svgContent;
          vinylActiveIcon.classList.remove('pop-effect');
        }, 80);
      }
    });
  });

  // Projects "Show More" toggle
  const btnShowMore = document.getElementById('btnProjectsShowMore');
  const projectsMoreContent = document.getElementById('projectsMoreContent');

  if (btnShowMore && projectsMoreContent) {
    btnShowMore.addEventListener('click', () => {
      const isExpanded = btnShowMore.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        // Collapse
        projectsMoreContent.classList.remove('expanded');
        btnShowMore.setAttribute('aria-expanded', 'false');
        btnShowMore.querySelector('span').textContent = 'TICKET // EXPAND REELS';
        
        // Wait for transition before setting display none
        setTimeout(() => {
          if (!projectsMoreContent.classList.contains('expanded')) {
            projectsMoreContent.style.display = 'none';
          }
        }, 600);
      } else {
        // Expand
        projectsMoreContent.style.display = 'block';
        void projectsMoreContent.offsetHeight; // trigger reflow
        projectsMoreContent.classList.add('expanded');
        btnShowMore.setAttribute('aria-expanded', 'true');
        btnShowMore.querySelector('span').textContent = 'TICKET // COLLAPSE REELS';
      }
      
      playTypewriterClick();
    });
  }

  // Bind custom cursor highlights to playlist controls, song items, knobs, stamp elements, skills tabs, and tracks
  document.querySelectorAll('.knob-dial, .playlist-song-item, .deck-control-btn, .stamp-btn, .color-well, .journal-notebook-page, .journal-clear-btn, .skills-tab-btn, .track-item').forEach(el => {
    if (customCursor && !el.dataset.cursorBound) {
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => customCursor.classList.add('cursor-expand'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-expand'));
    }
  });
});
