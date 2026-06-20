document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-mobile-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-slide-to") || "0", 10);
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  });

  function applyFilter(panel) {
    var section = panel.closest("section") || document;
    var input = panel.querySelector(".filter-input");
    var yearSelect = panel.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-card"));
    var query = input ? input.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-category") || "",
        card.getAttribute("data-year") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
      var yearMatches = !year || card.getAttribute("data-year") === year;
      var queryMatches = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle("is-hidden", !(yearMatches && queryMatches));
    });
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var input = panel.querySelector(".filter-input");
    var yearSelect = panel.querySelector(".filter-year");

    if (input) {
      input.addEventListener("input", function () {
        applyFilter(panel);
      });
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", function () {
        applyFilter(panel);
      });
    }
  });

  var searchParams = new URLSearchParams(window.location.search);
  var query = searchParams.get("q") || "";

  if (query) {
    document.querySelectorAll(".search-page-input, .filter-input").forEach(function (input) {
      input.value = query;
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      applyFilter(panel);
    });
  }

  document.querySelectorAll(".player-overlay").forEach(function (button) {
    button.addEventListener("click", function () {
      startMoviePlayback(button);
    });
  });

  document.querySelectorAll(".player-wrap video").forEach(function (video) {
    video.addEventListener("click", function () {
      var wrap = video.closest(".player-wrap");
      var button = wrap ? wrap.querySelector(".player-overlay") : null;

      if (button && !button.classList.contains("is-hidden")) {
        startMoviePlayback(button);
      }
    });
  });
});

function startMoviePlayback(button) {
  var wrap = button.closest(".player-wrap");
  var video = wrap ? wrap.querySelector("video") : null;
  var source = button.getAttribute("data-video-url");

  if (!video || !source) {
    return;
  }

  button.classList.add("is-hidden");
  video.controls = true;

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    if (video.src !== source) {
      video.src = source;
    }

    video.play().catch(function () {});
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    if (video.hlsInstance) {
      video.hlsInstance.destroy();
    }

    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    video.hlsInstance = hls;
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function () {});
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        hls.destroy();
        video.src = source;
        video.play().catch(function () {});
      }
    });
    return;
  }

  video.src = source;
  video.play().catch(function () {});
}
