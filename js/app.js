/* ==========================================================================
   PUZZLE OF THE DAY — Application Router & Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  AppRouter.init();
});

const AppRouter = {
  async init() {
    if (typeof potdDB !== 'undefined') {
      await potdDB.init();
    }
    if (typeof potdAuth !== 'undefined' && potdAuth.isAuthenticated()) {
      potdStorage.loadUserStateFromDB(potdAuth.getCurrentUser());
    }

    this.applySettings();
    this.setupGlobalEvents();
    this.setupAuthModalEvents();
    this.updateHeaderStats();
    UIUtils.spawnFloatingPieces();

    // Detect current page
    const pathname = window.location.pathname;
    if (pathname.endsWith('stats.html')) {
      this.initStatsPage();
    } else if (pathname.endsWith('achievements.html')) {
      this.initAchievementsPage();
    } else if (pathname.endsWith('archive.html')) {
      this.initArchivePage();
    } else if (pathname.endsWith('puzzle.html')) {
      if (typeof gameApp !== 'undefined') {
        gameApp.init();
      }
    } else {
      this.initLandingPage();
    }
  },

  applySettings() {
    const settings = potdStorage.getState().settings;
    if (settings.pinkMode) {
      document.body.classList.add('pink-mode');
    } else {
      document.body.classList.remove('pink-mode');
    }
  },

  setupGlobalEvents() {
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.onclick = () => {
        const isEnabled = potdStorage.toggleSound();
        soundBtn.textContent = isEnabled ? '🔊' : '🔇';
        if (isEnabled) potdSound.playClick();
      };
      soundBtn.textContent = potdStorage.getState().settings.soundEnabled ? '🔊' : '🔇';
    }

    const pinkBtn = document.getElementById('btn-dark-toggle') || document.getElementById('btn-pink-toggle');
    if (pinkBtn) {
      pinkBtn.onclick = () => {
        const isPink = potdStorage.togglePinkMode();
        this.applySettings();
        potdSound.playClick();
      };
      pinkBtn.title = "Toggle Pink Sunset Theme";
    }
  },

  setupAuthModalEvents() {
    const authBtn = document.getElementById('btn-auth-trigger');
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('auth-modal-close');
    const authForm = document.getElementById('auth-form');
    const tabLogin = document.getElementById('tab-btn-login');
    const tabSignup = document.getElementById('tab-btn-signup');
    const emailGroup = document.getElementById('auth-email-group');
    const avatarGroup = document.getElementById('auth-avatar-group');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const errorBanner = document.getElementById('auth-error-banner');

    let activeTab = 'login';
    let selectedAvatar = '🧩';

    if (authBtn) {
      if (typeof potdAuth !== 'undefined' && potdAuth.isAuthenticated()) {
        const user = potdAuth.getCurrentUser();
        authBtn.innerHTML = `<span>${user.avatar || '🧩'}</span> ${user.username}`;
        authBtn.onclick = () => {
          if (confirm(`Logged in as ${user.username}. Do you want to log out?`)) {
            potdAuth.logout();
          }
        };
      } else {
        authBtn.innerHTML = `<span>🔑</span> LOGIN / SIGN UP`;
        authBtn.onclick = () => {
          if (authModal) authModal.classList.add('active');
        };
      }
    }

    if (closeModalBtn && authModal) {
      closeModalBtn.onclick = () => authModal.classList.remove('active');
    }

    // Avatar selector clicks
    document.querySelectorAll('.avatar-opt-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.avatar-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAvatar = btn.getAttribute('data-avatar') || '🧩';
      };
    });

    if (tabLogin && tabSignup) {
      tabLogin.onclick = () => {
        activeTab = 'login';
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        if (emailGroup) emailGroup.style.display = 'none';
        if (avatarGroup) avatarGroup.style.display = 'none';
        if (authSubmitBtn) authSubmitBtn.textContent = 'LOG IN 🚀';
        if (errorBanner) errorBanner.style.display = 'none';
      };

      tabSignup.onclick = () => {
        activeTab = 'signup';
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        if (emailGroup) emailGroup.style.display = 'block';
        if (avatarGroup) avatarGroup.style.display = 'block';
        if (authSubmitBtn) authSubmitBtn.textContent = 'CREATE ACCOUNT ✨';
        if (errorBanner) errorBanner.style.display = 'none';
      };
    }

    if (authForm) {
      authForm.onsubmit = async (e) => {
        e.preventDefault();
        if (errorBanner) errorBanner.style.display = 'none';

        const username = document.getElementById('auth-username-input')?.value;
        const password = document.getElementById('auth-password-input')?.value;
        const email = document.getElementById('auth-email-input')?.value;

        try {
          if (activeTab === 'login') {
            await potdAuth.login(username, password);
          } else {
            await potdAuth.register(username, email, password, selectedAvatar);
          }
          potdSound.playAchievement();
          if (authModal) authModal.classList.remove('active');
          window.location.reload();
        } catch (err) {
          potdSound.playWrong();
          if (errorBanner) {
            errorBanner.textContent = err.message || 'Authentication failed.';
            errorBanner.style.display = 'block';
          }
        }
      };
    }
  },

  updateHeaderStats() {
    const state = potdStorage.getState();
    const streakEl = document.getElementById('header-streak-val');
    const scoreEl = document.getElementById('header-score-val');

    if (streakEl) streakEl.textContent = `🔥 ${state.currentStreak}`;
    if (scoreEl) scoreEl.textContent = `🏆 ${state.totalScore}`;
  },

  initLandingPage() {
    const todayPuzzle = getTodayPuzzle();
    const state = potdStorage.getState();
    const isCompletedToday = potdStorage.isDayCompleted(todayPuzzle.day);

    const dayNumEl = document.getElementById('hero-day-num');
    const categoryEl = document.getElementById('hero-category');
    const diffEl = document.getElementById('hero-diff');
    const streakEl = document.getElementById('hero-streak');
    const ctaBtn = document.getElementById('hero-cta-btn');

    if (dayNumEl) dayNumEl.textContent = `#${todayPuzzle.day}`;
    if (categoryEl) categoryEl.textContent = `${todayPuzzle.categoryIcon} ${todayPuzzle.categoryName}`;
    if (diffEl) diffEl.textContent = todayPuzzle.difficultyName;
    if (streakEl) streakEl.textContent = `${state.currentStreak} DAYS`;

    if (ctaBtn) {
      if (isCompletedToday) {
        ctaBtn.textContent = 'TODAY\'S PUZZLE SOLVED! (SEE STATS)';
        ctaBtn.onclick = () => window.location.href = 'pages/stats.html';
      } else {
        ctaBtn.onclick = () => window.location.href = 'pages/puzzle.html';
      }
    }

    // Render Weekly Streak Strip
    const streakStrip = document.getElementById('hero-streak-strip');
    if (streakStrip) {
      const calendarData = potdStreak.getWeeklyCalendarData(state.completedDays);
      streakStrip.innerHTML = calendarData.map(d => {
        let icon = '🔒';
        if (d.status === 'completed') icon = '✅';
        else if (d.status === 'today') icon = '🔥';
        else if (d.status === 'missed') icon = '❌';

        return `
          <div style="text-align:center; font-family: var(--font-heading); font-size: 0.8rem;">
            <div style="font-weight: 700; color: var(--sunset-purple);">${d.dayName}</div>
            <div style="font-size: 1.2rem;">${icon}</div>
          </div>
        `;
      }).join('');
    }
  },

  initStatsPage() {
    const state = potdStorage.getState();
    const completedDays = state.completedDays;
    const totalSolved = Object.keys(completedDays).length;

    // Calculate averages & accuracy
    let totalTime = 0;
    let totalHints = 0;
    for (const day in completedDays) {
      totalTime += completedDays[day].timeSpent || 0;
      totalHints += completedDays[day].hintsUsed || 0;
    }
    const avgTimeSecs = totalSolved > 0 ? Math.round(totalTime / totalSolved) : 0;
    const personality = UIUtils.calculatePersonality(completedDays);

    // Profile updates
    const nameEl = document.getElementById('player-name-val');
    const levelEl = document.getElementById('player-level-val');
    const personalityEl = document.getElementById('player-personality-val');
    const xpFillEl = document.getElementById('xp-bar-fill');
    const xpTextEl = document.getElementById('xp-bar-text');

    if (nameEl) nameEl.textContent = state.playerName;
    if (levelEl) levelEl.textContent = `Level ${state.level}`;
    if (personalityEl) personalityEl.textContent = personality.title;

    // XP calculation: 300 XP per level
    const currentLevelXP = state.xp % 300;
    const pct = Math.min(100, Math.floor((currentLevelXP / 300) * 100));
    if (xpFillEl) xpFillEl.style.width = `${pct}%`;
    if (xpTextEl) xpTextEl.textContent = `${currentLevelXP} / 300 XP`;

    // Stats Grid
    const totalSolvedEl = document.getElementById('stat-total-solved');
    const totalScoreEl = document.getElementById('stat-total-score');
    const currentStreakEl = document.getElementById('stat-current-streak');
    const longestStreakEl = document.getElementById('stat-longest-streak');
    const avgTimeEl = document.getElementById('stat-avg-time');
    const hintsUsedEl = document.getElementById('stat-hints-used');

    if (totalSolvedEl) totalSolvedEl.textContent = totalSolved;
    if (totalScoreEl) totalScoreEl.textContent = state.totalScore.toLocaleString();
    if (currentStreakEl) currentStreakEl.textContent = state.currentStreak;
    if (longestStreakEl) longestStreakEl.textContent = state.longestStreak;
    if (avgTimeEl) avgTimeEl.textContent = `${avgTimeSecs}s`;
    if (hintsUsedEl) hintsUsedEl.textContent = totalHints;

    // Category Distribution CSS Chart
    const chartContainer = document.getElementById('category-chart-container');
    if (chartContainer) {
      const counts = { logic: 0, word: 0, number: 0, mystery: 0, visual: 0, speed: 0, pattern: 0 };
      for (const day in completedDays) {
        const puzzle = PUZZLES_DATA.find(p => p.day === parseInt(day, 10));
        if (puzzle && counts[puzzle.category] !== undefined) counts[puzzle.category]++;
      }

      const categories = [
        { key: 'logic', name: '🧠 Logic' },
        { key: 'word', name: '🔤 Word' },
        { key: 'number', name: '🔢 Number' },
        { key: 'mystery', name: '🕵️ Mystery' },
        { key: 'visual', name: '👀 Visual' },
        { key: 'speed', name: '⚡ Speed' },
        { key: 'pattern', name: '🎯 Pattern' }
      ];

      const maxCount = Math.max(1, ...Object.values(counts));

      chartContainer.innerHTML = categories.map(c => {
        const cnt = counts[c.key];
        const barPct = Math.round((cnt / maxCount) * 100);
        return `
          <div class="chart-bar-row">
            <div class="chart-bar-label">${c.name}</div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width: ${barPct}%;"></div>
            </div>
            <div class="chart-bar-val">${cnt}</div>
          </div>
        `;
      }).join('');
    }
  },

  initAchievementsPage() {
    const state = potdStorage.getState();
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;

    grid.innerHTML = ACHIEVEMENTS_LIST.map(ach => {
      const isUnlocked = state.unlockedAchievements.includes(ach.id);
      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
          <div class="achievement-icon">${ach.icon}</div>
          <div class="achievement-title">${ach.title}</div>
          <div class="achievement-desc">${ach.description}</div>
        </div>
      `;
    }).join('');
  },

  initArchivePage() {
    const state = potdStorage.getState();
    const grid = document.getElementById('archive-grid');
    if (!grid) return;

    const todayDay = getTodayPuzzle().day;

    grid.innerHTML = PUZZLES_DATA.map(p => {
      const isCompleted = potdStorage.isDayCompleted(p.day);
      const isToday = (p.day === todayDay);
      const isLocked = (p.day > todayDay);

      let cardClass = '';
      let statusText = '';

      if (isCompleted) {
        const detail = state.completedDays[p.day];
        cardClass = detail && detail.perfect ? 'perfect' : 'completed';
        statusText = detail && detail.perfect ? '🌟 PERFECT' : '✅ SOLVED';
      } else if (isToday) {
        cardClass = 'today';
        statusText = '🔥 TODAY';
      } else if (isLocked) {
        cardClass = 'locked';
        statusText = '🔒 LOCKED';
      } else {
        cardClass = 'missed';
        statusText = '❌ MISSED';
      }

      const canPlay = !isLocked;

      return `
        <div class="archive-day-card ${cardClass}" onclick="${canPlay ? `window.location.href='puzzle.html?day=${p.day}&practice=true'` : ''}">
          <div class="archive-day-num">DAY #${p.day}</div>
          <div class="archive-cat-icon">${p.categoryIcon}</div>
          <div style="font-family: var(--font-heading); font-size: 0.8rem; font-weight:600; color: var(--dark-brown); text-transform: uppercase;">${p.categoryName}</div>
          <div class="archive-status-badge">${statusText}</div>
        </div>
      `;
    }).join('');
  }
};
