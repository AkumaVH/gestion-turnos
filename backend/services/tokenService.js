const crypto = require('crypto');
const db = require('../config/database');

const TIPOS = ['VERIFICACION_EMAIL', 'RECUPERACION_PASSWORD'];

function aFechaHora(fecha) {
    const dos = (numero) => String(numero).padStart(2, '0');

    return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;
}

async function crearTokenCuenta(idUsuario, tipo, minutosValidez = 30) {
    if (!TIPOS.includes(tipo)) {
        throw new Error('Tipo de token no válido');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiracion = aFechaHora(new Date(Date.now() + minutosValidez * 60 * 1000));

    await db.execute(
        `UPDATE token_cuenta
         SET usado = 1
         WHERE id_usuario = ?
           AND tipo = ?
           AND usado = 0`,
        [idUsuario, tipo]
    );

    await db.execute(
        `INSERT INTO token_cuenta
            (id_usuario, token_hash, tipo, fecha_expiracion, usado)
         VALUES (?, ?, ?, ?, 0)`,
        [idUsuario, tokenHash, tipo, expiracion]
    );

    return token;
}

async function buscarTokenValido(token, tipo) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [filas] = await db.execute(
        `SELECT id_token, id_usuario
         FROM token_cuenta
         WHERE token_hash = ?
           AND tipo = ?
           AND usado = 0
           AND fecha_expiracion > NOW()
         LIMIT 1`,
        [tokenHash, tipo]
    );

    return filas.length > 0 ? filas[0] : null;
}

async function marcarTokenUsado(idToken, conexion = db) {
    const [resultado] = await conexion.execute(
        `UPDATE token_cuenta
         SET usado = 1
         WHERE id_token = ?
           AND usado = 0`,
        [idToken]
    );

    return resultado.affectedRows === 1;
}

module.exports = {
    crearTokenCuenta,
    buscarTokenValido,
    marcarTokenUsado
};
