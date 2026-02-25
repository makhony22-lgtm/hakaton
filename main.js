import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const cards = document.getElementById("cards");
const searchBar = document.getElementById("searchBar");
const filterLocation = document.getElementById("filterLocation");
const filterEmploymentType = document.getElementById("filterEmploymentType");
const heroNav = document.getElementById("heroNav");

let allJobs = [];
let currentUser = null;
let currentUserProfile = null;

async function loadJobs() {
  try {
    const querySnapshot = await getDocs(collection(db, "vacancies"));
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
  
  // Сортируем вакансии по дате создания (новые первыми)
  let sortedJobs = [...jobs].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return b.createdAt.seconds - a.createdAt.seconds;
    }
    return 0;
  });
  
  sortedJobs.forEach(job => {
    const createdDate = job.createdAt 
      ? new Date(job.createdAt.seconds * 1000).toLocaleDateString("ru-RU")
      : '';
    
    const publishedDate = createdDate ? `<p class="job-date">📅 Опубликовано ${createdDate}</p>` : '';
    
    cards.innerHTML += `
      <div class="card job-card">
        <h3 class="job-title">${job.title || 'Без названия'}</h3>
        <p class="job-description">${job.description || '-'}</p>
        ${publishedDate}
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
      const matchesDescription = job.description && job.description.toLowerCase().includes(lowerQuery);
      return matchesTitle || matchesDescription;
    });
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
  if (user) {
    currentUserProfile = await loadUserProfile(user.uid);
    
    // Обновляем навигацию для авторизованных пользователей
    if (currentUserProfile && currentUserProfile.role === "employer") {
      // Для работодателя показываем кнопку добавления вакансии
      heroNav.innerHTML = `
        <a href="#vacancies" class="nav-link">Главная страница</a>
        <button onclick="location.href='add-job.html'" class="btn-primary" style="background: var(--green) !important; box-shadow: 0 4px 12px var(--green03) !important;">+ Добавить вакансию</button>
        <button onclick="location.href='account.html'" class="btn-secondary">Профиль</button>
        <button onclick="logout()" class="btn-secondary">Выйти</button>
      `;
    } else {
      // Для студента обычная навигация
      heroNav.innerHTML = `
        <a href="#vacancies" class="nav-link">Главная страница</a>
        <button onclick="location.href='account.html'" class="btn-secondary">Профиль</button>
        <button onclick="logout()" class="btn-secondary">Выйти</button>
      `;
    }
  } else {
    currentUserProfile = null;
    // Для неавторизованных пользователей
    heroNav.innerHTML = `
      <a href="#vacancies" class="nav-link">Главная страница</a>
      <button onclick="location.href='login.html'" class="btn-secondary">Войти</button>
      <button onclick="location.href='register.html'" class="btn-primary">Регистрация</button>
    `;
  }
  
  loadJobs();
});
