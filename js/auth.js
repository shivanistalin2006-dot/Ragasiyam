/* ==========================================================================
   RAGASIYAM — Firebase Authentication & User Session Manager
   ========================================================================== */

const AUTH_SESSION_KEY = 'POTD_ACTIVE_SESSION_V2';

class AuthController {
  constructor() {
    this.currentUser = null;
    this.initSession();
    this.setupFirebaseListener();
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

  setupFirebaseListener() {
    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.auth) {
      potdFirebase.auth.onAuthStateChanged(user => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            id: user.uid,
            username: user.displayName || user.email.split('@')[0],
            email: user.email,
            avatar: user.photoURL || '🧩'
          };
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.currentUser));
          if (typeof potdStorage !== 'undefined') {
            potdStorage.loadUserStateFromDB(this.currentUser);
          }
        }
      });
    }
  }

  async register(username, email, password, confirmPassword, avatar = '🧩') {
    if (!username || username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match! Please verify your password.');
    }

    // Attempt Firebase Registration if available
    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.auth) {
      try {
        const userCred = await potdFirebase.auth.createUserWithEmailAndPassword(email.trim(), password);
        await userCred.user.updateProfile({
          displayName: username.trim(),
          photoURL: avatar
        });
        
        const userObj = {
          uid: userCred.user.uid,
          id: userCred.user.uid,
          username: username.trim(),
          email: email.trim().toLowerCase(),
          avatar: avatar
        };

        // Create user document in Firestore database
        if (typeof potdDB !== 'undefined') {
          potdDB.createUserProfileInFirestore(userObj);
        }

        this.setSession(userObj);
        return userObj;
      } catch (fbErr) {
        console.warn('Firebase Auth registration fallback:', fbErr);
        if (fbErr.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Please Log In instead.');
        }
      }
    }

    // Local / SQLite Engine Fallback
    const passwordHash = await this.hashPassword(password);
    const newUser = potdDB.createUser(username.trim(), email.trim().toLowerCase(), passwordHash, avatar);

    if (newUser) {
      this.setSession(newUser);
      return newUser;
    } else {
      throw new Error('Registration failed. Username or email may already be taken.');
    }
  }

  async login(emailOrUsername, password, rememberMe = true) {
    if (!emailOrUsername || !password) {
      throw new Error('Please enter both email/username and password.');
    }

    let email = emailOrUsername.trim();
    if (!email.includes('@')) {
      // Look up email by username in local DB if available
      const localUser = potdDB.getUserByUsername(emailOrUsername);
      if (localUser && localUser.email) {
        email = localUser.email;
      }
    }

    // Attempt Firebase Authentication
    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.auth) {
      try {
        const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        await potdFirebase.auth.setPersistence(persistence);
        const userCred = await potdFirebase.auth.signInWithEmailAndPassword(email, password);
        
        const userObj = {
          uid: userCred.user.uid,
          id: userCred.user.uid,
          username: userCred.user.displayName || userCred.user.email.split('@')[0],
          email: userCred.user.email,
          avatar: userCred.user.photoURL || '🧩'
        };

        this.setSession(userObj);
        return userObj;
      } catch (fbErr) {
        console.warn('Firebase Auth login fallback:', fbErr);
        if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/user-not-found') {
          throw new Error('Invalid email or password. Please try again.');
        }
      }
    }

    // Local / SQLite Fallback
    const user = potdDB.getUserByUsername(emailOrUsername);
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

  async loginWithGoogle() {
    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.auth) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await potdFirebase.auth.signInWithPopup(provider);
        const userObj = {
          uid: result.user.uid,
          id: result.user.uid,
          username: result.user.displayName || result.user.email.split('@')[0],
          email: result.user.email,
          avatar: '👑'
        };
        
        if (typeof potdDB !== 'undefined') {
          potdDB.createUserProfileInFirestore(userObj);
        }

        this.setSession(userObj);
        return userObj;
      } catch (err) {
        console.error('Google Sign-In error:', err);
        throw new Error('Google Sign-In failed or popup was closed.');
      }
    } else {
      throw new Error('Google Sign-In is unavailable in offline mode.');
    }
  }

  async forgotPassword(email) {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address to reset your password.');
    }

    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.auth) {
      try {
        await potdFirebase.auth.sendPasswordResetEmail(email.trim());
        return true;
      } catch (err) {
        throw new Error(err.message || 'Failed to send password reset email.');
      }
    } else {
      alert(`Password reset instructions sent to ${email} (Demo mode).`);
      return true;
    }
  }

  logout() {
    if (typeof potdFirebase !== 'undefined' && potdFirebase.isReady && potdFirebase.auth) {
      potdFirebase.auth.signOut().catch(e => console.warn(e));
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.location.reload();
  }

  async hashPassword(password) {
    if (window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return 'pass_' + password;
  }

  setSession(userObj) {
    this.currentUser = {
      uid: userObj.uid || userObj.id,
      id: userObj.uid || userObj.id,
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
