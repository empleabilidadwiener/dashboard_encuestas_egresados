// tests/test-perfil-no-trabaja.js — Valida la página "Perfil del Egresado que No Trabaja"
// (toggle PEA No Ocupada / No PEA) contra los datos reales, usando la MISMA lógica de
// producción (no una reimplementación).
//
// Uso: node tests/test-perfil-no-trabaja.js

const path = require('path');
const { load, assert, section } = require('./_harness');

async function main() {
  const { encuestas, universo, ctx } = load();
  ctx.DataLoader.universo = universo;

  global.window = global;
  global.PivotEngine = ctx.PivotEngine;
  global.Calculations = ctx.Calculations;

  const mod = await import(path.join(__dirname, '..', 'js', 'pages', 'perfil-no-trabaja.js') + `?t=${Date.now()}`);
  const { segmentarNoTrabaja, getMotivoDist, getTiempoDesempleoDist, getTrabajoPrevioDist, getNpsDist } = mod;

  section(`Segmentación PEA (No Ocupada) / No PEA (n=${encuestas.length})`);
  const { peaNoOcupados, noPea } = segmentarNoTrabaja(encuestas);
  assert(peaNoOcupados.length + noPea.length > 0, `hay egresados que no trabajan (PEA No Ocupada=${peaNoOcupados.length}, No PEA=${noPea.length})`);

  // Debe coincidir EXACTO con la columna oficial "Condición PEA" de la universidad, igual que
  // el resto del dashboard (mismo criterio que ya valida test-resumen.js).
  const colPEA = ctx.Calculations.cols.condicionPEA;
  const noOcupadosOficial = encuestas.filter(d => {
    const esPEA = String(d[colPEA] || '').trim().toUpperCase() === 'PEA';
    const nivelFinal = String(d[ctx.Calculations.cols.nivelEmpleabilidadFinal] || '').trim();
    return esPEA && nivelFinal !== 'Sí';
  }).length;
  assert(peaNoOcupados.length === noOcupadosOficial, `PEA No Ocupada (${peaNoOcupados.length}) == columna oficial PEA + Nivel de Empleabilidad Final != 'Sí' (${noOcupadosOficial})`);

  const totalNoTrabajaOficial = encuestas.filter(d => String(d[ctx.Calculations.cols.nivelEmpleabilidadFinal] || '').trim() !== 'Sí').length;
  assert(peaNoOcupados.length + noPea.length === totalNoTrabajaOficial, `PEA No Ocupada + No PEA (${peaNoOcupados.length + noPea.length}) == total con 'Nivel de Empleabilidad Final' != 'Sí' (${totalNoTrabajaOficial})`);

  // Ningún egresado debe caer en ambos grupos ni en ninguno (partición exhaustiva y disjunta).
  const idsPea = new Set(peaNoOcupados.map(d => d['DNI:']));
  const idsNoPea = new Set(noPea.map(d => d['DNI:']));
  const interseccion = [...idsPea].filter(id => idsNoPea.has(id));
  assert(interseccion.length === 0, `PEA No Ocupada y No PEA son grupos disjuntos (${interseccion.length} DNI en ambos)`);

  section('Motivo Principal: debe sumar exactamente el tamaño del segmento');
  const motivoPea = getMotivoDist(peaNoOcupados);
  const sumaMotivoPea = motivoPea.reduce((s, x) => s + x.count, 0);
  assert(sumaMotivoPea === peaNoOcupados.length, `suma de motivos (PEA No Ocupada, ${sumaMotivoPea}) == tamaño del segmento (${peaNoOcupados.length})`);
  assert(motivoPea.every(x => x.label && x.count > 0), 'todas las categorías de motivo tienen label y count > 0');

  const motivoNoPea = getMotivoDist(noPea);
  const sumaMotivoNoPea = motivoNoPea.reduce((s, x) => s + x.count, 0);
  assert(sumaMotivoNoPea === noPea.length, `suma de motivos (No PEA, ${sumaMotivoNoPea}) == tamaño del segmento (${noPea.length})`);
  // Regresión: "Buscando empleo activamente" es privativo de la PEA No Ocupada por definición
  // (info.esPEA=true + esOcupado=false); no debe aparecer del lado No PEA.
  assert(!motivoNoPea.some(x => x.label === 'Buscando empleo activamente'), '"Buscando empleo activamente" no aparece en el motivo del grupo No PEA (es exclusivo de PEA No Ocupada)');

  section('Tiempo en Situación de Desempleo: se le pregunta a todos los que no trabajan');
  const tiempoPea = getTiempoDesempleoDist(peaNoOcupados);
  assert(tiempoPea.total <= peaNoOcupados.length, `respuestas de tiempo desempleo (PEA, ${tiempoPea.total}) <= tamaño del segmento (${peaNoOcupados.length})`);
  const sumaTiempoPea = tiempoPea.dist.reduce((s, x) => s + x.count, 0);
  assert(sumaTiempoPea === tiempoPea.total, `suma de categorías de tiempo (${sumaTiempoPea}) == total válido (${tiempoPea.total})`);

  // Verificado contra los datos crudos: "Tiempo en desempleo" (Pregunta 2 de la rama "No
  // Trabaja") se le hace a TODOS los que no trabajan, sin importar el motivo — no es exclusiva
  // de quienes buscan empleo activamente. Por eso el grupo No PEA también debe tener
  // respuestas válidas (a diferencia de lo que se podría asumir).
  const tiempoNoPea = getTiempoDesempleoDist(noPea);
  assert(tiempoNoPea.total > 0, `el grupo No PEA también tiene respuestas válidas de tiempo en desempleo (${tiempoNoPea.total} de ${noPea.length}) — la pregunta no es exclusiva de PEA No Ocupada`);
  const sumaTiempoNoPea = tiempoNoPea.dist.reduce((s, x) => s + x.count, 0);
  assert(sumaTiempoNoPea === tiempoNoPea.total, `suma de categorías de tiempo (No PEA, ${sumaTiempoNoPea}) == total válido (${tiempoNoPea.total})`);

  section('¿Ha Trabajado Anteriormente?');
  const trabajoPea = getTrabajoPrevioDist(peaNoOcupados);
  assert(trabajoPea.counts['Sí'] + trabajoPea.counts['No'] === trabajoPea.total, `Sí (${trabajoPea.counts['Sí']}) + No (${trabajoPea.counts['No']}) == total (${trabajoPea.total})`);
  assert(trabajoPea.total > 0, `hay respuestas válidas de '¿Ha trabajado anteriormente?' en PEA No Ocupada (${trabajoPea.total})`);

  section('NPS del segmento: rango válido y consistente con Calculations.calcularNPS');
  const npsPea = getNpsDist(peaNoOcupados);
  assert(npsPea.scores.every(s => s >= 0 && s <= 10), 'todos los puntajes NPS están en el rango 0-10');
  assert(npsPea.stats.nps >= -100 && npsPea.stats.nps <= 100, `puntaje NPS en rango válido (${npsPea.stats.nps.toFixed(1)})`);
  const promDetNeutral = Math.round(npsPea.stats.promotores + npsPea.stats.neutrales + npsPea.stats.detractores);
  assert(promDetNeutral === 100 || npsPea.scores.length === 0, `promotores + neutrales + detractores suman 100% (${promDetNeutral}%)`);

  // El campo 'nps' de PivotEngine unifica la pregunta 13 (rama "Sí Trabaja") y la pregunta 6
  // (rama "No Trabaja") en un solo campo — por eso este segmento (que NUNCA trabaja) igual
  // debe tener puntajes NPS válidos, tomados de la pregunta 6.
  assert(npsPea.scores.length > 0, `el segmento PEA No Ocupada tiene puntajes NPS válidos (${npsPea.scores.length}) vía la pregunta 6 (rama "No Trabaja")`);

  console.log('\n✔ test-perfil-no-trabaja.js: todas las verificaciones pasaron\n');
}

main().catch(err => {
  console.error('\n✘ test-perfil-no-trabaja.js FALLÓ:\n', err);
  process.exit(1);
});
