import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";
import { getDatabase, increment, onValue, ref, set } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfJbEIDqeEUCbYZbycnHogC_0vTo5MnnU",
  authDomain: "portfolio-counter-6f692.firebaseapp.com",
  databaseURL: "https://portfolio-counter-6f692-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portfolio-counter-6f692",
  storageBucket: "portfolio-counter-6f692.firebasestorage.app",
  messagingSenderId: "1040318112642",
  appId: "1:1040318112642:web:1cab089f9e2ae05ae4659b",
  measurementId: "G-WFB8DC0024"
};

const DAY_MS = 86_400_000;
const MANILA_OFFSET_MS = 28_800_000;

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const countEl = document.getElementById("visitor-count");

let serverTimeOffset = 0;
let watchedDay;
let stopWatchingCount;
let rolloverTimer;

function currentDayStart(now = Date.now() + serverTimeOffset) {
  return Math.floor((now + MANILA_OFFSET_MS) / DAY_MS) * DAY_MS - MANILA_OFFSET_MS;
}

function dailyCountRef(day) {
  return ref(db, "visitors/daily/" + day);
}

function watchToday() {
  const now = Date.now() + serverTimeOffset;
  const day = currentDayStart(now);

  clearTimeout(rolloverTimer);
  rolloverTimer = setTimeout(watchToday, day + DAY_MS - now);

  if (day === watchedDay) return;

  stopWatchingCount?.();
  watchedDay = day;
  countEl.textContent = "\u2014";
  stopWatchingCount = onValue(dailyCountRef(day), (snapshot) => {
    countEl.textContent = String(snapshot.val() ?? 0);
  }, (error) => {
    console.error("Could not read today's visits:", error);
  });
}

onValue(ref(db, ".info/serverTimeOffset"), (snapshot) => {
  serverTimeOffset = snapshot.val() ?? 0;
  if (countEl) watchToday();
});

if (countEl) {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) watchToday();
  });
}

async function recordVisit() {
  await signInAnonymously(getAuth(app));

  let stopWatchingConnection;
  await new Promise((resolve) => {
    stopWatchingConnection = onValue(ref(db, ".info/connected"), (snapshot) => {
      if (snapshot.val() === true) resolve();
    });
  });
  stopWatchingConnection();

  const day = currentDayStart();
  try {
    await set(dailyCountRef(day), increment(1));
  } catch (error) {
    const newDay = currentDayStart();
    if (error.code !== "PERMISSION_DENIED" || day === newDay) throw error;
    await set(dailyCountRef(newDay), increment(1));
  }
}

recordVisit().catch((error) => {
  console.error("Could not record this visit:", error);
});

getAnalytics(app);
