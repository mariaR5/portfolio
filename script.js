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
            if (targetId === 'nitc') {
              eduStickerTitle.textContent = 'CLASS OF 2027';
              eduStickerSerial.textContent = 'RM-ED-2027';
            } else if (targetId === 'st_josephs') {
              eduStickerTitle.textContent = 'CLASS OF 2023';
              eduStickerSerial.textContent = 'RM-ED-2023';
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

  // Bind custom cursor highlights to playlist controls, song items, knobs, and stamp journal page elements
  document.querySelectorAll('.knob-dial, .playlist-song-item, .deck-control-btn, .stamp-btn, .color-well, .journal-notebook-page, .journal-clear-btn').forEach(el => {
    if (customCursor && !el.dataset.cursorBound) {
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => customCursor.classList.add('cursor-expand'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-expand'));
    }
  });
});
