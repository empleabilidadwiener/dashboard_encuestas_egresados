# Plan Concreto: Dashboard de Egresados 2026

## Arquitectura: Multi-HTML con Navegación

### Estructura de Archivos
```
dashboard_egresados/
├── index.html                    # Página principal (navegador lateral)
├── css/
│   └── styles.css               # Estilos globales
├── js/
│   ├── app.js                   # Lógica principal y navegación
│   ├── dataLoader.js            # Carga y procesamiento de Excel
│   ├── charts.js                # Configuración de gráficos
│   ├── calculations.js          # Fórmulas estadísticas
│   └── exports.js               # Exportación PNG/CSV/PDF
├── pages/
│   ├── representatividad.html   # Análisis de muestra
│   ├── ocupacion.html           # Tasas de ocupación
│   ├── empleabilidad.html       # Pertinencia, satisfacción, salario
│   ├── nid.html                 # Análisis por colegiatura
│   ├── ranking.html             # Ranking de carreras
│   ├── margen-error.html        # Margen de error
│   ├── robustez.html            # Prueba de robustez
│   └── preguntas-abiertas.html  # Análisis de respuestas abiertas
├── data/
│   ├── respuestas_encuestas.xlsx  # Datos de encuesta (renombrado)
│   └── universo.xlsx              # Universo de egresados (renombrado)
└── assets/
    └── logo.png                 # Logo de la universidad (opcional)
```

---

## Flujo de Datos Dinámico

### Proceso de Carga
```
1. Usuario abre index.html
2. JavaScript carga SheetJS (CDN)
3. Lee archivos Excel desde /data/ (mismos nombres)
4. Procesa y limpia datos:
   - Elimina sufijo _x0000_
   - Convierte fechas
   - Normaliza categorías
5. Calcula todos los indicadores
6. Renderiza gráficos interactivos
7. Guarda en memoria para filtros
```

### Actualización de Datos
```
1. Usuario reemplaza archivos en /data/
2. Presiona botón "Actualizar datos"
3. Dashboard recarga y recalcula todo
4. Vista se refresca automáticamente
```

---

## Páginas del Dashboard

### Página 1: Representatividad de la Muestra
**Ubicación:** `pages/representatividad.html`

| Indicador | Gráfico | Descripción |
|-----------|---------|-------------|
| Total respuestas | KPI card | 2,984 encuestados |
| Tasa de respuesta | KPI card | 29.5% del universo |
| Distribución por facultad | Donut chart | Salud vs ING vs Derecho |
| Distribución por carrera | Barra horizontal | 17 carreras |
| Distribución por año egreso | Barra apilada | 2021-2025 |
| Comparación SALUD vs NID | Grupo de barras | Separar por facultad |
| Representatividad vs universo | Tabla comparativa | % de cada carrera |

### Página 2: Ocupación y Empleabilidad
**Ubicación:** `pages/ocupacion.html`

| Indicador | Gráfico | Descripción |
|-----------|---------|-------------|
| Tasa global ocupación | Gauge/KPI | 81.5% trabajan |
| Ocupación por facultad | Barra horizontal | Comparar 3 facultades |
| Ocupación por carrera | Barra ordenada | Ranking completo |
| Condición laboral | Donut | Dependiente/Independiente/Emprendedor |
| Modalidad trabajo | Donut | Presencial/Híbrido/Remoto |
| Tipo empresa | Donut | Privada/Pública/ONG |
| Tiempo en cargo | Barra | Distribución temporal |

### Página 3: Empleabilidad (Pertinencia, Satisfacción, Salario)
**Ubicación:** `pages/empleabilidad.html`

| Indicador | Gráfico | Descripción |
|-----------|---------|-------------|
| Pertinencia laboral | Donut | Totalmente/Parcialmente/No relacionada |
| Pertinencia por facultad | Barra apilada | Comparar grupos |
| Satisfacción laboral | Escala Likert | 5 niveles |
| Satisfacción por carrera | Heatmap | Carrera x Satisfacción |
| Distribución salarial | Barra | Rangos de ingreso |
| Salario por carrera | Box plot simplificado | Mediana y cuartiles |
| Primer empleo relacionado | Donut | Sí/No |
| Tiempo primer empleo | Barra | Desde 0 hasta >12 meses |

### Página 4: Análisis NID (Colegiatura)
**Ubicación:** `pages/nid.html`

| Indicador | Gráfico | Descripción |
|-----------|---------|-------------|
| Distribución colegiatura | Donut | Colegiado/No colegiado/No aplica |
| Comparativo NID vigente vs retirado | Grupo de barras | Todos los indicadores |
| Empleabilidad según NID | Tabla cruzada | Ocupación, pertinencia, salario |
| Prácticas preprofesionales | Donut | Sí/No (solo NID) |
| Posgrados según NID | Barra | Tipo de posgrado |
| Interés en posgrado UNW | Donut | Sí/No por grupo |

### Página 5: Ranking de Carreras
**Ubicación:** `pages/ranking.html`

| Indicador | Gráfico | Descripción |
|-----------|---------|-------------|
| Ranking ocupación | Tabla clasificatoria | Top a bottom |
| Ranking pertinencia | Tabla clasificatoria | Top a bottom |
| Ranking satisfacción | Tabla clasificatoria | Top a bottom |
| Ranking salario | Tabla clasificatoria | Top a bottom |
| Carreras más bajas | Alertas rojas | Umbral configurable |
| Carreras primeras promociones | Tabla especial | Análisis diferenciado |

### Página 6: Margen de Error
**Ubicación:** `pages/margen-error.html`

| Indicador | Gráfico | Descripción |
|-----------|---------|-------------|
| Margen error global | KPI + IC | ±X% al 95% confianza |
| Margen error por facultad | Barra con error bars | 3 facultades |
| Margen error por carrera | Tabla | Solo n≥30 |
| Tamaño mínimo necesario | Tabla | Para ME≤5% |

**Fórmulas:**
```javascript
// Margen de error (proporción)
ME = 1.96 * Math.sqrt((p * (1-p)) / n)

// Tamaño mínimo
n_min = (1.96² * p * (1-p)) / ME²
```

### Página 7: Prueba de Robustez
**Ubicación:** `pages/robustez.html`

| Indicador | Gráfico | Descripción |
|-----------|---------|-------------|
| Ocupación por subgrupos | IC 95% | Por facultad, año, género |
| Pertinencia por composición | Tabla | Análisis de sensibilidad |
| Satisfacción por composición | Tabla | Análisis de sensibilidad |
| Salario por composición | Tabla | Análisis de sensibilidad |
| Ascenso por composición | Tabla | Análisis de sensibilidad |

### Página 8: Preguntas Abiertas
**Ubicación:** `pages/preguntas-abiertas.html`

| Indicador | Gráfico | Descripción |
|-----------|---------|-------------|
| NPS - Razones calificación | Word cloud | Top 50 palabras frecuentes |
| NPS - Razones desempleados | Word cloud | Top 50 palabras frecuentes |
| Posgrados de interés | Barra horizontal | Top 20 menciones |
| Apoyo empleo sugerido | Barra horizontal | Top 15 sugerencias |
| Empresas más mencionadas | Tabla | Top 20 empresas |
| Cargos más comunes | Barra | Top 20 cargos |
| Universidades posgrado | Barra | Top 15 universidades |

---

## Análisis de Preguntas Abiertas

### Métodos de Cuantificación

#### 1. Conteo de Frecuencia de Palabras
```javascript
function wordFrequency(texts) {
  const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'de', 'del', 
                     'en', 'que', 'por', 'con', 'para', 'se', 'su', 'al', 'lo',
                     'como', 'más', 'pero', 'sus', 'le', 'ya', 'este', 'si',
                     'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre',
                     'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde',
                     'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra',
                     'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mi',
                     'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra',
                     'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada',
                     'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas',
                     'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus',
                     'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía',
                     'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya',
                     'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras',
                     'vuestro', 'vuestra', 'vuestros', 'vuestras', 'esos', 'esas',
                     'estoy', 'estás', 'está', 'estamos', 'estáis', 'están', 'esté',
                     'estés', 'estemos', 'estéis', 'estén', 'estaré', 'estarás', 'estará',
                     'estaremos', 'estaréis', 'estarán', 'estaría', 'estarías', 'estaríamos',
                     'estaríais', 'estarían', 'estaba', 'estabas', 'estábamos', 'estabais',
                     'estaban', 'estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis',
                     'estuvieron', 'estuviera', 'estuvieras', 'estuviéramos', 'estuvierais',
                     'estuvieran', 'estuviese', 'estuvieses', 'estuviésemos', 'estuvieseis',
                     'estuviesen', 'estando', 'estado', 'estada', 'estados', 'estadas',
                     'estad', 'he', 'has', 'ha', 'hemos', 'habéis', 'han', 'haya', 'hayas',
                     'hayamos', 'hayáis', 'hayan', 'habré', 'habrás', 'habrá', 'habremos',
                     'habréis', 'habrán', 'habría', 'habrías', 'habríamos', 'habríais',
                     'habrían', 'había', 'habías', 'habíamos', 'habíais', 'habían', 'hube',
                     'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron', 'hubiera',
                     'hubieras', 'hubiéramos', 'hubierais', 'hubieran', 'hubiese', 'hubieses',
                     'hubiésemos', 'hubieseis', 'hubiesen', 'habiendo', 'habido', 'habida',
                     'habidos', 'habidas', 'soy', 'eres', 'es', 'somos', 'sois', 'son',
                     'sea', 'seas', 'seamos', 'seáis', 'sean', 'seré', 'serás', 'será',
                     'seremos', 'seréis', 'serán', 'sería', 'serías', 'seríamos', 'seríais',
                     'serían', 'era', 'eras', 'éramos', 'erais', 'eran', 'fui', 'fuiste',
                     'fue', 'fuimos', 'fuisteis', 'fueron', 'fuera', 'fueras', 'fuéramos',
                     'fuerais', 'fueran', 'fuese', 'fueses', 'fuésemos', 'fueseis', 'fuesen',
                     'sintiendo', 'sentido', 'sentida', 'sentidos', 'sentidas', 'siente',
                     'sentís', 'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen',
                     'tenga', 'tengas', 'tengamos', 'tengáis', 'tengan', 'tendré', 'tendrás',
                     'tendrá', 'tendremos', 'tendréis', 'tendrán', 'tendría', 'tendrías',
                     'tendríamos', 'tendríais', 'tendrían', 'tenía', 'tenías', 'teníamos',
                     'teníais', 'tenían', 'tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis',
                     'tuvieron', 'tuviera', 'tuvieras', 'tuviéramos', 'tuvierais', 'tuvieran',
                     'tuviese', 'tuvieses', 'tuviésemos', 'tuvieseis', 'tuviesen', 'teniendo',
                     'tenido', 'tenida', 'tenidos', 'tenidas', 'tened'];
  
  const words = texts.join(' ').toLowerCase()
    .replace(/[^a-záéíóúñü\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.includes(w));
  
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);
}
```

#### 2. Agrupación por Categorías
```javascript
const categorias = {
  'Docentes': ['docente', 'profesor', 'maestro', 'enseñanza', 'clase'],
  'Calidad': ['calidad', 'bueno', 'excelente', 'malo', 'regular'],
  'Infraestructura': ['infraestructura', 'edificio', 'aula', 'laboratorio'],
  'Empleabilidad': ['empleo', 'trabajo', 'empleabilidad', 'laboral'],
  'Horarios': ['horario', 'flexibilidad', 'horarios', 'flexible'],
  'Prácticas': ['práctica', 'prácticas', 'practicar', 'preprofesional'],
  'Costos': ['costo', 'precio', 'caro', 'económico', 'beca'],
  'Posgrado': ['posgrado', 'maestría', 'especialidad', 'diplomado'],
};

function categorizeResponse(text, categories) {
  const textLower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(k => textLower.includes(k))) {
      return cat;
    }
  }
  return 'Otro';
}
```

---

## Indicadores Estadísticos

### Fórmulas Implementadas

```javascript
// 1. Tasa de ocupación
function tasaOcupacion(trabajadores, total) {
  return (trabajadores / total) * 100;
}

// 2. Margen de error (proporción, IC 95%)
function margenError(p, n) {
  return 1.96 * Math.sqrt((p * (1-p)) / n);
}

// 3. Tamaño mínimo de muestra
function tamanoMinimo(p, ME) {
  return Math.ceil((1.96 * 1.96 * p * (1-p)) / (ME * ME));
}

// 4. Índice de representatividad
function indiceRepresentatividad(n_muestra, N_universo) {
  return (n_muestra / N_universo) * 100;
}

// 5. NPS (Net Promoter Score)
function calcularNPS(scores) {
  const promotores = scores.filter(s => s >= 9).length;
  const detractores = scores.filter(s => s <= 6).length;
  return ((promotores - detractores) / scores.length) * 100;
}

// 6. Distribución porcentual
function distribucionPorcentual(datos) {
  const total = datos.length;
  const frecuencias = {};
  datos.forEach(d => frecuencias[d] = (frecuencias[d] || 0) + 1);
  return Object.entries(frecuencias).map(([cat, freq]) => ({
    categoria: cat,
    cantidad: freq,
    porcentaje: (freq / total) * 100
  }));
}
```

---

## Dependencias CDN

```html
<!-- Chart.js para gráficos interactivos -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- SheetJS para leer Excel -->
<script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>

<!-- html2canvas para exportar gráficos -->
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>

<!-- Chart.js Word Cloud plugin (para preguntas abiertas) -->
<script src="https://cdn.jsdelivr.net/npm/chartjs-chart-wordcloud@4.3.0/build/index.umd.min.js"></script>
```

---

## Diseño Visual

### Paleta de Colores
```css
:root {
  --primary: #1a365d;      /* Azul oscuro - institucional */
  --primary-light: #2c5282;
  --secondary: #2d7d46;    /* Verde - positivo */
  --danger: #c53030;       /* Rojo - alertas */
  --warning: #d69e2e;      /* Amarillo - advertencia */
  --gray-50: #f7fafc;
  --gray-100: #edf2f7;
  --gray-200: #e2e8f0;
  --gray-600: #718096;
  --gray-800: #2d3748;
  --white: #ffffff;
}
```

### Tipografía
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1, h2, h3 {
  font-weight: 600;
  color: var(--gray-800);
}
```

### Componentes
- **Cards:** Bordes redondeados, sombra sutil
- **Gráficos:** Tamaño responsivo, tooltips interactivos
- **Tablas:** Striped rows, hover effect
- **Filtros:** Dropdowns con búsqueda
- **Botones:** Outline primary, solid secondary

---

## Fases de Implementación

### FASE 2: Estructura Base (Día 1 - Mañana)
1. Crear estructura de directorios
2. Crear `index.html` con navegación lateral
3. Crear `css/styles.css` con estilos globales
4. Crear `js/dataLoader.js` para carga de Excel
5. Crear `js/app.js` para lógica principal

### FASE 3: Página Representatividad (Día 1 - Tarde)
1. Implementar `pages/representatividad.html`
2. Gráficos de distribución por facultad/carrera
3. Tabla comparativa con universo
4. KPIs resumen

### FASE 4: Página Ocupación y Empleabilidad (Día 2 - Mañana)
1. Implementar `pages/ocupacion.html`
2. Implementar `pages/empleabilidad.html`
3. Gráficos de barras y donuts
4. Análisis por carrera

### FASE 5: Página NID y Ranking (Día 2 - Tarde)
1. Implementar `pages/nid.html`
2. Implementar `pages/ranking.html`
3. Tablas comparativas
4. Alertas de carreras bajas

### FASE 6: Margen de Error y Robustez (Día 3 - Mañana)
1. Implementar `pages/margen-error.html`
2. Implementar `pages/robustez.html`
3. Fórmulas estadísticas
4. Tablas con intervalos de confianza

### FASE 7: Preguntas Abiertas (Día 3 - Tarde)
1. Implementar `pages/preguntas-abiertas.html`
2. Funciones de procesamiento de texto
3. Word clouds y frecuencias
4. Categorización automática

### FASE 8: Test de Calidad (Día 4 - Mañana)
1. Verificar cálculos estadísticos
2. Validar gráficos con datos conocidos
3. Probar navegación entre páginas
4. Verificar responsive design

### FASE 9: Exportación y Funcionalidades Finales (Día 4 - Tarde)
1. Implementar exportación PNG
2. Implementar exportación CSV
3. Implementar exportación PDF
4. Botón de actualización de datos
5. Documentación de uso

---

## Notas Metodológicas para el Informe

### Definiciones Clave
1. **PEA (Población Económicamente Activa):** Egresados de 21+ años en edad de trabajar
2. **Tasa de Ocupación:** (Trabajadores / Total PEA) × 100
3. **Margen de Error:** IC 95% (Z=1.96), fórmula de proporción
4. **Tamaño Mínimo Válido:** n ≥ 30 para cálculos por carrera
5. **Cohorte 2020-2024:** Datos del Universo cubren 2021-2025

### Limitaciones del Estudio
1. Tasa de respuesta del 29.5%
2. Posible sesgo de selección (respondieron más los que trabajan)
3. Datos auto-reportados (posible sesgo de social)
4. Algunas carreras con muestras pequeñas (n<30)
5. Preguntas abiertas con respuestas inconsistentes

### Recomendaciones
1. Aumentar tasa de respuesta en próximas ediciones
2. Implementar seguimiento telefónico
3. Considerar incentivos para participación
4. Estandarizar respuestas de preguntas abiertas
5. Validar datos con registros de RRHH
