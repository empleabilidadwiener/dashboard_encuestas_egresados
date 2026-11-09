// js/pages/resultados-generales.js — Resultados Generales: gráficos por cada pregunta
// Generates: general distribution + cross-tabs by career + by year of graduation
// Features: % labels on bars, undefined sorted to end, editor integration

const QUESTIONS = [
  {
    id: 'trabaja',
    titulo: '¿Trabaja actualmente?',
    icono: 'fas fa-briefcase',
    color: '#07C8CC',
    fieldId: 'trabaja',
    chartType: 'doughnut',
    family: 'Situación Laboral'
  },
  {
    id: 'condicion',
    titulo: 'Condición Laboral',
    icono: 'fas fa-user-tie',
    color: '#07C8CC',
    fieldId: 'condicion',
    chartType: 'horizontal_bar',
    family: 'Situación Laboral'
  },
  {
    id: 'modalidadVinculacion',
    titulo: 'Modalidad de Vinculación Laboral (Dependientes)',
    icono: 'fas fa-file-signature',
    color: '#368BA1',
    fieldId: 'modalidadVinculacion',
    chartType: 'horizontal_bar',
    family: 'Situación Laboral'
  },
  {
    id: 'actividadIndependiente',
    titulo: 'Actividad Profesional (Independientes)',
    icono: 'fas fa-user-md',
    color: '#D99B00',
    fieldId: 'actividadIndependiente',
    chartType: 'horizontal_bar',
    family: 'Situación Laboral'
  },
  {
    id: 'emprendimientoFormalizacion',
    titulo: 'Formalización del Emprendimiento (Propietarios)',
    icono: 'fas fa-stamp',
    color: '#2E7D32',
    fieldId: 'emprendimientoFormalizacion',
    chartType: 'doughnut',
    family: 'Situación Laboral'
  },
  {
    id: 'emprendimientoRelacionado',
    titulo: 'Emprendimiento Relacionado con la Profesión',
    icono: 'fas fa-link',
    color: '#7B1FA2',
    fieldId: 'emprendimientoRelacionado',
    chartType: 'doughnut',
    family: 'Situación Laboral'
  },
  {
    id: 'rubro',
    titulo: 'Rubro / Sector de la Empresa',
    icono: 'fas fa-industry',
    color: '#D99B00',
    fieldId: 'rubro',
    chartType: 'horizontal_bar',
    family: 'Situación Laboral'
  },
  {
    id: 'tipoEmpresa',
    titulo: 'Tipo de Empresa',
    icono: 'fas fa-building',
    color: '#0284C7',
    fieldId: 'tipoEmpresa',
    chartType: 'doughnut',
    family: 'Situación Laboral'
  },
  {
    id: 'modalidad',
    titulo: 'Modalidad de Trabajo',
    icono: 'fas fa-laptop-house',
    color: '#368BA1',
    fieldId: 'modalidad',
    chartType: 'doughnut',
    family: 'Situación Laboral'
  },
  {
    id: 'tamanoEmpresa',
    titulo: 'Tamaño de la Empresa',
    icono: 'fas fa-building',
    color: '#0284C7',
    fieldId: 'tamanoEmpresa',
    chartType: 'doughnut',
    family: 'Situación Laboral'
  },
  {
    id: 'zonaGeografica',
    titulo: 'Zona Geográfica de Trabajo',
    icono: 'fas fa-map-marker-alt',
    color: '#368BA1',
    fieldId: 'zonaGeografica',
    chartType: 'horizontal_bar',
    family: 'Situación Laboral'
  },
  {
    id: 'cargoActual',
    titulo: 'Puesto Actual',
    icono: 'fas fa-id-badge',
    color: '#D99B00',
    fieldId: 'cargoActual',
    chartType: 'horizontal_bar',
    family: 'Situación Laboral'
  },
  {
    id: 'tiempoCargoActual',
    titulo: 'Tiempo en el Cargo Actual',
    icono: 'fas fa-hourglass-half',
    color: '#F97316',
    fieldId: 'tiempoCargoActual',
    chartType: 'bar',
    family: 'Situación Laboral'
  },
  {
    id: 'nivelCargo',
    titulo: 'Nivel de Cargo Actual (Junior, Senior, Gerencia, CEO...)',
    icono: 'fas fa-sitemap',
    color: '#0284C7',
    fieldId: 'nivelCargo',
    chartType: 'horizontal_bar',
    family: 'Situación Laboral'
  },
  {
    id: 'salario',
    titulo: 'Ingreso Mensual Bruto',
    icono: 'fas fa-money-bill-wave',
    color: '#2E7D32',
    fieldId: 'salario',
    chartType: 'bar',
    family: 'Situación Laboral'
  },
  {
    id: 'satisfaccion',
    titulo: 'Satisfacción Laboral',
    icono: 'fas fa-smile',
    color: '#F59E0B',
    fieldId: 'satisfaccion',
    chartType: 'bar',
    family: 'Calidad & Opinión'
  },
  {
    id: 'pertinencia',
    titulo: 'Pertinencia con la Carrera',
    icono: 'fas fa-check-double',
    color: '#07C8CC',
    fieldId: 'pertinencia',
    chartType: 'bar',
    family: 'Calidad & Opinión'
  },
  {
    id: 'ascenso',
    titulo: 'Ascensos en los Últimos 5 Años',
    icono: 'fas fa-arrow-trend-up',
    color: '#10B981',
    fieldId: 'ascenso',
    chartType: 'doughnut',
    family: 'Crecimiento'
  },
  {
    id: 'personalCargo',
    titulo: 'Personal a Cargo',
    icono: 'fas fa-users',
    color: '#7B1FA2',
    fieldId: 'personalCargo',
    chartType: 'doughnut',
    family: 'Crecimiento'
  },
  {
    id: 'practicasNID',
    titulo: 'Prácticas Preprofesionales (Egresados NID)',
    icono: 'fas fa-user-graduate',
    color: '#10B981',
    fieldId: 'practicasNID',
    chartType: 'doughnut',
    family: 'Crecimiento'
  },
  {
    id: 'tiempoPrimerEmpleo',
    titulo: 'Tiempo para Obtener Primer Empleo',
    icono: 'fas fa-clock',
    color: '#F97316',
    fieldId: 'tiempoPrimerEmpleo',
    chartType: 'horizontal_bar',
    family: 'Crecimiento'
  },
  {
    id: 'primerEmpleo',
    titulo: 'Primer Empleo Relacionado con la Carrera',
    icono: 'fas fa-graduation-cap',
    color: '#EC4899',
    fieldId: 'primerEmpleo',
    chartType: 'doughnut',
    family: 'Crecimiento'
  },
  {
    id: 'nivelPrimerEmpleo',
    titulo: 'Nivel del Primer Empleo (Junior, Senior, Gerencia...)',
    icono: 'fas fa-shoe-prints',
    color: '#EC4899',
    fieldId: 'nivelPrimerEmpleo',
    chartType: 'horizontal_bar',
    family: 'Crecimiento'
  },
  {
    id: 'nps',
    titulo: 'NPS — Probabilidad de Recomendar la Universidad',
    icono: 'fas fa-star',
    color: '#D99B00',
    fieldId: 'nps',
    chartType: 'bar',
    family: 'Calidad & Opinión'
  },
  {
    id: 'colegiatura',
    titulo: 'Situación de Colegiatura Profesional',
    icono: 'fas fa-id-card',
    color: '#06B6D4',
    fieldId: 'colegiatura',
    chartType: 'bar',
    family: 'Calidad & Opinión'
  },
  {
    id: 'razonNoTrabaja',
    titulo: 'Razón Principal por la que No Trabaja',
    icono: 'fas fa-question-circle',
    color: '#F08568',
    fieldId: 'razonNoTrabaja',
    chartType: 'horizontal_bar',
    family: 'No Trabaja'
  },
  {
    id: 'tiempoDesempleo',
    titulo: 'Tiempo en Situación de Desempleo',
    icono: 'fas fa-user-clock',
    color: '#F08568',
    fieldId: 'tiempoDesempleo',
    chartType: 'bar',
    family: 'No Trabaja'
  },
  {
    id: 'trabajadoAnteriormente',
    titulo: '¿Ha Trabajado Anteriormente?',
    icono: 'fas fa-history',
    color: '#F08568',
    fieldId: 'trabajadoAnteriormente',
    chartType: 'doughnut',
    family: 'No Trabaja'
  },
  {
    id: 'gradoAcademico',
    titulo: 'Condición Académica (Egresado, Bachiller, Titulado)',
    icono: 'fas fa-user-graduate',
    color: '#06B6D4',
    fieldId: 'gradoAcademico',
    chartType: 'doughnut',
    family: 'Formación'
  },
  {
    id: 'posgrado',
    titulo: 'Estudios de Posgrado Realizados',
    icono: 'fas fa-book-open',
    color: '#7C3AED',
    fieldId: 'posgrado',
    chartType: 'doughnut',
    family: 'Formación'
  },
  {
    id: 'tipoPosgrado',
    titulo: 'Tipo de Estudios de Posgrado',
    icono: 'fas fa-user-graduate',
    color: '#7C3AED',
    fieldId: 'tipoPosgrado',
    chartType: 'horizontal_bar',
    family: 'Formación'
  },
  {
    id: 'tipoInstitucionPosgrado',
    titulo: 'Tipo de Institución de Posgrado',
    icono: 'fas fa-university',
    color: '#06B6D4',
    fieldId: 'tipoInstitucionPosgrado',
    chartType: 'horizontal_bar',
    family: 'Formación'
  },
  {
    id: 'universidadPosgradoTipo',
    titulo: 'Universidad de Posgrado (Pública / Privada)',
    icono: 'fas fa-landmark',
    color: '#7C3AED',
    fieldId: 'universidadPosgradoTipo',
    chartType: 'doughnut',
    family: 'Formación'
  },
  {
    id: 'universidadPosgradoPais',
    titulo: 'Universidad de Posgrado (Nacional / Extranjera)',
    icono: 'fas fa-globe-americas',
    color: '#06B6D4',
    fieldId: 'universidadPosgradoPais',
    chartType: 'doughnut',
    family: 'Formación'
  },
  {
    id: 'posgradoDeseadoCategoria',
    titulo: 'Tipo de Posgrado de Interés (a futuro)',
    icono: 'fas fa-lightbulb',
    color: '#7B1FA2',
    fieldId: 'posgradoDeseadoCategoria',
    chartType: 'horizontal_bar',
    family: 'Formación'
  },
  {
    id: 'interesPosgrado',
    titulo: 'Interés en Posgrado en la UNW',
    icono: 'fas fa-graduation-cap',
    color: '#7B1FA2',
    fieldId: 'interesPosgrado',
    chartType: 'doughnut',
    family: 'Formación'
  },
  {
    id: 'iniciativas',
    titulo: 'Iniciativas Alumni de Interés',
    icono: 'fas fa-hands-helping',
    color: '#14B8A6',
    fieldId: 'iniciativas',
    chartType: 'horizontal_bar',
    multiple: true,
    family: 'Formación',
    fields: [
      { id: 'iniciativaNetworking', label: 'Networking con egresados' },
      { id: 'iniciativaMentoria', label: 'Mentoría a estudiantes' },
      { id: 'iniciativaPonente', label: 'Participación como ponente' },
      { id: 'iniciativaTalleres', label: 'Talleres y cursos' },
      { id: 'iniciativaOportunidades', label: 'Acceso a oportunidades laborales' },
      { id: 'iniciativaBeneficios', label: 'Beneficios y convenios' },
      { id: 'iniciativaVoluntariado', label: 'Voluntariado e impacto social' },
      { id: 'iniciativaDeportivas', label: 'Actividades deportivas' },
      { id: 'iniciativaEmbajadores', label: 'Red de Embajadores Alumni' }
    ]
  },
  {
    id: 'apoyoUniversidad',
    titulo: 'Apoyo de la Universidad (Desempleados)',
    icono: 'fas fa-hand-holding-heart',
    color: '#0d9488',
    fieldId: 'apoyoUniversidad',
    chartType: 'horizontal_bar',
    multiple: true,
    family: 'No Trabaja',
    fields: [
      { id: 'apoyoFormo', label: 'Ya me formó, conseguir empleo depende de mí' },
      { id: 'apoyoCursos', label: 'Cursos y actualización profesional' },
      { id: 'apoyoOfertas', label: 'Ofertas de empleo' },
      { id: 'apoyoEntrenando', label: 'Entrenamiento para entrevistas' },
      { id: 'apoyoOtro', label: 'Otro' }
    ]
  }
];

const UNDEFINED_LABELS = ['No precisa', 'Otro', 'Otra', 'Otro (especificar)', 'No aplica', 'No declara', 'No precisa / No aplica', 'Trabaja actualmente / No aplica', 'No aplica / No precisa'];
const UNW_COLORS = ['#07C8CC', '#368BA1', '#88E788', '#D1D5DB', '#DCB17C', '#F08568', '#F2D963', '#C96590', '#64748B', '#94A3B8'];

// Preguntas donde el color Wiener (celeste institucional) debe identificar SIEMPRE la categoría
// positiva del instrumento — sea o no la mayoritaria — en vez de la que tenga más respuestas
// (regla anterior: "el color a la mayoría", que en preguntas donde "No" gana hacía que el celeste
// terminara marcando la respuesta negativa). El orden de cada arreglo va de más a menos positiva;
// getPositiveOrderedColors() lo usa para asignar el fundido teal→gris (POSITIVE_GRADIENT), sin
// tocar el ORDEN de las barras/leyenda (eso lo sigue decidiendo getMajorityOrder/ORDINAL_ORDERS).
// Preguntas categóricas sin una lectura positiva/negativa clara (condición laboral, modalidad de
// trabajo, tipo de empresa, rubro, etc.) no están aquí a propósito: siguen con la paleta genérica.
const POSITIVE_GRADIENT = ['#07C8CC', '#368BA1', '#7C93A3', '#94A3B8', '#B8C2CC', '#D1D5DB'];
const POSITIVE_ORDERS = {
  // Binarias Sí/No del instrumento donde "Sí" es la respuesta positiva.
  trabaja: ['Sí', 'No'],
  emprendimientoRelacionado: ['Sí', 'No'],
  practicasNID: ['Sí', 'No'],
  posgrado: ['Sí', 'No'],
  primerEmpleo: ['Sí', 'No'],
  trabajadoAnteriormente: ['Sí', 'No'],
  interesPosgrado: ['Sí', 'No'],
  ascenso: ['Sí', 'No'],
  // Formalización del emprendimiento: "Formalizado" es el estado institucionalmente deseable.
  emprendimientoFormalizacion: ['Formalizado', 'En proceso de formalización', 'No formalizado'],
  // Pertinencia y colegiatura: escalas con una categoría claramente más favorable.
  pertinencia: ['Totalmente relacionada', 'Parcialmente relacionada', 'No relacionada'],
  colegiatura: ['Colegiado y Habilitado', 'Colegiado, no habilitado', 'No colegiado', 'No aplica'],
  // Personal a cargo: cualquier variante de "Sí" es más positiva que "No"; entre las variantes de
  // "Sí", a más personal a cargo, más positivo.
  personalCargo: ['Sí, más de 20 personas', 'Sí, de 10 a 20 personas', 'Sí, menos de 10 personas', 'No'],
  // Satisfacción: escala Likert, "Muy satisfecho" es la categoría más positiva.
  satisfaccion: ['Muy satisfecho', 'Satisfecho', 'Ni satisfecho ni insatisfecho', 'Insatisfecho', 'Muy insatisfecho'],
  // Tiempo en conseguir empleo / en desempleo: mientras más corto, más positivo.
  tiempoPrimerEmpleo: ['Ya me encontraba trabajando al egresar', 'De 1 a 3 meses', 'De 3 a 6 meses', 'De 6 a 12 meses', '12 meses a más', 'Más de 12 meses'],
  tiempoDesempleo: ['De 1 a 3 meses', 'De 3 a 6 meses', 'De 6 a 12 meses', 'Más de 12 meses'],
  // Salario: a mayor ingreso, más positivo (orden inverso al de ORDINAL_ORDERS.salario, que va de
  // menor a mayor para la lectura del eje).
  salario: [
    'Más de S/.5,000', 'Más de S/. 8,001', 'Más de S/.8,001',
    'Entre S/. 5,001 y S/. 8,000', 'Entre S/. 5,001 y S/8,000 soles',
    'Entre S/. 3,001 y S/. 5,000', 'Entre S/. 3,001 y S/5,000 soles', 'Más de S/ 3,000', 'Más de S/. 3,000',
    'Entre S/. 2,001 y S/. 3,000',
    'Entre S/. 1,501 y S/. 3,000', 'S/ 1,501 a S/ 3,000', 'Entre S/1,501 y S/. 3,000', 'Entre  S/1,131 y S/. 2,000',
    'Hasta S/. 1,500', 'Hasta S/ 1,500', 'Hasta S/. 1, 130', 'Hasta S/. 1, 500'
  ]
};

// Asigna POSITIVE_GRADIENT según la posición de cada label en POSITIVE_ORDERS[questionId] (mismo
// matching exacto→subcadena que findOrdinalIndex). Labels sin match (p.ej. "No aplica" en una
// pregunta no listada, o una categoría nueva del Excel) van al gris final del propio gradiente.
function getPositiveOrderedColors(labels, questionId) {
  if (questionId === 'nps') {
    // Paleta semántica dedicada para NPS (10 a 0):
    // Promotores (10, 9): Celestes y verdes Wiener
    // Neutros / Pasivos (8, 7): Azules y pizarras corporativos
    // Detractores (6 a 0): Degradado armónico de gris a cálidos/ámbar/coral/rojo
    const npsColorMap = {
      '10': '#07C8CC',
      '9':  '#20B2AA',
      '8':  '#368BA1',
      '7':  '#64748B',
      '6':  '#94A3B8',
      '5':  '#DCB17C',
      '4':  '#F59E0B',
      '3':  '#F08568',
      '2':  '#E11D48',
      '1':  '#DC2626',
      '0':  '#991B1B'
    };
    return labels.map(l => npsColorMap[String(l).trim()] || '#CBD5E1');
  }

  const order = POSITIVE_ORDERS[questionId];
  if (!order) return null;
  return labels.map(label => {
    const idx = findOrdinalIndex(order, label);
    if (idx === -1) return POSITIVE_GRADIENT[POSITIVE_GRADIENT.length - 1];
    return POSITIVE_GRADIENT[Math.min(idx, POSITIVE_GRADIENT.length - 1)];
  });
}

// Escalas ordinales del instrumento: se muestran en el orden diseñado (no por frecuencia).
const ORDINAL_ORDERS = {
  nps: [
    '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0'
  ],
  tamanoEmpresa: [
    'Gran empresa', 'Gran Empresa',
    'Mediana empresa', 'Mediana Empresa',
    'Pequeña empresa', 'Pequeña Empresa',
    'Microempresa'
  ],
  gradoAcademico: [
    'Titulado',
    'Bachiller',
    'Egresado'
  ],
  emprendimientoFormalizacion: [
    'Formalizado',
    'En proceso de formalización',
    'No formalizado'
  ],
  salario: [
    'Hasta S/. 1,500', 'Hasta S/ 1,500', 'Hasta S/. 1, 130', 'Hasta S/. 1, 500',
    'Entre  S/1,131 y S/. 2,000', 'Entre S/. 1,501 y S/. 3,000', 'S/ 1,501 a S/ 3,000', 'Entre S/1,501 y S/. 3,000',
    'Entre S/. 2,001 y S/. 3,000',
    'Entre S/. 3,001 y S/. 5,000', 'Entre S/. 3,001 y S/5,000 soles',
    'Más de S/ 3,000', 'Más de S/. 3,000',
    'Entre S/. 5,001 y S/. 8,000', 'Entre S/. 5,001 y S/8,000 soles',
    'Más de S/.5,000', 'Más de S/. 8,001', 'Más de S/.8,001'
  ],
  tiempoPrimerEmpleo: [
    'Ya me encontraba trabajando al egresar',
    'De 1 a 3 meses',
    'De 3 a 6 meses',
    'De 6 a 12 meses',
    '12 meses a más',
    'Más de 12 meses'
  ],
  tiempoCargoActual: [
    'Menos de 1 año',
    'De 1 a 2 años',
    'De 2 a 5 años',
    'De 5 a 10 años',
    '10 años a más'
  ],
  nivelCargo: [
    'Trainee / Prácticas', 'Experiencia Inicial', 'Junior', 'Semi Senior', 'Senior',
    'Jefe / Supervisor / Coordinador', 'Dirección / Gerencia', 'CEO / Fundador', 'Serums'
  ],
  nivelPrimerEmpleo: [
    'Trainee / Prácticas', 'Experiencia Inicial', 'Junior', 'Semi Senior', 'Senior',
    'Jefe / Supervisor / Coordinador', 'Dirección / Gerencia', 'CEO / Fundador', 'Serums'
  ],
  tiempoDesempleo: [
    'De 1 a 3 meses',
    'De 3 a 6 meses',
    'De 6 a 12 meses',
    'Más de 12 meses'
  ],
  satisfaccion: [
    'Muy satisfecho',
    'Satisfecho',
    'Ni satisfecho ni insatisfecho',
    'Insatisfecho',
    'Muy insatisfecho'
  ],
  colegiatura: [
    'Colegiado y Habilitado',
    'Colegiado, no habilitado',
    'No colegiado',
    'No aplica'
  ],
  pertinencia: [
    'Totalmente relacionada',
    'Parcialmente relacionada',
    'No relacionada'
  ],
  personalCargo: [
    'Sí, más de 20 personas',
    'Sí, de 10 a 20 personas',
    'Sí, menos de 10 personas',
    'No'
  ]
};

function findOrdinalIndex(order, label) {
  if (!order || !Array.isArray(order)) return -1;
  const strLabel = String(label != null ? label : '').toLowerCase().trim();
  if (!strLabel) return -1;
  // 1. Coincidencia exacta (prioridad absoluta)
  let idx = order.findIndex(o => String(o).toLowerCase().trim() === strLabel);
  if (idx !== -1) return idx;
  // 2. Coincidencia por subcadena solo si ambas cadenas tienen longitud > 2 (evita falsos positivos con dígitos '1', '0', etc.)
  if (strLabel.length > 2) {
    return order.findIndex(o => {
      const oStr = String(o).toLowerCase().trim();
      return oStr.length > 2 && (strLabel.includes(oStr) || oStr.includes(strLabel));
    });
  }
  return -1;
}

function applyOrdinalOrder(questionId, sorted) {
  const order = ORDINAL_ORDERS[questionId];
  if (!order) return sorted;
  const paired = sorted.labels.map((l, i) => ({ label: l, value: sorted.values[i] }));
  paired.sort((a, b) => {
    const idxA = findOrdinalIndex(order, a.label);
    const idxB = findOrdinalIndex(order, b.label);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
  return { labels: paired.map(p => p.label), values: paired.map(p => p.value) };
}

function orderLabels(questionId, labels) {
  const order = ORDINAL_ORDERS[questionId];
  if (!order) return labels;
  return [...labels].sort((a, b) => {
    const idxA = findOrdinalIndex(order, a);
    const idxB = findOrdinalIndex(order, b);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
}

// Regla general de lectura de gráficos: el dato mayor siempre va primero (izquierda en barras
// horizontales, base en barras apiladas). No depende de nombres de categoría hardcodeados, por lo
// que sigue funcionando si el Excel trae categorías nuevas o renombradas.
function getMajorityOrder(question, data) {
  if (ORDINAL_ORDERS[question.id]) return null; // las escalas ordinales mantienen su secuencia natural
  const rawValues = getFieldValue(data, question.fieldId);
  const counted = countValues(rawValues);
  return sortUndefinedLast(counted.map(c => c.label), counted.map(c => c.count)).labels;
}

// Paleta por defecto: para binarios/ternarios, celeste Wiener a la mayoría y escala de grises al
// resto (mismo tratamiento visual que antes se hardcodeaba solo para 'trabaja'/'condicion', ahora
// aplicado a cualquier pregunta con 2-3 categorías, ya vengan ordenadas por frecuencia o por escala).
function getDefaultCategoricalColors(n) {
  if (n === 2) return ['#07C8CC', '#D1D5DB'];
  if (n === 3) return ['#07C8CC', '#94A3B8', '#D1D5DB'];
  return UNW_COLORS.slice(0, n);
}

// Columnas de preguntas de opción múltiple (checkbox): la fuente marca "seleccionado"
// escribiendo el texto de la propia alternativa (p.ej. "Networking con egresados"), no un
// simple '1'/'Sí' — por eso se valida solo que la celda no esté vacía, sin comparar contra
// un texto exacto (que cambiaría por cada columna y rompería la comparación).
function isMultiSelectChecked(v) {
  const s = String(v || '').trim().toLowerCase();
  if (!s) return false;
  if (s === '0' || s === 'no' || s === 'false') return false;
  return true;
}

function getFieldValue(data, fieldId) {
  const field = PivotEngine.fields.find(f => f.id === fieldId);
  if (field) {
    return data.map(row => field.getValue(row)).filter(v => v && v !== 'No precisa' && v !== 'Trabaja actualmente / No aplica' && v !== 'No aplica / No precisa' && v !== 'Sin datos');
  }
  return [];
}

function countValues(values) {
  const counts = {};
  values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
}

function pctLabel(value, total) {
  const num = typeof value === 'number' ? value : (typeof value === 'object' && value !== null ? (value.y ?? value.x ?? 0) : Number(value) || 0);
  return Charts.formatPercent(num, total);
}

function sortUndefinedLast(labels, values) {
  const paired = labels.map((l, i) => ({ label: l, value: values[i] }));
  const defined = paired.filter(p => !UNDEFINED_LABELS.includes(p.label));
  const undefined_ = paired.filter(p => UNDEFINED_LABELS.includes(p.label));
  return {
    labels: [...defined.map(p => p.label), ...undefined_.map(p => p.label)],
    values: [...defined.map(p => p.value), ...undefined_.map(p => p.value)]
  };
}

function renderGeneralChart(canvasId, question, data) {
  if (question.multiple) {
    const counts = question.fields.map(f => {
      const vals = data.map(row => {
        const v = row[Calculations?.cols?.[f.id] || f.id];
        return String(v || '').trim().toLowerCase();
      });
      const positive = vals.filter(v => isMultiSelectChecked(v)).length;
      return { label: f.label, count: positive };
    }).filter(x => x.count > 0);

    counts.sort((a, b) => b.count - a.count);
    const sorted = sortUndefinedLast(counts.map(c => c.label), counts.map(c => c.count));
    const total = sorted.values.reduce((s, v) => s + v, 0);
    const displayLabels = sorted.labels.map(l => window.toTitleCase ? window.toTitleCase(l) : l);

    if (question.chartType === 'horizontal_bar') {
      Charts.createHorizontalBarChart(canvasId, displayLabels,
        [{
          label: 'Respuestas afirmativas',
          data: sorted.values,
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 4
        }],
        {
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.raw.toLocaleString()} egresados (${pctLabel(item.raw, total)})`
              }
            },
            datalabels: {
              display: true,
              color: '#0a1b44',
              font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
              formatter: (v) => pctLabel(v, total)
            }
          },
          xAxisFormat: v => v
        }
      );
    } else {
      Charts.createBarChart(canvasId, displayLabels,
        [{
          label: 'Respuestas afirmativas',
          data: sorted.values,
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 4
        }],
        {
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.raw.toLocaleString()} egresados (${pctLabel(item.raw, total)})`
              }
            },
            datalabels: {
              display: true,
              color: '#0a1b44',
              font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
              formatter: (v) => pctLabel(v, total)
            }
          },
          maxRotation: 0
        }
      );
    }
  } else {
    let rawValues = getFieldValue(data, question.fieldId);
    let noDeclaraCount = 0;
    if (question.id === 'salario') {
      const isNoDeclara = (v) => {
        const s = String(v || '').trim().toLowerCase();
        return !s || s.includes('no declara') || s.includes('prefiero') || s.includes('no precisa') || s.includes('no aplica');
      };
      const declared = rawValues.filter(v => !isNoDeclara(v));
      noDeclaraCount = rawValues.length - declared.length;
      rawValues = declared;
    }

    const counted = countValues(rawValues);
    let sorted = sortUndefinedLast(counted.map(c => c.label), counted.map(c => c.count));

    sorted = applyOrdinalOrder(question.id, sorted);

    const total = sorted.values.reduce((s, v) => s + v, 0);

    const noteEl = document.getElementById(`rg-note-${question.id}-general`);
    if (noteEl) {
      if (question.id === 'salario' && noDeclaraCount > 0) {
        noteEl.innerHTML = `* <strong>${total.toLocaleString()}</strong> egresados reportaron su ingreso mensual; <strong>${noDeclaraCount.toLocaleString()}</strong> prefirieron no declararlo.`;
        noteEl.style.display = 'block';
      } else {
        noteEl.innerHTML = '';
        noteEl.style.display = 'none';
      }
    }

    // Asignación de colores: 1) si la pregunta tiene una categoría positiva definida
    // (POSITIVE_ORDERS), el celeste Wiener va siempre ahí, sea o no la mayoría; 2) si no, pero es
    // una escala ordinal, gradiente por rango de frecuencia; 3) si no es ninguna de las dos,
    // celeste Wiener para la mayoría + grises para el resto (regla genérica, no por nombre de campo).
    const colors = getPositiveOrderedColors(sorted.labels, question.id)
      || (ORDINAL_ORDERS[question.id]
        ? Charts.getRankedColors(sorted.values)
        : getDefaultCategoricalColors(sorted.labels.length));

    const displayLabels = sorted.labels.map(l => window.toTitleCase ? window.toTitleCase(l) : l);

    if (question.chartType === 'doughnut') {
      Charts.createDoughnutChart(canvasId, displayLabels, sorted.values, {
        colors: colors,
        legendPosition: sorted.labels.length <= 6 ? 'right' : 'bottom',
        cutout: '55%',
        plugins: {
          legend: { display: true, position: sorted.labels.length <= 6 ? 'right' : 'bottom' },
          datalabels: {
            display: true,
            color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => pctLabel(v, total)
          }
        }
      });
    } else if (question.chartType === 'horizontal_bar') {
      Charts.createHorizontalBarChart(canvasId, displayLabels,
        [{
          label: 'Respuestas',
          data: sorted.values,
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 4
        }],
        {
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.raw.toLocaleString()} egresados (${pctLabel(item.raw, total)})`
              }
            },
            datalabels: {
              display: true,
              color: '#0a1b44',
              font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
              formatter: (v) => pctLabel(v, total)
            }
          },
          xAxisFormat: v => v
        }
      );
    } else {
      Charts.createBarChart(canvasId, displayLabels,
        [{
          label: 'Respuestas',
          data: sorted.values,
          backgroundColor: '#07C8CC',
          borderColor: '#07C8CC',
          borderWidth: 1,
          borderRadius: 4
        }],
        {
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.raw.toLocaleString()} egresados (${pctLabel(item.raw, total)})`
              }
            },
            datalabels: {
              display: true,
              color: '#0a1b44',
              font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
              formatter: (v) => pctLabel(v, total)
            }
          },
          maxRotation: 0
        }
      );
    }
  }
}

function renderCrossTabChart(canvasId, question, data, crossFieldId) {
  const crossField = PivotEngine.fields.find(f => f.id === crossFieldId);
  if (!crossField) return;

  if (question.multiple) {
    const crossValues = data.map(row => crossField.getValue(row)).filter(v => v && v !== 'No precisa');
    let uniqueCross = [...new Set(crossValues)].sort();
    if (crossFieldId === 'carrera') {
      uniqueCross = uniqueCross.filter(c => !c.toUpperCase().includes('MARKETING'));
    }

    const datasets = question.fields.map((f, i) => {
      const dataArr = [];
      const rawCounts = [];
      uniqueCross.forEach(cv => {
        const totalInCross = data.filter(row => crossField.getValue(row) === cv).length;
        const count = data.filter(row => {
          const crossVal = crossField.getValue(row);
          const fieldVal = row[Calculations?.cols?.[f.id] || f.id];
          return crossVal === cv && isMultiSelectChecked(fieldVal);
        }).length;
        dataArr.push(totalInCross > 0 ? Math.round((count / totalInCross) * 100) : 0);
        rawCounts.push(count);
      });
      return { label: f.label, data: dataArr, rawCounts };
    });

    const displayCross = uniqueCross.map(c => window.toTitleCase ? window.toTitleCase(c) : c);

    Charts.createGroupedBarChart(canvasId, displayCross, datasets, {
      colors: UNW_COLORS.slice(0, datasets.length),
      maxRotation: crossFieldId === 'carrera' ? 45 : 0,
      yAxisFormat: v => `${v}%`,
      scales: { y: { max: 100 } },
      plugins: {
        legend: { display: datasets.length > 1, position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (item) => {
              const count = item.dataset.rawCounts?.[item.dataIndex] || 0;
              return ` ${item.dataset.label}: ${Math.round(item.raw)}% (${count.toLocaleString()} egresados)`;
            }
          }
        },
        datalabels: {
          display: true,
          color: '#0a1b44',
          font: { family: "'Inter', sans-serif", size: 10, weight: '700' },
          formatter: (v) => {
            const num = typeof v === 'number' ? v : Number(v) || 0;
            return num >= 3 ? `${Math.round(num)}%` : '';
          }
        }
      }
    });
  } else {
    const rowFieldDef = PivotEngine.getFieldById(question.fieldId);
    let filteredData = rowFieldDef
      ? data.filter(row => {
          const v = rowFieldDef.getValue(row);
          return v && v !== 'No precisa' && v !== 'Sin datos' && v !== 'Trabaja actualmente / No aplica' && v !== 'No aplica / No precisa';
        })
      : data;

    let noDeclaraCrossCount = 0;
    if (question.id === 'salario') {
      const isNoDeclara = (v) => {
        const s = String(v || '').trim().toLowerCase();
        return !s || s.includes('no declara') || s.includes('prefiero') || s.includes('no precisa');
      };
      const declared = filteredData.filter(row => !isNoDeclara(rowFieldDef.getValue(row)));
      noDeclaraCrossCount = filteredData.length - declared.length;
      filteredData = declared;
    }

    const crossData = PivotEngine.computeCrossTab(filteredData, {
      rowField: question.fieldId,
      colField: crossFieldId,
      metric: 'pct_column'
    });

    if (!crossData || !crossData.rowCategories || crossData.rowCategories.length === 0 || !crossData.colCategories || crossData.colCategories.length === 0) return;

    let sortedCategories = sortUndefinedLast(crossData.rowCategories, crossData.rowCategories.map(() => 0)).labels;

    // Orden: escalas ordinales mantienen su secuencia natural; el resto se ordena por la categoría
    // mayoritaria real de la distribución general (dato mayor siempre primero/izquierda), sin
    // hardcodear nombres de categoría — así sigue funcionando si el Excel trae categorías nuevas.
    const majorityOrder = getMajorityOrder(question, data);
    sortedCategories = majorityOrder
      ? majorityOrder.filter(l => sortedCategories.includes(l)).concat(sortedCategories.filter(l => !majorityOrder.includes(l)))
      : orderLabels(question.id, sortedCategories);

    const customColors = getPositiveOrderedColors(sortedCategories, question.id)
      || (ORDINAL_ORDERS[question.id]
        ? UNW_COLORS.slice(0, sortedCategories.length)
        : getDefaultCategoricalColors(sortedCategories.length));

    if (crossFieldId === 'carrera') {
      // 1. Filtrar carreras descontinuadas o con muestra no representativa (Administración y Marketing con n=2)
      let validCarreras = crossData.colCategories.filter(c => {
        const up = c.toUpperCase();
        return !up.includes('MARKETING');
      });

      // 2. Ordenar las carreras verticalmente de mayor a menor según la categoría principal
      // (la primera de sortedCategories, ya determinada arriba por la regla de mayoría real)
      const primaryCat = sortedCategories[0];

      validCarreras.sort((a, b) => {
        const valA = (crossData.matrix[primaryCat] && crossData.matrix[primaryCat][a]) ?? 0;
        const valB = (crossData.matrix[primaryCat] && crossData.matrix[primaryCat][b]) ?? 0;
        return valB - valA; // Descendente: mayor porcentaje arriba (índice 0 en Chart.js horizontal)
      });

      // 3. Formato Title Case para nombres de carrera
      const displayCarreras = validCarreras.map(c => window.toTitleCase ? window.toTitleCase(c) : c);

      // 4. Datasets apilados al 100% con orden mayor izquierda, menor derecha
      const datasets = sortedCategories.map((resp, i) => {
        const col = customColors[i % customColors.length];
        return {
          label: resp,
          backgroundColor: col,
          borderColor: col === '#D1D5DB' ? '#9CA3AF' : 'transparent',
          borderWidth: col === '#D1D5DB' ? 1 : 0,
          data: validCarreras.map(carrera => {
            const val = crossData.matrix[resp] && crossData.matrix[resp][carrera];
            return val != null ? Math.round(val) : 0;
          })
        };
      });

      Charts.createHorizontalStackedBarChart(canvasId, displayCarreras, datasets, {
        colors: customColors,
        scales: { x: { display: false } },
        layout: { padding: { right: 38 } },
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (item) => {
                const carrera = validCarreras[item.dataIndex];
                const resp = item.dataset.label;
                const n = (crossData.countsMatrix[resp] && crossData.countsMatrix[resp][carrera]) || 0;
                return ` ${resp}: ${Math.round(item.raw)}% (${n.toLocaleString()} egresados)`;
              }
            }
          },
          datalabels: {
            display: true,
            color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => {
              const num = typeof v === 'number' ? v : (typeof v === 'object' && v !== null ? (v.x ?? v.y ?? 0) : Number(v) || 0);
              return `${Math.round(num)}%`;
            }
          }
        }
      });
    } else {
      // Cruce por Año de Egreso: Barras apiladas verticales al 100% (años en eje X)
      // Orden vertical: base mayoritaria abajo, menores arriba
      // Leyenda ordenada de izquierda a derecha
      const datasets = sortedCategories.map((resp, i) => {
        const col = customColors[i % customColors.length];
        return {
          label: resp,
          backgroundColor: col,
          borderColor: col === '#D1D5DB' ? '#9CA3AF' : 'transparent',
          borderWidth: col === '#D1D5DB' ? 1 : 0,
          data: crossData.colCategories.map(anio => {
            const val = crossData.matrix[resp] && crossData.matrix[resp][anio];
            return val != null ? Math.round(val) : 0;
          })
        };
      });

      Charts.createStackedBarChart(canvasId, crossData.colCategories, datasets, {
        colors: customColors,
        maxRotation: 0,
        yAxisFormat: v => `${v}%`,
        scales: { y: { max: 100, display: false } },
        layout: { padding: { top: 24 } },
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (item) => {
                const anio = crossData.colCategories[item.dataIndex];
                const resp = item.dataset.label;
                const n = (crossData.countsMatrix[resp] && crossData.countsMatrix[resp][anio]) || 0;
                return ` ${resp}: ${Math.round(item.raw)}% (${n.toLocaleString()} egresados)`;
              }
            }
          },
          datalabels: {
            display: true,
            color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => {
              const num = typeof v === 'number' ? v : (typeof v === 'object' && v !== null ? (v.y ?? v.x ?? 0) : Number(v) || 0);
              return `${Math.round(num)}%`;
            }
          }
        }
      });
    }

    const noteTabEl = document.getElementById(`rg-note-${question.id}-${crossFieldId === 'carrera' ? 'carrera' : 'anio'}`);
    if (noteTabEl) {
      if (question.id === 'salario' && noDeclaraCrossCount > 0) {
        noteTabEl.innerHTML = `* <strong>${filteredData.length.toLocaleString()}</strong> egresados reportaron su ingreso mensual; <strong>${noDeclaraCrossCount.toLocaleString()}</strong> no lo declararon.`;
        noteTabEl.style.display = 'block';
      } else {
        noteTabEl.innerHTML = '';
        noteTabEl.style.display = 'none';
      }
    }
  }
}

export async function loadResultadosGeneralesPage(container, data) {
  const total = data ? data.length : 0;
  const currentData = data || [];

  const colCarrera = Calculations?.cols?.carrera || 'carrera';
  const totalCarreras = new Set(currentData.map(d => d[colCarrera]).filter(Boolean)).size;
  // Fuente única de verdad para "Nivel de Empleabilidad": ocupados / PEA, vía
  // Calculations.classifyLaborStatus (misma metodología OIT/INEI usada en Resumen, Situación
  // Laboral, Metodología y Análisis Evolutivo). La distribución "¿Trabaja
  // actualmente?" de abajo usa el mismo criterio (campo 'trabaja' de PivotEngine), así que
  // ambos números son consistentes.
  let tasaOcup = '—';
  try {
    if (Calculations && Calculations.getTrazabilidadPEAPorCarrera) {
      const trazabilidad = Calculations.getTrazabilidadPEAPorCarrera(currentData);
      if (trazabilidad && trazabilidad.totales) {
        tasaOcup = trazabilidad.totales.tasaPEATotal.toFixed(1) + '%';
      }
    }
  } catch (e) {}

  container.innerHTML = `
    <div class="exec-dashboard-wrap">
      
      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Resultados Generales</span>
        </div>
        <h1 class="exec-header-title">Resultados Generales de la Encuesta</h1>
        <div class="exec-header-subtitle">Distribución analítica para cada reactivo, cruces por programa académico y cohortes de egreso</div>
      </div>

      <!-- Métricas Resumen (4 KPIs) -->
      <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title">Muestra Evaluada</div>
          <div class="exec-kpi-number">${total.toLocaleString()}</div>
          <div class="exec-kpi-desc">Total encuestas válidas</div>
        </div>

        <div class="exec-kpi-box kpi-tint-green">
          <div class="exec-kpi-title" data-editable-id="rg-kpi-empleabilidad-title" data-editable-label="KPI: Título Nivel de Empleabilidad">Nivel de Empleabilidad</div>
          <div class="exec-kpi-number" data-editable-id="rg-kpi-empleabilidad-number" data-editable-label="KPI: Nivel de Empleabilidad">${tasaOcup}</div>
          <div class="exec-kpi-desc" data-editable-id="rg-kpi-empleabilidad-desc" data-editable-label="KPI: Descripción Nivel de Empleabilidad">Tasa activa en el mercado</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Reactivos Analizados</div>
          <div class="exec-kpi-number text-primary">${QUESTIONS.length}</div>
          <div class="exec-kpi-desc">Preguntas estructuradas</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Cobertura Académica</div>
          <div class="exec-kpi-number text-primary">${totalCarreras}</div>
          <div class="exec-kpi-desc">Programas profesionales</div>
        </div>
      </div>

      <!-- Acordeón Ejecutivo de Preguntas -->
      <div id="rg-accordion" style="display: flex; flex-direction: column; gap: 14px;">
        ${QUESTIONS.map((q, i) => {
          const safeId = q.id;
          const isFirst = i === 0;
          return `
          <div class="rg-accordion-item exec-panel" data-visual-id="rg-${safeId}" data-editable-id="rg-${safeId}" data-editable-label="${q.titulo}" style="padding: 0; margin-bottom: 0; overflow: hidden; border: 1px solid #e2e8f0; transition: box-shadow 0.2s ease;">
            
            <div class="rg-accordion-header" onclick="window.RGToggle('${safeId}')" style="cursor: pointer; padding: 18px 24px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: #ffffff; border-bottom: ${isFirst ? '1px solid #e2e8f0' : 'none'}; transition: background 0.15s ease;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(7, 200, 204, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="${q.icono}" style="color: #07C8CC; font-size: 16px;"></i>
              </div>
              <span style="flex: 1; min-width: 140px; font-weight: 700; color: #0a1b44; font-size: 15px;">${q.titulo}</span>
              <span class="rg-badge" style="font-size: 11px; padding: 4px 10px; border-radius: 9999px; background: rgba(7, 200, 204, 0.12); color: #05A8AB; font-weight: 700; white-space: nowrap; flex-shrink: 0;">${q.multiple ? q.fields.length + ' indicadores' : 'Distribución'}</span>
              <i class="fas fa-chevron-down rg-chevron" style="transition: transform 0.2s; color: #64748b; font-size: 13px; transform: ${isFirst ? 'rotate(180deg)' : 'none'}; flex-shrink: 0;"></i>
            </div>

            <div class="rg-accordion-body" id="rg-body-${safeId}" style="display: ${isFirst ? 'block' : 'none'}; padding: 0; background: #f8fafc;">
              <div style="padding: 20px 24px;">
                
                <!-- Selector de Pestañas Segmentadas -->
                <div class="d-flex gap-2 mb-3" role="tablist" style="background: #ffffff; padding: 6px; border-radius: 10px; border: 1px solid #e2e8f0; display: inline-flex; flex-wrap: wrap; max-width: 100%;">
                  <button class="btn btn-sm rg-tab active" data-tab="general" onclick="window.RGSwitchTab('${safeId}', 'general', this)" style="border-radius: 7px; padding: 6px 18px; font-weight: 600; background: #07C8CC; color: #fff; border: none; cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-chart-pie mr-1"></i> General
                  </button>
                  <button class="btn btn-sm rg-tab" data-tab="carrera" onclick="window.RGSwitchTab('${safeId}', 'carrera', this)" style="border-radius: 7px; padding: 6px 18px; font-weight: 600; background: transparent; color: #64748b; border: none; cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-graduation-cap mr-1"></i> Por Carrera
                  </button>
                  <button class="btn btn-sm rg-tab" data-tab="anio" onclick="window.RGSwitchTab('${safeId}', 'anio', this)" style="border-radius: 7px; padding: 6px 18px; font-weight: 600; background: transparent; color: #64748b; border: none; cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-calendar-alt mr-1"></i> Por Año
                  </button>
                </div>

                <!-- Panel: General -->
                <div class="rg-panel" id="rg-panel-${safeId}-general" style="display: block;">
                  <div style="background: #ffffff; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                    <h4 class="chart-title" style="font-size: 14px; font-weight: 700; color: #0a1b44; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                      <i class="${q.icono}" style="color: #07C8CC;"></i> Distribución General de Respuestas
                    </h4>
                    <div class="chart-canvas-wrap${q.chartType === 'doughnut' ? ' is-donut-square' : ''}" style="height: 340px; position: relative;">
                      <canvas id="rg-chart-${safeId}-general"></canvas>
                    </div>
                    <p class="exec-section-desc rg-note" id="rg-note-${safeId}-general" style="margin-top: 10px; font-size: 11.5px; color: #64748b; font-style: italic; display: none;"></p>
                  </div>
                </div>

                <!-- Panel: Carrera -->
                <div class="rg-panel" id="rg-panel-${safeId}-carrera" style="display: none;">
                  <div style="background: #ffffff; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                    <h4 class="chart-title" style="font-size: 14px; font-weight: 700; color: #0a1b44; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                      <i class="fas fa-graduation-cap" style="color: #07C8CC;"></i> Cruce por Programa Académico (% relativo dentro de cada carrera)
                    </h4>
                    <div class="chart-canvas-wrap" style="height: 540px; position: relative;">
                      <canvas id="rg-chart-${safeId}-carrera"></canvas>
                    </div>
                    <p class="exec-section-desc rg-note" id="rg-note-${safeId}-carrera" style="margin-top: 10px; font-size: 11.5px; color: #64748b; font-style: italic; display: none;"></p>
                  </div>
                </div>

                <!-- Panel: Año -->
                <div class="rg-panel" id="rg-panel-${safeId}-anio" style="display: none;">
                  <div style="background: #ffffff; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                    <h4 class="chart-title" style="font-size: 14px; font-weight: 700; color: #0a1b44; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                      <i class="fas fa-calendar-alt" style="color: #07C8CC;"></i> Comparativa por Cohorte de Egreso (% relativo dentro de cada año)
                    </h4>
                    <div class="chart-canvas-wrap" style="height: 500px; position: relative;">
                      <canvas id="rg-chart-${safeId}-anio"></canvas>
                    </div>
                    <p class="exec-section-desc rg-note" id="rg-note-${safeId}-anio" style="margin-top: 10px; font-size: 11.5px; color: #64748b; font-style: italic; display: none;"></p>
                  </div>
                </div>

              </div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- Pie metodológico -->
      <div class="exec-footer-notes" style="margin-top: 24px;">
        <p><strong>Resultados Generales:</strong> Las distribuciones corresponden a las respuestas consolidadas de los egresados encuestados en la edición 2026.</p>
        <p><strong>Porcentajes:</strong> Los análisis transversales por carrera y año calculan la proporción relativa al interior de cada estrato respectivo.</p>
      </div>

    </div>
  `;

  // Estado de renderizado bajo demanda
  window.RGRenderedState = {};

  const renderOrResizeTabChart = (id, tab) => {
    const q = QUESTIONS.find(x => x.id === id);
    if (!q) return;
    const key = `${id}_${tab}`;
    const canvasId = `rg-chart-${id}-${tab}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    Charts.waitForReady().then(() => {
      if (!window.RGRenderedState[key]) {
        window.RGRenderedState[key] = true;
        if (tab === 'general') {
          try { renderGeneralChart(canvasId, q, currentData); } catch (e) { console.warn(`Error general chart ${id}:`, e); }
        } else if (tab === 'carrera') {
          try {
            renderCrossTabChart(canvasId, q, currentData, 'carrera');
          } catch (e) { console.warn(`Error carrera chart ${id}:`, e); }
        } else if (tab === 'anio') {
          try {
            renderCrossTabChart(canvasId, q, currentData, 'anioEgreso');
          } catch (e) { console.warn(`Error anio chart ${id}:`, e); }
        }
      } else {
        requestAnimationFrame(() => {
          const chart = Charts.instances[canvasId] || (typeof Chart !== 'undefined' ? Chart.getChart(canvas) : null);
          if (chart) {
            chart.resize();
            chart.update('none');
          }
        });
      }
    });
  };

  // Renderizar de inmediato la primera pregunta abierta
  renderOrResizeTabChart(QUESTIONS[0].id, 'general');

  window.RGToggle = (id) => {
    const body = document.getElementById(`rg-body-${id}`);
    const item = body?.closest('.rg-accordion-item');
    if (!body || !item) return;
    const header = item.querySelector('.rg-accordion-header');
    const chevron = item.querySelector('.rg-chevron');
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    if (header) header.style.borderBottom = isOpen ? 'none' : '1px solid #e2e8f0';
    if (chevron) chevron.style.transform = isOpen ? 'none' : 'rotate(180deg)';

    if (!isOpen) {
      const activeBtn = body.querySelector('.rg-tab.active');
      const activeTab = activeBtn ? activeBtn.dataset.tab : 'general';
      renderOrResizeTabChart(id, activeTab);
    }
  };

  window.RGSwitchTab = (id, tab, btn) => {
    const body = document.getElementById(`rg-body-${id}`);
    if (!body) return;
    body.querySelectorAll('.rg-tab').forEach(t => {
      t.classList.remove('active');
      t.style.background = 'transparent';
      t.style.color = '#64748b';
    });
    btn.classList.add('active');
    btn.style.background = '#07C8CC';
    btn.style.color = '#fff';

    body.querySelectorAll('.rg-panel').forEach(p => p.style.display = 'none');
    const panel = document.getElementById(`rg-panel-${id}-${tab}`);
    if (panel) {
      panel.style.display = 'block';
      renderOrResizeTabChart(id, tab);
    }
  };

  // Expose QUESTIONS and re-render for editor integration
  window.RGQuestions = QUESTIONS;
  window.RGRenderQuestion = (questionId, newData) => {
    const q = QUESTIONS.find(x => x.id === questionId);
    if (!q) return;
    delete window.RGRenderedState[`${questionId}_general`];
    delete window.RGRenderedState[`${questionId}_carrera`];
    delete window.RGRenderedState[`${questionId}_anio`];
    const body = document.getElementById(`rg-body-${questionId}`);
    if (body && body.style.display !== 'none') {
      const activeBtn = body.querySelector('.rg-tab.active');
      const activeTab = activeBtn ? activeBtn.dataset.tab : 'general';
      renderOrResizeTabChart(questionId, activeTab);
    }
  };
  window.RGGetQuestions = () => QUESTIONS;
}

// Exports puros para pruebas automatizadas (tests/test-resultados-generales.js).
// No dependen del DOM: permiten validar la lógica de datos real sin renderizar gráficos.
export {
  QUESTIONS,
  ORDINAL_ORDERS,
  POSITIVE_ORDERS,
  POSITIVE_GRADIENT,
  getFieldValue,
  countValues,
  sortUndefinedLast,
  applyOrdinalOrder,
  orderLabels,
  getMajorityOrder,
  getDefaultCategoricalColors,
  getPositiveOrderedColors,
  isMultiSelectChecked
};
