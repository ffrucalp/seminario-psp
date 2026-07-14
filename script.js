// Configuración de la API de OpenRouter
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Modelo por defecto. Podés cambiarlo por cualquiera de los disponibles en OpenRouter:
//   - 'tencent/hy3:free' (actual: modelo gratuito)
//   - 'google/gemini-2.5-flash' (rápido, multimodal, gran contexto)
//   - 'meta-llama/llama-3.3-70b-instruct' (buen razonamiento, económico)
//   - 'anthropic/claude-3.5-sonnet' (excelente calidad)
//   - 'openai/gpt-4o-mini' (barato y bueno)
// Lista completa: https://openrouter.ai/models
const OPENROUTER_MODEL = 'tencent/hy3:free';

// Metadata opcional pero recomendada por OpenRouter (para ranking en su directorio)
const APP_REFERER = 'https://ucalp.edu.ar';
const APP_TITLE = 'Asistente de Tesina Psicopedagogía UCALP';

// Función para obtener la API key desde localStorage
function getApiKey() {
    return localStorage.getItem('openrouter_api_key');
}

// Función para guardar la API key
function saveApiKey(key) {
    localStorage.setItem('openrouter_api_key', key);
}

// Función para verificar si hay API key configurada
function hasApiKey() {
    const key = getApiKey();
    return key && key.trim().length > 0;
}

// Función para mostrar modal de API key
function showApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) {
        modal.style.display = 'flex';
        const input = document.getElementById('apiKeyInput');
        if (input) {
            input.value = getApiKey() || '';
            input.focus();
        }
    }
}

// Función para cerrar modal de API key
function closeApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para guardar API key desde el modal
function saveApiKeyFromModal() {
    const input = document.getElementById('apiKeyInput');
    if (input && input.value.trim()) {
        saveApiKey(input.value.trim());
        closeApiKeyModal();
        updateApiKeyStatus();
        return true;
    } else {
        alert('Por favor, ingresá una API key válida.');
        return false;
    }
}

// Función para actualizar indicador de estado de API key
function updateApiKeyStatus() {
    const statusElement = document.getElementById('apiKeyStatus');
    if (statusElement) {
        if (hasApiKey()) {
            statusElement.innerHTML = '🟢 API Key configurada <button onclick="showApiKeyModal()" class="btn-link">Cambiar</button>';
            statusElement.className = 'api-status configured';
        } else {
            statusElement.innerHTML = '🔴 API Key no configurada <button onclick="showApiKeyModal()" class="btn-link">Configurar</button>';
            statusElement.className = 'api-status not-configured';
        }
    }
}

// Inicializar sistema de API key al cargar
function initApiKeySystem() {
    updateApiKeyStatus();
    
    // Event listeners para el modal
    const saveBtn = document.getElementById('saveApiKeyBtn');
    const cancelBtn = document.getElementById('cancelApiKeyBtn');
    const modal = document.getElementById('apiKeyModal');
    
    if (saveBtn) saveBtn.addEventListener('click', saveApiKeyFromModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeApiKeyModal);
    
    // Cerrar modal al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeApiKeyModal();
        });
    }
    
    // Si no hay key, mostrar modal automáticamente
    if (!hasApiKey()) {
        setTimeout(showApiKeyModal, 500);
    }
}

// Sistema de prompts especializados - ENFOQUE TUTORIAL PARA TESINA BIBLIOGRÁFICA
const SYSTEM_PROMPTS = {
    orientacion: `Sos un TUTOR académico experto en investigación bibliográfica psicopedagógica y dirección de tesinas de licenciatura en psicopedagogía.

IMPORTANTE: Acompañás la elaboración de TESINAS BIBLIOGRÁFICAS, NO trabajos de campo. Las estudiantes NO recolectan datos con sujetos, sino que realizan revisiones rigurosas de la literatura para responder una pregunta-problema mediante análisis bibliográfico.

TU ROL ES GUIAR, NO DAR RESPUESTAS DIRECTAS. Debés:
- Hacer preguntas reflexivas que ayuden a la estudiante a pensar por sí misma
- Proponer pasos concretos y secuenciales para que desarrolle su trabajo
- Explicar criterios y métodos, no solo dar resultados
- Enseñar a autoevaluar el propio trabajo
- Cuando la estudiante pida que le escribas algo, primero orientala para que lo piense ella misma

ESTRUCTURA DE TUS RESPUESTAS:
1. Validar brevemente lo que la estudiante ya sabe o propone
2. Hacer 2-3 preguntas orientadoras que la ayuden a profundizar
3. Ofrecer pasos concretos que pueda seguir
4. Proponer un "siguiente paso" claro y accionable

ESTILO DE COMUNICACIÓN:
- Usá SIEMPRE el voseo argentino: "vos tenés", "vos podés", "pensá", "considerá", "revisá"
- Conjugaciones: "querés", "sabés", "podés", "tenés", "hacés", "decís"
- Imperativo: "mirá", "fijate", "acordate", "preguntate"
- Mantené tono académico formal con voseo
- La mayoría de las estudiantes son mujeres, podés usar género femenino cuando corresponda

ESTRUCTURA DE UNA TESINA BIBLIOGRÁFICA (lo que tu acompañado/a está elaborando):
1. Introducción (tema, problema, justificación, objetivos, encuadre metodológico, estructura)
2. Capítulo 1: Antecedentes y estado del arte
3. Capítulo 2: Marco teórico (desarrollo conceptual)
4. Conclusiones (análisis del marco, respuesta a la pregunta-problema, síntesis, líneas futuras)
5. Referencias bibliográficas

CONTENIDOS DISCIPLINARES QUE DOMINÁS:
- Marcos teóricos psicopedagógicos: psicogenético (Piaget), histórico-cultural (Vygotsky), aprendizaje significativo (Ausubel), psicoanalítico (Paín, Fernández), convergente (Visca), neuropsicológico, sistémico, cognitivo-conductual
- Áreas de práctica: clínica, institucional, evaluación, intervención, neuropsicología educativa
- Problemáticas: dificultades específicas del aprendizaje (DEA), trastornos del neurodesarrollo (TDAH, TEA), inclusión educativa, alfabetización inicial, aprendizaje en adultos, orientación vocacional
- Investigación bibliográfica: criterios de búsqueda, evaluación de fuentes, organización de la revisión, análisis crítico, síntesis
- Distinción entre antecedentes (investigaciones previas específicas), estado del arte (mapeo amplio del campo) y marco teórico propiamente dicho (desarrollo conceptual)`,

    generador: {
        introduccion: `Sos un TUTOR que guía la redacción de introducciones de tesinas bibliográficas en psicopedagogía.

EN LUGAR DE ESCRIBIR LA INTRODUCCIÓN, debés:
1. Explicar qué elementos debe contener una buena introducción para tesina bibliográfica: presentación del tema, planteo del problema, justificación, objetivos, breve mención del encuadre metodológico (criterios de búsqueda y selección bibliográfica), y descripción de la estructura del trabajo
2. Proponer un esquema paso a paso para que la estudiante la desarrolle
3. Dar ejemplos breves solo como ilustración, no como contenido a copiar
4. Hacer preguntas que la ayuden a pensar su propia introducción

GUIÁ a la estudiante con preguntas como:
- ¿Cuál es la problemática psicopedagógica central que vas a indagar bibliográficamente?
- ¿Por qué es relevante hoy desde la disciplina o la práctica profesional?
- ¿Qué te proponés mostrar con tu revisión de la literatura?
- ¿Cómo se va a estructurar tu trabajo?

Usá voseo argentino.`,

        eleccion_tema: `Sos un TUTOR que guía la elección y delimitación de temas para tesinas bibliográficas en psicopedagogía.

EN LUGAR DE ELEGIR EL TEMA POR ELLA, debés:
1. Explicar los criterios de un buen tema para tesina bibliográfica: relevancia (importancia para el campo), manejabilidad (abordable con la bibliografía disponible), acotación (suficientemente delimitado para profundizar)
2. Enseñar técnicas de delimitación por capas: área amplia → problema específico → población/contexto/perspectiva → enfoque teórico
3. Hacer preguntas orientadoras que la ayuden a evaluar la viabilidad de su elección
4. Proponerle ejercicios de delimitación progresiva

PREGUNTAS GUIADORAS:
- ¿Qué temas de la psicopedagogía te interesan personalmente?
- ¿Hay suficiente literatura académica sobre ese tema en idiomas que manejás?
- ¿Tu tema es demasiado amplio (no se puede abordar en una tesina) o demasiado estrecho (no hay literatura suficiente)?
- ¿Qué aspectos vas a incluir y cuáles vas a dejar fuera, y por qué?
- ¿Por qué este tema vale la pena para la psicopedagogía?

Usá voseo argentino.`,

        planteamiento: `Sos un TUTOR que guía la formulación del planteo del problema en tesinas bibliográficas de psicopedagogía.

EN LUGAR DE ESCRIBIR EL PLANTEO, debés:
1. Explicar qué es un problema de investigación bibliográfica (no es un problema empírico a observar, sino una pregunta teórica a indagar a través de la literatura)
2. Enseñar a formular una buena pregunta-problema: específica, clara, abordable bibliográficamente, no respondible con un sí/no simple
3. Mostrar la diferencia entre tema (lo amplio) y problema (la pregunta específica)
4. Proponer pasos para que ella delimite su propia pregunta

HACÉ PREGUNTAS ORIENTADORAS:
- ¿Cuál es la pregunta puntual que querés responder con tu revisión bibliográfica?
- ¿Esa pregunta admite varias respuestas/perspectivas en la literatura?
- ¿Es lo suficientemente específica como para que puedas profundizar en ella?
- ¿Qué preguntas secundarias se derivan de la principal?

Usá voseo argentino.`,

        justificacion: `Sos un TUTOR que guía la redacción de justificaciones para tesinas bibliográficas en psicopedagogía.

EN LUGAR DE ESCRIBIR LA JUSTIFICACIÓN, debés:
1. Explicar qué criterios hacen relevante una tesina bibliográfica: relevancia teórica (aporte al campo, sistematización de un tema, articulación de perspectivas), relevancia profesional (utilidad para la práctica psicopedagógica), relevancia social (problemática educativa actual)
2. Proponer un método para que la estudiante identifique la relevancia de su tema
3. Enseñar a argumentar la pertinencia sin exagerar ni ser modesta en exceso
4. Guiar la identificación de vacíos o debates abiertos en la literatura que tu trabajo pueda iluminar

ORIENTÁ CON PREGUNTAS:
- ¿Qué aporta tu revisión bibliográfica que no esté ya disponible de manera sistematizada?
- ¿Por qué es pertinente revisar este tema ahora?
- ¿Qué utilidad concreta puede tener para psicopedagogos en formación o en ejercicio?
- ¿Qué debate o vacío en la literatura querés iluminar?

Usá voseo argentino.`,

        objetivos: `Sos un TUTOR que guía la formulación de objetivos para tesinas bibliográficas en psicopedagogía.

EN LUGAR DE ESCRIBIR LOS OBJETIVOS, debés:
1. Explicar la diferencia entre objetivo general y específicos
2. Enseñar qué verbos son apropiados para investigación bibliográfica: analizar, describir, caracterizar, comparar, sistematizar, identificar, articular, revisar, indagar (NO usar verbos de investigación empírica como "medir", "evaluar a una población", "implementar")
3. Mostrar cómo los objetivos deben derivarse de la pregunta-problema
4. Proponer un método para verificar si los objetivos son alcanzables vía revisión bibliográfica

GUIÁ CON PREGUNTAS:
- ¿Qué querés lograr concretamente con tu indagación bibliográfica?
- ¿Cada objetivo específico se puede cumplir a través de la lectura y análisis de la literatura?
- ¿Los objetivos específicos realmente conducen al general?
- ¿Cada uno corresponde a un apartado/sección de tu marco teórico?

Usá voseo argentino.`,

        antecedentes: `Sos un TUTOR que guía la elaboración del apartado de antecedentes en tesinas bibliográficas de psicopedagogía.

EN LUGAR DE ESCRIBIR LOS ANTECEDENTES, debés:
1. Explicar qué son los antecedentes: investigaciones específicas previas sobre el tema (tesis, artículos, trabajos académicos), que responden a la pregunta ¿qué se ha investigado puntualmente sobre mi problema?
2. Distinguir antecedentes (específicos) de estado del arte (mapeo más amplio del campo) y marco teórico (desarrollo conceptual)
3. Enseñar a buscar antecedentes en bases académicas (SciELO, ERIC, Redalyc, Dialnet, repositorios institucionales)
4. Proponer un esquema para reseñar cada antecedente (autor/es, año, objeto, método, hallazgos, aportes y limitaciones)

ORIENTÁ CON PREGUNTAS:
- ¿Qué investigaciones encontraste que aborden específicamente tu pregunta-problema?
- ¿Qué métodos usaron y qué hallazgos reportan?
- ¿Qué aspectos quedaron sin abordar en esos trabajos?
- ¿Cómo se posicionan respecto a tu propio enfoque?

Usá voseo argentino.`,

        estado_arte: `Sos un TUTOR que guía la elaboración del estado del arte en tesinas bibliográficas de psicopedagogía.

EN LUGAR DE ESCRIBIR EL ESTADO DEL ARTE, debés:
1. Explicar qué es el estado del arte: mapeo amplio del campo de estudios sobre un tema, que permite ver tendencias, debates, hallazgos convergentes y divergentes, y vacíos
2. Diferenciarlo de los antecedentes (más específicos y reseñables uno por uno) y del marco teórico (más conceptual)
3. Enseñar a organizar el estado del arte: puede ser por períodos históricos, por perspectivas teóricas, por sub-temas, o por hallazgos
4. Proponer estrategias de búsqueda y mapeo del campo (palabras clave, bases, herramientas como Connected Papers)

ORIENTÁ CON PREGUNTAS:
- ¿Cuáles son las líneas dominantes de investigación sobre tu tema?
- ¿Qué consensos y qué debates encontrás en la literatura actual?
- ¿Dónde hay vacíos que tu trabajo pueda contribuir a iluminar?
- ¿Cómo se posiciona tu propia investigación dentro de ese mapa?

Usá voseo argentino.`,

        marco_teorico: `Sos un TUTOR que guía la construcción del marco teórico (desarrollo conceptual) en tesinas bibliográficas de psicopedagogía.

EN LUGAR DE ESCRIBIR EL MARCO, debés:
1. Explicar qué función cumple el marco teórico: desarrollo conceptual de las categorías y autores con los que vas a leer/analizar tu problema
2. Enseñar a organizar el marco: de lo general a lo particular, o por categorías conceptuales articuladas
3. Insistir en que el marco no es una sumatoria de resúmenes de autores, sino un DIÁLOGO crítico entre ellos
4. Proponer una estructura para que la estudiante desarrolle su propio marco paso a paso

ORIENTÁ CON PREGUNTAS:
- ¿Cuáles son los conceptos centrales que necesitás definir y desarrollar?
- ¿Desde qué marco de referencia (psicogenético, histórico-cultural, psicoanalítico, neuropsicológico, etc.) vas a trabajar?
- ¿Cómo dialogan o se contrastan los autores que elegiste?
- ¿Tu marco articula con el problema, los objetivos y va orientado hacia tus conclusiones?
- ¿Dónde se hace visible tu lectura crítica de los autores?

Usá voseo argentino.`,

        analisis_marco: `Sos un TUTOR que guía la elaboración del análisis del marco teórico en las conclusiones de una tesina bibliográfica.

EN LUGAR DE HACER EL ANÁLISIS, debés:
1. Explicar qué significa "analizar el marco teórico" en las conclusiones: no es repetir lo dicho, sino destilar las ideas centrales, identificar tensiones, articular hilos conductores, posicionarse críticamente
2. Distinguir análisis de mera descripción o resumen
3. Enseñar a articular el análisis con los objetivos planteados al inicio
4. Proponer ejercicios concretos: ¿qué hilos atraviesan todos los capítulos? ¿qué autores aparecen recurrentemente? ¿qué tensiones quedan visibles?

ORIENTÁ CON PREGUNTAS:
- ¿Qué ideas centrales emergen de tu desarrollo conceptual?
- ¿Qué tensiones o debates atravesaron tu marco?
- ¿Qué te permiten entender los autores trabajados sobre tu problema?
- ¿Qué lectura crítica podés hacer de la literatura revisada?

Usá voseo argentino.`,

        conclusion: `Sos un TUTOR que guía la redacción de conclusiones en tesinas bibliográficas de psicopedagogía.

EN LUGAR DE ESCRIBIR LAS CONCLUSIONES, debés:
1. Explicar qué componentes debe tener una buena conclusión de tesina bibliográfica:
   a) Análisis del marco teórico desarrollado (síntesis crítica, no repetición)
   b) Respuesta a la pregunta-problema de investigación
   c) Síntesis de ideas centrales que articularon el trabajo
   d) Aportes al campo psicopedagógico
   e) Limitaciones honestamente reconocidas
   f) Nuevas líneas de investigación que se abren
2. Enseñar que las conclusiones deben "cerrar el círculo" con la introducción
3. Distinguir conclusiones de mera síntesis o repetición
4. Proponer una estructura para que ella las desarrolle

ORIENTÁ CON PREGUNTAS:
- ¿Respondiste efectivamente a tu pregunta-problema?
- ¿Qué síntesis podés ofrecer de todo lo desarrollado?
- ¿Qué aportes hace tu trabajo al campo psicopedagógico (aunque sean modestos)?
- ¿Qué quedó sin resolver o requeriría más indagación?
- ¿Qué nuevas preguntas o líneas de investigación abre tu trabajo?

Usá voseo argentino.`,

        resumen: `Sos un TUTOR que guía la redacción de resúmenes académicos (abstracts) para tesinas bibliográficas en psicopedagogía.

EN LUGAR DE ESCRIBIR EL RESUMEN, debés:
1. Explicar la estructura estándar de un abstract para una tesina bibliográfica: objeto/tema, problema y objetivos, encuadre metodológico (revisión bibliográfica con criterios x e y), principales líneas desarrolladas, conclusiones centrales
2. Enseñar a sintetizar en 150-250 palabras
3. Guiar la selección de palabras clave (keywords): 4-6 términos
4. Proponer un método para verificar que el resumen sea autosuficiente (alguien que lo lea sin leer la tesina debe entender de qué trata)

ORIENTÁ CON PREGUNTAS:
- ¿Cuál es la idea central de tu tesina en una oración?
- ¿Qué método de revisión usaste y qué conclusiones principales obtuviste?
- ¿Alguien que lea solo el resumen entendería tu aporte?
- ¿Qué 4-6 palabras clave describen mejor tu trabajo?

Usá voseo argentino.`
    },

    revisor: `Sos un TUTOR que enseña a revisar y mejorar textos académicos de tesinas bibliográficas en psicopedagogía.

EN LUGAR DE SOLO SEÑALAR ERRORES, debés:
1. Explicar los criterios de evaluación que estás usando
2. Enseñar a la estudiante a identificar problemas por sí misma
3. Mostrar ejemplos de cómo mejorar (no reescribir todo)
4. Proponer ejercicios de revisión que pueda aplicar a futuro

ESTRUCTURA TU RETROALIMENTACIÓN:
- Primero, destacá lo que está bien logrado
- Luego, identificá 2-3 aspectos prioritarios a mejorar
- Para cada aspecto, explicá POR QUÉ es un problema y CÓMO abordarlo
- Finalmente, proponé un ejercicio de autorrevisión

CRITERIOS A EVALUAR EN TESINAS BIBLIOGRÁFICAS:
- Claridad y coherencia argumentativa
- Uso apropiado de terminología psicopedagógica
- Fundamentación de afirmaciones (toda afirmación teórica necesita respaldo con citas)
- Diálogo crítico entre autores (no sumatoria de resúmenes)
- Posicionamiento propio frente a la literatura revisada
- Estructura lógica del texto y articulación entre apartados
- Análisis vs. mera descripción
- Lenguaje inclusivo y respetuoso al referirse a sujetos con diagnósticos o dificultades
- Uso correcto del formato APA en citas y referencias

Usá voseo argentino.`
};

// Estado de la aplicación
let conversationHistory = {
    orientacion: []
};

// Event Listeners principales
document.addEventListener('DOMContentLoaded', function() {
    initApiKeySystem();
    initializeTabs();
    initializeAccordions();
    initializeOrientationChat();
    initializeGenerator();
    initializeReviewer();
    initializeProject();
});

// Sistema de pestañas
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remover active de todos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar el seleccionado
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// Sistema de acordeones
function initializeAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains('active');
            
            // Cerrar todos los acordeones
            document.querySelectorAll('.accordion-header').forEach(h => {
                h.classList.remove('active');
                h.nextElementSibling.classList.remove('active');
            });
            
            // Si no estaba activo, abrirlo
            if (!isActive) {
                header.classList.add('active');
                content.classList.add('active');
            }
        });
    });
}

// Chat de Orientación
function initializeOrientationChat() {
    const sendButton = document.getElementById('sendOrientation');
    const input = document.getElementById('orientationInput');
    
    sendButton.addEventListener('click', () => sendOrientationMessage());
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendOrientationMessage();
        }
    });
}

async function sendOrientationMessage() {
    const input = document.getElementById('orientationInput');
    const chatBox = document.getElementById('chatOrientation');
    const sendButton = document.getElementById('sendOrientation');
    
    const message = input.value.trim();
    
    if (!message) {
        alert('Por favor, escribí una pregunta o consulta.');
        return;
    }
    
    // Deshabilitar input mientras se procesa
    input.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = 'Pensando...';
    
    // Agregar mensaje del usuario al chat
    addMessageToChat(chatBox, message, 'user');
    
    // Limpiar input
    input.value = '';
    
    // Crear la burbuja del Tutor vacía y llenarla a medida que llega la respuesta
    const contentEl = addMessageToChat(chatBox, '', 'assistant');

    try {
        // Preparar contexto con historial
        conversationHistory.orientacion.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await callOpenRouterAPI(
            SYSTEM_PROMPTS.orientacion,
            conversationHistory.orientacion,
            (partialText) => {
                contentEl.innerHTML = formatMessage(partialText);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        );

        // Asegurar el render final completo y guardar en el historial
        contentEl.innerHTML = formatMessage(response);
        conversationHistory.orientacion.push({
            role: 'model',
            parts: [{ text: response }]
        });

    } catch (error) {
        console.error('Error:', error);
        // Reutilizar la burbuja del Tutor para mostrar el error (evita burbujas vacías duplicadas)
        contentEl.innerHTML = formatMessage(
            'Lo siento, ocurrió un error al procesar tu consulta. Por favor, intentá nuevamente.'
        );
    } finally {
        // Rehabilitar input
        input.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = 'Enviar Consulta';
        input.focus();
    }
}

function addMessageToChat(chatBox, message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const label = document.createElement('div');
    label.className = 'chat-message-label';
    label.textContent = sender === 'user' ? 'Vos:' : 'Tutor:';
    
    const content = document.createElement('div');
    content.innerHTML = formatMessage(message);
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(content);
    chatBox.appendChild(messageDiv);

    // Scroll al final
    chatBox.scrollTop = chatBox.scrollHeight;

    // Devolver el contenedor de texto para poder actualizarlo (streaming)
    return content;
}

// Generador de Contenido
function initializeGenerator() {
    const generateButton = document.getElementById('generateContent');
    const copyButton = document.getElementById('copyContent');
    
    generateButton.addEventListener('click', () => generateContent());
    copyButton.addEventListener('click', () => copyGeneratedContent());
}

async function generateContent() {
    const contentType = document.getElementById('contentType').value;
    const topic = document.getElementById('thesisTopic').value.trim();
    const context = document.getElementById('specificContext').value.trim();
    
    const outputBox = document.getElementById('generatedContent');
    const loading = document.getElementById('loadingGenerator');
    const generateButton = document.getElementById('generateContent');
    const copyButton = document.getElementById('copyContent');
    
    // Validaciones
    if (!contentType) {
        alert('Por favor, seleccioná el tipo de contenido a generar.');
        return;
    }
    
    if (!topic) {
        alert('Por favor, indicá el tema de tu tesina.');
        return;
    }
    
    // Mostrar loading
    outputBox.style.display = 'none';
    loading.style.display = 'block';
    generateButton.disabled = true;
    copyButton.style.display = 'none';
    
    try {
        // Construir el prompt específico
        const systemPrompt = SYSTEM_PROMPTS.generador[contentType];
        
        const userPrompt = `
Tema de la tesina bibliográfica: ${topic}

${context ? `Contexto adicional:\n${context}\n` : ''}

Por favor, orientá a la estudiante para que desarrolle la sección solicitada con criterios de rigor académico apropiados para una tesina bibliográfica de licenciatura en psicopedagogía.
`;
        
        // Llamar a la API
        const response = await callOpenRouterAPI(systemPrompt, [
            { role: 'user', parts: [{ text: userPrompt }] }
        ]);
        
        loading.style.display = 'none';
        outputBox.style.display = 'block';
        outputBox.classList.add('has-content');
        outputBox.innerHTML = formatMessage(response);
        copyButton.style.display = 'inline-flex';
        
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        outputBox.style.display = 'block';
        outputBox.innerHTML = '<p class="placeholder-text" style="color: #e74c3c;">Error al generar la orientación. Por favor, intentá nuevamente.</p>';
    } finally {
        generateButton.disabled = false;
    }
}

function copyGeneratedContent() {
    const outputBox = document.getElementById('generatedContent');
    const text = outputBox.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyButton = document.getElementById('copyContent');
        const originalText = copyButton.textContent;
        copyButton.textContent = '✓ Copiado';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el contenido. Por favor, seleccioná y copiá manualmente.');
    });
}

// Revisor de Texto
function initializeReviewer() {
    const reviewButton = document.getElementById('reviewText');
    reviewButton.addEventListener('click', () => reviewText());
}

async function reviewText() {
    const textToReview = document.getElementById('textToReview').value.trim();
    const resultsBox = document.getElementById('reviewResults');
    const loading = document.getElementById('loadingReviewer');
    const reviewButton = document.getElementById('reviewText');
    
    // Validación
    if (!textToReview) {
        alert('Por favor, proporcioná un texto para revisar.');
        return;
    }
    
    if (textToReview.length < 100) {
        alert('El texto es muy corto. Por favor, proporcioná al menos 100 caracteres.');
        return;
    }
    
    // Obtener opciones seleccionadas
    const checkStructure = document.getElementById('checkStructure').checked;
    const checkArguments = document.getElementById('checkArguments').checked;
    const checkStyle = document.getElementById('checkStyle').checked;
    const checkCitations = document.getElementById('checkCitations').checked;
    
    // Construir instrucciones específicas
    let specificInstructions = '\n\nAspectos a analizar:\n';
    if (checkStructure) specificInstructions += '- Estructura y coherencia\n';
    if (checkArguments) specificInstructions += '- Solidez argumentativa y fundamentación\n';
    if (checkStyle) specificInstructions += '- Estilo académico\n';
    if (checkCitations) specificInstructions += '- Uso de citas y referencias APA\n';
    
    // Mostrar loading
    resultsBox.style.display = 'none';
    loading.style.display = 'block';
    reviewButton.disabled = true;
    
    try {
        const prompt = `${SYSTEM_PROMPTS.revisor}${specificInstructions}

TEXTO A REVISAR:
---
${textToReview}
---

Proporcioná un análisis detallado y constructivo, organizando tus observaciones por categorías. 
Incluí ejemplos específicos del texto cuando sea pertinente.
Finalizá con recomendaciones concretas de mejora.`;
        
        const response = await callOpenRouterAPI('', [
            { role: 'user', parts: [{ text: prompt }] }
        ]);
        
        loading.style.display = 'none';
        resultsBox.style.display = 'block';
        resultsBox.classList.add('has-content');
        resultsBox.innerHTML = formatMessage(response);
        
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        resultsBox.style.display = 'block';
        resultsBox.innerHTML = '<p class="placeholder-text" style="color: #e74c3c;">Error al analizar el texto. Por favor, intentá nuevamente.</p>';
    } finally {
        reviewButton.disabled = false;
    }
}

// Función para llamar a la API de OpenRouter
async function callOpenRouterAPI(systemPrompt, conversationHistory, onChunk = null) {
    // Verificar que hay API key configurada
    const apiKey = getApiKey();
    if (!apiKey) {
        showApiKeyModal();
        throw new Error('API Key no configurada. Por favor, configurá tu API key de OpenRouter.');
    }
    
    try {
        // Preparar mensajes en formato OpenAI/OpenRouter
        let messages = [];
        
        // Agregar system prompt
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }
        
        // Convertir historial de conversación al formato OpenAI/OpenRouter
        for (const msg of conversationHistory) {
            const role = msg.role === 'model' ? 'assistant' : 'user';
            const content = msg.parts ? msg.parts[0].text : msg.content;
            messages.push({ role, content });
        }
        
        const requestBody = {
            model: OPENROUTER_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 8192,
            top_p: 0.95,
            stream: !!onChunk
        };
        
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': APP_REFERER,
                'X-Title': APP_TITLE
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            
            // Si es error de autenticación, pedir nueva key
            if (response.status === 401) {
                showApiKeyModal();
                throw new Error('API Key inválida. Por favor, verificá tu API key de OpenRouter.');
            }
            
            // Errores específicos de OpenRouter
            if (response.status === 402) {
                throw new Error('Sin créditos suficientes en OpenRouter. Cargá saldo en https://openrouter.ai/credits');
            }
            
            if (response.status === 429) {
                throw new Error('Demasiadas peticiones. Esperá un momento e intentá de nuevo.');
            }
            
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        // --- Modo streaming: se procesa la respuesta chunk por chunk (SSE) ---
        if (onChunk) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Los eventos SSE vienen separados por saltos de línea
                const lines = buffer.split('\n');
                buffer = lines.pop(); // guardar la última línea (posiblemente incompleta)

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith(':')) continue; // ignorar comentarios/keep-alive
                    if (!trimmed.startsWith('data:')) continue;

                    const dataStr = trimmed.slice(5).trim();
                    if (dataStr === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(dataStr);
                        const delta = parsed.choices?.[0]?.delta?.content;
                        if (delta) {
                            fullText += delta;
                            onChunk(fullText);
                        }
                    } catch (e) {
                        // fragmento JSON incompleto: se ignora, llegará completo en el próximo chunk
                    }
                }
            }

            if (!fullText) {
                throw new Error('No se pudo obtener una respuesta válida de la API');
            }
            return fullText;
        }

        // --- Modo sin streaming (respuesta completa de una vez) ---
        const data = await response.json();

        // Extraer el texto de la respuesta (formato OpenAI)
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        }

        throw new Error('No se pudo obtener una respuesta válida de la API');
        
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        throw error;
    }
}

// Función para formatear mensajes (convertir markdown a HTML)
function formatMessage(text) {
    // Convertir negritas (debe ir antes que cursivas)
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Convertir cursivas
    text = text.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+?)_/g, '<em>$1</em>');
    
    // Convertir saltos de línea dobles en párrafos
    text = text.replace(/\n\n/g, '</p><p>');
    text = '<p>' + text + '</p>';
    
    // Convertir listas con guiones
    text = text.replace(/<p>[-•]\s*(.+?)<\/p>/g, '<li>$1</li>');
    
    // Envolver listas consecutivas en ul
    text = text.replace(/(<li>.*?<\/li>)+/gs, function(match) {
        return '<ul>' + match + '</ul>';
    });
    
    // Convertir listas numeradas
    text = text.replace(/<p>(\d+)\.\s+(.+?)<\/p>/g, '<li value="$1">$2</li>');
    
    // Envolver listas numeradas en ol
    text = text.replace(/(<li value="\d+">.*?<\/li>)+/gs, function(match) {
        return '<ol>' + match.replace(/value="\d+"/g, '') + '</ol>';
    });
    
    // Convertir títulos (líneas que empiezan con #)
    text = text.replace(/<p>###\s*(.+?)<\/p>/g, '<h4>$1</h4>');
    text = text.replace(/<p>##\s*(.+?)<\/p>/g, '<h3>$1</h3>');
    text = text.replace(/<p>#\s*(.+?)<\/p>/g, '<h2>$1</h2>');
    
    // Limpiar párrafos vacíos
    text = text.replace(/<p>\s*<\/p>/g, '');
    text = text.replace(/<p><\/p>/g, '');
    
    return text;
}

// ========== FUNCIONALIDAD DE LA TESINA ==========

function initializeProject() {
    // Contadores de palabras
    setupWordCounters();
    
    // Botones de ayuda
    setupHelpButtons();
    
    // Botones de acciones
    setupProjectActions();
    
    // Botones de IA
    setupAIAssistButtons();
}

// Configurar contadores de palabras
function setupWordCounters() {
    const counters = [
        { textarea: 'themeSelection', counter: 'themeSelectionCount' },
        { textarea: 'problemStatement', counter: 'problemCount' },
        { textarea: 'justification', counter: 'justificationCount' },
        { textarea: 'theoreticalBackground', counter: 'backgroundCount' },
        { textarea: 'stateOfArt', counter: 'stateOfArtCount' },
        { textarea: 'theoreticalFramework', counter: 'theoreticalFrameworkCount' },
        { textarea: 'methodology', counter: 'methodologyCount' },
        { textarea: 'anticipatedConclusions', counter: 'anticipatedConclusionsCount' }
    ];
    
    counters.forEach(({ textarea, counter }) => {
        const element = document.getElementById(textarea);
        const counterElement = document.getElementById(counter);
        
        if (element && counterElement) {
            element.addEventListener('input', () => {
                const wordCount = countWords(element.value);
                counterElement.textContent = wordCount;
            });
        }
    });
    
    // Contadores de referencias bibliográficas
    setupBibliographyCounters();
}

function setupBibliographyCounters() {
    const primaryBib = document.getElementById('primaryBibliography');
    const secondaryBib = document.getElementById('secondaryBibliography');
    
    if (primaryBib && secondaryBib) {
        primaryBib.addEventListener('input', updateBibliographyCount);
        secondaryBib.addEventListener('input', updateBibliographyCount);
        
        // Botón de validación
        const validateBtn = document.getElementById('validateBibliography');
        if (validateBtn) {
            validateBtn.addEventListener('click', validateBibliography);
        }
    }
}

function updateBibliographyCount() {
    const primaryText = document.getElementById('primaryBibliography').value;
    const secondaryText = document.getElementById('secondaryBibliography').value;
    
    const primaryCount = countReferences(primaryText);
    const secondaryCount = countReferences(secondaryText);
    const totalCount = primaryCount + secondaryCount;
    
    document.getElementById('primaryRefCount').textContent = primaryCount;
    document.getElementById('secondaryRefCount').textContent = secondaryCount;
    document.getElementById('totalRefs').textContent = totalCount;
    
    // Actualizar estilo si cumple el mínimo
    const statBoxes = document.querySelectorAll('.stat-box');
    
    if (totalCount >= 20) {
        statBoxes.forEach(box => box.classList.add('complete'));
    } else {
        statBoxes.forEach(box => box.classList.remove('complete'));
    }
}

function countReferences(text) {
    if (!text.trim()) return 0;
    
    // Contar líneas no vacías que parecen referencias
    const lines = text.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 20 && (trimmed.includes('.') || trimmed.includes('('));
    });
    
    return lines.length;
}

function countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Configurar botones de ayuda
function setupHelpButtons() {
    const helpButtons = document.querySelectorAll('.help-btn');
    const helpPanel = document.getElementById('helpPanel');
    const closeHelp = document.querySelector('.close-help');
    
    const helpContent = {
        titulo: {
            title: 'Título de la Tesina',
            text: `
                <p><strong>Características de un buen título para tesina bibliográfica:</strong></p>
                <ul>
                    <li>Claro y específico</li>
                    <li>Refleja el contenido real de tu investigación</li>
                    <li>Indica que es una revisión bibliográfica (puede aparecer "revisión", "aportes desde", "análisis bibliográfico de", etc.)</li>
                    <li>Incluye conceptos clave y, si corresponde, marco teórico de referencia</li>
                    <li>No demasiado largo (15-20 palabras máximo)</li>
                    <li>Puede incluir subtítulo para mayor precisión</li>
                </ul>
                <p><strong>Ejemplo:</strong> "La dislexia del desarrollo: una revisión bibliográfica de los abordajes psicopedagógicos contemporáneos desde la perspectiva neuropsicológica"</p>
            `
        },
        area: {
            title: 'Área Temática',
            text: `
                <p>Seleccioná el área principal de la psicopedagogía en la que se inscribe tu tesina.</p>
                <p><strong>Considerá:</strong></p>
                <ul>
                    <li>¿Cuál es el foco central de tu trabajo (clínico, institucional, evaluativo, interventivo)?</li>
                    <li>¿Sobre qué población o problemática gira tu interés (infancia, adolescencia, adultos, DEA, neurodesarrollo, etc.)?</li>
                    <li>¿Desde qué marco de referencia teórico vas a leer el problema?</li>
                    <li>Podés tener áreas secundarias, pero elegí la principal</li>
                </ul>
            `
        },
        eleccion: {
            title: 'Elección y Delimitación del Tema',
            text: `
                <p>En este apartado tenés que mostrar que pensaste cuidadosamente:</p>
                <ul>
                    <li>¿<strong>Por qué</strong> elegiste este tema y no otro?</li>
                    <li>¿<strong>Cómo lo delimitaste</strong>? ¿Qué aspectos vas a incluir y cuáles dejás fuera?</li>
                    <li>¿Por qué es <strong>relevante</strong> para la psicopedagogía?</li>
                    <li>¿Por qué es <strong>manejable</strong> como tesina bibliográfica?</li>
                    <li>¿Por qué está <strong>acotado</strong> y no es demasiado amplio?</li>
                </ul>
                <p><strong>Tip:</strong> La delimitación es uno de los pasos más importantes. Un tema mal delimitado lleva a una tesina dispersa o demasiado superficial.</p>
            `
        },
        problema: {
            title: 'Planteo del Problema',
            text: `
                <p>En una tesina bibliográfica, el "problema" es la pregunta teórica que vas a indagar mediante la revisión de la literatura.</p>
                <p><strong>El planteo del problema debe responder:</strong></p>
                <ul>
                    <li>¿Qué situación, debate o vacío en la literatura querés indagar?</li>
                    <li>¿Por qué es un problema relevante para la disciplina?</li>
                    <li>¿En qué contexto se inscribe (teórico, profesional, social)?</li>
                </ul>
                <p><strong>La pregunta-problema debe ser:</strong></p>
                <ul>
                    <li>Específica y clara</li>
                    <li>Abordable mediante revisión bibliográfica</li>
                    <li>No respondible con un sí/no simple</li>
                    <li>Que admita varias perspectivas/respuestas en la literatura</li>
                </ul>
                <p><strong>Ejemplos:</strong> "¿Qué aportes ofrece la perspectiva neuropsicológica al abordaje psicopedagógico de la dislexia?", "¿Cómo se articulan los enfoques psicogenético y socioconstructivista en las intervenciones contemporáneas en alfabetización inicial?"</p>
            `
        },
        justificacion: {
            title: 'Justificación',
            text: `
                <p>Explicá por qué vale la pena hacer esta revisión bibliográfica:</p>
                <ul>
                    <li><strong>Relevancia teórica:</strong> ¿Qué aporta a la sistematización del campo?</li>
                    <li><strong>Relevancia profesional:</strong> ¿Qué utilidad tiene para la práctica psicopedagógica?</li>
                    <li><strong>Relevancia social:</strong> ¿A qué problemática educativa o comunitaria responde?</li>
                    <li><strong>Originalidad:</strong> ¿Qué articulación, síntesis o lectura nueva ofrecés?</li>
                    <li><strong>Vacíos:</strong> ¿Qué debate o vacío en la literatura querés iluminar?</li>
                </ul>
            `
        },
        objetivos: {
            title: 'Objetivos',
            text: `
                <p><strong>Objetivo General:</strong> Qué querés lograr con la indagación bibliográfica completa. Debe responder a la pregunta-problema.</p>
                <p><strong>Objetivos Específicos:</strong> Pasos concretos y verificables vía revisión bibliográfica.</p>
                <p><strong>Verbos apropiados para tesina bibliográfica:</strong></p>
                <ul>
                    <li>Analizar, describir, caracterizar, identificar</li>
                    <li>Comparar, contrastar, articular</li>
                    <li>Sistematizar, sintetizar, revisar</li>
                    <li>Interpretar, examinar críticamente</li>
                </ul>
                <p><strong>Evitá verbos de investigación empírica:</strong> medir, evaluar (a una población), implementar (una intervención), aplicar (un instrumento), diagnosticar (a un sujeto).</p>
                <p><strong>Tip:</strong> Cada objetivo específico debería corresponder a un apartado o sección de tu marco teórico.</p>
            `
        },
        antecedentes: {
            title: 'Antecedentes',
            text: `
                <p>Los antecedentes son <strong>investigaciones específicas previas</strong> sobre tu tema.</p>
                <p><strong>¿Qué incluir?</strong></p>
                <ul>
                    <li>Tesis y tesinas previas sobre temas similares</li>
                    <li>Artículos de investigación específicos</li>
                    <li>Trabajos académicos puntuales</li>
                </ul>
                <p><strong>¿Cómo reseñarlos?</strong> Para cada uno, indicá:</p>
                <ul>
                    <li>Autor/es y año</li>
                    <li>Objeto de estudio</li>
                    <li>Método utilizado</li>
                    <li>Principales hallazgos</li>
                    <li>Aportes y limitaciones</li>
                </ul>
                <p><strong>Bases recomendadas:</strong> SciELO, Redalyc, Dialnet, repositorios institucionales (SEDICI, UBA, CONICET).</p>
            `
        },
        estadoArte: {
            title: 'Estado del Arte',
            text: `
                <p>El estado del arte es un <strong>mapeo más amplio del campo de estudios</strong>.</p>
                <p><strong>¿Qué responder?</strong></p>
                <ul>
                    <li>¿Cuáles son las líneas dominantes de investigación sobre tu tema?</li>
                    <li>¿Qué debates están abiertos?</li>
                    <li>¿Qué consensos hay y qué controversias?</li>
                    <li>¿Dónde hay vacíos que tu tesina pueda iluminar?</li>
                </ul>
                <p><strong>Cómo organizarlo:</strong></p>
                <ul>
                    <li>Por períodos históricos (clásicos vs. contemporáneos)</li>
                    <li>Por perspectivas teóricas (neuropsicológica, psicogenética, etc.)</li>
                    <li>Por sub-temas (diagnóstico, intervención, etc.)</li>
                    <li>Por hallazgos convergentes/divergentes</li>
                </ul>
                <p><strong>Tip:</strong> Herramientas como Connected Papers o las funciones de citas de Google Scholar ayudan a visualizar el mapa del campo.</p>
            `
        },
        marco: {
            title: 'Marco Teórico',
            text: `
                <p>El marco teórico es el <strong>desarrollo conceptual de las categorías y autores</strong> con los que vas a leer tu problema.</p>
                <p><strong>Componentes:</strong></p>
                <ul>
                    <li><strong>Autores principales:</strong> Referentes psicopedagógicos clásicos y contemporáneos relevantes</li>
                    <li><strong>Conceptos clave:</strong> Categorías centrales para tu análisis</li>
                    <li><strong>Desarrollo conceptual:</strong> Articulación crítica de los conceptos</li>
                    <li><strong>Posicionamiento:</strong> Desde qué perspectiva leés el problema</li>
                </ul>
                <p><strong>Importante:</strong> El marco teórico NO es una sumatoria de resúmenes de autores. Es un DIÁLOGO crítico entre ellos. Mostrá cómo dialogan, se complementan, se tensionan.</p>
            `
        },
        metodologia: {
            title: 'Aspectos Metodológicos',
            text: `
                <p>Aunque tu tesina es bibliográfica (sin trabajo de campo), necesitás explicar tu encuadre metodológico:</p>
                <ul>
                    <li><strong>Tipo de investigación:</strong> Bibliográfica, teórica, documental</li>
                    <li><strong>Criterios de búsqueda:</strong> Palabras clave usadas, bases consultadas, períodos</li>
                    <li><strong>Criterios de selección de fuentes:</strong> Años, idiomas, tipo de publicación (libros, artículos, tesis), calidad académica</li>
                    <li><strong>Método de análisis:</strong> Lectura crítica, análisis comparativo, síntesis temática, articulación entre autores</li>
                    <li><strong>Organización conceptual:</strong> Cómo organizaste el trabajo (cronológica, temática, por perspectivas, etc.)</li>
                </ul>
            `
        },
        conclusiones: {
            title: 'Conclusiones Anticipadas',
            text: `
                <p>En este apartado adelantás <strong>hipótesis</strong> de las conclusiones a las que esperás llegar:</p>
                <ul>
                    <li>¿Qué respuesta provisoria darías hoy a tu pregunta-problema?</li>
                    <li>¿Qué síntesis pensás que vas a poder ofrecer al final?</li>
                    <li>¿Qué aportes esperás hacer al campo psicopedagógico?</li>
                    <li>¿Qué nuevas líneas de investigación creés que se podrían abrir?</li>
                </ul>
                <p><strong>Recordá:</strong> son hipótesis, no certezas. La revisión bibliográfica puede llevarte a conclusiones distintas o más matizadas.</p>
                <p><strong>Las conclusiones reales (al final de la tesina) deben incluir:</strong> análisis del marco teórico (no repetición), respuesta a la pregunta-problema, síntesis de ideas centrales, aportes, limitaciones, y nuevas líneas de investigación.</p>
            `
        },
        estructura: {
            title: 'Estructura Tentativa',
            text: `
                <p>Una tesina bibliográfica típica se estructura así:</p>
                <ul>
                    <li><strong>Introducción:</strong> Tema, problema, justificación, objetivos, encuadre metodológico, estructura</li>
                    <li><strong>Capítulo 1: Antecedentes y estado del arte</strong></li>
                    <li><strong>Capítulo 2: Marco teórico</strong> (puede dividirse en varios capítulos según complejidad)</li>
                    <li><strong>Conclusiones:</strong> Análisis del marco, respuesta a la pregunta-problema, síntesis, aportes, limitaciones, nuevas líneas</li>
                    <li><strong>Referencias bibliográficas</strong> en formato APA</li>
                    <li><strong>Anexos</strong> (opcional)</li>
                </ul>
                <p><strong>Tip:</strong> Cada capítulo y apartado debe responder a uno o varios objetivos específicos. La estructura debe mostrar claramente la lógica de tu argumentación.</p>
            `
        },
        bibliografia: {
            title: 'Bibliografía',
            text: `
                <p><strong>Para una tesina bibliográfica este apartado es CLAVE.</strong></p>
                <p><strong>Requisitos:</strong></p>
                <ul>
                    <li>Mínimo 20 referencias</li>
                    <li>Formato APA 7ª edición</li>
                    <li>Combinar bibliografía específica del tema y general</li>
                    <li>Incluir clásicos del campo y producción reciente (últimos 5-10 años)</li>
                    <li>Privilegiá fuentes académicas: libros de editoriales reconocidas, revistas indexadas, tesis</li>
                </ul>
                <p><strong>Bases recomendadas:</strong> SciELO, ERIC, Redalyc, Dialnet, PsycINFO, repositorios institucionales (SEDICI, UBA, CONICET).</p>
                <p><strong>Orden alfabético:</strong> Por apellido del primer autor.</p>
                <p><strong>Tip:</strong> Usá gestores bibliográficos como Zotero o Mendeley desde el inicio para facilitar el formato y no perder referencias.</p>
            `
        }
    };
    
    helpButtons.forEach(button => {
        button.addEventListener('click', () => {
            const helpKey = button.getAttribute('data-help');
            const content = helpContent[helpKey];
            
            if (content) {
                document.getElementById('helpTitle').textContent = content.title;
                document.getElementById('helpText').innerHTML = content.text;
                helpPanel.classList.add('active');
            }
        });
    });
    
    if (closeHelp) {
        closeHelp.addEventListener('click', () => {
            helpPanel.classList.remove('active');
        });
    }
}

// Configurar acciones del proyecto
function setupProjectActions() {
    document.getElementById('saveDraft').addEventListener('click', saveProjectDraft);
    document.getElementById('saveDraftBottom').addEventListener('click', saveProjectDraft);
    document.getElementById('loadDraft').addEventListener('click', loadProjectDraft);
    document.getElementById('clearProject').addEventListener('click', clearProject);
    document.getElementById('validateProject').addEventListener('click', validateProject);
    document.getElementById('generateDocument').addEventListener('click', generateProjectDocument);
    document.getElementById('generateDocumentBottom').addEventListener('click', generateProjectDocument);
}

// Guardar borrador
function saveProjectDraft() {
    const projectData = collectProjectData();
    localStorage.setItem('tesinaDraft', JSON.stringify(projectData));
    localStorage.setItem('tesinaDraftDate', new Date().toISOString());
    
    alert('✓ Borrador guardado exitosamente');
}

// Cargar borrador
function loadProjectDraft() {
    const savedData = localStorage.getItem('tesinaDraft');
    const savedDate = localStorage.getItem('tesinaDraftDate');
    
    if (!savedData) {
        alert('No hay ningún borrador guardado.');
        return;
    }
    
    if (confirm(`¿Querés cargar el borrador guardado el ${new Date(savedDate).toLocaleString('es-AR')}? Esto reemplazará el contenido actual.`)) {
        const projectData = JSON.parse(savedData);
        fillProjectForm(projectData);
        alert('✓ Borrador cargado exitosamente');
    }
}

// Limpiar proyecto
function clearProject() {
    if (confirm('¿Estás segura de que querés limpiar todo el formulario? Esta acción no se puede deshacer.')) {
        document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(field => {
            field.value = '';
        });
        // Resetear contadores
        document.querySelectorAll('.char-counter span, .ref-counter span, #totalRefs').forEach(span => {
            span.textContent = '0';
        });
        alert('✓ Formulario limpiado');
    }
}

// Recolectar datos del proyecto
function collectProjectData() {
    return {
        studentName: document.getElementById('studentName').value,
        studentEmail: document.getElementById('studentEmail').value,
        thesisTitle: document.getElementById('thesisTitle').value,
        thesisSubtitle: document.getElementById('thesisSubtitle').value,
        thematicArea: document.getElementById('thematicArea').value,
        philosophicalTradition: document.getElementById('philosophicalTradition').value,
        themeSelection: document.getElementById('themeSelection').value,
        problemStatement: document.getElementById('problemStatement').value,
        researchQuestion: document.getElementById('researchQuestion').value,
        secondaryQuestions: document.getElementById('secondaryQuestions').value,
        justification: document.getElementById('justification').value,
        generalObjective: document.getElementById('generalObjective').value,
        specificObjectives: document.getElementById('specificObjectives').value,
        theoreticalBackground: document.getElementById('theoreticalBackground').value,
        stateOfArt: document.getElementById('stateOfArt').value,
        mainAuthors: document.getElementById('mainAuthors').value,
        keyConcepts: document.getElementById('keyConcepts').value,
        theoreticalFramework: document.getElementById('theoreticalFramework').value,
        methodology: document.getElementById('methodology').value,
        anticipatedConclusions: document.getElementById('anticipatedConclusions').value,
        thesisStructure: document.getElementById('thesisStructure').value,
        primaryBibliography: document.getElementById('primaryBibliography').value,
        secondaryBibliography: document.getElementById('secondaryBibliography').value
    };
}

// Llenar formulario con datos
function fillProjectForm(data) {
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = data[key] || '';
            // Disparar evento input para actualizar contadores
            element.dispatchEvent(new Event('input'));
        }
    });
}

// Validar proyecto
function validateProject() {
    const requiredFields = [
        { id: 'studentName', label: 'Nombre de la estudiante' },
        { id: 'thesisTitle', label: 'Título de la tesina' },
        { id: 'thematicArea', label: 'Área temática' },
        { id: 'themeSelection', label: 'Elección y delimitación del tema' },
        { id: 'problemStatement', label: 'Planteo del problema' },
        { id: 'researchQuestion', label: 'Pregunta-problema de investigación' },
        { id: 'justification', label: 'Justificación' },
        { id: 'generalObjective', label: 'Objetivo general' },
        { id: 'specificObjectives', label: 'Objetivos específicos' },
        { id: 'mainAuthors', label: 'Autores y referentes principales' },
        { id: 'keyConcepts', label: 'Conceptos clave' },
        { id: 'thesisStructure', label: 'Estructura tentativa' },
        { id: 'primaryBibliography', label: 'Bibliografía específica' },
        { id: 'secondaryBibliography', label: 'Bibliografía general' }
    ];
    
    const missing = [];
    const warnings = [];
    
    // Verificar campos obligatorios
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element.value.trim()) {
            missing.push(field.label);
        }
    });
    
    // Verificar longitud de textos
    const themeSelectionWords = countWords(document.getElementById('themeSelection').value);
    if (themeSelectionWords < 200) {
        warnings.push(`Elección y delimitación del tema muy corta (${themeSelectionWords} palabras, recomendado: 200-400)`);
    }
    
    const problemWords = countWords(document.getElementById('problemStatement').value);
    if (problemWords < 200) {
        warnings.push(`Planteo del problema muy corto (${problemWords} palabras, recomendado: 200-400)`);
    }
    
    const justificationWords = countWords(document.getElementById('justification').value);
    if (justificationWords < 200) {
        warnings.push(`Justificación muy corta (${justificationWords} palabras, recomendado: 200-400)`);
    }
    
    // Verificar bibliografía
    const primaryRefs = countReferences(document.getElementById('primaryBibliography').value);
    const secondaryRefs = countReferences(document.getElementById('secondaryBibliography').value);
    const totalRefs = primaryRefs + secondaryRefs;
    
    if (totalRefs < 20) {
        warnings.push(`Bibliografía insuficiente (${totalRefs} referencias, mínimo recomendado: 20 para una tesina bibliográfica)`);
    }
    
    // Mostrar resultados
    if (missing.length > 0) {
        alert('❌ Faltan completar los siguientes campos obligatorios:\n\n' + missing.join('\n'));
        return false;
    }
    
    if (warnings.length > 0) {
        alert('⚠️ Advertencias:\n\n' + warnings.join('\n') + '\n\nPodés continuar, pero considerá mejorar estos aspectos.');
    } else {
        alert('✓ ¡Tesina validada exitosamente! Todos los campos están completos y cumplen los requisitos mínimos.');
    }
    
    return true;
}

// Validar bibliografía específicamente
function validateBibliography() {
    const primaryRefs = countReferences(document.getElementById('primaryBibliography').value);
    const secondaryRefs = countReferences(document.getElementById('secondaryBibliography').value);
    const totalRefs = primaryRefs + secondaryRefs;
    
    let message = `📚 Análisis de Bibliografía:\n\n`;
    message += `• Bibliografía específica: ${primaryRefs}\n`;
    message += `• Bibliografía general: ${secondaryRefs}\n`;
    message += `• Total: ${totalRefs} referencias\n\n`;
    
    if (totalRefs >= 20) {
        message += `✓ Cumple con el mínimo de 20 referencias.\n\n`;
        
        if (primaryRefs < 10) {
            message += `⚠️ Considerá agregar más bibliografía específica del tema (recomendado: al menos 10).`;
        } else if (secondaryRefs < 5) {
            message += `⚠️ Considerá agregar más bibliografía general del campo (recomendado: al menos 5).`;
        } else {
            message += `¡Excelente distribución entre bibliografía específica y general!`;
        }
    } else {
        message += `❌ No cumple con el mínimo. Faltan ${20 - totalRefs} referencias.\n\n`;
        message += `Recomendación: Buscá en bases académicas (SciELO, ERIC, Redalyc, Dialnet) producción reciente sobre tu tema.`;
    }
    
    alert(message);
}

// Generar documento del proyecto
async function generateProjectDocument() {
    const data = collectProjectData();
    
    if (!data.studentName || !data.thesisTitle) {
        alert('Por favor, completá al menos el nombre y el título antes de generar el documento.');
        return;
    }
    
    // Crear contenido del documento
    const documentContent = `
TESINA DE LICENCIATURA EN PSICOPEDAGOGÍA
(Investigación Bibliográfica)

Universidad Católica de La Plata
Seminario: Trabajo Final de Carrera

═══════════════════════════════════════════════════════════════

DATOS DE LA ESTUDIANTE

Nombre: ${data.studentName}
Email: ${data.studentEmail || 'No especificado'}

═══════════════════════════════════════════════════════════════

TÍTULO DE LA TESINA

${data.thesisTitle}
${data.thesisSubtitle ? 'Subtítulo: ' + data.thesisSubtitle : ''}

═══════════════════════════════════════════════════════════════

ÁREA TEMÁTICA

Área de la psicopedagogía: ${data.thematicArea || 'No especificado'}
Marco teórico de referencia: ${data.philosophicalTradition || 'No especificado'}

═══════════════════════════════════════════════════════════════

ELECCIÓN Y DELIMITACIÓN DEL TEMA

${data.themeSelection || 'No especificado'}

═══════════════════════════════════════════════════════════════

PLANTEO DEL PROBLEMA

${data.problemStatement || 'No especificado'}

Pregunta-problema de investigación:
${data.researchQuestion || 'No especificado'}

${data.secondaryQuestions ? 'Preguntas secundarias:\n' + data.secondaryQuestions : ''}

═══════════════════════════════════════════════════════════════

JUSTIFICACIÓN

${data.justification || 'No especificado'}

═══════════════════════════════════════════════════════════════

OBJETIVOS

Objetivo General:
${data.generalObjective || 'No especificado'}

Objetivos Específicos:
${data.specificObjectives || 'No especificado'}

═══════════════════════════════════════════════════════════════

ANTECEDENTES

${data.theoreticalBackground || 'No especificado'}

═══════════════════════════════════════════════════════════════

ESTADO DEL ARTE

${data.stateOfArt || 'No especificado'}

═══════════════════════════════════════════════════════════════

MARCO TEÓRICO

Autores y referentes principales:
${data.mainAuthors || 'No especificado'}

Conceptos clave:
${data.keyConcepts || 'No especificado'}

Desarrollo conceptual previsto:
${data.theoreticalFramework || 'No especificado'}

═══════════════════════════════════════════════════════════════

ASPECTOS METODOLÓGICOS

${data.methodology || 'No especificado'}

═══════════════════════════════════════════════════════════════

CONCLUSIONES ANTICIPADAS

${data.anticipatedConclusions || 'No especificado'}

═══════════════════════════════════════════════════════════════

ESTRUCTURA TENTATIVA DE LA TESINA

${data.thesisStructure || 'No especificado'}

═══════════════════════════════════════════════════════════════

BIBLIOGRAFÍA PRELIMINAR

Bibliografía Específica:
${data.primaryBibliography || 'No especificado'}

Bibliografía General y de Referencia:
${data.secondaryBibliography || 'No especificado'}

═══════════════════════════════════════════════════════════════

Fecha de generación: ${new Date().toLocaleDateString('es-AR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}
    `.trim();
    
    // Crear y descargar archivo
    const blob = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tesina_${data.studentName.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✓ Documento generado y descargado exitosamente');
}

// Configurar botones de asistencia IA
function setupAIAssistButtons() {
    document.getElementById('aiTitleSuggestion').addEventListener('click', () => aiAssist('title'));
    document.getElementById('aiThemeSelectionHelp').addEventListener('click', () => aiAssist('themeSelection'));
    document.getElementById('aiProblemHelp').addEventListener('click', () => aiAssist('problem'));
    document.getElementById('aiJustificationHelp').addEventListener('click', () => aiAssist('justification'));
    document.getElementById('aiObjectiveHelp').addEventListener('click', () => aiAssist('objective'));
    document.getElementById('aiSpecificObjectivesHelp').addEventListener('click', () => aiAssist('specificObjectives'));
    document.getElementById('aiBackgroundHelp').addEventListener('click', () => aiAssist('background'));
    document.getElementById('aiStateOfArtHelp').addEventListener('click', () => aiAssist('stateOfArt'));
    document.getElementById('aiAuthorsHelp').addEventListener('click', () => aiAssist('authors'));
    document.getElementById('aiConceptsHelp').addEventListener('click', () => aiAssist('concepts'));
    document.getElementById('aiTheoreticalFrameworkHelp').addEventListener('click', () => aiAssist('theoreticalFramework'));
    document.getElementById('aiMethodologyHelp').addEventListener('click', () => aiAssist('methodology'));
    document.getElementById('aiAnticipatedConclusionsHelp').addEventListener('click', () => aiAssist('anticipatedConclusions'));
    document.getElementById('aiStructureHelp').addEventListener('click', () => aiAssist('structure'));
    document.getElementById('aiPrimaryBibHelp').addEventListener('click', () => aiAssist('primaryBib'));
    document.getElementById('aiSecondaryBibHelp').addEventListener('click', () => aiAssist('secondaryBib'));
}

// Asistencia IA para el proyecto - ENFOQUE TUTORIAL
async function aiAssist(type) {
    const data = collectProjectData();
    let prompt = '';
    
    switch(type) {
        case 'title':
            if (!data.problemStatement && !data.themeSelection) {
                alert('Por favor, completá primero el planteo del problema o la elección del tema para que pueda orientarte con el título.');
                return;
            }
            prompt = `La estudiante tiene este planteo:

Tema/Delimitación: "${data.themeSelection || 'No especificado'}"
Problema: "${data.problemStatement || 'No especificado'}"

EN LUGAR DE DARLE TÍTULOS DIRECTAMENTE, guiala paso a paso:
1. Explicale qué características debe tener un buen título de tesina bibliográfica (debe indicar que es revisión bibliográfica, incluir conceptos clave, marco teórico si corresponde)
2. Hacele 2-3 preguntas que la ayuden a pensar su propio título
3. Mostrá 1-2 ejemplos SOLO como referencia de estructura, no para copiar
4. Proponele que formule 2-3 opciones propias

Usá voseo argentino.`;
            break;
            
        case 'themeSelection':
            prompt = `La estudiante está trabajando en:
Título tentativo: ${data.thesisTitle || 'No especificado'}
Área: ${data.thematicArea || 'No especificado'}

EN LUGAR DE ELEGIRLE EL TEMA, guiala paso a paso:
1. Explicale los criterios de un buen tema para tesina bibliográfica: relevancia, manejabilidad, acotación
2. Enseñale la técnica de delimitación por capas (área → problema → enfoque)
3. Hacele preguntas para que verifique la viabilidad de su tema
4. Proponele un esquema para que ella redacte su justificación de la elección y delimitación

Usá voseo argentino.`;
            break;
            
        case 'problem':
            if (!data.thesisTitle && !data.themeSelection && !data.researchQuestion) {
                alert('Por favor, completá primero el título, el tema o la pregunta de investigación.');
                return;
            }
            prompt = `La estudiante tiene:
Título: ${data.thesisTitle || 'No especificado'}
Tema/Delimitación: ${data.themeSelection || 'No especificado'}
Pregunta-problema: ${data.researchQuestion || 'No especificado'}

EN LUGAR DE ESCRIBIR EL PLANTEO, guiala paso a paso:
1. Explicale qué es un problema en una tesina bibliográfica (es una pregunta teórica a indagar vía literatura, NO una problemática empírica a observar)
2. Hacele preguntas para que delimite la situación problemática
3. Enseñale a formular una buena pregunta-problema
4. Proponele un esquema para que ella redacte el planteo

Usá voseo argentino.`;
            break;
            
        case 'justification':
            if (!data.problemStatement && !data.themeSelection) {
                alert('Por favor, completá primero el planteo del problema o la elección del tema.');
                return;
            }
            prompt = `La estudiante tiene este planteo:
Tema: "${data.themeSelection || 'No especificado'}"
Problema: "${data.problemStatement || 'No especificado'}"

EN LUGAR DE ESCRIBIR LA JUSTIFICACIÓN, guiala:
1. Explicale qué criterios hacen relevante una tesina bibliográfica (relevancia teórica, profesional, social)
2. Hacele preguntas: ¿Por qué este tema importa? ¿Qué vacío llena en la literatura? ¿Qué utilidad tiene para la práctica?
3. Enseñale a argumentar relevancia sin exagerar ni minimizar
4. Proponele una estructura para que ella redacte su justificación

Usá voseo argentino.`;
            break;
            
        case 'objective':
            if (!data.researchQuestion) {
                alert('Por favor, completá primero la pregunta-problema de investigación.');
                return;
            }
            prompt = `La pregunta-problema de la estudiante es:

"${data.researchQuestion}"

EN LUGAR DE ESCRIBIR EL OBJETIVO, guiala:
1. Explicale la diferencia entre objetivo general y específicos
2. Enseñale qué verbos son apropiados para tesina bibliográfica (analizar, sistematizar, articular, comparar, revisar, caracterizar) y cuáles NO (medir, implementar, aplicar)
3. Mostrá cómo el objetivo debe responder directamente a la pregunta-problema
4. Proponele un método para verificar si su objetivo es alcanzable vía revisión bibliográfica

Usá voseo argentino.`;
            break;
            
        case 'specificObjectives':
            if (!data.generalObjective) {
                alert('Por favor, completá primero el objetivo general.');
                return;
            }
            prompt = `El objetivo general de la estudiante es:

"${data.generalObjective}"

EN LUGAR DE ESCRIBIR LOS ESPECÍFICOS, guiala:
1. Explicale cómo los específicos deben descomponer el general en pasos verificables vía revisión bibliográfica
2. Enseñale que idealmente cada específico corresponde a un apartado del marco teórico
3. Hacele preguntas: ¿Qué necesitás revisar primero, después, etc.?
4. Proponele que piense en 3-5 etapas lógicas de su indagación

Usá voseo argentino.`;
            break;
            
        case 'background':
            if (!data.thesisTitle && !data.problemStatement) {
                alert('Por favor, completá primero el título o el planteo del problema.');
                return;
            }
            prompt = `El tema de la estudiante es:
Título: ${data.thesisTitle || 'No especificado'}
Problema: ${data.problemStatement || 'No especificado'}

EN LUGAR DE LISTAR ANTECEDENTES, guiala:
1. Explicale qué son los antecedentes (investigaciones específicas previas, distintos del estado del arte y del marco teórico)
2. Enseñale dónde buscarlos: SciELO, Redalyc, Dialnet, repositorios institucionales (SEDICI, UBA, CONICET)
3. Enseñale a reseñar cada antecedente: autor, año, objeto, método, hallazgos, aportes y limitaciones
4. Proponele criterios de búsqueda con palabras clave

Usá voseo argentino.`;
            break;
            
        case 'stateOfArt':
            if (!data.thesisTitle && !data.problemStatement) {
                alert('Por favor, completá primero el título o el planteo del problema.');
                return;
            }
            prompt = `El tema de la estudiante es:
Título: ${data.thesisTitle || 'No especificado'}
Problema: ${data.problemStatement || 'No especificado'}

EN LUGAR DE ESCRIBIR EL ESTADO DEL ARTE, guiala:
1. Explicale qué es el estado del arte (mapeo amplio del campo de estudios) y cómo se diferencia de antecedentes (específicos) y marco teórico (conceptual)
2. Enseñale formas de organizar el estado del arte (por períodos, por perspectivas teóricas, por sub-temas, por hallazgos)
3. Hacele preguntas: ¿Qué líneas dominantes hay? ¿Qué debates? ¿Qué vacíos?
4. Proponele herramientas útiles (Connected Papers, Google Scholar)

Usá voseo argentino.`;
            break;
            
        case 'authors':
            if (!data.thesisTitle && !data.problemStatement) {
                alert('Por favor, completá primero el título o el planteo del problema.');
                return;
            }
            prompt = `El tema de la estudiante es:
Título: ${data.thesisTitle || 'No especificado'}
Problema: ${data.problemStatement || 'No especificado'}
Área: ${data.thematicArea || 'No especificado'}

EN LUGAR DE LISTAR AUTORES, guiala:
1. Explicale criterios para seleccionar autores y referentes psicopedagógicos relevantes (clásicos vs contemporáneos, disciplinares vs interdisciplinares)
2. Enseñale a buscar en bases académicas
3. Hacele preguntas: ¿Qué corriente teórica enmarca tu problema? ¿Quiénes son los referentes clásicos y los actuales?
4. Proponele que identifique 3-5 autores clave y justifique por qué cada uno

Usá voseo argentino.`;
            break;
            
        case 'concepts':
            if (!data.thesisTitle && !data.problemStatement) {
                alert('Por favor, completá primero el título o el planteo del problema.');
                return;
            }
            prompt = `El tema de la estudiante es:
Título: ${data.thesisTitle || 'No especificado'}
Problema: ${data.problemStatement || 'No especificado'}

EN LUGAR DE LISTAR CONCEPTOS, guiala:
1. Explicale cómo identificar conceptos centrales en una tesina bibliográfica
2. Enseñale a distinguir conceptos nucleares (los que vertebran toda la tesina) de conceptos secundarios
3. Hacele preguntas: ¿Qué términos necesitás definir? ¿Qué categorías guían tu lectura?
4. Proponele un método para mapear la red conceptual de su tesina

Usá voseo argentino.`;
            break;
            
        case 'theoreticalFramework':
            if (!data.mainAuthors || !data.keyConcepts) {
                alert('Por favor, completá primero los autores principales y los conceptos clave.');
                return;
            }
            prompt = `La estudiante tiene:
Autores: ${data.mainAuthors}
Conceptos: ${data.keyConcepts}

EN LUGAR DE ESCRIBIR EL MARCO, guiala:
1. Explicale qué es el marco teórico en una tesina bibliográfica (desarrollo conceptual de las categorías y autores)
2. INSISTÍ en que el marco NO es sumatoria de resúmenes, sino DIÁLOGO crítico
3. Hacele preguntas: ¿Cómo dialogan tus autores? ¿En qué orden los presentás? ¿Dónde aparece tu posicionamiento?
4. Proponele una estructura de capítulos/apartados articulada

Usá voseo argentino.`;
            break;
            
        case 'methodology':
            if (!data.problemStatement && !data.thesisTitle) {
                alert('Por favor, completá primero el título o el planteo del problema.');
                return;
            }
            prompt = `La estudiante investiga (vía revisión bibliográfica):
Título: ${data.thesisTitle || 'No especificado'}
Problema: ${data.problemStatement || 'No especificado'}

EN LUGAR DE ESCRIBIR EL ENCUADRE METODOLÓGICO, guiala:
1. Explicale qué se espera en una sección metodológica de tesina bibliográfica: criterios de búsqueda, criterios de selección de fuentes, método de análisis
2. NO es trabajo de campo, así que NO hablamos de población, muestra, instrumentos, etc.
3. Hacele preguntas: ¿Qué palabras clave usaste? ¿Qué bases consultaste? ¿Qué criterios usaste para seleccionar fuentes (años, idiomas, calidad académica)? ¿Cómo organizaste el análisis?
4. Proponele una estructura para que ella redacte

Usá voseo argentino.`;
            break;
            
        case 'anticipatedConclusions':
            if (!data.researchQuestion && !data.theoreticalFramework) {
                alert('Por favor, completá primero la pregunta-problema o el marco teórico.');
                return;
            }
            prompt = `La estudiante tiene:
Pregunta-problema: ${data.researchQuestion || 'No especificado'}
Marco teórico previsto: ${data.theoreticalFramework || 'No especificado'}

EN LUGAR DE ESCRIBIR LAS CONCLUSIONES, guiala:
1. Explicale qué son las "conclusiones anticipadas" (hipótesis provisorias antes de hacer la revisión completa)
2. Enseñale los componentes de las conclusiones finales: análisis del marco, respuesta a la pregunta-problema, síntesis, aportes, limitaciones, nuevas líneas
3. Hacele preguntas: ¿Qué respuesta darías hoy a tu pregunta-problema? ¿Qué síntesis pensás que vas a poder hacer? ¿Qué líneas futuras vislumbrás?
4. Proponele un esquema para sus conclusiones anticipadas

Usá voseo argentino.`;
            break;
            
        case 'structure':
            if (!data.specificObjectives) {
                alert('Por favor, completá primero los objetivos específicos.');
                return;
            }
            prompt = `Los objetivos de la estudiante son:
General: ${data.generalObjective}
Específicos: ${data.specificObjectives}

EN LUGAR DE ESCRIBIR LA ESTRUCTURA, guiala:
1. Explicale la estructura típica de una tesina bibliográfica: Introducción / Cap 1: Antecedentes y estado del arte / Cap 2: Marco teórico / Conclusiones / Referencias / Anexos
2. Mostrá cómo la estructura debe reflejar los objetivos (cada capítulo responde a uno o varios)
3. Hacele preguntas: ¿Qué orden lógico tiene tu argumentación? ¿Conviene dividir el marco teórico en varios capítulos?
4. Proponele que arme un índice tentativo con sus objetivos como guía

Usá voseo argentino.`;
            break;
            
        case 'primaryBib':
            if (!data.mainAuthors && !data.thesisTitle) {
                alert('Por favor, completá primero el título o los autores principales.');
                return;
            }
            prompt = `La estudiante trabaja sobre:
Título: ${data.thesisTitle || 'No especificado'}
Autores: ${data.mainAuthors || 'No especificado'}

EN LUGAR DE LISTAR BIBLIOGRAFÍA, guiala:
1. Explicale qué bibliografía es específica del tema (autores y trabajos centrales sobre tu problema)
2. Enseñale a buscar en bases académicas (SciELO, ERIC, Redalyc, Dialnet) producción reciente
3. Enseñale el formato APA 7ª edición con ejemplos
4. Proponele criterios para seleccionar las obras más relevantes (autoridad, actualidad, pertinencia)
5. Recordale que para tesina bibliográfica se requieren al menos 20 referencias en total

Usá voseo argentino.`;
            break;
            
        case 'secondaryBib':
            if (!data.mainAuthors && !data.thesisTitle) {
                alert('Por favor, completá primero el título o los autores principales.');
                return;
            }
            prompt = `La estudiante trabaja sobre:
Título: ${data.thesisTitle || 'No especificado'}
Autores: ${data.mainAuthors || 'No especificado'}
Área: ${data.thematicArea || 'No especificado'}

EN LUGAR DE LISTAR BIBLIOGRAFÍA, guiala:
1. Explicale qué es bibliografía general (clásicos del campo, marcos teóricos generales, obras de referencia disciplinares)
2. Enseñale a usar bases de datos académicas y repositorios institucionales
3. Enseñale el formato APA para diferentes tipos de fuentes (libros, artículos, capítulos, tesis, recursos web)
4. Proponele criterios de calidad para evaluar fuentes (revistas indexadas, autores reconocidos, actualidad)

Usá voseo argentino.`;
            break;
    }
    
    // Llamar a la IA
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = '⏳ Orientando...';
    
    try {
        const response = await callOpenRouterAPI(
            'Sos un TUTOR de tesinas bibliográficas en psicopedagogía. Tu rol es GUIAR a la estudiante paso a paso, NO hacer el trabajo por ella. Enseñale a pensar y desarrollar su propio trabajo. La tesina es una INVESTIGACIÓN BIBLIOGRÁFICA, NO de campo. Usá voseo argentino.',
            [{ role: 'user', parts: [{ text: prompt }] }]
        );
        
        const cleanText = cleanMarkdown(response);
        showTutorModal('Orientación del Tutor', cleanText);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al generar orientación. Por favor, intentá nuevamente.');
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

// Función para mostrar modal de orientación tutorial
function showTutorModal(title, content) {
    let modal = document.getElementById('tutorModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tutorModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content tutor-modal">
                <h3 id="tutorModalTitle"></h3>
                <div id="tutorModalContent" class="tutor-content"></div>
                <div class="modal-buttons">
                    <button onclick="copyTutorContent()" class="btn-secondary">📋 Copiar como referencia</button>
                    <button onclick="closeTutorModal()" class="btn-primary">Entendido</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('tutorModalTitle').textContent = title;
    document.getElementById('tutorModalContent').innerHTML = formatMessage(content);
    modal.style.display = 'flex';
}

function closeTutorModal() {
    const modal = document.getElementById('tutorModal');
    if (modal) modal.style.display = 'none';
}

function copyTutorContent() {
    const content = document.getElementById('tutorModalContent').innerText;
    navigator.clipboard.writeText(content).then(() => {
        alert('Orientación copiada. Usala como guía para desarrollar tu propio trabajo.');
    });
}

// Función para limpiar formato markdown
function cleanMarkdown(text) {
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/__(.+?)__/g, '$1');
    text = text.replace(/\*(.+?)\*/g, '$1');
    text = text.replace(/_(.+?)_/g, '$1');
    text = text.replace(/`(.+?)`/g, '$1');
    text = text.replace(/^#{1,6}\s+/gm, '');
    return text;
}
