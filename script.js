const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.getElementById('site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    siteNav.classList.toggle('open');
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
  });
}

const formMessage = document.getElementById('form-message');
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

let auth;
let db;
let isFirebaseReady = false;

function showMessage(message, tone = 'success') {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.style.color = tone === 'success' ? '#0b2a4a' : '#b91c1c';
}

function initFirebase() {
  if (window.firebase && !isFirebaseReady) {
    try {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      isFirebaseReady = true;
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
    }
  }
}

function saveLocalUser(userData) {
  localStorage.setItem('crf-user', JSON.stringify(userData));
}

async function storeUserProfile(uid, profile) {
  if (!db) return;
  try {
    await db.collection('users').doc(uid).set(profile, { merge: true });
  } catch (error) {
    console.warn('Firestore write failed:', error);
  }
}

async function handleAuthSuccess(user, role = 'student') {
  const profile = {
    uid: user.uid,
    name: user.displayName || 'Learner',
    email: user.email,
    role
  };
  saveLocalUser(profile);
  await storeUserProfile(user.uid, profile);
  window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    initFirebase();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      showMessage('Please enter your email and password.', 'error');
      return;
    }

    if (!auth) {
      showMessage('Firebase Auth is not configured yet. Please add your Firebase credentials.', 'error');
      return;
    }

    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      const role = (await db.collection('users').doc(result.user.uid).get()).data()?.role || 'student';
      await handleAuthSuccess(result.user, role);
    } catch (error) {
      showMessage(error.message || 'Login failed.', 'error');
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    initFirebase();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const role = document.getElementById('register-role').value;

    if (!name || !email || !password) {
      showMessage('Please fill in all registration details.', 'error');
      return;
    }

    if (!auth) {
      showMessage('Firebase Auth is not configured yet. Please add your Firebase credentials.', 'error');
      return;
    }

    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: name });
      await handleAuthSuccess(result.user, role);
    } catch (error) {
      showMessage(error.message || 'Registration failed.', 'error');
    }
  });
}

const logoutButton = document.getElementById('logout-btn');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    if (auth) {
      auth.signOut();
    }
    localStorage.removeItem('crf-user');
    window.location.href = 'login.html';
  });
}

function populateStudentDashboard() {
  const lessonList = document.getElementById('lesson-list');
  if (lessonList) {
    lessonList.innerHTML = `
      <li>Reading warm-ups and phonics</li>
      <li>Vocabulary enrichment exercises</li>
      <li>Live speaking practice</li>
    `;
  }

  const enrolledCourse = document.getElementById('enrolled-course');
  if (enrolledCourse) {
    enrolledCourse.textContent = 'Primary 1 English';
  }

  const paymentStatus = document.getElementById('payment-status');
  if (paymentStatus) {
    paymentStatus.textContent = 'Pending';
  }

  const streak = document.getElementById('streak-count');
  if (streak) {
    streak.textContent = '5 days';
  }
}

function populateAdminDashboard() {
  const adminTableBody = document.getElementById('admin-table-body');
  if (adminTableBody) {
    adminTableBody.innerHTML = `
      <tr><td>Amina Yusuf</td><td>Primary 4 English</td><td>Active</td></tr>
      <tr><td>Kelechi Okafor</td><td>Primary 2 English</td><td>Pending</td></tr>
      <tr><td>Sade Bello</td><td>Primary 6 English</td><td>Paid</td></tr>
    `;
  }
}

function initDashboard() {
  if (window.location.pathname.includes('student-dashboard')) {
    populateStudentDashboard();
  }

  if (window.location.pathname.includes('admin-dashboard')) {
    populateAdminDashboard();
  }
}

function initializeApp() {
  initFirebase();
  initDashboard();
}

window.addEventListener('load', initializeApp);

const payButtons = document.querySelectorAll('.pay-now');
payButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const course = button.dataset.course || 'English course';
    if (window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: 'YOUR_PAYSTACK_PUBLIC_KEY',
        email: 'student@example.com',
        amount: 300000,
        currency: 'NGN',
        ref: `crf-${Date.now()}`,
        callback: (response) => {
          showMessage(`Payment successful for ${course}. Reference: ${response.reference}`, 'success');
        },
        onClose: () => {
          showMessage('Payment cancelled.', 'error');
        }
      });
      handler.openIframe();
    } else {
      showMessage(`Paystack integration is ready for ${course}. Replace the placeholder public key to accept real payments.`, 'success');
    }
  });
});
