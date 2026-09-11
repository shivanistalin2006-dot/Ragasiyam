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
  comboCount: 0,
  streakGoal: 7, // Default 7 days (or 'none' for casual)
  reminderSettings: {
    enabled: true,
    timing: '09:00'
  },
  dailyReward: {
    lastClaimDate: null,
    claimStreak: 0
  },
  equippedFrame: 'none',
  ownedFrames: ['none'],
  lastPlayedDate: null,
  completedDays: {},
  weeklySolves: {},
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
        if (user && typeof potdDB !== 'undefined') {
          const stats = {
            level: this.state.level,
            xp: this.state.xp,
            total_score: this.state.totalScore,
            current_streak: this.state.currentStreak,
            longest_streak: this.state.longestStreak,
            last_played_date: this.state.lastPlayedDate
          };
          if (potdDB.isReady) potdDB.updateUserStats(user.id, stats);
          potdDB.syncUserProfileToFirestore(user.uid, stats);
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

  // --- Daily Login Reward System (7-Day Cycle) ---
  canClaimDailyReward() {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastClaim = this.state.dailyReward ? this.state.dailyReward.lastClaimDate : null;
    return lastClaim !== todayStr;
  }

  claimDailyReward() {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!this.canClaimDailyReward()) return null;

    let claimStreak = (this.state.dailyReward ? this.state.dailyReward.claimStreak : 0) || 0;
    const lastClaim = this.state.dailyReward ? this.state.dailyReward.lastClaimDate : null;

    if (lastClaim) {
      const lastDate = new Date(lastClaim);
      const todayDate = new Date(todayStr);
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        claimStreak = (claimStreak % 7) + 1;
      } else if (diffDays > 1) {
        claimStreak = 1; // Cycle reset if missed
      }
    } else {
      claimStreak = 1;
    }

    const rewardAmounts = [10, 20, 30, 40, 50, 75, 100];
    const rewardCoins = rewardAmounts[claimStreak - 1] || 10;
    this.addCoins(rewardCoins);

    // Bonus streak freeze on Day 7
    let bonusFreeze = false;
    if (claimStreak === 7) {
      this.addStreakFreeze(1);
      bonusFreeze = true;
    }

    this.state.dailyReward = {
      lastClaimDate: todayStr,
      claimStreak: claimStreak
    };
    this.saveState();

    return {
      day: claimStreak,
      coins: rewardCoins,
      bonusFreeze: bonusFreeze
    };
  }

  // --- Arcade Shop & Profile Frames ---
  buyShopItem(itemId, itemType, cost) {
    if (this.spendCoins(cost)) {
      if (itemType === 'theme') {
        if (!this.state.inventory.themes.includes(itemId)) {
          this.state.inventory.themes.push(itemId);
        }
        this.setActiveTheme(itemId);
      } else if (itemType === 'frame') {
        if (!this.state.ownedFrames.includes(itemId)) {
          this.state.ownedFrames.push(itemId);
        }
        this.equipFrame(itemId);
      } else if (itemType === 'freeze') {
        this.addStreakFreeze(1);
      } else if (itemType === 'badge') {
        this.unlockAchievement(itemId);
      }
      this.saveState();
      return true;
    }
    return false;
  }

  equipFrame(frameId) {
    this.state.equippedFrame = frameId;
    this.saveState();
  }

  // --- Combo System ---
  updateCombo(isNoHintSolve) {
    if (isNoHintSolve) {
      this.state.comboCount = (this.state.comboCount || 0) + 1;
      const combo = this.state.comboCount;
      let bonusCoins = 0;

      if (combo === 3) bonusCoins = 50;
      else if (combo === 5) bonusCoins = 100;
      else if (combo >= 10 && combo % 5 === 0) bonusCoins = 250;

      if (bonusCoins > 0) this.addCoins(bonusCoins);
      this.saveState();

      return { combo: combo, bonusCoins: bonusCoins };
    } else {
      this.state.comboCount = 0;
      this.saveState();
      return { combo: 0, bonusCoins: 0 };
    }
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

  setStreakGoal(goal) {
    this.state.streakGoal = goal;
    this.saveState();
    return this.state.streakGoal;
  }

  setReminderSettings(enabled, timing) {
    this.state.reminderSettings = { enabled, timing };
    this.saveState();
    return this.state.reminderSettings;
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

    // Milestone Rewards Table
    const streak = this.state.currentStreak;
    if (streak === 3) this.addCoins(50);
    else if (streak === 7) {
      this.addCoins(100);
      this.addStreakFreeze(1);
    } else if (streak === 14) this.addCoins(150);
    else if (streak === 30) {
      this.addCoins(200);
      if (!this.state.inventory.themes.includes('midnight')) {
        this.state.inventory.themes.push('midnight');
      }
    } else if (streak === 50) this.addCoins(300);
    else if (streak === 100) this.addCoins(500);

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
