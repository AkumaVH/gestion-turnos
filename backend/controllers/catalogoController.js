const asyncHandler = require('../utils/asyncHandler');
const catalogoService = require('../services/catalogoService');
const { enteroPositivo } = require('../utils/fechas');

const practicas = asyncHandler(async (req, res) => {
    res.json(await catalogoService.listarPracticas());
});

const medicos = asyncHandler(async (req, res) => {
    const idPractica = req.query.id_practica
        ? enteroPositivo(req.query.id_practica)
        : null;

    res.json(await catalogoService.listarMedicos(idPractica));
});

const equipos = asyncHandler(async (req, res) => {
    const idPractica = req.query.id_practica
        ? enteroPositivo(req.query.id_practica)
        : null;

    res.json(await catalogoService.listarEquipos(idPractica));
});

const pacientes = asyncHandler(async (req, res) => {
    res.json(await catalogoService.listarPacientes());
});

module.exports = {
    practicas,
    medicos,
    equipos,
    pacientes
};
