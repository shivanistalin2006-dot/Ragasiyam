/* ==========================================================================
   RAGASIYAM — Firestore & SQLite Database Engine
   ========================================================================== */

const SQLITE_STORAGE_KEY = 'POTD_SQLITE_DB_V2';

class MultiDatabaseManager {
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
        this.createInMemoryFallback();
      }
    } catch (e) {
      console.warn('SQLite fallback driver active:', e);
      this.createInMemoryFallback();
    }

    this.createTables();
    this.isReady = true;
    this.saveDB();
  }

  createInMemoryFallback() {
    this.db = {
      run: () => {},
      exec: () => []
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
        longest_streak DEFAULT 0,
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
        solved_at TEXT NOT NULL
      );
    `;

    const createAchievementsTable = `
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at TEXT NOT NULL
      );
    `;

    if (this.db && typeof this.db.run === 'function') {
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

  // --- Firestore Integration Methods ---
  async createUserProfileInFirestore(userObj) {
    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.db) {
      try {
        const userRef = potdFirebase.db.collection('users').doc(userObj.uid);
        const doc = await userRef.get();
        if (!doc.exists) {
          await userRef.set({
            uid: userObj.uid,
            username: userObj.username,
            email: userObj.email,
            avatar: userObj.avatar || '🧩',
            total_score: 0,
            level: 1,
            xp: 0,
            current_streak: 0,
            longest_streak: 0,
            coins: 100,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('🔥 User profile created in Firestore:', userObj.username);
        }
      } catch (e) {
        console.warn('Firestore profile creation notice:', e);
      }
    }
  }

  async syncUserProfileToFirestore(uid, stats) {
    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.db) {
      try {
        await potdFirebase.db.collection('users').doc(uid).set({
          total_score: stats.total_score,
          level: stats.level,
          xp: stats.xp,
          current_streak: stats.current_streak,
          longest_streak: stats.longest_streak,
          last_played_date: stats.last_played_date,
          updated_at: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore sync notice:', e);
      }
    }
  }

  async fetchLeaderboard(limitCount = 10) {
    // 1. Attempt Firestore Live Leaderboard
    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.db) {
      try {
        const snapshot = await potdFirebase.db.collection('users')
          .orderBy('total_score', 'desc')
          .limit(limitCount)
          .get();

        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            list.push({
              username: data.username || 'Anonymous',
              avatar: data.avatar || '🧩',
              score: data.total_score || 0,
              streak: data.current_streak || 0,
              level: data.level || 1
            });
          });
          return list;
        }
      } catch (e) {
        console.warn('Firestore leaderboard query fallback:', e);
      }
    }

    // 2. Fallback Demo Leaderboard if Firestore is offline
    return [
      { username: 'Arjun', avatar: '⚡', score: 12840, streak: 14, level: 8 },
      { username: 'Shivani', avatar: '🕵️', score: 11920, streak: 12, level: 7 },
      { username: 'Priya', avatar: '🧠', score: 10450, streak: 10, level: 6 },
      { username: 'Kavin', avatar: '👑', score: 9870, streak: 8, level: 5 },
      { username: 'Rohan', avatar: '🧩', score: 8400, streak: 5, level: 4 }
    ];
  }

  // --- SQLite Fallbacks ---
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
      throw new Error('Username or Email already exists!');
    }
    return null;
  }

  getUserByUsername(username) {
    if (!this.db) return null;
    const sql = `SELECT * FROM users WHERE LOWER(username) = LOWER(?);`;
    try {
      if (typeof this.db.exec === 'function') {
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
      console.error(e);
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
      console.error(e);
    }
  }

  recordSolve(userId, day, score, timeSpent, hintsUsed, perfect, solvedAt) {
    if (!this.db) return;
    const sql = `INSERT INTO user_solves (user_id, day, score, time_spent, hints_used, perfect, solved_at) VALUES (?, ?, ?, ?, ?, ?, ?);`;
    try {
      if (typeof this.db.run === 'function') {
        this.db.run(sql, [userId, day, score, timeSpent, hintsUsed, perfect ? 1 : 0, solvedAt]);
        this.saveDB();
      }
    } catch (e) {
      console.error(e);
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
      console.error(e);
    }
    return solves;
  }

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
      console.error(e);
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
      console.error(e);
    }
    return achievements;
  }
}

const potdDB = new MultiDatabaseManager();
