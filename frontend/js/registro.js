const tipo = document.getElementById('tipo');
const datosPaciente = document.getElementById('datosPaciente');
const datosMedico = document.getElementById('datosMedico');
const formulario = document.getElementById('formRegistro');
const mensaje = document.getElementById('mensaje');

function actualizarTipo() {
    const esPaciente = tipo.value === 'paciente';
    datosPaciente.hidden = !esPaciente;
    datosMedico.hidden = esPaciente;
    datosPaciente.querySelectorAll('input').forEach((campo) => {
        campo.required = esPaciente;
    });
    document.getElementById('matricula').required = !esPaciente;
}

tipo.addEventListener('change', actualizarTipo);
actualizarTipo();

formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    mensaje.textContent = '';
    mensaje.className = 'mensaje';

    try {
        let datos;

        if (tipo.value === 'paciente') {
            datos = await registrarPaciente({
                dni_paciente: document.getElementById('dni').value.trim(),
                nombre_paciente: document.getElementById('nombre').value.trim(),
                apellido_paciente: document.getElementById('apellido').value.trim(),
                fec_nac_paciente: document.getElementById('nacimiento').value,
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            });
        } else {
            datos = await registrarMedico({
                matricula_medico: document.getElementById('matricula').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            });
        }

        mensaje.className = 'mensaje ok';
        mensaje.textContent = datos.mensaje;

        if (datos.previewUrl) {
            mensaje.textContent += ' Vista previa del correo: ' + datos.previewUrl;
        }

        if (datos.verificacionUrl) {
            mensaje.textContent += ' Enlace: ' + datos.verificacionUrl;
        }
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.className = 'mensaje error';
    }
});
