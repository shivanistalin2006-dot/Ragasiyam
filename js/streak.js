/* ==========================================================================
   PUZZLE OF THE DAY — Streak & Calendar System
   ========================================================================== */

class StreakSystem {
  getWeeklyCalendarData(completedDays = {}) {
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const now = new Date();
    // Get Monday of current week
    const dayIndex = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayIndex);

    return daysOfWeek.map((dayName, idx) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + idx);
      const dateStr = targetDate.toISOString().split('T')[0];
      const isToday = (idx === dayIndex);
      const isPast = (idx < dayIndex);
      const isFuture = (idx > dayIndex);

      let status = 'locked'; // 'completed', 'fire', 'locked'
      if (isToday) {
        // Check if completed today
        status = Object.values(completedDays).some(item => item.solvedAt === dateStr) ? 'completed' : 'today';
      } else if (isPast) {
        status = Object.values(completedDays).some(item => item.solvedAt === dateStr) ? 'completed' : 'missed';
      }

      return {
        dayName,
        dateStr,
        isToday,
        isPast,
        isFuture,
        status
      };
    });
  }

  checkStreakMilestones(currentStreak) {
    const milestones = [3, 7, 14, 30, 50, 100];
    return milestones.filter(m => currentStreak >= m);
  }

  renderProgressBar(currentStreak = 0, streakGoal = 7) {
    if (streakGoal === 'none' || !streakGoal) {
      return `
        <div class="streak-goal-widget casual">
          <div class="streak-goal-header">
            <span>🔥 ${currentStreak} DAY STREAK</span>
            <span class="casual-pill">Casual Mode 🚫</span>
          </div>
        </div>
      `;
    }

    const goalNum = parseInt(streakGoal, 10) || 7;
    const pct = Math.min(100, Math.round((currentStreak / goalNum) * 100));
    const remaining = goalNum - currentStreak;

    let statusText = '';
    if (remaining > 0) {
      statusText = `${remaining} more day${remaining > 1 ? 's' : ''} to reach your goal!`;
    } else {
      statusText = `🎉 GOAL ACHIEVED! You're a Ragasiyam Legend!`;
    }

    // Segment visual bar generator (e.g. ██████░░░░ 6 / 7 Days)
    const totalBlocks = 10;
    const filledBlocks = Math.min(totalBlocks, Math.round((currentStreak / goalNum) * totalBlocks));
    const emptyBlocks = totalBlocks - filledBlocks;
    const textBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

    return `
      <div class="streak-goal-widget">
        <div class="streak-goal-header">
          <span class="font-heading">🔥 ${currentStreak} Day Streak</span>
          <span class="font-heading goal-count-badge">${currentStreak} / ${goalNum} Days</span>
        </div>
        <div class="streak-progress-outer">
          <div class="streak-progress-inner" style="width: ${pct}%;"></div>
        </div>
        <div class="streak-progress-text-bar">${textBar} ${pct}%</div>
        <div class="streak-goal-subtext">${statusText}</div>
      </div>
    `;
  }
}

const potdStreak = new StreakSystem();
