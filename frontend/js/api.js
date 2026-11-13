const API_URL = '/api';

async function request(ruta, opciones = {}) {
    const headers = { ...(opciones.headers || {}) };

    if (opciones.body) {
        headers['Content-Type'] = 'application/json';
    }

    const token = sessionStorage.getItem('token');

    if (token) {
        headers.Authorization = 'Bearer ' + token;
    }

    const respuesta = await fetch(API_URL + ruta, {
        ...opciones,
        headers
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (respuesta.status === 401 && !ruta.startsWith('/auth/login')) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
        window.location.href = window.location.pathname.includes('/pages/')
            ? '../index.html'
            : 'index.html';
    }

    if (!respuesta.ok) {
        const error = new Error(datos.error || 'No se pudo completar la operación');
        error.status = respuesta.status;
        throw error;
    }

    return datos;
}

function iniciarSesion(email, password) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

function registrarPaciente(datos) {
    return request('/auth/registro/paciente', {
        method: 'POST',
        body: JSON.stringify(datos)
    });
}

function registrarMedico(datos) {
    return request('/auth/registro/medico', {
        method: 'POST',
        body: JSON.stringify(datos)
    });
}

function verificarEmail(token) {
    return request('/auth/verificar-email?token=' + encodeURIComponent(token));
}

function solicitarRecuperacion(email) {
    return request('/auth/recuperar', {
        method: 'POST',
        body: JSON.stringify({ email })
    });
}

function restablecerPassword(token, password) {
    return request('/auth/restablecer', {
        method: 'POST',
        body: JSON.stringify({ token, password })
    });
}

function obtenerTurnos(filtros) {
    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([clave, valor]) => {
        if (valor) {
            params.set(clave, valor);
        }
    });

    const consulta = params.toString();
    return request('/turnos' + (consulta ? '?' + consulta : ''));
}

function crearTurno(datos) {
    return request('/turnos', {
        method: 'POST',
        body: JSON.stringify(datos)
    });
}

function reprogramarTurno(id, datos) {
    return request('/turnos/' + id, {
        method: 'PUT',
        body: JSON.stringify(datos)
    });
}

function confirmarTurno(id) {
    return request('/turnos/' + id + '/confirmar', { method: 'POST' });
}

function cancelarTurno(id) {
    return request('/turnos/' + id + '/cancelar', { method: 'POST' });
}

function obtenerPracticas() {
    return request('/catalogos/practicas');
}

function obtenerMedicos(idPractica) {
    const consulta = idPractica ? '?id_practica=' + idPractica : '';
    return request('/catalogos/medicos' + consulta);
}

function obtenerEquipos(idPractica) {
    const consulta = idPractica ? '?id_practica=' + idPractica : '';
    return request('/catalogos/equipos' + consulta);
}

function obtenerPacientes() {
    return request('/catalogos/pacientes');
}
