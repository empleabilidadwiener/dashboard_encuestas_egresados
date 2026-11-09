// js/kpiCatalog.js — Catálogo de KPIs disponibles para tarjetas dinámicas
// Cada KPI define: id, titulo, icono, color, y función de cálculo

const KPICatalog = {
  // Almacén de instancias de gráficos activos
  activeCharts: {},

  // Definiciones de todos los KPIs disponibles
  kpis: {
    // === ENCUESTAS Y MUESTRA ===
    encuestasValidas: {
      id: 'encuestasValidas',
      titulo: 'Encuestas válidas',
      icono: 'fas fa-clipboard-check',
      color: '#2563eb',
      tintClass: 'kpi-tint-white',
      calcular: (data, trazabilidad) => {
        const total = data ? data.length : 0;
        return {
          valor: total.toLocaleString(),
          descripcion: `Total de respuestas válidas de egresados 2019–2025`,
          valorNumerico: total
        };
      }
    },

    totalMuestraVsMeta: {
      id: 'totalMuestraVsMeta',
      titulo: 'Avance Meta Muestral',
      icono: 'fas fa-bullseye',
      color: '#0ea5e9',
      tintClass: 'kpi-tint-white',
      calcular: (data, trazabilidad) => {
        const tot = trazabilidad?.totales || {};
        const muestra = tot.totalMuestra || (data ? data.length : 0);
        const meta = tot.totalMetaMuestral || 3742;
        const avance = meta > 0 ? ((muestra / meta) * 100) : 0;
        return {
          valor: `${Math.round(avance)}%`,
          descripcion: `${muestra.toLocaleString()} encuestados de ${meta.toLocaleString()} meta muestral`,
          valorNumerico: avance
        };
      }
    },

    coberturaMuestra: {
      id: 'coberturaMuestra',
      titulo: 'Cobertura de Muestra',
      icono: 'fas fa-chart-pie',
      color: '#8b5cf6',
      tintClass: 'kpi-tint-warm',
      calcular: (data, trazabilidad) => {
        const tot = trazabilidad?.totales || {};
        const muestra = tot.totalMuestra || (data ? data.length : 0);
        const universo = DataLoader?.getUniverso ? DataLoader.getUniverso().length : 0;
        const cobertura = universo > 0 ? ((muestra / universo) * 100) : 0;
        return {
          valor: `${Math.round(cobertura)}%`,
          descripcion: `${muestra.toLocaleString()} encuestados del total de egresados`,
          valorNumerico: cobertura
        };
      }
    },

    // === EMPLEO Y OCUPACIÓN ===
    trabajaActualmente: {
      id: 'trabajaActualmente',
      titulo: 'Trabaja actualmente',
      icono: 'fas fa-user-tie',
      color: '#0284c7',
      tintClass: 'kpi-tint-teal',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const pct = total > 0 ? (trabajadores.length / total) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `De la totalidad de egresados encuestados (${trabajadores.length.toLocaleString()} de ${total.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    ocupacionPEA: {
      id: 'ocupacionPEA',
      titulo: 'Nivel de Empleabilidad',
      icono: 'fas fa-chart-line',
      color: '#10b981',
      tintClass: 'kpi-tint-wiener',
      calcular: (data, trazabilidad) => {
        const tot = trazabilidad?.totales || {};
        const totalPEA = tot.totalPEA || 0;
        const totalOcupados = tot.totalOcupadosConEmprendimiento || 0;
        const pct = totalPEA > 0 ? (totalOcupados / totalPEA) * 100 : 0;
        return {
          valor: `${pct.toFixed(1)}%`,
          descripcion: `De los egresados en el mercado activo (${totalOcupados.toLocaleString()} de ${totalPEA.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    tasaBruta: {
      id: 'tasaBruta',
      titulo: 'Tasa Bruta de Ocupación',
      icono: 'fas fa-percentage',
      color: '#059669',
      tintClass: 'kpi-tint-mint',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const pct = total > 0 ? (trabajadores.length / total) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Ocupados / Total encuestados (${trabajadores.length.toLocaleString()} de ${total.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    tasaDesempleoPEA: {
      id: 'tasaDesempleoPEA',
      titulo: 'Tasa de Desocupación',
      icono: 'fas fa-user-minus',
      color: '#ef4444',
      tintClass: 'kpi-tint-white',
      calcular: (data, trazabilidad) => {
        const tot = trazabilidad?.totales || {};
        const totalPEA = tot.totalPEA || 0;
        const buscan = tot.totalBuscan || 0;
        const pct = totalPEA > 0 ? (buscan / totalPEA) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Buscan activamente empleo (${buscan.toLocaleString()} de ${totalPEA.toLocaleString()} activos)`,
          valorNumerico: pct
        };
      }
    },

    totalOcupados: {
      id: 'totalOcupados',
      titulo: 'Total Ocupados',
      icono: 'fas fa-users',
      color: '#10b981',
      tintClass: 'kpi-tint-teal',
      calcular: (data, trazabilidad) => {
        const tot = trazabilidad?.totales || {};
        const ocupados = tot.totalOcupadosConEmprendimiento || 0;
        return {
          valor: ocupados.toLocaleString(),
          descripcion: `Egresados con actividad laboral remunerada`,
          valorNumerico: ocupados
        };
      }
    },

    buscandoTrabajo: {
      id: 'buscandoTrabajo',
      titulo: 'Buscando Trabajo',
      icono: 'fas fa-search',
      color: '#f59e0b',
      tintClass: 'kpi-tint-warm',
      calcular: (data, trazabilidad) => {
        const tot = trazabilidad?.totales || {};
        const buscan = tot.totalBuscan || 0;
        return {
          valor: buscan.toLocaleString(),
          descripcion: `Egresados buscando empleo activamente`,
          valorNumerico: buscan
        };
      }
    },

    // === CALIDAD DEL EMPLEO ===
    pertinenciaLaboral: {
      id: 'pertinenciaLaboral',
      titulo: 'Pertinencia laboral',
      icono: 'fas fa-bullseye',
      color: '#059669',
      tintClass: 'kpi-tint-wiener',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const pertValidos = trabajadores.filter(d => d[Calculations?.cols?.pertinencia]);
        const pertAlta = pertValidos.filter(d => {
          const p = (d[Calculations?.cols?.pertinencia] || '').toLowerCase();
          return p.includes('totalmente') || p.includes('parcialmente');
        }).length;
        const pct = pertValidos.length > 0 ? (pertAlta / pertValidos.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Total o parcialmente relacionado con su carrera (${pertAlta.toLocaleString()} de ${pertValidos.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    pertinenciaTotal: {
      id: 'pertinenciaTotal',
      titulo: 'Pertinencia Totalmente Afín',
      icono: 'fas fa-check-circle',
      color: '#059669',
      tintClass: 'kpi-tint-mint',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const pertValidos = trabajadores.filter(d => d[Calculations?.cols?.pertinencia]);
        const pertTotal = pertValidos.filter(d => {
          const p = (d[Calculations?.cols?.pertinencia] || '').toLowerCase();
          return p.includes('totalmente');
        }).length;
        const pct = pertValidos.length > 0 ? (pertTotal / pertValidos.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Completamente relacionado con su carrera (${pertTotal.toLocaleString()} de ${pertValidos.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    satisfaccionLaboral: {
      id: 'satisfaccionLaboral',
      titulo: 'Satisfacción laboral',
      icono: 'fas fa-smile-beam',
      color: '#16a34a',
      tintClass: 'kpi-tint-wiener',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const satValidos = trabajadores.filter(d => d[Calculations?.cols?.satisfaccion]);
        const satAlta = satValidos.filter(d => {
          const s = (d[Calculations?.cols?.satisfaccion] || '').toLowerCase();
          return s.includes('satisfecho') && !s.includes('insatisfecho');
        }).length;
        const pct = satValidos.length > 0 ? (satAlta / satValidos.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Satisfecho o muy satisfecho con su trabajo (${satAlta.toLocaleString()} de ${satValidos.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    ingresoMayor3000: {
      id: 'ingresoMayor3000',
      titulo: 'Ingreso > S/ 3,000',
      icono: 'fas fa-money-bill-wave',
      color: '#8b5cf6',
      tintClass: 'kpi-tint-warm',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const conSalario = trabajadores.filter(d => {
          const s = (d[Calculations?.cols?.salario] || '').toLowerCase();
          return s && !s.includes('prefiero no decirlo') && !s.includes('no declara');
        });
        const salarioAlto = conSalario.filter(d => {
          const s = (d[Calculations?.cols?.salario] || '').toLowerCase();
          return s.includes('3,001') || s.includes('5,001') || s.includes('8,001') || s.includes('más de');
        }).length;
        const pct = conSalario.length > 0 ? (salarioAlto / conSalario.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Con ingreso mayor a S/ 3,000 (${salarioAlto.toLocaleString()} de ${conSalario.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    // === DESARROLLO PROFESIONAL ===
    personalCargo: {
      id: 'personalCargo',
      titulo: 'Personal a cargo',
      icono: 'fas fa-users-cog',
      color: '#d97706',
      tintClass: 'kpi-tint-warm',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const conCargo = trabajadores.filter(d => {
          const c = (d[Calculations?.cols?.personalCargo] || '').toLowerCase();
          return c.includes('sí') || c.includes('si');
        }).length;
        const pct = trabajadores.length > 0 ? (conCargo / trabajadores.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Con personal a su cargo (${conCargo.toLocaleString()} de ${trabajadores.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    ascensos: {
      id: 'ascensos',
      titulo: 'Ascensos',
      icono: 'fas fa-arrow-trend-up',
      color: '#ea580c',
      tintClass: 'kpi-tint-pert',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const dependientes = (data || []).filter(d => {
          const c = (d[Calculations?.cols?.condicion] || '').toLowerCase();
          // OJO: 'independiente' contiene 'dependiente' como subcadena; se excluye explícitamente.
          return c.includes('dependiente') && !c.includes('independiente');
        });
        const conAscenso = dependientes.filter(d => {
          const a = (d[Calculations?.cols?.ascenso] || '').toLowerCase();
          return a.includes('sí') || a.includes('si');
        }).length;
        const pct = dependientes.length > 0 ? (conAscenso / dependientes.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Ascenso en últimos 5 años (${conAscenso.toLocaleString()} de ${dependientes.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    // === POSGRADO ===
    conPosgrado: {
      id: 'conPosgrado',
      titulo: 'Con Posgrado',
      icono: 'fas fa-graduation-cap',
      color: '#6366f1',
      tintClass: 'kpi-tint-cyan',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const conPosgrado = (data || []).filter(d => {
          const p = (d[Calculations?.cols?.posgrado] || '').trim().toLowerCase();
          return p === 'sí' || p === 'si';
        }).length;
        const pct = total > 0 ? (conPosgrado / total) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Con estudios de posgrado (${conPosgrado.toLocaleString()} de ${total.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    interesPosgrado: {
      id: 'interesPosgrado',
      titulo: 'Interés en Posgrado UNW',
      icono: 'fas fa-university',
      color: '#ec4899',
      tintClass: 'kpi-tint-mint',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const interesados = (data || []).filter(d => {
          const i = (d[Calculations?.cols?.interesPosgrado] || '').trim().toLowerCase();
          return i.includes('sí') || i.includes('si');
        }).length;
        const pct = total > 0 ? (interesados / total) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Interesados en posgrado UNW (${interesados.toLocaleString()} de ${total.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    // === NPS ===
    npsInstitucional: {
      id: 'npsInstitucional',
      titulo: 'NPS Institucional',
      icono: 'fas fa-award',
      color: '#0d9488',
      tintClass: 'kpi-tint-green',
      calcular: (data) => {
        let npsScore = 0;
        let npsValidosCount = 0;
        try {
          // NPS institucional considera a TODOS los egresados: quienes trabajan
          // (Pregunta 13) y quienes están en búsqueda de empleo (Pregunta 6).
          // Reutiliza la misma lógica que la página de NPS y Preguntas Abiertas
          // para evitar que este indicador quede sub-representado.
          const metricas = Calculations?.getNPSMetricasDetalladas ? Calculations.getNPSMetricasDetalladas(data || [], 'global') : null;
          if (metricas) {
            npsScore = metricas.nps;
            npsValidosCount = metricas.total;
          }
        } catch (e) { console.warn(e); }
        const sign = npsScore >= 0 ? '+' : '';
        return {
          valor: `${sign}${Math.round(npsScore)}`,
          descripcion: `Nivel de recomendación institucional (${npsValidosCount.toLocaleString()} respuestas válidas)`,
          valorNumerico: npsScore
        };
      }
    },

    // === EMPRENDIMIENTO ===
    emprendedoresTotal: {
      id: 'emprendedoresTotal',
      titulo: 'Emprendedores',
      icono: 'fas fa-store',
      color: '#8b5cf6',
      tintClass: 'kpi-tint-warm',
      calcular: (data) => {
        const emprendedores = (data || []).filter(d => {
          const c = (d[Calculations?.cols?.condicion] || '').toLowerCase();
          return c.includes('emprendedor') || c.includes('propietario');
        }).length;
        return {
          valor: emprendedores.toLocaleString(),
          descripcion: `Egresados con emprendimiento propio`,
          valorNumerico: emprendedores
        };
      }
    },

    emprendedoresFormalizados: {
      id: 'emprendedoresFormalizados',
      titulo: 'Emprend. Formalizados',
      icono: 'fas fa-file-invoice-dollar',
      color: '#10b981',
      tintClass: 'kpi-tint-teal',
      calcular: (data) => {
        const emprendedores = (data || []).filter(d => {
          const c = (d[Calculations?.cols?.condicion] || '').toLowerCase();
          return c.includes('emprendedor') || c.includes('propietario');
        });
        const formalizados = emprendedores.filter(d => {
          const f = (d['2.3 Si responde "Propietario o socio de negocio/emprendimiento". Respecto a su emprendimiento o negocio: (E: LEER ALTERNATIVAS)'] || '').toLowerCase();
          return f.includes('formalizado');
        }).length;
        const pct = emprendedores.length > 0 ? (formalizados / emprendedores.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Con RUC activo (${formalizados.toLocaleString()} de ${emprendedores.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    // === MODALIDAD ===
    trabajoRemoto: {
      id: 'trabajoRemoto',
      titulo: 'Trabajo Remoto',
      icono: 'fas fa-home',
      color: '#0ea5e9',
      tintClass: 'kpi-tint-cyan',
      calcular: (data) => {
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const remoto = trabajadores.filter(d => {
          const m = (d[Calculations?.cols?.modalidad] || '').toLowerCase();
          return m.includes('remoto');
        }).length;
        const pct = trabajadores.length > 0 ? (remoto / trabajadores.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Trabajan de manera remota (${remoto.toLocaleString()} de ${trabajadores.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    trabajoHibrido: {
      id: 'trabajoHibrido',
      titulo: 'Trabajo Híbrido',
      icono: 'fas fa-random',
      color: '#8b5cf6',
      tintClass: 'kpi-tint-pert',
      calcular: (data) => {
        const trabajadores = (data || []).filter(d => {
          const t = (d[Calculations?.cols?.trabaja] || '').trim().toLowerCase();
          return t === 'sí' || t === 'si';
        });
        const hibrido = trabajadores.filter(d => {
          const m = (d[Calculations?.cols?.modalidad] || '').toLowerCase();
          return m.includes('híbrido') || m.includes('hibrido');
        }).length;
        const pct = trabajadores.length > 0 ? (hibrido / trabajadores.length) * 100 : 0;
        return {
          valor: `${Math.round(pct)}%`,
          descripcion: `Trabajan de manera híbrida (${hibrido.toLocaleString()} de ${trabajadores.length.toLocaleString()})`,
          valorNumerico: pct
        };
      }
    },

    // === INICIATIVAS ALUMNI ===
    iniciativaNetworking: {
      id: 'iniciativaNetworking',
      titulo: 'Interés Networking',
      icono: 'fas fa-network-wired',
      color: '#0ea5e9',
      tintClass: 'kpi-tint-teal',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const interesados = (data || []).filter(d => Calculations?.isMultiSelectChecked
          ? Calculations.isMultiSelectChecked(d[Calculations?.cols?.iniciativaNetworking])
          : false).length;
        const pct = total > 0 ? (interesados / total) * 100 : 0;
        return {
          valor: interesados.toLocaleString(),
          descripcion: `Interesados en networking (${Math.round(pct)}% del total)`,
          valorNumerico: interesados
        };
      }
    },

    iniciativaMentoria: {
      id: 'iniciativaMentoria',
      titulo: 'Interés Mentoría',
      icono: 'fas fa-hands-helping',
      color: '#10b981',
      tintClass: 'kpi-tint-mint',
      calcular: (data) => {
        const total = data ? data.length : 0;
        const interesados = (data || []).filter(d => Calculations?.isMultiSelectChecked
          ? Calculations.isMultiSelectChecked(d[Calculations?.cols?.iniciativaMentoria])
          : false).length;
        const pct = total > 0 ? (interesados / total) * 100 : 0;
        return {
          valor: interesados.toLocaleString(),
          descripcion: `Interesados en mentoría (${Math.round(pct)}% del total)`,
          valorNumerico: interesados
        };
      }
    }
  },

  // Obtener un KPI por su ID
  getKPI(kpiId) {
    return this.kpis[kpiId] || null;
  },

  // Obtener todos los KPIs disponibles como array
  getAllKPIs() {
    return Object.values(this.kpis);
  },

  // Obtener IDs de todos los KPIs disponibles
  getKPIIds() {
    return Object.keys(this.kpis);
  },

  // Calcular un KPI específico
  calcularKPI(kpiId, data, trazabilidad) {
    const kpi = this.getKPI(kpiId);
    if (!kpi) return null;
    try {
      return kpi.calcular(data, trazabilidad);
    } catch (e) {
      console.warn(`Error calculando KPI ${kpiId}:`, e);
      return null;
    }
  },

  // Configuración por defecto de las 6 tarjetas KPI
  getDefaultConfig() {
    return [
      { kpiId: 'encuestasValidas', posicion: 0 },
      { kpiId: 'totalMuestraVsMeta', posicion: 1 },
      { kpiId: 'ocupacionPEA', posicion: 2 },
      { kpiId: 'pertinenciaLaboral', posicion: 3 },
      { kpiId: 'satisfaccionLaboral', posicion: 4 },
      { kpiId: 'npsInstitucional', posicion: 5 }
    ];
  }
};

// Exponer globalmente
window.KPICatalog = KPICatalog;
