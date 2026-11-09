// js/pages/resumen.js — Pantalla Oficial: Resumen Ejecutivo de Empleabilidad 2026
// Réplica fiel de diseño, paleta de colores y componentes directivos.

let activeCharts = {};

// El CSV 2026 ya incluye la columna 'Sexo' directamente. La inferencia por
// nombre se conserva como respaldo para datos históricos (p.ej. el CSV 2025)
// o registros con el campo vacío.
// Diccionario de los ~300 nombres más frecuentes en la base (cubre ~63% de
// los registros); el resto se resuelve con una heurística de respaldo.
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

// Función para renderizar las tarjetas KPI dinámicamente
function renderDynamicKPIs(data, trazabilidadParam) {
  const traza = trazabilidadParam || (Calculations?.getTrazabilidadPEAPorCarrera ? Calculations.getTrazabilidadPEAPorCarrera(data) : null);
  const kpiConfigKey = 'unw_dashboard_kpi_config';
  let kpiConfig = null;

  try {
    const savedConfig = localStorage.getItem(kpiConfigKey);
    if (savedConfig) {
      kpiConfig = JSON.parse(savedConfig);
    }
  } catch (e) {
    console.warn('Error leyendo configuración de KPIs:', e);
  }

  // Si no hay configuración, usar la por defecto
  if (!kpiConfig || !Array.isArray(kpiConfig) || kpiConfig.length === 0) {
    kpiConfig = window.KPICatalog ? window.KPICatalog.getDefaultConfig() : [
      { kpiId: 'encuestasValidas', posicion: 0 },
      { kpiId: 'totalMuestraVsMeta', posicion: 1 },
      { kpiId: 'ocupacionPEA', posicion: 2 },
      { kpiId: 'pertinenciaLaboral', posicion: 3 },
      { kpiId: 'satisfaccionLaboral', posicion: 4 },
      { kpiId: 'npsInstitucional', posicion: 5 }
    ];
  }

  let html = '';

  kpiConfig.forEach((config, index) => {
    const posicion = index + 1;
    const kpiId = config.kpiId;

    if (window.KPICatalog) {
      const kpiDef = window.KPICatalog.getKPI(kpiId);
      if (kpiDef) {
        const resultado = window.KPICatalog.calcularKPI(kpiId, data, traza);
        if (resultado) {
          html += `
            <div class="exec-kpi-box ${kpiDef.tintClass || 'kpi-tint-white'}" data-kpi-id="${kpiId}" data-kpi-posicion="${posicion}">
              <div class="exec-kpi-title" data-editable-id="resumen-kpi-${posicion}-title" data-editable-label="KPI ${posicion}: Título">${kpiDef.titulo}</div>
              <div class="exec-kpi-number" data-editable-id="resumen-kpi-${posicion}-number" data-editable-label="KPI ${posicion}: Valor Numérico">${resultado.valor}</div>
              <div class="exec-kpi-desc" data-editable-id="resumen-kpi-${posicion}-desc" data-editable-label="KPI ${posicion}: Descripción">${resultado.descripcion}</div>
            </div>
          `;
          return;
        }
      }
    }

    // Fallback si KPICatalog no está disponible
    const defaultTotal = data ? data.length : 3592;
    const meta = traza?.totales?.totalMetaMuestral || 3742;
    const defaultAvance = meta > 0 ? Math.round((defaultTotal / meta) * 100) : 100;
    const defaultTitles = ['Encuestas válidas', 'Avance Meta Muestral', 'Nivel de Empleabilidad', 'Pertinencia laboral', 'Satisfacción laboral', 'NPS Institucional'];
    const defaultValues = [defaultTotal.toLocaleString(), `${defaultAvance}%`, '95.5%', '91%', '88%', '+40'];
    const defaultDescs = [
      'Total de respuestas válidas de egresados 2019–2025',
      `${defaultTotal.toLocaleString()} encuestados de ${meta.toLocaleString()} meta muestral`,
      'De los egresados en el mercado laboral activo',
      'Considera que su trabajo está total o parcialmente relacionado con su carrera',
      'Se encuentra satisfecho o muy satisfecho con su trabajo',
      'Nivel de recomendación de la Universidad'
    ];
    const tints = ['kpi-tint-white', 'kpi-tint-white', 'kpi-tint-wiener', 'kpi-tint-wiener', 'kpi-tint-wiener', 'kpi-tint-green'];

    const idx = posicion - 1;
    html += `
      <div class="exec-kpi-box ${tints[idx] || 'kpi-tint-white'}" data-kpi-id="${kpiId}" data-kpi-posicion="${posicion}">
        <div class="exec-kpi-title" data-editable-id="resumen-kpi-${posicion}-title" data-editable-label="KPI ${posicion}: Título">${defaultTitles[idx] || 'KPI ' + posicion}</div>
        <div class="exec-kpi-number" data-editable-id="resumen-kpi-${posicion}-number" data-editable-label="KPI ${posicion}: Valor Numérico">${defaultValues[idx] || '0'}</div>
        <div class="exec-kpi-desc" data-editable-id="resumen-kpi-${posicion}-desc" data-editable-label="KPI ${posicion}: Descripción">${defaultDescs[idx] || ''}</div>
      </div>
    `;
  });

  return html;
}

export async function loadResumenPage(container, data, filters = {}) {
  if (!container) return;

  // Limpiar gráficos anteriores para evitar conflictos de Chart.js
  Object.keys(activeCharts).forEach(key => {
    if (activeCharts[key] && typeof activeCharts[key].destroy === 'function') {
      activeCharts[key].destroy();
    }
  });
  activeCharts = {};

  const currentFilters = window.App?.filters || filters || { facultad: 'Todas', carrera: 'Todas', anio: 'Todos' };
  const isDefaultView = (!currentFilters.facultad || currentFilters.facultad === 'Todas') &&
    (!currentFilters.carrera || currentFilters.carrera === 'Todas') &&
    (!currentFilters.anio || currentFilters.anio === 'Todos');

  // Cálculos dinámicos con respaldo a valores oficiales cuando se ve el total
  const totalMuestra = data ? data.length : 0;

  // 1. Trabaja actualmente
  const trabajadores = (data || []).filter(d => {
    const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
    return t === 'sí' || t === 'si';
  });
  const totalTrabajando = trabajadores.length;
  const pctTrabaja = totalMuestra > 0 ? (totalTrabajando / totalMuestra) * 100 : 81.5;

  // 2. PEA y Ocupación PEA
  let trazabilidad = {};
  try {
    trazabilidad = Calculations?.getTrazabilidadPEAPorCarrera(data) || {};
  } catch (e) {
    console.warn(e);
  }
  const tot = trazabilidad.totales || {};
  const totalPEA = tot.totalPEA || 0;
  const totalOcupadosPEA = tot.totalOcupadosConEmprendimiento || 0;
  const pctOcupacionPEA = totalPEA > 0 ? (totalOcupadosPEA / totalPEA) * 100 : 0;

  // 3. Pertinencia laboral
  const pertValidos = trabajadores.filter(d => d[Calculations?.cols?.pertinencia]);
  const pertAlta = pertValidos.filter(d => {
    const p = (d[Calculations?.cols?.pertinencia] || '').toLowerCase();
    return p.includes('totalmente') || p.includes('parcialmente');
  }).length;
  const pctPertinencia = pertValidos.length > 0 ? (pertAlta / pertValidos.length) * 100 : 0;
  const countPert = pertAlta;
  const totalPertDenom = pertValidos.length;

  // 4. Satisfacción laboral
  const satValidos = trabajadores.filter(d => d[Calculations?.cols?.satisfaccion]);
  const satAlta = satValidos.filter(d => {
    const s = (d[Calculations?.cols?.satisfaccion] || '').toLowerCase();
    return s.includes('satisfecho') && !s.includes('insatisfecho');
  }).length;
  const pctSatisfaccion = satValidos.length > 0 ? (satAlta / satValidos.length) * 100 : 0;
  const countSat = satAlta;
  const totalSatDenom = satValidos.length;

  // 6. Desarrollo profesional (Personal a cargo y Ascensos)
  const cargoValidos = trabajadores.filter(d => d[Calculations?.cols?.personalCargo]);
  const cargoSi = cargoValidos.filter(d => {
    const c = (d[Calculations?.cols?.personalCargo] || '').toLowerCase();
    return c.startsWith('sí') || c.startsWith('si');
  }).length;
  const pctPersonalCargo = cargoValidos.length > 0 ? (cargoSi / cargoValidos.length) * 100 : 0;
  const countCargo = cargoSi;
  const totalCargo = cargoValidos.length;

  // OJO: 'independiente' contiene 'dependiente' como subcadena; se excluye explícitamente.
  const dependientes = trabajadores.filter(d => {
    const c = (d[Calculations?.cols?.condicion] || '').toLowerCase();
    return c.includes('dependiente') && !c.includes('independiente');
  });
  const ascValidos = dependientes.filter(d => {
    const a = (d[Calculations?.cols?.ascenso] || '').trim().toLowerCase();
    return a === 'sí' || a === 'si' || a === 'no';
  });
  const ascSi = ascValidos.filter(d => {
    const a = (d[Calculations?.cols?.ascenso] || '').toLowerCase();
    return a.includes('sí') || a.includes('si');
  }).length;
  const pctAscensos = ascValidos.length > 0 ? (ascSi / ascValidos.length) * 100 : 0;
  const countAscensos = ascSi;
  const totalAscensos = ascValidos.length;

  // Obtener opciones de filtros para los selectores integrados
  const facultades = DataLoader?.getFacultades ? DataLoader.getFacultades() : ['Ciencias de la Salud', 'Derecho y Ciencia Política', 'Negocios', 'Ingeniería'];
  const todasCarreras = DataLoader?.getCarreras ? DataLoader.getCarreras() : [];
  const carrerasFiltradas = currentFilters.facultad && currentFilters.facultad !== 'Todas'
    ? todasCarreras.filter(c => DataLoader.getFacultadForCarrera(c) === currentFilters.facultad)
    : todasCarreras;
  const anios = (DataLoader?.getAniosEgreso ? DataLoader.getAniosEgreso() : [2019, 2020, 2021, 2022, 2023, 2024, 2025]);

  // Render HTML principal
  container.innerHTML = `
    <div class="resumen-ejecutivo-wrapper">
      
      <!-- Barra superior institucional -->
      <div class="exec-top-bar">
        <span class="exec-institution" data-editable-id="resumen-top-institution" data-editable-label="Institución">Universidad Norbert Wiener</span>
        <span class="exec-date" data-editable-id="resumen-top-date" data-editable-label="Fecha y Módulo">Encuestas e Indicadores &nbsp;&nbsp;&nbsp;&nbsp; Edición 2026</span>
      </div>

      <!-- Título principal y cohorte -->
      <h1 class="exec-header-title" data-editable-id="resumen-header-title" data-editable-label="Título Principal">Encuesta de Empleabilidad de Egresados 2026</h1>
      <div class="exec-header-subtitle" data-editable-id="resumen-header-subtitle" data-editable-label="Subtítulo / Cohorte">Cohorte 2019 – 2025 &nbsp;|&nbsp; Resultados finales consolidados 2026</div>

      <!-- Filtros integrados idénticos a la maqueta -->
      <div class="exec-filters-bar">
        <div class="exec-filters-left">
          <div class="exec-filter-field">
            <label for="exec-sel-facultad">Facultad</label>
            <select id="exec-sel-facultad">
              <option value="Todas" ${currentFilters.facultad === 'Todas' ? 'selected' : ''}>Todas</option>
              ${facultades.map(f => `<option value="${f}" ${currentFilters.facultad === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
          </div>

          <div class="exec-filter-field">
            <label for="exec-sel-carrera">Carrera</label>
            <select id="exec-sel-carrera">
              <option value="Todas" ${currentFilters.carrera === 'Todas' ? 'selected' : ''}>Todas</option>
              ${carrerasFiltradas.map(c => `<option value="${c}" ${currentFilters.carrera === c ? 'selected' : ''}>${window.toTitleCase ? window.toTitleCase(c) : c}</option>`).join('')}
            </select>
          </div>

          <div class="exec-filter-field">
            <label for="exec-sel-anio">Año de egreso</label>
            <select id="exec-sel-anio">
              <option value="Todos" ${currentFilters.anio === 'Todos' || !currentFilters.anio ? 'selected' : ''}>Todas</option>
              ${anios.map(a => `<option value="${a}" ${currentFilters.anio == a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="exec-filters-actions">
          <button class="exec-btn-clean" id="exec-btn-limpiar">Limpiar filtros</button>
          <button class="exec-btn-refresh" id="exec-btn-actualizar">Actualizar datos</button>
          <button type="button" class="btn-toggle-editor" id="exec-btn-editor" onclick="window.Editor && window.Editor.promptAuth()" title="Activar Modo Edición (Acceso Administrador)">
            <i class="fas fa-edit"></i> <span>Editar Textos</span>
          </button>
        </div>
      </div>

      <!-- Fila de 6 Tarjetas de Indicadores Estratégicos (Dinámicos) -->
      <div class="exec-kpis-container" id="exec-kpis-container">
        ${renderDynamicKPIs(data, trazabilidad)}
      </div>

      <!-- Fila Intermedia: Gráficos de Cohorte y Facultades -->
      <div class="exec-charts-middle">
        
        <!-- Cohorte de Egreso -->
        <div class="exec-panel" data-visual-id="resumen-ocupacion-cohorte">
          <div class="exec-panel-title" data-editable-id="resumen-panel-cohorte-title" data-editable-label="Gráfico 1: Título">Nivel de empleabilidad por año de egreso</div>
          <div class="exec-chart-canvas-wrap">
            <canvas id="chart-exec-cohorte"></canvas>
          </div>
        </div>

        <!-- Facultad -->
        <div class="exec-panel" data-visual-id="resumen-ocupacion-facultad">
          <div class="exec-panel-title" data-editable-id="resumen-panel-facultad-title" data-editable-label="Gráfico 2: Título">Nivel de Empleabilidad por facultad</div>
          <div class="exec-chart-canvas-wrap">
            <canvas id="chart-exec-facultad"></canvas>
          </div>
        </div>

      </div>

      <!-- Nivel de Empleabilidad por Carrera (Barras Agrupadas) -->
      <div class="exec-panel" data-visual-id="resumen-ocupacion-carrera" style="margin-bottom: 22px;">
        <div class="exec-panel-title" data-editable-id="resumen-panel-carrera-title" data-editable-label="Gráfico Carrera: Título">
          <i class="fas fa-percentage" style="color: #07C8CC; margin-right: 8px;"></i> Nivel de Empleabilidad por Carrera
        </div>
        <p class="exec-section-desc" style="margin: -6px 0 14px 0;">Comparativo porcentual de egresados ocupados frente a no ocupados por programa académico</p>
        <div class="exec-chart-canvas-wrap" style="height: 600px;">
          <canvas id="chart-exec-carrera"></canvas>
        </div>
      </div>

      <!-- Fila Inferior: Vínculo, Ingresos y Desarrollo Profesional -->
      <div class="exec-charts-bottom">

        <!-- Tipo de Vínculo Laboral -->
        <div class="exec-panel" data-visual-id="resumen-vinculo-laboral">
          <div class="exec-panel-title" data-editable-id="resumen-panel-vinculo-title" data-editable-label="Gráfico 3: Título">Situación Laboral Actual</div>
          <div class="exec-donut-container">
            <div class="exec-donut-canvas-wrap">
              <canvas id="chart-exec-vinculo"></canvas>
            </div>
            <div class="exec-donut-legend"></div>
          </div>
        </div>

        <!-- Ingresos Laborales Declarados -->
        <div class="exec-panel" data-visual-id="resumen-nivel-ingresos">
          <div class="exec-panel-title" data-editable-id="resumen-panel-ingresos-title" data-editable-label="Gráfico 4: Título">Ingreso mensual aproximado</div>

          <!-- Selector de año de egreso -->
          <div class="exec-subcontrol-bar" id="exec-ingresos-cohort-selector-wrap">
            <span class="exec-subcontrol-label">Año de egreso:</span>
            <div class="exec-subcontrol-pills" id="exec-ingresos-cohort-pills">
              <button type="button" class="exec-pill-btn active" data-cohort="all">Todos</button>
              <button type="button" class="exec-pill-btn" data-cohort="2019">2019</button>
              <button type="button" class="exec-pill-btn" data-cohort="2020">2020</button>
              <button type="button" class="exec-pill-btn" data-cohort="2021">2021</button>
              <button type="button" class="exec-pill-btn" data-cohort="2022">2022</button>
              <button type="button" class="exec-pill-btn" data-cohort="2023">2023</button>
              <button type="button" class="exec-pill-btn" data-cohort="2024">2024</button>
              <button type="button" class="exec-pill-btn" data-cohort="2025">2025</button>
            </div>
          </div>

          <div class="exec-chart-canvas-wrap">
            <canvas id="chart-exec-ingresos"></canvas>
          </div>
          <p class="exec-section-desc" id="exec-ingresos-no-declara-note" style="margin-top: 8px;"></p>
        </div>

        <!-- Desarrollo Profesional -->
        <div class="exec-panel" data-visual-id="resumen-desarrollo-profesional">
          <div class="exec-panel-title" data-editable-id="resumen-panel-desarrollo-title" data-editable-label="Panel Desarrollo: Título">Desarrollo profesional</div>
          <div class="exec-desarrollo-list">
            <div class="exec-desarrollo-box">
              <div class="exec-desarrollo-label" data-editable-id="resumen-desarrollo-cargo-label" data-editable-label="Desarrollo: Cargo Label">Personal a cargo</div>
              <div class="exec-desarrollo-data">
                <span class="exec-desarrollo-pct">${Math.round(pctPersonalCargo)}%</span>
              </div>
              <div class="exec-desarrollo-sentence" data-editable-id="resumen-desarrollo-cargo-sentence" data-editable-label="Desarrollo: Cargo Descripción">${countCargo.toLocaleString()} de ${totalCargo.toLocaleString()} egresados ocupados tienen personal a su cargo.</div>
            </div>

            <div class="exec-desarrollo-box">
              <div class="exec-desarrollo-label" data-editable-id="resumen-desarrollo-ascensos-label" data-editable-label="Desarrollo: Ascensos Label">Ascensos laborales</div>
              <div class="exec-desarrollo-data">
                <span class="exec-desarrollo-pct">${Math.round(pctAscensos)}%</span>
              </div>
              <div class="exec-desarrollo-sentence" data-editable-id="resumen-desarrollo-ascensos-sentence" data-editable-label="Desarrollo: Ascensos Descripción">${countAscensos.toLocaleString()} de ${totalAscensos.toLocaleString()} egresados dependientes recibieron un ascenso en los últimos 5 años.</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Tamaño de Empresa por Facultad (columna oficial categorizada del CSV 2026) -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-industry" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Tamaño de Empresa por Facultad</span>
      </div>
      <p class="exec-section-desc">Tamaño de la empresa donde laboran los egresados ocupados, según categorización oficial, por facultad</p>
      <div class="exec-panel" data-visual-id="resumen-tamano-empresa-facultad" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 260px;">
          <canvas id="chart-exec-tamano-empresa-facultad"></canvas>
        </div>
      </div>

      <!-- Nivel de Empleabilidad por Condición Académica (Egresado / Bachiller / Titulado), con selector de facultad -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-user-graduate" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Nivel de Empleabilidad por Condición Académica</span>
      </div>
      <p class="exec-section-desc">Egresado, Bachiller o Titulado — porcentaje ocupado sobre la PEA</p>
      <div class="exec-panel" data-visual-id="resumen-empleabilidad-grado" style="margin-bottom: 24px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
          <div class="exec-panel-title" style="margin-bottom: 0;" data-editable-id="resumen-panel-grado-title" data-editable-label="Empleabilidad por Grado: Título">Nivel de Empleabilidad por Condición Académica</div>
          <div class="exec-subcontrol-bar" id="exec-grado-facultad-selector-wrap">
            <span class="exec-subcontrol-label">Facultad:</span>
            <div class="exec-subcontrol-pills" id="exec-grado-facultad-pills">
              <button type="button" class="exec-pill-btn active" data-facultad="all">Todas</button>
              <button type="button" class="exec-pill-btn" data-facultad="Ciencias de la Salud">Ciencias de la Salud</button>
              <button type="button" class="exec-pill-btn" data-facultad="Negocios">Negocios</button>
              <button type="button" class="exec-pill-btn" data-facultad="Ingeniería">Ingeniería</button>
              <button type="button" class="exec-pill-btn" data-facultad="Derecho y Ciencia Política">Derecho y Ciencia Política</button>
            </div>
          </div>
        </div>
        <div class="exec-chart-canvas-wrap" style="height: 260px;">
          <canvas id="chart-exec-empleabilidad-grado"></canvas>
        </div>
        <p class="exec-section-desc" id="exec-grado-note" style="margin-top: 8px; display: none;"></p>
      </div>

      <!-- Tiempo en Obtener el Primer Empleo (a ancho completo, con toggle Trabajan/No trabajan) -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-hourglass-half" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Tiempo en Obtener el Primer Empleo</span>
      </div>
      <p class="exec-section-desc">Meses que tomó conseguir el primer trabajo tras egresar, según la pregunta del instrumento respondida por cada egresado</p>
      <div class="exec-panel" data-visual-id="resumen-tiempo-empleo" style="margin-bottom: 24px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
          <div class="exec-panel-title" id="exec-tiempo-empleo-title" style="margin-bottom: 0;" data-editable-id="resumen-panel-tiempo-empleo-title" data-editable-label="Gráfico 5: Título">Tiempo en obtener primer empleo (meses)</div>
          <div class="exec-no-trabaja-toggle" id="exec-tiempo-empleo-toggle">
            <button type="button" class="exec-toggle-btn active" data-rama="trabaja">Trabajan actualmente <span class="exec-toggle-count" id="exec-toggle-count-tiempo-trabaja"></span></button>
            <button type="button" class="exec-toggle-btn" data-rama="notrabaja">No trabajan actualmente <span class="exec-toggle-count" id="exec-toggle-count-tiempo-notrabaja"></span></button>
          </div>
        </div>
        <div class="exec-chart-canvas-wrap" style="height: 260px;">
          <canvas id="chart-exec-tiempo-empleo"></canvas>
        </div>
        <p class="exec-section-desc" id="exec-tiempo-empleo-note" style="margin-top: 8px;"></p>
      </div>

      <!-- Perfil de Egresados que No Trabajan -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-user-clock" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Egresados que no trabajan</span>
      </div>
      <p class="exec-section-desc" data-editable-id="resumen-no-trabaja-desc" data-editable-label="No Trabaja: Descripción">Del total de egresados sin empleo actual, cuántos lo están buscando activamente y cuántos no, y por qué.</p>
      <div class="exec-panel" data-visual-id="resumen-no-trabaja" style="margin-bottom: 24px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
          <div class="exec-panel-title" id="exec-no-trabaja-title" style="margin-bottom: 0;" data-editable-id="resumen-panel-no-trabaja-title" data-editable-label="No Trabaja: Título">Egresados en Búsqueda de Empleo</div>
          <div class="exec-no-trabaja-toggle" id="exec-no-trabaja-toggle">
            <button type="button" class="exec-toggle-btn active" data-grupo="pea">Buscando empleo <span class="exec-toggle-count" id="exec-toggle-count-pea"></span></button>
            <button type="button" class="exec-toggle-btn" data-grupo="nopea">No busca empleo <span class="exec-toggle-count" id="exec-toggle-count-nopea"></span></button>
          </div>
        </div>
        <div class="exec-no-trabaja-grid">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <div class="exec-no-trabaja-subtitle" id="exec-no-trabaja-subtitle" style="margin-bottom: 0;">Motivo principal</div>
              <button type="button" id="exec-no-trabaja-otros-btn" class="exec-drilldown-back-btn" style="display: none;" title="Ver el desglose detallado de Otros motivos">
                <i class="fas fa-chevron-down"></i> Ver desglose de Otros motivos
              </button>
              <button type="button" id="exec-no-trabaja-back-btn" class="exec-drilldown-back-btn" style="display: none;" title="Volver a la vista general de motivos">
                <i class="fas fa-arrow-left"></i> Volver a motivos generales
              </button>
            </div>
            <div class="exec-chart-canvas-wrap" style="height: 220px;">
              <canvas id="chart-exec-no-trabaja-razon"></canvas>
            </div>
            <p class="exec-section-desc" id="exec-no-trabaja-otros-note" style="margin-top: 8px; display: none;"></p>
          </div>
          <div id="exec-no-trabaja-tiempo-wrap">
            <div class="exec-no-trabaja-subtitle">Tiempo que llevan sin empleo</div>
            <div class="exec-chart-canvas-wrap" style="height: 220px;">
              <canvas id="chart-exec-no-trabaja-tiempo"></canvas>
            </div>
          </div>
        </div>
      </div>


      <!-- Sección Dinámica de Gráficos y Cruces Personalizados -->
      <div id="custom-charts-grid" class="custom-charts-grid"></div>

      <!-- Notas metodológicas y fuente -->
      <div class="exec-footer-notes">
        <p data-editable-id="resumen-footer-note-1" data-editable-label="Nota Metodológica">Nota metodológica: Nivel de Empleabilidad = ocupados / (ocupados + buscadores activos).</p>
        <p data-editable-id="resumen-footer-note-2" data-editable-label="Fuente de Datos">Fuente: Encuesta a Egresados 2026 – Universidad Norbert Wiener. Resultados finales consolidados (cohortes 2019–2025).</p>
      </div>

    </div>
  `;

  // Configurar interactividad de los filtros e ingresos
  setupFilterEvents();
  setupIngresosControls();
  setupGradoAcademicoControls();

  // Inicializar los 4 gráficos idénticos a la imagen de referencia
  Charts.waitForReady().then(() => {
    saveOriginalChartStates();
    initExecCharts();
    if (window.Editor) {
      window.Editor.renderCustomVisuals('resumen');
      window.Editor.applyVisualOverrides('resumen');
      window.Editor.applyTextOverrides('resumen');
    }
  });
}

// Guardar estados originales de los gráficos para poder restaurarlos
function saveOriginalChartStates() {
  if (!window.OriginalChartStates) {
    window.OriginalChartStates = {};
  }

  const panels = document.querySelectorAll('.exec-panel[data-visual-id]');
  panels.forEach(panel => {
    const visualId = panel.dataset.visualId;
    if (visualId && !window.OriginalChartStates[visualId]) {
      window.OriginalChartStates[visualId] = {
        html: panel.innerHTML,
        className: panel.className,
        style: panel.getAttribute('style') || ''
      };
    }
  });

  console.log('Estados originales de gráficos guardados:', Object.keys(window.OriginalChartStates));
}

// Eventos de los filtros en la página
function setupFilterEvents() {
  const selFac = document.getElementById('exec-sel-facultad');
  const selCar = document.getElementById('exec-sel-carrera');
  const selAni = document.getElementById('exec-sel-anio');
  const btnReset = document.getElementById('exec-btn-limpiar');
  const btnUpdate = document.getElementById('exec-btn-actualizar');

  if (selFac) {
    selFac.addEventListener('change', (e) => {
      if (window.App) {
        window.App.filters.facultad = e.target.value;
        window.App.updateCarreras();
        window.App.applyFilters();
      }
    });
  }

  if (selCar) {
    selCar.addEventListener('change', (e) => {
      if (window.App) {
        window.App.filters.carrera = e.target.value;
        window.App.applyFilters();
      }
    });
  }

  if (selAni) {
    selAni.addEventListener('change', (e) => {
      if (window.App) {
        window.App.filters.anio = e.target.value;
        window.App.applyFilters();
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (window.App) {
        window.App.filters = { facultad: 'Todas', carrera: 'Todas', anio: 'Todos' };
        window.App.updateCarreras();
        window.App.applyFilters();
      }
    });
  }

  if (btnUpdate) {
    btnUpdate.addEventListener('click', () => {
      if (window.App) {
        window.App.applyFilters();
      }
    });
  }
}

// Estado del panel interactivo de ingresos: año de egreso seleccionado
let ingresosSelectedCohort = 'all'; // 'all' | '2021' | '2022' | '2023' | '2024' | '2025'

// Eventos de los controles del panel de ingresos
function setupIngresosControls() {
  const cohortPills = document.getElementById('exec-ingresos-cohort-pills');
  if (!cohortPills) return;

  const pills = cohortPills.querySelectorAll('.exec-pill-btn');
  pills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.cohort === ingresosSelectedCohort);

    pill.addEventListener('click', () => {
      const cohort = pill.dataset.cohort;
      if (!cohort || cohort === ingresosSelectedCohort) return;
      ingresosSelectedCohort = cohort;

      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      createChartIngresos();
    });
  });
}

// Estado del panel de empleabilidad por condición académica: facultad seleccionada
let gradoSelectedFacultad = 'all';

// Eventos de los controles del panel de empleabilidad por condición académica
function setupGradoAcademicoControls() {
  const pillsWrap = document.getElementById('exec-grado-facultad-pills');
  if (!pillsWrap) return;

  const pills = pillsWrap.querySelectorAll('.exec-pill-btn');
  pills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.facultad === gradoSelectedFacultad);

    pill.addEventListener('click', () => {
      const facultad = pill.dataset.facultad;
      if (!facultad || facultad === gradoSelectedFacultad) return;
      gradoSelectedFacultad = facultad;

      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      createChartEmpleabilidadGrado();
    });
  });
}

// Inicialización de Gráficos con Chart.js
function initExecCharts() {
  if (typeof Chart === 'undefined') return;

  // Destruir charts existentes antes de recrear
  Object.keys(activeCharts).forEach(key => {
    if (activeCharts[key] && typeof activeCharts[key].destroy === 'function') {
      activeCharts[key].destroy();
    }
  });
  activeCharts = {};

  createChartCohorte();
  createChartFacultad();
  createChartCarrera();
  createChartVinculo();
  createChartIngresos();
  createChartTamanoEmpresaFacultad();
  createChartEmpleabilidadGrado();
  createChartTiempoPrimerEmpleo();
  createChartNoTrabaja();
}

// Exponer funciones globalmente para que el editor pueda usarlas
window.initExecCharts = initExecCharts;
window.saveOriginalChartStates = saveOriginalChartStates;
window.createChartCarrera = createChartCarrera;

// Funciones individuales de creación de gráficos
function createChartCohorte() {
  const ctx = document.getElementById('chart-exec-cohorte');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  // Calcular datos dinámicamente
  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const datosPorAnio = Calculations?.getOcupacionPorAnioEgreso ? Calculations.getOcupacionPorAnioEgreso(data) : [];
  const aniosLabels = datosPorAnio.map(d => String(d.anio));
  const tasaValues = datosPorAnio.map(d => Math.round(d.tasaOcupacion));
  const ocupadosCounts = datosPorAnio.map(d => d.ocupados);
  const peaCounts = datosPorAnio.map(d => d.pea);

  activeCharts.cohorte = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: aniosLabels.length > 0 ? aniosLabels : ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      datasets: [{
        data: tasaValues.length > 0 ? tasaValues : [98, 99, 96, 96, 96, 94, 93],
        rawCounts: ocupadosCounts,
        rawTotals: peaCounts,
        backgroundColor: '#07C8CC',
        borderRadius: 2,
        barPercentage: 0.62,
        categoryPercentage: 0.85
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 20, right: 10, left: 0, bottom: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const count = item.dataset.rawCounts?.[item.dataIndex];
              const denom = item.dataset.rawTotals?.[item.dataIndex];
              if (count == null || denom == null) return ` ${Math.round(item.raw)}%`;
              return ` ${Math.round(item.raw)}% (${count.toLocaleString()} de ${denom.toLocaleString()} egresados)`;
            }
          }
        }
      },
      scales: {
        y: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => `${v}%`, font: { size: 10, family: 'Inter' }, color: '#64748b' }, grid: { color: '#f1f5f9', drawBorder: false } },
        x: { ticks: { font: { size: 11, family: 'Inter', weight: '500' }, color: '#475569' }, grid: { display: false } }
      }
    },
    plugins: [{ id: 'execDataLabels', afterDatasetsDraw(chart) { const { ctx } = chart; chart.data.datasets.forEach((ds, di) => { const meta = chart.getDatasetMeta(di); if (meta.hidden) return; meta.data.forEach((bar, i) => { const val = ds.data[i]; if (val == null) return; ctx.save(); ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = '#0a1b44'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(`${Math.round(Number(val))}%`, bar.x, bar.y - 4); ctx.restore(); }); }); } }]
  });
}

function createChartFacultad() {
  const ctx = document.getElementById('chart-exec-facultad');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  // Calcular datos dinámicamente por facultad
  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const porFacultad = {};
  (data || []).forEach(d => {
    const carrera = d[Calculations?.cols?.carrera] || '';
    const facultad = DataLoader?.getFacultadForCarrera ? DataLoader.getFacultadForCarrera(carrera) : 'Sin Facultad';
    if (!porFacultad[facultad]) porFacultad[facultad] = { ocupados: 0, desocupados: 0, total: 0, pea: 0 };
    const item = porFacultad[facultad];
    item.total++;

    const info = Calculations?.classifyLaborStatus ? Calculations.classifyLaborStatus(d) : { esPEA: true, esOcupado: true };
    if (info.esPEA) {
      item.pea++;
      if (info.esOcupado) {
        item.ocupados++;
      } else {
        item.desocupados++;
      }
    }
  });

  let facultades = Object.entries(porFacultad)
    .filter(([f]) => f !== 'Sin Facultad' && f !== 'Otra')
    .map(([facultad, stats]) => {
      const pea = stats.pea || stats.total;
      const tasa = pea > 0 ? (stats.ocupados / pea) * 100 : 0;
      return { facultad, tasa, ocupados: stats.ocupados, pea };
    })
    .sort((a, b) => b.tasa - a.tasa);

  if (facultades.length === 0) {
    facultades = [
      { facultad: 'Ciencias de la Salud', tasa: 95.5, ocupados: 0, pea: 0 },
      { facultad: 'Negocios', tasa: 94.7, ocupados: 0, pea: 0 },
      { facultad: 'Ingeniería', tasa: 93.8, ocupados: 0, pea: 0 },
      { facultad: 'Derecho y Ciencia Política', tasa: 92.0, ocupados: 0, pea: 0 }
    ];
  }

  const labels = facultades.map(f => f.facultad);
  const values = facultades.map(f => Math.round(f.tasa));
  const ocupadosCounts = facultades.map(f => f.ocupados);
  const peaCounts = facultades.map(f => f.pea);
  const colors = Charts.getRankedColors(values);

  activeCharts.facultad = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        rawCounts: ocupadosCounts,
        rawTotals: peaCounts,
        backgroundColor: '#07C8CC',
        borderColor: '#07C8CC',
        borderWidth: 1,
        borderRadius: 2,
        barPercentage: 0.58,
        categoryPercentage: 0.85
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 5, right: 45, left: 0, bottom: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const count = item.dataset.rawCounts?.[item.dataIndex];
              const denom = item.dataset.rawTotals?.[item.dataIndex];
              if (!denom) return ` ${Math.round(item.raw)}%`;
              return ` ${Math.round(item.raw)}% (${count.toLocaleString()} de ${denom.toLocaleString()} egresados)`;
            }
          }
        }
      },
      scales: {
        x: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => `${v}%`, font: { size: 10, family: 'Inter' }, color: '#64748b' }, grid: { color: '#f1f5f9', drawBorder: false } },
        y: { ticks: { font: { size: 11, family: 'Inter', weight: '500' }, color: '#1e293b', autoSkip: false }, grid: { display: false } }
      }
    },
    plugins: [{ id: 'execDataLabels', afterDatasetsDraw(chart) { const { ctx } = chart; chart.data.datasets.forEach((ds, di) => { const meta = chart.getDatasetMeta(di); if (meta.hidden) return; meta.data.forEach((bar, i) => { const val = ds.data[i]; if (val == null) return; ctx.save(); ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = '#0a1b44'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`${Math.round(Number(val))}%`, bar.x + 6, bar.y); ctx.restore(); }); }); } }]
  });
}

// Gráfico de Nivel de Empleabilidad por Carrera (Barras Horizontales Agrupadas: % Ocupados vs % No Ocupados)
function createChartCarrera() {
  const ctx = document.getElementById('chart-exec-carrera');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const trazabilidad = Calculations?.getTrazabilidadPEAPorCarrera ? Calculations.getTrazabilidadPEAPorCarrera(data) : { carreras: [] };

  const ordenOficial = [
    'FARMACIA Y BIOQUÍMICA',
    'ENFERMERÍA',
    'ODONTOLOGÍA',
    'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN',
    'DERECHO Y CIENCIA POLÍTICA',
    'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA',
    'PSICOLOGÍA',
    'CONTABILIDAD Y AUDITORÍA',
    'ADMINISTRACIÓN Y DIRECCIÓN DE EMPRESAS',
    'OBSTETRICIA',
    'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES',
    'INGENIERÍA DE SISTEMAS E INFORMÁTICA',
    'NUTRICIÓN Y DIETÉTICA',
    'MEDICINA HUMANA',
    'INGENIERÍA INDUSTRIAL Y DE GESTIÓN EMPRESARIAL',
    'ADMINISTRACIÓN EN TURISMO Y HOTELERÍA'
  ];

  const nombresFormateados = {
    'FARMACIA Y BIOQUÍMICA': 'Farmacia y Bioquímica',
    'ENFERMERÍA': 'Enfermería',
    'ODONTOLOGÍA': 'Odontología',
    'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN': 'Tecnología Médica en Terapia Física y Rehabilitación',
    'DERECHO Y CIENCIA POLÍTICA': 'Derecho y Ciencia Política',
    'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA': 'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica',
    'PSICOLOGÍA': 'Psicología',
    'CONTABILIDAD Y AUDITORÍA': 'Contabilidad y Auditoría',
    'ADMINISTRACIÓN Y DIRECCIÓN DE EMPRESAS': 'Administración y Dirección de Empresas',
    'OBSTETRICIA': 'Obstetricia',
    'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES': 'Administración y Negocios Internacionales',
    'INGENIERÍA DE SISTEMAS E INFORMÁTICA': 'Ingeniería de Sistemas e Informática',
    'NUTRICIÓN Y DIETÉTICA': 'Nutrición y Dietética',
    'MEDICINA HUMANA': 'Medicina Humana',
    'INGENIERÍA INDUSTRIAL Y DE GESTIÓN EMPRESARIAL': 'Ingeniería Industrial y de Gestión Empresarial',
    'ADMINISTRACIÓN EN TURISMO Y HOTELERÍA': 'Administración en Turismo y Hotelería'
  };

  const normKey = (str) => (str || '').replace(/_x0000_/g, '').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
  const ordenMap = new Map(ordenOficial.map((name, idx) => [name, idx]));

  const carrerasOrdenadas = [...(trazabilidad.carreras || [])]
    .filter(c => !c.carrera.toUpperCase().includes('MARKETING'))
    .sort((a, b) => {
      const kA = normKey(a.carrera);
      const kB = normKey(b.carrera);
      const idxA = ordenMap.has(kA) ? ordenMap.get(kA) : 999;
      const idxB = ordenMap.has(kB) ? ordenMap.get(kB) : 999;
      if (idxA !== idxB) return idxA - idxB;
      return a.carrera.localeCompare(b.carrera);
    });

  const wrap = ctx.parentElement;
  if (wrap) {
    const targetHeight = Math.max(180, carrerasOrdenadas.length * 37.5);
    wrap.style.height = `${targetHeight}px`;
  }

  const labels = carrerasOrdenadas.map(c => nombresFormateados[normKey(c.carrera)] || (window.toTitleCase ? window.toTitleCase(c.carrera) : c.carrera));
  const ocupadosData = carrerasOrdenadas.map(c => Math.round(c.tasaPEA));
  const noOcupadosData = carrerasOrdenadas.map(c => Math.max(0, 100 - Math.round(c.tasaPEA)));

  activeCharts.carrera = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Ocupados (%)',
          data: ocupadosData,
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 3,
          barPercentage: 0.8,
          categoryPercentage: 0.82
        },
        {
          label: 'No Ocupados (%)',
          data: noOcupadosData,
          backgroundColor: '#D1D5DB',
          borderColor: '#9CA3AF',
          borderWidth: 1,
          borderRadius: 3,
          barPercentage: 0.8,
          categoryPercentage: 0.82
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { right: 42, left: 10, top: 10, bottom: 10 }
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            callback: (v) => `${v}%`,
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#64748b'
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        y: {
          ticks: {
            font: { family: "'Inter', sans-serif", size: 11, weight: '500' },
            color: '#0a1b44',
            callback: function(val) {
              const label = this.getLabelForValue(val);
              if (!label) return '';
              if (window.innerWidth < 768 && label.length > 22) {
                return label.slice(0, 20) + '...';
              }
              if (window.innerWidth < 1200 && label.length > 34) {
                return label.slice(0, 32) + '...';
              }
              return label;
            }
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: { family: "'Inter', sans-serif", size: 12 },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed.x;
              const idx = context.dataIndex;
              const c = carrerasOrdenadas[idx];
              if (!c) return ` ${context.dataset.label}: ${Math.round(val)}%`;
              const cantidad = context.datasetIndex === 0 ? c.ocupadosTotalPEA : c.buscanActivamente;
              return ` ${context.dataset.label}: ${Math.round(val)}% (${(cantidad || 0).toLocaleString()} de ${(c.pea || 0).toLocaleString()} egresados)`;
            }
          }
        },
        datalabels: {
          display: true,
          color: '#0a1b44',
          font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
          formatter: (v) => `${Math.round(v)}%`,
          anchor: 'end',
          align: 'right',
          offset: 4
        }
      }
    }
  });
}

// Cruce Tamaño de Empresa (columna oficial categorizada) x Facultad, entre egresados
// ocupados. Barra apilada horizontal al 100% por facultad, mismo estilo que "Trabajos
// Pertinentes por Carrera" / los cruces de Resultados Generales.
function createChartTamanoEmpresaFacultad() {
  const ctx = document.getElementById('chart-exec-tamano-empresa-facultad');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const trabajadores = (data || []).filter(d => {
    const v = String(d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
    return v.startsWith('sí') || v.startsWith('si');
  });

  const tamanoField = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'tamanoEmpresa');
  const NO_APLICA = new Set(['No aplica / No precisa', 'No especifica']);

  // Conteos por facultad x tamaño de empresa, y totales globales por tamaño (para
  // ordenar las categorías del stack por relevancia real, sin hardcodear nombres).
  const porFacultad = {};
  const totalesTamano = {};
  trabajadores.forEach(d => {
    const carrera = d[Calculations?.cols?.carrera] || '';
    const facultad = DataLoader?.getFacultadForCarrera ? DataLoader.getFacultadForCarrera(carrera) : 'Sin Facultad';
    const tamano = tamanoField ? tamanoField.getValue(d) : 'No aplica / No precisa';
    if (NO_APLICA.has(tamano)) return;

    if (!porFacultad[facultad]) porFacultad[facultad] = { total: 0 };
    porFacultad[facultad][tamano] = (porFacultad[facultad][tamano] || 0) + 1;
    porFacultad[facultad].total++;
    totalesTamano[tamano] = (totalesTamano[tamano] || 0) + 1;
  });

  const facultades = Object.keys(porFacultad)
    .filter(f => f !== 'Sin Facultad' && f !== 'Otra')
    .sort((a, b) => porFacultad[b].total - porFacultad[a].total);

  // Orden fijo por jerarquía de tamaño (de mayor a menor empresa), no por frecuencia.
  const ORDEN_TAMANO = ['Gran Empresa', 'Mediana Empresa', 'Pequeña Empresa', 'Microempresa'];
  const categorias = [
    ...ORDEN_TAMANO.filter(t => totalesTamano[t]),
    ...Object.keys(totalesTamano).filter(t => !ORDEN_TAMANO.includes(t)).sort((a, b) => totalesTamano[b] - totalesTamano[a])
  ];
  const paleta = ['#07C8CC', '#63b3ed', '#94A3B8', '#D1D5DB'];

  const datasets = categorias.map((tamano, i) => ({
    label: tamano,
    data: facultades.map(f => {
      const total = porFacultad[f].total;
      const count = porFacultad[f][tamano] || 0;
      return total > 0 ? Math.round((count / total) * 100) : 0;
    }),
    rawCounts: facultades.map(f => porFacultad[f][tamano] || 0),
    backgroundColor: paleta[i % paleta.length]
  }));

  Charts.createHorizontalStackedBarChart('chart-exec-tamano-empresa-facultad', facultades, datasets, {
    scales: { x: { display: false } },
    layout: { padding: { right: 38 } },
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (item) => {
            const count = item.dataset.rawCounts?.[item.dataIndex] || 0;
            return ` ${item.dataset.label}: ${Math.round(item.raw)}% (${count.toLocaleString()} egresados)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
        formatter: (v) => {
          const num = typeof v === 'number' ? v : Number(v) || 0;
          return num >= 4 ? `${Math.round(num)}%` : '';
        }
      }
    }
  });
}

// Nivel de Empleabilidad (ocupados/PEA, misma clasificación oficial del resto del dashboard) por
// Condición Académica (Egresado/Bachiller/Titulado, columna 'Grado Académico'), filtrable por
// facultad con los botones superiores.
function createChartEmpleabilidadGrado() {
  const ctx = document.getElementById('chart-exec-empleabilidad-grado');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const filtered = gradoSelectedFacultad === 'all'
    ? (data || [])
    : (data || []).filter(d => DataLoader?.getFacultadForCarrera && DataLoader.getFacultadForCarrera(d[Calculations?.cols?.carrera]) === gradoSelectedFacultad);

  const gradoField = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'gradoAcademico');
  const ORDEN_GRADO = ['Egresado', 'Bachiller', 'Titulado'];
  const porGrado = {};
  filtered.forEach(d => {
    const grado = gradoField ? gradoField.getValue(d) : null;
    if (!ORDEN_GRADO.includes(grado)) return;
    if (!porGrado[grado]) porGrado[grado] = { pea: 0, ocupados: 0 };
    const info = Calculations?.classifyLaborStatus ? Calculations.classifyLaborStatus(d) : { esPEA: false, esOcupado: false };
    if (info.esPEA) {
      porGrado[grado].pea++;
      if (info.esOcupado) porGrado[grado].ocupados++;
    }
  });

  const labels = ORDEN_GRADO.filter(g => porGrado[g] && porGrado[g].pea > 0);
  const values = labels.map(g => Math.round((porGrado[g].ocupados / porGrado[g].pea) * 100));
  const ocupadosCounts = labels.map(g => porGrado[g].ocupados);
  const peaCounts = labels.map(g => porGrado[g].pea);
  const colors = Charts.getRankedColors(values);

  const note = document.getElementById('exec-grado-note');
  if (note) {
    const faltantes = ORDEN_GRADO.filter(g => !labels.includes(g));
    if (faltantes.length > 0) {
      const sufijoFacultad = gradoSelectedFacultad !== 'all' ? ` en ${gradoSelectedFacultad}` : '';
      note.innerHTML = `* Sin datos suficientes para: ${faltantes.join(', ')}${sufijoFacultad}.`;
      note.style.display = 'block';
    } else {
      note.innerHTML = '';
      note.style.display = 'none';
    }
  }

  if (labels.length === 0) { Charts.showEmpty ? Charts.showEmpty('chart-exec-empleabilidad-grado') : null; return; }
  Charts.hideEmpty && Charts.hideEmpty('chart-exec-empleabilidad-grado');

  activeCharts.empleabilidadGrado = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        rawCounts: ocupadosCounts,
        rawTotals: peaCounts,
        backgroundColor: colors,
        borderRadius: 4,
        barPercentage: 0.5,
        categoryPercentage: 0.7
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 20, right: 10, left: 0, bottom: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const count = item.dataset.rawCounts?.[item.dataIndex];
              const denom = item.dataset.rawTotals?.[item.dataIndex];
              if (count == null || denom == null) return ` ${Math.round(item.raw)}%`;
              return ` ${Math.round(item.raw)}% (${count.toLocaleString()} de ${denom.toLocaleString()} egresados)`;
            }
          }
        }
      },
      scales: {
        y: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => `${v}%`, font: { size: 10, family: 'Inter' }, color: '#64748b' }, grid: { color: '#f1f5f9', drawBorder: false } },
        x: { ticks: { font: { size: 12, family: 'Inter', weight: '600' }, color: '#475569' }, grid: { display: false } }
      }
    },
    plugins: [{
      id: 'execDataLabelsGrado',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((ds, di) => {
          const meta = chart.getDatasetMeta(di);
          if (meta.hidden) return;
          meta.data.forEach((bar, i) => {
            const val = ds.data[i];
            if (val == null) return;
            ctx.save();
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillStyle = '#0a1b44';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${Math.round(Number(val))}%`, bar.x, bar.y - 4);
            ctx.restore();
          });
        });
      }
    }]
  });
}

function createChartVinculo() {
  const ctx = document.getElementById('chart-exec-vinculo');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  // Calcular distribución de vínculo laboral desde datos
  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : [];
  const trabajadores = (data || []).filter(d => {
    const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
    return t === 'sí' || t === 'si';
  });

  // Se usa el campo 'condicion' de PivotEngine (no el texto crudo) porque la fuente puede
  // traer la respuesta textual completa del instrumento en vez de la etiqueta corta;
  // PivotEngine ya sabe normalizar ambos formatos por subcadena, insensible a mayúsculas.
  const condicionFieldVinculo = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'condicion');
  const vinculoCounts = {};
  trabajadores.forEach(d => {
    const key = condicionFieldVinculo ? condicionFieldVinculo.getValue(d) : 'Otro';
    if (key && key !== 'No precisa') vinculoCounts[key] = (vinculoCounts[key] || 0) + 1;
  });

  const totalV = Object.values(vinculoCounts).reduce((a, b) => a + b, 0) || 1;
  const ordenV = ['Dependiente', 'Independiente', 'Propietario / Emprendimiento'];
  const labels = ordenV.filter(k => vinculoCounts[k]);
  const counts = labels.map(k => vinculoCounts[k]);
  const values = labels.map(k => Math.round((vinculoCounts[k] / totalV) * 100));
  const colors = Charts.getRankedColors(values);

  const centerPct = values.length > 0 ? values[0] : '0';
  const centerLabel = labels.length > 0 ? labels[0] : '';
  const centerLines = centerLabel.length > 10 ? [centerLabel.slice(0, Math.ceil(centerLabel.length / 2)), centerLabel.slice(Math.ceil(centerLabel.length / 2))] : [centerLabel];

  const donutCenterPlugin = {
    id: 'execDonutCenter',
    beforeDraw(chart) { const { width, height, ctx } = chart; ctx.save(); ctx.font = '800 20px Inter, sans-serif'; ctx.fillStyle = '#0a1b44'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${centerPct}%`, width / 2, height / 2 - 8); ctx.font = '400 10px Inter, sans-serif'; ctx.fillStyle = '#64748b'; centerLines.forEach((line, i) => ctx.fillText(line, width / 2, height / 2 + 8 + i * 11)); ctx.restore(); }
  };

  // Actualizar leyenda HTML
  const legendContainer = document.querySelector('.exec-donut-legend');
  if (legendContainer) {
    legendContainer.innerHTML = labels.map((l, i) => `
      <div class="exec-legend-row">
        <div class="exec-legend-left">
          <span class="exec-legend-dot" style="background-color: ${colors[i]};"></span>
          <span class="exec-legend-label" title="${l}">${l}</span>
        </div>
        <span class="exec-legend-val">${values[i]}% <span style="color:#94a3b8;font-weight:400;">(${counts[i].toLocaleString()})</span></span>
      </div>
    `).join('');
  }

  activeCharts.vinculo = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        rawCounts: counts,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '72%',
      layout: { padding: 4 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const count = item.dataset.rawCounts?.[item.dataIndex] || 0;
              return ` ${item.label}: ${item.raw}% (${count.toLocaleString()} egresados)`;
            }
          }
        }
      }
    },
    plugins: [donutCenterPlugin]
  });
}

function createChartIngresos() {
  const ctx = document.getElementById('chart-exec-ingresos');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  // Calcular distribución de ingresos desde datos
  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);

  const ordenSalarios = [
    'Hasta S/. 1,500',
    'Entre S/. 1,501 y S/. 3,000',
    'Entre S/. 3,001 y S/. 5,000',
    'Entre S/. 5,001 y S/. 8,000',
    'Más de S/. 8,001'
  ];
  const shortSalaryLabels = {
    'Hasta S/. 1,500': ['Hasta', 'S/ 1,500'],
    'Entre S/. 1,501 y S/. 3,000': ['S/ 1,501 a', 'S/ 3,000'],
    'Entre S/. 3,001 y S/. 5,000': ['S/ 3,001 a', 'S/ 5,000'],
    'Entre S/. 5,001 y S/. 8,000': ['S/ 5,001 a', 'S/ 8,000'],
    'Más de S/. 8,001': ['Más de', 'S/ 8,001']
  };

  const resolverCategoriaSalario = (categoria) => {
    const compact = String(categoria || '').toLowerCase().replace(/[.\s]/g, '');
    if (/^hastas\/?1,?500$/.test(compact)) return 'Hasta S/. 1,500';
    if (compact.includes('1,501') || compact.includes('1501')) return 'Entre S/. 1,501 y S/. 3,000';
    if (compact.includes('3,001') || compact.includes('3001')) return 'Entre S/. 3,001 y S/. 5,000';
    if (compact.includes('5,001') || compact.includes('5001')) return 'Entre S/. 5,001 y S/. 8,000';
    if (compact.includes('8,001') || compact.includes('8001') || compact.includes('másde') || compact.includes('masde')) return 'Más de S/. 8,001';
    return categoria;
  };

  const isNoDeclara = (categoria) => {
    const s = String(categoria || '').trim().toLowerCase();
    return !s || s.includes('prefiero no decirlo') || s.includes('no declara') || s.includes('no precisa') || s.includes('sin datos');
  };

  const getAnioEgreso = (row) => {
    const val = row['Año de Egreso'] || row['Año de egreso:'] || row['anioEgreso'] || row[Calculations?.cols?.anioEgreso] || '';
    const match = String(val).match(/\d{4}/);
    return match ? match[0] : '';
  };

  const colTrabaja = Calculations?.cols?.trabaja || '1. ¿Actualmente te encuentras trabajando o realizando una actividad remunerada que genere ingresos?';
  const colSalario = Calculations?.cols?.salario || '9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información con el fin, de en caso te encuentres interesado en recibir información de ofertas laborales podamos enviar en base al sueldo base que percibes actualmente)';

  const trabajadores = (data || []).filter(d => {
    const v = String(d[colTrabaja] || '').trim().toLowerCase();
    return v.startsWith('sí') || v.startsWith('si');
  });

  // Filtrar por año de egreso seleccionado (o todos)
  const trabajadoresCohorte = ingresosSelectedCohort === 'all'
    ? trabajadores
    : trabajadores.filter(d => getAnioEgreso(d) === ingresosSelectedCohort);

  const declarantes = trabajadoresCohorte.filter(d => !isNoDeclara(d[colSalario]));
  const noDeclarantes = trabajadoresCohorte.filter(d => isNoDeclara(d[colSalario]));
  const totalDeclarantes = declarantes.length;

  // Nota de declarantes
  const noteEl = document.getElementById('exec-ingresos-no-declara-note');
  if (noteEl) {
    noteEl.textContent = `${totalDeclarantes.toLocaleString()} egresados reportaron su ingreso mensual; ${noDeclarantes.length.toLocaleString()} prefirieron no declararlo.`;
  }

  const labels = ordenSalarios.map(s => shortSalaryLabels[s]);
  const counts = ordenSalarios.map(s => declarantes.filter(d => resolverCategoriaSalario(d[colSalario]) === s).length);
  const values = counts.map(c => totalDeclarantes > 0 ? Math.round((c / totalDeclarantes) * 100) : 0);
  const maxYVal = Math.max(...values, 35);

  const chartDatasets = [{
    label: ingresosSelectedCohort === 'all' ? 'Todos los años' : `Egreso ${ingresosSelectedCohort}`,
    data: values,
    rawCounts: counts,
    backgroundColor: '#07C8CC',
    borderRadius: 2,
    barPercentage: 0.65,
    categoryPercentage: 0.85
  }];

  activeCharts.ingresos = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: chartDatasets
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
              const count = item.dataset.rawCounts?.[item.dataIndex] || 0;
              return ` ${item.raw}% (${count.toLocaleString()} egresados)`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: maxYVal + 6,
          ticks: {
            stepSize: 10,
            callback: (v) => `${v}%`,
            font: { size: 10, family: 'Inter' },
            color: '#64748b'
          },
          grid: { color: '#f1f5f9', drawBorder: false }
        },
        x: {
          ticks: {
            font: { size: 10, family: 'Inter', weight: '500' },
            color: '#475569'
          },
          grid: { display: false }
        }
      }
    },
    plugins: [{
      id: 'execDataLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((ds, di) => {
          const meta = chart.getDatasetMeta(di);
          if (meta.hidden) return;
          meta.data.forEach((bar, i) => {
            const val = ds.data[i];
            if (val == null || val === 0) return;
            ctx.save();
            ctx.font = chart.data.datasets.length > 3 ? 'bold 8.5px Inter, sans-serif' : 'bold 9.5px Inter, sans-serif';
            ctx.fillStyle = '#0a1b44';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${Math.round(Number(val))}%`, bar.x, bar.y - 3);
            ctx.restore();
          });
        });
      }
    }]
  });
}

// La fuente trae distinta redacción para ">12 meses" según la rama del instrumento
// ("12 meses a más" en la rama de quienes trabajan, "Más de 12 meses." en la rama de quienes
// no trabajan) y un punto final inconsistente; se normaliza a una sola etiqueta.
function normalizarTiempoPrimerEmpleo(raw) {
  const str = String(raw || '').trim().replace(/\.$/, '');
  if (!str) return null;
  if (str === '12 meses a más') return 'Más de 12 meses';
  return str;
}

// Pregunta 11 (rama "trabaja actualmente") o Pregunta 4 (rama "no trabaja actualmente, pero
// sí trabajó antes") — son mutuamente excluyentes por fila, cada egresado responde solo una.
function getTiempoPrimerEmpleoDist(data, rama) {
  const col = rama === 'trabaja' ? Calculations?.cols?.tiempoPrimerEmpleo : Calculations?.cols?.tiempoPrimerEmpleoNoTrabaja;
  const counts = {};
  let total = 0;
  (data || []).forEach(d => {
    const tiempo = normalizarTiempoPrimerEmpleo(d[col]);
    if (!tiempo) return;
    counts[tiempo] = (counts[tiempo] || 0) + 1;
    total++;
  });
  return { counts, total };
}

// Estado del toggle Trabajan Actualmente / No Trabajan Actualmente del panel "Tiempo en
// Obtener el Primer Empleo"
let tiempoEmpleoState = { rama: 'trabaja' };

function createChartTiempoPrimerEmpleo() {
  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const distTrabaja = getTiempoPrimerEmpleoDist(data, 'trabaja');
  const distNoTrabaja = getTiempoPrimerEmpleoDist(data, 'notrabaja');

  const countTrabajaEl = document.getElementById('exec-toggle-count-tiempo-trabaja');
  const countNoTrabajaEl = document.getElementById('exec-toggle-count-tiempo-notrabaja');
  if (countTrabajaEl) countTrabajaEl.textContent = distTrabaja.total.toLocaleString();
  if (countNoTrabajaEl) countNoTrabajaEl.textContent = distNoTrabaja.total.toLocaleString();

  const toggle = document.getElementById('exec-tiempo-empleo-toggle');
  if (toggle) {
    if (!toggle.dataset) toggle.dataset = {};
    if (!toggle.dataset.bound) {
      toggle.dataset.bound = '1';
      toggle.querySelectorAll('.exec-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          toggle.querySelectorAll('.exec-toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          tiempoEmpleoState.rama = btn.dataset ? btn.dataset.rama : btn.getAttribute('data-rama');
          renderTiempoEmpleoGrupo(distTrabaja, distNoTrabaja);
        });
      });
    }
  }

  renderTiempoEmpleoGrupo(distTrabaja, distNoTrabaja);
}

function renderTiempoEmpleoGrupo(distTrabaja, distNoTrabaja) {
  const ctx = document.getElementById('chart-exec-tiempo-empleo');
  if (!ctx) return;
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const rama = tiempoEmpleoState.rama;
  const { counts, total } = rama === 'trabaja' ? distTrabaja : distNoTrabaja;

  const ordenCronologico = [
    'Ya me encontraba trabajando al egresar',
    'De 1 a 3 meses',
    'De 3 a 6 meses',
    'De 6 a 12 meses',
    'Más de 12 meses',
    'No especifica'
  ];
  const shortLabels = {
    'Ya me encontraba trabajando al egresar': 'Ya trabajaba',
    'De 1 a 3 meses': '1 a 3',
    'De 3 a 6 meses': '3 a 6',
    'De 6 a 12 meses': '6 a 12',
    'Más de 12 meses': 'Más de 12',
    'No especifica': 'No especifica'
  };

  const ordenados = ordenCronologico.filter(k => counts[k]);

  let labels, values, rawCounts;
  if (total > 0 && ordenados.length > 0) {
    labels = ordenados.map(k => shortLabels[k] || k);
    values = ordenados.map(k => Math.round((counts[k] / total) * 100));
    rawCounts = ordenados.map(k => counts[k]);
  } else {
    labels = ['Ya trabajaba', '1 a 3', '3 a 6', '6 a 12', 'Más de 12'];
    values = [];
    rawCounts = [];
  }

  const noteEl = document.getElementById('exec-tiempo-empleo-note');
  if (noteEl) {
    noteEl.textContent = rama === 'trabaja'
      ? `Egresados que trabajan actualmente (Pregunta 11 del instrumento): ${total.toLocaleString()} respuestas válidas.`
      : `Egresados que no trabajan actualmente pero sí tuvieron un primer empleo antes (Pregunta 4 del instrumento): ${total.toLocaleString()} respuestas válidas.`;
  }

  activeCharts.tiempoEmpleo = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        rawCounts: rawCounts,
        backgroundColor: '#07C8CC',
        borderRadius: 2,
        barPercentage: 0.62,
        categoryPercentage: 0.85
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 5, right: 45, left: 0, bottom: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const count = item.dataset.rawCounts?.[item.dataIndex] || 0;
              return ` ${Math.round(item.raw)}% (${count.toLocaleString()} egresados)`;
            }
          }
        }
      },
      scales: {
        x: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => `${v}%`, font: { size: 10, family: 'Inter' }, color: '#64748b' }, grid: { color: '#f1f5f9', drawBorder: false } },
        y: { ticks: { font: { size: 11, family: 'Inter', weight: '500' }, color: '#1e293b', autoSkip: false }, grid: { display: false } }
      }
    },
    plugins: [{ id: 'execDataLabels', afterDatasetsDraw(chart) { const { ctx } = chart; chart.data.datasets.forEach((ds, di) => { const meta = chart.getDatasetMeta(di); if (meta.hidden) return; meta.data.forEach((bar, i) => { const val = ds.data[i]; if (val == null) return; ctx.save(); ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = '#0a1b44'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`${Math.round(Number(val))}%`, bar.x + 6, bar.y); ctx.restore(); }); }); } }]
  });
}

// Estado del toggle PEA No Ocupados / No PEA del panel "No Trabaja"
let noTrabajaState = { grupo: 'pea', drilldownOtros: false };

function getNoTrabajaSegmentos(data) {
  const peaNoOcupados = [];
  const noPea = [];
  (data || []).forEach(d => {
    const info = Calculations?.classifyLaborStatus ? Calculations.classifyLaborStatus(d) : null;
    if (!info || info.esOcupado) return; // Solo egresados que NO están ocupados
    if (info.esPEA) peaNoOcupados.push({ d, info });
    else noPea.push({ d, info });
  });
  return { peaNoOcupados, noPea };
}

function countByLabel(rows) {
  const counts = {};
  rows.forEach(({ info }) => { counts[info.label] = (counts[info.label] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
}

// Nivel principal para No PEA (3 categorías limpias y minimalistas)
function getNoPeaResumenDist(noPea) {
  let countPersonales = 0;
  let countEstudios = 0;
  let countOtros = 0;
  const colRazon = Calculations?.cols?.razonNoTrabaja;

  noPea.forEach(({ d }) => {
    const r = (d[colRazon] || '').trim();
    if (r.includes('personales') || r.includes('familiares')) {
      countPersonales++;
    } else if (r.toLowerCase().includes('posgrado') || r.includes('Carrera')) {
      countEstudios++;
    } else {
      countOtros++;
    }
  });

  const dist = [];
  if (countPersonales > 0) dist.push({ label: 'Motivos personales o familiares', count: countPersonales });
  if (countOtros > 0) dist.push({ label: `Otros motivos (${countOtros.toLocaleString()})`, count: countOtros, isOtros: true });
  if (countEstudios > 0) dist.push({ label: 'Estudiando posgrado u otra carrera', count: countEstudios });

  return dist.sort((a, b) => b.count - a.count);
}

// Desglose interactivo (drilldown) de "Otros motivos" a partir de la columna oficial
function getNoPeaOtrosDrilldownDist(noPea) {
  const counts = {};
  const colRazon = Calculations?.cols?.razonNoTrabaja;
  const colCat = Calculations?.cols?.razonNoTrabajaCategorizada;

  noPea.forEach(({ d }) => {
    const r = (d[colRazon] || '').trim();
    const esOtros = !r.includes('personales') && !r.includes('familiares') && !r.toLowerCase().includes('posgrado') && !r.includes('Carrera');
    if (!esOtros) return;

    const cat = (d[colCat] || '').trim();
    let label = 'Otros motivos no especificados';
    if (cat.includes('Trámite') || cat.includes('Tesis') || cat.includes('Título')) {
      label = 'En trámite de tesis / título profesional';
    } else if (cat.includes('SERUMS')) {
      label = 'Postulando / Preparándose para el SERUMS';
    } else if (cat.includes('Viaje') || cat.includes('Descanso')) {
      label = 'Viaje, descanso o reciente retorno del extranjero';
    } else if (cat.includes('Fin de contrato') || cat.includes('Cese laboral')) {
      label = 'Fin de contrato o cese laboral reciente';
    }
    counts[label] = (counts[label] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
}

function countTiempoDesempleo(rows) {
  const orden = ['De 1 a 3 meses', 'De 3 a 6 meses', 'De 6 a 12 meses', 'Más de 12 meses'];
  const counts = {};
  rows.forEach(({ d }) => {
    const raw = (d[Calculations?.cols?.tiempoDesempleo] || '').trim().replace(/\.$/, '');
    if (raw) counts[raw] = (counts[raw] || 0) + 1;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return orden
    .filter(k => counts[k])
    .map(k => ({ label: k, count: counts[k], pct: total > 0 ? Math.round((counts[k] / total) * 100) : 0 }));
}

function createChartNoTrabaja() {
  const data = (window.App && App.getFilteredData) ? App.getFilteredData() : (window.DataLoader ? DataLoader.getEncuestas() : []);
  const { peaNoOcupados, noPea } = getNoTrabajaSegmentos(data);

  const countPeaEl = document.getElementById('exec-toggle-count-pea');
  const countNoPeaEl = document.getElementById('exec-toggle-count-nopea');
  if (countPeaEl) countPeaEl.textContent = peaNoOcupados.length.toLocaleString();
  if (countNoPeaEl) countNoPeaEl.textContent = noPea.length.toLocaleString();

  const backBtn = document.getElementById('exec-no-trabaja-back-btn');
  if (backBtn) {
    if (!backBtn.dataset) backBtn.dataset = {};
    if (!backBtn.dataset.bound) {
      backBtn.dataset.bound = '1';
      backBtn.addEventListener('click', () => {
        noTrabajaState.drilldownOtros = false;
        renderNoTrabajaGrupo(peaNoOcupados, noPea);
      });
    }
  }

  const otrosBtn = document.getElementById('exec-no-trabaja-otros-btn');
  if (otrosBtn) {
    if (!otrosBtn.dataset) otrosBtn.dataset = {};
    if (!otrosBtn.dataset.bound) {
      otrosBtn.dataset.bound = '1';
      otrosBtn.addEventListener('click', () => {
        noTrabajaState.drilldownOtros = true;
        renderNoTrabajaGrupo(peaNoOcupados, noPea);
      });
    }
  }

  const toggle = document.getElementById('exec-no-trabaja-toggle');
  if (toggle) {
    if (!toggle.dataset) toggle.dataset = {};
    if (!toggle.dataset.bound) {
      toggle.dataset.bound = '1';
      toggle.querySelectorAll('.exec-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          toggle.querySelectorAll('.exec-toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          noTrabajaState.grupo = btn.dataset ? btn.dataset.grupo : btn.getAttribute('data-grupo');
          noTrabajaState.drilldownOtros = false; // Reset al cambiar de grupo
          renderNoTrabajaGrupo(peaNoOcupados, noPea);
        });
      });
    }
  }

  renderNoTrabajaGrupo(peaNoOcupados, noPea);
}

function renderNoTrabajaGrupo(peaNoOcupados, noPea) {
  const grupo = noTrabajaState.grupo;
  const isOtrosDrilldown = (grupo === 'nopea' && noTrabajaState.drilldownOtros);

  const titleEl = document.getElementById('exec-no-trabaja-title');
  if (titleEl) {
    titleEl.textContent = grupo === 'pea'
      ? 'Egresados en Búsqueda de Empleo'
      : (isOtrosDrilldown ? 'Desglose Detallado de Otros Motivos' : 'Egresados que No Trabajan');
  }

  const backBtn = document.getElementById('exec-no-trabaja-back-btn');
  if (backBtn) {
    backBtn.style.display = isOtrosDrilldown ? 'inline-flex' : 'none';
  }

  const otrosBtn = document.getElementById('exec-no-trabaja-otros-btn');

  const subtitleEl = document.getElementById('exec-no-trabaja-subtitle');
  if (subtitleEl) {
    if (grupo === 'pea') {
      subtitleEl.textContent = 'Motivo principal — Egresados que buscan empleo activamente';
    } else if (isOtrosDrilldown) {
      subtitleEl.textContent = 'Sub-categorías oficiales de la columna Razón No Trabaja - Categorizado (Final)';
    } else {
      subtitleEl.textContent = 'Motivo principal — Egresados que no buscan empleo (inactivos)';
    }
  }

  let dist = [];
  if (grupo === 'pea') {
    dist = countByLabel(peaNoOcupados);
  } else if (isOtrosDrilldown) {
    dist = getNoPeaOtrosDrilldownDist(noPea);
  } else {
    dist = getNoPeaResumenDist(noPea);
  }

  const labels = dist.map(x => x.label);
  const values = dist.map(x => x.count);
  const totalSubGrupo = values.reduce((a, b) => a + b, 0);

  const otrosItem = dist.find(x => x.isOtros);
  const otrosCount = otrosItem ? otrosItem.count : 0;

  if (otrosBtn) {
    otrosBtn.style.display = (grupo === 'nopea' && !isOtrosDrilldown && otrosCount > 0) ? 'inline-flex' : 'none';
  }

  const otrosNoteEl = document.getElementById('exec-no-trabaja-otros-note');
  if (otrosNoteEl) {
    if (grupo === 'pea') {
      otrosNoteEl.style.display = 'none';
    } else if (isOtrosDrilldown) {
      otrosNoteEl.style.display = 'block';
      otrosNoteEl.textContent = `Desglose oficial de los ${totalSubGrupo.toLocaleString()} egresados categorizados en "Otros motivos" (columna Razón No Trabaja - Categorizado, Final).`;
    } else if (otrosCount > 0) {
      otrosNoteEl.style.display = 'block';
      otrosNoteEl.textContent = `"Otros motivos" agrupa ${otrosCount.toLocaleString()} egresados con razones menos frecuentes (trámite de título, SERUMS, viajes, cese laboral, etc.). Usa el botón de arriba para ver el desglose completo.`;
    } else {
      otrosNoteEl.style.display = 'none';
    }
  }

  const bgColors = labels.map(() => '#07C8CC');
  const hoverColors = labels.map(() => '#06b6d4');

  const ctx = document.getElementById('chart-exec-no-trabaja-razon');
  if (ctx) {
    const existing = Chart.getChart(ctx);
    if (existing) existing.destroy();
    activeCharts.noTrabajaRazon = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length > 0 ? labels : ['Sin datos'],
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          hoverBackgroundColor: hoverColors,
          borderRadius: 2,
          barPercentage: isOtrosDrilldown ? 0.62 : 0.52,
          categoryPercentage: 0.82
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 5, right: 40, left: 0, bottom: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const val = Number(item.raw);
                if (isOtrosDrilldown) {
                  const pct = totalSubGrupo > 0 ? Math.round((val / totalSubGrupo) * 100) : 0;
                  return ` ${val.toLocaleString()} egresados (${pct}% de Otros)`;
                }
                return ` ${val.toLocaleString()} egresados`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { font: { size: 10, family: 'Inter' }, color: '#64748b', precision: 0 },
            grid: { color: '#f1f5f9', drawBorder: false }
          },
          y: {
            ticks: {
              font: { size: 11, family: 'Inter', weight: '500' },
              color: '#1e293b',
              autoSkip: false
            },
            grid: { display: false }
          }
        }
      },
      plugins: [{
        id: 'execDataLabels',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          chart.data.datasets.forEach((ds, di) => {
            const meta = chart.getDatasetMeta(di);
            if (meta.hidden) return;
            meta.data.forEach((bar, i) => {
              const val = ds.data[i];
              if (val == null) return;
              ctx.save();
              ctx.font = 'bold 11px Inter, sans-serif';
              ctx.fillStyle = '#0a1b44';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${Number(val).toLocaleString()}`, bar.x + 6, bar.y);
              ctx.restore();
            });
          });
        }
      }]
    });
  }

  const tiempoWrap = document.getElementById('exec-no-trabaja-tiempo-wrap');
  if (tiempoWrap) tiempoWrap.style.display = grupo === 'pea' ? 'block' : 'none';

  const tCtx = document.getElementById('chart-exec-no-trabaja-tiempo');
  if (grupo === 'pea' && tCtx) {
    const tiempoDist = countTiempoDesempleo(peaNoOcupados);
    const tLabels = tiempoDist.map(x => x.label);
    const tValues = tiempoDist.map(x => x.pct);
    const tCounts = tiempoDist.map(x => x.count);
    const existingT = Chart.getChart(tCtx);
    if (existingT) existingT.destroy();
    activeCharts.noTrabajaTiempo = new Chart(tCtx, {
      type: 'bar',
      data: {
        labels: tLabels.length > 0 ? tLabels : ['Sin datos'],
        datasets: [{ data: tValues, rawCounts: tCounts, backgroundColor: '#07C8CC', borderRadius: 2, barPercentage: 0.6, categoryPercentage: 0.8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { top: 22, right: 10, left: 0, bottom: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const count = item.dataset.rawCounts?.[item.dataIndex] || 0;
                return ` ${Math.round(item.raw)}% (${count.toLocaleString()} egresados)`;
              }
            }
          }
        },
        scales: {
          y: { min: 0, max: Math.max(50, ...tValues), ticks: { stepSize: 10, callback: (v) => `${v}%`, font: { size: 10, family: 'Inter' }, color: '#64748b' }, grid: { color: '#f1f5f9', drawBorder: false } },
          x: { ticks: { font: { size: 10, family: 'Inter', weight: '500' }, color: '#475569' }, grid: { display: false } }
        }
      },
      plugins: [{ id: 'execDataLabels', afterDatasetsDraw(chart) { const { ctx } = chart; chart.data.datasets.forEach((ds, di) => { const meta = chart.getDatasetMeta(di); if (meta.hidden) return; meta.data.forEach((bar, i) => { const val = ds.data[i]; if (val == null) return; ctx.save(); ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = '#0a1b44'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(`${Math.round(Number(val))}%`, bar.x, bar.y - 4); ctx.restore(); }); }); } }]
    });
  } else if (tCtx) {
    const leftover = Chart.getChart(tCtx);
    if (leftover) leftover.destroy();
  }
}

// Restaurar un gráfico oficial específico por su visualId
window.restoreOfficialChart = function (visualId) {
  if (typeof Chart === 'undefined') return;
  const chartCreators = {
    'resumen-cohorte': createChartCohorte,
    'resumen-ocupacion-cohorte': createChartCohorte,
    'resumen-facultad': createChartFacultad,
    'resumen-ocupacion-facultad': createChartFacultad,
    'resumen-vinculo': createChartVinculo,
    'resumen-vinculo-laboral': createChartVinculo,
    'resumen-ingresos': createChartIngresos,
    'resumen-ingresos-salario': createChartIngresos,
    'resumen-carrera': createChartCarrera,
    'resumen-ocupacion-carrera': createChartCarrera,
    'resumen-tamano-empresa': createChartTamanoEmpresaFacultad,
    'resumen-tamano-empresa-facultad': createChartTamanoEmpresaFacultad,
    'resumen-empleabilidad-grado': createChartEmpleabilidadGrado,
    'resumen-tiempo-empleo': createChartTiempoPrimerEmpleo,
    'resumen-no-trabaja': createChartNoTrabaja
  };
  const creator = chartCreators[visualId];
  if (creator) {
    setTimeout(() => creator(), 30);
  }
};
