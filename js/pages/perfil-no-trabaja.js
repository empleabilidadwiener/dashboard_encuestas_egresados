// js/pages/perfil-no-trabaja.js — Perfil del Egresado que No Trabaja
// Página dedicada a la rama "No Trabaja" del instrumento (Preguntas No1–No7), con un toggle
// global PEA (No Ocupada) / No PEA que controla TODOS los gráficos de la página a la vez —
// misma clasificación oficial OIT/INEI que usa el resto del dashboard (Calculations.classifyLaborStatus).

// Estado del toggle global de esta página
let perfilNoTrabajaState = { grupo: 'pea' };

// --- Funciones puras (sin DOM), exportadas al final para tests/test-perfil-no-trabaja.js ---

// Segmenta a los egresados que NO están ocupados, según la misma clasificación oficial
// (Calculations.classifyLaborStatus) que usa el KPI "Nivel de Empleabilidad" en todo el
// dashboard: PEA (No Ocupada) = busca empleo activamente; No PEA = no lo busca (inactivo).
function segmentarNoTrabaja(data) {
  const peaNoOcupados = [];
  const noPea = [];
  (data || []).forEach(d => {
    const info = Calculations?.classifyLaborStatus ? Calculations.classifyLaborStatus(d) : null;
    if (!info || info.esOcupado) return;
    if (info.esPEA) peaNoOcupados.push(d); else noPea.push(d);
  });
  return { peaNoOcupados, noPea };
}

// Motivo principal: agrupa por el 'label' de classifyLaborStatus (misma fuente oficial),
// contado por frecuencia dentro del segmento recibido.
function getMotivoDist(dataset) {
  const counts = {};
  dataset.forEach(d => {
    const info = Calculations.classifyLaborStatus(d);
    counts[info.label] = (counts[info.label] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
}

const ORDEN_TIEMPO_DESEMPLEO = ['De 1 a 3 meses', 'De 3 a 6 meses', 'De 6 a 12 meses', 'Más de 12 meses'];

// Tiempo en situación de desempleo: solo aplica a quienes buscan activamente (PEA No Ocupada).
function getTiempoDesempleoDist(dataset) {
  const field = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'tiempoDesempleo');
  const counts = {};
  let total = 0;
  dataset.forEach(d => {
    const val = field ? field.getValue(d) : null;
    if (!ORDEN_TIEMPO_DESEMPLEO.includes(val)) return;
    counts[val] = (counts[val] || 0) + 1;
    total++;
  });
  return { total, dist: ORDEN_TIEMPO_DESEMPLEO.filter(t => counts[t]).map(label => ({ label, count: counts[label] })) };
}

// ¿Ha trabajado anteriormente? (Sí/No)
function getTrabajoPrevioDist(dataset) {
  const field = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'trabajadoAnteriormente');
  const counts = { 'Sí': 0, 'No': 0 };
  let total = 0;
  dataset.forEach(d => {
    const val = field ? field.getValue(d) : null;
    if (val !== 'Sí' && val !== 'No') return;
    counts[val]++;
    total++;
  });
  return { total, counts };
}

// NPS del segmento: campo unificado 'nps' de PivotEngine (ya combina la pregunta 13 de la rama
// "Sí Trabaja" con la pregunta 6 de la rama "No Trabaja"), + Calculations.calcularNPS oficial.
function getNpsDist(dataset) {
  const field = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'nps');
  const scores = dataset
    .map(d => field ? parseInt(field.getValue(d)) : NaN)
    .filter(v => !isNaN(v) && v >= 0 && v <= 10);
  return { scores, stats: Calculations.calcularNPS(scores) };
}

export async function loadPerfilNoTrabajaPage(container, data) {
  const todos = data || [];
  const { peaNoOcupados, noPea } = segmentarNoTrabaja(todos);

  const totalNoTrabaja = peaNoOcupados.length + noPea.length;
  const pctPea = totalNoTrabaja > 0 ? (peaNoOcupados.length / totalNoTrabaja) * 100 : 0;
  const pctNoPea = totalNoTrabaja > 0 ? (noPea.length / totalNoTrabaja) * 100 : 0;
  const pctDelTotal = todos.length > 0 ? (totalNoTrabaja / todos.length) * 100 : 0;

  container.innerHTML = `
    <div class="exec-dashboard-wrap">

      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Rama "No Trabaja" del Instrumento</span>
        </div>
        <h1 class="exec-header-title">Perfil del Egresado que No Trabaja</h1>
        <div class="exec-header-subtitle">Motivos, tiempo de búsqueda, trayectoria previa y apoyo institucional esperado</div>
      </div>

      <!-- KPIs fijos (no cambian con el toggle, dan contexto general) -->
      <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title">Egresados que No Trabajan</div>
          <div class="exec-kpi-number">${totalNoTrabaja.toLocaleString()}</div>
          <div class="exec-kpi-desc">${Math.round(pctDelTotal)}% de la muestra filtrada (${todos.length.toLocaleString()})</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">PEA (No Ocupada)</div>
          <div class="exec-kpi-number text-warning">${peaNoOcupados.length.toLocaleString()}</div>
          <div class="exec-kpi-desc">${Math.round(pctPea)}% — buscan empleo activamente</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">No PEA</div>
          <div class="exec-kpi-number text-muted">${noPea.length.toLocaleString()}</div>
          <div class="exec-kpi-desc">${Math.round(pctNoPea)}% — no buscan empleo (inactivos)</div>
        </div>
      </div>

      <!-- Toggle global: controla TODOS los gráficos de abajo -->
      <div class="exec-panel" style="margin-bottom: 24px; padding: 16px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="exec-panel-title" style="margin-bottom: 2px;">Viendo el perfil de:</div>
            <p class="exec-section-desc" style="margin: 0;" id="exec-perfil-toggle-desc"></p>
          </div>
          <div class="exec-no-trabaja-toggle" id="exec-perfil-toggle">
            <button type="button" class="exec-toggle-btn active" data-grupo="pea">PEA (No Ocupada) <span class="exec-toggle-count">${peaNoOcupados.length.toLocaleString()}</span></button>
            <button type="button" class="exec-toggle-btn" data-grupo="nopea">No PEA <span class="exec-toggle-count">${noPea.length.toLocaleString()}</span></button>
          </div>
        </div>
      </div>

      <!-- Fila 1: Motivo principal + Tiempo en desempleo -->
      <div class="exec-charts-bottom exec-charts-bottom-2col" style="margin-bottom: 24px; margin-top: 0;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-question-circle" style="color: #F08568; margin-right: 8px;"></i> Motivo Principal</div>
          <div class="exec-chart-canvas-wrap" style="height: 260px;">
            <canvas id="chart-perfil-motivo"></canvas>
          </div>
        </div>
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-user-clock" style="color: #F08568; margin-right: 8px;"></i> Tiempo en Situación de Desempleo</div>
          <div class="exec-chart-canvas-wrap" style="height: 260px;">
            <canvas id="chart-perfil-tiempo-desempleo"></canvas>
          </div>
          <p class="exec-section-desc" id="exec-perfil-tiempo-nota" style="margin-top: 8px; display: none;"></p>
        </div>
      </div>

      <!-- Fila 2: ¿Trabajó antes? + Apoyo de la Universidad -->
      <div class="exec-charts-bottom exec-charts-bottom-donut-wide" style="margin-bottom: 24px; margin-top: 0;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-history" style="color: #F08568; margin-right: 8px;"></i> ¿Ha Trabajado Anteriormente?</div>
          <div class="exec-donut-container">
            <div class="exec-donut-canvas-wrap">
              <canvas id="chart-perfil-trabajo-previo"></canvas>
            </div>
            <div class="exec-donut-legend" id="exec-perfil-trabajo-previo-legend"></div>
          </div>
        </div>
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-hand-holding-heart" style="color: #0d9488; margin-right: 8px;"></i> ¿De Qué Manera Crees que la Universidad Te Podría Apoyar en Conseguir un Empleo?</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Pregunta de opción múltiple</p>
          <div class="exec-chart-canvas-wrap" style="height: 220px;">
            <canvas id="chart-perfil-apoyo"></canvas>
          </div>
        </div>
      </div>

      <!-- Fila 3: NPS institucional de este segmento -->
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 0;">
        <div class="exec-panel-title"><i class="fas fa-star" style="color: #D99B00; margin-right: 8px;"></i> NPS — Probabilidad de Recomendar la Universidad</div>
        <div class="exec-no-trabaja-grid" style="align-items: center;">
          <div class="exec-desarrollo-box" style="text-align: center; padding: 20px;">
            <div class="exec-desarrollo-label" style="margin-bottom: 8px;">Puntaje NPS</div>
            <div class="exec-desarrollo-pct" style="font-size: 34px;" id="exec-perfil-nps-score">—</div>
            <div class="exec-desarrollo-sentence" id="exec-perfil-nps-sub">—</div>
          </div>
          <div class="exec-chart-canvas-wrap" style="height: 200px;">
            <canvas id="chart-perfil-nps"></canvas>
          </div>
        </div>
      </div>

      <!-- Pie Metodológico -->
      <div class="exec-footer-notes">
        <p><strong>PEA (No Ocupada):</strong> Egresados que no trabajan pero buscan empleo activamente (incluye quienes postulan/se preparan para SERUMS). Es la misma clasificación oficial OIT/INEI que usa el KPI "Nivel de Empleabilidad" en todo el dashboard.</p>
        <p><strong>No PEA:</strong> Egresados que no trabajan y no buscan empleo actualmente (motivos personales/familiares, trámite de título/tesis, estudios de posgrado u otra carrera, etc.).</p>
        <p><strong>Tiempo en Situación de Desempleo:</strong> Se le pregunta a todos los egresados que no trabajan, independientemente del motivo declarado (no es exclusiva de quienes buscan empleo activamente).</p>
        <p><strong>NPS:</strong> Escala 0–10, Promotor = 9–10, Detractor = 0–6. Score = % Promotores − % Detractores.</p>
      </div>

    </div>
  `;

  setupPerfilToggle(peaNoOcupados, noPea);

  Charts.waitForReady().then(() => {
    renderPerfilCharts(peaNoOcupados, noPea);
  });
}

function setupPerfilToggle(peaNoOcupados, noPea) {
  const toggle = document.getElementById('exec-perfil-toggle');
  if (!toggle) return;
  toggle.querySelectorAll('.exec-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const grupo = btn.dataset.grupo;
      if (!grupo || grupo === perfilNoTrabajaState.grupo) return;
      perfilNoTrabajaState.grupo = grupo;
      toggle.querySelectorAll('.exec-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPerfilCharts(peaNoOcupados, noPea);
    });
  });
}

function renderPerfilCharts(peaNoOcupados, noPea) {
  const grupo = perfilNoTrabajaState.grupo;
  const dataset = grupo === 'pea' ? peaNoOcupados : noPea;

  const descEl = document.getElementById('exec-perfil-toggle-desc');
  if (descEl) {
    descEl.textContent = grupo === 'pea'
      ? `${dataset.length.toLocaleString()} egresados que buscan empleo activamente`
      : `${dataset.length.toLocaleString()} egresados que no buscan empleo actualmente`;
  }

  renderMotivoChart(dataset);
  renderTiempoDesempleoChart(dataset);
  renderTrabajoPrevioChart(dataset);
  renderApoyoChart(dataset);
  renderNpsChart(dataset);
}

// --- Motivo principal: reutiliza el 'label' de Calculations.classifyLaborStatus (misma
// clasificación oficial), agrupado por frecuencia dentro del segmento seleccionado. ---
function renderMotivoChart(dataset) {
  const entries = getMotivoDist(dataset).map(x => [x.label, x.count]);
  const total = dataset.length;

  Charts.createHorizontalBarChart('chart-perfil-motivo',
    entries.map(([label]) => label),
    [{ label: 'Egresados', data: entries.map(([, c]) => c), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 4 }],
    {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (item) => ` ${item.raw.toLocaleString()} egresados (${Charts.formatPercent(item.raw, total)})` } },
        datalabels: {
          display: true, color: '#0a1b44',
          font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
          formatter: (v) => Charts.formatPercent(v, total)
        }
      },
      xAxisFormat: (v) => v
    }
  );
}

// --- Tiempo en situación de desempleo: pregunta 2 de la rama "No Trabaja", se le hace a TODOS
// los que no trabajan (verificado contra los datos crudos: el motivo declarado no cambia que se
// le pregunte el tiempo), no solo a quienes buscan empleo activamente. Se excluye "No
// especifica"/vacío de la base, en vez de contarlo como una categoría más. ---
function renderTiempoDesempleoChart(dataset) {
  const { total, dist } = getTiempoDesempleoDist(dataset);
  const labels = dist.map(x => x.label);
  const values = dist.map(x => x.count);

  const nota = document.getElementById('exec-perfil-tiempo-nota');
  if (nota) {
    if (total === 0) {
      nota.style.display = 'block';
      nota.textContent = '* No hay respuestas válidas de tiempo en desempleo para este segmento.';
    } else {
      nota.style.display = 'none';
    }
  }

  Charts.createBarChart('chart-perfil-tiempo-desempleo',
    labels,
    [{ label: 'Egresados', data: values, backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 4 }],
    {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (item) => ` ${item.raw.toLocaleString()} egresados (${Charts.formatPercent(item.raw, total)})` } },
        datalabels: {
          display: true, color: '#0a1b44',
          font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
          formatter: (v) => Charts.formatPercent(v, total)
        }
      },
      maxRotation: 0
    }
  );
}

// --- ¿Ha trabajado anteriormente? (doughnut Sí/No) ---
function renderTrabajoPrevioChart(dataset) {
  const { total, counts } = getTrabajoPrevioDist(dataset);
  const labels = ['Sí', 'No'].filter(k => counts[k] > 0);
  const values = labels.map(k => counts[k]);
  const colors = Charts.getRankedColors(values);

  const legendEl = document.getElementById('exec-perfil-trabajo-previo-legend');
  if (legendEl) {
    legendEl.innerHTML = labels.map((l, i) => {
      const pctStr = Charts.formatPercent(counts[l], total);
      return `
        <div class="exec-legend-row">
          <div class="exec-legend-left">
            <span class="exec-legend-dot" style="background-color: ${colors[i]};"></span>
            <span class="exec-legend-label" title="${l}">${l}</span>
          </div>
          <span class="exec-legend-val">${pctStr} <span style="color:#94a3b8;font-weight:400;">(${counts[l].toLocaleString()})</span></span>
        </div>
      `;
    }).join('');
  }

  Charts.createDoughnutChart('chart-perfil-trabajo-previo', labels, values, {
    colors,
    legendPosition: 'right',
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true, color: '#ffffff',
        font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
        formatter: (v) => Charts.formatPercent(v, total)
      }
    }
  });
}

// --- Apoyo de la Universidad (multi-select, reutiliza Calculations.getApoyoDesempleadosList) ---
function renderApoyoChart(dataset) {
  const lista = Calculations.getApoyoDesempleadosList(dataset);
  const total = dataset.length;

  Charts.createHorizontalBarChart('chart-perfil-apoyo',
    lista.map(x => x.apoyo),
    [{ label: 'Respuestas afirmativas', data: lista.map(x => x.cantidad), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 4 }],
    {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (item) => ` ${item.raw.toLocaleString()} egresados (${total > 0 ? Math.round((item.raw / total) * 100) : 0}%)` } },
        datalabels: {
          display: true, color: '#0a1b44',
          font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
          formatter: (v) => v.toLocaleString()
        }
      },
      xAxisFormat: (v) => v
    }
  );
}

// --- NPS del segmento (campo unificado 'nps' de PivotEngine, ya combina la pregunta 13 de la
// rama "Sí Trabaja" con la pregunta 6 de la rama "No Trabaja") ---
function renderNpsChart(dataset) {
  const { scores, stats } = getNpsDist(dataset);

  const scoreEl = document.getElementById('exec-perfil-nps-score');
  const subEl = document.getElementById('exec-perfil-nps-sub');
  if (scoreEl) scoreEl.textContent = scores.length > 0 ? `${Math.round(stats.nps)}` : '—';
  if (subEl) subEl.textContent = `Basado en ${scores.length.toLocaleString()} respuestas válidas`;

  const counts = { 'Detractor (0–6)': 0, 'Pasivo (7–8)': 0, 'Promotor (9–10)': 0 };
  scores.forEach(s => {
    if (s >= 9) counts['Promotor (9–10)']++;
    else if (s >= 7) counts['Pasivo (7–8)']++;
    else counts['Detractor (0–6)']++;
  });
  const labels = Object.keys(counts).filter(k => counts[k] > 0);
  const values = labels.map(k => counts[k]);
  // Misma paleta oficial de NPS que usa "NPS y Cualitativo": Promotor verde, Pasivo amarillo,
  // Detractor gris (no rojo/naranja, que en este dashboard se reserva para otras alertas).
  const paleta = { 'Detractor (0–6)': '#94A3B8', 'Pasivo (7–8)': '#FDE047', 'Promotor (9–10)': '#88E788' };

  Charts.createBarChart('chart-perfil-nps',
    labels,
    [{ label: 'Egresados', data: values, backgroundColor: labels.map(l => paleta[l]), borderWidth: 0, borderRadius: 4 }],
    {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (item) => ` ${item.raw.toLocaleString()} egresados (${Charts.formatPercent(item.raw, scores.length)})` } },
        datalabels: {
          display: true, color: '#0a1b44',
          font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
          formatter: (v) => Charts.formatPercent(v, scores.length)
        }
      },
      yAxisFormat: (v) => v,
      maxRotation: 0
    }
  );
}

// Exports puros para pruebas automatizadas (tests/test-perfil-no-trabaja.js).
// No dependen del DOM: permiten validar la lógica de datos real sin renderizar gráficos.
export {
  segmentarNoTrabaja,
  getMotivoDist,
  getTiempoDesempleoDist,
  getTrabajoPrevioDist,
  getNpsDist
};
