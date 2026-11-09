// js/pages/ocupacion.js

export async function loadOcupacionPage(container, data) {
  const trazabilidad = Calculations.getTrazabilidadPEAPorCarrera(data);
  const sensibilidadPEA = Calculations.getSensibilidadPEA(data);
  const trabajadores = Calculations.getRespuestasTrabajadores(data);
  const datosPorAnio = Calculations.getOcupacionPorAnioEgreso(data);
  const indicadoresClave = Calculations.getIndicadoresClave2026(data);

  // Se clasifica con el campo 'condicion' de PivotEngine (no con el texto crudo de la
  // columna) porque la fuente puede traer la respuesta textual completa del instrumento
  // ("Trabajador dependiente (empleado por una institución o empresa)") en vez de la
  // etiqueta corta; PivotEngine ya sabe normalizar ambos formatos por subcadena.
  const condicionField = PivotEngine.fields.find(f => f.id === 'condicion');
  const condicionLaboral = {};
  trabajadores.forEach(d => {
    const cond = condicionField ? condicionField.getValue(d) : d[Calculations.cols.condicion];
    if (cond && cond !== 'No precisa') condicionLaboral[cond] = (condicionLaboral[cond] || 0) + 1;
  });

  // --- Perfil del Empleo Actual (columnas oficiales categorizadas del CSV 2026, antes sin
  // gráfico dedicado): tamaño de empresa, zona geográfica de trabajo, nivel de cargo y
  // los principales empleadores reales de la muestra.
  const NO_APLICA_LABELS = new Set(['No aplica / No precisa', 'No especifica']);
  const countDistinct = (fieldId) => {
    const field = PivotEngine.fields.find(f => f.id === fieldId);
    const counts = {};
    trabajadores.forEach(d => {
      const val = field.getValue(d);
      if (NO_APLICA_LABELS.has(val)) return;
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const tamanoEmpresaDist = countDistinct('tamanoEmpresa');
  const zonaGeograficaDist = countDistinct('zonaGeografica');

  // El nivel de cargo es una escala jerárquica: se ordena por seniority, no por frecuencia,
  // para poder leer la "pirámide" profesional de un vistazo.
  const NIVEL_CARGO_ORDEN = [
    'CEO / Fundador', 'Dirección / Gerencia', 'Jefe / Supervisor / Coordinador', 'Senior',
    'Semi Senior', 'Junior', 'Experiencia Inicial', 'Trainee / Prácticas', 'Serums'
  ];
  const nivelCargoCounts = Object.fromEntries(countDistinct('nivelCargo'));
  const nivelCargoDist = NIVEL_CARGO_ORDEN
    .filter(label => nivelCargoCounts[label] > 0)
    .map(label => [label, nivelCargoCounts[label]]);

  // Progresión de carrera: nivel del primer empleo (todo el universo que alguna vez tuvo un
  // primer trabajo) vs. nivel del cargo actual (solo ocupados). "nivelPrimerEmpleo" se calcula
  // sobre 'data' completa porque también aplica a quienes ya no trabajan pero sí trabajaron antes.
  const primerEmpleoField = PivotEngine.fields.find(f => f.id === 'nivelPrimerEmpleo');
  const primerEmpleoCounts = {};
  data.forEach(d => {
    const val = primerEmpleoField.getValue(d);
    if (NO_APLICA_LABELS.has(val)) return;
    primerEmpleoCounts[val] = (primerEmpleoCounts[val] || 0) + 1;
  });
  const nivelesConDato = NIVEL_CARGO_ORDEN.filter(l => nivelCargoCounts[l] > 0 || primerEmpleoCounts[l] > 0);

  const topEmpleadores = Calculations.getTopEmpleadores(trabajadores, 10);

  // Top 10 puestos actuales (catálogo ya categorizado por el equipo de datos, distinto según
  // el track de la carrera: Salud vs. NID). Se limita a 10 porque el catálogo completo tiene
  // ~48 categorías, ilegible en un solo gráfico.
  const cargoActualDist = countDistinct('cargoActual').slice(0, 10);

  const modalidadTrabajo = {};
  trabajadores.forEach(d => {
    const mod = d[Calculations.cols.modalidad];
    if (mod) modalidadTrabajo[mod] = (modalidadTrabajo[mod] || 0) + 1;
  });

  const escBase = sensibilidadPEA.escenarios[0];
  const escAjustado = sensibilidadPEA.escenarios[1];
  const escPEA = sensibilidadPEA.escenarios[2];
  const tot = trazabilidad.totales;

  // Metodología y orden oficial de programas académicos
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

  const carrerasOrdenadas = [...trazabilidad.carreras]
    .filter(c => !c.carrera.toUpperCase().includes('MARKETING'))
    .sort((a, b) => {
      const kA = normKey(a.carrera);
      const kB = normKey(b.carrera);
      const idxA = ordenMap.has(kA) ? ordenMap.get(kA) : 999;
      const idxB = ordenMap.has(kB) ? ordenMap.get(kB) : 999;
      if (idxA !== idxB) return idxA - idxB;
      return a.carrera.localeCompare(b.carrera);
    });

      container.innerHTML = `
    <div class="exec-dashboard-wrap">
      
      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Ocupación y Empleo</span>
        </div>
        <h1 class="exec-header-title">Situación Laboral</h1>
        <div class="exec-header-subtitle">Indicadores de ocupación, condición laboral y desempeño profesional de los egresados</div>
      </div>

      <!-- Tarjetas de Métricas Principales (6 KPIs) -->
      <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 24px;">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title" data-editable-id="ocupacion-kpi-empleabilidad-title" data-editable-label="KPI: Título Nivel de Empleabilidad">Nivel de Empleabilidad</div>
          <div class="exec-kpi-number" data-editable-id="ocupacion-kpi-empleabilidad-number" data-editable-label="KPI: Nivel de Empleabilidad">${(tot.tasaPEATotal || 0).toFixed(1)}%</div>
          <div class="exec-kpi-desc" data-editable-id="ocupacion-kpi-empleabilidad-desc" data-editable-label="KPI: Descripción Nivel de Empleabilidad">Egresados con empleo o actividad</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Ocupados</div>
          <div class="exec-kpi-number text-primary">${tot.totalOcupadosConEmprendimiento.toLocaleString()}</div>
          <div class="exec-kpi-desc">Mercado laboral activo</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Tasa de Desocupación</div>
          <div class="exec-kpi-number text-warning">${Math.round(tot.tasaDesempleoTotal)}%</div>
          <div class="exec-kpi-desc">Egresados sin empleo</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">No Ocupados</div>
          <div class="exec-kpi-number text-warning">${tot.totalBuscan.toLocaleString()}</div>
          <div class="exec-kpi-desc">En búsqueda activa</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Personal a Cargo</div>
          <div class="exec-kpi-number">${indicadoresClave.personalCargo.valor}</div>
          <div class="exec-kpi-desc">${indicadoresClave.personalCargo.sub}</div>
        </div>

        <div class="exec-kpi-box kpi-tint-green">
          <div class="exec-kpi-title">Ascenso entre Dependientes</div>
          <div class="exec-kpi-number">${indicadoresClave.ascenso.valor}</div>
          <div class="exec-kpi-desc">${indicadoresClave.ascenso.sub}</div>
        </div>
      </div>

      <!-- Fila de Gráficos Circulares Simétricos (Distribución y Condición) -->
      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 0;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-chart-pie" style="color: #07C8CC; margin-right: 8px;"></i> Distribución: Ocupados vs No Ocupados</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Proporción de la población laboral activa</p>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 270px;">
            <canvas id="chart-pie-ocupacion-desempleo"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-briefcase" style="color: #07C8CC; margin-right: 8px;"></i> Condición Laboral de Ocupados (n = ${tot.totalOcupadosConEmprendimiento.toLocaleString()})</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Distribución: dependiente, independiente o emprendedor</p>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 270px;">
            <canvas id="chart-condicion"></canvas>
          </div>
        </div>
      </div>

      <!-- Gráfico de Ocupación por Año de Egreso -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-chart-bar" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Nivel de Empleabilidad por Año de Egreso (2019 - 2025)</span>
      </div>
      <p class="exec-section-desc">Comparativo anual de egresados ocupados vs no ocupados y nivel de empleabilidad por cohorte</p>
      
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 340px;">
          <canvas id="chart-ocupacion-anios"></canvas>
        </div>
        <div class="table-container mt-4" style="overflow-x: auto; padding: 0 10px 10px 10px;">
          <table class="data-table" style="min-width: 520px; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th class="text-center" style="padding: 10px; font-weight: 600;">Año de Egreso</th>
                <th class="text-center text-success" style="padding: 10px; font-weight: 600;">Ocupados (n)</th>
                <th class="text-center text-warning" style="padding: 10px; font-weight: 600;">No Ocupados (n)</th>
                <th class="text-center" style="padding: 10px; font-weight: 600;">Total</th>
                <th class="text-center text-success" style="padding: 10px; font-weight: 600;">Nivel de Empleabilidad</th>
                <th class="text-center text-warning" style="padding: 10px; font-weight: 600;">Tasa de Desocupación</th>
              </tr>
            </thead>
            <tbody>
              ${datosPorAnio.map(a => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td class="text-center font-bold" style="padding: 8px 10px;">${a.anio}</td>
                  <td class="text-center font-bold text-success" style="padding: 8px 10px;">${a.ocupados.toLocaleString()}</td>
                  <td class="text-center font-bold text-warning" style="padding: 8px 10px;">${a.noOcupados.toLocaleString()}</td>
                  <td class="text-center font-bold" style="padding: 8px 10px;">${a.pea.toLocaleString()}</td>
                  <td class="text-center text-success font-bold" style="padding: 8px 10px;">${Math.round(a.tasaOcupacion)}%</td>
                  <td class="text-center text-warning font-bold" style="padding: 8px 10px;">${Math.round(a.tasaDesempleo)}%</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8fafc; border-top: 2px solid #cbd5e1; font-weight: bold;">
                <td class="text-center text-dark py-2">Total General</td>
                <td class="text-center text-success py-2">${tot.totalOcupadosConEmprendimiento.toLocaleString()}</td>
                <td class="text-center text-warning py-2">${tot.totalBuscan.toLocaleString()}</td>
                <td class="text-center text-dark py-2">${tot.totalPEA.toLocaleString()}</td>
                <td class="text-center text-success py-2">${Math.round(tot.tasaPEATotal)}%</td>
                <td class="text-center text-warning py-2">${Math.round(tot.tasaDesempleoTotal)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Ocupados en Muestra por Carrera (Barras Horizontales Agrupadas) -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-users" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Egresados Ocupados y No Ocupados en Muestra por Carrera</span>
      </div>
      <p class="exec-section-desc">Comparativo cuantitativo de egresados ocupados vs no ocupados evaluados en cada programa académico</p>
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 600px;">
          <canvas id="chart-ocupados-muestra-carrera"></canvas>
        </div>
      </div>

      <!-- Sensibilidad Metodológica: 3 Escenarios (Tarjeta limpia al final) -->
      <div class="exec-panel" style="margin-bottom: 28px; margin-top: 24px;">
        <div class="exec-panel-title"><i class="fas fa-sliders-h" style="color: #07C8CC; margin-right: 8px;"></i> Sensibilidad Metodológica: 3 Escenarios Técnicos</div>
        <p class="exec-section-desc" style="margin: 0 20px 14px 20px;">Comparativo de la tasa según la definición técnica del denominador (Metodología OIT / INEI)</p>
        <div class="table-container pb-2" style="overflow-x: auto; padding: 0 20px 16px 20px;">
          <table class="data-table" style="min-width: 480px; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th class="text-left" style="padding: 12px; font-weight: 600;">Escenario</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Ocupados</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Denominador</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Tasa (%)</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Margen Error</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px;"><strong>1. Tasa Bruta</strong><br><small class="text-muted">Todos los encuestados</small></td>
                <td class="text-center" style="padding: 12px;">${escBase.ocupados.toLocaleString()}</td>
                <td class="text-center" style="padding: 12px;">${escBase.denominador.toLocaleString()}</td>
                <td class="text-center font-bold" style="padding: 12px;">${Math.round(escBase.tasa)}%</td>
                <td class="text-center" style="padding: 12px;"><span class="badge badge-semaforo-verde">±${Math.round(escBase.margenError)}%</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px;"><strong>2. Tasa Ajustada</strong><br><small class="text-muted">Excluyendo inactivos no disponibles</small></td>
                <td class="text-center" style="padding: 12px;">${escAjustado.ocupados.toLocaleString()}</td>
                <td class="text-center" style="padding: 12px;">${escAjustado.denominador.toLocaleString()}</td>
                <td class="text-center font-bold text-info" style="padding: 12px;">${Math.round(escAjustado.tasa)}%</td>
                <td class="text-center" style="padding: 12px;"><span class="badge badge-semaforo-verde">±${Math.round(escAjustado.margenError)}%</span></td>
              </tr>
              <tr style="background-color: #f0fdf4;">
                <td style="padding: 12px;"><strong>3. Nivel de Empleabilidad</strong><br><small class="text-muted">Estándar oficial (OIT / INEI)</small></td>
                <td class="text-center" style="padding: 12px;">${escPEA.ocupados.toLocaleString()}</td>
                <td class="text-center" style="padding: 12px;">${escPEA.denominador.toLocaleString()}</td>
                <td class="text-center font-bold text-success" style="font-size: 15px; padding: 12px;">${Math.round(escPEA.tasa)}%</td>
                <td class="text-center" style="padding: 12px;"><span class="badge badge-semaforo-verde">±${Math.round(escPEA.margenError)}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Perfil del Empleo Actual: tamaño de empresa, zona, nivel de cargo, empleadores -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-building" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Perfil del Empleo Actual (n = ${tot.totalOcupadosConEmprendimiento.toLocaleString()})</span>
      </div>
      <p class="exec-section-desc">Características del empleo actual de los egresados ocupados: tamaño de empresa, ubicación geográfica y nivel del cargo</p>

      <div class="exec-charts-bottom" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-industry" style="color: #07C8CC; margin-right: 8px;"></i> Tamaño de la Empresa</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Según categorización oficial del empleador</p>
          <div class="exec-chart-canvas-wrap is-donut-square" style="height: 300px;">
            <canvas id="chart-tamano-empresa"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-map-marker-alt" style="color: #07C8CC; margin-right: 8px;"></i> Zona Geográfica de Trabajo</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Dónde se ubica el centro de labores actual</p>
          <div class="exec-chart-canvas-wrap" style="height: 300px;">
            <canvas id="chart-zona-geografica"></canvas>
          </div>
        </div>
      </div>

      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-layer-group" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Nivel del Cargo Actual</span>
      </div>
      <p class="exec-section-desc">Distribución jerárquica de los egresados ocupados, de mayor a menor seniority</p>
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 360px;">
          <canvas id="chart-nivel-cargo"></canvas>
        </div>
      </div>

      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-stairs" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Progresión de Carrera: Primer Empleo vs. Cargo Actual</span>
      </div>
      <p class="exec-section-desc">Distribución porcentual del nivel del primer empleo (todos los egresados que alguna vez trabajaron) frente al nivel del cargo actual (solo ocupados)</p>
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 380px;">
          <canvas id="chart-progresion-carrera"></canvas>
        </div>
      </div>

      <!-- Prácticas Preprofesionales y su Relación con la Trayectoria Laboral (Solo NID) -->
      <div class="exec-section-header" style="margin-top: 28px; margin-bottom: 4px;">
        <i class="fas fa-user-graduate" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Prácticas Preprofesionales y su Relación con la Trayectoria Laboral</span>
      </div>
      <p class="exec-section-desc">Solo egresados de Negocios, Ingeniería y Derecho (NID) — únicos a quienes se les hizo esta pregunta del instrumento</p>

      <div class="exec-charts-bottom exec-charts-bottom-donut-wide" style="margin-bottom: 24px; margin-top: 12px;">
        <!-- Donut: ¿Realizó Prácticas Preprofesionales? -->
        <div class="exec-panel">
          <div class="exec-panel-title">¿Realizó Prácticas Preprofesionales?</div>
          <div class="exec-donut-container">
            <div class="exec-donut-canvas-wrap">
              <canvas id="chart-ocupacion-practicas-nid"></canvas>
            </div>
            <div class="exec-donut-legend" id="ocupacion-practicas-nid-legend"></div>
          </div>
        </div>

        <!-- Condición Laboral según Prácticas Preprofesionales -->
        <div class="exec-panel">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
            <div class="exec-panel-title" style="margin-bottom: 0;">Condición Laboral según Prácticas Preprofesionales</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <div class="exec-subcontrol-bar" id="ocupacion-practicas-condicion-facultad-selector-wrap">
                <span class="exec-subcontrol-label">Facultad:</span>
                <div class="exec-subcontrol-pills" id="ocupacion-practicas-condicion-facultad-pills">
                  <button type="button" class="exec-pill-btn active" data-facultad="all">Todas (NID)</button>
                  <button type="button" class="exec-pill-btn" data-facultad="Negocios">Negocios</button>
                  <button type="button" class="exec-pill-btn" data-facultad="Ingeniería">Ingeniería</button>
                  <button type="button" class="exec-pill-btn" data-facultad="Derecho y Ciencia Política">Derecho</button>
                </div>
              </div>
              <div class="exec-subcontrol-bar" id="ocupacion-practicas-condicion-cohort-selector-wrap">
                <span class="exec-subcontrol-label">Año de egreso:</span>
                <div class="exec-subcontrol-pills" id="ocupacion-practicas-condicion-cohort-pills">
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
            </div>
          </div>
          <div class="exec-chart-canvas-wrap" style="height: 440px;">
            <canvas id="chart-ocupacion-practicas-condicion-laboral"></canvas>
          </div>
          <p class="exec-section-desc" id="ocupacion-practicas-condicion-note" style="margin-top: 8px; display: none;"></p>
        </div>
      </div>

      <!-- Nivel de Cargo Actual según Prácticas Preprofesionales -->
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
          <div class="exec-panel-title" style="margin-bottom: 0;">Nivel de Cargo Actual según Prácticas Preprofesionales</div>
          <div class="exec-subcontrol-bar" id="ocupacion-practicas-cargo-cohort-selector-wrap">
            <span class="exec-subcontrol-label">Año de egreso:</span>
            <div class="exec-subcontrol-pills" id="ocupacion-practicas-cargo-cohort-pills">
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
        </div>
        <div class="exec-chart-canvas-wrap" style="height: 260px;">
          <canvas id="chart-ocupacion-practicas-nivel-cargo"></canvas>
        </div>
        <p class="exec-section-desc" id="ocupacion-practicas-cargo-note" style="margin-top: 8px; display: none;"></p>
      </div>

      <!-- Nivel de Empleabilidad según Prácticas Preprofesionales -->
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 4px;">
          <div class="exec-panel-title" style="margin-bottom: 0;">Nivel de Empleabilidad según Prácticas Preprofesionales</div>
          <div class="exec-subcontrol-bar" id="ocupacion-practicas-empleabilidad-cohort-selector-wrap">
            <span class="exec-subcontrol-label">Año de egreso:</span>
            <div class="exec-subcontrol-pills" id="ocupacion-practicas-empleabilidad-cohort-pills">
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
        </div>
        <p class="exec-section-desc" style="margin: 0 0 12px 0;">Tiempo que tomó conseguir el primer empleo — se usa como indicador de empleabilidad en vez del % Ocupados/PEA porque la pregunta de prácticas solo se hace a egresados NID que ya están trabajando (ambos grupos darían 100%)</p>
        <div class="exec-chart-canvas-wrap" style="height: 440px;">
          <canvas id="chart-ocupacion-practicas-empleabilidad"></canvas>
        </div>
        <p class="exec-section-desc" id="ocupacion-practicas-empleabilidad-note" style="margin-top: 8px; display: none;"></p>
      </div>

      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-city" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Principales Empleadores</span>
      </div>
      <p class="exec-section-desc">Top 10 organizaciones donde laboran los egresados encuestados (se excluyen respuestas genéricas como "Persona Natural" o "Sin dato")</p>
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 420px;">
          <canvas id="chart-top-empleadores"></canvas>
        </div>
      </div>

      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-id-badge" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Principales Puestos Actuales</span>
      </div>
      <p class="exec-section-desc">Top 10 puestos de trabajo declarados, según catálogo oficial (distinto para carreras de Salud y de Negocios/Ingeniería/Derecho)</p>
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 420px;">
          <canvas id="chart-cargo-actual"></canvas>
        </div>
      </div>

      <div id="custom-charts-grid" class="custom-charts-grid"></div>
    </div>
  `;

  Charts.waitForReady().then(() => {
    // Gráfico Circular: Ocupados vs No Ocupados
    Charts.createDoughnutChart('chart-pie-ocupacion-desempleo',
      ['Ocupados', 'No Ocupados'],
      [tot.totalOcupadosConEmprendimiento, tot.totalBuscan],
      {
        colors: ['#07C8CC', '#D1D5DB'],
        legendPosition: 'bottom',
        cutout: '60%',
        plugins: {
          datalabels: {
            display: true, color: '#ffffff',
            font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, tot.totalPEA)
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.parsed;
                const totalPEA = tot.totalPEA;
                const pct = totalPEA > 0 ? Math.round((val / totalPEA) * 100) : 0;
                return ` ${context.label}: ${val.toLocaleString()} egresados (${pct}%)`;
              },
              afterLabel: function(context) {
                const val = context.parsed;
                const totalEncuestados = tot.totalMuestra;
                const pctTotal = totalEncuestados > 0 ? Math.round((val / totalEncuestados) * 100) : 0;
                return ` Representa el ${pctTotal}% del total encuestado (${val.toLocaleString()} de ${totalEncuestados.toLocaleString()})`;
              }
            }
          }
        }
      }
    );

    // Progresión de Carrera: Nivel del Primer Empleo vs. Nivel del Cargo Actual. Se grafica en
    // % dentro de cada serie (no en conteo crudo): "primer empleo" se calcula sobre un universo
    // mucho más amplio (todos, con más "No aplica") que "cargo actual" (solo ocupados), así que
    // comparar conteos crudos exageraría artificialmente el peso de las categorías actuales.
    const totalPrimerEmpleo = Object.values(primerEmpleoCounts).reduce((s, c) => s + c, 0);
    const totalCargoActual = Object.values(nivelCargoCounts).reduce((s, c) => s + c, 0);
    Charts.createHorizontalBarChart('chart-progresion-carrera',
      nivelesConDato,
      [
        {
          label: 'Primer Empleo',
          data: nivelesConDato.map(l => totalPrimerEmpleo > 0 ? Math.round(((primerEmpleoCounts[l] || 0) / totalPrimerEmpleo) * 100) : 0),
          backgroundColor: '#D1D5DB',
          borderColor: '#9CA3AF',
          borderWidth: 1,
          borderRadius: 3
        },
        {
          label: 'Cargo Actual',
          data: nivelesConDato.map(l => totalCargoActual > 0 ? Math.round(((nivelCargoCounts[l] || 0) / totalCargoActual) * 100) : 0),
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 3
        }
      ],
      {
        xAxisFormat: (v) => `${v}%`,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label;
                const raw = context.dataset.label === 'Primer Empleo' ? (primerEmpleoCounts[label] || 0) : (nivelCargoCounts[label] || 0);
                return ` ${context.dataset.label}: ${context.parsed.x}% (${raw.toLocaleString()} egresados)`;
              }
            }
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
            formatter: (v) => `${v}%`
          }
        }
      }
    );

    // Gráfico Vertical: Nivel de Ocupación por Año de Egreso
    Charts.createBarChart('chart-ocupacion-anios',
      datosPorAnio.map(d => String(d.anio)),
      [
        {
          label: 'Ocupados',
          data: datosPorAnio.map(d => d.ocupados),
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 4,
          order: 2,
          yAxisID: 'y'
        },
        {
          label: 'No Ocupados',
          data: datosPorAnio.map(d => d.noOcupados),
          backgroundColor: '#D1D5DB',
          borderColor: '#9CA3AF',
          borderWidth: 1,
          borderRadius: 4,
          order: 2,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Nivel de Empleabilidad (%)',
          data: datosPorAnio.map(d => Math.round(d.tasaOcupacion)),
          borderColor: '#0a1b44',
          backgroundColor: '#0a1b44',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#07C8CC',
          pointBorderColor: '#0a1b44',
          pointBorderWidth: 2,
          yAxisID: 'y1',
          tension: 0.2,
          order: 1
        }
      ],
      {
        layout: {
          padding: { right: 28, left: 10, top: 15, bottom: 5 }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Número de Egresados (Muestra)',
              font: { family: "'Inter', sans-serif", size: 12, weight: '600' }
            },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 11 },
              callback: (v) => v.toLocaleString()
            },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          y1: {
            position: 'right',
            beginAtZero: false,
            min: 80,
            max: 100,
            title: {
              display: true,
              text: 'Nivel de Empleabilidad (%)',
              font: { family: "'Inter', sans-serif", size: 12, weight: '600' }
            },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 11 },
              callback: (v) => `${Math.round(v)}%`
            },
            grid: { display: false }
          },
          x: {
            title: {
              display: true,
              text: 'Año de Egreso',
              font: { family: "'Inter', sans-serif", size: 12, weight: '600' }
            },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 12, weight: '600' }
            },
            grid: { display: false }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const idx = context.dataIndex;
                const it = datosPorAnio[idx];
                if (context.dataset.type === 'line') {
                  return ` Nivel de Empleabilidad: ${Math.round(context.parsed.y)}% (${it.ocupados.toLocaleString()} de ${it.pea.toLocaleString()} egresados)`;
                }
                const val = context.parsed.y;
                const pct = it.pea > 0 ? Math.round((val / it.pea) * 100) : 0;
                return ` ${context.dataset.label}: ${val.toLocaleString()} egresados (${pct}% del total activo del año)`;
              }
            }
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
            // Línea de Nivel de Empleabilidad: %. Barras de Ocupados/No Ocupados: cantidad (n).
            formatter: (v, dataset) => dataset.label === 'Nivel de Empleabilidad (%)' ? `${v}%` : v.toLocaleString()
          }
        }
      }
    );

    // Gráfico Cuantitativo: Ocupados y No Ocupados en Muestra por Carrera (barras agrupadas)
    Charts.createHorizontalBarChart('chart-ocupados-muestra-carrera',
      carrerasOrdenadas.map(c => nombresFormateados[normKey(c.carrera)] || (window.toTitleCase ? window.toTitleCase(c.carrera) : c.carrera)),
      [
        {
          label: 'Ocupados en Muestra (n)',
          data: carrerasOrdenadas.map(c => c.ocupadosTotalPEA),
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 3
        },
        {
          label: 'No Ocupados en Muestra (n)',
          data: carrerasOrdenadas.map(c => c.buscanActivamente),
          backgroundColor: '#D1D5DB',
          borderColor: '#9CA3AF',
          borderWidth: 1,
          borderRadius: 3
        }
      ],
      {
        xAxisFormat: (v) => v.toLocaleString(),
        layout: {
          padding: { right: 36, left: 10, top: 10, bottom: 10 }
        },
        scales: {
          x: {
            beginAtZero: true,
            grace: '8%',
            ticks: {
              callback: (v) => v.toLocaleString(),
              font: { family: "'Inter', sans-serif", size: 11 }
            },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          y: {
            ticks: {
              font: { family: "'Inter', sans-serif", size: 11 },
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
          legend: { display: true, position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.parsed.x;
                const idx = context.dataIndex;
                const c = carrerasOrdenadas[idx];
                const totalPEA = c.pea;
                const pct = totalPEA > 0 ? Math.round((val / totalPEA) * 100) : 0;
                return ` ${context.dataset.label}: ${val.toLocaleString()} egresados (${pct}% de la carrera)`;
              },
              afterLabel: function(context) {
                const idx = context.dataIndex;
                const c = carrerasOrdenadas[idx];
                return ` Total evaluado: ${c.pea.toLocaleString()} egresados`;
              }
            }
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
            formatter: (v) => v.toLocaleString()
          }
        }
      }
    );

    // Gráfico de Condición Laboral (Dona)
    const condLabels = Object.keys(condicionLaboral);
    const condValues = Object.values(condicionLaboral);
    const condColors = condLabels.map(l => {
      if (l === 'Dependiente') return '#07C8CC';
      if (l === 'Independiente') return '#368BA1';
      if (l.includes('Propietario') || l.includes('Emprendimiento')) return '#D1D5DB';
      return '#284E4E';
    });
    const totalCondicion = condValues.reduce((s, v) => s + v, 0);
    Charts.createDoughnutChart('chart-condicion',
      condLabels,
      condValues,
      {
        colors: condColors, legendPosition: 'bottom',
        plugins: {
          datalabels: {
            display: true, color: '#ffffff',
            font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, totalCondicion)
          }
        }
      }
    );

    // Tamaño de Empresa (dona, categoría mayoritaria primero)
    const tamanoColors = ['#07C8CC', '#368BA1', '#88E788', '#DCB17C', '#D1D5DB'];
    const totalTamanoEmpresa = tamanoEmpresaDist.reduce((s, [, c]) => s + c, 0);
    Charts.createDoughnutChart('chart-tamano-empresa',
      tamanoEmpresaDist.map(([label]) => label),
      tamanoEmpresaDist.map(([, count]) => count),
      {
        colors: tamanoColors,
        legendPosition: 'bottom',
        cutout: '60%',
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = tamanoEmpresaDist.reduce((s, [, c]) => s + c, 0);
                const pct = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                return ` ${context.label}: ${context.parsed.toLocaleString()} (${pct}%)`;
              }
            }
          },
          datalabels: {
            display: true, color: '#ffffff',
            font: { family: "'Inter', sans-serif", size: 12, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, totalTamanoEmpresa)
          }
        }
      }
    );

    // Zona Geográfica de Trabajo (barras horizontales, mayor valor primero)
    const totalZonaGeografica = zonaGeograficaDist.reduce((s, [, c]) => s + c, 0);
    Charts.createHorizontalBarChart('chart-zona-geografica',
      zonaGeograficaDist.map(([label]) => label),
      [{
        label: 'Egresados',
        data: zonaGeograficaDist.map(([, count]) => count),
        backgroundColor: '#07C8CC',
        borderColor: '#07C8CC',
        borderWidth: 1,
        borderRadius: 3
      }],
      {
        xAxisFormat: (v) => v.toLocaleString(),
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = zonaGeograficaDist.reduce((s, [, c]) => s + c, 0);
                const pct = total > 0 ? Math.round((context.parsed.x / total) * 100) : 0;
                return ` ${context.parsed.x.toLocaleString()} egresados (${pct}%)`;
              }
            }
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, totalZonaGeografica)
          }
        }
      }
    );

    // Nivel del Cargo Actual (barras horizontales, orden jerárquico fijo — no por frecuencia)
    const totalNivelCargo = nivelCargoDist.reduce((s, [, c]) => s + c, 0);
    Charts.createHorizontalBarChart('chart-nivel-cargo',
      nivelCargoDist.map(([label]) => label),
      [{
        label: 'Egresados',
        data: nivelCargoDist.map(([, count]) => count),
        backgroundColor: '#07C8CC',
        borderColor: '#07C8CC',
        borderWidth: 1,
        borderRadius: 3
      }],
      {
        xAxisFormat: (v) => v.toLocaleString(),
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = nivelCargoDist.reduce((s, [, c]) => s + c, 0);
                return ` ${context.parsed.x.toLocaleString()} egresados (${Charts.formatPercent(context.parsed.x, total)})`;
              }
            }
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => Charts.formatPercent(v, totalNivelCargo)
          }
        }
      }
    );

    // Top 10 Empleadores (ranking por cantidad, no por %: barras horizontales, mayor valor primero)
    Charts.createHorizontalBarChart('chart-top-empleadores',
      topEmpleadores.map(e => e.empresa),
      [{
        label: 'Egresados',
        data: topEmpleadores.map(e => e.cantidad),
        backgroundColor: '#07C8CC',
        borderColor: '#07C8CC',
        borderWidth: 1,
        borderRadius: 3
      }],
      {
        xAxisFormat: (v) => v.toLocaleString(),
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.parsed.x.toLocaleString()} egresados`
            }
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => v.toLocaleString()
          }
        }
      }
    );

    // Top 10 Puestos Actuales (ranking por cantidad, no por %: barras horizontales, mayor valor primero)
    Charts.createHorizontalBarChart('chart-cargo-actual',
      cargoActualDist.map(([label]) => label),
      [{
        label: 'Egresados',
        data: cargoActualDist.map(([, count]) => count),
        backgroundColor: '#07C8CC',
        borderColor: '#07C8CC',
        borderWidth: 1,
        borderRadius: 3
      }],
      {
        xAxisFormat: (v) => v.toLocaleString(),
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.parsed.x.toLocaleString()} egresados`
            }
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => v.toLocaleString()
          }
        }
      }
    );

    // === PRÁCTICAS PREPROFESIONALES (Egresados NID: Negocios, Ingeniería, Derecho) ===
    const dataEncuestas = data || (DataLoader?.getEncuestas ? DataLoader.getEncuestas() : []);
    const getPracticasNIDData = () => {
      return (dataEncuestas || []).filter(d => DataLoader && DataLoader.isNID ? DataLoader.isNID(d[Calculations?.cols?.carrera]) : false);
    };

    const getAnioEgreso = (row) => {
      const val = row['Año de Egreso'] || row['Año de egreso:'] || row['anioEgreso'] || row[Calculations?.cols?.anioEgreso] || '';
      const match = String(val).match(/\d{4}/);
      return match ? match[0] : '';
    };

    const normalizarTiempoPrimerEmpleo = (raw) => {
      const str = String(raw || '').trim().replace(/\.$/, '');
      if (!str) return null;
      if (str === '12 meses a más') return 'Más de 12 meses';
      return str;
    };

    // 1. Dona: ¿Realizó Prácticas Preprofesionales?
    const renderPracticasDonut = () => {
      const canvasId = 'chart-ocupacion-practicas-nid';
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;
      const existing = Chart.getChart(ctx);
      if (existing) existing.destroy();

      const nid = getPracticasNIDData();
      const practicasField = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'practicasNID');
      const counts = {};
      nid.forEach(d => {
        const v = practicasField ? practicasField.getValue(d) : null;
        if (v === 'Sí' || v === 'No') counts[v] = (counts[v] || 0) + 1;
      });

      const labels = ['Sí', 'No'].filter(k => counts[k]);
      const total = labels.reduce((s, k) => s + counts[k], 0) || 1;
      const values = labels.map(k => Math.round((counts[k] / total) * 100));
      const rawCounts = labels.map(k => counts[k]);
      const colors = Charts.getRankedColors(values);

      const centerPct = values.length > 0 ? values[0] : '0';
      const centerLabel = labels.length > 0 ? labels[0] : '';
      const donutCenterPlugin = {
        id: 'ocupacionPracticasDonutCenter',
        beforeDraw(chart) {
          const { width, height, ctx } = chart;
          ctx.save();
          ctx.font = '800 20px Inter, sans-serif';
          ctx.fillStyle = '#0a1b44';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${centerPct}%`, width / 2, height / 2 - 8);
          ctx.font = '400 10px Inter, sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText(centerLabel, width / 2, height / 2 + 10);
          ctx.restore();
        }
      };

      const legendContainer = document.getElementById('ocupacion-practicas-nid-legend');
      if (legendContainer) {
        legendContainer.innerHTML = labels.map((l, i) => `
          <div class="exec-legend-row">
            <div class="exec-legend-left">
              <span class="exec-legend-dot" style="background-color: ${colors[i]};"></span>
              <span class="exec-legend-label" title="${l}">${l}</span>
            </div>
            <span class="exec-legend-val">${values[i]}% <span style="color:#94a3b8;font-weight:400;">(${rawCounts[i].toLocaleString()})</span></span>
          </div>
        `).join('');
      }

      new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, rawCounts, backgroundColor: colors, borderWidth: 2, borderColor: '#ffffff' }] },
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
                  return ` ${item.label}: ${item.raw}% (${count.toLocaleString()} egresados NID)`;
                }
              }
            }
          }
        },
        plugins: [donutCenterPlugin]
      });
    };

    // 2. Condición Laboral según Prácticas Preprofesionales
    let practicasCondicionSelectedCohort = 'all';
    let practicasCondicionSelectedFacultad = 'all';

    const renderPracticasCondicion = () => {
      const canvasId = 'chart-ocupacion-practicas-condicion-laboral';
      if (!document.getElementById(canvasId)) return;

      const nidTodos = getPracticasNIDData();
      const nidCohorte = practicasCondicionSelectedCohort === 'all'
        ? nidTodos
        : nidTodos.filter(d => getAnioEgreso(d) === practicasCondicionSelectedCohort);
      const nid = practicasCondicionSelectedFacultad === 'all'
        ? nidCohorte
        : nidCohorte.filter(d => window.DataLoader?.getFacultadForCarrera && window.DataLoader.getFacultadForCarrera(d[Calculations?.cols?.carrera]) === practicasCondicionSelectedFacultad);

      const practicasField = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'practicasNID');
      const condicionField = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'condicion');
      const ORDEN_CONDICION = ['Dependiente', 'Independiente', 'Propietario / Emprendimiento'];

      const porPracticas = {};
      const totalesCondicion = {};
      nid.forEach(d => {
        const practicas = practicasField ? practicasField.getValue(d) : null;
        if (practicas !== 'Sí' && practicas !== 'No') return;
        const condicion = condicionField ? condicionField.getValue(d) : null;
        if (!ORDEN_CONDICION.includes(condicion)) return;

        if (!porPracticas[practicas]) porPracticas[practicas] = { total: 0 };
        porPracticas[practicas][condicion] = (porPracticas[practicas][condicion] || 0) + 1;
        porPracticas[practicas].total++;
        totalesCondicion[condicion] = (totalesCondicion[condicion] || 0) + 1;
      });

      const filas = ['Sí', 'No'].filter(k => porPracticas[k]);
      const filasLabel = filas.map(k => k === 'Sí' ? 'Sí hizo prácticas' : 'No hizo prácticas');
      const categorias = ORDEN_CONDICION.filter(c => totalesCondicion[c]);
      const paleta = ['#07C8CC', '#63b3ed', '#DCB17C'];

      const datasets = categorias.map((condicion, i) => ({
        label: condicion,
        data: filas.map(f => {
          const total = porPracticas[f].total;
          const count = porPracticas[f][condicion] || 0;
          return total > 0 ? Math.round((count / total) * 100) : 0;
        }),
        rawCounts: filas.map(f => porPracticas[f][condicion] || 0),
        backgroundColor: paleta[i % paleta.length]
      }));

      const note = document.getElementById('ocupacion-practicas-condicion-note');
      if (note) {
        if (filas.length < 2) {
          const sufijoAnio = practicasCondicionSelectedCohort !== 'all' ? ` para el año de egreso ${practicasCondicionSelectedCohort}` : '';
          const sufijoFacultad = practicasCondicionSelectedFacultad !== 'all' ? ` en ${practicasCondicionSelectedFacultad}` : '';
          note.innerHTML = `* Muestra insuficiente${sufijoAnio}${sufijoFacultad} para comparar ambos grupos.`;
          note.style.display = 'block';
        } else {
          note.style.display = 'none';
        }
      }

      Charts.createStackedBarChart(canvasId, filasLabel, datasets, {
        scales: { y: { display: false }, x: { maxRotation: 0, minRotation: 0 } },
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
              return num >= 6 ? `${Math.round(num)}%` : '';
            }
          }
        }
      });
    };

    // 3. Nivel de Cargo Actual según Prácticas Preprofesionales
    let practicasCargoSelectedCohort = 'all';

    const renderPracticasCargo = () => {
      const canvasId = 'chart-ocupacion-practicas-nivel-cargo';
      if (!document.getElementById(canvasId)) return;

      const nidTodos = getPracticasNIDData();
      const nid = practicasCargoSelectedCohort === 'all'
        ? nidTodos
        : nidTodos.filter(d => getAnioEgreso(d) === practicasCargoSelectedCohort);

      const practicasField = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'practicasNID');
      const cargoField = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'nivelCargo');
      const NO_APLICA = new Set(['No aplica / No precisa', 'No especifica']);

      const porPracticas = {};
      const totalesCargo = {};
      nid.forEach(d => {
        const practicas = practicasField ? practicasField.getValue(d) : null;
        if (practicas !== 'Sí' && practicas !== 'No') return;
        const cargo = cargoField ? cargoField.getValue(d) : 'No aplica / No precisa';
        if (NO_APLICA.has(cargo)) return;

        if (!porPracticas[practicas]) porPracticas[practicas] = { total: 0 };
        porPracticas[practicas][cargo] = (porPracticas[practicas][cargo] || 0) + 1;
        porPracticas[practicas].total++;
        totalesCargo[cargo] = (totalesCargo[cargo] || 0) + 1;
      });

      const filas = ['Sí', 'No'].filter(k => porPracticas[k]);

      const note = document.getElementById('ocupacion-practicas-cargo-note');
      if (note) {
        if (filas.length < 2) {
          const sufijoAnio = practicasCargoSelectedCohort !== 'all' ? ` para el año de egreso ${practicasCargoSelectedCohort}` : '';
          note.innerHTML = `* Muestra insuficiente${sufijoAnio} para comparar ambos grupos.`;
          note.style.display = 'block';
        } else {
          note.innerHTML = '';
          note.style.display = 'none';
        }
      }
      const filasLabel = filas.map(k => k === 'Sí' ? 'Sí hizo prácticas' : 'No hizo prácticas');

      const ORDEN_CARGO = [
        'Trainee / Prácticas', 'Experiencia Inicial', 'Junior', 'Semi Senior', 'Senior',
        'Jefe / Supervisor / Coordinador', 'Dirección / Gerencia', 'CEO / Fundador', 'Serums'
      ];
      const categorias = ORDEN_CARGO.filter(c => totalesCargo[c]);
      const paleta = ['#284E4E', '#368BA1', '#07C8CC', '#63b3ed', '#94A3B8', '#DCB17C', '#F08568', '#C96590', '#D1D5DB'];

      const datasets = categorias.map((cat, i) => ({
        label: cat,
        data: filas.map(f => {
          const total = porPracticas[f].total;
          const count = porPracticas[f][cat] || 0;
          return total > 0 ? Math.round((count / total) * 100) : 0;
        }),
        rawCounts: filas.map(f => porPracticas[f][cat] || 0),
        backgroundColor: paleta[i % paleta.length]
      }));

      Charts.createHorizontalStackedBarChart(canvasId, filasLabel, datasets, {
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
              return num >= 6 ? `${Math.round(num)}%` : '';
            }
          }
        }
      });
    };

    // 4. Nivel de Empleabilidad según Prácticas Preprofesionales (Tiempo de inserción)
    let practicasEmpleabilidadSelectedCohort = 'all';

    const renderPracticasEmpleabilidad = () => {
      const canvasId = 'chart-ocupacion-practicas-empleabilidad';
      if (!document.getElementById(canvasId)) return;

      const nidTodos = getPracticasNIDData();
      const nid = practicasEmpleabilidadSelectedCohort === 'all'
        ? nidTodos
        : nidTodos.filter(d => getAnioEgreso(d) === practicasEmpleabilidadSelectedCohort);

      const practicasField = window.PivotEngine && PivotEngine.fields.find(f => f.id === 'practicasNID');
      const ORDEN_TIEMPO = ['Ya me encontraba trabajando al egresar', 'De 1 a 3 meses', 'De 3 a 6 meses', 'De 6 a 12 meses', 'Más de 12 meses'];

      const porPracticas = {};
      const totalesTiempo = {};
      nid.forEach(d => {
        const practicas = practicasField ? practicasField.getValue(d) : null;
        if (practicas !== 'Sí' && practicas !== 'No') return;
        const tiempo = normalizarTiempoPrimerEmpleo(d[Calculations?.cols?.tiempoPrimerEmpleo]);
        if (!tiempo || !ORDEN_TIEMPO.includes(tiempo)) return;

        if (!porPracticas[practicas]) porPracticas[practicas] = { total: 0 };
        porPracticas[practicas][tiempo] = (porPracticas[practicas][tiempo] || 0) + 1;
        porPracticas[practicas].total++;
        totalesTiempo[tiempo] = (totalesTiempo[tiempo] || 0) + 1;
      });

      const filas = ['Sí', 'No'].filter(k => porPracticas[k]);
      const filasLabel = filas.map(k => k === 'Sí' ? 'Sí hizo prácticas' : 'No hizo prácticas');
      const categorias = ORDEN_TIEMPO.filter(c => totalesTiempo[c]);
      const paleta = ['#88E788', '#07C8CC', '#63b3ed', '#DCB17C', '#94A3B8'];

      const datasets = categorias.map((tiempo, i) => ({
        label: tiempo,
        data: filas.map(f => {
          const total = porPracticas[f].total;
          const count = porPracticas[f][tiempo] || 0;
          return total > 0 ? Math.round((count / total) * 100) : 0;
        }),
        rawCounts: filas.map(f => porPracticas[f][tiempo] || 0),
        backgroundColor: paleta[i % paleta.length]
      }));

      const note = document.getElementById('ocupacion-practicas-empleabilidad-note');
      if (note) {
        if (filas.length < 2) {
          const sufijoAnio = practicasEmpleabilidadSelectedCohort !== 'all' ? ` para el año de egreso ${practicasEmpleabilidadSelectedCohort}` : '';
          note.innerHTML = `* Muestra insuficiente${sufijoAnio} para comparar ambos grupos.`;
          note.style.display = 'block';
        } else {
          note.innerHTML = '';
          note.style.display = 'none';
        }
      }

      Charts.createStackedBarChart(canvasId, filasLabel, datasets, {
        scales: { y: { display: false }, x: { maxRotation: 0, minRotation: 0 } },
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
            color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
            formatter: (v) => {
              const num = typeof v === 'number' ? v : Number(v) || 0;
              return num >= 6 ? `${Math.round(num)}%` : '';
            }
          }
        }
      });
    };

    const setupPracticasControls = () => {
      const condCohortPills = document.querySelectorAll('#ocupacion-practicas-condicion-cohort-pills .exec-pill-btn');
      condCohortPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const cohort = pill.dataset.cohort;
          if (!cohort || cohort === practicasCondicionSelectedCohort) return;
          practicasCondicionSelectedCohort = cohort;
          condCohortPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          renderPracticasCondicion();
        });
      });

      const condFacultadPills = document.querySelectorAll('#ocupacion-practicas-condicion-facultad-pills .exec-pill-btn');
      condFacultadPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const facultad = pill.dataset.facultad;
          if (!facultad || facultad === practicasCondicionSelectedFacultad) return;
          practicasCondicionSelectedFacultad = facultad;
          condFacultadPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          renderPracticasCondicion();
        });
      });

      const cargoCohortPills = document.querySelectorAll('#ocupacion-practicas-cargo-cohort-pills .exec-pill-btn');
      cargoCohortPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const cohort = pill.dataset.cohort;
          if (!cohort || cohort === practicasCargoSelectedCohort) return;
          practicasCargoSelectedCohort = cohort;
          cargoCohortPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          renderPracticasCargo();
        });
      });

      const empCohortPills = document.querySelectorAll('#ocupacion-practicas-empleabilidad-cohort-pills .exec-pill-btn');
      empCohortPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const cohort = pill.dataset.cohort;
          if (!cohort || cohort === practicasEmpleabilidadSelectedCohort) return;
          practicasEmpleabilidadSelectedCohort = cohort;
          empCohortPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          renderPracticasEmpleabilidad();
        });
      });
    };

    renderPracticasDonut();
    renderPracticasCondicion();
    renderPracticasCargo();
    renderPracticasEmpleabilidad();
    setupPracticasControls();

    if (window.Editor) {
      window.Editor.renderCustomVisuals('ocupacion');
    }
  });
}
