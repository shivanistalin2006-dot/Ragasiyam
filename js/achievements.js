/* ==========================================================================
   PUZZLE OF THE DAY — Retro Achievements Registry
   ========================================================================== */

const ACHIEVEMENTS_LIST = [
  {
    id: 'first_crack',
    title: '🧩 First Crack',
    description: 'Solve your first daily puzzle.',
    icon: '🏆',
    check: (state, lastSolve) => Object.keys(state.completedDays).length >= 1
  },
  {
    id: 'on_fire',
    title: '🔥 On Fire',
    description: 'Maintain a 7-day streak.',
    icon: '🔥',
    check: (state) => state.currentStreak >= 7
  },
  {
    id: 'speed_demon',
    title: '⚡ Speed Demon',
    description: 'Solve a puzzle in under 30 seconds.',
    icon: '⚡',
    check: (state, lastSolve) => lastSolve && lastSolve.timeSpent <= 30
  },
  {
    id: 'no_help_needed',
    title: '💡 No Help Needed',
    description: 'Solve a puzzle without using any hints.',
    icon: '🌟',
    check: (state, lastSolve) => lastSolve && lastSolve.hintsUsed === 0
  },
  {
    id: 'perfect_crack',
    title: '👑 Perfect Crack',
    description: 'Achieve a 100% perfect solve (no hints, no wrong attempts).',
    icon: '👑',
    check: (state, lastSolve) => lastSolve && lastSolve.perfect
  },
  {
    id: 'master_detective',
    title: '🕵️ Master Detective',
    description: 'Solve 3 Mystery category puzzles.',
    icon: '🕵️',
    check: (state) => {
      let count = 0;
      for (const day in state.completedDays) {
        const puzzle = PUZZLES_DATA.find(p => p.day === parseInt(day, 10));
        if (puzzle && puzzle.category === 'mystery') count++;
      }
      return count >= 3;
    }
  },
  {
    id: 'math_genius',
    title: '🔢 Codebreaker',
    description: 'Solve 3 Number category puzzles.',
    icon: '🔢',
    check: (state) => {
      let count = 0;
      for (const day in state.completedDays) {
        const puzzle = PUZZLES_DATA.find(p => p.day === parseInt(day, 10));
        if (puzzle && puzzle.category === 'number') count++;
      }
      return count >= 3;
    }
  },
  {
    id: 'brainiac',
    title: '🧠 Brainiac',
    description: 'Solve 5 or more total puzzles.',
    icon: '🧠',
    check: (state) => Object.keys(state.completedDays).length >= 5
  },
  {
    id: 'streak_master',
    title: '📅 Consistency King',
    description: 'Achieve a 3-day streak.',
    icon: '📅',
    check: (state) => state.currentStreak >= 3
  },
  {
    id: 'puzzle_master',
    title: '🎓 Puzzle Master',
    description: 'Reach Player Level 3 or higher.',
    icon: '🎓',
    check: (state) => state.level >= 3
  },
  {
    id: 'archive_explorer',
    title: '🏛️ Time Traveler',
    description: 'Solve a previous puzzle from the archive in practice mode.',
    icon: '🏛️',
    check: (state, lastSolve) => lastSolve && lastSolve.isPractice === true
  },
  {
    id: 'score_legend',
    title: '💎 High Scorer',
    description: 'Accumulate 3,000 total score points.',
    icon: '💎',
    check: (state) => state.totalScore >= 3000
  }
];

class AchievementManager {
  checkAll(state, lastSolveContext = null) {
    const unlockedNow = [];
    ACHIEVEMENTS_LIST.forEach(ach => {
      if (!state.unlockedAchievements.includes(ach.id)) {
        if (ach.check(state, lastSolveContext)) {
          const newlyUnlocked = potdStorage.unlockAchievement(ach.id);
          if (newlyUnlocked) {
            unlockedNow.push(ach);
          }
        }
      }
    });
    return unlockedNow;
  }
}

const potdAchievements = new AchievementManager();
