const db = require('../config/database');

async function probarConexion() {
    try {
        const [resultado] = await db.query('SELECT 1 AS conectado');
        console.log('Conexión a MySQL OK');
        console.log(resultado);
    } catch (error) {
        console.error('Error de conexión:', error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

probarConexion();
