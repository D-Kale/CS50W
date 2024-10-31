document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const showSongsLink = document.getElementById('showSongs');
    const showPlaylistsLink = document.getElementById('showPlaylists');

    showSongsLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetchSongs();
    });

    showPlaylistsLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetchPlaylists();
    });

    fetchSongs();

    function fetchSongs() {
        fetch('/api/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displaySongs(data.songs);
            })
            .catch(error => console.error('Error:', error));
    }

    function fetchPlaylists() {
        fetch('/api/playlist/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(playlists => {
                displayPlaylists(playlists);
            })
            .catch(error => console.error('Error:', error));
    }

    function displaySongs(songs) {
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

    function createSongCard(song) {
        const card = document.createElement('div');
        card.className = 'bg-spotify-gray rounded-lg p-4 mb-4 hover:bg-opacity-80 transition-all duration-300';
        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-lg font-semibold">${song.name}</p>
                    <p class="text-sm text-spotify-blue">${song.artist}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="rewind-btn text-spotify-white hover:text-spotify-blue transition-colors" aria-label="Retroceder 5 segundos">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
                    </button>
                    <button class="play-btn text-spotify-white hover:text-spotify-blue transition-colors" aria-label="Reproducir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                    <button class="forward-btn text-spotify-white hover:text-spotify-blue transition-colors" aria-label="Adelantar 5 segundos">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
                    </button>
                    <button class="like-btn text-spotify-white hover:text-spotify-blue transition-colors" onclick="likeSong(${song.id})" aria-label="Me gusta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>
            </div>
            <div class="relative h-1 bg-spotify-black rounded-full">
                <div class="elapsed absolute h-full bg-spotify-blue rounded-full" style="width: 0%"></div>
            </div>
            <div class="flex justify-between text-xs mt-1">
                <span class="time-now">0:00</span>
                <span class="time-full">${song.duration || '0:00'}</span>
            </div>
            <audio src="${song.file_url}"></audio>
        `;

        const audio = card.querySelector('audio');
        const playBtn = card.querySelector('.play-btn');
        const rewindBtn = card.querySelector('.rewind-btn');
        const forwardBtn = card.querySelector('.forward-btn');
        const elapsed = card.querySelector('.elapsed');
        const timeNow = card.querySelector('.time-now');

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
            } else {
                audio.pause();
                playBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
            }
        });

        rewindBtn.addEventListener('click', () => {
            audio.currentTime = Math.max(audio.currentTime - 5, 0);
        });

        forwardBtn.addEventListener('click', () => {
            audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            elapsed.style.width = `${progress}%`;
            timeNow.textContent = formatTime(audio.currentTime);
        });

        return card;
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function displayPlaylists(playlists) {
        content.innerHTML = '<h2 class="text-2xl font-bold mb-4">Playlists</h2>';
        playlists.forEach(playlist => {
            let songsHtml = playlist.songs.map(song => `<li class="text-sm">${song.name} - ${song.artist}</li>`).join('');

            content.innerHTML += `
                <div class="bg-spotify-gray rounded-lg p-4 mb-4">
                    <h3 class="text-xl font-semibold mb-2">${playlist.name}</h3>
                    <p class="text-sm"><strong>Creador:</strong> ${playlist.user}</p>
                    <p class="text-sm"><strong>Duración total:</strong> ${playlist.duration}</p>
                    <p class="text-sm"><strong>Likes:</strong> <span id="playlist-likes-${playlist.id}">${playlist.likes}</span></p>
                    <button class="like-btn text-spotify-white hover:text-spotify-blue transition-colors mt-2" onclick="likePlaylist(${playlist.id})" aria-label="Me gusta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                    <h4 class="text-lg font-semibold mt-4 mb-2">Canciones:</h4>
                    <ul class="list-disc list-inside">${songsHtml}</ul>
                </div>
            `;
        });
    }
});

function likeSong(songId) {
    likeItem('Song', songId);
}

function likePlaylist(playlistId) {
    likeItem('Playlist', playlistId);
}

function likeItem(type, id) {
    fetch(`/api/like/${type}/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const likesElement = document.getElementById(`${type.toLowerCase()}-likes-${id}`);
            if (likesElement) {
                likesElement.textContent = data.likes;
            }
            const likeBtn = document.querySelector(`button[onclick="like${type}(${id})"]`);
            if (likeBtn) {
                likeBtn.querySelector('svg').style.fill = '#00BFFF';
            }
            alert(data.success);
        } else {
            alert(data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}