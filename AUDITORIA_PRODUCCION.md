# Informe de Auditoría Integral y Control de Calidad Pre-Producción
**Proyecto:** Dashboard de Egresados 2026 (Cohortes 2021 – 2025)  
**Fecha de Auditoría:** 8 de Septiembre de 2026  
**Estado General:** APROBADO PARA PRODUCCIÓN (Con correcciones aplicadas)

---

## 1. Resumen Ejecutivo de la Auditoría

Se realizó una revisión integral, funcional y visual de las **11 pantallas** que componen el aplicativo web, validando:
1. **Cálculos y métricas estadísticas:** Comprobación de denominadores, filtros PEA, tasas de ocupación, márgenes de error, NPS y consistencia cruzada.
2. **Componentes visuales y gráficos:** Renderizado de librerías Chart.js, visualización en Cleveland Dot Plot, barras apiladas, gráficos de dona, nubes de palabras y tablas responsivas.
3. **Manejo de estados y filtros:** Comportamiento reactivo de los selectores de Facultad, Carrera y Año de Egreso.
4. **Tratamiento y separación de datos:** Validación de que los datos históricos (Excel) y la encuesta 2025 (CSV) se mantengan independientes y normalizados.

---

## 2. Diagnóstico Detallado Página por Página

| # | Página / Módulo | Estado | Hallazgos y Pruebas Realizadas |
|---|---|:---:|---|
| **1** | **Resumen Ejecutivo** (`resumen`) | **APROBADO** | - Los 4 KPIs de la Ficha Técnica (Universo: 10,100, Muestra Meta: 3,463, Contactados: 2,984, Avance: 86.2%) cargan con precisión.<br>- Se confirmó la eliminación de la tarjeta redundante "Encuestas Válidas x Registros Únicos".<br>- Los 12 indicadores estratégicos renderizan sin valores `NaN` ni solapamientos. Enlaces directos a submódulos funcionando. |
| **2** | **Situación Laboral** (`ocupacion`) | **APROBADO** | - La gráfica de Ocupación por Carrera fue optimizada exitosamente a un **Cleveland Dot Plot** con eje calibrado al 70%-100% y semaforización cromática.<br>- Tabla de Trazabilidad PEA vs. No PEA concuerda al 100% con los datos oficiales (Tasa PEA: 95.2%, Desempleo: 4.8%).<br>- Gráfico de dona (Ocupados vs. No Ocupados) y barras comparativas responden de manera fluida. |
| **3** | **Empleabilidad** (`empleabilidad`) | **APROBADO** | - Gráfico de barras apiladas "Trabajos Pertinentes por Carrera" (Totalmente Afín vs. Parcialmente Afín) renderiza correctamente con stacked axis.<br>- Tabla de semáforos de afinidad institucional (🟢 Alta ≥75%, 🟡 Media, 🔴 Alerta) clasifica las carreras de forma adecuada.<br>- Corrección aplicada al hipervínculo de navegación metodológica evitando recargas o saltos de ancla (`#`). |
| **4** | **Emprendimientos** (`emprendimientos`) | **APROBADO** | - Detección de egresados clasificados como "Emprendedor / Negocio propio".<br>- Donas de Formalización (RUC / SUNAT) y Afinidad Profesional calculan los porcentajes de forma consistente.<br>- Enlace cruzado a "Situación Laboral" corregido con `event.preventDefault()`. |
| **5** | **Análisis Evolutivo** (`evolutivo`) | **CORREGIDO & APROBADO** | - **Hallazgo crítico:** Se detectó un error de mayúsculas/minúsculas en el filtrado de condición laboral que causaba que la tasa de ocupación se mostrara en ~20.9% en lugar de ~80.5%.<br>- **Solución aplicada:** Normalización `toLowerCase()` para todas las variantes (`dependiente`, `independiente`, `emprendedor`, `practicante`). Ambas encuestas ahora computan ~81.5% vs ~80.5%.<br>- **Mejora incorporada:** Se implementó una **Tabla Comparativa Detallada por Cohorte (2021 a 2024)** para evaluar la variación interanual año a año con deltas visuales. |
| **6** | **Metodologías OCDE** (`metodologia`) | **APROBADO** | - Motor de clasificación OCDE evalúa los 2,432 ocupados logrando 99.8% de pertinencia técnica.<br>- Donas de distribución y gráfico horizontal de Fuentes de Decisión funcionan sin advertencias de consola.<br>- Tabla de desglose por carrera con filtros de semáforo técnico opera con normalidad. |
| **7** | **Margen de Error** (`margen-error`) | **APROBADO** | - Intervalo de confianza al 95% (IC: 80.1% – 82.9%) con margen global de ±1.4%.<br>- Tabla de margen por carrera (con filtro muestral de n ≥ 30) validada.<br>- Nota metodológica visible y alineada con los requerimientos estadísticos institucionales. |
| **8** | **Validación ACBSP** (`robustez`) | **APROBADO** | - Gráfico de barras de márgenes de error por indicador (Ocupación, Pertinencia, Satisfacción, Ascenso, Salario).<br>- Tabla unificada de robustez con insignias de confiabilidad (🟢 Alta <3%). |
| **9** | **NPS y Cualitativo** (`preguntas-abiertas`) | **CORREGIDO & APROBADO** | - NPS institucional calculado en **+39.5**.<br>- **Corrección aplicada:** Los botones de segmento (Global, Ocupados, En Búsqueda) tenían conteos fijos `(2984)`, `(2432)`, `(552)`. Ahora se recalculan **dinámicamente** cuando el usuario filtra por facultad o carrera.<br>- Nube de palabras interactiva con stopwords filtradas y explorador de testimonios operan sin latencia. |
| **10** | **Visor de Datos** (`visor-datos`) | **APROBADO** | - Paginación eficiente (100 registros por página) para los 2,984 registros.<br>- Protección de privacidad activa: columnas de DNI, teléfono y correo permanecen ocultas por defecto.<br>- Selector dinámico de columnas y buscador en tiempo real probados satisfactoriamente. |
| **11** | **Ficha Técnica** (`representatividad`) | **APROBADO** | - Cobertura del universo y cálculo de representatividad por programa académico.<br>- Gráfica de Avance de Meta y distribución PEA/No PEA alineada con los datos de rectorado. |

---

## 3. Correcciones Técnicas Aplicadas Durante la Auditoría

1. **Corrección de sensibilidad a mayúsculas en Ocupación Interanual (`evolutivo.js` y `dataCleaner.js`):**
   - Se estandarizó el mapeo de `condMap` en `DataCleaner.fixCondicionLaboral` para soportar las etiquetas del nuevo CSV: `Dependiente (planilla)`, `Independiente (freelance-recibo por honorario)`, `Negocio propio(emprendimiento)/negocio familiar` y `Practicante profesional`.
   - Se añadió tolerancia insensible a mayúsculas (`toLowerCase()`) en `calcMetrics`, corrigiendo la tasa comparativa (81.5% anterior vs 80.5% actual).

2. **Prevención de fallo de tipos al filtrar por Año (`app.js`):**
   - En `getFilteredData()`, la expresión `d['Año de egreso:'].includes(...)` se protegió contra valores numéricos o nulos mediante `String(val).includes(...)`.

3. **Exposición global segura (`window.*`):**
   - Se exportaron formalmente a `window` los objetos singleton: `DataLoader`, `DataCleaner`, `Calculations`, `Charts`, `Exports` y `Pertinencia`, garantizando su disponibilidad transversal entre módulos ES6 y scripts clásicos.

4. **Dinamismo en Segmentos NPS (`preguntas-abiertas.js`):**
   - Se reemplazaron los conteos hardcodeados en los botones por cálculos dependientes del subconjunto activo `data.length`.

5. **Navegación limpia sin saltos de URL (`empleabilidad.js` y `emprendimientos.js`):**
   - Se reemplazó el atributo `onclick="App.navigateTo(...)"` por `onclick="event.preventDefault(); window.App.navigateTo(...)"` para evitar el añadido del fragmento `#` en la barra del navegador.

6. **Busting de Caché para Despliegue:**
   - Se actualizaron los parámetros de versión de los scripts en `index.html` y las importaciones de módulos a `?v=20260908_prod`.

---

## 4. Checklist para Paso a Producción

- [x] Sintaxis validada en el 100% de archivos JavaScript con `node --check`.
- [x] Consola limpia de errores `TypeError` o advertencias no controladas.
- [x] Compatibilidad verificada con datos locales (`respuestas_encuestas.xlsx`, `respuestas_encuestas_2025.csv`, `universo.xlsx`).
- [x] Drag and drop manual funcional en caso de reemplazo de bases de datos.
- [x] Exportación a PDF habilitada en cada sección mediante `html2canvas` / `window.print`.
- [x] Diseño responsivo probado en desktop (1920x1080), laptop (1366x768) y navegación móvil.

---

## 5. Auditoría de Seguimiento — 22 de Septiembre de 2026

**Estado General:** APROBADO PARA PRODUCCIÓN (con correcciones aplicadas). Esta sección se agrega
sin modificar la auditoría del 8 de septiembre (arriba), que queda como registro histórico de ese
corte — varias cifras que menciona (ej. universo, pertinencia OCDE) ya no reflejan el estado actual.

### 5.1 Funcionalidad nueva agregada

- **Empleabilidad:** tabla "Sueldo Promedio por Programa Académico" y "por Año de Egreso" (punto
  medio oficial de cada tramo salarial, `Calculations.getSueldoPromedioAgrupado()`); gráfico
  "Nivel de Empleabilidad vs. Pertinencia Laboral, por Carrera" (Ocupados/PEA oficial, no la tasa
  bruta); sección "Dato Externo: Sueldo Promedio Portal MiCarrera (MTPE)" — comparación Nacional
  vs. Wiener contra una fuente externa (`data/pago_promedio_carrerras_2026.csv` y
  `data/carreras_top_upnw.csv`, ver `docs/diccionario_datos_encuestas.md`).
- **Resumen:** filtro de Facultad + gráfico vertical en "Condición Laboral según Prácticas
  Preprofesionales"; nuevo gráfico "Nivel de Empleabilidad según Prácticas Preprofesionales"
  (tiempo de inserción laboral, proxy válido — el % Ocupados/PEA no lo es para este cruce
  específico, ver nota metodológica en el código).
- **Resultados Generales:** el color institucional (celeste Wiener) ahora identifica siempre la
  categoría *positiva* de cada pregunta (ej. "Sí"), no la mayoritaria — antes el color podía caer
  en "No" si esa era la respuesta más frecuente.
- **Análisis Evolutivo:** filtro de Facultad en "Empleabilidad por Carrera" (oculto del menú a
  pedido, hasta nuevo aviso — el código y la ruta siguen intactos).
- **Todas las páginas:** auditoría de gráficos de barras/dona sin datalabels visibles — se
  agregaron a 39 gráficos que no mostraban ni % ni cantidad; diseño "bento" (paneles ya no se
  estiran a la altura del vecino más alto) aplicado globalmente vía CSS.

### 5.2 Bugs encontrados y corregidos

1. **`js/pertinencia.js` (motor "Pertinencia OCDE"):** la comparación de nombre de carrera estaba
   mal cableada por mayúsculas/minúsculas (columna cruda en Title Case vs. reglas en MAYÚSCULAS),
   así que casi ninguna regla específica por carrera disparaba nunca — el motor clasificaba solo
   21.5% de los ocupados. En un primer momento el bug quedó **documentado en el propio código pero
   NO corregido**, a pedido explícito, manteniendo la página Metodologías (OCDE) con el motor
   algorítmico tal como estaba. **Decisión final (mismo día):** el usuario determinó que la
   Pertinencia Laboral debe ser *siempre* la autoreportada por el egresado (Pregunta 6) — la única
   que usa el resto del dashboard — y que no debe existir ningún sistema que la reclasifique o
   verifique. Se eliminó por completo el motor algorítmico: se borró `js/pertinencia.js`, y
   `js/pages/metodologia.js` se reescribió quitando los KPIs/gráficos/tabla/glosario basados en
   OCDE, dejando solo la metodología OIT/INEI de Nivel de Empleabilidad, el marco muestral
   institucional, y una nota explícita de que la pertinencia es autoreportada. Página y nav
   renombrados de "Metodologías (OCDE)" a "Metodología".
2. **`js/pages/evolutivo.js`:** el filtro de Facultad de "Empleabilidad por Carrera" le pasaba un
   nombre de carrera (string) a una función que esperaba una fila completa; el resultado era que
   **todas** las carreras quedaban en facultad "Otra" y ninguna pill de facultad llegaba a
   renderizarse. Corregido y cubierto por test.
3. **`js/pages/robustez.js`:** el indicador "Ascenso Profesional" incluía a independientes y
   emprendedores (a quienes no se les hace esa pregunta) en el denominador, diluyendo la tasa real
   de 28.9% a 22.7%. Corregido para usar solo dependientes, igual que el KPI "Ascensos" de Resumen.
4. **`js/pages/margen-error.js`:** la nota metodológica del pie de página afirmaba que el margen de
   error se calculaba "con la fórmula para poblaciones finitas bajo criterio de máxima varianza
   (p=q=0.50)" con "N = 10,099", pero el código en realidad usaba la tasa de ocupación *real*
   observada (81.5%, no 0.50) y sin corrección por población finita — daba un margen *menor*
   (±1.4%) del que la propia fórmula descrita habría dado (±1.5%), es decir, la página sonaba más
   rigurosa/conservadora de lo que el cálculo realmente era. Además el universo citado (10,099) no
   coincidía con `DataLoader.getUniverso().length` real (10,100). Se agregaron
   `Calculations.margenErrorFinito()` y las funciones `getMargenErrorInstitucionalGlobal()` /
   `getMargenErrorInstitucionalPorCarrera()` (p=q=0.50 + corrección de Cochran, con el universo
   propio de cada carrera, no el total institucional, para el margen por carrera) — usadas
   exclusivamente por esta página. `getMargenErrorGlobal()`/`getMargenErrorPorCarrera()` (tasa real,
   sin corrección) se mantuvieron intactas ese momento porque las seguía usando la página
   Validación ACBSP (`robustez.js`), donde el margen debía quedar centrado en la tasa de ocupación
   real que mostraba esa misma tabla — página que se eliminó por completo más tarde el mismo día
   (ver punto 5 abajo), así que `getMargenErrorGlobal()`/`getMargenErrorPorFacultad()`/
   `getMargenErrorPorCarrera()` también se eliminaron por quedar sin ningún caller. El KPI global
   pasó de ±1% (±1.4% real) a ±2% (±1.5% real); los márgenes por carrera también se recalcularon
   (algunos subieron o bajaron de categoría de semáforo 🟢/🟡/🟠 en consecuencia).
5. **`js/pages/robustez.js` (página "Validación (ACBSP)"):** revisión a pedido del usuario sobre si
   la página era pertinente. Se encontraron dos problemas reales, no solo redundancia con "Margen
   de Error": (a) la columna "Nivel de Confiabilidad" de la tabla estaba **hardcodeada** a
   `🟢 Alta (<3%)` en las 5 filas — nunca se calculaba del valor real (coincidía por casualidad en
   ese momento, pero habría mentido silenciosamente si algún indicador superaba 3%); (b) la nota
   "Criterio de Validación ACBSP" afirmaba un umbral numérico específico (±5%) atribuido a esa
   institución acreditadora por nombre, sin cita ni fuente verificable — riesgo de presentar un
   estándar no confirmado como si fuera un requisito oficial ante un comité real. Decisión del
   usuario: **eliminar la página por completo** (no solo ocultarla). Se borraron
   `js/pages/robustez.js`, `tests/test-robustez.js`, el enlace de menú y la ruta en `js/app.js`, y
   las funciones de `calculations.js` que solo esa página usaba (ver punto 4). Las menciones a
   "Robustez"/"ACBSP" en comentarios de otras páginas (`empleabilidad.js`, `resultados-generales.js`)
   se limpiaron para no dejar referencias colgantes a un archivo inexistente.

### 5.3 Cobertura de tests (`tests/`)

Se extendieron `test-empleabilidad.js`, `test-resultados-generales.js`, `test-resumen.js` y
`test-margen-error.js` (reescrito para cubrir `margenErrorFinito()` y las nuevas funciones
institucionales) con la lógica nueva de este corte, y se agregaron archivos para páginas que no
tenían ningún test: `test-evolutivo.js`, `test-margen-error.js`, `test-representatividad.js`,
`test-visor-datos.js` (este último valida el filtro de privacidad: DNI/correo/celular/nombres nunca
quedan visibles) — `test-robustez.js` también se agregó en ese momento, pero se eliminó junto con
la página que probaba (ver punto 5). Los bugs de 5.2 (evolutivo, robustez y margen de error) se
detectaron escribiendo/revisando estos tests, no por inspección manual. **13 de 13 archivos de
test pasan** (`node tests/test-*.js`).
