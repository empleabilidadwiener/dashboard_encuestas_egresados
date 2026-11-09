// js/pages/metodologia.js

export async function loadMetodologiaPage(container, data) {
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="exec-dashboard-wrap">
        <div class="exec-header">
          <div class="exec-top-bar">
            <span class="exec-institution">Universidad Norbert Wiener</span>
            <span class="exec-date">Metodología</span>
          </div>
          <h1 class="exec-header-title">Metodología de Medición</h1>
          <div class="exec-header-subtitle">Estándar OIT / INEI para el Nivel de Empleabilidad y marco muestral institucional</div>
        </div>
        <div class="exec-panel" style="padding: 60px 20px; text-align: center; margin-top: 24px;">
          <i class="fas fa-filter" style="font-size: 44px; color: #94a3b8; margin-bottom: 16px;"></i>
          <h3 style="color: #0a1b44; font-size: 18px; font-weight: 700; margin-bottom: 8px;">No hay datos para los filtros seleccionados</h3>
          <p style="color: #64748b; font-size: 14px;">Prueba seleccionando "Todas las facultades" o "Todas las carreras".</p>
        </div>
      </div>
    `;
    return;
  }

  // Calcular datos PEA dinámicamente
  const sensibilidadPEA = Calculations?.getSensibilidadPEA ? Calculations.getSensibilidadPEA(data) : {};
  const pea = sensibilidadPEA.totalPEA || 0;
  const ocupadosPEA = sensibilidadPEA.ocupadosTotalPEA || 0;
  const noPEA = sensibilidadPEA.totalNoPEA || 0;
  const tasaPEA = pea > 0 ? (ocupadosPEA / pea) * 100 : 0;
  const tasaDesempleo = pea > 0 ? (sensibilidadPEA.buscanActivamente || 0) / pea * 100 : 0;
  const pctPEA = data.length > 0 ? (pea / data.length) * 100 : 0;
  const pctNoPEA = data.length > 0 ? (noPEA / data.length) * 100 : 0;

  const trazabilidad = Calculations?.getTrazabilidadPEAPorCarrera ? Calculations.getTrazabilidadPEAPorCarrera(data) : null;
  const totalMeta = trazabilidad?.totales?.totalMetaMuestral || 3742;
  const totalUniverso = (window.DataLoader?.getUniverso()?.length || 0);
  const pctCobertura = totalMeta > 0 ? ((data.length / totalMeta) * 100).toFixed(1) : '0';

  container.innerHTML = `
    <div class="exec-dashboard-wrap">
      <!-- Encabezado Institucional Homologado -->
      <div class="exec-header">
        <div class="exec-top-bar">
          <span class="exec-institution">Universidad Norbert Wiener</span>
          <span class="exec-date">Metodología</span>
        </div>
        <h1 class="exec-header-title">Metodología de Medición</h1>
        <div class="exec-header-subtitle">Estándar OIT / INEI para el Nivel de Empleabilidad, pertinencia laboral autoreportada y marco muestral institucional</div>
        <div style="margin-top: 12px; margin-bottom: 8px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm btn-primary" onclick="window.abrirModalInstrumento && window.abrirModalInstrumento()" style="background: #07C8CC; border-color: #07C8CC; color: #0a1b44; font-weight: 700; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; font-size: 13px;">
            <i class="fas fa-clipboard-list"></i> Ver Cuestionario Completo (Instrumento Oficial 2026)
          </button>
        </div>
      </div>

      <!-- SECCIÓN: PERTINENCIA LABORAL (AUTOREPORTADA) -->
      <div class="exec-panel" style="margin-bottom: 24px; padding: 20px 24px; border-left: 4px solid #07C8CC;">
        <div style="font-size: 16px; font-weight: 700; color: #0a1b44; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-comment-dots" style="color: #07C8CC;"></i> Pertinencia Laboral (Criterio Autoreportado)
        </div>
        <p style="font-size: 13px; color: #475569; margin-bottom: 0; line-height: 1.6;">
          La <strong>Pertinencia Laboral</strong> se mide únicamente con la respuesta declarada por el propio egresado ocupado a la Pregunta 6 del instrumento ("¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?" — Totalmente relacionada / Parcialmente relacionada / No relacionada). No existe ni se aplica ningún sistema o motor algorítmico que reclasifique, verifique o contradiga esa respuesta: la pertinencia es siempre la que el egresado comenta, no una inferencia de terceros. Este criterio es el que usan todas las páginas del dashboard que muestran pertinencia (Empleabilidad, Resumen Ejecutivo, Resultados Generales).
        </p>
      </div>

      <!-- SECCIÓN: METODOLOGÍA OIT / INEI -->
      <div class="exec-panel" style="margin-bottom: 24px; padding: 20px 24px; border-left: 4px solid #88E788;">
        <div style="font-size: 16px; font-weight: 700; color: #0a1b44; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-balance-scale" style="color: #166534;"></i> Metodología de Medición del Empleo y Nivel de Empleabilidad (Estándar OIT / INEI)
        </div>
        <p style="font-size: 13px; color: #475569; margin-bottom: 16px; line-height: 1.6;">
          Conforme a las recomendaciones de la <strong>Organización Internacional del Trabajo (OIT)</strong> y el <strong>INEI</strong>, el indicador de <strong>Nivel de Empleabilidad</strong> considera a quienes ejercen o buscan activamente una actividad laboral en el mercado activo:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
          <div style="background: rgba(136, 231, 136, 0.12); padding: 16px; border-radius: 8px; border: 1px solid rgba(136, 231, 136, 0.4);">
            <div style="font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-check-circle" style="color: #16a34a;"></i> Mercado Laboral Activo (${pea.toLocaleString()} egresados | ${Math.round(pctPEA)}%):
            </div>
            <ul style="font-size: 13px; color: #334155; margin: 0; padding-left: 20px; line-height: 1.6; list-style-type: disc;">
              <li><strong>Los que están trabajando:</strong> ${(sensibilidadPEA.trabajando || 0).toLocaleString()} egresados (Dependientes e independientes remunerados).</li>
              <li><strong>Los emprendedores:</strong> ${(sensibilidadPEA.emprendedores || 0).toLocaleString()} egresados (Propietarios o socios de empresas activas).</li>
              <li><strong>Iniciando negocio / consultorio:</strong> ${(sensibilidadPEA.iniciandoNegocio || 0).toLocaleString()} egresados (Proyecto personal en marcha).</li>
              <li><strong>Realizando SERUMS:</strong> ${(sensibilidadPEA.serumsActivo || 0).toLocaleString()} egresados (Actividad asistencial remunerada).</li>
              <li><strong>Buscando trabajo activamente:</strong> ${(sensibilidadPEA.buscanActivamente || 0).toLocaleString()} egresados (Entrevistas, convocatorias y CAS).</li>
            </ul>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(136, 231, 136, 0.3); font-size: 12px; font-weight: 700; color: #166534;">
              Nivel de Empleabilidad: ${Math.round(tasaPEA)}% | Tasa de Desocupación: ${Math.round(tasaDesempleo)}%
            </div>
          </div>

          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 14px; font-weight: 700; color: #475569; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-times-circle" style="color: #94a3b8;"></i> Población Inactiva (${noPEA.toLocaleString()} egresados | ${Math.round(pctNoPEA)}%):
            </div>
            <ul style="font-size: 13px; color: #64748b; margin: 0; padding-left: 20px; line-height: 1.6; list-style-type: disc;">
              <li><strong>Trámite de tesis, sustentación o título:</strong> ${(sensibilidadPEA.tramiteGrado || 0).toLocaleString()} egresados (Acreditación pendiente para ejercer).</li>
              <li><strong>Motivos personales, familiares o salud:</strong> ${(sensibilidadPEA.inactivosFamiliar || 0).toLocaleString()} egresados (Maternidad, salud y responsabilidades familiares).</li>
              <li><strong>Estudios de posgrado exclusivos:</strong> ${(sensibilidadPEA.inactivosEstudio || 0).toLocaleString()} egresados (Dedicación académica formativa).</li>
              <li><strong>Postulando / Preparándose al SERUMS:</strong> ${(sensibilidadPEA.postulandoSerumsNoPEA || 0).toLocaleString()} egresados (Fuera de la PEA según clasificación institucional).</li>
              <li><strong>Otros motivos de inactividad:</strong> ${(sensibilidadPEA.otrosInactivos || 0).toLocaleString()} egresados (Inactivos no disponibles).</li>
            </ul>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 12px; font-style: italic; color: #94a3b8;">
              Excluidos del denominador conforme al estándar internacional OIT / INEI.
            </div>
          </div>
        </div>

        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
          <strong>Marco Muestral Institucional:</strong> Universo oficial de <strong>${totalUniverso.toLocaleString()}</strong> egresados distribuidos en 17 carreras profesionales como dominios independientes. La muestra meta institucional planificada a un margen de error del ±5% con 95% de nivel de confianza y corrección por población finita es de <strong>${totalMeta.toLocaleString()}</strong> encuestas (frente a las <strong>${data.length.toLocaleString()}</strong> encuestas efectivas ejecutadas, alcanzando un <strong>${pctCobertura}%</strong> de cobertura).
        </div>
      </div>

      <!-- Notas al Pie Metodológicas -->
      <div class="exec-footer-notes">
        <i class="fas fa-info-circle text-primary" style="margin-right: 6px;"></i>
        <strong>Estándar de Calidad y Clasificación:</strong> El marco metodológico aplica las directrices de la <strong>OIT</strong> para la medición estadística de la población económicamente activa (PEA) en egresados universitarios. La pertinencia laboral no usa clasificación algorítmica: es siempre la respuesta autoreportada por el egresado.
      </div>
    </div>
  `;
}
