import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const cards = document.getElementById("cards");
const searchBar = document.getElementById("searchBar");
const filterLocation = document.getElementById("filterLocation");
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

function renderJobs(jobs) {
  cards.innerHTML = "";
  
  if (jobs.length === 0) {
    cards.innerHTML = '<p class="no-jobs">Нет доступных вакансий</p>';
    return;
  }
  
  jobs.forEach(job => {
    const requirements = job.requirements && job.requirements.length > 0
      ? job.requirements.map(req => `<span class="tag">${req}</span>`).join('')
      : '';
    
    cards.innerHTML += `
      <div class="card job-card">
        <h3 class="job-title">${job.title || 'Без названия'}</h3>
        <p class="company-name">${job.company || '-'}</p>
        <p class="location">📍 ${job.location || '-'}</p>
        <p class="salary">💰 ${job.salaryRange || '-'}</p>
        <div class="requirements">${requirements}</div>
      </div>
    `;
  });
}

function searchJobs(query, locationFilter) {
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
  
  renderJobs(filtered);
}

searchBar.addEventListener("input", (e) => {
  searchJobs(e.target.value, filterLocation.value);
});

filterLocation.addEventListener("change", (e) => {
  searchJobs(searchBar.value, e.target.value);
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
