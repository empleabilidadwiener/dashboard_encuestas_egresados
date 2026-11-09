const Charts = {
  instances: {},

  // Wait for Chart.js CDN to be ready (retries every 100ms, max 5s)
  waitForReady(timeout = 5000) {
    return new Promise((resolve) => {
      if (typeof Chart !== 'undefined') { resolve(true); return; }
      const start = Date.now();
      const check = () => {
        if (typeof Chart !== 'undefined') { resolve(true); return; }
        if (Date.now() - start > timeout) { resolve(false); return; }
        setTimeout(check, 100);
      };
      check();
    });
  },

  // Show "no data" message inside a canvas container
  showEmpty(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    // Avoid duplicate messages
    if (parent.querySelector('.chart-empty-msg')) return;
    const msg = document.createElement('div');
    msg.className = 'chart-empty-msg';
    msg.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;position:absolute;top:0;left:0;color:#9ca3af;font-size:14px;text-align:center;padding:20px;';
    msg.innerHTML = `<div><i class="fas fa-chart-bar" style="font-size:28px;margin-bottom:8px;opacity:0.4;display:block;"></i>${message || 'Sin datos disponibles para este gráfico'}</div>`;
    parent.style.position = 'relative';
    parent.appendChild(msg);
  },

  // Remove empty message if data becomes available
  hideEmpty(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const msg = parent.querySelector('.chart-empty-msg');
    if (msg) msg.remove();
  },

  // Trunca etiquetas largas del eje de categorías (usadas en barras horizontales) para que
  // nunca se corten a la mitad contra el borde del contenedor. El texto completo sigue
  // disponible en el tooltip al pasar el mouse, ya que éste no depende de este callback.
  truncateAxisLabel(label, maxLen) {
    if (!label) return '';
    const limit = maxLen || (window.innerWidth < 768 ? 20 : (window.innerWidth < 1200 ? 32 : 42));
    return label.length > limit ? label.slice(0, limit - 1) + '…' : label;
  },

  // Formatea un % redondeado, salvo el caso confuso de una categoría CON datos (count > 0) cuyo
  // % real es menor a 0.5 y por eso Math.round() la deja en "0%" — visualmente contradictorio con
  // la barra, que sí se dibuja (por chica que sea, proporcional al conteo real). En ese caso
  // muestra "<1%" en vez de "0%", que sí es honesto sobre "hay datos, pero es una fracción mínima".
  formatPercent(count, total) {
    if (!total || count <= 0) return '0%';
    const pct = (count / total) * 100;
    if (pct > 0 && pct < 0.5) return '<1%';
    return `${Math.round(pct)}%`;
  },

  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          font: {
            family: "'N27', 'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1A1A2E',
        bodyColor: '#4a5568',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        titleFont: {
          family: "'N27', 'Inter', sans-serif",
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: "'N27', 'Inter', sans-serif",
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4
      }
    }
  },

  colors: {
    primary: ['#07C8CC', '#05A8AB', '#048E90', '#037577', '#368BA1', '#4bb3cf', '#284E4E'],
    secondary: ['#368BA1', '#4bb3cf', '#DCB17C', '#F08568', '#F2D963', '#C96590'],
    danger: ['#c53030', '#e53e3e', '#fc8181', '#feb2b2', '#fff5f5'],
    mixed: ['#07C8CC', '#368BA1', '#DCB17C', '#F08568', '#F2D963', '#C96590', '#284E4E'],
    gradient: [
      'rgba(7, 200, 204, 0.8)',
      'rgba(54, 139, 161, 0.8)',
      'rgba(220, 177, 124, 0.8)',
      'rgba(240, 133, 104, 0.8)',
      'rgba(40, 78, 78, 0.8)',
      'rgba(201, 101, 144, 0.8)'
    ]
  },

  getRankedColors(values) {
    if (!values || !Array.isArray(values)) return [];
    const sortedUnique = [...new Set(values)].sort((a, b) => b - a);
    return values.map(val => {
      const rank = sortedUnique.indexOf(val);
      if (rank === 0) return '#07C8CC';
      if (rank === 1) return '#368BA1';
      if (rank === 2) return '#284E4E';
      return '#6B7280';
    });
  },

  _normalize100PercentStackedData(labels, datasets) {
    if (!labels || !datasets || datasets.length === 0) return;
    for (let i = 0; i < labels.length; i++) {
      let sum = 0;
      let maxIdx = -1;
      let maxVal = -1;
      for (let j = 0; j < datasets.length; j++) {
        const val = datasets[j].data[i] || 0;
        sum += val;
        if (val > maxVal) {
          maxVal = val;
          maxIdx = j;
        }
      }
      // Si la suma está cerca de 100 pero no es exacta (por redondeo)
      if (sum > 0 && sum >= 95 && sum <= 105 && sum !== 100 && maxIdx !== -1) {
        datasets[maxIdx].data[i] += (100 - sum);
      }
    }
  },

  destroy(canvasId) {
    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
      delete this.instances[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (canvas && typeof Chart !== 'undefined') {
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();
    }
  },

  createBarChart(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Guard: empty data
    const hasData = labels && labels.length > 0 && datasets.some(ds => ds.data && ds.data.some(v => v > 0));
    if (!hasData) { this.showEmpty(canvasId, options.emptyMessage); return null; }
    this.hideEmpty(canvasId);

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: this.colors.mixed[i % this.colors.mixed.length],
          borderColor: this.colors.mixed[i % this.colors.mixed.length],
          borderWidth: 1,
          borderRadius: 4,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        ...options,
        plugins: {
          ...this.defaultOptions.plugins,
          ...(options.plugins || {}),
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            ...(options.plugins?.tooltip || {}),
            callbacks: {
              ...(this.defaultOptions.plugins.tooltip?.callbacks || {}),
              ...(options.plugins?.tooltip?.callbacks || {})
            }
          }
        },
        scales: {
          // Se incluyen primero para no perder ejes adicionales (p.ej. 'y1' en gráficos
          // combinados barra+línea); 'y'/'x' se sobrescriben abajo con sus valores fusionados.
          ...(options.scales || {}),
          y: {
            beginAtZero: true,
            grace: '12%',
            ticks: {
              callback: function(value) {
                return options.yAxisFormat ? options.yAxisFormat(value) : value;
              },
              font: {
                family: "'N27', 'Inter', sans-serif",
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ...(options.scales?.y || {})
          },
          x: {
            ticks: {
              font: {
                family: "'N27', 'Inter', sans-serif",
                size: 11
              },
              maxRotation: options.maxRotation || 45,
              minRotation: options.minRotation || 0
            },
            grid: {
              display: false
            },
            ...(options.scales?.x || {})
          }
        }
      }
    };

    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  createDotPlot(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const hasData = labels && labels.length > 0 && datasets.some(ds => ds.data && ds.data.some(v => v != null));
    if (!hasData) { this.showEmpty(canvasId, options.emptyMessage); return null; }
    this.hideEmpty(canvasId);

    const config = {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor || this.colors.mixed[i % this.colors.mixed.length],
          borderColor: ds.borderColor || this.colors.mixed[i % this.colors.mixed.length],
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false, // Esconde la línea para que quede solo como puntos
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        indexAxis: 'y', // Orientación horizontal
        ...options,
        plugins: {
          ...this.defaultOptions.plugins,
          ...(options.plugins || {})
        },
        scales: {
          ...(options.scales || {}),
          x: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              callback: options.xAxisFormat || ((value) => value),
              font: {
                family: "'N27', 'Inter', sans-serif"
              }
            },
            ...(options.scales?.x || {})
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)', // Líneas horizontales ligeras para guiar el ojo
              drawBorder: false
            },
            ticks: {
              callback: function(value) {
                return Charts.truncateAxisLabel(this.getLabelForValue(value));
              },
              font: {
                family: "'N27', 'Inter', sans-serif",
                size: 11
              }
            },
            ...(options.scales?.y || {})
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.instances[canvasId] = chart;
    return chart;
  },

  createHorizontalBarChart(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const hasData = labels && labels.length > 0 && datasets.some(ds => ds.data && ds.data.some(v => v > 0));
    if (!hasData) { this.showEmpty(canvasId, options.emptyMessage); return null; }
    this.hideEmpty(canvasId);

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: this.colors.mixed[i % this.colors.mixed.length],
          borderColor: this.colors.mixed[i % this.colors.mixed.length],
          borderWidth: 1,
          borderRadius: 4,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        indexAxis: 'y',
        layout: {
          padding: { right: 35 },
          ...(options.layout || {})
        },
        ...options,
        plugins: {
          ...this.defaultOptions.plugins,
          ...(options.plugins || {}),
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            ...(options.plugins?.tooltip || {}),
            callbacks: {
              ...(this.defaultOptions.plugins.tooltip?.callbacks || {}),
              ...(options.plugins?.tooltip?.callbacks || {})
            }
          }
        },
        scales: {
          ...(options.scales || {}),
          x: {
            beginAtZero: true,
            grace: '2%',
            ticks: {
              callback: function(value) {
                return options.xAxisFormat ? options.xAxisFormat(value) : value;
              },
              font: {
                family: "'N27', 'Inter', sans-serif",
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ...(options.scales && options.scales.x ? options.scales.x : {})
          },
          y: {
            ticks: {
              callback: function(value) {
                return Charts.truncateAxisLabel(this.getLabelForValue(value));
              },
              font: {
                family: "'N27', 'Inter', sans-serif",
                size: 11
              }
            },
            grid: {
              display: false
            },
            ...(options.scales && options.scales.y ? options.scales.y : {})
          }
        }
      }
    };

    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  createDoughnutChart(canvasId, labels, data, options = {}) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const hasData = labels && labels.length > 0 && data && data.some(v => v > 0);
    if (!hasData) { this.showEmpty(canvasId, options.emptyMessage); return null; }
    this.hideEmpty(canvasId);

    const colors = options.colors || this.colors.mixed;

    const config = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 8
        }]
      },
      options: {
        ...this.defaultOptions,
        ...options,
        cutout: options.cutout || '55%',
        plugins: {
          ...this.defaultOptions.plugins,
          ...(options.plugins || {}),
          legend: {
            ...this.defaultOptions.plugins.legend,
            position: options.legendPosition || 'right',
            ...(options.plugins?.legend || {})
          },
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            ...(options.plugins?.tooltip || {}),
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
              },
              ...(options.plugins?.tooltip?.callbacks || {})
            }
          }
        }
      }
    };

    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  createLineChart(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const hasData = labels && labels.length > 0 && datasets.some(ds => ds.data && ds.data.some(v => v != null));
    if (!hasData) { this.showEmpty(canvasId, options.emptyMessage); return null; }
    this.hideEmpty(canvasId);

    const config = {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          borderColor: this.colors.mixed[i % this.colors.mixed.length],
          backgroundColor: this.colors.mixed[i % this.colors.mixed.length] + '20',
          fill: ds.fill !== undefined ? ds.fill : true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        ...options,
        scales: {
          ...(options.scales || {}),
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return options.yAxisFormat ? options.yAxisFormat(value) : value;
              },
              font: {
                family: "'N27', 'Inter', sans-serif",
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                family: "'N27', 'Inter', sans-serif",
                size: 11
              }
            },
            grid: {
              display: false
            }
          },
          ...options.scales
        }
      }
    };

    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  createStackedBarChart(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const hasData = labels && labels.length > 0 && datasets.some(ds => ds.data && ds.data.some(v => v > 0));
    if (!hasData) { this.showEmpty(canvasId, options.emptyMessage); return null; }
    this.hideEmpty(canvasId);

    // Si es un gráfico de 100% apilado (max: 100), forzamos a que las sumas redondeadas den exactamente 100
    if (options.scales && options.scales.y && options.scales.y.max === 100) {
      this._normalize100PercentStackedData(labels, datasets);
    }

    const palette = options.colors || this.colors.mixed;

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor || palette[i % palette.length],
          borderWidth: 0,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        ...options,
        plugins: {
          ...this.defaultOptions.plugins,
          ...(options.plugins || {})
        },
        scales: {
          ...(options.scales || {}),
          x: {
            stacked: true,
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              maxRotation: options.maxRotation !== undefined ? options.maxRotation : 45,
              minRotation: options.minRotation !== undefined ? options.minRotation : 0
            },
            grid: {
              display: false
            },
            ...(options.scales?.x || {})
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return options.yAxisFormat ? options.yAxisFormat(value) : `${value}%`;
              },
              font: {
                family: "'Inter', sans-serif",
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ...(options.scales?.y || {})
          }
        }
      }
    };

    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  createHorizontalStackedBarChart(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const hasData = labels && labels.length > 0 && datasets.some(ds => ds.data && ds.data.some(v => v > 0));
    if (!hasData) { this.showEmpty(canvasId, options.emptyMessage); return null; }
    this.hideEmpty(canvasId);

    // Si es un gráfico de 100% apilado (max: 100), forzamos a que las sumas redondeadas den exactamente 100
    if (options.scales && options.scales.x && options.scales.x.max === 100) {
      this._normalize100PercentStackedData(labels, datasets);
    } else if (!options.scales || !options.scales.x || options.scales.x.max === undefined || options.scales.x.max === 100) {
      // Por defecto en createHorizontalStackedBarChart el max es 100 (línea 600 aprox)
      this._normalize100PercentStackedData(labels, datasets);
    }

    const palette = options.colors || this.colors.mixed;

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor || palette[i % palette.length],
          borderWidth: 0,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        indexAxis: 'y',
        ...options,
        plugins: {
          ...this.defaultOptions.plugins,
          ...(options.plugins || {})
        },
        scales: {
          ...(options.scales || {}),
          x: {
            stacked: true,
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: options.xAxisFormat || ((v) => `${v}%`),
              font: {
                family: "'Inter', sans-serif",
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ...(options.scales?.x || {})
          },
          y: {
            stacked: true,
            ticks: {
              callback: function(value) {
                return Charts.truncateAxisLabel(this.getLabelForValue(value));
              },
              font: {
                family: "'Inter', sans-serif",
                size: 11,
                weight: '500'
              },
              autoSkip: false
            },
            grid: {
              display: false
            },
            ...(options.scales?.y || {})
          }
        }
      }
    };

    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  createGroupedBarChart(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const hasData = labels && labels.length > 0 && datasets.some(ds => ds.data && ds.data.some(v => v > 0));
    if (!hasData) { this.showEmpty(canvasId, options.emptyMessage); return null; }
    this.hideEmpty(canvasId);

    const palette = options.colors || this.colors.mixed;

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor || palette[i % palette.length],
          borderColor: ds.borderColor || palette[i % palette.length],
          borderWidth: 1,
          borderRadius: 4,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        ...options,
        plugins: {
          ...this.defaultOptions.plugins,
          ...(options.plugins || {})
        },
        scales: {
          ...(options.scales || {}),
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return options.yAxisFormat ? options.yAxisFormat(value) : value;
              },
              font: {
                family: "'Inter', sans-serif",
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ...(options.scales?.y || {})
          },
          x: {
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              maxRotation: options.maxRotation !== undefined ? options.maxRotation : 45,
              minRotation: options.minRotation !== undefined ? options.minRotation : 0
            },
            grid: {
              display: false
            },
            ...(options.scales?.x || {})
          }
        }
      }
    };

    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  exportChartToPNG(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = filename || `${canvasId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  },

  destroyAll() {
    Object.keys(this.instances).forEach(key => {
      this.instances[key].destroy();
    });
    this.instances = {};
  },

  // --- Pantalla Completa y Zoom para Gráficos en Móviles y Desktop ---
  fullscreenChartInstance: null,

  openFullscreen(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const chart = (typeof Chart !== 'undefined' && Chart.getChart(canvas)) || this.instances[canvasId];
    if (!chart) return;

    const modal = document.getElementById('chart-fullscreen-modal');
    if (!modal) return;

    // Obtener título y subtítulo de la tarjeta contenedora
    const card = canvas.closest('.exec-panel') || canvas.closest('.chart-card') || canvas.closest('.custom-chart-card') || canvas.parentElement;
    let title = '';
    let subtitle = '';

    if (card) {
      const titleEl = card.querySelector('.exec-panel-title, .chart-title, h3, h2, .section-title, .exec-panel-header > div:first-child');
      if (titleEl) title = titleEl.textContent.trim();
      const subEl = card.querySelector('.exec-panel-desc, .exec-section-desc, .chart-subtitle, p');
      if (subEl) subtitle = subEl.textContent.trim();
    }

    const titleTarget = document.getElementById('chart-fullscreen-title');
    const subTarget = document.getElementById('chart-fullscreen-subtitle');
    if (titleTarget) titleTarget.textContent = title || 'Vista Detallada del Gráfico';
    if (subTarget) subTarget.textContent = subtitle || 'Desglose analítico completo con detalle de variables y mínimos';

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    this.switchFullscreenTab('chart');
    this.renderFullscreenChart(chart);
    this.buildFullscreenDataTable(chart);
  },

  closeFullscreen() {
    const modal = document.getElementById('chart-fullscreen-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    if (this.fullscreenChartInstance) {
      this.fullscreenChartInstance.destroy();
      this.fullscreenChartInstance = null;
    }
  },

  switchFullscreenTab(tab) {
    const chartView = document.getElementById('chart-fullscreen-canvas-container');
    const tableView = document.getElementById('chart-fullscreen-table-container');
    const btnChart = document.getElementById('btn-fullscreen-toggle-chart');
    const btnTable = document.getElementById('btn-fullscreen-toggle-table');

    if (tab === 'table') {
      if (chartView) chartView.style.display = 'none';
      if (tableView) tableView.style.display = 'block';
      btnChart?.classList.remove('active');
      btnTable?.classList.add('active');
    } else {
      if (chartView) chartView.style.display = 'block';
      if (tableView) tableView.style.display = 'none';
      btnChart?.classList.add('active');
      btnTable?.classList.remove('active');
      if (this.fullscreenChartInstance) {
        this.fullscreenChartInstance.resize();
      }
    }
  },

  renderFullscreenChart(sourceChart) {
    const canvas = document.getElementById('canvas-fullscreen-chart');
    if (!canvas) return;

    if (this.fullscreenChartInstance) {
      this.fullscreenChartInstance.destroy();
      this.fullscreenChartInstance = null;
    }

    const container = document.getElementById('chart-fullscreen-canvas-container');
    const numLabels = (sourceChart.data && sourceChart.data.labels) ? sourceChart.data.labels.length : 0;
    const isHorizontal = sourceChart.config.options?.indexAxis === 'y';

    // Altura dinámica amplia para listas largas de categorías (e.g. 16 carreras)
    if (container) {
      if (isHorizontal && numLabels > 8) {
        container.style.height = `${Math.max(520, numLabels * 42)}px`;
      } else {
        container.style.height = '480px';
      }
    }

    // Clonar configuración con mejoras para alta resolución y móvil
    const type = sourceChart.config.type || 'bar';
    const clonedData = JSON.parse(JSON.stringify(sourceChart.data));
    const clonedOptions = JSON.parse(JSON.stringify(sourceChart.config.options || {}));

    clonedOptions.responsive = true;
    clonedOptions.maintainAspectRatio = false;
    clonedOptions.animation = false; // Rápida apertura

    // Si tiene plugins o datalabels, preservarlos
    if (!clonedOptions.plugins) clonedOptions.plugins = {};
    if (!clonedOptions.plugins.legend) clonedOptions.plugins.legend = {};
    clonedOptions.plugins.legend.display = true;
    clonedOptions.plugins.legend.position = isHorizontal ? 'top' : 'bottom';
    clonedOptions.plugins.legend.labels = {
      boxWidth: 14,
      font: { size: 12, weight: '600' },
      padding: 12
    };

    // Ajustar escalas
    if (clonedOptions.scales) {
      Object.keys(clonedOptions.scales).forEach(key => {
        const scale = clonedOptions.scales[key];
        if (!scale.ticks) scale.ticks = {};
        scale.ticks.font = { size: 12, weight: '500' };
        // No truncar etiquetas en fullscreen
        scale.ticks.callback = function(val, index) {
          const l = this.chart.data.labels;
          if (l && l[index] !== undefined) return l[index];
          return val;
        };
      });
    }

    const ctx = canvas.getContext('2d');
    const plugins = sourceChart.config.plugins || (Charts.datalabelsPlugin ? [Charts.datalabelsPlugin] : []);

    this.fullscreenChartInstance = new Chart(ctx, {
      type: type,
      data: clonedData,
      options: clonedOptions,
      plugins: plugins
    });
  },

  buildFullscreenDataTable(sourceChart) {
    const table = document.getElementById('table-fullscreen-chart');
    if (!table || !sourceChart.data) return;

    const labels = sourceChart.data.labels || [];
    const datasets = sourceChart.data.datasets || [];

    if (labels.length === 0 || datasets.length === 0) {
      table.innerHTML = '<tr><td style="padding:16px;text-align:center;color:#64748b;">No hay datos tabulares para este gráfico.</td></tr>';
      return;
    }

    let html = `
      <thead>
        <tr>
          <th>Variable / Categoría</th>
          <th>Serie / Métrica</th>
          <th style="text-align: center;">Valor (%)</th>
          <th>Distribución Proporcional</th>
        </tr>
      </thead>
      <tbody>
    `;

    labels.forEach((label, lIdx) => {
      datasets.forEach((ds, dsIdx) => {
        const val = ds.data ? ds.data[lIdx] : null;
        if (val === undefined || val === null) return;

        const valNum = Number(val);
        const displayVal = isNaN(valNum) ? val : (Number.isInteger(valNum) ? `${valNum}%` : `${valNum.toFixed(1)}%`);
        const numPercent = isNaN(valNum) ? 0 : Math.min(100, Math.max(0, valNum));

        // Color de la serie
        let color = '#07C8CC';
        if (Array.isArray(ds.backgroundColor)) {
          color = ds.backgroundColor[lIdx] || ds.backgroundColor[0] || color;
        } else if (ds.backgroundColor) {
          color = ds.backgroundColor;
        }

        const isMinimo = !isNaN(valNum) && valNum > 0 && valNum <= 5;
        const badgeMinimo = isMinimo ? `<span style="font-size: 10px; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Mínimo</span>` : '';

        html += `
          <tr>
            <td style="font-weight: 600;">${label}</td>
            <td style="color: #475569;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};margin-right:6px;"></span>
              ${ds.label || 'Valor'}
            </td>
            <td style="text-align: center; font-weight: 800; color: #0a1b44;">
              ${displayVal} ${badgeMinimo}
            </td>
            <td>
              <div class="mini-bar-track">
                <div class="mini-bar-fill" style="width: ${numPercent}%; background: ${color};"></div>
              </div>
            </td>
          </tr>
        `;
      });
    });

    html += `</tbody>`;
    table.innerHTML = html;
  },

  attachFullscreenButtons() {
    const canvases = document.querySelectorAll('canvas:not(#canvas-fullscreen-chart)');
    canvases.forEach(canvas => {
      if (!canvas.id) return;
      const card = canvas.closest('.exec-panel') || canvas.closest('.chart-card') || canvas.closest('.custom-chart-card');
      if (!card) return;
      if (card.querySelector(`.btn-chart-fullscreen[data-canvas-id="${canvas.id}"]`)) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-chart-fullscreen';
      btn.dataset.canvasId = canvas.id;
      btn.title = 'Ver en pantalla completa y tabla detallada de mínimos';
      btn.setAttribute('aria-label', 'Ver gráfico en pantalla completa');
      btn.innerHTML = '<i class="fas fa-expand-alt"></i><span>Ampliar</span>';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        Charts.openFullscreen(canvas.id);
      });

      const header = card.querySelector('.exec-panel-header, .chart-header, .card-header');
      if (header) {
        header.appendChild(btn);
      } else {
        card.style.position = 'relative';
        card.appendChild(btn);
      }
    });
  },

  initFullscreenModalEvents() {
    document.getElementById('btn-close-chart-fullscreen')?.addEventListener('click', () => this.closeFullscreen());
    document.getElementById('btn-close-chart-fullscreen-footer')?.addEventListener('click', () => this.closeFullscreen());
    document.getElementById('chart-fullscreen-backdrop')?.addEventListener('click', () => this.closeFullscreen());

    document.getElementById('btn-fullscreen-toggle-chart')?.addEventListener('click', () => this.switchFullscreenTab('chart'));
    document.getElementById('btn-fullscreen-toggle-table')?.addEventListener('click', () => this.switchFullscreenTab('table'));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('chart-fullscreen-modal');
        if (modal && modal.style.display !== 'none') {
          this.closeFullscreen();
        }
      }
    });
  }
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { Charts.initFullscreenModalEvents(); });
  } else {
    Charts.initFullscreenModalEvents();
  }
}

// Custom Chart.js plugin: data labels on bars and charts
Charts.datalabelsPlugin = {
  id: 'datalabels',
  afterDatasetsDraw(chart) {
    // Read raw un-proxied options to prevent Chart.js from invoking scriptable options on property access
    const opts = chart.config.options?.plugins?.datalabels || chart.options.plugins?.datalabels;
    if (!opts || opts.display !== true) return;

    const ctx = chart.ctx;
    ctx.save();
    const font = opts.font || { family: "'Inter', sans-serif", size: 11, weight: '600' };
    const baseFontWeight = font.weight || '600';
    const baseFontSize = font.size || 11;
    const baseFontFamily = font.family || "'Inter', sans-serif";

    const isHorizontal = chart.options.indexAxis === 'y';
    const isStacked = Boolean(
      chart.options.scales?.x?.stacked ||
      chart.options.scales?.y?.stacked ||
      chart.data.datasets.some(d => d.stack)
    );
    const isDoughnut = chart.config.type === 'doughnut' || chart.config.type === 'pie';

    chart.data.datasets.forEach((dataset, di) => {
      const meta = chart.getDatasetMeta(di);
      if (meta.hidden) return;

      meta.data.forEach((element, i) => {
        const rawVal = dataset.data[i];
        if (rawVal == null) return;
        const numVal = typeof rawVal === 'number' ? rawVal : (typeof rawVal === 'object' && rawVal !== null ? (rawVal.x ?? rawVal.y ?? 0) : Number(rawVal) || 0);
        if (numVal === 0) return;

        let label = null;
        if (typeof opts.formatter === 'function') {
          try {
            label = opts.formatter(numVal, dataset, i);
          } catch (e) {
            label = `${Math.round(numVal)}%`;
          }
        } else if (opts.percentOfTotal) {
          label = Charts.formatPercent(numVal, opts.percentOfTotal);
        } else {
          label = `${Math.round(numVal)}%`;
        }
        if (!label) return;

        const bgRaw = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : dataset.backgroundColor;
        const bgNorm = String(bgRaw || '').trim().toUpperCase();
        const isLightBg = bgNorm === '#D1D5DB' || bgNorm === '#88E788' || bgNorm === '#E5E7EB' || bgNorm === '#F1F5F9' || bgNorm === '#F3F4F6';
        const contrastInsideColor = isLightBg ? '#0a1b44' : (opts.color || '#ffffff');

        if (isStacked) {
          // Stacked bars: el texto va centrado DENTRO del segmento cuando entra. Si el
          // segmento es demasiado angosto para el texto (tramos chicos, p.ej. 1-3%), en vez
          // de ocultarlo se dibuja JUSTO AFUERA de su propio borde — pero solo para el ÚLTIMO
          // dataset del stack (el "resto"/remanente en gráficos de 2 categorías tipo Sí/No o
          // Pertinente/No Pertinente), que siempre queda libre de otros segmentos a su lado.
          // Para stacks con más de 2 categorías, un tramo chico en medio del stack sigue
          // ocultándose como antes para no superponer texto sobre el segmento vecino.
          const isLastDataset = di === chart.data.datasets.length - 1;
          ctx.font = `700 ${baseFontSize}px ${baseFontFamily}`;
          ctx.textBaseline = 'middle';
          const textDims = ctx.measureText(label);

          if (isHorizontal) {
            const segWidth = Math.abs(element.x - element.base);
            const segEnd = Math.max(element.x, element.base);
            const segStart = Math.min(element.x, element.base);
            if (segWidth >= textDims.width + 8) {
              ctx.textAlign = 'center';
              ctx.fillStyle = contrastInsideColor;
              ctx.fillText(label, (segStart + segEnd) / 2, element.y);
            } else if (isLastDataset) {
              const rightLimit = chart.width ? chart.width - 4 : (chart.chartArea ? chart.chartArea.right : 0);
              ctx.fillStyle = '#1e293b';
              if (segEnd + textDims.width + 6 <= rightLimit) {
                ctx.textAlign = 'left';
                ctx.fillText(label, segEnd + 4, element.y);
              } else {
                ctx.textAlign = 'right';
                ctx.fillText(label, segStart - 4, element.y);
              }
            }
          } else {
            const segHeight = Math.abs(element.base - element.y);
            const segTop = Math.min(element.y, element.base);
            const segBottom = Math.max(element.y, element.base);
            ctx.textAlign = 'center';
            if (segHeight >= baseFontSize + 6) {
              ctx.fillStyle = contrastInsideColor;
              ctx.fillText(label, element.x, (segTop + segBottom) / 2);
            } else if (isLastDataset) {
              const topLimit = chart.chartArea ? chart.chartArea.top : 0;
              ctx.fillStyle = '#1e293b';
              if (segTop - baseFontSize - 4 >= topLimit) {
                ctx.textBaseline = 'bottom';
                ctx.fillText(label, element.x, segTop - 2);
              } else {
                ctx.textBaseline = 'top';
                ctx.fillText(label, element.x, segBottom + 2);
              }
            }
          }
        } else if (isDoughnut) {
          // Center of doughnut/pie segment
          let posX, posY;
          if (element.startAngle !== undefined && element.endAngle !== undefined && element.innerRadius !== undefined && element.outerRadius !== undefined) {
            const angleDiff = Math.abs(element.endAngle - element.startAngle);
            if (angleDiff < 0.25) return; // Slice too small to fit label
            const midAngle = (element.startAngle + element.endAngle) / 2;
            const midRadius = (element.innerRadius + element.outerRadius) / 2;
            posX = element.x + Math.cos(midAngle) * midRadius;
            posY = element.y + Math.sin(midAngle) * midRadius;
          } else {
            const pos = element.tooltipPosition ? element.tooltipPosition() : { x: element.x, y: element.y };
            posX = pos.x;
            posY = pos.y;
          }
          ctx.font = `700 ${baseFontSize}px ${baseFontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = contrastInsideColor;
          ctx.fillText(label, posX, posY);
        } else if (isHorizontal) {
          // Standard horizontal bar: place label at the TIP (right end)
          ctx.font = `${baseFontWeight} ${baseFontSize}px ${baseFontFamily}`;
          const xTip = element.x;
          const yCenter = element.y;
          const textWidth = ctx.measureText(label).width;
          const rightLimit = chart.width ? chart.width - 4 : (chart.chartArea ? chart.chartArea.right : 0);

          if (xTip + textWidth + 8 > rightLimit) {
            // Draw inside the tip if right margin is tight
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = contrastInsideColor;
            ctx.fillText(label, xTip - 6, yCenter);
          } else {
            // Draw outside at the tip
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = opts.color || '#1e293b';
            ctx.fillText(label, xTip + 6, yCenter);
          }
        } else {
          // Standard vertical bar / grouped bar: place label at the TIP (top)
          ctx.font = `${baseFontWeight} ${baseFontSize}px ${baseFontFamily}`;
          const xCenter = element.x;
          const yTip = element.y;
          const topLimit = chart.chartArea ? chart.chartArea.top : 0;

          if (yTip - 16 < topLimit) {
            // Draw inside the top of the bar if top margin is tight
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, xCenter, yTip + 4);
          } else {
            // Draw outside at the tip of the bar
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = opts.color || '#1e293b';
            ctx.fillText(label, xCenter, yTip - 4);
          }
        }
      });
    });
    ctx.restore();
  }
};

// Sort helper: push "undefined/other" categories to the end
Charts.sortWithUndefinedLast = function(labels, values, undefinedLabels = ['No precisa', 'Otro', 'Otra', 'No aplica', 'No declara', 'No precisa / No aplica']) {
  const paired = labels.map((l, i) => ({ label: l, value: values[i] }));
  const defined = paired.filter(p => !undefinedLabels.includes(p.label));
  const undefined_ = paired.filter(p => undefinedLabels.includes(p.label));
  return {
    labels: [...defined.map(p => p.label), ...undefined_.map(p => p.label)],
    values: [...defined.map(p => p.value), ...undefined_.map(p => p.value)]
  };
};

window.Charts = Charts;

// Register the datalabels plugin globally with Chart.js
if (typeof Chart !== 'undefined') {
  Chart.register(Charts.datalabelsPlugin);
}

// ==========================================================================
// Tooltip flotante global (HTML, position: fixed)
// ==========================================================================
// Los paneles de gráfico usan `overflow` acotado (exec-chart-canvas-wrap con
// altura fija) para encajar en el layout, lo que recorta el tooltip nativo de
// Chart.js porque este se dibuja DENTRO del propio <canvas>. Se reemplaza por
// un tooltip HTML externo, anclado a document.body con position:fixed y
// z-index alto, para que siempre se vea completo por encima de todo el
// dashboard sin importar el tamaño o el overflow del contenedor del gráfico.
// Se registra una sola vez como default global de Chart.js (Chart.defaults),
// así aplica automáticamente a TODOS los gráficos de la app (los creados vía
// Charts.create*Chart y los `new Chart(...)` directos en las páginas), sin
// tener que tocar cada configuración individual. Los callbacks personalizados
// de cada gráfico (title/label/afterLabel) se siguen ejecutando igual: Chart.js
// arma el modelo de tooltip (title/body) normalmente y solo se le pide que no
// lo dibuje en el canvas (`enabled: false`), delegando el dibujo a esta función.
function getGlobalTooltipEl() {
  let el = document.getElementById('chartjs-external-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'chartjs-external-tooltip';
    el.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      background: #0a1b44;
      color: #ffffff;
      border-radius: 8px;
      padding: 8px 12px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      max-width: 280px;
      transition: opacity 0.08s ease-out;
      white-space: normal;
    `;
    document.body.appendChild(el);
  }
  return el;
}

function externalTooltipHandler(context) {
  const { chart, tooltip } = context;
  const el = getGlobalTooltipEl();

  if (!tooltip || tooltip.opacity === 0) {
    el.style.opacity = 0;
    return;
  }

  let html = '';
  (tooltip.title || []).forEach(line => {
    html += `<div style="font-weight:700;margin-bottom:3px;">${line}</div>`;
  });
  (tooltip.body || []).forEach((bodyItem, i) => {
    const colors = tooltip.labelColors && tooltip.labelColors[i];
    [...(bodyItem.before || []), ...(bodyItem.lines || []), ...(bodyItem.after || [])].forEach(line => {
      html += `<div style="display:flex;align-items:center;gap:6px;">`;
      if (colors) {
        html += `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;flex-shrink:0;background:${colors.backgroundColor};border:1px solid ${colors.borderColor || 'transparent'};"></span>`;
      }
      html += `<span>${line}</span></div>`;
    });
  });
  el.innerHTML = html;

  const canvasRect = chart.canvas.getBoundingClientRect();
  const offset = 14;
  let left = canvasRect.left + tooltip.caretX + offset;
  let top = canvasRect.top + tooltip.caretY + offset;

  el.style.opacity = 1;
  const elRect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (left + elRect.width > vw - 8) left = canvasRect.left + tooltip.caretX - elRect.width - offset;
  if (top + elRect.height > vh - 8) top = canvasRect.top + tooltip.caretY - elRect.height - offset;
  if (left < 8) left = 8;
  if (top < 8) top = 8;

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

// El tooltip usa position:fixed (coordenadas de viewport) calculadas en el último
// evento de mouse que Chart.js procesó. Si la página (o un contenedor interno) hace
// scroll sin que el mouse se mueva, Chart.js no dispara un nuevo evento y el tooltip
// quedaría "pegado" en pantalla, ya desalineado de la barra que lo originó. Se oculta
// apenas hay scroll para evitar ese tooltip huérfano.
window.addEventListener('scroll', () => {
  const el = document.getElementById('chartjs-external-tooltip');
  if (el) el.style.opacity = 0;
}, true);

if (typeof Chart !== 'undefined') {
  Chart.defaults.plugins.tooltip.enabled = false;
  Chart.defaults.plugins.tooltip.external = externalTooltipHandler;
}
