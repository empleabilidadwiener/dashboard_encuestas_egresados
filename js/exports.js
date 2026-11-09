const Exports = {
  async exportChartToPNG(canvasId, filename) {
    Charts.exportChartToPNG(canvasId, filename);
  },

  async exportAllChartsToPNG() {
    const charts = document.querySelectorAll('canvas');
    for (const chart of charts) {
      const id = chart.id;
      if (id) {
        await this.sleep(500);
        Charts.exportChartToPNG(id, `${id}.png`);
      }
    }
  },

  exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    const csvContent = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      return cells.map(cell => {
        let text = cell.textContent.trim();
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          text = `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      }).join(',');
    }).join('\n');

    this.downloadFile(csvContent, filename || `${tableId}.csv`, 'text/csv');
  },

  exportAllTablesToCSV() {
    const tables = document.querySelectorAll('table[data-exportable]');
    tables.forEach(table => {
      const id = table.id;
      if (id) {
        this.exportTableToCSV(id, `${id}.csv`);
      }
    });
  },

  async exportDashboardToPDF() {
    const element = document.querySelector('.main-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f7fafc'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdfWidth = imgWidth * 0.75;
      const pdfHeight = imgHeight * 0.75;

      const link = document.createElement('a');
      link.download = 'dashboard_egresados.pdf';
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar. Intente exportar los graficos individualmente.');
    }
  },

  exportDataToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename || 'datos_exportados.json', 'application/json');
  },

  exportFilteredData(encuestas, filters, filename) {
    let filteredData = [...encuestas];

    if (filters.facultad && filters.facultad !== 'Todas') {
      filteredData = filteredData.filter(d =>
        DataLoader.getFacultadForCarrera(d['CARRERA']) === filters.facultad
      );
    }

    if (filters.carrera && filters.carrera !== 'Todas') {
      filteredData = filteredData.filter(d =>
        d['CARRERA'] === filters.carrera
      );
    }

    if (filters.anio && filters.anio !== 'Todos') {
      filteredData = filteredData.filter(d =>
        String(d['Año de Egreso'] || '').includes(filters.anio.toString())
      );
    }

    this.exportDataToJSON(filteredData, filename || 'datos_filtrados.json');
  },

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  generateReportTitle() {
    return `Dashboard Egresados - ${new Date().toLocaleDateString('es-PE')}`;
  }
};

window.Exports = Exports;
