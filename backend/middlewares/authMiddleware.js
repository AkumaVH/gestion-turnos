const jwt = require('jsonwebtoken');
const db = require('../config/database');

async function verificarToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Se requiere un token de autenticación'
        });
    }

    const token = authorization.split(' ')[1];

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('Falta configurar JWT_SECRET en .env');
        }

        const datosToken = jwt.verify(token, process.env.JWT_SECRET);

        const [usuarios] = await db.execute(
            `SELECT id_usuario, email, id_rol, activo, email_verificado,
                    dni_paciente, matricula_medico
             FROM usuario
             WHERE id_usuario = ?`,
            [datosToken.id_usuario]
        );

        if (usuarios.length === 0 || usuarios[0].activo !== 1) {
            return res.status(401).json({
                error: 'Token inválido o vencido'
            });
        }

        req.usuario = usuarios[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido o vencido'
            });
        }

        next(error);
    }
}

module.exports = verificarToken;
