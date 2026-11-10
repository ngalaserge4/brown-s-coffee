import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { auth, database } from "./firebase-config.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

function showStatus(form, message, isError = false) {
  const status = form.querySelector(".form-status");
  if (!status) return;

  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function setFormBusy(form, busy) {
  form.querySelectorAll('button[type="submit"], .google-button').forEach((button) => {
    button.disabled = busy;
  });
}

function getErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "An account with this email already exists. Sign in instead.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed": "This sign-in method is disabled in Firebase Authentication settings.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in popup. Allow popups and try again.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/too-many-requests": "Too many attempts. Wait a while, then try again.",
    "auth/unauthorized-domain": "This website's domain is not authorized in Firebase Authentication settings.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "permission-denied": "Authentication succeeded, but Firestore denied access to the user profile. Check the Firestore rules for the users collection.",
  };

  return messages[error?.code] || error?.message || "Something went wrong. Check the browser console for details.";
}

async function getDestination(user) {
  const userDoc = await getDoc(doc(database, "users", user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(database, "users", user.uid), {
      name: user.displayName || "",
      email: user.email || "",
      role: "customer",
      createdAt: serverTimestamp(),
    });
    return "index.html";
  }

  return userDoc.data().role === "admin" ? "admin.html" : "index.html";
}

async function registerUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!name || !email || !password) {
    showStatus(form, "Please fill in all fields.", true);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showStatus(form, "Enter a valid email address.", true);
    return;
  }

  if (password.length < 6) {
    showStatus(form, "Choose a password with at least 6 characters.", true);
    return;
  }

  setFormBusy(form, true);
  showStatus(form, "Creating your account...");

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await setDoc(doc(database, "users", user.uid), {
        name,
        email: user.email || email,
        role: "customer",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Account created, but the Firestore profile could not be saved:", error);
      alert(`Your account was created, but your profile could not be saved. ${getErrorMessage(error)}`);
    }

    window.location.href = "index.html";
  } catch (error) {
    console.error("Error registering user:", error);
    showStatus(form, getErrorMessage(error), true);
    setFormBusy(form, false);
  }
}

async function loginUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = document.getElementById("login-email")?.value.trim();
  const password = document.getElementById("login-password")?.value;

  if (!email || !password) {
    showStatus(form, "Enter your email and password.", true);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showStatus(form, "Enter a valid email address.", true);
    return;
  }

  setFormBusy(form, true);
  showStatus(form, "Signing in...");

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    let destination;
    try {
      destination = await getDestination(user);
    } catch (error) {
      console.error("Signed in, but unable to load the user's Firestore profile:", error);
      alert(`You are signed in, but your profile could not be checked. You will be taken to the home page. ${getErrorMessage(error)}`);
      destination = "index.html";
    }

    window.location.href = destination;
  } catch (error) {
    console.error("Error logging in user:", error);
    showStatus(form, getErrorMessage(error), true);
    setFormBusy(form, false);
  }
}

async function signInWithGoogle(event) {
  const form = event.currentTarget.closest("form");
  if (form) {
    setFormBusy(form, true);
    showStatus(form, "Connecting to Google...");
  }

  try {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    let destination;
    try {
      destination = await getDestination(user);
    } catch (error) {
      console.error("Google sign-in succeeded, but unable to load the user's Firestore profile:", error);
      alert(`You are signed in with Google, but your profile could not be checked. You will be taken to the home page. ${getErrorMessage(error)}`);
      destination = "index.html";
    }

    window.location.href = destination;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    if (form) {
      showStatus(form, getErrorMessage(error), true);
      setFormBusy(form, false);
    } else {
      alert(getErrorMessage(error));
    }
  }
}

const registerForm = document.getElementById("register-form");
registerForm?.addEventListener("submit", registerUser);

const loginForm = document.getElementById("login-form");
loginForm?.addEventListener("submit", loginUser);

document.querySelectorAll(".google-button").forEach((button) => {
  button.addEventListener("click", signInWithGoogle);
});
