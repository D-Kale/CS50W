export function getAllSongs(){
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    return fetch("/api/", {
        method: "GET",
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
}

export function CreateSong(formData) {

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
    });
}


export function ChangeUserType() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    return fetch('/api/currentUser/change/usertype/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        return response.json();
    });
}

export function EditSong(songId, formData) {

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(`/edit-playlist/${songId}`, {
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
    });
}