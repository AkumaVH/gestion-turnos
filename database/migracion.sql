-- Migración posterior al dump de gestion_turnos.
-- El script backend/scripts/seed.js aplica estos mismos cambios de forma segura.

USE gestion_turnos;

ALTER TABLE usuario
    ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0;

UPDATE usuario
SET email_verificado = 1
WHERE email = 'admin@turnos.com';

CREATE TABLE IF NOT EXISTS token_cuenta (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    tipo ENUM('VERIFICACION_EMAIL', 'RECUPERACION_PASSWORD') NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
        ON DELETE CASCADE
);

ALTER TABLE turno
    MODIFY estado_turno ENUM('Reservado', 'Confirmado', 'Cancelado') NOT NULL;

ALTER TABLE medico
    ADD CONSTRAINT chk_medico_no_se_supervisa
    CHECK (matricula_supervisor IS NULL OR matricula_supervisor <> matricula_medico);
