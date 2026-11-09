// tests/test-representatividad.js — Valida "Ficha Técnica y Representatividad" (representatividad.js).
// Uso: node tests/test-representatividad.js

const { load, assert, section } = require('./_harness');

function main() {
  const { encuestas, universo, ctx } = load();
  const { Calculations, DataLoader } = ctx;
  DataLoader.universo = universo;

  section(`Universo institucional y cobertura (n=${encuestas.length})`);
  const univFiltrado = DataLoader.getFilteredUniverso({ facultad: 'Todas', carrera: 'Todas' });
  assert(univFiltrado.length > 0, `getFilteredUniverso('Todas') devuelve el universo completo (${univFiltrado.length})`);
  assert(univFiltrado.length === universo.length, `sin filtro, coincide con el universo crudo (${univFiltrado.length} == ${universo.length})`);
  assert(encuestas.length <= univFiltrado.length, `encuestas efectivas (${encuestas.length}) <= universo institucional (${univFiltrado.length})`);

  section('Meta Muestral por Carrera: fórmula de muestreo con corrección por población finita');
  {
    const N1000 = Calculations.getMetaMuestral('CARRERA_SIN_META_PREDEFINIDA_XYZ', 1000);
    const N100 = Calculations.getMetaMuestral('CARRERA_SIN_META_PREDEFINIDA_XYZ', 100);
    assert(N1000 > 0 && N100 > 0, `getMetaMuestral produce metas > 0 (N=1000 -> ${N1000}, N=100 -> ${N100})`);
    assert(N1000 > N100, `un universo más grande (1000) requiere una meta muestral mayor que uno chico (100): ${N1000} > ${N100}`);
    assert(N1000 <= 1000, `la meta muestral (${N1000}) nunca excede el propio universo (1000)`);
    assert(Calculations.getMetaMuestral('CARRERA_SIN_META_PREDEFINIDA_XYZ', 0) === 0, 'getMetaMuestral(carrera, 0) devuelve 0 sin universo (evita división por cero)');
  }

  section('Cobertura por Carrera: contactados vs. meta muestral, sin duplicar ni perder carreras');
  {
    const norm = (s) => (s || '').replace(/_x0000_/g, '').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
    const porCarrera = {};
    const univPorCarrera = {};
    univFiltrado.forEach(u => {
      const c = norm(u.nombre_carrera);
      univPorCarrera[c] = (univPorCarrera[c] || 0) + 1;
      if (!porCarrera[c]) porCarrera[c] = 0;
    });
    encuestas.forEach(d => {
      const carrera = norm(d['CARRERA']);
      porCarrera[carrera] = (porCarrera[carrera] || 0) + 1;
    });
    const carrerasOrdenadas = Object.keys(porCarrera).filter(c => !c.toUpperCase().includes('MARKETING'));
    assert(carrerasOrdenadas.length >= 14, `al menos 14 carreras vigentes tienen fila en la tabla de cobertura (${carrerasOrdenadas.length})`);

    let sumaContactados = 0;
    carrerasOrdenadas.forEach(c => {
      const meta = Calculations.getMetaMuestral(c, univPorCarrera[c] || 0);
      const contactados = porCarrera[c] || 0;
      sumaContactados += contactados;
      assert(meta >= 0, `'${c}': meta muestral no negativa (${meta})`);
      assert(contactados >= 0, `'${c}': contactados no negativo (${contactados})`);
    });
    // Los contactados por carrera deben sumar el total de encuestas vigentes (sin Marketing).
    const totalSinMarketing = encuestas.filter(d => !norm(d['CARRERA']).includes('MARKETING')).length;
    assert(sumaContactados === totalSinMarketing, `suma de contactados por carrera (${sumaContactados}) == total de encuestas vigentes (${totalSinMarketing})`);
  }

  section('Trazabilidad PEA por Carrera: mismos totales que el resto del dashboard');
  {
    const trazabilidad = Calculations.getTrazabilidadPEAPorCarrera(encuestas);
    const carrerasPEA = trazabilidad.carreras.filter(c => !c.carrera.toUpperCase().includes('MARKETING'));
    assert(carrerasPEA.length >= 14, `trazabilidad PEA cubre al menos 14 carreras vigentes (${carrerasPEA.length})`);
    const sumaPEA = carrerasPEA.reduce((s, c) => s + c.pea, 0);
    const sumaNoPEA = carrerasPEA.reduce((s, c) => s + c.noPea, 0);
    // No suman exactamente `encuestas.length` porque Marketing queda excluido de carrerasPEA,
    // pero sí deben ser <= al total y > 0.
    assert(sumaPEA + sumaNoPEA > 0 && sumaPEA + sumaNoPEA <= encuestas.length, `PEA (${sumaPEA}) + No-PEA (${sumaNoPEA}) por carrera vigente es un subconjunto válido del total (${encuestas.length})`);
    console.log(`  -> ${carrerasPEA.length} carreras vigentes | PEA total (sin Marketing): ${sumaPEA.toLocaleString()} | No-PEA: ${sumaNoPEA.toLocaleString()}`);
  }

  console.log('\n✔ test-representatividad.js: todas las verificaciones pasaron\n');
}

main();
