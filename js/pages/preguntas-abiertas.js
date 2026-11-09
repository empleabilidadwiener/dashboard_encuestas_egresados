// js/pages/preguntas-abiertas.js — Dashboard Integral de NPS y Análisis Cualitativo

export async function loadPreguntasAbiertasPage(container, data) {
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="exec-dashboard-wrap">
        <div class="exec-header">
          <div class="exec-top-bar">
            <span class="exec-institution">Universidad Norbert Wiener</span>
            <span class="exec-date">Net Promoter Score & Cualitativo</span>
          </div>
          <h1 class="exec-header-title">Análisis NPS y Preguntas Abiertas</h1>
          <div class="exec-header-subtitle">Índice de recomendación institucional y opiniones de egresados</div>
        </div>
        <div class="exec-panel" style="padding: 60px 20px; text-align: center; margin-top: 24px;">
          <i class="fas fa-filter" style="font-size: 44px; color: #94a3b8; margin-bottom: 16px;"></i>
          <h3 style="color: #0a1b44; font-size: 18px; font-weight: 700; margin-bottom: 8px;">No hay datos para los filtros seleccionados</h3>
          <p style="color: #64748b; font-size: 14px;">Prueba seleccionando "Todas las facultades" o "Todas las carreras".</p>
        </div>
      </div>
    `;
    return;
  }

  // Diccionario oficial de carreras formateadas en Title Case
  const nombresFormateados = {
    'ADMINISTRACION Y DIRECCION DE EMPRESAS': 'Administración y Dirección de Empresas',
    'ADMINISTRACION Y NEGOCIOS INTERNACIONALES': 'Administración y Negocios Internacionales',
    'CONTABILIDAD Y AUDITORIA': 'Contabilidad y Auditoría',
    'DERECHO': 'Derecho',
    'ENFERMERIA': 'Enfermería',
    'FARMACIA Y BIOQUIMICA': 'Farmacia y Bioquímica',
    'INGENIERIA DE SISTEMAS E INFORMATICA': 'Ingeniería de Sistemas e Informática',
    'INGENIERIA INDUSTRIAL': 'Ingeniería Industrial',
    'MEDICINA HUMANA': 'Medicina Humana',
    'NUTRICION HUMANA': 'Nutrición Humana',
    'OBSTETRICIA': 'Obstetricia',
    'ODONTOLOGIA': 'Odontología',
    'PSICOLOGIA': 'Psicología',
    'TECNOLOGIA MEDICA EN TERAPIA FISICA Y REHABILITACION': 'Tecnología Médica en Terapia Física',
    'TECNOLOGIA MEDICA EN LABORATORIO CLINICO Y ANATOMIA PATOLOGICA': 'Tecnología Médica en Lab. Clínico'
  };

  function formatCarrera(carrera) {
    if (!carrera) return '';
    const upper = carrera.trim().toUpperCase();
    return nombresFormateados[upper] || (window.toTitleCase ? window.toTitleCase(carrera) : carrera);
  }

  // Estado interno de la página
  let currentSegment = 'global'; // 'global' | 'trabajadores' | 'desempleados'
  let currentWordCloudFilter = 'todos'; // 'todos' | 'promotores' | 'neutrales' | 'detractores'
  let currentCommentSentiment = 'todos'; // 'todos' | 'promotor' | 'neutro' | 'detractor'
  let currentTableTab = 'carreras'; // 'carreras' | 'anios'
  let currentSearchComment = '';
  let activeWordFilter = '';
  let currentRazonChartMode = 'categoria'; // 'categoria' | 'escala'

  // Datos fijos complementarios
  const satisfaccionData = Calculations.getDistribucionSatisfaccion(data);
  const iniciativasData = Calculations.getIniciativasAlumni(data);
  const apoyoData = Calculations.getApoyoDesempleadosList(data);
  const posgrados = Calculations.getPosgradosInteres(data);
  const topPosgrados = Calculations.countFullPhrases(posgrados, 15);

  // Función principal de renderizado reactivo
  function render() {
    const totalGlobal = data.length;
    const totalOcupados = Calculations.getRespuestasTrabajadores(data).length;
    const totalNoOcupados = Calculations.getRespuestasDesempleados(data).length;

    const metricas = Calculations.getNPSMetricasDetalladas(data, currentSegment);

    // Filtrar carrera excluida (Administración y Marketing) y mapear nombres
    const carrerasNPS = Calculations.getNPSPorCarrera(data, currentSegment)
      .filter(c => !c.carrera.toUpperCase().includes('MARKETING'))
      .map(c => ({
        ...c,
        nombreDisplay: formatCarrera(c.carrera)
      }));

    const aniosNPS = Calculations.getNPSPorAnio(data, currentSegment);

    const todosComentarios = metricas.comentarios
      .filter(c => !c.carrera.toUpperCase().includes('MARKETING'))
      .map(c => ({
        ...c,
        carreraDisplay: formatCarrera(c.carrera)
      }));

    // Obtener textos para la Nube de Palabras según filtro de sentimiento
    let textosNube = todosComentarios;
    if (currentWordCloudFilter === 'promotores') textosNube = todosComentarios.filter(c => c.sentimiento === 'promotor');
    else if (currentWordCloudFilter === 'neutrales') textosNube = todosComentarios.filter(c => c.sentimiento === 'neutro');
    else if (currentWordCloudFilter === 'detractores') textosNube = todosComentarios.filter(c => c.sentimiento === 'detractor');

    // Generar la "Nube de Palabras" utilizando las razones ya categorizadas
    // en lugar de usar palabras sueltas, para dar más sentido e insight al usuario.
    const razonFreqMap = {};
    textosNube.forEach(c => {
      const r = c.razonCategorizada;
      if (r && r !== 'Sin respuesta') {
        razonFreqMap[r] = (razonFreqMap[r] || 0) + 1;
      }
    });
    const wordFreq = Object.entries(razonFreqMap).sort((a, b) => b[1] - a[1]).slice(0, 45); // Limit to top 45
    const maxWordCount = wordFreq.length > 0 ? wordFreq[0][1] : 1;
    const minWordCount = wordFreq.length > 0 ? wordFreq[wordFreq.length - 1][1] : 1;

    // Principal razón de la calificación, ya categorizada por el equipo de datos (columnas
    // "Razón NPS - Categorizado (Final)"): más preciso y directo de leer que la nube de
    // palabras, que solo agrupa términos sueltos sin consolidar sinónimos o variantes.
    const razonStats = {};
    todosComentarios.forEach(c => {
      const r = c.razonCategorizada;
      if (r && r !== 'Sin respuesta') {
        if (!razonStats[r]) {
          razonStats[r] = {
            total: 0,
            promotor: 0, neutro: 0, detractor: 0,
            scores: {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0}
          };
        }
        razonStats[r].total++;
        if (c.sentimiento === 'promotor') razonStats[r].promotor++;
        else if (c.sentimiento === 'neutro') razonStats[r].neutro++;
        else if (c.sentimiento === 'detractor') razonStats[r].detractor++;
        
        const score = parseInt(c.score);
        if (!isNaN(score) && score >= 0 && score <= 10) {
          razonStats[r].scores[score]++;
        }
      }
    });
    const razonesOrdenadas = Object.entries(razonStats).sort((a, b) => b[1].total - a[1].total);

    // Filtrar comentarios para el explorador
    let comentariosFiltrados = todosComentarios;
    if (currentCommentSentiment !== 'todos') {
      comentariosFiltrados = comentariosFiltrados.filter(c => c.sentimiento === currentCommentSentiment);
    }
    if (activeWordFilter) {
      // Como ahora la nube muestra razones categorizadas, filtramos por la razón exacta
      comentariosFiltrados = comentariosFiltrados.filter(c => c.razonCategorizada === activeWordFilter);
    }
    if (currentSearchComment) {
      const s = currentSearchComment.toLowerCase();
      comentariosFiltrados = comentariosFiltrados.filter(c =>
        c.texto.toLowerCase().includes(s) ||
        c.carreraDisplay.toLowerCase().includes(s) ||
        c.anio.toLowerCase().includes(s)
      );
    }

    // NPS por grupo (Ocupados vs En Búsqueda vs Global)
    const npsOcup = Calculations.getNPSMetricasDetalladas(data, 'trabajadores');
    const npsDes = Calculations.getNPSMetricasDetalladas(data, 'desempleados');
    const npsGlob = Calculations.getNPSMetricasDetalladas(data, 'global');

    container.innerHTML = `
      <div class="exec-dashboard-wrap">
        <!-- Encabezado Institucional Homologado -->
        <div class="exec-header">
          <div class="exec-top-bar">
            <span class="exec-institution">Universidad Norbert Wiener</span>
            <span class="exec-date">Net Promoter Score & Análisis Cualitativo</span>
          </div>
          <h1 class="exec-header-title">Análisis NPS y Preguntas Abiertas</h1>
          <div class="exec-header-subtitle">Índice de recomendación institucional, análisis cualitativo y opiniones de la comunidad de egresados (${metricas.total.toLocaleString()} respuestas válidas)</div>
        </div>

        <!-- SELECTOR DE SEGMENTO DE NPS -->
        <div class="exec-panel" style="margin-bottom: 24px; padding: 14px 20px;">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #0a1b44; font-size: 14px;">
              <i class="fas fa-filter text-primary"></i> Segmento de Encuestados:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button class="btn btn-sm ${currentSegment === 'global' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-seg-global" style="font-weight: 600; border-radius: 8px; ${currentSegment === 'global' ? 'background: #07C8CC; border-color: #07C8CC; color: #0a1b44;' : 'color: #0a1b44; border-color: #cbd5e1;'}">
                <i class="fas fa-globe" style="margin-right: 6px;"></i>Global Institucional (${totalGlobal.toLocaleString()})
              </button>
              <button class="btn btn-sm ${currentSegment === 'trabajadores' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-seg-trabajadores" style="font-weight: 600; border-radius: 8px; ${currentSegment === 'trabajadores' ? 'background: #07C8CC; border-color: #07C8CC; color: #0a1b44;' : 'color: #0a1b44; border-color: #cbd5e1;'}">
                <i class="fas fa-briefcase" style="margin-right: 6px;"></i>Ocupados — Preg. 13 (${totalOcupados.toLocaleString()})
              </button>
              <button class="btn btn-sm ${currentSegment === 'desempleados' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-seg-desempleados" style="font-weight: 600; border-radius: 8px; ${currentSegment === 'desempleados' ? 'background: #07C8CC; border-color: #07C8CC; color: #0a1b44;' : 'color: #0a1b44; border-color: #cbd5e1;'}">
                <i class="fas fa-search" style="margin-right: 6px;"></i>En Búsqueda — Preg. 6 (${totalNoOcupados.toLocaleString()})
              </button>
            </div>
          </div>
        </div>

        <!-- 4 KPIS DINÁMICOS DE NPS -->
        <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
          <div class="exec-kpi-box kpi-tint-wiener">
            <div class="exec-kpi-title">NPS Score (${currentSegment.toUpperCase()})</div>
            <div class="exec-kpi-number">${metricas.nps >= 0 ? '+' : ''}${Math.round(metricas.nps)}</div>
            <div class="exec-kpi-desc">${metricas.total.toLocaleString()} opiniones válidas</div>
          </div>

          <div class="exec-kpi-box kpi-tint-white">
            <div class="exec-kpi-title">Promotores (9 - 10)</div>
            <div class="exec-kpi-number text-primary" style="color: #07C8CC;">${Math.round(metricas.promotores)}%</div>
            <div class="exec-kpi-desc">${metricas.promotoresCount.toLocaleString()} egresados leales</div>
          </div>

          <div class="exec-kpi-box kpi-tint-white">
            <div class="exec-kpi-title" style="color: #64748b;">Neutros (7 - 8)</div>
            <div class="exec-kpi-number" style="color: #64748b;">${Math.round(metricas.neutrales)}%</div>
            <div class="exec-kpi-desc">${metricas.neutralesCount.toLocaleString()} egresados pasivos</div>
          </div>

          <div class="exec-kpi-box kpi-tint-white">
            <div class="exec-kpi-title" style="color: #F08568;">Detractores (0 - 6)</div>
            <div class="exec-kpi-number" style="color: #F08568;">${Math.round(metricas.detractores)}%</div>
            <div class="exec-kpi-desc">${metricas.detractoresCount.toLocaleString()} insatisfechos</div>
          </div>
        </div>

        <!-- Fila de Gráficos de NPS (Simétricos) -->
        <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 0;">
          <div class="exec-panel">
            <div class="exec-panel-title">
              <i class="fas fa-chart-bar" style="color: #07C8CC; margin-right: 8px;"></i> Distribución NPS Segmentada
            </div>
            <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Promotores vs Neutros vs Detractores en segmento activo</p>
            <div class="exec-chart-canvas-wrap" style="height: 300px;">
              <canvas id="chart-nps-distribucion"></canvas>
            </div>
          </div>

          <div class="exec-panel">
            <div class="exec-panel-title">
              <i class="fas fa-balance-scale" style="color: #07C8CC; margin-right: 8px;"></i> Comparativa de NPS por Grupo
            </div>
            <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Ocupados (${npsOcup.nps >= 0 ? '+' : ''}${Math.round(npsOcup.nps)}) vs En Búsqueda (${npsDes.nps >= 0 ? '+' : ''}${Math.round(npsDes.nps)}) vs Global (${npsGlob.nps >= 0 ? '+' : ''}${Math.round(npsGlob.nps)})</p>
            <div class="exec-chart-canvas-wrap" style="height: 300px;">
              <canvas id="chart-nps-comparativo"></canvas>
            </div>
          </div>
        </div>

        <!-- TABLAS COMPARATIVAS DE CARRERAS Y AÑOS DE EGRESO -->
        <div class="exec-panel" style="margin-bottom: 24px;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px 12px 20px;">
            <div>
              <div class="exec-panel-title" style="padding: 0; margin-bottom: 4px;">
                <i class="fas fa-table" style="color: #07C8CC; margin-right: 8px;"></i> Comparativa de NPS por Carrera y Año
              </div>
              <p class="exec-section-desc" style="margin: 0;">Semaforización: 🟢 Excelente (≥50) · 🟡 Favorable (0 a 49) · 🔴 Crítico (&lt;0)</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-sm ${currentTableTab === 'carreras' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-tab-carreras" style="font-weight: 600; border-radius: 8px; ${currentTableTab === 'carreras' ? 'background: #07C8CC; border-color: #07C8CC; color: #0a1b44;' : 'color: #0a1b44; border-color: #cbd5e1;'}">
                <i class="fas fa-graduation-cap" style="margin-right: 6px;"></i>Por Carrera (${carrerasNPS.length})
              </button>
              <button class="btn btn-sm ${currentTableTab === 'anios' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-tab-anios" style="font-weight: 600; border-radius: 8px; ${currentTableTab === 'anios' ? 'background: #07C8CC; border-color: #07C8CC; color: #0a1b44;' : 'color: #0a1b44; border-color: #cbd5e1;'}">
                <i class="fas fa-calendar-alt" style="margin-right: 6px;"></i>Por Año (${aniosNPS.length})
              </button>
            </div>
          </div>

          <!-- Ranking Visual de Carreras (Top 8) -->
          ${currentTableTab === 'carreras' ? `
            <div style="background: #ffffff; padding: 16px 20px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin-bottom: 16px;">
              <div style="font-size: 13px; font-weight: 700; color: #0a1b44; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-chart-simple text-primary"></i> Ranking de Programas Académicos por NPS Score (Top 8)
              </div>
              <div style="position: relative; height: 260px;">
                <canvas id="chart-ranking-nps-carreras"></canvas>
              </div>
            </div>
          ` : ''}

          <div class="table-container" style="overflow-x: auto; padding: 0 20px 20px 20px;">
            <table class="data-table" id="tabla-nps-comparativa" style="width: 100%;">
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>${currentTableTab === 'carreras' ? 'Programa Académico' : 'Año de Egreso'}</th>
                  <th class="text-center">Muestra (n)</th>
                  <th class="text-center" style="color: #07C8CC;">Promotores (9-10)</th>
                  <th class="text-center" style="color: #64748b;">Neutros (7-8)</th>
                  <th class="text-center" style="color: #F08568;">Detractores (0-6)</th>
                  <th class="text-center">NPS Score</th>
                  <th class="text-center">Nivel</th>
                </tr>
              </thead>
              <tbody>
                ${(currentTableTab === 'carreras' ? carrerasNPS : aniosNPS).map((row, idx) => {
                  const nombre = currentTableTab === 'carreras' ? row.nombreDisplay : row.anio;
                  let badge = '<span class="badge badge-semaforo-verde" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 11px;"><i class="fas fa-circle" style="font-size: 7px; margin-right: 4px;"></i>Excelente</span>';
                  if (row.nivel === 'critico') badge = '<span class="badge badge-semaforo-rojo" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 11px;"><i class="fas fa-circle" style="font-size: 7px; margin-right: 4px;"></i>Crítico</span>';
                  else if (row.nivel === 'favorable') badge = '<span class="badge badge-semaforo-amarillo" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 11px;"><i class="fas fa-circle" style="font-size: 7px; margin-right: 4px;"></i>Favorable</span>';

                  return `
                    <tr>
                      <td class="text-muted font-bold">${idx + 1}</td>
                      <td style="font-weight: 600; color: #0a1b44;">${nombre}</td>
                      <td class="text-center text-muted font-bold">${row.total.toLocaleString()}</td>
                      <td class="text-center font-bold" style="color: #07C8CC;">${Math.round(row.promotores)}% <span style="font-size: 11px; color: #94a3b8; font-weight: 400;">(${row.promotoresCount})</span></td>
                      <td class="text-center font-bold" style="color: #64748b;">${Math.round(row.neutrales)}% <span style="font-size: 11px; color: #94a3b8; font-weight: 400;">(${row.neutralesCount})</span></td>
                      <td class="text-center font-bold" style="color: #F08568;">${Math.round(row.detractores)}% <span style="font-size: 11px; color: #94a3b8; font-weight: 400;">(${row.detractoresCount})</span></td>
                      <td class="text-center font-bold" style="font-size: 14px; color: ${row.nps >= 50 ? '#07C8CC' : (row.nps >= 0 ? '#368BA1' : '#F08568')};">
                        ${row.nps >= 0 ? '+' : ''}${Math.round(row.nps)}
                      </td>
                      <td class="text-center">${badge}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECCIÓN: PRINCIPAL RAZÓN DE LA CALIFICACIÓN (categorización oficial) -->
        <div class="exec-panel" style="margin-bottom: 24px;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px 12px 20px;">
            <div>
              <div class="exec-panel-title" style="padding: 0; margin-bottom: 4px;">
                <i class="fas fa-list-ol" style="color: #07C8CC; margin-right: 8px;"></i> Principal Razón de la Calificación (n = ${razonesOrdenadas.reduce((s, [, c]) => s + c.total, 0).toLocaleString()})
              </div>
              <p class="exec-section-desc" style="margin: 0;">Categorización oficial del motivo detrás de la nota NPS otorgada</p>
            </div>
            <div style="background: #e2e8f0; padding: 4px; border-radius: 8px; display: inline-flex; gap: 2px;">
              <button class="btn btn-sm" id="btn-razon-categoria" style="border: none; background: ${currentRazonChartMode === 'categoria' ? '#ffffff' : 'transparent'}; color: ${currentRazonChartMode === 'categoria' ? '#0a1b44' : '#64748b'}; font-weight: ${currentRazonChartMode === 'categoria' ? '700' : '500'}; box-shadow: ${currentRazonChartMode === 'categoria' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}; border-radius: 6px; font-size: 12px;">
                Por Categoría
              </button>
              <button class="btn btn-sm" id="btn-razon-escala" style="border: none; background: ${currentRazonChartMode === 'escala' ? '#ffffff' : 'transparent'}; color: ${currentRazonChartMode === 'escala' ? '#0a1b44' : '#64748b'}; font-weight: ${currentRazonChartMode === 'escala' ? '700' : '500'}; box-shadow: ${currentRazonChartMode === 'escala' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}; border-radius: 6px; font-size: 12px;">
                Por Escala
              </button>
            </div>
          </div>
          <div class="exec-chart-canvas-wrap" style="height: 400px; padding: 0 20px 20px 20px;">
            <canvas id="chart-razon-nps-categorizada"></canvas>
          </div>
        </div>

        <!-- SECCIÓN: NUBE DE PALABRAS CLAVE INTERACTIVA -->
        <div class="exec-panel" style="margin-bottom: 24px;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px 12px 20px; border-bottom: 1px solid #f1f5f9;">
            <div>
              <div class="exec-panel-title" style="padding: 0; margin-bottom: 4px;">
                <i class="fas fa-tags" style="color: #07C8CC; margin-right: 8px;"></i> Nube de Categorías en Razones de Calificación
              </div>
              <p class="exec-section-desc" style="margin: 0;">Principales motivos detrás de la calificación NPS. El tamaño representa la frecuencia de mención. Haz clic en una categoría para filtrar los testimonios.</p>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              <button class="btn btn-sm ${currentWordCloudFilter === 'todos' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-cloud-todos" style="font-size: 12px; border-radius: 20px; ${currentWordCloudFilter === 'todos' ? 'background: #07C8CC; border-color: #07C8CC; color: #0a1b44; font-weight: 700;' : 'color: #64748b;'}">
                Todas
              </button>
              <button class="btn btn-sm ${currentWordCloudFilter === 'promotores' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-cloud-promotores" style="font-size: 12px; border-radius: 20px; ${currentWordCloudFilter === 'promotores' ? 'background: #07C8CC; border-color: #07C8CC; color: #0a1b44; font-weight: 700;' : 'color: #07C8CC;'}">
                Promotores (9-10)
              </button>
              <button class="btn btn-sm ${currentWordCloudFilter === 'neutrales' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-cloud-neutrales" style="font-size: 12px; border-radius: 20px; ${currentWordCloudFilter === 'neutrales' ? 'background: #64748b; border-color: #64748b; color: #ffffff; font-weight: 700;' : 'color: #64748b;'}">
                Neutros (7-8)
              </button>
              <button class="btn btn-sm ${currentWordCloudFilter === 'detractores' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-cloud-detractores" style="font-size: 12px; border-radius: 20px; ${currentWordCloudFilter === 'detractores' ? 'background: #F08568; border-color: #F08568; color: #ffffff; font-weight: 700;' : 'color: #F08568;'}">
                Detractores (0-6)
              </button>
            </div>
          </div>

          <!-- CONTENEDOR VISUAL DE LA NUBE -->
          <div style="padding: 24px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 10px; min-height: 220px; background: #f8fafc;">
            ${wordFreq.length === 0 ? '<p style="color: #94a3b8; font-size: 14px;">No hay palabras clave suficientes en este filtro.</p>' : ''}
            ${wordFreq.map(([palabra, cantidad]) => {
              const ratio = maxWordCount > minWordCount ? (cantidad - minWordCount) / (maxWordCount - minWordCount) : 0.5;
              const fontSize = Math.round(13 + ratio * 22);
              const fontWeight = fontSize > 24 ? '700' : (fontSize > 18 ? '600' : '500');

              const colors = ['#07C8CC', '#368BA1', '#284E4E', '#166534', '#d97706'];
              const color = colors[Math.abs(palabra.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
              const isSelected = activeWordFilter.toLowerCase() === palabra.toLowerCase();

              return `
                <span class="word-tag cursor-pointer" data-word="${palabra}" style="
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  padding: 4px 12px;
                  border-radius: 20px;
                  cursor: pointer;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                  font-size: ${fontSize}px;
                  font-weight: ${fontWeight};
                  color: ${isSelected ? '#ffffff' : color};
                  background: ${isSelected ? color : '#ffffff'};
                  border: 1px solid ${isSelected ? color : '#e2e8f0'};
                  transition: all 0.2s ease;
                  user-select: none;
                " title="${palabra}: ${cantidad} menciones (haz clic para filtrar testimonios)">
                  ${palabra} <small style="font-size: 10px; opacity: 0.75; font-weight: normal;">(${cantidad})</small>
                </span>
              `;
            }).join('')}
          </div>
          ${activeWordFilter ? `
            <div style="background: rgba(7, 200, 204, 0.1); padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(7, 200, 204, 0.3);">
              <span style="font-size: 13px; color: #0a1b44; font-weight: 700;">
                <i class="fas fa-filter text-primary" style="margin-right: 6px;"></i>Filtrando comentarios por razón: <strong>"${activeWordFilter}"</strong>
              </span>
              <button class="btn btn-sm btn-outline-primary" id="btn-clear-word-filter" style="font-size: 12px; border-radius: 6px;">
                <i class="fas fa-times" style="margin-right: 4px;"></i>Quitar filtro
              </button>
            </div>
          ` : ''}
        </div>

        <!-- SECCIÓN: EXPLORADOR DE TESTIMONIOS Y RAZONES ABIERTAS -->
        <div class="exec-panel" style="margin-bottom: 24px;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px 12px 20px; border-bottom: 1px solid #f1f5f9;">
            <div>
              <div class="exec-panel-title" style="padding: 0; margin-bottom: 4px;">
                <i class="fas fa-comments" style="color: #07C8CC; margin-right: 8px;"></i> Explorador de Razones Abiertas y Testimonios
              </div>
              <p class="exec-section-desc" style="margin: 0;" id="comments-count-label">Filtrados: ${comentariosFiltrados.length.toLocaleString()} de ${todosComentarios.length.toLocaleString()} comentarios</p>
            </div>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
              <div style="position: relative; width: 240px;">
                <i class="fas fa-search" style="position: absolute; left: 12px; top: 10px; color: #94a3b8; font-size: 13px;"></i>
                <input type="text" class="form-control text-sm" id="input-search-comments" placeholder="Buscar palabras..." value="${currentSearchComment}" style="padding-left: 34px; border-radius: 8px; font-size: 13px;">
              </div>
              <select class="form-select text-sm font-medium" id="select-sentiment" style="border-radius: 8px; font-size: 13px; width: auto;">
                <option value="todos" ${currentCommentSentiment === 'todos' ? 'selected' : ''}>Todos los sentimientos</option>
                <option value="promotor" ${currentCommentSentiment === 'promotor' ? 'selected' : ''}>🟢 Solo Promotores (9-10)</option>
                <option value="neutro" ${currentCommentSentiment === 'neutro' ? 'selected' : ''}>🟡 Solo Neutros (7-8)</option>
                <option value="detractor" ${currentCommentSentiment === 'detractor' ? 'selected' : ''}>🔴 Solo Detractores (0-6)</option>
              </select>
            </div>
          </div>

          <div id="comments-grid-container" style="padding: 20px; background: #f8fafc; max-height: 480px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
            ${comentariosFiltrados.length === 0 ? `
              <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: #94a3b8;">
                <i class="fas fa-comment-slash" style="font-size: 36px; margin-bottom: 12px;"></i>
                <p style="font-size: 14px;">No se encontraron testimonios para los criterios de búsqueda.</p>
              </div>
            ` : ''}
            ${comentariosFiltrados.slice(0, 60).map(c => {
              const badgeClass = c.sentimiento === 'promotor' ? 'badge-semaforo-verde' : (c.sentimiento === 'neutro' ? 'badge-semaforo-amarillo' : 'badge-semaforo-rojo');
              const badgeLabel = c.sentimiento === 'promotor' ? 'Promotor' : (c.sentimiento === 'neutro' ? 'Neutro' : 'Detractor');

              return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span class="badge ${badgeClass}" style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                      ${badgeLabel} (${c.score}/10)
                    </span>
                    <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">
                      ${c.grupo} · ${c.anio}
                    </span>
                  </div>
                  <p style="font-size: 13px; color: #1e293b; font-style: italic; margin-bottom: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">
                    "${c.texto}"
                  </p>
                  <div style="font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: auto; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-graduation-cap text-primary"></i>${c.carreraDisplay}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div id="comments-footer" style="padding: 10px; text-align: center; color: #64748b; font-size: 12px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
            ${comentariosFiltrados.length > 60 ? `Mostrando los primeros 60 testimonios de ${comentariosFiltrados.length.toLocaleString()}. Usa el buscador para filtrar más.` : `Mostrando todos los ${comentariosFiltrados.length.toLocaleString()} testimonios.`}
          </div>
        </div>

        <!-- SECCIONES CUALITATIVAS COMPLEMENTARIAS -->
        <div class="exec-section-header" style="margin-top: 32px; margin-bottom: 4px;">
          <i class="fas fa-comments text-primary" style="margin-right: 8px;"></i>
          <span>Otras Preguntas Cualitativas y de Fidelización</span>
        </div>
        <p class="exec-section-desc">Satisfacción laboral, requerimientos de apoyo institucional, programas de posgrado demandados e iniciativas alumni</p>

        <!-- Fila 1: Satisfacción y Apoyo -->
        <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 12px;">
          <div class="exec-panel">
            <div class="exec-panel-title">
              <i class="fas fa-smile-beam" style="color: #07C8CC; margin-right: 8px;"></i> Satisfacción Laboral (Ocupados)
            </div>
            <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">¿Qué tan satisfecho te sientes con tu actividad laboral?</p>
            <div class="exec-chart-canvas-wrap is-donut-square" style="height: 300px;">
              <canvas id="chart-satisfaccion-nps"></canvas>
            </div>
          </div>

          <div class="exec-panel">
            <div class="exec-panel-title">
              <i class="fas fa-hand-holding-heart" style="color: #07C8CC; margin-right: 8px;"></i> Apoyo Deseado para el Empleo
            </div>
            <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">¿De qué manera crees que la Universidad te podría apoyar?</p>
            <div class="exec-chart-canvas-wrap" style="height: 300px;">
              <canvas id="chart-apoyo-nps"></canvas>
            </div>
          </div>
        </div>

        <!-- Fila 2: Iniciativas Alumni y Posgrados -->
        <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 0;">
          <div class="exec-panel">
            <div class="exec-panel-title">
              <i class="fas fa-users" style="color: #07C8CC; margin-right: 8px;"></i> Iniciativas Alumni de Interés
            </div>
            <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">¿En cuáles actividades te gustaría participar?</p>
            <div class="exec-chart-canvas-wrap" style="height: 320px;">
              <canvas id="chart-iniciativas-alumni"></canvas>
            </div>
          </div>

          <div class="exec-panel">
            <div class="exec-panel-title">
              <i class="fas fa-university" style="color: #07C8CC; margin-right: 8px;"></i> Posgrados de Mayor Interés
            </div>
            <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Especializaciones y programas más solicitados a corto plazo</p>
            <div class="table-container" style="overflow-y: auto; max-height: 320px; padding: 0 20px 20px 20px;">
              <table class="data-table" style="width: 100%;">
                <thead>
                  <tr>
                    <th style="width: 40px;">#</th>
                    <th>Programa / Posgrado Mencionado</th>
                    <th class="text-center">Menciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${topPosgrados.map((item, i) => `
                    <tr>
                      <td class="text-muted font-bold">${i + 1}</td>
                      <td style="font-weight: 500; color: #0a1b44;">${item[0]}</td>
                      <td class="text-center font-bold" style="color: #07C8CC;">${item[1]}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Notas Metodológicas -->
        <div class="exec-footer-notes">
          <i class="fas fa-info-circle text-primary" style="margin-right: 6px;"></i>
          <strong>Metodología Net Promoter Score (NPS):</strong> Calculado a partir de la probabilidad de recomendación institucional (Escala 0–10). Promotores (9–10) menos Detractores (0–6). Rango de -100 a +100 puntos netos.
        </div>
      </div>
    `;

    // Event listeners para los botones de segmento
    document.getElementById('btn-seg-global')?.addEventListener('click', () => { currentSegment = 'global'; render(); });
    document.getElementById('btn-seg-trabajadores')?.addEventListener('click', () => { currentSegment = 'trabajadores'; render(); });
    document.getElementById('btn-seg-desempleados')?.addEventListener('click', () => { currentSegment = 'desempleados'; render(); });

    // Event listeners para pestañas de tabla
    document.getElementById('btn-tab-carreras')?.addEventListener('click', () => { currentTableTab = 'carreras'; render(); });
    document.getElementById('btn-tab-anios')?.addEventListener('click', () => { currentTableTab = 'anios'; render(); });

    // Event listeners para gráfico de Razones
    document.getElementById('btn-razon-categoria')?.addEventListener('click', () => { currentRazonChartMode = 'categoria'; render(); });
    document.getElementById('btn-razon-escala')?.addEventListener('click', () => { currentRazonChartMode = 'escala'; render(); });

    // Event listeners para filtros de la Nube de Palabras
    document.getElementById('btn-cloud-todos')?.addEventListener('click', () => { currentWordCloudFilter = 'todos'; render(); });
    document.getElementById('btn-cloud-promotores')?.addEventListener('click', () => { currentWordCloudFilter = 'promotores'; render(); });
    document.getElementById('btn-cloud-neutrales')?.addEventListener('click', () => { currentWordCloudFilter = 'neutrales'; render(); });
    document.getElementById('btn-cloud-detractores')?.addEventListener('click', () => { currentWordCloudFilter = 'detractores'; render(); });

    // Event listeners en cada palabra de la nube
    document.querySelectorAll('.word-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const word = tag.getAttribute('data-word');
        if (activeWordFilter.toLowerCase() === word.toLowerCase()) {
          activeWordFilter = '';
        } else {
          activeWordFilter = word;
        }
        render();
      });
    });

    document.getElementById('btn-clear-word-filter')?.addEventListener('click', () => {
      activeWordFilter = '';
      render();
    });

    // Event listeners para el explorador de comentarios
    const selectSent = document.getElementById('select-sentiment');
    selectSent?.addEventListener('change', (e) => {
      currentCommentSentiment = e.target.value;
      renderCommentsOnly();
    });

    const inputSearch = document.getElementById('input-search-comments');
    let searchTimeout;
    inputSearch?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearchComment = e.target.value;
        renderCommentsOnly();
      }, 250); // Debounce de 250ms para no saturar al escribir
    });

    function renderCommentsOnly() {
      let filtered = todosComentarios;
      if (currentCommentSentiment !== 'todos') filtered = filtered.filter(c => c.sentimiento === currentCommentSentiment);
      if (activeWordFilter) {
        filtered = filtered.filter(c => c.razonCategorizada === activeWordFilter);
      }
      if (currentSearchComment) {
        const s = currentSearchComment.toLowerCase();
        filtered = filtered.filter(c =>
          c.texto.toLowerCase().includes(s) ||
          c.carreraDisplay.toLowerCase().includes(s) ||
          c.anio.toLowerCase().includes(s)
        );
      }
      
      // Actualización directa del DOM sin recargar la página (evita perder el foco y hacer scroll)
      const countLabel = document.getElementById('comments-count-label');
      const gridContainer = document.getElementById('comments-grid-container');
      const footer = document.getElementById('comments-footer');
      
      if (countLabel) countLabel.innerHTML = `Filtrados: ${filtered.length.toLocaleString()} de ${todosComentarios.length.toLocaleString()} comentarios`;
      if (footer) footer.innerHTML = filtered.length > 60 ? `Mostrando los primeros 60 testimonios de ${filtered.length.toLocaleString()}. Usa el buscador para filtrar más.` : `Mostrando todos los ${filtered.length.toLocaleString()} testimonios.`;
      
      if (gridContainer) {
        gridContainer.innerHTML = filtered.length === 0 ? `
          <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: #94a3b8;">
            <i class="fas fa-comment-slash" style="font-size: 36px; margin-bottom: 12px;"></i>
            <p style="font-size: 14px;">No se encontraron testimonios para los criterios de búsqueda.</p>
          </div>
        ` : filtered.slice(0, 60).map(c => {
          const badgeClass = c.sentimiento === 'promotor' ? 'badge-semaforo-verde' : (c.sentimiento === 'neutro' ? 'badge-semaforo-amarillo' : 'badge-semaforo-rojo');
          const badgeLabel = c.sentimiento === 'promotor' ? 'Promotor' : (c.sentimiento === 'neutro' ? 'Neutro' : 'Detractor');
          return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="badge ${badgeClass}" style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                  ${badgeLabel} (${c.score}/10)
                </span>
                <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">
                  ${c.grupo} · ${c.anio}
                </span>
              </div>
              <p style="font-size: 13px; color: #1e293b; font-style: italic; margin-bottom: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">
                "${c.texto}"
              </p>
              <div style="font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: auto; display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-graduation-cap text-primary"></i>${c.carreraDisplay}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Renderizar Gráficos con Chart.js
    Charts.waitForReady().then(() => {
      // 0. Principal razón de la calificación (categorización oficial)
      let datasetsRazon = [];
      if (currentRazonChartMode === 'categoria') {
        // Modo "Por Categoría": Solo Promotores y Detractores (eliminando neutros)
        datasetsRazon = [
          {
            label: 'Promotores (9-10)',
            data: razonesOrdenadas.map(([, c]) => c.promotor),
            backgroundColor: '#88E788',
            borderWidth: 0,
            borderRadius: 3,
            maxBarThickness: 32
          },
          {
            label: 'Detractores (0-6)',
            data: razonesOrdenadas.map(([, c]) => c.detractor),
            backgroundColor: '#94A3B8',
            borderWidth: 0,
            borderRadius: 3,
            maxBarThickness: 32
          }
        ];
      } else {
        // Modo "Por Escala": Histórico / Agrupado por rango
        // Se juntan por rango para no tener separaciones feas entre cada nota
        datasetsRazon = [
          {
            label: 'Nota 9-10',
            data: razonesOrdenadas.map(([, c]) => c.promotor),
            backgroundColor: '#88E788',
            borderWidth: 0,
            borderRadius: 3,
            maxBarThickness: 32
          },
          {
            label: 'Nota 7-8',
            data: razonesOrdenadas.map(([, c]) => c.neutro),
            backgroundColor: '#FDE047',
            borderWidth: 0,
            borderRadius: 3,
            maxBarThickness: 32
          },
          {
            label: 'Nota 0-6',
            data: razonesOrdenadas.map(([, c]) => c.detractor),
            backgroundColor: '#94A3B8',
            borderWidth: 0,
            borderRadius: 3,
            maxBarThickness: 32
          }
        ];
      }

      Charts.createHorizontalBarChart('chart-razon-nps-categorizada',
        razonesOrdenadas.map(([r]) => r),
        datasetsRazon,
        { 
          xAxisFormat: (v) => v.toLocaleString(),
          scales: { x: { stacked: true }, y: { stacked: true } },
          plugins: { 
            legend: { display: true, position: 'bottom' },
            datalabels: {
              // Ocultamos los datalabels si el valor es muy pequeño para evitar que se amontonen
              display: currentRazonChartMode === 'categoria' ? (ctx) => ctx.dataset.data[ctx.dataIndex] > 0 : false,
              color: '#ffffff',
              font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
              formatter: (v) => v.toLocaleString()
            }
          }
        }
      );

      // 1. Distribución NPS con barra vertical — misma paleta que el gráfico de Razones
      // (Verde Promotores, Amarillo Neutros, Gris Detractores)
      const totalNpsDistribucion = metricas.promotores + metricas.neutrales + metricas.detractores;
      Charts.createBarChart('chart-nps-distribucion',
        ['Promotores (9-10)', 'Neutros (7-8)', 'Detractores (0-6)'],
        [{
          label: 'Cantidad',
          data: [metricas.promotores, metricas.neutrales, metricas.detractores],
          backgroundColor: ['#88E788', '#FDE047', '#94A3B8'],
          borderColor: ['#88E788', '#FDE047', '#94A3B8'],
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 60
        }],
        {
          plugins: {
            legend: { display: false },
            datalabels: {
              display: true, color: '#0a1b44',
              font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
              formatter: (v) => Charts.formatPercent(v, totalNpsDistribucion)
            }
          }
        }
      );

      // 2. Comparativo de NPS por Grupo con barra sólida uniforme #07C8CC
      Charts.createBarChart('chart-nps-comparativo',
        ['Ocupados (Preg. 13)', 'Global Institucional', 'En Búsqueda (Preg. 6)'],
        [
          {
            label: 'NPS Score Neto',
            data: [Math.round(npsOcup.nps), Math.round(npsGlob.nps), Math.round(npsDes.nps)],
            backgroundColor: '#07C8CC',
            borderColor: '#07C8CC',
            borderWidth: 1,
            borderRadius: 4
          }
        ],
        {
          plugins: {
            legend: { display: false },
            datalabels: {
              display: true,
              color: '#0a1b44',
              font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
              formatter: (v) => `${v > 0 ? '+' : ''}${v}`
            }
          },
          yAxisFormat: (v) => `${v > 0 ? '+' : ''}${v}`
        }
      );

      // 3. Ranking de Carreras por NPS (Top 8) con barra uniforme #07C8CC
      if (currentTableTab === 'carreras' && document.getElementById('chart-ranking-nps-carreras')) {
        const topCarrerasNPS = carrerasNPS.slice(0, 8);
        Charts.createHorizontalBarChart('chart-ranking-nps-carreras',
          topCarrerasNPS.map(c => c.nombreDisplay),
          [{
            label: 'NPS Score',
            data: topCarrerasNPS.map(c => Math.round(c.nps)),
            backgroundColor: '#07C8CC',
            borderColor: '#07C8CC',
            borderWidth: 1,
            borderRadius: 4
          }],
          {
            plugins: {
              legend: { display: false },
              datalabels: {
                display: true,
                color: '#0a1b44',
                font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
                formatter: (v) => `${v > 0 ? '+' : ''}${v}`
              }
            },
            xAxisFormat: (v) => `${v > 0 ? '+' : ''}${v}`
          }
        );
      }

      // 4. Satisfacción con paleta corporativa
      if (document.getElementById('chart-satisfaccion-nps')) {
        const totalSatisfaccionNps = satisfaccionData.reduce((s, d) => s + d.cantidad, 0);
        Charts.createDoughnutChart('chart-satisfaccion-nps',
          satisfaccionData.map(d => d.categoria),
          satisfaccionData.map(d => d.cantidad),
          {
            colors: ['#07C8CC', '#368BA1', '#88E788', '#D1D5DB', '#F08568'], cutout: '55%', legendPosition: 'bottom',
            plugins: {
              datalabels: {
                display: true, color: '#ffffff',
                font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
                formatter: (v) => Charts.formatPercent(v, totalSatisfaccionNps)
              }
            }
          }
        );
      }

      // 5. Apoyo a Desempleados con barra uniforme #07C8CC
      if (document.getElementById('chart-apoyo-nps')) {
        const apoyoValues = apoyoData.map(d => d.cantidad);
        Charts.createHorizontalBarChart('chart-apoyo-nps',
          apoyoData.map(d => d.apoyo),
          [{
            label: 'Egresados',
            data: apoyoValues,
            backgroundColor: '#07C8CC',
            borderColor: '#07C8CC',
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 60
          }],
          {
            plugins: {
              legend: { display: false },
              datalabels: {
                display: true,
                color: '#0a1b44',
                font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
                formatter: (v) => v.toLocaleString()
              }
            }
          }
        );
      }

      // 6. Iniciativas Alumni con barra uniforme #07C8CC
      if (document.getElementById('chart-iniciativas-alumni')) {
        const alumniValues = iniciativasData.map(d => d.cantidad);
        Charts.createHorizontalBarChart('chart-iniciativas-alumni',
          iniciativasData.map(d => d.iniciativa.replace(/.*_/g, '')),
          [{
            label: 'Interesados',
            data: alumniValues,
            backgroundColor: '#07C8CC',
            borderColor: '#07C8CC',
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 40
          }],
          {
            plugins: {
              legend: { display: false },
              datalabels: {
                display: true,
                color: '#0a1b44',
                font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
                formatter: (v) => v.toLocaleString()
              }
            }
          }
        );
      }
    });
  }

  // Primera ejecución
  render();
}
