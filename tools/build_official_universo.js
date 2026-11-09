/**
 * tools/build_official_universo.js
 * Genera el archivo oficial data/universo.xlsx a partir de data/base_egresados.csv
 * extrayendo la cohorte 2019 a 2025 (exactamente 11,791 egresados),
 * saneando encoding y caracteres nulos, con compresión zip para óptima velocidad en el dashboard.
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('../js/vendor/xlsx.full.min.js');

const ROOT = path.resolve(__dirname, '..');
const csvPath = path.join(ROOT, 'data/base_egresados.csv');
const uniPath = path.join(ROOT, 'data/universo.xlsx');

console.log('1. Leyendo data/base_egresados.csv (Codepage 1252 / ANSI)...');
const buf = fs.readFileSync(csvPath);
const wb = XLSX.read(buf, { type: 'buffer', FS: ';', codepage: 1252 });
const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

console.log('   Total egresados en base histórica completa:', rawRows.length);

// 2. Filtrar únicamente la cohorte de estudio: 2019 a 2025
const rows2019_2025 = rawRows.filter(r => {
  const m = String(r.anio_consultado || '').match(/\d{4}/);
  if (m) {
    const yr = parseInt(m[0]);
    return yr >= 2019 && yr <= 2025;
  }
  return false;
});

console.log('2. Egresados filtrados cohorte 2019-2025:', rows2019_2025.length);
if (rows2019_2025.length !== 11791) {
  throw new Error(`Error: Se esperaban 11,791 registros pero se obtuvieron ${rows2019_2025.length}`);
}

// 3. Limpiar y estructurar las columnas canónicas del universo
const cleanRows = rows2019_2025.map((row, idx) => {
  const m = String(row.anio_consultado || '').match(/\d{4}/);
  const cleanStr = (v) => {
    if (v === null || v === undefined) return '';
    return String(v).replace(/_x0000_/g, '').replace(/\u0000/g, '').trim();
  };

  return {
    nro: idx + 1,
    alumno: row.alumno,
    numero_documento: row.numero_documento,
    tipo_documento: cleanStr(row.tipo_documento) || 'DNI',
    nombre_carrera: cleanStr(row.nombre_carrera).replace(/\s+/g, ' '),
    sede_egreso: cleanStr(row.sede_egreso),
    apellido_paterno: cleanStr(row.apellido_paterno),
    apellido_materno: cleanStr(row.apellido_materno),
    nombres: cleanStr(row.nombres),
    'Nombres Completos': cleanStr(row['Nombres Completos']),
    email: cleanStr(row.email),
    telefono: cleanStr(row.telefono),
    celular: cleanStr(row.Celular || row.celular),
    periodo_ingreso: cleanStr(row.periodo_ingreso),
    primera_matricula: cleanStr(row.primera_matricula),
    periodo_egreso: cleanStr(row.periodo_egreso),
    anio_consultado: m ? parseInt(m[0]) : 2021,
    periodo: cleanStr(row.periodo),
    grado_estudios: cleanStr(row.grado_estudios) || 'PREGRADO',
    sexo: cleanStr(row.sexo),
    edad: row.edad || '',
    promedio: row.promedio || '',
    correo_institucional: cleanStr(row.correo_institucional),
    facultad: cleanStr(row.facultad),
    modalidad: cleanStr(row.modalidad),
    bachiller: cleanStr(row.bachiller)
  };
});

// 4. Crear libro Excel con compresión habilitada
const newWs = XLSX.utils.json_to_sheet(cleanRows);
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newWs, 'Hoja2');

const outBuf = XLSX.write(newWb, { type: 'buffer', bookType: 'xlsx', compression: true });
fs.writeFileSync(uniPath, outBuf);

console.log(`✓ data/universo.xlsx generado con éxito: ${cleanRows.length} egresados (${(outBuf.length / 1024 / 1024).toFixed(2)} MB).`);
