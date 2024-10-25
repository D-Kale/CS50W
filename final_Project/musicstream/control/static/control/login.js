let isLoginForm = true;

document.addEventListener('DOMContentLoaded', () => {
    const switchFormLink = document.querySelector('#switchForm');
    const formTitle = document.querySelector('#formTitle');
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');

    // Comprueba si hay un parámetro en la URL para mostrar el formulario de registro
    const params = new URLSearchParams(window.location.search);
    if (params.get('show') === 'register') {
        isLoginForm = false; // Cambia a registro
    }

    UpdateView();

    // Alternar entre formularios de login y registro
    switchFormLink.addEventListener('click', () => {
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
}