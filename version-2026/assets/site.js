const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMenus() {
  const button = qs(".mobile-toggle");
  const panel = qs(".mobile-panel");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
}

function setupSearchForms() {
  qsa("form[role='search']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = qs("input[name='q']", form);
      const query = input ? input.value.trim() : "";
      const action = form.getAttribute("action") || "search.html";
      if (query) {
        window.location.href = `${action}?q=${encodeURIComponent(query)}`;
      } else {
        window.location.href = action;
      }
    });
  });
}

function setupHero() {
  const hero = qs("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = qsa("[data-hero-slide]", hero);
  const dots = qsa("[data-hero-dot]", hero);
  if (slides.length < 2) {
    return;
  }
  let active = 0;
  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === active));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === active));
  };
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => show(i));
  });
  window.setInterval(() => show(active + 1), 5000);
}

function setupLocalFilters() {
  const list = qs(".filter-list");
  if (!list) {
    return;
  }
  const input = qs(".filter-input");
  const selects = qsa(".filter-select");
  const empty = qs(".filter-empty");
  const items = qsa(".filter-item", list);
  const apply = () => {
    const keyword = input ? input.value.trim().toLowerCase() : "";
    const filters = selects.map((select) => ({ key: select.dataset.filterKey, value: select.value.trim() }));
    let visible = 0;
    items.forEach((item) => {
      const haystack = [item.dataset.title, item.dataset.region, item.dataset.type, item.dataset.year, item.dataset.genre, item.dataset.category].join(" ").toLowerCase();
      const keywordMatch = !keyword || haystack.includes(keyword);
      const selectMatch = filters.every((filter) => !filter.value || (item.dataset[filter.key] || "").includes(filter.value));
      const matched = keywordMatch && selectMatch;
      item.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  };
  if (input) {
    input.addEventListener("input", apply);
  }
  selects.forEach((select) => select.addEventListener("change", apply));
}

function movieCard(movie) {
  const tags = movie.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `
<article class="movie-card">
  <a href="${movie.url}" class="movie-card-link">
    <div class="movie-cover">
      <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
      <span class="movie-category">${escapeHtml(movie.category)}</span>
      <span class="movie-type">${escapeHtml(movie.type)}</span>
    </div>
    <div class="movie-body">
      <h3>${escapeHtml(movie.title)}</h3>
      <p>${escapeHtml(movie.oneLine)}</p>
      <div class="movie-meta"><span>${escapeHtml(movie.year)}</span><span>${escapeHtml(movie.region)}</span></div>
      <div class="tag-row">${tags}</div>
    </div>
  </a>
</article>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function setupSearchPage() {
  const root = qs("[data-search-page]");
  if (!root || !window.MOVIES_INDEX) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const input = qs(".search-input-large", root);
  const category = qs(".search-category", root);
  const type = qs(".search-type", root);
  const year = qs(".search-year", root);
  const results = qs(".search-results", root);
  const empty = qs(".search-empty", root);
  const summary = qs(".search-summary", root);
  if (input) {
    input.value = q;
  }
  const render = () => {
    const keyword = input ? input.value.trim().toLowerCase() : "";
    const categoryValue = category ? category.value : "";
    const typeValue = type ? type.value : "";
    const yearValue = year ? year.value : "";
    const matched = window.MOVIES_INDEX.filter((movie) => {
      const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine, movie.tags.join(" ")].join(" ").toLowerCase();
      return (!keyword || text.includes(keyword)) &&
        (!categoryValue || movie.category === categoryValue) &&
        (!typeValue || movie.type.includes(typeValue)) &&
        (!yearValue || movie.year === yearValue);
    });
    const limited = matched.slice(0, 240);
    results.innerHTML = limited.map(movieCard).join("");
    empty.classList.toggle("show", matched.length === 0);
    summary.textContent = matched.length > 0 ? `找到 ${matched.length} 个相关结果` : "";
  };
  [input, category, type, year].forEach((node) => {
    if (node) {
      node.addEventListener(node.tagName === "INPUT" ? "input" : "change", render);
    }
  });
  render();
}

async function setupPlayers() {
  const players = qsa(".player-wrap");
  if (!players.length) {
    return;
  }
  let HlsClass = null;
  for (const wrap of players) {
    const video = qs("video", wrap);
    const overlay = qs(".player-overlay", wrap);
    const source = video ? qs("source", video) : null;
    if (!video || !source) {
      continue;
    }
    const url = source.getAttribute("src");
    const hideOverlay = () => overlay && overlay.classList.add("is-hidden");
    const showOverlay = () => overlay && overlay.classList.remove("is-hidden");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else {
      try {
        const module = await import("./hls.js");
        HlsClass = HlsClass || module.H;
        if (HlsClass && HlsClass.isSupported()) {
          const hls = new HlsClass({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        }
      } catch (error) {
        video.src = url;
      }
    }
    const play = () => {
      hideOverlay();
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(showOverlay);
      }
    };
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenus();
  setupSearchForms();
  setupHero();
  setupLocalFilters();
  setupSearchPage();
  setupPlayers();
});
