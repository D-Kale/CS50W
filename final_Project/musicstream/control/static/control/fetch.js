export function CreateSong() {
    const formData = new FormData();
    formData.append('name', document.querySelector('#songName').value);
    formData.append('state', document.querySelector('#songState').value);
    formData.append('artist', document.querySelector('#songArtist').value);
    formData.append('file', document.querySelector('#songFile').files[0]);

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch('/api/upload/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrftoken,
        },
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(data => {
                throw new Error(data.error || 'Error desconocido');
            });
        }
    })
    .then((data) => {
        console.log('Canción cargada exitosamente:', data);
    })
    .catch((error) => {
        console.error('Error al crear la canción:', error);
        showError(error.message);
    });
}
