// firebase-init.js

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBI_fmxUs3xZWMwAI_SawRGMN75c8WRulI",
    authDomain: "pecfinal1.firebaseapp.com",
    databaseURL: "https://pecfinal1-default-rtdb.firebaseio.com",
    projectId: "pecfinal1",
    storageBucket: "pecfinal1.firebasestorage.app",
    messagingSenderId: "441529268809",
    appId: "1:441529268809:web:e0a3ed73214ead816a5d98",
    measurementId: "G-Z5Y7SNYXC6"
  };
  
  // Initialize Firebase only once
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
