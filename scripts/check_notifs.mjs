import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDodN6jpozyXsH1WP3JNxCrpxZ0PoesFkk",
  authDomain: "avesdo-cs-hub.firebaseapp.com",
  projectId: "avesdo-cs-hub",
  storageBucket: "avesdo-cs-hub.firebasestorage.app",
  messagingSenderId: "599925324995",
  appId: "1:599925324995:web:547f46480e609680ac3676",
  measurementId: "G-G63LF71D05"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(5));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    console.log(doc.id, "=> emailSent:", doc.data().emailSent, doc.data());
  });
}

check().catch(console.error);
