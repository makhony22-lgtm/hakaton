// auth.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Вспомогательная функция для показа красивого сообщения
function showMessage(text, isError = true) {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = text;
  msgDiv.style.padding = "12px";
  msgDiv.style.margin = "12px 0";
  msgDiv.style.borderRadius = "8px";
  msgDiv.style.backgroundColor = isError ? "#fee2e2" : "#dcfce7";
  msgDiv.style.color = isError ? "#991b1b" : "#166534";
  msgDiv.style.border = isError ? "1px solid #fecaca" : "1px solid #86efac";
  msgDiv.style.textAlign = "center";

  // Вставляем сообщение перед кнопками
  const box = document.querySelector(".box");
  const firstButton = box.querySelector("button");
  box.insertBefore(msgDiv, firstButton);

  // Авто-удаление через 5 секунд
  setTimeout(() => msgDiv.remove(), 5000);
}

window.register = async function () {
  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      throw new Error("Введите email и пароль");
    }

    if (password.length < 6) {
      throw Object.assign(new Error("Слабый пароль"), { code: "auth/weak-password" });
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Сохраняем базовую информацию о пользователе
    await setDoc(doc(db, "users", userCred.user.uid), {
      email: userCred.user.email,
      createdAt: new Date().toISOString(),
      // можно добавить позже: name, phone и т.д.
    });

    showMessage("Регистрация успешна! Перенаправляем...", false);
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {
    let message = "Произошла ошибка. Попробуйте позже.";

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "Этот email уже зарегистрирован. Попробуйте войти или используйте другой.";
        break;
      case "auth/invalid-email":
        message = "Некорректный формат email. Проверьте, пожалуйста.";
        break;
      case "auth/weak-password":
        message = "Пароль слишком слабый. Минимум 6 символов.";
        break;
      case "auth/operation-not-allowed":
        message = "Регистрация временно отключена. Обратитесь к администратору.";
        break;
      case "auth/too-many-requests":
        message = "Слишком много попыток. Подождите 30–60 секунд и попробуйте снова.";
        break;
      default:
        message = error.message || "Неизвестная ошибка";
        console.error("Ошибка регистрации:", error);
    }

    showMessage(message, true);
  }
};

window.login = async function () {
  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      throw new Error("Введите email и пароль");
    }

    await signInWithEmailAndPassword(auth, email, password);

    showMessage("Вход выполнен! Перенаправляем...", false);
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);

  } catch (error) {
    let message = "Не удалось войти. Проверьте данные.";

    switch (error.code) {
      case "auth/wrong-password":
        message = "Неверный пароль. Попробуйте ещё раз.";
        break;
      case "auth/user-not-found":
      case "auth/invalid-credential":
        message = "Пользователь не найден или неверные данные.";
        break;
      case "auth/invalid-email":
        message = "Некорректный формат email.";
        break;
      case "auth/too-many-requests":
        message = "Слишком много попыток. Подождите немного.";
        break;
      default:
        message = error.message || "Ошибка входа";
        console.error("Ошибка входа:", error);
    }

    showMessage(message, true);
  }
};

// Если пользователь уже авторизован — сразу на главную
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index.html";
  }
});
