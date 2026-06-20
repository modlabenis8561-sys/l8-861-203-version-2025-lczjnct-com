(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', navMenu.classList.contains('is-open'));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === active);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterType = document.querySelector('[data-filter-type]');
    var filterRegion = document.querySelector('[data-filter-region]');
    var filterYear = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var status = document.querySelector('[data-search-status]');
    var empty = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = normalize(filterInput ? filterInput.value : '');
        var type = normalize(filterType ? filterType.value : '');
        var region = normalize(filterRegion ? filterRegion.value : '');
        var year = normalize(filterYear ? filterYear.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags')
            ].join(' '));
            var ok = true;
            if (query && haystack.indexOf(query) === -1) {
                ok = false;
            }
            if (type && normalize(card.getAttribute('data-type')) !== type) {
                ok = false;
            }
            if (region && normalize(card.getAttribute('data-region')) !== region) {
                ok = false;
            }
            if (year && normalize(card.getAttribute('data-year')) !== year) {
                ok = false;
            }
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (status) {
            status.textContent = visible === cards.length ? '正在展示全部影片' : '已匹配 ' + visible + ' 部影片';
        }
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    [filterInput, filterType, filterRegion, filterYear].forEach(function (element) {
        if (element) {
            element.addEventListener('input', applyFilters);
            element.addEventListener('change', applyFilters);
        }
    });

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
        }
        applyFilters();
    }
})();
