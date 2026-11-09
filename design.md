# EmpleaKit Wiener — Design System & Guidelines

> Documento maestro de diseno para la plataforma EmpleaKit de la Universidad Norbert Wiener.
> Toda decision visual del proyecto DEBE obedecer a este documento. Si un componente contradice estas reglas, este documento tiene prioridad.

---

## Tabla de Contenidos

1. [Reglas No Negociables](#1-reglas-no-negociables)
2. [Anti-Patrones Prohibidos](#2-anti-patrones-prohibidos)
3. [Identidad Visual de Marca](#3-identidad-visual-de-marca)
4. [Estetica Visual (Aesthetic Code)](#4-estetica-visual-aesthetic-code)
5. [Sistema Cromatico](#5-sistema-cromatico)
6. [Sistema Tipografico](#6-sistema-tipografico)
7. [Jerarquia de la Informacion](#7-jerarquia-de-la-informacion)
8. [Verticalidad: Ritmo y Macro-Estructura](#8-verticalidad-ritmo-y-macro-estructura)
9. [Horizontalidad: Contencion y Micro-Interacciones](#9-horizontalidad-contencion-y-micro-interacciones)
10. [Principios de Diseno y Composicion](#10-principios-de-diseno-y-composicion)
11. [Sistema de Grid y Layout](#11-sistema-de-grid-y-layout)
12. [Fotografia y Recursos Visuales](#12-fotografia-y-recursos-visuales)
13. [Componentes y UI Library](#13-componentes-y-ui-library)
14. [Animaciones y Micro-Interacciones](#14-animaciones-y-micro-interacciones)
15. [Accesibilidad (a11y)](#15-accesibilidad-a11y)
16. [Responsive Design](#16-responsive-design)
17. [Banners y Elementos Web](#17-banners-y-elementos-web)
18. [Claims y Copy por Seccion](#18-claims-y-copy-por-seccion)

---

## 1. Reglas No Negociables

Estas reglas son **INVIOLABLES**. Ningun agente de IA, disenedor o desarrollador puede omitirlas, "interpretarlas" o "mejorarlas" segun su criterio. Si algo entra en conflicto con este documento, este documento gana.

### 1.1 Marca

- **NUNCA** usar el logotipo con tagline cuando el headline ya contiene conceptos de la bajada institucional ("vida", "ciencia").
- **NUNCA** usar el logotipo sin tagline en contexts genericos donde el claim es necesario para reforzar posicionamiento.
- **NUNCA** alterar, estirar, comprimir, girar, recortar o modificar colores del logotipo.
- **NUNCA** colocar elementos dentro del area de seguridad del logotipo (1 modulo del isotipo).
- **SIEMPRE** respetar el tamano minimo: 1cm / 140px (sin tagline), 2cm / 200px (con tagline).

### 1.2 Color

- **NUNCA** usar colores fuera de la paleta definida para un servicio especifico.
- **NUNCA** aplicar gradientes que no existan en el playbook oficial.
- **NUNCA** usar el turquesa primario (#07C8CC) como color de texto sobre fondos claros sin contraste suficiente.
- **SIEMPRE** usar el color asignado a la unidad de negocio para piezas de esa unidad.

### 1.3 Tipografia

- **NUNCA** usar fuentes que no sean N27 para titulares institucionales.
- **NUNCA** modificar el tracking (-20pts) ni el line-height (100pts) de los titulares de nivel N1.
- **SIEMPRE** mantener la jerarquia tipografica definida por seccion.

### 1.4 Contenido

- **NUNCA** usar texto de relleno ("Lorem ipsum", "Optimiza tus procesos", "Escalabilidad sin limites") en ningun componente de produccion.
- **NUNCA** generar layouts de 3 columnas identicas con icono + titulo + descripcion generica.
- **SIEMPRE** usar contenido real, especifico y cuantificable.

### 1.5 Accesibilidad

- **NUNCA** usar contrastes menores a 4.5:1 para texto normal, 3:1 para texto grande.
- **NUNCA** usar glassmorphism sobre fondos complejos que destruyan legibilidad.
- **SIEMPRE** proporcionar alternativas de texto para imagenes decorative.
- **SIEMPRE** asegurar navegacion completa por teclado.

---

## 2. Anti-Patrones Prohibidos

### 2.1 Hero "SaaS Generica"

**PROHIBIDO:**
- Titulo gigante centrado con texto en degradado de violeta a cian.
- Subtitulo generico que promete "revolucionar tu flujo de trabajo".
- Dos botones CTA identicos al centro (uno "Empezar Gratis" y otro "Ver Demo").
- Centrado simetrico de todo el contenido del hero.

**CORRECTO:**
- Jerarquia de lectura natural con alineacion a la izquierda.
- Diseno basado en conversion real, no en simetria decorativa.
- Titular que comunica valor especifico y medible.
- CTA unico y claro que refleje la accion principal deseada.
- Asimetria controlada: texto a la izquierda, peso visual (imagen/formulario) a la derecha.

### 2.2 Ilustraciones 3D de Arcilla y "Blobs"

**PROHIBIDO:**
- Manos 3D de estilo arcilla flotando.
- Esferas metalicas reflectantes.
- Formas organicas de fondo ("blobs") que no responden a la identidad de marca.
- Cualquier recurso visual de stock que pueda compartir estetica con cientos de webs identicas.

**CORRECTO:**
- Recursos graficos que responden estrictamente a la identidad de marca.
- Paleta cromatica corporativa en todos los elementos visuales.
- Fotografia real contextual (estudiantes, campus, tecnología) que represente la experiencia Wiener.
- Ilustraciones planas o semi-planas que sigan la paleta de colores del playbook.

### 2.3 Jerarquia Tipografica y Espaciados Roboticos

**PROHIBIDO:**
- Combinaciones tipograficas seguras pero aburridas con pesos arbitrarios.
- Espaciado identico y simetrico en todo el sitio sin importar el ritmo visual.
- Tamanos de fuente que no sigan una escala semantica clara.

**CORRECTO:**
- Compensacion optica en todos los elementos tipograficos.
- Escalas tipograficas con proposito semantico (no decorativo).
- Interlineados ajustados a la legibilidad, no a la simetria.
- Contrastes de tamano drasticos para dirigir la atencion humana de manera intuitiva.

### 2.4 Animaciones de Scroll Excesivas

**PROHIBIDO:**
- Aplicar fade-in con desplazamiento hacia arriba a absolutamente todos los elementos.
- Efectos de desvanecimiento en cada seccion al hacer scroll.
- Animaciones que distraigan al usuario en lugar de guiarlo.

**CORRECTO:**
- Micro-animaciones con moderacion extrema.
- Animaciones reservadas para: retroalimentacion interactiva (hover, click) o transiciones de contenido criticas.
- Preferir transiciones de 200-300ms sobre animaciones largas.
- Nunca animar elementos que estan fuera del viewport del usuario actual.

### 2.5 Cuadricula de Caracteristicas con Texto de Relleno

**PROHIBIDO:**
- Estructuras repetitivas de 3 columnas identicas: icono en recuadro + titulo en negrita + 2 lineas de texto corporativo vacio.
- Textos como "Optimiza tus procesos", "Escalabilidad sin limites", "Innovacion constante".
- Layouts que no aporten informacion real o actionable.

**CORRECTO:**
- Modulos disenados basados en casos de uso reales.
- Datos cuantitativos que demuestren impacto (ej: "85% de empleabilidad", "14 plantillas oficiales").
- Layouts asimetricos que rompan la monotonia de la lectura.
- Contenido que responda a preguntas reales del usuario.

### 2.6 Glassmorphism y Problemas de Accesibilidad

**PROHIBIDO:**
- Interfaces saturadas con efectos de vidrio esmerilado.
- Bordes semitransparentes de un pixel blanco sobre fondos complejos.
- Sombras difusas que destruyan el contraste visual.
- Textos que pierdan legibilidad en pantallas con brillo bajo.

**CORRECTO:**
- Estandares de accesibilidad como prioridad absoluta.
- Relaciones de contraste que cumplan con WCAG 2.1 AA minimo.
- Limpieza visual que no sacrifique legibilidad.
- Superficies opacas o semi-opacas con contraste garantizado.

---

## 3. Identidad Visual de Marca

### 3.1 Logotipo

#### Versiones oficiales

| Version | Uso | Tamano minimo |
|---------|-----|---------------|
| Logo principal (sin tagline) | Piezas donde el headline ya contiene "vida" o "ciencia" | 1cm / 140px |
| Logo con tagline | Piezas genericas donde el claim complementa el mensaje | 2cm / 200px |

#### Area de seguridad

Basada en el alto de la fraccion del isotipo de Norbert Wiener. Ningun elemento debe invadir esta area virtual.

#### Usos incorrectos (PROHIBIDOS)

1. Alterar el orden del logotipo.
2. Estirar ni comprimir el logotipo.
3. Girar el logotipo.
4. Modificar la proporcion de los elementos.
5. Quitar elementos del logotipo.
6. Cambiar la tipografia.
7. Modificar el color de los elementos del logotipo.
8. Alterar el orden de los elementos.
9. Agregar efectos que impidan la legibilidad.

### 3.2 Versiones de Degradado

El logotipo cuenta con versiones de degradado para distintos fondos:
1. Fondo generico
2. Fondo Pregrado
3. Fondo Online
4. Fondo Posgrado
5. Fondo EDEX

### 3.3 Positivo y Negativo

El logotipo en blanco y negro es de uso exclusivo para aplicaciones con restricciones de impresion de colores originales.

- Pantone Black C
- C:0 M:0 Y:0 K:100
- R:0 G:0 B:0
- HEX: #000000

---

## 4. Estetica Visual (Aesthetic Code)

### 4.1 Identidad Traducida al Entorno Digital

El estilo de la Universidad Norbert Wiener se inscribe en la tendencia **"Clean Corporate UI"** (Interfaz Corporativa Limpia) con toques de **Flat Design 2.0** (Diseno plano interactivo).

**No** es un sitio puramente academico aburrido, sino que adopta una estetica de **"SaaS educativo"**. Es moderno, aseptico y orientado a resultados.

### 4.2 Minimalismo Funcional

- Se rechaza el recargo visual (horror vacui).
- El diseno confia en el espacio negativo para respirar.
- Se evitan texturas, patrones complejos o gradientes pesados en los fondos.
- Cada elemento debe tener una razon de existir; si no aporta, se elimina.

### 4.3 Elevacion y Profundidad (Flat 2.0)

El sitio es mayormente plano, pero utiliza la profundidad **estrategicamente**:

- **Sombras paralelas (Drop Shadows)**: Se reservan UNICAMENTE para elementos interactivos (tarjetas de carreras, tarjetas de noticias, formulario flotante).
- **Plano Z**: La sombra le dice al cerebro del usuario instintivamente: "esto se puede tocar/clickear".
- **Nunca** usar sombras en elementos estaticos decorativos.
- **Nunca** usar sombras multiples o superpuestas.

---

## 5. Sistema Cromatico

### 5.1 Paleta Primaria

| Color | Pantone | RGB | HEX | CMYK | Uso |
|-------|---------|-----|-----|------|-----|
| **Turquesa Wiener** | 307 C | 7-200-204 | `#07C8CC` | 91-00-36-00 | Color principal de marca, acentos, CTAs |

### 5.2 Paleta Secundaria por Unidad de Negocio

| Unidad | HEX | RGB | CMYK | Uso |
|--------|-----|-----|------|-----|
| **Pregrado** | `#368BA1` | 54-139-161 | 75-28-29-7 | Piezas de pregrado |
| **Online** | `#284E4E` | 40-78-78 | 93-49-50-48 | Programas online |
| **Posgrado** | `#DCB17C` | 220-177-124 | 14-32-55-3 | Maestrias |
| **EDEX** | `#F08568` | 240-133-104 | — | Segundas especialidades |
| **Diplomados** | `#F2D963` | 242-217-99 | 8-11-71-0 | Diplomados |
| **Prog. Especializacion** | `#C96590` | 201-101-144 | — | Programas de especializacion |
| **MBA** | `#284E4E` | 40-78-78 | — | MBA |

### 5.3 Neutros

| Color | HEX | Uso |
|-------|-----|-----|
| Negro | `#000000` | Texto principal |
| Gris oscuro | `#1A1A2E` | Texto secundario |
| Gris medio | `#6B7280` | Texto terciario, placeholders |
| Gris claro | `#F3F4F6` | Fondos de seccion alternos |
| Blanco | `#FFFFFF` | Fondos principales |

### 5.4 Reglas de Color

- El turquesa `#07C8CC` se usa para: CTAs activos, links, acentos interactivos, icons de accion.
- Los colores secundarios se usan EXCLUSIVAMENTE para piezas de su unidad de negocio.
- NUNCA usar el turquesa como color de fondo de secciones completas (solo como acento).
- NUNCA usar colores secundarios fuera del contexto de su unidad.
- El fondo de las secciones alterna entre blanco `#FFFFFF` y gris claro `#F3F4F6`.

---

## 6. Sistema Tipografico

### 6.1 Fuente Principal

**N27** — tipografia moderna y versatil.

| Peso | Uso |
|------|-----|
| N27 Regular | Body text, parrafos, descripciones |
| N27 Medium | Subtitulos, labels, navegacion |
| N27 Bold | Titulares principales, CTAs, numeros destacados |

### 6.2 Jerarquia Tipografica Web

| Nivel | Tamano (Desktop) | Tamano (Mobile) | Line-height | Letter-spacing | Peso | Uso |
|-------|------------------|-----------------|-------------|----------------|------|-----|
| **H1** | 48-56px | 32-36px | 1.1 | -0.02em | Bold | Titular principal de pagina |
| **H2** | 36-40px | 28-32px | 1.2 | -0.01em | Bold | Titulares de seccion |
| **H3** | 24-28px | 22-24px | 1.3 | 0 | Medium | Subtitulos de seccion |
| **H4** | 18-20px | 16-18px | 1.4 | 0 | Medium | Titulares de componente |
| **Body L** | 18px | 16px | 1.6 | 0 | Regular | Texto de hero, introducciones |
| **Body** | 16px | 15px | 1.6 | 0 | Regular | Texto general |
| **Body S** | 14px | 13px | 1.5 | 0.01em | Regular | Texto secundario, captions |
| **Caption** | 12px | 11px | 1.4 | 0.02em | Medium | Labels, metadata, timestamps |

### 6.3 Reglas Tipograficas

- **NUNCA** usar mas de 2 fuentes en una misma pagina (N27 + una fuente monoespaciada si es estrictamente necesaria para codigo).
- **NUNCA** usar pesos arbitrarios; cada elemento tiene un peso asignado por su nivel jerarquico.
- **NUNCA** usar tracking positivo en titulares (excepto captions y labels).
- **SIEMPRE** mantener consistencia: todos los H2 de la misma pagina tienen identico tamano, peso y spacing.
- **Compensacion optica**: cuando un titular se siente visualmente "mas pesado" que su contexto, reducir ligeramente el tamano o el weight, no el spacing.

---

## 7. Jerarquia de la Informacion

### 7.1 Embudo de Conversion

La jerarquia no solo ordena textos por tamano, sino que estructura una narrativa de persuasion a medida que el usuario desciende.

#### Bloque 1: El Gancho Emocional/Funcional ("Above the fold")

Lo que se ve sin hacer scroll. La jerarquia prioriza:
- **Home**: Fotografia inmersiva, titular de impacto, CTA principal.
- **Paginas de carrera/servicio**: Formulario flotante que rompe la cuadricula a la derecha, exigiendo atencion inmediata.

#### Bloque 2: La Justificacion Racional

Inmediatamente debajo del Hero:
- Vignettes, iconos o resumenes rapidos.
- "¿Por que U. Wiener?" o "Resumen del servicio".
- El cerebro escanea primero razones logicas antes de profundizar.

#### Bloque 3: La Prueba Social (Social Proof)

- Testimonios de egresados.
- Cifras de empleabilidad.
- Alianzas internacionales.
- **Nunca** van arriba; se colocan en el medio/abajo para validar la decision que el usuario esta formando.

### 7.2 Patrones de Escaneo

- **Escaneo en "F"**: Para paginas de contenido largo (blog, detalles de carrera). Titulares alineados a la izquierda como puntos de anclaje visual.
- **Escaneo en "Z"**: Para secciones modulares (cards, features). El ojo va de esquina superior izquierda a derecha, luego cruza diagonalmente hacia abajo-izquierda y termina en la derecha.

---

## 8. Verticalidad: Ritmo y Macro-Estructura

La verticalidad dicta el ritmo de lectura (Pacing). El diseno maneja el scroll vertical de manera excelente para evitar la monotonia.

### 8.1 Color Banding (Bandas de Color)

Para evitar que el usuario sienta que esta bajando por un documento de Word infinito, el diseno corta la verticalidad utilizando:

- **Franjas horizontales de color de borde a borde (Full-width)**.
- Alterna entre blanco `#FFFFFF` y gris claro `#F3F4F6`.
- Esto resetea la atencion del usuario en cada nueva seccion.

### 8.2 Bloques de Ruptura Visual

En medio de secciones claras, se insertan bloques con fondo solido primario (turquesa `#07C8CC` o color de la unidad). Esto actua como un **"lomo de burro" visual** que obliga al usuario a detener su scroll vertical y prestar atencion a datos clave.

### 8.3 Patron de Ritmo

```
[Blanco] Hero / Seccion principal
[Gris]   Contenido de apoyo / Features
[Turquesa] Dato clave / CTA / Ruptura visual
[Blanco] Prueba social / Testimonios
[Gris]   Contenido secundario
[Turquesa] CTA final / Cierre
```

**Regla**: Nunca mas de 2 secciones del mismo fondo seguidas sin una ruptura visual.

---

## 9. Horizontalidad: Contencion y Micro-Interacciones

Mientras la verticalidad cuenta la historia, la horizontalidad gestiona la carga cognitiva.

### 9.1 Carruseles y Sliders

Una de las normas de diseno mas marcadas en este sistema:

- En lugar de apilar verticalmente 10 programas, 6 testimonios o 4 eventos, el diseno los empaqueta **horizontalmente** en contenedores interactivos.
- Sliders con flechas laterales para navegacion.
- La horizontalidad se usa para **ocultar informacion secundaria bajo demanda**.
- Mantiene la pagina corta verticalmente, invitando al usuario a explorar lateralmente solo si el tema especifico le interesa.

### 9.2 Paginacion Horizontal de Utilidad

- En secciones de servicios/tramites, se usa una tira horizontal de iconos.
- Maximiza el espacio en pantalla de escritorio.
- Se adapta perfectamente al gesto de deslizamiento (swipe) en dispositivos moviles.

### 9.3 Regla del Slider

| Cantidad | Presentacion |
|----------|-------------|
| 1-3 elementos | Grid vertical, sin slider |
| 4-6 elementos | Slider con 2-3 visibles |
| 7+ elementos | Slider con scroll snapping |

---

## 10. Principios de Diseno y Composicion

### 10.1 Ley de Proximidad

Las tarjetas estan disenadas de forma compacta. La imagen, el titulo, la descripcion y el enlace de "Ver mas" estan tan cerca entre si que el cerebro los percibe como **un solo objeto interactivo**.

**Regla**: Si dos elementos pertenecen al mismo "objeto visual", la distancia entre ellos debe ser menor que la distancia hacia cualquier otro objeto.

### 10.2 Asimetria Controlada en el Hero

Los banners principales huyen de la simetria central:
- Texto alineado a la izquierda.
- Peso visual de la imagen o del formulario a la derecha.
- Genera dinamismo y evita la sensacion de "poster estatico".

### 10.3 Simetria en los Contenidos Internos

Una vez superado el banner principal, la web se vuelve **estRICTAMENTE simetrica** (cuadriculas de 3 o 4 columnas exactas).

**Transicion clave**: De asimetria (para inspirar) a simetria (para informar). Esta es una norma clasica en el diseno corporativo de alta calidad.

### 10.4 Proporcion Aurea y Regla de Tercios

- Los elementos visuales principales se ubican en los puntos de interseccion de la regla de tercios.
- Las imagenes de hero usan proporcion 16:9 o 3:2.
- Las tarjetas mantienen proporcion 4:3 o 1:1 para thumbnails.

---

## 11. Sistema de Grid y Layout

### 11.1 Grid Base

| Propiedad | Desktop (>1280px) | Tablet (768-1280px) | Mobile (<768px) |
|-----------|-------------------|---------------------|-----------------|
| Columnas | 12 | 8 | 4 |
| Gutters | 24px | 20px | 16px |
| Margen lateral | 80px | 40px | 20px |
| Ancho maximo | 1200px | 100% | 100% |

### 11.2 Espaciados

| Token | Desktop | Tablet | Mobile | Uso |
|-------|---------|--------|--------|-----|
| `space-xs` | 4px | 4px | 4px | Spacing interno minimo |
| `space-sm` | 8px | 8px | 8px | Spacing entre elementos hermanos |
| `space-md` | 16px | 16px | 12px | Spacing entre grupos de elementos |
| `space-lg` | 24px | 20px | 16px | Spacing entre secciones pequenas |
| `space-xl` | 48px | 36px | 24px | Spacing entre secciones |
| `space-2xl` | 80px | 60px | 40px | Spacing entre bloques principales |
| `space-3xl` | 120px | 80px | 56px | Spacing del hero |

### 11.3 Breakpoints

| Nombre | Ancho | Uso |
|--------|-------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / Desktop pequeno |
| `xl` | 1280px | Desktop estandar |
| `2xl` | 1536px | Desktop grande |

---

## 12. Fotografia y Recursos Visuales

### 12.1 Estilo Fotografico

#### Contexto: Estudio
- Representar de forma clara las carreras de la institucion.
- Acting activo y positivo.
- Armonia de colores vibrantes.
- Iluminacion adecuada con contrastes que evoquen emocion.
- Se adecuan a la carrera y/o al objetivo de comunicacion.

#### Contexto: Tecnologia
- Representar de manera futurista la tecnologia, a traves de efectismos.
- Acting activo y positivo.
- Armonia de colores vibrantes.
- Iluminacion con contrastes dramaticos.

### 12.2 Prompts de Referencia para IA Generativa

Para generar imágenes con IA, usar estos prompts como base adaptándolos libremente al contexto y carrera. **Importante:** El uso de laptops, madera o props específicos es únicamente referencial y puede sustituirse por cualquier entorno o acción activa que transmita excelencia, profesionalismo y dinamismo. Lo prioritario y no negociable son: **el realismo hiperdetallado, la iluminación cinemática natural con contraste emocional, el encuadre fotográfico profesional (85mm/50mm, f/2.0-f/2.8) y la autenticidad en la representación de estudiantes/egresados peruanos**.

**Opción A — Retrato Editorial de Vanguardia (Arquitectura Contemporánea / Movimiento Activo):**
```
Award-winning commercial editorial portrait of a charismatic, confident young Peruvian graduate and emerging professional in mid-stride through a modern glass and architectural concrete university innovation atrium. Authentic Peruvian features, radiant and genuinely confident expression, looking forward with optimism. Wearing a stylish contemporary slate-grey tailored blazer over a crisp textured minimalist shirt, clean clothing with absolutely no badges, pins, text, or logos. Expansive floor-to-ceiling glass architecture with soft diffused morning sunlight streaming in, high airy ceilings, clean geometric architectural lines, subtle ambient cyan-teal architectural LED accents in distant background, distant blurry students walking in deep bokeh. Volumetric cinematic natural light, delicate golden rim lighting tracing hair and shoulders, warm natural skin tones with realistic pores and fine texture, subtle subsurface scattering, shot on 85mm f/2.0 lens, shallow depth of field, creamy bokeh, ultra-detailed, photorealistic, 8k commercial masterpiece.
```

**Opción B — Pabellón de Innovación y Liderazgo:**
```
High-end commercial lifestyle photography of a confident young Peruvian professional graduate in a warm modern architectural university innovation pavilion. Not using any laptop; instead holding an elegant executive leather portfolio and professional tablet with confidence, looking forward with a radiant, authentic and approachable smile. Contemporary minimalist interior with light oak wood architectural paneling, large glass windows with soft diffused cinematic sunlight streaming in, soft green botanical accents, clean lines, warm neutral beige and timber palette with subtle ambient turquoise cyan (#07C8CC) architectural light accents in the background. Shallow depth of field, creamy soft bokeh, realistic natural skin texture, editorial magazine photography, premium higher-education commercial campaign, authentic Peruvian diversity, 50mm lens, f/2.8, 8k, photorealistic.
```

**Opción B — Estudio / Home Office:**
```
High-end commercial lifestyle photography using a laptop in a warm modern home office,
cozy residential environment, wooden furniture, minimalist interior design, soft decorative,
natural authentic expression, professional yet approachable mood, cinematic natural lighting,
shallow depth of field, soft bokeh, premium advertising campaign, realistic skin texture,
editorial photography, warm neutral color palette, beige and wood tones, ultra realistic.

Horizontal composition, landscape orientation (16:9), professional commercial framing,
subject positioned naturally within the scene, spacious composition with negative space
for advertising copy and branding elements.

Full-frame camera, 50mm lens, f/2.8, photorealistic, luxury lifestyle branding,
premium corporate marketing photography, ultra detailed, 8k.
```

### 12.3 Prohibiciones Fotograficas

- **NUNCA** usar imagenes de stock genericas de negocios (personas con traje dando la mano).
- **NUNCA** usar ilustraciones 3D de estilo arcilla.
- **NUNCA** usar blobs o formas organicas abstractas como fondo.
- **NUNCA** usar imagenes que no representen la realidad peruana o la experiencia Wiener.
- **SIEMPRE** usar fotografias que muestren diversidad real de estudiantes peruanos.

---

## 13. Componentes y UI Library

### 13.1 Botones

#### Boton Primario
```css
/* Estilo base */
background: #07C8CC;
color: #FFFFFF;
border-radius: 8px;
padding: 12px 24px;
font-family: 'N27', sans-serif;
font-weight: 500;
font-size: 16px;
line-height: 1.4;
transition: background 200ms ease, transform 150ms ease;

/* Hover */
background: #05A8AB;
transform: translateY(-1px);

/* Active */
background: #048E90;
transform: translateY(0);
```

#### Boton Secundario
```css
background: transparent;
color: #07C8CC;
border: 2px solid #07C8CC;
border-radius: 8px;
padding: 10px 22px; /* 2px menos por el borde */

/* Hover */
background: rgba(7, 200, 204, 0.08);
```

#### Boton Texto
```css
background: transparent;
color: #07C8CC;
padding: 8px 12px;

/* Hover */
text-decoration: underline;
```

### 13.2 Tarjetas (Cards)

#### Tarjeta Basica
```css
background: #FFFFFF;
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* Solo en elementos interactivos */
padding: 24px;
transition: box-shadow 200ms ease, transform 200ms ease;

/* Hover (solo si es clickeable) */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);
```

#### Tarjeta de Carrera
```css
/* Estructura */
imagen (proporcion 16:9) → titulo (H3) → meta (carrera, modalidad) → CTA

/* Reglas */
- La imagen SIEMPRE cubre el contenedor (object-fit: cover)
- El titulo usa N27 Bold 18-20px
- La meta usa N27 Regular 14px en gris
- El CTA es un link de texto, no un boton
```

### 13.3 Formularios

#### Input
```css
border: 1px solid #D1D5DB;
border-radius: 8px;
padding: 12px 16px;
font-family: 'N27', sans-serif;
font-size: 16px;
color: #1A1A2E;
background: #FFFFFF;

/* Focus */
border-color: #07C8CC;
box-shadow: 0 0 0 3px rgba(7, 200, 204, 0.15);
outline: none;
```

#### Formulario Flotante (Hero de Carrera)
```css
/* Rompe la cuadricula del grid */
position: relative;
z-index: 10;
background: #FFFFFF;
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
padding: 32px;
```

### 13.4 Navegacion

#### Header
```css
height: 72px;
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(8px); /* Solo blur, no glassmorphism */
border-bottom: 1px solid rgba(0, 0, 0, 0.06);
position: sticky;
top: 0;
z-index: 100;
```

---

## 14. Animaciones y Micro-Interacciones

### 14.1 Filosofia

Las animaciones en EmpleaKit siguen el principio de **"menos es mas"**:

- Solo animar para dar **retroalimentacion interactiva** (hover, click, cambio de estado).
- Solo animar para **marcar transiciones de contenido criticas** (apertura de modal, cambio de pagina).
- **NUNCA** animar por animar. Si no hay una razon funcional, no hay animacion.

### 14.2 Tokens de Animacion

| Token | Duracion | Easing | Uso |
|-------|----------|--------|-----|
| `duration-fast` | 150ms | ease-out | Hover states, toggles |
| `duration-normal` | 200ms | ease-in-out | Transiciones de contenido |
| `duration-slow` | 300ms | ease-in-out | Apertura de modales, slides |
| `duration-page` | 350ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Transiciones de pagina |

### 14.3 Animaciones Permitidas

| Tipo | Propiedad CSS | Ejemplo |
|------|--------------|---------|
| **Hover elevacion** | `transform`, `box-shadow` | Tarjetas que suben 2px |
| **Hover color** | `background-color`, `color` | Botones que cambian tono |
| **Focus ring** | `box-shadow` | Inputs con anillo de foco |
| **Transicion de pagina** | `opacity`, `transform` | Fade + slide leve (12px) |
| **Loading skeleton** | `background-position` | Placeholder animado |

### 14.4 Animaciones PROHIBIDAS

- **Fade-in + translateY en scroll** para todos los elementos de la pagina.
- **Parallax scrolling** en multiples capas.
- **Animaciones de entrada** que retrasen la carga util del contenido.
- **Hover que cambie el tamano** de texto o imagenes.
- **Cualquier animacion** que dure mas de 500ms sin una razon funcional critica.

### 14.5 Reduccion de Movimiento

Respetar la preferencia del usuario:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 15. Accesibilidad (a11y)

### 15.1 Estandares

- **WCAG 2.1 AA** como minimo absoluto.
- **WCAG 2.1 AAA** para componentes criticos (formularios, CTAs).

### 15.2 Contraste

| Tipo de texto | Contraste minimo | Ejemplo |
|---------------|------------------|---------|
| Texto normal (<18px) | 4.5:1 | Parrafos, labels |
| Texto grande (>=18px bold o >=24px) | 3:1 | Titulares, CTAs |
| Componentes UI | 3:1 | Bordes de input, iconos |

### 15.3 Navegacion por Teclado

- Todos los elementos interactivos deben ser alcanzables con Tab/Shift+Tab.
- El orden de tabulacion debe seguir el orden visual de la pagina.
- **Focus visible**: nunca eliminar el outline; usar un ring de foco personalizado que cumpla 3:1 de contraste.
- Implementar atajos de teclado para navegacion entre secciones (Alt+1 para Home, etc.).

### 15.4 Lectores de Pantalla

- Agregar `aria-labels` descriptivos a todos los botones, inputs y componentes.
- Implementar `aria-live` regions para notificaciones de estado (descarga completada, error, etc.).
- Usar semantic HTML correcto: `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`.
- Los iconos decorativos deben tener `aria-hidden="true"`.

### 15.5 Formularios

- Cada input debe tener un `<label>` asociado via `for`/`id`.
- Los mensajes de error deben asociarse via `aria-describedby`.
- Los campos requeridos deben indicarse via `aria-required` y visualmente.
- Los grupos de inputs deben usar `<fieldset>` y `<legend>`.

---

## 16. Responsive Design

### 16.1 Filosofia

- **Mobile-first**: disenar primero para movil, luego escalar a desktop.
- **Contenido prioritario**: en movil, lo mas importante siempre esta visible.
- **Gestos naturales**: swipe para sliders, pull-to-refresh si aplica.

### 16.2 Adaptaciones por Breakpoint

| Componente | Desktop | Tablet | Mobile |
|------------|---------|--------|--------|
| Header | Logo + nav horizontal + CTA | Logo + hamburger | Logo + hamburger |
| Hero | 2 columnas (texto + imagen/formulario) | 2 columnas (ajustado) | 1 columna (stacked) |
| Cards | 3-4 columnas | 2 columnas | 1 columna |
| Slider | 3 visibles | 2 visibles | 1 visible |
| Formulario | Flotante a la derecha | Flotante centrado | Full-width debajo del hero |
| Footer | 4 columnas | 2 columnas | 1 columna (acordeon) |

### 16.3 Touch Targets

- Minimo 44x44px para elementos interactivos en movil.
- Espaciado minimo de 8px entre elementos clickeables.

---

## 17. Banners y Elementos Web

### 17.1 Contenedor de Fondo

El contenedor de fondo es un recurso modular disenado para adaptarse a los distintos espacios y formatos de la web, manteniendo la identidad visual sin afectar la lectura del contenido.

**Regla**: En estas aplicaciones **no es necesario** incluir el logotipo dentro de la pieza, ya que la marca ya se encuentra presente en la interfaz principal del sitio. Esto evita redundancia y mantiene una comunicacion mas limpia y ordenada.

### 17.2 Estructura de Banners Web

```
┌─────────────────────────────────────────────────┐
│  [Fondo de color / Degradado de unidad]          │
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │  [Contenido modular]                     │     │
│  │  - Titular (H2 o H3)                     │     │
│  │  - Descripcion breve                     │     │
│  │  - CTA (boton o link)                    │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
│  [Opcional: imagen de apoyo a la derecha]         │
└─────────────────────────────────────────────────┘
```

---

## 18. Claims y Copy por Seccion

### 18.1 Niveles de Claim

| Nivel | Claim | Contexto |
|-------|-------|----------|
| **N1** | "Donde la vida se encuentra con la ciencia" | Institucional, aspiracional. Marca macro. |
| **N2** | "La formula de la vida" | Concepto paraguas. Intriga, landing, storytelling. |
| **N3** | "Donde tu talento se encuentra con tu futuro" | Bajada por unidad de negocio (Pregrado). |
| **N4** | "Donde el dolor se encuentra con la cura" | Bajada por carrera (Medicina). Ejemplo. |
| **N5** | "Cuando tu vocacion se encuentra con la vida de alguien" | Copy de escena. Aplicacion practica. |
| **N6** | Tension + diferencial curricular | Argumento + RTB. El "por que ahora". |

### 18.2 Claims por Unidad de Negocio

| Unidad | Claim |
|--------|-------|
| **Generico/Institucional** | Donde la vida se encuentra con la ciencia. |
| **Pregrado** | Donde tu talento se encuentra con su futuro. |
| **Online** | Donde tus ganas encuentran herramientas. |
| **Posgrado** | Donde tu experiencia se encuentra con su evolucion. |
| **EDEX** | Donde tu gestion se encuentra con su especializacion. |

### 18.3 EmpleaKit — Copy Especifico

Para la plataforma EmpleaKit, los claims se adaptan al contexto de empleabilidad:

| Seccion | Claim / Headline |
|---------|-----------------|
| **Home** | "Donde tu talento se encuentra con tu futuro laboral." |
| **Builder CV** | "Tu CV, profesional en minutos." |
| **Analisis ATS** | "Tu CV, listo para ser detectado." |
| **Bolsa de Empleo** | "Las oportunidades que buscas, reunidas para ti." |
| **Plantillas** | "14 formatos oficiales, uno para cada objetivo." |

---

## Aplicacion por Unidad de Negocio

### Pregrado

- Color asignado: `#368BA1`
- Claim: "Donde tu talento se encuentra con su futuro."
- tono: Aspiracional, juvenil, orientado a oportunidades.
- Fotografia: Estudiantes en campus, laboratorios, actividades.

### Online

- Color asignado: `#284E4E`
- Claim: "Donde tus ganas encuentran herramientas."
- tono: Practico, orientado a resultados, para gente que trabaja.
- Fotografia: Personas trabajando desde casa, laptops, entornos flexibles.

### Posgrado

- Color asignado: `#DCB17C`
- Claim: "Donde tu experiencia se encuentra con su evolucion."
- tono: Profesional, maduro, orientado a liderazgo.
- Fotografia: Profesionales en entornos corporativos, reuniones ejecutivas.

### EDEX

- Color asignado: `#F08568`
- Claim: "Donde tu gestion se encuentra con su especializacion."
- tono: Ejecutivo, orientado a accion, herramientas practicas.
- Fotografia: Lideres empresariales, data, tecnologia aplicada.

---

## Notas para Agentes de IA

Si eres un agente de IA trabajando en este proyecto:

1. **LEE este documento COMPLETO** antes de generar cualquier componente visual.
2. **NUNCA asumas** una paleta de colores, fuente o espaciado que no este definido aqui.
3. **NUNCA uses** los anti-patrones de la seccion 2 como "solucion rapida".
4. **Si algo no esta definido**, pregunta al humano antes de inventar una solucion.
5. **Prioriza la funcionalidad** sobre la estetica. Un boton feo que funciona es mejor que un boton bonito que no se puede clickear.
6. **Revisa la accesibilidad** de todo lo que generes. Si no estas seguro del contraste, usa una herramienta de verificacion.

---

> Este documento es vivo y se actualiza cuando una convencion cambia. Cada cambio debe ser aprobado por el equipo de diseno/marketing de la universidad.
