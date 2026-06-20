(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('hidden');
    });
  }

  function initBackToTop() {
    document.querySelectorAll('.back-to-top').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initCardFilters() {
    var input = document.querySelector('.card-filter-input');
    var region = document.querySelector('.card-filter-region');
    var type = document.querySelector('.card-filter-type');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.no-results');
    if (!cards.length || (!input && !region && !type)) {
      return;
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
        var matchesType = !typeValue || normalize(card.dataset.type + ' ' + card.dataset.genre + ' ' + card.dataset.tags).indexOf(typeValue) !== -1;
        var shouldShow = matchesKeyword && matchesRegion && matchesType;
        card.classList.toggle('hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('hidden', visible !== 0);
      }
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="px-2 py-1 bg-sky-50 text-sky-600 rounded-full text-xs">' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<a href="' + escapeHtml(item.url) + '" class="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 movie-card">' +
        '<div class="relative aspect-video overflow-hidden">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy">' +
          '<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>' +
        '</div>' +
        '<div class="p-4">' +
          '<h3 class="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-sky-600 transition-colors">' + escapeHtml(item.title) + '</h3>' +
          '<p class="text-xs text-gray-500 line-clamp-2 mb-3">' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="flex flex-wrap gap-2 mb-3">' + tags + '</div>' +
          '<div class="flex items-center justify-between text-xs text-gray-500">' +
            '<span class="px-2 py-1 bg-sky-50 text-sky-600 rounded-full">' + escapeHtml(item.region) + '</span>' +
            '<span>' + escapeHtml(item.year) + '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = document.querySelector('.search-results');
    var summary = document.querySelector('.search-summary');
    var form = document.querySelector('.search-form-large');
    if (!results || typeof movieSearchIndex === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = form ? form.querySelector('input[name="q"]') : null;
    if (input) {
      input.value = query;
    }

    function render(value) {
      var keyword = normalize(value);
      if (!keyword) {
        results.innerHTML = '';
        if (summary) {
          summary.textContent = '';
        }
        return;
      }
      var terms = keyword.split(/\s+/).filter(Boolean);
      var matches = movieSearchIndex.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          (item.tags || []).join(' '),
          item.oneLine
        ].join(' '));
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      }).slice(0, 120);
      results.innerHTML = matches.map(cardTemplate).join('');
      if (summary) {
        summary.textContent = matches.length ? '已为你找到相关影片' : '没有找到匹配的影片';
      }
    }

    render(query);
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('.movie-video'));
    videos.forEach(function (video) {
      var frame = video.closest('.video-frame');
      var overlay = frame ? frame.querySelector('.play-overlay') : null;
      var source = video.getAttribute('data-video-url');
      var hlsInstance = null;

      function loadVideo() {
        if (!source || video.dataset.loaded === '1') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        video.dataset.loaded = '1';
      }

      function playVideo() {
        loadVideo();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', playVideo);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initBackToTop();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
})();
