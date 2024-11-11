import { fetchSongs, fetchPlaylists } from './fetch.js';
import { displaySongs, displayPlaylists, likeSong, likePlaylist } from './domElements.js';

document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const showSongsLink = document.getElementById('showSongs');
    const showPlaylistsLink = document.getElementById('showPlaylists');

    showSongsLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetchSongs().then(data => displaySongs(content, data.songs)).catch(console.error);
    });

    showPlaylistsLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetchPlaylists().then(data => displayPlaylists(content, data.playlists)).catch(console.error);
    });

    // Carga inicial de canciones
    fetchSongs().then(data => displaySongs(content, data.songs)).catch(console.error);
});
