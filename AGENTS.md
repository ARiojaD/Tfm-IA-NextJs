# AGENTS.md — Reglas, Arquitectura y Contexto de MemnonHistory AI

## 1. Visión y Rúbrica del TFM
- **Nombre:** MemnonHistory AI (enciclopedia histórica ordenada, con contribuciones verificadas y RAG)
- **Descripción:** Plataforma fullstack que ordena el conocimiento histórico (Grecia, Roma, Hispania…) en civilización → categoría → tema, con cronologías, quiz y recomendaciones. Los usuarios proponen contenido (con su fuente) que un administrador verifica en su panel; el panel permite gestionar los temas sin tocar el código. Un sistema RAG responderá preguntas sobre el contenido de la web, citando y enlazando dónde se habla de cada dato.
- **Inspiración del Nombre:** Memnón de Etiopía, héroe de la Guerra de Troya (hijo de Eos, la Aurora), símbolo del amanecer del conocimiento histórico y la epopeya clásica.
- **Distribución de Rúbrica TFM:** 
  - **70% Web Fullstack:** Base de datos PostgreSQL/Pgvector, gestión CRUD de eventos y fuentes, líneas del tiempo interactivas, autenticación y panel de usuario.
  - **30% Inteligencia Artificial:** Pipeline RAG sobre el contenido de los temas, generación de embeddings y estructuración automática de fichas, cronologías y quiz mediante LLMs (*Structured Outputs*), siempre revisada por una persona.

---

## 2. Arquitectura del Sistema: Clean Architecture Pragmática

El proyecto sigue una arquitectura limpia orientada al dominio para garantizar un diseño desacoplado, mantenible y testeable. Cada capa tiene su propia carpeta en `src/`:

```
src/
├── domain/                 # 🔴 DOMINIO: reglas del negocio. No depende de nada
│   ├── entities/           # Entidades (HistoricalTopic, HistoricalEvent, Quiz, Comment, Recommendation)
│   └── value-objects/      # Valores con reglas propias (HistoricalDate, HistoricalPeriod, HistoricalEra, TopicCategory, KeyFact, TopicImage, Slug, EntityId)
├── application/            # 🟠 APLICACIÓN: organiza el trabajo. Depende solo de domain y shared
│   ├── use-cases/          # Casos de uso (GetTopicDetailUseCase, AddCommentUseCase, AskEncyclopediaUseCase)
│   ├── ports/              # Interfaces que necesitan los casos de uso (repositorios, reloj, ids, LLM, embeddings)
│   ├── dto/                # Entradas validadas (AddCommentInput) y salidas públicas (PublicQuiz) de los casos de uso
│   └── errors/             # Errores esperados de los casos de uso (TopicNotFoundError, InvalidCommentError…)
├── infrastructure/         # 🔵 INFRAESTRUCTURA: el mundo real. Implementa los ports
│   ├── persistence/
│   │   ├── in-memory/      # Repositorios en memoria (tests unitarios)
│   │   │   └── seed/       # Datos iniciales por tema, validados con los esquemas del dominio
│   │   └── postgres/       # Cliente PostgreSQL + pgvector, esquemas ORM, migraciones y repositorios
│   ├── system/             # Reloj del sistema y generador de UUID (implementan Clock e IdGenerator)
│   ├── rate-limiting/      # Limitadores de frecuencia (implementan RateLimiter)
│   └── ai/                 # Adaptadores del modelo de lenguaje (protocolo OpenAI, Vercel AI SDK) y de embeddings (Transformers.js)
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
* **Entradas no confiables:** los casos de uso que reciben datos del usuario aceptan `unknown` y lo validan con su DTO de `application/dto/` (esquema estricto) antes de hacer nada. Los datos que decide el servidor (ids, fechas, propietario) nunca vienen en la entrada: los aportan los ports `IdGenerator`, `Clock` y `AuthService` (el usuario de la sesión).
* **Salidas sin datos privados:** los casos de uso nunca devuelven a la presentación datos que el usuario no debe ver. Se mapean a un DTO de salida con una lista explícita de campos permitidos (*allowlist*), como `PublicQuiz` (el quiz sin respuestas correctas ni explicaciones). Las respuestas se comprueban en el servidor (`AnswerQuizQuestionUseCase`).
* **Server Actions finas:** son endpoints POST públicos. No contienen lógica: identifican al visitante para el rate limiting cuando hace falta (`lib/currentRequesterId.ts`; el usuario con sesión lo obtiene el propio caso de uso), pasan la entrada sin confiar en ella (`unknown`) al caso de uso y traducen su `Result` a lo que muestra la interfaz, sin filtrar detalles internos en los mensajes de error.
* **Rate limiting (OWASP API4):** todo caso de uso invocado desde una Server Action que escriba datos o consuma recursos recibe un `requesterId` y un port `RateLimiter`, y comprueba el límite **antes** de validar (los intentos inválidos también cuentan). Las políticas (`COMMENT_RATE_LIMIT`, `QUIZ_ANSWER_RATE_LIMIT`, `SIGN_IN_RATE_LIMIT`, `SIGN_UP_RATE_LIMIT`, `LIBRARY_RATE_LIMIT`, `ADMIN_RATE_LIMIT`, `PROPOSAL_RATE_LIMIT`) viven en `composition/container.ts`. Las acciones con sesión limitan por usuario (`user:<id>`); las anónimas, por visitante (IP); el inicio de sesión, por visitante **y** por cuenta (`email:<email>`). La implementación en memoria solo vale para un proceso; en un despliegue con varias instancias debe sustituirse por un almacén compartido (Redis, PostgreSQL). Las cabeceras de IP solo son fiables detrás de un proxy de confianza.
* **Autenticación (Better Auth):** detrás del port `AuthService` (`register`, `signIn`, `signOut`, `getCurrentUser`), que solo expone `AuthenticatedUser = { id, name }` (nunca el email). `BetterAuthService` lo implementa sobre Better Auth y PostgreSQL, y lee y escribe las cookies a través de `SessionCookies` (`NextSessionCookies` en la app, un tarro en memoria en los tests); `InMemoryAuthService` es el doble de los tests unitarios. Reglas: el usuario de una acción sale **siempre** de `AuthService.getCurrentUser()` dentro del caso de uso (nunca del formulario; los DTO estrictos rechazan `author` o `userId`); contraseña 12–128 caracteres sin reglas de composición (OWASP ASVS / NIST), y el registro rechaza las filtradas a través del port `BreachedPasswordChecker` (`HaveIBeenPwnedChecker` con k-anonimato en la app; si el servicio falla, el registro continúa: *fail open*); errores genéricos que no revelan qué emails existen (`InvalidCredentialsError`, `RegistrationRejectedError`); tras iniciar sesión solo se redirige a rutas internas (`lib/safeRedirectPath.ts`). No se monta la ruta HTTP de Better Auth (`/api/auth/...`): todo pasa por Server Actions (su rate limiting no se aplica a las llamadas desde el servidor, por eso usamos el nuestro).
* **Container:** `getContainer()` (la aplicación) usa los repositorios PostgreSQL; `createContainer()` (tests unitarios) usa los de memoria con el seed. `getContainer()` comparte en `globalThis` una única conexión a la base de datos y el estado (repositorios y contadores del rate limiting), y crea los casos de uso en cada llamada, para que la recarga en caliente de Next.js aplique el código editado sin abrir conexiones nuevas. Si una recarga redefine una clase de infraestructura (se detecta con `instanceof`), el estado se reconstruye reutilizando la conexión. `DATABASE_URL` se valida con `parseDatabaseEnv()` y `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` con `parseAuthEnv()` en el primer uso; la instancia de Better Auth también se comparte en `globalThis`, y `BetterAuthService` se crea en cada petición (lee las cookies de esa petición). Las páginas que leen de la base de datos se renderizan en cada petición (la portada lleva `dynamic = "force-dynamic"`), así que `npm run build` no necesita la base de datos.
* **Administradores:** rol `USER`/`ADMIN` (`domain/value-objects/UserRole.ts`) en la columna `users.role`, detrás del port `UserRoleRepository` (separado de `AuthService`, que solo sabe quién ha iniciado sesión). Solo se cambia con `npm run admin:grant -- email` / `admin:revoke` (nunca desde la web) y se lee de la base de datos en cada petición, así que nombrar o quitar un admin surte efecto al momento. Todo caso de uso del panel empieza con `authorizeAdmin()` (sesión → `AuthenticationRequiredError`; sin rol → `AdminRequiredError`): ocultar el enlace "Panel" es solo comodidad. Las páginas de `/admin` traducen el rechazo con `denyAdminPage()`: sin sesión, a iniciar sesión; con una cuenta normal, 404 (también en el título de la pestaña), para no delatar que el panel existe. El seed solo inserta lo que falta: no pisa lo editado desde el panel.
* **Editor de temas (borrador → publicado):**
  - **Estado:** cada tema tiene `status` (`DRAFT`/`PUBLISHED`, `domain/value-objects/TopicStatus.ts`). Un borrador puede estar incompleto. Para publicarse necesita introducción y al menos un dato clave; esa regla vive en `HistoricalTopicSchema` y se repite como `CHECK` en PostgreSQL.
  - **Lado público:** `TopicRepository` solo devuelve temas **publicados** (filtra en SQL). Así un borrador es invisible en todas partes (civilización, tema, relacionados, bibliotecas, comentarios, quiz) sin que cada página lo recuerde.
  - **Lado admin:** usa `TopicEditorRepository` (ve borradores y escribe). La misma clase implementa los dos ports, y el contrato del editor comprueba que lo guardado es lo que ve el público.
  - **Casos de uso:** `CreateTopic`, `UpdateTopicBasics`, `UpdateTopicIntroduction`, `UpdateTopicKeyFacts`, `ChangeTopicStatus` y `DeleteTopic` empiezan con `authorizeAdminWrite()` (rol ADMIN y `ADMIN_RATE_LIMIT` por admin).
  - **Entrada:** los DTO de `application/dto/TopicEditorInputs.ts` son estrictos y convierten los textos del formulario (años con a.C./d.C., meses, párrafos separados por línea en blanco, filas de datos clave) a datos del dominio.
  - **Guardado:** todo cambio pasa por `editTopic()`, que valida el tema entero con el esquema del dominio antes de guardar.
  - **Slug:** se genera una vez con `slugify()` (único; si existe, `-2`, `-3`…) y no cambia al editar, para no romper enlaces ni bibliotecas.
  - **Listas del tema (cronología, quiz, recomendaciones, relacionados):**
    - **Guardado completo:** cada sección guarda la lista entera (`UpdateTopicEvents`, `UpdateTopicQuiz`, `UpdateTopicRecommendations`, `UpdateRelatedTopics`) y el port la sustituye con `replaceForTopic` / `setRelatedTopics`, en una transacción en PostgreSQL.
    - **Envío:** el formulario manda cada lista como JSON en un campo oculto. La Server Action solo la parsea (`jsonField`, con tamaño máximo) y el DTO estricto la valida como cualquier entrada.
    - **Ids:** un id se conserva solo si ya era de ese tema (`keepOwnId`); cualquier otro recibe uno nuevo, para que nadie sobrescriba filas de otro tema.
    - **Lo que pone el servidor:** el tema y la civilización de cada evento.
    - **Quiz:** sin preguntas, se borra.
    - **Relacionados:** van en los dos sentidos.
    - **Respuestas correctas:** el editor sí las recibe (`GetTopicForEditingUseCase`, solo admin); la web pública nunca.
  - **Imagen del tema (catálogo controlado):**
    - **Decisión:** no se suben archivos desde la web, para eliminar esa superficie de ataque y garantizar que toda imagen tiene licencia revisada.
    - **Catálogo:** las imágenes están en `infrastructure/images/imageCatalog.ts`, validadas con `CatalogImageSchema`. Son `GENERAL` (cualquier tema de su civilización) o `SPECIFIC`, y los archivos están en `public/images/catalog` o `public/images/topics`. Un test comprueba que cada archivo existe, que su ancho y alto reales coinciden con lo declarado y que cada civilización tiene al menos una imagen general.
    - **Port `ImageCatalog`:** `UpdateTopicImageUseCase` solo acepta ids del catálogo. El archivo, el tamaño y el crédito salen siempre del catálogo (`toTopicImage`); el admin solo escribe el texto alternativo y el pie. Un id vacío deja el tema sin imagen, y la página no muestra nada en su lugar.
    - **Avisos:** publicar sin imagen está permitido; el panel lo avisa y marca los temas "Sin imagen" (solo administradores).
    - **Añadir una imagen al catálogo:** elegirla en Wikimedia Commons con licencia libre, guardarla como .jpg y registrarla con su ancho, alto y crédito (autor y licencia).
  - **Listas editables en el navegador:** las filas iniciales usan su posición como clave (`row-0`…), igual en el servidor y en el navegador, para no romper la hidratación. Solo las filas añadidas después reciben una clave aleatoria.
  - **Borrado:** solo se borran los borradores (`TopicIsPublishedError`).
* **Propuestas de los usuarios:**
  - **Qué se propone:** `Proposal` (`domain/entities/Proposal.ts`) es de cuatro tipos: `EVENT`, `RECOMMENDATION` y `CORRECTION` sobre un tema publicado, y `NEW_TOPIC`. Es solo texto (nunca archivos), siempre con fuente, y con estado `PENDING` → `APPROVED` | `REJECTED`; rechazar exige motivo.
  - **Envío:** `SubmitProposalUseCase` toma el autor de la sesión, aplica `PROPOSAL_RATE_LIMIT` por usuario y valida con el DTO estricto de su tipo (`ProposalInputs.ts`). Solo admite temas publicados.
  - **Consulta:** `ListMyProposalsUseCase` lista solo las del usuario de la sesión (BOLA); `ListPendingProposalsUseCase` es la bandeja del admin.
  - **Revisión:** `ReviewProposalUseCase` (admin) aplica la propuesta al aprobarla: el evento o la recomendación se añaden al tema con su civilización e id del servidor, un tema nuevo se crea como borrador (su descripción es el inicio de la introducción) y la corrección solo se marca. Una propuesta solo se revisa una vez (`ProposalAlreadyReviewedError`).
  - **Almacenamiento:** en PostgreSQL, lo propio de cada tipo va en `proposals.payload` (JSONB) y se parsea con `ProposalSchema` al leerlo.
  - **Presentación:** la fuente se muestra como texto, nunca como enlace.
* **Formularios con campos controlados:** se envían con `useFormAction` (`onSubmit` + `useActionState`) en lugar de `<form action>`. Con `action`, React 19 resetea el formulario tras una acción correcta y los `select`, radios y casillas mostrarían su primer valor mientras el estado guarda otro.
  - **Vista previa:** `/admin/temas/[id]/vista-previa` usa el mismo componente `TopicView` que la página pública y `loadTopicDetail()`, el mismo que `GetTopicDetailUseCase`.
  - **Metadatos:** las páginas de `/admin` calculan su título con `adminPageMetadata()`, para que el 404 de un no-admin no delate el panel.
* **Mi biblioteca:** port `LibraryRepository` (cada método recibe el `userId`, que sale siempre de la sesión dentro del caso de uso). Seguir una civilización guarda solo la era (`era_follows`): sus temas se leen al pedir la página, así que los nuevos aparecen solos. Guardar un tema (`saved_topics`) guarda la fecha del `Clock`, para ordenarlos del más reciente al más antiguo. Los botones envían el estado deseado (`intent`: `follow`/`unfollow`, `save`/`remove`), nunca "alternar", así que un doble clic deja el mismo resultado. `GetLibraryStatusUseCase` devuelve `null` sin sesión y las páginas muestran entonces los mismos botones como enlaces a iniciar sesión (`?volver=`).
* **Navegación:** civilización (`/roma`) → categoría como sección de esa página (`/roma#personajes`; `/roma/personajes` redirige ahí) → tema (`/roma/personajes/julio-cesar`). Las URLs se construyen siempre con `lib/routes.ts`.
* **Modelo de un tema:** todo tema tiene un `period` (inicio y fin opcional) que lo ordena cronológicamente, una `introduction` en párrafos (el texto principal que indexará el RAG), `keyFacts` genéricos de etiqueta y valor (sirven igual para un personaje que para una batalla), una `image` opcional (solo archivos locales de `public/images`, con pie y crédito breves y su ancho y alto reales; va debajo de la introducción y los datos clave, a todo el ancho si es apaisada y centrada si es vertical; un test comprueba que el archivo existe) y `relatedTopicIds`, guardados en ambos temas (en PostgreSQL será una tabla de relación).
* **RAG e IA (coste cero en local):**
  - **Fragmentos:** `KnowledgeChunk` son los párrafos de la introducción, los datos clave y los eventos de los temas **publicados**. Nunca comentarios ni recomendaciones (texto sin verificar). Lo que se convierte en vector lleva delante el título y el resumen del tema.
  - **Ports:** `EmbeddingService` (Transformers.js con `multilingual-e5-small`), `KnowledgeIndex` (pgvector, 384 dimensiones, HNSW con coseno), `AnswerGenerator`, `ContentDrafter` y `ProposalDrafter`. Ollama en local y una API gratuita al desplegar son el mismo adaptador: cambian `LLM_BASE_URL`, `LLM_MODEL` y `LLM_API_KEY`.
  - **Índice:** `refreshingTopicIndex` envuelve en `composition/` las ediciones que cambian lo indexado. Si reindexar falla, la edición ya está guardada: se registra y `npm run rag:index` lo repara. Cambiar de modelo de embeddings exige migrar la columna y reindexar.
  - **Preguntar:** umbral de similitud (`MIN_RELEVANT_SIMILARITY`, propio del modelo) como primer filtro, y el modelo decide con `coverage`. Solo se usan fragmentos de temas que devuelve el `TopicRepository` público.
  - **Citas:** `parseCitations` elimina las que apuntan a fuentes inexistentes, y una respuesta sin citas válidas no se muestra. La interfaz recibe piezas de texto y construye los enlaces con datos propios.
  - **La IA nunca escribe directamente:** cronología, quiz y propuestas solo devuelven campos para un formulario, que una persona revisa y guarda por el camino de siempre. La fuente de una propuesta nunca la pone la IA.
  - **Controles sin modelo:** un año que no aparece en el texto de origen se descarta (cronología) o se deja vacío (propuestas). Las opciones del quiz se rotan.
  - **Pruebas:** dobles sin modelo en el container en memoria (`HashingEmbeddingService`, `EchoAnswerGenerator`, `EmptyContentDrafter`) y `e2e/fakeLlmServer.ts` en los E2E, con la búsqueda real. Cada cambio de prompt se mide con el modelo real.
* **Puertos asíncronos y contratos:** todos los ports de persistencia devuelven `Promise`, aunque la implementación sea en memoria. Cada port tiene un test de contrato en `tests/application/ports/` que deben pasar todas sus implementaciones (in-memory hoy, PostgreSQL después); así son intercambiables cambiando solo `composition/`.
* **Persistencia en PostgreSQL:** Drizzle ORM con el driver `postgres` (consultas siempre parametrizadas). El esquema (`infrastructure/persistence/postgres/schema.ts`) reutiliza las constantes del dominio en sus `ENUM` y repite las reglas clave como `CHECK` (defensa en profundidad). Los cambios de esquema se hacen con `npm run db:generate` (migración SQL versionada, revisada antes de aplicarla) y `npm run db:migrate`; nunca editando una migración ya aplicada. Los mappers parsean cada fila con el esquema del dominio antes de devolverla. El seed (`npm run db:seed`) reutiliza `SEED` y es idempotente.
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
   - Delimitar el contexto del usuario mediante etiquetas estructuradas XML/Markdown (ej. `<user_context>...</user_context>`), quitando lo que podría cerrarlas (`plainPromptText`).
   - **Riesgo residual aceptado:** un modelo pequeño no resiste todas las inyecciones (medido en el relleno de propuestas: 1 de 8 intentos pasa). Por eso el daño posible se limita por diseño: el modelo no tiene herramientas ni datos privados, su salida tiene esquema y todo lo que escribe pasa por revisión humana.
2. **LLM02: Insecure Output Handling:**
   - **Jamás** ejecutar o renderizar directamente código o HTML no sanitizado generado por un LLM.
   - Forzar respuestas estructuradas (*Structured Outputs / JSON Schema*) y validarlas con **Zod** antes de persistirlas o enviarlas a la interfaz.
3. **LLM06: Sensitive Information Disclosure:**
   - Al modelo y al índice solo llega contenido público y revisado, o el texto que el propio usuario pega para su propuesta. Las preguntas no se guardan.
   - Un fallo del modelo se registra solo por su tipo: el mensaje de un error de validación puede llevar el texto del usuario o la respuesta del modelo.
4. **LLM10: Model Denial of Service:**
   - Establecer límites de tokens por petición (`maxOutputTokens`), *timeouts* y límite de longitud de la entrada en todas las llamadas al modelo, con un *rate limit* propio por usuario para cada uso (preguntas, borradores del panel, relleno de propuestas).

---

## 4. Metodología de Desarrollo: TDD (Test-Driven Development)

Toda la lógica de negocio en `domain/` y `application/` se desarrollará bajo TDD estricto:

1. **🔴 Red (Fase de Fallo):** Escribir primero las pruebas unitarias en `Vitest` definiendo el comportamiento esperado del caso de uso. Confirmar que la prueba falla antes de implementar código.
2. **🟢 Green (Fase de Paso):** Escribir el código mínimo necesario en el caso de uso o entidad para que el test pase con éxito.
3. **🔵 Refactor (Fase de Refactorización):** Limpiar, optimizar y aplicar principios SOLID manteniendo las pruebas en verde.

### Estrategia de Testing:
- **Ubicación:** los tests viven en `tests/`, fuera de `src/`, replicando su estructura (`src/domain/entities/HistoricalEvent.ts` → `tests/domain/entities/HistoricalEvent.test.ts`). Importan el código con el alias `@/`.
- **Unidades (`tests/domain/` y `tests/application/`):** Cobertura del 100% en dominio y casos de uso mediante repositorios in-memory, Mocks y Stubs con Vitest.
- **Integración (`tests/**/*.integration.test.ts` y endpoints de `app/api/`):** Pruebas contra PostgreSQL real con `npm run test:integration` (requiere `npm run db:up`). Usan una base de datos aparte cuyo nombre termina obligatoriamente en `_test`, que se crea y migra sola antes de empezar y se vacía antes de cada caso. Los repositorios PostgreSQL ejecutan los mismos tests de contrato que los de memoria. `npm run test` (unitarios) nunca necesita Docker.
- **End-to-end (`e2e/`, Playwright):** recorren la web real en un navegador sobre una compilación de producción en el puerto 3100 (nunca contra el servidor de desarrollo) conectada a la base de datos de test, que `e2e/globalSetup.ts` deja con el seed exacto antes de cada ejecución (lo que publican los tests nunca llega a la base de datos de desarrollo). Requieren `npm run db:up`. `globalSetup` crea además tres cuentas de prueba (`e2e/testUsers.ts`, una de ellas administradora) y el proyecto `setup` (`e2e/auth.setup.ts`) inicia sesión una vez con la autora y con la administradora y guarda sus cookies (`e2e/.auth/`, ignorado por Git) para los tests que necesitan sesión. Cubren los flujos clave: navegación hasta un tema, quiz corregido en el servidor, registro, inicio y cierre de sesión, redirección abierta, comentarios con y sin sesión, Mi biblioteca, panel de administración (acceso y vida completa de un tema) y propuestas (proponer, aprobar o rechazar, con dos cuentas a la vez). Se ejecutan con `npm run test:e2e` antes de cambios que afecten a toda la aplicación.
- **Lint:** la regla `require-await` está activa; los adaptadores síncronos que implementan ports asíncronos devuelven `Promise.resolve(...)` en lugar de declarar `async` sin `await`.

---

## 5. Stack Tecnológico
- **Framework:** Next.js (App Router) + React
- **Lenguaje:** TypeScript (Tipado estricto, `strict: true`, prohibido el uso de `any`)
- **Estilos:** Tailwind CSS
- **Base de Datos:** PostgreSQL + extensión `pgvector`
- **Modelos de IA:** Ollama (`qwen2.5:7b`) en local mediante Vercel AI SDK y protocolo OpenAI; embeddings con Transformers.js (`multilingual-e5-small`)
- **Test Framework:** Vitest

---

## 6. Estándares de Código y Calidad
- **Manejo de Errores:** Bloques `try/catch` centralizados en endpoints de la API devolviendo respuestas estructuradas (`{ success: false, error: string }`).
- **Nomenclatura:** Inglés técnico para el código fuente (`getHistoricalEvents`, `HistoryRepository`), interfaz e idioma del producto final en español.
- **Comentarios (en castellano):** el código dice *qué* hace; los comentarios cuentan *por qué* está hecho así.
  - **Cabecera:** cada entidad, port, caso de uso, adaptador y módulo de composición empieza con un comentario breve (una a tres líneas) sobre qué representa o hace y por qué existe. Se omite solo cuando el archivo es trivial y su nombre lo dice todo (un error con un mensaje, un reexport).
  - **Decisiones:** se comenta lo que no se deduce del código: una regla de negocio, un límite y de dónde sale, una alternativa descartada, un riesgo de seguridad (citando la regla OWASP: `OWASP API4`, `LLM01`…) o una peculiaridad de una librería.
  - **Sin ruido:** nada de comentarios que repiten el código (`// incrementa el contador`), código comentado ni `TODO` sin explicación. Lo pendiente va a la documentación o se resuelve.
  - **Estilo:** `//` en frases completas, con mayúscula inicial y punto final; `/** */` solo cuando un tipo o función exportada necesita documentación que aparezca en el editor. Los nombres del código se citan entre comillas invertidas (`` `topicId` ``) y se dejan en inglés.
  - **Tests:** solo se comenta un test cuando su preparación no es evidente; el nombre del test ya explica lo que comprueba.