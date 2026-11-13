# Gestión de turnos médicos

Proyecto de Programación III armado siguiendo el **Trabajo Práctico** (paso a paso de la cursada) y ampliado para el **2° parcial**.

## Entorno MySQL (importante)

En la guía aparece:

```env
DB_PORT=3307
DB_PASSWORD=1234
```

En esta PC (XAMPP) MySQL escucha en **3306** y `root` **sin contraseña**. Por eso el `.env` local usa esos valores. No cambia la lógica del sistema: solo la dirección del servidor MySQL.

El archivo `.env` **no** se sube a GitHub.

## Cómo arrancar

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
| Médico | medico@turnos.com | MedicoTurnos2026! |
| Paciente | juan.perez@gmail.com | PacienteTurnos2026! |

## Qué viene del Trabajo Práctico (guía)

1. Estructura `backend` / `frontend` / `database`
2. Express + `mysql2` + `dotenv`
3. `config/database.js` y servidor
4. Rutas, controllers y capa de servicios
5. CRUD de turnos + middlewares de validación
6. Login con JWT + bcrypt
7. Middleware de token y de roles
8. Frontend con `fetch` (login + panel)
9. Registro, verificación de correo y recuperación (Nodemailer)

## Qué se amplió para el 2° parcial

Sobre esa base (sin cambiar de stack):

1. **Validaciones nuevas** en backend (y mensaje en el front): fecha/horario del centro, no pasado, médico/equipo compatibles, sin superposiciones, no modificar cancelados.
2. **Perfiles y permisos reales** admin / médico / paciente (la guía dejaba el ejemplo solo con ADMIN en todas las rutas de turnos).
3. **Mejora funcional**: confirmar, reprogramar, cancelar y filtros, integrada front + API + MySQL.

Archivos clave del parcial: `services/turnoService.js`, `routes/turnoRoutes.js`, `middlewares/turnoValidator.js`, `utils/fechas.js`, `frontend/js/dashboard.js`.
