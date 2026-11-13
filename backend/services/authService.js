const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function verificarCredenciales(email, password) {
    const [usuarios] = await db.execute(
        `SELECT u.id_usuario, u.email, u.password_hash, u.id_rol, u.activo,
                u.email_verificado, u.dni_paciente, u.matricula_medico, r.nombre_rol
         FROM usuario u
         JOIN rol r ON r.id_rol = u.id_rol
         WHERE u.email = ?`,
        [email]
    );

    if (usuarios.length === 0 || usuarios[0].activo !== 1) {
        return null;
    }

    const usuario = usuarios[0];
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
        return null;
    }

    if (usuario.email_verificado !== 1) {
        return { error: 'EMAIL_NO_VERIFICADO' };
    }

    return {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        id_rol: usuario.id_rol,
        nombre_rol: usuario.nombre_rol,
        dni_paciente: usuario.dni_paciente,
        matricula_medico: usuario.matricula_medico
    };
}

module.exports = {
    verificarCredenciales
};
