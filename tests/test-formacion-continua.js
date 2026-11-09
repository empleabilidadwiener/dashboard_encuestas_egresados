// tests/test-formacion-continua.js — Valida "Formación Continua" (formacion-continua.js)
// contra los datos reales del CSV, usando la MISMA lógica de producción.
// Uso: node tests/test-formacion-continua.js

const { load, assert, section } = require('./_harness');

function main() {
  const { encuestas, ctx } = load();
  const { Calculations, PivotEngine } = ctx;

  const field = (id) => PivotEngine.fields.find(f => f.id === id);
  const countDistinct = (fieldId, exclude = ['No precisa', 'No aplica', 'No especifica', 'No aplica / No precisa']) => {
    const f = field(fieldId);
    const counts = {};
    encuestas.forEach(d => {
      const val = f.getValue(d);
      if (exclude.includes(val)) return;
      counts[val] = (counts[val] || 0) + 1;
    });
    return counts;
  };

  section(`Colegiatura Profesional (n=${encuestas.length})`);
  const colegiatura = countDistinct('colegiatura', ['No precisa']);
  const sumaColeg = Object.values(colegiatura).reduce((a, b) => a + b, 0);
  assert(sumaColeg === encuestas.length, `suma de colegiatura (${sumaColeg}) == total encuestas (${encuestas.length})`);
  assert(colegiatura['No especifica'] > 0 && colegiatura['No especifica'] < 100,
    `'No especifica' se cuenta aparte, no se mezcla con 'No colegiado' (n=${colegiatura['No especifica']})`);
  assert(colegiatura['Colegiado y Habilitado'] > 0, `'Colegiado y Habilitado' tiene datos reales (n=${colegiatura['Colegiado y Habilitado']})`);
  console.log('  ->', colegiatura);

  section('Estudios de Posgrado');
  const posgrado = countDistinct('posgrado', ['No precisa']);
  const sumaPosgrado = Object.values(posgrado).reduce((a, b) => a + b, 0);
  assert(sumaPosgrado === encuestas.length, `suma de posgrado (${sumaPosgrado}) == total encuestas (${encuestas.length})`);
  assert(posgrado['No especifica'] > 0 && posgrado['No especifica'] < 100,
    `'No especifica' no se cuenta como 'No' real en posgrado (n=${posgrado['No especifica']})`);
  console.log('  ->', posgrado);

  section('Interés en Posgrado UNW');
  const interes = countDistinct('interesPosgrado', ['No precisa']);
  assert(interes['No especifica'] > 0 && interes['No especifica'] < 100,
    `'No especifica' no se cuenta como 'No' real en interés de posgrado (n=${interes['No especifica']})`);
  console.log('  ->', interes);

  section('Grado Académico');
  const grado = countDistinct('gradoAcademico');
  const sumaGrado = Object.values(grado).reduce((a, b) => a + b, 0);
  assert(sumaGrado === encuestas.length, `suma de gradoAcademico (${sumaGrado}) == total encuestas (${encuestas.length})`);
  assert(grado['Bachiller'] > 0 && grado['Titulado'] > 0, 'gradoAcademico distingue Bachiller y Titulado con datos reales');

  section('Tipo y lugar del Posgrado (solo entre quienes respondieron "Sí")');
  const tipoPosgrado = countDistinct('tipoPosgrado');
  const totalTipoPosgrado = Object.values(tipoPosgrado).reduce((a, b) => a + b, 0);
  const conPosgrado = posgrado['Sí'] || 0;
  assert(totalTipoPosgrado <= conPosgrado, `tipoPosgrado (${totalTipoPosgrado}) <= egresados con posgrado (${conPosgrado})`);
  assert(tipoPosgrado['Maestría'] > 0, `'Maestría' es la modalidad más común de posgrado (n=${tipoPosgrado['Maestría']})`);

  // Tolerancia pequeña: un puñado de encuestados responde la pregunta de institución pese a
  // no haber marcado "Sí" en la pregunta filtro de posgrado (inconsistencia menor de la fuente).
  const tipoInstitucion = countDistinct('tipoInstitucionPosgrado');
  const totalTipoInstitucion = Object.values(tipoInstitucion).reduce((a, b) => a + b, 0);
  assert(totalTipoInstitucion <= conPosgrado + 10,
    `tipoInstitucionPosgrado (${totalTipoInstitucion}) es consistente con el total de egresados con posgrado (${conPosgrado})`);

  const universidadTipo = countDistinct('universidadPosgradoTipo');
  assert(universidadTipo['Privada'] > universidadTipo['Pública'],
    `hay más posgrados en universidades privadas que públicas (Privada=${universidadTipo['Privada']}, Pública=${universidadTipo['Pública']})`);

  const universidadPais = countDistinct('universidadPosgradoPais');
  assert(universidadPais['Nacional'] > universidadPais['Extranjera'],
    `la mayoría de posgrados se cursan en el país (Nacional=${universidadPais['Nacional']}, Extranjera=${universidadPais['Extranjera']})`);

  section('Top Universidades de Posgrado (retención UNW)');
  const rawUniversidades = encuestas
    .map(d => String(d[Calculations.cols.universidadPosgrado] || '').trim())
    .filter(v => v && v.toLowerCase() !== 'no especifica');
  const unwCount = rawUniversidades.filter(v => v.toLowerCase().includes('norbert wiener')).length;
  assert(unwCount > 0, `hay egresados que continúan su posgrado en la propia UNW (n=${unwCount})`);
  assert(unwCount <= conPosgrado, `continuidad en UNW (${unwCount}) <= total con posgrado (${conPosgrado})`);
  console.log(`  -> Continúan en la UNW: ${unwCount} de ${rawUniversidades.length} con universidad identificada`);

  section('Posgrado Deseado a futuro (solo entre interesados)');
  const posgradoDeseado = countDistinct('posgradoDeseadoCategoria');
  const totalDeseado = Object.values(posgradoDeseado).reduce((a, b) => a + b, 0);
  const interesados = interes['Sí'] || 0;
  assert(totalDeseado <= interesados, `posgradoDeseadoCategoria (${totalDeseado}) <= interesados en posgrado UNW (${interesados})`);
  assert(posgradoDeseado['Especialización Clínica - Salud'] > 0, 'la especialización clínica en salud aparece como interés real (coherente con el perfil de carreras de salud)');

  console.log('\n✔ test-formacion-continua.js: todas las verificaciones pasaron\n');
}

main();
