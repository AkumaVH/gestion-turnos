// Según Trabajo Práctico: controller + capa de servicio
// Ampliación 2° parcial: filtros, reprogramar, confirmar y cancelar
const asyncHandler = require('../utils/asyncHandler');
const turnoService = require('../services/turnoService');
const { enteroPositivo } = require('../utils/fechas');
const AppError = require('../utils/AppError');

function idDeRuta(req) {
    const id = enteroPositivo(req.params.id);

    if (!id) {
        throw new AppError(400, 'El identificador del turno no es válido');
    }

    return id;
}

// ==============================
// OBTENER TODOS LOS TURNOS
// ==============================
const obtenerTurnos = asyncHandler(async (req, res) => {
    const turnos = await turnoService.listar({
        fecha: req.query.fecha || '',
        estado: req.query.estado || '',
        dni: req.query.dni_paciente || '',
        matricula: req.query.matricula_medico || ''
    }, req.usuario);

    res.json(turnos);
});

// ==============================
// OBTENER UN TURNO POR ID
// ==============================
const obtenerTurnoPorId = asyncHandler(async (req, res) => {
    const turno = await turnoService.obtenerPorId(idDeRuta(req), req.usuario);
    res.json(turno);
});

// ==============================
// CREAR TURNO
// ==============================
const crearTurno = asyncHandler(async (req, res) => {
    const turno = await turnoService.crear(req.body, req.usuario);

    res.status(201).json({
        mensaje: 'Turno creado correctamente',
        id_turno: turno.id_turno,
        turno
    });
});

// ==============================
// REPROGRAMAR TURNO (parcial)
// ==============================
const actualizarTurno = asyncHandler(async (req, res) => {
    const turno = await turnoService.reprogramar(idDeRuta(req), req.body, req.usuario);

    res.json({
        mensaje: 'Turno reprogramado. Quedó en estado Reservado y debe confirmarse de nuevo.',
        turno
    });
});

// ==============================
// CONFIRMAR TURNO (parcial)
// ==============================
const confirmarTurno = asyncHandler(async (req, res) => {
    const turno = await turnoService.confirmar(idDeRuta(req), req.usuario);

    res.json({
        mensaje: 'Turno confirmado correctamente',
        turno
    });
});

// ==============================
// CANCELAR TURNO (parcial)
// ==============================
const cancelarTurno = asyncHandler(async (req, res) => {
    const turno = await turnoService.cancelar(idDeRuta(req), req.usuario);

    res.json({
        mensaje: 'Turno cancelado. El horario volvió a quedar disponible.',
        turno
    });
});

// ==============================
// EXPORTAR CONTROLADORES
// ==============================
module.exports = {
    obtenerTurnos,
    obtenerTurnoPorId,
    crearTurno,
    actualizarTurno,
    confirmarTurno,
    cancelarTurno
};
