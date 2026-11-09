// js/pages/visor-datos.js
// Visor de Registros y Microdatos

export async function loadVisorDatosPage(container, data) {
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="exec-dashboard-wrap">
        <div class="exec-header">
          <div class="exec-top-bar">
            <span class="exec-institution">Universidad Norbert Wiener</span>
            <span class="exec-date">Visor de Microdatos</span>
          </div>
          <h1 class="exec-header-title">Visor de Datos</h1>
          <div class="exec-header-subtitle">Registros individuales de egresados encuestados</div>
        </div>
        <div class="exec-panel" style="padding: 60px 20px; text-align: center; margin-top: 24px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 44px; color: #94a3b8; margin-bottom: 16px;"></i>
          <h3 style="color: #0a1b44; font-size: 18px; font-weight: 700; margin-bottom: 8px;">No hay datos disponibles</h3>
          <p style="color: #64748b; font-size: 14px;">Verifica que los archivos de encuestas hayan sido cargados correctamente.</p>
        </div>
      </div>
    `;
    return;
  }

  // Excluir carrera descontinuada / no representativa de los registros
  const cleanData = data.filter(d => !String(d['CARRERA'] || '').toUpperCase().includes('MARKETING'));

  // Nota: el filtro compara en minúsculas por ambos lados (antes 'DNI:' con mayúsculas nunca
  // calzaba contra el header ya en minúsculas, dejando pasar la columna de DNI sin querer).
  // 'nombres'/'apellidos' cubren "Nombres y apellidos:"; 'código' cubre el código de alumno.
  const sensitiveCols = ['dni', 'telefono', 'teléfono', 'celular', 'email', 'correo', 'nombres', 'apellidos', 'código'];
  const allHeaders = Object.keys(cleanData[0] || {});
  const safeHeaders = allHeaders.filter(h => !sensitiveCols.some(sc => h.toLowerCase().includes(sc)));

  const importantCols = ['CARRERA', 'Año de Egreso', '1. ¿Actualmente', '2. ¿Cuál es tu condición', '9. ¿Cuál es tu ingreso', '6. ¿La actividad laboral'];
  const defaultVisible = safeHeaders.filter(h => importantCols.some(ic => h.includes(ic))).slice(0, 6);
  let visibleCols = [...defaultVisible];
  let searchText = '';
  let currentPage = 1;
  const rowsPerPage = 100;

  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const getFilteredData = () => {
    if (!searchText) return cleanData;
    const searchNorm = norm(searchText);
    return cleanData.filter(row => visibleCols.some(h => norm(String(row[h] || '')).includes(searchNorm)));
  };

  const formatCell = (val, colName, maxLen = 45) => {
    if (val === undefined || val === null) return '<span class="text-muted">-</span>';
    let strVal = String(val).trim();
    if (!strVal) return '<span class="text-muted">-</span>';

    if (colName && (colName.includes('Programa Académico') || colName === 'CARRERA') && window.toTitleCase) {
      strVal = window.toTitleCase(strVal);
    }

    strVal = strVal.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (strVal.length > maxLen) {
      return `<span title="${strVal.replace(/"/g, '&quot;')}" class="cell-truncated">${strVal.substring(0, maxLen)}...</span>`;
    }
    return strVal;
  };

  const renderTable = () => {
    // El render reconstruye todo el HTML (incluido el <input> de búsqueda), así que si no
    // se restaura el foco y la posición del cursor a mano, cada re-render (disparado por el
    // debounce mientras el usuario sigue escribiendo) deja el nuevo input sin foco y las
    // siguientes teclas se pierden, dando la sensación de que "no deja escribir completo".
    const searchHadFocus = document.activeElement && document.activeElement.id === 'visor-search';
    const searchCursorPos = searchHadFocus ? document.activeElement.selectionStart : null;

    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const displayData = filteredData.slice(start, end);

    container.innerHTML = `
      <div class="exec-dashboard-wrap">
        
        <!-- ENCABEZADO INSTITUCIONAL HOMOLOGADO -->
        <div class="exec-header">
          <div class="exec-top-bar">
            <span class="exec-institution">Universidad Norbert Wiener</span>
            <span class="exec-date">Dirección de Desarrollo Profesional y Alumni</span>
          </div>
          <h1 class="exec-header-title">Visor de Datos y Microdatos</h1>
          <div class="exec-header-subtitle">Explorador de registros individuales y respuestas de la encuesta (datos personales protegidos bajo Ley N° 29733)</div>
        </div>

        <!-- 4 KPIS EJECUTIVOS DE REGISTROS -->
        <div class="exec-kpis-container" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
          <div class="exec-kpi-box kpi-tint-wiener">
            <div class="exec-kpi-title">Total Registros</div>
            <div class="exec-kpi-number">${filteredData.length.toLocaleString()}</div>
            <div class="exec-kpi-desc">De ${cleanData.length.toLocaleString()} encuestados</div>
          </div>

          <div class="exec-kpi-box kpi-tint-white">
            <div class="exec-kpi-title">Columnas Visibles</div>
            <div class="exec-kpi-number text-primary" style="color: #07C8CC;">${visibleCols.length}</div>
            <div class="exec-kpi-desc">De ${safeHeaders.length} campos disponibles</div>
          </div>

          <div class="exec-kpi-box kpi-tint-white">
            <div class="exec-kpi-title">Página Actual</div>
            <div class="exec-kpi-number" style="color: #0a1b44;">${currentPage} <span style="font-size: 16px; font-weight: 500; color: #64748b;">/ ${totalPages || 1}</span></div>
            <div class="exec-kpi-desc">Mostrando ${filteredData.length > 0 ? (start + 1) : 0} - ${Math.min(end, filteredData.length)}</div>
          </div>

          <div class="exec-kpi-box kpi-tint-white">
            <div class="exec-kpi-title">Registros por Página</div>
            <div class="exec-kpi-number" style="color: #0a1b44;">${rowsPerPage}</div>
            <div class="exec-kpi-desc">Filas en pantalla</div>
          </div>
        </div>

        <!-- BARRA DE HERRAMIENTAS: BÚSQUEDA, COLUMNAS Y PAGINACIÓN -->
        <div class="exec-panel" style="margin-bottom: 20px; padding: 14px 20px;">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px;">
            <div style="display: flex; flex-grow: 1; min-width: 240px; position: relative;">
              <i class="fas fa-search" style="position: absolute; left: 14px; top: 12px; color: #94a3b8; font-size: 14px;"></i>
              <input type="text" id="visor-search" placeholder="Buscar en registros visibles..." value="${searchText.replace(/"/g, '&quot;')}" 
                class="form-control" style="padding-left: 38px; border-radius: 8px; font-size: 13px; width: 100%;">
            </div>

            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <button id="btn-toggle-cols" class="btn btn-sm btn-outline-primary" style="border-radius: 8px; font-weight: 600; padding: 8px 14px; border-color: #07C8CC; color: #0a1b44;">
                <i class="fas fa-columns" style="color: #07C8CC; margin-right: 6px;"></i>Gestionar Columnas (${visibleCols.length})
              </button>

              ${totalPages > 1 ? `
                <div style="display: flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px 8px;">
                  <button id="btn-prev-page" class="btn btn-sm btn-secondary" style="padding: 4px 8px; border-radius: 6px;" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span style="font-size: 12px; color: #475569; font-weight: 600; white-space: nowrap; padding: 0 4px;">
                    ${currentPage} / ${totalPages}
                  </span>
                  <button id="btn-next-page" class="btn btn-sm btn-secondary" style="padding: 4px 8px; border-radius: 6px;" ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- PANEL COLAPSIBLE DE SELECCIÓN DE COLUMNAS -->
        <div id="cols-panel" class="exec-panel" style="display: none; margin-bottom: 20px; padding: 18px 20px; background: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 13px; font-weight: 700; color: #0a1b44;">
              <i class="fas fa-check-square text-primary" style="margin-right: 6px;"></i>Selecciona las columnas para visualizar:
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="btn-reset-cols" class="btn btn-sm btn-secondary" style="font-size: 11px; border-radius: 6px; padding: 4px 8px;">
                Restablecer predeterminadas
              </button>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 220px; overflow-y: auto; padding-right: 6px;">
            ${safeHeaders.map(h => {
              const isVisible = visibleCols.includes(h);
              const chipStyle = isVisible 
                ? 'background: #07C8CC; color: #0a1b44; border: 1px solid #07C8CC; font-weight: 600;' 
                : 'background: #ffffff; color: #64748b; border: 1px solid #cbd5e1;';
              return `
                <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 10px; border-radius: 16px; cursor: pointer; user-select: none; transition: all 0.15s ease; ${chipStyle}">
                  <input type="checkbox" data-col="${h}" ${isVisible ? 'checked' : ''} style="accent-color: #0a1b44;">
                  ${h.length > 32 ? h.substring(0, 32) + '...' : h}
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- TABLA DE DATOS PRINCIPAL -->
        <div class="exec-panel" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
          <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 280px); padding: 0;">
            <table class="data-table" style="width: 100%; margin: 0; border-collapse: collapse;">
              <thead>
                <tr style="position: sticky; top: 0; background: #f8fafc; z-index: 3;">
                  <th class="text-center" style="width: 50px; position: sticky; left: 0; background: #f1f5f9; z-index: 4; border-right: 1px solid #e2e8f0;">#</th>
                  ${visibleCols.map(h => `
                    <th class="text-left" style="font-weight: 700; white-space: nowrap; padding: 12px 14px;">
                      ${h}
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${displayData.length === 0 ? `
                  <tr>
                    <td colspan="${visibleCols.length + 1}" style="padding: 40px; text-align: center; color: #94a3b8;">
                      <i class="fas fa-search" style="font-size: 32px; margin-bottom: 8px;"></i>
                      <p style="font-size: 14px; margin: 0;">No se encontraron registros que coincidan con la búsqueda.</p>
                    </td>
                  </tr>
                ` : displayData.map((row, i) => `
                  <tr>
                    <td class="text-center text-muted font-bold" style="position: sticky; left: 0; background: #f8fafc; z-index: 2; border-right: 1px solid #f1f5f9; font-size: 11px;">
                      ${start + i + 1}
                    </td>
                    ${visibleCols.map(h => `<td style="font-size: 12px; padding: 10px 14px;">${formatCell(row[h], h)}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- NOTAS AL PIE Y PRIVACIDAD -->
        <div class="exec-footer-notes">
          <i class="fas fa-shield-alt text-primary" style="margin-right: 6px;"></i>
          <strong>Protección de Datos Personales (Ley N° 29733):</strong> La información individual ha sido desidentificada y anonimizada. Los datos sensibles de contacto no son expuestos para garantizar la confidencialidad de la comunidad de egresados.
        </div>
      </div>
    `;

    // Event Listeners
    document.getElementById('btn-toggle-cols')?.addEventListener('click', () => {
      const panel = document.getElementById('cols-panel');
      if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('btn-reset-cols')?.addEventListener('click', () => {
      visibleCols = [...defaultVisible];
      renderTable();
    });

    document.querySelectorAll('#cols-panel input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const col = e.target.dataset.col;
        if (e.target.checked) {
          if (!visibleCols.includes(col)) visibleCols.push(col);
        } else {
          visibleCols = visibleCols.filter(c => c !== col);
        }
        renderTable();
      });
    });

    document.getElementById('btn-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderTable(); }
    });

    document.getElementById('btn-next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderTable(); }
    });

    const searchInput = document.getElementById('visor-search');
    if (searchInput) {
      if (searchHadFocus) {
        searchInput.focus();
        const pos = Math.min(searchCursorPos ?? searchInput.value.length, searchInput.value.length);
        searchInput.setSelectionRange(pos, pos);
      }
      let searchDebounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        // Le damos tiempo de sobra al usuario para terminar de escribir antes de re-renderizar
        // (cada render reconstruye la tabla completa de 3,000+ filas, así que si se dispara en
        // cada tecla se nota lento y además cada re-render de por sí interrumpe el tipeo).
        searchDebounceTimer = setTimeout(() => {
          searchText = e.target.value;
          currentPage = 1;
          renderTable();
        }, 450);
      });
    }
  };

  renderTable();
}
