/* ==========================================================================
   RAGASIYAM — Scoring & Speed Rank Engine
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

    const isPerfect = (wrongAttemptsCount === 0 && hintsUnlockedCount === 0);
    const noHintBonus = (hintsUnlockedCount === 0) ? 150 : 0;
    const firstAttemptBonus = (wrongAttemptsCount === 0) ? 100 : 0;
    const perfectSolveBonus = isPerfect ? 200 : 0;
    const streakBonus = Math.min(250, currentStreak * 25);

    let difficultyBonus = 0;
    switch (difficulty) {
      case 'medium': difficultyBonus = 100; break;
      case 'hard': difficultyBonus = 250; break;
      case 'expert': difficultyBonus = 500; break;
      default: difficultyBonus = 0; break;
    }

    let hintPenalty = 0;
    if (hintsUnlockedCount >= 1) hintPenalty += 20;
    if (hintsUnlockedCount >= 2) hintPenalty += 40;
    if (hintsUnlockedCount >= 3) hintPenalty += 60;

    const attemptPenalty = wrongAttemptsCount * 50;
    const timePenalty = Math.floor(timeElapsed * 1.5);

    const subTotal = baseScore + speedBonus + noHintBonus + firstAttemptBonus + perfectSolveBonus + streakBonus + difficultyBonus - hintPenalty - attemptPenalty - timePenalty;
    const finalScore = Math.max(100, subTotal);

    // Calculate Speed Rank & Score (0 - 100)
    const timeFactor = Math.max(0, 1 - (timeElapsed / timeLimit));
    const hintFactor = Math.max(0, 1 - (hintsUnlockedCount * 0.25));
    const attemptFactor = Math.max(0, 1 - (wrongAttemptsCount * 0.2));
    
    const speedRankScore = Math.min(99, Math.max(40, Math.round((timeFactor * 50) + (hintFactor * 30) + (attemptFactor * 20))));

    let speedRank = 'C';
    let speedRankTitle = 'Warm Up';
    if (speedRankScore >= 92) {
      speedRank = 'S';
      speedRankTitle = 'Legendary';
    } else if (speedRankScore >= 82) {
      speedRank = 'A';
      speedRankTitle = 'Excellent';
    } else if (speedRankScore >= 72) {
      speedRank = 'B';
      speedRankTitle = 'Sharp';
    } else if (speedRankScore >= 60) {
      speedRank = 'C';
      speedRankTitle = 'Warm Up';
    } else {
      speedRank = 'D';
      speedRankTitle = 'Slow Burn 😭';
    }

    const percentile = Math.min(99, Math.max(50, Math.floor(70 + (speedBonus / 10) + (firstAttemptBonus / 5) - (hintPenalty / 2))));

    // Coin earnings calculation
    let coinsEarned = 100; // Base solve coins
    if (hintsUnlockedCount === 0) coinsEarned += 50;
    if (isPerfect) coinsEarned += 100;
    if (currentStreak > 0 && currentStreak % 7 === 0) coinsEarned += 200;

    return {
      baseScore,
      speedBonus,
      noHintBonus,
      firstAttemptBonus,
      perfectSolveBonus,
      streakBonus,
      difficultyBonus,
      hintPenalty,
      attemptPenalty,
      timePenalty,
      finalScore,
      percentile,
      speedRank,
      speedRankTitle,
      speedRankScore,
      isPerfect,
      coinsEarned
    };
  }
}

const potdScoring = new ScoringEngine();
