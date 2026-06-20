(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindMobileMenu() {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function bindSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const input = form.querySelector('input[name="q"]');
        const query = input ? input.value.trim() : '';
        const suffix = query ? '?q=' + encodeURIComponent(query) : '';
        window.location.href = './search.html' + suffix;
      });
    });
  }

  function bindHero() {
    const root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    const next = root.querySelector('[data-hero-next]');
    const prev = root.querySelector('[data-hero-prev]');
    let index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function bindCategoryFilter() {
    const grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll('[data-card]'));
    const input = document.querySelector('[data-filter-input]');
    const year = document.querySelector('[data-filter-year]');
    const type = document.querySelector('[data-filter-type]');

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';
      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute('data-search'));
        const cardYear = card.getAttribute('data-year') || '';
        const cardType = card.getAttribute('data-type') || '';
        const matchQuery = !query || haystack.indexOf(query) !== -1;
        const matchYear = !yearValue || cardYear === yearValue;
        const matchType = !typeValue || cardType.indexOf(typeValue) !== -1;
        card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchType));
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  function movieCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '</a>',
      '<div class="card-body">',
      '<div class="card-kicker"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '<a class="card-action" href="' + escapeHtml(movie.url) + '">立即观看</a>',
      '</div>',
      '</article>'
    ].join('');
  }

  function bindSearchPage() {
    const form = document.querySelector('[data-search-page-form]');
    const results = document.querySelector('[data-search-results]');
    const heading = document.querySelector('[data-search-heading]');
    const summary = document.querySelector('[data-search-summary]');
    const movies = window.SITE_MOVIES || [];
    if (!form || !results || !movies.length) {
      return;
    }
    const input = form.querySelector('input[name="q"]');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render(query) {
      const keyword = normalize(query);
      if (!keyword) {
        if (heading) {
          heading.textContent = '推荐片单';
        }
        if (summary) {
          summary.textContent = '输入关键词后，可按片名、简介、地区、年份、类型与标签进行匹配。';
        }
        return;
      }
      const matched = movies.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.oneLine,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' ')
        ].join(' '));
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 160);
      if (heading) {
        heading.textContent = '“' + query + '”相关影片';
      }
      if (summary) {
        summary.textContent = matched.length ? '以下内容与当前关键词匹配。' : '可尝试更换片名、类型、地区、年份或标签。';
      }
      results.innerHTML = matched.length ? matched.map(movieCard).join('') : '<div class="article-card"><h2>暂无匹配内容</h2><p>可以返回分类页继续浏览更多影片。</p></div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input ? input.value.trim() : '';
      const url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      history.replaceState(null, '', url);
      render(query);
    });

    render(initial);
  }

  ready(function () {
    bindMobileMenu();
    bindSearchForms();
    bindHero();
    bindCategoryFilter();
    bindSearchPage();
  });
})();
