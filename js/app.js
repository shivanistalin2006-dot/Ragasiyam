/* ==========================================================================
   RAGASIYAM — Application Router & Feature Controller
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
    const activeTheme = potdStorage.getState().activeTheme || 'sunset';
    document.body.classList.remove('pink-mode', 'midnight-mode');

    if (activeTheme === 'pink') {
      document.body.classList.add('pink-mode');
    } else if (activeTheme === 'midnight') {
      document.body.classList.add('midnight-mode');
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

    const themeBtn = document.getElementById('btn-dark-toggle') || document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.onclick = () => {
        const currentTheme = potdStorage.getState().activeTheme;
        const nextTheme = currentTheme === 'sunset' ? 'pink' : (currentTheme === 'pink' ? 'midnight' : 'sunset');
        potdStorage.setActiveTheme(nextTheme);
        this.applySettings();
        potdSound.playClick();
        gameApp ? gameApp.showToast(`Theme changed to ${nextTheme.toUpperCase()}!`) : null;
      };
      themeBtn.title = "Cycle Themes (Sunset / Pink / Midnight)";
    }
  },

  updateHeaderStats() {
    const state = potdStorage.getState();
    const streakEl = document.getElementById('header-streak-val');
    const scoreEl = document.getElementById('header-score-val');
    const coinsEl = document.getElementById('header-coins-val');

    if (streakEl) streakEl.textContent = `🔥 ${state.currentStreak}`;
    if (scoreEl) scoreEl.textContent = `🏆 ${state.totalScore}`;
    if (coinsEl) coinsEl.textContent = `🪙 ${state.coins || 100}`;
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
          if (confirm(`Logged in as ${user.username}. Log out?`)) {
            potdAuth.logout();
          }
        };
      } else {
        authBtn.innerHTML = `<span>🔑</span> LOGIN`;
        authBtn.onclick = () => {
          if (authModal) authModal.classList.add('active');
        };
      }
    }

    if (closeModalBtn && authModal) {
      closeModalBtn.onclick = () => authModal.classList.remove('active');
    }

    document.querySelectorAll('.avatar-opt-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.avatar-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAvatar = btn.getAttribute('data-avatar') || '🧩';
      };
    });

    const confirmGroup = document.getElementById('auth-confirm-group');

    if (tabLogin && tabSignup) {
      tabLogin.onclick = () => {
        activeTab = 'login';
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        if (emailGroup) emailGroup.style.display = 'none';
        if (confirmGroup) confirmGroup.style.display = 'none';
        if (avatarGroup) avatarGroup.style.display = 'none';
        if (authSubmitBtn) authSubmitBtn.textContent = 'LOG IN 🚀';
        if (errorBanner) errorBanner.style.display = 'none';
      };

      tabSignup.onclick = () => {
        activeTab = 'signup';
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        if (emailGroup) emailGroup.style.display = 'block';
        if (confirmGroup) confirmGroup.style.display = 'block';
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
        const confirmPassword = document.getElementById('auth-confirm-input')?.value;
        const email = document.getElementById('auth-email-input')?.value;
        const rememberMe = document.getElementById('auth-remember-check')?.checked;

        try {
          if (activeTab === 'login') {
            await potdAuth.login(username, password, rememberMe);
          } else {
            await potdAuth.register(username, email, password, confirmPassword, selectedAvatar);
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

  initLandingPage() {
    const todayPuzzle = getTodayPuzzle();
    const state = potdStorage.getState();
    const isCompletedToday = potdStorage.isDayCompleted(todayPuzzle.day);

    const dayNumEl = document.getElementById('hero-day-num');
    const categoryEl = document.getElementById('hero-category');
    const diffEl = document.getElementById('hero-diff');
    const streakEl = document.getElementById('hero-streak');
    const ctaBtn = document.getElementById('hero-cta-btn');

    if (dayNumEl) {
      const formattedDay = String(todayPuzzle.day).padStart(3, '0');
      dayNumEl.textContent = `🌅 RAGASIYAM #${formattedDay}`;
    }

    if (categoryEl) {
      const typeInfo = RIDDLE_TYPES[todayPuzzle.riddleType] || { name: todayPuzzle.categoryName, icon: todayPuzzle.categoryIcon };
      categoryEl.textContent = `${typeInfo.icon} ${typeInfo.name}`;
    }

    if (diffEl) diffEl.textContent = todayPuzzle.difficultyName;
    if (streakEl) streakEl.textContent = `${state.currentStreak} DAYS`;

    if (ctaBtn) {
      if (isCompletedToday) {
        ctaBtn.textContent = 'TODAY\'S MYSTERY SOLVED! (STATS)';
        ctaBtn.onclick = () => window.location.href = 'pages/stats.html';
      } else {
        ctaBtn.onclick = () => window.location.href = 'pages/puzzle.html';
      }
    }

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

    let totalTime = 0;
    let totalHints = 0;
    let perfectCount = 0;
    for (const day in completedDays) {
      totalTime += completedDays[day].timeSpent || 0;
      totalHints += completedDays[day].hintsUsed || 0;
      if (completedDays[day].perfect) perfectCount++;
    }
    const avgTimeSecs = totalSolved > 0 ? Math.round(totalTime / totalSolved) : 0;
    const accuracyPct = totalSolved > 0 ? Math.min(100, Math.round(((totalSolved * 100) / (totalSolved + (totalHints * 0.5))) )) : 100;

    const personality = UIUtils.calculatePersonality(completedDays);

    const nameEl = document.getElementById('player-name-val');
    const levelEl = document.getElementById('player-level-val');
    const personalityEl = document.getElementById('player-personality-val');
    const xpFillEl = document.getElementById('xp-bar-fill');
    const xpTextEl = document.getElementById('xp-bar-text');

    if (nameEl) nameEl.textContent = state.playerName;
    if (levelEl) levelEl.textContent = `Level ${state.level}`;
    if (personalityEl) personalityEl.textContent = personality.title;

    const currentLevelXP = state.xp % 300;
    const pct = Math.min(100, Math.floor((currentLevelXP / 300) * 100));
    if (xpFillEl) xpFillEl.style.width = `${pct}%`;
    if (xpTextEl) xpTextEl.textContent = `${currentLevelXP} / 300 XP`;

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

    // Advanced Stats Integration
    const extraStatsBox = document.getElementById('stat-extra-metrics');
    if (extraStatsBox) {
      extraStatsBox.innerHTML = `
        <div style="background: var(--cream-card); border: 3px solid var(--dark-brown); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-around; font-family: var(--font-heading);">
          <div>🎯 <strong>Accuracy:</strong> ${accuracyPct}%</div>
          <div>✨ <strong>Perfect Solves:</strong> ${perfectCount}</div>
          <div>🪙 <strong>Coins:</strong> ${state.coins || 100}</div>
          <div>🧊 <strong>Streak Freezes:</strong> ${state.streakFreezes || 0}</div>
        </div>
        <div style="text-align: center; font-family: var(--font-heading); color: var(--warm-cream); font-size: 1rem; background: var(--sunset-purple); padding: 0.6rem; border-radius: var(--radius-pill); border: 2px solid var(--dark-brown); margin-bottom: 2rem;">
          ⚡ You solve <strong>32% faster</strong> than your previous average! Pure brain.
        </div>
      `;
    }

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

    // Render Live Leaderboard
    this.renderLeaderboard();
  },

  async renderLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-table-body');
    if (leaderboardBody && typeof potdDB !== 'undefined') {
      const topPlayers = await potdDB.fetchLeaderboard(10);
      leaderboardBody.innerHTML = topPlayers.map((player, idx) => {
        let rankBadge = `${idx + 1}`;
        let rankClass = '';
        if (idx === 0) { rankBadge = '🥇'; rankClass = 'rank-gold'; }
        else if (idx === 1) { rankBadge = '🥈'; rankClass = 'rank-silver'; }
        else if (idx === 2) { rankBadge = '🥉'; rankClass = 'rank-bronze'; }

        return `
          <tr>
            <td class="leaderboard-rank ${rankClass}">${rankBadge}</td>
            <td>
              <div class="leaderboard-user-cell">
                <span>${player.avatar || '🧩'}</span>
                <span>${player.username}</span>
              </div>
            </td>
            <td><strong>${(player.score || 0).toLocaleString()}</strong> pts</td>
            <td>🔥 ${player.streak || 0}</td>
            <td>Level ${player.level || 1}</td>
          </tr>
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
    const monthHeader = document.getElementById('archive-month-title');
    if (monthHeader) monthHeader.textContent = "SEPTEMBER 2026";

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
      const formattedDay = String(p.day).padStart(2, '0');

      return `
        <div class="archive-day-card ${cardClass}" onclick="${canPlay ? `window.location.href='puzzle.html?day=${p.day}&practice=true'` : ''}">
          <div class="archive-day-num">${formattedDay}</div>
          <div class="archive-cat-icon">${p.categoryIcon}</div>
          <div style="font-family: var(--font-heading); font-size: 0.75rem; font-weight:600; color: var(--dark-brown); text-transform: uppercase;">${p.dayOfWeek}</div>
          <div class="archive-status-badge">${statusText}</div>
        </div>
      `;
    }).join('');
  }
};
