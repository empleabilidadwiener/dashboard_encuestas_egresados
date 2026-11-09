# Diccionario de Datos — Encuestas de Egresados UNW

> Documento técnico de referencia para agentes de IA y desarrolladores.
> Última actualización: 2026-09-22 (se agregaron los archivos externos "Dato Externo" del Portal
> MiCarrera-MTPE y se corrigió el estado de `Sueldo Promedio`, antes marcada como no mapeada).

---

## Archivo: `data/respuestas_encuestas_2026.csv`

- **Rol:** Fuente principal del dashboard. Alimenta todas las páginas excepto Análisis Evolutivo.
- **Formato:** UTF-8 con BOM, delimitador `;` (punto y coma).
- **Registros:** 3,014 filas.
- **Columnas:** 118 variables.
- **Carga:** Se lee con `XLSX.read(..., { FS: ';' })` en `dataLoader.js`. No pasa por `DataCleaner`.

## Archivo: `data/respuestas_encuestas_2025.csv`

- **Rol:** Fuente histórica. Solo se usa para la página de Análisis Evolutivo (comparativa interanual).
- **Formato:** Latin-1 (ISO 8859-1), delimitador `,` (coma).
- **Carga:** Se lee con `XLSX.read()` y se homologa con `mapNewSurveyColumns()` en `dataLoader.js`. Pasa por `DataCleaner.clean()`.
- **Nota:** Sus cabeceras son diferentes. El mapeo se hace en `dataLoader.js → mapNewSurveyColumns()`.
- **Universo para comparativos (`js/pages/evolutivo.js`):** Encuesta 2025 = egresados **2019–2024**; Encuesta 2026 = egresados **2021–2025**. El CSV 2025 trae además filas con año de egreso 2018 y 12 filas sueltas con año "2025" que quedan fuera de ese rango y se excluyen de todas las comparativas generales. La sección "Comparativa por Cohorte" de esa página usa además la intersección real de ambos rangos (2021–2024), porque necesita que el mismo año de egreso exista en las dos ediciones.

---

## Mapeo completo: Columnas CSV 2026

A continuación se listan **todas** las 118 columnas del CSV 2026, organizadas por bloque temático. Para cada una se indica:
- **Columna CSV:** Nombre exacto de la cabecera.
- **Key `Calculations.cols`:** La clave con la que se referencia en el código JS (si aplica).
- **Tipo de dato / Valores ejemplo.**
- **Uso en dashboard:** Qué página o cálculo la consume.

---

### Bloque 1: Identificación y Metadatos

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 1 | `N°` | — | Entero secuencial: `1`, `2`, ... | Contador de registros. Sin uso analítico. |
| 2 | `DNI:` | — | Texto: `73127320` | Identificador único del egresado. Útil para exportaciones y deduplicación. |
| 3 | `Código` | — | Texto: `2020103415` | Código de matrícula. Sin uso analítico directo. |
| 4 | `Nombres y apellidos:` | `nombres` | Texto: `LISNER NAISS CACERES INGA` | Se usa en `resumen.js` para inferir sexo si la columna `Sexo` falla. |
| 5 | `Correo` | — | Email: `lisner22_95@hotmail.com` | Sin uso analítico. Disponible para exportaciones. |
| 6 | `Teléfono Celular:` | — | Número: `903165910` | Sin uso analítico. Disponible para exportaciones. |
| 7 | `Fecha` | — | Datetime: `2026-07-15 00:00:00` | Fecha de la encuesta. Podría usarse para análisis temporal de respuestas. |
| 8 | `Hora de inicio` | — | Texto: `09:14:37.692-05:00` | Sin uso analítico. |
| 9 | `Hota Fin` | — | Texto: `09:14:37.693-05:00` | Sin uso analítico. Errata del nombre ("Hota" en lugar de "Hora"). |
| 10 | `Código del Encuestador` | — | Número: `13.0`, `26.0` | Sin uso analítico. |
| 11 | `_index` | — | Número: `309.0` | Índice interno de exportación. Sin uso analítico. |
| 12 | `Fuente` | — | Texto: `Encuesta por Llamada`, `Formulario Google - Whatsapp` | Podría usarse para análisis de canal de recopilación. |
| 13 | `¿Acepta participar en esta encuesta...?` | — | Texto fijo: `Sí, acepto participar y autorizo...` | Todos aceptaron (100%). Sin variabilidad. |
| 14 | `Unnamed: 115` | — | Vacío | Columna fantasma de exportación CSV. Ignorar. |

---

### Bloque 2: Demografía y Contexto Académico (Filtros Principales)

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 15 | `Programa Académico:` | `carrera` | Texto (17 valores únicos): `ODONTOLOGÍA`, `ENFERMERÍA`, ... | **Filtro global principal.** Dropdown superior. Todas las páginas. |
| 16 | `CARRERA` | — | Duplicado/alias de `Programa Académico:` | Sin uso directo en `Calculations.cols`. Redundante. |
| 17 | `Facultad` | — | Texto (4 valores): `Facultad de Negocios`, `Facultad de Ciencias de la Salud`, `Facultad de Derecho y Ciencia Política`, `Facultad de Ingeniería y Negocios` | **Filtro global.** Se calcula dinámicamente con `getFacultadForCarrera()` en `dataLoader.js`, no se lee directamente de esta columna. Podría usarse como fuente directa. |
| 18 | `Año de Egreso` | `anioEgreso` | Entero (5 valores): `2021`, `2022`, `2023`, `2024`, `2025` | **Filtro global principal.** Dropdown superior. Todas las páginas. |
| 19 | `Periodo de egreso:` | — | Texto: `2022 - I`, `2023 - II` | Más granular que `Año de Egreso`. Disponible para análisis por semestre. No se usa actualmente. |
| 20 | `Edad` | `edad` | Entero (47 valores únicos): `22`, `23`, ..., `68` | **NUEVO EN 2026.** Edad numérica exacta. Cruce: salario vs edad, inserción laboral vs edad. |
| 21 | `Rango de Edad` | `rangoEdad` | Texto (6 valores): `22–25 años`, `26–30 años`, `31–35 años`, `36–40 años`, `41–50 años`, `51 a más` | **NUEVO EN 2026.** Para gráficos de barras agrupados. Actualmente la página `resumen.js` tiene un **mockup hardcodeado** en `createChartEmpleabilidadEdad()` que debe reemplazarse con datos reales. |
| 22 | `Sexo` | `sexo` | Texto (2 valores): `M`, `F` | **NUEVO EN 2026 (como dato directo).** Antes se infería del nombre. `resumen.js` ya lo usa con fallback a inferencia. |
| 23 | `Grado Académico` | — | Texto (3 valores): `Titulado`, `Bachiller`, `Egresado` | Disponible para cruce: empleabilidad por grado, salario por grado. **No mapeado en `Calculations.cols`.** |

---

### Bloque 3: Situación Laboral — Rama PEA (Pregunta Bifurcadora)

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 24 | `1. ¿Actualmente te encuentras trabajando...?` | `trabaja` | Texto: `Sí`, `No` | **Variable bifurcadora principal.** Define si entra a la rama "Sí Trabaja" o "No Trabaja". |
| 25 | `Condición PEA` | — | Texto: `PEA`, `NO PEA` | Pre-calculado por la consultora. `PEA` = Ocupado + Buscador activo. `NO PEA` = No busca empleo. El dashboard usa `classifyLaborStatus()` internamente. **No mapeado en `Calculations.cols`.** |
| 26 | `Nivel de Empleabilidad Final` | — | Texto: `Sí`, `No` | Pre-calculado por la consultora. El dashboard calcula esto internamente. **No mapeado.** |

---

### Bloque 4: Rama "Sí Trabaja" — Condición Laboral y Empresa

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 27 | `2. ¿Cuál es tu condición laboral actual?` | `condicion` | Texto: `Trabajador dependiente...`, `Profesional independiente...`, `Propietario o socio...` | Gráfico de condición laboral (anillo). Páginas: Resumen, Resultados Generales, Ocupación. |
| 28 | `2.1 Si marcó "Trabajador dependiente". ¿Cuál es su modalidad de vinculación...` | `modalidadVinculacion` | Texto: `Contrato a plazo fijo`, `Nombrado(a)`, etc. | Gráfico de modalidad de contratación. Páginas: Resultados Generales, Ocupación. |
| 29 | `Otros (Especificar)*` | — | Texto libre: `Asistente`, `ONG` | Respuestas abiertas de "Otros" en vinculación. |
| 30 | `Modalidad de Vinculación - Categorizado (Final)` | — | Texto: `Prácticas Profesionales`, `Voluntariado` | Pre-categorizado por consultora. Dashboard usa clasificación interna. |
| 31 | `2.2 Si responde "Profesional independiente"...` | `actividadIndependiente` | Texto: `Consultorio propio`, `Atención domiciliaria`, etc. | Página: Emprendimientos. |
| 32 | `Otros (Especificar)2` | — | Texto libre | Respuestas abiertas de independientes. |
| 33 | `Actividad Independiente - Categorizado (Final)` | — | Pre-categorizado. | Dashboard usa clasificación interna. |
| 34 | `2.3 Si responde "Propietario o socio"... ` | `emprendimientoFormalizacion` | Texto: `Formalizado`, `En proceso de formalización`, `No formalizado` | Página: Emprendimientos. |
| 35 | `2.3.1 ¿El emprendimiento está relacionado con su profesión?` | `emprendimientoRelacionado` | Texto: `Sí`, `No` | Página: Emprendimientos. |

---

### Bloque 5: Rama "Sí Trabaja" — Datos de la Empresa

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 36 | `3.1 Nombre de la empresa donde trabajas actualmente:` | — | Texto crudo: `Lima tours`, `CLINICA OCUPACIONAL NATCLAR` | Texto libre original. |
| 37 | `Nombre de Empresa Limpia` | `empresaLimpia` | Texto normalizado: `Lima Tours`, `Clinica Ocupacional Natclar` | Ranking "Top 10 Empresas Empleadoras" (`Calculations.getTopEmpleadores`), excluyendo respuestas genéricas (`Sin dato`, `Persona Natural`, `Independiente`, etc.). Página: Ocupación. |
| 38 | `Categorización Oficial - Tamaño de Empresa` | `tamanoEmpresa` | Texto (8 valores): `Gran empresa`, `Microempresa`, `Pequeña empresa`, `Mediana empresa`, etc. | Dona "Tamaño de la Empresa" (`chart-tamano-empresa`). Página: Ocupación. Columna agregada al CSV 2026 el 2026-09-18; antes existía el mapeo en código pero el dato venía vacío. |
| 39 | `3.2 Rubro de empresa:` | `rubro` | Texto (13 valores): `Salud y bienestar`, `Educación`, `Comercio y retail`, etc. | Gráfico de sectores económicos. Páginas: Resultados Generales, Ocupación. |
| 40 | `Otros (Especificar)3` | — | Texto libre de rubro. | |
| 41 | `Rubro de Empresa - Categorizado (Final)` | — | Pre-categorizado: `Turismo, Hotelería y Gastronomía` | Dashboard usa el valor crudo de `3.2`. |
| 42 | `3.3 Tipo de empresa` | `tipoEmpresa` | Texto: `Privada`, `Pública`, `Ong`, `Mixta` | Gráfico público/privado. Páginas: Ocupación. |
| 43 | `3.4 Modalidad de trabajo` | `modalidad` | Texto: `Presencial`, `Híbrido`, `Remoto` | Gráfico de modalidad. Páginas: Ocupación, Resultados Generales. |

---

### Bloque 6: Rama "Sí Trabaja" — Cargos

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 44 | `3.5 Cargo Salud:` | `cargoSalud` | Texto (29 valores): `Profesional de Enfermería`, `Administrativo / Apoyo asistencial` | Cargos de egresados de Salud. |
| 45 | `Otros (Especificar)4` | — | Texto libre: `Enfermera`, `ENFERMERA OCUPACIONAL` | |
| 46 | `Cargo Actual Salud - Categorizado` | — | Pre-categorizado por consultora. | |
| 47 | `Cargo Actual Salud 2 - Categorizado (Final)` | — | Nivel jerárquico: `Junior`, `Senior`, `Ceo Fundador` | **No mapeado.** Podría ser útil para análisis de nivel de cargo. |
| 48 | `3.5 Cargo NID:` | `cargoNID` | Texto (50 valores): `Logística / Operaciones`, `Administrativo / Apoyo` | Cargos de egresados NID (Negocios, Ingeniería, Derecho). |
| 49 | `Otros (Especificar)5` | — | Texto libre. | |
| 50 | `Cargo Actual NID - Categorizado` | — | Pre-categorizado por consultora. | |
| 51 | `Cargo Actual NID - Categorizado (Final)` | — | Nivel jerárquico: `Junior`, `Semi senior`, `Dirección/Gerencias` | **No mapeado.** |
| 52 | `Cargo Actual - Categorizado Oficial` | — | Nombre exacto: `Nivel Cargo Actual - Categorizado Oficial`. Texto (11 valores): `Junior`, `Semi senior`, `Senior`, `Dirección/Gerencias/Sub gerencia` | **No mapeado.** Columna unificada de nivel de cargo. |

---

### Bloque 7: Rama "Sí Trabaja" — Geografía Laboral

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 53 | `3.6 Dónde labora: (Departamento / Provincia / Distrito) o Extranjero` | — | Texto fijo: solo `No especifica` (1 valor único). | **Columna vacía/inútil.** Todos los datos están en las columnas separadas. |
| 54 | `Departamento` | `departamento` | Texto (27 valores): `LIMA`, `CUSCO`, `SAN MARTIN` | Mapa de calor departamental. Página: Resumen. |
| 55 | `Provincia` | `provincia` | Texto (112 valores): `LIMA`, `CUSCO`, `BELLAVISTA` | Disponible para drill-down geográfico. |
| 56 | `Distrito` | `distrito` | Texto (238 valores): `VILLA EL SALVADOR`, `CUSCO`, `LIMA` | Gráfico Top 10 distritos. Página: Resumen. |
| 57 | `Zona Geográfica de Trabajo` | — | Texto (10 valores): `Lima Sur`, `Lima Centro`, `Lima Moderna`, `Lima Este`, `Lima Norte`, `Callao`, `Provincia (resto del Perú)`, `Extranjero` | **NUEVO. No mapeado.** Pre-agrupación geográfica. Ideal para gráficos de distribución zonal sin necesidad de agrupar manualmente. |

---

### Bloque 8: Rama "Sí Trabaja" — Trayectoria, Satisfacción, Salarios

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 58 | `4. ¿Cuánto tiempo estas desempeñándote en el cargo actual?` | `tiempoCargoActual` | Texto: `Menos de 1 año.`, `De 1 a 2 años.`, `De 5 a 10 años.` | Página: Ocupación. |
| 59 | `5. ¿Qué tan satisfecho te sientes...?` | `satisfaccion` | Texto: `Muy satisfecho`, `Satisfecho`, `Ni satisfecho ni insatisfecho`, `Insatisfecho`, `Muy insatisfecho` | KPI Satisfacción Laboral. Páginas: Resumen, Resultados Generales. |
| 60 | `6. ¿La actividad laboral... está relacionada con la carrera...?` | `pertinencia` | Texto: `Sí, totalmente relacionada.`, `Sí, parcialmente relacionada.`, `No, no está relacionada` | KPI Pertinencia Laboral. Páginas: Resumen, Resultados Generales. |
| 61 | `7. ¿Has recibido algún ascenso...?` | `ascenso` | Texto: `Sí`, `No` | KPI Progresión. Páginas: Resultados Generales. |
| 62 | `8. ¿Tienes personal a tu cargo?` | `personalCargo` | Texto: `No.`, `Sí, menos de 10 personas.`, `Sí, de 10 a 20 personas.`, `Sí, más de 20 personas.` | KPI Liderazgo. Páginas: Resultados Generales. |
| 63 | `9. ¿Cuál es tu ingreso mensual bruto aproximado?...` | `salario` | Texto: `Entre S/1,501 y S/. 3,000`, `Prefiero no decirlo` | Gráfico distribución salarial. Páginas: Resumen, Resultados Generales. |
| 64 | `Sueldo Promedio` | `sueldoPromedio` | Texto/Número: `S/ 2.251`, `S/ 4.001`, `S/ 12.000` (tope abierto) | **Mapeada** (actualizado 2026-09-22; antes decía "no mapeado"). Punto medio numérico oficial de cada tramo de `salario`. Usada por `Calculations.getSueldoPromedioEstimado()` / `getSueldoPromedioAgrupado()` para las tablas "Sueldo Promedio por Programa Académico" y "por Año de Egreso" (página Empleabilidad). |

> **Tramos salariales distintos entre ediciones:** la Encuesta 2025 y la Encuesta 2026 usan **rangos diferentes** para esta misma pregunta 9 (2025: Hasta S/1,130 · S/1,131–2,000 · S/2,001–3,000 · S/3,001–5,000 · Más de S/5,000 — 2026: Hasta S/1,500 · S/1,501–3,000 · S/3,001–5,000 · S/5,001–8,000 · Más de S/8,001), y además cada edición encuesta una cantidad distinta de cohortes de egreso (2025: 2018–2024, 7 cohortes; 2026: 2021–2025, 5 cohortes). Por ambas razones, `Sueldo Promedio` **no es comparable entre ediciones** — solo dentro de la misma edición (ver nota metodológica en `js/pages/empleabilidad.js`).

---

### Bloque 9: Rama "Sí Trabaja" — Prácticas y Primer Empleo

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 65 | `10. (Solo para egresados NID) ¿Realizaste prácticas preprofesionales...?` | `practicasNID` | Texto: `Sí`, `No` | Página: Resultados Generales. |
| 66 | `10.1 ¿En qué empresa realizaste tus prácticas preprofesionales?` | — | Texto crudo: `Convento de san Francisco` | **No mapeado.** Disponible para ranking de empresas de prácticas. |
| 67 | `Nombre Empresa - Limpio` | — | Texto normalizado de empresa de prácticas. | **No mapeado.** |
| 68 | `Tamaño Empresa - Oficial` | — | Texto: `Microempresa`, `Gran empresa` | Tamaño de empresa de prácticas. **No mapeado.** |
| 69 | `11. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo...?` | `tiempoPrimerEmpleo` | Texto: `Ya me encontraba trabajando al egresar.`, `De 1 a 3 meses` | Gráfico tiempo de inserción. Páginas: Resultados Generales. |
| 70 | `11.1 ¿Cuál era tu cargo de tu primer trabajo...?` | — | Texto libre crudo. | |
| 71 | `Cargo Primer Empleo (rama SI) - Categorizado (Final)` | — | Texto: `Junior`, `Senior`, `Experiencia inicial` | **No mapeado.** Nivel del primer empleo para quienes SÍ trabajan. |
| 72 | `12. ¿Tu primer empleo estuvo relacionado con la carrera...?` | `primerEmpleo` | Texto: `Sí`, `No` | Pertinencia del primer empleo. Páginas: Resultados Generales. |

---

### Bloque 10: Rama "Sí Trabaja" — NPS

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 73 | `13. En una escala de 0 a 10...?` | `nps` | Número (float): `9.0`, `10.0`, `6.0` | NPS rama ocupada. Páginas: Resumen, Resultados Generales, Preguntas Abiertas. |
| 74 | `Segmento NPS (rama SI): Promotor/Neutral/Detractor` | — | Texto: `Promotor`, `Neutral (pasivo)`, `Detractor` | **No mapeado.** Pre-segmentado. Dashboard lo calcula internamente. Podría usarse como validación. |
| 75 | `13.1 ¿Cuál es la principal razón de la calificación otorgada?` | `razonNPS` | Texto libre: `POR LA MODALIDAD...`, `buenos docentes` | Análisis cualitativo de NPS. Páginas: Preguntas Abiertas, NPS. |
| 76 | `Razón NPS (rama SI) - Categorizado (Final)` | — | Texto (13 valores): `Virtualidad`, `Docentes`, `Todo en general`, `Calidad académica` | **No mapeado.** Pre-categorizado. Dashboard usa `classifyByTopics()` internamente. |

---

### Bloque 11: Rama "Sí Trabaja" — Iniciativas Alumni (Pregunta 14)

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 77 | `14...._Networking con egresados` | `iniciativaNetworking` | Texto: `Networking con egresados` o `0` | Pregunta multi-respuesta. `0` = no marcó. |
| 78 | `14...._Mentoría a estudiantes` | `iniciativaMentoria` | Ídem | |
| 79 | `14...._Participación como ponente...` | `iniciativaPonente` | Ídem | |
| 80 | `14...._Participación en talleres y cursos...` | `iniciativaTalleres` | Ídem | |
| 81 | `14...._Acceso a oportunidades laborales...` | `iniciativaOportunidades` | Ídem | |
| 82 | `14...._Beneficios y convenios...` | `iniciativaBeneficios` | Ídem | |
| 83 | `14...._Actividades de voluntariado...` | `iniciativaVoluntariado` | Ídem | |
| 84 | `14...._Participación en campeonatos...` | `iniciativaDeportivas` | Ídem | |
| 85 | `14...._Integrar la Red de Embajadores...` | `iniciativaEmbajadores` | Ídem | |
| 86 | `14...._No tengo interés en participar...` | — | Ídem | **No mapeado.** |

---

### Bloque 12: Rama "No Trabaja"

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 87 | `1. ¿Cuál es la principal razón por la que no te encuentras trabajando...?` | `razonNoTrabaja` | Texto: `Motivos personales/familiares me impiden trabajar`, `Estoy buscando...`, `Me encuentro estudiando...`, `Otros` | Gráfico razón de no trabajo. Páginas: Resumen, Resultados Generales. |
| 88 | `Otros (Especificar)6` | `razonNoTrabajaOtros` | Texto libre: `ESTA ESPERANDO TRAMITE DE BACHILLER`, `Por Viaje` | Texto libre de "Otros" que se clasifica internamente. |
| 89 | `Razón No Trabaja - Categorizado (Final)` | — | Texto (5 valores): `Trámite de Título/Bachiller/Tesis`, `Viaje / Descanso`, `No especifica` | Pre-categorizado. Dashboard usa clasificación interna. |
| 90 | `2. ¿Hace cuánto tiempo estás en situación de desempleo?` | `tiempoDesempleo` | Texto: `De 1 a 3 meses`, `De 6 a 12 meses`, `Más de 12 meses.` | Páginas: Resultados Generales. |
| 91 | `3. ¿Has trabajado anteriormente?` | `trabajadoAnteriormente` | Texto: `Sí`, `No` | |
| 92 | `4. En caso la respuesta anterior haya sido SÍ, ¿cuánto tiempo te tomó obtener tu primer trabajo...?` | — | Texto: `De 1 a 3 meses`, `Ya me encontraba trabajando al egresar.` | **No mapeado.** Es el equivalente de `tiempoPrimerEmpleo` pero para la rama NO. |
| 93 | `4.1 ¿Cuál era tu cargo de tu primer trabajo...?` | — | Texto libre. | |
| 94 | `Cargo Primer Empleo (rama NO) - Categorizado (Final)` | — | Texto: `Junior`, `Experiencia inicial`, `Senior` | **No mapeado.** |
| 95 | `5. ¿Tu primer empleo estuvo relacionado con la carrera...?` | — | Texto: `Sí`, `No` | **No mapeado.** Es el equivalente de `primerEmpleo` pero para la rama NO. |

---

### Bloque 13: Rama "No Trabaja" — NPS

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 96 | `6. En una escala de 0 a 10...?` | `npsDesempleado` | Número: `7.0`, `5.0` | NPS rama no trabaja. |
| 97 | `Segmento NPS (rama NO): Promotor/Neutral/Detractor` | — | Texto. | Pre-segmentado. |
| 98 | `6.1 ¿Cuál es la principal razón...?` | `razonNPSDesempleado` | Texto libre. | |
| 99 | `Razón NPS (rama NO) - Categorizado (Final)` | — | Texto (13 valores). | Pre-categorizado. |

---

### Bloque 14: Rama "No Trabaja" — Apoyo Universitario (Pregunta 7)

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 100 | `7..._La Universidad ya me formó...` | `apoyoFormo` | Texto o `0` | Multi-respuesta. |
| 101 | `7..._Brindándome cursos...` | `apoyoCursos` | Ídem | |
| 102 | `7..._Informándome constantemente ofertas...` | `apoyoOfertas` | Ídem | |
| 103 | `7..._Entrenándome para enfrentar...` | `apoyoEntrenando` | Ídem | |
| 104 | `7..._Otro` | `apoyoOtro` | Ídem | |
| 105 | `Otro (Especificar)` | — | Texto libre. | |
| 106 | `Apoyo de la Universidad - Categorizado (Final)` | — | Texto (5 valores): `Vinculación empresarial`, `Mejorar formación práctica` | Pre-categorizado. |

---

### Bloque 15: Sección Profesional — Colegiatura y Posgrado

| # | Columna CSV | Key en `Calculations.cols` | Tipo / Ejemplos | Uso en Dashboard |
|---|---|---|---|---|
| 107 | `1. ¿Cuál es su situación actual respecto a la colegiatura...?` | `colegiatura` | Texto: `Colegiado(a) y habilitado(a).`, `No me encuentro colegiado(a).` | KPI Colegiatura. Páginas: Resultados Generales. |
| 108 | `2. ¿Has realizado estudios de posgrado después de egresar?` | `posgrado` | Texto: `Sí`, `No` | KPI Posgrado. Páginas: Resultados Generales. |
| 109 | `3. ¿En qué año comenzó sus estudios de posgrado?` | — | Número: `2024.0`, `2026.0` | **No mapeado.** |
| 110 | `4. ¿Qué tipo de estudios de posgrado...?` | `tipoPosgrado` | Texto: `Maestría`, `Diplomado`, `Programa de especialización` | Páginas: Resultados Generales. |
| 111 | `5. ¿Qué tipo de institución ofrece u ofreció...?` | `tipoInstitucionPosgrado` | Texto: `Universidad peruana`, `Universidad extranjera`, `Instituto` | |
| 112 | `Otros (Especificar)8` | — | Vacío (0 valores). | |
| 113 | `Tipo de Institución de Posgrado - Categorizado (Final)` | — | Texto: `No especifica` (1 valor). | |
| 114 | `5.1 Nombre de la Universidad:` | — | Texto crudo: `Nolbert Wiener`, `CESAR VALLEJO` | |
| 115 | `Universidad de Posgrado - Nombre Normalizado` | — | Texto normalizado (53 valores): `Universidad Norbert Wiener`, `Universidad César Vallejo` | **No mapeado.** Ideal para ranking de universidades de posgrado competidoras. |
| 116 | `Universidad de Posgrado - Tipo (Pública/Privada)` | — | Texto: `Privada`, `Pública` | |
| 117 | `Universidad de Posgrado - País (Nacional/Extranjera)` | — | Texto: `Nacional`, `Extranjera` | |
| 118 | `6. ¿Tienes interés en llevar un posgrado en la UNW...?` | `interesPosgrado` | Texto: `Sí`, `No` | |
| 119 | `6.1 Cuál Posgrado?` | `posgradoInteres` | Texto libre: `Recursos humanos`, `Gestión Pública` | |
| 120 | `Posgrado Deseado - Categorizado (Final)` | — | Texto (9 valores): `Gestión / Administración / Negocios`, `Especialización Clínica - Salud` | **No mapeado.** Pre-categorizado. |

---

## Columnas con claves en `Calculations.cols` pero que apuntan a nombres OBSOLETOS

Estas claves existen en el código pero apuntan a nombres de columna que **NO EXISTEN** en el CSV 2026:

| Key | Valor actual (cadena obsoleta) | Estado | Acción requerida |
|---|---|---|---|
| `distritoLabora` | `'3.1 ¿En qué distrito laboras actualmente? Ejemplo (Lima-La Victoria)'` | **NO EXISTE en CSV 2026.** Era una columna del Excel antiguo. | Eliminar o redirigir a `Distrito`. No se usa en ningún `cols.distritoLabora`. |
| `ingreso` | `'8. ¿Cuál es tu ingreso mensual bruto aproximado?'` | **NO EXISTE en CSV 2026.** La columna real es `salario` (pregunta 9). | Se usa en `calculations.js:1445`. Eliminar clave o actualizar valor. Es redundante con `salario`. |

---

## Columnas del CSV 2026 que ya están mapeadas en `PivotEngine` y tienen gráfico en Resultados Generales

Actualizado 2026-09-21: estas columnas estaban mapeadas en `js/pivotEngine.js` pero sin pregunta
propia en `js/pages/resultados-generales.js`. Se agregaron como preguntas nuevas (con sus 3
pestañas General/Por Carrera/Por Año, igual que el resto) para que la página cubra literalmente
cada reactivo del instrumento con datos disponibles.

| Columna CSV | Key `PivotEngine` | ID de pregunta en Resultados Generales |
|---|---|---|
| `Grado Académico` | `gradoAcademico` | `gradoAcademico` |
| `Zona Geográfica de Trabajo` | `zonaGeografica` | `zonaGeografica` |
| `Categorización Oficial - Tamaño de Empresa` | `tamanoEmpresa` | `tamanoEmpresa` |
| `Cargo Actual Salud - Categorizado` / `Cargo Actual NID - Categorizado` | `cargoActual` | `cargoActual` |
| `Nivel Cargo Actual - Categorizado Oficial` | `nivelCargo` | `nivelCargo` |
| `Cargo Primer Empleo (rama SI/NO) - Categorizado (Final)` | `nivelPrimerEmpleo` | `nivelPrimerEmpleo` |
| `Universidad de Posgrado - Tipo (Pública/Privada)` | `universidadPosgradoTipo` | `universidadPosgradoTipo` |
| `Universidad de Posgrado - País (Nacional/Extranjera)` | `universidadPosgradoPais` | `universidadPosgradoPais` |
| `Posgrado Deseado - Categorizado (Final)` | `posgradoDeseadoCategoria` | `posgradoDeseadoCategoria` |

**NPS de quienes no trabajan:** no se agregó como pregunta aparte porque el campo `nps` de
`PivotEngine` ya unifica la pregunta 13 (rama "Sí Trabaja") y la pregunta 6 (rama "No Trabaja")
mediante un fallback de columnas (`row['13. ...'] || row['6. ...']`); la pregunta `nps` de
Resultados Generales ya cubre a toda la muestra, no solo a quienes trabajan.

## Columnas del CSV 2026 que siguen sin mapear (pendientes)

| Columna CSV | Key sugerido | Justificación |
|---|---|---|
| `Universidad de Posgrado - Nombre Normalizado` | `universidadPosgrado` | Ranking de universidades de posgrado competidoras (distinto de `universidadPosgradoTipo`/`universidadPosgradoPais`, que solo dan Pública/Privada y Nacional/Extranjera). |

> `Sueldo Promedio` ya no está pendiente (mapeada 2026-09-22 como `sueldoPromedio`) — ver Bloque 8 más arriba.

---

## Archivos externos: `data/pago_promedio_carrerras_2026.csv` y `data/carreras_top_upnw.csv`

**Agregados:** 2026-09-22. **Rol:** "Dato Externo" — comparación del sueldo promedio de egresados contra el mercado, usando cifras oficiales del **Ministerio de Trabajo (MTPE) — Portal MiCarrera**, basadas en Planilla del sector formal (Set. 2023 – Ago. 2024), independiente del año de egreso. **No provienen de la encuesta propia** (2025 ni 2026); son una fuente externa e independiente. **Formato:** UTF-8 sin BOM — deben leerse con `XLSX.read(buf, { type: 'array', raw: true, codepage: 65001 })`; sin el `codepage` explícito los acentos salen corruptos (mojibake). **Carga:** diferida (lazy), solo en la página Empleabilidad, vía `DataLoader.loadDatoExternoSueldos()` (`js/dataLoader.js`), que trae ambos archivos en paralelo.

> La tabla de la página Empleabilidad muestra 2 columnas de sueldo, ambas de la misma fuente
> externa (Portal MiCarrera): **Nacional (Jóvenes)** (este archivo) y **Wiener (Externo MTPE)**
> (`carreras_top_upnw.csv`, sueldo Wiener específico según el mismo portal), más una columna
> **Tendencia** (▲/▬/▼) que compara "Wiener (Externo MTPE)" contra "Nacional (Jóvenes)" con un
> umbral de ±5%. Ordenada por "Nacional (Jóvenes)" descendente.
>
> **Quitadas (2026-09-22):** "Nacional (Adultos)" y "Ranking Nacional" (versión anterior de la
> tabla) — "Adultos" no era comparable (toda la vida profesional, no egresados recientes) y el
> Ranking no aportaba a la comparación; y **"Wiener (Encuesta 2026)"** (promedio propio,
> `Calculations.getSueldoPromedioAgrupado`) — se quitó por no aportar en una tabla ya centrada en
> comparar Nacional vs. Wiener dentro de la MISMA fuente externa (el sueldo propio de la Encuesta
> 2026 sigue visible en el KPI "Sueldo Promedio Estimado *" más arriba en la misma página).

### `data/pago_promedio_carrerras_2026.csv` — Sueldo Nacional (24 filas)

| Columna | Tipo / Ejemplo | Notas |
|---|---|---|
| `Carrera` | Texto MAYÚSCULAS: `INGENIERÍA DE SISTEMAS Y CÓMPUTO` | Nomenclatura nacional del portal, no coincide 1:1 con los nombres de carrera de la UNW — ver mapeo `MAPEO_CARRERA_EXTERNO` en `js/pages/empleabilidad.js`. |
| `Ingreso Promedio Jóvenes` | Texto: `S/ 4721` | **Columna usada** para "Nacional (Jóvenes)" — es la base comparable con "Wiener" (ambas miden egresados recientes). |
| `Rango Jóvenes` | Texto: `De S/ 1 900 a S/ 8 000` | No usada (referencial). |
| `Ingreso Promedio Adultos` | Texto: `S/ 9008` | **No usada en la tabla** (se quitó 2026-09-22): representa toda la vida profesional a nivel nacional, no egresados recientes — no es comparable contra "Wiener". |
| `Rango Adultos` | Texto | No usada. |
| `Ranking Nacional` | Número: `1` (mejor) a `73` (peor) | Usada solo para desempatar cuando una carrera aparece más de una vez (ver abajo); ya no se muestra como columna en la tabla. |

**Ojo — carreras duplicadas:** `MARKETING`, `CONTABILIDAD Y FINANZAS`, `TECNOLOGÍA MÉDICA` y `FARMACIA Y BIOQUÍMICA` aparecen **dos veces** cada una, con valores de ingreso y Ranking Nacional distintos, sin ninguna columna que distinga a qué corresponde cada fila (¿especialidad? ¿género? ¿corte temporal?). El dashboard resuelve esto tomando la fila con **mejor Ranking Nacional** (menor número) para cada carrera — ver `indexarPorCarreraUNW()` en `js/pages/empleabilidad.js`.

**Ojo — cobertura incompleta:** `Administración en Turismo y Hotelería` no tiene ninguna fila en este archivo — el dashboard lo muestra como "No registra", no es un bug de mapeo.

### `data/carreras_top_upnw.csv` — Sueldo Wiener específico según MTPE (10 filas)

| Columna | Tipo / Ejemplo | Notas |
|---|---|---|
| `Carrera` | Texto MAYÚSCULAS | Mismo mapeo que el archivo nacional. |
| `Institución` | Texto fijo: `UNIVERSIDAD PRIVADA NORBERT WIENER` | Sin uso analítico (ya filtrado por diseño del archivo). |
| `Ingreso Promedio` | Texto: `S/ 2961` | **Columna usada** para "Wiener (Externo MTPE)" — ver `indexarWienerExternoPorCarreraUNW()` en `js/pages/empleabilidad.js`. |
| `Rango de Ingresos` | Texto | No usada. |
| `Ranking Nacional` | Número | Usada solo para desempatar (no hay duplicados reales en este archivo, 1 fila por carrera); no se muestra como columna. |

**Ojo — solo 10 de 16 carreras vigentes tienen dato en este archivo** (el Portal MiCarrera no publica esta cifra para todas): Administración y Dirección de Empresas, Administración en Turismo y Hotelería, Administración y Marketing (descontinuada), Medicina Humana, Nutrición y Dietética, Psicología quedan sin dato — se muestran como "No registra" en la columna "Wiener (Externo MTPE)".

**Ojo — "Tecnología Médica" no distingue especialidad** en ninguno de los dos archivos: hay un solo valor genérico que el dashboard aplica por igual a "Tecnología Médica en Terapia Física y Rehabilitación" y a "Tecnología Médica en Laboratorio Clínico y Anatomía Patológica".

---

## Mapeo de Homologación 2025 → 2026

El `dataLoader.js → mapNewSurveyColumns()` contiene este mapeo:

| Columna en CSV 2025 | Se convierte a (nombre 2026) |
|---|---|
| `Carrera` | `Programa Académico:` |
| `Año de egreso` | `Año de egreso:` (nota: diferente de `Año de Egreso`) |
| `DNI del egresado...` | `DNI:` |
| `Nombre del egresado...` | `Nombres y apellidos:` |
| `Motivo No Trabajo (FINAL)` | `1. ¿Cuál es la principal razón por la que no te encuentras trabajando...?` |
| `5. Considerando todos los aspectos...` | `5. ¿Qué tan satisfecho te sientes...?` |
| `Sueldo (FINAL)` | `9. ¿Cuál es tu ingreso mensual bruto aproximado?...` |
| `9. ¿Cuánto tiempo (en meses)...` | `11. ¿Cuánto tiempo (en meses)...` |
| `6. ¿Has recibido algún ascenso...` | `7. ¿Has recibido algún ascenso...` |
| `7. ¿Tienes personal a tu cargo?` | `8. ¿Tienes personal a tu cargo?` |
| `A. De manera general ¿Qué tan satisfecho...` | `13. En una escala de 0 a 10...` |
| `Razones Sat (1era mención)...` | `13.1 ¿Cuál es la principal razón...` |
| `C. ¿Has llevado algún curso de posgrado...` | `2. ¿Has realizado estudios de posgrado...` |
| `Nivel de Emp (Final)` | `6. ¿La actividad laboral...está relacionada...` |

> **Dato crítico:** El CSV 2025 NO tiene las columnas `Edad`, `Rango de Edad`, `Sexo`, `Departamento`, `Provincia`, `Distrito`, `Zona Geográfica`, `Grado Académico`, ni las preguntas 14 (Iniciativas Alumni). Estas variables solo existen en el CSV 2026.
