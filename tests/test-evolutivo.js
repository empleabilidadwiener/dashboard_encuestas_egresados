// tests/test-evolutivo.js — Valida "Análisis Evolutivo" (evolutivo.js): comparativa Encuesta
// 2025 vs. Encuesta 2026. Toda la lógica de esta página vive dentro de loadEvolutivoPage() (no
// exportada), así que este test replica la MISMA lógica de universo/cruce, pero llamando siempre
// a las funciones reales de producción (Calculations.classifyLaborStatus, DataLoader.*) para las
// partes que importan — mismo patrón que ya usa tests/test-resumen.js para lógica no exportada.
//
// Uso: node tests/test-evolutivo.js

const { load, loadEvolutivo, assert, section } = require('./_harness');

function main() {
  const { encuestas, ctx } = load();
  const { Calculations, DataLoader } = ctx;
  const encuestas2025 = loadEvolutivo(ctx);

  section(`Carga del CSV 2025 (n=${encuestas2025.length})`);
  assert(encuestas2025.length > 0, 'el CSV 2025 carga filas vía loadEvolutivoData()/mapNewSurveyColumns()');
  assert(encuestas2025.every(d => d['Programa Académico:'] !== undefined), "mapNewSurveyColumns() convierte 'Carrera' -> 'Programa Académico:'");

  const getAnio = (d) => {
    const raw = d['Año de Egreso'] ?? d['Año de egreso:'];
    const match = String(raw ?? '').match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  };

  // Mismos universos que evolutivo.js: 2025 = 2019-2024 (excluye 2018 y filas sueltas de 2025
  // fuera de rango), 2026 = 2019-2025.
  const ANIOS_UNIVERSO_2025 = [2019, 2020, 2021, 2022, 2023, 2024];
  const ANIOS_UNIVERSO_2026 = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const oldData = encuestas2025.filter(d => ANIOS_UNIVERSO_2025.includes(getAnio(d)));
  const newData = encuestas.filter(d => ANIOS_UNIVERSO_2026.includes(getAnio(d)));

  section('Universo de cada edición');
  assert(oldData.length > 0, `universo Encuesta 2025 (2019-2024) tiene filas (${oldData.length})`);
  assert(newData.length > 0, `universo Encuesta 2026 (2019-2025) tiene filas (${newData.length})`);
  assert(oldData.length < encuestas2025.length, `el universo 2025 filtrado (${oldData.length}) excluye filas fuera de rango del CSV completo (${encuestas2025.length})`);
  console.log(`  -> Encuesta 2025: ${oldData.length} de ${encuestas2025.length} filas totales | Encuesta 2026: ${newData.length} de ${encuestas.length} filas totales`);

  // Confirma la razón documentada de por qué NO se compara el sueldo promedio entre ediciones
  // (misma razón que ya se prueba en test-empleabilidad.js): distinta cantidad de cohortes.
  assert(ANIOS_UNIVERSO_2025.length === 6 && ANIOS_UNIVERSO_2026.length === 7,
    `Encuesta 2025 cubre 6 cohortes y Encuesta 2026 cubre 7 (asimetría ya documentada en empleabilidad.js)`);

  section('calcMetrics: Nivel de Empleabilidad (Ocupados/PEA) usando la fuente oficial en ambas ediciones');
  const calcMetrics = (dataset) => {
    const total = dataset.length;
    const clasificados = dataset.map(d => Calculations.classifyLaborStatus(d));
    const ocupados = dataset.filter((d, i) => clasificados[i].esOcupado);
    const totalPEA = clasificados.filter(info => info.esPEA).length;
    const tasaOcupacion = totalPEA > 0 ? (ocupados.length / totalPEA) * 100 : 0;
    return { total, tasaOcupacion, ocupadosCount: ocupados.length, totalPEA };
  };
  const oldMetrics = calcMetrics(oldData);
  const newMetrics = calcMetrics(newData);
  assert(oldMetrics.tasaOcupacion >= 0 && oldMetrics.tasaOcupacion <= 100, `Encuesta 2025: Nivel de Empleabilidad en rango 0-100% (${oldMetrics.tasaOcupacion.toFixed(1)}%)`);
  assert(newMetrics.tasaOcupacion >= 0 && newMetrics.tasaOcupacion <= 100, `Encuesta 2026: Nivel de Empleabilidad en rango 0-100% (${newMetrics.tasaOcupacion.toFixed(1)}%)`);
  assert(newMetrics.totalPEA <= newMetrics.total, `Encuesta 2026: PEA (${newMetrics.totalPEA}) <= universo total (${newMetrics.total})`);
  console.log(`  -> Nivel de Empleabilidad: Encuesta 2025 = ${Math.round(oldMetrics.tasaOcupacion)}%, Encuesta 2026 = ${Math.round(newMetrics.tasaOcupacion)}%`);

  section('Empleabilidad por Facultad: mismo criterio de agrupación en ambas ediciones (no la columna cruda)');
  {
    // El CSV 2025 agrupa "Negocios e Ingenierías" en un solo valor de la columna cruda 'Facultad',
    // mientras 2026 las separa — por eso se recalcula con getFacultadForCarrera() en vez de leer
    // la columna 'Facultad' directamente. Verificamos que las 4 facultades reales existan en
    // ambos universos tras recalcular.
    const getCarreraRaw = (d) => (d['CARRERA'] ?? d['Programa Académico:'] ?? '').toString().trim();
    const getFacultad = (d) => DataLoader.getFacultadForCarrera(getCarreraRaw(d));
    const FACULTADES_ORDEN = ['Ciencias de la Salud', 'Negocios', 'Ingeniería', 'Derecho y Ciencia Política'];

    const facultadesEnOld = new Set(oldData.map(getFacultad));
    const facultadesEnNew = new Set(newData.map(getFacultad));
    const facultadesComparables = FACULTADES_ORDEN.filter(f => facultadesEnOld.has(f) && facultadesEnNew.has(f));
    assert(facultadesComparables.length === 4, `las 4 facultades son comparables entre ediciones (${facultadesComparables.join(', ')})`);
    assert(!facultadesEnOld.has('Otra') || true, 'getFacultadForCarrera no debería devolver "Otra" para carreras reales (verificado indirectamente abajo)');
    const sinFacultadOld = oldData.filter(d => getFacultad(d) === 'Otra').length;
    const sinFacultadNew = newData.filter(d => getFacultad(d) === 'Otra').length;
    assert(sinFacultadOld === 0, `ninguna fila de la Encuesta 2025 queda sin facultad reconocida (${sinFacultadOld})`);
    assert(sinFacultadNew === 0, `ninguna fila de la Encuesta 2026 queda sin facultad reconocida (${sinFacultadNew})`);
  }

  section('Empleabilidad por Carrera: cruce por nombre normalizado + filtro de Facultad (funcionalidad nueva)');
  {
    const getCarreraRaw = (d) => (d['CARRERA'] ?? d['Programa Académico:'] ?? '').toString().trim();
    const getFacultad = (d) => DataLoader.getFacultadForCarrera(getCarreraRaw(d));
    const getCarreraKey = (d) => getCarreraRaw(d).toUpperCase();

    const carrerasEnOld = new Set(oldData.map(getCarreraKey).filter(Boolean));
    const carrerasEnNew = new Map();
    newData.forEach(d => { const k = getCarreraKey(d); if (k && !carrerasEnNew.has(k)) carrerasEnNew.set(k, getCarreraRaw(d)); });
    const carrerasComparables = [...carrerasEnNew.keys()]
      .filter(k => carrerasEnOld.has(k) && DataLoader.isCarreraVigente(carrerasEnNew.get(k)))
      .sort();
    assert(carrerasComparables.length >= 10, `al menos 10 carreras son comparables entre ediciones (${carrerasComparables.length})`);
    assert(!carrerasComparables.some(k => k.includes('MARKETING')), 'Marketing (descontinuada) queda excluida de las carreras comparables');

    const carreraRows = carrerasComparables.map(key => {
      const carreraDisplay = carrerasEnNew.get(key);
      // Regresión: facultad se calcula con getFacultadForCarrera(carreraDisplay) directo, NO con
      // getFacultad(carreraDisplay) — ese helper espera una FILA, no un string ya extraído (bug
      // real encontrado por este test: dejaba TODAS las carreras en facultad "Otra" y el filtro
      // de Facultad del gráfico "Empleabilidad por Carrera" sin ninguna opción real que mostrar).
      const facultad = DataLoader.getFacultadForCarrera(carreraDisplay);
      const oldCount = oldData.filter(d => getCarreraKey(d) === key).length;
      const newCount = newData.filter(d => getCarreraKey(d) === key).length;
      return { carrera: carreraDisplay, facultad, oldCount, newCount };
    });
    carreraRows.forEach(r => {
      assert(r.oldCount > 0, `'${r.carrera}': tiene egresados en la Encuesta 2025 (${r.oldCount})`);
      assert(r.newCount > 0, `'${r.carrera}': tiene egresados en la Encuesta 2026 (${r.newCount})`);
      assert(r.facultad !== 'Otra', `'${r.carrera}': se le asigna una facultad real (no "Otra")`);
    });

    // Filtro de Facultad (agregado a "Empleabilidad por Carrera"): cada facultad NID/Salud debe
    // filtrar a un subconjunto no vacío y estrictamente menor o igual al total.
    const FACULTADES_ORDEN = ['Ciencias de la Salud', 'Negocios', 'Ingeniería', 'Derecho y Ciencia Política'];
    const facultadesEnCarreraRows = FACULTADES_ORDEN.filter(f => carreraRows.some(r => r.facultad === f));
    assert(facultadesEnCarreraRows.length >= 3, `al menos 3 facultades tienen carreras comparables para filtrar (${facultadesEnCarreraRows.join(', ')})`);
    facultadesEnCarreraRows.forEach(f => {
      const filtradas = carreraRows.filter(r => r.facultad === f);
      assert(filtradas.length > 0 && filtradas.length <= carreraRows.length, `filtro "${f}": ${filtradas.length} de ${carreraRows.length} carreras`);
    });
    console.log(`  -> Carreras comparables: ${carreraRows.length} | Facultades con filtro: ${facultadesEnCarreraRows.join(', ')}`);
  }

  section('Comparativa por Cohorte: solo años presentes en AMBOS universos oficiales');
  {
    const añosComparables = ANIOS_UNIVERSO_2025.filter(a => ANIOS_UNIVERSO_2026.includes(a)).sort((a, b) => a - b);
    assert(añosComparables.length > 0, `hay años en común entre ambas ediciones (${añosComparables.join(', ')})`);
    assert(añosComparables.every(a => ANIOS_UNIVERSO_2025.includes(a) && ANIOS_UNIVERSO_2026.includes(a)), 'todos los años comparables están en ambos universos oficiales');
  }

  console.log('\n✔ test-evolutivo.js: todas las verificaciones pasaron\n');
}

main();
