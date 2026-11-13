const formulario = document.getElementById('formLogin');
const mensaje = document.getElementById('mensaje');
const boton = formulario.querySelector('button');

formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    mensaje.textContent = '';
    mensaje.className = 'mensaje';
    boton.disabled = true;
    boton.textContent = 'Ingresando...';

    try {
        const datos = await iniciarSesion(email, password);

        sessionStorage.setItem('token', datos.token);
        sessionStorage.setItem('usuario', JSON.stringify(datos.usuario));

        mensaje.textContent = `Bienvenida/o, ${datos.usuario.email}. Rol: ${datos.usuario.nombre_rol}`;
        mensaje.className = 'mensaje ok';
        window.location.href = 'pages/dashboard.html';
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.className = 'mensaje error';
        boton.disabled = false;
        boton.textContent = 'Iniciar sesión';
    }
});
