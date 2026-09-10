/* ==========================================================================
   RAGASIYAM — Core Gameplay Logic & Results Controller
   ========================================================================== */

class GameController {
  constructor() {
    this.currentPuzzle = null;
    this.wrongAttempts = 0;
    this.isPracticeMode = false;
    this.selectedOption = null;
    this.isCompleted = false;
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const dayParam = urlParams.get('day');
    this.isPracticeMode = urlParams.get('practice') === 'true';

    if (dayParam) {
      this.currentPuzzle = getPuzzleByDay(dayParam);
    } else {
      this.currentPuzzle = getTodayPuzzle();
    }

    if (!this.currentPuzzle) {
      this.currentPuzzle = PUZZLES_DATA[0];
    }

    const existingResult = potdStorage.getCompletedPuzzle(this.currentPuzzle.day);
    if (existingResult && !this.isPracticeMode) {
      this.renderAlreadyCompletedScreen(existingResult);
      return;
    }

    potdHints.reset();
    this.renderPuzzleScreen();
    this.startTimer();
  }

  startTimer() {
    const timerDisplay = document.getElementById('timer-display');
    const timerBox = document.querySelector('.timer-box');

    potdTimer.start(this.currentPuzzle.timeLimit, {
      onTick: (remaining, formatted) => {
        if (timerDisplay) timerDisplay.textContent = formatted;
        if (remaining % 10 === 0) {
          potdSound.playTick();
        }
      },
      onWarning: () => {
        if (timerBox) timerBox.classList.add('timer-warning');
        potdSound.playTimerWarning();
      },
      onExpire: () => {
        this.handleTimeExpire();
      }
    });
  }

  renderPuzzleScreen() {
    const p = this.currentPuzzle;
    
    const categoryBadge = document.getElementById('category-badge');
    const difficultyBadge = document.getElementById('difficulty-badge');
    const puzzleTitle = document.getElementById('puzzle-day-title');
    const questionText = document.getElementById('question-text');
    const teaserEl = document.getElementById('puzzle-teaser-text');

    if (categoryBadge) {
      const typeInfo = RIDDLE_TYPES[p.riddleType] || { name: p.categoryName, icon: p.categoryIcon };
      categoryBadge.textContent = `${typeInfo.icon} ${typeInfo.name}`;
      categoryBadge.className = `category-badge cat-${p.category}`;
    }

    if (difficultyBadge) {
      difficultyBadge.textContent = p.difficultyName;
      difficultyBadge.className = `diff-badge diff-${p.difficulty}`;
    }

    if (puzzleTitle) {
      const formattedDay = String(p.day).padStart(3, '0');
      puzzleTitle.textContent = `🌅 RAGASIYAM #${formattedDay} — TODAY'S MYSTERY`;
    }

    if (teaserEl) {
      teaserEl.textContent = p.isSundayRagasiyam ? "👑 SUNDAY RAGASIYAM: One brutal puzzle. One chance. 2x Rewards!" : "Something is hidden. Can you uncover it?";
    }

    if (questionText) {
      questionText.innerText = p.question;
    }

    const answerContainer = document.getElementById('answer-container');
    if (answerContainer) {
      answerContainer.innerHTML = '';
      
      if (p.type === 'options' && Array.isArray(p.options)) {
        const grid = document.createElement('div');
        grid.className = 'options-grid';
        
        p.options.forEach((optText) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'option-btn';
          btn.textContent = optText;
          btn.onclick = () => {
            potdSound.playClick();
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.selectedOption = optText;
          };
          grid.appendChild(btn);
        });
        answerContainer.appendChild(grid);
      } else {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.innerHTML = `
          <input type="text" id="answer-input" class="retro-input" placeholder="Type your answer here..." autocomplete="off" />
        `;
        answerContainer.appendChild(inputGroup);

        setTimeout(() => {
          const inputEl = document.getElementById('answer-input');
          if (inputEl) inputEl.focus();
        }, 300);
      }
    }

    this.renderHints();
  }

  renderHints() {
    const hintsList = document.getElementById('hints-list');
    if (!hintsList) return;

    hintsList.innerHTML = '';
    const hints = this.currentPuzzle.hints || [];

    hints.forEach((hintObj, idx) => {
      const hintItem = document.createElement('div');
      hintItem.className = 'hint-item';

      const isUnlocked = potdHints.isHintUnlocked(idx);

      if (isUnlocked) {
        hintItem.classList.add('hint-revealed-anim');
        hintItem.innerHTML = `
          <div class="hint-text">💡 <strong>Hint ${idx + 1}:</strong> ${hintObj.text}</div>
          <div class="category-badge diff-easy">Unlocked (-${hintObj.cost} pts)</div>
        `;
      } else {
        hintItem.innerHTML = `
          <div class="hint-text hint-locked-content">🔒 Hint ${idx + 1} (Costs -${hintObj.cost} pts)</div>
          <button class="btn-hint-unlock" onclick="gameApp.unlockHint(${idx})">Unlock (-${hintObj.cost})</button>
        `;
      }
      hintsList.appendChild(hintItem);
    });
  }

  unlockHint(hintIndex) {
    if (potdHints.unlockHint(hintIndex)) {
      potdSound.playHint();
      this.renderHints();
    }
  }

  submitAnswer() {
    if (this.isCompleted) return;

    let userVal = '';
    if (this.currentPuzzle.type === 'options') {
      userVal = this.selectedOption || '';
    } else {
      const inputEl = document.getElementById('answer-input');
      userVal = inputEl ? inputEl.value : '';
    }

    if (!userVal || userVal.trim() === '') {
      this.showToast('Please provide an answer!');
      return;
    }

    const isCorrect = this.checkAnswer(userVal);

    if (isCorrect) {
      this.handleSuccess();
    } else {
      this.handleWrongAnswer();
    }
  }

  checkAnswer(userVal) {
    const target = String(this.currentPuzzle.answer).toLowerCase().trim();
    const cleanUser = String(userVal).toLowerCase().trim();

    if (cleanUser === target) return true;

    if (Array.isArray(this.currentPuzzle.alternateAnswers)) {
      return this.currentPuzzle.alternateAnswers.some(alt => alt.toLowerCase().trim() === cleanUser);
    }

    return false;
  }

  handleWrongAnswer() {
    this.wrongAttempts++;
    potdSound.playWrong();

    const mainCard = document.querySelector('.puzzle-main-card');
    if (mainCard) {
      mainCard.classList.remove('shake-animation');
      void mainCard.offsetWidth;
      mainCard.classList.add('shake-animation');
    }

    this.showToast('Not quite... your brain is warming up! Try again.');
  }

  handleTimeExpire() {
    potdSound.playWrong();
    alert("⏱️ TIME EXPIRED! Don't worry, keep practicing and try another mystery!");
    window.location.href = '../index.html';
  }

  handleSuccess() {
    this.isCompleted = true;
    potdTimer.stop();
    potdSound.playCorrect();
    potdConfetti.burst(90);

    const timeSpent = potdTimer.getTimeElapsed();
    const hintsCount = potdHints.getUnlockedCount();
    const isPerfect = (hintsCount === 0 && this.wrongAttempts === 0);

    const scoreData = potdScoring.calculateScore({
      baseScore: this.currentPuzzle.baseScore || 1000,
      timeElapsed: timeSpent,
      timeLimit: this.currentPuzzle.timeLimit || 120,
      hintsUnlockedCount: hintsCount,
      wrongAttemptsCount: this.wrongAttempts,
      difficulty: this.currentPuzzle.difficulty,
      currentStreak: potdStorage.getState().currentStreak
    });

    if (!this.isPracticeMode) {
      potdStorage.recordPuzzleSolve(
        this.currentPuzzle.day,
        scoreData,
        timeSpent,
        hintsCount,
        isPerfect
      );

      const lastSolveContext = {
        timeSpent,
        hintsUsed: hintsCount,
        perfect: isPerfect,
        isPractice: false
      };
      const newlyUnlocked = potdAchievements.checkAll(potdStorage.getState(), lastSolveContext);
      if (newlyUnlocked.length > 0) {
        setTimeout(() => {
          potdSound.playAchievement();
          this.showToast(`🏆 Achievement Unlocked: ${newlyUnlocked[0].title}!`);
        }, 1200);
      }
    }

    this.showVictoryModal(scoreData, timeSpent, isPerfect);
  }

  showVictoryModal(scoreData, timeSpent, isPerfect) {
    const modalOverlay = document.getElementById('victory-modal');
    if (!modalOverlay) return;

    const timeFormatted = potdTimer.formatTime(timeSpent);
    document.getElementById('modal-solve-time').textContent = timeFormatted;
    document.getElementById('modal-percentile').textContent = `Faster than ${scoreData.percentile}% of today's solvers!`;
    
    // Perfect Solve Banner
    const perfectBannerEl = document.getElementById('modal-perfect-banner');
    if (perfectBannerEl) {
      if (isPerfect) {
        perfectBannerEl.style.display = 'block';
        perfectBannerEl.innerHTML = '✨ PERFECT SOLVE — No hints. No mistakes. Pure brain! (+100 🪙 Bonus)';
      } else {
        perfectBannerEl.style.display = 'none';
      }
    }

    // Speed Rank Badge
    const speedRankEl = document.getElementById('modal-speed-rank');
    if (speedRankEl) {
      speedRankEl.innerHTML = `⚡ ${scoreData.speedRank} RANK (${scoreData.speedRankTitle}) — ${scoreData.speedRankScore}/100`;
    }

    // Line-by-Line Explanation Reveal ("WHY? 🧐")
    const explanationBox = document.getElementById('modal-explanation-box');
    if (explanationBox) {
      const lines = this.currentPuzzle.explanationLines || [this.currentPuzzle.explanation];
      explanationBox.innerHTML = `
        <div style="font-family: var(--font-heading); font-size: 1.1rem; color: var(--golden-yellow); margin-bottom: 0.5rem;">WHY? 🧐</div>
        <div style="font-weight: 700; color: var(--warm-cream); margin-bottom: 0.6rem;">Answer: ${this.currentPuzzle.answer.toUpperCase()}</div>
        ${lines.map((line, idx) => `
          <div class="explanation-line-item" style="animation-delay: ${idx * 0.4}s;">
            💡 ${line}
          </div>
        `).join('')}
      `;
    }

    // Score Table
    const tableBody = document.getElementById('modal-score-table');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr><td class="row-label">Base Score</td><td class="row-val val-plus">+${scoreData.baseScore}</td></tr>
        <tr><td class="row-label">Speed Bonus</td><td class="row-val val-plus">+${scoreData.speedBonus}</td></tr>
        <tr><td class="row-label">Coins Earned</td><td class="row-val val-plus">+${scoreData.coinsEarned} 🪙</td></tr>
        ${scoreData.firstAttemptBonus ? `<tr><td class="row-label">1st Attempt Bonus</td><td class="row-val val-plus">+${scoreData.firstAttemptBonus}</td></tr>` : ''}
        ${scoreData.perfectSolveBonus ? `<tr><td class="row-label">Perfect Solve Bonus</td><td class="row-val val-plus">+${scoreData.perfectSolveBonus}</td></tr>` : ''}
        ${scoreData.hintPenalty ? `<tr><td class="row-label">Hint Penalty</td><td class="row-val val-minus">-${scoreData.hintPenalty}</td></tr>` : ''}
        <tr class="total-row"><td class="row-label">FINAL SCORE</td><td class="row-val" id="modal-final-score-num">0</td></tr>
      `;
    }

    // Challenge Share Card
    const shareCardEl = document.getElementById('modal-share-card');
    if (shareCardEl) {
      const formattedDay = String(this.currentPuzzle.day).padStart(3, '0');
      const shareText = `🔥 RAGASIYAM #${formattedDay}\n⚡ Solved in ${timeFormatted} | ${scoreData.speedRank} Rank (${scoreData.speedRankScore}/100)\n🏆 Score: ${scoreData.finalScore} | 🔥 ${potdStorage.getState().currentStreak} Day Streak\nCan you beat my brain? 🧩\nhttps://shivanistalin2006-dot.github.io/Ragasiyam/`;

      shareCardEl.innerHTML = `
        <div class="share-card-box">${shareText}</div>
        <button type="button" class="btn btn-outline btn-sm" style="width: 100%;" onclick="gameApp.copyShareCard(\`${shareText.replace(/\n/g, '\\n')}\`)">
          📋 COPY CHALLENGE CARD
        </button>
      `;
    }

    modalOverlay.classList.add('active');

    const finalScoreEl = document.getElementById('modal-final-score-num');
    UIUtils.animateNumber(finalScoreEl, 0, scoreData.finalScore, 1200);
  }

  copyShareCard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.showToast('📋 Challenge card copied to clipboard!');
      potdSound.playClick();
    } else {
      this.showToast('Please copy the text manually!');
    }
  }

  openMysteryBox() {
    potdSound.playAchievement();
    potdConfetti.burst(60);
    const rewards = ['+150 🪙 Coins', '+100 XP', '🧊 1x Streak Freeze', '💡 1x Free Hint Token'];
    const won = rewards[Math.floor(Math.random() * rewards.length)];

    if (won.includes('Coins')) potdStorage.addCoins(150);
    if (won.includes('Freeze')) potdStorage.addStreakFreeze(1);
    if (won.includes('XP')) potdStorage.addXP(100);

    alert(`🎁 RAGASIYAM MYSTERY BOX REWARD:\n\nYou won: ${won}!`);
  }

  renderAlreadyCompletedScreen(savedData) {
    const mainCard = document.querySelector('.puzzle-main-card');
    if (mainCard) {
      mainCard.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🌅</div>
          <h2 class="font-display" style="font-size: 2.2rem; color: var(--dark-brown); margin-bottom: 0.5rem;">TODAY'S MYSTERY IS SOLVED!</h2>
          <p style="font-size: 1.1rem; color: #555; margin-bottom: 1.5rem;">You solved today's mystery with a score of <strong>${savedData.score}</strong> in <strong>${potdTimer.formatTime(savedData.timeSpent)}</strong>!</p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="gameApp.openMysteryBox()" class="btn btn-primary glow-effect">🎁 OPEN MYSTERY BOX</button>
            <a href="archive.html" class="btn btn-secondary">Explore Archive</a>
            <a href="stats.html" class="btn btn-outline">View Stats</a>
          </div>
        </div>
      `;
    }
  }

  showToast(message) {
    const existing = document.querySelector('.potd-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'potd-toast animate-fade-in';
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--dark-brown);
      color: var(--warm-cream);
      padding: 0.8rem 1.5rem;
      border-radius: var(--radius-pill);
      border: 2px solid var(--golden-yellow);
      font-family: var(--font-heading);
      font-weight: 600;
      z-index: 2000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

const gameApp = new GameController();
