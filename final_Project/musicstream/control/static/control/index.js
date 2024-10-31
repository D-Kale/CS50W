import { CreateSong, EditSong, getAllSongs, CreatePlaylist, EditPlaylist, getAllPlaylists } from "./fetch.js";

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const songList = document.querySelector('#songList');
    const playlistList = document.querySelector('#playlistList');
    const playlistSongs = document.querySelector('#playlistSongs');

    const songForm = document.querySelector("#songForm");
    let isEditing = false; // Indica si estás en modo de edición
    let editingSongId = null; // ID de la canción que se está editando

    let isEditingPlaylist = false;
    let editingPlaylistId = null;

    const playlistForm = document.querySelector("#playlistForm");

    let songs = [];
    let playlists = [];
    
    let removeSongs = []; // Para las canciones que se eliminarán
    let selectedSongs = []; // Declarar selectedSongs aquí

    // Al editar la playlist
    playlistForm.addEventListener("submit", (event) => {
        event.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.querySelector('#playlistName').value);
        formData.append('state', document.querySelector('#playlistState').value);
        
        selectedSongs.forEach(songId => formData.append('add_songs', songId)); // Agregar canciones
        removeSongs.forEach(songId => formData.append('remove_songs', songId)); // Eliminar canciones

        if (isEditingPlaylist) {
            EditPlaylist(editingPlaylistId, formData).then(() => {
                isEditingPlaylist = false;
                editingPlaylistId = null;
                selectedSongs = []; // Reiniciar la selección
                removeSongs = []; // Reiniciar removeSongs
                renderPlaylists();
            });
        } else {
            CreatePlaylist(formData).then(() => {
                renderPlaylists();
            });
        }
    });
    

    // Event Listener para el formulario de canción
    songForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', document.querySelector('#songName').value);
        formData.append('state', document.querySelector('#songState').value);

        const fileInput = document.querySelector('#songFile').files[0];
        if (fileInput) {
            formData.append('file', fileInput);
        }

        if (isEditing) {
            // Si estamos editando, usa EditSong
            EditSong(editingSongId, formData).then(() => {
                isEditing = false;
                editingSongId = null;
                renderSongs();
            });
        } else {
            // Si estamos creando, usa CreateSong
            CreateSong(formData).then(() => {
                renderSongs();
            });
        }
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
                return fetch('/api/currentUser/');
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener el usuario');
                }
                return response.json();
            })
            .then(data => {
                songs.forEach(song => {
                    if (song.user === data.username) {
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
                                document.querySelector("#songArtist").removeAttribute('required');

                                // Configura modo edición
                                isEditing = true;
                                editingSongId = response.song.id;
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
        getAllPlaylists()
        .then((response) => {
            playlists = response.playlists;
            return fetch('/api/currentUser/');
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el usuario');
            }
            return response.json();
        })
        .then(data => {
            playlists.forEach(playlist => {
                const li = document.createElement('li');
                const button = document.createElement('button');

                li.innerHTML = `Playlist: ${playlist.name}`;
                button.innerHTML = `Edit ${playlist.id}`;
                button.classList.add('btn', 'btn-light', 'border', 'border-4');

                // Manejador de clic para activar modo edición de playlist
                button.addEventListener('click', () => {
                    document.querySelector('#playlistName').value = playlist.name;
                    document.querySelector('#playlistState').value = playlist.state;

                    // Marcar canciones en playlist
                    renderPlaylistSongs(playlist.songs.map(song => song.id));

                    // Configuración de modo edición
                    isEditingPlaylist = true;
                    editingPlaylistId = playlist.id;
                });

                li.appendChild(button);
                playlistList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error al obtener las playlists:', error);
        });
    }


    // Dentro de la función renderPlaylistSongs
    function renderPlaylistSongs(existingSongs = []) {
        const searchInput = document.querySelector('#searchSong');
        const playlistSongsContainer = document.querySelector('#playlistSongs');

        const updateSongList = (searchTerm = '') => {
            playlistSongsContainer.innerHTML = '';

            getAllSongs().then((response) => {
                const songs = response.songs || [];

                const filteredSongs = songs.filter(song => 
                    song.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

                filteredSongs.forEach(song => {
                    const div = document.createElement('div');
                    div.className = 'btn-group me-2';

                    const isChecked = selectedSongs.includes(song.id) || existingSongs.includes(song.id) ? 'checked' : '';
                    const activeClass = isChecked ? 'active' : '';

                    div.innerHTML = `
                        <input type="checkbox" class="btn-check" id="btncheck-${song.id}" autocomplete="off" ${isChecked}>
                        <label class="btn btn-outline-primary ${activeClass}" for="btncheck-${song.id}">
                            ${song.name} - ${song.artist}
                        </label>
                    `;
                    playlistSongsContainer.appendChild(div);

                    const checkbox = div.querySelector('input[type="checkbox"]');
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            selectedSongs.push(song.id);
                            removeSongs = removeSongs.filter(id => id !== song.id); // Eliminar de removeSongs si se agrega
                        } else {
                            selectedSongs = selectedSongs.filter(id => id !== song.id); // Eliminar de selectedSongs si se desmarca
                            removeSongs.push(song.id); // Agregar a removeSongs si se desmarca
                        }
                    });
                });
            }).catch(error => {
                console.error('Error al obtener las canciones:', error);
            });
        };

        searchInput.addEventListener('input', (e) => {
            updateSongList(e.target.value);
        });

        updateSongList();
    }

    // Inicialización
    renderSongs();
    renderPlaylists();
});
