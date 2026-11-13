const {
    MEDIOS,
    fechaValida,
    normalizarHora,
    enteroPositivo
} = require('../utils/fechas');

function validarTurno(req, res, next) {
    const {
        fecha_turno,
        hora_turno,
        medio_solicitado,
        id_practica,
        id_equipo,
        matricula_medico,
        dni_paciente,
        estado_turno
    } = req.body;

    if (estado_turno && estado_turno !== 'Reservado') {
        return res.status(400).json({
            error: 'Un turno nuevo solo puede crearse en estado Reservado'
        });
    }

    if (!fechaValida(fecha_turno)) {
        return res.status(400).json({
            error: 'La fecha del turno es obligatoria y debe tener formato AAAA-MM-DD'
        });
    }

    if (!normalizarHora(hora_turno)) {
        return res.status(400).json({
            error: 'La hora del turno es obligatoria'
        });
    }

    if (!MEDIOS.includes(medio_solicitado)) {
        return res.status(400).json({
            error: 'El medio de solicitud debe ser Teléfono o Correo electrónico'
        });
    }

    if (!enteroPositivo(id_practica) || !enteroPositivo(id_equipo) || !enteroPositivo(matricula_medico)) {
        return res.status(400).json({
            error: 'La práctica, el médico y el equipo son obligatorios'
        });
    }

    if (Number(req.usuario.id_rol) === 1 && !enteroPositivo(dni_paciente)) {
        return res.status(400).json({
            error: 'El paciente es obligatorio'
        });
    }

    next();
}

function validarReprogramacion(req, res, next) {
    const { fecha_turno, hora_turno } = req.body;

    if (!fechaValida(fecha_turno)) {
        return res.status(400).json({
            error: 'La nueva fecha es obligatoria y debe tener formato AAAA-MM-DD'
        });
    }

    if (!normalizarHora(hora_turno)) {
        return res.status(400).json({
            error: 'La nueva hora es obligatoria'
        });
    }

    next();
}

module.exports = {
    validarTurno,
    validarReprogramacion
};
