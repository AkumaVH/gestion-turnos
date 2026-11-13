const formulario = document.getElementById('formRestablecer');
const mensaje = document.getElementById('mensaje');
const token = new URLSearchParams(window.location.search).get('token');

if (!token) {
    mensaje.textContent = 'El enlace de recuperación no es válido.';
    mensaje.className = 'mensaje error';
    formulario.hidden = true;
}

formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    const password = document.getElementById('password').value;
    const confirmacion = document.getElementById('confirmacion').value;

    if (password !== confirmacion) {
        mensaje.textContent = 'Las contraseñas no coinciden.';
        mensaje.className = 'mensaje error';
        return;
    }

    try {
        const datos = await restablecerPassword(token, password);
        mensaje.textContent = datos.mensaje;
        mensaje.className = 'mensaje ok';
        formulario.hidden = true;
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.className = 'mensaje error';
    }
});
