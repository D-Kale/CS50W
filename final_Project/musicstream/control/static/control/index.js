import { CreateSong, EditSong, getAllSongs } from "./fetch.js";

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
        formData.append('name', document.querySelector('#songName').value);
        formData.append('state', document.querySelector('#songState').value);
        formData.append('artist', document.querySelector('#songArtist').value);
        formData.append('file', document.querySelector('#songFile').files[0]);

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

    function renderSongs() {
        songList.innerHTML = '';
        getAllSongs()
            .then((response) => {
                songs = response.songs;
                return fetch('/api/currentUser/');  // Asegúrate de que esto retorne una promesa
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener el usuario');
                }
                return response.json();
            })
            .then(data => {
                songs.forEach(song => {
                    if (song.user == data.username) {
                        const li = document.createElement("li");
                        const button = document.createElement("button");
    
                        li.innerHTML = `This is ${song.name}, from ${song.user}`;
                        button.innerHTML = `edit ${song.id}`;
                        button.classList.add("btn", "btn-light", "border", "border-4");
    
                        button.addEventListener("click", () => {
                            document.querySelector('#form-artist').classList.add("d-none");
    
                            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
                            fetch(`/api/song/${song.id}`, {
                                method: "GET",
                                headers: {
                                    'X-CSRFToken': csrftoken,
                                    'Content-Type': 'application/json'
                                }
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Error al obtener la canción');
                                }
                                return response.json();
                            })
                            .then(response => {
                                console.log(response);
                                document.querySelector('#songName').value = response.song.name;
                                document.querySelector('#songState').value = response.song.state;
                                document.querySelector("#songFile").removeAttribute('required');

                                const formData = new FormData();
                                formData.append('name', document.querySelector('#songName').value);
                                formData.append('state', document.querySelector('#songState').value);
                                //TODO
                                //SI hay un archivo nuevo cambiarlo, si no omitirlo
                            });
                        });
    
                        li.appendChild(button);
                        songList.appendChild(li);
                    }
                });
            })
            .catch(err => {
                console.log("error:", err);
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
        getAllSongs()
        .then((response) => {
            songs = response.songs
            songs.forEach(song => {
                const label = document.createElement('label');
                label.className = "mb-0"
                label.innerHTML = `
                <input type="checkbox" name="playlistSongs" value="${song.id}" 
                    ${selectedSongs.includes(song.id) ? 'checked' : ''}>
                ${song.name} - ${song.artist}
                `
                playlistSongs.appendChild(label);
            })
        })
    }

    // Inicialización
    renderSongs();
    renderPlaylists();
});