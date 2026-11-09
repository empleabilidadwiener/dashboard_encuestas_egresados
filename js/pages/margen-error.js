// js/pages/margen-error.js

export async function loadMargenErrorPage(container, data) {
  const universo = DataLoader.getUniverso();
  const global = Calculations.getMargenErrorInstitucionalGlobal(data, universo);
  let porCarrera = Calculations.getMargenErrorInstitucionalPorCarrera(data, universo);

  // Excluir carreras descontinuadas o sin muestra representativa
  porCarrera = porCarrera.filter(c => !c.carrera.toUpperCase().includes('MARKETING'));

  // Ordenar por menor margen de error (mayor precisión estadística arriba)
  const sortedCarreras = [...porCarrera].sort((a, b) => a.me - b.me);

  const nombresFormateados = {
    'FARMACIA Y BIOQUÍMICA': 'Farmacia y Bioquímica',
    'ENFERMERÍA': 'Enfermería',
    'ODONTOLOGÍA': 'Odontología',
    'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN': 'Terapia Física y Rehabilitación',
    'DERECHO Y CIENCIA POLÍTICA': 'Derecho y Ciencia Política',
    'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA': 'Laboratorio Clínico y Anatomía Patológica',
    'PSICOLOGÍA': 'Psicología',
    'CONTABILIDAD Y AUDITORÍA': 'Contabilidad y Auditoría',
    'ADMINISTRACIÓN Y DIRECCIÓN DE EMPRESAS': 'Administración y Dirección de Empresas',
    'OBSTETRICIA': 'Obstetricia',
    'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES': 'Administración y Negocios Internacionales',
    'INGENIERÍA DE SISTEMAS E INFORMÁTICA': 'Ingeniería de Sistemas e Informática',
    'NUTRICIÓN Y DIETÉTICA': 'Nutrición y Dietética',
    'MEDICINA HUMANA': 'Medicina Humana',
    'INGENIERÍA INDUSTRIAL Y DE GESTIÓN EMPRESARIAL': 'Ingeniería Industrial y de Gestión Empresarial',
    'ADMINISTRACIÓN EN TURISMO Y HOTELERÍA': 'Administración en Turismo y Hotelería'
  };

  const getNombre = (carrera) => {
    const upper = (carrera || '').toUpperCase().trim();
    return nombresFormateados[upper] || (window.toTitleCase ? window.toTitleCase(carrera) : carrera);
  };

  const trazabilidad = Calculations.getTrazabilidadPEAPorCarrera(data, universo);
  const totalMeta = trazabilidad?.totales?.totalMetaMuestral || 3742;
  const coberturaPct = totalMeta > 0 ? Math.round((global.n / totalMeta) * 100) : 0;

  container.innerHTML = `
    <div class="exec-dashboard-wrap">
      
      <!-- ENCABEZADO EJECUTIVO INSTITUCIONAL -->
      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Estadística y Muestreo</span>
        </div>
        <h1 class="exec-header-title">Margen de Error</h1>
        <div class="exec-header-subtitle">Evaluación de precisión estadística, tamaño muestral y representatividad institucional</div>
      </div>

      <!-- KPIS EJECUTIVOS (Estilo Idéntico a Empleabilidad y Ocupación) -->
      <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
        
        <div class="exec-kpi-box kpi-tint-wiener">
          <div class="exec-kpi-title">Margen de Error Global</div>
          <div class="exec-kpi-number">±${Math.round(global.me)}%</div>
          <div class="exec-kpi-desc"><span style="font-weight: 700; color: #ffffff;">±${global.me.toFixed(1)}% real</span> · Máxima precisión muestral</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Nivel de Confianza</div>
          <div class="exec-kpi-number text-primary" style="color: #07C8CC;">95%</div>
          <div class="exec-kpi-desc">Coeficiente Z = 1.96 (Estándar internacional)</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Muestra Efectiva (n)</div>
          <div class="exec-kpi-number">${global.n.toLocaleString()}</div>
          <div class="exec-kpi-desc">Encuestas válidas procesadas</div>
        </div>

        <div class="exec-kpi-box kpi-tint-white">
          <div class="exec-kpi-title">Cobertura vs. Meta</div>
          <div class="exec-kpi-number" style="color: #0a1b44;">${coberturaPct}%</div>
          <div class="exec-kpi-desc"><span style="font-weight: 700; color: #07C8CC;">${global.n.toLocaleString()}</span> de ${totalMeta.toLocaleString()} planificadas</div>
        </div>

      </div>

      <!-- SECCIÓN: GRÁFICO HORIZONTAL DE MARGEN DE ERROR -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-chart-bar" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Margen de Error por Programa Académico (±%)</span>
      </div>
      <p class="exec-section-desc">Precisión estadística estimada por programa (Ordenado de menor a mayor error | Nivel de confianza 95%, p=q=0.50)</p>
      
      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="exec-chart-canvas-wrap" style="height: 480px;">
          <canvas id="chart-margen-carreras"></canvas>
        </div>
      </div>

      <!-- SECCIÓN: TABLA DETALLADA DE PRECISIÓN MUESTRAL -->
      <div class="exec-section-header" style="margin-top: 24px; margin-bottom: 4px;">
        <i class="fas fa-table" style="color: #07C8CC; margin-right: 8px;"></i>
        <span>Tabla de Precisión Muestral por Carrera</span>
      </div>
      <p class="exec-section-desc">Programas académicos evaluados con muestra efectiva n ≥ 30 · 🟢 Alta precisión (≤5%) · 🟡 Aceptable (5.1% - 8%) · 🟠 Ampliar muestra (&gt;8%)</p>

      <div class="exec-panel" style="margin-bottom: 24px; margin-top: 12px;">
        <div class="table-container pb-2" style="overflow-x: auto;">
          <table class="data-table" style="min-width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th class="text-left" style="padding: 12px; font-weight: 600;">Carrera Profesional</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Muestra Efectiva (n)</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Nivel de Confianza</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Margen de Error</th>
                <th class="text-center" style="padding: 12px; font-weight: 600;">Evaluación de Confiabilidad</th>
              </tr>
            </thead>
            <tbody>
              ${sortedCarreras.map(c => {
                const meRounded = Math.round(c.me);
                let semaforoBadge = '';
                if (meRounded <= 5) {
                  semaforoBadge = `<span class="badge badge-semaforo-verde" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">🟢 Alta Precisión (±${meRounded}%)</span>`;
                } else if (meRounded <= 8) {
                  semaforoBadge = `<span class="badge badge-semaforo-amarillo" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">🟡 Aceptable (±${meRounded}%)</span>`;
                } else {
                  semaforoBadge = `<span class="badge badge-semaforo-rojo" style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">🟠 Ampliar (±${meRounded}%)</span>`;
                }

                return `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 12px;"><strong>${getNombre(c.carrera)}</strong></td>
                    <td class="text-center text-muted" style="padding: 10px 12px;">${c.total.toLocaleString()}</td>
                    <td class="text-center text-muted" style="padding: 10px 12px;">95% (Z = 1.96)</td>
                    <td class="text-center font-bold text-dark" style="padding: 10px 12px; font-size: 14px;">±${meRounded}%</td>
                    <td class="text-center" style="padding: 10px 12px;">${semaforoBadge}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- NOTAS METODOLÓGICAS AL PIE (Estilo Idéntico a las Otras Páginas) -->
      <div class="exec-footer-notes">
        <p><strong>Nivel de Confianza (95%):</strong> Establece el grado de certidumbre probabilística fijado a priori (Z = 1.96). Indica que en 95 de cada 100 réplicas del estudio, el valor poblacional real se encuentra dentro del margen de error reportado.</p>
        <p><strong>Margen de Error:</strong> Calculado con la fórmula para poblaciones finitas (corrección de Cochran) bajo criterio de máxima varianza (p = q = 0.50, escenario de máxima exigencia muestral, independiente de la pregunta que se mida) con universo institucional de N = ${global.N.toLocaleString()} egresados. El margen por carrera usa el universo específico de cada programa académico, no el total institucional.</p>
        <p><strong>Estándar de Acreditación:</strong> Un margen de error global ≤ ±5% garantiza máxima solvencia técnica para la toma de decisiones estratégicas y sustentación ante comités de acreditación nacional e internacional.</p>
      </div>

    </div>
  `;

  Charts.waitForReady().then(() => {
    const labels = sortedCarreras.map(c => getNombre(c.carrera));
    const values = sortedCarreras.map(c => Math.round(c.me));

    Charts.createHorizontalBarChart('chart-margen-carreras',
      labels,
      [{
        label: 'Margen de Error (%)',
        data: values,
        backgroundColor: '#07C8CC',
        borderColor: '#07C8CC',
        borderWidth: 1,
        borderRadius: 3
      }],
      {
        xAxisFormat: (v) => `±${Math.round(v)}%`,
        layout: {
          padding: { right: 28, left: 10, top: 10, bottom: 10 }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (item) => {
                const c = sortedCarreras[item.dataIndex];
                return ` Margen de Error: ±${Math.round(item.raw)}% (n = ${c.total.toLocaleString()} encuestados)`;
              }
            }
          },
          datalabels: {
            display: true, color: '#0a1b44',
            font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
            formatter: (v) => `±${Math.round(v)}%`
          }
        }
      }
    );
  });
}
