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

// GitHub-style colors
const colors = {
  JavaScript: "#f1e05a",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  "C#": "#178600",
  WordPress: "#21759b",
};

async function getLanguages() {
  // ⚡ SINGLE REQUEST ONLY
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100`,
  );
  const repos = await res.json();

  let totals = {};

  repos.forEach((repo) => {
    let lang = repo.language;
    let size = repo.size || 1; // weight by repo size

    if (!lang) return;

    // WordPress detection (simple heuristic)
    if (lang === "PHP" && repo.name.toLowerCase().includes("wordpress")) {
      lang = "WordPress";
    }

    totals[lang] = (totals[lang] || 0) + size;
  });

  renderLanguages(totals);
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

getLanguages();
