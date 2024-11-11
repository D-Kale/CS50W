import { likeItem, fetchPlaylist } from "./fetch.js";

function loadLikes() {
    const savedLikes = localStorage.getItem('likes');
    return savedLikes ? JSON.parse(savedLikes) : { songs: {}, playlists: {} };
}

function saveLikes(likes) {
    localStorage.setItem('likes', JSON.stringify(likes));
}

let likes = loadLikes();

export function displaySongs(content, songs) {
    content.innerHTML = '<h2 class="text-2xl font-bold mb-4">Canciones</h2>';
    if (!Array.isArray(songs)) {
        content.innerHTML += '<p class="text-spotify-gray">No se encontraron canciones.</p>';
        return;
    }
    songs.forEach(song => {
        const songCard = createSongCard(song);
        content.appendChild(songCard);
    });
}

export function displayPlaylists(content, playlists) {
    content.innerHTML = '<h2 class="playlist-header">Playlists</h2>';
    playlists.forEach(playlist => {
        const isLiked = likes.playlists[playlist.id];
        content.innerHTML += `
            <div class="playlist-card" data-id="${playlist.id}">
                <div class="playlist-info">
                    <h3 class="playlist-title">${playlist.name}</h3>
                    <p class="playlist-creator">Creador: ${playlist.user}</p>
                    <p class="playlist-duration">Duración: ${formatDuration(playlist.duration)}</p>
                    <p class="playlist-likes">Likes: <span>${playlist.likes}</span></p>
                </div>
                <div class="playlist-actions">
                    <button class="playlist-like-btn like-btn ${isLiked ? 'liked' : ''}" aria-label="Me gusta">
                        <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    </button>
                    <button class="view-playlist-btn">Ver playlist</button>
                </div>
            </div>
        `;
    });

    // Añadir event listeners después de renderizar
    document.querySelectorAll(".view-playlist-btn").forEach(button => {
        const playlistId = button.closest(".playlist-card").dataset.id;
        button.addEventListener("click", () => viewPlaylist(playlistId));
    });

    document.querySelectorAll(".playlist-like-btn").forEach(button => {
        const playlistId = button.closest(".playlist-card").dataset.id;
        button.addEventListener("click", () => toggleLikePlaylist(playlistId, button));
    });
}

// Toggle para cambiar el estado de like de la playlist
function toggleLikePlaylist(playlistId, button) {
    const likesSpan = button.closest('.playlist-card').querySelector('.playlist-likes span');
    const currentLikes = parseInt(likesSpan.textContent);

    if (likes.playlists[playlistId]) {
        // Unlike
        likes.playlists[playlistId] = false;
        button.classList.remove('liked');
        button.querySelector('i').classList.replace('bi-heart-fill', 'bi-heart');
        likesSpan.textContent = currentLikes - 1;
    } else {
        // Like
        likes.playlists[playlistId] = true;
        button.classList.add('liked');
        button.querySelector('i').classList.replace('bi-heart', 'bi-heart-fill');
        likesSpan.textContent = currentLikes + 1;
    }

    saveLikes(likes);
    likeItem('Playlist', playlistId);
}

// Mostrar detalles de la playlist
function viewPlaylist(playlistId) {
    fetchPlaylist(playlistId)
        .then(data => {
            displayPlaylistDetails(data.playlist);
        })
        .catch(error => console.error('Error:', error));
}

// Mostrar los detalles de la playlist seleccionada
function displayPlaylistDetails(playlist) {
    const content = document.querySelector('#content');
    content.innerHTML = `
        <h2 class="playlist-header">${playlist.name}</h2>
        <div class="playlist-details">
            <p class="playlist-creator">Creador: ${playlist.user}</p>
            <p class="playlist-duration">Duración: ${formatDuration(playlist.duration)}</p>
            <p class="playlist-likes">Likes: ${playlist.likes}</p>
        </div>
        <h3 class="songs-header">Canciones:</h3>
        <ul class="song-list">
            ${
                Array.isArray(playlist.songs)
                    ? playlist.songs.map(song => `
                        <li class="song-item">
                            <span class="song-name">${song.name}</span>
                            <span class="song-artist">${song.artist}</span>
                            <span class="song-duration">${formatDuration(song.duration)}</span>
                        </li>
                    `).join('')
                    : '<p>No hay canciones en esta playlist.</p>'
            }
        </ul>
    `;
}

// Crear tarjeta de canción
function createSongCard(song) {
    const isLiked = likes.songs[song.id];
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
        <div class="top">
            <div class="texts">
                <p class="title-1">${song.name}</p>
                <p class="title-2">${song.artist}</p>
            </div>
        </div>

        <div class="controls">
            <button class="rewind-btn" aria-label="Retroceder 5 segundos">
                <i class="bi bi-skip-backward"></i>
            </button>

            <button class="play-btn" aria-label="Reproducir">
                <i class="bi bi-play-fill"></i>
            </button>

            <button class="forward-btn" aria-label="Adelantar 5 segundos">
                <i class="bi bi-skip-forward"></i>
            </button>

            <button class="like-btn ${isLiked ? 'liked' : ''}" aria-label="Me gusta">
                <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
            </button>
        </div>

        <div class="time">
            <div class="elapsed"></div>
        </div>
        <div class="timetext">
            <span class="time-now">0:00</span>
            <span class="time-full">${formatDuration(song.duration) || '0:00'}</span>
        </div>
        <audio src="${song.file_url}"></audio>
    `;

    const audio = card.querySelector('audio');
    const playBtn = card.querySelector('.play-btn');
    const rewindBtn = card.querySelector('.rewind-btn');
    const forwardBtn = card.querySelector('.forward-btn');
    const likeBtn = card.querySelector('.like-btn');
    const elapsed = card.querySelector('.elapsed');
    const timeNow = card.querySelector('.time-now');

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
    });

    rewindBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
    });

    forwardBtn.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
    });

    likeBtn.addEventListener('click', () => toggleLikeSong(song.id, likeBtn));

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        elapsed.style.width = `${progress}%`;
        timeNow.textContent = formatTime(audio.currentTime);
    });

    return card;
}

// Toggle para cambiar el estado de like de la canción
function toggleLikeSong(songId, button) {
    if (likes.songs[songId]) {
        // Unlike
        likes.songs[songId] = false;
        button.classList.remove('liked');
        button.querySelector('i').classList.replace('bi-heart-fill', 'bi-heart');
    } else {
        // Like
        likes.songs[songId] = true;
        button.classList.add('liked');
        button.querySelector('i').classList.replace('bi-heart', 'bi-heart-fill');
    }

    saveLikes(likes);
    likeItem('Song', songId);
}

// Función para formatear el tiempo
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Función para formatear la duración de la canción o playlist
function formatDuration(duration) {
    const [hours, minutes, secondsWithMs] = duration.split(':');
    
    const seconds = secondsWithMs.split('.')[0];

    if (parseInt(hours) === 0) {
        return `${minutes}:${seconds.padStart(2, '0')}`;
    }

    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
}


export function updateLikes(data, id, type) {
    if (data.success) {
        const likesElement = document.querySelector(`${type}-likes-${id}`);
        if (likesElement) {
            likesElement.textContent = data.likes;
        }
        alert(data.success);
    } else {
        alert(data.error);
    }
}

// Esta función se encarga de "dar me gusta" a una canción
export function likeSong(songId) {
    likeItem('Song', songId).then(data => updateLikes(data, songId, 'song')).catch(console.error);
}

// Esta función se encarga de "dar me gusta" a una playlist
export function likePlaylist(playlistId) {
    likeItem('Playlist', playlistId).then(data => updateLikes(data, playlistId, 'playlist')).catch(console.error);
}