/* ==========================================================================
   PUZZLE OF THE DAY — UI Utilities, Audio Synthesizer, & Visual FX
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Web Audio API Retro Arcade Synthesizer
   -------------------------------------------------------------------------- */
class RetroSoundSynth {
  constructor() {
    this.ctx = null;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmGainNode = null;
    this.autoPlayAttached = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initAutoPlayOnInteraction() {
    if (this.autoPlayAttached) return;
    this.autoPlayAttached = true;
    const startAudioOnGesture = () => {
      this.initContext();
      if (potdStorage.getState().settings.soundEnabled && !this.bgmPlaying) {
        this.startBGM();
      }
    };
    window.addEventListener('click', startAudioOnGesture, { once: true });
    window.addEventListener('touchstart', startAudioOnGesture, { once: true });
    window.addEventListener('keydown', startAudioOnGesture, { once: true });
  }

  startBGM() {
    if (!potdStorage.getState().settings.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.bgmPlaying) return;

    this.bgmPlaying = true;
    this.bgmStep = 0;

    // Master BGM gain node for low sound level (pleasant background sound)
    if (!this.bgmGainNode) {
      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.connect(this.ctx.destination);
    }
    // Smooth fade in to ultra low sound level (0.025)
    this.bgmGainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.bgmGainNode.gain.exponentialRampToValueAtTime(0.025, this.ctx.currentTime + 1.2);

    // Chords for pleasant green fresh nature tune (F maj9 -> C maj7/E -> D min9 -> Bb maj7)
    const chordProgression = [
      [174.61, 220.00, 261.63, 329.63, 392.00], // F maj9
      [130.81, 196.00, 246.94, 261.63, 329.63], // C maj7/E
      [146.83, 220.00, 261.63, 329.63, 440.00], // D min9
      [116.54, 174.61, 220.00, 293.66, 349.23]  // Bb maj7
    ];

    const arpeggioPattern = [0, 2, 4, 3, 1, 4, 2, 3];

    if (this.bgmTimer) clearInterval(this.bgmTimer);

    // Step every 450ms (~67 BPM eighth-note rhythm, calm fresh pace)
    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || !this.ctx || !potdStorage.getState().settings.soundEnabled) return;

      const chordIdx = Math.floor(this.bgmStep / 8) % chordProgression.length;
      const currentChord = chordProgression[chordIdx];
      const noteOffset = arpeggioPattern[this.bgmStep % 8];
      const freq = currentChord[noteOffset % currentChord.length];

      try {
        // Soft Sine wave with 700Hz lowpass filter for green meadow tone
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, this.ctx.currentTime);

        const now = this.ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGainNode);

        osc.start(now);
        osc.stop(now + 0.9);

        // Soft sub bass pad at start of each chord cycle (every 8 steps)
        if (this.bgmStep % 8 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          const bassFilter = this.ctx.createBiquadFilter();

          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(currentChord[0], now);

          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(350, now);

          bassGain.gain.setValueAtTime(0.001, now);
          bassGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.bgmGainNode);

          bassOsc.start(now);
          bassOsc.stop(now + 3.3);
        }
      } catch (e) {
        // audio context safeguard
      }

      this.bgmStep++;
    }, 450);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmGainNode && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.bgmGainNode.gain.setValueAtTime(this.bgmGainNode.gain.value, now);
        this.bgmGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      } catch (e) {}
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.1) {
    if (!potdStorage.getState().settings.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context safeguard
    }
  }

  playClick() {
    this.playTone(600, 'triangle', 0.05, 0.08);
  }

  playStart() {
    this.playTone(440, 'square', 0.08, 0.1);
    setTimeout(() => this.playTone(880, 'square', 0.15, 0.1), 80);
  }

  playCorrect() {
    // 4-note victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.2, 0.15);
      }, idx * 100);
    });
  }

  playWrong() {
    this.playTone(150, 'sawtooth', 0.25, 0.15);
    setTimeout(() => this.playTone(110, 'sawtooth', 0.3, 0.15), 150);
  }

  playHint() {
    this.playTone(587.33, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(880, 'sine', 0.2, 0.12), 100);
  }

  playAchievement() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.25, 0.15);
      }, idx * 80);
    });
  }

  playTimerWarning() {
    this.playTone(800, 'square', 0.06, 0.05);
  }

  playTick() {
    this.playTone(1000, 'sine', 0.02, 0.03);
  }
}

const potdSound = new RetroSoundSynth();

/* --------------------------------------------------------------------------
   2. Canvas Confetti Particle Generator
   -------------------------------------------------------------------------- */
class ConfettiEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
  }

  createCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'confetti-canvas';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(particleCount = 70) {
    this.createCanvas();
    const colors = ['#F6C56B', '#E77A61', '#C86B78', '#59345F', '#FFF0D2', '#4E9F67'];
    this.particles = [];

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2 - 50,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.4,
        opacity: 1
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let activeParticles = 0;

    this.particles.forEach(p => {
      if (p.opacity > 0) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rSpeed;
        p.opacity -= 0.012;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }
    });

    if (activeParticles > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const potdConfetti = new ConfettiEngine();

/* --------------------------------------------------------------------------
   3. UI Helper Animations & Counter Effects
   -------------------------------------------------------------------------- */
const UIUtils = {
  animateNumber(element, start, end, duration = 1000) {
    if (!element) return;
    const startTime = performance.now();
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const currentVal = Math.floor(start + (end - start) * (1 - (1 - progress) * (1 - progress)));
      element.textContent = currentVal.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = end.toLocaleString();
      }
    };
    requestAnimationFrame(step);
  },

  calculatePersonality(completedDays = {}) {
    const counts = {
      logic: 0, word: 0, number: 0, mystery: 0, visual: 0, speed: 0, pattern: 0
    };

    for (const day in completedDays) {
      const puzzle = PUZZLES_DATA.find(p => p.day === parseInt(day, 10));
      if (puzzle && counts[puzzle.category] !== undefined) {
        counts[puzzle.category]++;
      }
    }

    let topCat = 'mystery';
    let maxCount = -1;
    for (const cat in counts) {
      if (counts[cat] > maxCount) {
        maxCount = counts[cat];
        topCat = cat;
      }
    }

    const personalities = {
      logic: { title: '🧠 STRATEGIST', desc: 'You analyze every possibility before taking action.' },
      word: { title: '🔤 WORDSMITH', desc: 'You hold a mastery over language and vocabulary.' },
      number: { title: '🔢 CODEBREAKER', desc: 'Numbers dance in patterns before your eyes.' },
      mystery: { title: '🕵️ THE DETECTIVE', desc: 'You excel at discovering what others easily overlook.' },
      visual: { title: '👀 VISUALIZER', desc: 'Spatial shapes and geometric patterns are your domain.' },
      speed: { title: '⚡ SPEEDSTER', desc: 'Your reflex solves challenges before the clock even ticks.' },
      pattern: { title: '🎯 PATTERN MASTER', desc: 'You see order and sequence where others see chaos.' }
    };

    return personalities[topCat] || personalities.mystery;
  },

  spawnFloatingPieces() {
    const container = document.body;
    const pieces = ['🧩', '⭐', '✨', '🎯', '💡', '🔍'];
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.className = 'floating-piece';
      el.textContent = pieces[i % pieces.length];
      el.style.top = `${Math.random() * 80 + 10}%`;
      el.style.left = `${Math.random() * 90 + 5}%`;
      el.style.animationDelay = `${Math.random() * 4}s`;
      container.appendChild(el);
    }
  }
};
