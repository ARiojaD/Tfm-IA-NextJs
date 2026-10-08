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

El proyecto sigue una arquitectura limpia orientada al dominio (*Domain-Driven / Feature-Based*) para garantizar un diseño decoupled, mantenible y testeable:

```
src/
├── core/                   # CAPA DE DOMINIO Y APLICACIÓN (Agnóstica de Next.js)
│   ├── domain/             # Entidades de negocio, tipos e interfaces puras (Event, Source, Timeline)
│   └── use-cases/          # Casos de uso puros (ExecuteHistoryRAGUseCase, CreateHistoricalEventUseCase)
├── infrastructure/         # CAPA DE INFRAESTRUCTURA (Detalles de implementación)
│   ├── db/                 # Cliente PostgreSQL, esquemas (Drizzle/Prisma), migraciones
│   ├── ai/                 # Adaptadores de Anthropic Claude API, Vercel AI SDK, cliente de Embeddings
│   └── repositories/       # Implementación real de los repositorios definidos en dominio
├── app/                    # CAPA DE PRESENTACIÓN / CONTROLADORES (Next.js App Router)
│   ├── api/                # Route Handlers (HTTP Adapters / Backend Endpoints)
│   ├── (dashboard)/        # Vistas e interfaz de la aplicación protegida
│   └── layout.tsx
├── components/             # Componentes de UI reutilizables (React + Tailwind CSS)
└── lib/                    # Utilidades globales, validadores Zod y constantes
```

* **Regla de Dependencias:** La capa de dominio (`core/domain`) y los casos de uso (`core/use-cases`) **nunca** dependen de la infraestructura ni de Next.js. La comunicación con elementos externos se realiza mediante interfaces e inyección de dependencias.

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

Toda la lógica de negocio en `core/domain` y `core/use-cases` se desarrollará bajo TDD estricto:

1. **🔴 Red (Fase de Fallo):** Escribir primero las pruebas unitarias en `Vitest` definiendo el comportamiento esperado del caso de uso. Confirmar que la prueba falla antes de implementar código.
2. **🟢 Green (Fase de Paso):** Escribir el código mínimo necesario en el caso de uso o entidad para que el test pase con éxito.
3. **🔵 Refactor (Fase de Refactorización):** Limpiar, optimizar y aplicar principios SOLID manteniendo las pruebas en verde.

### Estrategia de Testing:
- **Unidades (`core/`):** Cobertura del 100% en casos de uso y dominio mediante Mocks/Stubs con Vitest.
- **Integración (`infrastructure/` y `api/`):** Pruebas de verificación de endpoints y consultas a la base de datos vectorizada.

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