const nodemailer = require('nodemailer');

let transporter;

async function obtenerTransporter() {
    if (transporter) {
        return transporter;
    }

    const cuenta = await Promise.race([
        nodemailer.createTestAccount(),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Tiempo de espera del correo de prueba')), 12000);
        })
    ]);

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: cuenta.user,
            pass: cuenta.pass
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });

    return transporter;
}

async function enviarCorreo({ to, subject, text, html }) {
    try {
        const conexion = await obtenerTransporter();

        const info = await conexion.sendMail({
            from: '"Gestión de Turnos Médicos" <pruebas@gestion-turnos.test>',
            to,
            subject,
            text,
            html
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);

        console.log('Correo enviado al servicio de pruebas.');
        console.log('Asunto:', subject);
        console.log('Vista previa:', previewUrl);

        return {
            messageId: info.messageId,
            previewUrl
        };
    } catch (error) {
        console.error('Error al enviar el correo:', error.message);
        return null;
    }
}

module.exports = { enviarCorreo };
