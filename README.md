# 🧩 RAGASIYAM — Puzzle of the Day

> **"Give your brain something to chase."**

A premium retro sunset daily puzzle arcade web application where users solve one featured puzzle every day, use progressive hints, race against the clock, score maximum points, maintain daily streaks, unlock retro achievements, and explore historical archives.

---

## 🎨 Visual Identity — Retro Sunset

- **Aesthetic**: 80s/90s retro arcade + vintage mystery puzzle book + modern premium UI.
- **Palette**: Deep Plum (`#2A1738`), Sunset Purple (`#59345F`), Dusty Pink (`#C86B78`), Coral (`#E77A61`), Sunset Orange (`#F29A5A`), Golden Yellow (`#F6C56B`), Warm Cream (`#FFF0D2`).
- **Typography**: Google Display Fonts (`Luckiest Guy`, `Fredoka`) combined with clean body typography (`Poppins`).

---

## 🛠️ Features

1. **Daily Featured Puzzle**: A single daily challenge for everyone, with practice mode for historical puzzles.
2. **30+ Curated Puzzles**: Logic, Word, Number, Mystery, Visual, Speed, and Pattern categories.
3. **Dynamic Scoring Engine**: Base score (1000) + speed bonus + no-hint bonus + streak bonus - hint/time penalties.
4. **Progressive Hints**: 3 hints with increasing point costs (-20, -40, -60).
5. **Daily Streak & Calendar**: Tracks current and longest streaks with weekly status visualization.
6. **Player Level & XP**: Level up from *Curious Mind* to *Puzzle Master* with puzzle personalities (*THE DETECTIVE*, *SPEEDSTER*, etc.).
7. **Retro Achievement Badges**: 12 unlockable badges with glowing neon card designs.
8. **Web Audio Synthesizer**: Custom retro sound effects (start, click, correct, wrong, hint, timer pulse, fanfare) generated in-browser without external dependencies.
9. **Confetti Celebration**: Physics-based canvas confetti animations on cracked puzzles.
10. **LocalStorage Persistence**: Saves player progress, completed days, scores, settings, and streak state across sessions.

---

## 📁 Project Structure

```
puzzle-of-the-day/
│
├── index.html              # Landing Page / Hero Section
├── README.md               # Project documentation
│
├── css/
│   ├── style.css           # Core styling, retro variables & UI components
│   ├── animations.css      # Floating shapes, neon glows, shake, score pop
│   └── responsive.css      # Mobile navigation & breakpoint adaptations
│
├── js/
│   ├── app.js              # Application entry point & nav controller
│   ├── puzzles.js          # 30+ rich sample puzzles across 7 categories
│   ├── game.js             # Core game state & answer validator
│   ├── timer.js            # Countdown timer engine
│   ├── scoring.js          # Interactive score calculator
│   ├── hints.js            # Progressive hint manager
│   ├── achievements.js     # Achievement registry & unlock triggers
│   ├── streak.js           # Streak tracking & calendar helpers
│   ├── storage.js          # LocalStorage persistence manager
│   └── ui.js               # Web Audio synth, confetti, animations
│
├── assets/
│   ├── icons/              # Category SVG icons & graphics
│   ├── images/             # Vector retro sun and paper textures
│   └── sounds/             # Sound synthesizer configs
│
└── pages/
    ├── puzzle.html         # Interactive gameplay screen
    ├── stats.html          # Player stats, Level/XP & category distribution
    ├── achievements.html   # Achievement gallery showcase
    └── archive.html        # Calendar archive & practice mode
```

---

## 🚀 How to Run Locally

Simply open `index.html` in any modern browser! No web server or backend installation required.
