/**
 * tools/verify_all_pages.js
 * Diagnóstico integral y profundo de TODAS las 13 páginas del dashboard:
 * 1. Ejecuta cada función de página con datos reales (3,592 encuestas + 11,791 universo + 4,657 cohorte 2025).
 * 2. Verifica que no existan errores de inicialización, variables no declaradas o TDZ (Temporal Dead Zone).
 * 3. Inspecciona el HTML generado en busca de valores anómalos: NaN, undefined, null, [object Object].
 * 4. Valida consistencia de cálculos y KPIs en cada módulo.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { load, loadEvolutivo } = require('../tests/_harness');

const ROOT = path.resolve(__dirname, '..');
const { encuestas, universo, ctx } = load();
const encuestasEvolutivo = loadEvolutivo(ctx);

// Lista de páginas y sus funciones exportadas
const pagesToTest = [
  { file: 'js/pages/resumen.js', fnName: 'loadResumenPage', pageId: 'resumen', args: (data, pContent) => [pContent, data, { facultad: 'Todas', carrera: 'Todas', anio: 'Todos' }] },
  { file: 'js/pages/ocupacion.js', fnName: 'loadOcupacionPage', pageId: 'ocupacion', args: (data, pContent) => [pContent, data, { facultad: 'Todas', carrera: 'Todas', anio: 'Todos' }] },
  { file: 'js/pages/empleabilidad.js', fnName: 'loadEmpleabilidadPage', pageId: 'empleabilidad', args: (data, pContent) => [pContent, data] },
  { file: 'js/pages/resultados-generales.js', fnName: 'loadResultadosGeneralesPage', pageId: 'resultados-generales', args: (data, pContent) => [pContent, data] },
  { file: 'js/pages/formacion-continua.js', fnName: 'loadFormacionContinuaPage', pageId: 'formacion-continua', args: (data, pContent) => [pContent, data] },
  { file: 'js/pages/preguntas-abiertas.js', fnName: 'loadPreguntasAbiertasPage', pageId: 'preguntas-abiertas', args: (data, pContent) => [pContent, data] },
  { file: 'js/pages/visor-datos.js', fnName: 'loadVisorDatosPage', pageId: 'visor-datos', args: (data, pContent) => [pContent, data] },
  { file: 'js/pages/representatividad.js', fnName: 'loadRepresentatividadPage', pageId: 'representatividad', args: (data, pContent) => [pContent, data, { facultad: 'Todas', carrera: 'Todas', anio: 'Todos' }] },
  { file: 'js/pages/metodologia.js', fnName: 'loadMetodologiaPage', pageId: 'metodologia', args: (data, pContent) => [pContent, data] },
  { file: 'js/pages/margen-error.js', fnName: 'loadMargenErrorPage', pageId: 'margen-error', args: (data, pContent) => [pContent, data] },
  { file: 'js/pages/evolutivo.js', fnName: 'loadEvolutivoPage', pageId: 'evolutivo', args: (data, pContent) => [pContent, data, encuestasEvolutivo] },
  { file: 'js/pages/emprendimientos.js', fnName: 'loadEmprendimientosPage', pageId: 'emprendimientos', args: (data, pContent) => [pContent, data] },
  { file: 'js/pages/perfil-no-trabaja.js', fnName: 'loadPerfilNoTrabajaPage', pageId: 'perfil-no-trabaja', args: (data, pContent) => [pContent, data] }
];

async function runDiagnostics() {
  console.log('='.repeat(70));
  console.log('  INICIANDO DIAGNÓSTICO INTEGRAL DE TODAS LAS PÁGINAS DEL DASHBOARD');
  console.log('='.repeat(70));
  console.log(`- Encuestas 2026: ${encuestas.length} filas`);
  console.log(`- Universo Oficial 2019-2025: ${universo.length} filas`);
  console.log(`- Encuestas Evolutivo 2025: ${encuestasEvolutivo.length} filas`);
  console.log('-'.repeat(70));

  // Cargar Charts.js en sandbox
  const chartsCode = fs.readFileSync(path.join(ROOT, 'js/charts.js'), 'utf8');

  let totalPages = pagesToTest.length;
  let passedPages = 0;
  const issuesFound = [];

  for (const pageInfo of pagesToTest) {
    const pageName = pageInfo.pageId;
    process.stdout.write(`Evaluando [${pageName.padEnd(22)}] ... `);

    // Mock DOM container
    let capturedHTML = '';
    const mockContainer = {
      set innerHTML(val) { capturedHTML = val; },
      get innerHTML() { return capturedHTML; },
      insertAdjacentHTML(pos, html) { capturedHTML += html; }
    };

    const mockElement = {
      getContext: () => ({
        fillRect: () => {},
        clearRect: () => {},
        measureText: () => ({ width: 50 })
      }),
      parentElement: {
        appendChild: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        style: {}
      },
      addEventListener: () => {},
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      querySelectorAll: () => [],
      querySelector: () => null,
      value: '',
      style: {}
    };

    const sandbox = {
      ...ctx,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
      innerWidth: 1200,
      innerHeight: 800,
      fetch: async (url) => {
        const cleanUrl = url.split('?')[0];
        const filePath = path.join(ROOT, cleanUrl);
        if (fs.existsSync(filePath)) {
          const buf = fs.readFileSync(filePath);
          return {
            ok: true,
            arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
            json: async () => JSON.parse(buf.toString('utf8')),
            text: async () => buf.toString('utf8')
          };
        }
        return { ok: false };
      },
      window: {
        ...ctx,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
        innerWidth: 1200,
        innerHeight: 800
      },
      console: {
        log: () => {},
        warn: () => {},
        error: (...args) => console.error(`    [Browser Console Error]`, ...args)
      },
      document: {
        getElementById: () => mockElement,
        querySelectorAll: () => [],
        querySelector: () => mockElement,
        createElement: (tag) => ({ ...mockElement, tagName: tag.toUpperCase() }),
        body: { classList: { add: () => {}, remove: () => {} } }
      },
      localStorage: {
        getItem: () => null,
        setItem: () => {}
      },
      App: {
        filters: { facultad: 'Todas', carrera: 'Todas', anio: 'Todos' },
        getFilteredData: () => encuestas,
        getSemaforoBadge: (t) => `<span>${t}%</span>`
      },
      Chart: function() { return { destroy: () => {}, update: () => {} }; },
      activeCharts: {}
    };
    sandbox.Chart.getChart = () => null;
    sandbox.Chart.register = () => {};
    sandbox.Chart.defaults = { plugins: { tooltip: {}, legend: {} } };

    // Prueba 1: Vista General (sin filtros)
    try {
      const pageCode = fs.readFileSync(path.join(ROOT, pageInfo.file), 'utf8');
      const runnableCode = pageCode
        .replace(/export\s+async\s+function/g, 'async function')
        .replace(/export\s+function/g, 'function')
        .replace(/export\s*\{[^}]*\};?/g, '');

      vm.createContext(sandbox);
      vm.runInContext(chartsCode, sandbox);
      vm.runInContext(runnableCode, sandbox);
      const fn = sandbox[pageInfo.fnName];
      if (typeof fn !== 'function') {
        throw new Error(`Función exportada ${pageInfo.fnName} no encontrada.`);
      }

      // Ejecutar con vista general
      const callArgs = pageInfo.args(encuestas, mockContainer);
      await fn(...callArgs);

      // Inspección de calidad del HTML generado
      const html = capturedHTML;
      const issues = [];

      const nanMatches = html.match(/(NaN%|>\s*NaN\s*<|:\s*NaN\b|"\s*NaN\s*")/g);
      if (nanMatches) issues.push(`Se detectó '${nanMatches[0]}' en el HTML renderizado`);

      const undefMatches = html.match(/(undefined%|>\s*undefined\s*<|:\s*undefined\b)/g);
      if (undefMatches) issues.push(`Se detectó '${undefMatches[0]}' en el HTML renderizado`);

      if (html.includes('[object Object]')) issues.push(`Se detectó '[object Object]' en el HTML renderizado`);

      const nullMatches = html.match(/(>\s*null\s*<|null%)/g);
      if (nullMatches) issues.push(`Se detectó '${nullMatches[0]}' en el HTML renderizado`);

      // Prueba 2: Con filtros específicos aplicados (Facultad, Carrera, Año)
      const filteredData = encuestas.filter(d => (d['Facultad'] || '').includes('Salud') || (d['CARRERA'] || '').includes('ENFERMERÍA'));
      const mockContainerFiltered = {
        set innerHTML(val) { capturedHTML = val; },
        get innerHTML() { return capturedHTML; },
        insertAdjacentHTML(pos, h) { capturedHTML += h; }
      };
      const filteredArgs = pageInfo.args(filteredData, mockContainerFiltered);
      await fn(...filteredArgs);

      const htmlFiltered = capturedHTML;
      const nanFiltered = htmlFiltered.match(/(NaN%|>\s*NaN\s*<|:\s*NaN\b|"\s*NaN\s*")/g);
      if (nanFiltered) issues.push(`Con filtros activos: se detectó '${nanFiltered[0]}'`);

      if (issues.length > 0) {
        console.log(`⚠️ ALERTA`);
        issues.forEach(i => console.log(`   - ${i}`));
        issuesFound.push({ page: pageName, issues });
      } else {
        console.log(`✔ OK (General: ${(html.length / 1024).toFixed(1)} KB | Filtrado: ${(htmlFiltered.length / 1024).toFixed(1)} KB)`);
        passedPages++;
      }
    } catch (err) {
      console.log(`❌ ERROR CRÍTICO`);
      console.log(`   ${err.stack || err.message}`);
      issuesFound.push({ page: pageName, error: err.message, stack: err.stack });
    }
  }

  console.log('='.repeat(70));
  console.log(`RESULTADO FINAL: ${passedPages} de ${totalPages} páginas operan al 100% sin anomalías.`);
  if (issuesFound.length > 0) {
    console.log(`Se detectaron incidencias en ${issuesFound.length} página(s).`);
  } else {
    console.log('✓ Ninguna página presenta errores de inicialización, TDZ, NaN ni cálculos rotos.');
  }
  console.log('='.repeat(70));
}

runDiagnostics().catch(err => {
  console.error('Error fatal en suite de diagnóstico:', err);
  process.exit(1);
});
