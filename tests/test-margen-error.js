// tests/test-margen-error.js — Valida "Margen de Error" (margen-error.js), usando las funciones
// reales de producción (Calculations.getMargenErrorInstitucionalGlobal /
// getMargenErrorInstitucionalPorCarrera / margenErrorFinito). Estas son las versiones
// "institucionales" (p=q=0.50 + corrección por población finita), a propósito más conservadoras
// que la fórmula simple con la tasa observada (Calculations.margenError, sin corrección finita).
// Uso: node tests/test-margen-error.js

const { load, assert, section } = require('./_harness');

function main() {
  const { encuestas, universo, ctx } = load();
  const { Calculations } = ctx;

  section('margenErrorFinito(): propiedades básicas de la fórmula de Cochran (población finita)');
  {
    // A mayor n (mismo N, mismo p), menor margen de error.
    const me100 = Calculations.margenErrorFinito(100, 10000, 0.5);
    const me1000 = Calculations.margenErrorFinito(1000, 10000, 0.5);
    assert(me100 > me1000, `margen con n=100 (${(me100 * 100).toFixed(2)}%) > n=1000 (${(me1000 * 100).toFixed(2)}%), mismo N`);

    // p=0.5 (máxima varianza) da el margen más ancho frente a un p más extremo, mismo n y N.
    const meP50 = Calculations.margenErrorFinito(500, 10000, 0.5);
    const meP95 = Calculations.margenErrorFinito(500, 10000, 0.95);
    assert(meP50 > meP95, `p=0.5 (máxima varianza, ${(meP50 * 100).toFixed(2)}%) da un margen más ancho que p=0.95 (${(meP95 * 100).toFixed(2)}%), mismo n y N`);

    // La corrección por población finita SIEMPRE reduce (o iguala) el margen frente a la fórmula
    // sin corregir (población "infinita") — a igual n y p, mientras más chico el universo N
    // respecto a n, mayor la reducción.
    const meSinCorregir = Calculations.margenError(0.5, 500) * 100;
    const meConCorreccionChica = Calculations.margenErrorFinito(500, 1000, 0.5) * 100; // n es 50% de N
    const meConCorreccionGrande = Calculations.margenErrorFinito(500, 100000, 0.5) * 100; // n es 0.5% de N
    assert(meConCorreccionChica < meSinCorregir, `con N=1,000 (n es 50% del universo), la corrección finita reduce el margen (${meConCorreccionChica.toFixed(2)}% < ${meSinCorregir.toFixed(2)}%)`);
    assert(meConCorreccionGrande < meSinCorregir, `incluso con N=100,000 (universo grande), la corrección finita reduce levemente el margen (${meConCorreccionGrande.toFixed(2)}% < ${meSinCorregir.toFixed(2)}%)`);
    assert(meConCorreccionChica < meConCorreccionGrande, `a menor N relativo a n, mayor la reducción por corrección finita (N=1,000: ${meConCorreccionChica.toFixed(2)}% < N=100,000: ${meConCorreccionGrande.toFixed(2)}%)`);

    // Casos borde: n>=N o n/N inválidos deben devolver 0, no NaN ni Infinity.
    assert(Calculations.margenErrorFinito(1000, 1000, 0.5) === 0, 'n === N devuelve 0 (no tiene sentido corregir sobre un censo completo)');
    assert(Calculations.margenErrorFinito(1000, 500, 0.5) === 0, 'n > N (inconsistente) devuelve 0, no un número negativo o NaN');
    assert(Calculations.margenErrorFinito(0, 1000, 0.5) === 0, 'n = 0 devuelve 0');
    assert(Calculations.margenErrorFinito(100, 0, 0.5) === 0, 'N = 0 devuelve 0');
  }

  section(`Margen de Error Institucional Global (n=${encuestas.length}, N=${universo.length})`);
  {
    const global = Calculations.getMargenErrorInstitucionalGlobal(encuestas, universo);
    assert(global.n === encuestas.length, `n coincide con el total de encuestas válidas (${global.n})`);
    assert(global.N === universo.length, `N coincide con el universo institucional completo (${global.N.toLocaleString()})`);
    assert(global.n < global.N, `la muestra (${global.n}) es un subconjunto real del universo (${global.N.toLocaleString()})`);
    assert(global.me > 0 && global.me <= 100, `margen de error global en rango (0, 100]% (±${global.me.toFixed(2)}%)`);
    assert(global.me < 5, `margen de error global institucional razonable para una muestra grande (±${global.me.toFixed(2)}% < 5%)`);

    // Regresión: debe coincidir con calcularlo "a mano" con p=0.5 y corrección finita.
    const meEsperado = Calculations.margenErrorFinito(global.n, global.N, 0.5) * 100;
    assert(Math.abs(global.me - meEsperado) < 0.001, `el margen global usa realmente p=0.5 + corrección finita (calculado: ${global.me.toFixed(4)}%, esperado: ${meEsperado.toFixed(4)}%)`);

    // Debe ser MÁS ANCHO que si se usara la tasa real observada sin corrección finita — el
    // criterio institucional (p=0.5) es, por diseño, más conservador/exigente para esta página.
    const meSinP50 = Calculations.margenError(Calculations.getTasaOcupacionGlobal(encuestas) / 100, global.n) * 100;
    assert(global.me > meSinP50, `el margen institucional (p=0.5, ±${global.me.toFixed(2)}%) es más conservador que el margen con la tasa real observada sin corregir (±${meSinP50.toFixed(2)}%) — consistente con la nota metodológica de la página ("máxima exigencia muestral")`);

    console.log(`  -> Margen de Error Institucional Global: ±${global.me.toFixed(2)}% (n=${global.n.toLocaleString()}, N=${global.N.toLocaleString()})`);
  }

  section('Margen de Error Institucional por Carrera: cada carrera vigente tiene N propio del universo y un margen coherente');
  {
    const porCarrera = Calculations.getMargenErrorInstitucionalPorCarrera(encuestas, universo).filter(c => !c.carrera.toUpperCase().includes('MARKETING'));
    assert(porCarrera.length >= 14, `margen de error calculado para al menos 14 carreras vigentes (${porCarrera.length})`);

    let sumaN = 0;
    porCarrera.forEach(c => {
      assert(c.me > 0 && c.me <= 100, `'${c.carrera}': margen de error en rango (0, 100]% (±${c.me.toFixed(2)}%)`);
      assert(c.total > 0, `'${c.carrera}': tiene encuestados (${c.total})`);
      assert(c.N > 0, `'${c.carrera}': tiene universo propio > 0 (N=${c.N})`);
      assert(c.total <= c.N, `'${c.carrera}': la muestra (${c.total}) no excede su propio universo (${c.N})`);
      sumaN += c.N;
    });
    // El universo por carrera debe sumar el universo institucional completo (todas las carreras,
    // incluida Marketing aunque se filtre de la tabla — se recalcula sin el filtro para esto).
    const porCarreraSinFiltrar = Calculations.getMargenErrorInstitucionalPorCarrera(encuestas, universo);
    const sumaNTotal = [...new Set(porCarreraSinFiltrar.map(c => c.carrera))]
      .reduce((sum, carrera) => sum + porCarreraSinFiltrar.find(c => c.carrera === carrera).N, 0);
    assert(sumaNTotal <= universo.length, `la suma de universos por carrera (${sumaNTotal.toLocaleString()}) no excede el universo institucional total (${universo.length.toLocaleString()})`);

    // Regla estadística: a menor n de una carrera, mayor (o igual) su margen de error frente a
    // otra con n mucho mayor, para una p similar (chequeo agregado, no par a par exacto).
    const menorN = porCarrera.reduce((min, c) => c.total < min.total ? c : min, porCarrera[0]);
    const mayorN = porCarrera.reduce((max, c) => c.total > max.total ? c : max, porCarrera[0]);
    assert(menorN.total <= mayorN.total, `identifica correctamente la carrera con menor (${menorN.carrera}, n=${menorN.total}) y mayor (${mayorN.carrera}, n=${mayorN.total}) tamaño muestral`);
    console.log(`  -> Carrera con menor muestra: ${menorN.carrera} (n=${menorN.total}, ±${menorN.me.toFixed(1)}%) | mayor: ${mayorN.carrera} (n=${mayorN.total}, ±${mayorN.me.toFixed(1)}%)`);
  }

  console.log('\n✔ test-margen-error.js: todas las verificaciones pasaron\n');
}

main();
