// js/pages/emprendimientos.js — Dashboard de Emprendimiento

export async function loadEmprendimientosPage(container, data) {
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center">
        <i class="fas fa-store text-muted mb-3" style="font-size: 48px;"></i>
        <h3 class="text-dark font-bold mb-2">No hay datos de emprendimiento disponibles</h3>
        <p class="text-muted">Prueba con otros filtros o cohortes.</p>
      </div>
    `;
    return;
  }

  // 1. Filtrar solo emprendedores
  const colCondicion = Calculations.cols.condicion;
  const colFormalizacion = '2.3 Si responde "Propietario o socio de negocio/emprendimiento". Respecto a su emprendimiento o negocio: (E: LEER ALTERNATIVAS)';
  const colRelacionEmp = '2.3.1 ¿El emprendimiento está relacionado con su profesión?';
  const colCarrera = Calculations.cols.carrera;

  const emprendedores = data.filter(d => {
    const c = String(d[colCondicion] || '');
    return c === 'Emprendedor' || c.includes('Emprendedor') || c.includes('Propietario') || c.includes('emprendimiento');
  });

  const totalEmprendedores = emprendedores.length;

  if (totalEmprendedores === 0) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center">
        <i class="fas fa-store text-muted mb-3" style="font-size: 48px;"></i>
        <h3 class="text-dark font-bold mb-2">No hay emprendedores en esta muestra</h3>
        <p class="text-muted">El segmento seleccionado no contiene egresados con emprendimientos.</p>
      </div>
    `;
    return;
  }

  // 2. Cálculos
  // Formalización
  let formalizados = 0;
  let enProceso = 0;
  let noFormalizados = 0;
  let sinRespuestaForm = 0;

  // Afinidad
  let afines = 0;
  let noAfines = 0;
  let sinRespuestaAfin = 0;

  // Por carrera
  const carrerasMap = {};

  emprendedores.forEach(d => {
    // Formalización
    const form = String(d[colFormalizacion] || '').trim();
    if (form.toLowerCase().includes('no formalizado')) noFormalizados++;
    else if (form.toLowerCase().includes('en proceso')) enProceso++;
    else if (form.toLowerCase().includes('formalizado')) formalizados++;
    else if (form) sinRespuestaForm++;

    // Afinidad
    const afin = String(d[colRelacionEmp] || '').trim().toLowerCase();
    if (afin.startsWith('sí') || afin.startsWith('si')) afines++;
    else if (afin.startsWith('no')) noAfines++;
    else if (afin) sinRespuestaAfin++;

    // Por carrera
    const carrera = (d[colCarrera] || 'No Especificado').trim();
    carrerasMap[carrera] = (carrerasMap[carrera] || 0) + 1;
  });

  // Top Carreras Emprendedoras
  const carrerasArr = Object.entries(carrerasMap)
    .map(([carrera, cantidad]) => ({ carrera, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // 3. Render
  container.innerHTML = `
    <div class="exec-dashboard-wrap">
      
      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Emprendimiento y Negocios Propios</span>
        </div>
        <h1 class="exec-header-title">Ecosistema Emprendedor Alumni</h1>
        <div class="exec-header-subtitle">Análisis de la base de emprendedores, formalización y afinidad con su carrera (Total: ${totalEmprendedores.toLocaleString()} egresados)</div>
      </div>

      <!-- KPIS EMPRENDIMIENTO (4 Tarjetas balanceadas) -->
      <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title">Total Emprendedores</div>
          <div class="exec-kpi-number">${totalEmprendedores.toLocaleString()}</div>
          <div class="exec-kpi-desc">Egresados con negocio propio</div>
        </div>

        <div class="exec-kpi-box kpi-tint-green">
          <div class="exec-kpi-title">Formalizados (RUC Activo)</div>
          <div class="exec-kpi-number">${formalizados > 0 ? Math.round((formalizados / totalEmprendedores) * 100) + '%' : 'N/D'}</div>
          <div class="exec-kpi-desc">${formalizados.toLocaleString()} negocios con registro formal</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">En Proceso de Trámite</div>
          <div class="exec-kpi-number text-warning">${enProceso > 0 ? Math.round((enProceso / totalEmprendedores) * 100) + '%' : '0%'}</div>
          <div class="exec-kpi-desc">${enProceso.toLocaleString()} en proceso de formalización</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Afines a su Profesión</div>
          <div class="exec-kpi-number text-primary">${afines > 0 ? Math.round((afines / totalEmprendedores) * 100) + '%' : 'N/D'}</div>
          <div class="exec-kpi-desc">${afines > 0 ? afines.toLocaleString() + ' aplican su carrera en su negocio' : 'Sin datos disponibles'}</div>
        </div>
      </div>

      <!-- FILA DE GRÁFICOS CIRCULARES SIMÉTRICOS -->
      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 0;">
        <!-- Formalización -->
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-file-invoice-dollar" style="color: #07C8CC; margin-right: 8px;"></i> Nivel de Formalización</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Emprendimientos con RUC vs En proceso vs No formalizados</p>
          <div class="exec-donut-container">
            <div class="exec-donut-canvas-wrap">
              <canvas id="chart-emp-formalizacion"></canvas>
            </div>
            <div class="exec-donut-legend" id="exec-emp-formalizacion-legend"></div>
          </div>
        </div>

        <!-- Afinidad -->
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-briefcase" style="color: #07C8CC; margin-right: 8px;"></i> Afinidad Profesional</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Relación del negocio con la profesión estudiada</p>
          <div class="exec-donut-container">
            <div class="exec-donut-canvas-wrap">
              <canvas id="chart-emp-afinidad"></canvas>
            </div>
            <div class="exec-donut-legend" id="exec-emp-afinidad-legend"></div>
          </div>
        </div>
      </div>

      <!-- RANKING DE CARRERAS EMPRENDEDORAS -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-trophy" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Ranking de Carreras por Cantidad de Emprendedores</span>
      </div>
      <p class="exec-section-desc">Programas académicos que generan mayor cantidad de iniciativas de negocio propio</p>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 400px;">
          <canvas id="chart-emp-carreras"></canvas>
        </div>
      </div>

      <!-- NOTA METODOLÓGICA AL PIE -->
      <div class="exec-footer-notes">
        <p><strong>Fuente:</strong> Se identifican emprendedores a partir de la pregunta de condición laboral (<em>Propietario o socio de negocio/emprendimiento</em>).</p>
        <p><strong>Formalización:</strong> Se evalúa si el emprendimiento cuenta con RUC activo y declaración formal ante SUNAT.</p>
        <p><strong>Afinidad:</strong> Se verifica si el negocio está relacionado directamente con la carrera profesional estudiada.</p>
      </div>

    </div>
  `;

  // Renderizar gráficos bajo demanda con verificación de canvas
  Charts.waitForReady().then(() => {
    // 1. Formalización (Dona)
    const totalForm = formalizados + enProceso + noFormalizados;
    if (document.getElementById('chart-emp-formalizacion') && totalForm > 0) {
      const labels = ['Formalizado (RUC activo)', 'En proceso de formalización', 'No formalizado'];
      const counts = [formalizados, enProceso, noFormalizados];
      const colors = ['#07C8CC', '#368BA1', '#D1D5DB'];
      Charts.createDoughnutChart('chart-emp-formalizacion', labels, counts,
        {
          colors, cutout: '60%',
          plugins: {
            legend: { display: false },
            datalabels: {
              display: true, color: '#ffffff',
              font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
              formatter: (v) => Charts.formatPercent(v, totalForm)
            }
          }
        }
      );
      const legEl = document.getElementById('exec-emp-formalizacion-legend');
      if (legEl) {
        legEl.innerHTML = labels.map((l, i) => `
          <div class="exec-legend-row">
            <div class="exec-legend-left">
              <span class="exec-legend-dot" style="background-color: ${colors[i]};"></span>
              <span class="exec-legend-label" title="${l}">${l}</span>
            </div>
            <span class="exec-legend-val">${Charts.formatPercent(counts[i], totalForm)} <span style="color:#94a3b8;font-weight:400;">(${counts[i].toLocaleString()})</span></span>
          </div>
        `).join('');
      }
    }

    // 2. Afinidad (Dona)
    const totalAfin = afines + noAfines;
    if (document.getElementById('chart-emp-afinidad') && totalAfin > 0) {
      const labels = ['Relacionado a su carrera', 'No relacionado'];
      const counts = [afines, noAfines];
      const colors = ['#07C8CC', '#D1D5DB'];
      Charts.createDoughnutChart('chart-emp-afinidad', labels, counts,
        {
          colors, cutout: '60%',
          plugins: {
            legend: { display: false },
            datalabels: {
              display: true, color: '#ffffff',
              font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
              formatter: (v) => Charts.formatPercent(v, totalAfin)
            }
          }
        }
      );
      const legEl = document.getElementById('exec-emp-afinidad-legend');
      if (legEl) {
        legEl.innerHTML = labels.map((l, i) => `
          <div class="exec-legend-row">
            <div class="exec-legend-left">
              <span class="exec-legend-dot" style="background-color: ${colors[i]};"></span>
              <span class="exec-legend-label" title="${l}">${l}</span>
            </div>
            <span class="exec-legend-val">${Charts.formatPercent(counts[i], totalAfin)} <span style="color:#94a3b8;font-weight:400;">(${counts[i].toLocaleString()})</span></span>
          </div>
        `).join('');
      }
    }

    // 3. Carreras Emprendedoras (Barras horizontales unificadas)
    if (document.getElementById('chart-emp-carreras') && carrerasArr.length > 0) {
      const topCarreras = carrerasArr
        .filter(c => !c.carrera.toUpperCase().includes('MARKETING'))
        .slice(0, 10);
      Charts.createHorizontalBarChart('chart-emp-carreras',
        topCarreras.map(c => window.toTitleCase ? window.toTitleCase(c.carrera) : c.carrera),
        [{
          label: 'Nº de Emprendedores',
          data: topCarreras.map(c => c.cantidad),
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 3
        }],
        {
          layout: { padding: { right: 24, left: 10, top: 10, bottom: 10 } },
          plugins: {
            legend: { display: false },
            datalabels: {
              display: true, color: '#0a1b44',
              font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
              formatter: (v) => v.toLocaleString()
            }
          },
          scales: {
            x: {
              ticks: { font: { family: "'Inter', sans-serif", size: 11 } },
              grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            y: {
              ticks: { font: { family: "'Inter', sans-serif", size: 11 } },
              grid: { display: false }
            }
          }
        }
      );
    }
  });
}
