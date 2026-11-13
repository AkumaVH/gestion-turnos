const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const { validarTurno, validarReprogramacion } = require('../middlewares/turnoValidator');
const verificarToken = require('../middlewares/authMiddleware');
const autorizarRol = require('../middlewares/autorizarRol');

router.use(verificarToken);

router.get('/', autorizarRol(1, 2, 3), turnoController.obtenerTurnos);
router.get('/:id', autorizarRol(1, 2, 3), turnoController.obtenerTurnoPorId);
router.post('/', autorizarRol(1, 3), validarTurno, turnoController.crearTurno);
router.put('/:id', autorizarRol(1, 3), validarReprogramacion, turnoController.actualizarTurno);
router.post('/:id/confirmar', autorizarRol(1), turnoController.confirmarTurno);
router.post('/:id/cancelar', autorizarRol(1, 3), turnoController.cancelarTurno);

module.exports = router;
