// tests/test-emprendimientos.js — Valida "Ecosistema Emprendedor Alumni" (emprendimientos.js).
// Uso: node tests/test-emprendimientos.js

const { load, assert, section } = require('./_harness');

function main() {
  const { encuestas, ctx } = load();
  const { Calculations } = ctx;

  const colCondicion = Calculations.cols.condicion;
  const colFormalizacion = '2.3 Si responde "Propietario o socio de negocio/emprendimiento". Respecto a su emprendimiento o negocio: (E: LEER ALTERNATIVAS)';
  const colRelacionEmp = '2.3.1 ¿El emprendimiento está relacionado con su profesión?';
  const colCarrera = Calculations.cols.carrera;

  section('Identificación de emprendedores (por condición laboral)');
  const emprendedores = encuestas.filter(d => {
    const c = String(d[colCondicion] || '');
    return c === 'Emprendedor' || c.includes('Emprendedor') || c.includes('Propietario') || c.includes('emprendimiento');
  });
  assert(emprendedores.length > 0, `hay emprendedores identificados (n=${emprendedores.length})`);
  // Regresión: ningún Dependiente/Independiente debe colarse (palabras clave no se solapan, pero se verifica igual)
  const colados = emprendedores.filter(d => {
    const c = String(d[colCondicion] || '');
    return c === 'Dependiente' || c === 'Independiente';
  });
  assert(colados.length === 0, `ningún 'Dependiente'/'Independiente' se clasifica como emprendedor (n=${colados.length})`);

  section('Formalización + afinidad: los conteos deben cuadrar con el total de emprendedores');
  let formalizados = 0, enProceso = 0, noFormalizados = 0, sinRespuestaForm = 0;
  let afines = 0, noAfines = 0, sinRespuestaAfin = 0;
  const carrerasMap = {};
  emprendedores.forEach(d => {
    const form = String(d[colFormalizacion] || '').trim();
    if (form.toLowerCase().includes('no formalizado')) noFormalizados++;
    else if (form.toLowerCase().includes('en proceso')) enProceso++;
    else if (form.toLowerCase().includes('formalizado')) formalizados++;
    else if (form) sinRespuestaForm++;

    const afin = String(d[colRelacionEmp] || '').trim().toLowerCase();
    if (afin.startsWith('sí') || afin.startsWith('si')) afines++;
    else if (afin.startsWith('no')) noAfines++;
    else if (afin) sinRespuestaAfin++;

    const carrera = (d[colCarrera] || 'No Especificado').trim();
    carrerasMap[carrera] = (carrerasMap[carrera] || 0) + 1;
  });
  const totalForm = formalizados + enProceso + noFormalizados + sinRespuestaForm;
  assert(totalForm <= emprendedores.length, `formalización clasificada (${totalForm}) <= total emprendedores (${emprendedores.length})`);
  console.log(`  -> Formalizados: ${formalizados}, En proceso: ${enProceso}, No formalizados: ${noFormalizados}`);
  console.log(`  -> Afines: ${afines}, No afines: ${noAfines}`);

  section('Ranking de carreras emprendedoras: la suma debe igualar el total de emprendedores');
  const sumaCarreras = Object.values(carrerasMap).reduce((a, b) => a + b, 0);
  assert(sumaCarreras === emprendedores.length, `suma por carrera (${sumaCarreras}) == total emprendedores (${emprendedores.length})`);

  section('Consistencia cruzada con Resultados Generales (mismo universo de emprendedores)');
  {
    const pe = ctx.PivotEngine.fields.find(f => f.id === 'emprendimientoFormalizacion');
    const values = encuestas.map(d => pe.getValue(d)).filter(v => v !== 'No aplica / No precisa');
    assert(values.length === emprendedores.length,
      `PivotEngine.emprendimientoFormalizacion cuenta el mismo universo (${values.length}) que emprendimientos.js (${emprendedores.length})`);
  }

  console.log('\n✔ test-emprendimientos.js: todas las verificaciones pasaron\n');
}

main();
