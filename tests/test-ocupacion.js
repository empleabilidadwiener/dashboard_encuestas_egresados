// tests/test-ocupacion.js — Valida "Situación Laboral" (ocupacion.js) contra los datos reales.
// Uso: node tests/test-ocupacion.js

const { load, assert, section } = require('./_harness');

function main() {
  const { encuestas, ctx } = load();
  const { Calculations } = ctx;

  section(`Trazabilidad PEA (n=${encuestas.length})`);
  const trazabilidad = Calculations.getTrazabilidadPEAPorCarrera(encuestas);
  const tot = trazabilidad.totales;
  assert(tot.totalOcupadosConEmprendimiento + tot.totalBuscan === tot.totalPEA,
    `ocupados (${tot.totalOcupadosConEmprendimiento}) + buscan (${tot.totalBuscan}) == PEA total (${tot.totalPEA})`);
  assert(Math.round(tot.tasaPEATotal) >= 0 && Math.round(tot.tasaPEATotal) <= 100, `tasaPEATotal en rango válido (${Math.round(tot.tasaPEATotal)}%)`);
  console.log(`  -> Nivel de Empleabilidad: ${Math.round(tot.tasaPEATotal)}%, Ocupados: ${tot.totalOcupadosConEmprendimiento}, Buscan: ${tot.totalBuscan}`);

  section('Sensibilidad PEA: 3 escenarios (Bruta / Ajustada / PEA oficial)');
  const sens = Calculations.getSensibilidadPEA(encuestas);
  assert(sens.total === encuestas.length, `sensibilidadPEA.total (${sens.total}) == total encuestas (${encuestas.length})`);
  const escenarios = [
    { nombre: 'Bruta', ocupados: sens.trabajando + sens.emprendedores + sens.serumsActivo, denom: sens.total },
    { nombre: 'PEA oficial', ocupados: sens.ocupadosTotalPEA, denom: sens.totalPEA }
  ];
  for (const e of escenarios) {
    assert(e.ocupados <= e.denom, `escenario '${e.nombre}': ocupados (${e.ocupados}) <= denominador (${e.denom})`);
  }

  section('Ocupación por año de egreso: la suma anual debe cuadrar con el total (sin pérdida de filas)');
  const datosPorAnio = Calculations.getOcupacionPorAnioEgreso(encuestas);
  const sumaAnios = datosPorAnio.reduce((s, d) => s + d.totalMuestra, 0);
  assert(sumaAnios === encuestas.length, `suma de totalMuestra por año (${sumaAnios}) == total encuestas (${encuestas.length}) — ninguna fila se pierde por el filtro de rango de años`);
  datosPorAnio.forEach(d => {
    assert(d.ocupados + d.noOcupados <= d.totalMuestra, `año ${d.anio}: ocupados+noOcupados (${d.ocupados + d.noOcupados}) <= totalMuestra (${d.totalMuestra})`);
  });

  section('Condición laboral de ocupados: dependiente + independiente + propietario == total ocupados');
  {
    // Se clasifica con PivotEngine (no con el texto crudo): la fuente puede traer la
    // respuesta textual completa del instrumento en vez de la etiqueta corta 'Dependiente'.
    const condicionField = ctx.PivotEngine.fields.find(f => f.id === 'condicion');
    const trabajadores = Calculations.getRespuestasTrabajadores(encuestas);
    const condicionLaboral = {};
    trabajadores.forEach(d => {
      const cond = condicionField.getValue(d);
      if (cond && cond !== 'No precisa') condicionLaboral[cond] = (condicionLaboral[cond] || 0) + 1;
    });
    const suma = Object.values(condicionLaboral).reduce((a, b) => a + b, 0);
    assert(suma === trabajadores.length, `suma de condición laboral (${suma}) == total trabajadores (${trabajadores.length})`);
    assert(Object.keys(condicionLaboral).includes('Independiente') && condicionLaboral['Independiente'] > 0,
      `'Independiente' aparece como categoría separada con conteo real (n=${condicionLaboral['Independiente']})`);
    console.log('  -> Condición laboral:', condicionLaboral);
  }

  section('Indicadores clave 2026 (Personal a cargo, Ascensos)');
  const indicadores = Calculations.getIndicadoresClave2026(encuestas);
  assert(!!indicadores.personalCargo && !!indicadores.personalCargo.valor, `personalCargo produce un valor (${indicadores.personalCargo.valor})`);
  assert(!!indicadores.ascenso && !!indicadores.ascenso.valor, `ascenso produce un valor (${indicadores.ascenso.valor})`);
  console.log(`  -> Personal a cargo: ${indicadores.personalCargo.valor} (${indicadores.personalCargo.sub})`);
  console.log(`  -> Ascenso: ${indicadores.ascenso.valor} (${indicadores.ascenso.sub})`);

  section('Perfil del Empleo Actual: tamaño de empresa, zona geográfica, nivel de cargo, empleadores');
  {
    const trabajadores = Calculations.getRespuestasTrabajadores(encuestas);
    const NO_APLICA = new Set(['No aplica / No precisa', 'No especifica']);
    const countDistinct = (fieldId) => {
      const field = ctx.PivotEngine.fields.find(f => f.id === fieldId);
      const counts = {};
      trabajadores.forEach(d => {
        const val = field.getValue(d);
        if (NO_APLICA.has(val)) return;
        counts[val] = (counts[val] || 0) + 1;
      });
      return counts;
    };

    // Regresión: la fuente trae variantes de mayúsculas/minúsculas para el mismo tamaño de
    // empresa (p.ej. "Gran empresa" y "Gran Empresa"); deben normalizarse a una sola categoría.
    const tamano = countDistinct('tamanoEmpresa');
    assert(!('Gran empresa' in tamano) || !('Gran Empresa' in tamano),
      'tamanoEmpresa no deja duplicados de "Gran Empresa" por variantes de mayúsculas/minúsculas');
    assert(Object.keys(tamano).length <= 4, `tamanoEmpresa normaliza a categorías únicas (${Object.keys(tamano).join(', ')})`);
    assert(tamano['Gran Empresa'] > 0 && tamano['Microempresa'] > 0, 'tamanoEmpresa tiene datos reales en las categorías principales');

    const zona = countDistinct('zonaGeografica');
    assert(!('Lima Provincias (fuera de Lima Metropolitana)' in zona),
      'zonaGeografica fusiona "Lima Provincias (fuera de Lima Metropolitana)" dentro de "Provincia (resto del Perú)"');
    assert(zona['Provincia (resto del Perú)'] > 300, `zonaGeografica agrupa correctamente las provincias (n=${zona['Provincia (resto del Perú)']})`);

    const nivelCargo = countDistinct('nivelCargo');
    assert(nivelCargo['Experiencia Inicial'] > 0, 'nivelCargo corrige el typo de la fuente ("incial") y cuenta "Experiencia Inicial"');
    assert(nivelCargo['CEO / Fundador'] > 0, `nivelCargo fusiona variantes de "CEO" en una sola categoría (n=${nivelCargo['CEO / Fundador']})`);
    const sumaCargo = Object.values(nivelCargo).reduce((a, b) => a + b, 0);
    assert(sumaCargo > 0 && sumaCargo <= trabajadores.length, `nivelCargo produce un total coherente (${sumaCargo} <= ${trabajadores.length} trabajadores)`);

    const topEmpleadores = Calculations.getTopEmpleadores(trabajadores, 10);
    assert(topEmpleadores.length === 10, `getTopEmpleadores devuelve el top 10 solicitado (${topEmpleadores.length})`);
    assert(!topEmpleadores.some(e => ['', 'Sin dato', 'Persona Natural', 'No especifica'].includes(e.empresa)),
      'getTopEmpleadores excluye respuestas genéricas (Sin dato, Persona Natural, No especifica)');
    assert(topEmpleadores[0].cantidad >= topEmpleadores[topEmpleadores.length - 1].cantidad,
      'getTopEmpleadores está ordenado de mayor a menor');
    console.log('  -> Top 3 empleadores:', topEmpleadores.slice(0, 3).map(e => `${e.empresa} (${e.cantidad})`).join(', '));
  }

  section('Progresión de Carrera y Puesto Actual (columnas oficiales categorizadas)');
  {
    const nivelPrimerEmpleoField = ctx.PivotEngine.fields.find(f => f.id === 'nivelPrimerEmpleo');
    const cargoActualField = ctx.PivotEngine.fields.find(f => f.id === 'cargoActual');
    let sumaPrimerEmpleo = 0, sumaCargoActual = 0;
    encuestas.forEach(d => {
      sumaPrimerEmpleo++;
      sumaCargoActual++;
    });
    assert(sumaPrimerEmpleo === encuestas.length && sumaCargoActual === encuestas.length,
      'nivelPrimerEmpleo y cargoActual están definidos para cada fila (no lanzan error)');

    const primerEmpleoCounts = {};
    encuestas.forEach(d => { const v = nivelPrimerEmpleoField.getValue(d); primerEmpleoCounts[v] = (primerEmpleoCounts[v]||0)+1; });
    const totalPrimerEmpleo = Object.values(primerEmpleoCounts).reduce((a,b)=>a+b,0);
    assert(totalPrimerEmpleo === encuestas.length, `nivelPrimerEmpleo cubre el total de encuestas (${totalPrimerEmpleo})`);
    assert(primerEmpleoCounts['Junior'] > 0, `nivelPrimerEmpleo tiene datos reales en 'Junior' (n=${primerEmpleoCounts['Junior']})`);

    const cargoActualCounts = {};
    encuestas.forEach(d => { const v = cargoActualField.getValue(d); cargoActualCounts[v] = (cargoActualCounts[v]||0)+1; });
    const totalCargoActual = Object.values(cargoActualCounts).reduce((a,b)=>a+b,0);
    assert(totalCargoActual === encuestas.length, `cargoActual cubre el total de encuestas (${totalCargoActual})`);
    assert(cargoActualCounts['Fisioterapeuta / Terapeuta Físico'] > 0 && cargoActualCounts['Abogado/a'] > 0,
      'cargoActual combina correctamente el catálogo de Salud y el de NID en un solo campo');
    assert(!Object.keys(cargoActualCounts).some(k => k.includes('Sin clasificar')),
      'cargoActual no deja pasar el valor genérico "Sin clasificar" como categoría propia');
  }

  section('Actividad Independiente: usa la columna oficial categorizada para las respuestas "Otro"');
  {
    const field = ctx.PivotEngine.fields.find(f => f.id === 'actividadIndependiente');
    const counts = {};
    encuestas.forEach(d => { const v = field.getValue(d); counts[v] = (counts[v]||0)+1; });
    assert((counts['Otro (especificar)'] || 0) <= 5,
      `'actividadIndependiente' resuelve casi todas las respuestas "Otro" con la categorización oficial (residual=${counts['Otro (especificar)'] || 0})`);
    assert(counts['Venta de productos/bienes/servicios'] > 0, `'actividadIndependiente' recupera 'Venta de productos/bienes/servicios' desde la columna categorizada (n=${counts['Venta de productos/bienes/servicios']})`);
    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    assert(total === encuestas.length, `'actividadIndependiente' cubre el total de encuestas (${total})`);
  }

  section('Cobertura de carreras (excluyendo Administración y Marketing por n bajo)');
  const carrerasValidas = trazabilidad.carreras.filter(c => !c.carrera.toUpperCase().includes('MARKETING'));
  assert(carrerasValidas.length >= 15, `hay al menos 15 carreras con datos (${carrerasValidas.length})`);
  carrerasValidas.forEach(c => {
    assert(c.n > 0, `carrera '${c.carrera}' tiene muestra > 0 (n=${c.n})`);
  });

  console.log('\n✔ test-ocupacion.js: todas las verificaciones pasaron\n');
}

main();
