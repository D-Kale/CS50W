import { ChangeUserType } from "./fetch.js";

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


    formTitle.addEventListener('click', (e) => {
        ChangeUserType()
        .then(data => {
            errorMessage.classList.remove("d-none");
            errorMessage.classList.remove("alert-danger")
            errorMessage.classList.add("alert-success")
            errorMessage.innerHTML = `Tu usuario ahora es ${data.type}`;
        })
        .catch(error => {
            console.error("Hubo un problema con la solicitud:", error);
            errorMessage.classList.remove("d-none");
            errorMessage.innerHTML = "No se pudo cambiar el tipo de usuario.";
        });
        errorMessage.classList.remove("alert-success")
        errorMessage.classList.add("alert-danger")
        errorMessage.classList.add("d-none")
    });
    

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
    const errorMessage = document.querySelector('#error-message');

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
        errorMessage.classList.remove('d-none')
        errorMessage.innerHTML = `err.message`;
    });
}


function register() {
    const errorMessage = document.querySelector('#error-message');
    const username = document.querySelector('#register-username').value;
    const email = document.querySelector('#register-email').value;
    const password = document.querySelector('#register-password').value;
    const confirmation = document.querySelector('#register-confirm-password').value;
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    if (password !== confirmation) {
        errorMessage.classList.remove('d-none')
        errorMessage.innerHTML = 'Las contraseñas no coinciden.';
        return;
    }

    fetch('/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ username, email, password, confirmation })
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
}