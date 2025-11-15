const coverImg = document.getElementById('coverImg');
const titleElem = document.getElementById('title');
const authorElem = document.getElementById('author');
const playBtn = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const PB = document.getElementById('PreviousBtn');
const volumeControl = document.getElementById('volumeControl');
const loopBtn = document.getElementById('loopBtn');
const progressBar = document.getElementById('progressBar');
const timeDisplay = document.getElementById('timeDisplay');

let audio = new Audio();
let currentIndex = 0;
let isPlaying = false;
let isLooping = false;

const tracks = window.api.getTracks();

async function loadTrack(index) {
  if (!tracks?.length || index < 0 || index >= tracks.length) return;

  const trackPath = tracks[index];
  audio.src = `file://${trackPath}`;
  audio.load();

  // Do NOT reset isPlaying here to preserve play state on track change

  try {
    const tags = await window.api.readCover(trackPath);
    titleElem.textContent = tags.title || trackPath.split(path.sep).pop().replace('.mp3', '');
    authorElem.textContent = tags.artist || 'Unknown Artist';

    if (tags.picture) {
      const picture = tags.picture;
      let base64String = '';
      for (let i = 0; i < picture.data.length; i++) {
        base64String += String.fromCharCode(picture.data[i]);
      }
      coverImg.src = `data:${picture.format};base64,${window.btoa(base64String)}`;
    } else {
      coverImg.src = 'Images/Placeholder.jpg';
    }
  } catch (err) {
    console.error('Failed to read cover:', err);
    coverImg.src = 'Images/Placeholder.jpg';
    titleElem.textContent = trackPath.split(path.sep).pop().replace('.mp3', '');
    authorElem.textContent = 'Unknown Artist';
  }
}

function togglePlay() {
  if (!isPlaying) {
    audio.play()
      .then(() => {
        isPlaying = true;
        playBtn.src = 'Images/pause.png';
      })
      .catch(e => {
        console.error('Play failed:', e);
      });
  } else {
    audio.pause();
    isPlaying = false;
    playBtn.src = 'Images/play.png';
  }
}

function nextTrack() {
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex);
  if (isPlaying) {
    audio.play().catch(console.error);
  }
}

function PreviousTrack() {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentIndex);
  if (isPlaying) {
    audio.play().catch(console.error);
  }
}

window.addEventListener('keydown', (event) => {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

  if (event.code === 'Space' || event.keyCode === 32) {
    event.preventDefault();
    togglePlay();
  }
});

audio.addEventListener('ended', () => {
  if (!isLooping) {
    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack(currentIndex);
    audio.play().catch(console.error);
  }
});

volumeControl.addEventListener('input', () => {
  audio.volume = parseFloat(volumeControl.value);
});

loopBtn.addEventListener('click', () => {
  isLooping = !isLooping;
  audio.loop = isLooping;
  loopBtn.textContent = isLooping ? 'Loop: On' : 'Loop: Off';
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent;

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    };

    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  }
});

progressBar.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
PB.addEventListener('click', PreviousTrack);

// Load the initial track
if (tracks.length > 0) {
  loadTrack(currentIndex);
}
