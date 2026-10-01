# Propuesta de proyecto — Eusomnia

**App de salud a través del sueño: higiene del sueño + interpretación onírica en un solo análisis.**
**Contexto:** proyecto fullstack junior+ para TechLab de 4Geeks Academy.

- **Problema:** los diarios de sueño y los registros de hábitos suelen tratarse por separado; no se explican entre sí.
- **Solución:** un **registro diario único** que integra relato del sueño, hábitos y nutrición, analizado por un **único motor de IA**.
- **Principio clave:** los dos esquemas se **anidan**, no se suman → el sueño aporta el símbolo; hábitos y nutrición aportan la causa probable.

## 🤖 La IA como elemento de valor

- **Interpreta el sueño:** lee el relato y extrae emociones predominantes, símbolos clave y una lectura empática del significado onírico, tomando como fuente de consulta `diccionario.npy` de db.
- **Procesa todos los datos en conjunto:** el mismo motor recibe sueño original + interpretación + hábitos + nutrición + histórico en un **único contexto** (un símbolo recurrente puede explicarse por estrés, una cena pesada o cafeína tardía).
- **Detecta patrones y correlaciones:** cruza el registro actual con el histórico (sueño↔hábitos, sueño↔nutrición, hábitos↔hábitos).
- **Sugiere recomendaciones accionables:** priorizadas y siempre justificables con un dato concreto, nunca genéricas.

## 🔄 Flujo (5 pasos)

1. **Captura unificada:** formulario de hábitos + relato del sueño (texto) + nutrición externa (CalorieNinjas). Confirmación única: _"Confirmar y Analizar"_.
2. **Análisis:** extracción vectorial de conceptos oníricos (`diccionario.npy` + sentence-transformers), normalización nutricional, hábitos y contexto del histórico → **contexto unificado**.
3. **Orquestación IA:** un solo prompt (OpenRouter, clave de la app) que devuelve un **JSON único**: interpretación, emociones, símbolos, lectura de hábitos, patrones, recomendaciones y alertas.
4. **Persistencia y visualización:** un registro diario por fecha en SQLAlchemy; UI con tarjeta de interpretación, badges, recomendaciones priorizadas y alertas.
5. **Panel:** historial y detalle de registros; estadísticas ampliadas en siguientes versiones.

## ⚙️ Esquema de implementaciones

### ✅ MVP (v1.0)

| Módulo            | Tecnología                                           | Función                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend          | React (Hooks, Context/Flux, Bootstrap/CSS)           | **Vista Home:** presentación de app + registro y login<br>**Registro diario:** bloques "Hábitos del día" y "Sueño"<br>**Resultado del día:** interpretación, emociones y símbolos (badges), hábitos y nutrición, recomendaciones, alertas<br>**Historial:** lista registros diarios + detalle del análisis de cada día<br>**Perfil:** edición de username, email y password, preferencias IA y recordatorios<br>**Navbar:** estado de sesión, rutas protegidas y manejo de estados de carga/error<br>**Footer:** copyright, contacto |
|  |
| Backend           | Python + Flask (Blueprints, MVC)                     | Pipeline y proxy seguro de APIs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Base de datos     | SQLAlchemy + SQLite local / PostgreSQL en producción | Registro diario unificado con histórico por fecha                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Auth básica       | Sesiones / JWT                                       | Registro e historial privado por usuario                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Nutrición ⭐      | API CalorieNinjas (proxy desde Flask)                | Calorías, cafeína, azúcar… normalizados                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| IA de análisis ⭐ | OpenRouter (clave de la app)                         | Interpretación + patrones + recomendaciones en un solo JSON                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Motor vectorial   | sentence-transformers + NumPy (`.npy` en RAM)        | Diccionario de ~7.000 términos: candidatos a símbolos oníricos (slugs + summary) con búsqueda por similitud de coseno                                                                                                                                                                                                                                                                                                                                                                                                                |
| Historial         | Vista lista + detalle del día                        | Consulta del registro y su análisis                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Despliegue        | PostgreSQL + `DATABASE_URL` (GitHub Deploy)          | Producción con la misma base de código                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### 🚀 Siguientes versiones (v1.1+)

| Módulo                        | Tecnología                                           | Motivo de aplazamiento                                             |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| Voz → texto                   | API Whisper                                          | Complejidad de audio (Blob, proxy, UX de grabación)                |
| BYOAI - Pro                   | Clave y modelo propios del usuario                   | Requiere gestión avanzada de perfil y validación de keys           |
| Correlaciones sobre histórico | Motor de patrones propio                             | En MVP el histórico se inyecta como contexto reciente en el prompt |
| Panel integral completo       | Gráficos de evolución, mapa de símbolos, indicadores | Añadir charting sobre el MVP ya funcional                          |

**Reglas de coherencia:** un registro diario = un análisis; una sola llamada a la IA; toda recomendación se justifica con un dato concreto; el histórico es la base del valor; privacidad por usuario autenticado.

**Ciclo de uso:** Registrar → Analizar → Recomendaciones → Ajustar hábitos → Registrar. Cada vuelta mejora la precisión del motor.

**Stack resumido:** React + Python + Flask + Blueprints + SQLAlchemy · SQLite/PostgreSQL · CalorieNinjas · OpenRouter · NumPy + sentence-transformers.
