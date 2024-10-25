document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const songList = document.getElementById('songList');
    const playlistList = document.getElementById('playlistList');
    const playlistSongs = document.getElementById('playlistSongs');

    let songs = [];
    let playlists = [];

    // Cambio de pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
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
