document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.querySelector('#login-item');
    const registerLink = document.querySelector('#register-item');
    const logoutItem = document.getElementById('logout-item');

    if (loginLink) {
        loginLink.addEventListener("click", () => {
            window.location.href = '/control/login';
        });
    }

    if (registerLink) {
        registerLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = '/control/login/?show=register';
        });
    }

    if (logoutItem) {
        logoutItem.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

function logout() {
    const csrftoken = getCsrfToken();
    fetch('/api/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('Logout successful');
            window.location.href = '/control/';  // Redirigir tras el logout
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}

function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}
