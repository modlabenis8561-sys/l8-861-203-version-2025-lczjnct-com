(function () {
    var body = document.body;
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var show = function (target) {
            if (!slides.length) return;
            slides[index].classList.remove('is-active');
            index = (target + slides.length) % slides.length;
            slides[index].classList.add('is-active');
        };
        if (prev) prev.addEventListener('click', function () { show(index - 1); });
        if (next) next.addEventListener('click', function () { show(index + 1); });
        setInterval(function () { show(index + 1); }, 5600);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var input = filterPanel.querySelector('[data-filter-input]');
        var genre = filterPanel.querySelector('[data-filter-genre]');
        var year = filterPanel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-filter-empty]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) input.value = q;
        var apply = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var genreValue = genre ? genre.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var hay = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.tags].join(' ').toLowerCase();
                var okKeyword = !keyword || hay.indexOf(keyword) !== -1;
                var okGenre = !genreValue || (card.dataset.genre || '').indexOf(genreValue) !== -1;
                var okYear = !yearValue || card.dataset.year === yearValue;
                var ok = okKeyword && okGenre && okYear;
                card.style.display = ok ? '' : 'none';
                if (ok) visible += 1;
            });
            if (empty) empty.classList.toggle('is-visible', visible === 0);
        };
        ['input', 'change'].forEach(function (eventName) {
            if (input) input.addEventListener(eventName, apply);
            if (genre) genre.addEventListener(eventName, apply);
            if (year) year.addEventListener(eventName, apply);
        });
        apply();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input && !input.value.trim()) {
                event.preventDefault();
                input.focus();
            }
        });
    });
})();
