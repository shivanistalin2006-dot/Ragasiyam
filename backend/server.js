/* ==========================================================================
   PUZZLE OF THE DAY — Express + SQLite3 Backend REST API Server
   ========================================================================== */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database file
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening SQLite database:', err);
  else console.log('Connected to SQLite database at', dbPath);
});

// Setup tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT DEFAULT '🧩',
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

// Auth Endpoints
app.post('/api/register', (req, res) => {
  const { username, email, passwordHash, avatar } = req.body;
  const sql = `INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)`;
  db.run(sql, [username, email, passwordHash, avatar || '🧩'], function(err) {
    if (err) return res.status(400).json({ error: 'Username or Email already taken.' });
    res.json({ id: this.lastID, username, email, avatar });
  });
});

app.post('/api/login', (req, res) => {
  const { username, passwordHash } = req.body;
  const sql = `SELECT * FROM users WHERE LOWER(username) = LOWER(?)`;
  db.get(sql, [username], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found.' });
    if (user.password_hash !== passwordHash) return res.status(401).json({ error: 'Invalid password.' });
    res.json({ id: user.id, username: user.username, email: user.email, avatar: user.avatar });
  });
});

app.listen(PORT, () => {
  console.log(`Puzzle of the Day SQLite backend running on port ${PORT}`);
});
