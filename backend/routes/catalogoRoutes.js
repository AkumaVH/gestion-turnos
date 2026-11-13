const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');
const verificarToken = require('../middlewares/authMiddleware');
const autorizarRol = require('../middlewares/autorizarRol');

router.use(verificarToken);

router.get('/practicas', autorizarRol(1, 2, 3), catalogoController.practicas);
router.get('/medicos', autorizarRol(1, 2, 3), catalogoController.medicos);
router.get('/equipos', autorizarRol(1, 2, 3), catalogoController.equipos);
router.get('/pacientes', autorizarRol(1), catalogoController.pacientes);

module.exports = router;
