import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsQmK5JqmH-5tUj5p_eyrJZUXGt61BEWo",
    authDomain: "craddle-reading-foundati-a04fe.firebaseapp.com",
      projectId: "craddle-reading-foundati-a04fe",
        storageBucket: "craddle-reading-foundati-a04fe.firebasestorage.app",
          messagingSenderId: "864743637592",
            appId: "1:864743637592:web:49bec9e8f40e6b9673402d"
            };

            const app = initializeApp(firebaseConfig);

            export const auth = getAuth(app);
            export const db = getFirestore(app);
