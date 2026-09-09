/* ==========================================================================
   PUZZLE OF THE DAY — LocalStorage State Manager
   ========================================================================== */

const STORAGE_KEY = 'POTD_USER_STATE_V1';

const DEFAULT_STATE = {
  playerName: 'Puzzle Challenger',
  avatarIcon: '🧩',
  totalScore: 0,
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  completedDays: {}, // { dayNum: { score, timeSpent, hintsUsed, perfect, solvedAt } }
  unlockedAchievements: [], // Array of achievement IDs
  settings: {
    soundEnabled: true,
    reducedMotion: false,
    pinkMode: false
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
      console.warn('LocalStorage unavailable or corrupted, using default state.', e);
    }
    return { ...DEFAULT_STATE };
  }

  loadUserStateFromDB(userObj) {
    if (!userObj) return;
    this.state.playerName = userObj.username;
    this.state.avatarIcon = userObj.avatar || '🧩';
    
    // Load solves and achievements from SQLite DB
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

      // Also sync to SQLite DB if user is logged in
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

  recordPuzzleSolve(dayNum, scoreData, timeSpent, hintsCount, isPerfect) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Save completion detail
    this.state.completedDays[dayNum] = {
      score: scoreData.finalScore,
      timeSpent: timeSpent,
      hintsUsed: hintsCount,
      perfect: isPerfect,
      solvedAt: todayStr
    };

    // Update totals
    this.state.totalScore += scoreData.finalScore;

    // Update XP (100 base + difficulty/perfect bonus)
    let xpGained = 100 + (isPerfect ? 50 : 0) + (hintsCount === 0 ? 30 : 0);
    this.addXP(xpGained);

    // Update Streak
    this.updateStreak(todayStr);

    // Sync solve to SQLite DB
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
    // Level calculation (Level up every 300 XP)
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
      } else if (diffDays > 1) {
        this.state.currentStreak = 1; // Streak reset
      }
    }

    this.state.lastPlayedDate = todayStr;
    if (this.state.currentStreak > this.state.longestStreak) {
      this.state.longestStreak = this.state.currentStreak;
    }
  }

  unlockAchievement(achievementId) {
    if (!this.state.unlockedAchievements.includes(achievementId)) {
      this.state.unlockedAchievements.push(achievementId);
      this.addXP(50); // Achievement XP reward

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

  togglePinkMode(forceValue) {
    if (forceValue !== undefined) {
      this.state.settings.pinkMode = forceValue;
    } else {
      this.state.settings.pinkMode = !this.state.settings.pinkMode;
    }
    this.saveState();
    return this.state.settings.pinkMode;
  }

  resetProgress() {
    this.state = { ...DEFAULT_STATE };
    this.saveState();
  }
}

const potdStorage = new StorageManager();
