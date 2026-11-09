window.toTitleCase = function(str) {
  if (!str || typeof str !== 'string') return str || '';
  const lowerWords = new Set(['de', 'del', 'y', 'en', 'e', 'a', 'con', 'por', 'o', 'u', 'para', 'al', 'la', 'el', 'los', 'las']);
  const acronyms = new Set(['unw', 'sunedu', 'pea', 'nps', 'ti', 'qa', 'dba', 'cas', 'serums', 'acbsp', 'ocde', 'nid', 'atc', 'rrhh', 'pucp', 'ucv', 'unmsm', 'upch', 'usil']);

  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index, arr) => {
      const cleanWord = word.replace(/[^\wáéíóúüñ]/gi, '');
      if (acronyms.has(cleanWord)) return word.toUpperCase();
      if (index > 0 && lowerWords.has(cleanWord)) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

const DataLoader = {
  toTitleCase: window.toTitleCase,
  encuestas: null,
  encuestasEvolutivo: null, // Dataset 2025 (CSV) — solo para Análisis Evolutivo, carga diferida (lazy)
  universo: null,
  datoExternoSueldos: null, // Sueldo nacional/Wiener (Portal MiCarrera - MTPE) — solo para Empleabilidad, carga diferida (lazy)
  isLoaded: false,
  isEvolutivoLoaded: false,
  isDatoExternoLoaded: false,

  async loadDataFromFiles(encFile, uniFile) {
    try {
      const [encBuffer, uniBuffer] = await Promise.all([
        this.readFileAsArrayBuffer(encFile),
        this.readFileAsArrayBuffer(uniFile)
      ]);

      // Fuente principal: CSV 2026, ya limpio y categorizado por el equipo de datos
      // (delimitador ';'). No pasa por DataCleaner: los valores ya vienen normalizados.
      const encWorkbook = XLSX.read(encBuffer, { type: 'array', raw: true, FS: ';' });
      const uniWorkbook = XLSX.read(uniBuffer, { type: 'array' });

      const rawEncuestas = XLSX.utils.sheet_to_json(encWorkbook.Sheets[encWorkbook.SheetNames[0]]);
      let rawUniverso = XLSX.utils.sheet_to_json(uniWorkbook.Sheets[uniWorkbook.SheetNames[0]]);

      // Si el universo proviene de base_egresados.csv o contiene registros fuera de la cohorte 2019-2025,
      // filtrar automáticamente para obtener el universo oficial de 11,791 egresados
      if (rawUniverso.length > 11791 || rawUniverso.some(r => {
        const yr = parseInt(String(r.anio_consultado || r.periodo_egreso || '').match(/\d{4}/)?.[0]);
        return yr && (yr < 2019 || yr > 2025);
      })) {
        rawUniverso = rawUniverso.filter(r => {
          const yr = parseInt(String(r.anio_consultado || r.periodo_egreso || '').match(/\d{4}/)?.[0]);
          return yr >= 2019 && yr <= 2025;
        });
      }

      // El CSV 2026 llega ya categorizado, pero conserva artefactos binarios de exportación
      // (caracteres nulos \u0000 / "_x0000_") en algunos valores de texto — el mismo problema
      // que ya se sanea para universo.xlsx. Esto no es "limpieza" de respuestas de encuesta,
      // es higiene de encoding: sin esto, una carrera como "INGENIERÍA...\u0000" se cuenta
      // como una carrera aparte, distinta de "INGENIERÍA..." (se vieron 3 carreras así).
      this.encuestas = this.sanitizeNullBytes(rawEncuestas);
      this.universo = DataCleaner.clean(rawUniverso, 'universo');

      this.isLoaded = true;
      return { encuestas: this.encuestas, universo: this.universo };
    } catch (error) {
      console.error('Error procesando archivos:', error);
      throw error;
    }
  },

  // Carga diferida (lazy) del CSV 2025, usado únicamente por la página de Análisis Evolutivo
  // para comparar la cohorte anterior (2025) vs la actual (2026). Se cachea: si ya se cargó,
  // no se vuelve a solicitar ni parsear.
  async loadEvolutivoData() {
    if (this.isEvolutivoLoaded) return this.encuestasEvolutivo;
    try {
      const response = await fetch('data/respuestas_encuestas_2025.csv');
      if (!response.ok) throw new Error('No se pudo cargar respuestas_encuestas_2025.csv');
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', raw: true });
      const rawEncuestas2025 = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      const mapped = this.mapNewSurveyColumns(rawEncuestas2025);
      this.encuestasEvolutivo = DataCleaner.clean(mapped, 'encuestas');
      this.isEvolutivoLoaded = true;
      return this.encuestasEvolutivo;
    } catch (error) {
      console.error('Error cargando datos de Análisis Evolutivo (CSV 2025):', error);
      this.encuestasEvolutivo = [];
      this.isEvolutivoLoaded = true;
      return this.encuestasEvolutivo;
    }
  },

  // Carga diferida (lazy) del "Dato Externo": sueldo promedio nacional y de la UNW específicamente
  // según el Portal MiCarrera (MTPE) — fuente externa e independiente de la propia encuesta de
  // egresados, usada únicamente en la página de Empleabilidad. Se cachea igual que
  // loadEvolutivoData().
  async loadDatoExternoSueldos() {
    if (this.isDatoExternoLoaded) return this.datoExternoSueldos;
    try {
      const [nacionalResp, wienerResp] = await Promise.all([
        fetch('data/pago_promedio_carrerras_2026.csv'),
        fetch('data/carreras_top_upnw.csv')
      ]);
      if (!nacionalResp.ok || !wienerResp.ok) throw new Error('No se pudo cargar el dato externo de sueldos (Portal MiCarrera)');
      const [nacionalBuf, wienerBuf] = await Promise.all([nacionalResp.arrayBuffer(), wienerResp.arrayBuffer()]);
      // codepage: 65001 (UTF-8) explícito — estos CSV no traen BOM y sin esta opción XLSX
      // interpreta los acentos con la codepage por defecto (mojibake: "JÃ³venes" en vez de "Jóvenes").
      const nacionalWb = XLSX.read(nacionalBuf, { type: 'array', raw: true, codepage: 65001 });
      const wienerWb = XLSX.read(wienerBuf, { type: 'array', raw: true, codepage: 65001 });
      this.datoExternoSueldos = {
        nacional: XLSX.utils.sheet_to_json(nacionalWb.Sheets[nacionalWb.SheetNames[0]]),
        wiener: XLSX.utils.sheet_to_json(wienerWb.Sheets[wienerWb.SheetNames[0]])
      };
      this.isDatoExternoLoaded = true;
      return this.datoExternoSueldos;
    } catch (error) {
      console.error('Error cargando dato externo de sueldos (Portal MiCarrera):', error);
      this.datoExternoSueldos = { nacional: [], wiener: [] };
      this.isDatoExternoLoaded = true;
      return this.datoExternoSueldos;
    }
  },

  sanitizeNullBytes(data) {
    return data.map(row => {
      const cleaned = {};
      for (const [key, value] of Object.entries(row)) {
        cleaned[key] = typeof value === 'string'
          ? value.replace(/_x0000_/g, '').replace(/\u0000/g, '').trim()
          : value;
      }
      return cleaned;
    });
  },

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error leyendo archivo: ' + file.name));
      reader.readAsArrayBuffer(file);
    });
  },

  mapNewSurveyColumns(data) {
    const renameMap = {
      'DNI del egresado (copiar exactamente como específica la base) ': 'DNI:',
      'Nombre del egresado ( copiar exactamente como específica la base) ': 'Nombres y apellidos:',
      'Carrera': 'Programa Académico:',
      'Año de egreso': 'Año de egreso:',
      '2. ¿Cuál es tu condición laboral actual?': '2. ¿Cuál es tu condición laboral actual?',
      'Motivo No Trabajo (FINAL) ': '1. ¿Cuál es la principal razón por la que no te encuentras trabajando actualmente?',
      '5.   Considerando todos los aspectos de tu empleo  ¿Qué tan satisfecho te sientes con tu trabajo actual? ': '5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)',
      'Sueldo (FINAL)': '9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información con el fin, de en caso te encuentres interesado en recibir información de ofertas laborales podamos enviar en base al sueldo base que percibes actualmente)',
      '9. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado? ': '11. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado?',
      '6. ¿Has recibido algún ascenso en los últimos 5 años?': '7. ¿Has recibido algún ascenso en los últimos 5 años? (No se pregunta a emprendedores/ni independientes)',
      '7. ¿Tienes personal a tu cargo? ': '8. ¿Tienes personal a tu cargo?',
      'A.  De manera general ¿Qué tan satisfecho te encuentras con la formación académica recibida por la Universidad Norbert Wiener? ¿Por qué? (menciona solo una característica, ejemplo: calidad académica, docentes, oportunidades laborales, prácticas/internados, etc.)': '13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?',
      'Razones Sat (1era mención) (Categorizado)': '13.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):',
      'C. ¿Has llevado algún curso de posgrado (como maestría, diplomado, especialización) Ejemplo de respuesta: (Sí- U. San Martin - Maestría en salud) / No (separar en secciones)': '2. ¿Has realizado estudios de posgrado después de egresar?',
      'Nivel de Emp (Final)': '6. ¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?'
    };

    return data.map(row => {
      const newRow = {};
      for (const [oldKey, value] of Object.entries(row)) {
        const newKey = renameMap[oldKey] || oldKey;
        newRow[newKey] = value;
      }
      // Limpiar año de egreso
      if (newRow['Año de egreso:']) {
        const strVal = String(newRow['Año de egreso:']);
        const match = strVal.match(/\d{4}/);
        if (match) newRow['Año de egreso:'] = parseInt(match[0]);
      }
      return newRow;
    });
  },

  cleanEncuestas(data) {
    return data.map(row => {
      const cleaned = {};
      for (const [key, value] of Object.entries(row)) {
        cleaned[key] = value;
      }
      return cleaned;
    });
  },

  cleanUniverso(data) {
    return data.map(row => {
      const cleaned = {};
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string') {
          cleaned[key] = value.replace(/_x0000_/g, '').trim();
        } else {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });
  },

  getEncuestas() {
    return this.encuestas || [];
  },

  getEncuestasEvolutivo() {
    return this.encuestasEvolutivo || [];
  },

  getUniverso() {
    return this.universo || [];
  },

  getFilteredUniverso(filters = {}) {
    let data = this.universo || [];
    if (filters.facultad && filters.facultad !== 'Todas') {
      data = data.filter(u => this.getFacultadForCarrera(u.nombre_carrera) === filters.facultad);
    }
    if (filters.carrera && filters.carrera !== 'Todas') {
      const norm = (s) => (s || '').replace(/_x0000_/g, '').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const targetCar = norm(filters.carrera);
      data = data.filter(u => norm(u.nombre_carrera) === targetCar);
    }
    if (filters.anio && filters.anio !== 'Todos') {
      const targetAnio = String(filters.anio).trim();
      data = data.filter(u => {
        const a = String(u.anio_consultado || u.periodo_egreso || '');
        return a.includes(targetAnio);
      });
    }
    return data;
  },

  getFacultades() {
    const carreras = [...new Set(this.encuestas.map(e => e['CARRERA']))];
    const facultades = new Set();
    carreras.forEach(c => facultades.add(this.getFacultadForCarrera(c)));
    return [...facultades].sort();
  },

  getCarreras() {
    return [...new Set(this.encuestas.map(e => e['CARRERA']))].sort();
  },

  getAniosEgreso() {
    const anios = new Set();
    this.encuestas.forEach(e => {
      const match = String(e['Año de Egreso'] ?? '').match(/\d{4}/);
      if (match) anios.add(parseInt(match[0]));
    });
    return [...anios].sort((a, b) => a - b);
  },

  getFacultadForCarrera(carrera) {
    const upper = String(carrera || '').toUpperCase();

    // Ciencias de la Salud
    if (upper.includes('ENFERMERÍA') || upper.includes('ENFERMERIA')) return 'Ciencias de la Salud';
    if (upper.includes('FARMACIA') || upper.includes('BIOQUÍMICA') || upper.includes('BIOQUIMICA')) return 'Ciencias de la Salud';
    if (upper.includes('MEDICINA HUMANA')) return 'Ciencias de la Salud';
    if (upper.includes('NUTRICIÓN') || upper.includes('NUTRICION')) return 'Ciencias de la Salud';
    if (upper.includes('OBSTETRICIA')) return 'Ciencias de la Salud';
    if (upper.includes('ODONTOLOGÍA') || upper.includes('ODONTOLOGIA')) return 'Ciencias de la Salud';
    if (upper.includes('PSICOLOGÍA') || upper.includes('PSICOLOGIA')) return 'Ciencias de la Salud';
    if (upper.includes('TECNOLOGÍA MÉDICA') || upper.includes('TECNOLOGIA MEDICA')) return 'Ciencias de la Salud';

    // Negocios (Ciencias Empresariales)
    if (upper.includes('ADMINISTRACIÓN EN TURISMO') || upper.includes('ADMINISTRACION EN TURISMO')) return 'Negocios';
    if (upper.includes('ADMINISTRACIÓN Y DIRECCIÓN') || upper.includes('ADMINISTRACION Y DIRECCION')) return 'Negocios';
    if (upper.includes('ADMINISTRACIÓN Y MARKETING') || upper.includes('ADMINISTRACION Y MARKETING')) return 'Negocios';
    if (upper.includes('ADMINISTRACIÓN Y NEGOCIOS') || upper.includes('ADMINISTRACION Y NEGOCIOS')) return 'Negocios';
    if (upper.includes('CONTABILIDAD')) return 'Negocios';

    // Ingeniería
    if (upper.includes('INGENIERÍA DE SISTEMAS') || upper.includes('INGENIERIA DE SISTEMAS')) return 'Ingeniería';
    if (upper.includes('INGENIERÍA INDUSTRIAL') || upper.includes('INGENIERIA INDUSTRIAL')) return 'Ingeniería';

    // Derecho y Ciencia Política
    if (upper.includes('DERECHO')) return 'Derecho y Ciencia Política';

    return 'Otra';
  },

  getGrupoForCarrera(carrera) {
    const fac = this.getFacultadForCarrera(carrera);
    if (fac === 'Ciencias de la Salud') return 'SALUD';
    if (fac === 'Negocios' || fac === 'Ingeniería' || fac === 'Derecho y Ciencia Política') return 'NID';
    return 'OTRO';
  },

  isNID(carrera) {
    return this.getGrupoForCarrera(carrera) === 'NID';
  },

  isSalud(carrera) {
    return this.getGrupoForCarrera(carrera) === 'SALUD';
  },

  isCarreraVigente(carrera) {
    const upper = (carrera || '').toUpperCase();
    // ADMINISTRACIÓN Y MARKETING fue descontinuada/retirada (últimos egresados en 2023)
    if (upper.includes('MARKETING')) return false;
    return true;
  },

  isPrimeraPromocion(carrera) {
    const upper = (carrera || '').toUpperCase();
    // Carreras nuevas o con primeras promociones en los últimos años
    if (upper.includes('TURISMO') || upper.includes('INDUSTRIAL') || upper.includes('MARKETING')) return true;
    return false;
  },

  getCarrerasNID() {
    return this.getCarreras().filter(c => this.isNID(c));
  },

  getCarrerasSalud() {
    return this.getCarreras().filter(c => this.isSalud(c));
  },

  getCarrerasNegocios() {
    return this.getCarreras().filter(c => this.getFacultadForCarrera(c) === 'Negocios');
  },

  getCarrerasIngenieria() {
    return this.getCarreras().filter(c => this.getFacultadForCarrera(c) === 'Ingeniería');
  }
};

window.DataLoader = DataLoader;
