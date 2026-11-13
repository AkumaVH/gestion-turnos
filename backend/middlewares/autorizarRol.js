function autorizarRol(...rolesPermitidos) {
    return function (req, res, next) {
        if (!req.usuario) {
            return res.status(401).json({
                error: 'Se requiere autenticación'
            });
        }

        const idRol = Number(req.usuario.id_rol);

        if (!rolesPermitidos.includes(idRol)) {
            return res.status(403).json({
                error: 'No tenés permisos para realizar esta acción'
            });
        }

        next();
    };
}

module.exports = autorizarRol;
