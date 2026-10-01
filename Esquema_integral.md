# ESQUEMA FUNCIONAL INTEGRAL DE APP "Eusomnia: salud a través del sueño"

## 🎯 Paso 0: Contexto Global y Núcleo Unificado de la App

- **Visión del producto:** Una aplicación para **gestionar la higiene del sueño**. El usuario registra su día (hábitos, cena, actividad, pantallas, incidencias, comida) y cuenta su sueño anterior en un mismo acto diario (con texto o voz). El mismo motor de IA que interpreta el sueño es el que conoce los hábitos, cruza ambas capas de información y devuelve en una sola respuesta la interpretación, los patrones detectados y las recomendaciones personalizadas.
- **Principio de integración (clave del esquema):** Los dos esquemas preexistentes **no se suman en paralelo, se anidan**. El **relato del sueño ** aporta el contenido simbólico y emocional y **los hábitos y la nutrición son la capa de contexto explicativo** (aportan las causas probables del sueño y de su calidad). El análisis final tiene sentido si ambas capas se interpretan juntas: un mismo símbolo recurrente puede explicarse por estrés, una cena pesada, cafeína..., y esa conexión solo existe dentro de este esquema integral.
- **Entidades funcionales del sistema (una sola base de datos, un solo histórico):**
  - **Perfil del usuario:** preferencias de IA (clave de la app o BYOAI - Pro), modelo elegido, zona horaria y ajustes de recordatorio.
  - **Registro diario (entidad central):** agrupa en un mismo día el relato del sueño, datos de hábitos, información nutricional y resultado del análisis. Es la pieza que permite el cruce de datos.
  - **Relato de sueño:** texto original, texto definitivo corregido por el usuario y, si aplica, audio de origen transcrito.
  - **Datos de higiene y hábitos:** actividad física, sensación previa al dormir, uso de pantallas, incidencias puntuales.
  - **Información nutricional:** resultado externo obtenido a partir de los alimentos registrados (calorías, cafeína, azúcar, etc.).
  - **Conceptos oníricos detectados:** slugs y summary de los escenarios/símbolos localizados por el motor vectorial.
  - **Análisis IA unificado:** interpretación del sueño, emociones, símbolos, patrones, correlaciones y recomendaciones de hábitos.
  - **Histórico y estadísticas:** evolución temporal de todos los registros anteriores, base del panel integral.
- **Ciclo diario del usuario (bucle único de la app):** Registrar → Analizar → Interpretar → Recibir recomendaciones → Consultar patrones/historial → Ajustar hábitos → Registrar de nuevo. Cada vuelta del bucle alimenta el motor de correlaciones, por lo que la app mejora su precisión con el uso.
- **Dos entradas, un solo motor de análisis:** La app tiene dos puertas de entrada de información (el relato del sueño y el formulario de hábitos) pero **un único análisis y una única llamada de orquestación a la IA**.

## 📥 Paso 1: Captura Unificada de Datos (Hábitos + Sueño)

- **UI (React):** El usuario dispone de una **pantalla de registro diario**, organizada en dos bloques: el **bloque "Hábitos del día"** (entrada estructurada) y el **bloque "Sueño"** (entrada narrativa). El usuario puede rellenar los bloques en cualquier orden; la app no envía nada al backend hasta que el usuario confirma explícitamente el registro completo.

### 1A · Entrada de Datos de Higiene del Sueño (Formulario Estructurado)

- **UI (React):** En el bloque "Hábitos del día", el usuario completa el formulario de hábitos diarios dentro de la misma interfaz diseñada con Bootstrap y CSS:
  - **Actividad física del día:** Selector con opciones: nada, baja, media, alta
  - **Tipo de cena:** Selector con opciones: nada, ligera, media, pesada
  - **Sensación general antes de dormir:** Selector con opciones: cansada, estresada, relajada, triste, alegre
  - **Tiempo de uso de pantallas:** Selector con opciones: móvil, laptop, tablet
  - **Incidencias puntuales:** Selector múltiple con opciones: accidente, buenas noticias, malas noticias, premios, multas, etc.
  - **Campo de comida:** Entrada de texto con sugerencias nutricionales
- **BACKEND:** React envía los datos del formulario al servidor de Flask, junto con el texto definitivo del sueño, formando **un único envío de registro diario**.
- **Resultado en la UI:** Los datos quedan retenidos en la pantalla de registro a la espera de la confirmación final del usuario.

### 1B · Entrada del Sueño (Texto Directo o Transcripción de Voz Segura)

- **UI (React):** Dentro del bloque "Sueño", el usuario cuenta con dos opciones:
  - **Opción A (Texto):** Escribe su experiencia directamente en un cuadro de texto amplio (textarea).
  - **Opción B (Voz):** Presiona un botón de micrófono estilizado para grabar el audio de su relato en vivo.
- **BACKEND:** Si el usuario elige la opción de voz, React envía el archivo de audio crudo (Blob) al servidor de Flask.
- **IA en acción (Solo para Voz):** El backend actúa como un proxy seguro y transmite el audio a la API de Whisper. Whisper convierte la voz en texto exacto en inglés y se lo devuelve a Flask.
- **Resultado en la UI:** El navegador despliega el texto definitivo (ya sea escrito o transcrito por Whisper) dentro del cuadro de edición por si el usuario quiere pulir la redacción, corregir errores o matizar palabras antes de proceder.

### 1C · Enriquecimiento Nutricional Externo (CalorieNinjas)

- **BACKEND:** El backend actúa como proxy y transmite la información de comida (campo de comida del formulario) a la API de CalorieNinjas. Esta API devuelve información nutricional detallada (calorías, cafeína, azúcar, etc.).
- **Resultado en la UI:** El navegador muestra la información nutricional obtenida y permite al usuario revisar y confirmar sus datos antes de proceder.
- **Punto de integración:** La nutrición no se trata como un dato aislado del sueño: el resultado de CalorieNinjas se incorpora inmediatamente al **contexto del mismo registro diario**, de modo que queda disponible tanto para el análisis de patrones (Paso 2) como para la interpretación del sueño y las recomendaciones (Paso 3).

### 1D · Confirmación del Registro Diario

- **UI (React):** El usuario revisa conjuntamente el texto del sueño, el formulario de hábitos y la información nutricional en una vista previa de confirmación, y presiona el botón **"Confirmar y Analizar"**.
- **BACKEND:** Flask valida que exista al menos el relato del sueño y recibe el resto de campos como contexto opcional.
- **Resultado:** Se cierra la fase de captura y comienza el pipeline unificado de análisis. A partir de este punto, sueño, hábitos y nutrición viajan juntos como **un solo objeto de registro**.

## 🧠 Paso 2: Análisis Multicapa (Vectorial + Nutricional + Correlaciones)

Los datos de sueño y los datos de hábitos se convierten en una única matriz de contexto. El análisis se ejecuta en cuatro capas consecutivas sobre el **mismo objeto de registro** confirmado en el Paso 1.

- **UI (React):** Tras confirmar el registro diario, la interfaz muestra un estado de procesamiento (indicador de carga) mientras el backend ejecuta las cuatro capas de análisis. El usuario no interviene; sólo espera el resultado.

### 2A · Extracción Vectorial de Conceptos Oníricos (Precisión Contextual Local con NumPy)

- **Backend + Caché de Memoria (Flask + NumPy):** El servidor de Flask toma el texto final del sueño y ejecuta una búsqueda geométrica en bloque:
  - **Diccionario Base en db:** El diccionario base .csv (~1.000 - 7.000 términos según el escogido) aporta precisión gramatical (Ej: diferenciar si una araña persigue al usuario, o si el usuario la aplasta con una piedra).
  - **Formato Vectorial Precargado:** El diccionario se procesa para convertirse en un **.npy** (archivo binario de matrices numéricas densas). Al encender el backend, el .npy se monta en la RAM del servidor como caché activa.
  - **Búsqueda Matricial en Bloque:** Flask usa la librería **sentence-transformers** para convertir textos en vectores matemáticos (embeddings) y los compara con los escenarios del diccionario simultáneamente.
- **Resultado:** El motor en memoria RAM obtiene los **conceptos oníricos detectados** (slugs y summary), que pasan a formar parte del contexto unificado en el registro diario al que pertenecen.

### 2B · Normalización de la Información Nutricional

- **Backend (Flask):** El servidor procesa el resultado de CalorieNinjas obtenido en el Paso 1C y lo normaliza a un formato comparable entre días: calorías totales, cafeína, azúcar y demás valores relevantes, asociados siempre a la comida concreta registrada.
- **Resultado:** Un bloque nutricional estandarizado del día, listo para ser correlacionado con hábitos y con sueño.

### 2C · Análisis de Patrones y Correlaciones sobre el Histórico

- **Backend + Lógica de Negocio (Flask):** El servidor analiza el registro actual **contra el histórico completo** del usuario, cruzando tres dominios en una misma consulta lógica:
  - **Cruce sueño ↔ hábitos:** relaciona los símbolos y emociones detectados en 2A con los hábitos del día (actividad, cena, pantallas, sensación, incidencias) y con días anteriores de características similares.
  - **Cruce sueño ↔ nutrición:** relaciona los símbolos y emociones con los valores nutricionales normalizados en 2B, especialmente cafeína, azúcar y peso de la cena.
  - **Cruce hábitos ↔ hábitos:** detecta recurrencias y tendencias del propio usuario (por ejemplo, noches con pantallas + cena pesada que coinciden con sueños de ansiedad, o rachas de días con actividad alta).
- **Preparación del prompt para la IA:** El backend compila todos los datos relevantes (registro actual + tendencias históricas + conceptos oníricos + hábitos + nutrición) en un único bloque de contexto estructurado.
- **Resultado:** El sistema identifica patrones y correlaciones en los datos del usuario, y dispone de un contexto unificado listo para la orquestación de IA del Paso 3.

### 2D · Compilación del Contexto Unificado de Análisis

- **Backend (Flask):** Como cierre del Paso 2, el backend ensambla un único paquete de análisis que contiene:
  1. El **texto definitivo del sueño** (relato corregido por el usuario).
  2. Los **conceptos oníricos detectados** (slugs + summary procedentes de 2A).
  3. Los **datos de hábitos del día** (formulario del Paso 1B).
  4. La **información nutricional normalizada** (Paso 2B).
  5. Las **correlaciones y patrones** detectados contra el histórico (Paso 2C).
- **Resultado:** Un contexto único y coherente. Este paquete viaja al motor de IA para que el LLM puede interpretar **en una sola pasada** en lugar de producir dos análisis inconexos.

## 🏎️ Paso 3: Orquestación IA Unificada (Interpretación + Recomendaciones + Patrones)

- **Orquestación (Flask):** El backend toma el **contexto unificado** compilado en el Paso 2D y lo envía a un modelo de lenguaje: un solo prompt que pide simultáneamente la lectura onírica y la lectura de hábitos.
- **Elección de la IA:** Flask evalúa la preferencia del usuario, guardada en su perfil y común a toda la app:
  - **Opción A (Por defecto):** Usa la clave de la app conectada a OpenRouter, empleando un modelo libre.
  - **Opción B (BYOAI - Pro):** Usa la API Key propia del usuario y el modelo que el usuario haya ingresado en su perfil.
- **Instrucción al modelo:** El sistema pide al LLM que actúe como intérprete de sueños y como asesor de higiene del sueño a la vez, y que su respuesta conecte ambas capas: qué dice el sueño, qué hábitos del día o del histórico pueden estar influyendo, y qué conviene cambiar.
- **Resultado:** El LLM devuelve un **JSON** en la UI que integra:
  - **Interpretación del sueño:** lectura empática y sintetizada del relato, con las emociones predominantes y los símbolos clave.
  - **Lectura de hábitos y nutrición:** observaciones sobre actividad, cena, pantallas, sensación e ingesta (cafeína, azúcar, calorías) en relación con el sueño de esa noche.
  - **Patrones detectados:** relación con el histórico, recurrencias y tendencias que el motor de correlaciones haya señalado.
  - **Recomendaciones de hábitos personalizadas:** acciones concretas y priorizadas para mejorar el sueño, derivadas del cruce de sueño + hábitos + nutrición.
  - **Alertas o avisos:** señales que merezcan atención (por ejemplo, cafeína tardía recurrente o combinaciones de hábitos asociadas a sueños de ansiedad).
- **Principio de diseño del prompt:** El esquema exige que el modelo **nunca** emita interpretación y recomendaciones como dos bloques independientes y desconectados.

## 🗄️ Paso 4: Almacenamiento Unificado y Despliegue Visual

- **Base de Datos (SQLAlchemy):** Flask guarda **un solo registro diario** con toda la información del ciclo, en lugar de dos historiales separados. El registro conserva:
  - El **texto original** del sueño y su **texto definitivo** corregido por el usuario (más la referencia al audio, si se usó voz).
  - Los **datos de higiene del sueño** del día (actividad, cena, sensación, pantallas, incidencias).
  - La **información nutricional** obtenida y normalizada (calorías, cafeína, azúcar, etc.).
  - Los **slugs de los conceptos oníricos** detectados.
  - El **JSON del LLM unificado** (interpretación, emociones, símbolos, lectura de hábitos, patrones, recomendaciones y alertas).
  - La **fecha** del registro, que es la clave que permite construir cualquier serie temporal.
- **Regla de integridad:** el histórico siempre es consultable por fecha y siempre cruza sueño, hábitos y nutrición sin necesidad de reconstruir relaciones a posteriori.
- **UI Final (React):** La aplicación despliega el resultado del registro de forma visual e intuitiva, reuniendo los dos modos de presentación de los esquemas originales en una misma pantalla de resultado:
  - La **interpretación principal** en una tarjeta de Bootstrap.
  - Las **emociones y símbolos** en etiquetas de colores (badges).
  - La **lectura de hábitos y nutrición** del día en una tarjeta o bloque informativo.
  - Las **recomendaciones personalizadas** en tarjetas de colores, ordenadas por prioridad.
  - Las **alertas o avisos** destacados visualmente (por color y por posición).
  - Un acceso directo al **historial** del día consultado y al panel integral del Paso 5.
- **Resultado:** El usuario recibe la interpretación de su sueño y las recomendaciones de hábitos que se derivan de ella.

## 📊 Paso 5: Panel Integral (Estadísticas, Historial y Patrones)

- **UI (React):** Además de la pantalla de resultado del día, la app ofrece un **panel integral** que explota todo el histórico acumulado.
- **Bloques del panel:**
  - **Historial de registros:** lista interactiva de los registros diarios anteriores; al seleccionar uno se abre su análisis completo (interpretación, badges, hábitos, nutrición y recomendaciones).
  - **Estadísticas y evolución temporal:** gráficos de la evolución de los hábitos registrados y de los indicadores nutricionales.
  - **Mapa de símbolos y emociones:** frecuencia de aparición de los conceptos oníricos (slugs) y de las emociones a lo largo del histórico.
  - **Patrones y correlaciones visualizadas:** representación de las asociaciones detectadas , por ej. combinaciones de hábitos y nutrición que acompañan a determinados tipos de sueño o emociones.
  - **Recomendaciones agregadas:** las recomendaciones generadas por la IA, agrupadas por tema (alimentación, horarios, pantallas...).
  - **Indicadores de seguimiento:** métricas resumen orientadas a la higiene del sueño (consistencia de horarios, cafeína tardía, rachas...).
- **Enfoque temporal:** El panel permite consultar por día, semana y periodo largo, y compara el registro actual con la media del propio usuario.s.
- **Resultado:** El usuario obtiene una visión completa de su higiene del sueño y recomendaciones.

## 🔐 Módulos Transversales de la App

Estos elementos no pertenecen a un solo paso: atraviesan toda la arquitectura descrita arriba.

- **Perfil y preferencias de IA (BYOAI - Pro):** El usuario guarda en su perfil la elección de motor (Opción A con clave de la app / Opción B con su propia clave y modelo) y sus ajustes de recordatorio.
- **Privacidad del diario:** El relato del sueño y los datos de hábitos y nutrición son información íntima. Todo el análisis se ejecuta bajo el perfil autenticado del usuario, y el histórico solo es accesible para su dueño.
- **Trazabilidad del análisis:** Cada recomendación del JSON queda vinculada a los símbolos, emociones o hábitos que la originan, de modo que el usuario siempre puede entender por qué se le recomienda algo.
- **Continuidad del bucle:** La app está diseñada para usarse a diario; el valor de las estadísticas de los pasos 2 y 5 crece con cada registro, por lo que el sistema incentiva la constancia..

## 🔄 Resumen del Flujo Integral Extremo a Extremo

| Fase                      | Qué entra                                                       | Qué se procesa                                                                                             | Qué sale                                                                                                 |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Paso 1 · Captura**      | Relato del sueño (texto o voz) + formulario de hábitos + comida | Transcripción con Whisper (si hay voz) y enriquecimiento con CalorieNinjas                                 | Un único registro diario revisado y confirmado                                                           |
| **Paso 2 · Análisis**     | El registro diario confirmado                                   | Extracción vectorial onírica (.npy), normalización nutricional y motor de correlaciones sobre el histórico | Contexto unificado (sueño + símbolos + hábitos + nutrición + patrones)                                   |
| **Paso 3 · IA**           | El contexto unificado                                           | Una sola orquestación (clave de app o BYOAI - Pro)                                                         | JSON único: interpretación, emociones, símbolos, lectura de hábitos, patrones, recomendaciones y alertas |
| **Paso 4 · Persistencia** | El JSON y todos los datos del día                               | Guardado con SQLAlchemy en el registro diario                                                              | Resultado visual: tarjeta de interpretación, badges, tarjetas de recomendaciones e historial             |
| **Paso 5 · Panel**        | El histórico completo                                           | Agregación de estadísticas, símbolos, patrones e indicadores                                               | Visión integral de la higiene del sueño y recomendaciones acumuladas                                     |

## ✅ Reglas de Coherencia del Esquema Integral

Para garantizar la utilidad integral de la app, el esquema impone estas reglas:

1. **Un registro diario, un análisis.** Nunca se guarda un sueño sin su contexto de hábitos ni se analizan por separado; la unidad es el día.
2. **Una orquestación de IA.** La interpretación del sueño y las recomendaciones de hábitos proceden de la misma llamada y del mismo contexto, de modo que siempre están relacionadas entre sí.
3. **El contexto explica el símbolo.** Toda recomendación debe poder justificarse con un símbolo, una emoción o un hábito concreto del registro o del histórico.
4. **El histórico es la base del valor.** Las estadísticas, los patrones y las recomendaciones acumuladas se construyen siempre sobre los registros diarios guardados, nunca sobre datos inventados.
5. **Pantallas de captura y de resultado son distintas.** El usuario primero completa y confirma el registro (Pasos 1) y solo después ve el análisis (Pasos 3 y 4); no se muestra interpretación antes de tener el contexto completo.
6. **La privacidad es transversal.** Cada lectura y escritura del diario está ligada al usuario autenticado y a su propio histórico.
