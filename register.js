import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerStudentBtn = document.getElementById("registerStudent");
const registerEmployerBtn = document.getElementById("registerEmployer");

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

  const box = document.querySelector(".box");
  const firstButton = box.querySelector("button");
  box.insertBefore(msgDiv, firstButton);

  setTimeout(() => msgDiv.remove(), 5000);
}

async function register(email, password, role, fullName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: email,
    role: role,
    fullName: fullName,
    age: null,
    education: "",
    workExperience: "",
    skills: [],
    createdAt: new Date()
  });
  
  return user;
}

registerStudentBtn.addEventListener("click", async () => {
  try {
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!fullName || !email || !password) {
      throw new Error("Заполните все поля");
    }

    if (password.length < 6) {
      throw Object.assign(new Error("Слабый пароль"), { code: "auth/weak-password" });
    }

    await register(email, password, "student", fullName);

    showMessage("Регистрация успешна! Перенаправляем...", false);
    setTimeout(() => {
      window.location.href = "onboarding.html";
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
});

registerEmployerBtn.addEventListener("click", async () => {
  try {
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!fullName || !email || !password) {
      throw new Error("Заполните все поля");
    }

    if (password.length < 6) {
      throw Object.assign(new Error("Слабый пароль"), { code: "auth/weak-password" });
    }

    await register(email, password, "employer", fullName);

    showMessage("Регистрация успешна! Перенаправляем...", false);
    setTimeout(() => {
      window.location.href = "account.html";
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
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.data().role;
    
    if (role === "student") {
      window.location.href = "onboarding.html";
    }
    if (role === "employer") {
      window.location.href = "account.html";
    }
  }
});
