import { CreateSong } from "./fetch.js";

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const songList = document.querySelector('#songList');
    const playlistList = document.querySelector('#playlistList');
    const playlistSongs = document.querySelector('#playlistSongs');

    const songForm = document.querySelector("#songForm");

    let songs = [];
    let playlists = [];

    songForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("name", document.querySelector("#songName").value);
        formData.append("artist", document.querySelector("#songArtist").value);
        formData.append("file", document.querySelector("#songFile").files[0]);
        formData.append("state", document.querySelector("#songState").value);

        CreateSong(formData);
    });

    // Funcionalidad de pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.querySelector(`#${button.dataset.tab}`).classList.add('active');
        });
    });

    // Renderizar canciones
    function renderSongs() {
        songList.innerHTML = '';
        songs.forEach(song => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${song.name} - ${song.artist}
            `;
            songList.appendChild(li);
        });
        renderPlaylistSongs();
    }

    // Renderizar playlists
    function renderPlaylists() {
        playlistList.innerHTML = '';
        playlists.forEach(playlist => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${playlist.name}
            `;
            playlistList.appendChild(li);
        });
    }

    // Renderizar canciones en la sección de playlists
    function renderPlaylistSongs(selectedSongs = []) {
        playlistSongs.innerHTML = '';
        songs.forEach(song => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="playlistSongs" value="${song.id}" 
                    ${selectedSongs.includes(song.id) ? 'checked' : ''}>
                ${song.name} - ${song.artist}
            `;
            playlistSongs.appendChild(label);
        });
    }

    // Inicialización
    renderSongs();
    renderPlaylists();
});
