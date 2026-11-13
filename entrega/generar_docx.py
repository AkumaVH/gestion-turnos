from docx import Document
from docx.shared import Pt, Cm, RGBColor
from pathlib import Path

base = Path(__file__).resolve().parent
capturas = base / "capturas"
out = base / "Modificaciones.docx"

doc = Document()
for section in doc.sections:
    section.top_margin = Cm(1.4)
    section.bottom_margin = Cm(1.4)
    section.left_margin = Cm(1.6)
    section.right_margin = Cm(1.6)


def add_heading(text, size=16):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor(0x00, 0x28, 0x55)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.space_before = Pt(2)


def add_sub(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(12)
    run.font.color.rgb = RGBColor(0x00, 0x28, 0x55)
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)


def add_body(text):
    p = doc.add_paragraph(text)
    for run in p.runs:
        run.font.size = Pt(10)
    p.paragraph_format.space_after = Pt(3)


def add_bullet(text):
    p = doc.add_paragraph(text, style="List Bullet")
    for run in p.runs:
        run.font.size = Pt(10)
    p.paragraph_format.space_after = Pt(1)


add_heading("Modificaciones — Gestión de turnos médicos (2° Parcial)")
add_body("Integrante: Lima Ivan")
add_body("Repositorio: https://github.com/AkumaVH/gestion-turnos")

add_sub("1. Validaciones incorporadas (al menos dos)")
add_bullet(
    "No se permiten turnos en fecha/hora anterior a la actual, ni fuera del horario "
    "del centro (lun–vie 8:00–20:00, sáb 8:00–14:00, domingo cerrado)."
)
add_bullet(
    "No se permiten superposiciones del mismo médico, del mismo equipo ni del mismo "
    "paciente. Un turno cancelado libera el horario."
)
add_body(
    "Además se controla que el médico pueda realizar la práctica, que el equipo sea "
    "compatible y que no se modifique un turno cancelado. Están en el backend "
    "(turnoService / turnoValidator) y el frontend muestra el error."
)

add_sub("2. Perfiles, sesiones y permisos")
add_body(
    "Perfiles: administrador (1), médico (2) y paciente (3). Login con JWT. El backend "
    "protege las rutas con verificarToken y autorizarRol. El frontend muestra solo las "
    "opciones del rol. El médico solo ve sus turnos; el paciente solo los propios; la "
    "confirmación la hace el administrador."
)

add_sub("3. Mejora funcional")
add_body(
    "Gestión integrada del turno: reservar, confirmar, reprogramar y cancelar, más "
    "filtros por fecha, estado, paciente y médico. Si se reprograma un turno confirmado, "
    "vuelve a estado Reservado. Integrado en frontend, backend y MySQL."
)

add_sub("4. Archivos principales modificados / agregados para el parcial")
add_body(
    "Backend: routes/turnoRoutes.js, controllers/turnoController.js, "
    "services/turnoService.js, middlewares/turnoValidator.js, "
    "middlewares/authMiddleware.js, middlewares/autorizarRol.js, utils/fechas.js. "
    "Frontend: pages/dashboard.html, js/dashboard.js, js/api.js. "
    "Base: consultas a turno/registra y estados Reservado/Confirmado/Cancelado."
)

add_sub("5. Capturas de funcionamiento")
add_body("Listado de turnos con acciones según estado:")
doc.add_picture(str(capturas / "turnos-lista.png"), width=Cm(16.5))
add_body("Validación: el centro permanece cerrado los domingos:")
doc.add_picture(str(capturas / "error-domingo.png"), width=Cm(11))
add_body("Filtro por fecha y turno reservado:")
doc.add_picture(str(capturas / "filtro-fecha.png"), width=Cm(16.5))

doc.save(out)
print(f"saved {out} ({out.stat().st_size} bytes)")
