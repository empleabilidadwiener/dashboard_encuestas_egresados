const Calculations = {
  // Mapeo de columnas - NOMBRES EXACTOS DEL EXCEL
  cols: {
    trabaja: '1. ¿Actualmente te encuentras trabajando o realizando una actividad remunerada que genere ingresos?',
    condicion: '2. ¿Cuál es tu condición laboral actual?',
    // Columnas oficiales ya categorizadas por el equipo de datos de la universidad,
    // siguiendo la metodología OIT/INEI (PEA/No PEA + ocupado/desocupado dentro de la PEA).
    // Son la ÚNICA fuente de verdad para "Nivel de Empleabilidad" en todo el dashboard.
    nivelEmpleabilidadFinal: 'Nivel de Empleabilidad Final',
    condicionPEA: 'Condición PEA',
    satisfaccion: '5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)',
    pertinencia: '6. ¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?',
    ascenso: '7. ¿Has recibido algún ascenso en los últimos 5 años? (No se pregunta a emprendedores/ni independientes)',
    salario: '9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información con el fin, de en caso te encuentres interesado en recibir información de ofertas laborales podamos enviar en base al sueldo base que percibes actualmente)',
    colegiatura: '1. ¿Cuál es su situación actual respecto a la colegiatura profesional? (E: LEER ALTERNATIVAS)',
    posgrado: '2. ¿Has realizado estudios de posgrado después de egresar?',
    nps: '13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?',
    npsDesempleado: '6. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?',
    razonNPS: '13.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):',
    razonNPSDesempleado: '6.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):',
    // Columnas oficiales: segmento NPS ya calculado, y la razón abierta ya categorizada en
    // temas (Docentes, Tema administrativo, Calidad académica, etc.).
    segmentoNPS: 'Segmento NPS (rama SI): Promotor/Neutral/Detractor',
    segmentoNPSDesempleado: 'Segmento NPS (rama NO): Promotor/Neutral/Detractor',
    razonNPSCategorizada: 'Razón NPS (rama SI) - Categorizado (Final)',
    razonNPSDesempleadoCategorizada: 'Razón NPS (rama NO) - Categorizado (Final)',
    // Nivel del primer cargo, ya categorizado con la misma escala de seniority que el cargo
    // actual. Se divide en dos columnas según la rama del instrumento (si trabaja / no trabaja
    // actualmente pero trabajó antes), son mutuamente excluyentes por fila.
    cargoPrimerEmpleoCategorizado: 'Cargo Primer Empleo (rama SI) - Categorizado (Final)',
    cargoPrimerEmpleoCategorizadoNoTrabaja: 'Cargo Primer Empleo (rama NO) - Categorizado (Final)',
    interesPosgrado: '6. ¿Tienes interés en llevar un posgrado en la UNW a corto plazo?',
    posgradoInteres: '6.1 Cuál Posgrado?',
    carrera: 'CARRERA',
    nombres: 'Nombres y apellidos:',
    anioEgreso: 'Año de Egreso',
    primerEmpleo: '12. ¿Tu primer empleo estuvo relacionado con la carrera estudiada?',
    tiempoPrimerEmpleo: '11. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado?',
    // Misma pregunta, rama de quienes NO trabajan actualmente pero sí trabajaron antes
    // (Pregunta 4, condicionada a "3. ¿Has trabajado anteriormente?" = Sí).
    tiempoPrimerEmpleoNoTrabaja: '4. En caso la respuesta anterior haya sido SÍ, ¿cuánto tiempo te tomó obtener tu primer trabajo...?',
    modalidad: '3.4 Modalidad de trabajo',
    modalidadVinculacion: '2.1 Si marco, "Trabajador dependiente". ¿Cuál es su modalidad de vinculación laboral? (E: LEER ALTERNATIVAS)',
    actividadIndependiente: '2.2 Si responde "Profesional independiente". ¿Cómo desarrolla principalmente su actividad profesional? (E: LEER ALTERNATIVAS)',
    emprendimientoFormalizacion: '2.3 Si responde "Propietario o socio de negocio/emprendimiento". Respecto a su emprendimiento o negocio: (E: LEER ALTERNATIVAS)',
    emprendimientoRelacionado: '2.3.1 ¿El emprendimiento está relacionado con su profesión?',
    tipoEmpresa: '3.3 Tipo de empresa (no se pregunta a emprendedores):',
    tiempoCargoActual: '4. ¿Cuánto tiempo estas desempeñándote en el cargo actual? (No se pregunta a emprendedores/ni independientes)',
    trabajadoAnteriormente: '3. ¿Has trabajado anteriormente?',
    tipoPosgrado: '4. ¿Qué tipo de estudios de posgrado ha realizado o se encuentra realizando?',
    tipoInstitucionPosgrado: '5. ¿Qué tipo de institución ofrece u ofreció el programa de posgrado...?',
    personalCargo: '8. ¿Tienes personal a tu cargo?',
    // Columnas ya categorizadas por el equipo de datos (mejor cobertura que la columna cruda:
    // p.ej. "Cargo Actual Salud - Categorizado" reclasifica 319 de las 442 respuestas crudas
    // que quedaban genéricamente en "Otros:").
    cargoSalud: 'Cargo Actual Salud - Categorizado',
    cargoNID: 'Cargo Actual NID - Categorizado',
    practicasNID: '10. (Solo para egresados NID) ¿Realizaste prácticas preprofesionales durante tu carrera?',
    razonNoTrabaja: '1. ¿Cuál es la principal razón por la que no te encuentras trabajando actualmente?',
    razonNoTrabajaOtros: 'Otros (Especificar)6',
    razonNoTrabajaCategorizada: 'Razón No Trabaja - Categorizado (Final)',
    tiempoDesempleo: '2. ¿Hace cuánto tiempo estás en situación de desempleo?',
    iniciativaNetworking: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Networking con egresados',
    iniciativaMentoria: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Mentoría a estudiantes',
    iniciativaPonente: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Participación como ponente en charlas...',
    iniciativaTalleres: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Participación en talleres y cursos...',
    iniciativaOportunidades: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Acceso a oportunidades laborales exclusivas...',
    iniciativaBeneficios: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Beneficios y convenios para la comunidad Alumni',
    iniciativaVoluntariado: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Actividades de voluntariado e impacto social',
    iniciativaDeportivas: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Participación en campeonatos y actividades deportivas...',
    iniciativaEmbajadores: '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Integrar la Red de Embajadores Alumni Wiener',
    
    apoyoFormo: '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_La Universidad ya me formó, ahora conseguir empleo depende de mí.',
    apoyoCursos: '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_Brindándome cursos y actividades de actualización profesional.',
    apoyoOfertas: '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_Informándome constantemente ofertas de empleo.',
    apoyoEntrenando: '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_Entrenándome para enfrentar mejor mis entrevistas de trabajo.',
    apoyoOtro: '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_Otro',
    rubro: '3.2 Rubro de empresa:',
    sexo: 'Sexo',
    edad: 'Edad',
    rangoEdad: 'Rango de Edad',
    departamento: '3.6 Dónde labora Departamento',
    provincia: 'Provincia',
    distrito: 'Distrito',

    // --- Nuevas columnas 2026 ---
    gradoAcademico: 'Grado Académico',
    empresaLimpia: 'Nombre de Empresa Limpia',
    tamanoEmpresa: 'Categorización Oficial - Tamaño de Empresa',
    zonaGeografica: 'Zona Geográfica de Trabajo',
    sueldoPromedio: 'Sueldo Promedio',
    nivelCargo: 'Nivel Cargo Actual - Categorizado Oficial',
    universidadPosgrado: 'Universidad de Posgrado - Nombre Normalizado',
    posgradoDeseadoCategoria: 'Posgrado Deseado - Categorizado (Final)',
    universidadPosgradoTipo: 'Universidad de Posgrado - Tipo (Pública/Privada)',
    universidadPosgradoPais: 'Universidad de Posgrado - País (Nacional/Extranjera)',
  },

  primeraPromocion: {
    'FARMACIA Y BIOQUÍMICA': 2001,
    'OBSTETRICIA': 2001,
    'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES': 2001,
    'INGENIERÍA INDUSTRIAL Y DE GESTIÓN EMPRESARIAL': 2001,
    'ENFERMERÍA': 2004,
    'INGENIERÍA DE SISTEMAS E INFORMÁTICA': 2005,
    'ADMINISTRACIÓN EN TURISMO Y HOTELERÍA': 2009,
    'ODONTOLOGÍA': 2009,
    'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA': 2010,
    'DERECHO Y CIENCIA POLÍTICA': 2010,
    'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN': 2010,
    'ADMINISTRACIÓN Y DIRECCIÓN DE EMPRESAS': 2013,
    'CONTABILIDAD Y AUDITORÍA': 2014,
    'PSICOLOGÍA': 2017,
    'NUTRICIÓN Y DIETÉTICA': 2019,
    'ADMINISTRACIÓN Y MARKETING': 2021,
    'MEDICINA HUMANA': 2022
  },

  // Metas muestrales oficiales (Muestra ±5% por carrera, Total = 3,463)
  metasMuestrales: {
    'FARMACIA Y BIOQUÍMICA': 311,
    'ENFERMERÍA': 299,
    'ODONTOLOGÍA': 289,
    'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN': 275,
    'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA': 254,
    'DERECHO Y CIENCIA POLÍTICA': 251,
    'PSICOLOGÍA': 248,
    'OBSTETRICIA': 216,
    'CONTABILIDAD Y AUDITORÍA': 204,
    'ADMINISTRACIÓN Y DIRECCIÓN DE EMPRESAS': 194,
    'MEDICINA HUMANA': 188,
    'NUTRICIÓN Y DIETÉTICA': 179,
    'INGENIERÍA DE SISTEMAS E INFORMÁTICA': 161,
    'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES': 157,
    'INGENIERÍA INDUSTRIAL Y DE GESTIÓN EMPRESARIAL': 134,
    'ADMINISTRACIÓN EN TURISMO Y HOTELERÍA': 98,
    'ADMINISTRACIÓN Y MARKETING': 5
  },

  getMetaMuestral(carrera, N = 0) {
    if (N > 0) {
      return Math.ceil((N * 1.96 * 1.96 * 0.25) / (0.0025 * (N - 1) + 1.96 * 1.96 * 0.25));
    }
    const key = (carrera || '').replace(/_x0000_/g, '').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
    if (Calculations.metasMuestrales[key]) {
      return Calculations.metasMuestrales[key];
    }
    return 0;
  },

  ordenarCarrerasPorAntiguedad(a, b) {
    const pA = Calculations.primeraPromocion[a.toUpperCase().trim()] || 9999;
    const pB = Calculations.primeraPromocion[b.toUpperCase().trim()] || 9999;
    if (pA !== pB) {
      return pA - pB; // Menor a mayor año (más antiguo primero)
    }
    return a.localeCompare(b);
  },


  tasaOcupacion(trabajadores, total) {
    if (total === 0) return 0;
    return (trabajadores / total) * 100;
  },

  margenError(p, n) {
    if (n === 0 || p < 0 || p > 1) return 0;
    return 1.96 * Math.sqrt((p * (1 - p)) / n);
  },

  tamanoMinimo(p, ME) {
    if (p <= 0 || p >= 1 || ME <= 0) return 0;
    return Math.ceil((1.96 * 1.96 * p * (1 - p)) / (ME * ME));
  },

  indiceRepresentatividad(nMuestra, NUniverso) {
    if (NUniverso === 0) return 0;
    return (nMuestra / NUniverso) * 100;
  },

  calcularNPS(scores) {
    const validScores = scores.filter(s => s >= 0 && s <= 10);
    if (validScores.length === 0) return { promotores: 0, neutrales: 0, detractores: 0, nps: 0 };
    const promotores = validScores.filter(s => s >= 9).length;
    const detractores = validScores.filter(s => s <= 6).length;
    const neutrales = validScores.length - promotores - detractores;
    return {
      promotores: (promotores / validScores.length) * 100,
      neutrales: (neutrales / validScores.length) * 100,
      detractores: (detractores / validScores.length) * 100,
      nps: ((promotores - detractores) / validScores.length) * 100
    };
  },

  distribucionPorcentual(datos) {
    const total = datos.length;
    if (total === 0) return [];
    const frecuencias = {};
    datos.forEach(d => frecuencias[d] = (frecuencias[d] || 0) + 1);
    return Object.entries(frecuencias)
      .map(([cat, freq]) => ({ categoria: cat, cantidad: freq, porcentaje: (freq / total) * 100 }))
      .sort((a, b) => b.cantidad - a.cantidad);
  },

  intervaloConfianza(p, n, nivelConfianza = 0.95) {
    if (n === 0) return { inferior: 0, superior: 0 };
    const z = nivelConfianza === 0.95 ? 1.96 : 2.576;
    const error = z * Math.sqrt((p * (1 - p)) / n);
    return { inferior: Math.max(0, p - error), superior: Math.min(1, p + error) };
  },

  wordFrequency(texts, maxWords = 50) {
    const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'de', 'del',
      'en', 'que', 'por', 'con', 'para', 'se', 'su', 'al', 'lo', 'como', 'mas', 'pero',
      'sus', 'le', 'ya', 'este', 'si', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin',
      'sobre', 'tambien', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos',
      'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante',
      'ellos', 'e', 'esto', 'mi', 'antes', 'algunos', 'que', 'unos', 'yo', 'otro', 'otras',
      'otra', 'el', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual',
      'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tu',
      'te', 'ti', 'tus', 'ellas', 'nosotras', 'vosotros', 'vuestra', 'esos', 'esas',
      'estoy', 'estas', 'esta', 'estamos', 'estais', 'estan', 'este', 'estes', 'estemos',
      'estare', 'estaras', 'estara', 'estaremos', 'estareis', 'estaran', 'estaria', 'estarias',
      'estariamos', 'estariais', 'estarian', 'estaba', 'estabas', 'estabamos', 'estabais',
      'estaban', 'he', 'has', 'ha', 'hemos', 'habeis', 'han', 'haya', 'hayas', 'hayamos',
      'hayan', 'habre', 'habras', 'habra', 'habremos', 'habreis', 'habran', 'habria',
      'habrias', 'habriamos', 'habriais', 'habrian', 'habia', 'habias', 'habiamos', 'habiais',
      'habian', 'soy', 'eres', 'es', 'somos', 'sois', 'son', 'sea', 'seas', 'seamos', 'seais',
      'sean', 'sere', 'seras', 'sera', 'seremos', 'sereis', 'seran', 'seria', 'serias',
      'seriamos', 'seriais', 'serian', 'era', 'eras', 'eramos', 'erais', 'eran', 'tengo',
      'tienes', 'tiene', 'tenemos', 'teneis', 'tienen', 'tenga', 'tengas', 'tengamos',
      'tengais', 'tengan', 'tendre', 'tendras', 'tendra', 'tendremos', 'tendreis', 'tendran',
      'tendria', 'tendrias', 'tendriamos', 'tendriais', 'tendrian', 'tenia', 'tenias',
      'teniamos', 'teniais', 'tenian', 'teniendo', 'tenido', 'tenida', 'tenidos', 'tenidas',
      'tened', 'sido', 'ser', 'estar', 'haber', 'tener', 'hacer', 'poder', 'decir', 'ir',
      'venir', 'poner', 'salir', 'dar', 'ver', 'querer', 'llegar', 'pasar', 'deber',
      'creer', 'hablar', 'llevar', 'dejar', 'seguir', 'encontrar', 'llamar', 'volver',
      'tomar', 'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar',
      'esperar', 'buscar', 'existir', 'entrar', 'trabajar', 'escribir', 'perder', 'pedir',
      'recibir', 'recordar', 'terminar', 'permitir', 'aparecer', 'regresar', 'بسم',
      'dijo', 'puede', 'todos', 'todas', 'cada', 'mucho', 'poco', 'otro', 'otra',
      'mismo', 'misma', 'mismos', 'mismas', 'aqui', 'alli', 'como', 'así', 'siempre',
      'nunca', 'antes', 'despues', 'luego', 'ahora', 'bien', 'mal', 'mejor', 'peor'];

    const words = texts.join(' ').toLowerCase()
      .replace(/[^a-záéíóúñü\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.includes(w));

    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords);
  },

  classifyByTopics(texts) {
    const topics = {
      'Calidad académica': {
        regex: /\b(docentes?|profesor(es)?|clases?|cursos?|enseñanza|académico|calidad|materias?|plan|curricular|formación|aprendizaje|conocimiento|investigación|malla|curr[ií]cula)\b/i,
        phrases: []
      },
      'Inserción laboral': {
        regex: /\b(empleos?|trabajos?|laboral|campo|práctica|empleabilidad|empresas?|puestos?|cargos?|profesión|egresados?|inserción|bolsa|oportunidad(es)?)\b/i,
        phrases: []
      },
      'Infraestructura': {
        regex: /\b(instalaci[oó]n(es)?|laboratorios?|bibliotecas?|sedes?|infraestructura|equipos?|tecnología|informática|aulas?|espacios?|campus)\b/i,
        phrases: []
      },
      'Costo / Economía': {
        regex: /\b(precios?|costos?|mensualidad(es)?|caro|barato|económico|inversión|tarifas?|becas?|financiero|pagos?|cuotas?|pension(es)?)\b/i,
        phrases: []
      },
      'Recomendación institucional': {
        regex: /\b(imagen|reconocimiento|acreditaci[oó]n|universidad|instituci[oó]n|marca|prestigio|reputaci[oó]n|certificaci[oó]n|buena|excelente)\b/i,
        phrases: []
      },
      'Desarrollo personal': {
        regex: /\b(formación|valores|habilidades?|blandas?|desarrollo|crecimiento|personal|humano|ética|liderazgo|competencias?|visión)\b/i,
        phrases: []
      }
    };

    const unclassified = [];

    texts.forEach(text => {
      let classified = false;

      for (const [topicName, topic] of Object.entries(topics)) {
        if (topic.regex.test(text)) {
          topic.phrases.push(text);
          classified = true;
          break;
        }
      }

      if (!classified) {
        unclassified.push(text);
      }
    });

    const result = Object.entries(topics)
      .map(([name, data]) => ({
        tema: name,
        cantidad: data.phrases.length,
        frases: data.phrases
      }))
      .filter(t => t.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad);

    if (unclassified.length > 0) {
      result.push({
        tema: 'Otros / No clasificado',
        cantidad: unclassified.length,
        frases: unclassified
      });
    }

    return result;
  },

  countFullPhrases(phrases, maxPhrases = 30) {
    const freq = {};
    phrases.forEach(p => {
      const normalized = p.trim();
      if (normalized) {
        freq[normalized] = (freq[normalized] || 0) + 1;
      }
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxPhrases);
  },

  // Funciones principales
  getRespuestasTrabajadores(data) {
    return data.filter(d => d[this.cols.trabaja] === 'Sí');
  },

  getRespuestasDesempleados(data) {
    return data.filter(d => d[this.cols.trabaja] === 'No');
  },

  getTasaOcupacionGlobal(data) {
    const total = data.length;
    const trabajadores = this.getRespuestasTrabajadores(data).length;
    return this.tasaOcupacion(trabajadores, total);
  },

  getTasaOcupacionPorFacultad(data) {
    const facultades = {};
    data.forEach(d => {
      const facultad = DataLoader.getFacultadForCarrera(d[this.cols.carrera]);
      if (!facultades[facultad]) facultades[facultad] = { total: 0, trabajadores: 0 };
      facultades[facultad].total++;
      if (d[this.cols.trabaja] === 'Sí') facultades[facultad].trabajadores++;
    });
    return Object.entries(facultades).map(([facultad, stats]) => ({
      facultad,
      total: stats.total,
      trabajadores: stats.trabajadores,
      tasa: this.tasaOcupacion(stats.trabajadores, stats.total)
    }));
  },

  getTasaOcupacionPorCarrera(data) {
    const carreras = {};
    data.forEach(d => {
      const carrera = d[this.cols.carrera];
      if (!carreras[carrera]) carreras[carrera] = { total: 0, trabajadores: 0 };
      carreras[carrera].total++;
      if (d[this.cols.trabaja] === 'Sí') carreras[carrera].trabajadores++;
    });
    return Object.entries(carreras)
      .map(([carrera, stats]) => ({
        carrera,
        total: stats.total,
        trabajadores: stats.trabajadores,
        tasa: this.tasaOcupacion(stats.trabajadores, stats.total)
      }))
      .sort((a, b) => b.tasa - a.tasa);
  },

  getDistribucionSatisfaccionGlobal(data) {
    const satisfacciones = data.map(d => d[this.cols.satisfaccion]).filter(v => v);
    return this.distribucionPorcentual(satisfacciones);
  },

  // Columnas de preguntas de opción múltiple (checkbox): la fuente marca "seleccionado"
  // escribiendo el texto de la propia alternativa (p.ej. "Networking con egresados"), no un
  // simple '1'/'Sí' — por eso alcanza con validar que la celda no esté vacía.
  isMultiSelectChecked(v) {
    const s = String(v || '').trim().toLowerCase();
    if (!s) return false;
    if (s === '0' || s === 'no' || s === 'false') return false;
    return true;
  },

  getIniciativasAlumni(data) {
    const counts = {
      'Networking': 0, 'Mentoría': 0, 'Ser Ponente': 0, 'Talleres y Cursos': 0,
      'Oportunidades Lab.': 0, 'Beneficios Alumni': 0, 'Voluntariado': 0,
      'Actividades Deportivas': 0, 'Embajadores': 0
    };
    data.forEach(d => {
      if (this.isMultiSelectChecked(d[this.cols.iniciativaNetworking])) counts['Networking']++;
      if (this.isMultiSelectChecked(d[this.cols.iniciativaMentoria])) counts['Mentoría']++;
      if (this.isMultiSelectChecked(d[this.cols.iniciativaPonente])) counts['Ser Ponente']++;
      if (this.isMultiSelectChecked(d[this.cols.iniciativaTalleres])) counts['Talleres y Cursos']++;
      if (this.isMultiSelectChecked(d[this.cols.iniciativaOportunidades])) counts['Oportunidades Lab.']++;
      if (this.isMultiSelectChecked(d[this.cols.iniciativaBeneficios])) counts['Beneficios Alumni']++;
      if (this.isMultiSelectChecked(d[this.cols.iniciativaVoluntariado])) counts['Voluntariado']++;
      if (this.isMultiSelectChecked(d[this.cols.iniciativaDeportivas])) counts['Actividades Deportivas']++;
      if (this.isMultiSelectChecked(d[this.cols.iniciativaEmbajadores])) counts['Embajadores']++;
    });
    return Object.entries(counts)
      .map(([k,v]) => ({ iniciativa: k, cantidad: v }))
      .filter(item => item.cantidad > 0)
      .sort((a,b) => b.cantidad - a.cantidad);
  },

  getApoyoDesempleadosList(data) {
    const counts = {
      'Depende de mí': 0, 'Cursos/Actualización': 0, 'Ofertas de empleo': 0,
      'Entrenamiento entrevistas': 0, 'Otro': 0
    };
    data.forEach(d => {
      if (this.isMultiSelectChecked(d[this.cols.apoyoFormo])) counts['Depende de mí']++;
      if (this.isMultiSelectChecked(d[this.cols.apoyoCursos])) counts['Cursos/Actualización']++;
      if (this.isMultiSelectChecked(d[this.cols.apoyoOfertas])) counts['Ofertas de empleo']++;
      if (this.isMultiSelectChecked(d[this.cols.apoyoEntrenando])) counts['Entrenamiento entrevistas']++;
      if (this.isMultiSelectChecked(d[this.cols.apoyoOtro])) counts['Otro']++;
    });
    return Object.entries(counts)
      .map(([k,v]) => ({ apoyo: k, cantidad: v }))
      .filter(item => item.cantidad > 0)
      .sort((a,b) => b.cantidad - a.cantidad);
  },

  getDistribucionSatisfaccion(data) {
    const trabajadores = this.getRespuestasTrabajadores(data);
    const satisfacciones = trabajadores.map(d => d[this.cols.satisfaccion]).filter(v => v);
    return this.distribucionPorcentual(satisfacciones);
  },

  getDistribucionPertinencia(data) {
    const trabajadores = this.getRespuestasTrabajadores(data);
    const pertinencias = trabajadores.map(d => d[this.cols.pertinencia]).filter(v => v);
    return this.distribucionPorcentual(pertinencias);
  },

  getDistribucionSalario(data) {
    const trabajadores = this.getRespuestasTrabajadores(data);
    const salarios = trabajadores.map(d => d[this.cols.salario]).filter(v => v);
    return this.distribucionPorcentual(salarios);
  },

  getDistribucionColegiatura(data) {
    const colegiaturas = data.map(d => d[this.cols.colegiatura]).filter(v => v);
    return this.distribucionPorcentual(colegiaturas);
  },

  getDistribucionPosgrado(data) {
    const posgrados = data.map(d => d[this.cols.posgrado]).filter(v => v);
    return this.distribucionPorcentual(posgrados);
  },

  getRazonNPSTrabajadores(data) {
    const trabajadores = this.getRespuestasTrabajadores(data);
    return trabajadores
      .map(d => d[this.cols.razonNPS])
      .filter(r => r && r.trim().length > 0);
  },

  getRazonNPSDesempleados(data) {
    const desempleados = this.getRespuestasDesempleados(data);
    return desempleados
      .map(d => d[this.cols.razonNPSDesempleado])
      .filter(r => r && r.trim().length > 0);
  },

  // Traduce el segmento oficial ("Promotor"/"Neutral (pasivo)"/"Detractor") al identificador
  // interno usado en el dashboard. Si el dataset no trae la columna (p.ej. el CSV histórico
  // 2025), se calcula con el umbral estándar de NPS a partir del puntaje 0-10.
  _sentimientoNPS(segmentoOficial, score) {
    const seg = String(segmentoOficial || '').trim().toLowerCase();
    if (seg.startsWith('promotor')) return 'promotor';
    if (seg.startsWith('neutral')) return 'neutro';
    if (seg.startsWith('detractor')) return 'detractor';
    return score >= 9 ? 'promotor' : (score >= 7 ? 'neutro' : 'detractor');
  },

  getComentariosNPSCompletos(data, segmento = 'global') {
    const colTrab = this.cols.nps;
    const colTrabRazon = this.cols.razonNPS;
    const colTrabRazonCat = this.cols.razonNPSCategorizada;
    const colTrabSegmento = this.cols.segmentoNPS;
    const colDes = this.cols.npsDesempleado || '6. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?';
    const colDesRazon = this.cols.razonNPSDesempleado || '6.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):';
    const colDesRazonCat = this.cols.razonNPSDesempleadoCategorizada;
    const colDesSegmento = this.cols.segmentoNPSDesempleado;
    const colCarrera = this.cols.carrera;
    const colAnio = this.cols.anioEgreso;

    const comentarios = [];
    data.forEach(d => {
      const c = d[colCarrera] || 'Sin especificar';
      const a = d[colAnio] || 'Sin especificar';

      // Trabajador (Pregunta 13)
      if (segmento === 'global' || segmento === 'trabajadores') {
        const scoreVal = d[colTrab];
        const textoVal = d[colTrabRazon];
        if (scoreVal !== undefined && scoreVal !== null && scoreVal !== '' && textoVal && String(textoVal).trim()) {
          const s = parseFloat(scoreVal);
          if (!isNaN(s) && s >= 0 && s <= 10) {
            comentarios.push({
              texto: String(textoVal).trim(),
              razonCategorizada: String(d[colTrabRazonCat] || '').trim(),
              score: s,
              sentimiento: this._sentimientoNPS(d[colTrabSegmento], s),
              carrera: c,
              anio: a,
              grupo: 'Ocupado'
            });
          }
        }
      }

      // Desempleado (Pregunta 6)
      if (segmento === 'global' || segmento === 'desempleados') {
        const scoreVal = d[colDes];
        const textoVal = d[colDesRazon];
        if (scoreVal !== undefined && scoreVal !== null && scoreVal !== '' && textoVal && String(textoVal).trim()) {
          const s = parseFloat(scoreVal);
          if (!isNaN(s) && s >= 0 && s <= 10) {
            comentarios.push({
              texto: String(textoVal).trim(),
              razonCategorizada: String(d[colDesRazonCat] || '').trim(),
              score: s,
              sentimiento: this._sentimientoNPS(d[colDesSegmento], s),
              carrera: c,
              anio: a,
              grupo: 'En búsqueda'
            });
          }
        }
      }
    });

    return comentarios;
  },

  getNPSMetricasDetalladas(data, segmento = 'global') {
    const comentarios = this.getComentariosNPSCompletos(data, segmento);
    const scores = comentarios.map(c => c.score);
    const stats = this.calcularNPS(scores);
    const promotoresCount = comentarios.filter(c => c.sentimiento === 'promotor').length;
    const neutralesCount = comentarios.filter(c => c.sentimiento === 'neutro').length;
    const detractoresCount = comentarios.filter(c => c.sentimiento === 'detractor').length;

    return {
      nps: stats.nps,
      promotores: stats.promotores,
      neutrales: stats.neutrales,
      detractores: stats.detractores,
      total: comentarios.length,
      promotoresCount,
      neutralesCount,
      detractoresCount,
      comentarios
    };
  },

  getNPSPorCarrera(data, segmento = 'global') {
    const comentarios = this.getComentariosNPSCompletos(data, segmento);
    const grupos = {};

    comentarios.forEach(c => {
      if (!grupos[c.carrera]) {
        grupos[c.carrera] = { carrera: c.carrera, scores: [] };
      }
      grupos[c.carrera].scores.push(c.score);
    });

    return Object.values(grupos).map(g => {
      const stats = this.calcularNPS(g.scores);
      const promotoresCount = g.scores.filter(s => s >= 9).length;
      const neutralesCount = g.scores.filter(s => s >= 7 && s <= 8).length;
      const detractoresCount = g.scores.filter(s => s <= 6).length;
      let nivel = 'alerta';
      if (stats.nps >= 50) nivel = 'excelente';
      else if (stats.nps >= 0) nivel = 'favorable';
      else nivel = 'critico';

      return {
        carrera: g.carrera,
        total: g.scores.length,
        promotores: stats.promotores,
        neutrales: stats.neutrales,
        detractores: stats.detractores,
        promotoresCount,
        neutralesCount,
        detractoresCount,
        nps: stats.nps,
        nivel
      };
    }).sort((a, b) => b.nps - a.nps);
  },

  getNPSPorAnio(data, segmento = 'global') {
    const comentarios = this.getComentariosNPSCompletos(data, segmento);
    const grupos = {};

    comentarios.forEach(c => {
      const anioKey = c.anio ? String(c.anio).trim() : 'Sin especificar';
      if (!grupos[anioKey]) {
        grupos[anioKey] = { anio: anioKey, scores: [] };
      }
      grupos[anioKey].scores.push(c.score);
    });

    return Object.values(grupos).map(g => {
      const stats = this.calcularNPS(g.scores);
      const promotoresCount = g.scores.filter(s => s >= 9).length;
      const neutralesCount = g.scores.filter(s => s >= 7 && s <= 8).length;
      const detractoresCount = g.scores.filter(s => s <= 6).length;
      let nivel = 'alerta';
      if (stats.nps >= 50) nivel = 'excelente';
      else if (stats.nps >= 0) nivel = 'favorable';
      else nivel = 'critico';

      return {
        anio: g.anio,
        total: g.scores.length,
        promotores: stats.promotores,
        neutrales: stats.neutrales,
        detractores: stats.detractores,
        promotoresCount,
        neutralesCount,
        detractoresCount,
        nps: stats.nps,
        nivel
      };
    }).sort((a, b) => a.anio.localeCompare(b.anio));
  },

  getPosgradosInteres(data) {
    return data
      .map(d => d[this.cols.posgradoInteres])
      .filter(r => r && r.trim().length > 0);
  },

  getComparativoColegiatura(data) {
    const trabajadores = this.getRespuestasTrabajadores(data);
    const colegiadosHabilitados = trabajadores.filter(d =>
      (d[this.cols.colegiatura] || '').includes('habilitado(a)') && !(d[this.cols.colegiatura] || '').includes('no habilitado')
    );
    const colegiadosNoHabilitados = trabajadores.filter(d =>
      (d[this.cols.colegiatura] || '').includes('no habilitado')
    );
    const noColegiados = trabajadores.filter(d =>
      (d[this.cols.colegiatura] || '').includes('No me encuentro') || (d[this.cols.colegiatura] || '') === 'No colegiado'
    );
    const noAplica = trabajadores.filter(d =>
      (d[this.cols.colegiatura] || '').includes('No aplica')
    );

    return {
      habilitados: {
        total: colegiadosHabilitados.length,
        satisfaccion: this.getDistribucionSatisfaccion(colegiadosHabilitados),
        pertinencia: this.getDistribucionPertinencia(colegiadosHabilitados),
        salario: this.getDistribucionSalario(colegiadosHabilitados)
      },
      noColegiados: {
        total: noColegiados.length,
        satisfaccion: this.getDistribucionSatisfaccion(noColegiados),
        pertinencia: this.getDistribucionPertinencia(noColegiados),
        salario: this.getDistribucionSalario(noColegiados)
      },
      noHabilitados: {
        total: colegiadosNoHabilitados.length,
        satisfaccion: this.getDistribucionSatisfaccion(colegiadosNoHabilitados),
        pertinencia: this.getDistribucionPertinencia(colegiadosNoHabilitados),
        salario: this.getDistribucionSalario(colegiadosNoHabilitados)
      },
      noAplica: {
        total: noAplica.length
      },
      // Compatibilidad hacia atrás
      colegiados: {
        total: colegiadosHabilitados.length,
        satisfaccion: this.getDistribucionSatisfaccion(colegiadosHabilitados),
        pertinencia: this.getDistribucionPertinencia(colegiadosHabilitados),
        salario: this.getDistribucionSalario(colegiadosHabilitados)
      }
    };
  },

  getComparativoNID(data) {
    return this.getComparativoColegiatura(data);
  },

  // Clasificación heurística de respaldo (motivo/sub-categoría, y resultado final completo
  // para datasets sin las columnas oficiales, p.ej. el CSV histórico 2025 de Análisis Evolutivo).
  _classifyLaborStatusHeuristico(trabaja, condicion, razon, otro) {
    if (trabaja === 'Sí' || trabaja.toLowerCase() === 'si') {
      if (condicion.includes('Propietario') || condicion.includes('socio de negocio') || condicion.includes('emprendimiento') || condicion.includes('Emprendedor')) {
        return { status: 'PEA_OCUPADO', sub: 'emprendedores', label: 'Emprendedor / Negocio propio', esPEA: true, esOcupado: true };
      }
      return { status: 'PEA_OCUPADO', sub: 'trabajando', label: 'Trabajador dependiente o independiente', esPEA: true, esOcupado: true };
    }

    // Si no trabaja:
    // 1. Búsqueda activa explícita
    if (razon.includes('buscando') || razon.includes('insertarme') || razon.includes('Buscando empleo')) {
      return { status: 'PEA_DESOCUPADO', sub: 'buscanActivamente', label: 'Buscando empleo activamente', esPEA: true, esOcupado: false };
    }

    // 2. Iniciando negocio propio
    if (razon.includes('proyecto personal') || razon.includes('negocio propio')) {
      return { status: 'PEA_OCUPADO', sub: 'iniciandoNegocio', label: 'Iniciando proyecto personal / negocio', esPEA: true, esOcupado: true };
    }

    // 3. Realizando SERUMS (actividad asistencial médica remunerada)
    if (razon.includes('Realizando SERUMS') || otro.includes('realizando su cerums') || otro.includes('realizando su serum') || otro.includes('realizando cerum') || otro.includes('cerumisa') || otro.includes('termino su serun')) {
      return { status: 'PEA_OCUPADO', sub: 'serumsActivo', label: 'Realizando SERUMS (Actividad profesional)', esPEA: true, esOcupado: true };
    }

    // 4. Postulando / preparándose para el SERUMS
    if (razon.includes('Postulando / Preparándose para SERUMS') || ((razon === 'Otros' || razon.toLowerCase().includes('otro')) && (otro.includes('serum') || otro.includes('cerum')))) {
      return { status: 'PEA_DESOCUPADO', sub: 'postulandoSerums', label: 'Postulando / Preparándose para el SERUMS', esPEA: true, esOcupado: false };
    }

    // 5. Casos de 'Otros': Análisis de texto abierto
    if (razon === 'Otros' || razon.toLowerCase().includes('otro')) {
      if (
        otro.includes('entrevista') || otro.includes('postulando') || otro.includes('cas') || otro.includes('convocatoria') ||
        otro.includes('propuesta') || otro.includes('experiencia') || otro.includes('contrato') || otro.includes('renovacion') ||
        otro.includes('renunciar') || otro.includes('viendo otras opciones') || otro.includes('temporal') || otro.includes('horario') || otro.includes('distancia')
      ) {
        return { status: 'PEA_DESOCUPADO', sub: 'buscanActivamente', label: 'Búsqueda activa / Convocatorias / Entrevistas', esPEA: true, esOcupado: false };
      }
      if (otro.includes('consultorio') || otro.includes('negocio')) {
        return { status: 'PEA_OCUPADO', sub: 'iniciandoNegocio', label: 'Iniciando consultorio / negocio', esPEA: true, esOcupado: true };
      }
      if (otro.includes('tesis') || otro.includes('tenis') || otro.includes('titulo') || otro.includes('titul') || otro.includes('bachiller') || otro.includes('colegia') || otro.includes('sustenta')) {
        return { status: 'NO_PEA', sub: 'tramiteGrado', label: 'En trámite de tesis / título profesional', esPEA: false, esOcupado: false };
      }
      if (otro.includes('salud') || otro.includes('medico') || otro.includes('médico') || otro.includes('maternidad') || otro.includes('mamá') || otro.includes('bebe') || otro.includes('ama de casa') || otro.includes('viaje') || otro.includes('extranjero') || otro.includes('vacaciones') || otro.includes('descans')) {
        return { status: 'NO_PEA', sub: 'inactivosFamiliar', label: 'Motivos de salud, maternidad o descanso', esPEA: false, esOcupado: false };
      }
      if (otro.includes('posgrado') || otro.includes('post grado') || otro.includes('especialidad') || otro.includes('residentado') || otro.includes('cursos') || otro.includes('inglés')) {
        return { status: 'NO_PEA', sub: 'inactivosEstudio', label: 'Estudios de posgrado o especialización', esPEA: false, esOcupado: false };
      }
      return { status: 'NO_PEA', sub: 'otrosInactivos', label: 'Otros motivos de inactividad', esPEA: false, esOcupado: false };
    }

    // 6. Trámite de grado / título / tesis
    if (razon.includes('Trámite de tesis') || razon.includes('título') || razon.includes('tesis')) {
      return { status: 'NO_PEA', sub: 'tramiteGrado', label: 'En trámite de tesis / título profesional', esPEA: false, esOcupado: false };
    }

    // 7. Posgrado o carrera
    if (razon.includes('Posgrado') || razon.includes('Carrera') || razon.toLowerCase().includes('posgrado')) {
      return { status: 'NO_PEA', sub: 'inactivosEstudio', label: 'Estudiando posgrado u otra carrera', esPEA: false, esOcupado: false };
    }

    // 8. Motivos personales o familiares
    if (razon.includes('personales') || razon.includes('familiares')) {
      return { status: 'NO_PEA', sub: 'inactivosFamiliar', label: 'Motivos personales o familiares', esPEA: false, esOcupado: false };
    }

    return { status: 'NO_PEA', sub: 'otrosInactivos', label: 'Otros motivos de inactividad', esPEA: false, esOcupado: false };
  },

  // Resuelve el motivo por el que alguien no trabaja usando columnas oficiales en vez de
  // adivinar por palabras clave sobre texto libre: los 3 motivos estructurados del instrumento
  // se leen directo, y solo para la opción "Otros" se usa "Razón No Trabaja - Categorizado
  // (Final)" (ya categorizada por el equipo de datos). Devuelve null si no hay dato suficiente
  // (p.ej. datasets sin esta columna), y el llamador debe usar la heurística de texto libre.
  _resolverMotivoNoTrabaja(razon, razonCategorizada) {
    const r = (razon || '').trim();
    if (!r) return null;

    if (r.includes('buscando') || r.includes('insertarme')) {
      return { status: 'PEA_DESOCUPADO', sub: 'buscanActivamente', label: 'Buscando empleo activamente', esPEA: true, esOcupado: false };
    }
    if (r.includes('personales') || r.includes('familiares')) {
      return { status: 'NO_PEA', sub: 'inactivosFamiliar', label: 'Motivos personales o familiares', esPEA: false, esOcupado: false };
    }
    if (r.toLowerCase().includes('posgrado') || r.includes('Carrera')) {
      return { status: 'NO_PEA', sub: 'inactivosEstudio', label: 'Estudiando posgrado u otra carrera', esPEA: false, esOcupado: false };
    }

    // Respuesta "Otros": la categorización la hizo el equipo de datos, no se re-adivina.
    const cat = (razonCategorizada || '').trim();
    if (!cat) return null;
    if (cat.includes('Trámite') || cat.includes('Tesis') || cat.includes('Título')) {
      return { status: 'NO_PEA', sub: 'tramiteGrado', label: 'En trámite de tesis / título profesional', esPEA: false, esOcupado: false };
    }
    if (cat.includes('SERUMS')) {
      // La columna oficial clasifica a quienes postulan/se preparan para el SERUMS como fuera
      // de la PEA (no como "buscando empleo" activo), a diferencia de la heurística anterior.
      return { status: 'NO_PEA', sub: 'postulandoSerums', label: 'Postulando / Preparándose para el SERUMS', esPEA: false, esOcupado: false };
    }
    if (cat.includes('Viaje') || cat.includes('Descanso')) {
      return { status: 'NO_PEA', sub: 'inactivosFamiliar', label: 'Viaje, descanso o reciente retorno del extranjero', esPEA: false, esOcupado: false };
    }
    if (cat.includes('Fin de contrato') || cat.includes('Cese laboral')) {
      return { status: 'NO_PEA', sub: 'otrosInactivos', label: 'Fin de contrato o cese laboral reciente', esPEA: false, esOcupado: false };
    }
    return { status: 'NO_PEA', sub: 'otrosInactivos', label: 'Otros motivos de inactividad', esPEA: false, esOcupado: false };
  },

  // Clasificación PEA/Ocupado de cada egresado — fuente ÚNICA de verdad para "Nivel de
  // Empleabilidad" en todo el dashboard (Resumen, Situación Laboral, Metodologías,
  // Análisis Evolutivo, KPIs, etc.).
  //
  // Cuando el dataset trae las columnas oficiales ya categorizadas por el equipo de datos de
  // la universidad ("Condición PEA" / "Nivel de Empleabilidad Final", metodología OIT/INEI),
  // esas columnas MANDAN sobre cualquier heurística: esPEA/esOcupado se toman directamente de
  // ellas. La heurística de texto (_classifyLaborStatusHeuristico) solo se usa para: (a)
  // asignar el motivo/sub-categoría descriptiva cuando las columnas oficiales no lo indican
  // (p.ej. por qué alguien no trabaja), y (b) como resultado completo de respaldo para
  // datasets que no traen estas columnas (el CSV histórico 2025 de Análisis Evolutivo).
  classifyLaborStatus(d) {
    const trabajaRaw = (d[this.cols.trabaja] || '').trim();
    const condicion = (d[this.cols.condicion] || '').trim();
    const razon = (d[this.cols.razonNoTrabaja] || '').trim();
    const razonCategorizada = (d[this.cols.razonNoTrabajaCategorizada] || '').trim();
    const otro = (d[this.cols.razonNoTrabajaOtros] || d['Otros (Especificar)_5'] || '').trim().toLowerCase();

    // Algunos datasets (p.ej. el CSV de encuestas actuales) no traen la pregunta
    // explícita "¿Actualmente te encuentras trabajando?" pero sí la condición
    // laboral. Si no hay respuesta directa, se infiere a partir de la condición.
    const trabaja = trabajaRaw || (condicion ? 'Sí' : '');

    const motivoOficial = trabaja !== 'Sí' ? this._resolverMotivoNoTrabaja(razon, razonCategorizada) : null;
    const heuristica = motivoOficial || this._classifyLaborStatusHeuristico(trabaja, condicion, razon, otro);

    const condicionPEARaw = String(d[this.cols.condicionPEA] || '').trim().toUpperCase();
    const tieneColumnaOficial = condicionPEARaw === 'PEA' || condicionPEARaw === 'NO PEA';
    if (!tieneColumnaOficial) return heuristica;

    const esPEA = condicionPEARaw === 'PEA';
    if (!esPEA) {
      // Fuera de la PEA según la columna oficial. Se usa el motivo de la heurística solo si
      // esta coincide en que la persona está inactiva; si no, se etiqueta genéricamente.
      return heuristica.status === 'NO_PEA'
        ? { status: 'NO_PEA', sub: heuristica.sub, label: heuristica.label, esPEA: false, esOcupado: false }
        : { status: 'NO_PEA', sub: 'otrosInactivos', label: 'Otros motivos de inactividad', esPEA: false, esOcupado: false };
    }

    const nivelEmpFinalRaw = String(d[this.cols.nivelEmpleabilidadFinal] || '').trim().toLowerCase();
    const esOcupado = nivelEmpFinalRaw.startsWith('sí') || nivelEmpFinalRaw.startsWith('si');

    if (esOcupado) {
      if (heuristica.esOcupado) return { status: 'PEA_OCUPADO', sub: heuristica.sub, label: heuristica.label, esPEA: true, esOcupado: true };
      // La columna oficial reclasifica como ocupado a alguien que la heurística de texto no
      // detectó como tal (p.ej. respondió "No" a la P1 pero está en SERUMS o similar según el
      // criterio institucional). Se usa 'condicion' como mejor esfuerzo para el motivo.
      const sub = (condicion.includes('Propietario') || condicion.includes('socio de negocio') || condicion.includes('emprendimiento') || condicion.includes('Emprendedor')) ? 'emprendedores' : 'trabajando';
      return { status: 'PEA_OCUPADO', sub, label: sub === 'emprendedores' ? 'Emprendedor / Negocio propio' : 'Trabajador dependiente o independiente', esPEA: true, esOcupado: true };
    }

    // PEA y desocupado según la columna oficial.
    if (heuristica.esPEA && !heuristica.esOcupado) return { status: 'PEA_DESOCUPADO', sub: heuristica.sub, label: heuristica.label, esPEA: true, esOcupado: false };
    return { status: 'PEA_DESOCUPADO', sub: 'buscanActivamente', label: 'Buscando empleo activamente', esPEA: true, esOcupado: false };
  },

  getSensibilidadPEA(data) {
    const total = data.length;
    let trabajando = 0; // Trabajador dependiente o profesional independiente
    let emprendedores = 0; // Propietario o socio de negocio/emprendimiento
    let iniciandoNegocio = 0; // Iniciando un proyecto personal / negocio propio
    let serumsActivo = 0; // Egresados en SERUMS (remunerado formal)
    let buscanActivamente = 0; // Desempleo abierto / búsqueda activa / entrevistas
    let postulandoSerums = 0; // Postulando / preparándose para SERUMS (PEA_DESOCUPADO, solo respaldo heurístico sin columna oficial)
    let tramiteGrado = 0; // Trámite de tesis, sustentación o título profesional
    let inactivosEstudio = 0; // Posgrado u otra carrera
    let inactivosFamiliar = 0; // Motivos personales, familiares, salud o maternidad
    let postulandoSerumsNoPEA = 0; // Postulando / preparándose para SERUMS, según la columna oficial (fuera de la PEA)
    let otrosInactivos = 0; // Otros motivos de inactividad

    // El sub-bucket (info.sub) solo decide QUÉ contador específico sumar; el bucket PEA/No-PEA
    // que en verdad manda es info.status/esPEA/esOcupado (que ya viene de las columnas
    // oficiales cuando existen) — así un sub-bucket como 'postulandoSerums' no se cuenta como
    // PEA "por nombre" si la columna oficial dice que esa persona está fuera de la PEA. La
    // columna oficial "Razón No Trabaja - Categorizado (Final)" clasifica a quienes postulan al
    // SERUMS como NO_PEA (no como "buscando empleo" PEA_DESOCUPADO); se cuentan aparte para no
    // perder la etiqueta específica.
    data.forEach(d => {
      const info = this.classifyLaborStatus(d);
      if (info.status === 'PEA_OCUPADO') {
        if (info.sub === 'emprendedores') emprendedores++;
        else if (info.sub === 'iniciandoNegocio') iniciandoNegocio++;
        else if (info.sub === 'serumsActivo') serumsActivo++;
        else trabajando++;
      } else if (info.status === 'PEA_DESOCUPADO') {
        if (info.sub === 'postulandoSerums') postulandoSerums++;
        else buscanActivamente++;
      } else {
        if (info.sub === 'tramiteGrado') tramiteGrado++;
        else if (info.sub === 'inactivosEstudio') inactivosEstudio++;
        else if (info.sub === 'inactivosFamiliar') inactivosFamiliar++;
        else if (info.sub === 'postulandoSerums') postulandoSerumsNoPEA++;
        else otrosInactivos++;
      }
    });

    // 1. Componentes de la PEA
    // PEA = Trabajando + Emprendedores + Iniciando negocio + SERUMS + Buscando trabajo (abierta, CAS, entrevistas y SERUMS)
    const ocupadosTotalPEA = trabajando + emprendedores + iniciandoNegocio + serumsActivo;
    const desocupadosTotalPEA = buscanActivamente + postulandoSerums;
    const totalPEA = ocupadosTotalPEA + desocupadosTotalPEA;

    // 2. Componentes NO PEA (Inactivos: Trámite de grado, Posgrado, Familia/Salud, SERUMS y otros)
    const totalNoPEA = tramiteGrado + inactivosEstudio + inactivosFamiliar + postulandoSerumsNoPEA + otrosInactivos;

    // Escenarios
    const trabajadoresTotal = trabajando + emprendedores + serumsActivo; // Quienes laboran de forma directa
    const tasaBruta = this.tasaOcupacion(trabajadoresTotal, total);

    const inactivosVoluntarios = inactivosEstudio + inactivosFamiliar + tramiteGrado;
    const denomAjustado = Math.max(1, total - inactivosVoluntarios);
    const tasaAjustada = this.tasaOcupacion(trabajadoresTotal, denomAjustado);

    const tasaPEAOficial = this.tasaOcupacion(ocupadosTotalPEA, totalPEA);
    const tasaDesempleoPEA = this.tasaOcupacion(desocupadosTotalPEA, totalPEA);

    const totalMeta = (typeof DataLoader !== 'undefined' && DataLoader.getUniverso && DataLoader.getUniverso().length > 0)
      ? Math.ceil(DataLoader.getUniverso().length * (3742 / 11791))
      : 3742;

    return {
      total,
      metaMuestral: totalMeta,
      avanceMeta: totalMeta > 0 ? (total / totalMeta) * 100 : 100,
      // PEA desagregada
      trabajando,
      emprendedores,
      iniciandoNegocio,
      serumsActivo,
      buscanActivamente,
      postulandoSerums,
      totalPEA,
      ocupadosTotalPEA,
      desocupadosTotalPEA,
      tasaPEAOficial,
      tasaDesempleoPEA,
      // NO PEA desagregada
      tramiteGrado,
      inactivosEstudio,
      inactivosFamiliar,
      postulandoSerumsNoPEA,
      otrosInactivos,
      totalNoPEA,
      tasaNoPEATotal: (totalNoPEA / total) * 100,
      // Tradicional
      trabajadoresTotal,
      desempleadosTotal: data.length - trabajadoresTotal,
      escenarios: [
        {
          nombre: 'Tasa Bruta Institucional (Base)',
          descripcion: 'Denominador = Total de egresados encuestados',
          denominador: total,
          ocupados: trabajadoresTotal,
          tasa: tasaBruta,
          margenError: this.margenError(tasaBruta / 100, total) * 100,
          tipo: 'base'
        },
        {
          nombre: 'Tasa Ajustada (Excluye Inactivos Voluntarios)',
          descripcion: 'Denominador = Excluye inactivos no disponibles (estudio, familia, grado)',
          denominador: denomAjustado,
          ocupados: trabajadoresTotal,
          tasa: tasaAjustada,
          margenError: this.margenError(tasaAjustada / 100, denomAjustado) * 100,
          tipo: 'ajustada'
        },
        {
          nombre: 'Nivel de Empleabilidad (Estándar OIT / INEI)',
          descripcion: 'Nivel de Empleabilidad: Población con ocupación activa o en búsqueda laboral',
          denominador: totalPEA,
          ocupados: ocupadosTotalPEA,
          tasa: tasaPEAOficial,
          margenError: this.margenError(tasaPEAOficial / 100, totalPEA) * 100,
          tipo: 'pea'
        }
      ],
      componentesPEA: [
        { categoria: 'Egresados ocupados con empleo remunerado', cantidad: trabajando + serumsActivo, porcentajePEA: ((trabajando + serumsActivo) / totalPEA) * 100, porcentajeTotal: ((trabajando + serumsActivo) / total) * 100, esPEA: true, tipo: 'ocupado' },
        { categoria: 'Emprendedores y actividades independientes activas', cantidad: emprendedores + iniciandoNegocio, porcentajePEA: ((emprendedores + iniciandoNegocio) / totalPEA) * 100, porcentajeTotal: ((emprendedores + iniciandoNegocio) / total) * 100, esPEA: true, tipo: 'ocupado' },
        { categoria: 'Buscando empleo activamente (Entrevistas, CAS, convocatorias)', cantidad: buscanActivamente, porcentajePEA: (buscanActivamente / totalPEA) * 100, porcentajeTotal: (buscanActivamente / total) * 100, esPEA: true, tipo: 'buscando_trabajo' },
        { categoria: 'Postulando o preparándose para el SERUMS', cantidad: postulandoSerums, porcentajePEA: (postulandoSerums / totalPEA) * 100, porcentajeTotal: (postulandoSerums / total) * 100, esPEA: true, tipo: 'buscando_trabajo' }
      ],
      componentesNoPEA: [
        { categoria: 'Trámite de tesis, sustentación o título profesional', cantidad: tramiteGrado, porcentajeNoPEA: totalNoPEA > 0 ? (tramiteGrado / totalNoPEA) * 100 : 0, porcentajeTotal: (tramiteGrado / total) * 100, esPEA: false },
        { categoria: 'Motivos personales, familiares, salud o maternidad', cantidad: inactivosFamiliar, porcentajeNoPEA: totalNoPEA > 0 ? (inactivosFamiliar / totalNoPEA) * 100 : 0, porcentajeTotal: (inactivosFamiliar / total) * 100, esPEA: false },
        { categoria: 'Estudios de posgrado o cursos exclusivos', cantidad: inactivosEstudio, porcentajeNoPEA: totalNoPEA > 0 ? (inactivosEstudio / totalNoPEA) * 100 : 0, porcentajeTotal: (inactivosEstudio / total) * 100, esPEA: false },
        { categoria: 'Postulando o preparándose para el SERUMS', cantidad: postulandoSerumsNoPEA, porcentajeNoPEA: totalNoPEA > 0 ? (postulandoSerumsNoPEA / totalNoPEA) * 100 : 0, porcentajeTotal: (postulandoSerumsNoPEA / total) * 100, esPEA: false },
        { categoria: 'Otros motivos de inactividad', cantidad: otrosInactivos, porcentajeNoPEA: totalNoPEA > 0 ? (otrosInactivos / totalNoPEA) * 100 : 0, porcentajeTotal: (otrosInactivos / total) * 100, esPEA: false }
      ]
    };
  },

  getTrazabilidadPEAPorCarrera(data, universo) {
    const dataEnc = data || [];
    const dataUni = universo || DataLoader.getUniverso() || [];

    // Metas muestrales oficiales (Muestra ±5% por carrera, Total = 3,463)
    const metasMuestrales = this.metasMuestrales;

    // Mapear universo por carrera
    const uniPorCarrera = {};
    dataUni.forEach(u => {
      const c = (u.nombre_carrera || '').replace(/_x0000_/g, '').trim();
      if (c) {
        uniPorCarrera[c] = (uniPorCarrera[c] || 0) + 1;
      }
    });

    // Mapear encuestas por carrera
    const carrerasMap = {};
    dataEnc.forEach(d => {
      const c = (d[this.cols.carrera] || '').replace(/_x0000_/g, '').trim();
      if (!c) return;

      if (!carrerasMap[c]) {
        carrerasMap[c] = {
          carrera: c,
          facultad: DataLoader.getFacultadForCarrera(c),
          grupo: DataLoader.getGrupoForCarrera(c),
          totalMuestra: 0,
          trabajando: 0,
          emprendedores: 0,
          iniciandoNegocio: 0,
          serumsActivo: 0,
          buscanActivamente: 0,
          postulandoSerums: 0,
          desempleados: 0,
          tramiteGrado: 0,
          inactivosEstudio: 0,
          inactivosFamilia: 0,
          inactivosOtros: 0
        };
      }

      const item = carrerasMap[c];
      item.totalMuestra++;

      // El sub-bucket solo decide QUÉ contador sumar; el bucket PEA/No-PEA que en verdad manda
      // es info.status (ya viene de las columnas oficiales cuando existen) — ver nota en
      // getSensibilidadPEA.
      const info = this.classifyLaborStatus(d);
      if (info.status === 'PEA_OCUPADO') {
        if (info.sub === 'emprendedores') item.emprendedores++;
        else if (info.sub === 'iniciandoNegocio') item.iniciandoNegocio++;
        else if (info.sub === 'serumsActivo') item.serumsActivo++;
        else item.trabajando++;
      } else if (info.status === 'PEA_DESOCUPADO') {
        if (info.sub === 'postulandoSerums') { item.postulandoSerums++; item.desempleados++; }
        else { item.buscanActivamente++; item.desempleados++; }
      } else {
        if (info.sub === 'tramiteGrado') { item.tramiteGrado++; item.desempleados++; }
        else if (info.sub === 'inactivosEstudio') { item.inactivosEstudio++; item.desempleados++; }
        else if (info.sub === 'inactivosFamiliar') { item.inactivosFamilia++; item.desempleados++; }
        else { item.inactivosOtros++; item.desempleados++; }
      }
    });

    const listaCarreras = Object.values(carrerasMap).map(item => {
      const n = item.totalMuestra;
      const N = uniPorCarrera[item.carrera] || 0;
      const meta = this.getMetaMuestral(item.carrera, N) || Math.round(n * 1.16);

      const ocupadosTotalPEA = item.trabajando + item.emprendedores + item.iniciandoNegocio + item.serumsActivo;
      const desocupadosPEA = item.buscanActivamente + item.postulandoSerums;
      const pea = ocupadosTotalPEA + desocupadosPEA;
      const noPea = item.tramiteGrado + item.inactivosEstudio + item.inactivosFamilia + item.inactivosOtros;

      const tasaBruta = n > 0 ? ((item.trabajando + item.emprendedores + item.serumsActivo) / n) * 100 : 0;
      const tasaPEA = pea > 0 ? (ocupadosTotalPEA / pea) * 100 : 0;
      const tasaDesempleoPEA = pea > 0 ? (desocupadosPEA / pea) * 100 : 0;
      const tasaNoPEA = n > 0 ? (noPea / n) * 100 : 0;

      // Proyecciones al universo (población egresada total estimada)
      const ocupadosUniverso = n > 0 ? Math.round(N * (ocupadosTotalPEA / n)) : 0;
      const peaUniverso = n > 0 ? Math.round(N * (pea / n)) : 0;
      const noPeaUniverso = Math.max(0, N - peaUniverso);
      const cobertura = N > 0 ? (n / N) * 100 : 0;
      const avanceMeta = meta > 0 ? (n / meta) * 100 : 100;

      const mePEA = this.margenError(tasaPEA / 100, Math.max(1, pea)) * 100;
      const meBruta = this.margenError(tasaBruta / 100, Math.max(1, n)) * 100;

      // Semáforo de Tasa PEA
      let semaforoPEA = 'alta';
      let semaforoBadge = '🟢 Excelente (≥95%)';
      if (tasaPEA < 92) {
        semaforoPEA = 'alerta';
        semaforoBadge = '🔴 Alerta (<92%)';
      } else if (tasaPEA < 95) {
        semaforoPEA = 'adecuada';
        semaforoBadge = '🟡 Adecuada (92-94.9%)';
      }

      return {
        carrera: item.carrera,
        facultad: item.facultad,
        grupo: item.grupo,
        N,
        n,
        metaMuestral: meta,
        avanceMeta,
        trabajando: item.trabajando,
        emprendedores: item.emprendedores,
        iniciandoNegocio: item.iniciandoNegocio,
        serumsActivo: item.serumsActivo,
        ocupados: item.trabajando + item.emprendedores + item.serumsActivo,
        ocupadosTotalPEA,
        desempleados: item.desempleados,
        buscanActivamente: desocupadosPEA,
        pea,
        noPea,
        tasaBruta,
        tasaPEA,
        tasaDesempleoPEA,
        tasaNoPEA,
        ocupadosUniverso,
        peaUniverso,
        noPeaUniverso,
        cobertura,
        mePEA,
        meBruta,
        semaforoPEA,
        semaforoBadge,
        tramiteGrado: item.tramiteGrado,
        inactivosEstudio: item.inactivosEstudio,
        inactivosFamilia: item.inactivosFamilia,
        inactivosOtros: item.inactivosOtros
      };
    });

    listaCarreras.sort((a, b) => Calculations.ordenarCarrerasPorAntiguedad(a.carrera, b.carrera));

    // Totales institucionales
    const totalN = listaCarreras.reduce((sum, c) => sum + c.N, 0);
    const totalMuestra = listaCarreras.reduce((sum, c) => sum + c.n, 0);
    const totalMetaMuestral = listaCarreras.reduce((sum, c) => sum + (c.metaMuestral || 0), 0);
    const avanceMetaGlobal = totalMetaMuestral > 0 ? (totalMuestra / totalMetaMuestral) * 100 : 100;
    const totalTrabajando = listaCarreras.reduce((sum, c) => sum + c.trabajando, 0);
    const totalEmprendedores = listaCarreras.reduce((sum, c) => sum + c.emprendedores, 0);
    const totalIniciandoNegocio = listaCarreras.reduce((sum, c) => sum + c.iniciandoNegocio, 0);
    const totalSerumsActivo = listaCarreras.reduce((sum, c) => sum + (c.serumsActivo || 0), 0);
    const totalPosgrado = listaCarreras.reduce((sum, c) => sum + c.inactivosEstudio, 0);
    const totalTramiteGrado = listaCarreras.reduce((sum, c) => sum + (c.tramiteGrado || 0), 0);
    const totalOcupados = totalTrabajando + totalEmprendedores + totalSerumsActivo;
    const totalOcupadosConEmprendimiento = totalTrabajando + totalEmprendedores + totalIniciandoNegocio + totalSerumsActivo;
    const totalBuscan = listaCarreras.reduce((sum, c) => sum + c.buscanActivamente, 0);
    const totalPEA = listaCarreras.reduce((sum, c) => sum + c.pea, 0);
    const totalNoPEA = listaCarreras.reduce((sum, c) => sum + c.noPea, 0);
    const totalOcupadosUniverso = listaCarreras.reduce((sum, c) => sum + c.ocupadosUniverso, 0);
    const totalPEAUniverso = listaCarreras.reduce((sum, c) => sum + c.peaUniverso, 0);
    const totalNoPEAUniverso = Math.max(0, totalN - totalPEAUniverso);

    const tasaBrutaTotal = totalMuestra > 0 ? (totalOcupados / totalMuestra) * 100 : 0;
    const tasaPEATotal = totalPEA > 0 ? (totalOcupadosConEmprendimiento / totalPEA) * 100 : 0;
    const tasaDesempleoTotal = totalPEA > 0 ? (totalBuscan / totalPEA) * 100 : 0;
    const tasaNoPEATotal = totalMuestra > 0 ? (totalNoPEA / totalMuestra) * 100 : 0;
    const coberturaTotal = totalN > 0 ? (totalMuestra / totalN) * 100 : 0;

    // Resumen por facultad (4 facultades independientes)
    const porFacultad = {};
    listaCarreras.forEach(c => {
      if (!porFacultad[c.facultad]) {
        porFacultad[c.facultad] = {
          facultad: c.facultad,
          grupo: c.grupo,
          N: 0,
          n: 0,
          metaMuestral: 0,
          trabajando: 0,
          emprendedores: 0,
          iniciandoNegocio: 0,
          ocupados: 0,
          ocupadosTotalPEA: 0,
          buscanActivamente: 0,
          pea: 0,
          noPea: 0,
          ocupadosUniverso: 0,
          peaUniverso: 0
        };
      }
      const f = porFacultad[c.facultad];
      f.N += c.N;
      f.n += c.n;
      f.metaMuestral += c.metaMuestral;
      f.trabajando += c.trabajando;
      f.emprendedores += c.emprendedores;
      f.iniciandoNegocio += c.iniciandoNegocio;
      f.ocupados += c.ocupados;
      f.ocupadosTotalPEA += c.ocupadosTotalPEA;
      f.buscanActivamente += c.buscanActivamente;
      f.pea += c.pea;
      f.noPea += c.noPea;
      f.ocupadosUniverso += c.ocupadosUniverso;
      f.peaUniverso += c.peaUniverso;
    });

    const listaFacultades = Object.values(porFacultad).map(f => {
      const tasaBruta = f.n > 0 ? (f.ocupados / f.n) * 100 : 0;
      const tasaPEA = f.pea > 0 ? (f.ocupadosTotalPEA / f.pea) * 100 : 0;
      const tasaNoPEA = f.n > 0 ? (f.noPea / f.n) * 100 : 0;
      const avanceMeta = f.metaMuestral > 0 ? (f.n / f.metaMuestral) * 100 : 100;
      return {
        ...f,
        tasaBruta,
        tasaPEA,
        tasaNoPEA,
        avanceMeta,
        mePEA: this.margenError(tasaPEA / 100, Math.max(1, f.pea)) * 100,
        meBruta: this.margenError(tasaBruta / 100, Math.max(1, f.n)) * 100
      };
    }).sort((a, b) => b.tasaPEA - a.tasaPEA);

    return {
      carreras: listaCarreras,
      facultades: listaFacultades,
      totales: {
        totalN,
        totalMuestra,
        totalMetaMuestral,
        avanceMetaGlobal,
        totalTrabajando,
        totalEmprendedores,
        totalIniciandoNegocio,
        totalPosgrado,
        totalOcupados,
        totalOcupadosConEmprendimiento,
        totalBuscan,
        totalPEA,
        totalNoPEA,
        tasaBrutaTotal,
        tasaPEATotal,
        tasaDesempleoTotal,
        tasaNoPEATotal,
        totalOcupadosUniverso,
        totalPEAUniverso,
        totalNoPEAUniverso,
        coberturaTotal
      }
    };
  },

  getOcupacionPorAnioEgreso(data) {
    const dataEnc = data || [];
    const anios = {};

    dataEnc.forEach(d => {
      const anioStr = String(d[this.cols.anioEgreso] || '');
      const match = anioStr.match(/\d{4}/);
      if (!match) return;
      const anio = parseInt(match[0], 10);
      if (anio < 2019 || anio > 2025) return;

      if (!anios[anio]) {
        anios[anio] = {
          anio,
          totalMuestra: 0,
          trabajando: 0,
          emprendedores: 0,
          iniciandoNegocio: 0,
          serumsActivo: 0,
          buscanActivamente: 0,
          postulandoSerums: 0,
          tramiteGrado: 0,
          inactivosEstudio: 0,
          inactivosFamilia: 0,
          inactivosOtros: 0
        };
      }

      const item = anios[anio];
      item.totalMuestra++;

      // El sub-bucket solo decide QUÉ contador sumar; el bucket PEA/No-PEA que en verdad manda
      // es info.status (ver nota en getSensibilidadPEA).
      const info = this.classifyLaborStatus(d);
      if (info.status === 'PEA_OCUPADO') {
        if (info.sub === 'emprendedores') item.emprendedores++;
        else if (info.sub === 'iniciandoNegocio') item.iniciandoNegocio++;
        else if (info.sub === 'serumsActivo') item.serumsActivo++;
        else item.trabajando++;
      } else if (info.status === 'PEA_DESOCUPADO') {
        if (info.sub === 'postulandoSerums') item.postulandoSerums++;
        else item.buscanActivamente++;
      } else {
        if (info.sub === 'tramiteGrado') item.tramiteGrado++;
        else if (info.sub === 'inactivosEstudio') item.inactivosEstudio++;
        else if (info.sub === 'inactivosFamiliar') item.inactivosFamilia++;
        else item.inactivosOtros++;
      }
    });

    return Object.values(anios).sort((a, b) => a.anio - b.anio).map(it => {
      const ocupados = it.trabajando + it.emprendedores + it.iniciandoNegocio + it.serumsActivo;
      const noOcupados = it.buscanActivamente + it.postulandoSerums;
      const pea = ocupados + noOcupados;
      const inactivos = it.tramiteGrado + it.inactivosEstudio + it.inactivosFamilia + it.inactivosOtros;
      const tasaOcupacion = pea > 0 ? (ocupados / pea) * 100 : 0;
      const tasaDesempleo = pea > 0 ? (noOcupados / pea) * 100 : 0;
      return {
        anio: it.anio,
        totalMuestra: it.totalMuestra,
        trabajando: it.trabajando,
        emprendedores: it.emprendedores,
        iniciandoNegocio: it.iniciandoNegocio,
        serumsActivo: it.serumsActivo,
        posgrado: it.inactivosEstudio,
        tramiteGrado: it.tramiteGrado,
        ocupados,
        noOcupados,
        inactivos,
        pea,
        tasaOcupacion,
        tasaDesempleo
      };
    });
  },

  getAnalisisNID(data) {
    const dataNID = data.filter(d => DataLoader.isNID(d[this.cols.carrera]));
    const dataSalud = data.filter(d => DataLoader.isSalud(d[this.cols.carrera]));

    const segmentarGrupo = (dataset) => {
      const total = dataset.length;
      const trabajadores = dataset.filter(d => d[this.cols.trabaja] === 'Sí');
      const totalTrab = trabajadores.length;
      const tasaOcupacion = total > 0 ? (totalTrab / total) * 100 : 0;

      // Prácticas preprofesionales (columna 10 exclusiva de NID)
      let practicasSi = 0;
      let practicasTotal = 0;
      trabajadores.forEach(d => {
        const val = d[this.cols.practicasNID];
        if (val) {
          practicasTotal++;
          if (val.toLowerCase().includes('sí') || val.toLowerCase().includes('si')) {
            practicasSi++;
          }
        }
      });
      const tasaPracticas = practicasTotal > 0 ? (practicasSi / practicasTotal) * 100 : 0;

      // Salarios mayores a S/. 3,000
      let salariosValidos = 0;
      let salariosAltos = 0;
      trabajadores.forEach(d => {
        const val = d[this.cols.salario];
        if (val && !val.includes('Prefiero no decirlo')) {
          salariosValidos++;
          if (val.includes('3,001') || val.includes('5,001') || val.includes('8,001')) {
            salariosAltos++;
          }
        }
      });
      const tasaSalariosAltos = salariosValidos > 0 ? (salariosAltos / salariosValidos) * 100 : 0;

      // Pertinencia
      let pertValidas = 0;
      let pertRelacionadas = 0;
      trabajadores.forEach(d => {
        const val = d[this.cols.pertinencia];
        if (val) {
          pertValidas++;
          if (val.includes('totalmente') || val.includes('parcialmente')) {
            pertRelacionadas++;
          }
        }
      });
      const tasaPertinencia = pertValidas > 0 ? (pertRelacionadas / pertValidas) * 100 : 0;

      return {
        total,
        trabajadores: totalTrab,
        tasaOcupacion,
        practicasSi,
        practicasTotal,
        tasaPracticas,
        salariosAltos,
        salariosValidos,
        tasaSalariosAltos,
        tasaPertinencia,
        margenErrorOcupacion: this.margenError(tasaOcupacion / 100, total) * 100
      };
    };

    const vigentes = dataNID.filter(d => DataLoader.isCarreraVigente(d[this.cols.carrera]));
    const retiradas = dataNID.filter(d => !DataLoader.isCarreraVigente(d[this.cols.carrera]));
    const primerasPromociones = dataNID.filter(d => DataLoader.isPrimeraPromocion(d[this.cols.carrera]));

    // Detalle por carrera de NID
    const porCarrera = {};
    dataNID.forEach(d => {
      const c = d[this.cols.carrera];
      if (!porCarrera[c]) porCarrera[c] = [];
      porCarrera[c].push(d);
    });

    const carrerasNID = Object.entries(porCarrera).map(([carrera, rows]) => {
      const stats = segmentarGrupo(rows);
      return {
        carrera,
        facultad: DataLoader.getFacultadForCarrera(carrera),
        esVigente: DataLoader.isCarreraVigente(carrera),
        esPrimeraPromocion: DataLoader.isPrimeraPromocion(carrera),
        ...stats
      };
    }).sort((a, b) => b.tasaOcupacion - a.tasaOcupacion);

    return {
      totalNID: segmentarGrupo(dataNID),
      vigentesNID: segmentarGrupo(vigentes),
      retiradasNID: segmentarGrupo(retiradas),
      primerasPromocionesNID: segmentarGrupo(primerasPromociones),
      totalSalud: segmentarGrupo(dataSalud),
      carrerasNID
    };
  },

  // Margen de Error con corrección por población finita (Cochran), bajo el supuesto de máxima
  // varianza (p=q=0.50 por defecto) — el margen "institucional" u objetivo de la muestra, que no
  // depende de ninguna pregunta/proporción específica de la encuesta. Misma fórmula que ya usa
  // getMetaMuestral() para calcular el TAMAÑO de muestra objetivo (3,463), aplicada aquí en
  // sentido inverso: dado el n efectivamente alcanzado y el universo N, ¿cuál es el margen de
  // error resultante? Devuelve 0 si los datos no son válidos (n<=0, N<=n, etc.).
  margenErrorFinito(n, N, p = 0.5) {
    if (!n || !N || n <= 0 || N <= 1 || n >= N) return 0;
    const varianza = (p * (1 - p) / n) * ((N - n) / (N - 1));
    return 1.96 * Math.sqrt(Math.max(0, varianza));
  },

  // Margen de Error institucional GLOBAL, con p=q=0.50 (máxima exigencia) y corrección por
  // población finita — usada por la página Margen de Error, coherente con lo que la propia
  // página describe en su nota metodológica.
  getMargenErrorInstitucionalGlobal(data, universo) {
    const dataUni = universo || (typeof DataLoader !== 'undefined' ? DataLoader.getUniverso() : null) || [];
    const n = data.length;
    const N = dataUni.length || n;
    const me = this.margenErrorFinito(n, N, 0.5);
    return {
      tasa: this.getTasaOcupacionGlobal(data),
      me: me * 100,
      n,
      N
    };
  },

  // Margen de Error institucional POR CARRERA: mismo criterio (p=q=0.50 + corrección por
  // población finita), pero usando el universo específico de CADA carrera (no el total
  // institucional) como N — un programa chico dentro de una carrera grande no "hereda" la
  // precisión del total institucional.
  getMargenErrorInstitucionalPorCarrera(data, universo) {
    const dataUni = universo || (typeof DataLoader !== 'undefined' ? DataLoader.getUniverso() : null) || [];
    const uniPorCarrera = {};
    dataUni.forEach(u => {
      const c = (u.nombre_carrera || '').replace(/_x0000_/g, '').trim().toUpperCase();
      if (c) uniPorCarrera[c] = (uniPorCarrera[c] || 0) + 1;
    });

    const porCarrera = this.getTasaOcupacionPorCarrera(data);
    return porCarrera
      .filter(c => c.total >= 30)
      .map(c => {
        const N = uniPorCarrera[(c.carrera || '').toUpperCase()] || 0;
        // Si no se encuentra el universo de esa carrera (no debería pasar con datos reales),
        // se usa la fórmula sin corrección finita como respaldo, en vez de devolver 0.
        const me = N > 0 ? this.margenErrorFinito(c.total, N, 0.5) : this.margenError(0.5, c.total);
        return { ...c, me: me * 100, N };
      });
  },

  getRankingCarreras(data) {
    const porCarrera = this.getTasaOcupacionPorCarrera(data);
    const carreras = {};

    porCarrera.forEach(c => {
      const grupo = DataLoader.getGrupoForCarrera(c.carrera);
      const esVigente = DataLoader.isCarreraVigente(c.carrera);
      const esPrimeraPromocion = DataLoader.isPrimeraPromocion(c.carrera);
      let zonaRiesgo = 'adecuada';
      if (c.tasa < 60) zonaRiesgo = 'critica';
      else if (c.tasa < 75) zonaRiesgo = 'alerta';

      carreras[c.carrera] = {
        carrera: c.carrera,
        facultad: DataLoader.getFacultadForCarrera(c.carrera),
        grupo,
        esVigente,
        esPrimeraPromocion,
        zonaRiesgo,
        ocupacion: c.tasa,
        total: c.total,
        trabajadores: c.trabajadores,
        pertinencia: []
      };
    });

    const trabajadores = this.getRespuestasTrabajadores(data);
    trabajadores.forEach(d => {
      const carrera = d[this.cols.carrera];
      if (carreras[carrera]) {
        const pert = d[this.cols.pertinencia];
        if (pert) carreras[carrera].pertinencia.push(pert);
      }
    });

    Object.keys(carreras).forEach(carrera => {
      const pert = carreras[carrera].pertinencia;
      const totalPert = pert.length;
      const relacionadas = pert.filter(p => p.includes('totalmente') || p.includes('parcialmente')).length;
      const totalmente = pert.filter(p => p.includes('totalmente')).length;
      const parcialmente = pert.filter(p => p.includes('parcialmente')).length;
      const noRelacionadas = pert.filter(p => p.includes('no está') || p.includes('no esta')).length;

      const tasaPertinencia = totalPert > 0 ? (relacionadas / totalPert) * 100 : 0;
      const tasaPertinenciaAlta = totalPert > 0 ? (totalmente / totalPert) * 100 : 0;

      let semaforoPertinencia = 'alta';
      let semaforoBadge = '🟢 Alta (≥75%)';
      if (tasaPertinenciaAlta < 60) {
        semaforoPertinencia = 'baja';
        semaforoBadge = '🔵 Baja (<60%)';
      } else if (tasaPertinenciaAlta < 75) {
        semaforoPertinencia = 'media';
        semaforoBadge = '🟡 Media (60-74.9%)';
      }

      carreras[carrera].totalPertinencia = totalPert;
      carreras[carrera].totalmenteRelacionadas = totalmente;
      carreras[carrera].parcialmenteRelacionadas = parcialmente;
      carreras[carrera].noRelacionadas = noRelacionadas;
      carreras[carrera].tasaPertinencia = tasaPertinencia;
      carreras[carrera].tasaPertinenciaAlta = tasaPertinenciaAlta;
      carreras[carrera].semaforoPertinencia = semaforoPertinencia;
      carreras[carrera].semaforoBadge = semaforoBadge;

      delete carreras[carrera].pertinencia;
    });

    return Object.values(carreras).sort((a, b) => b.ocupacion - a.ocupacion);
  },

  getEvolucionCohortes(data) {
    const cohortes = {};
    const añoActual = new Date().getFullYear();
    
    let total2026 = 0;
    let trabaja2026 = 0;
    let pea2026 = 0;
    let ocupadosPea2026 = 0;

    data.forEach(d => {
      const anio = parseInt(d[this.cols.anioEgreso]);
      if (isNaN(anio) || anio < 2019 || anio > 2025) return;
      
      const madurez = añoActual - anio; // 2025 -> 1, 2019 -> 7
      
      if (!cohortes[madurez]) {
        cohortes[madurez] = { madurez, anio, total: 0, trabaja: 0, pea: 0, ocupadosPea: 0 };
      }
      
      const cond = d[this.cols.condicion] ? d[this.cols.condicion].toLowerCase() : '';
      const trabajando = cond.includes('dependiente') || cond.includes('independiente') || cond.includes('empleado') || d[this.cols.trabaja] === 'Sí';
      const busca = cond.includes('buscando');
      const emp = cond.includes('emprendedor') || cond.includes('negocio') || cond.includes('propietario') || cond.includes('emprendimiento');
      
      const isOcupado = trabajando || emp;
      const isPEA = isOcupado || busca;

      cohortes[madurez].total++;
      if (isOcupado) cohortes[madurez].trabaja++;
      if (isPEA) cohortes[madurez].pea++;
      if (isOcupado && isPEA) cohortes[madurez].ocupadosPea++;

      total2026++;
      if (isOcupado) trabaja2026++;
      if (isPEA) pea2026++;
      if (isOcupado && isPEA) ocupadosPea2026++;
    });

    return {
      cohortes: Object.values(cohortes).sort((a, b) => a.madurez - b.madurez).map(c => ({
        ...c,
        tasaOcupacionPEA: c.pea > 0 ? (c.ocupadosPea / c.pea) * 100 : 0
      })),
      encuesta2026: {
        tasaTrabajaTotal: total2026 > 0 ? (trabaja2026 / total2026) * 100 : 0,
        tasaPEA: pea2026 > 0 ? (ocupadosPea2026 / pea2026) * 100 : 0
      }
    };
  },

  getProgresionPorAntiguedad(data) {
    const cohortes = {};
    const añoActual = new Date().getFullYear();
    
    data.forEach(d => {
      const anio = parseInt(d[this.cols.anioEgreso]);
      if (isNaN(anio) || anio < 2019 || anio > 2025) return;
      
      const cond = d[this.cols.condicion] ? d[this.cols.condicion].toLowerCase() : '';
      // OJO: 'independiente' contiene 'dependiente' como subcadena; se excluye explícitamente.
      if (!cond.includes('dependiente') || cond.includes('independiente')) return; // Solo dependientes para este analisis
      
      const madurez = añoActual - anio;
      if (!cohortes[madurez]) {
        cohortes[madurez] = { madurez, total: 0, ascenso: 0, personal: 0, salariosAltos: 0, salariosValidos: 0 };
      }
      
      cohortes[madurez].total++;
      
      const ascenso = d[this.cols.ascenso];
      if (ascenso && (ascenso.toLowerCase().includes('sí') || ascenso.toLowerCase().includes('si'))) {
        cohortes[madurez].ascenso++;
      }
      
      const personal = d[this.cols.personalCargo];
      if (personal && (personal.toLowerCase().includes('sí') || personal.toLowerCase().includes('si'))) {
        cohortes[madurez].personal++;
      }

      const ingresoRaw = d[this.cols.salario];
      if (ingresoRaw && ingresoRaw.trim() !== '' && ingresoRaw !== '0') {
        const ing = parseFloat(ingresoRaw);
        if (!isNaN(ing)) {
          cohortes[madurez].salariosValidos++;
          if (ing > 3000) cohortes[madurez].salariosAltos++;
        }
      }
    });

    return Object.values(cohortes).sort((a, b) => a.madurez - b.madurez).map(c => ({
      madurez: c.madurez,
      tasaAscenso: c.total > 0 ? (c.ascenso / c.total) * 100 : 0,
      tasaPersonal: c.total > 0 ? (c.personal / c.total) * 100 : 0,
      tasaSalarioAlto: c.salariosValidos > 0 ? (c.salariosAltos / c.salariosValidos) * 100 : 0
    }));
  },


  getImpactoPosgrado(data) {
    const impacto = {
      conPosgrado: { total: 0, trabaja: 0, pertinenciaValidas: 0, pertinenciaAlta: 0, personal: 0, salariosValidos: 0, salariosAltos: 0, ascensosValidos: 0, ascensos: 0 },
      sinPosgrado: { total: 0, trabaja: 0, pertinenciaValidas: 0, pertinenciaAlta: 0, personal: 0, salariosValidos: 0, salariosAltos: 0, ascensosValidos: 0, ascensos: 0 }
    };
    
    data.forEach(d => {
      const valPosgrado = d[this.cols.posgrado];
      if (!valPosgrado) return;
      
      const tienePosgrado = (valPosgrado.toLowerCase().includes('sí') || valPosgrado.toLowerCase().includes('si') || !valPosgrado.toLowerCase().includes('no he realizado'));
      const obj = tienePosgrado ? impacto.conPosgrado : impacto.sinPosgrado;
      
      obj.total++;
      
      if (d[this.cols.trabaja] === 'Sí') {
        obj.trabaja++;
        
        const pert = d[this.cols.pertinencia];
        if (pert) {
          obj.pertinenciaValidas++;
          if (pert.includes('totalmente') || pert.includes('parcialmente')) obj.pertinenciaAlta++;
        }
        
        const personal = d[this.cols.personalCargo];
        if (personal && (personal.toLowerCase().includes('sí') || personal.toLowerCase().includes('si'))) {
          obj.personal++;
        }
        
        const salario = d[this.cols.salario];
        if (salario && !salario.includes('Prefiero no decirlo')) {
          obj.salariosValidos++;
          if (salario.includes('3,001') || salario.includes('5,001') || salario.includes('8,001')) {
            obj.salariosAltos++;
          }
        }
        
        const ascenso = d[this.cols.ascenso];
        if (ascenso && !ascenso.toLowerCase().includes('independiente')) {
          obj.ascensosValidos++;
          if (ascenso.toLowerCase().includes('sí') || ascenso.toLowerCase().includes('si')) {
            obj.ascensos++;
          }
        }
      }
    });
    
    const calc = (o) => ({
      tasaTrabaja: o.total > 0 ? (o.trabaja / o.total) * 100 : 0,
      tasaPertinencia: o.pertinenciaValidas > 0 ? (o.pertinenciaAlta / o.pertinenciaValidas) * 100 : 0,
      personal: o.trabaja > 0 ? (o.personal / o.trabaja) * 100 : 0,
      salarioAlto: o.salariosValidos > 0 ? (o.salariosAltos / o.salariosValidos) * 100 : 0,
      ascensos: o.ascensosValidos > 0 ? (o.ascensos / o.ascensosValidos) * 100 : 0
    });
    
    return {
      conPosgrado: { ...impacto.conPosgrado, ...calc(impacto.conPosgrado) },
      sinPosgrado: { ...impacto.sinPosgrado, ...calc(impacto.sinPosgrado) }
    };
  },

  getDistribucionModalidad(data) {
    const modalidades = {};
    let totalOcupados = 0;
    
    data.forEach(d => {
      if (d[this.cols.trabaja] === 'Sí') {
        totalOcupados++;
        let mod = d[this.cols.modalidad] ? d[this.cols.modalidad].trim() : 'No indica';
        if (mod === '') mod = 'No indica';
        
        if (!modalidades[mod]) modalidades[mod] = 0;
        modalidades[mod]++;
      }
    });
    
    return Object.entries(modalidades)
      .map(([modalidad, count]) => ({ modalidad, count, porcentaje: totalOcupados > 0 ? (count / totalOcupados) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
  },

  getSectoresEmpleo(data) {
    const sectores = {};
    let total = 0;
    const trabajadores = this.getRespuestasTrabajadores(data);
    
    trabajadores.forEach(d => {
      const rubro = (d[this.cols.rubro] || '').trim();
      if (rubro && rubro !== '' && rubro !== 'Prefiero no decirlo') {
        if (!sectores[rubro]) sectores[rubro] = 0;
        sectores[rubro]++;
        total++;
      }
    });

    return Object.entries(sectores)
      .map(([sector, count]) => ({ sector, count, porcentaje: total > 0 ? (count / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  },

  getDistribucionOcupacion(data) {
    return this.getTrazabilidadPEAPorCarrera(data);
  },

  getKpisPrincipales(data) {
    return this.getIndicadoresClave2026(data);
  },

  getIndicadoresClave2026(data) {
    const totalMuestra = data.length;
    if (totalMuestra === 0) {
      const empty = { valor: '0.0%', sub: 'Sin datos', titulo: '', icono: '', color: '' };
      return {
        encuestasValidas: empty,
        trabajaActualmente: empty,
        ocupacionPEA: empty,
        pertinencia: empty,
        satisfaccion: empty,
        personalCargo: empty,
        ascenso: empty,
        ingresoMayor3000: empty,
        conPosgrado: empty,
        interesPosgrado: empty,
        nps: empty
      };
    }

    // 1. Encuestas válidas x registros únicos (100%)
    const dnis = data.map(d => d['DNI:']).filter(Boolean);
    const dnisUnicos = new Set(dnis).size;
    const pctValidasUnicos = totalMuestra > 0 ? ((dnisUnicos / totalMuestra) * 100) : 0;

    // 2. Trabaja actualmente (81.5% del total)
    const trabajaSi = data.filter(d => {
      const t = (d[this.cols.trabaja] || '').trim().toLowerCase();
      return t === 'sí' || t === 'si';
    }).length;
    const pctTrabaja = totalMuestra > 0 ? ((trabajaSi / totalMuestra) * 100) : 0;

    // 3. Ocupación de la PEA (95.0%)
    const trazabilidad = this.getTrazabilidadPEAPorCarrera(data);
    const tot = trazabilidad.totales;
    const ocupacionPEA = tot.tasaPEATotal;

    // Trabajadores con respuesta Sí
    const trabajadores = data.filter(d => {
      const t = (d[this.cols.trabaja] || '').trim().toLowerCase();
      return t === 'sí' || t === 'si';
    });

    // 4. Pertinencia total o parcial (90.6%)
    const pertValidos = trabajadores.filter(d => d[this.cols.pertinencia]);
    const pertAlta = pertValidos.filter(d => {
      const p = (d[this.cols.pertinencia] || '').toLowerCase();
      return p.includes('totalmente') || p.includes('parcialmente');
    }).length;
    const pctPertinencia = pertValidos.length > 0 ? ((pertAlta / pertValidos.length) * 100) : 0;

    // 5. Satisfacción laboral (88.3%)
    const satValidos = trabajadores.filter(d => d[this.cols.satisfaccion]);
    const satAlta = satValidos.filter(d => {
      const s = (d[this.cols.satisfaccion] || '').toLowerCase();
      return s.includes('satisfecho') && !s.includes('insatisfecho');
    }).length;
    const pctSatisfaccion = satValidos.length > 0 ? ((satAlta / satValidos.length) * 100) : 0;

    // 6. Personal a cargo (40.8%)
    const cargoValidos = trabajadores.filter(d => d[this.cols.personalCargo]);
    const cargoSi = cargoValidos.filter(d => {
      const c = (d[this.cols.personalCargo] || '').toLowerCase();
      return c.includes('sí') || c.includes('si');
    }).length;
    const pctPersonalCargo = cargoValidos.length > 0 ? ((cargoSi / cargoValidos.length) * 100) : 0;

    // 7. Ascenso entre dependientes (28.9%)
    // OJO: 'independiente' contiene 'dependiente' como subcadena; se excluye explícitamente.
    const dependientes = trabajadores.filter(d => {
      const c = (d[this.cols.condicion] || '').toLowerCase();
      return c.includes('dependiente') && !c.includes('independiente');
    });
    const ascValidos = dependientes.filter(d => {
      const a = (d[this.cols.ascenso] || '').trim().toLowerCase();
      return a === 'sí' || a === 'si' || a === 'no';
    });
    const ascSi = ascValidos.filter(d => {
      const a = (d[this.cols.ascenso] || '').toLowerCase();
      return a.includes('sí') || a.includes('si');
    }).length;
    const pctAscenso = ascValidos.length > 0 ? ((ascSi / ascValidos.length) * 100) : 0;

    // 8. Ingreso > S/ 3,000 declarado (35.5%)
    const ingresosValidos = trabajadores.filter(d => {
      const s = (d[this.cols.salario] || '').trim();
      return s && !s.toLowerCase().includes('prefiero no decirlo');
    });
    const ingresosAltos = ingresosValidos.filter(d => {
      const s = d[this.cols.salario] || '';
      return s.includes('3,001') || s.includes('5,001') || s.includes('8,001') || s.includes('Más de');
    }).length;
    const pctIngresoAlto = ingresosValidos.length > 0 ? ((ingresosAltos / ingresosValidos.length) * 100) : 0;

    // 9. Con estudios de posgrado (16.8%)
    const posgSi = data.filter(d => {
      const p = (d[this.cols.posgrado] || '').trim().toLowerCase();
      return p === 'sí' || p === 'si';
    }).length;
    const pctPosgrado = totalMuestra > 0 ? ((posgSi / totalMuestra) * 100) : 0;

    // 10. Interés en posgrado Wiener (55.3%)
    const colInteres = this.cols.interesPosgrado || '6. ¿Tienes interés en llevar un posgrado en la UNW a corto plazo?';
    const interesSi = data.filter(d => {
      const p = (d[colInteres] || d[this.cols.posgradoInteres] || '').trim().toLowerCase();
      return p.includes('sí') || p.includes('si');
    }).length;
    const pctInteresPosgrado = totalMuestra > 0 ? ((interesSi / totalMuestra) * 100) : 0;

    // 11. NPS institucional (+39.6)
    const npsTrab = trabajadores.map(d => parseInt(d[this.cols.nps])).filter(v => !isNaN(v) && v >= 0 && v <= 10);
    const colNpsDes = this.cols.npsDesempleado || '6. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?';
    const npsDes = data.filter(d => (d[this.cols.trabaja] || '').trim().toLowerCase() !== 'sí')
      .map(d => parseInt(d[colNpsDes] || d[this.cols.nps]))
      .filter(v => !isNaN(v) && v >= 0 && v <= 10);
    const todosNPS = [...npsTrab, ...npsDes];
    const promotores = todosNPS.filter(v => v >= 9).length;
    const detractores = todosNPS.filter(v => v <= 6).length;
    const npsScore = todosNPS.length > 0 ? (((promotores - detractores) / todosNPS.length) * 100) : 0;

    // 12. Métricas de Emprendimiento
    const colFormalizacion = '2.3 Si responde "Propietario o socio de negocio/emprendimiento". Respecto a su emprendimiento o negocio: (E: LEER ALTERNATIVAS)';
    const colRelacionEmp = '2.3.1 ¿El emprendimiento está relacionado con su profesión?';
    const emprendedoresList = data.filter(d => {
      const c = String(d[this.cols.condicion] || '');
      return c === 'Emprendedor' || c.includes('Propietario') || c.includes('emprendimiento');
    });
    const totalEmprendedores = emprendedoresList.length;
    const formalizadosCount = emprendedoresList.filter(d => String(d[colFormalizacion] || '').includes('Formalizado')).length;
    const afinesCount = emprendedoresList.filter(d => String(d[colRelacionEmp] || '').trim().toLowerCase().startsWith('sí') || String(d[colRelacionEmp] || '').trim().toLowerCase().startsWith('si')).length;

    const pctFormalizados = totalEmprendedores > 0 ? ((formalizadosCount / totalEmprendedores) * 100) : 0;
    const pctAfines = totalEmprendedores > 0 ? ((afinesCount / totalEmprendedores) * 100) : 0;
    const pctSobreOcupados = tot.totalOcupadosConEmprendimiento > 0 ? ((totalEmprendedores / tot.totalOcupadosConEmprendimiento) * 100) : 0;

    return {
      encuestasValidas: {
        titulo: 'Encuestas Válidas x Registros Únicos',
        valor: `${pctValidasUnicos.toFixed(0)}%`,
        sub: `${dnisUnicos.toLocaleString()} registros únicos (100% de la muestra)`,
        icono: 'fas fa-id-card-clip',
        color: '#2563eb'
      },
      trabajaActualmente: {
        titulo: 'Trabaja Actualmente',
        valor: `${Math.round(pctTrabaja)}%`,
        sub: `${trabajaSi.toLocaleString()} egresados con empleo del total`,
        icono: 'fas fa-user-tie',
        color: '#0284c7'
      },
      ocupacionPEA: {
        titulo: 'Nivel de Empleabilidad',
        valor: `${Math.round(ocupacionPEA)}%`,
        sub: `${tot.totalOcupadosConEmprendimiento.toLocaleString()} ocupados del mercado activo`,
        icono: 'fas fa-chart-line',
        color: '#10b981'
      },
      pertinencia: {
        titulo: 'Pertinencia Total o Parcial',
        valor: `${Math.round(pctPertinencia)}%`,
        sub: `${pertAlta.toLocaleString()} de ${pertValidos.length.toLocaleString()} con empleo afín`,
        icono: 'fas fa-bullseye',
        color: '#059669'
      },
      satisfaccion: {
        titulo: 'Satisfacción Laboral',
        valor: `${Math.round(pctSatisfaccion)}%`,
        sub: `${satAlta.toLocaleString()} satisfechos o muy satisfechos`,
        icono: 'fas fa-smile-beam',
        color: '#16a34a'
      },
      personalCargo: {
        titulo: 'Personal a Cargo',
        valor: `${Math.round(pctPersonalCargo)}%`,
        sub: `${cargoSi.toLocaleString()} de ${cargoValidos.length.toLocaleString()} lideran equipos`,
        icono: 'fas fa-users-cog',
        color: '#d97706'
      },
      ascenso: {
        titulo: 'Ascenso entre Dependientes',
        valor: `${Math.round(pctAscenso)}%`,
        sub: `${ascSi.toLocaleString()} de ${ascValidos.length.toLocaleString()} dependientes promovidos`,
        icono: 'fas fa-arrow-trend-up',
        color: '#ea580c'
      },
      ingresoMayor3000: {
        titulo: 'Ingreso > S/ 3,000 Declarado',
        valor: `${Math.round(pctIngresoAlto)}%`,
        sub: `${ingresosAltos.toLocaleString()} de ${ingresosValidos.length.toLocaleString()} perciben > S/ 3,000`,
        icono: 'fas fa-money-bill-wave',
        color: '#8b5cf6'
      },
      conPosgrado: {
        titulo: 'Con Estudios de Posgrado',
        valor: `${Math.round(pctPosgrado)}%`,
        sub: `${posgSi.toLocaleString()} de ${totalMuestra.toLocaleString()} cursaron posgrado`,
        icono: 'fas fa-graduation-cap',
        color: '#6366f1'
      },
      interesPosgrado: {
        titulo: 'Interés en Posgrado Wiener',
        valor: `${Math.round(pctInteresPosgrado)}%`,
        sub: `${interesSi.toLocaleString()} de ${totalMuestra.toLocaleString()} con interés a corto plazo`,
        icono: 'fas fa-university',
        color: '#ec4899'
      },
      nps: {
        titulo: 'NPS Institucional',
        valor: `${npsScore >= 0 ? '+' : ''}${Math.round(npsScore)}`,
        sub: `Net Promoter Score (${promotores.toLocaleString()} promotores)`,
        icono: 'fas fa-award',
        color: '#0d9488'
      },
      emprendedoresTotal: {
        titulo: 'Datos Emprendimiento',
        valor: `${totalEmprendedores.toLocaleString()}`,
        sub: `${Math.round(pctSobreOcupados)}% de los egresados ocupados`,
        icono: 'fas fa-store',
        color: '#8b5cf6',
        total: totalEmprendedores
      },
      emprendedoresFormalizados: {
        titulo: 'Formalización RUC Activo',
        valor: `${Math.round(pctFormalizados)}%`,
        sub: `${formalizadosCount.toLocaleString()} con RUC activo y declarado`,
        icono: 'fas fa-file-invoice-dollar',
        color: '#10b981'
      },
      emprendedoresAfines: {
        titulo: 'Emprendimiento Afín a Carrera',
        valor: `${Math.round(pctAfines)}%`,
        sub: `${afinesCount.toLocaleString()} relacionados con su profesión`,
        icono: 'fas fa-briefcase',
        color: '#0284c7'
      }
    };
  },

  // Ranking de empleadores reales, excluyendo respuestas genéricas ("Sin dato",
  // "Persona Natural", "Independiente", etc.) que no identifican un empleador concreto.
  getTopEmpleadores(data, n = 10) {
    const noise = new Set([
      '', 'sin dato', 'sin dato (descripción genérica, sin nombre propio)', 'no especifica',
      'persona natural', 'independiente', 'consultorio propio', 'consultorio',
      'consultorio privado', 'consultorio particular'
    ]);
    const counts = {};
    data.forEach(d => {
      const raw = String(d[this.cols.empresaLimpia] || '').trim();
      if (!raw || noise.has(raw.toLowerCase())) return;
      counts[raw] = (counts[raw] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([empresa, cantidad]) => ({ empresa, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, n);
  },

  // Promedio ponderado del sueldo mensual, usando el punto medio oficial de cada
  // categoría de "Sueldo Promedio" (columna ya categorizada por la institución).
  getSueldoPromedioEstimado(data) {
    let suma = 0, n = 0;
    data.forEach(d => {
      const raw = String(d[this.cols.sueldoPromedio] || '').trim();
      if (!raw) return;
      const num = parseFloat(raw.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
      if (!isNaN(num) && num > 0) { suma += num; n++; }
    });
    return { promedio: n > 0 ? Math.round(suma / n) : 0, n };
  },

  // Parsea el punto medio numérico de "Sueldo Promedio" para una sola fila (mismo criterio que
  // getSueldoPromedioEstimado). Se expone aparte para poder agrupar por cualquier criterio
  // (carrera, año de egreso, facultad...) sin duplicar el parseo en cada página.
  parseSueldoPromedioRow(d) {
    const raw = String(d[this.cols.sueldoPromedio] || '').trim();
    if (!raw) return null;
    const num = parseFloat(raw.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
    return (!isNaN(num) && num > 0) ? num : null;
  },

  // Sueldo promedio agrupado por un criterio arbitrario (carrera, año de egreso, etc.), usando el
  // mismo punto medio oficial. `groupFn(row)` devuelve la clave del grupo (o null/'' para excluir
  // la fila). SOLO válido dentro de una misma edición del instrumento (mismos rangos salariales) —
  // no comparar el resultado entre la encuesta 2025 y la 2026: los tramos de "9. ¿Cuál es tu
  // ingreso mensual...?" cambiaron de rango entre ediciones (2025: Hasta 1,130 / 1,131-2,000 /
  // 2,001-3,000 / 3,001-5,000 / Más de 5,000 — 2026: Hasta 1,500 / 1,501-3,000 / 3,001-5,000 /
  // 5,001-8,000 / Más de 8,001), así que un promedio por punto medio de cada edición no es
  // comparable entre años: la diferencia reflejaría el cambio de tramos del instrumento, no un
  // cambio real de sueldos.
  getSueldoPromedioAgrupado(data, groupFn) {
    const grupos = {};
    data.forEach(d => {
      const num = this.parseSueldoPromedioRow(d);
      if (num == null) return;
      const key = groupFn(d);
      if (!key) return;
      if (!grupos[key]) grupos[key] = { suma: 0, n: 0 };
      grupos[key].suma += num;
      grupos[key].n++;
    });
    return Object.entries(grupos).map(([key, v]) => ({ key, promedio: Math.round(v.suma / v.n), n: v.n }));
  }
};

window.Calculations = Calculations;
