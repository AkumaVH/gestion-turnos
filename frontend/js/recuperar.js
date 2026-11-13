const formulario = document.getElementById('formRecuperar');
const mensaje = document.getElementById('mensaje');

formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    mensaje.textContent = '';
    mensaje.className = 'mensaje';

    try {
        const datos = await solicitarRecuperacion(document.getElementById('email').value.trim());
        mensaje.className = 'mensaje ok';
        mensaje.textContent = datos.mensaje;

        if (datos.previewUrl) {
            mensaje.textContent += ' Vista previa: ' + datos.previewUrl;
        }

        if (datos.recuperacionUrl) {
            mensaje.textContent += ' Enlace: ' + datos.recuperacionUrl;
        }
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.className = 'mensaje error';
    }
});
