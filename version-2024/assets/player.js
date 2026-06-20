(function () {
  var video = document.querySelector('.site-player');
  var button = document.querySelector('.player-start');
  var hlsInstance = null;

  if (!video) {
    return;
  }

  function attachStream() {
    var stream = video.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      }
    }
  }

  function startPlayback() {
    attachStream();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      }).catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    } else if (button) {
      button.classList.add('is-hidden');
    }
  }

  attachStream();

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });
})();
