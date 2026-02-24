import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const universities=[
 {name:"КазНУ",city:"Алматы",ent:110},
 {name:"ENU",city:"Астана",ent:95}
];

const cards=document.getElementById("cards");
const userEmail=document.getElementById("userEmail");

function render(){
  cards.innerHTML="";
  universities.forEach(u=>{
    cards.innerHTML+=`
      <div class="card">
        <h3>${u.name}</h3>
        <p>${u.city}</p>
        <p>Баллы: ${u.ent}</p>
      </div>
    `;
  });
}

window.logout=function(){
  signOut(auth);
  window.location.href="login.html";
}

// защита страницы
onAuthStateChanged(auth,user=>{
  if(user){
    userEmail.innerText=user.email;
    render();
  }else{
    window.location.href="login.html";
  }
});
