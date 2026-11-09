// js/pages/formacion-continua.js
// Página: Formación Continua — Colegiatura Profesional y Estudios de Posgrado
// (bloque "F" del instrumento 2026: converge para ambas ramas, aplica a todos los egresados)

export async function loadFormacionContinuaPage(container, data) {
  if (!container) return;

  const field = (id) => PivotEngine.fields.find(f => f.id === id);
  const countDistinct = (fieldId, { exclude = ['No precisa', 'No aplica', 'No especifica', 'No aplica / No precisa'], base = data } = {}) => {
    const f = field(fieldId);
    const counts = {};
    base.forEach(d => {
      const val = f.getValue(d);
      if (exclude.includes(val)) return;
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const total = data.length;

  // --- KPIs ---
  const colegiatura = countDistinct('colegiatura', { exclude: ['No precisa'] });
  const colegiadosHabilitados = (colegiatura.find(([l]) => l === 'Colegiado y Habilitado') || [null, 0])[1];
  // "No aplica" son egresados cuya profesión no requiere colegiatura: se excluyen del
  // denominador para no subestimar la tasa entre quienes sí les corresponde colegiarse.
  const colegiaturaAplica = colegiatura.filter(([l]) => l !== 'No aplica').reduce((s, [, c]) => s + c, 0);
  const pctColegiadosHabilitados = colegiaturaAplica > 0 ? Math.round((colegiadosHabilitados / colegiaturaAplica) * 100) : 0;

  const posgradoDist = countDistinct('posgrado', { exclude: ['No precisa'] });
  const conPosgrado = (posgradoDist.find(([l]) => l === 'Sí') || [null, 0])[1];
  const pctConPosgrado = total > 0 ? Math.round((conPosgrado / total) * 100) : 0;

  const rawUniversidadPosgrado = data
    .map(d => String(d[Calculations.cols.universidadPosgrado] || '').trim())
    .filter(v => v && v.toLowerCase() !== 'no especifica');
  const continuanEnUNW = rawUniversidadPosgrado.filter(v => v.toLowerCase().includes('norbert wiener')).length;
  const pctContinuanUNW = rawUniversidadPosgrado.length > 0 ? Math.round((continuanEnUNW / rawUniversidadPosgrado.length) * 100) : 0;

  const interesPosgradoDist = countDistinct('interesPosgrado', { exclude: ['No precisa'] });
  const interesados = (interesPosgradoDist.find(([l]) => l === 'Sí') || [null, 0])[1];
  const pctInteresados = total > 0 ? Math.round((interesados / total) * 100) : 0;

  // --- Gráficos ---
  const gradoAcademicoDist = countDistinct('gradoAcademico');

  // Estudios de posgrado (solo entre quienes respondieron "Sí"). Se usan etiquetas cortas
  // porque el panel es de medio ancho y el texto completo de la fuente no cabe sin recortarse.
  const tipoPosgradoOrden = ['Curso de educación continua / corta duración', 'Diplomado', 'Programa de especialización – Segunda especialización', 'Maestría', 'Doctorado'];
  const tipoPosgradoEtiquetaCorta = {
    'Curso de educación continua / corta duración': 'Curso corto / Educ. continua',
    'Programa de especialización – Segunda especialización': 'Especialización'
  };
  const tipoPosgradoCounts = Object.fromEntries(countDistinct('tipoPosgrado'));
  const tipoPosgradoDist = tipoPosgradoOrden
    .filter(l => tipoPosgradoCounts[l] > 0)
    .map(l => [tipoPosgradoEtiquetaCorta[l] || l, tipoPosgradoCounts[l]]);

  const tipoInstitucionDist = countDistinct('tipoInstitucionPosgrado');
  const universidadTipoDist = countDistinct('universidadPosgradoTipo');
  const universidadPaisDist = countDistinct('universidadPosgradoPais');

  const UNIV_NOISE = new Set(['no especifica', 'sin identificar', 'sin dato']);
  const univCounts = {};
  rawUniversidadPosgrado.forEach(v => {
    if (UNIV_NOISE.has(v.toLowerCase())) return;
    univCounts[v] = (univCounts[v] || 0) + 1;
  });
  const topUniversidades = Object.entries(univCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const posgradoDeseadoDist = countDistinct('posgradoDeseadoCategoria');

  container.innerHTML = `
    <div class="exec-dashboard-wrap">

      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Formación Continua</span>
        </div>
        <h1 class="exec-header-title">Colegiatura y Posgrado</h1>
        <div class="exec-header-subtitle">Situación de colegiatura profesional, estudios de posgrado y demanda futura de formación continua</div>
      </div>

      <!-- KPIs -->
      <div class="exec-kpis-container">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title">Colegiados y Habilitados</div>
          <div class="exec-kpi-number">${pctColegiadosHabilitados}%</div>
          <div class="exec-kpi-desc">${colegiadosHabilitados.toLocaleString()} de ${colegiaturaAplica.toLocaleString()} a quienes aplica</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Con Estudios de Posgrado</div>
          <div class="exec-kpi-number">${pctConPosgrado}%</div>
          <div class="exec-kpi-desc">${conPosgrado.toLocaleString()} de ${total.toLocaleString()} egresados</div>
        </div>
        <div class="exec-kpi-box kpi-tint-green">
          <div class="exec-kpi-title">Continúan Posgrado en la UNW</div>
          <div class="exec-kpi-number">${pctContinuanUNW}%</div>
          <div class="exec-kpi-desc">${continuanEnUNW.toLocaleString()} de ${rawUniversidadPosgrado.length.toLocaleString()} que hicieron posgrado</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Interés en Posgrado UNW</div>
          <div class="exec-kpi-number">${pctInteresados}%</div>
          <div class="exec-kpi-desc">${interesados.toLocaleString()} interesados a corto plazo</div>
        </div>
      </div>

      <!-- Grado Académico y Colegiatura -->
      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-user-graduate" style="color: #07C8CC; margin-right: 8px;"></i> Grado Académico</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Situación académica actual del egresado</p>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 280px;">
            <canvas id="chart-grado-academico"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-id-card" style="color: #07C8CC; margin-right: 8px;"></i> Colegiatura Profesional</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Situación respecto a la colegiatura (excluye "No aplica a la profesión")</p>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 280px;">
            <canvas id="chart-colegiatura"></canvas>
          </div>
        </div>
      </div>

      <!-- Posgrado: Sí/No y Tipo de estudios -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-graduation-cap" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Estudios de Posgrado Realizados</span>
      </div>
      <p class="exec-section-desc">¿Han realizado estudios de posgrado después de egresar? y, de ser así, qué tipo de estudios</p>
      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title">¿Realizó Estudios de Posgrado?</div>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 280px;">
            <canvas id="chart-posgrado-si-no"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title">Tipo de Estudios (n = ${conPosgrado.toLocaleString()})</div>
          <div class="exec-chart-canvas-wrap" style="height: 280px;">
            <canvas id="chart-tipo-posgrado"></canvas>
          </div>
        </div>
      </div>

      <!-- Dónde estudian el posgrado -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-university" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>¿Dónde Realizan el Posgrado?</span>
      </div>
      <p class="exec-section-desc">Tipo de institución, gestión (pública/privada) y país donde cursaron el programa</p>
      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title">Tipo de Institución</div>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 280px;">
            <canvas id="chart-tipo-institucion"></canvas>
          </div>
        </div>
        <div class="exec-panel">
          <div class="exec-panel-title">Gestión (Pública/Privada)</div>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 280px;">
            <canvas id="chart-universidad-tipo"></canvas>
          </div>
        </div>
        <div class="exec-panel">
          <div class="exec-panel-title">País (Nacional/Extranjera)</div>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 280px;">
            <canvas id="chart-universidad-pais"></canvas>
          </div>
        </div>
      </div>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel-title"><i class="fas fa-school" style="color: #07C8CC; margin-right: 8px;"></i> Principales Universidades de Posgrado</div>
        <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Top 8 universidades donde los egresados cursan o cursaron su posgrado</p>
        <div class="exec-chart-canvas-wrap" style="height: 340px;">
          <canvas id="chart-top-universidades"></canvas>
        </div>
      </div>

      <!-- Interés futuro -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-bullseye" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Demanda Futura de Posgrado en la UNW</span>
      </div>
      <p class="exec-section-desc">Interés en llevar un posgrado en la UNW a corto plazo y qué tipo de programa buscarían</p>
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px; max-width: 420px;">
        <div class="exec-panel-title">Interés en Posgrado UNW</div>
        <div class="exec-chart-canvas-wrap is-donut-square" style="height: 260px;">
          <canvas id="chart-interes-posgrado"></canvas>
        </div>
      </div>

      <!-- A ancho completo: las categorías de programas de interés son textos largos que se
           recortarían de forma ilegible en un panel de medio ancho. -->
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel-title">Programa de Posgrado de Interés (n = ${interesados.toLocaleString()})</div>
        <div class="exec-chart-canvas-wrap" style="height: 340px;">
          <canvas id="chart-posgrado-deseado"></canvas>
        </div>
      </div>

      <div class="exec-footer-notes">
        <p><strong>Colegiatura y Posgrado:</strong> preguntas del instrumento que aplican a todos los egresados encuestados, independientemente de su condición laboral actual (converge para ambas ramas del cuestionario).</p>
        <p><strong>Continúan Posgrado en la UNW:</strong> proporción de quienes hicieron algún posgrado y lo hicieron/hacen en la propia Universidad Norbert Wiener, sobre el total con posgrado y universidad identificada.</p>
      </div>

      <div id="custom-charts-grid" class="custom-charts-grid"></div>
    </div>
  `;

  Charts.waitForReady().then(() => {
    const donutColors = ['#07C8CC', '#368BA1', '#88E788', '#DCB17C', '#D1D5DB', '#9CA3AF'];
    const sumDist = (dist) => dist.reduce((s, [, c]) => s + c, 0);
    // Etiquetas de dona: siempre el % (blanco, sobre el color del segmento).
    const donutPct = (total) => ({
      display: true, color: '#ffffff',
      font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
      formatter: (v) => Charts.formatPercent(v, total)
    });
    // Etiquetas de barra: % del total (azul marino, en la punta de la barra).
    const barPct = (total) => ({
      display: true, color: '#0a1b44',
      font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
      formatter: (v) => Charts.formatPercent(v, total)
    });

    const totalGrado = sumDist(gradoAcademicoDist);
    Charts.createDoughnutChart('chart-grado-academico',
      gradoAcademicoDist.map(([l]) => l), gradoAcademicoDist.map(([, c]) => c),
      { colors: donutColors, legendPosition: 'bottom', plugins: { datalabels: donutPct(totalGrado) } }
    );

    const totalColegiatura = sumDist(colegiatura);
    Charts.createDoughnutChart('chart-colegiatura',
      colegiatura.map(([l]) => l), colegiatura.map(([, c]) => c),
      { colors: donutColors, legendPosition: 'bottom', plugins: { datalabels: donutPct(totalColegiatura) } }
    );

    const totalPosgrado = sumDist(posgradoDist);
    Charts.createDoughnutChart('chart-posgrado-si-no',
      posgradoDist.map(([l]) => l), posgradoDist.map(([, c]) => c),
      { colors: ['#07C8CC', '#D1D5DB', '#DCB17C'], legendPosition: 'bottom', plugins: { datalabels: donutPct(totalPosgrado) } }
    );

    const totalTipoPosgrado = sumDist(tipoPosgradoDist);
    Charts.createHorizontalBarChart('chart-tipo-posgrado',
      tipoPosgradoDist.map(([l]) => l),
      [{ label: 'Egresados', data: tipoPosgradoDist.map(([, c]) => c), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }],
      { xAxisFormat: (v) => v.toLocaleString(), plugins: { legend: { display: false }, datalabels: barPct(totalTipoPosgrado) } }
    );

    const totalTipoInstitucion = sumDist(tipoInstitucionDist);
    Charts.createDoughnutChart('chart-tipo-institucion',
      tipoInstitucionDist.map(([l]) => l), tipoInstitucionDist.map(([, c]) => c),
      { colors: donutColors, legendPosition: 'bottom', plugins: { datalabels: donutPct(totalTipoInstitucion) } }
    );

    const totalUniversidadTipo = sumDist(universidadTipoDist);
    Charts.createDoughnutChart('chart-universidad-tipo',
      universidadTipoDist.map(([l]) => l), universidadTipoDist.map(([, c]) => c),
      { colors: ['#07C8CC', '#368BA1', '#D1D5DB'], legendPosition: 'bottom', plugins: { datalabels: donutPct(totalUniversidadTipo) } }
    );

    const totalUniversidadPais = sumDist(universidadPaisDist);
    Charts.createDoughnutChart('chart-universidad-pais',
      universidadPaisDist.map(([l]) => l), universidadPaisDist.map(([, c]) => c),
      { colors: ['#07C8CC', '#DCB17C', '#D1D5DB'], legendPosition: 'bottom', plugins: { datalabels: donutPct(totalUniversidadPais) } }
    );

    // Universidad Norbert Wiener resaltada en azul institucional para diferenciarla del resto.
    // Es un ranking (Top universidades por cantidad de egresados), por eso la etiqueta muestra
    // la cantidad en vez de un % (igual convención que "Top Carreras Emprendedoras").
    Charts.createHorizontalBarChart('chart-top-universidades',
      topUniversidades.map(([l]) => l),
      [{
        label: 'Egresados',
        data: topUniversidades.map(([, c]) => c),
        backgroundColor: topUniversidades.map(([l]) => l.toLowerCase().includes('norbert wiener') ? '#0a1b44' : '#07C8CC'),
        borderColor: topUniversidades.map(([l]) => l.toLowerCase().includes('norbert wiener') ? '#0a1b44' : '#07C8CC'),
        borderWidth: 1,
        borderRadius: 3
      }],
      {
        xAxisFormat: (v) => v.toLocaleString(),
        plugins: {
          legend: { display: false },
          datalabels: { display: true, color: '#0a1b44', font: { family: "'Inter', sans-serif", size: 11, weight: '700' }, formatter: (v) => v.toLocaleString() }
        }
      }
    );

    const totalInteresPosgrado = sumDist(interesPosgradoDist);
    Charts.createDoughnutChart('chart-interes-posgrado',
      interesPosgradoDist.map(([l]) => l), interesPosgradoDist.map(([, c]) => c),
      { colors: ['#07C8CC', '#D1D5DB', '#DCB17C'], legendPosition: 'bottom', plugins: { datalabels: donutPct(totalInteresPosgrado) } }
    );

    const totalPosgradoDeseado = sumDist(posgradoDeseadoDist);
    Charts.createHorizontalBarChart('chart-posgrado-deseado',
      posgradoDeseadoDist.map(([l]) => l),
      [{ label: 'Egresados', data: posgradoDeseadoDist.map(([, c]) => c), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }],
      { xAxisFormat: (v) => v.toLocaleString(), plugins: { legend: { display: false }, datalabels: barPct(totalPosgradoDeseado) } }
    );

    if (window.Editor) {
      window.Editor.renderCustomVisuals('formacion-continua');
    }
  });
}
