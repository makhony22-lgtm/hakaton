import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const titleInput = document.getElementById("vacancyTitle");
const descriptionInput = document.getElementById("vacancyDescription");
const addBtn = document.getElementById("addVacancyBtn");

// Проверка авторизации и роли
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Необходимо войти в систему");
    window.location.href = "login.html";
    return;
  }
  
  // Проверяем роль пользователя
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "employer") {
    alert("Только работодатели могут добавлять вакансии");
    window.location.href = "index.html";
    return;
  }
});

addBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title || !description) {
    alert("Заполните все поля");
    return;
  }

  try {
    await addDoc(collection(db, "vacancies"), {
      title: title,
      description: description,
      ownerId: auth.currentUser.uid, // сохраняем UID работодателя
      createdAt: serverTimestamp()
    });

    alert("Вакансия успешно добавлена!");
    titleInput.value = "";
    descriptionInput.value = "";
    
    // Перенаправляем на главную страницу
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    console.error("Ошибка добавления вакансии:", error);
    alert(error.message);
  }
});
