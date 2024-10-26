let isLoginForm = true;

document.addEventListener('DOMContentLoaded', () => {
    const switchFormLink = document.querySelector('#switchForm');
    const formTitle = document.querySelector('#formTitle');
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');
    const errorMessage = document.querySelector('#error-message');

    // Comprueba si hay un parámetro en la URL para mostrar el formulario de registro
    const params = new URLSearchParams(window.location.search);
    if (params.get('show') === 'register') {
        isLoginForm = false; // Cambia a registro
    }

    UpdateView();

    // Alternar entre formularios de login y registro
    switchFormLink.addEventListener('click', (e) => {
        e.preventDefault(); // Evitar el enlace predeterminado
        isLoginForm = !isLoginForm;
        UpdateView();
    });

    // Evitar el envío predeterminado y manejar login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });

    // Evitar el envío predeterminado y manejar registro
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        register();
    });
});

function UpdateView() {
    const formTitle = document.querySelector('#formTitle');
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');
    const switchFormLink = document.querySelector('#switchForm');
    
    formTitle.textContent = isLoginForm ? 'Login' : 'Register';
    loginForm.classList.toggle('d-none', !isLoginForm);
    registerForm.classList.toggle('d-none', isLoginForm);
    switchFormLink.textContent = isLoginForm ? 'Switch to Register' : 'Switch to Login';
    clearError(); // Limpiar mensajes de error al cambiar de formulario
}

function clearError() {
    const errorMessage = document.querySelector('#error-message');
    errorMessage.classList.add('d-none');
}


function login() {
    const username = document.querySelector('#login-username').value;
    const password = document.querySelector('#login-password').value;
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch('/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ username, password })
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
        window.location.href = '/control/';
    })
    .catch((err) => {
        showError(err.message);
    });
}


function register() {
    const username = document.querySelector('#register-username').value;
    const email = document.querySelector('#register-email').value;
    const password = document.querySelector('#register-password').value;
    const confirmation = document.querySelector('#register-confirm-password').value;
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    if (password !== confirmation) {
        showError('Las contraseñas no coinciden.');
        return;
    }

    fetch('/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ username, email, password })
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Error desconocido');
            });
        }
        return response.json();
    })
    .then((data) => {
        window.location.href = '/control/';
    })
    .catch((err) => {
        showError(err.message);
    }); 
}


function showError(message) {
    const errorContainer = document.querySelector('#error-container');
    errorContainer.textContent = message;
    errorContainer.classList.remove('d-none');
}