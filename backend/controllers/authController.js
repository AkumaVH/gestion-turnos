const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'El email y la contraseña son obligatorios'
            });
        }

        const usuario = await authService.verificarCredenciales(
            String(email).trim().toLowerCase(),
            password
        );

        if (!usuario) {
            return res.status(401).json({
                error: 'Credenciales incorrectas'
            });
        }

        if (usuario.error === 'EMAIL_NO_VERIFICADO') {
            return res.status(403).json({
                error: 'Debés verificar tu correo antes de iniciar sesión'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('Falta configurar JWT_SECRET en .env');
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                id_rol: usuario.id_rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            usuario,
            token
        });
    } catch (error) {
        console.error('Error en login:', error);

        return res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
}

module.exports = {
    login
};
