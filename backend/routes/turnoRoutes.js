// Según Trabajo Práctico: router de turnos + token JWT
// Ampliación 2° parcial: roles por operación + confirmar/reprogramar/cancelar
const express = require('express');
const router = express.Router();
const turnocontroller = require('../controllers/turnoController');
const { validarTurno, validarReprogramacion } = require('../middlewares/turnoValidator');
const verificarToken = require('../middlewares/authMiddleware');
const autorizarRol = require('../middlewares/autorizarRol');

// 1. Verificar que el usuario tenga un token válido (guía)
router.use(verificarToken);

// 2. Rutas CRUD / gestión (parcial: no todo queda solo para ADMIN)
router.get('/', autorizarRol(1, 2, 3), turnocontroller.obtenerTurnos);
router.get('/:id', autorizarRol(1, 2, 3), turnocontroller.obtenerTurnoPorId);
router.post('/', autorizarRol(1, 3), validarTurno, turnocontroller.crearTurno);

// Mejora funcional del parcial
router.put('/:id', autorizarRol(1, 3), validarReprogramacion, turnocontroller.actualizarTurno);
router.post('/:id/confirmar', autorizarRol(1), turnocontroller.confirmarTurno);
router.post('/:id/cancelar', autorizarRol(1, 3), turnocontroller.cancelarTurno);

module.exports = router;
