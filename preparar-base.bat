@echo off
cd /d "%~dp0backend"
echo Importando la base...
node scripts\importarDb.js
if errorlevel 1 goto ERROR
echo Creando cuentas de prueba...
node scripts\seed.js
if errorlevel 1 goto ERROR
echo.
echo Listo. Para arrancar el servidor: cd backend ^&^& npm start
echo Despues abri http://localhost:3000
pause
exit /b 0

:ERROR
echo No se pudo preparar la base.
pause
exit /b 1
