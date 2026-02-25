import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const submitJobBtn = document.getElementById("submitJob");

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

submitJobBtn.addEventListener("click", async () => {
  const title = document.getElementById("jobTitle").value.trim();
  const category = document.getElementById("jobCategory").value.trim();
  const salaryRange = document.getElementById("jobSalary").value.trim();
  const location = document.getElementById("jobLocation").value;
  const district = document.getElementById("jobDistrict").value.trim();
  const experience = document.getElementById("jobExperience").value;
  const employmentType = document.getElementById("jobEmploymentType").value;
  const education = document.getElementById("jobEducation").value;
  const description = document.getElementById("jobDescription").value.trim();
  const requirementsInput = document.getElementById("jobRequirements").value.trim();
  
  // Валидация обязательных полей
  if (!title || !category || !salaryRange || !location || !experience || !employmentType || !education) {
    alert("Пожалуйста, заполните все обязательные поля (отмечены *)");
    return;
  }
  
  // Обработка навыков
  const requirements = requirementsInput 
    ? requirementsInput.split(",").map(req => req.trim()).filter(req => req.length > 0)
    : [];
  
  try {
    const user = auth.currentUser;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();
    
    // Создаем вакансию
    await addDoc(collection(db, "jobs"), {
      title,
      category,
      salaryRange,
      location,
      district,
      experience,
      employmentType,
      education,
      description,
      requirements,
      company: userData.companyName || "Не указано",
      employerId: user.uid,
      createdAt: serverTimestamp(),
      publishedDate: new Date().toLocaleDateString("ru-RU")
    });
    
    alert("Вакансия успешно опубликована!");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Ошибка при добавлении вакансии:", error);
    alert("Ошибка при публикации вакансии: " + error.message);
  }
});
