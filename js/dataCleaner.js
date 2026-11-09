const DataCleaner = {
  // Estadisticas de limpieza
  stats: {},

  clean(data, type = 'encuestas') {
    this.stats = {};
    let cleaned = [...data];

    // 0. Normalizar saltos de línea en los NOMBRES DE COLUMNA (\r\n / \r -> \n).
    // Excel puede guardar el salto de línea de un encabezado como \r\n según la versión/SO,
    // lo que rompe cualquier comparación exacta contra las claves de Calculations.cols.
    cleaned = this.normalizeHeaders(cleaned);

    if (type === 'encuestas') {
      cleaned = this.cleanEncuestas(cleaned);
    } else {
      cleaned = this.cleanUniverso(cleaned);
    }

    console.log('Estadisticas de limpieza:', this.stats);
    return cleaned;
  },

  cleanEncuestas(data) {
    let cleaned = data;

    // 0. Normalizar Unicode (NFC) en todos los strings para evitar problemas de acentos
    cleaned = this.normalizeUnicode(cleaned);

    // 1. Corregir NPS fuera de rango (corregir, no eliminar)
    cleaned = this.fixNPS(cleaned);

    // 2. Unificar categorias de salario
    cleaned = this.fixSalario(cleaned);

    // 3. Normalizar categorias de satisfaccion
    cleaned = this.fixSatisfaccion(cleaned);

    // 4. Normalizar categorias de pertinencia
    cleaned = this.fixPertinencia(cleaned);

    // 5. Normalizar categorias de colegiatura
    cleaned = this.fixColegiatura(cleaned);

    // 6. Corregir formato año de egreso
    cleaned = this.fixAnioEgreso(cleaned);

    // 7. Normalizar texto en preguntas abiertas
    cleaned = this.fixOpenText(cleaned);

    // 8. Corregir condiciones laborales
    cleaned = this.fixCondicionLaboral(cleaned);

    // 9. Corregir modalidad de trabajo
    cleaned = this.fixModalidad(cleaned);

    // 10. Reclasificar y limpiar motivos de no trabajo (categorización de 'Otros' y texto abierto)
    cleaned = this.fixRazonNoTrabaja(cleaned);

    return cleaned;
  },

  cleanUniverso(data) {
    let cleaned = data;

    // 1. Limpiar sufijo _x0000_ y caracteres nulos
    cleaned = cleaned.map(row => {
      const cleaned_row = {};
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string') {
          cleaned_row[key] = value.replace(/_x0000_/g, '').replace(/\u0000/g, '').trim();
        } else {
          cleaned_row[key] = value;
        }
      }
      return cleaned_row;
    });

    // 2. Normalizar nombre_carrera
    cleaned = cleaned.map(row => {
      if (row.nombre_carrera) {
        row.nombre_carrera = row.nombre_carrera
          .replace(/_x0000_/g, '')
          .replace(/\u0000/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }
      return row;
    });

    return cleaned;
  },

  normalizeHeaders(data) {
    return data.map(row => {
      const newRow = {};
      for (const [key, value] of Object.entries(row)) {
        const cleanKey = key.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        newRow[cleanKey] = value;
      }
      return newRow;
    });
  },

  normalizeUnicode(data) {
    let fixed = 0;
    const cleaned = data.map(row => {
      const newRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string') {
          const normalized = value.normalize('NFC');
          if (normalized !== value) fixed++;
          newRow[key] = normalized;
        } else {
          newRow[key] = value;
        }
      }
      return newRow;
    });
    this.stats.unicode_fixed = fixed;
    return cleaned;
  },

  fixNPS(data) {
    const col = '13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?';

    // Corregir valores fuera de rango 0-10 de forma inteligente
    // -10 -> probablemente 10 (signo menos accidental)
    // 19  -> probablemente 9  (digito '1' accidental)
    // 40  -> probablemente 4  (digito '0' accidental)
    // 76  -> probablemente 7  (digito '6' accidental)
    const npsCorrectionMap = {
      '-10': 10,
      '-10.0': 10,
      '19': 9,
      '19.0': 9,
      '40': 4,
      '40.0': 4,
      '76': 7,
      '76.0': 7,
    };

    let fixed = 0;
    const fixedValues = [];
    const cleaned = data.map(row => {
      const val = row[col];
      if (val !== null && val !== undefined && val !== '') {
        const num = Number(val);
        const strVal = String(val).trim();
        if (num < 0 || num > 10 || isNaN(num)) {
          const corrected = npsCorrectionMap[strVal];
          if (corrected !== undefined) {
            fixedValues.push({ original: val, corrected });
            fixed++;
            return { ...row, [col]: corrected };
          }
        }
      }
      return row;
    });

    this.stats.nps_fixed = fixed;
    this.stats.nps_corrections = fixedValues;
    return cleaned;
  },

  fixSalario(data) {
    const col = '9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información con el fin, de en caso te encuentres interesado en recibir información de ofertas laborales podamos enviar en base al sueldo base que percibes actualmente)';

    // Mapeo de valores inconsistentes
    const salaryMap = {
      'Prefiero no decirlo (NO LEER)': 'Prefiero no decirlo',
      'Hasta S/. 1, 500': 'Hasta S/. 1,500',
      'Entre S/1,501 y S/. 3,000': 'Entre S/. 1,501 y S/. 3,000',
      'Entre S/. 3,001 y S/. 5,000': 'Entre S/. 3,001 y S/. 5,000',
      'Entre S/. 5,001 y S/8,000 soles': 'Entre S/. 5,001 y S/. 8,000',
      'Más de S/.8,001': 'Más de S/. 8,001',
    };

    let fixed = 0;
    const cleaned = data.map(row => {
      const val = row[col];
      if (val && salaryMap[val]) {
        fixed++;
        return { ...row, [col]: salaryMap[val] };
      }
      return row;
    });

    this.stats.salario_fixed = fixed;
    return cleaned;
  },

  fixSatisfaccion(data) {
    const col = '5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)';

    const satMap = {
      'Muy satisfecho': 'Muy satisfecho',
      'Satisfecho': 'Satisfecho',
      'Ni satisfecho ni insatisfecho': 'Ni satisfecho ni insatisfecho',
      'Insatisfecho': 'Insatisfecho',
      'Muy insatisfecho': 'Muy insatisfecho',
    };

    let fixed = 0;
    const cleaned = data.map(row => {
      const val = row[col];
      if (val && satMap[val]) {
        if (val !== satMap[val]) fixed++;
        return { ...row, [col]: satMap[val] };
      }
      return row;
    });

    this.stats.satisfaccion_fixed = fixed;
    return cleaned;
  },

  fixPertinencia(data) {
    const col = '6. ¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?';

    // Mapeo para normalizar (quitar puntos finales)
    const pertMap = {
      'Sí, totalmente relacionada.': 'Sí, totalmente relacionada',
      'Sí, parcialmente relacionada.': 'Sí, parcialmente relacionada',
      'No, no está relacionada': 'No, no está relacionada',
    };

    let fixed = 0;
    const cleaned = data.map(row => {
      const val = row[col];
      if (val && pertMap[val]) {
        fixed++;
        return { ...row, [col]: pertMap[val] };
      }
      return row;
    });

    this.stats.pertinencia_fixed = fixed;
    return cleaned;
  },

  fixColegiatura(data) {
    const col = '1. ¿Cuál es su situación actual respecto a la colegiatura profesional? (E: LEER ALTERNATIVAS)';

    const colgMap = {
      'Colegiado(a) y habilitado(a).': 'Colegiado y habilitado',
      'Colegiado(a), pero no habilitado(a).': 'Colegiado, no habilitado',
      'No me encuentro colegiado(a).': 'No colegiado',
      'No aplica a mi profesión.': 'No aplica',
    };

    let fixed = 0;
    const cleaned = data.map(row => {
      const val = row[col];
      if (val && colgMap[val]) {
        fixed++;
        return { ...row, [col]: colgMap[val] };
      }
      return row;
    });

    this.stats.colegiatura_fixed = fixed;
    return cleaned;
  },

  fixAnioEgreso(data) {
    const col = 'Año de egreso:';

    // Normalizar formatos: "2023 - II" -> "2023-II", "2025-II" -> "2025-II"
    let fixed = 0;
    const cleaned = data.map(row => {
      const val = row[col];
      if (val) {
        const strVal = String(val);
        // Normalizar: quitar espacios alrededor del guion
        const normalized = strVal.replace(/\s*-\s*/g, '-');
        if (normalized !== strVal) {
          fixed++;
        }
        return { ...row, [col]: normalized };
      }
      return row;
    });

    this.stats.anio_fixed = fixed;
    return cleaned;
  },

  fixOpenText(data) {
    // Columnas de preguntas abiertas
    const openCols = [
      '13.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):',
      '6.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):',
      '6.1 Cuál Posgrado?',
      '3.1 Nombre de la empresa donde trabajas actualmente:',
      '11.1 ¿Cuál era tu cargo de tu primer trabajo luego de haber egresado?',
      '4.1 ¿Cuál era tu cargo de tu primer trabajo luego de haber egresado?',
      '5.1 Nombre de la Universidad:',
    ];

    let fixed = 0;
    const cleaned = data.map(row => {
      const newRow = { ...row };
      openCols.forEach(col => {
        if (newRow[col] && typeof newRow[col] === 'string') {
          const original = newRow[col];
          // Normalizar espacios multiples
          let normalized = original.replace(/\s+/g, ' ').trim();
          // No convertir a minusculas (mantener original para analysis)
          if (normalized !== original) {
            fixed++;
          }
          newRow[col] = normalized;
        }
      });
      return newRow;
    });

    this.stats.text_fixed = fixed;
    return cleaned;
  },

  fixCondicionLaboral(data) {
    const col = '2. ¿Cuál es tu condición laboral actual?';

    const condMap = {
      'Trabajador dependiente (empleado por una institución o empresa)': 'Dependiente',
      'Profesional independiente (brinda servicios por cuenta propia)': 'Independiente',
      'Propietario o socio de negocio/emprendimiento': 'Propietario / Emprendimiento',
      'Dependiente (planilla)': 'Dependiente',
      'Independiente (freelance-recibo por honorario)': 'Independiente',
      'Negocio propio(emprendimiento)/negocio familiar': 'Propietario / Emprendimiento',
      'Practicante profesional': 'Dependiente',
      'Emprendedor': 'Propietario / Emprendimiento',
      'Trabajador Dependiente': 'Dependiente',
      'Profesional Independiente': 'Independiente',
      'Empresario / Emprendedor': 'Propietario / Emprendimiento',
    };

    let fixed = 0;
    const cleaned = data.map(row => {
      const val = row[col];
      if (val && condMap[val]) {
        fixed++;
        return { ...row, [col]: condMap[val] };
      }
      return row;
    });

    this.stats.condicion_fixed = fixed;
    return cleaned;
  },

  fixModalidad(data) {
    const col = '3.4 Modalidad de trabajo';

    const modMap = {
      'Presencial': 'Presencial',
      'Híbrido': 'Híbrido',
      'Remoto': 'Remoto',
    };

    let fixed = 0;
    const cleaned = data.map(row => {
      const val = row[col];
      if (val && modMap[val]) {
        if (val !== modMap[val]) fixed++;
        return { ...row, [col]: modMap[val] };
      }
      return row;
    });

    this.stats.modalidad_fixed = fixed;
    return cleaned;
  },

  fixRazonNoTrabaja(data) {
    const colRazon = '1. ¿Cuál es la principal razón por la que no te encuentras trabajando actualmente?';
    const colOtro = 'Otros (Especificar)_5';

    let fixed = 0;
    const cleaned = data.map(row => {
      const trabaja = (row['1. ¿Actualmente te encuentras trabajando o realizando una actividad remunerada que genere ingresos?'] || '').trim();
      const razon = (row[colRazon] || '').trim();
      const otro = (row[colOtro] || '').trim().toLowerCase();

      // Si no trabaja y respondió 'Otros' o similar, categorizamos el texto abierto
      if (trabaja === 'No' && (razon === 'Otros' || razon.toLowerCase().includes('otro'))) {
        fixed++;
        let categorizada = 'Otros motivos de inactividad';

        if (otro.includes('realizando su cerums') || otro.includes('realizando su serum') || otro.includes('realizando cerum') || otro.includes('cerumisa') || otro.includes('termino su serun')) {
          categorizada = 'Realizando SERUMS (Actividad profesional)';
        } else if (otro.includes('serum') || otro.includes('cerum')) {
          categorizada = 'Postulando / Preparándose para SERUMS';
        } else if (
          otro.includes('entrevista') || otro.includes('postulando') || otro.includes('cas') || otro.includes('convocatoria') ||
          otro.includes('propuesta') || otro.includes('experiencia') || otro.includes('contrato') || otro.includes('renovacion') ||
          otro.includes('renunciar') || otro.includes('viendo otras opciones') || otro.includes('temporal') || otro.includes('horario') || otro.includes('distancia')
        ) {
          categorizada = 'Buscando empleo / Convocatorias / Entrevistas';
        } else if (otro.includes('consultorio') || otro.includes('negocio')) {
          categorizada = 'Estoy iniciando un proyecto personal (negocio propio)';
        } else if (otro.includes('tesis') || otro.includes('tenis') || otro.includes('titulo') || otro.includes('titul') || otro.includes('bachiller') || otro.includes('colegia') || otro.includes('sustenta')) {
          categorizada = 'Trámite de tesis / título / colegiatura profesional';
        } else if (otro.includes('salud') || otro.includes('medico') || otro.includes('médico') || otro.includes('maternidad') || otro.includes('mamá') || otro.includes('bebe') || otro.includes('ama de casa') || otro.includes('viaje') || otro.includes('extranjero') || otro.includes('vacaciones') || otro.includes('descans')) {
          categorizada = 'Motivos personales/familiares (Salud, maternidad o descanso)';
        } else if (otro.includes('posgrado') || otro.includes('post grado') || otro.includes('especialidad') || otro.includes('residentado') || otro.includes('cursos') || otro.includes('inglés')) {
          categorizada = 'Me encuentro estudiando un Posgrado u otra Carrera';
        }

        return {
          ...row,
          'Motivo_No_Trabajo_Original': razon,
          [colRazon]: categorizada
        };
      }
      return row;
    });

    this.stats.razon_no_trabaja_fixed = fixed;
    return cleaned;
  },

  // Funciones de validacion
  validate(data, type = 'encuestas') {
    const errors = [];

    if (type === 'encuestas') {
      // Validar NPS
      const npsCol = '13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?';
      data.forEach((row, idx) => {
        const nps = row[npsCol];
        if (nps !== null && nps !== undefined && nps !== '') {
          const num = Number(nps);
          if (num < 0 || num > 10 || isNaN(num)) {
            errors.push({ row: idx, col: npsCol, value: nps, error: 'NPS fuera de rango' });
          }
        }
      });

      // Validar que trabajadores tengan respuestas
      const trabajaCol = '1. ¿Actualmente te encuentras trabajando o realizando una actividad remunerada que genere ingresos?';
      const satisfaccionCol = '5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)';
      
      data.forEach((row, idx) => {
        if (row[trabajaCol] === 'Sí') {
          if (!row[satisfaccionCol]) {
            errors.push({ row: idx, col: satisfaccionCol, value: null, error: 'Trabajador sin satisfaccion' });
          }
        }
      });
    }

    return errors;
  },

  // Resumen de limpieza
  getSummary() {
    return {
      unicode_fixed: this.stats.unicode_fixed || 0,
      nps_fixed: this.stats.nps_fixed || 0,
      nps_corrections: this.stats.nps_corrections || [],
      salario_fixed: this.stats.salario_fixed || 0,
      pertinencia_fixed: this.stats.pertinencia_fixed || 0,
      colegiatura_fixed: this.stats.colegiatura_fixed || 0,
      anio_fixed: this.stats.anio_fixed || 0,
      text_fixed: this.stats.text_fixed || 0,
      condicion_fixed: this.stats.condicion_fixed || 0,
      modalidad_fixed: this.stats.modalidad_fixed || 0,
      razon_no_trabaja_fixed: this.stats.razon_no_trabaja_fixed || 0,
      total_fixed: Object.values(this.stats).reduce((a, b) => {
        if (Array.isArray(b)) return a + b.length;
        return a + (typeof b === 'number' ? b : 0);
      }, 0)
    };
  }
};

window.DataCleaner = DataCleaner;
