# Gestión de turnos médicos

Sistema de la cursada de Programación III, ampliado con lo del segundo parcial.

## Cómo arrancarlo

Hace falta Node y el MySQL de XAMPP (puerto 3306, usuario `root`, sin contraseña).

```bat
cd backend
npm install
node scripts/importarDb.js
node scripts/seed.js
npm start
```

Abrí http://localhost:3000

## Cuentas de prueba

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@turnos.com | AdminTurnos2026! |
| Médico (matrícula 1001) | medico@turnos.com | MedicoTurnos2026! |
| Paciente (DNI 30100101) | juan.perez@gmail.com | PacienteTurnos2026! |

## Qué incluye

- Login JWT, roles administrador / médico / paciente y permisos por perfil.
- Registro con verificación de correo y recuperación de contraseña.
- Validaciones de agenda: horario del centro, fecha no pasada, médico y equipo compatibles, sin superposiciones.
- Gestión de turnos: reservar, confirmar, reprogramar, cancelar y filtrar.
