// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZa1XM6PfB7Gk7Zh68jj00DTU2DNCDLtI",
  authDomain: "hakaton-f729f.firebaseapp.com",
  projectId: "hakaton-f729f",
  storageBucket: "hakaton-f729f.firebasestorage.app",
  messagingSenderId: "105665130861",
  appId: "1:105665130861:web:cbd9c31be34f605ae1ea64",
  measurementId: "G-0X96DDHVHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
