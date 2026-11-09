// js/pages/evolutivo.js

export async function loadEvolutivoPage(container, data, dataActuales) {
  // data = cohorte 2026 (fuente principal), dataActuales = cohorte 2025 (CSV, carga lazy)
  const data2026 = data || [];
  const data2025 = dataActuales || [];

  // El dataset 2026 usa la columna 'Año de Egreso'; el dataset 2025 (mapeado por
  // mapNewSurveyColumns) conserva su formato histórico 'Año de egreso:'. Se prueban
  // ambas claves para no depender de a qué dataset pertenece cada fila.
  const getAnio = (d) => {
    const raw = d['Año de Egreso'] ?? d['Año de egreso:'];
    const match = String(raw ?? '').match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  };
  const matchAnio = (d, anio) => getAnio(d) === anio;

  // Universo de cada edición para el comparativo: Encuesta 2025 = egresados 2019–2024, Encuesta
  // 2026 = egresados 2019–2025 (rango indicado explícitamente para este comparativo). El CSV
  // 2025 trae además filas con año de egreso "2018" y filas sueltas con "2025" que quedan
  // fuera de este rango y se excluyen.
  const ANIOS_UNIVERSO_2025 = [2019, 2020, 2021, 2022, 2023, 2024];
  const ANIOS_UNIVERSO_2026 = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

  // oldData / newData = universo COMPLETO y válido de cada edición. Se usan para TODAS las
  // comparativas generales (KPIs, facultad, carrera, condición laboral, ascenso, personal a
  // cargo, tiempos, satisfacción, motivos de no trabajo): cada edición se compara con toda su
  // propia muestra, no solo con los años que calzan con la otra edición.
  const oldData = data2025.filter(d => ANIOS_UNIVERSO_2025.includes(getAnio(d)));
  const newData = data2026.filter(d => ANIOS_UNIVERSO_2026.includes(getAnio(d)));

  // añosComparables = intersección real de ambos universos oficiales. Se usa ÚNICAMENTE para el
  // comparativo "por cohorte" (mismo año de egreso medido en ambas ediciones), que sí requiere
  // que el año exista en las dos.
  const añosComparables = ANIOS_UNIVERSO_2025.filter(a => ANIOS_UNIVERSO_2026.includes(a)).sort((a, b) => a - b);

  const rangoUniversoLabel = 'Encuesta 2025: egresados 2019–2024 · Encuesta 2026: egresados 2019–2025';

  // Si no hay datos de la cohorte 2025 (ej. falla la carga lazy del CSV) o no hay años
  // en común entre ambas cohortes, mostrar advertencia.
  if (!data2025.length || !oldData.length || añosComparables.length === 0) {
    container.innerHTML = `
      <div class="exec-dashboard-wrap">
        <div class="exec-header">
          <div class="exec-top-bar">
            <span class="exec-institution">Universidad Norbert Wiener</span>
            <span class="exec-date">Comparativa Interanual</span>
          </div>
          <h1 class="exec-header-title">Análisis Evolutivo Interanual</h1>
          <div class="exec-header-subtitle">Comparación directa de cohortes egresadas 2025 vs 2026</div>
        </div>
        <div class="exec-panel" style="padding: 60px 20px; text-align: center; margin-top: 24px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 44px; color: #f59e0b; margin-bottom: 16px;"></i>
          <h3 style="color: #0a1b44; font-size: 18px; font-weight: 700; margin-bottom: 8px;">Faltan Datos de la Encuesta 2025</h3>
          <p style="color: #64748b; font-size: 14px;">No se pudo cargar <code>respuestas_encuestas_2025.csv</code>, o no hay cohortes de egreso en común con la encuesta 2026 para comparar.</p>
        </div>
      </div>
    `;
    return;
  }

  // Helper para calcular métricas
  const calcMetrics = (dataset) => {
    // Nivel de Empleabilidad = Ocupados / PEA, usando la MISMA clasificación que el resto del
    // dashboard (Calculations.classifyLaborStatus). Para el CSV 2026 esto lee directamente la
    // columna oficial "Nivel de Empleabilidad Final" / "Condición PEA" (metodología OIT/INEI);
    // para el CSV histórico 2025 (que no trae esas columnas) usa el mismo respaldo heurístico
    // que ya se usa en el resto del dashboard, en vez de una tercera lógica ad-hoc distinta.
    const total = dataset.length;
    const clasificados = dataset.map(d => Calculations.classifyLaborStatus(d));
    const ocupados = dataset.filter((d, i) => clasificados[i].esOcupado);
    const totalPEA = clasificados.filter(info => info.esPEA).length;
    const tasaOcupacion = totalPEA > 0 ? (ocupados.length / totalPEA) * 100 : 0;

    // Satisfacción laboral (satisfechos / total ocupados que respondieron)
    const satisfechos = ocupados.filter(d => {
      const val = d['5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)'];
      return val && (val.toLowerCase().includes('satisfecho') && !val.toLowerCase().includes('insatisfecho'));
    });
    const tasaSatisfaccion = ocupados.length > 0 ? (satisfechos.length / ocupados.length) * 100 : 0;

    // Ingresos altos (> S/ 3,000)
    const ingresosAltos = ocupados.filter(d => {
      const val = d['9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información con el fin, de en caso te encuentres interesado en recibir información de ofertas laborales podamos enviar en base al sueldo base que percibes actualmente)'];
      return val && (val.includes('3,001') || val.includes('5,001') || val.includes('8,001') || val.includes('Más de S/.5,000') || val.includes('Más de S/'));
    });
    const tasaIngresosAltos = ocupados.length > 0 ? (ingresosAltos.length / ocupados.length) * 100 : 0;

    // NPS proxy (Satisfacción Académica / Probabilidad recomendar)
    const promotores = dataset.filter(d => {
      const val = d['13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?'];
      if (!val) return false;
      const num = parseInt(val);
      if (!isNaN(num) && num >= 9) return true; // Classic NPS Promotor
      if (typeof val === 'string' && val.toLowerCase().includes('satisfecho') && !val.toLowerCase().includes('insatisfecho')) return true; // CSV Proxy
      return false;
    });
    const tasaPromotores = total > 0 ? (promotores.length / total) * 100 : 0;

    return {
      total, tasaOcupacion, tasaSatisfaccion, tasaIngresosAltos, tasaPromotores,
      ocupadosCount: ocupados.length, totalPEA,
      ingresosAltosCount: ingresosAltos.length
    };
  };

  const oldMetrics = calcMetrics(oldData);
  const newMetrics = calcMetrics(newData);

  const getDif = (newVal, oldVal) => Math.round(newVal - oldVal);
  const formatColor = (dif) => dif > 0 ? 'text-success' : (dif < 0 ? 'text-warning' : 'text-muted');
  const formatSign = (dif) => dif > 0 ? '+' : '';

  const rangoAnios = añosComparables.length > 1
    ? `${añosComparables[0]} – ${añosComparables[añosComparables.length - 1]}`
    : `${añosComparables[0]}`;

  // Cálculos por año para tabla y gráficos
  const cohortRows = añosComparables.map(anio => {
    const subsetOld = oldData.filter(d => matchAnio(d, anio));
    const subsetNew = newData.filter(d => matchAnio(d, anio));
    const mOld = calcMetrics(subsetOld);
    const mNew = calcMetrics(subsetNew);
    return { anio, mOld, mNew };
  });

  // --- Empleabilidad por Facultad y por Carrera ---
  // Se usa la misma función de facultad que el resto del dashboard (getFacultadForCarrera),
  // en vez de la columna cruda 'Facultad' de cada CSV: esa columna trae agrupaciones distintas
  // entre años (2025 junta "Negocios e Ingenierías" en un solo valor; 2026 las separa), así que
  // solo son comparables si se recalculan ambas cohortes con el mismo criterio de agrupación.
  const getCarreraRaw = (d) => (d['CARRERA'] ?? d['Programa Académico:'] ?? '').toString().trim();
  const getFacultad = (d) => DataLoader.getFacultadForCarrera(getCarreraRaw(d));
  const FACULTADES_ORDEN = ['Ciencias de la Salud', 'Negocios', 'Ingeniería', 'Derecho y Ciencia Política'];
  const facultadesComparables = FACULTADES_ORDEN.filter(f =>
    oldData.some(d => getFacultad(d) === f) && newData.some(d => getFacultad(d) === f)
  );
  const facultadRows = facultadesComparables.map(fac => ({
    facultad: fac,
    mOld: calcMetrics(oldData.filter(d => getFacultad(d) === fac)),
    mNew: calcMetrics(newData.filter(d => getFacultad(d) === fac))
  }));

  // Carrera: la clave de comparación (2025 usa 'Programa Académico:', 2026 usa 'CARRERA') y la
  // capitalización difieren entre años (ej. "Y" vs "y" en conectores), por eso se compara en
  // mayúsculas y solo se listan las carreras presentes en AMBOS años.
  const getCarreraKey = (d) => getCarreraRaw(d).toUpperCase();
  const carrerasEnOld = new Set(oldData.map(getCarreraKey).filter(Boolean));
  const carrerasEnNew = new Map();
  newData.forEach(d => { const k = getCarreraKey(d); if (k && !carrerasEnNew.has(k)) carrerasEnNew.set(k, getCarreraRaw(d)); });
  // Se excluyen carreras no vigentes (ej. "Administración y Marketing", descontinuada, con
  // muestras de 2 y 4 personas en 2026 y 2025 respectivamente) usando el mismo criterio que ya
  // usa el resto del dashboard (DataLoader.isCarreraVigente), en vez de un umbral ad-hoc.
  const carrerasComparables = [...carrerasEnNew.keys()]
    .filter(k => carrerasEnOld.has(k) && DataLoader.isCarreraVigente(carrerasEnNew.get(k)))
    .sort();
  const carreraRows = carrerasComparables.map(key => {
    const nombreCarrera = window.toTitleCase ? window.toTitleCase(carrerasEnNew.get(key)) : carrerasEnNew.get(key);
    return {
      carrera: nombreCarrera,
      // OJO: getFacultad(d) espera una FILA (extrae la carrera con getCarreraRaw(d) por dentro);
      // acá ya tenemos el nombre de carrera como string, así que se llama directo a
      // getFacultadForCarrera() — llamar a getFacultad() con un string devolvía siempre 'Otra'
      // (getCarreraRaw(string) no encuentra la propiedad 'CARRERA' en un string), lo que dejaba
      // el filtro de Facultad de este gráfico sin ninguna carrera que mostrar.
      facultad: DataLoader.getFacultadForCarrera(carrerasEnNew.get(key)),
      mOld: calcMetrics(oldData.filter(d => getCarreraKey(d) === key)),
      mNew: calcMetrics(newData.filter(d => getCarreraKey(d) === key))
    };
  }).sort((a, b) => b.mNew.tasaOcupacion - a.mNew.tasaOcupacion);

  // Facultades presentes entre las carreras comparables, para el botón-filtro del gráfico
  // "Empleabilidad por Carrera" (mismo criterio de orden que el resto del dashboard).
  const facultadesEnCarreraRows = FACULTADES_ORDEN.filter(f => carreraRows.some(r => r.facultad === f));

  // --- Condición Laboral (Dependiente / Independiente / Negocio propio) ---
  // Homologación de categorías: 2025 usa "Dependiente (planilla)" / "Independiente..." /
  // "Negocio propio(emprendimiento)..." / "Practicante profesional"; 2026 usa "Trabajador
  // dependiente..." / "Profesional independiente..." / "Propietario o socio de negocio...", sin
  // la opción "Practicante profesional" (en 2026 los practicantes quedan dentro de "Trabajador
  // dependiente", distinguidos en la subpregunta de modalidad de vinculación). Por decisión
  // metodológica se fusiona "Practicante profesional" (2025) dentro de "Dependiente" para que
  // ambos años compartan las mismas 3 categorías. El matching es por subcadena (igual que el
  // resto del dashboard en Calculations.getIndicadoresClave2026), robusto a la diferencia de
  // redacción exacta entre años.
  const CONDICION_BUCKETS = ['Dependiente', 'Independiente', 'Negocio Propio / Emprendimiento'];
  const bucketCondicion = (raw) => {
    const v = (raw || '').toLowerCase();
    if (!v.trim()) return null;
    if (v.includes('independiente')) return 'Independiente'; // OJO: "independiente" contiene "dependiente" como subcadena
    if (v.includes('practicante')) return 'Dependiente';
    if (v.includes('dependiente')) return 'Dependiente';
    if (v.includes('propietario') || v.includes('negocio') || v.includes('emprendimiento')) return 'Negocio Propio / Emprendimiento';
    return null;
  };
  const condicionDist = (dataset) => {
    const counts = {}; CONDICION_BUCKETS.forEach(b => counts[b] = 0);
    let total = 0;
    dataset.forEach(d => {
      const b = bucketCondicion(d[Calculations.cols.condicion]);
      if (b) { counts[b]++; total++; }
    });
    return CONDICION_BUCKETS.map(b => ({ bucket: b, pct: total > 0 ? (counts[b] / total) * 100 : 0, count: counts[b] }));
  };
  const condicionOld = condicionDist(oldData);
  const condicionNew = condicionDist(newData);

  // --- Ascenso Laboral (solo dependientes, igual que Calculations.getIndicadoresClave2026) ---
  const ascensoRate = (dataset) => {
    const validos = dataset
      .filter(d => bucketCondicion(d[Calculations.cols.condicion]) === 'Dependiente')
      .map(d => (d[Calculations.cols.ascenso] || '').trim().toLowerCase())
      .filter(v => v === 'sí' || v === 'si' || v === 'no'); // excluye "No especifica" (solo 2026) y vacíos
    const siCount = validos.filter(v => v === 'sí' || v === 'si').length;
    return { pct: validos.length > 0 ? (siCount / validos.length) * 100 : 0, siCount, total: validos.length };
  };
  const ascensoOld = ascensoRate(oldData);
  const ascensoNew = ascensoRate(newData);

  // --- Personal a Cargo (mismas categorías en ambos años) ---
  // Orden: primero las categorías positivas (de menor a mayor personal a cargo), "No tiene
  // personal a cargo" al final (a pedido explícito, para no empezar el gráfico con el "No").
  const PERSONAL_BUCKETS = [
    { key: 'Sí, menos de 10 personas.', label: 'Sí, menos de 10 personas' },
    { key: 'Sí, de 10 a 20 personas.', label: 'Sí, de 10 a 20 personas' },
    { key: 'Sí, más de 20 personas.', label: 'Sí, más de 20 personas' },
    { key: 'No.', label: 'No tiene personal a cargo' }
  ];
  const personalCargoDist = (dataset) => {
    const ocupados = dataset.filter(d => Calculations.classifyLaborStatus(d).esOcupado);
    const counts = {}; PERSONAL_BUCKETS.forEach(b => counts[b.key] = 0);
    let total = 0;
    ocupados.forEach(d => {
      const raw = (d[Calculations.cols.personalCargo] || '').trim();
      if (Object.prototype.hasOwnProperty.call(counts, raw)) { counts[raw]++; total++; }
    });
    return PERSONAL_BUCKETS.map(b => ({ bucket: b.label, pct: total > 0 ? (counts[b.key] / total) * 100 : 0, count: counts[b.key] }));
  };
  const personalOld = personalCargoDist(oldData);
  const personalNew = personalCargoDist(newData);

  // --- Motivos de No Trabajo ---
  // Se usa Calculations.cols.razonNoTrabaja, que para 2026 trae la pregunta cruda (5 opciones
  // fijas del instrumento) y para 2025 trae la columna ya categorizada "Motivo No Trabajo
  // (FINAL)" homologada por dataLoader.mapNewSurveyColumns(): ambas comparten las mismas
  // categorías sustantivas del instrumento (motivos personales/familiares, buscando empleo,
  // estudiando posgrado/otra carrera), a diferencia de las columnas "Categorizado (Final)" de
  // cada año, que usan taxonomías propias no comparables entre sí (ej. 2026 añade "Postulando
  // SERUMS" / "Fin de contrato", inexistentes en 2025). Por pedido explícito se quita "Iniciando
  // negocio propio" como categoría propia (muestra muy chica en ambos años) y se agrupa dentro
  // de "Otros".
  const RAZON_BUCKETS = ['Motivos personales / familiares', 'Buscando empleo', 'Estudiando (posgrado / otra carrera)', 'Otros'];
  const bucketRazonNoTrabaja = (raw) => {
    const v = (raw || '').toLowerCase();
    if (!v.trim()) return null;
    if (v.includes('buscando')) return 'Buscando empleo';
    if (v.includes('posgrado') || v.includes('otra carrera')) return 'Estudiando (posgrado / otra carrera)';
    if (v.includes('personal') || v.includes('familiar')) return 'Motivos personales / familiares';
    return 'Otros'; // incluye "Iniciando negocio propio" y cualquier otro motivo residual
  };
  const razonNoTrabajaDist = (dataset) => {
    const conRazon = dataset.map(d => bucketRazonNoTrabaja(d[Calculations.cols.razonNoTrabaja])).filter(Boolean);
    const total = conRazon.length;
    const counts = {}; RAZON_BUCKETS.forEach(b => counts[b] = 0);
    conRazon.forEach(b => counts[b]++);
    return RAZON_BUCKETS.map(b => ({ bucket: b, pct: total > 0 ? (counts[b] / total) * 100 : 0, count: counts[b] }));
  };
  const razonOld = razonNoTrabajaDist(oldData);
  const razonNew = razonNoTrabajaDist(newData);

  // --- Satisfacción Laboral (distribución completa, no solo % satisfechos) ---
  const SATISFACCION_ORDEN = ['Muy satisfecho', 'Satisfecho', 'Ni satisfecho ni insatisfecho', 'Insatisfecho', 'Muy insatisfecho'];
  const satisfaccionDist = (dataset) => {
    const ocupados = dataset.filter(d => Calculations.classifyLaborStatus(d).esOcupado);
    const counts = {}; SATISFACCION_ORDEN.forEach(s => counts[s] = 0);
    let total = 0;
    ocupados.forEach(d => {
      const raw = (d[Calculations.cols.satisfaccion] || '').trim();
      const found = SATISFACCION_ORDEN.find(s => s.toLowerCase() === raw.toLowerCase());
      if (found) { counts[found]++; total++; }
    });
    return SATISFACCION_ORDEN.map(s => ({ bucket: s, pct: total > 0 ? (counts[s] / total) * 100 : 0, count: counts[s] }));
  };
  const satisfaccionDistOld = satisfaccionDist(oldData);
  const satisfaccionDistNew = satisfaccionDist(newData);

  // --- Tiempo en el Cargo Actual (solo dependientes, igual que Ascenso) ---
  // La columna 2025 no pasó por mapNewSurveyColumns (no está en el renameMap: su nombre 2025 no
  // trae el sufijo "(No se pregunta a emprendedores/ni independientes)" que sí tiene 2026), por
  // eso se lee con fallback a la clave cruda 2025. Las categorías son las mismas en ambos años,
  // salvo que 2025 no lleva punto final ("De 1 a 2 años" vs. "De 1 a 2 años.") y 2026 agrega
  // "No especifica"; se normaliza quitando el punto final y se excluye "No especifica" de la base.
  const COL_TIEMPO_CARGO_2025 = '4. ¿Cuánto tiempo estas desempeñándote en el cargo actual?';
  const getTiempoCargoActual = (d) => d[Calculations.cols.tiempoCargoActual] ?? d[COL_TIEMPO_CARGO_2025];
  const normalizeTiempo = (raw) => (raw || '').toString().trim().replace(/\.$/, '');
  const TIEMPO_CARGO_ORDEN = ['Menos de 1 año', 'De 1 a 2 años', 'De 2 a 5 años', 'De 5 a 10 años', '10 años a más'];
  const bucketTiempoCargo = (raw) => {
    const v = normalizeTiempo(raw);
    if (!v || v.toLowerCase() === 'no especifica') return null;
    return TIEMPO_CARGO_ORDEN.find(o => o.toLowerCase() === v.toLowerCase()) || null;
  };
  const tiempoCargoDist = (dataset) => {
    const dependientes = dataset.filter(d => bucketCondicion(d[Calculations.cols.condicion]) === 'Dependiente');
    const counts = {}; TIEMPO_CARGO_ORDEN.forEach(t => counts[t] = 0);
    let total = 0;
    dependientes.forEach(d => {
      const b = bucketTiempoCargo(getTiempoCargoActual(d));
      if (b) { counts[b]++; total++; }
    });
    return TIEMPO_CARGO_ORDEN.map(t => ({ bucket: t, pct: total > 0 ? (counts[t] / total) * 100 : 0, count: counts[t] }));
  };
  const tiempoCargoOld = tiempoCargoDist(oldData);
  const tiempoCargoNew = tiempoCargoDist(newData);

  // --- Tiempo para Conseguir el Primer Empleo (sobre todos los ocupados) ---
  // Calculations.cols.tiempoPrimerEmpleo ya viene homologado por mapNewSurveyColumns (2025 sí
  // está en el renameMap), así que se lee igual para ambos años. Igual que arriba, se normaliza
  // el punto final y se excluye "No especifica" (solo 2026) de la base.
  const TIEMPO_PRIMER_EMPLEO_ORDEN = ['Ya me encontraba trabajando al egresar', 'De 1 a 3 meses', 'De 3 a 6 meses', 'De 6 a 12 meses', '12 meses a más'];
  const bucketTiempoPrimerEmpleo = (raw) => {
    const v = normalizeTiempo(raw);
    if (!v || v.toLowerCase() === 'no especifica') return null;
    return TIEMPO_PRIMER_EMPLEO_ORDEN.find(o => o.toLowerCase() === v.toLowerCase()) || null;
  };
  const tiempoPrimerEmpleoDist = (dataset) => {
    const ocupados = dataset.filter(d => Calculations.classifyLaborStatus(d).esOcupado);
    const counts = {}; TIEMPO_PRIMER_EMPLEO_ORDEN.forEach(t => counts[t] = 0);
    let total = 0;
    ocupados.forEach(d => {
      const b = bucketTiempoPrimerEmpleo(d[Calculations.cols.tiempoPrimerEmpleo]);
      if (b) { counts[b]++; total++; }
    });
    return TIEMPO_PRIMER_EMPLEO_ORDEN.map(t => ({ bucket: t, pct: total > 0 ? (counts[t] / total) * 100 : 0, count: counts[t] }));
  };
  const tiempoPrimerEmpleoOld = tiempoPrimerEmpleoDist(oldData);
  const tiempoPrimerEmpleoNew = tiempoPrimerEmpleoDist(newData);

  container.innerHTML = `
    <div class="exec-dashboard-wrap">
      
      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Comparativa Interanual</span>
        </div>
        <h1 class="exec-header-title">Análisis Evolutivo: Encuesta 2025 vs. Encuesta 2026</h1>
        <div class="exec-header-subtitle">${rangoUniversoLabel}</div>
      </div>

      <!-- KPIs Evolutivos (4 Tarjetas proporcionales) -->
      <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title" data-editable-id="evolutivo-kpi-empleabilidad-title" data-editable-label="KPI: Título Nivel de Empleabilidad">Nivel de Empleabilidad General</div>
          <div class="exec-kpi-number" data-editable-id="evolutivo-kpi-empleabilidad-number" data-editable-label="KPI: Nivel de Empleabilidad General">${(newMetrics.tasaOcupacion || 0).toFixed(1)}%</div>
          <div class="exec-kpi-desc" data-editable-id="evolutivo-kpi-empleabilidad-desc" data-editable-label="KPI: Descripción Nivel de Empleabilidad"><span style="font-weight: 700; color: #ffffff;">${formatSign(newMetrics.tasaOcupacion - oldMetrics.tasaOcupacion)}${getDif(newMetrics.tasaOcupacion, oldMetrics.tasaOcupacion)}%</span> vs 2025 (${Math.round(oldMetrics.tasaOcupacion)}%)</div>
        </div>

        <div class="exec-kpi-box kpi-tint-green">
          <div class="exec-kpi-title">Satisfacción Laboral</div>
          <div class="exec-kpi-number">${Math.round(newMetrics.tasaSatisfaccion)}%</div>
          <div class="exec-kpi-desc"><span style="font-weight: 700; color: #0a1b44;">${formatSign(newMetrics.tasaSatisfaccion - oldMetrics.tasaSatisfaccion)}${getDif(newMetrics.tasaSatisfaccion, oldMetrics.tasaSatisfaccion)}%</span> vs 2025 (${Math.round(oldMetrics.tasaSatisfaccion)}%)</div>
        </div>


      </div>

      <!-- NIVEL DE EMPLEABILIDAD POR FACULTAD Y CARRERA -->
      <div class="exec-section-header" style="margin-top: 4px; margin-bottom: 4px;">
        <i class="fas fa-university" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Nivel de Empleabilidad por Facultad</span>
      </div>
      <p class="exec-section-desc">Porcentaje de egresados ocupados sobre la PEA, agrupados por facultad. Cada edición sobre su universo completo (${rangoUniversoLabel})</p>

      <div class="exec-charts-bottom exec-charts-bottom-2col" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-chart-bar" style="color: #07C8CC; margin-right: 8px;"></i> Empleabilidad por Facultad</div>
          <div class="exec-chart-canvas-wrap" style="height: 300px;">
            <canvas id="chart-empleabilidad-facultad"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-user-tie" style="color: #07C8CC; margin-right: 8px;"></i> Condición Laboral</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Dependiente vs. independiente vs. negocio propio, sobre el total de la muestra</p>
          <div class="exec-chart-canvas-wrap" style="height: 260px;">
            <canvas id="chart-condicion-laboral"></canvas>
          </div>
        </div>
      </div>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 2px;">
          <div class="exec-panel-title" style="margin-bottom: 0;"><i class="fas fa-graduation-cap" style="color: #07C8CC; margin-right: 8px;"></i> Empleabilidad por Carrera</div>
          <div class="exec-subcontrol-bar" id="exec-evolutivo-carrera-facultad-selector-wrap">
            <span class="exec-subcontrol-label">Facultad:</span>
            <div class="exec-subcontrol-pills" id="exec-evolutivo-carrera-facultad-pills">
              <button type="button" class="exec-pill-btn active" data-facultad="all">Todas</button>
              ${facultadesEnCarreraRows.map(f => `<button type="button" class="exec-pill-btn" data-facultad="${f}">${f}</button>`).join('')}
            </div>
          </div>
        </div>
        <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Solo se muestran las carreras con egresados encuestados en ambas ediciones. Cada edición sobre su universo completo (${rangoUniversoLabel})</p>
        <div class="exec-chart-canvas-wrap" id="exec-evolutivo-carrera-canvas-wrap" style="height: ${Math.max(300, carreraRows.length * 42)}px;">
          <canvas id="chart-empleabilidad-carrera"></canvas>
        </div>
      </div>

      <!-- COMPARATIVA POR COHORTE (AÑO DE EGRESO) -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-users" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Comparativa por Cohorte (Año de Egreso)</span>
      </div>
      <p class="exec-section-desc">Egresados de cada año, medidos en la encuesta 2025 y de nuevo en la encuesta 2026</p>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel-title"><i class="fas fa-chart-bar" style="color: #07C8CC; margin-right: 8px;"></i> Evolución del Nivel de Empleabilidad</div>
        <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Porcentaje de egresados que trabajan por cohorte (${rangoAnios})</p>
        <div class="exec-chart-canvas-wrap" style="height: 300px;">
          <canvas id="chart-evolucion-ocupacion"></canvas>
        </div>
      </div>

      <!-- TABLA COMPARATIVA DETALLADA POR COHORTE -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-table" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Tabla Comparativa Detallada por Cohorte (${rangoAnios})</span>
      </div>
      <p class="exec-section-desc">Contraste directo de indicadores clave entre ambas ediciones de la encuesta</p>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="table-container" style="overflow-x: auto; padding: 6px 12px 12px 12px;">
          <table class="data-table" style="min-width: 620px; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th class="text-left" style="padding: 12px 24px; font-weight: 600;">Año Egreso</th>
                <th class="text-center" style="padding: 12px 24px; font-weight: 600;">Muestra (2025 / 2026)</th>
                <th class="text-center" style="padding: 12px 24px; font-weight: 600;">Empleabilidad 2025</th>
                <th class="text-center" style="padding: 12px 24px; font-weight: 600;">Empleabilidad 2026</th>
                <th class="text-center" style="padding: 12px 24px; font-weight: 600;">Variación</th>
              </tr>
            </thead>
            <tbody>
              ${cohortRows.map(row => {
                const difOcup = row.mNew.tasaOcupacion - row.mOld.tasaOcupacion;
                const isPositive = difOcup > 0;
                const varColor = isPositive ? '#166534' : (difOcup < 0 ? '#b45309' : '#64748b');
                const varBg = isPositive ? 'rgba(136, 231, 136, 0.2)' : (difOcup < 0 ? '#fef3c7' : '#f1f5f9');
                return `
                  <tr style="border-bottom: 1px solid #f1f5f9; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                    <td class="font-bold text-dark" style="padding: 12px 24px;">${row.anio}</td>
                    <td class="text-center text-muted" style="padding: 12px 24px;">${row.mOld.total.toLocaleString()} / <strong>${row.mNew.total.toLocaleString()}</strong></td>
                    <td class="text-center text-muted" style="padding: 12px 24px;">${Math.round(row.mOld.tasaOcupacion)}%</td>
                    <td class="text-center font-bold text-primary" style="padding: 12px 24px; color: #07C8CC; font-size: 1.05em;">${Math.round(row.mNew.tasaOcupacion)}%</td>
                    <td class="text-center" style="padding: 12px 24px;">
                      <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px; background: ${varBg}; color: ${varColor};">
                        ${formatSign(difOcup)}${Math.round(difOcup)}%
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- TRAYECTORIA Y LIDERAZGO LABORAL -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-arrow-trend-up" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Trayectoria y Liderazgo Laboral</span>
      </div>
      <p class="exec-section-desc">Ascensos, personal a cargo y tiempos de trayectoria laboral, comparado entre ediciones</p>

      <div class="exec-charts-bottom exec-charts-bottom-2col" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-arrow-trend-up" style="color: #10B981; margin-right: 8px;"></i> Ascenso en los Últimos 5 Años</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Porcentaje de egresados dependientes que recibieron un ascenso</p>
          <div class="exec-chart-canvas-wrap" style="height: 220px;">
            <canvas id="chart-ascenso"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-users" style="color: #7B1FA2; margin-right: 8px;"></i> Personal a Cargo</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Distribución de egresados ocupados según personal a cargo</p>
          <div class="exec-chart-canvas-wrap" style="height: 260px;">
            <canvas id="chart-personal-cargo"></canvas>
          </div>
        </div>
      </div>

      <div class="exec-charts-bottom exec-charts-bottom-2col" style="margin-bottom: 24px; margin-top: 0;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-hourglass-half" style="color: #F97316; margin-right: 8px;"></i> Tiempo en el Cargo Actual</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Egresados dependientes, según antigüedad en su cargo actual</p>
          <div class="exec-chart-canvas-wrap" style="height: 260px;">
            <canvas id="chart-tiempo-cargo"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-clock" style="color: #F97316; margin-right: 8px;"></i> Tiempo para Conseguir el Primer Empleo</div>
          <p class="exec-section-desc" style="margin: 0 20px 10px 20px;">Todos los egresados ocupados, según tiempo hasta su primer empleo</p>
          <div class="exec-chart-canvas-wrap" style="height: 260px;">
            <canvas id="chart-tiempo-primer-empleo"></canvas>
          </div>
        </div>
      </div>

      <!-- SATISFACCIÓN Y SITUACIÓN DE QUIENES NO TRABAJAN -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-smile" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Satisfacción Laboral y Motivos de No Trabajo</span>
      </div>
      <p class="exec-section-desc">Distribución completa de satisfacción entre ocupados, y principales motivos de quienes no trabajan</p>

      <div class="exec-charts-bottom exec-charts-bottom-2col" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-smile" style="color: #F59E0B; margin-right: 8px;"></i> Satisfacción Laboral</div>
          <div class="exec-chart-canvas-wrap" style="height: 280px;">
            <canvas id="chart-satisfaccion-dist"></canvas>
          </div>
        </div>

        <div class="exec-panel">
          <div class="exec-panel-title"><i class="fas fa-question-circle" style="color: #F08568; margin-right: 8px;"></i> Motivos de No Trabajo</div>
          <div class="exec-chart-canvas-wrap" style="height: 280px;">
            <canvas id="chart-motivos-no-trabaja"></canvas>
          </div>
        </div>
      </div>

      <!-- Pie Metodológico -->
      <div class="exec-footer-notes">
        <p><strong>Universo de cada edición:</strong> Todas las comparativas de esta página (KPIs, facultad, carrera, condición laboral, ascenso, personal a cargo, tiempos, satisfacción, motivos de no trabajo) usan como universo de la Encuesta 2025 a los egresados 2019–2024, y de la Encuesta 2026 a los egresados 2019–2025. Se excluyen del CSV 2025 las filas con año de egreso 2018 y las filas sueltas con año de egreso "2025" (fuera de este rango). Cada edición se compara con su propia muestra completa dentro de ese rango, no con una intersección recortada.</p>
        <p><strong>Comparativa por Cohorte (Año de Egreso):</strong> Es la única sección que se restringe a la intersección real de años de egreso presentes en ambos universos oficiales (${rangoAnios}), ya que requiere que el mismo año de egreso haya sido medido en las dos ediciones.</p>
        <p><strong>Población:</strong> Las tasas calculadas representan la proporción de egresados ocupados, satisfechos y con sueldos superiores sobre la muestra correspondiente en cada caso.</p>
        <p><strong>Facultad y Carrera:</strong> La facultad se recalcula con el mismo criterio que el resto del dashboard (por carrera), no con la columna cruda de cada CSV, ya que 2025 agrupa "Negocios e Ingenierías" en un solo valor mientras 2026 las separa. Solo se muestran carreras con egresados encuestados en ambas ediciones.</p>
        <p><strong>Condición Laboral:</strong> La encuesta 2025 incluía la categoría "Practicante profesional" (sin equivalente propio en 2026, donde queda dentro de "Trabajador dependiente"). Para esta comparación se fusiona con "Dependiente" en ambos años.</p>
        <p><strong>Ascenso Laboral:</strong> Se calcula solo sobre egresados dependientes, igual que el resto del dashboard. Se excluyen respuestas "No especifica" (categoría agregada en 2026).</p>
        <p><strong>Tiempo en el Cargo Actual:</strong> Se calcula solo sobre egresados dependientes (la pregunta no se hace a independientes ni emprendedores). Se excluyen respuestas "No especifica" (categoría agregada en 2026).</p>
        <p><strong>Tiempo para Conseguir el Primer Empleo:</strong> Se calcula sobre todos los egresados ocupados (dependientes, independientes y negocio propio). Se excluyen respuestas "No especifica" (categoría agregada en 2026).</p>
        <p><strong>Motivos de No Trabajo:</strong> Se agrupan en las categorías sustantivas comunes al instrumento de ambos años (motivos personales/familiares, búsqueda activa, estudios de posgrado/otra carrera), no en las columnas "Categorizado (Final)" de cada año, cuyas taxonomías internas difieren entre ediciones. "Iniciando negocio propio" se agrupa dentro de "Otros" por su muestra reducida en ambos años.</p>
        <p><strong>Indicador NPS / Satisfacción Acad.:</strong> No es directamente comparable entre ediciones. La encuesta 2026 usa la escala NPS real (0–10, promotor = 9–10). La encuesta 2025 no incluía esa pregunta y se aproxima a partir de la satisfacción académica declarada, por lo que suele arrojar un porcentaje más alto. La variación mostrada refleja ese cambio de metodología, no necesariamente una caída real en la recomendación institucional.</p>
      </div>

    </div>
  `;

  Charts.waitForReady().then(() => {
    // Datalabels: muestra siempre el % sobre/junto a cada barra (misma convención visual que
    // el resto del dashboard, ver Charts.datalabelsPlugin).
    const pctDatalabels = {
      display: true,
      color: '#0a1b44',
      font: { family: "'Inter', sans-serif", size: 10.5, weight: '700' },
      formatter: (v) => `${Math.round(v)}%`
    };

    // Procesar datos para gráficos por año
    const labels = añosComparables.map(a => a.toString());
    const dataOcupacionOld = cohortRows.map(r => r.mOld.tasaOcupacion);
    const dataOcupacionNew = cohortRows.map(r => r.mNew.tasaOcupacion);

    const ocupacionTooltip = {
      callbacks: {
        label: (item) => {
          const m = item.datasetIndex === 0 ? cohortRows[item.dataIndex].mOld : cohortRows[item.dataIndex].mNew;
          return ` ${item.dataset.label}: ${Math.round(item.raw)}% (${m.ocupadosCount.toLocaleString()} de ${m.totalPEA.toLocaleString()} egresados)`;
        }
      }
    };

    Charts.createBarChart('chart-evolucion-ocupacion',
      labels,
      [
        { label: 'Encuesta 2025', data: dataOcupacionOld, backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: dataOcupacionNew, backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      { yAxisFormat: (v) => Math.round(v) + '%', plugins: { tooltip: ocupacionTooltip, datalabels: pctDatalabels } }
    );

    // Tooltip genérico para gráficos horizontales de distribución (2025 vs 2026), que muestra
    // el % junto al conteo real detrás de cada barra (misma convención que ocupacionTooltip).
    const makeDistTooltip = (rowsOld, rowsNew) => ({
      callbacks: {
        label: (item) => {
          const row = item.datasetIndex === 0 ? rowsOld[item.dataIndex] : rowsNew[item.dataIndex];
          return ` ${item.dataset.label}: ${Math.round(item.raw)}% (${row.count.toLocaleString()} respuestas)`;
        }
      }
    });

    // --- Empleabilidad por Facultad ---
    Charts.createHorizontalBarChart('chart-empleabilidad-facultad',
      facultadRows.map(r => r.facultad),
      [
        { label: 'Encuesta 2025', data: facultadRows.map(r => r.mOld.tasaOcupacion), backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: facultadRows.map(r => r.mNew.tasaOcupacion), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      {
        xAxisFormat: (v) => Math.round(v) + '%',
        scales: { x: { min: 0, max: 100 } },
        plugins: {
          tooltip: { callbacks: { label: (item) => {
            const r = facultadRows[item.dataIndex];
            const m = item.datasetIndex === 0 ? r.mOld : r.mNew;
            return ` ${item.dataset.label}: ${Math.round(item.raw)}% (${m.ocupadosCount.toLocaleString()} de ${m.totalPEA.toLocaleString()} egresados)`;
          } } },
          datalabels: pctDatalabels
        }
      }
    );

    // --- Empleabilidad por Carrera (filtrable por facultad con los botones del panel) ---
    const renderEmpleabilidadCarrera = (facultadFiltro) => {
      const rows = facultadFiltro === 'all' ? carreraRows : carreraRows.filter(r => r.facultad === facultadFiltro);

      const wrap = document.getElementById('exec-evolutivo-carrera-canvas-wrap');
      if (wrap) wrap.style.height = `${Math.max(300, rows.length * 42)}px`;

      Charts.createHorizontalBarChart('chart-empleabilidad-carrera',
        rows.map(r => r.carrera),
        [
          { label: 'Encuesta 2025', data: rows.map(r => r.mOld.tasaOcupacion), backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
          { label: 'Encuesta 2026', data: rows.map(r => r.mNew.tasaOcupacion), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
        ],
        {
          xAxisFormat: (v) => Math.round(v) + '%',
          scales: { x: { min: 0, max: 100 } },
          plugins: {
            tooltip: { callbacks: { label: (item) => {
              const r = rows[item.dataIndex];
              const m = item.datasetIndex === 0 ? r.mOld : r.mNew;
              return ` ${item.dataset.label}: ${Math.round(item.raw)}% (${m.ocupadosCount.toLocaleString()} de ${m.totalPEA.toLocaleString()} egresados)`;
            } } },
            datalabels: pctDatalabels
          }
        }
      );
    };
    renderEmpleabilidadCarrera('all');

    const carreraFacultadPillsWrap = document.getElementById('exec-evolutivo-carrera-facultad-pills');
    if (carreraFacultadPillsWrap) {
      const carreraFacultadPills = carreraFacultadPillsWrap.querySelectorAll('.exec-pill-btn');
      carreraFacultadPills.forEach(pill => {
        pill.addEventListener('click', () => {
          if (pill.classList.contains('active')) return;
          carreraFacultadPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          renderEmpleabilidadCarrera(pill.dataset.facultad);
        });
      });
    }

    // --- Condición Laboral ---
    Charts.createHorizontalBarChart('chart-condicion-laboral',
      CONDICION_BUCKETS,
      [
        { label: 'Encuesta 2025', data: condicionOld.map(r => r.pct), backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: condicionNew.map(r => r.pct), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      { xAxisFormat: (v) => Math.round(v) + '%', plugins: { tooltip: makeDistTooltip(condicionOld, condicionNew), datalabels: pctDatalabels } }
    );

    // --- Ascenso Laboral ---
    Charts.createHorizontalBarChart('chart-ascenso',
      ['Recibió ascenso (dependientes)'],
      [
        { label: 'Encuesta 2025', data: [ascensoOld.pct], backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: [ascensoNew.pct], backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      {
        xAxisFormat: (v) => Math.round(v) + '%',
        plugins: {
          tooltip: { callbacks: { label: (item) => {
            const r = item.datasetIndex === 0 ? ascensoOld : ascensoNew;
            return ` ${item.dataset.label}: ${Math.round(item.raw)}% (${r.siCount.toLocaleString()} de ${r.total.toLocaleString()} dependientes)`;
          } } },
          datalabels: pctDatalabels
        }
      }
    );

    // --- Personal a Cargo ---
    Charts.createHorizontalBarChart('chart-personal-cargo',
      personalOld.map(r => r.bucket),
      [
        { label: 'Encuesta 2025', data: personalOld.map(r => r.pct), backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: personalNew.map(r => r.pct), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      { xAxisFormat: (v) => Math.round(v) + '%', plugins: { tooltip: makeDistTooltip(personalOld, personalNew), datalabels: pctDatalabels } }
    );

    // --- Tiempo en el Cargo Actual ---
    Charts.createHorizontalBarChart('chart-tiempo-cargo',
      tiempoCargoOld.map(r => r.bucket),
      [
        { label: 'Encuesta 2025', data: tiempoCargoOld.map(r => r.pct), backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: tiempoCargoNew.map(r => r.pct), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      { xAxisFormat: (v) => Math.round(v) + '%', plugins: { tooltip: makeDistTooltip(tiempoCargoOld, tiempoCargoNew), datalabels: pctDatalabels } }
    );

    // --- Tiempo para Conseguir el Primer Empleo ---
    Charts.createHorizontalBarChart('chart-tiempo-primer-empleo',
      tiempoPrimerEmpleoOld.map(r => r.bucket),
      [
        { label: 'Encuesta 2025', data: tiempoPrimerEmpleoOld.map(r => r.pct), backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: tiempoPrimerEmpleoNew.map(r => r.pct), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      { xAxisFormat: (v) => Math.round(v) + '%', plugins: { tooltip: makeDistTooltip(tiempoPrimerEmpleoOld, tiempoPrimerEmpleoNew), datalabels: pctDatalabels } }
    );

    // --- Satisfacción Laboral (distribución, gráfico de columnas de Muy satisfecho a Muy insatisfecho) ---
    Charts.createBarChart('chart-satisfaccion-dist',
      satisfaccionDistOld.map(r => r.bucket),
      [
        { label: 'Encuesta 2025', data: satisfaccionDistOld.map(r => r.pct), backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: satisfaccionDistNew.map(r => r.pct), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      { yAxisFormat: (v) => Math.round(v) + '%', plugins: { tooltip: makeDistTooltip(satisfaccionDistOld, satisfaccionDistNew), datalabels: pctDatalabels } }
    );

    // --- Motivos de No Trabajo ---
    Charts.createHorizontalBarChart('chart-motivos-no-trabaja',
      razonOld.map(r => r.bucket),
      [
        { label: 'Encuesta 2025', data: razonOld.map(r => r.pct), backgroundColor: '#368BA1', borderColor: '#368BA1', borderWidth: 1, borderRadius: 3 },
        { label: 'Encuesta 2026', data: razonNew.map(r => r.pct), backgroundColor: '#07C8CC', borderColor: '#07C8CC', borderWidth: 1, borderRadius: 3 }
      ],
      { xAxisFormat: (v) => Math.round(v) + '%', plugins: { tooltip: makeDistTooltip(razonOld, razonNew), datalabels: pctDatalabels } }
    );
  });
}
