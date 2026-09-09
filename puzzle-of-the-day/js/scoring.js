/* ==========================================================================
   PUZZLE OF THE DAY — Scoring System Engine
   ========================================================================== */

class ScoringEngine {
  calculateScore(params) {
    const {
      baseScore = 1000,
      timeElapsed = 30,
      timeLimit = 120,
      hintsUnlockedCount = 0,
      wrongAttemptsCount = 0,
      difficulty = 'easy',
      currentStreak = 0
    } = params;

    let speedBonus = 0;
    const remainingTime = Math.max(0, timeLimit - timeElapsed);
    if (remainingTime > 0) {
      speedBonus = Math.round(remainingTime * 3);
    }

    let noHintBonus = (hintsUnlockedCount === 0) ? 150 : 0;
    let firstAttemptBonus = (wrongAttemptsCount === 0) ? 100 : 0;
    let streakBonus = Math.min(250, currentStreak * 25);

    let difficultyBonus = 0;
    switch (difficulty) {
      case 'medium': difficultyBonus = 100; break;
      case 'hard': difficultyBonus = 250; break;
      case 'expert': difficultyBonus = 500; break;
      default: difficultyBonus = 0; break;
    }

    // Hint Penalties: Hint 1 (-20), Hint 2 (-40), Hint 3 (-60)
    let hintPenalty = 0;
    if (hintsUnlockedCount >= 1) hintPenalty += 20;
    if (hintsUnlockedCount >= 2) hintPenalty += 40;
    if (hintsUnlockedCount >= 3) hintPenalty += 60;

    let attemptPenalty = wrongAttemptsCount * 50;
    let timePenalty = Math.floor(timeElapsed * 1.5);

    let subTotal = baseScore + speedBonus + noHintBonus + firstAttemptBonus + streakBonus + difficultyBonus - hintPenalty - attemptPenalty - timePenalty;
    let finalScore = Math.max(100, subTotal);

    // Calculate simulated percentile vs daily solvers
    let percentile = Math.min(99, Math.max(50, Math.floor(70 + (speedBonus / 10) + (firstAttemptBonus / 5) - (hintPenalty / 2))));

    return {
      baseScore,
      speedBonus,
      noHintBonus,
      firstAttemptBonus,
      streakBonus,
      difficultyBonus,
      hintPenalty,
      attemptPenalty,
      timePenalty,
      finalScore,
      percentile
    };
  }
}

const potdScoring = new ScoringEngine();
