// tests/test-data-pipeline.js — Valida la migración a respuestas_encuestas_2026.csv como
// fuente principal (sin DataCleaner) y la carga diferida de respuestas_encuestas_2025.csv
// para Análisis Evolutivo. Cubre justo la clase de bugs que aparecieron al migrar:
// columnas renombradas, texto crudo en vez de etiquetas cortas, artefactos de encoding.
//
// Uso: node tests/test-data-pipeline.js

const { load, loadEvolutivo, assert, section } = require('./_harness');

function main() {
  const { encuestas, universo, ctx } = load();
  const { Calculations, DataLoader, PivotEngine } = ctx;

  section('Carga de la fuente principal (2026 CSV)');
  assert(encuestas.length > 2900, `respuestas_encuestas_2026.csv carga con volumen esperado (${encuestas.length} filas)`);
  assert(universo.length > 5000, `universo.xlsx carga correctamente (${universo.length} filas)`);
  assert(DataLoader.getCarreras().length === 17, `17 carreras reales (sin fragmentar por artefactos \\u0000): ${DataLoader.getCarreras().length}`);
  assert(!DataLoader.getCarreras().some(c => c.includes('\u0000')), 'ninguna carrera conserva el artefacto de encoding \\u0000');

  section('Columnas renombradas en el CSV 2026 (Calculations.cols)');
  assert(encuestas.some(d => d[Calculations.cols.anioEgreso] !== undefined), `anioEgreso resuelve a la columna real ('${Calculations.cols.anioEgreso}')`);
  assert(DataLoader.getAniosEgreso().length === 7, `getAniosEgreso() encuentra los 7 años de la cohorte (${DataLoader.getAniosEgreso().join(', ')})`);

  section('Regresión: texto crudo del instrumento en vez de etiquetas cortas (DataCleaner bypaseado)');
  {
    // 'condicion' llega como oración completa ("Trabajador dependiente (empleado...)"),
    // no como 'Dependiente'. PivotEngine debe seguir clasificando bien por subcadena.
    const rawCondicion = encuestas.find(d => d[Calculations.cols.condicion])[Calculations.cols.condicion];
    assert(rawCondicion.length > 15, `condicion trae el texto completo del instrumento, no la etiqueta corta ("${rawCondicion}")`);
    const condicionField = PivotEngine.fields.find(f => f.id === 'condicion');
    const counted = {};
    encuestas.forEach(d => { const v = condicionField.getValue(d); if (v !== 'No precisa') counted[v] = (counted[v] || 0) + 1; });
    assert(Object.keys(counted).sort().join(',') === 'Dependiente,Independiente,Propietario / Emprendimiento',
      `PivotEngine normaliza el texto crudo a las 3 categorías canónicas: ${Object.keys(counted).join(', ')}`);
  }

  section('Regresión: variantes de redacción del salario (con/sin punto, espacios, "soles")');
  {
    const col = Calculations.cols.salario;
    const variantesVistas = new Set(encuestas.map(d => d[col]).filter(Boolean));
    assert(variantesVistas.size >= 5, `hay variantes de redacción reales de salario en el CSV 2026 (${variantesVistas.size} distintas)`);
  }

  section('Carga diferida (lazy) del CSV 2025 — Análisis Evolutivo');
  {
    assert(!DataLoader.isEvolutivoLoaded, 'el CSV 2025 NO se carga hasta que se pide explícitamente (lazy)');
    const encuestas2025 = loadEvolutivo(ctx);
    assert(DataLoader.isEvolutivoLoaded, 'loadEvolutivo() marca el dataset como cargado');
    assert(encuestas2025.length > 4000, `respuestas_encuestas_2025.csv carga con volumen esperado (${encuestas2025.length} filas)`);
    assert(encuestas2025[0]['Año de egreso:'] !== undefined, "el dataset 2025 conserva su columna histórica 'Año de egreso:' (con dos puntos)");

    const anios2026 = new Set(encuestas.map(d => String(d['Año de Egreso'] || '').match(/\d{4}/)?.[0]).filter(Boolean));
    const anios2025 = new Set(encuestas2025.map(d => String(d['Año de egreso:'] || '').match(/\d{4}/)?.[0]).filter(Boolean));
    const comunes = [...anios2026].filter(a => anios2025.has(a));
    assert(comunes.length > 0, `hay años en común entre 2025 y 2026 para comparar en Análisis Evolutivo (${comunes.sort().join(', ')})`);
  }

  console.log('\n✔ test-data-pipeline.js: todas las verificaciones pasaron\n');
}

main();
