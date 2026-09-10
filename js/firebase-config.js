/* ==========================================================================
   RAGASIYAM — Firebase SDK Configuration & Initialization
   ========================================================================== */

// Firebase Web SDK Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDemoConfigKeyForRagasiyamApp001",
  authDomain: "ragasiyam-app.firebaseapp.com",
  projectId: "ragasiyam-app",
  storageBucket: "ragasiyam-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo12345678901234"
};

class FirebaseManager {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isReady = false;
    this.init();
  }

  init() {
    try {
      if (window.firebase) {
        if (!window.firebase.apps.length) {
          this.app = window.firebase.initializeApp(firebaseConfig);
        } else {
          this.app = window.firebase.app();
        }
        this.auth = window.firebase.auth();
        this.db = window.firebase.firestore();
        this.isReady = true;
        console.log('🔥 Firebase initialized successfully for RAGASIYAM!');
      } else {
        console.warn('Firebase SDK script not loaded yet, using offline database manager.');
      }
    } catch (e) {
      console.warn('Firebase initialization notice (running with local database layer):', e);
    }
  }
}

const potdFirebase = new FirebaseManager();
