const mensaje = document.getElementById('mensaje');
const token = new URLSearchParams(window.location.search).get('token');

if (!token) {
    mensaje.textContent = 'El enlace de verificación no es válido.';
    mensaje.className = 'mensaje error';
} else {
    verificarEmail(token)
        .then((datos) => {
            mensaje.textContent = datos.mensaje;
            mensaje.className = 'mensaje ok';
        })
        .catch((error) => {
            mensaje.textContent = error.message;
            mensaje.className = 'mensaje error';
        });
}
