console.log("script.js loaded");
import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ============================
   Helper Functions
============================ */

function showMessage(message, color = "red") {
  const box = document.getElementById("form-message");

  if (!box) return;

  box.textContent = message;
  box.style.color = color;
}

function saveUser(user) {
  localStorage.setItem("crf-user", JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem("crf-user");
}

async function redirectUser(user) {
  const userRef = doc(db, "users", user.uid);

  const snap = await getDoc(userRef);

  if (!snap.exists()) return;

  const data = snap.data();

  saveUser(data);

  if (data.role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else {
    window.location.href = "student-dashboard.html";
  }
}

/* ============================
   LOGIN
============================ */

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document
      .getElementById("login-email")
      .value
      .trim();

    const password =
      document.getElementById("login-password").value;

    try {
      const result =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      await redirectUser(result.user);

    } catch (err) {
      showMessage(err.message);
    }
  });
}
/* ============================
   REGISTER
============================ */

const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document
      .getElementById("register-name")
      .value
      .trim();

    const email = document
      .getElementById("register-email")
      .value
      .trim();

    const password =
      document.getElementById("register-password").value;

    const role =
      document.getElementById("register-role").value;

    if (!name || !email || !password) {
      showMessage("Please fill in all fields.");
      return;
    }

    try {
      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await updateProfile(result.user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      showMessage(
        "Registration successful!",
        "green"
      );

      setTimeout(() => {
        if (role === "admin") {
          window.location.href =
            "admin-dashboard.html";
        } else {
          window.location.href =
            "student-dashboard.html";
        }
      }, 1500);

    } catch (err) {
      showMessage(err.message);
    }
  });
}
/* ============================
   AUTH STATE
============================ */

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const currentPage = window.location.pathname;

  if (
    currentPage.includes("login.html") ||
    currentPage.includes("register.html")
  ) {
    await redirectUser(user);
  }
});

/* ============================
   LOGOUT
============================ */

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    logoutUser();
    window.location.href = "login.html";
  });
}

/* ============================
   HAMBURGER MENU
============================ */

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
console.log("Hamburger code reached");
if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    console.log("Hamburger clicked");

    siteNav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      siteNav.classList.contains("open")
    );
  });
}
/* ============================
   REVEAL ANIMATION
============================ */

const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
}

/* ============================
   FOOTER YEAR
============================ */

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

/* ============================
   CLOSE MENU WHEN LINK IS CLICKED
============================ */

const navLinks = document.querySelectorAll(".site-nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (siteNav) {
      siteNav.classList.remove("open");
    }

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

console.log("CRF Online Academy loaded successfully.");