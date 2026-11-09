// tests/test-visor-datos.js — Valida el filtro de privacidad y exclusiones del "Visor de Datos"
// (visor-datos.js). No expone funciones puras (todo vive dentro de loadVisorDatosPage), así que
// este test replica la MISMA lista de columnas sensibles y la misma regla de exclusión de carrera,
// contra las columnas reales del CSV 2026.
// Uso: node tests/test-visor-datos.js

const { load, assert, section } = require('./_harness');

function main() {
  const { encuestas } = load();

  section('Filtro de privacidad: columnas sensibles nunca deben quedar visibles por defecto');
  {
    const cleanData = encuestas.filter(d => !String(d['CARRERA'] || '').toUpperCase().includes('MARKETING'));
    assert(cleanData.length > 0, `hay filas tras excluir Marketing (${cleanData.length})`);
    assert(cleanData.length < encuestas.length, `excluir Marketing reduce el total (${cleanData.length} < ${encuestas.length})`);

    const sensitiveCols = ['dni', 'telefono', 'teléfono', 'celular', 'email', 'correo', 'nombres', 'apellidos', 'código'];
    const allHeaders = Object.keys(cleanData[0] || {});
    assert(allHeaders.length > 0, `hay columnas en el dataset (${allHeaders.length})`);
    const safeHeaders = allHeaders.filter(h => !sensitiveCols.some(sc => h.toLowerCase().includes(sc)));

    // Regresión documentada en el propio código: la comparación debe ser en minúsculas por ambos
    // lados (antes 'DNI:' con mayúsculas nunca calzaba contra el header ya en minúsculas).
    const dniHeader = allHeaders.find(h => h.toLowerCase().includes('dni'));
    assert(!!dniHeader, `el header de DNI existe en el dataset real ("${dniHeader}")`);
    assert(!safeHeaders.includes(dniHeader), `'${dniHeader}' queda excluido de las columnas mostrables`);

    const nombresHeader = allHeaders.find(h => h.toLowerCase().includes('nombres'));
    if (nombresHeader) assert(!safeHeaders.includes(nombresHeader), `'${nombresHeader}' (nombres y apellidos) queda excluido`);

    const correoHeader = allHeaders.find(h => h.toLowerCase().includes('correo'));
    if (correoHeader) assert(!safeHeaders.includes(correoHeader), `'${correoHeader}' queda excluido`);

    const celularHeader = allHeaders.find(h => h.toLowerCase().includes('celular'));
    if (celularHeader) assert(!safeHeaders.includes(celularHeader), `'${celularHeader}' queda excluido`);

    // Columnas NO sensibles (analíticas) sí deben seguir visibles — si el filtro fuera demasiado
    // agresivo, la página se quedaría sin nada útil que mostrar.
    assert(safeHeaders.includes('CARRERA'), "'CARRERA' sigue disponible para mostrar (no es dato sensible)");
    assert(safeHeaders.length > 50, `quedan suficientes columnas analíticas visibles (${safeHeaders.length} de ${allHeaders.length})`);

    console.log(`  -> ${allHeaders.length} columnas totales, ${allHeaders.length - safeHeaders.length} excluidas por sensibles, ${safeHeaders.length} visibles`);
  }

  console.log('\n✔ test-visor-datos.js: todas las verificaciones pasaron\n');
}

main();
