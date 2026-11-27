import { firebaseConfig } from "./auth-config.js";
if (firebaseConfig) {
  window.authEnabled = true;
  const V = "10.12.2", base = `https://www.gstatic.com/firebasejs/${V}/`;
  const [{ initializeApp }, { getAuth, onAuthStateChanged, signOut }] = await Promise.all([import(base + "firebase-app.js"), import(base + "firebase-auth.js")]);
  const auth = getAuth(initializeApp(firebaseConfig));
  window.authSignOut = () => signOut(auth).then(() => location.replace("login.html"));
  window.authToken = () => auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);
  onAuthStateChanged(auth, u => {
    if (!u) { location.replace("login.html"); return; }
    window.authUser = { displayName: u.displayName, email: u.email };
    window.dispatchEvent(new Event("authchange"));
  });
}
