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
    this.setupStreakGoalModalEvents();
    this.setupArcadeShopModalEvents();
    this.updateHeaderStats();
    this.renderStreakGoalWidgets();
    this.checkStreakReminderBanner();
    this.checkDailyLoginReward();
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

    // Auto-prompt login modal immediately on load if user is not logged in
    if (typeof potdAuth !== 'undefined' && !potdAuth.isAuthenticated()) {
      if (authModal) {
        setTimeout(() => {
          authModal.classList.add('active');
        }, 350);
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
    const googleBtnText = document.getElementById('google-btn-text');

    if (tabLogin && tabSignup) {
      tabLogin.onclick = () => {
        activeTab = 'login';
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        if (emailGroup) emailGroup.style.display = 'none';
        if (confirmGroup) confirmGroup.style.display = 'none';
        if (avatarGroup) avatarGroup.style.display = 'none';
        if (authSubmitBtn) authSubmitBtn.textContent = 'LOG IN 🚀';
        if (googleBtnText) googleBtnText.textContent = 'Log In with Google';
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
        if (googleBtnText) googleBtnText.textContent = 'Sign Up with Google';
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
    const avatarBox = document.getElementById('profile-avatar-box');

    if (avatarBox) {
      avatarBox.className = 'profile-avatar-box';
      const equippedFrame = state.equippedFrame || 'none';
      if (equippedFrame && equippedFrame !== 'none') {
        avatarBox.classList.add(`frame-${equippedFrame}`);
      }
    }

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
    this.renderLeaderboard(this.currentLeaderboardCategory || 'score');
  },

  currentLeaderboardCategory: 'score',

  switchLeaderboardTab(category) {
    this.currentLeaderboardCategory = category;
    const tabs = document.querySelectorAll('.leaderboard-container .auth-tab-btn');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-category') === category) {
        tab.classList.add('active');
      }
    });
    this.renderLeaderboard(category);
  },

  async renderLeaderboard(category = this.currentLeaderboardCategory || 'score') {
    const leaderboardBody = document.getElementById('leaderboard-table-body');
    if (leaderboardBody && typeof potdDB !== 'undefined') {
      const topPlayers = await potdDB.fetchLeaderboard(10, category);
      leaderboardBody.innerHTML = topPlayers.map((player, idx) => {
        let rankBadge = `${idx + 1}`;
        let rankClass = '';
        if (idx === 0) { rankBadge = '🥇'; rankClass = 'rank-gold'; }
        else if (idx === 1) { rankBadge = '🥈'; rankClass = 'rank-silver'; }
        else if (idx === 2) { rankBadge = '🥉'; rankClass = 'rank-bronze'; }

        let catDisplay = `<strong>${(player.score || 0).toLocaleString()}</strong> pts`;
        if (category === 'streak') catDisplay = `🔥 <strong>${player.streak || 0}</strong> days`;
        else if (category === 'coins') catDisplay = `🪙 <strong>${(player.coins || 0).toLocaleString()}</strong>`;

        return `
          <tr>
            <td class="leaderboard-rank ${rankClass}">${rankBadge}</td>
            <td>
              <div class="leaderboard-user-cell">
                <span>${player.avatar || '🧩'}</span>
                <span>${player.username}</span>
              </div>
            </td>
            <td>${catDisplay}</td>
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
  },

  setupStreakGoalModalEvents() {
    const goalModal = document.getElementById('streak-goal-modal');
    const closeBtn = document.getElementById('streak-goal-modal-close');
    const saveBtn = document.getElementById('save-streak-goal-btn');
    const customRow = document.getElementById('custom-goal-input-row');
    const customInput = document.getElementById('custom-goal-val');

    let selectedGoalVal = potdStorage.getState().streakGoal || 7;

    if (closeBtn && goalModal) {
      closeBtn.onclick = () => goalModal.classList.remove('active');
    }

    document.querySelectorAll('.goal-opt-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.goal-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const goalVal = btn.getAttribute('data-goal');
        selectedGoalVal = goalVal;

        if (goalVal === 'custom') {
          if (customRow) customRow.style.display = 'block';
        } else {
          if (customRow) customRow.style.display = 'none';
        }
      };
    });

    if (saveBtn) {
      saveBtn.onclick = () => {
        let finalGoal = selectedGoalVal;
        if (selectedGoalVal === 'custom') {
          finalGoal = parseInt(customInput?.value, 10) || 7;
        }

        potdStorage.setStreakGoal(finalGoal);

        const reminderCheck = document.getElementById('streak-reminder-check');
        const reminderTimeOpt = document.getElementById('streak-reminder-time-opt');
        const reminderEnabled = reminderCheck ? reminderCheck.checked : true;
        const reminderTiming = reminderTimeOpt ? reminderTimeOpt.value : '09:00';

        potdStorage.setReminderSettings(reminderEnabled, reminderTiming);

        if (reminderEnabled && window.Notification && Notification.permission !== 'granted') {
          Notification.requestPermission();
        }

        if (goalModal) goalModal.classList.remove('active');
        this.renderStreakGoalWidgets();
        if (typeof potdSound !== 'undefined') potdSound.playAchievement();
      };
    }
  },

  openStreakGoalModal() {
    const goalModal = document.getElementById('streak-goal-modal');
    if (goalModal) {
      goalModal.classList.add('active');
    }
  },

  renderStreakGoalWidgets() {
    const state = potdStorage.getState();
    const widgetHtml = potdStreak.renderProgressBar(state.currentStreak, state.streakGoal);

    // Hero / Landing container
    const heroGoalContainer = document.getElementById('hero-streak-goal-container');
    if (heroGoalContainer) {
      heroGoalContainer.innerHTML = `
        ${widgetHtml}
        <button type="button" onclick="AppRouter.openStreakGoalModal()" class="btn btn-outline btn-sm" style="margin-top: 0.5rem; width: 100%;">
          🎯 EDIT STREAK GOAL
        </button>
      `;
    }

    // Stats page container
    const statsGoalContainer = document.getElementById('stats-streak-goal-container');
    if (statsGoalContainer) {
      statsGoalContainer.innerHTML = `
        ${widgetHtml}
        <button type="button" onclick="AppRouter.openStreakGoalModal()" class="btn btn-outline btn-sm" style="margin-top: 0.5rem; width: 100%;">
          🎯 EDIT STREAK GOAL
        </button>
      `;
    }
  },

  checkStreakReminderBanner() {
    const todayPuzzle = getTodayPuzzle();
    const isSolved = potdStorage.isDayCompleted(todayPuzzle.day);
    const banner = document.getElementById('streak-reminder-banner');

    if (banner) {
      if (!isSolved) {
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }

    // Check browser notification dispatch
    const reminder = potdStorage.getState().reminderSettings;
    if (!isSolved && reminder && reminder.enabled && window.Notification && Notification.permission === 'granted') {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentHHMM === reminder.timing) {
        new Notification('🔔 Your Ragasiyam streak is waiting!', {
          body: 'You haven\'t solved today\'s puzzle yet. Play now to protect your streak!',
          icon: '🧩'
        });
      }
    }
  },

  checkDailyLoginReward() {
    if (typeof potdStorage !== 'undefined' && potdStorage.canClaimDailyReward()) {
      const rewardModal = document.getElementById('daily-reward-modal');
      if (rewardModal) {
        setTimeout(() => {
          this.renderDailyRewardGrid();
          rewardModal.classList.add('active');
        }, 800);
      }
    }
  },

  renderDailyRewardGrid() {
    const grid = document.getElementById('daily-reward-grid');
    if (!grid) return;

    const state = potdStorage.getState();
    const currentClaimStreak = (state.dailyReward ? state.dailyReward.claimStreak : 0) || 0;
    const rewards = [
      { day: 1, coins: 10, icon: '🪙' },
      { day: 2, coins: 20, icon: '🪙' },
      { day: 3, coins: 30, icon: '🪙' },
      { day: 4, coins: 40, icon: '🪙' },
      { day: 5, coins: 50, icon: '🪙' },
      { day: 6, coins: 75, icon: '🪙' },
      { day: 7, coins: 100, icon: '🛡️', bonus: '+ FREE Freeze' }
    ];

    grid.innerHTML = rewards.map(r => {
      const isClaimed = (r.day <= currentClaimStreak && !potdStorage.canClaimDailyReward());
      const isToday = (r.day === (currentClaimStreak % 7) + 1);

      let cardClass = '';
      if (isClaimed) cardClass = 'claimed';
      else if (isToday) cardClass = 'active-today';

      return `
        <div class="reward-day-card ${cardClass}" style="background: ${isToday ? 'var(--golden-yellow)' : 'var(--cream-card)'}; border: 2.5px solid var(--dark-brown); border-radius: var(--radius-md); padding: 0.8rem; text-align: center; font-family: var(--font-heading);">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--sunset-purple);">DAY ${r.day}</div>
          <div style="font-size: 1.8rem; margin: 0.2rem 0;">${r.icon}</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--dark-brown);">+${r.coins} 🪙</div>
          ${r.bonus ? `<div style="font-size: 0.7rem; color: var(--coral); font-weight: 700;">${r.bonus}</div>` : ''}
        </div>
      `;
    }).join('');
  },

  claimDailyRewardNow() {
    const result = potdStorage.claimDailyReward();
    if (result) {
      if (typeof potdSound !== 'undefined') potdSound.playAchievement();
      if (typeof potdConfetti !== 'undefined') potdConfetti.burst(80);

      const rewardModal = document.getElementById('daily-reward-modal');
      if (rewardModal) rewardModal.classList.remove('active');

      this.updateHeaderStats();
      if (typeof gameApp !== 'undefined' && gameApp.showToast) {
        gameApp.showToast(`🎁 Claimed Day ${result.day} Reward: +${result.coins} 🪙!`);
      } else {
        alert(`🎁 Claimed Day ${result.day} Reward: +${result.coins} 🪙!`);
      }
    }
  },

  setupArcadeShopModalEvents() {
    const coinBadge = document.getElementById('header-coins-val');
    const shopModal = document.getElementById('arcade-shop-modal');
    const shopCloseBtn = document.getElementById('arcade-shop-modal-close');

    if (coinBadge) {
      coinBadge.onclick = () => this.openArcadeShopModal();
      coinBadge.title = "Open Ragasiyam Arcade Shop 🪙";
      coinBadge.style.cursor = "pointer";
    }

    if (shopCloseBtn && shopModal) {
      shopCloseBtn.onclick = () => shopModal.classList.remove('active');
    }
  },

  openArcadeShopModal() {
    const shopModal = document.getElementById('arcade-shop-modal');
    if (shopModal) {
      this.renderArcadeShopGrid();
      shopModal.classList.add('active');
    }
  },

  renderArcadeShopGrid() {
    const grid = document.getElementById('shop-items-grid');
    if (!grid) return;

    const state = potdStorage.getState();
    const ownedThemes = state.inventory.themes || ['sunset', 'pink'];
    const ownedFrames = state.ownedFrames || ['none'];
    const equippedFrame = state.equippedFrame || 'none';

    const shopItems = [
      // Themes
      { id: 'sunset', type: 'theme', name: 'Retro Sunset Theme', icon: '🌅', cost: 0, owned: true, active: state.activeTheme === 'sunset' },
      { id: 'pink', type: 'theme', name: 'Pink Arcade Theme', icon: '🌸', cost: 0, owned: true, active: state.activeTheme === 'pink' },
      { id: 'midnight', type: 'theme', name: 'Midnight Cosmic Theme', icon: '🌌', cost: 100, owned: ownedThemes.includes('midnight'), active: state.activeTheme === 'midnight' },

      // Profile Frames
      { id: 'flame', type: 'frame', name: '🔥 Flame Profile Frame', icon: '🔥', cost: 150, owned: ownedFrames.includes('flame'), active: equippedFrame === 'flame' },
      { id: 'gold', type: 'frame', name: '👑 Royal Gold Frame', icon: '👑', cost: 250, owned: ownedFrames.includes('gold'), active: equippedFrame === 'gold' },
      { id: 'electric', type: 'frame', name: '⚡ Electric Frame', icon: '⚡', cost: 200, owned: ownedFrames.includes('electric'), active: equippedFrame === 'electric' },
      { id: 'diamond', type: 'frame', name: '💎 Diamond Frame', icon: '💎', cost: 400, owned: ownedFrames.includes('diamond'), active: equippedFrame === 'diamond' },

      // Boosts & Freezes
      { id: 'freeze', type: 'freeze', name: '🛡️ Streak Freeze × 1', icon: '🛡️', cost: 150, owned: false, active: false }
    ];

    grid.innerHTML = shopItems.map(item => {
      let actionBtnHtml = '';
      if (item.active) {
        actionBtnHtml = `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.8;">EQUIPPED ✅</button>`;
      } else if (item.owned) {
        actionBtnHtml = `<button onclick="AppRouter.equipShopItem('${item.id}', '${item.type}')" class="btn btn-outline btn-sm">EQUIP ⚡</button>`;
      } else {
        actionBtnHtml = `<button onclick="AppRouter.buyShopItem('${item.id}', '${item.type}', ${item.cost})" class="btn btn-primary btn-sm">BUY (${item.cost} 🪙)</button>`;
      }

      return `
        <div class="shop-item-card" style="background: var(--cream-card); border: 3px solid var(--dark-brown); border-radius: var(--radius-md); padding: 1.2rem; text-align: center; font-family: var(--font-heading);">
          <div style="font-size: 2.4rem; margin-bottom: 0.4rem;">${item.icon}</div>
          <div style="font-weight: 700; font-size: 1.05rem; color: var(--dark-brown); margin-bottom: 0.4rem;">${item.name}</div>
          <div style="margin-top: 0.8rem;">${actionBtnHtml}</div>
        </div>
      `;
    }).join('');
  },

  buyShopItem(itemId, itemType, cost) {
    if (potdStorage.buyShopItem(itemId, itemType, cost)) {
      if (typeof potdSound !== 'undefined') potdSound.playAchievement();
      if (typeof potdConfetti !== 'undefined') potdConfetti.burst(60);
      this.updateHeaderStats();
      this.renderArcadeShopGrid();
      this.applySettings();
      alert(`🎉 Successfully unlocked ${itemId.toUpperCase()}!`);
    } else {
      if (typeof potdSound !== 'undefined') potdSound.playWrong();
      alert('❌ Not enough coins! Solve daily puzzles & maintain streaks to earn more coins 🪙.');
    }
  },

  equipShopItem(itemId, itemType) {
    if (itemType === 'theme') {
      potdStorage.setActiveTheme(itemId);
      this.applySettings();
    } else if (itemType === 'frame') {
      potdStorage.equipFrame(itemId);
      const avatarBox = document.getElementById('profile-avatar-box');
      if (avatarBox) {
        avatarBox.className = 'profile-avatar-box';
        if (itemId !== 'none') {
          avatarBox.classList.add(`frame-${itemId}`);
        }
      }
    }
    if (typeof potdSound !== 'undefined') potdSound.playClick();
    this.renderArcadeShopGrid();
  }
};
