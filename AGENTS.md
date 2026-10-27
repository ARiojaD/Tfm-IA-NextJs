# AGENTS.md — Reglas, Arquitectura y Contexto de MemnonHistory AI

## 1. Visión y Rúbrica del TFM
- **Nombre:** MemnonHistory AI (Gestor Inteligente de Conocimiento Histórico y RAG)
- **Descripción:** Plataforma SaaS fullstack para organizar lecturas, eventos y cronologías históricas (Grecia, Roma, Historia de España, ...), integrada con un sistema RAG para consultas precisas sobre notas personales y fuentes secundarias.
- **Inspiración del Nombre:** Memnón de Etiopía, héroe de la Guerra de Troya (hijo de Eos, la Aurora), símbolo del amanecer del conocimiento histórico y la epopeya clásica.
- **Distribución de Rúbrica TFM:** 
  - **70% Web Fullstack:** Base de datos PostgreSQL/Pgvector, gestión CRUD de eventos y fuentes, líneas del tiempo interactivas, autenticación y panel de usuario.
  - **30% Inteligencia Artificial:** Pipeline RAG sobre notas históricas, generación de embeddings y estructuración automática de fichas históricas mediante LLMs (*Structured Outputs*).

---

## 2. Arquitectura del Sistema: Clean Architecture Pragmática

El proyecto sigue una arquitectura limpia orientada al dominio para garantizar un diseño desacoplado, mantenible y testeable. Cada capa tiene su propia carpeta en `src/`:

```
src/
├── domain/                 # 🔴 DOMINIO: reglas del negocio. No depende de nada
│   ├── entities/           # Entidades (HistoricalTopic, HistoricalEvent, Quiz, Comment, Recommendation)
│   └── value-objects/      # Valores con reglas propias (HistoricalDate, HistoricalPeriod, HistoricalEra, TopicCategory, KeyFact, TopicImage, Slug, EntityId)
├── application/            # 🟠 APLICACIÓN: organiza el trabajo. Depende solo de domain y shared
│   ├── use-cases/          # Casos de uso (GetTopicDetailUseCase, AddCommentUseCase, ExecuteHistoryRAGUseCase)
│   ├── ports/              # Interfaces que necesitan los casos de uso (repositorios, reloj, ids, LLM, embeddings)
│   ├── dto/                # Entradas validadas (AddCommentInput) y salidas públicas (PublicQuiz) de los casos de uso
│   └── errors/             # Errores esperados de los casos de uso (TopicNotFoundError, InvalidCommentError…)
├── infrastructure/         # 🔵 INFRAESTRUCTURA: el mundo real. Implementa los ports
│   ├── persistence/
│   │   ├── in-memory/      # Repositorios en memoria (tests y desarrollo)
│   │   │   └── seed/       # Datos iniciales por tema, validados con los esquemas del dominio
│   │   └── postgres/       # Cliente PostgreSQL + pgvector, esquemas ORM, migraciones y repositorios
│   ├── system/             # Reloj del sistema y generador de UUID (implementan Clock e IdGenerator)
│   ├── rate-limiting/      # Limitadores de frecuencia (implementan RateLimiter)
│   └── ai/                 # Adaptadores de Anthropic Claude (Vercel AI SDK) y de embeddings
├── composition/            # 🟢 COMPOSICIÓN: conecta casos de uso con implementaciones reales
│                           #    (container) y valida la configuración/entorno con Zod
├── shared/                 # 🟤 COMPARTIDO: utilidades transversales sin lógica de negocio (p. ej. Result)
├── app/                    # ⚪ PRESENTACIÓN (Next.js App Router; el nombre lo impone Next.js)
│   ├── api/                # Route Handlers: entrada HTTP. Validan, llaman al caso de uso y responden
│   ├── (dashboard)/        # Vistas de la aplicación protegida
│   └── layout.tsx
├── components/             # ⚪ PRESENTACIÓN: componentes de UI (React + Tailwind CSS)
└── lib/                    # ⚪ PRESENTACIÓN: utilidades de la interfaz (formato de fechas, tema, datos demo)

tests/                      # Tests, fuera de src/, replicando su estructura
├── domain/                 # Unitarios del dominio
├── application/
│   ├── use-cases/          # Unitarios de casos de uso (con repositorios in-memory)
│   └── ports/              # Tests de contrato (*.contract.ts) que debe cumplir toda implementación de un port
├── infrastructure/         # Implementaciones de los ports (ejecutan los contratos) e integración
├── shared/                 # Unitarios de utilidades transversales
├── lib/                    # Unitarios de utilidades de presentación
└── fixtures/               # Constructores de datos de prueba (aTopic, anEvent…)
```

* **Regla de Dependencias:** las dependencias solo apuntan hacia dentro: `infrastructure` → `application` → `domain`. `domain` y `application` **nunca** importan de `infrastructure`, `composition`, `app` ni de Next.js. Los casos de uso piden lo que necesitan del exterior a través de interfaces en `application/ports/`, que `infrastructure/` implementa y `composition/` conecta (inyección de dependencias).
* **Errores esperados:** los casos de uso no lanzan excepciones por situaciones previstas (tema inexistente, entrada inválida). Devuelven un `Result` de `shared/Result.ts` (`{ success: true, data } | { success: false, error }`), coherente con las respuestas de la API.
* **Entradas no confiables:** los casos de uso que reciben datos del usuario aceptan `unknown` y lo validan con su DTO de `application/dto/` (esquema estricto) antes de hacer nada. Los datos que decide el servidor (ids, fechas, propietario) nunca vienen en la entrada: los aportan los ports `IdGenerator` y `Clock` (y la sesión, cuando exista).
* **Salidas sin datos privados:** los casos de uso nunca devuelven a la presentación datos que el usuario no debe ver. Se mapean a un DTO de salida con una lista explícita de campos permitidos (*allowlist*), como `PublicQuiz` (el quiz sin respuestas correctas ni explicaciones). Las respuestas se comprueban en el servidor (`AnswerQuizQuestionUseCase`).
* **Server Actions finas:** son endpoints POST públicos. No contienen lógica: identifican a quien llama (`lib/requesterId.ts`), pasan la entrada sin confiar en ella (`unknown`) al caso de uso y traducen su `Result` a lo que muestra la interfaz, sin filtrar detalles internos en los mensajes de error.
* **Rate limiting (OWASP API4):** todo caso de uso invocado desde una Server Action que escriba datos o consuma recursos recibe un `requesterId` y un port `RateLimiter`, y comprueba el límite **antes** de validar (los intentos inválidos también cuentan). Las políticas (`COMMENT_RATE_LIMIT`, `QUIZ_ANSWER_RATE_LIMIT`) viven en `composition/container.ts`. La implementación en memoria solo vale para un proceso; en un despliegue con varias instancias debe sustituirse por un almacén compartido (Redis, PostgreSQL). Las cabeceras de IP solo son fiables detrás de un proxy de confianza; con autenticación, el `requesterId` será el id de usuario.
* **Container en desarrollo:** `getContainer()` comparte en `globalThis` solo el estado (repositorios y contadores del rate limiting) y crea los casos de uso en cada llamada, para que la recarga en caliente de Next.js aplique el código editado sin perder los datos en memoria. Si una recarga redefine una clase de infraestructura (se detecta con `instanceof`) o cambia el seed (otro objeto `SEED`), el estado creado con la versión anterior se reconstruye.
* **Navegación:** civilización (`/roma`) → categoría como sección de esa página (`/roma#personajes`; `/roma/personajes` redirige ahí) → tema (`/roma/personajes/julio-cesar`). Las URLs se construyen siempre con `lib/routes.ts`.
* **Modelo de un tema:** todo tema tiene un `period` (inicio y fin opcional) que lo ordena cronológicamente, una `introduction` en párrafos (el texto principal que indexará el RAG), `keyFacts` genéricos de etiqueta y valor (sirven igual para un personaje que para una batalla), una `image` opcional (solo archivos locales de `public/images`, con pie y crédito breves y su ancho y alto reales; va debajo de la introducción y los datos clave, a todo el ancho si es apaisada y centrada si es vertical; un test comprueba que el archivo existe) y `relatedTopicIds`, guardados en ambos temas (en PostgreSQL será una tabla de relación).
* **Puertos asíncronos y contratos:** todos los ports de persistencia devuelven `Promise`, aunque la implementación sea en memoria. Cada port tiene un test de contrato en `tests/application/ports/` que deben pasar todas sus implementaciones (in-memory hoy, PostgreSQL después); así son intercambiables cambiando solo `composition/`.
* **Carpetas bajo demanda:** solo se crean las carpetas que el proyecto usa. Si en el futuro hacen falta, se añaden siguiendo la misma convención: `domain/errors/` (reglas de negocio violadas), `domain/events/` (eventos de dominio), `infrastructure/messaging/`.

---

## 3. Directivas de Seguridad OWASP (Triléctica de Seguridad)

Cualquier código generado o modificado debe cumplir estrictamente las directrices OWASP aplicables:

### 🛡️ A. OWASP Web Security Top 10
1. **A01: Broken Access Control:** Validación obligatoria de sesión y permisos en cada Server Action y Route Handler. Un usuario solo puede acceder a sus propios eventos y notas.
2. **A03: Injection (SQLi / XSS):** Uso exclusivo de ORM/Query Builders parametrizados para PostgreSQL. Renderizado seguro mediante React para evitar XSS.
3. **A05: Security Misconfiguration:** Configuración estricta de variables de entorno mediante esquemas de Zod al arrancar la aplicación.

### 🛡️ B. OWASP API Security Top 10
1. **API1: Broken Object Level Authorization (BOLA):** Verificar la propiedad del recurso (`userId`) en cada petición en los endpoints `/api/*`.
2. **API3: Broken Object Property Level Authorization:** Prevenir *Mass Assignment* validando el cuerpo (*body*) de la petición únicamente mediante esquemas de **Zod**.
3. **API4: Unrestricted Resource Consumption:** Aplicar Rate Limiting en la API para controlar las llamadas a la base de datos y evitar gastos imprevistos de tokens de IA.

### 🛡️ C. OWASP Top 10 for LLM / GenAI Applications
1. **LLM01: Prompt Injection:**
   - Separar tajantemente las instrucciones del sistema (*System Prompts*) del contenido introducido por el usuario.
   - Delimitar el contexto del usuario mediante etiquetas estructuradas XML/Markdown (ej. `<user_context>...</user_context>`).
2. **LLM02: Insecure Output Handling:**
   - **Jamás** ejecutar o renderizar directamente código o HTML no sanitizado generado por un LLM.
   - Forzar respuestas estructuradas (*Structured Outputs / JSON Schema*) y validarlas con **Zod** antes de persistirlas o enviarlas a la interfaz.
3. **LLM06: Sensitive Information Disclosure:**
   - Filtrar y sanitizar las notas antes de enviarlas al modelo o a la base de datos de vectores para evitar la exfiltración de claves o datos sensibles.
4. **LLM10: Model Denial of Service:**
   - Establecer límites de tokens por petición (`maxTokens`) y *timeouts* en todas las llamadas a la API de Anthropic Claude.

---

## 4. Metodología de Desarrollo: TDD (Test-Driven Development)

Toda la lógica de negocio en `domain/` y `application/` se desarrollará bajo TDD estricto:

1. **🔴 Red (Fase de Fallo):** Escribir primero las pruebas unitarias en `Vitest` definiendo el comportamiento esperado del caso de uso. Confirmar que la prueba falla antes de implementar código.
2. **🟢 Green (Fase de Paso):** Escribir el código mínimo necesario en el caso de uso o entidad para que el test pase con éxito.
3. **🔵 Refactor (Fase de Refactorización):** Limpiar, optimizar y aplicar principios SOLID manteniendo las pruebas en verde.

### Estrategia de Testing:
- **Ubicación:** los tests viven en `tests/`, fuera de `src/`, replicando su estructura (`src/domain/entities/HistoricalEvent.ts` → `tests/domain/entities/HistoricalEvent.test.ts`). Importan el código con el alias `@/`.
- **Unidades (`tests/domain/` y `tests/application/`):** Cobertura del 100% en dominio y casos de uso mediante repositorios in-memory, Mocks y Stubs con Vitest.
- **Integración (`tests/infrastructure/` y endpoints de `app/api/`):** Pruebas de verificación de endpoints y consultas a la base de datos vectorizada.
- **End-to-end (`e2e/`, Playwright):** recorren la web real en un navegador sobre una compilación de producción en el puerto 3100 (nunca contra el servidor de desarrollo). Cubren los flujos clave: navegación hasta un tema, quiz corregido en el servidor y comentarios. Se ejecutan con `npm run test:e2e` antes de cambios que afecten a toda la aplicación, como sustituir los repositorios en memoria por PostgreSQL.
- **Lint:** la regla `require-await` está activa; los adaptadores síncronos que implementan ports asíncronos devuelven `Promise.resolve(...)` en lugar de declarar `async` sin `await`.

---

## 5. Stack Tecnológico
- **Framework:** Next.js (App Router) + React
- **Lenguaje:** TypeScript (Tipado estricto, `strict: true`, prohibido el uso de `any`)
- **Estilos:** Tailwind CSS
- **Base de Datos:** PostgreSQL + extensión `pgvector`
- **Modelos de IA:** Anthropic Claude API mediante Vercel AI SDK
- **Test Framework:** Vitest

---

## 6. Estándares de Código y Calidad
- **Manejo de Errores:** Bloques `try/catch` centralizados en endpoints de la API devolviendo respuestas estructuradas (`{ success: false, error: string }`).
- **Nomenclatura:** Inglés técnico para el código fuente (`getHistoricalEvents`, `HistoryRepository`), interfaz e idioma del producto final en español.