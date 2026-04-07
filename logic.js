const url = window.top.location.hash.substr(1);
const params = new URLSearchParams(window.top.location.search);

const videoUrlElement = document.getElementById("video-url");
videoUrlElement.setAttribute("href", url);
videoUrlElement.textContent = url;

function applyInitialPosition(player) {
  const timeParam = params.get('t');

  if (timeParam !== null) {
    const seconds = Number(timeParam);
    if (!Number.isNaN(seconds) && seconds >= 0) {
      player.currentTime(seconds);
    }
  }
}

function startTimeUrlSync(player) {
  let lastSyncedSecond = null;

  function syncCurrentTimeToUrl() {
    const currentSecond = Math.floor(player.currentTime());
    if (currentSecond === lastSyncedSecond) {
      return;
    }

    lastSyncedSecond = currentSecond;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('t', String(currentSecond));
    window.history.replaceState(null, '', nextUrl.toString());
  }

  window.setInterval(() => {
    if (player.paused()) {
      return;
    }

    syncCurrentTimeToUrl();
  }, 1000);

  player.on('seeked', syncCurrentTimeToUrl);
  player.on('pause', syncCurrentTimeToUrl);
}

if (url != "") {
  console.log("Video url found");
  if (!url.startsWith("https://") || !url.startsWith("http://")) {
    console.log("Prepending url with my home-blob", url);
    url = "https://aleksandrvin-pub.s3.eu-central-003.backblazeb2.com/" + url;
    console.log("Result", url);
  }
  window.addEventListener("load", (event) => {
    console.log("page loaded");
    const player = videojs('my-video');
    player.src(url);
    player.one('loadedmetadata', () => {
      applyInitialPosition(player);
      startTimeUrlSync(player);
    });

    const noUrlSection = document.getElementById('video-elem');
    noUrlSection.removeAttribute("hidden");
  });
} else {
  console.log("No url found");

  const mainSection = document.getElementById("main-section");
  mainSection.setAttribute("hidden", true);

  const noUrlSection = document.getElementById("no-url-section");
  noUrlSection.removeAttribute("hidden");
}
