import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUserProfile = null;

window.logout = function() {
  signOut(auth);
  window.location.href = "login.html";
};

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

  const container = document.querySelector(".profile-container");
  container.insertBefore(msgDiv, container.firstChild);

  setTimeout(() => msgDiv.remove(), 5000);
}

async function loadUserProfile(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Ошибка загрузки профиля:", error);
    return null;
  }
}

function renderProfile(profile) {
  if (!profile) return;
  
  currentUserProfile = profile;
  
  if (profile.role === "Student") {
    document.getElementById("studentProfile").style.display = "block";
    document.getElementById("employerProfile").style.display = "none";
    
    document.getElementById("profileFullName").textContent = profile.fullName || "-";
    document.getElementById("profileAge").textContent = profile.age || "-";
    document.getElementById("profileEducation").textContent = profile.education || "-";
    document.getElementById("profileWorkExperience").textContent = profile.workExperience || "-";
    
    const skills = profile.skills && profile.skills.length > 0 
      ? profile.skills.join(", ") 
      : "-";
    document.getElementById("profileSkills").textContent = skills;
  } else if (profile.role === "Employer") {
    document.getElementById("studentProfile").style.display = "none";
    document.getElementById("employerProfile").style.display = "block";
    
    document.getElementById("companyName").value = profile.companyName || "";
    document.getElementById("companyDescription").value = profile.companyDescription || "";
  }
}

window.saveEmployerProfile = async function() {
  try {
    const companyName = document.getElementById("companyName").value.trim();
    const companyDescription = document.getElementById("companyDescription").value.trim();
    
    if (!companyName) {
      showMessage("Введите название компании", true);
      return;
    }
    
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      ...currentUserProfile,
      companyName: companyName,
      companyDescription: companyDescription,
      updatedAt: new Date().toISOString()
    });
    
    showMessage("Профиль сохранен!", false);
  } catch (error) {
    console.error("Ошибка сохранения профиля:", error);
    showMessage("Ошибка сохранения профиля", true);
  }
};

window.createJob = async function() {
  try {
    const title = document.getElementById("jobTitle").value.trim();
    const location = document.getElementById("jobLocation").value;
    const description = document.getElementById("jobDescription").value.trim();
    const requirements = document.getElementById("jobRequirements").value.trim();
    const salary = document.getElementById("jobSalary").value.trim();
    const employmentType = document.getElementById("jobType").value;
    
    if (!title || !description || !requirements || !salary) {
      showMessage("Заполните все обязательные поля", true);
      return;
    }
    
    const companyName = document.getElementById("companyName").value.trim() || "Компания";
    const requirementsArray = requirements.split(",").map(r => r.trim()).filter(r => r);
    
    await addDoc(collection(db, "jobs"), {
      title: title,
      company: companyName,
      location: location,
      description: description,
      requirements: requirementsArray,
      salaryRange: salary,
      employmentType: employmentType,
      category: "IT",
      employerId: auth.currentUser.uid,
      employerEmail: auth.currentUser.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    });
    
    showMessage("Вакансия успешно опубликована!", false);
    
    // Очистить форму
    document.getElementById("jobTitle").value = "";
    document.getElementById("jobDescription").value = "";
    document.getElementById("jobRequirements").value = "";
    document.getElementById("jobSalary").value = "";
    
  } catch (error) {
    console.error("Ошибка создания вакансии:", error);
    showMessage("Ошибка публикации вакансии", true);
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const profile = await loadUserProfile(user.uid);
    renderProfile(profile);
  } else {
    window.location.href = "login.html";
  }
});
