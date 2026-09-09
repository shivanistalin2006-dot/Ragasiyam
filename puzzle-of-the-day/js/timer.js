/* ==========================================================================
   PUZZLE OF THE DAY — Countdown Timer Engine
   ========================================================================== */

class GameTimer {
  constructor() {
    this.duration = 120; // Default seconds
    this.remaining = 120;
    this.timerId = null;
    this.isRunning = false;
    this.onTick = null;
    this.onWarning = null;
    this.onExpire = null;
    this.startTime = null;
  }

  start(seconds, callbacks = {}) {
    this.stop();
    this.duration = seconds || 120;
    this.remaining = this.duration;
    this.onTick = callbacks.onTick || null;
    this.onWarning = callbacks.onWarning || null;
    this.onExpire = callbacks.onExpire || null;
    this.startTime = Date.now();
    this.isRunning = true;

    this.timerId = setInterval(() => {
      this.remaining--;
      
      if (typeof this.onTick === 'function') {
        this.onTick(this.remaining, this.formatTime(this.remaining));
      }

      if (this.remaining === 15 && typeof this.onWarning === 'function') {
        this.onWarning(this.remaining);
      }

      if (this.remaining <= 0) {
        this.stop();
        if (typeof this.onExpire === 'function') {
          this.onExpire();
        }
      }
    }, 1000);

    // Initial immediate tick
    if (typeof this.onTick === 'function') {
      this.onTick(this.remaining, this.formatTime(this.remaining));
    }
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  getTimeElapsed() {
    return this.duration - this.remaining;
  }

  formatTime(totalSeconds) {
    const secs = Math.max(0, totalSeconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(remainingSecs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
  }
}

const potdTimer = new GameTimer();
