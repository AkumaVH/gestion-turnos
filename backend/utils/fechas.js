const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MEDIOS = ['Teléfono', 'Correo electrónico'];
const ESTADOS = ['Reservado', 'Confirmado', 'Cancelado'];

function normalizarHora(hora) {
    if (typeof hora !== 'string') {
        return null;
    }

    const coincidencia = hora.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

    if (!coincidencia) {
        return null;
    }

    const horas = Number(coincidencia[1]);
    const minutos = Number(coincidencia[2]);
    const segundos = Number(coincidencia[3] || 0);

    if (horas > 23 || minutos > 59 || segundos > 59) {
        return null;
    }

    const dos = (numero) => String(numero).padStart(2, '0');
    return `${dos(horas)}:${dos(minutos)}:${dos(segundos)}`;
}

function fechaValida(fecha) {
    if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return false;
    }

    const [anio, mes, dia] = fecha.split('-').map(Number);
    const fechaLocal = new Date(anio, mes - 1, dia);

    return fechaLocal.getFullYear() === anio
        && fechaLocal.getMonth() === mes - 1
        && fechaLocal.getDate() === dia;
}

function diaSemana(fecha) {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return DIAS[new Date(anio, mes - 1, dia).getDay()];
}

function aMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
}

function aHora(minutosTotales) {
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;
    const dos = (numero) => String(numero).padStart(2, '0');
    return `${dos(horas)}:${dos(minutos)}:00`;
}

function validarHorarioCentro(fecha, hora, duracion) {
    const inicio = aMinutos(hora);
    const fin = inicio + duracion;
    const dia = diaSemana(fecha);

    if (dia === 'Domingo') {
        return 'El centro permanece cerrado los domingos';
    }

    if (dia === 'Sábado' && (inicio < 8 * 60 || fin > 14 * 60)) {
        return 'Los sábados el horario de atención es de 8:00 a 14:00';
    }

    if (dia !== 'Sábado' && (inicio < 8 * 60 || fin > 20 * 60)) {
        return 'De lunes a viernes el horario de atención es de 8:00 a 20:00';
    }

    const [anio, mes, diaMes] = fecha.split('-').map(Number);
    const [horas, minutos, segundos] = hora.split(':').map(Number);
    const momento = new Date(anio, mes - 1, diaMes, horas, minutos, segundos);

    if (momento.getTime() < Date.now()) {
        return 'No se pueden asignar turnos en una fecha u hora anterior a la actual';
    }

    return null;
}

function enteroPositivo(valor) {
    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero <= 0) {
        return null;
    }

    return numero;
}

module.exports = {
    MEDIOS,
    ESTADOS,
    normalizarHora,
    fechaValida,
    diaSemana,
    aMinutos,
    aHora,
    validarHorarioCentro,
    enteroPositivo
};
