import { CreateSong, EditSong, getAllSongs, CreatePlaylist, EditPlaylist, getAllPlaylists, DeletePlaylist } from "./fetch.js";

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

    function defaultForm(){
        document.querySelector('#songName').value = "";
        document.querySelector('#songArtist').value = "";
        document.querySelector('#songFile').value = "";
        document.querySelector('#songState').value = "";
    }

    // Al editar la playlist
    playlistForm.addEventListener("submit", (event) => {
        event.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.querySelector('#playlistName').value);
        formData.append('state', document.querySelector('#playlistState').value);
        
        selectedSongs.forEach(songId => formData.append('add_songs', songId)); // Agregar canciones
        removeSongs.forEach(songId => formData.append('remove_songs', songId)); // Eliminar canciones

        selectedSongs.forEach(songId => formData.append('songs', songId)); // Añadir cada canción


        if (isEditingPlaylist) {
            EditPlaylist(editingPlaylistId, formData).then(() => {
                isEditingPlaylist = false;
                editingPlaylistId = null;
                selectedSongs = []; // Reiniciar la selección
                removeSongs = []; // Reiniciar removeSongs
                renderPlaylists();
                defaultForm()
                window.location.reload();
            });
        } else {
            CreatePlaylist(formData).then(() => {
                renderPlaylists();
                defaultForm()
            });
        }
    });
    

    // Event Listener para el formulario de canción
    songForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', document.querySelector('#songName').value);
        formData.append('state', document.querySelector('#songState').value);
        formData.append('artist', document.querySelector('#songArtist').value);

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
                defaultForm();
                window.location.reload();
            });
        } else {
            // Si estamos creando, usa CreateSong
            CreateSong(formData).then(() => {
                renderSongs();
                defaultForm()
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
                const deleteButton = document.createElement("button")
                const div = document.createElement("div")

                div.classList.add("w-25")

                deleteButton.innerHTML = `Delete`
                deleteButton.classList.add('btn', 'btn-danger', 'border', 'border-4')

                li.innerHTML = `Playlist: ${playlist.name}`;
                button.innerHTML = `Edit ${playlist.id}`;
                button.classList.add('btn', 'btn-light', 'border', 'border-4');

                div.appendChild(button)
                div.appendChild(deleteButton)

                // Manejador de clic para activar modo edición de playlist
                deleteButton.addEventListener("click", () => {
                    DeletePlaylist(playlist.id).then(
                        window.location.reload()
                    )
                })

                button.addEventListener('click', () => {
                    document.querySelector('#playlistName').value = playlist.name;
                    document.querySelector('#playlistState').value = playlist.state;

                    // Marcar canciones en playlist
                    renderPlaylistSongs(playlist.songs.map(song => song.id));

                    // Configuración de modo edición
                    isEditingPlaylist = true;
                    editingPlaylistId = playlist.id;
                });

                li.appendChild(div)
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
                        <label class="btn btn-outline-primary ${activeClass}" for="btncheck-${song.id}" id="label-${song.id}">
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
                            document.querySelector(`#label-${song.id}`).classList.remove("active")
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
