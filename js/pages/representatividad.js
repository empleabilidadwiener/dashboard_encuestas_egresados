// js/pages/representatividad.js
// Página: Ficha Técnica y Representatividad de la Muestra

export async function loadRepresentatividadPage(container, data, filters) {
  const universo = DataLoader.getFilteredUniverso(filters);
  const totalResp = data.length;
  const totalUniv = universo.length;

  const norm = (s) => (s || '').replace(/_x0000_/g, '').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

  const porCarrera = {};
  const univPorCarrera = {};

  universo.forEach(u => {
    const c = norm(u.nombre_carrera);
    univPorCarrera[c] = (univPorCarrera[c] || 0) + 1;
    if (!porCarrera[c]) porCarrera[c] = 0;
  });
  data.forEach(d => {
    const carrera = norm(d['CARRERA']);
    porCarrera[carrera] = (porCarrera[carrera] || 0) + 1;
  });

  // Excluir Administración y Marketing (carrera descontinuada / no representativa)
  const carrerasOrdenadas = Object.keys(porCarrera)
    .filter(c => !c.toUpperCase().includes('MARKETING'))
    .sort((a, b) => {
      const uA = univPorCarrera[a] || 0;
      const uB = univPorCarrera[b] || 0;
      if (uB !== uA) return uB - uA;
      return a.localeCompare(b);
    });

  const dataMetaCarreras = carrerasOrdenadas.map(c => Calculations.getMetaMuestral(c, univPorCarrera[c] || 0));
  const dataContactadosCarreras = carrerasOrdenadas.map(c => porCarrera[c] || 0);

  // Datos y orden oficial para la sección PEA vs NO PEA
  const trazabilidad = Calculations.getTrazabilidadPEAPorCarrera(data);
  const tot = trazabilidad.totales;

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
    'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN': 'Tecnología Médica en Terapia Física',
    'DERECHO Y CIENCIA POLÍTICA': 'Derecho y Ciencia Política',
    'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA': 'Tecnología Médica en Lab. Clínico',
    'PSICOLOGÍA': 'Psicología',
    'CONTABILIDAD Y AUDITORÍA': 'Contabilidad y Auditoría',
    'ADMINISTRACIÓN Y DIRECCIÓN DE EMPRESAS': 'Administración y Dirección de Empresas',
    'OBSTETRICIA': 'Obstetricia',
    'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES': 'Administración y Negocios Internacionales',
    'INGENIERÍA DE SISTEMAS E INFORMÁTICA': 'Ingeniería de Sistemas e Informática',
    'NUTRICIÓN Y DIETÉTICA': 'Nutrición y Dietética',
    'MEDICINA HUMANA': 'Medicina Humana',
    'INGENIERÍA INDUSTRIAL Y DE GESTIÓN EMPRESARIAL': 'Ingeniería Industrial',
    'ADMINISTRACIÓN EN TURISMO Y HOTELERÍA': 'Administración en Turismo y Hotelería'
  };

  const normKey = (str) => (str || '').replace(/_x0000_/g, '').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
  const ordenMap = new Map(ordenOficial.map((name, idx) => [name, idx]));

  const carrerasPEAOrdenadas = [...trazabilidad.carreras]
    .filter(c => !c.carrera.toUpperCase().includes('MARKETING'))
    .sort((a, b) => {
      const kA = normKey(a.carrera);
      const kB = normKey(b.carrera);
      const idxA = ordenMap.has(kA) ? ordenMap.get(kA) : 999;
      const idxB = ordenMap.has(kB) ? ordenMap.get(kB) : 999;
      if (idxA !== idxB) return idxA - idxB;
      return a.carrera.localeCompare(b.carrera);
    });

  const labelsGrafico = carrerasOrdenadas.map(c => nombresFormateados[normKey(c)] || (window.toTitleCase ? window.toTitleCase(c) : c));

  container.innerHTML = `
    <div class="exec-dashboard-wrap">
      
      <!-- ENCABEZADO INSTITUCIONAL HOMOLOGADO -->
      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution" data-editable-id="rep-institution" data-editable-label="Institución">Universidad Norbert Wiener</span>
          <span class="exec-date" data-editable-id="rep-top-date" data-editable-label="Módulo y Fecha">Ficha Técnica & Metodología de Investigación</span>
        </div>
        <h1 class="exec-header-title" data-editable-id="rep-header-title" data-editable-label="Título Principal">Ficha Técnica y Representatividad</h1>
        <div class="exec-header-subtitle" data-editable-id="rep-header-subtitle" data-editable-label="Subtítulo">Marco metodológico, objetivos del estudio, representatividad muestral y población laboral por programa académico</div>
      </div>

      <!-- PANEL METODOLÓGICO: OBJETIVOS, ENTIDAD EJECUTORA E INSTRUMENTO -->
      <div class="exec-panel" style="margin-bottom: 24px; padding: 22px 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #0a1b44; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-file-contract text-primary" style="font-size: 18px;"></i>
              <span data-editable-id="rep-panel-metodologico-title" data-editable-label="Panel Metodológico: Título">Especificaciones Metodológicas y Objetivos del Estudio</span>
            </div>
            <div style="font-size: 13px; color: #64748b; margin-top: 2px;" data-editable-id="rep-panel-metodologico-subtitle" data-editable-label="Panel Metodológico: Subtítulo">
              Parámetros técnicos de investigación, objetivos institucionales y ficha de levantamiento muestral
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="docs/instrumento_encuesta2026.md" target="_blank" class="btn btn-sm btn-outline-primary" style="font-weight: 600; border-radius: 8px; border-color: #07C8CC; color: #0a1b44; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
              <i class="fas fa-external-link-alt" style="color: #07C8CC;"></i>Abrir Instrumento (.md)
            </a>
            <button id="btn-modal-instrumento" class="btn btn-sm btn-primary" style="background: #07C8CC; border-color: #07C8CC; color: #0a1b44; font-weight: 700; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
              <i class="fas fa-clipboard-list"></i>Ver Cuestionario Completo
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
          <!-- COLUMNA 1: OBJETIVOS DEL ESTUDIO -->
          <div>
            <!-- Objetivo General -->
            <div style="margin-bottom: 16px;">
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #07C8CC; letter-spacing: 0.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-bullseye"></i> <span data-editable-id="rep-obj-general-title" data-editable-label="Objetivo General: Título">Objetivo General</span>
              </div>
              <p style="font-size: 13px; color: #1e293b; line-height: 1.6; margin: 0; background: #f8fafc; padding: 12px 14px; border-radius: 8px; border-left: 3px solid #07C8CC;" data-editable-id="rep-obj-general-desc" data-editable-label="Objetivo General: Descripción">
                Evaluar la situación laboral, nivel de empleabilidad, pertinencia profesional y condiciones socioeconómicas de los egresados de pregrado de la Universidad Norbert Wiener (cohortes 2019 a 2025), generando evidencia técnica rigurosa para la retroalimentación curricular, la gestión de acreditaciones internacionales (ACBSP, SINEACE) y la mejora continua de los servicios de la Dirección de Desarrollo Profesional y Alumni.
              </p>
            </div>

            <!-- Objetivos Específicos -->
            <div>
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #368BA1; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-tasks"></i> <span data-editable-id="rep-obj-especificos-title" data-editable-label="Objetivos Específicos: Título">Objetivos Específicos</span>
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155; line-height: 1.6;">
                <li style="margin-bottom: 6px;"><strong>Medición de la Tasa de Empleabilidad:</strong> Determinar la proporción de egresados insertos en el mercado activo (PEA Ocupada) y analizar los motivos de inactividad o búsqueda de empleo.</li>
                <li style="margin-bottom: 6px;"><strong>Pertinencia Académico-Laboral:</strong> Evaluar la correspondencia entre la formación universitaria recibida y las tareas/exigencias desempeñadas en el puesto de trabajo.</li>
                <li style="margin-bottom: 6px;"><strong>Condiciones Laborales e Ingresos:</strong> Caracterizar las modalidades de contratación, niveles de remuneración mensual, tiempos de inserción laboral y movilidad/ascenso profesional.</li>
                <li style="margin-bottom: 6px;"><strong>Satisfacción y Recomendación Institucional:</strong> Medir la satisfacción general con la preparación universitaria y cuantificar el Net Promoter Score (NPS) institucional.</li>
                <li><strong>Demanda de Formación y Red Alumni:</strong> Identificar el interés en posgrados, especializaciones y actividades de vinculación permanente con la comunidad de egresados.</li>
              </ul>
            </div>
          </div>

          <!-- COLUMNA 2: DETALLES DE EJECUCIÓN TÉCNICA -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0a1b44; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-info-circle text-primary"></i> <span data-editable-id="rep-ficha-title" data-editable-label="Ficha Metodológica: Título">Ficha de Ejecución Metodológica</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                  <span style="color: #64748b; font-weight: 600;"><i class="fas fa-building" style="margin-right: 6px; color: #07C8CC;"></i><span data-editable-id="rep-ficha-entidad-label" data-editable-label="Ficha: Etiqueta Entidad">Entidad / Consultora:</span></span>
                  <span style="font-weight: 700; color: #0a1b44; text-align: right;" data-editable-id="rep-ficha-entidad" data-editable-label="Ficha: Entidad Ejecutora">ICCPN BPO Consultora</span>
                </div>

                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                  <span style="color: #64748b; font-weight: 600;"><i class="fas fa-calendar-alt" style="margin-right: 6px; color: #07C8CC;"></i><span data-editable-id="rep-ficha-fecha-campo-label" data-editable-label="Ficha: Etiqueta Fecha Campo">Fecha Estimada de Campo:</span></span>
                  <span style="font-weight: 700; color: #0a1b44; text-align: right;" data-editable-id="rep-ficha-fecha-campo" data-editable-label="Ficha: Fecha Estimada de Campo">Agosto – Octubre 2026</span>
                </div>

                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                  <span style="color: #64748b; font-weight: 600;"><i class="fas fa-users" style="margin-right: 6px; color: #07C8CC;"></i><span data-editable-id="rep-ficha-poblacion-label" data-editable-label="Ficha: Etiqueta Población">Población Objetivo:</span></span>
                  <span style="font-weight: 700; color: #0a1b44; text-align: right;" data-editable-id="rep-ficha-poblacion" data-editable-label="Ficha: Población Objetivo">Egresados de Pregrado (2019 – 2025)</span>
                </div>

                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                  <span style="color: #64748b; font-weight: 600;"><i class="fas fa-phone-volume" style="margin-right: 6px; color: #07C8CC;"></i><span data-editable-id="rep-ficha-tecnica-label" data-editable-label="Ficha: Etiqueta Técnica">Técnica de Recolección:</span></span>
                  <span style="font-weight: 700; color: #0a1b44; text-align: right;" data-editable-id="rep-ficha-tecnica" data-editable-label="Ficha: Técnica de Recolección">Telefónica (CATI) y Formulario Web</span>
                </div>

                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                  <span style="color: #64748b; font-weight: 600;"><i class="fas fa-calculator" style="margin-right: 6px; color: #07C8CC;"></i><span data-editable-id="rep-ficha-confianza-label" data-editable-label="Ficha: Etiqueta Confianza">Nivel de Confianza:</span></span>
                  <span style="font-weight: 700; color: #0a1b44; text-align: right;" data-editable-id="rep-ficha-confianza" data-editable-label="Ficha: Nivel de Confianza">95% (Z = 1.96, p = q = 0.50)</span>
                </div>

                <div style="display: flex; justify-content: space-between; padding-bottom: 2px;">
                  <span style="color: #64748b; font-weight: 600;"><i class="fas fa-file-alt" style="margin-right: 6px; color: #07C8CC;"></i><span data-editable-id="rep-ficha-instrumento-label" data-editable-label="Ficha: Etiqueta Instrumento">Instrumento Aplicado:</span></span>
                  <span style="font-weight: 700; color: #07C8CC; text-align: right;" data-editable-id="rep-ficha-instrumento" data-editable-label="Ficha: Instrumento Aplicado">Cuestionario Oficial (26 reactivos)</span>
                </div>
              </div>
            </div>

            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; color: #64748b;">Estructura y saltos condicionales del estudio:</span>
              <button id="btn-ver-estructura" class="btn btn-sm btn-outline-primary" style="font-size: 11px; font-weight: 700; border-radius: 6px; border-color: #07C8CC; color: #0a1b44;">
                <i class="fas fa-eye" style="margin-right: 4px; color: #07C8CC;"></i>Ver Módulos
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 KPIS EJECUTIVOS DE COBERTURA -->
      <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title" data-editable-id="rep-kpi-1-title" data-editable-label="KPI Cobertura 1: Título">Muestra Lograda (n)</div>
          <div class="exec-kpi-number">${totalResp.toLocaleString()}</div>
          <div class="exec-kpi-desc" data-editable-id="rep-kpi-1-desc" data-editable-label="KPI Cobertura 1: Descripción">Encuestas efectivas recolectadas</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title" data-editable-id="rep-kpi-2-title" data-editable-label="KPI Cobertura 2: Título">Universo Total (N)</div>
          <div class="exec-kpi-number" style="color: #0a1b44;">${totalUniv.toLocaleString()}</div>
          <div class="exec-kpi-desc" data-editable-id="rep-kpi-2-desc" data-editable-label="KPI Cobertura 2: Descripción">Egresados graduados (2019 - 2025)</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title" data-editable-id="rep-kpi-3-title" data-editable-label="KPI Cobertura 3: Título">Meta Muestral Teórica</div>
          <div class="exec-kpi-number text-primary" style="color: #07C8CC;">${tot.totalMetaMuestral.toLocaleString()}</div>
          <div class="exec-kpi-desc" data-editable-id="rep-kpi-3-desc" data-editable-label="KPI Cobertura 3: Descripción">Calculada (±5%, Confianza 95%)</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title" data-editable-id="rep-kpi-4-title" data-editable-label="KPI Cobertura 4: Título">Avance de Cobertura</div>
          <div class="exec-kpi-number" style="color: #0a1b44;">${Math.round(tot.avanceMetaGlobal)}%</div>
          <div class="exec-kpi-desc" data-editable-id="rep-kpi-4-desc" data-editable-label="KPI Cobertura 4: Descripción">Superávit muestral institucional</div>
        </div>
      </div>

      <!-- TABLA 1: MUESTRA VS UNIVERSO -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-table" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Tabla Comparativa: Muestra vs. Universo por Programa Académico</span>
      </div>
      <p class="exec-section-desc">Evaluación de representatividad estadística y margen de error por carrera</p>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px; padding: 0; overflow: hidden;">
        <div class="table-container" style="overflow-x: auto; padding: 0 20px 20px 20px;">
          <table class="data-table" id="tabla-representatividad" style="width: 100%;">
            <thead>
              <tr>
                <th class="text-left">Programa Académico *</th>
                <th class="text-center">Universo (N)</th>
                <th class="text-center">Meta (n)</th>
                <th class="text-center">Respuestas</th>
                <th class="text-center">Cumplimiento</th>
                <th class="text-center">Margen de Error **</th>
              </tr>
            </thead>
            <tbody>
              ${_generarTablaRepresentatividad(data, universo)}
            </tbody>
          </table>
        </div>
        <div style="padding: 10px 20px; font-size: 11px; color: #64748b; background: #f8fafc; border-top: 1px solid #f1f5f9;">
          * Ordenado según volumen del universo de egresados. ** Nivel de confianza del 95% (Z = 1.96, p = q = 0.5).
        </div>
      </div>

      <!-- GRÁFICO: META VS CONTACTADOS -->
      <div class="exec-section-header" style="margin-top: 32px; margin-bottom: 4px;">
        <i class="fas fa-chart-bar" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Comparativo de Muestra Objetivo vs. Contactados por Carrera</span>
      </div>
      <p class="exec-section-desc">Muestra objetivo (Meta calculada) frente al número real de egresados contactados</p>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 600px;">
          <canvas id="chart-muestra-vs-contactados"></canvas>
        </div>
      </div>

      <!-- SECCIÓN: DISTRIBUCIÓN POBLACIONAL PEA VS NO PEA -->
      <div class="exec-section-header" style="margin-top: 32px; margin-bottom: 4px;">
        <i class="fas fa-users-between-lines" style="color: #07C8CC; margin-right: 8px;"></i>
        <span data-editable-id="rep-sec-poblacion-title" data-editable-label="Sección Población: Título">Población Laboral (Mercado Activo vs. Inactivos)</span>
      </div>
      <p class="exec-section-desc" data-editable-id="rep-sec-poblacion-desc" data-editable-label="Sección Población: Descripción">Distribución de egresados activos (empleabilidad) frente a inactivos por programa académico</p>

      <!-- 3 KPIS DE POBLACIÓN LABORAL -->
      <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 20px; margin-top: 12px;">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title" data-editable-id="rep-kpi-pob-1-title" data-editable-label="KPI Población 1: Título">Total Contactados</div>
          <div class="exec-kpi-number">${tot.totalMuestra.toLocaleString()}</div>
          <div class="exec-kpi-desc" data-editable-id="rep-kpi-pob-1-desc" data-editable-label="KPI Población 1: Descripción">Total encuestas recolectadas</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title" data-editable-id="rep-kpi-pob-2-title" data-editable-label="KPI Población 2: Título">Mercado Activo (Empleabilidad)</div>
          <div class="exec-kpi-number text-primary" style="color: #07C8CC;">${tot.totalPEA.toLocaleString()}</div>
          <div class="exec-kpi-desc" data-editable-id="rep-kpi-pob-2-desc" data-editable-label="KPI Población 2: Descripción">${tot.totalMuestra > 0 ? Math.round((tot.totalPEA / tot.totalMuestra) * 100) : 0}% de la muestra total</div>
        </div>
        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title" data-editable-id="rep-kpi-pob-3-title" data-editable-label="KPI Población 3: Título">Población Inactiva</div>
          <div class="exec-kpi-number" style="color: #64748b;">${tot.totalNoPEA.toLocaleString()}</div>
          <div class="exec-kpi-desc" data-editable-id="rep-kpi-pob-3-desc" data-editable-label="KPI Población 3: Descripción">${Math.round(tot.tasaNoPEATotal)}% no busca empleo actualmente</div>
        </div>
      </div>

      <!-- TABLA PEA VS NO PEA -->
      <div class="exec-panel" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
        <div class="table-container" style="overflow-x: auto; padding: 0 20px 20px 20px;">
          <table class="data-table" id="tabla-pea-no-pea" style="width: 100%;">
            <thead>
              <tr>
                <th rowspan="2" class="text-center align-middle" style="width: 50px;">#</th>
                <th rowspan="2" class="align-middle">Programa Académico</th>
                <th colspan="2" class="text-center border-bottom border-gray-300" style="color: #07C8CC;">Mercado Activo (Empleabilidad)</th>
                <th colspan="2" class="text-center border-bottom border-gray-300" style="color: #64748b;">Inactivos</th>
              </tr>
              <tr>
                <th class="text-center">Número</th>
                <th class="text-center">Porcentaje</th>
                <th class="text-center">Número</th>
                <th class="text-center">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${carrerasPEAOrdenadas.map((c, index) => {
                const totalCarrera = c.pea + c.noPea;
                const pctPEA = totalCarrera > 0 ? Math.round((c.pea / totalCarrera) * 100) : 0;
                const pctNoPEA = totalCarrera > 0 ? (100 - pctPEA) : 0;
                const key = normKey(c.carrera);
                const nombre = nombresFormateados[key] || (window.toTitleCase ? window.toTitleCase(c.carrera) : c.carrera);

                return `
                  <tr>
                    <td class="text-center font-bold text-muted">${index + 1}</td>
                    <td style="font-weight: 600; color: #0a1b44;">${nombre}</td>
                    <td class="text-center font-bold">${c.pea.toLocaleString()}</td>
                    <td class="text-center font-bold" style="color: #07C8CC;">${pctPEA}%</td>
                    <td class="text-center text-muted font-bold">${c.noPea.toLocaleString()}</td>
                    <td class="text-center text-muted">${pctNoPEA}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc; font-weight: 700; border-top: 2px solid #e2e8f0;">
                <td colspan="2" style="padding: 10px 14px; font-weight: 700; color: #0a1b44;">Total general</td>
                <td class="text-center font-bold" style="padding: 10px 14px;">${tot.totalPEA.toLocaleString()}</td>
                <td class="text-center font-bold" style="padding: 10px 14px; color: #07C8CC;">${(tot.totalPEA + tot.totalNoPEA) > 0 ? Math.round((tot.totalPEA / (tot.totalPEA + tot.totalNoPEA)) * 100) : 0}%</td>
                <td class="text-center text-muted font-bold" style="padding: 10px 14px;">${tot.totalNoPEA.toLocaleString()}</td>
                <td class="text-center text-muted" style="padding: 10px 14px;">${(tot.totalPEA + tot.totalNoPEA) > 0 ? Math.round((tot.totalNoPEA / (tot.totalPEA + tot.totalNoPEA)) * 100) : 0}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- NOTAS AL PIE -->
      <div class="exec-footer-notes">
        <i class="fas fa-info-circle text-primary" style="margin-right: 6px;"></i>
        <strong>Ficha Técnica Institucional:</strong> Encuesta realizada a egresados de la Universidad Norbert Wiener (Cohortes 2019–2025). Parámetros estadísticos: Nivel de confianza del 95% (Z = 1.96), varianza máxima p = q = 0.5.
      </div>
    </div>
  `;

  // Event Listeners del Modal Global del Instrumento Oficial
  const abrirModal = () => {
    if (typeof window.abrirModalInstrumento === 'function') {
      window.abrirModalInstrumento();
    }
  };

  document.getElementById('btn-modal-instrumento')?.addEventListener('click', abrirModal);
  document.getElementById('btn-ver-estructura')?.addEventListener('click', abrirModal);

  Charts.waitForReady().then(() => {
    Charts.createHorizontalBarChart('chart-muestra-vs-contactados',
      labelsGrafico,
      [
        { 
          label: 'Muestra Objetivo (Meta)', 
          data: dataMetaCarreras, 
          backgroundColor: '#368BA1', 
          borderColor: '#368BA1', 
          borderWidth: 1, 
          borderRadius: 3 
        },
        { 
          label: 'Contactados', 
          data: dataContactadosCarreras, 
          backgroundColor: '#07C8CC', 
          borderColor: '#07C8CC', 
          borderWidth: 1, 
          borderRadius: 3 
        }
      ],
      {
        layout: {
          padding: { right: 36, left: 10, top: 10, bottom: 10 }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
            formatter: (v) => v.toLocaleString()
          }
        },
        xAxisFormat: (v) => v.toLocaleString()
      }
    );
  });
}

function _generarTablaRepresentatividad(encuestas, universo) {
  const norm = (s) => (s || '').replace(/_x0000_/g, '').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

  const carrerasUniv = {};
  universo.forEach(u => { const c = norm(u.nombre_carrera); carrerasUniv[c] = (carrerasUniv[c] || 0) + 1; });
  const carrerasEnc = {};
  encuestas.forEach(e => { const c = norm(e['CARRERA']); carrerasEnc[c] = (carrerasEnc[c] || 0) + 1; });

  let allCarreras = [...new Set([...Object.keys(carrerasUniv), ...Object.keys(carrerasEnc)])];
  // Excluir carrera descontinuada / no representativa
  allCarreras = allCarreras.filter(c => !c.toUpperCase().includes('MARKETING'));

  allCarreras.sort((a, b) => {
    const uA = carrerasUniv[a] || 0; const uB = carrerasUniv[b] || 0;
    if (uB !== uA) return uB - uA;
    return a.localeCompare(b);
  });

  const nombresFormateados = {
    'FARMACIA Y BIOQUÍMICA': 'Farmacia y Bioquímica',
    'ENFERMERÍA': 'Enfermería',
    'ODONTOLOGÍA': 'Odontología',
    'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN': 'Tecnología Médica en Terapia Física',
    'DERECHO Y CIENCIA POLÍTICA': 'Derecho y Ciencia Política',
    'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA': 'Tecnología Médica en Lab. Clínico',
    'PSICOLOGÍA': 'Psicología',
    'CONTABILIDAD Y AUDITORÍA': 'Contabilidad y Auditoría',
    'ADMINISTRACIÓN Y DIRECCIÓN DE EMPRESAS': 'Administración y Dirección de Empresas',
    'OBSTETRICIA': 'Obstetricia',
    'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES': 'Administración y Negocios Internacionales',
    'INGENIERÍA DE SISTEMAS E INFORMÁTICA': 'Ingeniería de Sistemas e Informática',
    'NUTRICIÓN Y DIETÉTICA': 'Nutrición y Dietética',
    'MEDICINA HUMANA': 'Medicina Humana',
    'INGENIERÍA INDUSTRIAL Y DE GESTIÓN EMPRESARIAL': 'Ingeniería Industrial',
    'ADMINISTRACIÓN EN TURISMO Y HOTELERÍA': 'Administración en Turismo y Hotelería'
  };

  const rows = allCarreras.map(carrera => {
    const univ = carrerasUniv[carrera] || 0;
    const meta = Calculations.getMetaMuestral(carrera, univ);
    const enc = carrerasEnc[carrera] || 0;
    const cumplimiento = meta > 0 ? Math.round((enc / meta) * 100) : 100;
    const meRaw = enc > 0 ? (univ > enc ? Calculations.margenErrorFinito(enc, univ, 0.5) : Calculations.margenError(0.5, enc)) : null;
    const meVal = meRaw !== null ? Math.round(meRaw * 100) : null;
    const nombre = nombresFormateados[carrera] || (window.toTitleCase ? window.toTitleCase(carrera) : carrera);

    let meBadge = '-';
    if (meVal !== null) {
      if (meVal <= 5) meBadge = `<span class="badge badge-semaforo-verde" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 11px;">±${meVal}%</span>`;
      else if (meVal <= 8) meBadge = `<span class="badge badge-semaforo-amarillo" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 11px;">±${meVal}%</span>`;
      else meBadge = `<span class="badge badge-semaforo-rojo" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 11px;">±${meVal}%</span>`;
    }

    const cumpClass = cumplimiento >= 100 ? 'font-bold' : (cumplimiento >= 80 ? 'text-dark font-bold' : 'text-warning font-bold');
    const cumpStyle = cumplimiento >= 100 ? 'color: #07C8CC;' : '';

    return `<tr><td style="font-weight: 600; color: #0a1b44;">${nombre}</td><td class="text-center font-bold text-muted">${univ.toLocaleString()}</td><td class="text-center font-bold">${meta.toLocaleString()}</td><td class="text-center font-bold" style="color: #07C8CC;">${enc.toLocaleString()}</td><td class="text-center ${cumpClass}" style="${cumpStyle}">${cumplimiento}%</td><td class="text-center">${meBadge}</td></tr>`;
  });

  const totalUniv = Object.values(carrerasUniv).reduce((a, b) => a + b, 0);
  const totalMeta = allCarreras.reduce((acc, c) => acc + Calculations.getMetaMuestral(c, carrerasUniv[c] || 0), 0);
  const totalEnc = Object.values(carrerasEnc).reduce((a, b) => a + b, 0);
  const totalCumplimiento = totalMeta > 0 ? Math.round((totalEnc / totalMeta) * 100) : 0;
  const meTotal = totalEnc > 0 ? Math.round((totalUniv > totalEnc ? Calculations.margenErrorFinito(totalEnc, totalUniv, 0.5) : Calculations.margenError(0.5, totalEnc)) * 100) : '-';

  return rows.join('') + `<tr class="table-total font-bold" style="background: #f8fafc; border-top: 2px solid #e2e8f0;"><td class="text-right pl-3" style="font-weight: 700; color: #0a1b44;">TOTAL INSTITUCIONAL</td><td class="text-center font-bold text-muted">${totalUniv.toLocaleString()}</td><td class="text-center font-bold">${totalMeta.toLocaleString()}</td><td class="text-center font-bold" style="color: #07C8CC;">${totalEnc.toLocaleString()}</td><td class="text-center font-bold" style="color: #07C8CC;">${totalCumplimiento}%</td><td class="text-center"><span class="badge badge-semaforo-verde" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 11px;">±${meTotal}%</span></td></tr>`;
}
