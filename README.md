# Asistente de Tesina Psicopedagógica - UCALP

Aplicación web para acompañar a estudiantes de la **Licenciatura en Psicopedagogía** de la Universidad Católica de La Plata en la elaboración de su **trabajo final de carrera bajo la modalidad de investigación bibliográfica**.

## ¿Qué es esto?

Una SPA estática (HTML + CSS + JS, sin build, sin backend) que combina recursos formativos con asistencia de IA mediante OpenRouter, con un enfoque **tutorial**: la IA orienta a la estudiante con preguntas y criterios para que desarrolle su propio pensamiento, **no escribe el trabajo por ella**.

## Modalidad de trabajo

Las estudiantes elaboran una **tesina bibliográfica** (investigación teórica, sin trabajo de campo), que incluye:

1. **Elección y delimitación del tema** — relevante, manejable, acotado
2. **Planteo del problema** — con pregunta-problema de investigación
3. **Justificación**
4. **Objetivos** — general y específicos, formulados para revisión bibliográfica
5. **Marco teórico tripartito**:
   - Antecedentes (investigaciones específicas previas)
   - Estado del arte (mapeo amplio del campo)
   - Marco teórico propiamente dicho (desarrollo conceptual)
6. **Aspectos metodológicos** — criterios de búsqueda y selección bibliográfica, método de análisis
7. **Conclusiones** — análisis del marco, respuesta a la pregunta-problema, síntesis y nuevas líneas
8. **Bibliografía** — mínimo 20 referencias en formato APA 7ª edición

## Estructura de archivos

```
asistente-tesina-psicopedagogia/
├── index.html       # Interfaz completa (7 pestañas)
├── styles.css       # Estilos
├── script.js        # Lógica, prompts e integración con OpenRouter
├── logo-ucalp.png   # Logo institucional
└── README.md        # Este archivo
```

## Funcionalidades principales

### 1. Inicio
Presentación de la herramienta y de la estructura de una tesina bibliográfica.

### 2. Orientación
Chat con tutor virtual + guías rápidas sobre:
- Cómo elegir un tema
- Diferencia entre antecedentes, estado del arte y marco teórico
- Cómo buscar bibliografía académica
- Cómo redactar conclusiones
- Criterios para evaluar fuentes

### 3. Mi Tesina
Formulario completo con 14 secciones para organizar todo el trabajo, con:
- Contadores de palabras
- Validación de mínimo 20 referencias bibliográficas
- Ayuda contextual en cada sección
- Asistencia IA específica por sección
- Guardado/carga de borradores en localStorage
- Generación de documento final descargable (.txt)

### 4. Estructura
Guía visual con timeline de los 7 componentes de una tesina bibliográfica.

### 5. Generador IA
Genera **orientaciones** (no contenido para copiar) para 11 secciones diferentes del trabajo:
- Introducción
- Elección y delimitación del tema
- Planteo del problema
- Justificación
- Objetivos
- Antecedentes
- Estado del arte
- Marco teórico
- Análisis del marco teórico
- Conclusiones
- Resumen / Abstract

### 6. Revisor
Análisis y sugerencias sobre fragmentos de texto en cuatro dimensiones:
- Estructura y coherencia
- Solidez argumentativa
- Estilo académico
- Uso de citas y referencias APA

### 7. Recursos
- Normas APA 7ª edición con ejemplos completos
- Bases de datos académicas (ERIC, SciELO, Redalyc, Dialnet, PsycINFO, SEDICI, etc.)
- Gestores bibliográficos (Zotero, Mendeley, EndNote)
- Consejos de redacción académica
- Herramientas útiles (Connected Papers, Scribbr, etc.)

## Configuración

### API Key de Groq

Al primer uso la app pide la API key de Groq (gratuita). Pasos:

1. Crear cuenta en https://console.groq.com/keys
2. Generar una key (botón "Create API Key")
3. Pegarla en el modal de la aplicación

La key se guarda en `localStorage` del navegador (clave: `groq_api_key`). Nunca sale del navegador ni se sube al repositorio.

### Modelo

Por defecto: **`groq/compound`** (gratuito y muy rápido en Groq; incluye búsqueda web y ejecución de código).

Para cambiar de modelo, editar la constante `GROQ_MODEL` en `script.js`. Alternativas sugeridas:
- `groq/compound-mini` — variante más liviana
- `llama-3.3-70b-versatile` — buen razonamiento
- `llama-3.1-8b-instant` — ultra rápido, respuestas más simples

Lista completa: https://console.groq.com/docs/models

## Despliegue

Al ser una SPA estática puede subirse a cualquier hosting:

- **Cloudflare Pages** (recomendado): conectar repo de GitHub y deploy automático
- **GitHub Pages**: habilitar Pages desde Settings
- **Netlify / Vercel**: drag & drop o conectar repo
- **Servidor estático local**: `python3 -m http.server 8000`

## Enfoque pedagógico

La IA está configurada como **tutor académico**, no como redactor. Para cada sección de la tesina:

1. Explica criterios y características esperadas
2. Hace preguntas reflexivas que orientan el pensamiento de la estudiante
3. Da ejemplos sólo como referencia (no para copiar)
4. Propone pasos concretos para que la estudiante desarrolle su propio contenido

Esto garantiza que el trabajo final sea producto del proceso intelectual de la estudiante, no de la IA.

## Tecnologías

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- API: OpenRouter (compatible con OpenAI SDK)
- Almacenamiento local: localStorage

## Créditos

Desarrollado para el Seminario de Trabajo Final de Carrera de la Licenciatura en Psicopedagogía, Universidad Católica de La Plata.
