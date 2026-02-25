import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

window.register = async function () {
  try {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!fullName || !email || !password) {
      throw new Error("Заполните все поля");
    }

    if (password.length < 6) {
      throw Object.assign(new Error("Слабый пароль"), { code: "auth/weak-password" });
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      email: userCred.user.email,
      role: role,
      fullName: fullName,
      age: null,
      education: "",
      workExperience: "",
      skills: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

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
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index.html";
  }
});
