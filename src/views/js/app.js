// Función para manejar el submit del formulario
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Llamada asíncrona al proceso principal
    const response = await window.electronAPI.validateUser(username, password);


    if (response.isValid === true) {
        await window.electronAPI.setCookies(username, password);
        await window.electronAPI.loginSucces();
    } else {
        $('#loginErrorModal').modal('show'); // Mostrar el modal mejorado
    }
});