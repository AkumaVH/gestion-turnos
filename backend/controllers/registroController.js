const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { crearTokenCuenta } = require('../services/tokenService');
const { enviarCorreo } = require('../services/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function correoValido(correo, maximo) {
    return correo.length <= maximo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

async function registrarPaciente(req, res) {
    let conexion;

    try {
        const {
            dni_paciente,
            nombre_paciente,
            apellido_paciente,
            fec_nac_paciente,
            email,
            password
        } = req.body;

        if (
            !dni_paciente ||
            !nombre_paciente?.trim() ||
            !apellido_paciente?.trim() ||
            !fec_nac_paciente ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                error: 'Todos los datos obligatorios deben completarse'
            });
        }

        const dni = Number(dni_paciente);
        const correo = String(email).trim().toLowerCase();

        if (!Number.isSafeInteger(dni) || dni <= 0) {
            return res.status(400).json({
                error: 'El DNI no es válido'
            });
        }

        if (!correoValido(correo, 50)) {
            return res.status(400).json({
                error: 'Ingresá un correo válido de hasta 50 caracteres'
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        const [usuarios] = await db.execute(
            'SELECT id_usuario FROM usuario WHERE email = ?',
            [correo]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                error: 'Ya existe una cuenta registrada con ese correo'
            });
        }

        const [pacientes] = await db.execute(
            `SELECT dni_paciente, email_paciente
             FROM paciente
             WHERE dni_paciente = ?`,
            [dni]
        );

        if (
            pacientes.length > 0 &&
            (pacientes[0].email_paciente || '').toLowerCase() !== correo
        ) {
            return res.status(409).json({
                error: 'El DNI ya está registrado con otro correo. Contactá con la administración.'
            });
        }

        const hash = await bcrypt.hash(password, 10);

        conexion = await db.getConnection();
        await conexion.beginTransaction();

        if (pacientes.length === 0) {
            await conexion.execute(
                `INSERT INTO paciente (
                    dni_paciente,
                    nombre_paciente,
                    apellido_paciente,
                    fec_nac_paciente,
                    email_paciente
                ) VALUES (?, ?, ?, ?, ?)`,
                [dni, nombre_paciente.trim(), apellido_paciente.trim(), fec_nac_paciente, correo]
            );
        }

        const [resultado] = await conexion.execute(
            `INSERT INTO usuario (
                email, password_hash, id_rol, activo, dni_paciente, email_verificado
            ) VALUES (?, ?, 3, 1, ?, 0)`,
            [correo, hash, dni]
        );

        await conexion.commit();

        const token = await crearTokenCuenta(resultado.insertId, 'VERIFICACION_EMAIL', 30);
        const enlace = `${FRONTEND_URL}/verificar-email.html?token=${token}`;
        const enviado = await enviarCorreo({
            to: correo,
            subject: 'Verificá tu correo - Gestión de Turnos',
            text: `Hola ${nombre_paciente.trim()}. Para verificar tu correo, abrí este enlace: ${enlace}. El enlace vence en 30 minutos.`,
            html: `
                <h2>Verificación de correo</h2>
                <p>Hola ${nombre_paciente.trim()},</p>
                <p>Para activar tu cuenta, hacé clic en el siguiente enlace:</p>
                <p><a href="${enlace}">Verificar mi correo</a></p>
                <p>El enlace vence en 30 minutos.</p>
            `
        });

        return res.status(201).json({
            mensaje: enviado
                ? 'Registro realizado. Revisá el correo para verificar tu cuenta.'
                : 'La cuenta quedó creada, pero no se pudo enviar el correo. Usá el enlace de verificación.',
            previewUrl: enviado?.previewUrl || null,
            verificacionUrl: enviado ? null : enlace
        });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error('Error al revertir la transacción:', errorRollback);
            }
        }

        console.error('Error en registro de paciente:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El DNI o el correo ya se encuentran registrados'
            });
        }

        return res.status(500).json({
            error: 'No se pudo completar el registro. Revisá el servidor.'
        });
    } finally {
        if (conexion) {
            conexion.release();
        }
    }
}

async function registrarMedico(req, res) {
    let conexion;

    try {
        const { matricula_medico, email, password } = req.body;

        if (!matricula_medico || !email || !password) {
            return res.status(400).json({
                error: 'La matrícula, el correo y la contraseña son obligatorios'
            });
        }

        const matricula = Number(matricula_medico);
        const correo = String(email).trim().toLowerCase();

        if (!Number.isSafeInteger(matricula) || matricula <= 0) {
            return res.status(400).json({
                error: 'La matrícula no es válida'
            });
        }

        if (!correoValido(correo, 100)) {
            return res.status(400).json({
                error: 'Ingresá un correo válido'
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        const [medicos] = await db.execute(
            'SELECT matricula_medico FROM medico WHERE matricula_medico = ?',
            [matricula]
        );

        if (medicos.length === 0) {
            return res.status(404).json({
                error: 'La matrícula no existe en el registro de médicos'
            });
        }

        const [usuarios] = await db.execute(
            `SELECT id_usuario
             FROM usuario
             WHERE email = ? OR matricula_medico = ?`,
            [correo, matricula]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                error: 'El correo o la matrícula ya tienen una cuenta registrada'
            });
        }

        const hash = await bcrypt.hash(password, 10);
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [resultado] = await conexion.execute(
            `INSERT INTO usuario (
                email, password_hash, id_rol, activo, matricula_medico, email_verificado
            ) VALUES (?, ?, 2, 1, ?, 0)`,
            [correo, hash, matricula]
        );

        await conexion.commit();

        const token = await crearTokenCuenta(resultado.insertId, 'VERIFICACION_EMAIL', 30);
        const enlace = `${FRONTEND_URL}/verificar-email.html?token=${token}`;
        const enviado = await enviarCorreo({
            to: correo,
            subject: 'Verificá tu correo - Gestión de Turnos',
            text: `Para verificar tu cuenta de médico, abrí este enlace: ${enlace}. El enlace vence en 30 minutos.`,
            html: `
                <h2>Verificación de correo</h2>
                <p>Para verificar tu cuenta de médico, hacé clic en el siguiente enlace:</p>
                <p><a href="${enlace}">Verificar mi correo</a></p>
                <p>El enlace vence en 30 minutos.</p>
            `
        });

        return res.status(201).json({
            mensaje: enviado
                ? 'Registro realizado. Revisá el correo para verificar tu cuenta.'
                : 'La cuenta quedó creada, pero no se pudo enviar el correo. Usá el enlace de verificación.',
            previewUrl: enviado?.previewUrl || null,
            verificacionUrl: enviado ? null : enlace
        });
    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error('Error al revertir la transacción:', errorRollback);
            }
        }

        console.error('Error en registro de médico:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El correo o la matrícula ya están registrados'
            });
        }

        return res.status(500).json({
            error: 'No se pudo completar el registro. Revisá el servidor.'
        });
    } finally {
        if (conexion) {
            conexion.release();
        }
    }
}

module.exports = {
    registrarPaciente,
    registrarMedico
};
