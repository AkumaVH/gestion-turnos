const db = require('../config/database');
const { buscarTokenValido } = require('../services/tokenService');

async function verificarEmail(req, res) {
    let conexion;

    try {
        const { token } = req.query;

        if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
            return res.status(400).json({
                error: 'El enlace de verificación no es válido'
            });
        }

        const tokenEncontrado = await buscarTokenValido(token, 'VERIFICACION_EMAIL');

        if (!tokenEncontrado) {
            return res.status(400).json({
                error: 'El enlace venció, ya fue utilizado o no es válido'
            });
        }

        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [tokens] = await conexion.execute(
            `SELECT id_token, id_usuario
             FROM token_cuenta
             WHERE id_token = ?
               AND usado = 0
               AND tipo = 'VERIFICACION_EMAIL'
               AND fecha_expiracion > NOW()
             FOR UPDATE`,
            [tokenEncontrado.id_token]
        );

        if (tokens.length === 0) {
            await conexion.rollback();

            return res.status(400).json({
                error: 'El enlace venció o ya fue utilizado'
            });
        }

        await conexion.execute(
            `UPDATE usuario
             SET email_verificado = 1
             WHERE id_usuario = ?`,
            [tokens[0].id_usuario]
        );

        const [resultado] = await conexion.execute(
            `UPDATE token_cuenta
             SET usado = 1
             WHERE id_token = ? AND usado = 0`,
            [tokens[0].id_token]
        );

        if (resultado.affectedRows !== 1) {
            await conexion.rollback();

            return res.status(400).json({
                error: 'El enlace ya fue utilizado'
            });
        }

        await conexion.commit();

        return res.status(200).json({
            mensaje: 'Correo verificado correctamente. Ya podés iniciar sesión.'
        });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error('Error al revertir la transacción:', errorRollback);
            }
        }

        console.error('Error al verificar correo:', error);

        return res.status(500).json({
            error: 'No se pudo verificar el correo'
        });
    } finally {
        if (conexion) {
            conexion.release();
        }
    }
}

module.exports = { verificarEmail };
