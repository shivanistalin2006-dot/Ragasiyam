/* ==========================================================================
   PUZZLE OF THE DAY — Hint Manager Module
   ========================================================================== */

class HintManager {
  constructor() {
    this.unlockedHints = [];
  }

  reset() {
    this.unlockedHints = [];
  }

  unlockHint(index) {
    if (!this.unlockedHints.includes(index)) {
      this.unlockedHints.push(index);
      return true;
    }
    return false;
  }

  isHintUnlocked(index) {
    return this.unlockedHints.includes(index);
  }

  getUnlockedCount() {
    return this.unlockedHints.length;
  }

  getTotalPenalty() {
    let penalty = 0;
    if (this.unlockedHints.includes(0)) penalty += 20;
    if (this.unlockedHints.includes(1)) penalty += 40;
    if (this.unlockedHints.includes(2)) penalty += 60;
    return penalty;
  }
}

const potdHints = new HintManager();
