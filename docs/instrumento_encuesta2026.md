# Instrumento de Encuesta de Empleabilidad de Egresados 2026

> Conversión a Markdown de `data/instrumento_encuesta2026.docx` (Dirección de Empleabilidad y Alumni, Universidad Norbert Wiener). Este documento es la referencia de diseño del cuestionario: define la lógica de saltos (ruteo condicional), las alternativas exactas de cada reactivo y el conteo oficial de preguntas por rama. Se usa como fuente de verdad para verificar que el dashboard (`js/pages/resultados-generales.js`, `js/pivotEngine.js`, `js/calculations.js`) cubra **todos** los reactivos del instrumento y con la lógica de ruteo correcta.
>
> El archivo real que llega al dashboard (`data/respuestas_encuestas_2026.csv`) tiene una columna por cada reactivo/alternativa de este instrumento — ver la sección **Mapeo a columnas del Excel** al final, que ya fue verificada contra los encabezados reales del archivo.

---

## 0. Encabezado y consentimiento informado

- **Fecha:** ……………………….
- Introducción: "Desde la Dirección de Empleabilidad y Alumni de la Universidad Norbert Wiener, buscamos conocer tu trayectoria profesional y mantenernos cerca de ti para seguir fortaleciendo nuestra comunidad de egresados."
- Aviso de confidencialidad: la información se usa solo con fines académicos, estadísticos y de mejora continua; tratamiento confidencial conforme a la normativa de protección de datos vigente.
- **Pregunta de consentimiento:** "¿Acepta participar en esta encuesta y autoriza el uso de la información brindada para los fines antes descritos?"
  - Sí, acepto participar y autorizo el tratamiento de mis datos para los fines indicados.
  - No acepto participar. *(Si responde No, la encuesta termina: "Lamentamos que no pueda participar de este proceso...")*
- Base legal citada: Ley Nº 29733 (Ley de Protección de Datos Personales) y D.S. Nº 003-2013-JUS (su reglamento).

### Datos de identificación (todos los casos)
- Nombres y apellidos
- Programa Académico
- Año de egreso
- DNI
- Teléfono

---

## 1. SITUACIÓN LABORAL

### P1 — ¿Actualmente te encuentras trabajando o realizando una actividad remunerada que genere ingresos?
- a. Sí → continúa en **"EN CASO SÍ TRABAJE"**
- b. No → salta a la sección **"EN CASO NO TRABAJE"** (más abajo)

---

## 2. RAMA "EN CASO SÍ TRABAJE" (bloque con 26 preguntas oficiales)

### P2 — ¿Cuál es tu condición laboral actual?
1. Trabajador dependiente (empleado por una institución o empresa)
2. Profesional independiente (brinda servicios por cuenta propia)
3. Propietario o socio de negocio/emprendimiento

Cada alternativa dispara una sub-pregunta condicional **2.x**:

#### 2.1 — Si marcó "Trabajador dependiente": ¿Cuál es su modalidad de vinculación laboral?
- Nombrado(a)
- Contrato a plazo indeterminado
- Contrato a plazo fijo (CAS, suplencia, temporal u otros)
- Locación de servicios exclusiva para una institución
- SERUMS remunerado
- Otro (especificar)

#### 2.2 — Si respondió "Profesional independiente": ¿Cómo desarrolla principalmente su actividad profesional?
- Consultorio propio
- Atención domiciliaria
- Servicios por recibo por honorarios para empresas o instituciones
- Consultoría especializada
- Teleatención o servicios virtuales
- Otro (especificar)

#### 2.3 — Si respondió "Propietario o socio de negocio/emprendimiento": Respecto a su emprendimiento o negocio
- Formalizado (RUC activo y actividad declarada)
- En proceso de formalización
- No formalizado

##### 2.3.1 — ¿El emprendimiento está relacionado con su profesión?
- Sí / No

### P3 — ¿Cuál es el nombre de la empresa y cuál es tu cargo actual?
*(Ejemplo: Asistente de Recursos Humanos, Jefe de área, Gerente general, etc.)*

- **3.1** Nombre de la empresa donde trabajas actualmente *(abierta)*
- **3.2** Rubro de empresa:
  1. Salud y bienestar
  2. Educación
  3. Sector público
  4. Servicios legales y jurídicos
  5. Servicios financieros y seguros
  6. Comercio y retail
  7. Tecnología y telecomunicaciones
  8. Manufactura e industria
  9. Construcción, infraestructura, minería y energía
  10. Transporte y logística
  11. Consultoría y servicios empresariales
  12. Emprendimiento o negocio propio
  13. Otro
- **3.3** Tipo de empresa *(no se pregunta a emprendedores)*: Pública / Privada / ONG
- **3.4** Modalidad de trabajo: Presencial / Remoto / Híbrido
- **3.5** Cargo — catálogo cerrado y **distinto según grupo de carrera** (el encuestador no lee alternativas, selecciona la categoría que mejor describe la respuesta libre):
  - **Categoría de Cargo SALUD** (28 opciones): Administrativo/Apoyo asistencial, Administrativo/Atención al cliente, Analista/Asistente de Laboratorio, Asistente/Apoyo en farmacia, Asistente Clínico/Médico, Asistente Dental, Control de Calidad/Analista, Director/a Técnico, Docencia, Fisioterapeuta/Terapeuta Físico, Gestión/Dirección, Gestión/Supervisión, Médico Asistencial/General, Nutricionista, Obstetra/Asistencia Obstétrica, Odontólogo/a/Cirujano Dentista, Profesional de Enfermería, Profesional Químico Farmacéutico, Psicólogo/a Clínico/Asistencial, Recursos Humanos, SERUM remunerado, Técnico de Laboratorio, Técnico en Enfermería, Técnico en Farmacia, Técnico en Nutrición/Apoyo, Tecnólogo/a Médico, Terapeuta a domicilio/Independiente, Otros.
  - **Categoría de Cargo NID** (Negocios/Ingeniería/Derecho — 25 opciones): Abogado/a, Administrativo/Apoyo, Analista/Especialista, Analista Contable/Financiero, Analista de Sistemas/TI, Área Comercial/Ventas, Asistente/Apoyo Administrativo, Asistente/Auxiliar Contable, Asistente Legal/Judicial, Atención al Cliente/Recepción, Contador/a, Dirección/Gerencia, Docencia, Función Policial/Militar, Gestión/Administración, Gestión Hotelera/Operaciones, Ingeniería/Operaciones, Logística/Operaciones, Programación/Desarrollo, Recursos Humanos, Seguridad/Prevención, Soporte Técnico/Helpdesk, Supervisión/Coordinación, Ventas/Asesoría Comercial, Otros.
- **Distrito donde labora** *(abierta)*

### P4 — ¿Cuánto tiempo estás desempeñándote en el cargo actual? *(no se pregunta a emprendedores ni independientes)*
- Menos de 1 año
- De 1 a 2 años
- De 2 a 5 años
- De 5 a 10 años
- 10 años a más

### P5 — ¿Qué tan satisfecho te sientes con tu actividad laboral actual?
- Muy satisfecho / Satisfecho / Ni satisfecho ni insatisfecho / Insatisfecho / Muy insatisfecho

### P6 — ¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?
- Sí, totalmente relacionada / Sí, parcialmente relacionada / No, no está relacionada

### P7 — ¿Has recibido algún ascenso en los últimos 5 años? *(no se pregunta a emprendedores/independientes)*
- Sí / No

### P8 — ¿Tienes personal a tu cargo?
- Sí, menos de 10 personas / Sí, de 10 a 20 personas / Sí, más de 20 personas / No

### P9 — ¿Cuál es tu ingreso mensual bruto aproximado?
*(Se solicita para, en caso de interés, enviar ofertas laborales acordes al sueldo base actual)*
- Hasta S/. 1,500
- Entre S/. 1,501 y S/. 3,000
- Entre S/. 3,001 y S/. 5,000
- Entre S/. 5,001 y S/. 8,000
- Más de S/. 8,001
- Prefiero no decirlo

### Trabajo Inicial

### P10 — *(Solo egresados NID)* ¿Realizaste prácticas preprofesionales durante tu carrera?
- Sí. ¿En qué empresa realizaste tus prácticas preprofesionales? *(abierta si Sí)*
- No

### P11 — ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado?
- De 1 a 3 meses / De 3 a 6 meses / De 6 a 12 meses / 12 meses a más / Ya me encontraba trabajando al egresar

### P11.1 — ¿Cuál era tu cargo de tu primer trabajo luego de haber egresado? *(abierta)*

### P12 — ¿Tu primer empleo estuvo relacionado con la carrera estudiada?
- Sí / No

### P13 — En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener a un familiar, amigo o colega? *(NPS)*
- Escala 0–10

### P13.1 — ¿Cuál es la principal razón de la calificación otorgada? *(abierta)*

### P14 — ¿Te gustaría participar en alguna de las siguientes iniciativas para egresados? *(múltiple, puede marcar más de una)*
- Networking con egresados
- Mentoría a estudiantes
- Participación como ponente en charlas, conferencias o eventos académicos
- Participación en talleres y cursos de actualización profesional
- Acceso a oportunidades laborales exclusivas para egresados
- Beneficios y convenios para la comunidad Alumni
- Actividades de voluntariado e impacto social
- Participación en campeonatos y actividades deportivas Alumni
- Integrar la Red de Embajadores Alumni Wiener
- No tengo interés en participar actualmente

> **Total oficial de la rama "Sí trabajan": 26 preguntas** (contando sub-preguntas condicionales y aperturas).

---

## 3. RAMA "EN CASO NO TRABAJE" — Perfil que "No trabaja"

### P1 — ¿Cuál es la principal razón por la que no te encuentras trabajando actualmente?
- Estoy buscando, pero todavía no logro insertarme a un trabajo
- Me encuentro estudiando un Posgrado u otra Carrera
- Motivos personales/familiares me impiden trabajar
- Estoy iniciando un proyecto personal (negocio propio)
- Otros *(especificar, abierta)*

### P2 — ¿Hace cuánto tiempo estás en situación de desempleo?
- De 1 a 3 meses / De 3 a 6 meses / De 6 a 12 meses / Más de 12 meses

### P — *(Solo egresados NID)* ¿Realizaste prácticas preprofesionales durante tu carrera?
- Sí. ¿En qué empresa? *(abierta)* / No
- *(mismo reactivo que en la rama "Sí trabaja"; aplica igual a quienes no trabajan)*

### P3 — ¿Has trabajado anteriormente?
- Sí / No

### P4 — *(Si P3 = Sí)* ¿Cuánto tiempo te tomó obtener tu primer trabajo luego de haber egresado?
- De 1 a 3 meses / De 3 a 6 meses / De 6 a 12 meses / Más de 12 meses / Ya me encontraba trabajando al egresar

### P4.1 — ¿Cuál era tu cargo de tu primer trabajo luego de haber egresado? *(abierta)*

### P5 — ¿Tu primer empleo estuvo relacionado con la carrera estudiada?
- Sí / No

### P6 — En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...? *(NPS, misma escala que P13 de la rama "Sí trabaja")*

### P6.1 — ¿Cuál es la principal razón de la calificación otorgada? *(abierta)*

### P7 — ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? *(múltiple)*
- La Universidad ya me formó, ahora conseguir empleo depende de mí
- Brindándome cursos y actividades de actualización profesional
- Informándome constantemente ofertas de empleo
- Entrenándome para enfrentar mejor mis entrevistas de trabajo
- Otro *(especificar)*

> **Total oficial de la rama "No trabajan": 16 preguntas.**

---

## 4. FORMACIÓN POST EGRESO (para todos — converge ambas ramas)

### ¿Cuál es su situación actual respecto a la colegiatura profesional?
- Colegiado(a) y habilitado(a)
- Colegiado(a), pero no habilitado(a)
- No me encuentro colegiado(a)
- No aplica a mi profesión

### ¿Has realizado estudios de posgrado después de egresar?
- Sí / No

### *(Si Sí)* ¿En qué año comenzó sus estudios de posgrado? *(abierta)*

### *(Si Sí)* ¿Qué tipo de estudios de posgrado ha realizado o se encuentra realizando?
- Maestría
- Doctorado
- Diplomado
- Programa de especialización – Segunda especialización
- Curso de educación continua / corta duración
- Otro (especificar)

### *(Si Sí)* ¿Qué tipo de institución ofrece u ofreció el programa de posgrado que cursó o se encuentra cursando?
- Universidad peruana
- Universidad extranjera
- Instituto de educación superior
- Colegio profesional
- Otro (especificar)

### *(Si "Universidad peruana" o "Universidad extranjera")* Nombre de la Universidad *(abierta)*

### ¿Tienes interés en llevar un posgrado en la UNW a corto plazo?
- Sí / No

---

## 5. Cierre

Agradecimiento y datos de contacto: Angie Torres, coordinadora de empleabilidad y alumni (angie.torres@uwiener.edu.pe).

---

## 6. Lógica de ruteo (resumen para QA del dashboard)

```
P1 ¿Trabaja?
├── Sí ────────────────────────────────────────────────────────────────┐
│   P2 Condición laboral                                                │
│   ├── Dependiente     → 2.1 Modalidad de vinculación laboral          │
│   ├── Independiente   → 2.2 Actividad profesional independiente       │
│   └── Propietario     → 2.3 Formalización + 2.3.1 Relación c/profesión│
│   P3 Empresa/cargo → 3.1 nombre, 3.2 rubro, 3.3 tipo empresa*,        │
│                       3.4 modalidad trabajo, 3.5 cargo (SALUD/NID),   │
│                       distrito                                        │
│   P4 Tiempo en cargo actual*  (*no aplica a independientes/propios)   │
│   P5 Satisfacción laboral                                             │
│   P6 Pertinencia con la carrera                                       │
│   P7 Ascenso 5 años*          (*no aplica a independientes/propios)   │
│   P8 Personal a cargo                                                 │
│   P9 Ingreso mensual bruto                                            │
│   P10 Prácticas preprofesionales (solo NID)                           │
│   P11 Tiempo 1er empleo → P11.1 cargo 1er empleo                      │
│   P12 1er empleo relacionado con carrera                              │
│   P13 NPS → P13.1 razón (abierta)                                     │
│   P14 Iniciativas Alumni de interés (múltiple)                        │
└── No ───────────────────────────────────────────────────────────────┐
    P1 Razón principal de no trabajar                                  │
    P2 Tiempo en desempleo                                             │
    P(NID) Prácticas preprofesionales (solo NID)                       │
    P3 ¿Trabajó anteriormente?                                         │
    ├── Sí → P4 tiempo 1er trabajo → P4.1 cargo 1er trabajo             │
    └── No → (P4/P4.1 no aplican)                                      │
    P5 1er empleo relacionado con carrera                               │
    P6 NPS → P6.1 razón (abierta)                                       │
    P7 Apoyo de la Universidad para conseguir empleo (múltiple)         │
                                                                         │
Converge para AMBAS ramas ──────────────────────────────────────────────┘
    Colegiatura profesional
    Posgrado (Sí/No) → tipo de estudios → tipo de institución → (si universidad) nombre
    Interés en posgrado UNW a corto plazo
```

**Implicación para los gráficos "Distribución General":** los reactivos marcados con `*` o los que dependen de una rama (2.1/2.2/2.3, P4, P7 solo dependientes/independientes; P10/P4 de la rama "No trabaja") deben excluir del denominador a quienes no correspondían responder — no tratar los vacíos como "No precisa" real, sino como "No aplica". El resto de la lógica de "No precisa" (dato vacío pero sí aplicaba) se mantiene igual al resto del dashboard.

---

## 7. Mapeo a columnas del Excel (`data/respuestas_encuestas_2026.csv`)

Verificado contra los encabezados reales del archivo fuente que usa el dashboard (81 columnas). Esta tabla es la referencia para nuevos campos en `js/pivotEngine.js` / `js/calculations.js`.

| # | Reactivo del instrumento | Columna exacta en el Excel | Campo `PivotEngine`/`Calculations` |
|---|---|---|---|
| — | Condición aceptó participar | `¿Acepta participar en esta encuesta...?` | — (filtrado antes de exportar) |
| — | Programa Académico | `CARRERA` (renombrada; antes `Programa Académico:`) | `carrera` |
| — | Año de egreso | `Año de Egreso` (renombrada; antes `Año de egreso:`) | `anioEgreso` |
| P1 | ¿Trabaja actualmente? | `1. ¿Actualmente te encuentras trabajando o realizando una actividad remunerada que genere ingresos?` | `trabaja` |
| P2 | Condición laboral | `2. ¿Cuál es tu condición laboral actual?` | `condicion` |
| 2.1 | Modalidad de vinculación (dependientes) | `2.1 Si marco, "Trabajador dependiente". ¿Cuál es su modalidad de vinculación laboral? (E: LEER ALTERNATIVAS)` | `modalidadVinculacion` **(nuevo)** |
| 2.2 | Actividad profesional (independientes) | `2.2 Si responde "Profesional independiente". ¿Cómo desarrolla principalmente su actividad profesional? (E: LEER ALTERNATIVAS)` | `actividadIndependiente` **(nuevo)** |
| 2.3 | Formalización del emprendimiento | `2.3 Si responde "Propietario o socio de negocio/emprendimiento". Respecto a su emprendimiento o negocio: (E: LEER ALTERNATIVAS)` | `emprendimientoFormalizacion` (ya usado en `emprendimientos.js`, ahora también en `pivotEngine`) |
| 2.3.1 | Emprendimiento relacionado con profesión | `2.3.1 ¿El emprendimiento está relacionado con su profesión?` | `emprendimientoRelacionado` (ya usado en `emprendimientos.js`, ahora también en `pivotEngine`) |
| 3.1 | Nombre de la empresa | `3.1 Nombre de la empresa donde trabajas actualmente:` | *(abierta, no se grafica)* |
| 3.2 | Rubro de empresa | `3.2 Rubro de empresa:` | `rubro` |
| 3.3 | Tipo de empresa | `3.3 Tipo de empresa (no se pregunta a emprendedores):` | `tipoEmpresa` **(nuevo)** |
| 3.4 | Modalidad de trabajo | `3.4 Modalidad de trabajo` | `modalidad` |
| 3.5 | Cargo (Salud) | `3.5 Cargo Salud: (NO LEER ALTERNATIVAS...)` | `cargoSalud` (mapeado en `Calculations.cols`, sin gráfico dedicado — catálogo de 28 categorías) |
| 3.5 | Cargo (NID) | `3.5 Cargo NID: (NO LEER ALTERNATIVAS...)` | `cargoNID` (mapeado en `Calculations.cols`, sin gráfico dedicado — catálogo de 25 categorías) |
| — | Distrito donde labora | `3.1 ¿En qué distrito laboras actualmente? Ejemplo (Lima-La Victoria)` | `distritoLabora` (mapeado, uso geográfico en otras páginas) |
| P4 | Tiempo en el cargo actual | `4. ¿Cuánto tiempo estas desempeñándote en el cargo actual? (No se pregunta a emprendedores/ni independientes)` | `tiempoCargoActual` **(nuevo)** |
| P5 | Satisfacción laboral | `5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)` | `satisfaccion` |
| P6 | Pertinencia con la carrera | `6. ¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?` | `pertinencia` |
| P7 | Ascenso en 5 años | `7. ¿Has recibido algún ascenso en los últimos 5 años? (No se pregunta a emprendedores/ni independientes)` | `ascenso` |
| P8 | Personal a cargo | `8. ¿Tienes personal a tu cargo?` | `personalCargo` |
| P9 | Ingreso mensual bruto | `9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información...)` | `salario` |
| P10 | Prácticas preprofesionales (NID) | `10. (Solo para egresados NID) ¿Realizaste prácticas preprofesionales durante tu carrera?` | `practicasNID` **(nuevo)** |
| P11 | Tiempo 1er empleo | `11. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado?` | `tiempoPrimerEmpleo` |
| P11.1 | Cargo 1er empleo | `11.1 ¿Cuál era tu cargo de tu primer trabajo luego de haber egresado?` | *(abierta, no se grafica)* |
| P12 | 1er empleo relacionado con carrera | `12. ¿Tu primer empleo estuvo relacionado con la carrera estudiada?` | `primerEmpleo` |
| P13 | NPS | `13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?` | `nps` |
| P13.1 | Razón NPS | `13.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):` | análisis cualitativo (`preguntas-abiertas`) |
| P14 | Iniciativas Alumni | `14. ...iniciativas...?_<alternativa>` (9 columnas dummy) | `iniciativa*` (múltiple, 9 campos) |
| No1 | Razón de no trabajar | `1. ¿Cuál es la principal razón por la que no te encuentras trabajando actualmente?` | `razonNoTrabaja` |
| No2 | Tiempo en desempleo | `2. ¿Hace cuánto tiempo estás en situación de desempleo?` | `tiempoDesempleo` (mapeado en `Calculations.cols`, ahora también en `pivotEngine` **(nuevo)**) |
| No3 | ¿Trabajó anteriormente? | `3. ¿Has trabajado anteriormente?` | `trabajadoAnteriormente` **(nuevo)** |
| No4 | Tiempo 1er trabajo (rama no trabaja) | `4. En caso la respuesta anterior haya sido SÍ, ¿cuánto tiempo te tomó obtener tu primer trabajo...?` | se agrega al mismo `tiempoPrimerEmpleo` si se decide unificar ramas |
| No4.1 | Cargo 1er trabajo (rama no trabaja) | `4.1 ¿Cuál era tu cargo de tu primer trabajo luego de haber egresado?` | *(abierta, no se grafica)* |
| No5 | 1er empleo relacionado (rama no trabaja) | `5. ¿Tu primer empleo estuvo relacionado con la carrera estudiada?` | se agrega al mismo `primerEmpleo` si se decide unificar ramas |
| No6 | NPS (rama no trabaja) | `6. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?` | `npsDesempleado` (mapeado en `Calculations.cols`) |
| No6.1 | Razón NPS (rama no trabaja) | `6.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):` | análisis cualitativo |
| No7 | Apoyo de la Universidad | `7. ¿De qué manera crees...apoyar en conseguir un empleo?_<alternativa>` (5 columnas dummy) | `apoyo*` (múltiple, 5 campos) |
| F1 | Colegiatura | `1. ¿Cuál es su situación actual respecto a la colegiatura profesional? (E: LEER ALTERNATIVAS)` | `colegiatura` |
| F2 | Posgrado (Sí/No) | `2. ¿Has realizado estudios de posgrado después de egresar?` | `posgrado` |
| F3 | Año inicio posgrado | `3. ¿En qué año comenzó sus estudios de posgrado? (abierta)` | *(abierta, no se grafica)* |
| F4 | Tipo de estudios de posgrado | `4. ¿Qué tipo de estudios de posgrado ha realizado o se encuentra realizando?` | `tipoPosgrado` **(nuevo)** |
| F5 | Tipo de institución de posgrado | `5. ¿Qué tipo de institución ofrece u ofreció el programa de posgrado...?` | `tipoInstitucionPosgrado` **(nuevo)** |
| F5.1 | Nombre de la universidad | `5.1 Nombre de la Universidad:` | *(abierta, no se grafica)* |
| F6 | Interés en posgrado UNW | `6. ¿Tienes interés en llevar un posgrado en la UNW a corto plazo?` | `interesPosgrado` |

**(nuevo)** marca los campos que no existían en `js/pivotEngine.js` ni se graficaban en `js/pages/resultados-generales.js` antes de esta revisión, pese a que la columna ya llega en `respuestas_encuestas_2026.csv`. Fueron agregados como parte de esta alineación.

### Actualización 2026-09-21: cobertura completa de Resultados Generales + página nueva

Se agregaron 8 preguntas más a `QUESTIONS` en `js/pages/resultados-generales.js`, usando campos
que ya existían en `js/pivotEngine.js` pero sin pregunta propia: `tamanoEmpresa`,
`zonaGeografica`, `cargoActual`, `nivelPrimerEmpleo`, `gradoAcademico`, `universidadPosgradoTipo`,
`universidadPosgradoPais`, `posgradoDeseadoCategoria`. Con esto, Resultados Generales cubre
literalmente cada reactivo del instrumento que tiene datos disponibles en el CSV 2026 (ver
`tests/test-resultados-generales.js`, que valida esto automáticamente iterando `QUESTIONS`).

**Página nueva: "Perfil del Egresado que No Trabaja"** (`js/pages/perfil-no-trabaja.js`,
`data-page="perfil-no-trabaja"`, menú lateral junto a "Situación Laboral"). Cubre la rama "No
Trabaja" del instrumento (No1–No7) con un toggle global **PEA (No Ocupada) / No PEA** al inicio
de la página que controla todos sus gráficos a la vez (misma clasificación oficial
`Calculations.classifyLaborStatus` que usa el resto del dashboard). Incluye: Motivo Principal,
Tiempo en Situación de Desempleo, ¿Ha Trabajado Anteriormente?, Apoyo de la Universidad esperado
(multi-select) y NPS del segmento. Validado en `tests/test-perfil-no-trabaja.js`.

**Corrección importante:** la pregunta No2 "¿Hace cuánto tiempo estás en situación de
desempleo?" se le hace a **todos** los egresados de la rama "No Trabaja", sin importar el motivo
declarado — no es exclusiva de quienes buscan empleo activamente (PEA No Ocupada). Se verificó
contra los datos crudos: el 100% de los egresados "No PEA" también tiene una respuesta válida en
esta pregunta.

### Nota sobre `respuestas_encuestas_2025.csv` (dataset legado)
El CSV 2025 usa un instrumento **anterior**, con menos reactivos y nombres de columna distintos (p. ej. no tiene la pregunta 1 "¿Trabaja actualmente?" explícita, sino que la deriva de `Nivel de Emp (Final)`). `js/dataLoader.js#mapNewSurveyColumns` traduce ese dataset legado al esquema de columnas de 2026 solo para los campos que ambos instrumentos comparten. La página **Resultados Generales** consume únicamente `DataLoader.getEncuestas()` (el archivo `respuestas_encuestas_2026.csv`, ya alineado 100% al instrumento 2026), por lo que los campos nuevos listados arriba tienen datos completos y no requieren lógica de compatibilidad con el CSV legado.
