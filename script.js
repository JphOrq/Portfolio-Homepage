const portfolioItems = document.querySelectorAll(".portfolio-item-wrapper");

portfolioItems.forEach((portfolioItem) => {
  portfolioItem.addEventListener("mouseover", () => {
    portfolioItem.childNodes[1].classList.add("img-darken");
  });

  portfolioItem.addEventListener("mouseout", () => {
    portfolioItem.childNodes[1].classList.remove("img-darken");
  });
});

// Get the current year
var currentYear = new Date().getFullYear();

// Update the content of the element with id="currentYear"
document.getElementById("currentYear").textContent = currentYear;

//repositories languages status bar
const username = "JphOrq";

// GitHub-style colors (ONLY real languages from API)
const username = "JphOrq";
const CACHE_KEY = "gh_lang_cache";

// GitHub colors
const colors = {
  JavaScript: "#f1e05a",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  "C#": "#178600",
};

// 🔥 Load with cache first (instant UI)
async function getLanguages() {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    renderLanguages(JSON.parse(cached));
  }

  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      { timeout: 8000 },
    );

    const repos = response.data;

    let totals = {};

    repos.forEach((repo) => {
      const lang = repo.language;
      const size = repo.size || 1;

      if (!lang) return;

      totals[lang] = (totals[lang] || 0) + size;
    });

    // Save cache (fast reload next time)
    localStorage.setItem(CACHE_KEY, JSON.stringify(totals));

    renderLanguages(totals);
  } catch (error) {
    console.error("GitHub API failed:", error);

    // fallback already shown from cache
  }
}

function renderLanguages(data) {
  const container = document.getElementById("languages");
  container.innerHTML = "";

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  sorted.forEach(([lang, value]) => {
    const percent = ((value / total) * 100).toFixed(1);
    const color = colors[lang] || "#58a6ff";

    const el = document.createElement("div");
    el.className = "language";

    el.innerHTML = `
      <div class="lang-header">
        <span>${lang}</span>
        <span>${percent}%</span>
      </div>
      <div class="bar-bg">
        <div class="bar-fill" style="width:${percent}%; background:${color}"></div>
      </div>
    `;

    container.appendChild(el);
  });
}

// auto refresh every 10 minutes
getLanguages();
setInterval(getLanguages, 600000);
