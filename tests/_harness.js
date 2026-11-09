// tests/_harness.js — Carga los datos reales (CSV/Excel) a través del MISMO pipeline de
// limpieza/mapeo que usa el navegador (DataCleaner, DataLoader, Calculations, PivotEngine),
// para que los tests validen la lógica real de producción y no una reimplementación aparte.
//
// Fuente principal: data/respuestas_encuestas_2026.csv (sin DataCleaner, ya viene limpio).
// data/respuestas_encuestas_2025.csv solo se carga bajo demanda con loadEvolutivo(), igual
// que en el navegador (Análisis Evolutivo la pide de forma diferida).
//
// Uso: const { encuestas, universo, ctx } = require('./_harness').load();
//      const encuestas2025 = require('./_harness').loadEvolutivo(ctx);

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const XLSX = require(path.join(ROOT, 'js/vendor/xlsx.full.min.js'));

function loadModulesIntoContext() {
  const sandbox = {
    console,
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Set,
    Map,
    Intl,
    parseInt,
    parseFloat,
    isNaN,
    XLSX
  };
  sandbox.window = sandbox; // los scripts hacen `window.X = ...` y luego usan `X` a secas
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  const files = [
    'js/dataCleaner.js',
    'js/dataLoader.js',
    'js/calculations.js',
    'js/pivotEngine.js',
    'js/kpiCatalog.js'
  ];
  for (const rel of files) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    vm.runInContext(code, sandbox, { filename: rel });
  }
  return sandbox;
}

function sheetToJson(buffer) {
  const wb = XLSX.read(buffer, { type: 'array' });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
}

function sheetToJsonCsv(buffer, opts = {}) {
  const wb = XLSX.read(buffer, { type: 'array', raw: true, ...opts });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
}

function toArrayBuffer(nodeBuffer) {
  return nodeBuffer.buffer.slice(nodeBuffer.byteOffset, nodeBuffer.byteOffset + nodeBuffer.byteLength);
}

function load({ verbose = false } = {}) {
  const ctx = loadModulesIntoContext();

  const encPath = path.join(ROOT, 'data/respuestas_encuestas_2026.csv');
  const uniPath = path.join(ROOT, 'data/universo.xlsx');

  // Fuente principal (2026): delimitador ';', sin DataCleaner (ya viene limpio/categorizado).
  const rawEncuestas = sheetToJsonCsv(toArrayBuffer(fs.readFileSync(encPath)), { FS: ';' });
  const rawUniverso = sheetToJson(toArrayBuffer(fs.readFileSync(uniPath)));

  const encuestas = ctx.DataLoader.sanitizeNullBytes(rawEncuestas);
  const universo = ctx.DataCleaner.clean(rawUniverso, 'universo');

  // DataLoader.getFacultadForCarrera / getCarreras / etc. leen de `this.encuestas`
  ctx.DataLoader.encuestas = encuestas;
  ctx.DataLoader.universo = universo;
  ctx.DataLoader.isLoaded = true;

  if (verbose) {
    console.log(`[harness] encuestas (2026, csv): ${encuestas.length} filas`);
    console.log(`[harness] universo: ${universo.length} filas`);
  }

  return { encuestas, universo, ctx };
}

// Carga bajo demanda del CSV 2025 (solo lo usa Análisis Evolutivo), replicando
// DataLoader.loadEvolutivoData(): mapNewSurveyColumns() + DataCleaner.clean().
function loadEvolutivo(ctx) {
  const encNewPath = path.join(ROOT, 'data/respuestas_encuestas_2025.csv');
  const rawEncuestasNew = sheetToJsonCsv(toArrayBuffer(fs.readFileSync(encNewPath)));
  const mapped = ctx.DataLoader.mapNewSurveyColumns(rawEncuestasNew);
  const encuestasEvolutivo = ctx.DataCleaner.clean(mapped, 'encuestas');
  ctx.DataLoader.encuestasEvolutivo = encuestasEvolutivo;
  ctx.DataLoader.isEvolutivoLoaded = true;
  return encuestasEvolutivo;
}

// --- utilidades comunes para los tests ---

function pct(n, total) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
  console.log('  OK  ' + msg);
}

function section(title) {
  console.log('\n=== ' + title + ' ===');
}

module.exports = { load, loadEvolutivo, pct, assert, section, ROOT };
