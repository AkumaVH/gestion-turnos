const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
    const archivo = path.join(__dirname, '../../database/gestion_turnos.sql');
    const sql = fs.readFileSync(archivo, 'utf8');
    const conexion = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: Number(process.env.DB_PORT) || 3306,
        multipleStatements: true
    });

    await conexion.query(sql);
    await conexion.end();
    console.log('Base gestion_turnos importada.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
