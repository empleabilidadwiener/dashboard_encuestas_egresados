// test_questions.js - Script de prueba automatizado para verificar las 18 preguntas
const fs = require('fs');
const vm = require('vm');

const sandbox = { window: {}, console };
sandbox.window = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

vm.runInContext(fs.readFileSync('js/vendor/xlsx.full.min.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('js/dataCleaner.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('js/calculations.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('js/pivotEngine.js', 'utf8'), sandbox);

const buf = fs.readFileSync('data/respuestas_encuestas.xlsx');
const wb = sandbox.XLSX.read(buf, { type: 'buffer' });
const rawData = sandbox.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
const cleanData = sandbox.DataCleaner.clean(rawData, 'encuestas');

const rgCode = fs.readFileSync('js/pages/resultados-generales.js', 'utf8');
const questionsMatch = rgCode.match(/const QUESTIONS = (\[[\s\S]*?\]);\n\nconst UNDEFINED_LABELS/);
const QUESTIONS = eval(questionsMatch[1]);

console.log('Verificación de las 18 preguntas en Resultados Generales:');
let passed = 0;
for (const q of QUESTIONS) {
  if (q.multiple) {
    let sum = 0;
    for (const f of q.fields) {
      const colKey = sandbox.Calculations?.cols?.[f.id] || f.id;
      const count = cleanData.filter(row => {
        const v = String(row[colKey] || '').trim().toLowerCase();
        return v === '1' || v === 'sí' || v === 'si';
      }).length;
      sum += count;
    }
    console.log(`[MULTIPLE OK] ${q.id.padEnd(20)} (${q.titulo}): ${sum} respuestas afirmativas`);
    if (sum > 0) passed++;
  } else {
    const f = sandbox.PivotEngine.fields.find(field => field.id === q.fieldId);
    if (!f) {
      console.error(`[ERROR FALTANTE] ${q.id}: Campo '${q.fieldId}' no existe en PivotEngine!`);
    } else {
      const vals = cleanData.map(r => f.getValue(r)).filter(v => v && v !== 'No precisa' && v !== 'Trabaja actualmente / No aplica' && v !== 'No aplica / No precisa');
      console.log(`[SINGLE OK]   ${q.id.padEnd(20)} (${q.titulo}): ${vals.length} registros válidos`);
      if (vals.length > 0) passed++;
    }
  }
}
console.log(`\nResultado: ${passed} de ${QUESTIONS.length} preguntas verificadas con éxito.`);
