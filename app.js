const audio = document.querySelector('#audio');
const playButton = document.querySelector('#play-button');
const progress = document.querySelector('#progress');
const volume = document.querySelector('#volume');
const muteButton = document.querySelector('#mute-button');
const previousButton = document.querySelector('#previous-button');
const nextButton = document.querySelector('#next-button');
const shuffleButton = document.querySelector('#shuffle-button');
const repeatButton = document.querySelector('#repeat-button');
const favoriteButton = document.querySelector('#favorite-button');
const uploadInput = document.querySelector('#audio-upload');
const queueList = document.querySelector('#queue-list');
const toast = document.querySelector('#toast');
const playlistList = document.querySelector('.playlist-list');
const addToPlaylistButton = document.querySelector('#add-to-playlist');
const mobileMenuButton = document.querySelector('#mobile-menu-button');
const mobileCloseButton = document.querySelector('#mobile-close-button');
const mobileDrawer = document.querySelector('#mobile-drawer');
const mobileDrawerBackdrop = document.querySelector('#mobile-drawer-backdrop');
const mobileFavoriteCount = document.querySelector('#mobile-favorite-count');

const tracks = [
  { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming', duration: '04:03', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80', favorite: false },
  { title: 'The Less I Know', artist: 'Tame Impala', album: 'Currents', duration: '03:36', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', artwork: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80', favorite: false },
  { title: 'Intro', artist: 'The xx', album: 'xx', duration: '02:07', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80', favorite: true },
  { title: 'Something About Us', artist: 'Daft Punk', album: 'Discovery', duration: '03:51', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', artwork: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80', favorite: false },
  { title: 'Sunset Lover', artist: 'Petit Biscuit', album: 'Presence', duration: '03:58', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', artwork: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=80', favorite: false },
  { title: 'Radhimaa', artist: 'Radhimaa', album: 'New release', duration: '04:12', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', artwork: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80', favorite: false }
];

let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;
let lastVolume = 0.72;
let toastTimer;
let playlists = ['Late night radio', 'Focus flow', 'Sunday morning'];

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes.toString().padStart(2, '0')}:${remainder}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

function renderQueue() {
  queueList.innerHTML = tracks.map((track, index) => `
    <button class="queue-item ${index === currentIndex ? 'current' : ''}" type="button" data-index="${index}">
      <span class="queue-number"><span class="queue-number-text">${String(index + 1).padStart(2, '0')}</span><span class="queue-playing" aria-label="Playing"><i></i><i></i><i></i></span></span>
      <img class="queue-thumb" src="${track.artwork}" alt="" />
      <span class="queue-copy"><span class="queue-title">${track.title}</span><span class="queue-artist">${track.artist}</span></span>
      <span class="queue-album">${track.album}</span>
      <span class="queue-duration">${track.duration}</span>
      <span class="queue-heart ${track.favorite ? 'active' : ''}" data-favorite-index="${index}" aria-label="${track.favorite ? 'Remove from favorites' : 'Add to favorites'}"><i data-lucide="heart"></i></span>
      <span class="queue-remove" data-remove-index="${index}" role="button" tabindex="0" aria-label="Remove ${track.title} from queue"><i data-lucide="trash-2"></i></span>
    </button>
  `).join('');
  document.querySelector('#queue-count').textContent = `${String(tracks.length).padStart(2, '0')} tracks`;
  document.querySelector('#favorite-count').textContent = tracks.filter((track) => track.favorite).length;
  mobileFavoriteCount.textContent = tracks.filter((track) => track.favorite).length;
  lucide.createIcons();
}

function updateFavoriteState() {
  const isFavorite = tracks[currentIndex].favorite;
  favoriteButton.classList.toggle('active', isFavorite);
  favoriteButton.setAttribute('aria-pressed', String(isFavorite));
  favoriteButton.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');
}

function loadTrack(index, shouldPlay = false) {
  currentIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentIndex];
  audio.src = track.src;
  document.querySelector('#album-art').src = track.artwork;
  document.querySelector('#album-art').alt = `${track.title} album artwork`;
  document.querySelector('#track-title').textContent = track.title;
  document.querySelector('#track-artist').textContent = track.artist;
  document.querySelector('#track-album').textContent = track.album;
  document.querySelector('#track-number').textContent = String(currentIndex + 1).padStart(2, '0');
  document.querySelector('#track-meta').textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}`;
  document.querySelector('#duration').textContent = track.duration;
  progress.value = 0;
  updateProgressFill();
  updateFavoriteState();
  renderQueue();
  if (shouldPlay) audio.play().catch(() => showToast('Press play to start this track'));
}

function updateProgressFill() {
  const percent = Number(progress.value) || 0;
  progress.style.background = `linear-gradient(to right, var(--ink) 0%, var(--ink) ${percent}%, var(--line) ${percent}%, var(--line) 100%)`;
}

function setPlaying(isPlaying) {
  playButton.innerHTML = `<i data-lucide="${isPlaying ? 'pause' : 'play'}"></i>`;
  playButton.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  document.querySelector('#visualizer').classList.toggle('paused', !isPlaying);
  document.querySelector('#artwork-frame').classList.toggle('is-playing', isPlaying);
  lucide.createIcons();
}

function nextTrack() {
  if (isShuffle && tracks.length > 1) {
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) nextIndex = Math.floor(Math.random() * tracks.length);
    loadTrack(nextIndex, true);
    return;
  }
  loadTrack(currentIndex + 1, true);
}

playButton.addEventListener('click', () => {
  if (audio.paused) audio.play().catch(() => showToast('This audio source could not be loaded')); else audio.pause();
});
previousButton.addEventListener('click', () => {
  if (audio.currentTime > 3) audio.currentTime = 0; else loadTrack(currentIndex - 1, true);
});
nextButton.addEventListener('click', nextTrack);
shuffleButton.addEventListener('click', () => { isShuffle = !isShuffle; shuffleButton.classList.toggle('active', isShuffle); shuffleButton.setAttribute('aria-pressed', String(isShuffle)); showToast(isShuffle ? 'Shuffle on' : 'Shuffle off'); });
repeatButton.addEventListener('click', () => { isRepeat = !isRepeat; repeatButton.classList.toggle('active', isRepeat); repeatButton.setAttribute('aria-pressed', String(isRepeat)); showToast(isRepeat ? 'Repeat on' : 'Repeat off'); });
progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration; updateProgressFill(); });
volume.addEventListener('input', () => { audio.volume = Number(volume.value); lastVolume = audio.volume; audio.muted = audio.volume === 0; updateMuteIcon(); });
muteButton.addEventListener('click', () => { audio.muted = !audio.muted; if (!audio.muted && audio.volume === 0) { audio.volume = lastVolume || 0.72; volume.value = audio.volume; } updateMuteIcon(); });
favoriteButton.addEventListener('click', () => { tracks[currentIndex].favorite = !tracks[currentIndex].favorite; updateFavoriteState(); renderQueue(); showToast(tracks[currentIndex].favorite ? 'Added to favorites' : 'Removed from favorites'); });
queueList.addEventListener('click', (event) => { const favoriteTarget = event.target.closest('[data-favorite-index]'); if (favoriteTarget) { event.stopPropagation(); const index = Number(favoriteTarget.dataset.favoriteIndex); tracks[index].favorite = !tracks[index].favorite; renderQueue(); return; } if (event.target.closest('[data-remove-index]')) return; const item = event.target.closest('[data-index]'); if (item) loadTrack(Number(item.dataset.index), true); });
uploadInput.addEventListener('change', (event) => { const files = [...event.target.files]; files.forEach((file) => tracks.push({ title: file.name.replace(/\.[^/.]+$/, ''), artist: 'Local file', album: 'Your uploads', duration: '--:--', src: URL.createObjectURL(file), artwork: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80', favorite: false })); if (files.length) { loadTrack(tracks.length - files.length); showToast(`${files.length} track${files.length === 1 ? '' : 's'} added to queue`); } uploadInput.value = ''; });
function addPlaylist(name) {
  const cleanName = name.trim();
  if (!cleanName || playlists.includes(cleanName)) return false;
  playlists.push(cleanName);
  const row = document.createElement('button');
  row.className = 'playlist-row';
  row.type = 'button';
  row.innerHTML = `<span class="playlist-dot violet"></span><span>${cleanName}</span>`;
  row.addEventListener('click', () => showToast(`${cleanName} selected`));
  playlistList.appendChild(row);
  return true;
}

document.querySelector('#clear-queue').addEventListener('click', () => { if (tracks.length <= 1) { showToast('Keep one track in the queue'); return; } tracks.splice(currentIndex + 1); renderQueue(); showToast('Up next cleared'); });
document.querySelector('#new-playlist').addEventListener('click', () => { const name = window.prompt('Name your new playlist'); if (name && addPlaylist(name)) showToast(`${name.trim()} created`); });
addToPlaylistButton.addEventListener('click', () => { const name = window.prompt('Save this queue to which playlist?', playlists[0]); if (name && addPlaylist(name)) showToast(`Queue saved to ${name.trim()}`); else if (name) showToast(`Queue saved to ${name.trim()}`); });
queueList.addEventListener('click', (event) => { const removeTarget = event.target.closest('[data-remove-index]'); if (!removeTarget) return; event.stopPropagation(); const index = Number(removeTarget.dataset.removeIndex); if (tracks.length <= 1) { showToast('Keep one track in the queue'); return; } tracks.splice(index, 1); if (index < currentIndex) currentIndex -= 1; else if (index === currentIndex) { currentIndex = Math.min(currentIndex, tracks.length - 1); loadTrack(currentIndex); return; } renderQueue(); showToast('Removed from queue'); });
function setMobileDrawer(isOpen) {
  mobileDrawer.classList.toggle('is-open', isOpen);
  mobileDrawerBackdrop.classList.toggle('is-visible', isOpen);
  mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
  mobileMenuButton.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('drawer-open', isOpen);
  if (isOpen) mobileCloseButton.focus(); else mobileMenuButton.focus();
}

mobileMenuButton.addEventListener('click', () => setMobileDrawer(true));
mobileCloseButton.addEventListener('click', () => setMobileDrawer(false));
mobileDrawerBackdrop.addEventListener('click', () => setMobileDrawer(false));
mobileDrawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMobileDrawer(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && mobileDrawer.classList.contains('is-open')) setMobileDrawer(false); });
audio.addEventListener('play', () => setPlaying(true));
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('timeupdate', () => { if (audio.duration) { progress.value = (audio.currentTime / audio.duration) * 100; document.querySelector('#current-time').textContent = formatTime(audio.currentTime); document.querySelector('#duration').textContent = formatTime(audio.duration); updateProgressFill(); } });
audio.addEventListener('loadedmetadata', () => { document.querySelector('#duration').textContent = formatTime(audio.duration); });
audio.addEventListener('ended', () => { if (isRepeat) loadTrack(currentIndex, true); else nextTrack(); });

audio.volume = Number(volume.value);
updateMuteIcon();
loadTrack(0);
setPlaying(false);
lucide.createIcons();

function updateMuteIcon() {
  const icon = audio.muted || audio.volume === 0 ? 'volume-x' : audio.volume < 0.45 ? 'volume-1' : 'volume-2';
  muteButton.innerHTML = `<i data-lucide="${icon}"></i>`;
  muteButton.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
  lucide.createIcons();
}
