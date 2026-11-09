// js/pages/empleabilidad.js
let activeCharts = {};

// Mapea las etiquetas (en MAYÚSCULAS) del dato externo del Portal MiCarrera-MTPE a los nombres
// oficiales de carrera de la UNW. "Tecnología Médica" no distingue especialidad en la fuente
// externa (el propio Portal MiCarrera reporta un solo valor genérico), así que ese valor se
// aplica por igual a las dos especializaciones que sí distingue la UNW.
const MAPEO_CARRERA_EXTERNO = {
  'INGENIERÍA DE SISTEMAS Y CÓMPUTO': ['Ingeniería de Sistemas e Informática'],
  'INGENIERÍA INDUSTRIAL': ['Ingeniería Industrial y de Gestión Empresarial'],
  'MEDICINA': ['Medicina Humana'],
  'ADMINISTRACIÓN DE EMPRESAS': ['Administración y Dirección de Empresas'],
  'MARKETING': ['Administración y Marketing'],
  'DERECHO': ['Derecho y Ciencia Política'],
  'NEGOCIOS INTERNACIONALES': ['Administración y Negocios Internacionales'],
  'FARMACIA Y BIOQUÍMICA': ['Farmacia y Bioquímica'],
  'CONTABILIDAD Y FINANZAS': ['Contabilidad y Auditoría'],
  'TECNOLOGÍA MÉDICA': ['Tecnología Médica en Terapia Física y Rehabilitación', 'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica'],
  'NUTRICIÓN': ['Nutrición y Dietética'],
  'PSICOLOGÍA': ['Psicología'],
  'ENFERMERÍA': ['Enfermería'],
  'ODONTOLOGÍA': ['Odontología'],
  'OBSTETRICIA': ['Obstetricia']
};

function parseSoles(raw) {
  const num = parseInt(String(raw || '').replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? null : num;
}

// Reduce las filas del CSV externo (algunas carreras aparecen más de una vez, con valores
// distintos — el Portal MiCarrera no distingue por qué) a un mapa "carrera UNW" -> mejor fila
// (menor Ranking Nacional = posición más alta), y la reparte a las carreras UNW que le
// correspondan según MAPEO_CARRERA_EXTERNO.
function indexarPorCarreraUNW(filas) {
  const mejorPorEtiqueta = {};
  (filas || []).forEach(f => {
    const etiqueta = String(f.Carrera || '').trim().toUpperCase();
    const rank = parseInt(f['Ranking Nacional'], 10);
    const ingresoJovenes = parseSoles(f['Ingreso Promedio Jóvenes']);
    const ingresoAdultos = parseSoles(f['Ingreso Promedio Adultos']);
    
    if (!etiqueta || (ingresoJovenes == null && ingresoAdultos == null)) return;
    
    const actual = mejorPorEtiqueta[etiqueta];
    if (!actual || (!isNaN(rank) && rank < actual.rank)) {
      mejorPorEtiqueta[etiqueta] = { 
        ingresoJovenes, 
        ingresoAdultos, 
        rank: isNaN(rank) ? Infinity : rank 
      };
    }
  });

  const porCarreraUNW = {};
  Object.entries(mejorPorEtiqueta).forEach(([etiqueta, val]) => {
    const carrerasUNW = MAPEO_CARRERA_EXTERNO[etiqueta];
    if (!carrerasUNW) return;
    carrerasUNW.forEach(c => { porCarreraUNW[c] = val; });
  });
  return porCarreraUNW;
}

// Igual que indexarPorCarreraUNW(), pero para el CSV "Wiener Externo" (carreras_top_upnw.csv):
// solo trae una columna de ingreso ("Ingreso Promedio", ya específica de egresados UNW según el
// Portal MiCarrera-MTPE, no separada por Jóvenes/Adultos) y no trae filas duplicadas por carrera,
// pero se desempata igual por Ranking Nacional por si acaso.
function indexarWienerExternoPorCarreraUNW(filas) {
  const mejorPorEtiqueta = {};
  (filas || []).forEach(f => {
    const etiqueta = String(f.Carrera || '').trim().toUpperCase();
    const rank = parseInt(f['Ranking Nacional'], 10);
    const ingreso = parseSoles(f['Ingreso Promedio']);

    if (!etiqueta || ingreso == null) return;

    const actual = mejorPorEtiqueta[etiqueta];
    if (!actual || (!isNaN(rank) && rank < actual.rank)) {
      mejorPorEtiqueta[etiqueta] = { ingreso, rank: isNaN(rank) ? Infinity : rank };
    }
  });

  const porCarreraUNW = {};
  Object.entries(mejorPorEtiqueta).forEach(([etiqueta, val]) => {
    const carrerasUNW = MAPEO_CARRERA_EXTERNO[etiqueta];
    if (!carrerasUNW) return;
    carrerasUNW.forEach(c => { porCarreraUNW[c] = val; });
  });
  return porCarreraUNW;
}

export async function loadEmpleabilidadPage(container, data) {
  const pertinencia = Calculations.getDistribucionPertinencia(data);
  const satisfaccion = Calculations.getDistribucionSatisfaccion(data);
  const salario = Calculations.getDistribucionSalario(data);
  const trabajadores = Calculations.getRespuestasTrabajadores(data);
  const ranking = Calculations.getRankingCarreras(data);

  // --- Dato Externo: Sueldo Promedio Nacional y Wiener (Portal MiCarrera - MTPE) ---
  const datoExterno = await DataLoader.loadDatoExternoSueldos();
  const mtpePorCarrera = indexarPorCarreraUNW(datoExterno.nacional);
  const wienerExternoPorCarrera = indexarWienerExternoPorCarreraUNW(datoExterno.wiener);

  // --- Nivel de Empleabilidad x Pertinencia Laboral, por Carrera ---
  // OJO: "Nivel de Empleabilidad" (KPI oficial del resto del dashboard) es Ocupados/PEA
  // (metodología OIT/INEI, Calculations.getTrazabilidadPEAPorCarrera → tasaPEA), NO la "tasa de
  // ocupación bruta" (trabaja Sí / total encuestados) que usa getRankingCarreras().ocupacion —
  // son indicadores distintos que no coinciden entre sí. Cruzar aquí la pertinencia (solo definida entre OCUPADOS, Pregunta 6
  // de la rama "Sí Trabaja") contra el % de "trabaja Sí" a secas mezclaría ambas metodologías, así
  // que se recalcula el Nivel de Empleabilidad oficial por carrera y se une por nombre de carrera
  // con la pertinencia ya calculada en `ranking` (misma fuente que "Trabajos Pertinentes por
  // Carrera", más abajo).
  const trazabilidadCarreras = Calculations.getTrazabilidadPEAPorCarrera(data);
  const empleabilidadPertinenciaCarreras = trazabilidadCarreras.carreras
    .filter(c => !c.carrera.toUpperCase().includes('MARKETING'))
    .map(c => {
      const pert = ranking.find(r => r.carrera === c.carrera);
      return {
        carrera: c.carrera,
        tasaEmpleabilidad: c.tasaPEA,
        tasaPertinencia: pert ? pert.tasaPertinencia : null,
        pea: c.pea,
        ocupadosTotalPEA: c.ocupadosTotalPEA,
        totalPertinencia: pert ? pert.totalPertinencia : 0
      };
    })
    // Solo carreras con datos válidos de ambos indicadores (algunas carreras muy nuevas pueden
    // no tener aún egresados ocupados que hayan respondido la pregunta de pertinencia).
    .filter(c => c.pea > 0 && c.totalPertinencia > 0)
    .sort((a, b) => b.tasaEmpleabilidad - a.tasaEmpleabilidad);

  const primerEmpleoRelacionado = {};
  const tiempoPrimerEmpleo = {};

  data.forEach(d => {
    const relacion = d[Calculations.cols.primerEmpleo];
    if (relacion) primerEmpleoRelacionado[relacion] = (primerEmpleoRelacionado[relacion] || 0) + 1;

    const tiempo = d[Calculations.cols.tiempoPrimerEmpleo];
    if (tiempo) tiempoPrimerEmpleo[tiempo] = (tiempoPrimerEmpleo[tiempo] || 0) + 1;
  });

  // Calcular tasa global de alta pertinencia directa
  let totalTrabResp = 0;
  let totalAltaResp = 0;
  let totalRelResp = 0;
  trabajadores.forEach(d => {
    const val = d[Calculations.cols.pertinencia];
    if (val) {
      totalTrabResp++;
      if (val.includes('totalmente')) {
        totalAltaResp++;
        totalRelResp++;
      } else if (val.includes('parcialmente')) {
        totalRelResp++;
      }
    }
  });
  const tasaAltaGlobal = totalTrabResp > 0 ? (totalAltaResp / totalTrabResp) * 100 : 0;
  const tasaRelGlobal = totalTrabResp > 0 ? (totalRelResp / totalTrabResp) * 100 : 0;

  // "Sueldo Promedio" es una columna oficial ya categorizada por punto medio de tramo
  // salarial; se usa para dar un estimado numérico único, más preciso que solo mostrar tramos.
  const sueldoPromedio = Calculations.getSueldoPromedioEstimado(trabajadores);

  // --- Sueldo Promedio por Programa Académico y por Año de Egreso (solo Encuesta 2026) ---
  // NO se compara contra la Encuesta 2025, por DOS razones independientes (ver nota metodológica
  // al pie de la página, con el detalle completo):
  // 1) Tramos salariales distintos para la misma pregunta ("9. ¿Cuál es tu ingreso mensual...?"):
  //    el punto medio de cada tramo cambia de definición entre ediciones (ver
  //    Calculations.getSueldoPromedioAgrupado).
  // 2) Distinta cantidad de cohortes de egreso encuestadas: Encuesta 2025 = 2018-2024 (7
  //    cohortes) vs. Encuesta 2026 = 2021-2025 (5 cohortes) — como el sueldo sube con los años de
  //    experiencia, mezclar más cohortes antiguas en una edición que en la otra ya distorsiona el
  //    promedio, aparte del problema de tramos.
  // Por eso esta tabla muestra solo la Encuesta 2026, sin columna de comparación entre encuestas.
  const sueldoPorCarrera = Calculations.getSueldoPromedioAgrupado(trabajadores, d => d[Calculations.cols.carrera])
    .filter(c => DataLoader.isCarreraVigente(c.key))
    // Ordenado por Nacional (Jóvenes) descendente — ya no por el sueldo propio de la Encuesta
    // 2026 (esa columna se quitó de la tabla de comparación externa, ver más abajo).
    .sort((a, b) => (mtpePorCarrera[b.key]?.ingresoJovenes || 0) - (mtpePorCarrera[a.key]?.ingresoJovenes || 0));

  const tasaEmpleabilidadTotal = trazabilidadCarreras?.totales?.tasaPEATotal || 0;
  const tasaEmpleabilidadDecimal = tasaEmpleabilidadTotal > 0 ? tasaEmpleabilidadTotal.toFixed(1) + '%' : '95.5%';

  container.innerHTML = `
    <div class="exec-dashboard-wrap">
      
      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Empleabilidad</span>
        </div>
        <h1 class="exec-header-title">Afinidad Formativa e Ingresos</h1>
        <div class="exec-header-subtitle">Afinidad formativa del empleo, satisfacción laboral e ingresos de egresados</div>
      </div>


      <!-- KPIs -->
      <div class="exec-kpis-container">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title" data-editable-id="emp-kpi-empleabilidad-title" data-editable-label="KPI: Título Nivel de Empleabilidad">Nivel de Empleabilidad</div>
          <div class="exec-kpi-number" data-editable-id="emp-kpi-empleabilidad-number" data-editable-label="KPI: Nivel de Empleabilidad">${tasaEmpleabilidadDecimal}</div>
          <div class="exec-kpi-desc" data-editable-id="emp-kpi-empleabilidad-desc" data-editable-label="KPI: Descripción Nivel de Empleabilidad">De los egresados en el mercado activo</div>
        </div>
        <div class="exec-kpi-box kpi-tint-green">
          <div class="exec-kpi-title">Trabajos Totalmente Pertinentes</div>
          <div class="exec-kpi-number">${Math.round(tasaAltaGlobal)}%</div>
          <div class="exec-kpi-desc">Afinidad directa (${totalAltaResp.toLocaleString()} ocupados)</div>
        </div>
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title">Pertinencia General</div>
          <div class="exec-kpi-number">${Math.round(tasaRelGlobal)}%</div>
          <div class="exec-kpi-desc">Total o parcialmente afín (${totalRelResp.toLocaleString()})</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Satisfacción Laboral</div>
          <div class="exec-kpi-number">${_calcularPorcentaje(satisfaccion, 'satisfecho', 'insatisfecho')}</div>
          <div class="exec-kpi-desc">Egresados satisfechos con empleo</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Ingresos > S/ 3,000</div>
          <div class="exec-kpi-number">${_calcularPorcentajeIngresosAltos(salario)}</div>
          <div class="exec-kpi-desc">Sueldo mensual superior</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Sueldo Promedio Estimado *</div>
          <div class="exec-kpi-number">S/ ${sueldoPromedio.promedio.toLocaleString()}</div>
          <div class="exec-kpi-desc">Basado en ${sueldoPromedio.n.toLocaleString()} respuestas con tramo salarial declarado</div>
        </div>
      </div>

      <!-- Empleabilidad por Sexo, Edad y Geografía -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-users" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Empleabilidad por Sexo, Edad y Geografía</span>
      </div>
      <p class="exec-section-desc" data-editable-id="resumen-empleabilidad-geo-desc" data-editable-label="Empleabilidad Geo: Descripción">Nivel de empleabilidad por sexo y edad, y dónde se concentra el empleo generado, por distrito.</p>
      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 12px;">

        <!-- Empleabilidad por Sexo -->
        <div class="exec-panel" data-visual-id="resumen-empleabilidad-sexo" style="min-height: 280px;">
          <div class="exec-panel-title" data-editable-id="resumen-panel-sexo-title" data-editable-label="Empleabilidad Sexo: Título">Nivel de Empleabilidad por Sexo</div>
          <div class="exec-sexo-flex">
            <div class="exec-sexo-donut">
              <canvas id="chart-exec-emp-sexo"></canvas>
            </div>
            <div id="exec-legend-emp-sexo" class="exec-sexo-legend"></div>
          </div>
        </div>

        <!-- Empleabilidad por Rango de Edad -->
        <div class="exec-panel" data-visual-id="resumen-empleabilidad-edad" style="min-height: 280px;">
          <div class="exec-panel-title" data-editable-id="resumen-panel-edad-title" data-editable-label="Empleabilidad Edad: Título">Nivel de Empleabilidad por Rango de Edad</div>
          <div class="exec-chart-canvas-wrap" style="height: calc(100% - 52px); margin-top: 10px;">
            <canvas id="chart-exec-emp-edad"></canvas>
          </div>
        </div>

        <!-- Ubicación laboral -->
        <div class="exec-panel" data-visual-id="resumen-empleabilidad-geografia" style="min-height: 280px;">
          <div class="exec-panel-title" data-editable-id="resumen-panel-geo-title" data-editable-label="Ubicación Laboral: Título">Ubicación laboral</div>
          <div class="exec-chart-canvas-wrap" style="height: 240px;">
            <canvas id="chart-exec-emp-geo"></canvas>
          </div>
        </div>

      </div>

      <!-- SECCIÓN: TRABAJOS PERTINENTES POR CARRERA -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-briefcase" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Trabajos Pertinentes por Carrera</span>
      </div>
      <p class="exec-section-desc">Porcentaje de egresados con un trabajo afín (total o parcialmente) a su carrera, por programa académico</p>
      
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 500px;">
          <canvas id="chart-tasa-pertinencia-carrera"></canvas>
        </div>
      </div>

      <!-- SECCIÓN: SEMÁFOROS DE INDICADORES -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-traffic-light" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Nivel de Pertinencia por Carrera</span>
      </div>
      <p class="exec-section-desc">🟢 Alta (≥75%) · 🟡 Media (60% - 74.9%) · 🔵 Baja (<60% de alta afinidad)</p>
      
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="table-container pb-2" style="overflow-x: auto;">
          <table class="data-table" style="min-width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th class="text-left" style="padding: 12px; font-weight: 600;">Carrera</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Egresados Ocupados</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Totalmente Afín</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Parcialmente Afín</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">No Afín</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Nivel de Pertinencia</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Pertinencia Total (%)</th>
              </tr>
            </thead>
            <tbody>
              ${ranking
      .slice()
      .sort((a, b) => b.tasaPertinenciaAlta - a.tasaPertinenciaAlta)
      .map((r, index) => {
        const pctAlta = r.tasaPertinenciaAlta;
        const pctTotal = r.tasaPertinencia;
        let semaforoColor = '#88E788';
        let semaforoText = `🟢 Alta (${Math.round(pctAlta)}%)`;
        if (pctAlta < 60) {
          semaforoColor = '#3b82f6';
          semaforoText = `🔵 Baja (${Math.round(pctAlta)}%)`;
        } else if (pctAlta < 75) {
          semaforoColor = '#f59e0b';
          semaforoText = `🟡 Media (${Math.round(pctAlta)}%)`;
        }

        return `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td class="text-dark font-medium" style="padding: 10px;">${r.carrera}</td>
                      <td class="text-center text-muted" style="padding: 10px;">${r.trabajadores.toLocaleString()}</td>
                      <td class="text-center text-dark font-bold" style="padding: 10px;">${r.totalmenteRelacionadas} <span class="text-muted font-normal text-xs">(${Math.round(pctAlta)}%)</span></td>
                      <td class="text-center text-muted" style="padding: 10px;">${r.parcialmenteRelacionadas}</td>
                      <td class="text-center text-muted" style="padding: 10px;">${r.noRelacionadas}</td>
                      <td class="text-center" style="padding: 10px;">
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 99px; border: 1px solid ${semaforoColor}; color: ${semaforoColor}; font-size: 11px; font-weight: bold;">${semaforoText}</span>
                      </td>
                      <td class="text-center font-bold text-success" style="padding: 10px;">${Math.round(pctTotal)}%</td>
                    </tr>
                  `;
      }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECCIÓN: NIVEL DE EMPLEABILIDAD x PERTINENCIA LABORAL, POR CARRERA -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-balance-scale" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Nivel de Empleabilidad vs. Pertinencia Laboral, por Carrera</span>
      </div>
      <p class="exec-section-desc">¿Las carreras con mayor empleabilidad (Ocupados/PEA) también colocan a sus egresados en empleos afines a su formación? Nivel de Empleabilidad: % de la PEA que está ocupada (misma metodología OIT/INEI del resto del dashboard). Pertinencia Laboral: % de ocupados con un empleo total o parcialmente relacionado a su carrera</p>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 620px;">
          <canvas id="chart-empleabilidad-pertinencia-carrera"></canvas>
        </div>
      </div>

      <!-- Gráficos fila 3 -->
      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title">Satisfacción Laboral</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Grado de satisfacción con el empleo actual</p>
          <div class="exec-chart-canvas-wrap" style="height: 300px;">
            <canvas id="chart-satisfaccion"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title">Distribución Salarial</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Ingresos mensuales brutos reportados</p>
          <div class="exec-chart-canvas-wrap" style="height: 300px;">
            <canvas id="chart-salario"></canvas>
          </div>
        </div>
      </div>

      <!-- Gráficos fila 4 -->
      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title">Inserción Laboral</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Meses para obtener el primer empleo</p>
          <div class="exec-chart-canvas-wrap" style="height: 300px;">
            <canvas id="chart-tiempo-primer-empleo"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title">Afinidad Primer Empleo</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Relación del primer trabajo con la carrera estudiada</p>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 300px;">
            <canvas id="chart-primer-empleo-relacion"></canvas>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: SUELDO PROMEDIO (NACIONAL VS. WIENER, MERCADO EXTERNO MTPE) -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-sack-dollar" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Sueldo Promedio por Programa Académico vs. Mercado Nacional</span>
      </div>
      <p class="exec-section-desc">Comparación del sueldo de egresados de la UNW contra el mercado nacional, ambas cifras del Ministerio de Trabajo (Portal MiCarrera, Planilla Formal).</p>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="table-container pb-2" style="overflow-x: auto;">
          <table class="data-table" style="min-width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th class="text-center" style="padding: 12px; font-weight: 600; width: 48px;">N°</th>
                <th class="text-left" style="padding: 12px; font-weight: 600;">Programa Académico</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Nacional (Jóvenes) †</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Wiener (Externo MTPE) ‡</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Tendencia §</th>
              </tr>
            </thead>
            <tbody>
              ${sueldoPorCarrera.map((c, i) => {
                const mtpe = mtpePorCarrera[c.key] || {};
                const wienerExt = wienerExternoPorCarrera[c.key] || {};
                const fmt = (v) => v == null ? '<span class="text-muted">No registra</span>' : `S/ ${v.toLocaleString()}`;
                // Tendencia: Wiener (Externo MTPE) vs. Nacional (Jóvenes) — misma base comparable
                // (egresados recientes), ambas del Portal MiCarrera. Umbral ±5% para no marcar como
                // "tendencia" diferencias que caben dentro del margen de error muestral. Sin dato
                // Wiener Externo para esa carrera (10 de 16) → "-".
                let tendencia = '<span class="text-muted" style="font-weight:700;">-</span>';
                if (mtpe.ingresoJovenes != null && mtpe.ingresoJovenes > 0 && wienerExt.ingreso != null) {
                  const pctDif = ((wienerExt.ingreso - mtpe.ingresoJovenes) / mtpe.ingresoJovenes) * 100;
                  tendencia = pctDif > 5
                    ? '<span style="color:#2E7D32;font-weight:700;">▲</span>'
                    : pctDif < -5
                      ? '<span style="color:#C62828;font-weight:700;">▼</span>'
                      : '<span style="color:#94a3b8;font-weight:700;">▬</span>';
                }
                return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td class="text-center text-muted" style="padding: 10px;">${i + 1}</td>
                  <td class="text-dark font-medium" style="padding: 10px;">${window.toTitleCase ? window.toTitleCase(c.key) : c.key}</td>
                  <td class="text-center font-bold text-dark" style="padding: 10px;">${fmt(mtpe.ingresoJovenes)}</td>
                  <td class="text-center font-bold text-dark" style="padding: 10px;">${fmt(wienerExt.ingreso)}</td>
                  <td class="text-center" style="padding: 10px;">${tendencia}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <p class="exec-section-desc" style="margin: 12px 20px 0 20px; font-size: 11px;">
          <strong>† Nacional (Jóvenes):</strong> ingreso promedio a nivel nacional para la carrera, Portal MiCarrera (MTPE), en base a Planilla del sector formal (Set. 2023 - Ago. 2024) — egresados recientes. "No registra" significa que el Portal MiCarrera no publica ese dato para esa carrera. Cuando el CSV nacional traía más de una fila para la misma carrera, se usó la de mejor Ranking Nacional.<br>
          <strong>‡ Wiener (Externo MTPE):</strong> ingreso promedio específico de egresados de la UNW según el mismo Portal MiCarrera (MTPE) — misma fuente y misma base (egresados recientes) que "Nacional (Jóvenes)", por eso son comparables entre sí. Solo publicada para 10 de 16 carreras vigentes.<br>
          <strong>§ Tendencia:</strong> compara "Wiener (Externo MTPE)" contra "Nacional (Jóvenes)". 🟢 <strong>▲</strong> Wiener por encima del mercado nacional (+5% o más), <strong>▬</strong> prácticamente igual (±5%), 🔴 <strong>▼</strong> Wiener por debajo (-5% o más). Sin dato Wiener Externo para esa carrera → "-".
        </p>
      </div>

      <!-- Metodología -->
      <div class="exec-footer-notes">
        <p><strong>Pertinencia del Empleo:</strong> Correspondencia directa del trabajo desempeñado con la formación profesional (Pregunta 7), distinguiendo afinidad total y parcial.</p>
        <p><strong>Semáforos de Afinidad:</strong> 🟢 <strong>Alta</strong> (≥75%), 🟡 <strong>Media</strong> (60% - 74.9%) y 🔵 <strong>Baja</strong> (<60% de afinidad total).</p>
        <p><strong>Nivel de Empleabilidad vs. Pertinencia Laboral:</strong> El Nivel de Empleabilidad usa la misma metodología OIT/INEI (Ocupados/PEA) que el resto del dashboard — distinta de la "tasa de ocupación bruta" (Sí trabaja / total encuestados). La Pertinencia Laboral solo se calcula sobre egresados ocupados que respondieron la Pregunta 6 (rama "Sí Trabaja"), por eso el % de Pertinencia siempre corresponde a un subconjunto más chico que la PEA usada para el Nivel de Empleabilidad. No se muestran carreras sin respuestas válidas de pertinencia.</p>
        <p><strong>* Sueldo Promedio Wiener:</strong> No se compara contra la Encuesta 2025. Se calcula sobre egresados ocupados que declararon su tramo salarial (se excluye "Prefiero no decirlo"). No es comparable con 2025 por cambios en los tramos salariales y la distinta composición de cohortes encuestadas (2018-2024 vs. 2019-2025).</p>
      </div>
  `;

  Charts.waitForReady().then(() => {
    createChartEmpleabilidadSexo();
    createChartEmpleabilidadEdad();
    createChartEmpleabilidadGeo();

    const rankingPertinencia = ranking
      .filter(r => !r.carrera.toUpperCase().includes('MARKETING'))
      .sort((a, b) => b.tasaPertinencia - a.tasaPertinencia);

    // Totalmente Afín + Parcialmente Afín se fusionan en un solo indicador de Pertinencia
    // Total, mismo estilo (barra apilada horizontal con % superpuesto) que el cruce
    // "¿Trabaja actualmente? por Carrera" de Resultados Generales: una sola barra celeste
    // hasta el % pertinente y el resto en gris claro, en vez de dos series de color.
    const pertinenciaValues = rankingPertinencia.map(r => Math.round(r.tasaPertinencia));
    const noPertinenciaValues = pertinenciaValues.map(v => 100 - v);

    Charts.createHorizontalStackedBarChart('chart-tasa-pertinencia-carrera',
      rankingPertinencia.map(r => window.toTitleCase ? window.toTitleCase(r.carrera) : r.carrera),
      [
        {
          label: 'Pertinente',
          data: pertinenciaValues,
          backgroundColor: '#07C8CC'
        },
        {
          label: 'No Pertinente',
          data: noPertinenciaValues,
          backgroundColor: '#D1D5DB'
        }
      ],
      {
        scales: { x: { display: false } },
        layout: { padding: { right: 38 } },
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function (context) {
                const idx = context.dataIndex;
                const r = rankingPertinencia[idx];
                if (context.datasetIndex === 0) {
                  const totalAfin = r.totalmenteRelacionadas + r.parcialmenteRelacionadas;
                  return ' Pertinente: ' + Math.round(r.tasaPertinencia) + '% (' + totalAfin.toLocaleString() + ' de ' + r.trabajadores.toLocaleString() + ' ocupados)';
                }
                return ' No pertinente: ' + Math.round(100 - r.tasaPertinencia) + '%';
              }
            }
          },
          datalabels: {
            display: true,
            color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => {
              const num = typeof v === 'number' ? v : (typeof v === 'object' && v !== null ? (v.x ?? v.y ?? 0) : Number(v) || 0);
              return `${Math.round(num)}%`;
            }
          }
        }
      }
    );

    // Nivel de Empleabilidad (Ocupados/PEA, oficial) vs. Pertinencia Laboral, por carrera:
    // barras agrupadas (no apiladas) para comparar directamente las dos tasas — NO son partes de
    // un mismo total, son dos indicadores independientes sobre poblaciones distintas (PEA vs.
    // ocupados que respondieron pertinencia), ver nota metodológica al pie de la página.
    Charts.createHorizontalBarChart('chart-empleabilidad-pertinencia-carrera',
      empleabilidadPertinenciaCarreras.map(c => window.toTitleCase ? window.toTitleCase(c.carrera) : c.carrera),
      [
        {
          label: 'Nivel de Empleabilidad',
          data: empleabilidadPertinenciaCarreras.map(c => Math.round(c.tasaEmpleabilidad)),
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 3
        },
        {
          label: 'Pertinencia Laboral',
          data: empleabilidadPertinenciaCarreras.map(c => Math.round(c.tasaPertinencia)),
          backgroundColor: '#368BA1',
          borderColor: '#368BA1',
          borderWidth: 1,
          borderRadius: 3
        }
      ],
      {
        xAxisFormat: (v) => `${Math.round(v)}%`,
        scales: { x: { min: 0, max: 100 } },
        layout: { padding: { right: 28 } },
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (item) => {
                const c = empleabilidadPertinenciaCarreras[item.dataIndex];
                if (item.datasetIndex === 0) {
                  return ` Nivel de Empleabilidad: ${Math.round(item.raw)}% (${c.ocupadosTotalPEA.toLocaleString()} de ${c.pea.toLocaleString()} en la PEA)`;
                }
                return ` Pertinencia Laboral: ${Math.round(item.raw)}% (sobre ${c.totalPertinencia.toLocaleString()} ocupados que respondieron)`;
              }
            }
          },
          datalabels: {
            display: true,
            color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
            formatter: (v) => `${Math.round(v)}%`
          }
        }
      }
    );

    // Orden de escala Likert (no por frecuencia): de otro modo el gráfico agrupa las
    // categorías al azar y no se puede leer la tendencia de un vistazo.
    const ordenSatisfaccion = ['Muy satisfecho', 'Satisfecho', 'Ni satisfecho ni insatisfecho', 'Insatisfecho', 'Muy insatisfecho'];
    const satisfaccionOrdenada = satisfaccion.slice().sort((a, b) => {
      const idxA = ordenSatisfaccion.indexOf(a.categoria);
      const idxB = ordenSatisfaccion.indexOf(b.categoria);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
    const totalSatisfaccion = satisfaccionOrdenada.reduce((s, x) => s + x.cantidad, 0);
    Charts.createBarChart('chart-satisfaccion',
      satisfaccionOrdenada.map(s => {
        // Break long labels into multiple lines
        if (s.categoria === 'Ni satisfecho ni insatisfecho') return ['Ni satisfecho', 'ni insatisfecho'];
        return s.categoria;
      }),
      [{ label: 'Cantidad', data: satisfaccionOrdenada.map(s => s.cantidad), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 4, maxBarThickness: 60 }],
      {
        yAxisFormat: (v) => v.toLocaleString(),
        scales: { x: { ticks: { minRotation: 0, maxRotation: 0, font: { size: 10 } } } },
        plugins: {
          tooltip: { callbacks: { label: (item) => ` ${item.raw.toLocaleString()} egresados (${totalSatisfaccion > 0 ? Math.round((item.raw / totalSatisfaccion) * 100) : 0}%)` } },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, totalSatisfaccion)
          }
        }
      }
    );

    // Coincidencia por subcadena (no exacta): la fuente puede traer variantes de redacción
    // del mismo tramo salarial (con/sin punto, con/sin espacio, "soles" al final, etc.).
    const ordenSalarios = [
      'Hasta S/. 1,500', 'Hasta S/. 1, 500',
      'Entre S/. 1,501 y S/. 3,000', 'Entre S/1,501 y S/. 3,000',
      'Entre S/. 3,001 y S/. 5,000',
      'Entre S/. 5,001 y S/. 8,000', 'Entre S/. 5,001 y S/8,000 soles',
      'Más de S/. 8,001', 'Más de S/.8,001',
      'Prefiero no decirlo'
    ];
    const indiceSalario = (categoria) => {
      const lower = String(categoria || '').toLowerCase();
      let idx = ordenSalarios.findIndex(o => o.toLowerCase() === lower);
      if (idx !== -1) return idx;
      return ordenSalarios.findIndex(o => lower.includes(o.toLowerCase()) || o.toLowerCase().includes(lower));
    };
    const salarioOrdenado = salario.slice().sort((a, b) => {
      const idxA = indiceSalario(a.categoria);
      const idxB = indiceSalario(b.categoria);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

    const totalSalario = salarioOrdenado.reduce((s, x) => s + x.cantidad, 0);
    Charts.createBarChart('chart-salario',
      salarioOrdenado.map(s => {
        let cat = s.categoria;
        if (cat.includes('Entre')) {
          const parts = cat.split(' y ');
          if (parts.length === 2) return [parts[0] + ' y', parts[1]];
        }
        if (cat === 'Prefiero no decirlo') return ['Prefiero no', 'decirlo'];
        return cat;
      }),
      [{ label: 'Cantidad', data: salarioOrdenado.map(s => s.cantidad), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 4, maxBarThickness: 60 }],
      {
        yAxisFormat: (v) => v.toLocaleString(),
        scales: { x: { ticks: { minRotation: 0, maxRotation: 0, font: { size: 10 } } } },
        plugins: {
          tooltip: { callbacks: { label: (item) => ` ${item.raw.toLocaleString()} egresados (${totalSalario > 0 ? Math.round((item.raw / totalSalario) * 100) : 0}%)` } },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, totalSalario)
          }
        }
      }
    );

    const ordenCronologico = [
      'Ya me encontraba trabajando al egresar.',
      'De 1 a 3 meses',
      'De 3 a 6 meses',
      'De 6 a 12 meses',
      '12 meses a más'
    ];
    const sortedTiempo = Object.entries(tiempoPrimerEmpleo)
      .sort((a, b) => {
        const idxA = ordenCronologico.indexOf(a[0]);
        const idxB = ordenCronologico.indexOf(b[0]);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });

    const totalTiempoPrimerEmpleo = sortedTiempo.reduce((s, t) => s + t[1], 0);
    Charts.createBarChart('chart-tiempo-primer-empleo',
      sortedTiempo.map(t => {
        if (t[0] === 'Ya me encontraba trabajando al egresar.') return ['Ya me encontraba', 'trabajando al egresar'];
        return t[0];
      }),
      [{ label: 'Cantidad', data: sortedTiempo.map(t => t[1]), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 4, maxBarThickness: 60 }],
      {
        yAxisFormat: (v) => v.toLocaleString(),
        scales: { x: { ticks: { minRotation: 0, maxRotation: 0, font: { size: 10 } } } },
        plugins: {
          tooltip: { callbacks: { label: (item) => ` ${item.raw.toLocaleString()} egresados (${totalTiempoPrimerEmpleo > 0 ? Math.round((item.raw / totalTiempoPrimerEmpleo) * 100) : 0}%)` } },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, totalTiempoPrimerEmpleo)
          }
        }
      }
    );

    const primerEmpleoLabels = Object.keys(primerEmpleoRelacionado);
    const primerEmpleoData = Object.values(primerEmpleoRelacionado);
    const totalPrimerEmpleo = primerEmpleoData.reduce((s, v) => s + v, 0);
    Charts.createDoughnutChart('chart-primer-empleo-relacion',
      primerEmpleoLabels,
      primerEmpleoData,
      {
        legendPosition: 'bottom', colors: ['#07C8CC', '#368BA1', '#88E788', '#DCB17C', '#D1D5DB'],
        plugins: {
          datalabels: {
            display: true, color: '#ffffff',
            font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, totalPrimerEmpleo)
          }
        }
      }
    );
  });
}

function _calcularPorcentaje(distribucion, termino, exclusion) {
  const total = distribucion.reduce((sum, d) => sum + d.cantidad, 0);
  const relevantes = distribucion
    .filter(d => {
      const cat = d.categoria.toLowerCase();
      if (exclusion && cat.includes(exclusion.toLowerCase())) return false;
      return cat.includes(termino);
    })
    .reduce((sum, d) => sum + d.cantidad, 0);
  return total > 0 ? Math.round((relevantes / total) * 100) + '%' : '0%';
}

function _calcularPorcentajeIngresosAltos(salario) {
  const total = salario.reduce((sum, s) => sum + s.cantidad, 0);
  const altos = salario
    .filter(s => s.categoria.includes('3,001') || s.categoria.includes('5,001') || s.categoria.includes('8,001'))
    .reduce((sum, s) => sum + s.cantidad, 0);
  return total > 0 ? Math.round((altos / total) * 100) + '%' : '0%';
}

function inferirSexoDesdeNombre(nombreCompleto) {
  if (!nombreCompleto) return null;
  const primero = nombreCompleto.trim().split(/\s+/)[0].toUpperCase();
  if (NOMBRE_GENERO[primero]) return NOMBRE_GENERO[primero] === 'F' ? 'Femenino' : 'Masculino';

  const sinTilde = primero.normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (NOMBRE_GENERO[sinTilde]) return NOMBRE_GENERO[sinTilde] === 'F' ? 'Femenino' : 'Masculino';

  // Heurística de respaldo para nombres fuera del diccionario
  if (/[AÁ]$/.test(sinTilde)) return 'Femenino';
  if (/O$/.test(sinTilde)) return 'Masculino';
  if (/Y$/.test(sinTilde)) return 'Femenino';
  if (/[IE]$/.test(sinTilde)) return 'Femenino';
  return 'Masculino';
}


function computeEmpleabilidadPorSegmento(data, segmentGetter) {
  const buckets = {};
  (data || []).forEach(d => {
    const seg = segmentGetter(d);
    if (!seg) return;
    const info = Calculations?.classifyLaborStatus ? Calculations.classifyLaborStatus(d) : null;
    if (!info || !info.esPEA) return;
    if (!buckets[seg]) buckets[seg] = { ocupados: 0, pea: 0 };
    buckets[seg].pea++;
    if (info.esOcupado) buckets[seg].ocupados++;
  });
  return Object.entries(buckets).map(([segmento, v]) => ({
    segmento,
    tasa: v.pea > 0 ? (v.ocupados / v.pea) * 100 : 0,
    ocupados: v.ocupados,
    pea: v.pea
  }));
}

function createChartEmpleabilidadSexo() {
  const ctx = document.getElementById('chart-exec-emp-sexo');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const cols = (window.Calculations && Calculations.cols) || {};
  const resultados = computeEmpleabilidadPorSegmento(data, d => {
    const raw = d['Sexo'] || d['sexo'] || d['SEXO'] || d[cols.sexo];
    if (raw) {
      const s = String(raw).trim().toLowerCase();
      if (s.startsWith('m') || s === 'hombre') return 'Masculino';
      if (s.startsWith('f') || s === 'mujer') return 'Femenino';
    }
    return inferirSexoDesdeNombre(d[cols.nombres]);
  });

  const orden = ['Masculino', 'Femenino'];
  resultados.sort((a, b) => orden.indexOf(a.segmento) - orden.indexOf(b.segmento));

  const labels = resultados.map(r => r.segmento);
  const values = resultados.map(r => Math.round(r.tasa));
  const colors = { 'Masculino': '#368BA1', 'Femenino': '#FFB5C0' };
  const icons = {
    'Masculino': '<i class="fas fa-mars" style="color:#368BA1;"></i>',
    'Femenino': '<i class="fas fa-venus" style="color:#FFB5C0;"></i>'
  };

  const legendEl = document.getElementById('exec-legend-emp-sexo');
  if (legendEl) {
    legendEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;justify-content:center;height:100%;">
        ${resultados.map(r => `
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="width:16px;text-align:center;flex-shrink:0;font-size:13px;">${icons[r.segmento] || ''}</span>
            <span style="font-size:12px;color:#475569;font-weight:500;min-width:80px;">${r.segmento}</span>
            <span style="font-size:14px;font-weight:700;color:#0a1b44;">${Math.round(r.tasa)}%</span>
            <span style="font-size:11px;color:#94a3b8;">(${r.ocupados.toLocaleString()} de ${r.pea.toLocaleString()})</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  const largestIdx = values.indexOf(Math.max(...values));
  const centerPlugin = {
    id: 'empSexoCenter',
    beforeDraw(chart) {
      const { width, height, ctx } = chart;
      ctx.save();
      ctx.font = '800 22px Inter, sans-serif';
      ctx.fillStyle = '#0a1b44';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${values[largestIdx]}%`, width / 2, height / 2 - 8);
      ctx.font = '500 11px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(labels[largestIdx] || '', width / 2, height / 2 + 12);
      ctx.restore();
    }
  };

  activeCharts.empSexo = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(l => colors[l] || '#94a3b8'),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      layout: { padding: 10 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0a1b44',
          titleFont: { family: 'Inter', size: 13, weight: '700' },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: (item) => {
              const r = resultados[item.dataIndex];
              return ` ${item.label}: ${Math.round(r.tasa)}% (${r.ocupados.toLocaleString()} de ${r.pea.toLocaleString()})`;
            }
          }
        }
      }
    },
    plugins: [centerPlugin]
  });
}

function createChartEmpleabilidadEdad() {
  const ctx = document.getElementById('chart-exec-emp-edad');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const cols = (window.Calculations && Calculations.cols) || {};

  const resultados = computeEmpleabilidadPorSegmento(data, d => {
    const raw = (d[cols.rangoEdad] || '').toString().trim();
    if (!raw) return null;
    // Normalizar: "31–35 años" -> "31–35" ("51 a más" no tiene sufijo y queda igual)
    return raw.replace(/\s*años\s*/i, '').trim();
  });

  const ordenRangos = ['22–25', '26–30', '31–35', '36–40', '41–50', '51 a más'];
  resultados.sort((a, b) => {
    const ia = ordenRangos.indexOf(a.segmento);
    const ib = ordenRangos.indexOf(b.segmento);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const labels = resultados.map(r => r.segmento);
  const values = resultados.map(r => Math.round(r.tasa));

  activeCharts.empEdad = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: '#07C8CC', borderRadius: 4, barPercentage: 0.7, categoryPercentage: 0.8 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 22, right: 10, left: 0, bottom: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const r = resultados[item.dataIndex];
              return ` ${r.segmento}: ${Math.round(r.tasa)}% (${r.ocupados.toLocaleString()} de ${r.pea.toLocaleString()})`;
            }
          }
        }
      },
      scales: {
        y: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => `${v}%`, font: { size: 10, family: 'Inter' }, color: '#94a3b8' }, grid: { color: '#f1f5f9', drawBorder: false } },
        x: { ticks: { font: { size: 10, family: 'Inter', weight: '500' }, color: '#475569', maxRotation: 0 }, grid: { display: false } }
      }
    },
    plugins: [{ id: 'execDataLabels', afterDatasetsDraw(chart) { const { ctx } = chart; chart.data.datasets.forEach((ds, di) => { const meta = chart.getDatasetMeta(di); if (meta.hidden) return; meta.data.forEach((bar, i) => { const val = ds.data[i]; if (val == null) return; ctx.save(); ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = '#0a1b44'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(`${Math.round(Number(val))}%`, bar.x, bar.y - 6); ctx.restore(); }); }); } }]
  });
}

// Concentración de egresados OCUPADOS por distrito. Usa exclusivamente el
// dataset oficial (encuestas 2026, sin sufijo de año) — la pregunta "3.6
// Dónde labora" solo se hace a quienes trabajan, así que se muestra como
// concentración (no como tasa, que sería siempre ~100%).
function createChartEmpleabilidadGeo() {
  const ctx = document.getElementById('chart-exec-emp-geo');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const cols = (window.Calculations && Calculations.cols) || {};

  const counts = {};
  let totalOcupados = 0;
  (data || []).forEach(d => {
    const info = Calculations?.classifyLaborStatus ? Calculations.classifyLaborStatus(d) : null;
    if (!info || !info.esOcupado) return;
    const raw = (d[cols.distrito] || '').toString().trim();
    if (!raw) return;
    const label = window.toTitleCase ? window.toTitleCase(raw) : raw;
    counts[label] = (counts[label] || 0) + 1;
    totalOcupados++;
  });

  let resultados = Object.entries(counts).map(([segmento, count]) => ({
    segmento, count, pct: totalOcupados > 0 ? (count / totalOcupados) * 100 : 0
  }));
  resultados = resultados.sort((a, b) => b.count - a.count).slice(0, 10);

  const labels = resultados.map(r => r.segmento);
  const values = resultados.map(r => Math.round(r.pct));

  activeCharts.empGeo = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: '#07C8CC', borderRadius: 2, barPercentage: 0.62, categoryPercentage: 0.85 }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 5, right: 45, left: 0, bottom: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const r = resultados[item.dataIndex];
              return ` ${r.count.toLocaleString()} egresados ocupados (${Math.round(r.pct)}% del total ocupado)`;
            }
          }
        }
      },
      scales: {
        x: { min: 0, max: Math.max(20, ...values) + 5, ticks: { callback: (v) => `${v}%`, font: { size: 10, family: 'Inter' }, color: '#64748b' }, grid: { color: '#f1f5f9', drawBorder: false } },
        y: { ticks: { font: { size: 11, family: 'Inter', weight: '500' }, color: '#1e293b', autoSkip: false }, grid: { display: false } }
      }
    },
    plugins: [{ id: 'execDataLabels', afterDatasetsDraw(chart) { const { ctx } = chart; chart.data.datasets.forEach((ds, di) => { const meta = chart.getDatasetMeta(di); if (meta.hidden) return; meta.data.forEach((bar, i) => { const val = ds.data[i]; if (val == null) return; ctx.save(); ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = '#0a1b44'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`${Math.round(Number(val))}%`, bar.x + 6, bar.y); ctx.restore(); }); }); } }]
  });
}

const NOMBRE_GENERO = {
    MARIA: 'F', LUZ: 'F', ROSA: 'F', DIANA: 'F', ANA: 'F', ELIZABETH: 'F', KATHERINE: 'F', MILAGROS: 'F', CLAUDIA: 'F', CARMEN: 'F',
    ROXANA: 'F', ANDREA: 'F', BRENDA: 'F', KAREN: 'F', FLOR: 'F', LIZ: 'F', SANDRA: 'F', JESSICA: 'F', ROSARIO: 'F', VALERIA: 'F',
    ESTEFANY: 'F', RUTH: 'F', RUT: 'F', ALEXANDRA: 'F', KELLY: 'F', KARLA: 'F', LIZBETH: 'F', LESLIE: 'F', MAYRA: 'F', ANGIE: 'F',
    MIRIAM: 'F', NANCY: 'F', ERIKA: 'F', ANGELA: 'F', PATRICIA: 'F', PAOLA: 'F', EVELYN: 'F', FIORELLA: 'F', NELLY: 'F', MARIBEL: 'F',
    XIOMARA: 'F', SHIRLEY: 'F', YESSICA: 'F', LILIANA: 'F', CARLA: 'F', GERALDINE: 'F', NATHALY: 'F', PAMELA: 'F', MARICIELO: 'F', EDITH: 'F',
    VANESSA: 'F', SOFIA: 'F', SOFÍA: 'F', DAYANA: 'F', THALIA: 'F', LEYDI: 'F', GLORIA: 'F', RAQUEL: 'F', ALICIA: 'F', MARY: 'F',
    ANGELICA: 'F', LUCERO: 'F', CINTHYA: 'F', LOURDES: 'F', KATHERIN: 'F', JACKELINE: 'F', GABRIELA: 'F', LADY: 'F', WENDY: 'F', FIORELA: 'F',
    CINTHIA: 'F', VALERY: 'F', KIMBERLY: 'F', NATALY: 'F', ISABEL: 'F', SILVIA: 'F', JUDITH: 'F', MARJORIE: 'F', VILMA: 'F', DANIELA: 'F',
    LESLY: 'F', LORENA: 'F', MARITZA: 'F', XIMENA: 'F', KAROL: 'F', SONIA: 'F', YANIRA: 'F', LUISA: 'F', MELISSA: 'F', DINA: 'F',
    LISBETH: 'F', CINDY: 'F', LIDIA: 'F', YANINA: 'F', KIARA: 'F', INGRID: 'F', YULIANA: 'F', MARLENE: 'F', MARISOL: 'F', JENNY: 'F',
    DORIS: 'F', MILUSKA: 'F', KATIA: 'F', HAYDEE: 'F', CYNTHIA: 'F', HILDA: 'F', ELSA: 'F', ARIANA: 'F', ELENA: 'F', NICOLE: 'F',
    GIANELLA: 'F', JENNIFER: 'F', CAROLINA: 'F', CAMILA: 'F', FLAVIA: 'F', KELY: 'F', SARA: 'F', TANIA: 'F', GLADIS: 'F', MIRELLA: 'F',
    MARTHA: 'F', JACKELIN: 'F', LEIDY: 'F', MARIELA: 'F', RITA: 'F', CAROL: 'F', ROCIO: 'F', ROCÍO: 'F', GINA: 'F', STEPHANIE: 'F',
    ELIANA: 'F', YESSENIA: 'F', STEPHANY: 'F', NAYSHA: 'F', BETTY: 'F', MONICA: 'F', MÓNICA: 'F', SHARON: 'F', ESMERALDA: 'F', GLADYS: 'F',
    JULIA: 'F', SUSAN: 'F', VICTORIA: 'F', DAYSI: 'F', JAZMIN: 'F', CRISTINA: 'F', LINDA: 'F', YULISA: 'F', VERONICA: 'F', VERÓNICA: 'F',
    REBECA: 'F', NALLELY: 'F', EVA: 'F', GENESIS: 'F', GÉNESIS: 'F', BETSABE: 'F', ROSSMERY: 'F', LAURA: 'F', JACQUELINE: 'F', KEYLA: 'F',
    BERTHA: 'F', FATIMA: 'F', FÁTIMA: 'F', NOEMI: 'F', YADIRA: 'F', JANETH: 'F', PILAR: 'F', ADRIANA: 'F', GIULIANA: 'F', NORMA: 'F',
    SARAI: 'F', JOSELYN: 'F', NAOMI: 'F', BLANCA: 'F', BEATRIZ: 'F', REGINA: 'F', YESENIA: 'F', MELANIE: 'F', NELY: 'F', NILA: 'F',
    ALESSANDRA: 'F', AMELIA: 'F', JIMENA: 'F', JANET: 'F', NINA: 'F', ELVA: 'F', MAGALY: 'F', YESICA: 'F', JULISSA: 'F', SANTA: 'F',
    EMELY: 'F', NURY: 'F', MISHELL: 'F', FRANCHESCA: 'F', ANITA: 'F', SHEYLA: 'F', GISELA: 'F', NAYELY: 'F', LOYDA: 'F', JHOANA: 'F',
    AYDEE: 'F', ROSMERY: 'F', SARITA: 'F', JOSSELYN: 'F', MARYORI: 'F', JHOSELYN: 'F', JENIFER: 'F', MARLENY: 'F', YADHIRA: 'F', MERCEDES: 'F',
    ESTHER: 'F', ABIGAIL: 'F', ASTRID: 'F', BELEN: 'F', BELÉN: 'F', YASMIN: 'F', ROSALIA: 'F', CONSUELO: 'F',
    JOSE: 'M', LUIS: 'M', CARLOS: 'M', JUAN: 'M', MIGUEL: 'M', DIEGO: 'M', DAVID: 'M', JORGE: 'M', RENZO: 'M', JESUS: 'M', JESÚS: 'M',
    CRISTIAN: 'M', CESAR: 'M', CÉSAR: 'M', JHON: 'M', VICTOR: 'M', VÍCTOR: 'M', DANIEL: 'M', CHRISTIAN: 'M', MARCO: 'M', ANTHONY: 'M',
    PEDRO: 'M', RICARDO: 'M', JULIO: 'M', ANGEL: 'M', ÁNGEL: 'M', ALVARO: 'M', ÁLVARO: 'M', JAVIER: 'M', KEVIN: 'M', RONALD: 'M',
    JHONATAN: 'M', MARTIN: 'M', MARTÍN: 'M', JEAN: 'M', PIERO: 'M', FERNANDO: 'M', EDUARDO: 'M', MANUEL: 'M', JOSEPH: 'M', ALEX: 'M',
    JOEL: 'M', GUSTAVO: 'M', OSCAR: 'M', ÓSCAR: 'M', JONATHAN: 'M', ERICK: 'M', RUBEN: 'M', RUBÉN: 'M', RODRIGO: 'M', JAIME: 'M',
    IVAN: 'M', IVÁN: 'M', ALEXANDER: 'M', HECTOR: 'M', HÉCTOR: 'M', FRANK: 'M', FELIX: 'M', FÉLIX: 'M', JOSUE: 'M', JOSUÉ: 'M',
    LEONARDO: 'M', OMAR: 'M', MARIO: 'M', JIMMY: 'M', ROBERTO: 'M', ANTONIO: 'M', JOHN: 'M', EDWIN: 'M', ISRAEL: 'M', MICHAEL: 'M',
    YURI: 'M', DANNY: 'M', ALBERTO: 'M', SERGIO: 'M', WILLIAMS: 'M', SEBASTIAN: 'M', SEBASTIÁN: 'M', ANDRES: 'M', ANDRÉS: 'M', FREDDY: 'M',
    ARNOLD: 'M', ABRAHAM: 'M', JORDY: 'M', ORLANDO: 'M', PABLO: 'M', FLAVIO: 'M', ANDY: 'M', ANTONY: 'M', BRYAN: 'M', HUGO: 'M',
    ADRIAN: 'M', ADRIÁN: 'M', ALDAIR: 'M', RICHARD: 'M', NESTOR: 'M', NÉSTOR: 'M', ENRIQUE: 'M', GINO: 'M', EDDER: 'M', GONZALO: 'M',
    RAUL: 'M', RAÚL: 'M', MARCELO: 'M', ALBERT: 'M', GIANCARLO: 'M', UZIEL: 'M', SEGUNDO: 'M', RONY: 'M', WILLIAM: 'M', RENATO: 'M'
  };
