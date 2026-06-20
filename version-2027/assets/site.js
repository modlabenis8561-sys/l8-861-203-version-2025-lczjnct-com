(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.visibility = "hidden";
      });
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;

      function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function start() {
        if (slides.length > 1) {
          timer = window.setInterval(function () {
            show(active + 1);
          }, 5000);
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(index);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector("[data-filter-search]");
      var typeSelect = root.querySelector("[data-filter-type]");
      var yearSelect = root.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-list] [data-search-text]"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function matchesYear(cardYear, selectedYear) {
        if (!selectedYear) {
          return true;
        }
        if (selectedYear === "2019") {
          var number = parseInt(cardYear, 10);
          return !Number.isNaN(number) && number <= 2019;
        }
        return cardYear === selectedYear;
      }

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        var selectedType = normalize(typeSelect ? typeSelect.value : "");
        var selectedYear = normalize(yearSelect ? yearSelect.value : "");

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search-text"));
          var type = normalize(card.getAttribute("data-type"));
          var year = normalize(card.getAttribute("data-year"));
          var visible = true;

          if (query && text.indexOf(query) === -1) {
            visible = false;
          }

          if (selectedType && type.indexOf(selectedType) === -1) {
            visible = false;
          }

          if (!matchesYear(year, selectedYear)) {
            visible = false;
          }

          card.classList.toggle("is-filtered-out", !visible);
        });
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });
  });
})();
