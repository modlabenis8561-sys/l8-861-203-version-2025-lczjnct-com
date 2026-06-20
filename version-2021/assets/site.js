(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-site-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-slide-dot')));
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            } else {
                window.location.href = './search.html';
            }
        });
    });

    var cardFilter = document.querySelector('[data-card-filter]');
    if (cardFilter) {
        cardFilter.addEventListener('input', function () {
            var query = cardFilter.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
            cards.forEach(function (card) {
                var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
                card.classList.toggle('hidden', query && haystack.indexOf(query) === -1);
            });
        });
    }

    var searchInput = document.querySelector('.page-search input[name="q"]');
    var searchRoot = document.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput) {
        searchInput.value = initialQuery;
    }

    function safe(value) {
        return String(value || '').replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    function renderResults(query) {
        if (!searchRoot || !window.SEARCH_INDEX) {
            return;
        }
        var keyword = query.trim().toLowerCase();
        if (!keyword) {
            searchRoot.innerHTML = '<div class="empty-state">输入关键词查找影片</div>';
            return;
        }
        var results = window.SEARCH_INDEX.filter(function (item) {
            return item.text.toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 180);
        if (!results.length) {
            searchRoot.innerHTML = '<div class="empty-state">没有匹配内容</div>';
            return;
        }
        searchRoot.innerHTML = '<div class="movie-grid wide">' + results.map(function (item) {
            return '<article class="movie-card">' +
                '<a class="card-poster" href="./' + safe(item.file) + '">' +
                    '<img src="' + safe(item.cover) + '" alt="' + safe(item.title) + '" loading="lazy">' +
                    '<span class="card-play">▶</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<h3><a href="./' + safe(item.file) + '">' + safe(item.title) + '</a></h3>' +
                    '<p>' + safe(item.oneLine) + '</p>' +
                    '<div class="card-meta"><a href="./' + safe(item.categoryFile) + '">' + safe(item.category) + '</a><span>' + safe(item.year) + '</span></div>' +
                '</div>' +
            '</article>';
        }).join('') + '</div>';
    }

    if (searchRoot) {
        renderResults(initialQuery);
    }
})();
