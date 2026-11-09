// tests/test-resultados-generales.js — Valida la página "Resultados Generales" contra los datos
// reales del Excel, usando la MISMA lógica de producción (no una reimplementación).
//
// Uso: node tests/test-resultados-generales.js

const path = require('path');
const { load, assert, section } = require('./_harness');

async function main() {
  const { encuestas, universo, ctx } = load();
  ctx.DataLoader.universo = universo;

  // Exponer los globales que espera el módulo ESM de la página (PivotEngine, Calculations, etc.
  // se referencian como identificadores sueltos, igual que en el navegador via <script>).
  global.window = global;
  global.PivotEngine = ctx.PivotEngine;
  global.Calculations = ctx.Calculations;
  global.toTitleCase = ctx.window.toTitleCase;
  global.window.toTitleCase = ctx.window.toTitleCase;
  global.window.DataLoader = ctx.DataLoader;

  const mod = await import(path.join(__dirname, '..', 'js', 'pages', 'resultados-generales.js') + `?t=${Date.now()}`);
  const { QUESTIONS, ORDINAL_ORDERS, POSITIVE_ORDERS, getFieldValue, countValues, sortUndefinedLast, applyOrdinalOrder, getMajorityOrder, getPositiveOrderedColors, isMultiSelectChecked } = mod;

  section(`KPIs de cabecera (n=${encuestas.length})`);
  assert(encuestas.length > 2000, `total de encuestas es razonable (${encuestas.length})`);
  const trazabilidad = ctx.Calculations.getTrazabilidadPEAPorCarrera(encuestas);
  const tasaOcup = Math.round(trazabilidad.totales.tasaPEATotal);
  assert(tasaOcup >= 0 && tasaOcup <= 100, `tasa de empleabilidad en rango válido (${tasaOcup}%)`);
  console.log(`  -> Nivel de Empleabilidad: ${tasaOcup}%`);
  assert(QUESTIONS.length >= 18, `QUESTIONS cubre al menos los reactivos originales (${QUESTIONS.length} preguntas)`);

  section('Cobertura: cada pregunta debe resolver un fieldId real de PivotEngine');
  for (const q of QUESTIONS) {
    if (q.multiple) {
      for (const f of q.fields) {
        assert(encuestas.some(row => row[ctx.Calculations.cols[f.id]] !== undefined), `columna mapeada para '${f.id}' (${q.id}) existe en el Excel`);
      }
    } else {
      const field = ctx.PivotEngine.fields.find(f => f.id === q.fieldId);
      assert(!!field, `'${q.id}' tiene un campo PivotEngine registrado (fieldId: ${q.fieldId})`);
    }
  }

  section('Distribución general: los conteos deben ser consistentes y sumar 100% (± redondeo)');
  for (const q of QUESTIONS) {
    if (q.multiple) continue;
    const rawValues = getFieldValue(encuestas, q.fieldId);
    const counted = countValues(rawValues);
    if (counted.length === 0) {
      console.log(`  --  '${q.id}' no tiene respuestas aplicables en este dataset (posiblemente 100% condicional/no aplica) — se omite`);
      continue;
    }
    let sorted = sortUndefinedLast(counted.map(c => c.label), counted.map(c => c.count));
    sorted = applyOrdinalOrder(q.id, sorted);
    const total = sorted.values.reduce((s, v) => s + v, 0);
    assert(total === rawValues.length, `'${q.id}': suma de categorías (${total}) == respuestas válidas (${rawValues.length})`);
    const pctSum = sorted.values.reduce((s, v) => s + Math.round((v / total) * 100), 0);
    assert(Math.abs(pctSum - 100) <= sorted.values.length, `'${q.id}': porcentajes redondeados suman ~100% (suma=${pctSum}%, n=${sorted.values.length} categorías)`);
  }

  section('Regresión de bugs corregidos (no deben reaparecer)');
  {
    const condValues = getFieldValue(encuestas, 'condicion');
    const counted = countValues(condValues);
    const independiente = counted.find(c => c.label === 'Independiente');
    assert(!!independiente && independiente.count > 0, `'Independiente' se cuenta por separado de 'Dependiente' (n=${independiente ? independiente.count : 0})`);
  }
  {
    const satValues = getFieldValue(encuestas, 'satisfaccion');
    const counted = countValues(satValues);
    const insatisfecho = counted.find(c => c.label === 'Insatisfecho');
    const satisfecho = counted.find(c => c.label === 'Satisfecho');
    assert(!!insatisfecho, `'Insatisfecho' existe como categoría propia (n=${insatisfecho ? insatisfecho.count : 0})`);
    assert(!!satisfecho, `'Satisfecho' existe como categoría propia (n=${satisfecho ? satisfecho.count : 0})`);
  }
  {
    const cargoValues = getFieldValue(encuestas, 'personalCargo');
    const counted = countValues(cargoValues);
    const labels = counted.map(c => c.label);
    assert(labels.includes('Sí, menos de 10 personas') || labels.includes('Sí, de 10 a 20 personas') || labels.includes('Sí, más de 20 personas'),
      `'personalCargo' conserva las 3 subcategorías del instrumento (no colapsa todo a "Sí"): ${labels.join(', ')}`);
  }
  {
    const colegValues = getFieldValue(encuestas, 'colegiatura');
    const counted = countValues(colegValues);
    const noHabilitado = counted.find(c => c.label === 'Colegiado, no habilitado');
    assert(!!noHabilitado, `'Colegiado, no habilitado' no se mezcla con 'Colegiado y Habilitado' (n=${noHabilitado ? noHabilitado.count : 0})`);
  }
  {
    // "Otro (especificar)" no debe quedar como cajón de sastre: el equipo de datos ya
    // categorizó ese texto libre en "Modalidad de Vinculación - Categorizado (Final)" y
    // "Rubro de Empresa - Categorizado (Final)".
    const modalidadValues = getFieldValue(encuestas, 'modalidadVinculacion');
    const modalidadCounted = countValues(modalidadValues);
    assert(!modalidadCounted.some(c => c.label === 'Otro (especificar)'),
      `'modalidadVinculacion' no deja 'Otro (especificar)' sin categorizar (${modalidadCounted.map(c => c.label).join(', ')})`);
    assert(modalidadCounted.some(c => c.label === 'Prácticas Profesionales' || c.label === 'Voluntariado' || c.label === 'No especifica'),
      `'modalidadVinculacion' usa la categorización oficial para las respuestas "Otro" (${modalidadCounted.map(c => c.label).join(', ')})`);

    const rubroValues = getFieldValue(encuestas, 'rubro');
    const rubroCounted = countValues(rubroValues);
    assert(!rubroCounted.some(c => c.label === 'Otro (especificar)'),
      `'rubro' no deja 'Otro (especificar)' sin categorizar (${rubroCounted.map(c => c.label).join(', ')})`);
    const turismo = rubroCounted.find(c => c.label === 'Turismo, Hotelería y Gastronomía');
    assert(!!turismo && turismo.count === 38, `'rubro' recupera 'Turismo, Hotelería y Gastronomía' desde la columna categorizada (n=${turismo ? turismo.count : 0}) == 38`);
  }
  {
    // Las columnas checkbox marcan "seleccionado" con el texto de la propia alternativa
    // (p.ej. "Networking con egresados"), no con '1'/'Sí'. isMultiSelectChecked debe
    // reconocer eso, y NO reconocer vacío/undefined/'No' como seleccionado.
    assert(isMultiSelectChecked('Networking con egresados') === true, "isMultiSelectChecked reconoce el texto de la alternativa como 'marcado'");
    assert(isMultiSelectChecked('') === false, "isMultiSelectChecked trata la celda vacía como 'no marcado'");
    assert(isMultiSelectChecked(undefined) === false, "isMultiSelectChecked trata undefined como 'no marcado'");
    assert(isMultiSelectChecked('No') === false, "isMultiSelectChecked trata 'No' como 'no marcado'");

    const iniciativas = ctx.Calculations.getIniciativasAlumni(encuestas);
    const totalIniciativas = iniciativas.reduce((s, i) => s + i.cantidad, 0);
    assert(totalIniciativas > 0, `getIniciativasAlumni ya no devuelve todo en cero (total=${totalIniciativas})`);

    const apoyo = ctx.Calculations.getApoyoDesempleadosList(encuestas);
    const totalApoyo = apoyo.reduce((s, a) => s + a.cantidad, 0);
    assert(totalApoyo > 0, `getApoyoDesempleadosList ya no devuelve todo en cero (total=${totalApoyo})`);
  }

  section('Orden "dato mayor primero" en cruces (Por Carrera / Por Año)');
  for (const q of QUESTIONS) {
    if (q.multiple || ORDINAL_ORDERS[q.id]) continue;
    const majorityOrder = getMajorityOrder(q, encuestas);
    if (!majorityOrder || majorityOrder.length < 2) continue;
    const rawValues = getFieldValue(encuestas, q.fieldId);
    const counted = countValues(rawValues);
    const countOf = (label) => (counted.find(c => c.label === label) || {}).count || 0;
    assert(countOf(majorityOrder[0]) >= countOf(majorityOrder[1]),
      `'${q.id}': primera categoría ('${majorityOrder[0]}', n=${countOf(majorityOrder[0])}) >= segunda ('${majorityOrder[1]}', n=${countOf(majorityOrder[1])})`);
  }

  section('Paleta "color Wiener = categoría positiva" (no la mayoritaria) en preguntas binarias/con escala');
  {
    // Regresión del bug original: antes el celeste Wiener se lo llevaba la categoría con MÁS
    // respuestas (Charts.getRankedColors / getDefaultCategoricalColors), no la semánticamente
    // positiva. Para cada pregunta en POSITIVE_ORDERS, la categoría positiva (índice 0 de su
    // lista) debe recibir siempre el primer color del degradado (teal, #07C8CC), exista o no
    // como mayoría real en los datos.
    const preguntasBinariasSiNo = ['trabaja', 'emprendimientoRelacionado', 'practicasNID', 'posgrado', 'primerEmpleo', 'trabajadoAnteriormente', 'interesPosgrado', 'ascenso'];
    for (const qid of preguntasBinariasSiNo) {
      const rawValues = getFieldValue(encuestas, qid);
      const counted = countValues(rawValues);
      if (counted.length === 0) { console.log(`  --  '${qid}' sin respuestas aplicables en este dataset — se omite`); continue; }
      const labels = counted.map(c => c.label);
      const colors = getPositiveOrderedColors(labels, qid);
      assert(Array.isArray(colors), `'${qid}': tiene reglas de color positivo definidas (POSITIVE_ORDERS)`);
      const idxSi = labels.indexOf('Sí');
      if (idxSi !== -1) {
        assert(colors[idxSi] === '#07C8CC', `'${qid}': "Sí" recibe el celeste Wiener (#07C8CC), sea o no la mayoría (color real: ${colors[idxSi]})`);
        const idxNo = labels.indexOf('No');
        if (idxNo !== -1) assert(colors[idxNo] !== '#07C8CC', `'${qid}': "No" NO recibe el celeste Wiener (color real: ${colors[idxNo]})`);
      }
    }

    // Caso específico que motivó la corrección: en los datos reales "No" es mayoría en
    // emprendimientoRelacionado, pero debe seguir recibiendo un color distinto al de "Sí".
    {
      const raw = getFieldValue(encuestas, 'emprendimientoRelacionado');
      const counted = countValues(raw);
      if (counted.length >= 2) {
        const labels = counted.map(c => c.label);
        const values = counted.map(c => c.count);
        const colors = getPositiveOrderedColors(labels, 'emprendimientoRelacionado');
        const idxSi = labels.indexOf('Sí');
        const idxNo = labels.indexOf('No');
        if (idxSi !== -1 && idxNo !== -1) {
          console.log(`  -> emprendimientoRelacionado: Sí=${values[idxSi]} No=${values[idxNo]} (mayoría: ${values[idxNo] > values[idxSi] ? 'No' : 'Sí'}) — color de "Sí": ${colors[idxSi]}`);
          assert(colors[idxSi] === '#07C8CC', 'el color de "Sí" no cambia aunque "No" sea la mayoría real de la muestra');
        }
      }
    }

    // Trampa de subcadena: "No formalizado" contiene "formalizado" como subcadena de
    // "Formalizado" — debe distinguirse por coincidencia EXACTA antes de caer a subcadena.
    {
      const labels = ['Formalizado (RUC activo y actividad declarada)', 'En proceso de formalización', 'No formalizado'];
      const colors = getPositiveOrderedColors(labels, 'emprendimientoFormalizacion');
      assert(colors[0] === '#07C8CC', '"Formalizado (...)" recibe el color positivo (teal)');
      assert(colors[2] !== '#07C8CC', '"No formalizado" NO recibe el color positivo pese a contener la subcadena "formalizado"');
      assert(colors[0] !== colors[2], '"Formalizado" y "No formalizado" reciben colores distintos');
    }

    // Preguntas SIN entrada en POSITIVE_ORDERS (sin lectura positiva/negativa clara) deben seguir
    // devolviendo null, para no romper el fallback a la paleta genérica.
    for (const qid of ['condicion', 'modalidad', 'tipoEmpresa', 'rubro']) {
      assert(getPositiveOrderedColors(['A', 'B'], qid) === null, `'${qid}' no tiene POSITIVE_ORDERS definido (debe seguir usando la paleta genérica)`);
    }
  }

  console.log('\n✔ test-resultados-generales.js: todas las verificaciones pasaron\n');
}

main().catch(err => {
  console.error('\n✘ test-resultados-generales.js FALLÓ:\n', err);
  process.exit(1);
});
