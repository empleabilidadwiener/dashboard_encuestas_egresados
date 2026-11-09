// js/app.js — Router principal (delgado, ~120 líneas)
// Las páginas están en js/pages/*.js

import { loadRepresentatividadPage } from './pages/representatividad.js?v=20261106_npsorder_v3';
import { loadOcupacionPage } from './pages/ocupacion.js?v=20261106_npsorder_v3';
import { loadPerfilNoTrabajaPage } from './pages/perfil-no-trabaja.js?v=20261106_npsorder_v3';
import { loadEmpleabilidadPage } from './pages/empleabilidad.js?v=20261106_npsorder_v3';
import { loadMetodologiaPage } from './pages/metodologia.js?v=20261106_npsorder_v3';
import { loadMargenErrorPage } from './pages/margen-error.js?v=20261106_npsorder_v3';
import { loadPreguntasAbiertasPage } from './pages/preguntas-abiertas.js?v=20261106_npsorder_v3';
import { loadEvolutivoPage } from './pages/evolutivo.js?v=20261106_npsorder_v3';
import { loadVisorDatosPage } from './pages/visor-datos.js?v=20261106_npsorder_v3';
import { loadEmprendimientosPage } from './pages/emprendimientos.js?v=20261106_npsorder_v3';
import { loadResumenPage } from './pages/resumen.js?v=20261106_npsorder_v3';
import { loadResultadosGeneralesPage } from './pages/resultados-generales.js?v=20261106_npsorder_v3';
import { loadFormacionContinuaPage } from './pages/formacion-continua.js?v=20261106_npsorder_v3';
const App = {
  currentPage: 'resumen',
  filters: { facultad: 'Todas', carrera: 'Todas', anio: 'Todos' },
  encFile: null,
  uniFile: null,

  init() {
    this.setupSidebarToggle();
    this.setupNavigation();
    this.setupFilters();
    this.tryLoadDefaultData();
  },

  setupSidebarToggle() {
    const appContainer = document.querySelector('.app-container') || document.body;
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    const expandBtn = document.getElementById('sidebar-expand-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const toggleSidebar = (forceState) => {
      const isMobile = window.innerWidth <= 1024;
      if (isMobile) {
        sidebar?.classList.remove('open');
        overlay?.classList.remove('active');
        return;
      }

      const shouldCollapse = forceState !== undefined
        ? forceState
        : !appContainer.classList.contains('sidebar-collapsed');

      if (shouldCollapse) {
        appContainer.classList.add('sidebar-collapsed');
        localStorage.setItem('sidebar_collapsed', 'true');
      } else {
        appContainer.classList.remove('sidebar-collapsed');
        localStorage.setItem('sidebar_collapsed', 'false');
      }

      // Redimensionar gráficos con suavidad durante y después de la transición CSS
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 320);
    };

    collapseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar(true);
    });

    expandBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar(false);
    });

    // Atajo de teclado: Ctrl + B o Cmd + B
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const activeEl = document.activeElement;
        if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) return;
        e.preventDefault();
        toggleSidebar();
      }
    });

    // Restaurar preferencia guardada en desktop
    if (window.innerWidth > 1024 && localStorage.getItem('sidebar_collapsed') === 'true') {
      appContainer.classList.add('sidebar-collapsed');
      setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    }
  },

  async tryLoadDefaultData() {
    const loadError = document.getElementById('load-error');
    const loading = document.getElementById('loading');
    if (loadError) loadError.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    try {
      const [encResponse, uniResponse] = await Promise.all([
        fetch('data/respuestas_encuestas_2026.csv?v=20261105_secauth_v4'),
        fetch('data/universo.xlsx?v=20261105_secauth_v4')
      ]);
      if (!encResponse.ok || !uniResponse.ok) throw new Error('Archivos de datos no encontrados');
      const encBlob = await encResponse.blob();
      const uniBlob = await uniResponse.blob();
      if (encBlob.size < 100 || uniBlob.size < 100) throw new Error('Archivos de datos están vacíos');
      this.encFile = new File([encBlob], 'respuestas_encuestas_2026.csv', { type: encBlob.type });
      this.uniFile = new File([uniBlob], 'universo.xlsx', { type: uniBlob.type });
      await this.processFiles();
    } catch (error) {
      console.error('No se pudieron cargar los datos:', error);
      if (loading) loading.classList.add('hidden');
      if (loadError) loadError.classList.remove('hidden');
    }
  },

  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page && DataLoader.isLoaded) this.navigateTo(page);
      });
    });
    document.querySelectorAll('.bottom-nav-item[data-page]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page && DataLoader.isLoaded) this.navigateTo(page);
      });
    });

    const mobileBtnMenu = document.getElementById('mobile-btn-menu');
    const mobileToggle = document.getElementById('mobile-toggle');
    const bottomMenuToggle = document.getElementById('bottom-menu-toggle');
    const sidebarCloseBtn = document.getElementById('sidebar-mobile-close-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openSidebar = () => { sidebar?.classList.add('open'); overlay?.classList.add('active'); };
    const closeSidebar = () => { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); };

    mobileBtnMenu?.addEventListener('click', () => sidebar?.classList.contains('open') ? closeSidebar() : openSidebar());
    mobileToggle?.addEventListener('click', () => sidebar?.classList.contains('open') ? closeSidebar() : openSidebar());
    bottomMenuToggle?.addEventListener('click', () => sidebar?.classList.contains('open') ? closeSidebar() : openSidebar());
    sidebarCloseBtn?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    // Modal Global del Instrumento Oficial
    const mobileBtnInstrumento = document.getElementById('mobile-btn-instrumento');
    const btnCerrarInstrumento = document.getElementById('btn-cerrar-instrumento-global');
    const btnCerrarInstrumentoFooter = document.getElementById('btn-cerrar-instrumento-global-footer');
    const backdropInstrumento = document.getElementById('instrumento-modal-backdrop');
    const modalInstrumento = document.getElementById('global-modal-instrumento');

    window.abrirModalInstrumento = () => {
      if (modalInstrumento) {
        modalInstrumento.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    };

    window.cerrarModalInstrumento = () => {
      if (modalInstrumento) {
        modalInstrumento.style.display = 'none';
        document.body.style.overflow = '';
      }
    };

    mobileBtnInstrumento?.addEventListener('click', window.abrirModalInstrumento);
    btnCerrarInstrumento?.addEventListener('click', window.cerrarModalInstrumento);
    btnCerrarInstrumentoFooter?.addEventListener('click', window.cerrarModalInstrumento);
    backdropInstrumento?.addEventListener('click', window.cerrarModalInstrumento);

    // Pestañas internas de navegación por secciones del cuestionario
    document.querySelectorAll('.inst-tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.inst-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetId = tab.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalInstrumento && modalInstrumento.style.display !== 'none') {
          window.cerrarModalInstrumento();
        }
      }
    });
  },

  setupFilters() {
    const facultadSelect = document.getElementById('filter-facultad');
    const carreraSelect = document.getElementById('filter-carrera');
    const anioSelect = document.getElementById('filter-anio');
    if (facultadSelect) facultadSelect.addEventListener('change', (e) => { this.filters.facultad = e.target.value; this.updateCarreras(); this.applyFilters(); });
    if (carreraSelect) carreraSelect.addEventListener('change', (e) => { this.filters.carrera = e.target.value; this.applyFilters(); });
    if (anioSelect) anioSelect.addEventListener('change', (e) => { this.filters.anio = e.target.value; this.applyFilters(); });
  },

  async processFiles() {
    const loadError = document.getElementById('load-error');
    const loading = document.getElementById('loading');
    const filtersBar = document.getElementById('filters-bar');
    if (loading) loading.classList.remove('hidden');
    try {
      await DataLoader.loadDataFromFiles(this.encFile, this.uniFile);
      this.populateFilters();
      if (loadError) loadError.classList.add('hidden');
      if (loading) loading.classList.add('hidden');
      if (filtersBar) filtersBar.classList.remove('hidden');
      this.navigateTo(this.currentPage);
    } catch (error) {
      console.error('Error procesando archivos:', error);
      if (loading) loading.classList.add('hidden');
      if (loadError) loadError.classList.remove('hidden');
      throw error;
    }
  },

  populateFilters() {
    const facultades = DataLoader.getFacultades();
    const anios = DataLoader.getAniosEgreso();
    const facultadSelect = document.getElementById('filter-facultad');
    const carreraSelect = document.getElementById('filter-carrera');
    const anioSelect = document.getElementById('filter-anio');
    if (facultadSelect) {
      facultadSelect.innerHTML = '<option value="Todas">Todas las facultades</option>';
      facultades.forEach(f => { facultadSelect.innerHTML += `<option value="${f}">${f}</option>`; });
    }
    if (carreraSelect) this.updateCarreras();
    if (anioSelect) {
      anioSelect.innerHTML = '<option value="Todos">Todos los años</option>';
      anios.forEach(a => { anioSelect.innerHTML += `<option value="${a}">${a}</option>`; });
    }
  },

  updateCarreras() {
    const carreraSelect = document.getElementById('filter-carrera');
    if (!carreraSelect) return;
    const carreras = DataLoader.getCarreras();
    const filteredCarreras = this.filters.facultad === 'Todas'
      ? carreras
      : carreras.filter(c => DataLoader.getFacultadForCarrera(c) === this.filters.facultad);
    carreraSelect.innerHTML = '<option value="Todas">Todas las carreras</option>';
    filteredCarreras.forEach(c => {
      const display = window.toTitleCase ? window.toTitleCase(c) : c;
      carreraSelect.innerHTML += `<option value="${c}">${display}</option>`;
    });
  },

  applyFilters() { this.navigateTo(this.currentPage); },

  getFilteredData() {
    let data = DataLoader.getEncuestas();
    if (this.filters.facultad !== 'Todas') data = data.filter(d => DataLoader.getFacultadForCarrera(d['CARRERA']) === this.filters.facultad);
    if (this.filters.carrera !== 'Todas') data = data.filter(d => d['CARRERA'] === this.filters.carrera);
    if (this.filters.anio !== 'Todos') {
      data = data.filter(d => {
        const val = d['Año de Egreso'];
        return val && val.toString().includes(this.filters.anio.toString());
      });
    }
    return data;
  },

  navigateTo(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === page) item.classList.add('active');
    });
    document.querySelectorAll('.bottom-nav-item[data-page]').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === page) item.classList.add('active');
    });
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    const pageContent = document.getElementById('page-content');
    if (pageContent) pageContent.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Cargando datos...</p></div>';
    setTimeout(() => this.loadPage(page), 100);
  },

  async loadPage(page) {
    const filtersBar = document.getElementById('filters-bar');
    if (filtersBar) {
      if (page === 'resumen') {
        filtersBar.classList.add('hidden');
      } else {
        filtersBar.classList.remove('hidden');
      }
    }

    const data = this.getFilteredData();
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;
    try {
      switch (page) {
        case 'resumen': await loadResumenPage(pageContent, data, this.filters); break;
        case 'representatividad': await loadRepresentatividadPage(pageContent, data, this.filters); break;
        case 'ocupacion': await loadOcupacionPage(pageContent, data, this.filters); break;
        case 'perfil-no-trabaja': await loadPerfilNoTrabajaPage(pageContent, data); break;
        case 'empleabilidad': await loadEmpleabilidadPage(pageContent, data); break;
        case 'emprendimientos': await loadEmprendimientosPage(pageContent, data); break;
        case 'evolutivo': {
          let encuestasEvolutivo = await DataLoader.loadEvolutivoData();
          if (this.filters.facultad !== 'Todas') encuestasEvolutivo = encuestasEvolutivo.filter(d => DataLoader.getFacultadForCarrera(d['Programa Académico:']) === this.filters.facultad);
          if (this.filters.carrera !== 'Todas') encuestasEvolutivo = encuestasEvolutivo.filter(d => d['Programa Académico:'] === this.filters.carrera);
          if (this.filters.anio !== 'Todos') {
            encuestasEvolutivo = encuestasEvolutivo.filter(d => {
              const val = d['Año de egreso:'];
              return val && val.toString().includes(this.filters.anio.toString());
            });
          }
          await loadEvolutivoPage(pageContent, data, encuestasEvolutivo);
          break;
        }
        case 'resultados-generales': await loadResultadosGeneralesPage(pageContent, data); break;
        case 'formacion-continua': await loadFormacionContinuaPage(pageContent, data); break;
        case 'metodologia':
        case 'metodologias': await loadMetodologiaPage(pageContent, data); break;
        case 'margen-error': await loadMargenErrorPage(pageContent, data); break;
        case 'preguntas-abiertas': await loadPreguntasAbiertasPage(pageContent, data); break;
        case 'visor-datos': await loadVisorDatosPage(pageContent, data); break;
        default:
          pageContent.innerHTML = '<div class="empty-state"><i class="fas fa-file-alt"></i><h3>Página no encontrada</h3></div>';
      }

      window.scrollTo({ top: 0, behavior: 'instant' });

      if (window.Charts && typeof window.Charts.attachFullscreenButtons === 'function') {
        setTimeout(() => window.Charts.attachFullscreenButtons(), 120);
        setTimeout(() => window.Charts.attachFullscreenButtons(), 500);
      }

      if (window.Editor) {
        window.Editor.onPageChange(page);
      }
    } catch (err) {
      console.error(`Error cargando página ${page}:`, err);
      pageContent.innerHTML = `
        <div class="empty-state" style="padding: 60px 20px; text-align: center;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
          <h3 style="color: #1e293b; font-size: 20px; margin-bottom: 8px;">Error al cargar la página</h3>
          <p style="color: #64748b;">${err.message || 'Error inesperado.'}</p>
        </div>
      `;
    }
  },

  // Usado en empleabilidad.js vía App.getSemaforoBadge
  getSemaforoBadge(tasa, tipo = 'pea') {
    if (tipo === 'pertinencia') {
      if (tasa >= 75) return `<span class="badge badge-semaforo-verde"><i class="fas fa-circle" style="font-size:8px;margin-right:4px;"></i>Alta (${Math.round(tasa)}%)</span>`;
      if (tasa >= 60) return `<span class="badge badge-semaforo-amarillo"><i class="fas fa-circle" style="font-size:8px;margin-right:4px;"></i>Media (${Math.round(tasa)}%)</span>`;
      return `<span class="badge badge-semaforo-azul-claro"><i class="fas fa-circle" style="font-size:8px;margin-right:4px;"></i>Baja (${Math.round(tasa)}%)</span>`;
    }
    if (tasa >= 95) return `<span class="badge badge-semaforo-verde"><i class="fas fa-check-circle" style="margin-right:4px;"></i>${Math.round(tasa)}%</span>`;
    if (tasa >= 92) return `<span class="badge badge-semaforo-amarillo"><i class="fas fa-info-circle" style="margin-right:4px;"></i>${Math.round(tasa)}%</span>`;
    return `<span class="badge badge-semaforo-rojo"><i class="fas fa-exclamation-triangle" style="margin-right:4px;"></i>${Math.round(tasa)}%</span>`;
  }
};

// Exponer App globalmente para que los módulos de página puedan llamar App.navigateTo(...)
window.App = App;

document.addEventListener('DOMContentLoaded', () => { App.init(); });
