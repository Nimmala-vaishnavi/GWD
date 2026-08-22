/**
 * GWD — GET WORK DONE | Interactive Engine & Animation Controller
 * High-performance Awwwards-tier animations, Lenis smooth scrolling,
 * GSAP ScrollTrigger timelines, 3D tilt effects, custom cursor & audio synthesis.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Setup Lenis Smooth Scrolling
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 3. Custom Desktop Cursor
  initCustomCursor();

  // 4. Hero Background Video Handling
  initHeroVideo();

  // 5. Navigation Bar Scroll Effects & Mobile Drawer
  initNavigation();

  // 6. GSAP Scroll-Triggered Animations
  initScrollAnimations();

  // 7. 3D Tilt Effect on Interactive Cards
  initCardTilt();

  // 8. Video Showcase Player (Section 7)
  initShowcasePlayer();

  // 9. Interactive Stats Counter
  initStatsCounters();

  // 10. Web Audio API Ambient Synth Soundscape
  initAudioSynth();

  // 11. Interactive Join Modal
  initJoinModal();
});

/* --------------------------------------------------------------------------
   3. CUSTOM CURSOR
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');
  if (!dot || !outline) return;

  // Check if touch device
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    outline.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    outline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateOutline);
  }
  requestAnimationFrame(animateOutline);

  // Hover state on interactable elements
  const interactables = document.querySelectorAll('a, button, input, select, textarea, .interactive-card, .project-card, .person-card, .audio-control-fixed');
  interactables.forEach((el) => {
    el.addEventListener('mouseenter', () => outline.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => outline.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    outline.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    outline.style.opacity = '1';
  });
}

/* --------------------------------------------------------------------------
   4. HERO VIDEO BACKGROUND
   -------------------------------------------------------------------------- */
function initHeroVideo() {
  const globalVid = document.getElementById('globalBgVideo');
  const heroVid = document.getElementById('heroVideo');
  const actionVid = document.getElementById('actionVideo');

  [globalVid, heroVid, actionVid].forEach((vid) => {
    if (!vid) return;
    vid.muted = true;
    vid.defaultMuted = true;
    vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    vid.setAttribute('muted', '');
    vid.setAttribute('autoplay', '');

    const startPlay = () => {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Autoplay deferred until user interaction:', err);
        });
      }
    };

    startPlay();

    // In case browser requires user gesture
    ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach((evt) => {
      window.addEventListener(evt, () => {
        if (vid.paused) {
          vid.play().catch(() => {});
        }
      }, { once: true, passive: true });
    });
  });
}

/* --------------------------------------------------------------------------
   5. NAVIGATION BAR & MOBILE DRAWER
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-item, #mobileJoinBtn');

  // Sticky blur on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('active');
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
}

/* --------------------------------------------------------------------------
   6. GSAP SCROLL-TRIGGERED ANIMATIONS
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;

  // Hero entrance animation timeline
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });

  heroTl
    .fromTo('.navbar-wrapper', { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
    .fromTo('.hero-badge', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1 }, '-=0.6')
    .fromTo('.hero-line .line-inner', { y: '110%', opacity: 0 }, { y: '0%', opacity: 1, stagger: 0.15 }, '-=0.5')
    .fromTo('.hero-supporting-block', { y: 30, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.6')
    .fromTo('.hero-cta-group', { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.7')
    .fromTo('.hero-footer-bar', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.4');

  // Register ScrollTrigger plugin
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Section 2: Statement words reveal on scroll
    gsap.utils.toArray('.word-split').forEach((word, i) => {
      gsap.fromTo(
        word,
        { opacity: 0.15, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: word,
            start: 'top 85%',
            end: 'top 65%',
            scrub: true,
          },
        }
      );
    });

    // Section 4: Mindset Pipeline steps reveal
    gsap.utils.toArray('.mindset-step-node').forEach((step, idx) => {
      gsap.fromTo(
        step,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Section 5: Projects cards staggered reveal
    gsap.utils.toArray('.project-card').forEach((card, idx) => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: (idx % 2) * 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Section 8: Pitch headlines reveal
    gsap.fromTo(
      '.reveal-pitch-1',
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.pitch-statement-box',
          start: 'top 80%',
        },
      }
    );
    gsap.fromTo(
      '.reveal-pitch-2',
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.pitch-statement-box',
          start: 'top 80%',
        },
      }
    );
  }
}

/* --------------------------------------------------------------------------
   7. 3D TILT EFFECT ON CARDS
   -------------------------------------------------------------------------- */
function initCardTilt() {
  const tiltCards = document.querySelectorAll('[data-tilt]');
  if (window.matchMedia('(pointer: coarse)').matches) return;

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* --------------------------------------------------------------------------
   8. CINEMATIC SHOWCASE VIDEO PLAYER (SECTION 7)
   -------------------------------------------------------------------------- */
function initShowcasePlayer() {
  const actionVideo = document.getElementById('actionVideo');
  const playBtn = document.getElementById('toggleShowcasePlay');
  const playIcon = document.getElementById('playPauseIcon');
  const playText = document.getElementById('playPauseText');
  const muteBtn = document.getElementById('toggleShowcaseMute');
  const muteIcon = document.getElementById('muteIcon');
  const progressBar = document.getElementById('videoProgress');

  if (!actionVideo || !playBtn) return;

  // Play / Pause toggle
  playBtn.addEventListener('click', () => {
    if (actionVideo.paused) {
      actionVideo.play();
      if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
      if (playText) playText.textContent = 'PAUSE FEED';
    } else {
      actionVideo.pause();
      if (playIcon) playIcon.setAttribute('data-lucide', 'play');
      if (playText) playText.textContent = 'RESUME FEED';
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // Mute / Unmute toggle
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      actionVideo.muted = !actionVideo.muted;
      if (muteIcon) {
        muteIcon.setAttribute('data-lucide', actionVideo.muted ? 'volume-x' : 'volume-2');
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Progress update
  actionVideo.addEventListener('timeupdate', () => {
    if (progressBar && actionVideo.duration) {
      const percentage = (actionVideo.currentTime / actionVideo.duration) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  });
}

/* --------------------------------------------------------------------------
   9. INTERACTIVE STATS COUNTERS
   -------------------------------------------------------------------------- */
function initStatsCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  let counted = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          counters.forEach((c) => {
            const target = parseInt(c.getAttribute('data-target'), 10);
            const prefix = c.getAttribute('data-prefix') || '';
            const suffix = c.getAttribute('data-suffix') || '';
            let current = 0;
            const increment = target / 50;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                c.textContent = `${prefix}${target}${suffix}`;
                clearInterval(timer);
              } else {
                c.textContent = `${prefix}${Math.floor(current)}${suffix}`;
              }
            }, 30);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  const statsSection = document.getElementById('stats');
  if (statsSection) observer.observe(statsSection);
}

/* --------------------------------------------------------------------------
   10. WEB AUDIO API SYNTH SOUNDSCAPE
   -------------------------------------------------------------------------- */
function initAudioSynth() {
  const audioToggle = document.getElementById('audioToggle');
  if (!audioToggle) return;

  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  let isPlaying = false;

  audioToggle.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!isPlaying) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Create low frequency futuristic ambient drone
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(65.41, audioCtx.currentTime); // Low C drone

      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 1.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();

      isPlaying = true;
      audioToggle.classList.add('playing');
      const status = audioToggle.querySelector('.audio-status');
      if (status) status.textContent = 'ON';
    } else {
      if (gainNode && oscillator) {
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        setTimeout(() => {
          try { oscillator.stop(); } catch(e) {}
        }, 500);
      }
      isPlaying = false;
      audioToggle.classList.remove('playing');
      const status = audioToggle.querySelector('.audio-status');
      if (status) status.textContent = 'OFF';
    }
  });

  // Haptic audio click on buttons
  const buttons = document.querySelectorAll('.btn, .btn-circle-action');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!isPlaying || !audioCtx) return;
      try {
        const clickOsc = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(440, audioCtx.currentTime);
        clickOsc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);

        clickGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

        clickOsc.connect(clickGain);
        clickGain.connect(audioCtx.destination);
        clickOsc.start();
        clickOsc.stop(audioCtx.currentTime + 0.09);
      } catch (e) {}
    });
  });
}

/* --------------------------------------------------------------------------
   11. INTERACTIVE JOIN MODAL
   -------------------------------------------------------------------------- */
function initJoinModal() {
  const modal = document.getElementById('joinModal');
  const openBtns = [
    document.getElementById('openJoinModalNav'),
    document.getElementById('openJoinModalFinal'),
    document.getElementById('mobileJoinBtn'),
  ];
  const closeBtn = document.getElementById('closeJoinModal');
  const form = document.getElementById('joinForm');
  const successMsg = document.getElementById('formSuccessMessage');

  openBtns.forEach((btn) => {
    btn?.addEventListener('click', () => {
      modal?.classList.add('active');
      modal?.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal?.classList.remove('active');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });

  // Global submit handler
  window.submitJoinForm = () => {
    if (form && successMsg) {
      form.style.display = 'none';
      successMsg.classList.add('show');
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        form.reset();
        form.style.display = 'block';
        successMsg.classList.remove('show');
        closeModal();
      }, 3500);
    }
  };
}

