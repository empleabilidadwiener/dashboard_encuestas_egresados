// tests/test-preguntas-abiertas.js — Valida "NPS y Cualitativo" (preguntas-abiertas.js)
// contra los datos reales, usando la MISMA lógica de producción.
// Uso: node tests/test-preguntas-abiertas.js

const { load, assert, section } = require('./_harness');

function main() {
  const { encuestas, ctx } = load();
  const { Calculations } = ctx;

  section(`NPS Institucional (n=${encuestas.length})`);
  const metricas = Calculations.getNPSMetricasDetalladas(encuestas, 'global');
  assert(Math.round(metricas.nps) === 39, `NPS institucional se mantiene en +39 tras leer el segmento oficial (${Math.round(metricas.nps)})`);
  assert(metricas.total === 3592, `NPS institucional cubre a todos los encuestados que dieron nota (${metricas.total})`);

  section('Segmento NPS: debe coincidir con la columna oficial (Promotor/Neutral/Detractor)');
  {
    const colScore = Calculations.cols.nps;
    const colSegmento = Calculations.cols.segmentoNPS;
    let mismatches = 0;
    encuestas.forEach(d => {
      const scoreVal = d[colScore];
      const segOficial = String(d[colSegmento] || '').trim();
      if (scoreVal === undefined || scoreVal === null || scoreVal === '' || !segOficial) return;
      const s = parseFloat(scoreVal);
      if (isNaN(s)) return;
      const esperado = s >= 9 ? 'promotor' : (s >= 7 ? 'neutro' : 'detractor');
      const oficial = Calculations._sentimientoNPS(segOficial, s);
      if (esperado !== oficial) mismatches++;
    });
    assert(mismatches === 0, `el segmento oficial coincide 100% con el umbral estándar de NPS (mismatches=${mismatches})`);
  }

  section('Razón NPS Categorizada: debe estar poblada para (casi) todos los comentarios');
  {
    const conRazon = metricas.comentarios.filter(c => c.razonCategorizada).length;
    assert(conRazon === metricas.comentarios.length,
      `todos los comentarios traen 'razonCategorizada' (${conRazon} de ${metricas.comentarios.length})`);

    const razonCounts = {};
    metricas.comentarios.forEach(c => {
      if (c.razonCategorizada && c.razonCategorizada !== 'Sin respuesta') {
        razonCounts[c.razonCategorizada] = (razonCounts[c.razonCategorizada] || 0) + 1;
      }
    });
    assert(razonCounts['Docentes'] > 900, `'Docentes' es el principal driver de la nota NPS (n=${razonCounts['Docentes']})`);
    console.log('  -> Top razón NPS:', Object.entries(razonCounts).sort((a, b) => b[1] - a[1])[0]);
  }

  console.log('\n✔ test-preguntas-abiertas.js: todas las verificaciones pasaron\n');
}

main();
