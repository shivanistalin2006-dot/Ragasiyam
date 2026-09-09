/* ==========================================================================
   PUZZLE OF THE DAY — Core Game Logic Controller
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
    // Parse URL parameters for practice mode or specific day
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

    // Check if daily puzzle is already cracked
    const state = potdStorage.getState();
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
    
    // Category & Difficulty badges
    const categoryBadge = document.getElementById('category-badge');
    const difficultyBadge = document.getElementById('difficulty-badge');
    const puzzleTitle = document.getElementById('puzzle-day-title');
    const questionText = document.getElementById('question-text');

    if (categoryBadge) {
      categoryBadge.textContent = `${p.categoryIcon} ${p.categoryName}`;
      categoryBadge.className = `category-badge cat-${p.category}`;
    }

    if (difficultyBadge) {
      difficultyBadge.textContent = p.difficultyName;
      difficultyBadge.className = `diff-badge diff-${p.difficulty}`;
    }

    if (puzzleTitle) {
      puzzleTitle.textContent = `DAY #${p.day} — ${p.categoryName.toUpperCase()} PUZZLE`;
    }

    if (questionText) {
      questionText.innerText = p.question;
    }

    // Render Answer Input (Text or Multiple Choice Options)
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

    // Render Hints Section
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

    // Check alternate acceptable answers
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
      void mainCard.offsetWidth; // Trigger reflow
      mainCard.classList.add('shake-animation');
    }

    this.showToast('Not quite... your brain is warming up! Try again.');
  }

  handleTimeExpire() {
    potdSound.playWrong();
    alert("⏱️ TIME EXPIRED! Don't worry, keep practicing and try another puzzle!");
    window.location.href = '../index.html';
  }

  handleSuccess() {
    this.isCompleted = true;
    potdTimer.stop();
    potdSound.playCorrect();
    potdConfetti.burst(80);

    const timeSpent = potdTimer.getTimeElapsed();
    const hintsCount = potdHints.getUnlockedCount();
    const isPerfect = (hintsCount === 0 && this.wrongAttempts === 0);

    // Calculate score
    const scoreData = potdScoring.calculateScore({
      baseScore: this.currentPuzzle.baseScore || 1000,
      timeElapsed: timeSpent,
      timeLimit: this.currentPuzzle.timeLimit || 120,
      hintsUnlockedCount: hintsCount,
      wrongAttemptsCount: this.wrongAttempts,
      difficulty: this.currentPuzzle.difficulty,
      currentStreak: potdStorage.getState().currentStreak
    });

    // Record progress in storage if not practice mode
    if (!this.isPracticeMode) {
      potdStorage.recordPuzzleSolve(
        this.currentPuzzle.day,
        scoreData,
        timeSpent,
        hintsCount,
        isPerfect
      );

      // Check achievements
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

    // Show Victory Modal
    this.showVictoryModal(scoreData, timeSpent, isPerfect);
  }

  showVictoryModal(scoreData, timeSpent, isPerfect) {
    const modalOverlay = document.getElementById('victory-modal');
    if (!modalOverlay) return;

    const timeFormatted = potdTimer.formatTime(timeSpent);
    document.getElementById('modal-solve-time').textContent = timeFormatted;
    document.getElementById('modal-percentile').textContent = `Faster than ${scoreData.percentile}% of today's solvers!`;
    document.getElementById('modal-explanation').textContent = this.currentPuzzle.explanation;

    // Render score breakdown table
    const tableBody = document.getElementById('modal-score-table');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr><td class="row-label">Base Score</td><td class="row-val val-plus">+${scoreData.baseScore}</td></tr>
        <tr><td class="row-label">Speed Bonus</td><td class="row-val val-plus">+${scoreData.speedBonus}</td></tr>
        <tr><td class="row-label">Streak Bonus</td><td class="row-val val-plus">+${scoreData.streakBonus}</td></tr>
        ${scoreData.noHintBonus ? `<tr><td class="row-label">No Hint Bonus</td><td class="row-val val-plus">+${scoreData.noHintBonus}</td></tr>` : ''}
        ${scoreData.firstAttemptBonus ? `<tr><td class="row-label">1st Attempt Bonus</td><td class="row-val val-plus">+${scoreData.firstAttemptBonus}</td></tr>` : ''}
        ${scoreData.hintPenalty ? `<tr><td class="row-label">Hint Penalty</td><td class="row-val val-minus">-${scoreData.hintPenalty}</td></tr>` : ''}
        ${scoreData.attemptPenalty ? `<tr><td class="row-label">Wrong Attempt Penalty</td><td class="row-val val-minus">-${scoreData.attemptPenalty}</td></tr>` : ''}
        <tr class="total-row"><td class="row-label">FINAL SCORE</td><td class="row-val" id="modal-final-score-num">0</td></tr>
      `;
    }

    modalOverlay.classList.add('active');

    // Animate final score
    const finalScoreEl = document.getElementById('modal-final-score-num');
    UIUtils.animateNumber(finalScoreEl, 0, scoreData.finalScore, 1200);
  }

  renderAlreadyCompletedScreen(savedData) {
    const mainCard = document.querySelector('.puzzle-main-card');
    if (mainCard) {
      mainCard.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
          <h2 class="font-display" style="font-size: 2.2rem; color: var(--dark-brown); margin-bottom: 0.5rem;">TODAY'S PUZZLE IS CRACKED!</h2>
          <p style="font-size: 1.1rem; color: #555; margin-bottom: 1.5rem;">You solved today's puzzle with a score of <strong>${savedData.score}</strong> in <strong>${potdTimer.formatTime(savedData.timeSpent)}</strong>!</p>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <a href="archive.html" class="btn btn-secondary">Explore Archive</a>
            <a href="stats.html" class="btn btn-primary">View My Stats</a>
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
