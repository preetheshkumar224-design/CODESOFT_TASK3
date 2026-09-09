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
const addCurrentToPlaylistButton = document.querySelector('#add-current-to-playlist');
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
const favoriteList = document.querySelector('#favorite-list');
const slideTrack = document.querySelector('.slides-track');
const slideLinks = document.querySelectorAll('[data-slide]');
const playlistLinks = document.querySelectorAll('[data-playlist]');
const playlistSlideTitle = document.querySelector('#playlist-slide-title');
const playlistSlideList = document.querySelector('#playlist-slide-list');

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
const playlistTracks = { 'Late night radio': [], 'Focus flow': [], 'Sunday morning': [] };

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
      <span class="queue-artwork"><img class="queue-thumb" src="${track.artwork}" alt="" /><i class="song-play-icon" data-play-track-index="${index}" data-lucide="play-circle"></i></span>
      <span class="queue-copy"><span class="queue-title">${track.title}</span><span class="queue-artist">${track.artist}</span></span>
      <span class="queue-album">${track.album}</span>
      <span class="queue-duration">${track.duration}</span>
      <span class="queue-add" data-add-track-index="${index}" role="button" tabindex="0" aria-label="Add ${track.title} to a playlist"><i data-lucide="bookmark-plus"></i></span>
      <span class="queue-heart ${track.favorite ? 'active' : ''}" data-favorite-index="${index}" aria-label="${track.favorite ? 'Remove from favorites' : 'Add to favorites'}"><i data-lucide="heart"></i></span>
      <span class="queue-remove" data-remove-index="${index}" role="button" tabindex="0" aria-label="Remove ${track.title} from queue"><i data-lucide="trash-2"></i></span>
    </button>
  `).join('');
  document.querySelector('#queue-count').textContent = `${String(tracks.length).padStart(2, '0')} tracks`;
  document.querySelector('#favorite-count').textContent = tracks.filter((track) => track.favorite).length;
  mobileFavoriteCount.textContent = tracks.filter((track) => track.favorite).length;
  renderFavorites();
  lucide.createIcons();
}

function renderFavorites() {
  const favorites = tracks.filter((track) => track.favorite);
  document.querySelector('#favorites-count').textContent = `${String(favorites.length).padStart(2, '0')} tracks`;
  favoriteList.innerHTML = favorites.length ? favorites.map((track) => {
    const index = tracks.indexOf(track);
    return `<button class="queue-item" type="button" data-favorite-track="${index}">
      <span class="queue-number">${String(index + 1).padStart(2, '0')}</span><span class="queue-artwork"><img class="queue-thumb" src="${track.artwork}" alt="" /><i class="song-play-icon" data-play-track-index="${index}" data-lucide="play-circle"></i></span>
      <span class="queue-copy"><span class="queue-title">${track.title}</span><span class="queue-artist">${track.artist}</span></span>
      <span class="queue-album">${track.album}</span><span class="queue-duration">${track.duration}</span>
      <span class="queue-heart active"><i data-lucide="heart"></i></span><span></span>
    </button>`;
  }).join('') : '<p class="empty-state">Your favorite tracks will appear here.</p>';
}

function showSlide(name) {
  const slideNames = ['player', 'library', 'favorites', 'playlist'];
  const slideIndex = slideNames.indexOf(name);
  if (slideIndex < 0) return;
  slideTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
  slideLinks.forEach((link) => link.classList.toggle('active', link.dataset.slide === name));
  document.querySelector('.breadcrumbs strong').textContent = name === 'player' ? 'Now playing' : name === 'library' ? 'Your library' : name === 'favorites' ? 'Favorites' : playlistSlideTitle.textContent;
  history.replaceState(null, '', `#${name === 'player' ? 'player' : name === 'library' ? 'queue' : name === 'favorites' ? 'favorites' : 'playlist'}`);
}

function showPlaylist(name) {
  playlistSlideTitle.textContent = name;
  const savedTracks = playlistTracks[name] || [];
  playlistSlideList.innerHTML = savedTracks.length ? savedTracks.map((index) => {
    const track = tracks[index];
    return `<button class="queue-item" type="button" data-playlist-track="${index}">
    <span class="queue-number">${String(index + 1).padStart(2, '0')}</span><span class="queue-artwork"><img class="queue-thumb" src="${track.artwork}" alt="" /><i class="song-play-icon" data-play-track-index="${index}" data-lucide="play-circle"></i></span>
    <span class="queue-copy"><span class="queue-title">${track.title}</span><span class="queue-artist">${track.artist}</span></span>
    <span class="queue-album">${track.album}</span><span class="queue-duration">${track.duration}</span><span></span><span></span>
  </button>`;
  }).join('') : '<p class="empty-state">Add songs from Your library to build this playlist.</p>';
  lucide.createIcons();
  showSlide('playlist');
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
addCurrentToPlaylistButton.addEventListener('click', () => addTrackToPlaylist(currentIndex));
queueList.addEventListener('click', (event) => { const playTarget = event.target.closest('[data-play-track-index]'); if (playTarget) { event.stopPropagation(); loadTrack(Number(playTarget.dataset.playTrackIndex), true); return; } const favoriteTarget = event.target.closest('[data-favorite-index]'); if (favoriteTarget) { event.stopPropagation(); const index = Number(favoriteTarget.dataset.favoriteIndex); tracks[index].favorite = !tracks[index].favorite; renderQueue(); return; } if (event.target.closest('[data-remove-index], [data-add-track-index]')) return; const item = event.target.closest('[data-index]'); if (item) { loadTrack(Number(item.dataset.index), true); showSlide('player'); } });
uploadInput.addEventListener('change', (event) => { const files = [...event.target.files]; files.forEach((file) => tracks.push({ title: file.name.replace(/\.[^/.]+$/, ''), artist: 'Local file', album: 'Your uploads', duration: '--:--', src: URL.createObjectURL(file), artwork: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80', favorite: false })); if (files.length) { loadTrack(tracks.length - files.length); showToast(`${files.length} track${files.length === 1 ? '' : 's'} added to queue`); } uploadInput.value = ''; });
function addPlaylist(name) {
  const cleanName = name.trim();
  if (!cleanName || playlists.includes(cleanName)) return false;
  playlists.push(cleanName);
  playlistTracks[cleanName] = [];
  const rowWrapper = document.createElement('div');
  rowWrapper.className = 'playlist-row-wrapper';
  rowWrapper.dataset.playlist = cleanName;
  rowWrapper.innerHTML = `<button class="playlist-row" type="button" data-playlist="${cleanName}"><span class="playlist-dot violet"></span><span>${cleanName}</span></button><button class="playlist-delete" type="button" data-delete-playlist="${cleanName}" aria-label="Delete ${cleanName}"><i data-lucide="trash-2"></i></button>`;
  playlistList.appendChild(rowWrapper);
  rowWrapper.querySelector('[data-playlist]').addEventListener('click', () => showPlaylist(cleanName));
  lucide.createIcons();
  return true;
}

function addTrackToPlaylist(index) {
  const name = window.prompt(`Add "${tracks[index].title}" to which playlist?`, playlists[0]);
  if (!name) return;
  if (!playlistTracks[name]) { showToast('Playlist not found'); return; }
  if (playlistTracks[name].includes(index)) { showToast('Song is already in that playlist'); return; }
  playlistTracks[name].push(index);
  if (playlistSlideTitle.textContent === name) showPlaylist(name);
  showToast(`Added to ${name}`);
}

document.querySelector('#clear-queue').addEventListener('click', () => { if (tracks.length <= 1) { showToast('Keep one track in the queue'); return; } tracks.splice(currentIndex + 1); renderQueue(); showToast('Up next cleared'); });
document.querySelector('#new-playlist').addEventListener('click', () => { const name = window.prompt('Name your new playlist'); if (name && addPlaylist(name)) showToast(`${name.trim()} created`); });
playlistList.addEventListener('click', (event) => { const deleteButton = event.target.closest('[data-delete-playlist]'); if (!deleteButton) return; event.stopPropagation(); const name = deleteButton.dataset.deletePlaylist; playlists = playlists.filter((playlist) => playlist !== name); delete playlistTracks[name]; deleteButton.closest('.playlist-row-wrapper').remove(); showToast(`${name} deleted`); });
queueList.addEventListener('click', (event) => { const addTarget = event.target.closest('[data-add-track-index]'); if (addTarget) { event.stopPropagation(); addTrackToPlaylist(Number(addTarget.dataset.addTrackIndex)); } });
addToPlaylistButton.addEventListener('click', () => { const name = window.prompt('Save this queue to which playlist?', playlists[0]); if (name && addPlaylist(name)) showToast(`Queue saved to ${name.trim()}`); else if (name) showToast(`Queue saved to ${name.trim()}`); });
favoriteList.addEventListener('click', (event) => { const playTarget = event.target.closest('[data-play-track-index]'); if (playTarget) { event.stopPropagation(); loadTrack(Number(playTarget.dataset.playTrackIndex), true); return; } const item = event.target.closest('[data-favorite-track]'); if (item) { loadTrack(Number(item.dataset.favoriteTrack), true); showSlide('player'); } });
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
slideLinks.forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); showSlide(link.dataset.slide); if (mobileDrawer.classList.contains('is-open')) setMobileDrawer(false); }));
playlistLinks.forEach((link) => link.addEventListener('click', () => { showPlaylist(link.dataset.playlist); if (mobileDrawer.classList.contains('is-open')) setMobileDrawer(false); }));
playlistSlideList.addEventListener('click', (event) => { const playTarget = event.target.closest('[data-play-track-index]'); if (playTarget) { event.stopPropagation(); loadTrack(Number(playTarget.dataset.playTrackIndex), true); return; } const item = event.target.closest('[data-playlist-track]'); if (item) { loadTrack(Number(item.dataset.playlistTrack), true); showSlide('player'); } });
document.querySelector('.queue-toggle').addEventListener('click', () => showSlide('library'));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && mobileDrawer.classList.contains('is-open')) setMobileDrawer(false); });
audio.addEventListener('play', () => setPlaying(true));
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('timeupdate', () => { if (audio.duration) { progress.value = (audio.currentTime / audio.duration) * 100; document.querySelector('#current-time').textContent = formatTime(audio.currentTime); document.querySelector('#duration').textContent = formatTime(audio.duration); updateProgressFill(); } });
audio.addEventListener('loadedmetadata', () => { document.querySelector('#duration').textContent = formatTime(audio.duration); });
audio.addEventListener('ended', () => { if (isRepeat) loadTrack(currentIndex, true); else nextTrack(); });

audio.volume = Number(volume.value);
updateMuteIcon();
loadTrack(0);
showSlide('player');
setPlaying(false);
lucide.createIcons();

function updateMuteIcon() {
  const icon = audio.muted || audio.volume === 0 ? 'volume-x' : audio.volume < 0.45 ? 'volume-1' : 'volume-2';
  muteButton.innerHTML = `<i data-lucide="${icon}"></i>`;
  muteButton.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
  lucide.createIcons();
}
