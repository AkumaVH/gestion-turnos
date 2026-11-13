const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const registroController = require('../controllers/registroController');
const verificacionController = require('../controllers/verificacionController');
const recuperacionController = require('../controllers/recuperacionController');

router.post('/login', authController.login);
router.post('/registro/paciente', registroController.registrarPaciente);
router.post('/registro/medico', registroController.registrarMedico);
router.get('/verificar-email', verificacionController.verificarEmail);
router.post('/recuperar', recuperacionController.solicitarRecuperacion);
router.post('/restablecer', recuperacionController.restablecerPassword);

module.exports = router;
