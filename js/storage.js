/* ==========================================================================
   RAGASIYAM — LocalStorage State & Economy Manager
   ========================================================================== */

const STORAGE_KEY = 'POTD_USER_STATE_V2';

const DEFAULT_STATE = {
  playerName: 'Ragasiyam Solver',
  avatarIcon: '🧩',
  totalScore: 0,
  xp: 0,
  level: 1,
  coins: 100,
  streakFreezes: 1,
  perfectSolvesCount: 0,
  totalPlayTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  completedDays: {},
  unlockedAchievements: [],
  inventory: {
    themes: ['sunset', 'pink'],
    hintTokens: 0
  },
  activeTheme: 'sunset',
  settings: {
    soundEnabled: true,
    reducedMotion: false,
    pinkMode: false,
    midnightMode: false
  }
};

class StorageManager {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.warn('LocalStorage warning, using default state.', e);
    }
    return { ...DEFAULT_STATE };
  }

  loadUserStateFromDB(userObj) {
    if (!userObj) return;
    this.state.playerName = userObj.username;
    this.state.avatarIcon = userObj.avatar || '🧩';
    
    if (typeof potdDB !== 'undefined' && potdDB.isReady) {
      const dbUser = potdDB.getUserByUsername(userObj.username);
      if (dbUser) {
        this.state.level = dbUser.level || 1;
        this.state.xp = dbUser.xp || 0;
        this.state.totalScore = dbUser.total_score || 0;
        this.state.currentStreak = dbUser.current_streak || 0;
        this.state.longestStreak = dbUser.longest_streak || 0;
        this.state.lastPlayedDate = dbUser.last_played_date || null;
      }
      this.state.completedDays = potdDB.getUserSolves(userObj.id) || {};
      this.state.unlockedAchievements = potdDB.getUserAchievements(userObj.id) || [];
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));

      if (typeof potdAuth !== 'undefined' && potdAuth.isAuthenticated()) {
        const user = potdAuth.getCurrentUser();
        if (user && typeof potdDB !== 'undefined' && potdDB.isReady) {
          potdDB.updateUserStats(user.id, {
            level: this.state.level,
            xp: this.state.xp,
            total_score: this.state.totalScore,
            current_streak: this.state.currentStreak,
            longest_streak: this.state.longestStreak,
            last_played_date: this.state.lastPlayedDate
          });
        }
      }
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  getState() {
    return this.state;
  }

  getCompletedPuzzle(dayNum) {
    return this.state.completedDays[dayNum] || null;
  }

  isDayCompleted(dayNum) {
    return !!this.state.completedDays[dayNum];
  }

  // --- Economy & Inventory Helpers ---
  addCoins(amount) {
    this.state.coins = (this.state.coins || 0) + amount;
    this.saveState();
    return this.state.coins;
  }

  spendCoins(amount) {
    if ((this.state.coins || 0) >= amount) {
      this.state.coins -= amount;
      this.saveState();
      return true;
    }
    return false;
  }

  addStreakFreeze(count = 1) {
    this.state.streakFreezes = (this.state.streakFreezes || 0) + count;
    this.saveState();
  }

  useStreakFreeze() {
    if ((this.state.streakFreezes || 0) > 0) {
      this.state.streakFreezes -= 1;
      this.saveState();
      return true;
    }
    return false;
  }

  recordPerfectSolve() {
    this.state.perfectSolvesCount = (this.state.perfectSolvesCount || 0) + 1;
    this.saveState();
  }

  setActiveTheme(themeName) {
    this.state.activeTheme = themeName;
    if (themeName === 'pink') {
      this.state.settings.pinkMode = true;
      this.state.settings.midnightMode = false;
    } else if (themeName === 'midnight') {
      this.state.settings.pinkMode = false;
      this.state.settings.midnightMode = true;
    } else {
      this.state.settings.pinkMode = false;
      this.state.settings.midnightMode = false;
    }
    this.saveState();
  }

  recordPuzzleSolve(dayNum, scoreData, timeSpent, hintsCount, isPerfect) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    this.state.completedDays[dayNum] = {
      score: scoreData.finalScore,
      timeSpent: timeSpent,
      hintsUsed: hintsCount,
      perfect: isPerfect,
      solvedAt: todayStr
    };

    this.state.totalScore += scoreData.finalScore;
    this.state.totalPlayTime = (this.state.totalPlayTime || 0) + timeSpent;
    if (isPerfect) this.recordPerfectSolve();

    // Award Coins
    this.addCoins(scoreData.coinsEarned || 100);

    // Update XP
    let xpGained = 100 + (isPerfect ? 50 : 0) + (hintsCount === 0 ? 30 : 0);
    this.addXP(xpGained);

    // Update Streak
    this.updateStreak(todayStr);

    if (typeof potdAuth !== 'undefined' && potdAuth.isAuthenticated()) {
      const user = potdAuth.getCurrentUser();
      if (user && typeof potdDB !== 'undefined' && potdDB.isReady) {
        potdDB.recordSolve(user.id, dayNum, scoreData.finalScore, timeSpent, hintsCount, isPerfect, todayStr);
      }
    }

    this.saveState();
  }

  addXP(amount) {
    this.state.xp += amount;
    const newLevel = Math.min(5, Math.floor(this.state.xp / 300) + 1);
    if (newLevel > this.state.level) {
      this.state.level = newLevel;
    }
  }

  updateStreak(todayStr) {
    if (!this.state.lastPlayedDate) {
      this.state.currentStreak = 1;
    } else {
      const last = new Date(this.state.lastPlayedDate);
      const current = new Date(todayStr);
      const diffDays = Math.round((current - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.state.currentStreak += 1;
        // Award free streak freeze every 7 days
        if (this.state.currentStreak % 7 === 0) {
          this.addStreakFreeze(1);
        }
      } else if (diffDays > 1) {
        // Missed day -> Check if Streak Freeze protects it!
        if (this.useStreakFreeze()) {
          console.log('🧊 Streak Freeze Used! Active streak protected.');
        } else {
          this.state.currentStreak = 1; // Reset if no freeze
        }
      }
    }

    this.state.lastPlayedDate = todayStr;
    if (this.state.currentStreak > this.state.longestStreak) {
      this.state.longestStreak = this.state.currentStreak;
    }

    // Unlock Midnight theme automatically on 7-day streak
    if (this.state.currentStreak >= 7 && !this.state.inventory.themes.includes('midnight')) {
      this.state.inventory.themes.push('midnight');
    }
  }

  unlockAchievement(achievementId) {
    if (!this.state.unlockedAchievements.includes(achievementId)) {
      this.state.unlockedAchievements.push(achievementId);
      this.addXP(50);
      this.addCoins(100);

      if (typeof potdAuth !== 'undefined' && potdAuth.isAuthenticated()) {
        const user = potdAuth.getCurrentUser();
        if (user && typeof potdDB !== 'undefined' && potdDB.isReady) {
          potdDB.unlockAchievement(user.id, achievementId);
        }
      }

      this.saveState();
      return true;
    }
    return false;
  }

  toggleSound(forceValue) {
    if (forceValue !== undefined) {
      this.state.settings.soundEnabled = forceValue;
    } else {
      this.state.settings.soundEnabled = !this.state.settings.soundEnabled;
    }
    this.saveState();
    return this.state.settings.soundEnabled;
  }

  togglePinkMode() {
    this.setActiveTheme(this.state.activeTheme === 'pink' ? 'sunset' : 'pink');
    return this.state.settings.pinkMode;
  }

  toggleMidnightMode() {
    this.setActiveTheme(this.state.activeTheme === 'midnight' ? 'sunset' : 'midnight');
    return this.state.settings.midnightMode;
  }
}

const potdStorage = new StorageManager();
