
// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZa1XM6PfB7Gk7Zh68jj00DTU2DNCDLtI",
  authDomain: "hakaton-f729f.firebaseapp.com",
  projectId: "hakaton-f729f",
  storageBucket: "hakaton-f729f.firebasestorage.app",
  messagingSenderId: "105665130861",
  appId: "1:105665130861:web:cbd9c31be34f605ae1ea64",
  measurementId: "G-0X96DDHVHP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const analytics = getAnalytics(app);
