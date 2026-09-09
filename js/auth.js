/* ==========================================================================
   PUZZLE OF THE DAY — Authentication & User Session Controller
   ========================================================================== */

const AUTH_SESSION_KEY = 'POTD_ACTIVE_SESSION_V1';

class AuthController {
  constructor() {
    this.currentUser = null;
    this.initSession();
  }

  initSession() {
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  async hashPassword(password) {
    if (window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Simple fallback string hashing
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash);
  }

  async register(username, email, password, avatar = '🧩') {
    if (!username || username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const passwordHash = await this.hashPassword(password);
    const newUser = potdDB.createUser(username.trim(), email.trim().toLowerCase(), passwordHash, avatar);

    if (newUser) {
      this.setSession(newUser);
      return newUser;
    } else {
      throw new Error('Registration failed. Username or email may already be taken.');
    }
  }

  async login(username, password) {
    if (!username || !password) {
      throw new Error('Please enter both username and password.');
    }

    const user = potdDB.getUserByUsername(username.trim());
    if (!user) {
      throw new Error('User not found. Please check your username or Sign Up.');
    }

    const passwordHash = await this.hashPassword(password);
    if (user.password_hash === passwordHash) {
      this.setSession(user);
      return user;
    } else {
      throw new Error('Incorrect password. Please try again.');
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.location.reload();
  }

  setSession(userObj) {
    this.currentUser = {
      id: userObj.id,
      username: userObj.username,
      email: userObj.email,
      avatar: userObj.avatar || '🧩'
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.currentUser));
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

const potdAuth = new AuthController();
