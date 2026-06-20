(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  var topButton = document.querySelector('.back-to-top');

  if (topButton) {
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }

      showSlide(index);
      startSlides();
    });
  });

  startSlides();

  var filterInput = document.querySelector('.page-filter-input');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-buttons button'));
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('.filter-list .movie-card, .filter-list .ranking-row'));
  var currentFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(item) {
    return normalize([
      item.getAttribute('data-title'),
      item.getAttribute('data-region'),
      item.getAttribute('data-type'),
      item.getAttribute('data-year'),
      item.getAttribute('data-tags'),
      item.textContent
    ].join(' '));
  }

  function applyFilter() {
    if (!filterItems.length) {
      return;
    }

    var query = filterInput ? normalize(filterInput.value) : '';
    var filter = normalize(currentFilter);

    filterItems.forEach(function (item) {
      var haystack = cardText(item);
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesFilter = filter === 'all' || haystack.indexOf(filter) !== -1;
      item.classList.toggle('is-hidden-card', !(matchesQuery && matchesFilter));
    });
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';

    if (queryValue) {
      filterInput.value = queryValue;
    }

    filterInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });

      button.classList.add('is-active');
      currentFilter = button.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });

  applyFilter();
})();
