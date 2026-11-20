const portfolioItems = document.querySelectorAll(".portfolio-item-wrapper");

portfolioItems.forEach((portfolioItem) => {
  portfolioItem.addEventListener("mouseover", () => {
    portfolioItem.childNodes[1].classList.add("img-darken");
  });

  portfolioItem.addEventListener("mouseout", () => {
    portfolioItem.childNodes[1].classList.remove("img-darken");
  });
});

// *****************************************************

// Get the current year
var currentYear = new Date().getFullYear();

// Update the content of the element with id="currentYear"
document.getElementById("currentYear").textContent = currentYear;

// *****************************************************

// Theme toggle
const themeToggle = document.querySelector(".theme-toggle");
const html = document.documentElement;
const savedTheme = localStorage.getItem("theme");

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  updateThemeIcon(theme);
  updateSkillIcons(theme);
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  const icon = themeToggle.querySelector("i");
  if (!icon) return;
  icon.className = theme === "dark" ? "fa fa-sun-o" : "fa fa-moon-o";
}

function updateSkillIcons(theme) {
  const skillImgs = document.querySelectorAll(".skill-card img");
  if (!skillImgs) return;
  skillImgs.forEach((img) => {
    const darkSrc = img.getAttribute("data-dark-src");
    const lightSrc = img.getAttribute("data-light-src");
    img.src = theme === "dark" ? darkSrc : lightSrc;
  });
}

function initTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

initTheme();

// *****************************************************

//repositories languages status bar
const username = "JphOrq";

const colors = {
  JavaScript: "#f1e05a",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  "C#": "#178600",
};

async function getLanguages() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
    );
    if (!res.ok) return;
    const repos = await res.json();
    if (!Array.isArray(repos)) return;

    let totals = {};

    repos.forEach((repo) => {
      const lang = repo.language;
      const size = repo.size || 1;

      if (!lang) return;

      totals[lang] = (totals[lang] || 0) + size;
    });

    renderLanguages(totals);
  } catch (e) {
    // Silently fail if GitHub API is rate-limited or unavailable
  }
}

function renderLanguages(data) {
  const container = document.getElementById("languages");
  if (!container) return;
  container.innerHTML = "";

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // top 6 only

  sorted.forEach(([lang, value]) => {
    const percent = ((value / total) * 100).toFixed(1);
    const color = colors[lang] || "#58a6ff"; // fallback color

    const el = document.createElement("div");
    el.className = "language";

    el.innerHTML = `
  <div class="lang-header">
    <span>${lang}</span>
    <span>${percent}%</span>
  </div>
  <div class="bar-bg">
    <div class="bar-fill" style="--w:${percent}%; width:${percent}%; background:${color}"></div>
  </div>
`;

    container.appendChild(el);
  });
}

getLanguages();

// *****************************************************
// Typewriter effect for the hero title
const typewriter = document.getElementById("typewriter");
const typeText = "Joseph C. Orquita";
let typeIndex = 0;

function type() {
  if (!typewriter) return;
  if (typeIndex < typeText.length) {
    typewriter.textContent += typeText.charAt(typeIndex);
    typeIndex++;
    setTimeout(type, 90);
  }
}

// Animated counters for stat cards
const statNumbers = document.querySelectorAll(".stat-number");
let repoCount = null;

async function fetchRepoCount() {
  if (repoCount !== null) return repoCount;
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    if (!res.ok) {
      repoCount = null;
      return null;
    }
    const repos = await res.json();
    repoCount = Array.isArray(repos) ? repos.length : null;
  } catch (e) {
    repoCount = null;
  }
  return repoCount;
}

function computeYearsFrom(startStr) {
  const start = new Date(startStr + "-01");
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  if (
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
  ) {
    years -= 1;
  }
  return Math.max(years, 0);
}

async function animateCounter(el) {
  const startStr = el.getAttribute("data-start");
  const countType = el.getAttribute("data-count");
  const fallbackValue = el.getAttribute("data-fallback");
  let target;

  if (countType === "github-repos") {
    target = await fetchRepoCount();
    if (!target || target === 0) {
      target = fallbackValue ? +fallbackValue : 0;
    }
  } else {
    target = startStr ? computeYearsFrom(startStr) : +el.getAttribute("data-target");
  }

  const duration = 1400;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = value + (value === target && target >= 100 ? "%" : "");
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target + (target >= 100 ? "%" : "");
    }
  }
  requestAnimationFrame(step);
}

// Scroll reveal via Intersection Observer
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        if (entry.target.classList.contains("stats")) {
          statNumbers.forEach((s) => animateCounter(s));
        }
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Kick off typewriter once the hero is visible
const heroObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      type();
      heroObserver.disconnect();
    }
  },
  { threshold: 0.2 }
);

const hero = document.querySelector(".hero");
if (hero) heroObserver.observe(hero);
