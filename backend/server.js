// Según Trabajo Práctico: servidor Express + rutas
const path = require('path');
const express = require('express');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const turnoroutes = require('./routes/turnoRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
console.log('Rutas de autenticación cargadas correctamente');

app.use('/api/turnos', turnoroutes);
console.log('Rutas de turnos cargadas correctamente');

app.use('/api/catalogos', catalogoRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'Recurso no encontrado'
    });
});

// Frontend servido por el mismo servidor (misma origen; no hace falta CORS)
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
