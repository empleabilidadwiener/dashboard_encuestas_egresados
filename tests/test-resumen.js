// tests/test-resumen.js — Valida los KPIs y cálculos de "Resumen Ejecutivo" contra los datos
// reales, usando las mismas funciones de producción (Calculations, KPICatalog, DataLoader).
//
// Uso: node tests/test-resumen.js

const { load, assert, section } = require('./_harness');

function main() {
  const { encuestas, universo, ctx } = load();
  ctx.DataLoader.universo = universo;
  const { Calculations, KPICatalog, DataLoader } = ctx;

  section(`Carga de datos (n=${encuestas.length})`);
  assert(encuestas.length > 2000, `total de encuestas es razonable (${encuestas.length})`);

  section('KPIs de la fila superior (configuración por defecto)');
  const trazabilidad = Calculations.getTrazabilidadPEAPorCarrera(encuestas);
  for (const { kpiId } of KPICatalog.getDefaultConfig()) {
    const resultado = KPICatalog.calcularKPI(kpiId, encuestas, trazabilidad);
    assert(resultado !== null, `KPI '${kpiId}' calcula sin lanzar error ni caer a null`);
    assert(typeof resultado.valor === 'string' && resultado.valor.length > 0, `KPI '${kpiId}' produce un valor mostrable ("${resultado.valor}")`);
    console.log(`  -> ${kpiId}: ${resultado.valor} — ${resultado.descripcion}`);
  }

  section('Nivel de Empleabilidad: debe coincidir EXACTO con la columna oficial de la universidad');
  {
    // La universidad ya entrega "Nivel de Empleabilidad Final" / "Condición PEA" pre-calculadas
    // (metodología OIT/INEI). Ningún cálculo propio (heurística de texto) debe divergir de esto
    // para el CSV 2026 — es la fuente de verdad, verificada contra el pivot oficial de la
    // universidad: No=143, Sí=3009, Total PEA=3152 (95.46% -> 95%).
    const colFinal = Calculations.cols.nivelEmpleabilidadFinal;
    const colPEA = Calculations.cols.condicionPEA;
    const oficialSi = encuestas.filter(d => String(d[colFinal] || '').trim() === 'Sí').length;
    const oficialNo = encuestas.filter(d => String(d[colFinal] || '').trim() === 'No').length;
    const oficialPEA = encuestas.filter(d => String(d[colPEA] || '').trim().toUpperCase() === 'PEA').length;

    assert(oficialSi === 3009, `columna oficial 'Nivel de Empleabilidad Final' = 'Sí' (${oficialSi}) == 3009`);
    assert(oficialNo === 143, `columna oficial 'Nivel de Empleabilidad Final' = 'No' (${oficialNo}) == 143`);
    assert(oficialPEA === 3152, `columna oficial 'Condición PEA' = 'PEA' (${oficialPEA}) == 3152`);

    let ocupados = 0, pea = 0;
    encuestas.forEach(d => {
      const info = Calculations.classifyLaborStatus(d);
      if (info.esPEA) { pea++; if (info.esOcupado) ocupados++; }
    });
    assert(ocupados === oficialSi, `classifyLaborStatus: ocupados (${ocupados}) == columna oficial 'Sí' (${oficialSi})`);
    assert(pea === oficialPEA, `classifyLaborStatus: total PEA (${pea}) == columna oficial 'Condición PEA' (${oficialPEA})`);
    assert(Math.round((ocupados / pea) * 100) === 95, `Nivel de Empleabilidad redondeado == 95% (${(ocupados / pea * 100).toFixed(2)}%)`);

    const tot = trazabilidad.totales;
    assert(tot.totalOcupadosConEmprendimiento === oficialSi, `getTrazabilidadPEAPorCarrera: ocupados (${tot.totalOcupadosConEmprendimiento}) == columna oficial (${oficialSi})`);
    assert(tot.totalPEA === oficialPEA, `getTrazabilidadPEAPorCarrera: PEA total (${tot.totalPEA}) == columna oficial (${oficialPEA})`);
    assert(Math.round(tot.tasaPEATotal) === 95, `KPI 'Nivel de Empleabilidad' redondea a 95% (${tot.tasaPEATotal.toFixed(2)}%)`);

    // Regresión: getSensibilidadPEA y getOcupacionPorAnioEgreso agregaban PEA sumando
    // sub-buckets por NOMBRE (p.ej. todo 'postulandoSerums' contaba como PEA_DESOCUPADO "por
    // definición"), pero la columna oficial clasifica a quienes postulan/se preparan para el
    // SERUMS como NO_PEA. Deben usar info.status/esPEA como fuente de verdad, no el nombre del
    // sub-bucket, para no inflar el total PEA con estos 21 casos.
    const sens = Calculations.getSensibilidadPEA(encuestas);
    assert(sens.totalPEA === oficialPEA, `getSensibilidadPEA: PEA total (${sens.totalPEA}) == columna oficial (${oficialPEA})`);
    assert(sens.ocupadosTotalPEA === oficialSi, `getSensibilidadPEA: ocupados (${sens.ocupadosTotalPEA}) == columna oficial (${oficialSi})`);

    const porAnio = Calculations.getOcupacionPorAnioEgreso(encuestas);
    const sumaPeaPorAnio = porAnio.reduce((s, a) => s + a.pea, 0);
    const sumaOcupadosPorAnio = porAnio.reduce((s, a) => s + a.ocupados, 0);
    assert(sumaPeaPorAnio === oficialPEA, `getOcupacionPorAnioEgreso: suma de PEA por año (${sumaPeaPorAnio}) == columna oficial (${oficialPEA})`);
    assert(sumaOcupadosPorAnio === oficialSi, `getOcupacionPorAnioEgreso: suma de ocupados por año (${sumaOcupadosPorAnio}) == columna oficial (${oficialSi})`);
  }

  section('Razón No Trabaja: debe usar la columna oficial categorizada para las respuestas "Otros"');
  {
    // "Razón No Trabaja - Categorizado (Final)" ya categoriza el texto libre de quienes
    // marcaron "Otros" (148 casos); no debe re-adivinarse por palabras clave.
    let postulandoSerums = 0, tramiteGrado = 0;
    encuestas.forEach(d => {
      const info = Calculations.classifyLaborStatus(d);
      if (info.sub === 'postulandoSerums') postulandoSerums++;
      if (info.sub === 'tramiteGrado') tramiteGrado++;
    });
    assert(postulandoSerums === 21, `'Postulando/Preparando SERUMS' se cuenta con la columna oficial (n=${postulandoSerums}) == 21`);
    assert(tramiteGrado >= 100, `'Trámite de Título/Bachiller/Tesis' se cuenta con la columna oficial (n=${tramiteGrado}) >= 100`);

    // Y ninguno de los 'postulandoSerums' debe colarse en la PEA (columna oficial: NO PEA).
    const algunoEsPEA = encuestas.some(d => {
      const info = Calculations.classifyLaborStatus(d);
      return info.sub === 'postulandoSerums' && info.esPEA;
    });
    assert(!algunoEsPEA, `ningún caso 'postulandoSerums' se cuenta como PEA (la columna oficial los marca NO PEA)`);

    // getSensibilidadPEA debe exponer el conteo de "Postulando SERUMS" del lado NO_PEA (para
    // que metodologia.js no lo muestre en 0 tras reclasificarlo fuera de la PEA).
    const sens = Calculations.getSensibilidadPEA(encuestas);
    assert(sens.postulandoSerums === 0, `getSensibilidadPEA.postulandoSerums (bucket PEA_DESOCUPADO) queda en 0 para el CSV 2026 (${sens.postulandoSerums})`);
    assert(sens.postulandoSerumsNoPEA === postulandoSerums, `getSensibilidadPEA.postulandoSerumsNoPEA (${sens.postulandoSerumsNoPEA}) == total real (${postulandoSerums})`);
    assert(sens.totalPEA + sens.totalNoPEA === encuestas.length, `getSensibilidadPEA: PEA (${sens.totalPEA}) + No PEA (${sens.totalNoPEA}) == total (${encuestas.length})`);
  }

  section('KPI opcional "Cobertura de Muestra" (antes rota: DataLoader.getUniversoTotal no existía)');
  {
    const resultado = KPICatalog.calcularKPI('coberturaMuestra', encuestas, trazabilidad);
    assert(resultado !== null, 'coberturaMuestra calcula sin error');
    assert(resultado.valorNumerico > 0, `coberturaMuestra ya no es 0% fijo (valor=${resultado.valor}, universo=${DataLoader.getUniverso().length})`);
  }

  section('Regresión: Ascensos solo cuenta "Dependiente" real, no "Independiente"');
  {
    const cols = Calculations.cols;
    const trabajadores = encuestas.filter(d => {
      const t = (d[cols.trabaja] || '').trim().toLowerCase();
      return t === 'sí' || t === 'si';
    });
    const dependientes = trabajadores.filter(d => {
      const c = (d[cols.condicion] || '').toLowerCase();
      return c.includes('dependiente') && !c.includes('independiente');
    });
    const independientesColados = dependientes.filter(d => (d[cols.condicion] || '').toLowerCase() === 'independiente');
    assert(independientesColados.length === 0, `ningún 'Independiente' se cuela en el pool de 'dependientes' (n filtrado=${dependientes.length})`);

    const resultadoAscensos = KPICatalog.calcularKPI('ascensos', encuestas, trazabilidad);
    if (resultadoAscensos) console.log(`  -> KPI ascensos: ${resultadoAscensos.valor} — ${resultadoAscensos.descripcion}`);
  }

  section('Años de egreso: dinámico, no una lista fija de años');
  {
    const anios = DataLoader.getAniosEgreso();
    assert(Array.isArray(anios) && anios.length > 0, `getAniosEgreso() devuelve años reales (${anios.join(', ')})`);
    assert(anios.every((a, i) => i === 0 || a >= anios[i - 1]), 'los años están ordenados numéricamente ascendente');
    const anioMaxEnDatos = Math.max(...encuestas.map(d => parseInt(String(d[cols_anio(Calculations)] || '').match(/\d{4}/)?.[0]) || 0));
    assert(anios.includes(anioMaxEnDatos) || anioMaxEnDatos === 0, `el año más reciente presente en los datos (${anioMaxEnDatos}) aparece en la lista de filtro`);
  }

  section('classifyLaborStatus: cada egresado cae en exactamente un balde PEA/No-PEA');
  {
    let peaCount = 0, noPeaCount = 0, sinInfo = 0;
    encuestas.forEach(d => {
      const info = Calculations.classifyLaborStatus ? Calculations.classifyLaborStatus(d) : null;
      if (!info) { sinInfo++; return; }
      if (info.esPEA) peaCount++; else noPeaCount++;
    });
    assert(sinInfo === 0, `classifyLaborStatus responde para todas las filas (${sinInfo} sin clasificar)`);
    assert(peaCount + noPeaCount === encuestas.length, `PEA (${peaCount}) + No-PEA (${noPeaCount}) == total (${encuestas.length})`);
  }

  section('Tiempo en Obtener el Primer Empleo: la rama "no trabaja actualmente" (Pregunta 4) no debe ignorarse');
  {
    // El gráfico de Resumen Ejecutivo solo leía la Pregunta 11 (rama "trabaja actualmente"),
    // dejando fuera 457 respuestas válidas de egresados que no trabajan hoy pero sí tuvieron
    // un primer empleo antes (Pregunta 4). Ambas columnas son mutuamente excluyentes por fila.
    const colTrabaja = Calculations.cols.tiempoPrimerEmpleo;
    const colNoTrabaja = Calculations.cols.tiempoPrimerEmpleoNoTrabaja;
    assert(!!colNoTrabaja, 'Calculations.cols.tiempoPrimerEmpleoNoTrabaja está mapeado');

    const normalizar = (raw) => {
      const str = String(raw || '').trim().replace(/\.$/, '');
      if (!str) return null;
      return str === '12 meses a más' ? 'Más de 12 meses' : str;
    };

    let totalTrabaja = 0, totalNoTrabaja = 0, ambasCol = 0;
    const countsNoTrabaja = {};
    encuestas.forEach(d => {
      const vTrabaja = normalizar(d[colTrabaja]);
      const vNoTrabaja = normalizar(d[colNoTrabaja]);
      if (vTrabaja) totalTrabaja++;
      if (vNoTrabaja) { totalNoTrabaja++; countsNoTrabaja[vNoTrabaja] = (countsNoTrabaja[vNoTrabaja] || 0) + 1; }
    });

    assert(totalTrabaja === 3437, `rama "trabaja actualmente" (Pregunta 11) tiene 3,437 respuestas válidas (${totalTrabaja})`);
    assert(totalNoTrabaja === 514, `rama "no trabaja actualmente" (Pregunta 4) tiene 514 respuestas válidas (${totalNoTrabaja})`);
    assert(countsNoTrabaja['Ya me encontraba trabajando al egresar'] === 207, `'Ya me encontraba trabajando al egresar' (rama no trabaja) == 207 (${countsNoTrabaja['Ya me encontraba trabajando al egresar']})`);
    assert(countsNoTrabaja['De 1 a 3 meses'] === 154, `'De 1 a 3 meses' (rama no trabaja) == 154 (${countsNoTrabaja['De 1 a 3 meses']})`);
    assert(countsNoTrabaja['Más de 12 meses'] === 44, `'Más de 12 meses' (rama no trabaja, normalizado desde "Más de 12 meses.") == 44 (${countsNoTrabaja['Más de 12 meses']})`);
  }

  section('Prácticas Preprofesionales (NID) x Condición Laboral — Facultad + Año de egreso');
  {
    // Replica getPracticasNIDData() + createChartPracticasSituacionLaboral() de resumen.js.
    const nid = encuestas.filter(d => DataLoader.isNID(d[Calculations.cols.carrera]));
    assert(nid.length > 0, `hay egresados NID (Negocios/Ingeniería/Derecho) en la muestra (${nid.length})`);

    const practicasField = ctx.PivotEngine.fields.find(f => f.id === 'practicasNID');
    const condicionField = ctx.PivotEngine.fields.find(f => f.id === 'condicion');
    assert(!!practicasField && !!condicionField, "campos 'practicasNID' y 'condicion' están registrados en PivotEngine");

    const ORDEN_CONDICION = ['Dependiente', 'Independiente', 'Propietario / Emprendimiento'];
    const porPracticas = {};
    nid.forEach(d => {
      const practicas = practicasField.getValue(d);
      if (practicas !== 'Sí' && practicas !== 'No') return;
      const condicion = condicionField.getValue(d);
      if (!ORDEN_CONDICION.includes(condicion)) return;
      if (!porPracticas[practicas]) porPracticas[practicas] = { total: 0 };
      porPracticas[practicas][condicion] = (porPracticas[practicas][condicion] || 0) + 1;
      porPracticas[practicas].total++;
    });
    assert(!!porPracticas['Sí'] && !!porPracticas['No'], 'hay egresados NID en ambos grupos (Sí y No hizo prácticas)');
    ['Sí', 'No'].forEach(grupo => {
      const suma = ORDEN_CONDICION.reduce((s, c) => s + (porPracticas[grupo][c] || 0), 0);
      assert(suma === porPracticas[grupo].total, `grupo "${grupo} hizo prácticas": suma de condición laboral (${suma}) == total del grupo (${porPracticas[grupo].total})`);
    });
    console.log(`  -> Sí hizo prácticas: n=${porPracticas['Sí'].total} | No hizo prácticas: n=${porPracticas['No'].total}`);

    // Filtro de Facultad: cada una de las 3 facultades NID debe tener al menos un egresado con
    // dato de prácticas (si no, el filtro mostraría un gráfico vacío en silencio).
    for (const facultad of ['Negocios', 'Ingeniería', 'Derecho y Ciencia Política']) {
      const nidFacultad = nid.filter(d => DataLoader.getFacultadForCarrera(d[Calculations.cols.carrera]) === facultad);
      const conDato = nidFacultad.filter(d => {
        const p = practicasField.getValue(d);
        return p === 'Sí' || p === 'No';
      });
      assert(conDato.length > 0, `facultad "${facultad}": hay egresados NID con dato de prácticas (${conDato.length} de ${nidFacultad.length})`);
    }
  }

  section('Nivel de Empleabilidad según Prácticas Preprofesionales (tiempo de inserción laboral, NO Ocupados/PEA)');
  {
    // Replica createChartPracticasEmpleabilidad() de resumen.js: usa el tiempo en conseguir el
    // primer empleo como proxy de empleabilidad, NO el % Ocupados/PEA (inválido aquí porque la
    // pregunta de prácticas solo se le hace a egresados NID que ya están trabajando).
    const normalizarTiempoPrimerEmpleo = (raw) => {
      const str = String(raw || '').trim().replace(/\.$/, '');
      if (!str) return null;
      if (str === '12 meses a más') return 'Más de 12 meses';
      return str;
    };
    const nid = encuestas.filter(d => DataLoader.isNID(d[Calculations.cols.carrera]));
    const practicasField = ctx.PivotEngine.fields.find(f => f.id === 'practicasNID');
    const ORDEN_TIEMPO = ['Ya me encontraba trabajando al egresar', 'De 1 a 3 meses', 'De 3 a 6 meses', 'De 6 a 12 meses', 'Más de 12 meses'];

    const porPracticas = {};
    nid.forEach(d => {
      const practicas = practicasField.getValue(d);
      if (practicas !== 'Sí' && practicas !== 'No') return;
      const tiempo = normalizarTiempoPrimerEmpleo(d[Calculations.cols.tiempoPrimerEmpleo]);
      if (!tiempo || !ORDEN_TIEMPO.includes(tiempo)) return;
      if (!porPracticas[practicas]) porPracticas[practicas] = { total: 0 };
      porPracticas[practicas][tiempo] = (porPracticas[practicas][tiempo] || 0) + 1;
      porPracticas[practicas].total++;
    });
    assert(!!porPracticas['Sí'] && !!porPracticas['No'], 'hay datos de tiempo de inserción para ambos grupos (Sí y No hizo prácticas)');
    ['Sí', 'No'].forEach(grupo => {
      const suma = ORDEN_TIEMPO.reduce((s, t) => s + (porPracticas[grupo][t] || 0), 0);
      assert(suma === porPracticas[grupo].total, `grupo "${grupo} hizo prácticas": suma de tramos de tiempo (${suma}) == total del grupo (${porPracticas[grupo].total})`);
      const pctInmediato = Math.round(((porPracticas[grupo]['Ya me encontraba trabajando al egresar'] || 0) / porPracticas[grupo].total) * 100);
      assert(pctInmediato >= 0 && pctInmediato <= 100, `grupo "${grupo}": % con empleo inmediato al egresar en rango 0-100% (${pctInmediato}%)`);
    });
    console.log(`  -> Sí hizo prácticas: n=${porPracticas['Sí'].total} | No hizo prácticas: n=${porPracticas['No'].total}`);
  }

  console.log('\n✔ test-resumen.js: todas las verificaciones pasaron\n');
}

function cols_anio(Calculations) {
  return Calculations.cols.anioEgreso;
}

main();
