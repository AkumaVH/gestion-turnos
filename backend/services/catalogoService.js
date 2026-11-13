const db = require('../config/database');

async function listarPracticas() {
    const [filas] = await db.query(
        `SELECT p.id_practica, p.nombre_practica, p.duracion, p.id_servicio, s.nombre_servicio
         FROM practica p
         JOIN servicio s ON s.id_servicio = p.id_servicio
         ORDER BY s.nombre_servicio, p.nombre_practica`
    );

    return filas;
}

async function listarMedicos(idPractica) {
    if (idPractica) {
        const [filas] = await db.execute(
            `SELECT m.matricula_medico, m.apellido_medico, m.nombre_medico
             FROM medico m
             JOIN practica_medico pm ON pm.matricula_medico = m.matricula_medico
             WHERE pm.id_practica = ?
             ORDER BY m.apellido_medico, m.nombre_medico`,
            [idPractica]
        );

        return filas;
    }

    const [filas] = await db.query(
        `SELECT matricula_medico, apellido_medico, nombre_medico
         FROM medico
         ORDER BY apellido_medico, nombre_medico`
    );

    return filas;
}

async function listarEquipos(idPractica) {
    if (idPractica) {
        const [filas] = await db.execute(
            `SELECT e.id_equipo, e.nombre_equipo
             FROM equipo e
             JOIN practica_equipo pe ON pe.id_equipo = e.id_equipo
             WHERE pe.id_practica = ?
             ORDER BY e.nombre_equipo`,
            [idPractica]
        );

        return filas;
    }

    const [filas] = await db.query(
        `SELECT id_equipo, nombre_equipo
         FROM equipo
         ORDER BY nombre_equipo`
    );

    return filas;
}

async function listarPacientes() {
    const [filas] = await db.query(
        `SELECT dni_paciente, apellido_paciente, nombre_paciente
         FROM paciente
         ORDER BY apellido_paciente, nombre_paciente`
    );

    return filas;
}

module.exports = {
    listarPracticas,
    listarMedicos,
    listarEquipos,
    listarPacientes
};
