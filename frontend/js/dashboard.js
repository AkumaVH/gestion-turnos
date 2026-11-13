const token = sessionStorage.getItem('token');
const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');

if (!token || !usuario) {
    window.location.href = '../index.html';
} else {

const rol = Number(usuario.id_rol);
const textosRol = {
    1: 'Como administrador podés ver todos los turnos, reservar, confirmar, cancelar, reprogramar y filtrar.',
    2: 'Como médico solo ves los turnos que tenés asignados. No podés crearlos, confirmarlos ni cancelarlos.',
    3: 'Como paciente ves y gestionás únicamente tus turnos: podés reservar, reprogramar y cancelar. La confirmación la hace el centro.'
};

document.getElementById('rolUsuario').textContent = usuario.nombre_rol;
document.getElementById('datosUsuario').textContent = usuario.email + ' · ' + usuario.nombre_rol;
document.getElementById('textoRol').textContent = textosRol[rol] || '';

if (rol === 2) {
    document.getElementById('menuNuevo').hidden = true;
}

if (rol !== 1) {
    document.getElementById('filtroPacienteWrap').hidden = true;
    document.getElementById('filtroMedicoWrap').hidden = true;
    document.getElementById('pacienteNuevoWrap').hidden = true;
    document.getElementById('pacienteNuevo').required = false;
}

document.getElementById('cerrarSesion').addEventListener('click', function () {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '../index.html';
});

document.querySelectorAll('[data-seccion]').forEach((boton) => {
    boton.addEventListener('click', function () {
        mostrarSeccion(boton.dataset.seccion);
    });
});

const mensajeTurnos = document.getElementById('mensajeTurnos');
const mensajeNuevo = document.getElementById('mensajeNuevo');
const cuerpoTurnos = document.getElementById('cuerpoTurnos');
const formReprogramar = document.getElementById('formReprogramar');
let turnoReprogramar = null;

function mostrarMensaje(elemento, texto, ok) {
    elemento.textContent = texto || '';
    elemento.className = 'mensaje' + (texto ? (ok ? ' ok' : ' error') : '');
}

function escapar(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatearFecha(fecha) {
    if (!fecha) {
        return '';
    }

    const [anio, mes, dia] = String(fecha).slice(0, 10).split('-');
    return `${dia}/${mes}/${anio}`;
}

function hoyLocal() {
    const fecha = new Date();
    const dos = (numero) => String(numero).padStart(2, '0');
    return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

function mostrarSeccion(nombre) {
    if (nombre === 'nuevo' && rol === 2) {
        mostrarMensaje(mensajeTurnos, 'No tenés permisos para reservar turnos.', false);
        nombre = 'turnos';
    }

    document.querySelectorAll('main section').forEach((seccion) => {
        seccion.hidden = seccion.id !== 'seccion-' + nombre;
    });

    document.querySelectorAll('[data-seccion]').forEach((boton) => {
        boton.classList.toggle('activo', boton.dataset.seccion === nombre);
    });

    const titulos = {
        inicio: 'Panel principal',
        turnos: 'Gestión de turnos',
        nuevo: 'Nuevo turno'
    };

    document.getElementById('titulo').textContent = titulos[nombre];

    if (nombre === 'turnos') {
        cargarTurnos();
    }
}

function opcionPersona(valor, apellido, nombre, extra) {
    const opcion = document.createElement('option');
    opcion.value = valor;
    opcion.textContent = `${apellido}, ${nombre}${extra ? ' (' + extra + ')' : ''}`;
    return opcion;
}

async function cargarFiltros() {
    if (rol !== 1) {
        return;
    }

    const [pacientes, medicos] = await Promise.all([
        obtenerPacientes(),
        obtenerMedicos()
    ]);
    const filtroPaciente = document.getElementById('filtroPaciente');
    const filtroMedico = document.getElementById('filtroMedico');
    const pacienteNuevo = document.getElementById('pacienteNuevo');
    pacienteNuevo.innerHTML = '<option value="">Seleccionar</option>';

    pacientes.forEach((paciente) => {
        filtroPaciente.appendChild(opcionPersona(
            paciente.dni_paciente,
            paciente.apellido_paciente,
            paciente.nombre_paciente,
            paciente.dni_paciente
        ));
        pacienteNuevo.appendChild(opcionPersona(
            paciente.dni_paciente,
            paciente.apellido_paciente,
            paciente.nombre_paciente,
            paciente.dni_paciente
        ));
    });

    medicos.forEach((medico) => {
        filtroMedico.appendChild(opcionPersona(
            medico.matricula_medico,
            medico.apellido_medico,
            medico.nombre_medico,
            medico.matricula_medico
        ));
    });
}

async function cargarPracticas() {
    const practicas = await obtenerPracticas();
    const select = document.getElementById('practicaNuevo');
    select.innerHTML = '<option value="">Seleccionar</option>';

    practicas.forEach((practica) => {
        const opcion = document.createElement('option');
        opcion.value = practica.id_practica;
        opcion.textContent = `${practica.nombre_practica} · ${practica.nombre_servicio} · ${practica.duracion} min`;
        select.appendChild(opcion);
    });
}

async function alCambiarPractica() {
    const id = document.getElementById('practicaNuevo').value;
    const medicos = document.getElementById('medicoNuevo');
    const equipos = document.getElementById('equipoNuevo');
    medicos.innerHTML = '<option value="">Seleccionar</option>';
    equipos.innerHTML = '<option value="">Seleccionar</option>';

    if (!id) {
        return;
    }

    const [listaMedicos, listaEquipos] = await Promise.all([
        obtenerMedicos(id),
        obtenerEquipos(id)
    ]);

    listaMedicos.forEach((medico) => {
        medicos.appendChild(opcionPersona(
            medico.matricula_medico,
            medico.apellido_medico,
            medico.nombre_medico,
            medico.matricula_medico
        ));
    });

    listaEquipos.forEach((equipo) => {
        const opcion = document.createElement('option');
        opcion.value = equipo.id_equipo;
        opcion.textContent = equipo.nombre_equipo;
        equipos.appendChild(opcion);
    });
}

function botonAccion(accion, id, texto, clase) {
    return `<button type="button" data-accion="${accion}" data-id="${id}" class="${clase || ''}">${texto}</button>`;
}

function renderTurnos(turnos) {
    cuerpoTurnos.innerHTML = '';
    document.getElementById('vacioTurnos').hidden = turnos.length > 0;

    turnos.forEach((turno) => {
        const activo = turno.estado_turno !== 'Cancelado';
        const acciones = [];

        if (rol === 1 && turno.estado_turno === 'Reservado') {
            acciones.push(botonAccion('confirmar', turno.id_turno, 'Confirmar'));
        }

        if ((rol === 1 || rol === 3) && activo) {
            acciones.push(botonAccion('reprogramar', turno.id_turno, 'Reprogramar', 'secundario'));
            acciones.push(botonAccion('cancelar', turno.id_turno, 'Cancelar', 'peligro'));
        }

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${escapar(formatearFecha(turno.fecha_turno))}</td>
            <td>${escapar(String(turno.hora_turno).slice(0, 5))}</td>
            <td>${escapar(turno.paciente)}</td>
            <td>${escapar(turno.nombre_practica)} (${escapar(turno.duracion)} min)</td>
            <td>${escapar(turno.medico || 'Sin médico')}</td>
            <td>${escapar(turno.nombre_equipo || 'Sin equipo')}</td>
            <td><span class="estado estado-${escapar(String(turno.estado_turno).toLowerCase())}">${escapar(turno.estado_turno)}</span></td>
            <td><div class="acciones">${acciones.join('') || '—'}</div></td>
        `;
        fila.dataset.id = turno.id_turno;
        fila.dataset.fecha = String(turno.fecha_turno).slice(0, 10);
        fila.dataset.hora = String(turno.hora_turno).slice(0, 5);
        cuerpoTurnos.appendChild(fila);
    });
}

async function cargarTurnos() {
    mostrarMensaje(mensajeTurnos, '', true);

    try {
        const turnos = await obtenerTurnos({
            fecha: document.getElementById('filtroFecha').value,
            estado: document.getElementById('filtroEstado').value,
            dni_paciente: rol === 1 ? document.getElementById('filtroPaciente').value : '',
            matricula_medico: rol === 1 ? document.getElementById('filtroMedico').value : ''
        });
        renderTurnos(turnos);
    } catch (error) {
        mostrarMensaje(mensajeTurnos, error.message, false);
    }
}

document.getElementById('formFiltros').addEventListener('submit', function (evento) {
    evento.preventDefault();
    cargarTurnos();
});

document.getElementById('limpiarFiltros').addEventListener('click', function () {
    document.getElementById('formFiltros').reset();
    cargarTurnos();
});

cuerpoTurnos.addEventListener('click', async function (evento) {
    const boton = evento.target.closest('button[data-accion]');

    if (!boton) {
        return;
    }

    const id = boton.dataset.id;
    const fila = boton.closest('tr');

    try {
        if (boton.dataset.accion === 'confirmar') {
            const datos = await confirmarTurno(id);
            mostrarMensaje(mensajeTurnos, datos.mensaje, true);
            cargarTurnos();
        }

        if (boton.dataset.accion === 'cancelar') {
            if (!window.confirm('¿Cancelar este turno? El horario vuelve a quedar libre.')) {
                return;
            }

            const datos = await cancelarTurno(id);
            mostrarMensaje(mensajeTurnos, datos.mensaje, true);
            formReprogramar.hidden = true;
            cargarTurnos();
        }

        if (boton.dataset.accion === 'reprogramar') {
            turnoReprogramar = id;
            document.getElementById('reproId').textContent = '#' + id;
            document.getElementById('reproFecha').value = fila.dataset.fecha;
            document.getElementById('reproHora').value = fila.dataset.hora;
            document.getElementById('reproFecha').min = hoyLocal();
            formReprogramar.hidden = false;
        }
    } catch (error) {
        mostrarMensaje(mensajeTurnos, error.message, false);
    }
});

formReprogramar.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    try {
        const datos = await reprogramarTurno(turnoReprogramar, {
            fecha_turno: document.getElementById('reproFecha').value,
            hora_turno: document.getElementById('reproHora').value
        });
        formReprogramar.hidden = true;
        mostrarMensaje(mensajeTurnos, datos.mensaje, true);
        cargarTurnos();
    } catch (error) {
        mostrarMensaje(mensajeTurnos, error.message, false);
    }
});

document.getElementById('cerrarRepro').addEventListener('click', function () {
    formReprogramar.hidden = true;
});

document.getElementById('practicaNuevo').addEventListener('change', function () {
    alCambiarPractica().catch((error) => mostrarMensaje(mensajeNuevo, error.message, false));
});

document.getElementById('formNuevo').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    const boton = evento.target.querySelector('button');
    boton.disabled = true;

    const fecha = document.getElementById('fechaNuevo').value;
    const hoy = hoyLocal();

    if (fecha < hoy) {
        mostrarMensaje(mensajeNuevo, 'No se pueden asignar turnos en una fecha anterior a la actual.', false);
        boton.disabled = false;
        return;
    }

    try {
        const datos = await crearTurno({
            dni_paciente: rol === 1 ? document.getElementById('pacienteNuevo').value : undefined,
            id_practica: document.getElementById('practicaNuevo').value,
            matricula_medico: document.getElementById('medicoNuevo').value,
            id_equipo: document.getElementById('equipoNuevo').value,
            fecha_turno: fecha,
            hora_turno: document.getElementById('horaNuevo').value,
            medio_solicitado: document.getElementById('medioNuevo').value,
            estado_turno: 'Reservado'
        });
        evento.target.reset();
        document.getElementById('medicoNuevo').innerHTML = '<option value="">Seleccionar</option>';
        document.getElementById('equipoNuevo').innerHTML = '<option value="">Seleccionar</option>';
        mostrarMensaje(mensajeNuevo, datos.mensaje, true);
    } catch (error) {
        mostrarMensaje(mensajeNuevo, error.message, false);
    } finally {
        boton.disabled = false;
    }
});

document.getElementById('fechaNuevo').min = hoyLocal();

Promise.all([cargarFiltros(), cargarPracticas()]).catch((error) => {
    mostrarMensaje(mensajeNuevo, error.message, false);
});
}
