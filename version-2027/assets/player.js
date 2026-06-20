(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector(".player-status");
      var source = player.getAttribute("data-source");
      var hasLoaded = false;
      var hls = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function loadSource() {
        if (!video || !source || hasLoaded) {
          return;
        }

        hasLoaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放加载异常，请稍后重试");
            }
          });
          return;
        }

        video.src = source;
        video.load();
      }

      function startPlayback() {
        if (!video) {
          return;
        }

        loadSource();

        if (button) {
          button.classList.add("is-hidden");
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
            setStatus("点击播放器继续播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!hasLoaded) {
            startPlayback();
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
          setStatus("");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 && button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    });
  });
})();
