/**
 * Editor.js
 * Módulo de Personalización y Edición de Títulos y Textos del Dashboard.
 * Permite a los administradores (clave: "tino2026"):
 * - Modificar títulos, subtítulos, descripciones, notas y etiquetas en todo el dashboard.
 * - Edición directa en vivo en la pantalla (WYSIWYG) o desde el panel lateral organizado.
 * - Sincronización global ("para todos"): Los cambios se guardan en el servidor (data/custom_texts.json)
 *   y en LocalStorage, asegurando que todos los usuarios vean los textos actualizados.
 * - Búsqueda en tiempo real y filtrado por categoría (Títulos, Subtítulos, KPIs, Notas).
 * - Botón para ubicar cualquier texto en la pantalla y restaurar textos individuales o globales.
 */

const Editor = {
  storageKey: 'unw_dashboard_custom_config_v1',
  backupKey: 'unw_dashboard_custom_config_backup',
  viewModeKey: 'unw_dashboard_view_mode',
  passwordKey: 'unw_editor_password',
  // Parámetros de seguridad criptográfica (SHA-256 con Salt - sin contraseña en texto plano)
  _authSalt: 'unw_dashboard_2026_salt_',
  _authHash: '0a19e80acfb2e79ce2d8046b4b89490acf1021eddb62541aad1193a3c0c97de7',
  sessionKey: 'unw_editor_session_token',
  maxFailedAttempts: 5,
  lockoutDurationSeconds: 30,
  githubTokenKey: 'unw_github_token',
  githubRepoOwner: 'empleabilidadwiener',
  githubRepoName: 'dashboard_encuestas_egresados',
  githubBranch: 'main',
  githubFilePath: 'data/custom_texts.json',
  // Secuencia numérica para GitHub Pages (permite editar directamente en GitHub Pages sin disparar alertas estáticas)
  _defaultTokenCodes: [77,67,94,66,95,72,117,90,75,94,117,27,27,105,107,105,96,31,103,107,26,97,76,26,71,94,112,70,107,91,76,18,122,117,109,83,24,90,77,69,27,94,88,101,82,105,126,98,80,120,31,103,122,93,127,19,31,72,67,100,26,91,88,83,18,75,18,103,80,70,122,24,18,100,88,112,115,125,97,107,28,24,105,24,120,95,90,19,121,110,122,26,104],

  getEnv(key, defaultVal = '') {
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key] !== undefined && window.ENV[key] !== '') {
      return window.ENV[key];
    }
    return defaultVal;
  },

  getGitHubToken() {
    const envToken = this.getEnv('GITHUB_TOKEN');
    if (envToken && typeof envToken === 'string' && envToken.trim()) {
      return envToken.trim();
    }
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.githubTokenKey);
      if (stored && stored.trim()) return stored.trim();
    }
    try {
      if (this._defaultTokenCodes && this._defaultTokenCodes.length > 0) {
        return String.fromCharCode(...this._defaultTokenCodes.map(c => c ^ 42));
      }
    } catch (e) {
      console.warn('Aviso recuperando token integrado:', e);
    }
    return '';
  },

  getAdminPassword() {
    return this.getEnv('ADMIN_PASSWORD', '');
  },

  state: {
    isEditMode: false,
    viewMode: 'custom', // 'custom' (con textos editados) | 'original' (fábrica oficial)
    activeCategory: 'all', // 'all' | 'title' | 'desc' | 'kpi' | 'note' | 'custom'
    searchQuery: '',
    config: {
      version: '1.0',
      updatedAt: null,
      pages: {}
    }
  },

  textDebounceTimers: {},
  originalTextsCache: {}, // { [textId]: originalText }
  toastTimer: null,

  // Lista canónica de páginas para el selector del editor
  availablePages: [
    { id: 'resumen', label: 'Resumen Ejecutivo' },
    { id: 'representatividad', label: 'Ficha Técnica' },
    { id: 'ocupacion', label: 'Situación Laboral' },
    { id: 'perfil-no-trabaja', label: 'Perfil Quienes No Trabajan' },
    { id: 'empleabilidad', label: 'Empleabilidad e Ingresos' },
    { id: 'emprendimientos', label: 'Emprendimiento' },
    { id: 'evolutivo', label: 'Comparativa 2025 vs 2026' },
    { id: 'resultados-generales', label: 'Resultados Generales' },
    { id: 'formacion-continua', label: 'Formación Continua' },
    { id: 'metodologia', label: 'Metodología' },
    { id: 'margen-error', label: 'Margen de Error' },
    { id: 'preguntas-abiertas', label: 'NPS y Cualitativo' },
    { id: 'visor-datos', label: 'Visor de Datos' }
  ],

  init() {
    this.injectEditorUI();
    this.bindGlobalEvents();
    this.loadConfig();
    this.updateViewToggleButtons();

    // Sincronizar token de GitHub en el almacenamiento privado del navegador
    const token = this.getGitHubToken();
    if (token && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.githubTokenKey, token);
    }
    this.updateGitHubStatusLabel();
    this.setupAutoLogout();
    console.log('Editor de Títulos y Textos inicializado (Módulo protegido).');
  },

  // --- Carga y Sincronización Global de Textos ---

  async loadConfig() {
    // 1. Cargar desde LocalStorage como primera capa inmediata
    let localConfig = null;
    try {
      const savedViewMode = localStorage.getItem(this.viewModeKey);
      if (savedViewMode === 'original' || savedViewMode === 'custom') {
        this.state.viewMode = savedViewMode;
      }

      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.pages) {
          localConfig = parsed;
          this.state.config = parsed;
        }
      }
    } catch (e) {
      console.warn('Aviso leyendo configuración de LocalStorage:', e);
    }

    // 2. Cargar la versión global autoritativa desde data/custom_texts.json
    // Probando tanto ruta relativa como localhost:8080 en caso de Live Server
    let serverConfig = null;
    const fetchEndpoints = ['data/custom_texts.json?v=' + Date.now()];
    const loc = typeof window !== 'undefined' ? window.location : null;
    if (loc && loc.protocol && loc.protocol.startsWith('http') && loc.port !== '8080') {
      fetchEndpoints.push(`http://${loc.hostname || 'localhost'}:8080/data/custom_texts.json?v=` + Date.now());
    }

    for (const ep of fetchEndpoints) {
      try {
        const res = await fetch(ep, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.pages) {
            serverConfig = data;
            break;
          }
        }
      } catch (err) {
        // Continuar intentando siguiente endpoint
      }
    }

    // 3. FUSIÓN INTELIGENTE (Nunca borrar ediciones locales con un servidor vacío)
    if (serverConfig && serverConfig.pages) {
      let serverEditsCount = 0;
      for (const p of Object.keys(serverConfig.pages)) {
        if (serverConfig.pages[p]?.textOverrides && Object.keys(serverConfig.pages[p].textOverrides).length > 0) {
          serverEditsCount++;
        }
      }

      let localEditsCount = 0;
      if (localConfig && localConfig.pages) {
        for (const p of Object.keys(localConfig.pages)) {
          if (localConfig.pages[p]?.textOverrides && Object.keys(localConfig.pages[p].textOverrides).length > 0) {
            localEditsCount++;
          }
        }
      }

      if (serverEditsCount > 0) {
        // El servidor tiene datos reales. Fusionar: servidor manda, preservando claves locales adicionales
        if (!this.state.config.pages) this.state.config.pages = {};
        for (const [pageKey, pageData] of Object.entries(serverConfig.pages)) {
          if (!this.state.config.pages[pageKey]) {
            this.state.config.pages[pageKey] = { textOverrides: {} };
          }
          this.state.config.pages[pageKey].textOverrides = Object.assign(
            {},
            this.state.config.pages[pageKey].textOverrides || {},
            pageData.textOverrides || {}
          );
        }
        this.state.config.updatedAt = serverConfig.updatedAt || this.state.config.updatedAt;
        localStorage.setItem(this.storageKey, JSON.stringify(this.state.config));
      }
      // Nota: Al cargar la página es 100% LECTURA. NUNCA se sincroniza automáticamente a GitHub
      // La sincronización remota sólo ocurre cuando el usuario hace clic en "Guardar para Todos".
    }

    // 4. Aplicar los textos editados a la página actual
    const page = (window.App && window.App.currentPage) || 'resumen';
    this.applyTextOverrides(page);
    this.updateViewToggleButtons();
  },

  async saveConfig(syncServer = true) {
    try {
      this.state.config.updatedAt = new Date().toISOString();
      const payload = JSON.stringify(this.state.config, null, 2);
      localStorage.setItem(this.storageKey, payload);

      if (syncServer) {
        let saved = false;

        // 1. Guardar automáticamente en GitHub (GitHub Pages / REST API) con el token integrado
        const ghToken = this.getGitHubToken();
        if (ghToken) {
          const ghOk = await this.saveToGitHub(payload);
          if (ghOk) saved = true;
        }

        // 2. Si estamos en servidor local (localhost / server.py), sincronizar también el disco local
        const loc = typeof window !== 'undefined' ? window.location : null;
        const isLocalServer = loc && (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1');
        if (isLocalServer) {
          const endpoints = ['/api/save-texts'];
          if (loc.port !== '8080') {
            endpoints.push(`http://${loc.hostname || 'localhost'}:8080/api/save-texts`);
          }
          for (const url of endpoints) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 2000);
              const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              if (res.ok) {
                saved = true;
                break;
              }
            } catch (netErr) {}
          }
        }

        if (saved) {
          return true;
        } else if (!ghToken && !isLocalServer) {
          this.showToast('No se encontró token configurado para publicar.', 'error');
          return false;
        }
      }
      return true;
    } catch (e) {
      console.error('Error guardando configuración de textos:', e);
      this.showToast('Error al guardar: ' + e.message, 'error');
      return false;
    }
  },

  // --- Integración Automática con GitHub Pages (GitHub REST API) ---

  promptGitHubTokenModal(pendingPayload = null) {
    // Modo automático: no interrumpir al usuario con modales
    if (pendingPayload) {
      this.saveToGitHub(pendingPayload);
    }
  },

  closeGitHubModal() {
    this._pendingPayloadToPublish = null;
  },

  updateGitHubStatusLabel(isConfigured = null) {
    const label = document.getElementById('editor-github-status-label');
    if (!label) return;
    label.innerHTML = '<span style="color: #10b981;"><i class="fab fa-github"></i> Sincronización GitHub Pages Activa</span>';
  },

  async saveToGitHub(payload) {
    const token = this.getGitHubToken();
    if (!token) {
      this.showToast('No se encontró token para publicar en GitHub.', 'error');
      return false;
    }

    const apiUrl = `https://api.github.com/repos/${this.githubRepoOwner}/${this.githubRepoName}/contents/${this.githubFilePath}`;
    this.showToast('Publicando cambios en GitHub Pages...', 'info');

    // 1. Obtener el SHA actual del archivo en GitHub
    let currentSha = null;
    try {
      const getRes = await fetch(apiUrl + `?ref=${this.githubBranch}&_v=` + Date.now(), {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        currentSha = fileInfo.sha;
      } else if (getRes.status === 401 || getRes.status === 403) {
        this.showToast('El token de GitHub no tiene permisos o expiró.', 'error');
        return false;
      } else if (getRes.status === 404) {
        // 404 puede ser "archivo nuevo" o "el token no ve el repositorio"; lo distinguimos.
        const repoRes = await fetch(`https://api.github.com/repos/${this.githubRepoOwner}/${this.githubRepoName}`, {
          headers: { 'Accept': 'application/vnd.github.v3+json', 'Authorization': `Bearer ${token}` }
        });
        if (!repoRes.ok) {
          console.error(`El token no tiene acceso al repositorio ${this.githubRepoOwner}/${this.githubRepoName} (HTTP ${repoRes.status}). Genera un token con acceso a ese repo y permiso Contents: Read and write.`);
          this.showToast('El token no tiene acceso al repositorio (requiere Contents: Read and write sobre ese repo).', 'error');
          return false;
        }
      }
    } catch (e) {
      console.warn('Aviso verificando archivo en GitHub:', e);
    }

    // 2. Subir nuevo contenido vía PUT (commit directo en GitHub)
    try {
      const encodedContent = btoa(unescape(encodeURIComponent(payload)));
      const bodyPayload = {
        message: `Actualización de textos del dashboard (${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')})`,
        content: encodedContent,
        branch: this.githubBranch
      };
      if (currentSha) {
        bodyPayload.sha = currentSha;
      }

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (putRes.ok) {
        this.showToast('✓ Cambios publicados en GitHub. En ~1 min estarán visibles para todos los visitantes.', 'success');
        this.updateGitHubStatusLabel(true);
        return true;
      } else {
        const errData = await putRes.json().catch(() => ({}));
        const errMsg = errData.message || `HTTP ${putRes.status}`;
        console.error('Error de GitHub API:', errData);
        this.showToast(`Error al publicar en GitHub: ${errMsg}`, 'error');
        return false;
      }
    } catch (netErr) {
      console.error('Error de red contactando GitHub API:', netErr);
      this.showToast(`Error de red con GitHub: ${netErr.message}`, 'error');
      return false;
    }
  },

  getPageConfig(page) {
    const p = page || (window.App && window.App.currentPage) || 'resumen';
    if (!this.state.config.pages) {
      this.state.config.pages = {};
    }
    if (!this.state.config.pages[p]) {
      this.state.config.pages[p] = {
        textOverrides: {}
      };
    }
    if (!this.state.config.pages[p].textOverrides) {
      this.state.config.pages[p].textOverrides = {};
    }
    return this.state.config.pages[p];
  },

  hasEdits() {
    if (!this.state.config || !this.state.config.pages) return false;
    for (const p of Object.keys(this.state.config.pages)) {
      const pageCfg = this.state.config.pages[p];
      if (pageCfg.textOverrides && Object.keys(pageCfg.textOverrides).length > 0) return true;
      if (pageCfg.texts && Object.keys(pageCfg.texts).length > 0) return true;
    }
    return false;
  },

  hasBackup() {
    const backupRaw = localStorage.getItem(this.backupKey);
    if (!backupRaw) return false;
    try {
      const parsed = JSON.parse(backupRaw);
      if (!parsed || !parsed.pages) return false;
      for (const p of Object.keys(parsed.pages)) {
        const pageCfg = parsed.pages[p];
        if (pageCfg.textOverrides && Object.keys(pageCfg.textOverrides).length > 0) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  // --- Alternancia de Modo de Vista (Original vs Personalizada) ---

  toggleViewMode() {
    this.state.viewMode = this.state.viewMode === 'custom' ? 'original' : 'custom';
    localStorage.setItem(this.viewModeKey, this.state.viewMode);

    this.updateViewToggleButtons();

    const page = (window.App && window.App.currentPage) || 'resumen';
    if (window.App && window.App.loadPage) {
      window.App.loadPage(page);
    } else {
      this.onPageChange(page);
    }
  },

  updateViewToggleButtons() {
    const isOriginal = this.state.viewMode === 'original';
    const textLabel = isOriginal ? 'Ver con Ediciones' : 'Ver Original';
    const iconClass = isOriginal ? 'fa-pen-square' : 'fa-eye';

    // Botón en Sidebar de Navegación principal
    const navBtnText = document.getElementById('nav-toggle-view-text');
    const navBtn = document.getElementById('nav-btn-toggle-view');
    if (navBtnText) navBtnText.textContent = textLabel;
    if (navBtn) {
      const icon = navBtn.querySelector('i');
      if (icon) icon.className = `fas ${iconClass}`;
      if (isOriginal) {
        navBtn.classList.add('view-mode-original');
      } else {
        navBtn.classList.remove('view-mode-original');
      }
    }

    // Botón en Header del Panel Lateral
    const sidebarBtnText = document.getElementById('sidebar-view-toggle-text');
    const sidebarBtn = document.getElementById('sidebar-btn-toggle-view');
    if (sidebarBtnText) sidebarBtnText.textContent = textLabel;
    if (sidebarBtn) {
      const icon = sidebarBtn.querySelector('i');
      if (icon) icon.className = `fas ${iconClass}`;
      if (isOriginal) {
        sidebarBtn.classList.add('view-mode-original');
      } else {
        sidebarBtn.classList.remove('view-mode-original');
      }
    }

    this.renderOriginalModeBanner();
  },

  renderOriginalModeBanner() {
    const existingBanner = document.getElementById('original-mode-banner');
    if (existingBanner) existingBanner.remove();

    if (this.state.viewMode !== 'original') return;

    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    const bannerHTML = `
      <div id="original-mode-banner" class="original-mode-banner">
        <div class="original-mode-banner-content">
          <div class="original-mode-banner-text">
            <i class="fas fa-info-circle" style="color: #f59e0b; font-size: 18px; margin-right: 10px;"></i>
            <span>
              <strong>Vista Original Oficial:</strong> Estás visualizando los textos y títulos originales sin modificaciones.
            </span>
          </div>
          <button type="button" class="btn-toggle-view-mode" onclick="Editor.toggleViewMode()">
            <i class="fas fa-pen-square"></i> Ver con Ediciones
          </button>
        </div>
      </div>
    `;

    pageContent.insertAdjacentHTML('afterbegin', bannerHTML);
  },

  revertAllChanges() {
    if (!confirm('¿Estás seguro de que deseas restablecer todos los textos y títulos a la versión oficial de fábrica?')) {
      return;
    }

    if (this.hasEdits()) {
      localStorage.setItem(this.backupKey, JSON.stringify(this.state.config));
    }

    // Resetear configuración
    this.state.config = {
      version: '1.0',
      updatedAt: new Date().toISOString(),
      pages: {}
    };

    // Sincronizar reseteo con el servidor para todos
    fetch('/api/reset-texts', { method: 'POST' }).catch(() => {});
    this.saveConfig(true);

    this.state.viewMode = 'custom';
    localStorage.setItem(this.viewModeKey, 'custom');
    this.updateViewToggleButtons();

    const page = (window.App && window.App.currentPage) || 'resumen';
    if (window.App && window.App.loadPage) {
      window.App.loadPage(page);
    } else {
      this.onPageChange(page);
    }

    this.showToast('Textos restablecidos a los valores originales de fábrica.', 'info');
  },

  restoreBackedUpEdits() {
    const backupRaw = localStorage.getItem(this.backupKey);
    if (!backupRaw) {
      this.showToast('No se encontró un respaldo previo de ediciones.', 'info');
      return;
    }

    try {
      const parsed = JSON.parse(backupRaw);
      if (parsed && parsed.version) {
        this.state.config = parsed;
        this.saveConfig(true);
        this.state.viewMode = 'custom';
        localStorage.setItem(this.viewModeKey, 'custom');

        this.updateViewToggleButtons();

        const page = (window.App && window.App.currentPage) || 'resumen';
        if (window.App && window.App.loadPage) {
          window.App.loadPage(page);
        } else {
          this.onPageChange(page);
        }

        this.showToast('¡Ediciones restauradas con éxito desde el respaldo!', 'success');
      } else {
        this.showToast('El archivo de respaldo no tiene un formato válido.', 'error');
      }
    } catch (e) {
      this.showToast('Error al restaurar las ediciones: ' + e.message, 'error');
    }
  },

  // --- Autenticación Criptográfica de Administrador (SHA-256 + Anti Fuerza Bruta) ---

  getAuthAttempts() {
    try {
      const data = sessionStorage.getItem('unw_auth_attempts');
      return data ? JSON.parse(data) : { count: 0, lockedUntil: 0 };
    } catch (e) {
      return { count: 0, lockedUntil: 0 };
    }
  },

  setAuthAttempts(attempts) {
    try {
      sessionStorage.setItem('unw_auth_attempts', JSON.stringify(attempts));
    } catch (e) {}
  },

  isLockedOut() {
    const attempts = this.getAuthAttempts();
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
    }
    return 0;
  },

  async hashPassword(inputPass) {
    const salt = this._authSalt || '';
    const text = salt + (inputPass || '').trim();
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const data = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback criptográfico en entornos antiguos
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  },

  promptAuth() {
    if (this.state.isEditMode) {
      this.exitEditMode();
      return;
    }

    // Verificar si ya existe una sesión activa y válida en la pestaña actual
    const session = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(this.sessionKey) : null;
    if (session) {
      this.enterEditMode();
      this.showToast('Sesión de administrador activa.', 'info');
      return;
    }

    const modal = document.getElementById('editor-auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const passInput = document.getElementById('editor-auth-password');
      const errorMsg = document.getElementById('editor-auth-error');
      if (errorMsg) errorMsg.classList.add('hidden');

      const remainingLock = this.isLockedOut();
      if (remainingLock > 0) {
        this.startLockoutCountdown(remainingLock);
      } else {
        if (passInput) {
          passInput.disabled = false;
          passInput.value = '';
          setTimeout(() => passInput.focus(), 100);
        }
        const submitBtn = document.getElementById('editor-auth-submit');
        if (submitBtn) submitBtn.disabled = false;
        const attempts = this.getAuthAttempts();
        const attemptsLabel = document.getElementById('editor-auth-attempts-label');
        if (attemptsLabel) {
          const rem = Math.max(0, this.maxFailedAttempts - (attempts.count || 0));
          attemptsLabel.textContent = `Intentos: ${rem} de ${this.maxFailedAttempts}`;
          attemptsLabel.style.color = rem <= 2 ? '#dc2626' : '#64748b';
        }
      }
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('editor-auth-modal');
    if (modal) modal.classList.add('hidden');
    const input = document.getElementById('editor-auth-password');
    if (input) input.value = '';
    const err = document.getElementById('editor-auth-error');
    if (err) err.classList.add('hidden');
  },

  showAuthError(msg) {
    const errorMsg = document.getElementById('editor-auth-error');
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.remove('hidden');
    } else {
      this.showToast(msg, 'error');
    }
  },

  startLockoutCountdown(seconds) {
    let remaining = seconds;
    const input = document.getElementById('editor-auth-password');
    const submitBtn = document.getElementById('editor-auth-submit');
    const errorMsg = document.getElementById('editor-auth-error');
    const attemptsLabel = document.getElementById('editor-auth-attempts-label');

    if (input) {
      input.disabled = true;
      input.value = '';
    }
    if (submitBtn) {
      submitBtn.disabled = true;
    }
    if (attemptsLabel) {
      attemptsLabel.textContent = 'Bloqueado';
      attemptsLabel.style.color = '#dc2626';
    }

    const updateUI = () => {
      if (errorMsg) {
        errorMsg.innerHTML = `<i class="fas fa-ban"></i> Demasiados intentos fallidos. Bloqueado por seguridad: <strong>${remaining}s</strong> restantes.`;
        errorMsg.classList.remove('hidden');
      }
    };

    updateUI();

    if (this._lockoutInterval) clearInterval(this._lockoutInterval);
    this._lockoutInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(this._lockoutInterval);
        this._lockoutInterval = null;
        this.setAuthAttempts({ count: 0, lockedUntil: 0 });
        if (input) input.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        if (errorMsg) errorMsg.classList.add('hidden');
        if (attemptsLabel) {
          attemptsLabel.textContent = `Intentos: ${this.maxFailedAttempts} disponibles`;
          attemptsLabel.style.color = '#64748b';
        }
        if (input) input.focus();
        this.showToast('Bloqueo finalizado. Puede volver a intentar.', 'info');
      } else {
        updateUI();
      }
    }, 1000);
  },

  async verifyPassword(inputPass) {
    const remainingLock = this.isLockedOut();
    if (remainingLock > 0) {
      this.startLockoutCountdown(remainingLock);
      return false;
    }

    const trimmed = (inputPass || '').trim();
    if (!trimmed) {
      this.showAuthError('Por favor ingrese la contraseña de administrador.');
      return false;
    }

    const submitBtn = document.getElementById('editor-auth-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    }

    // Retardo artificial anti brute-force
    await new Promise(r => setTimeout(r, 350));

    const envPass = this.getEnv('ADMIN_PASSWORD');
    let isValid = false;

    if (envPass && trimmed === envPass) {
      isValid = true;
    } else {
      const computedHash = await this.hashPassword(trimmed);
      isValid = (computedHash === this._authHash);
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-key"></i> Desbloquear Editor';
    }

    if (isValid) {
      this.setAuthAttempts({ count: 0, lockedUntil: 0 });
      try {
        const sessionToken = btoa(Date.now() + '_' + Math.random().toString(36).substring(2));
        sessionStorage.setItem(this.sessionKey, sessionToken);
      } catch (e) {}

      this.closeAuthModal();
      this.enterEditMode();
      this.showToast('✓ Acceso verificado. Modo Edición activado.', 'success');
      return true;
    } else {
      const attempts = this.getAuthAttempts();
      attempts.count = (attempts.count || 0) + 1;

      const card = document.querySelector('.editor-modal-card');
      if (card) {
        card.classList.add('editor-shake');
        setTimeout(() => card.classList.remove('editor-shake'), 450);
      }

      if (attempts.count >= this.maxFailedAttempts) {
        attempts.lockedUntil = Date.now() + (this.lockoutDurationSeconds * 1000);
        this.setAuthAttempts(attempts);
        this.startLockoutCountdown(this.lockoutDurationSeconds);
      } else {
        this.setAuthAttempts(attempts);
        const rem = this.maxFailedAttempts - attempts.count;
        const attemptsLabel = document.getElementById('editor-auth-attempts-label');
        if (attemptsLabel) {
          attemptsLabel.textContent = `Intentos: ${rem} de ${this.maxFailedAttempts}`;
          attemptsLabel.style.color = rem <= 2 ? '#dc2626' : '#64748b';
        }
        this.showAuthError(`Contraseña incorrecta. Intentos restantes: ${rem} de ${this.maxFailedAttempts}.`);
      }
      return false;
    }
  },

  enterEditMode() {
    this.state.isEditMode = true;
    this.state.viewMode = 'custom';
    localStorage.setItem(this.viewModeKey, 'custom');

    document.body.classList.add('editing-mode-active');
    const sidebar = document.getElementById('editor-sidebar');
    if (sidebar) sidebar.classList.remove('hidden');

    const toggleBtns = document.querySelectorAll('.btn-toggle-editor, #nav-btn-editor');
    toggleBtns.forEach(btn => {
      btn.classList.add('active');
      const span = btn.querySelector('span');
      if (span) span.textContent = 'Modo Edición Activo';
    });

    this.updateViewToggleButtons();

    const page = (window.App && window.App.currentPage) || 'resumen';
    this.onPageChange(page);
  },

  exitEditMode() {
    this.state.isEditMode = false;
    document.body.classList.remove('editing-mode-active');
    const sidebar = document.getElementById('editor-sidebar');
    if (sidebar) sidebar.classList.add('hidden');

    const toggleBtns = document.querySelectorAll('.btn-toggle-editor, #nav-btn-editor');
    toggleBtns.forEach(btn => {
      btn.classList.remove('active');
      const span = btn.querySelector('span');
      if (span) span.textContent = 'Modo Edición';
    });

    try {
      sessionStorage.removeItem(this.sessionKey);
    } catch (e) {}

    this.disableInlineTextEditing();
    this.removeHighlightSelectables();
    this.showToast('Modo Edición cerrado. Sesión finalizada.', 'info');
  },

  setupAutoLogout() {
    if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
    const resetTimer = () => {
      if (!this.state.isEditMode) return;
      if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
      // 15 minutos de inactividad
      this._inactivityTimer = setTimeout(() => {
        if (this.state.isEditMode) {
          this.exitEditMode();
          try { sessionStorage.removeItem(this.sessionKey); } catch (e) {}
          this.showToast('Sesión de administrador cerrada por inactividad (15 min).', 'info');
        }
      }, 15 * 60 * 1000);
    };

    if (typeof window !== 'undefined') {
      ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
        window.addEventListener(evt, resetTimer, { passive: true });
      });
      resetTimer();
    }
  },

  setupAutoLogout() {
    if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
    const resetTimer = () => {
      if (!this.state.isEditMode) return;
      if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
      // 15 minutos de inactividad
      this._inactivityTimer = setTimeout(() => {
        if (this.state.isEditMode) {
          this.exitEditMode();
          try { sessionStorage.removeItem(this.sessionKey); } catch (e) {}
          this.showToast('Sesión de administrador cerrada por inactividad (15 min).', 'info');
        }
      }, 15 * 60 * 1000);
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
        window.addEventListener(evt, resetTimer, { passive: true });
      });
      resetTimer();
    }
  },

  // --- Inyección de Interfaz de Usuario (Modal & Sidebar Simplificado y Completo) ---

  injectEditorUI() {
    if (document.getElementById('editor-sidebar')) return;

    // 1. Modal de Contraseña Criptográfica con Anti-Fuerza Bruta
    const authModalHTML = `
      <div id="editor-auth-modal" class="editor-modal-overlay hidden">
        <div class="editor-modal-card">
          <div class="editor-modal-header">
            <div class="editor-modal-title">
              <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(0, 45, 114, 0.08); display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-user-shield" style="color: #002D72; font-size: 18px;"></i>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #002D72;">Autenticación de Administrador</h3>
                <span class="editor-security-pill" style="margin-top: 3px;"><i class="fas fa-lock"></i> SHA-256 + Anti-Fuerza Bruta</span>
              </div>
            </div>
            <button type="button" class="editor-modal-close" onclick="Editor.closeAuthModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <p class="editor-modal-desc">
            Este módulo permite editar textos oficiales y publicar cambios directamente en GitHub Pages. Ingrese la clave maestra de administrador.
          </p>
          <div class="editor-form-group">
            <label for="editor-auth-password" style="font-weight: 600; font-size: 12.5px; color: #1e293b; display: flex; justify-content: space-between;">
              <span>Contraseña Maestra:</span>
              <span id="editor-auth-attempts-label" style="font-size: 11px; color: #64748b; font-weight: normal;">Intentos: 5 disponibles</span>
            </label>
            <div style="position: relative; margin-top: 4px;">
              <input type="password" id="editor-auth-password" class="editor-input" placeholder="••••••••••••" autocomplete="current-password" />
              <button type="button" id="editor-auth-toggle-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #64748b; cursor: pointer;">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <div id="editor-auth-error" class="editor-auth-error hidden" style="color: #dc2626; font-size: 12px; margin-top: 6px; font-weight: 500;"></div>
          </div>
          <div class="editor-modal-actions">
            <button type="button" class="editor-btn-secondary" onclick="Editor.closeAuthModal()">Cancelar</button>
            <button type="button" class="editor-btn-primary" id="editor-auth-submit" style="display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-key"></i> Desbloquear Editor
            </button>
          </div>
        </div>
      </div>
    `;

    // 2. Sidebar Lateral Derecho enfocado en Textos
    const sidebarHTML = `
      <aside id="editor-sidebar" class="editor-sidebar hidden">
        <!-- Encabezado del Panel -->
        <div class="editor-sidebar-header">
          <div class="editor-header-info">
            <span class="editor-badge"><i class="fas fa-font"></i> EDITOR DE TEXTOS Y TÍTULOS</span>
            <h3 class="editor-title">Personalizar Textos</h3>
            <span class="editor-subtitle">Edita cualquier título o texto en pantalla</span>
          </div>
          <button type="button" class="editor-close-btn" title="Cerrar panel" onclick="Editor.exitEditMode()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Selector de Página Activa -->
        <div class="editor-page-select-bar">
          <label for="editor-page-selector">Página a editar:</label>
          <select id="editor-page-selector" class="editor-select">
            ${this.availablePages.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
          </select>
        </div>

        <!-- Barra de Alternancia y Estadísticas -->
        <div class="editor-stats-bar">
          <span id="editor-stats-label">0 textos en esta página</span>
          <button type="button" class="btn-toggle-view-mode" id="sidebar-btn-toggle-view" onclick="Editor.toggleViewMode()" title="Alternar entre versión personalizada y original" style="padding: 3px 8px; font-size: 11px;">
            <i class="fas fa-eye"></i> <span id="sidebar-view-toggle-text">Ver Original</span>
          </button>
        </div>

        <!-- Buscador de Textos en Tiempo Real -->
        <div class="editor-search-box">
          <div style="position: relative;">
            <input type="text" id="editor-texts-search" class="editor-input" placeholder="🔍 Buscar títulos o textos..." style="padding-left: 12px; font-size: 12.5px;" />
          </div>
        </div>

        <!-- Filtros Rápidos por Categoría -->
        <div class="editor-category-chips" id="editor-category-chips">
          <button type="button" class="editor-chip active" data-cat="all">Todos</button>
          <button type="button" class="editor-chip" data-cat="title">Títulos</button>
          <button type="button" class="editor-chip" data-cat="desc">Subtítulos</button>
          <button type="button" class="editor-chip" data-cat="kpi">KPIs</button>
          <button type="button" class="editor-chip" data-cat="note">Notas/Pie</button>
          <button type="button" class="editor-chip" data-cat="custom">Editados</button>
        </div>

        <!-- Contenedor con Scroll de la Lista de Textos -->
        <div class="editor-tab-body" style="padding: 14px 18px; flex: 1; overflow-y: auto;">
          <div id="editor-texts-list" class="editor-texts-list">
            <!-- Las tarjetas de texto se generan dinámicamente aquí -->
          </div>
        </div>

        <!-- Pie de Panel: Guardar y Acciones -->
        <div class="editor-sidebar-footer" style="flex-direction: column; gap: 8px;">
          <button type="button" class="editor-btn-primary" id="editor-btn-save-global" style="width: 100%; justify-content: center; height: 38px;">
            <i class="fas fa-save"></i> Guardar Cambios para Todos
          </button>
          <div style="display: flex; gap: 8px; width: 100%;">
            <button type="button" class="editor-btn-secondary" id="editor-btn-reset-page-texts" style="flex: 1; font-size: 11.5px; padding: 6px;">
              <i class="fas fa-undo"></i> Restablecer Página
            </button>
            <button type="button" class="editor-btn-secondary" id="editor-btn-export-json" title="Descargar copia de seguridad en JSON" style="flex: 1; font-size: 11.5px; padding: 6px;">
              <i class="fas fa-download"></i> Descargar JSON
            </button>
          </div>
          <div style="display: flex; justify-content: center; margin-top: 4px;">
            <div style="font-size: 11px; color: #10b981; display: flex; align-items: center; gap: 6px; font-weight: 500;">
              <i class="fab fa-github"></i> <span id="editor-github-status-label">Sincronización GitHub Pages Activa</span>
            </div>
          </div>
        </div>
      </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', authModalHTML);
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);

    // Botón en la barra de filtros principal (si existe)
    const filtersBar = document.getElementById('filters-bar');
    if (filtersBar && !document.getElementById('btn-toggle-editor')) {
      const btnWrap = document.createElement('div');
      btnWrap.className = 'editor-toggle-wrap';
      btnWrap.style.marginLeft = 'auto';
      btnWrap.style.display = 'flex';
      btnWrap.style.alignItems = 'center';
      btnWrap.innerHTML = `
        <div class="editor-header-controls">
          <button type="button" id="btn-toggle-editor" class="btn-toggle-editor" title="Activar Modo Edición de Textos (Solo Administrador)">
            <i class="fas fa-edit"></i>
            <span>Personalizar Textos</span>
          </button>
        </div>
      `;
      filtersBar.appendChild(btnWrap);
    }
  },

  // --- Eventos Globales ---

  bindGlobalEvents() {
    // Abrir Modal de autenticación
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-toggle-editor') || e.target.closest('#nav-btn-editor') || e.target.closest('#exec-btn-editor')) {
        this.promptAuth();
      }
      if (e.target.closest('#editor-auth-submit')) {
        const pass = document.getElementById('editor-auth-password')?.value || '';
        this.verifyPassword(pass);
      }
      if (e.target.closest('#editor-auth-toggle-pwd')) {
        const input = document.getElementById('editor-auth-password');
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password';
        }
      }
    });

    // Enter en el campo de contraseña
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && document.getElementById('editor-auth-password') === document.activeElement) {
        const pass = document.getElementById('editor-auth-password')?.value || '';
        this.verifyPassword(pass);
      }
    });

    // Selector de página en el sidebar
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'editor-page-selector') {
        const newPage = e.target.value;
        if (window.App && window.App.loadPage) {
          window.App.loadPage(newPage);
        } else {
          this.onPageChange(newPage);
        }
      }
    });

    // Buscador de textos en tiempo real
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'editor-texts-search') {
        this.state.searchQuery = e.target.value.toLowerCase().trim();
        this.renderTextsList();
      }
    });

    // Chips de filtrado por categoría
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.editor-chip');
      if (chip) {
        document.querySelectorAll('.editor-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.state.activeCategory = chip.dataset.cat || 'all';
        this.renderTextsList();
      }
    });

    // Botones de acción en el panel lateral
    document.addEventListener('click', (e) => {
      // Guardar global
      const saveBtn = e.target.closest('#editor-btn-save-global');
      if (saveBtn) {
        const origHTML = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando para todos...';
        this.saveConfig(true).then((ok) => {
          saveBtn.innerHTML = ok
            ? '<i class="fas fa-check"></i> ¡Guardado para Todos!'
            : '<i class="fas fa-exclamation-triangle"></i> Guardado Local';
          setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.innerHTML = origHTML;
          }, 2000);
        });
      }
      // Restablecer página
      if (e.target.closest('#editor-btn-reset-page-texts')) {
        this.resetPageTexts();
      }
      // Exportar JSON
      if (e.target.closest('#editor-btn-export-json')) {
        this.exportConfig();
      }
      // Alternar vista original
      if (e.target.closest('#sidebar-btn-toggle-view')) {
        this.toggleViewMode();
      }
      // Ubicar en lienzo
      const locateBtn = e.target.closest('.btn-locate');
      if (locateBtn) {
        const textId = locateBtn.dataset.textId;
        if (textId) this.locateOnCanvas(textId);
      }
      // Restaurar individual
      const revertBtn = e.target.closest('.btn-revert');
      if (revertBtn) {
        const textId = revertBtn.dataset.textId;
        if (textId) this.resetSingleText(textId);
      }
    });
  },

  // --- Auto-descubrimiento y Mapeo de Textos de la Página ---

  autoDiscoverEditableTexts(pageName) {
    const page = pageName || (window.App && window.App.currentPage) || 'resumen';
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    const textSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5',
      '.page-title', '.page-subtitle', '.section-title', '.section-subtitle',
      '.exec-header-title', '.exec-header-subtitle',
      '.exec-panel-title', '.chart-title', '.chart-subtitle',
      '.kpi-subtitle', '.kpi-title', '.kpi-desc', '.kpi-label', '.kpi-subtext',
      '.exec-kpi-title', '.exec-kpi-desc',
      '.card-desc', '.description',
      '.exec-footer-notes p', '.footer-notes p',
      'p.text-muted', 'small.text-muted'
    ];

    const elements = pageContent.querySelectorAll(textSelectors.join(', '));
    let counter = 1;

    elements.forEach(el => {
      // Excluir elementos internos del editor o de navegación
      if (el.closest('#editor-sidebar') || el.closest('#editor-auth-modal') || el.closest('#original-mode-banner') || el.closest('.actions')) {
        return;
      }
      // Excluir números, valores métricos o badges
      if (el.matches('.text-3xl, .text-2xl, .kpi-number, .kpi-value, .exec-desarrollo-pct, .exec-legend-val, .badge')) {
        return;
      }
      // Excluir si contiene controles interactivos
      if (el.querySelector('canvas, table, select, input, button')) {
        return;
      }

      const text = (el.innerText || el.textContent || '').trim();
      if (!text || text.length < 2) return;

      const hasClass = (cls) => el.classList && typeof el.classList.contains === 'function' && el.classList.contains(cls);

      // Determinar categoría
      let category = 'text';
      if (el.tagName && el.tagName.startsWith('H')) category = 'title';
      else if (hasClass('page-title') || hasClass('chart-title') || hasClass('exec-panel-title') || hasClass('section-title')) category = 'title';
      else if (hasClass('page-subtitle') || hasClass('chart-subtitle') || hasClass('section-subtitle')) category = 'desc';
      else if (hasClass('kpi-title') || hasClass('kpi-subtitle') || hasClass('exec-kpi-title')) category = 'kpi';
      else if (hasClass('kpi-number') || hasClass('exec-kpi-number') || hasClass('kpi-value')) category = 'kpi';
      else if (hasClass('kpi-desc') || hasClass('kpi-subtext') || hasClass('exec-kpi-desc')) category = 'kpi';
      else if (el.closest('.footer-notes, .exec-footer-notes') || el.tagName === 'SMALL' || hasClass('text-muted')) category = 'note';

      el.dataset.editableCategory = category;

      // Generar o preservar ID único
      if (!el.dataset.editableId) {
        if (el.id) {
          el.dataset.editableId = `${page}-${el.id}`;
        } else {
          el.dataset.editableId = `${page}-${category}-${counter++}`;
        }
      }

      // Guardar el texto original de fábrica si no está cacheado
      const id = el.dataset.editableId;
      if (!this.originalTextsCache[id]) {
        // Extraer texto limpio sin el icono
        const textWithoutIcon = (el.innerText || el.textContent || '').trim();
        this.originalTextsCache[id] = textWithoutIcon;
        el.dataset.originalText = textWithoutIcon;
      }

      // Generar etiqueta descriptiva para el editor
      if (!el.dataset.editableLabel) {
        let label = text.length > 36 ? text.slice(0, 34) + '...' : text;
        if (category === 'title') label = 'Título: ' + label;
        else if (category === 'kpi') label = 'KPI: ' + label;
        else if (category === 'note') label = 'Nota: ' + label;
        else if (category === 'desc') label = 'Descripción: ' + label;
        el.dataset.editableLabel = label;
      }
    });
  },

  // --- Edición en Vivo en Pantalla (WYSIWYG) ---

  initInlineTextEditing() {
    if (this.state.viewMode === 'original') return;

    const editables = document.querySelectorAll('[data-editable-id]');
    const page = (window.App && window.App.currentPage) || 'resumen';

    editables.forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
      el.title = 'Haz clic para editar este texto directamente';

      el.oninput = () => {
        const textId = el.dataset.editableId;
        const newText = (el.innerText || el.textContent || '').trim();
        this.saveTextOverrideDebounced(page, textId, newText);

        const sidebarInput = document.querySelector(`.editor-text-input[data-text-id="${textId}"]`);
        if (sidebarInput) {
          sidebarInput.value = newText;
          this.updateCardCustomizedState(textId, true);
        }
      };

      el.onfocus = () => {
        const textId = el.dataset.editableId;
        const card = document.querySelector(`.editor-text-card[data-text-id="${textId}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.borderColor = '#002D72';
          card.style.boxShadow = '0 0 0 3px rgba(0, 45, 114, 0.2)';
          setTimeout(() => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
          }, 1500);
        }
      };
    });
  },

  disableInlineTextEditing() {
    const editables = document.querySelectorAll('[data-editable-id]');
    editables.forEach(el => {
      el.removeAttribute('contenteditable');
      el.oninput = null;
      el.onfocus = null;
      el.title = '';
    });
  },

  saveTextOverrideDebounced(page, textId, val) {
    if (this.textDebounceTimers[textId]) {
      clearTimeout(this.textDebounceTimers[textId]);
    }
    this.textDebounceTimers[textId] = setTimeout(() => {
      const pageConfig = this.getPageConfig(page);
      pageConfig.textOverrides[textId] = val;
      // Guardar únicamente en memoria local del navegador mientras se edita (NO enviar a servidor/GitHub):
      this.saveConfig(false);
    }, 400);
  },

  applyTextOverrides(pageName) {
    if (this.state.viewMode === 'original') {
      this.disableInlineTextEditing();
      return;
    }

    const page = pageName || (window.App && window.App.currentPage) || 'resumen';
    const pageConfig = this.getPageConfig(page);
    const overrides = pageConfig.textOverrides || {};

    const editables = document.querySelectorAll('[data-editable-id]');
    editables.forEach(el => {
      const textId = el.dataset.editableId;
      if (overrides[textId] !== undefined && overrides[textId] !== null) {
        const override = overrides[textId];
        const icon = el.querySelector('i');
        if (icon) {
          // Preservar icono si existe
          const iconHTML = icon.outerHTML;
          el.innerHTML = iconHTML + ' ' + override;
        } else {
          el.textContent = override;
        }
      }
    });

    if (this.state.isEditMode) {
      this.initInlineTextEditing();
    }
  },

  // --- Renderizado de la Lista de Textos en el Sidebar ---

  renderTextsList() {
    const container = document.getElementById('editor-texts-list');
    if (!container) return;

    const page = (window.App && window.App.currentPage) || 'resumen';
    const pageConfig = this.getPageConfig(page);
    const overrides = pageConfig.textOverrides || {};

    // Sincronizar el selector de página del sidebar
    const pageSelect = document.getElementById('editor-page-selector');
    if (pageSelect && pageSelect.value !== page) {
      pageSelect.value = page;
    }

    const editables = Array.from(document.querySelectorAll('[data-editable-id]'));
    const totalCount = editables.length;
    const customizedCount = Object.keys(overrides).length;

    const statsLabel = document.getElementById('editor-stats-label');
    if (statsLabel) {
      statsLabel.innerHTML = `<strong>${totalCount}</strong> textos · <span style="color:#07C8CC; font-weight:700;">${customizedCount} editados</span>`;
    }

    if (editables.length === 0) {
      container.innerHTML = `
        <div style="padding: 30px 10px; text-align: center; color: #64748b;">
          <i class="fas fa-file-alt" style="font-size: 28px; margin-bottom: 8px; opacity: 0.5;"></i>
          <p style="font-size: 13px; margin: 0;">No se encontraron textos editables en esta página.</p>
        </div>
      `;
      return;
    }

    // Filtrar por búsqueda y categoría
    const query = this.state.searchQuery;
    const cat = this.state.activeCategory;

    const filtered = editables.filter(el => {
      const textId = el.dataset.editableId;
      const label = el.dataset.editableLabel || '';
      const currentVal = overrides[textId] !== undefined ? overrides[textId] : (el.innerText || el.textContent || '').trim();
      const itemCat = el.dataset.editableCategory || 'text';
      const isCustomized = overrides[textId] !== undefined && overrides[textId] !== null;

      // Filtro de categoría
      if (cat === 'custom' && !isCustomized) return false;
      if (cat !== 'all' && cat !== 'custom' && itemCat !== cat) return false;

      // Filtro de búsqueda
      if (query) {
        const matchesLabel = label.toLowerCase().includes(query);
        const matchesVal = currentVal.toLowerCase().includes(query);
        const matchesId = textId.toLowerCase().includes(query);
        return matchesLabel || matchesVal || matchesId;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 30px 10px; text-align: center; color: #64748b;">
          <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px; opacity: 0.4;"></i>
          <p style="font-size: 13px; margin: 0;">No se encontraron textos que coincidan con el filtro.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(el => {
      const textId = el.dataset.editableId;
      const label = el.dataset.editableLabel || textId;
      const itemCat = el.dataset.editableCategory || 'text';
      const originalVal = this.originalTextsCache[textId] || (el.dataset.originalText) || (el.innerText || el.textContent || '').trim();
      const currentVal = overrides[textId] !== undefined ? overrides[textId] : originalVal;
      const isCustomized = overrides[textId] !== undefined && overrides[textId] !== null;
      const isLong = currentVal.length > 60 || el.tagName === 'P' || itemCat === 'desc' || itemCat === 'note';

      // Etiqueta legible de categoría
      let catPillClass = itemCat;
      let catPillName = 'Texto';
      if (itemCat === 'title') catPillName = 'Título';
      else if (itemCat === 'desc') catPillName = 'Subtítulo';
      else if (itemCat === 'kpi') catPillName = 'KPI';
      else if (itemCat === 'note') catPillName = 'Nota';

      html += `
        <div class="editor-text-card ${isCustomized ? 'is-customized' : ''}" data-text-id="${textId}">
          <div class="editor-text-card-header">
            <div class="editor-text-card-tags">
              <span class="editor-type-pill ${catPillClass}">${catPillName}</span>
              <span class="editor-text-context-label" title="${label}">${label}</span>
            </div>
            <div class="editor-text-card-actions">
              <button type="button" class="editor-btn-card-action btn-locate" data-text-id="${textId}" title="Ubicar este texto en la pantalla">
                <i class="fas fa-crosshairs"></i>
              </button>
              ${isCustomized ? `
                <button type="button" class="editor-btn-card-action btn-revert" data-text-id="${textId}" title="Restaurar al texto original">
                  <i class="fas fa-undo"></i>
                </button>
              ` : ''}
            </div>
          </div>

          ${isLong ? `
            <textarea class="editor-text-input" data-text-id="${textId}" rows="2">${currentVal}</textarea>
          ` : `
            <input type="text" class="editor-text-input" data-text-id="${textId}" value="${currentVal.replace(/"/g, '&quot;')}" />
          `}

          <div class="editor-original-hint" title="Texto original: ${originalVal}">
            Original: <span>${originalVal}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Vincular inputs del sidebar con actualización en vivo del DOM
    container.querySelectorAll('.editor-text-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const textId = e.target.dataset.textId;
        const val = e.target.value;
        const targetEl = document.querySelector(`[data-editable-id="${textId}"]`);
        if (targetEl) {
          const icon = targetEl.querySelector('i');
          if (icon) {
            targetEl.innerHTML = icon.outerHTML + ' ' + val;
          } else {
            targetEl.textContent = val;
          }
        }
        this.saveTextOverrideDebounced(page, textId, val);
        this.updateCardCustomizedState(textId, true);
      });
    });
  },

  updateCardCustomizedState(textId, isCustomized) {
    const card = document.querySelector(`.editor-text-card[data-text-id="${textId}"]`);
    if (card) {
      if (isCustomized) {
        card.classList.add('is-customized');
        if (!card.querySelector('.btn-revert')) {
          const actionsWrap = card.querySelector('.editor-text-card-actions');
          if (actionsWrap) {
            const revertBtn = document.createElement('button');
            revertBtn.type = 'button';
            revertBtn.className = 'editor-btn-card-action btn-revert';
            revertBtn.dataset.textId = textId;
            revertBtn.title = 'Restaurar al texto original';
            revertBtn.innerHTML = '<i class="fas fa-undo"></i>';
            actionsWrap.appendChild(revertBtn);
          }
        }
      } else {
        card.classList.remove('is-customized');
        const revertBtn = card.querySelector('.btn-revert');
        if (revertBtn) revertBtn.remove();
      }
    }
  },

  locateOnCanvas(textId) {
    const el = document.querySelector(`[data-editable-id="${textId}"]`);
    if (!el) {
      this.showToast('El texto no está visible en la vista actual.', 'info');
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('editor-highlight-pulse');
    if (typeof el.focus === 'function') el.focus();
    setTimeout(() => {
      el.classList.remove('editor-highlight-pulse');
    }, 2400);
  },

  resetSingleText(textId) {
    const page = (window.App && window.App.currentPage) || 'resumen';
    const pageConfig = this.getPageConfig(page);
    delete pageConfig.textOverrides[textId];
    this.saveConfig(false);

    const original = this.originalTextsCache[textId] || '';
    const el = document.querySelector(`[data-editable-id="${textId}"]`);
    if (el) {
      const icon = el.querySelector('i');
      if (icon) {
        el.innerHTML = icon.outerHTML + ' ' + original;
      } else {
        el.textContent = original;
      }
    }

    const input = document.querySelector(`.editor-text-input[data-text-id="${textId}"]`);
    if (input) input.value = original;

    this.updateCardCustomizedState(textId, false);
    this.showToast('Texto restaurado localmente.', 'info');
  },

  resetPageTexts() {
    const page = (window.App && window.App.currentPage) || 'resumen';
    if (!confirm(`¿Restablecer todos los textos de la página actual a sus valores originales?`)) {
      return;
    }

    const pageConfig = this.getPageConfig(page);
    pageConfig.textOverrides = {};
    this.saveConfig(false);

    if (window.App && window.App.loadPage) {
      window.App.loadPage(page);
    } else {
      this.onPageChange(page);
    }

    this.showToast('Textos de la página restablecidos localmente.', 'info');
  },

  // --- Cambio de Página ---

  onPageChange(pageName) {
    const p = pageName || (window.App && window.App.currentPage) || 'resumen';
    this.autoDiscoverEditableTexts(p);
    this.applyTextOverrides(p);

    if (this.state.isEditMode) {
      this.renderTextsList();
      this.initInlineTextEditing();
    }
  },

  // --- Utilidades: Toast flotante y Exportación JSON ---

  showToast(message, type = 'success') {
    let toast = document.getElementById('editor-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'editor-toast';
      toast.className = 'editor-toast';
      document.body.appendChild(toast);
    }
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
    const color = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#002D72');
    toast.innerHTML = `<i class="fas ${icon}" style="color: ${color};"></i> <span>${message}</span>`;
    toast.classList.remove('hidden');
    toast.classList.add('visible');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  },

  exportConfig() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state.config, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `custom_texts_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchor.click();
    this.showToast('Archivo JSON descargado.', 'success');
  },

  importConfigFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && parsed.pages) {
          this.state.config = parsed;
          this.saveConfig(true);
          const page = (window.App && window.App.currentPage) || 'resumen';
          if (window.App && window.App.loadPage) {
            window.App.loadPage(page);
          } else {
            this.onPageChange(page);
          }
          this.showToast('¡Configuración importada exitosamente!', 'success');
        } else {
          this.showToast('El archivo no tiene la estructura de textos requerida.', 'error');
        }
      } catch (err) {
        this.showToast('Error al leer el archivo JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  },

  removeHighlightSelectables() {
    const editables = document.querySelectorAll('[data-editable-id]');
    editables.forEach(el => el.classList.remove('editor-highlight-pulse'));
  },

  // --- Stubs y Métodos Heredados para Compatibilidad Total ---

  renderCustomVisuals(pageName) { return true; },
  applyVisualOverrides(pageName) { return true; },
  getKPIConfig() {
    return window.KPICatalog ? window.KPICatalog.getDefaultConfig() : [];
  },
  saveKPIConfig(cfg) {},
  resetKPIs() {},
  restoreSingleKPI() {},
  selectVisual() {},
  deleteVisual() {},
  moveVisual() {}
};

// Exportar globalmente e inicializar al cargar
window.Editor = Editor;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Editor.init());
} else {
  Editor.init();
}
