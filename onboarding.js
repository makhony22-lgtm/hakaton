import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function showMessage(text, isError = false) {
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
  const form = document.getElementById("onboardingForm");
  box.insertBefore(msgDiv, form);

  setTimeout(() => msgDiv.remove(), 5000);
}

window.saveResume = async function() {
  try {
    const age = document.getElementById("age").value.trim();
    const education = document.getElementById("education").value.trim();
    const workExperience = document.getElementById("workExperience").value.trim();
    const skillsInput = document.getElementById("skills").value.trim();
    const desiredPosition = document.getElementById("desiredPosition").value.trim();
    const desiredLocation = document.getElementById("desiredLocation").value;
    
    if (!age || !education || !workExperience || !skillsInput) {
      showMessage("Пожалуйста, заполните все обязательные поля", true);
      return;
    }
    
    const skillsArray = skillsInput.split(",").map(s => s.trim()).filter(s => s);
    
    if (skillsArray.length === 0) {
      showMessage("Укажите хотя бы один навык", true);
      return;
    }
    
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDoc.data();
    
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      ...userData,
      age: parseInt(age),
      education: education,
      workExperience: workExperience,
      skills: skillsArray,
      desiredPosition: desiredPosition,
      desiredLocation: desiredLocation,
      resumeCompleted: true,
      updatedAt: new Date().toISOString()
    });
    
    showMessage("Резюме сохранено! Перенаправляем...", false);
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    
  } catch (error) {
    console.error("Ошибка сохранения резюме:", error);
    showMessage("Ошибка сохранения резюме. Попробуйте еще раз.", true);
  }
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  
  // Проверяем, не заполнено ли уже резюме
  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
  const userData = userDoc.data();
  
  if (userData && userData.resumeCompleted) {
    window.location.href = "index.html";
  }
});
