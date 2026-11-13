const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function columnaExiste(tabla, columna) {
    const [filas] = await db.execute(
        `SELECT COUNT(*) AS cantidad
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?`,
        [tabla, columna]
    );

    return Number(filas[0].cantidad) > 0;
}

async function prepararEsquema() {
    if (!(await columnaExiste('usuario', 'email_verificado'))) {
        await db.query(
            `ALTER TABLE usuario
             ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0`
        );
        console.log('Columna email_verificado agregada.');
    }

    await db.query(
        `UPDATE usuario
         SET email_verificado = 1
         WHERE email IN ('admin@turnos.com', 'medico@turnos.com', 'juan.perez@gmail.com')`
    );

    await db.query(`
        CREATE TABLE IF NOT EXISTS token_cuenta (
            id_token INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT NOT NULL,
            token_hash CHAR(64) NOT NULL UNIQUE,
            tipo ENUM('VERIFICACION_EMAIL', 'RECUPERACION_PASSWORD') NOT NULL,
            fecha_expiracion DATETIME NOT NULL,
            usado TINYINT(1) NOT NULL DEFAULT 0,
            fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_token_usuario
                FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
                ON DELETE CASCADE
        )
    `);

    const [estado] = await db.execute(
        `SELECT COLUMN_TYPE
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'turno'
           AND COLUMN_NAME = 'estado_turno'`
    );

    if (!String(estado[0].COLUMN_TYPE).toLowerCase().startsWith('enum')) {
        await db.query(
            `ALTER TABLE turno
             MODIFY estado_turno ENUM('Reservado', 'Confirmado', 'Cancelado') NOT NULL`
        );
        console.log('estado_turno pasó a ser una lista cerrada.');
    }

    const [restriccion] = await db.execute(
        `SELECT COUNT(*) AS cantidad
         FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'medico'
           AND CONSTRAINT_NAME = 'chk_medico_no_se_supervisa'`
    );

    if (Number(restriccion[0].cantidad) === 0) {
        await db.query(
            `ALTER TABLE medico
             ADD CONSTRAINT chk_medico_no_se_supervisa
             CHECK (matricula_supervisor IS NULL OR matricula_supervisor <> matricula_medico)`
        );
        console.log('Un médico no puede supervisarse a sí mismo.');
    }
}

async function guardarUsuario({ email, password, idRol, dni = null, matricula = null }) {
    const hash = await bcrypt.hash(password, 10);
    const [existentes] = await db.execute(
        'SELECT id_usuario FROM usuario WHERE email = ?',
        [email]
    );

    if (existentes.length > 0) {
        await db.execute(
            `UPDATE usuario
             SET password_hash = ?, id_rol = ?, activo = 1, email_verificado = 1,
                 dni_paciente = ?, matricula_medico = ?
             WHERE id_usuario = ?`,
            [hash, idRol, dni, matricula, existentes[0].id_usuario]
        );
        return;
    }

    await db.execute(
        `INSERT INTO usuario (
            email, password_hash, id_rol, activo, dni_paciente, matricula_medico, email_verificado
        ) VALUES (?, ?, ?, 1, ?, ?, 1)`,
        [email, hash, idRol, dni, matricula]
    );
}

async function main() {
    await prepararEsquema();

    await guardarUsuario({
        email: 'admin@turnos.com',
        password: 'AdminTurnos2026!',
        idRol: 1
    });

    await guardarUsuario({
        email: 'medico@turnos.com',
        password: 'MedicoTurnos2026!',
        idRol: 2,
        matricula: 1001
    });

    await guardarUsuario({
        email: 'juan.perez@gmail.com',
        password: 'PacienteTurnos2026!',
        idRol: 3,
        dni: 30100101
    });

    console.log('Base lista.');
    console.log('Admin:    admin@turnos.com / AdminTurnos2026!');
    console.log('Médico:   medico@turnos.com / MedicoTurnos2026!');
    console.log('Paciente: juan.perez@gmail.com / PacienteTurnos2026!');
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.end();
    });
