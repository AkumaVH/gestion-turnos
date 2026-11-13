const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { crearTokenCuenta, buscarTokenValido } = require('../services/tokenService');
const { enviarCorreo } = require('../services/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function solicitarRecuperacion(req, res) {
    try {
        const correo = String(req.body.email || '').trim().toLowerCase();

        if (!correo) {
            return res.status(400).json({
                error: 'El correo es obligatorio'
            });
        }

        const mensaje = 'Si el correo está registrado, vas a recibir un enlace para restablecer la contraseña.';
        const [usuarios] = await db.execute(
            `SELECT id_usuario
             FROM usuario
             WHERE email = ? AND activo = 1`,
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(200).json({ mensaje, previewUrl: null });
        }

        const token = await crearTokenCuenta(
            usuarios[0].id_usuario,
            'RECUPERACION_PASSWORD',
            30
        );
        const enlace = `${FRONTEND_URL}/restablecer.html?token=${token}`;
        const enviado = await enviarCorreo({
            to: correo,
            subject: 'Restablecé tu contraseña - Gestión de Turnos',
            text: `Para elegir una contraseña nueva, abrí este enlace: ${enlace}. Vence en 30 minutos.`,
            html: `
                <h2>Recuperación de contraseña</h2>
                <p>Para elegir una contraseña nueva, hacé clic en el siguiente enlace:</p>
                <p><a href="${enlace}">Restablecer contraseña</a></p>
                <p>El enlace vence en 30 minutos. Si no lo pediste, ignorá este mensaje.</p>
            `
        });

        return res.status(200).json({
            mensaje: enviado
                ? mensaje
                : 'No se pudo enviar el correo. Usá el enlace de recuperación.',
            previewUrl: enviado?.previewUrl || null,
            recuperacionUrl: enviado ? null : enlace
        });
    } catch (error) {
        console.error('Error al solicitar recuperación:', error);

        return res.status(500).json({
            error: 'No se pudo iniciar la recuperación'
        });
    }
}

async function restablecerPassword(req, res) {
    let conexion;

    try {
        const { token, password } = req.body;

        if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
            return res.status(400).json({
                error: 'El enlace de recuperación no es válido'
            });
        }

        if (!password || String(password).length < 8) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        const tokenEncontrado = await buscarTokenValido(token, 'RECUPERACION_PASSWORD');

        if (!tokenEncontrado) {
            return res.status(400).json({
                error: 'El enlace venció, ya fue utilizado o no es válido'
            });
        }

        const hash = await bcrypt.hash(password, 10);
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [tokens] = await conexion.execute(
            `SELECT id_token, id_usuario
             FROM token_cuenta
             WHERE id_token = ?
               AND usado = 0
               AND tipo = 'RECUPERACION_PASSWORD'
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
            'UPDATE usuario SET password_hash = ? WHERE id_usuario = ?',
            [hash, tokens[0].id_usuario]
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
            mensaje: 'La contraseña se actualizó. Ya podés iniciar sesión.'
        });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error('Error al revertir la transacción:', errorRollback);
            }
        }

        console.error('Error al restablecer contraseña:', error);

        return res.status(500).json({
            error: 'No se pudo restablecer la contraseña'
        });
    } finally {
        if (conexion) {
            conexion.release();
        }
    }
}

module.exports = {
    solicitarRecuperacion,
    restablecerPassword
};
