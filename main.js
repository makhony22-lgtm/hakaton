import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const cards = document.getElementById("cards");
const searchBar = document.getElementById("searchBar");
const filterLocation = document.getElementById("filterLocation");
const filterEmploymentType = document.getElementById("filterEmploymentType");
const userSection = document.getElementById("userSection");

let allJobs = [];
let currentUser = null;
let currentUserProfile = null;

async function loadJobs() {
  try {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    allJobs = [];
    querySnapshot.forEach((doc) => {
      allJobs.push({ id: doc.id, ...doc.data() });
    });
    renderJobs(allJobs);
  } catch (error) {
    console.error("Ошибка загрузки вакансий:", error);
    cards.innerHTML = '<p class="no-jobs">Не удалось загрузить вакансии</p>';
  }
}

function calculateMatchScore(job, userSkills) {
  if (!userSkills || userSkills.length === 0 || !job.requirements) {
    return 0;
  }
  
  const jobRequirements = job.requirements.map(r => r.toLowerCase());
  const skills = userSkills.map(s => s.toLowerCase());
  
  let matches = 0;
  skills.forEach(skill => {
    if (jobRequirements.some(req => req.includes(skill) || skill.includes(req))) {
      matches++;
    }
  });
  
  return matches;
}

function renderJobs(jobs) {
  cards.innerHTML = "";
  
  if (jobs.length === 0) {
    cards.innerHTML = '<p class="no-jobs">Нет доступных вакансий</p>';
    return;
  }
  
  // Сортируем вакансии по совпадению навыков для студентов
  let sortedJobs = [...jobs];
  if (currentUserProfile && currentUserProfile.role === "Student" && currentUserProfile.skills) {
    sortedJobs = sortedJobs.map(job => ({
      ...job,
      matchScore: calculateMatchScore(job, currentUserProfile.skills)
    })).sort((a, b) => b.matchScore - a.matchScore);
  }
  
  sortedJobs.forEach(job => {
    const requirements = job.requirements && job.requirements.length > 0
      ? job.requirements.map(req => `<span class="tag">${req}</span>`).join('')
      : '';
    
    const matchBadge = job.matchScore > 0 
      ? `<div class="match-badge">Совпадений: ${job.matchScore}</div>` 
      : '';
    
    cards.innerHTML += `
      <div class="card job-card ${job.matchScore > 0 ? 'recommended' : ''}">
        ${matchBadge}
        <h3 class="job-title">${job.title || 'Без названия'}</h3>
        <p class="company-name">${job.company || '-'}</p>
        <p class="location">📍 ${job.location || '-'}</p>
        <p class="salary">💰 ${job.salaryRange || '-'}</p>
        <p class="employment-type">⏰ ${job.employmentType || '-'}</p>
        <div class="requirements">${requirements}</div>
      </div>
    `;
  });
}

function searchJobs(query, locationFilter, employmentTypeFilter) {
  let filtered = allJobs;
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(job => {
      const matchesTitle = job.title && job.title.toLowerCase().includes(lowerQuery);
      const matchesCompany = job.company && job.company.toLowerCase().includes(lowerQuery);
      const matchesRequirements = job.requirements && job.requirements.some(req => 
        req.toLowerCase().includes(lowerQuery)
      );
      return matchesTitle || matchesCompany || matchesRequirements;
    });
  }
  
  if (locationFilter) {
    filtered = filtered.filter(job => job.location === locationFilter);
  }
  
  if (employmentTypeFilter) {
    filtered = filtered.filter(job => job.employmentType === employmentTypeFilter);
  }
  
  renderJobs(filtered);
}

searchBar.addEventListener("input", (e) => {
  searchJobs(e.target.value, filterLocation.value, filterEmploymentType.value);
});

filterLocation.addEventListener("change", (e) => {
  searchJobs(searchBar.value, e.target.value, filterEmploymentType.value);
});

filterEmploymentType.addEventListener("change", (e) => {
  searchJobs(searchBar.value, filterLocation.value, e.target.value);
});

window.logout = function() {
  signOut(auth);
  window.location.href = "login.html";
};

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

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  
  if (user) {
    currentUserProfile = await loadUserProfile(user.uid);
    
    let userButtons = `
      <div class="user-info" onclick="location.href='account.html'" style="cursor: pointer;">
        <span>👤 ${user.email}</span>
      </div>
      <button onclick="logout()" class="btn-primary">Выйти</button>
    `;
    
    // Показываем кнопку "Добавить вакансию" только для работодателей
    if (currentUserProfile && currentUserProfile.role === "Employer") {
      userButtons = `
        <button onclick="location.href='account.html'" class="btn-secondary">Добавить вакансию</button>
        <div class="user-info" onclick="location.href='account.html'" style="cursor: pointer;">
          <span>👤 ${user.email}</span>
        </div>
        <button onclick="logout()" class="btn-primary">Выйти</button>
      `;
    }
    
    userSection.innerHTML = userButtons;
  } else {
    userSection.innerHTML = `
      <button onclick="location.href='login.html'" class="btn-secondary">Войти</button>
      <button onclick="location.href='register.html'" class="btn-primary">Регистрация</button>
    `;
  }
  
  loadJobs();
});
