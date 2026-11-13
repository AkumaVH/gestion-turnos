const AppError = require('../utils/AppError');

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            error: 'El JSON enviado no es válido'
        });
    }

    if (error instanceof AppError) {
        return res.status(error.status).json({
            error: error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        error: 'Error interno del servidor'
    });
}

module.exports = errorHandler;
