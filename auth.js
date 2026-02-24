import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

window.register = async function() {
  try {
    if (!emailInput.value || !passwordInput.value) {
      throw new Error("Введите email и пароль");
    }
    if (passwordInput.value.length < 6) {
      throw new Error("Пароль должен быть минимум 6 символов");
    }
    const userCred = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    await setDoc(doc(db, "users", userCred.user.uid), {
      email: userCred.user.email,
      createdAt: new Date()
    });
    window.location.href = "index.html";
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    alert("Ошибка: " + error.message);
  }
}

window.login = async function() {
  try {
    if (!emailInput.value || !passwordInput.value) {
      throw new Error("Введите email и пароль");
    }
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Ошибка входа:", error);
    alert("Ошибка: " + error.message);
  }
}

// Если уже вошел — не показываем login
onAuthStateChanged(auth, user => {
  if (user) {
    window.location.href = "index.html";
  }
});
