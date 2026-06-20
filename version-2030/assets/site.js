(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll('.search-form');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function show(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(activeIndex + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(activeIndex - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(activeIndex + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupCategoryFilter() {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        var count = document.querySelector('[data-filter-count]');
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') || '').toLowerCase();
                var matched = !query || text.indexOf(query) !== -1;
                card.classList.toggle('is-filter-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部影片';
            }
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.player-overlay');
            var source = player.getAttribute('data-video-url');
            var hlsInstance = null;
            var attached = false;

            function attachSource() {
                if (attached || !video || !source) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        }
                    });
                } else {
                    video.src = source;
                }
                video.setAttribute('controls', 'controls');
            }

            function play() {
                attachSource();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', function (event) {
                    event.preventDefault();
                    play();
                });
            }
            player.addEventListener('click', function (event) {
                if (event.target === player) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function setupSearchPage() {
        var results = document.getElementById('search-results');
        var status = document.getElementById('search-status');
        if (!results || !status || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var pageInput = document.querySelector('.large-search input[name="q"]');
        if (pageInput) {
            pageInput.value = query;
        }
        if (!query) {
            status.textContent = '输入关键词搜索影片。';
            return;
        }
        var lowerQuery = query.toLowerCase();
        var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
            return String(movie.text || '').toLowerCase().indexOf(lowerQuery) !== -1;
        }).slice(0, 120);
        status.textContent = '“' + query + '” 相关影片 ' + matched.length + ' 部';
        results.innerHTML = matched.map(function (movie) {
            return [
                '<article class="movie-card">',
                '    <a class="movie-card-link" href="' + escapeHtml(movie.url) + '">',
                '        <div class="poster-wrap">',
                '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '            <div class="poster-layer"><span class="play-dot">▶</span></div>',
                '            <span class="rating-badge">★ ' + escapeHtml(movie.rating) + '</span>',
                '        </div>',
                '        <div class="movie-card-body">',
                '            <h3>' + escapeHtml(movie.title) + '</h3>',
                '            <p>' + escapeHtml(movie.summary) + '</p>',
                '            <div class="movie-meta-line">',
                '                <span>' + escapeHtml(movie.year) + '</span>',
                '                <span>' + escapeHtml(movie.region) + '</span>',
                '            </div>',
                '            <div class="tag-row">',
                '                <span>' + escapeHtml(movie.category) + '</span>',
                '                <span>' + escapeHtml(movie.genre) + '</span>',
                '            </div>',
                '        </div>',
                '    </a>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupCategoryFilter();
        setupPlayers();
        setupSearchPage();
    });
}());
