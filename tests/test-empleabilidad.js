// tests/test-empleabilidad.js — Valida "Afinidad Formativa e Ingresos" (empleabilidad.js).
// Uso: node tests/test-empleabilidad.js

const fs = require('fs');
const path = require('path');
const { load, assert, section, ROOT } = require('./_harness');

// Replica exacta de MAPEO_CARRERA_EXTERNO / parseSoles / indexarPorCarreraUNW de
// js/pages/empleabilidad.js (no se puede importar directo: son funciones internas del módulo
// de página, no exportadas — mismo patrón que ya usa este archivo para el KPI de pertinencia).
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
// Firma actual de producción (2026-09-22): un solo argumento, captura Jóvenes Y Adultos a la vez
// (antes tomaba una sola columna por llamada) — la tabla ahora muestra ambas columnas nacionales.
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
      mejorPorEtiqueta[etiqueta] = { ingresoJovenes, ingresoAdultos, rank: isNaN(rank) ? Infinity : rank };
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
// Replica de indexarWienerExternoPorCarreraUNW() de js/pages/empleabilidad.js — para
// carreras_top_upnw.csv (una sola columna de ingreso, sin distinción Jóvenes/Adultos).
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
function readCsvUtf8(ctx, relPath) {
  const buf = new Uint8Array(fs.readFileSync(path.join(ROOT, relPath)));
  const wb = ctx.XLSX.read(buf, { type: 'array', raw: true, codepage: 65001 });
  return ctx.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
}

function main() {
  const { encuestas, ctx } = load();
  const { Calculations, DataLoader } = ctx;

  section(`Distribuciones base (n=${encuestas.length})`);
  const pertinencia = Calculations.getDistribucionPertinencia(encuestas);
  const satisfaccion = Calculations.getDistribucionSatisfaccion(encuestas);
  const salario = Calculations.getDistribucionSalario(encuestas);
  const trabajadores = Calculations.getRespuestasTrabajadores(encuestas);

  assert(pertinencia.reduce((s, d) => s + d.cantidad, 0) <= trabajadores.length, 'pertinencia no excede el total de trabajadores');
  assert(satisfaccion.reduce((s, d) => s + d.cantidad, 0) <= trabajadores.length, 'satisfacción no excede el total de trabajadores');
  const satInsatisfecho = satisfaccion.find(s => s.categoria === 'Insatisfecho');
  const satSatisfecho = satisfaccion.find(s => s.categoria === 'Satisfecho');
  assert(!!satInsatisfecho, `'Insatisfecho' sigue siendo su propia categoría en la distribución (n=${satInsatisfecho ? satInsatisfecho.cantidad : 0})`);
  assert(!!satSatisfecho, `'Satisfecho' sigue siendo su propia categoría (n=${satSatisfecho ? satSatisfecho.cantidad : 0})`);

  section('KPI: Pertinencia (totalmente / total-o-parcial)');
  let totalTrabResp = 0, totalAltaResp = 0, totalRelResp = 0;
  trabajadores.forEach(d => {
    const val = d[Calculations.cols.pertinencia];
    if (val) {
      totalTrabResp++;
      if (val.includes('totalmente')) { totalAltaResp++; totalRelResp++; }
      else if (val.includes('parcialmente')) totalRelResp++;
    }
  });
  const tasaAltaGlobal = totalTrabResp > 0 ? (totalAltaResp / totalTrabResp) * 100 : 0;
  const tasaRelGlobal = totalTrabResp > 0 ? (totalRelResp / totalTrabResp) * 100 : 0;
  assert(tasaRelGlobal >= tasaAltaGlobal, `pertinencia total-o-parcial (${Math.round(tasaRelGlobal)}%) >= solo-totalmente (${Math.round(tasaAltaGlobal)}%)`);
  console.log(`  -> Totalmente pertinente: ${Math.round(tasaAltaGlobal)}%, Total o parcial: ${Math.round(tasaRelGlobal)}%`);

  section('Ranking de carreras: pertinencia por programa');
  const ranking = Calculations.getRankingCarreras(encuestas);
  assert(ranking.length >= 15, `ranking cubre al menos 15 carreras (${ranking.length})`);
  ranking.forEach(r => {
    assert(r.totalmenteRelacionadas + r.parcialmenteRelacionadas + r.noRelacionadas === r.totalPertinencia,
      `'${r.carrera}': totalmente+parcial+no-relacionada (${r.totalmenteRelacionadas + r.parcialmenteRelacionadas + r.noRelacionadas}) == totalPertinencia (${r.totalPertinencia})`);
    assert(r.tasaPertinenciaAlta <= r.tasaPertinencia + 0.01, `'${r.carrera}': tasa alta (${r.tasaPertinenciaAlta.toFixed(1)}%) <= tasa total (${r.tasaPertinencia.toFixed(1)}%)`);
  });

  section('Distribución salarial: categorías declaradas suman <= total trabajadores');
  const totalDeclarado = salario.reduce((s, d) => s + d.cantidad, 0);
  assert(totalDeclarado <= trabajadores.length, `salario declarado (${totalDeclarado}) <= trabajadores (${trabajadores.length})`);
  console.log('  -> Distribución salarial:', salario.map(s => `${s.categoria}: ${s.cantidad}`).join(' | '));

  section('Nivel de Empleabilidad (Ocupados/PEA oficial) x Pertinencia Laboral, por carrera');
  {
    // Replica el join de empleabilidad.js: Nivel de Empleabilidad = tasaPEA oficial (OIT/INEI,
    // NO la tasa de ocupación bruta), unido por nombre de carrera con la pertinencia ya calculada
    // en `ranking`. Ver nota metodológica en js/pages/empleabilidad.js.
    const trazabilidadCarreras = Calculations.getTrazabilidadPEAPorCarrera(encuestas);
    const empleabilidadPertinenciaCarreras = trazabilidadCarreras.carreras
      .filter(c => !c.carrera.toUpperCase().includes('MARKETING'))
      .map(c => {
        const pert = ranking.find(r => r.carrera === c.carrera);
        return {
          carrera: c.carrera,
          tasaEmpleabilidad: c.tasaPEA,
          tasaPertinencia: pert ? pert.tasaPertinencia : null,
          pea: c.pea,
          totalPertinencia: pert ? pert.totalPertinencia : 0
        };
      })
      .filter(c => c.pea > 0 && c.totalPertinencia > 0);

    assert(empleabilidadPertinenciaCarreras.length >= 14, `al menos 14 carreras con ambos indicadores válidos (${empleabilidadPertinenciaCarreras.length})`);
    empleabilidadPertinenciaCarreras.forEach(c => {
      assert(c.tasaEmpleabilidad >= 0 && c.tasaEmpleabilidad <= 100, `'${c.carrera}': Nivel de Empleabilidad en rango 0-100% (${c.tasaEmpleabilidad.toFixed(1)}%)`);
      assert(c.tasaPertinencia >= 0 && c.tasaPertinencia <= 100, `'${c.carrera}': Pertinencia en rango 0-100% (${c.tasaPertinencia.toFixed(1)}%)`);
      // La pertinencia se mide sobre ocupados que respondieron, un subconjunto de la PEA de esa carrera.
      assert(c.totalPertinencia <= c.pea, `'${c.carrera}': respuestas de pertinencia (${c.totalPertinencia}) <= PEA de la carrera (${c.pea})`);
    });
    assert(!empleabilidadPertinenciaCarreras.some(c => c.carrera.toUpperCase().includes('MARKETING')), 'Marketing (carrera descontinuada) queda excluida');
  }

  section('Sueldo Promedio (punto medio de tramo) por Carrera y por Año de Egreso');
  {
    const sueldoPorCarrera = Calculations.getSueldoPromedioAgrupado(trabajadores, d => d[Calculations.cols.carrera])
      .filter(c => DataLoader.isCarreraVigente(c.key));
    assert(sueldoPorCarrera.length >= 14, `sueldo promedio calculado para al menos 14 carreras (${sueldoPorCarrera.length})`);
    sueldoPorCarrera.forEach(c => {
      assert(c.promedio > 0, `'${c.key}': sueldo promedio > 0 (S/ ${c.promedio})`);
      assert(c.n > 0, `'${c.key}': n de respuestas > 0 (${c.n})`);
      assert(c.promedio < 20000, `'${c.key}': sueldo promedio en rango plausible (S/ ${c.promedio} < 20,000 — un tramo mal parseado dispararía esto)`);
    });
    assert(!sueldoPorCarrera.some(c => c.key.toUpperCase().includes('MARKETING')), 'Marketing queda excluida del sueldo por carrera');

    const getAnioEgresoRow = (d) => {
      const raw = d['Año de Egreso'] || d['Año de egreso:'] || d[Calculations.cols.anioEgreso] || '';
      const match = String(raw).match(/\d{4}/);
      return match ? match[0] : null;
    };
    // Calculations.getSueldoPromedioAgrupado() es una función reusable de calculations.js — se
    // sigue probando aquí aunque la tabla "por Año de Egreso" que la mostraba en pantalla ya no
    // está en la página (ver empleabilidad.js), por si se retoma más adelante.
    const sueldoPorAnio = Calculations.getSueldoPromedioAgrupado(trabajadores, getAnioEgresoRow);
    assert(sueldoPorAnio.length === 7, `sueldo por año de egreso cubre las 7 cohortes 2019-2025 (${sueldoPorAnio.length})`);
    const sumaN = sueldoPorAnio.reduce((s, a) => s + a.n, 0);
    const totalEstimado = Calculations.getSueldoPromedioEstimado(trabajadores);
    assert(sumaN === totalEstimado.n, `suma de 'n' por año (${sumaN}) == n del promedio institucional (${totalEstimado.n})`);
    console.log(`  -> Sueldo promedio institucional: S/ ${totalEstimado.promedio.toLocaleString()} (n=${totalEstimado.n})`);
  }

  section('Dato Externo (Portal MiCarrera - MTPE): tabla "Nacional (Jóvenes) vs. Wiener (Encuesta 2026) vs. Wiener (Externo MTPE)"');
  {
    const nacionalRows = readCsvUtf8(ctx, 'data/pago_promedio_carrerras_2026.csv');
    const wienerRows = readCsvUtf8(ctx, 'data/carreras_top_upnw.csv');
    assert(nacionalRows.length > 0, `pago_promedio_carrerras_2026.csv carga filas (${nacionalRows.length})`);
    assert(wienerRows.length > 0, `carreras_top_upnw.csv carga filas (${wienerRows.length})`);

    // Regresión de encoding: sin codepage:65001 los acentos salen como mojibake ("JÃ³venes").
    const carrerasConAcento = nacionalRows.map(r => r.Carrera).filter(c => /[ÁÉÍÓÚÑ]/.test(c || ''));
    assert(carrerasConAcento.length > 0, `el CSV nacional decodifica acentos correctamente (ej. "${carrerasConAcento[0]}")`);
    assert(!nacionalRows.some(r => /Ã/.test(r.Carrera || '')), 'ninguna fila del CSV nacional quedó con mojibake ("Ã...")');
    assert(!wienerRows.some(r => /Ã/.test(r.Carrera || '')), 'ninguna fila del CSV Wiener Externo quedó con mojibake ("Ã...")');

    const nacionalPorCarrera = indexarPorCarreraUNW(nacionalRows);
    assert(Object.keys(nacionalPorCarrera).length >= 14, `al menos 14 carreras UNW con dato nacional mapeado (${Object.keys(nacionalPorCarrera).length})`);

    const wienerExternoPorCarrera = indexarWienerExternoPorCarreraUNW(wienerRows);
    assert(Object.keys(wienerExternoPorCarrera).length >= 10, `al menos 10 carreras UNW con dato Wiener Externo mapeado (${Object.keys(wienerExternoPorCarrera).length})`);

    // Toda clave mapeada debe ser una carrera real de la UNW (detecta errores de tipeo en el mapeo).
    const carrerasUNWReales = new Set(DataLoader.getCarreras());
    Object.keys(nacionalPorCarrera).forEach(c => assert(carrerasUNWReales.has(c), `'${c}' (mapeo nacional) es una carrera real de la UNW`));
    Object.keys(wienerExternoPorCarrera).forEach(c => assert(carrerasUNWReales.has(c), `'${c}' (mapeo Wiener Externo) es una carrera real de la UNW`));

    // Cada carrera mapeada debe traer un ingreso nacional (Jóvenes) numérico válido.
    Object.entries(nacionalPorCarrera).forEach(([carrera, val]) => {
      assert(val.ingresoJovenes != null || val.ingresoAdultos != null, `'${carrera}': tiene al menos un ingreso nacional válido (Jóvenes o Adultos)`);
    });
    Object.entries(wienerExternoPorCarrera).forEach(([carrera, val]) => {
      assert(val.ingreso > 0, `'${carrera}': ingreso Wiener Externo > 0 (S/ ${val.ingreso})`);
    });

    // Las 2 especialidades de Tecnología Médica deben compartir el mismo valor (la fuente externa
    // no las distingue) — regresión si algún día se intenta "repartir" el valor entre ambas.
    const tm1 = 'Tecnología Médica en Terapia Física y Rehabilitación';
    const tm2 = 'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica';
    if (nacionalPorCarrera[tm1] || nacionalPorCarrera[tm2]) {
      assert(nacionalPorCarrera[tm1]?.ingresoJovenes === nacionalPorCarrera[tm2]?.ingresoJovenes, 'Tecnología Médica: mismo valor nacional (Jóvenes) para ambas especialidades');
    }
    if (wienerExternoPorCarrera[tm1] || wienerExternoPorCarrera[tm2]) {
      assert(wienerExternoPorCarrera[tm1]?.ingreso === wienerExternoPorCarrera[tm2]?.ingreso, 'Tecnología Médica: mismo valor Wiener Externo para ambas especialidades');
    }

    // Turismo y Hotelería: se sabe que no está en ninguno de los 2 CSV externos (falta en la fuente, no un bug).
    assert(nacionalPorCarrera['Administración en Turismo y Hotelería'] === undefined, '"Administración en Turismo y Hotelería" sigue sin dato nacional en la fuente (esperado, no un bug de mapeo)');
    assert(wienerExternoPorCarrera['Administración en Turismo y Hotelería'] === undefined, '"Administración en Turismo y Hotelería" sigue sin dato Wiener Externo en la fuente (esperado, no un bug de mapeo)');

    console.log(`  -> Carreras con dato Nacional: ${Object.keys(nacionalPorCarrera).length} de 16 vigentes`);
    console.log(`  -> Carreras con dato Wiener Externo: ${Object.keys(wienerExternoPorCarrera).length} de 16 vigentes`);
  }

  console.log('\n✔ test-empleabilidad.js: todas las verificaciones pasaron\n');
}

main();
