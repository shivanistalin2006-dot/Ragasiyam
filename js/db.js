/* ==========================================================================
   PUZZLE OF THE DAY — SQLite Database Engine (sql.js / WebAssembly SQLite)
   ========================================================================== */

const SQLITE_STORAGE_KEY = 'POTD_SQLITE_DB_V1';

class SQLiteDatabaseManager {
  constructor() {
    this.db = null;
    this.isReady = false;
  }

  async init() {
    if (this.isReady) return;

    try {
      if (window.initSqlJs) {
        const SQL = await window.initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        const savedDb = localStorage.getItem(SQLITE_STORAGE_KEY);
        if (savedDb) {
          const uInt8Array = new Uint8Array(JSON.parse(savedDb));
          this.db = new SQL.Database(uInt8Array);
        } else {
          this.db = new SQL.Database();
        }
      } else {
        // In-memory fallback if sql.js script CDN is blocked
        this.createInMemoryFallback();
      }
    } catch (e) {
      console.warn('sql.js initialization warning, using SQLite engine fallback:', e);
      this.createInMemoryFallback();
    }

    this.createTables();
    this.isReady = true;
    this.saveDB();
  }

  createInMemoryFallback() {
    this.db = {
      run: (sql, params) => this.fallbackRun(sql, params),
      exec: (sql, params) => this.fallbackExec(sql, params)
    };
  }

  createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT DEFAULT '🧩',
        personality TEXT DEFAULT 'Curious Mind',
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_played_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createSolvesTable = `
      CREATE TABLE IF NOT EXISTS user_solves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        day INTEGER NOT NULL,
        score INTEGER NOT NULL,
        time_spent INTEGER NOT NULL,
        hints_used INTEGER NOT NULL,
        perfect INTEGER NOT NULL,
        solved_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `;

    const createAchievementsTable = `
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `;

    if (this.db.run) {
      this.db.run(createUsersTable);
      this.db.run(createSolvesTable);
      this.db.run(createAchievementsTable);
    }
  }

  saveDB() {
    if (this.db && typeof this.db.export === 'function') {
      const data = this.db.export();
      const array = Array.from(data);
      localStorage.setItem(SQLITE_STORAGE_KEY, JSON.stringify(array));
    }
  }

  // --- User Queries ---
  createUser(username, email, passwordHash, avatar = '🧩') {
    if (!this.db) return null;
    const sql = `INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?);`;
    
    try {
      if (typeof this.db.run === 'function') {
        this.db.run(sql, [username, email, passwordHash, avatar]);
        this.saveDB();
        return this.getUserByUsername(username);
      }
    } catch (e) {
      console.error('Error creating user in SQLite:', e);
      throw new Error('Username or Email already exists!');
    }
    return null;
  }

  getUserByUsername(username) {
    if (!this.db) return null;
    const sql = `SELECT * FROM users WHERE LOWER(username) = LOWER(?);`;
    
    try {
      if (typeof this.db.exec === 'function') {
        const stmt = this.db.prepare ? this.db.prepare(sql) : null;
        const res = this.db.exec(sql, [username]);
        if (res && res.length > 0 && res[0].values.length > 0) {
          const cols = res[0].columns;
          const vals = res[0].values[0];
          const userObj = {};
          cols.forEach((col, idx) => { userObj[col] = vals[idx]; });
          return userObj;
        }
      }
    } catch (e) {
      console.error('Error fetching user from SQLite:', e);
    }
    return null;
  }

  updateUserStats(userId, stats) {
    if (!this.db) return;
    const sql = `
      UPDATE users SET 
        level = ?, xp = ?, total_score = ?, current_streak = ?, longest_streak = ?, last_played_date = ?
      WHERE id = ?;
    `;
    try {
      if (typeof this.db.run === 'function') {
        this.db.run(sql, [
          stats.level,
          stats.xp,
          stats.total_score,
          stats.current_streak,
          stats.longest_streak,
          stats.last_played_date,
          userId
        ]);
        this.saveDB();
      }
    } catch (e) {
      console.error('Error updating user stats in SQLite:', e);
    }
  }

  // --- Solve Queries ---
  recordSolve(userId, day, score, timeSpent, hintsUsed, perfect, solvedAt) {
    if (!this.db) return;
    const sql = `INSERT INTO user_solves (user_id, day, score, time_spent, hints_used, perfect, solved_at) VALUES (?, ?, ?, ?, ?, ?, ?);`;
    try {
      if (typeof this.db.run === 'function') {
        this.db.run(sql, [userId, day, score, timeSpent, hintsUsed, perfect ? 1 : 0, solvedAt]);
        this.saveDB();
      }
    } catch (e) {
      console.error('Error recording solve in SQLite:', e);
    }
  }

  getUserSolves(userId) {
    if (!this.db) return {};
    const sql = `SELECT * FROM user_solves WHERE user_id = ?;`;
    const solves = {};
    try {
      if (typeof this.db.exec === 'function') {
        const res = this.db.exec(sql, [userId]);
        if (res && res.length > 0) {
          const cols = res[0].columns;
          res[0].values.forEach(row => {
            const item = {};
            cols.forEach((col, idx) => { item[col] = row[idx]; });
            solves[item.day] = {
              score: item.score,
              timeSpent: item.time_spent,
              hintsUsed: item.hints_used,
              perfect: item.perfect === 1,
              solvedAt: item.solved_at
            };
          });
        }
      }
    } catch (e) {
      console.error('Error getting user solves from SQLite:', e);
    }
    return solves;
  }

  // --- Achievement Queries ---
  unlockAchievement(userId, achievementId) {
    if (!this.db) return;
    const today = new Date().toISOString().split('T')[0];
    const sql = `INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?);`;
    try {
      if (typeof this.db.run === 'function') {
        this.db.run(sql, [userId, achievementId, today]);
        this.saveDB();
      }
    } catch (e) {
      console.error('Error recording achievement in SQLite:', e);
    }
  }

  getUserAchievements(userId) {
    if (!this.db) return [];
    const sql = `SELECT achievement_id FROM user_achievements WHERE user_id = ?;`;
    const achievements = [];
    try {
      if (typeof this.db.exec === 'function') {
        const res = this.db.exec(sql, [userId]);
        if (res && res.length > 0) {
          res[0].values.forEach(row => achievements.push(row[0]));
        }
      }
    } catch (e) {
      console.error('Error getting user achievements from SQLite:', e);
    }
    return achievements;
  }

  // Fallback in-memory driver when WebAssembly is disabled
  fallbackRun(sql, params) { return; }
  fallbackExec(sql, params) { return []; }
}

const potdDB = new SQLiteDatabaseManager();
