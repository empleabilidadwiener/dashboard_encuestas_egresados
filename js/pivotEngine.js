/**
 * PivotEngine.js
 * Motor dinámico de cruce y agregación de datos en memoria para el Dashboard de Egresados Wiener.
 * Permite cruzar cualquier par de dimensiones del cuestionario sin recargar archivos externos,
 * calculando Conteo (N), % Total, % por Categoría (100% apilado) y Promedios.
 */

// Normaliza cualquier columna oficial de nivel de cargo (actual o primer empleo) a las mismas
// categorías de seniority, para poder compararlas entre sí en un mismo gráfico.
function normalizarNivelCargo(raw) {
  const str = String(raw || '').trim();
  if (!str) return 'No aplica / No precisa';
  const lower = str.toLowerCase();
  if (lower.includes('no especifica')) return 'No especifica';
  if (lower.includes('trainee') || lower.includes('práctica')) return 'Trainee / Prácticas';
  if (lower.includes('experiencia')) return 'Experiencia Inicial'; // fuente trae "incial" (typo)
  if (lower.includes('semi')) return 'Semi Senior';
  if (lower === 'junior') return 'Junior';
  if (lower === 'senior') return 'Senior';
  if (lower.includes('jefe') || lower.includes('supervisor') || lower.includes('coordinador')) return 'Jefe / Supervisor / Coordinador';
  if (lower.includes('dirección') || lower.includes('gerencia')) return 'Dirección / Gerencia';
  if (lower.includes('ceo') || lower.includes('fundador')) return 'CEO / Fundador';
  if (lower.includes('serums')) return 'Serums';
  return str;
}

const PivotEngine = {
  // Catálogo amigable de campos organizados por dimensión
  fields: [
    // --- Académico ---
    {
      id: 'facultad',
      label: 'Facultad',
      category: 'Académico',
      type: 'categorical',
      getValue: (row) => {
        const carrera = row['CARRERA'] || row['Programa Académico:'] || row['carrera'] || '';
        return (window.DataLoader && window.DataLoader.getFacultadForCarrera)
          ? window.DataLoader.getFacultadForCarrera(carrera)
          : 'Sin Facultad';
      }
    },
    {
      id: 'carrera',
      label: 'Programa Académico (Carrera)',
      category: 'Académico',
      type: 'categorical',
      getValue: (row) => {
        const val = row['CARRERA'] || row['Programa Académico:'] || row['carrera'] || '';
        const trimmed = String(val).trim();
        if (!trimmed) return 'No precisa';
        return window.toTitleCase ? window.toTitleCase(trimmed) : trimmed;
      }
    },
    {
      id: 'anioEgreso',
      label: 'Año de Egreso',
      category: 'Académico',
      type: 'categorical',
      getValue: (row) => {
        const val = row['Año de Egreso'] || row['Año de egreso:'] || row['anioEgreso'] || '';
        const match = String(val).match(/\d{4}/);
        return match ? match[0] : (String(val).trim() || 'No precisa');
      }
    },

    // --- Situación Laboral ---
    {
      id: 'trabaja',
      label: '¿Trabaja actualmente? (Nivel de Empleabilidad)',
      category: 'Laboral',
      type: 'categorical',
      // Fuente: Calculations.classifyLaborStatus (misma clasificación oficial PEA/Ocupado que
      // el KPI "Nivel de Empleabilidad" en todo el dashboard). No se lee el texto crudo de la
      // pregunta 1 directamente porque la columna oficial "Nivel de Empleabilidad Final" puede
      // reclasificar como ocupado a alguien que respondió "No" (p.ej. emprendedores, SERUMS).
      // Quienes están fuera de la PEA (no buscan empleo) se excluyen del cálculo, igual que en
      // el KPI, devolviendo 'No precisa' para que el motor de cruces los descarte del total.
      getValue: (row) => {
        if (!window.Calculations || !window.Calculations.classifyLaborStatus) return 'No precisa';
        const info = window.Calculations.classifyLaborStatus(row);
        if (!info.esPEA) return 'No precisa';
        return info.esOcupado ? 'Sí' : 'No';
      }
    },
    {
      id: 'condicion',
      label: 'Condición Laboral (Dependiente / Independiente / Propietario)',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['2. ¿Cuál es tu condición laboral actual?'] || '';
        const str = String(val).trim();
        if (!str) return 'No precisa';
        const lower = str.toLowerCase();
        // OJO: 'independiente' contiene 'dependiente' como subcadena ("in-DEPENDIENTE-"),
        // por eso 'independiente' y 'propietario/emprendimiento' se evalúan ANTES que 'dependiente'.
        if (lower.includes('propietario') || lower.includes('emprendimiento') || lower.includes('socio') || lower.includes('negocio') || lower.includes('emprendedor')) {
          return 'Propietario / Emprendimiento';
        }
        if (lower.includes('independiente')) return 'Independiente';
        if (lower.includes('dependiente') || lower.includes('practicante')) return 'Dependiente';
        return str;
      }
    },
    {
      id: 'modalidadVinculacion',
      label: 'Modalidad de Vinculación Laboral (Dependientes)',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['2.1 Si marco, "Trabajador dependiente". ¿Cuál es su modalidad de vinculación laboral? (E: LEER ALTERNATIVAS)'] || '';
        const str = String(val).trim();
        if (!str) return 'No aplica / No precisa';
        // "Otro (especificar)" no es una categoría real: el equipo de datos ya clasificó ese
        // texto libre en "Modalidad de Vinculación - Categorizado (Final)"; se usa ese valor
        // en vez de mostrar el genérico "Otro (especificar)".
        if (str === 'Otro (especificar)') {
          const cat = String(row['Modalidad de Vinculación - Categorizado (Final)'] || '').trim();
          return cat || str;
        }
        return str;
      }
    },
    {
      id: 'actividadIndependiente',
      label: 'Actividad Profesional (Independientes)',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['2.2 Si responde "Profesional independiente". ¿Cómo desarrolla principalmente su actividad profesional? (E: LEER ALTERNATIVAS)'] || '';
        const str = String(val).trim();
        if (!str) return 'No aplica / No precisa';
        // "Otro (especificar)" no es una categoría real: se usa el texto libre ya clasificado
        // por el equipo de datos en "Actividad Independiente - Categorizado (Final)". Para el
        // resto de respuestas esa columna suele venir vacía o duplicar el valor crudo, por
        // eso solo se consulta en este caso puntual (verificado cruzando ambas columnas).
        if (str === 'Otro (especificar)') {
          const cat = String(row['Actividad Independiente - Categorizado (Final)'] || '').trim();
          return cat || str;
        }
        return str;
      }
    },
    {
      id: 'emprendimientoFormalizacion',
      label: 'Formalización del Emprendimiento (Propietarios)',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['2.3 Si responde "Propietario o socio de negocio/emprendimiento". Respecto a su emprendimiento o negocio: (E: LEER ALTERNATIVAS)'] || '';
        const str = String(val).trim();
        return str || 'No aplica / No precisa';
      }
    },
    {
      id: 'emprendimientoRelacionado',
      label: 'Emprendimiento Relacionado con la Profesión (Propietarios)',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['2.3.1 ¿El emprendimiento está relacionado con su profesión?'] || '';
        const str = String(val).trim().toLowerCase();
        if (str.startsWith('sí') || str.startsWith('si')) return 'Sí';
        if (str.startsWith('no')) return 'No';
        return str ? String(val).trim() : 'No aplica / No precisa';
      }
    },
    {
      id: 'modalidad',
      label: 'Modalidad de Trabajo',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['3.4 Modalidad de trabajo'] || row['modalidad'] || '';
        const str = String(val).trim();
        if (!str) return 'No precisa';
        if (str.toLowerCase().includes('presencial')) return 'Presencial';
        if (str.toLowerCase().includes('remoto') || str.toLowerCase().includes('teletrabajo')) return 'Remoto';
        if (str.toLowerCase().includes('híbrido') || str.toLowerCase().includes('hibrido') || str.toLowerCase().includes('mixto')) return 'Híbrido';
        return str;
      }
    },
    {
      id: 'rubro',
      label: 'Rubro / Sector de la Empresa',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['3.2 Rubro de empresa:'] || row['3.2 Rubro de empresa'] || row['rubro'] || '';
        const str = String(val).trim();
        if (!str) return 'No precisa';
        // "Otro (especificar)" no es una categoría real: se usa el texto libre ya clasificado
        // por el equipo de datos en "Rubro de Empresa - Categorizado (Final)".
        if (str === 'Otro (especificar)') {
          const cat = String(row['Rubro de Empresa - Categorizado (Final)'] || '').trim();
          return cat || str;
        }
        return str;
      }
    },
    {
      id: 'tipoEmpresa',
      label: 'Tipo de Empresa (Pública / Privada / ONG)',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['3.3 Tipo de empresa (no se pregunta a emprendedores):'] || '';
        const str = String(val).trim();
        if (!str) return 'No aplica / No precisa';
        if (str.toLowerCase() === 'ong') return 'ONG';
        return str;
      }
    },
    {
      id: 'tiempoCargoActual',
      label: 'Tiempo en el Cargo Actual',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['4. ¿Cuánto tiempo estas desempeñándote en el cargo actual? (No se pregunta a emprendedores/ni independientes)'] || '';
        const str = String(val).trim().replace(/\.$/, '');
        return str || 'No aplica / No precisa';
      }
    },
    {
      id: 'razonNoTrabaja',
      label: 'Razón principal de no trabajar',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['1. ¿Cuál es la principal razón por la que no te encuentras trabajando actualmente?'] || '';
        const str = String(val).trim();
        if (!str) return 'Trabaja actualmente / No aplica';
        if (str.includes('estudio') || str.includes('Posgrado') || str.includes('Carrera')) return 'Estudia posgrado / otra carrera';
        if (str.includes('familiar') || str.includes('hijos')) return 'Motivos familiares / personales';
        if (str.includes('busca') || str.includes('oportunidad')) return 'En búsqueda activa de empleo';
        return str;
      }
    },

    // --- Crecimiento & Liderazgo ---
    {
      id: 'personalCargo',
      label: '¿Tiene Personal a Cargo?',
      category: 'Crecimiento',
      type: 'categorical',
      getValue: (row) => {
        const val = row['8. ¿Tienes personal a tu cargo?'] || '';
        const str = String(val).trim().replace(/\.$/, '');
        if (!str) return 'No precisa';
        const lower = str.toLowerCase();
        // El instrumento define 4 alternativas (no un binario Sí/No): preservarlas todas.
        if (lower.includes('menos de 10')) return 'Sí, menos de 10 personas';
        if (lower.includes('10 a 20')) return 'Sí, de 10 a 20 personas';
        if (lower.includes('más de 20') || lower.includes('mas de 20')) return 'Sí, más de 20 personas';
        if (lower.startsWith('no')) return 'No';
        return str;
      }
    },
    {
      id: 'ascenso',
      label: '¿Ha Recibido Ascensos en los últimos 5 años?',
      category: 'Crecimiento',
      type: 'categorical',
      getValue: (row) => {
        const val = row['7. ¿Has recibido algún ascenso en los últimos 5 años? (No se pregunta a emprendedores/ni independientes)'] || '';
        const str = String(val).trim().toLowerCase();
        if (str.startsWith('sí') || str.startsWith('si')) return 'Sí';
        if (str.startsWith('no')) return 'No';
        return str ? String(val).trim() : 'No aplica / No precisa';
      }
    },
    {
      id: 'primerEmpleo',
      label: '¿Primer empleo relacionado a la carrera?',
      category: 'Crecimiento',
      type: 'categorical',
      getValue: (row) => {
        const val = row['12. ¿Tu primer empleo estuvo relacionado con la carrera estudiada?'] || '';
        const str = String(val).trim().toLowerCase();
        if (str.startsWith('sí') || str.startsWith('si')) return 'Sí';
        if (str.startsWith('no')) return 'No';
        return str ? String(val).trim() : 'No precisa';
      }
    },
    {
      id: 'tiempoPrimerEmpleo',
      label: 'Tiempo en obtener 1er empleo',
      category: 'Crecimiento',
      type: 'categorical',
      getValue: (row) => {
        const val = row['11. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado?']
                 || row['9. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado? ']
                 || row['tiempoPrimerEmpleo']
                 || '';
        const str = String(val).trim();
        return str || 'No precisa';
      }
    },
    {
      id: 'practicasNID',
      label: 'Prácticas Preprofesionales (Egresados NID)',
      category: 'Crecimiento',
      type: 'categorical',
      getValue: (row) => {
        const val = row['10. (Solo para egresados NID) ¿Realizaste prácticas preprofesionales durante tu carrera?'] || '';
        const str = String(val).trim().replace(/\.$/, '');
        if (str.toLowerCase().startsWith('sí') || str.toLowerCase().startsWith('si')) return 'Sí';
        if (str.toLowerCase().startsWith('no')) return 'No';
        return str || 'No aplica / No precisa';
      }
    },
    {
      id: 'trabajadoAnteriormente',
      label: '¿Ha Trabajado Anteriormente? (No Trabaja)',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['3. ¿Has trabajado anteriormente?'] || '';
        const str = String(val).trim().toLowerCase();
        if (str.startsWith('sí') || str.startsWith('si')) return 'Sí';
        if (str.startsWith('no')) return 'No';
        return str ? String(val).trim() : 'Trabaja actualmente / No aplica';
      }
    },
    {
      id: 'tiempoDesempleo',
      label: 'Tiempo en Situación de Desempleo',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const val = row['2. ¿Hace cuánto tiempo estás en situación de desempleo?'] || '';
        const str = String(val).trim().replace(/\.$/, '');
        return str || 'Trabaja actualmente / No aplica';
      }
    },

    // --- Económico ---
    {
      id: 'salario',
      label: 'Nivel de Ingreso Mensual Bruto',
      category: 'Económico',
      type: 'categorical',
      getValue: (row) => {
        const raw = row['9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información con el fin, de en caso te encuentres interesado en recibir información de ofertas laborales podamos enviar en base al sueldo base que percibes actualmente)']
                 || row['8. ¿Cuál es tu ingreso mensual bruto aproximado?']
                 || '';
        const str = String(raw).trim();
        if (!str || str.toLowerCase().includes('prefiero') || str.toLowerCase().includes('no declara') || str.toLowerCase().includes('no precisa')) {
          return 'No declara';
        }
        if (str.includes('1500') && (str.includes('Hasta') || str.includes('menos'))) return 'Hasta S/ 1,500';
        if (str.includes('1501') || (str.includes('1500') && str.includes('3000'))) return 'S/ 1,501 a S/ 3,000';
        if (str.includes('3000') || str.includes('3001') || str.includes('Más') || str.includes('Mayor')) return 'Más de S/ 3,000';
        return str;
      }
    },

    // --- Calidad, Pertinencia & Satisfacción ---
    {
      id: 'pertinencia',
      label: 'Pertinencia con la Carrera Estudiada',
      category: 'Calidad & Opinión',
      type: 'categorical',
      getValue: (row) => {
        const val = row['6. ¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?'] || '';
        const str = String(val).trim();
        if (!str) return 'No precisa';
        if (str.toLowerCase().includes('totalmente')) return 'Totalmente relacionada';
        if (str.toLowerCase().includes('parcialmente')) return 'Parcialmente relacionada';
        if (str.toLowerCase().includes('no')) return 'No relacionada';
        return str;
      }
    },
    {
      id: 'satisfaccion',
      label: 'Nivel de Satisfacción Laboral',
      category: 'Calidad & Opinión',
      type: 'categorical',
      getValue: (row) => {
        const val = row['5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)'] || '';
        const str = String(val).trim();
        if (!str) return 'No precisa';
        const lower = str.toLowerCase();
        // OJO: 'insatisfecho' contiene 'satisfecho' como subcadena; por eso se evalúa primero.
        if (lower.includes('ni satisfecho')) return 'Ni satisfecho ni insatisfecho';
        if (lower.includes('muy insatisfecho')) return 'Muy insatisfecho';
        if (lower.includes('muy satisfecho')) return 'Muy satisfecho';
        if (lower.includes('insatisfecho')) return 'Insatisfecho';
        if (lower.includes('satisfecho')) return 'Satisfecho';
        return str;
      }
    },
    {
      id: 'nps',
      label: 'Calificación NPS / Recomendación (0 a 10)',
      category: 'Calidad & Opinión',
      type: 'categorical',
      getValue: (row) => {
        const val = row['13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?']
                 || row['6. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?']
                 || row['nps'];
        if (val === null || val === undefined || val === '') return 'No precisa';
        const num = parseInt(val);
        return isNaN(num) ? 'No precisa' : String(num);
      }
    },
    {
      id: 'posgrado',
      label: '¿Ha realizado estudios de Posgrado?',
      category: 'Calidad & Opinión',
      type: 'categorical',
      getValue: (row) => {
        const val = row['2. ¿Has realizado estudios de posgrado después de egresar?'] || '';
        const str = String(val).trim().toLowerCase();
        if (str.startsWith('sí') || str.startsWith('si')) return 'Sí';
        // OJO: 'no especifica' también empieza con 'no'; se evalúa antes para no contarla como 'No' real.
        if (str.includes('no especifica')) return 'No especifica';
        if (str.startsWith('no')) return 'No';
        return str ? String(val).trim() : 'No precisa';
      }
    },
    {
      id: 'colegiatura',
      label: 'Situación respecto a la Colegiatura',
      category: 'Calidad & Opinión',
      type: 'categorical',
      getValue: (row) => {
        const val = row['1. ¿Cuál es su situación actual respecto a la colegiatura profesional? (E: LEER ALTERNATIVAS)'] || '';
        const str = String(val).trim();
        if (!str) return 'No precisa';
        const lower = str.toLowerCase();
        if (lower.includes('no especifica')) return 'No especifica';
        if (lower.includes('no aplica')) return 'No aplica';
        // OJO: 'no habilitado' contiene 'habilitado'; por eso se evalúa antes que 'colegiado y habilitado'.
        if (lower.includes('no habilitado')) return 'Colegiado, no habilitado';
        if (lower.includes('colegiado') && lower.includes('habilitado')) return 'Colegiado y Habilitado';
        if (lower.includes('no colegiado') || lower.startsWith('no')) return 'No colegiado';
        return str;
      }
    },
    {
      id: 'tipoPosgrado',
      label: 'Tipo de Estudios de Posgrado',
      category: 'Formación',
      type: 'categorical',
      getValue: (row) => {
        const val = row['4. ¿Qué tipo de estudios de posgrado ha realizado o se encuentra realizando?'] || '';
        const str = String(val).trim();
        return str || 'No aplica / No precisa';
      }
    },
    {
      id: 'tipoInstitucionPosgrado',
      label: 'Tipo de Institución de Posgrado',
      category: 'Formación',
      type: 'categorical',
      getValue: (row) => {
        const val = row['5. ¿Qué tipo de institución ofrece u ofreció el programa de posgrado...?'] || '';
        const str = String(val).trim();
        return str || 'No aplica / No precisa';
      }
    },
    {
      id: 'interesPosgrado',
      label: 'Interés en posgrado en la UNW',
      category: 'Formación',
      type: 'categorical',
      getValue: (row) => {
        const val = row['6. ¿Tienes interés en llevar un posgrado en la UNW a corto plazo?']
                 || row['interesPosgrado']
                 || '';
        const str = String(val).trim().toLowerCase();
        if (str.startsWith('sí') || str.startsWith('si')) return 'Sí';
        if (str.includes('no especifica')) return 'No especifica';
        if (str.startsWith('no')) return 'No';
        return str ? String(val).trim() : 'No precisa';
      }
    },
    {
      id: 'gradoAcademico',
      label: 'Grado Académico',
      category: 'Perfil',
      type: 'categorical',
      getValue: (row) => {
        const str = String(row['Grado Académico'] || '').trim();
        return str || 'No precisa';
      }
    },
    {
      id: 'tamanoEmpresa',
      label: 'Tamaño de la Empresa (Oficial)',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        // La fuente trae variantes de mayúsculas/minúsculas para la misma categoría
        // (p.ej. "Gran empresa" y "Gran Empresa"); se normaliza a una sola etiqueta por tamaño.
        const str = String(row['Categorización Oficial - Tamaño de Empresa'] || '').trim();
        if (!str) return 'No aplica / No precisa';
        const lower = str.toLowerCase();
        // La empresa no se pudo identificar por nombre (respuesta genérica), así que
        // tampoco se puede determinar su tamaño: se trata igual que "No especifica".
        if (lower.includes('sin dato') || lower.includes('no especifica')) return 'No especifica';
        if (lower.includes('micro')) return 'Microempresa';
        if (lower.includes('pequeña')) return 'Pequeña Empresa';
        if (lower.includes('mediana')) return 'Mediana Empresa';
        if (lower.includes('gran')) return 'Gran Empresa';
        return str;
      }
    },
    {
      id: 'zonaGeografica',
      label: 'Zona Geográfica de Trabajo',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        const str = String(row['Zona Geográfica de Trabajo'] || '').trim();
        if (!str) return 'No aplica / No precisa';
        const lower = str.toLowerCase();
        if (lower.includes('no especifica') || lower.includes('sin dato')) return 'No especifica';
        // Dos etiquetas de la fuente describen el mismo concepto (fuera de Lima Metropolitana);
        // se agrupan para no duplicar la categoría "Provincia" en el gráfico.
        if (lower.includes('provincia')) return 'Provincia (resto del Perú)';
        return str;
      }
    },
    {
      id: 'nivelCargo',
      label: 'Nivel del Cargo Actual',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => normalizarNivelCargo(row['Nivel Cargo Actual - Categorizado Oficial'])
    },
    {
      id: 'cargoActual',
      label: 'Puesto Actual',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        // Catálogo distinto según el track de la carrera (Salud vs. NID: Negocios/Ingeniería/
        // Derecho); cada uno ya viene categorizado por el equipo de datos.
        const esSalud = DataLoader && DataLoader.isSalud ? DataLoader.isSalud(row['CARRERA']) : false;
        const col = esSalud ? 'Cargo Actual Salud - Categorizado' : 'Cargo Actual NID - Categorizado';
        const str = String(row[col] || '').trim();
        if (!str || str.includes('Sin clasificar')) return 'No aplica / No precisa';
        return str;
      }
    },
    {
      id: 'nivelPrimerEmpleo',
      label: 'Nivel del Primer Empleo',
      category: 'Laboral',
      type: 'categorical',
      getValue: (row) => {
        // Columnas mutuamente excluyentes según la rama del instrumento (si trabaja / no
        // trabaja actualmente pero trabajó antes); se combinan en un solo campo comparable
        // contra 'nivelCargo' para ver la progresión de carrera.
        const raw = row['Cargo Primer Empleo (rama SI) - Categorizado (Final)']
                 || row['Cargo Primer Empleo (rama NO) - Categorizado (Final)']
                 || '';
        return normalizarNivelCargo(raw);
      }
    },
    {
      id: 'universidadPosgradoTipo',
      label: 'Tipo de Universidad de Posgrado (Pública/Privada)',
      category: 'Formación',
      type: 'categorical',
      getValue: (row) => {
        const str = String(row['Universidad de Posgrado - Tipo (Pública/Privada)'] || '').trim();
        if (!str) return 'No aplica / No precisa';
        const lower = str.toLowerCase();
        if (lower.includes('no especifica') || lower.includes('sin identificar')) return 'No especifica';
        return str;
      }
    },
    {
      id: 'universidadPosgradoPais',
      label: 'País de la Universidad de Posgrado',
      category: 'Formación',
      type: 'categorical',
      getValue: (row) => {
        const str = String(row['Universidad de Posgrado - País (Nacional/Extranjera)'] || '').trim();
        if (!str) return 'No aplica / No precisa';
        if (str.toLowerCase().includes('sin identificar')) return 'No especifica';
        return str;
      }
    },
    {
      id: 'posgradoDeseadoCategoria',
      label: 'Tipo de Posgrado de Interés (a futuro)',
      category: 'Formación',
      type: 'categorical',
      getValue: (row) => {
        const str = String(row['Posgrado Deseado - Categorizado (Final)'] || '').trim();
        return str || 'No aplica / No precisa';
      }
    }
  ],

  // Paletas institucionales de color
  palettes: {
    wiener: ['#002D72', '#07C8CC', '#D99B00', '#2E7D32', '#E05A47', '#7B1FA2', '#0284C7', '#F59E0B', '#10B981', '#6366F1'],
    blueGradient: ['#001D4A', '#002D72', '#004B99', '#0066CC', '#07C8CC', '#38BDF8', '#7DD3FC', '#BAE6FD'],
    warm: ['#D99B00', '#EA580C', '#DC2626', '#E11D48', '#C026D3', '#7C3AED', '#4F46E5'],
    pastelExec: ['#002D72', '#07C8CC', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6']
  },

  getFieldById(fieldId) {
    return this.fields.find(f => f.id === fieldId) || null;
  },

  /**
   * Ejecuta el cálculo de cruce de datos (Cross-Tabulation / Pivot).
   * @param {Array} data - Conjunto de registros en memoria.
   * @param {Object} config - { rowField, colField, metric, valueField, filter }
   * @returns {Object} Resultado estructurado con categorías, series y métricas calculadas.
   */
  computeCrossTab(data, config) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { rowCategories: [], colCategories: [], matrix: {}, countsMatrix: {}, grandTotal: 0, metric: config.metric || 'count' };
    }

    const rowFieldDef = this.getFieldById(config.rowField) || this.fields[0];
    const colFieldDef = config.colField ? this.getFieldById(config.colField) : null;
    const valueFieldDef = config.valueField ? this.getFieldById(config.valueField) : null;
    const metric = config.metric || 'count'; // 'count' | 'pct_total' | 'pct_category' | 'avg'

    // 1. Filtrar registros según filtro interno opcional
    let dataset = data;
    if (config.filter && config.filter.field && config.filter.value !== undefined && config.filter.value !== '') {
      const fDef = this.getFieldById(config.filter.field);
      if (fDef) {
        const targetVal = String(config.filter.value).toLowerCase().trim();
        const op = config.filter.op || 'equals';
        dataset = dataset.filter(row => {
          const rowVal = String(fDef.getValue(row) || '').toLowerCase().trim();
          if (op === 'equals') return rowVal === targetVal;
          if (op === 'not_equals') return rowVal !== targetVal;
          if (op === 'contains') return rowVal.includes(targetVal);
          return true;
        });
      }
    }

    // 2. Acumular conteos y sumas en matrices
    const counts = {};
    const sums = {};
    const rowTotals = {};
    const colTotals = {};
    let grandTotal = 0;

    const rowCatSet = new Set();
    const colCatSet = new Set();

    dataset.forEach(row => {
      const rVal = String(rowFieldDef.getValue(row) || 'Sin datos').trim();
      const cVal = colFieldDef ? String(colFieldDef.getValue(row) || 'Sin datos').trim() : 'Total';

      rowCatSet.add(rVal);
      colCatSet.add(cVal);

      if (!counts[rVal]) counts[rVal] = {};
      if (!counts[rVal][cVal]) counts[rVal][cVal] = 0;
      counts[rVal][cVal]++;

      if (metric === 'avg' && valueFieldDef) {
        const num = valueFieldDef.getValue(row);
        if (num !== null && !isNaN(num)) {
          if (!sums[rVal]) sums[rVal] = {};
          if (!sums[rVal][cVal]) sums[rVal][cVal] = { sum: 0, n: 0 };
          sums[rVal][cVal].sum += num;
          sums[rVal][cVal].n += 1;
        }
      }

      rowTotals[rVal] = (rowTotals[rVal] || 0) + 1;
      colTotals[cVal] = (colTotals[cVal] || 0) + 1;
      grandTotal++;
    });

    const rowCategories = Array.from(rowCatSet).sort((a, b) => {
      // Si el eje Y son años o números, ordenar cronológicamente
      const na = parseFloat(a);
      const nb = parseFloat(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });

    const colCategories = Array.from(colCatSet).sort((a, b) => {
      if (a === 'Total') return 1;
      return a.localeCompare(b);
    });

    // 3. Calcular la matriz de métricas final
    const matrix = {};
    rowCategories.forEach(r => {
      matrix[r] = {};
      colCategories.forEach(c => {
        const n = (counts[r] && counts[r][c]) ? counts[r][c] : 0;
        if (metric === 'count') {
          matrix[r][c] = n;
        } else if (metric === 'pct_total') {
          matrix[r][c] = grandTotal > 0 ? Math.round((n / grandTotal) * 100) : 0;
        } else if (metric === 'pct_category') {
          // 100% apilado por fila/categoría
          const rTot = rowTotals[r] || 0;
          matrix[r][c] = rTot > 0 ? Math.round((n / rTot) * 100) : 0;
        } else if (metric === 'pct_column') {
          // % dentro de cada columna (carrera/año) — para cruces "por carrera"
          const cTot = colTotals[c] || 0;
          matrix[r][c] = cTot > 0 ? Math.round((n / cTot) * 100) : 0;
        } else if (metric === 'avg') {
          const item = (sums[r] && sums[r][c]) ? sums[r][c] : null;
          matrix[r][c] = (item && item.n > 0) ? parseFloat((item.sum / item.n).toFixed(2)) : 0;
        }
      });
    });

    return {
      rowField: rowFieldDef,
      colField: colFieldDef,
      valueField: valueFieldDef,
      metric,
      rowCategories,
      colCategories,
      matrix,
      countsMatrix: counts,
      rowTotals,
      colTotals,
      grandTotal
    };
  },

  /**
   * Construye la configuración de Chart.js o tabla HTML a partir del resultado del cruce.
   * @param {Object} crossData - Salida de computeCrossTab.
   * @param {Object} visualConfig - { chartType, title, subtitle, palette, showLegend }
   * @returns {Object} Configuración lista para new Chart(ctx, config) o tipo 'table'.
   */
  buildChartConfig(crossData, visualConfig = {}) {
    const { rowCategories, colCategories, matrix, countsMatrix, metric, grandTotal } = crossData;
    const chartType = visualConfig.chartType || 'bar';
    const palette = this.palettes[visualConfig.palette] || this.palettes.wiener;
    const isPct = metric === 'pct_total' || metric === 'pct_category';
    const isStacked = chartType === 'bar_stacked';

    // Manejo especial de Tabla Dinámica / Matriz
    if (chartType === 'table') {
      return {
        type: 'table',
        html: this.renderPivotTableHTML(crossData, visualConfig)
      };
    }

    // Donut / Torta: requiere una sola dimensión
    if (chartType === 'doughnut') {
      const labels = rowCategories;
      const data = labels.map(r => {
        let sum = 0;
        colCategories.forEach(c => { sum += (matrix[r][c] || 0); });
        return isPct ? Math.round(sum) : sum;
      });

      return {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: labels.map((_, i) => palette[i % palette.length]),
            borderWidth: 2,
            borderColor: '#FFFFFF',
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, padding: 12, font: { family: 'Inter, sans-serif', size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const val = ctx.raw;
                  const label = ctx.label || '';
                  return isPct ? ` ${label}: ${val}%` : ` ${label}: ${val.toLocaleString()} egresados`;
                }
              }
            }
          },
          cutout: '62%'
        }
      };
    }

    // Gráficos de Barras (Verticales, Horizontales, Apiladas) y Líneas
    const isHorizontal = chartType === 'horizontal_bar';
    const chartBaseType = chartType === 'line' ? 'line' : 'bar';

    // Generar un dataset por cada categoría de columna (o uno solo si no hay desglose)
    const datasets = colCategories.map((cName, idx) => {
      const color = palette[idx % palette.length];
      const data = rowCategories.map(rName => matrix[rName][cName] || 0);

      return {
        label: cName === 'Total' ? (crossData.rowField ? crossData.rowField.label : 'Egresados') : cName,
        data,
        backgroundColor: chartBaseType === 'line' ? 'transparent' : color,
        borderColor: color,
        borderWidth: chartBaseType === 'line' ? 3 : 1,
        pointBackgroundColor: color,
        pointRadius: chartBaseType === 'line' ? 4 : 0,
        fill: false,
        borderRadius: isStacked ? 0 : 4,
        barPercentage: isStacked ? 0.8 : (colCategories.length > 1 ? 0.7 : 0.6),
        categoryPercentage: 0.85
      };
    });

    const isPctCategory = metric === 'pct_category';

    return {
      type: chartBaseType,
      data: {
        labels: rowCategories,
        datasets
      },
      options: {
        indexAxis: isHorizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: isStacked,
            grid: { display: isHorizontal, color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { family: 'Inter, sans-serif', size: 11 },
              callback: function(val) {
                if (isHorizontal && isPct) return `${val}%`;
                return this.getLabelForValue(val);
              }
            },
            max: (isHorizontal && isPctCategory) ? 100 : undefined
          },
          y: {
            stacked: isStacked,
            grid: { display: !isHorizontal, color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { family: 'Inter, sans-serif', size: 11 },
              callback: function(val) {
                if (!isHorizontal && isPct) return `${val}%`;
                return val;
              }
            },
            max: (!isHorizontal && isPctCategory) ? 100 : undefined
          }
        },
        plugins: {
          legend: {
            display: colCategories.length > 1 || chartType === 'doughnut',
            position: 'top',
            labels: { boxWidth: 12, padding: 10, font: { family: 'Inter, sans-serif', size: 11 } }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 45, 114, 0.95)',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif', size: 11 },
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw;
                const dsLabel = ctx.dataset.label || '';
                const rName = rowCategories[ctx.dataIndex];
                const cName = colCategories[ctx.datasetIndex];
                const n = (countsMatrix[rName] && countsMatrix[rName][cName]) ? countsMatrix[rName][cName] : 0;
                
                if (isPct) {
                  return ` ${dsLabel}: ${val}% (n = ${n})`;
                }
                if (metric === 'avg') {
                  return ` ${dsLabel}: ${val} (promedio)`;
                }
                return ` ${dsLabel}: ${val.toLocaleString()} respuestas`;
              }
            }
          }
        }
      }
    };
  },

  /**
   * Genera el HTML de una tabla dinámica / matriz de cruce elegante.
   */
  renderPivotTableHTML(crossData, visualConfig) {
    const { rowCategories, colCategories, matrix, countsMatrix, rowTotals, colTotals, grandTotal, metric } = crossData;
    const isPct = metric === 'pct_total' || metric === 'pct_category' || metric === 'pct_column';
    const isPctCategory = metric === 'pct_category' || metric === 'pct_column';

    let html = `
      <div class="pivot-table-wrapper" style="overflow-x: auto; width: 100%;">
        <table class="pivot-table" style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: right;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
              <th style="text-align: left; padding: 10px 12px; font-weight: 600; color: #1e293b;">
                ${crossData.rowField ? crossData.rowField.label : 'Categoría'}
              </th>`;

    colCategories.forEach(c => {
      html += `
        <th style="padding: 10px 12px; font-weight: 600; color: #1e293b; border-left: 1px solid #e2e8f0;">
          ${c}
        </th>`;
    });

    html += `
        <th style="padding: 10px 12px; font-weight: 700; color: #002D72; border-left: 2px solid #cbd5e1; background: #f1f5f9;">
          Total Muestra (N)
        </th>
      </tr>
    </thead>
    <tbody>`;

    rowCategories.forEach((r, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const rN = rowTotals[r] || 0;
      html += `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="text-align: left; padding: 8px 12px; font-weight: 500; color: #334155;">${r}</td>`;

      colCategories.forEach(c => {
        const val = matrix[r][c] || 0;
        const n = (countsMatrix[r] && countsMatrix[r][c]) ? countsMatrix[r][c] : 0;
        const displayVal = isPct ? `${Math.round(val)}%` : val.toLocaleString();
        
        // Heatmap suave según el valor si es porcentaje
        let cellBg = '';
        if (isPctCategory && val > 0) {
          const alpha = Math.min(0.35, (val / 100) * 0.4);
          cellBg = `background-color: rgba(0, 163, 224, ${alpha.toFixed(2)});`;
        }

        html += `
          <td style="padding: 8px 12px; border-left: 1px solid #e2e8f0; ${cellBg}">
            <span style="font-weight: 600; color: #0f172a;">${displayVal}</span>
            ${isPct ? `<span style="display: block; font-size: 11px; color: #64748b;">(n=${n})</span>` : ''}
          </td>`;
      });

      html += `
        <td style="padding: 8px 12px; font-weight: 700; color: #002D72; border-left: 2px solid #cbd5e1; background: #f1f5f9;">
          ${rN.toLocaleString()}
        </td>
      </tr>`;
    });

    // Fila de Totales
    html += `
      <tr style="background: #e2e8f0; font-weight: 700; border-top: 2px solid #94a3b8; color: #0f172a;">
        <td style="text-align: left; padding: 10px 12px;">Total General</td>`;

    colCategories.forEach(c => {
      const cN = colTotals[c] || 0;
      const cPct = grandTotal > 0 ? Math.round((cN / grandTotal) * 100) : '0';
      html += `
        <td style="padding: 10px 12px; border-left: 1px solid #cbd5e1;">
          ${isPctCategory ? `${cPct}%` : cN.toLocaleString()}
        </td>`;
    });

    html += `
        <td style="padding: 10px 12px; border-left: 2px solid #94a3b8; background: #cbd5e1; color: #002D72;">
          ${grandTotal.toLocaleString()}
        </td>
      </tr>
    </tbody>
  </table>
</div>`;

    return html;
  }
};

// Exponer globalmente
window.PivotEngine = PivotEngine;
