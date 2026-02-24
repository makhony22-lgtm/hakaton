import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

window.register = async function(){
  const userCred = await createUserWithEmailAndPassword(auth,emailInput.value,passwordInput.value);

  await setDoc(doc(db,"users",userCred.user.uid),{
    email:userCred.user.email,
    createdAt:new Date()
  });

  window.location.href="index.html";
}

window.login = async function(){
  await signInWithEmailAndPassword(auth,emailInput.value,passwordInput.value);
  window.location.href="index.html";
}

// если уже вошел — не показываем login
onAuthStateChanged(auth,user=>{
  if(user){
    window.location.href="index.html";
  }
});
