// Capa de servicio (Trabajo Práctico).
// Ampliación 2° parcial: validaciones de agenda, roles en listados y
// operaciones confirmar / reprogramar / cancelar.
const db = require('../config/database');
const AppError = require('../utils/AppError');
const {
    ESTADOS,
    diaSemana,
    aHora,
    aMinutos,
    validarHorarioCentro,
    normalizarHora,
    fechaValida,
    enteroPositivo
} = require('../utils/fechas');

const LOCK = 'gestion-turnos-agenda';

const CONSULTA_TURNO = `
    SELECT
        t.id_turno,
        t.fecha_turno,
        t.hora_turno,
        t.medio_solicitado,
        t.estado_turno,
        t.fecha_confirmacion,
        t.dni_paciente,
        CONCAT(pac.apellido_paciente, ', ', pac.nombre_paciente) AS paciente,
        t.id_practica,
        pr.nombre_practica,
        pr.duracion,
        s.nombre_servicio,
        t.id_equipo,
        eq.nombre_equipo,
        r.matricula_medico,
        CONCAT(med.apellido_medico, ', ', med.nombre_medico) AS medico,
        t.id_disponibilidad
    FROM turno t
    JOIN paciente pac ON pac.dni_paciente = t.dni_paciente
    JOIN practica pr ON pr.id_practica = t.id_practica
    JOIN servicio s ON s.id_servicio = pr.id_servicio
    LEFT JOIN equipo eq ON eq.id_equipo = t.id_equipo
    LEFT JOIN (
        SELECT id_turno, MIN(matricula_medico) AS matricula_medico
        FROM registra
        GROUP BY id_turno
    ) r ON r.id_turno = t.id_turno
    LEFT JOIN medico med ON med.matricula_medico = r.matricula_medico
`;

function assertAcceso(turno, usuario) {
    const rol = Number(usuario.id_rol);

    if (rol === 1) {
        return;
    }

    if (rol === 3 && Number(turno.dni_paciente) === Number(usuario.dni_paciente)) {
        return;
    }

    if (rol === 2 && Number(turno.matricula_medico) === Number(usuario.matricula_medico)) {
        return;
    }

    throw new AppError(403, 'No tenés permisos para acceder a este turno');
}

async function listar(filtros, usuario) {
    const where = [];
    const params = [];
    const rol = Number(usuario.id_rol);

    if (rol === 3) {
        where.push('t.dni_paciente = ?');
        params.push(usuario.dni_paciente);
    } else if (rol === 2) {
        where.push('r.matricula_medico = ?');
        params.push(usuario.matricula_medico);
    } else {
        if (filtros.dni) {
            where.push('t.dni_paciente = ?');
            params.push(filtros.dni);
        }

        if (filtros.matricula) {
            where.push('r.matricula_medico = ?');
            params.push(filtros.matricula);
        }
    }

    if (filtros.fecha) {
        if (!fechaValida(filtros.fecha)) {
            throw new AppError(400, 'La fecha del filtro no es válida');
        }

        where.push('t.fecha_turno = ?');
        params.push(filtros.fecha);
    }

    if (filtros.estado) {
        if (!ESTADOS.includes(filtros.estado)) {
            throw new AppError(400, 'El estado no es válido');
        }

        where.push('t.estado_turno = ?');
        params.push(filtros.estado);
    }

    const sql = `
        ${CONSULTA_TURNO}
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY t.fecha_turno, t.hora_turno, t.id_turno
    `;

    const [turnos] = await db.execute(sql, params);
    return turnos;
}

async function obtenerPorId(idTurno, usuario) {
    const [turnos] = await db.execute(
        `${CONSULTA_TURNO} WHERE t.id_turno = ?`,
        [idTurno]
    );

    if (turnos.length === 0) {
        throw new AppError(404, 'Turno no encontrado');
    }

    assertAcceso(turnos[0], usuario);
    return turnos[0];
}

async function validarReglas(conexion, datos) {
    const hora = normalizarHora(datos.hora);
    const idPractica = enteroPositivo(datos.idPractica);
    const idEquipo = enteroPositivo(datos.idEquipo);
    const matricula = enteroPositivo(datos.matricula);
    const dni = enteroPositivo(datos.dni);
    const excluirId = datos.excluirId ? enteroPositivo(datos.excluirId) : null;

    const [practicas] = await conexion.execute(
        `SELECT id_practica, duracion, id_servicio
         FROM practica
         WHERE id_practica = ?`,
        [idPractica]
    );

    if (practicas.length === 0) {
        throw new AppError(404, 'La práctica no existe');
    }

    const duracion = Number(practicas[0].duracion);

    if (!Number.isInteger(duracion) || duracion <= 0) {
        throw new AppError(400, 'La práctica no tiene una duración válida');
    }

    const horario = validarHorarioCentro(datos.fecha, hora, duracion);

    if (horario) {
        throw new AppError(400, horario);
    }

    const [pacientes] = await conexion.execute(
        'SELECT dni_paciente FROM paciente WHERE dni_paciente = ?',
        [dni]
    );

    if (pacientes.length === 0) {
        throw new AppError(404, 'El paciente no existe');
    }

    const [medicos] = await conexion.execute(
        'SELECT matricula_medico FROM medico WHERE matricula_medico = ?',
        [matricula]
    );

    if (medicos.length === 0) {
        throw new AppError(404, 'El médico no existe');
    }

    const [habilitado] = await conexion.execute(
        `SELECT matricula_medico
         FROM practica_medico
         WHERE matricula_medico = ? AND id_practica = ?`,
        [matricula, idPractica]
    );

    if (habilitado.length === 0) {
        throw new AppError(400, 'El médico no puede realizar la práctica solicitada');
    }

    const [equipos] = await conexion.execute(
        'SELECT id_equipo FROM equipo WHERE id_equipo = ?',
        [idEquipo]
    );

    if (equipos.length === 0) {
        throw new AppError(404, 'El equipo no existe');
    }

    const [compatible] = await conexion.execute(
        `SELECT id_equipo
         FROM practica_equipo
         WHERE id_equipo = ? AND id_practica = ?`,
        [idEquipo, idPractica]
    );

    if (compatible.length === 0) {
        throw new AppError(400, 'El equipo no es compatible con la práctica');
    }

    const horaFin = aHora(aMinutos(hora) + duracion);
    const dia = diaSemana(datos.fecha);

    const [disponibilidad] = await conexion.execute(
        `SELECT d.id_disponibilidad
         FROM disponibilidad d
         JOIN medico_disponibilidad md ON md.id_disponibilidad = d.id_disponibilidad
         WHERE md.matricula_medico = ?
           AND d.dia = ?
           AND d.hora_desde <= ?
           AND d.hora_hasta >= ?
         LIMIT 1`,
        [matricula, dia, hora, horaFin]
    );

    if (disponibilidad.length === 0) {
        throw new AppError(400, 'El médico no está disponible en ese día y horario');
    }

    await assertSinSuperposicion(conexion, {
        fecha: datos.fecha,
        horaInicio: hora,
        horaFin,
        matricula,
        idEquipo,
        dni,
        excluirId
    });

    return {
        hora,
        duracion,
        idDisponibilidad: disponibilidad[0].id_disponibilidad
    };
}

async function assertSinSuperposicion(conexion, datos) {
    const excluir = datos.excluirId || 0;

    const [medicoOcupado] = await conexion.execute(
        `SELECT t.id_turno
         FROM turno t
         JOIN practica p ON p.id_practica = t.id_practica
         JOIN registra r ON r.id_turno = t.id_turno
         WHERE t.estado_turno <> 'Cancelado'
           AND t.fecha_turno = ?
           AND r.matricula_medico = ?
           AND t.id_turno <> ?
           AND t.hora_turno < ?
           AND ADDTIME(t.hora_turno, SEC_TO_TIME(p.duracion * 60)) > ?
         LIMIT 1`,
        [datos.fecha, datos.matricula, excluir, datos.horaFin, datos.horaInicio]
    );

    if (medicoOcupado.length > 0) {
        throw new AppError(409, 'El médico ya tiene un turno en ese horario');
    }

    const [equipoOcupado] = await conexion.execute(
        `SELECT t.id_turno
         FROM turno t
         JOIN practica p ON p.id_practica = t.id_practica
         WHERE t.estado_turno <> 'Cancelado'
           AND t.fecha_turno = ?
           AND t.id_equipo = ?
           AND t.id_turno <> ?
           AND t.hora_turno < ?
           AND ADDTIME(t.hora_turno, SEC_TO_TIME(p.duracion * 60)) > ?
         LIMIT 1`,
        [datos.fecha, datos.idEquipo, excluir, datos.horaFin, datos.horaInicio]
    );

    if (equipoOcupado.length > 0) {
        throw new AppError(409, 'El equipo ya tiene un turno en ese horario');
    }

    const [pacienteOcupado] = await conexion.execute(
        `SELECT t.id_turno
         FROM turno t
         JOIN practica p ON p.id_practica = t.id_practica
         WHERE t.estado_turno <> 'Cancelado'
           AND t.fecha_turno = ?
           AND t.dni_paciente = ?
           AND t.id_turno <> ?
           AND t.hora_turno < ?
           AND ADDTIME(t.hora_turno, SEC_TO_TIME(p.duracion * 60)) > ?
         LIMIT 1`,
        [datos.fecha, datos.dni, excluir, datos.horaFin, datos.horaInicio]
    );

    if (pacienteOcupado.length > 0) {
        throw new AppError(409, 'El paciente ya tiene un turno en ese horario');
    }
}

async function conBloqueo(accion) {
    const conexion = await db.getConnection();

    try {
        const [bloqueo] = await conexion.query(
            'SELECT GET_LOCK(?, 10) AS ok',
            [LOCK]
        );

        if (Number(bloqueo[0].ok) !== 1) {
            throw new AppError(503, 'No se pudo reservar el horario. Intentá de nuevo');
        }

        await conexion.beginTransaction();
        const resultado = await accion(conexion);
        await conexion.commit();
        return resultado;
    } catch (error) {
        try {
            await conexion.rollback();
        } catch (errorRollback) {
            console.error('Error al revertir la transacción:', errorRollback);
        }

        throw error;
    } finally {
        try {
            await conexion.query('SELECT RELEASE_LOCK(?)', [LOCK]);
        } catch (errorLock) {
            console.error('Error al liberar el bloqueo:', errorLock);
        }

        conexion.release();
    }
}

async function crear(datos, usuario) {
    const dni = Number(usuario.id_rol) === 3
        ? Number(usuario.dni_paciente)
        : enteroPositivo(datos.dni_paciente);

    if (!dni) {
        throw new AppError(400, 'El paciente es obligatorio');
    }

    const idTurno = await conBloqueo(async (conexion) => {
        const reglas = await validarReglas(conexion, {
            fecha: datos.fecha_turno,
            hora: datos.hora_turno,
            idPractica: datos.id_practica,
            idEquipo: datos.id_equipo,
            matricula: datos.matricula_medico,
            dni
        });

        const [resultado] = await conexion.execute(
            `INSERT INTO turno (
                fecha_turno,
                hora_turno,
                medio_solicitado,
                estado_turno,
                fecha_confirmacion,
                medico_confirmacion,
                dni_paciente,
                id_practica,
                id_equipo,
                id_disponibilidad
            ) VALUES (?, ?, ?, 'Reservado', NULL, NULL, ?, ?, ?, ?)`,
            [
                datos.fecha_turno,
                reglas.hora,
                datos.medio_solicitado,
                dni,
                enteroPositivo(datos.id_practica),
                enteroPositivo(datos.id_equipo),
                reglas.idDisponibilidad
            ]
        );

        await conexion.execute(
            `INSERT INTO registra (matricula_medico, id_turno, id_disponibilidad)
             VALUES (?, ?, ?)`,
            [enteroPositivo(datos.matricula_medico), resultado.insertId, reglas.idDisponibilidad]
        );

        return resultado.insertId;
    });

    return obtenerPorId(idTurno, usuario);
}

async function reprogramar(idTurno, datos, usuario) {
    await conBloqueo(async (conexion) => {
        const [bloqueados] = await conexion.execute(
            'SELECT id_turno FROM turno WHERE id_turno = ? FOR UPDATE',
            [idTurno]
        );

        if (bloqueados.length === 0) {
            throw new AppError(404, 'Turno no encontrado');
        }

        const [turnos] = await conexion.execute(
            `${CONSULTA_TURNO} WHERE t.id_turno = ?`,
            [idTurno]
        );
        const turno = turnos[0];
        assertAcceso(turno, usuario);

        if (turno.estado_turno === 'Cancelado') {
            throw new AppError(400, 'No se puede modificar un turno cancelado');
        }

        if (!turno.matricula_medico || !turno.id_equipo) {
            throw new AppError(400, 'El turno no tiene médico o equipo asignado');
        }

        const reglas = await validarReglas(conexion, {
            fecha: datos.fecha_turno,
            hora: datos.hora_turno,
            idPractica: turno.id_practica,
            idEquipo: turno.id_equipo,
            matricula: turno.matricula_medico,
            dni: turno.dni_paciente,
            excluirId: idTurno
        });

        await conexion.execute(
            `UPDATE turno
             SET fecha_turno = ?,
                 hora_turno = ?,
                 id_disponibilidad = ?,
                 estado_turno = 'Reservado',
                 fecha_confirmacion = NULL,
                 medico_confirmacion = NULL
             WHERE id_turno = ?`,
            [datos.fecha_turno, reglas.hora, reglas.idDisponibilidad, idTurno]
        );

        await conexion.execute(
            `UPDATE registra
             SET id_disponibilidad = ?
             WHERE id_turno = ?`,
            [reglas.idDisponibilidad, idTurno]
        );
    });

    return obtenerPorId(idTurno, usuario);
}

async function confirmar(idTurno, usuario) {
    const turno = await obtenerPorId(idTurno, usuario);

    if (turno.estado_turno !== 'Reservado') {
        throw new AppError(400, 'Solo se puede confirmar un turno reservado');
    }

    await db.execute(
        `UPDATE turno
         SET estado_turno = 'Confirmado',
             fecha_confirmacion = NOW(),
             medico_confirmacion = ?
         WHERE id_turno = ?
           AND estado_turno = 'Reservado'`,
        [turno.matricula_medico, idTurno]
    );

    return obtenerPorId(idTurno, usuario);
}

async function cancelar(idTurno, usuario) {
    const turno = await obtenerPorId(idTurno, usuario);

    if (turno.estado_turno === 'Cancelado') {
        throw new AppError(400, 'El turno ya está cancelado');
    }

    await db.execute(
        `UPDATE turno
         SET estado_turno = 'Cancelado'
         WHERE id_turno = ?
           AND estado_turno <> 'Cancelado'`,
        [idTurno]
    );

    return obtenerPorId(idTurno, usuario);
}

module.exports = {
    listar,
    obtenerPorId,
    crear,
    reprogramar,
    confirmar,
    cancelar
};
