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
    const milestones = [3, 7, 14, 30, 100];
    return milestones.filter(m => currentStreak >= m);
  }
}

const potdStreak = new StreakSystem();
