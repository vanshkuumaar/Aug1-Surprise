/* ============================================================
   💌 VINTAGE LOVE LETTER — SCRIPT (Self-Contained Vanilla JS)
   Magical Mobile-First Living Greeting Card Interactions
   ============================================================ */

(function () {
  'use strict';

  const bgAudio = document.getElementById('bg-audio');
  const musicBtn = document.getElementById('music-btn');
  const musicIcon = document.getElementById('music-icon');

  // Inject embedded images & audio from EMBEDDED_ASSETS on load
  function injectEmbeddedAssets() {
    if (typeof EMBEDDED_ASSETS === 'undefined') return;

    // Inject <img> elements
    document.querySelectorAll('img[data-asset]').forEach(img => {
      const key = img.getAttribute('data-asset');
      if (EMBEDDED_ASSETS[key]) {
        img.src = EMBEDDED_ASSETS[key];
      }
    });

    // Inject lock screen background
    const lockScreen = document.querySelector('.image-lock-screen');
    if (lockScreen && EMBEDDED_ASSETS['lock_screen']) {
      lockScreen.style.backgroundImage = `url('${EMBEDDED_ASSETS['lock_screen']}')`;
    }

    // Inject embedded audio
    if (bgAudio && EMBEDDED_ASSETS['bg_music']) {
      bgAudio.src = EMBEDDED_ASSETS['bg_music'];
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectEmbeddedAssets);
  } else {
    injectEmbeddedAssets();
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const pinOverlay = document.getElementById('pin-overlay');
  const pinBoxes = document.querySelectorAll('.pin-box');
  const pinError = document.getElementById('pin-error');
  const mainContent = document.getElementById('main-content');

  // ============================================================
  // BACKGROUND MUSIC (Starts on 1st User Interaction)
  // ============================================================
  function updateMusicUI(isPlaying) {
    if (!musicIcon || !musicBtn) return;
    if (isPlaying) {
      musicIcon.textContent = '🎶';
      musicBtn.setAttribute('aria-label', 'Pause Music');
      musicBtn.classList.add('playing');
    } else {
      musicIcon.textContent = '🎵';
      musicBtn.setAttribute('aria-label', 'Play Music');
      musicBtn.classList.remove('playing');
    }
  }

  function startBgMusic() {
    if (!bgAudio) return;
    if (!bgAudio.src && typeof EMBEDDED_ASSETS !== 'undefined' && EMBEDDED_ASSETS['bg_music']) {
      bgAudio.src = EMBEDDED_ASSETS['bg_music'];
    }
    bgAudio.volume = 0.35; // 35% Volume
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateMusicUI(true);
        removeLandingAudioListeners();
      }).catch((err) => {
        console.warn("Audio autoplay blocked:", err);
        updateMusicUI(false);
      });
    }
  }

  function handleFirstUserInteraction() {
    startBgMusic();
  }

  const audioEvents = ['click', 'touchstart', 'keydown', 'pointerdown'];

  function addLandingAudioListeners() {
    audioEvents.forEach(evt => {
      document.addEventListener(evt, handleFirstUserInteraction, { passive: true });
    });
  }

  function removeLandingAudioListeners() {
    audioEvents.forEach(evt => {
      document.removeEventListener(evt, handleFirstUserInteraction);
    });
  }

  // Attempt autoplay immediately
  startBgMusic();
  addLandingAudioListeners();

  // ============================================================
  // 1. MECHANICAL LOCK + TREASURE BOX + PUZZLE
  // ============================================================
  const treasureBox = document.getElementById('treasure-box');
  const puzzleOverlay = document.getElementById('puzzle-overlay');
  const puzzleCloseBtn = document.getElementById('puzzle-close-btn');

  pinBoxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '');
      startBgMusic();
      if (box.value.length === 1 && i < pinBoxes.length - 1) pinBoxes[i + 1].focus();
      checkPin();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) pinBoxes[i - 1].focus();
    });
  });

  function checkPin() {
    let pin = '';
    pinBoxes.forEach(b => pin += b.value);
    if (pin.length < 4) { pinError.classList.remove('visible'); return; }
    if (pin === '5454') {
      unlock();
    } else {
      pinError.classList.add('visible');
      if (treasureBox) {
        treasureBox.classList.remove('shake-box');
        void treasureBox.offsetWidth;
        treasureBox.classList.add('shake-box');
        setTimeout(() => treasureBox.classList.remove('shake-box'), 700);
      }
      setTimeout(() => { pinBoxes.forEach(b => b.value = ''); pinBoxes[0].focus(); }, 600);
    }
  }

  function unlock() {
    pinError.classList.remove('visible');

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const letterScroll = document.querySelector('.letter-scroll');
    if (letterScroll) letterScroll.scrollTop = 0;

    setTimeout(() => {
      pinOverlay.style.opacity = '0';
      setTimeout(() => pinOverlay.remove(), 1200);
    }, 300);

    document.body.classList.remove('locked');
    mainContent.style.opacity = '1';
    mainContent.style.pointerEvents = 'auto';
    
    startBgMusic();
    initAll();
  }

  // Treasure Box — tap to open poetry puzzle
  if (treasureBox && puzzleOverlay) {
    treasureBox.addEventListener('click', (e) => {
      e.stopPropagation();
      startBgMusic();
      puzzleOverlay.classList.add('visible');
    });
  }

  if (puzzleCloseBtn && puzzleOverlay) {
    puzzleCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      puzzleOverlay.classList.remove('visible');
      setTimeout(() => { if (pinBoxes[0]) pinBoxes[0].focus(); }, 400);
    });
  }

  if (puzzleOverlay) {
    puzzleOverlay.addEventListener('click', (e) => {
      if (e.target === puzzleOverlay) {
        puzzleOverlay.classList.remove('visible');
        setTimeout(() => { if (pinBoxes[0]) pinBoxes[0].focus(); }, 400);
      }
    });
  }

  const musicPlayer = document.getElementById('music-player');

  function toggleMusic(e) {
    if (e) e.stopPropagation();
    if (!bgAudio) return;
    if (bgAudio.paused) {
      bgAudio.volume = 0.35;
      bgAudio.play().then(() => {
        updateMusicUI(true);
      }).catch(err => {
        console.log("Audio play error:", err);
      });
    } else {
      bgAudio.pause();
      updateMusicUI(false);
    }
  }

  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);
  if (musicPlayer) musicPlayer.addEventListener('click', toggleMusic);

  // ============================================================
  // 2. INIT SCROLL & ANIMATIONS (Vanilla Observer Replacement for GSAP)
  // ============================================================
  function initAll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.letter-para').forEach(p => observer.observe(p));

    const nightSection = document.getElementById('section-8');
    if (nightSection) {
      const nightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            document.body.classList.add('night-mode');
          } else {
            document.body.classList.remove('night-mode');
          }
        });
      }, { threshold: 0.2 });

      nightObserver.observe(nightSection);
    }

    if (!prefersReducedMotion) startParticles();
  }

  // ============================================================
  // 3. CURSOR & HOVER MAGICS
  // ============================================================
  const cursor = document.getElementById('custom-cursor');
  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

  if (!isTouchDevice && !prefersReducedMotion && cursor) {
    cursor.classList.add('active');
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (Math.random() > 0.95) createSparkle(e.clientX, e.clientY);
    });
    (function moveCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px'; cursor.style.top = cursorY + 'px';
      requestAnimationFrame(moveCursor);
    })();
  }

  function createSparkle(x, y, isHeart = false) {
    const s = document.createElement('div');
    s.className = 'cursor-sparkle';
    s.style.left = (x + (Math.random() - 0.5) * 20) + 'px';
    s.style.top = (y + (Math.random() - 0.5) * 20) + 'px';
    if (isHeart) {
      s.textContent = '❤️'; s.style.background = 'transparent'; s.style.fontSize = '12px';
    } else {
      s.style.background = Math.random() > 0.5 ? '#B99B6B' : '#DDA8B7';
    }
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }

  document.querySelectorAll('.interactive-item, a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('bloom'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('bloom'));
  });

  // ============================================================
  // 4. MICRO-INTERACTIONS
  // ============================================================
  const bouquetCard = document.getElementById('bouquet-card');
  if (bouquetCard) {
    bouquetCard.addEventListener('click', (e) => {
      bouquetCard.classList.toggle('is-flipped');
      burstParticles(e.clientX, e.clientY, 'petal');
    });
  }

  const envs = document.querySelectorAll('.envelope-container');
  envs.forEach(env => {
    const img = env.querySelector('.img-envelope');
    if (img) {
      env.addEventListener('click', (e) => {
        img.classList.toggle('open');
        if (img.classList.contains('open')) burstParticles(e.clientX, e.clientY, 'sparkle');
      });
    }
  });

  document.querySelectorAll('.scatter-deco').forEach(deco => {
    deco.addEventListener('click', (e) => {
      burstParticles(e.clientX, e.clientY, 'pollen');
    });
  });

  // ============================================================
  // 5. ADVANCED PARTICLE ENGINE (Canvas)
  // ============================================================
  const pCanvas = document.getElementById('particles-canvas');
  if (!pCanvas) return;
  const pCtx = pCanvas.getContext('2d');
  let particles = [];

  function resizeP() { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; }
  resizeP(); window.addEventListener('resize', resizeP);

  class Particle {
    constructor(type = null, x = null, y = null) {
      this.type = type || this.getRandomType();
      this.x = x !== null ? x : Math.random() * pCanvas.width;
      this.y = y !== null ? y : Math.random() * pCanvas.height;
      this.rot = Math.random() * 360;
      this.rotV = (Math.random() - 0.5) * 2;
      this.opacity = 1;
      this.decay = 0;

      switch (this.type) {
        case 'petal':
          this.size = Math.random() * 8 + 6;
          this.vy = Math.random() * 0.7 + 0.3;
          this.vx = (Math.random() - 0.5) * 0.6;
          this.color = Math.random() > 0.5 ? 'rgba(218,168,183,0.6)' : 'rgba(246,215,223,0.6)';
          break;
        case 'pollen':
          this.size = Math.random() * 1.5 + 0.5;
          this.vy = (Math.random() - 0.5) * 0.2;
          this.vx = (Math.random() - 0.5) * 0.2;
          this.color = 'rgba(185,155,107,0.4)';
          break;
        case 'firefly':
          this.size = Math.random() * 2 + 1;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.color = 'rgba(245,232,176,0.8)';
          this.pulse = Math.random() * Math.PI;
          break;
        case 'heart':
          this.size = Math.random() * 10 + 5;
          this.vy = -Math.random() * 1 - 0.5;
          this.vx = Math.sin(Date.now() / 1000) * 0.5;
          this.color = 'rgba(221,168,183,0.7)';
          this.decay = 0.005;
          break;
        case 'sparkle':
          this.size = Math.random() * 2 + 1;
          this.vy = (Math.random() - 0.5) * 2;
          this.vx = (Math.random() - 0.5) * 2;
          this.color = '#B99B6B';
          this.decay = 0.02;
          break;
        default:
          this.size = Math.random() * 2 + 1;
          this.vy = Math.random() * 0.5;
          this.vx = 0;
          this.color = 'rgba(185,155,107,0.4)';
      }
    }

    getRandomType() {
      const r = Math.random();
      if (r < 0.4) return 'petal';
      if (document.body.classList.contains('night-mode') && r < 0.6) return 'firefly';
      return 'pollen';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rot += this.rotV;

      if (this.type === 'heart') {
        this.vx = Math.sin(this.y * 0.05) * 0.5;
      } else if (this.type === 'firefly') {
        this.pulse += 0.05;
        this.opacity = (Math.sin(this.pulse) + 1) / 2 * 0.8 + 0.2;
      }

      this.opacity -= this.decay;

      if (this.decay === 0) {
        if (this.y > pCanvas.height + 20) this.y = -20;
        else if (this.y < -20) this.y = pCanvas.height + 20;

        if (this.x > pCanvas.width + 20) this.x = -20;
        else if (this.x < -20) this.x = pCanvas.width + 20;
      }
    }

    draw() {
      if (this.opacity <= 0) return;
      pCtx.save();
      pCtx.globalAlpha = this.opacity;
      pCtx.translate(this.x, this.y);
      pCtx.rotate(this.rot * Math.PI / 180);
      pCtx.fillStyle = this.color;

      if (this.type === 'petal') {
        pCtx.beginPath(); pCtx.moveTo(0, -this.size);
        pCtx.bezierCurveTo(this.size, -this.size, this.size, this.size, 0, this.size);
        pCtx.bezierCurveTo(-this.size * 0.5, this.size, -this.size * 0.5, -this.size, 0, -this.size);
        pCtx.fill();
      } else if (this.type === 'heart') {
        pCtx.beginPath();
        pCtx.moveTo(0, this.size / 4);
        pCtx.bezierCurveTo(0, -this.size / 2, -this.size, -this.size / 2, -this.size, this.size / 4);
        pCtx.bezierCurveTo(-this.size, this.size, 0, this.size * 1.5, 0, this.size * 2);
        pCtx.bezierCurveTo(0, this.size * 1.5, this.size, this.size, this.size, this.size / 4);
        pCtx.bezierCurveTo(this.size, -this.size / 2, 0, -this.size / 2, 0, this.size / 4);
        pCtx.fill();
      } else {
        pCtx.beginPath(); pCtx.arc(0, 0, this.size, 0, Math.PI * 2); pCtx.fill();
      }
      pCtx.restore();
    }
  }

  function startParticles() {
    for (let i = 0; i < 7; i++) particles.push(new Particle());
    (function loop() {
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      particles = particles.filter(p => p.opacity > 0);
      while (particles.length < 7) particles.push(new Particle());

      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    })();
  }

  function burstParticles(x, y, type) {
    if (prefersReducedMotion) return;
    const count = type === 'heart' ? 3 : (type === 'petal' ? 12 : 8);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(type, x, y));
    }
  }

})();
