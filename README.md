# MemnonHistory AI

**Enciclopedia histórica ordenada, con contribuciones verificadas y una IA que responde citando sus fuentes.**

Plataforma web *fullstack* que ordena el conocimiento histórico de la Antigüedad (Grecia, Roma, Hispania) por civilizaciones, categorías y temas, con cronologías, quiz y recomendaciones. Los usuarios proponen mejoras que un administrador verifica antes de publicarlas, y un sistema RAG (*Retrieval-Augmented Generation*) responde preguntas sobre el contenido citando y enlazando el párrafo exacto de donde sale cada dato.

| | |
| --- | --- |
| 🌐 **Aplicación desplegada** | **[memnonhistory.vercel.app](https://memnonhistory.vercel.app)** |
| 🔑 **Usuario de prueba** | Ver [sección 12](#12-usuario-y-contraseña-de-prueba) |
| 🖼️ **Slides** | [docs/slides/MemnonHistory-AI.pdf](docs/slides/MemnonHistory-AI.pdf) (13 diapositivas) |
| 🎬 **Vídeo** | [youtube.com/watch?v=v6odn_MrryI](https://www.youtube.com/watch?v=v6odn_MrryI) (22 min, con capítulos: slides, demo de la web, código y cierre) |
| 📂 **Repositorio** | [github.com/ARiojaD/Tfm-IA-NextJs](https://github.com/ARiojaD/Tfm-IA-NextJs) |

> Trabajo Fin de Máster · Máster en Desarrollo con IA · BigSchool
> Autor: Alejandro ([@ARiojaD](https://github.com/ARiojaD))

---

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Funcionalidades principales](#2-funcionalidades-principales)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Arquitectura](#4-arquitectura)
5. [Estructura del proyecto](#5-estructura-del-proyecto)
6. [Instalación y ejecución en local](#6-instalación-y-ejecución-en-local)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Despliegue](#8-despliegue)
9. [Tests y metodología TDD](#9-tests-y-metodología-tdd)
10. [Seguridad](#10-seguridad)
11. [Limitaciones conocidas](#11-limitaciones-conocidas)
12. [Usuario y contraseña de prueba](#12-usuario-y-contraseña-de-prueba)

---

## 1. Descripción del proyecto

Quien estudia historia acumula lecturas, fechas y personajes repartidos entre muchos libros, y le cuesta ordenarlo y recordarlo. **MemnonHistory AI** lo reúne en una enciclopedia ordenada:

- **Ordena** el conocimiento por civilización → categoría → tema, y cada tema con su introducción, datos clave, cronología, quiz, recomendaciones y temas relacionados. Cada civilización tiene además su **cronología completa**, con sus etapas e hitos.
- **Personaliza** el estudio con *Mi biblioteca*: seguir civilizaciones y guardar temas.
- **Crece con verificación:** los usuarios proponen eventos, recomendaciones, correcciones o temas nuevos (siempre con su fuente) y un administrador los revisa en su panel antes de publicarlos. El panel también permite crear y editar temas y cronologías sin tocar el código.
- **Responde preguntas** en lenguaje natural sobre el contenido de la web, citando y enlazando el párrafo, dato o evento exacto donde se habla de ello, gracias a un pipeline RAG sobre PostgreSQL + pgvector.
- **Ayuda a redactar con IA:** propone cronologías y quiz en el panel y rellena propuestas desde un fragmento, con *Structured Outputs* validados con Zod y siempre revisado por una persona.

**Origen del nombre.** Memnón de Etiopía, héroe de la Guerra de Troya e hijo de Eos (la Aurora), simboliza el amanecer del conocimiento histórico y la épica clásica. La identidad visual parte de esa idea: el estilo «Aurora y piedra», con paleta de amanecer, grano de piedra, grecas y las capitulares de las inscripciones romanas.

**Distribución del TFM:**

| Bloque | Peso | Contenido |
| --- | --- | --- |
| Web *fullstack* | 70 % | PostgreSQL/pgvector, temas y cronologías editables desde un panel, propuestas con revisión, autenticación, biblioteca personal y despliegue |
| Inteligencia Artificial | 30 % | Pipeline RAG con citas sobre el contenido de los temas, embeddings propios y borradores de cronología, quiz y propuestas con *Structured Outputs* |

---

## 2. Funcionalidades principales

### Conocimiento histórico

- **Civilizaciones** (Roma, Antigua Grecia, Hispania) y, dentro de cada una, **categorías**: personajes, guerras y batallas, y etapas. Los temas se ordenan cronológicamente.
- **Temas** (un personaje, una batalla, una etapa…) con periodo, introducción, datos clave, imagen opcional con su crédito, cronología, quiz, comentarios, recomendaciones y temas relacionados.
- **Fechas pensadas para la historia antigua:** año entero (negativo = a.C.), sin año 0 y con mes opcional, porque de muchos eventos solo se conoce el año.
- **Cronología completa de cada civilización** (`/roma/cronologia`…): sus hitos en orden, las etapas como bandas (y las subetapas dentro), enlaces a los temas y, si se pide, también los eventos de los temas. Los hitos sin tema se pueden proponer.
- **Portada** con una caja para preguntar a la enciclopedia, las cifras reales, las civilizaciones, la **Línea de la Antigüedad** (las tres civilizaciones en una misma escala de tiempo, con sus etapas e hitos enlazados) y un ejemplo de consulta con fuentes reales.

### Inteligencia Artificial

- **Preguntar a la enciclopedia** (`/preguntar`, con sesión):
  - La respuesta sale solo de los fragmentos encontrados (introducción, datos clave y cronología de los temas publicados) y cita cada dato con [1], [2].
  - Cada cita lleva al párrafo, dato o evento exacto y lo resalta.
  - Si solo hay parte de la información, indica qué no aparece. Si no hay nada, lo dice y ofrece **proponer un tema nuevo**.
  - Si el modelo no está disponible (o se ha alcanzado el tope diario), muestra los fragmentos encontrados.
- **Índice automático:** al publicar o editar un tema se reindexa solo ese tema; al pasarlo a borrador o borrarlo, sale del índice. `npm run rag:index` lo rehace entero.
- **Proponer con IA** (panel, cronología y quiz): lee el texto guardado del tema y añade filas al formulario **sin guardar nada**. Los años que no aparecen en el texto se descartan.
- **Rellenar con IA** (propuestas de evento y tema nuevo): completa el formulario desde un fragmento pegado. **La fuente nunca la pone la IA**, y no se envía nada hasta que el usuario lo revisa.
- **Sin coste:** los embeddings se calculan dentro de la propia aplicación (también en producción) y el modelo de lenguaje es Ollama en local o la API gratuita de Groq una vez desplegado. Cambiar de uno a otro es cambiar variables de entorno.

### Usuarios

- **Cuentas:** registro e inicio de sesión con email y contraseña. En público solo se muestra el nombre visible, nunca el email. Comentar requiere sesión.
- **Mi biblioteca** (`/mi-biblioteca`): **seguir civilizaciones** (aparecen todos sus temas, también los que se añadan después) y **guardar temas** sueltos. Sin sesión, los botones se ven igual y llevan a iniciar sesión. Cada usuario solo ve y cambia su propia biblioteca.
- **Propuestas** (`/mi-biblioteca/propuestas`, y «Proponer una mejora» en cada tema): eventos, recomendaciones, correcciones o temas nuevos, solo texto y siempre con fuente. Cada usuario ve el estado de las suyas (pendiente, aprobada o rechazada con su motivo).

### Panel de administración (`/admin`)

- **Temas desde la web:** un tema nuevo nace como **borrador**, invisible para el público. Su URL se genera a partir del título y ya no cambia.
- **Editor por secciones:** datos básicos, introducción, datos clave, imagen, cronología, quiz (2–4 opciones con la correcta marcada), recomendaciones y temas relacionados (enlazados en los dos sentidos). Cada sección se guarda por separado.
- **Vista previa** con la misma plantilla que la página pública. **Publicar** exige introducción y al menos un dato clave; si falta algo, se indica qué. Solo los borradores se pueden borrar.
- **Imagen de un catálogo controlado:** no se suben archivos desde la web; las imágenes se añaden al catálogo desde el código, con su licencia revisada.
- **Cronología de cada civilización** (`/admin/cronologia/roma`…): añadir, editar, quitar y enlazar hitos a temas.
- **Bandeja de propuestas:** aprobar aplica la propuesta (el evento o la recomendación se añaden al tema, un tema nuevo se crea como borrador) y rechazar exige un motivo.
- **Acceso:** sin sesión lleva a iniciar sesión; a una cuenta normal le responde 404. El rol solo se da con un script, nunca desde la web.

### Interfaz

- **Estilo «Aurora y piedra»**, la misma cabecera con foto velada en todas las páginas, **modo claro y oscuro** (sigue al sistema y recuerda la elección), **diseño adaptado a móvil** e interfaz en español.

---

## 3. Stack tecnológico

| Tecnología | Versión | Uso |
| --- | --- | --- |
| [Next.js](https://nextjs.org) (App Router, Turbopack) | 16.4.6 | Framework *fullstack*: páginas, Server Actions y proxy |
| [React](https://react.dev) | 19.2.8 | Interfaz de usuario |
| [TypeScript](https://www.typescriptlang.org) | 5.9.3 | Lenguaje, en modo `strict` y sin `any` |
| [Tailwind CSS](https://tailwindcss.com) | 4.3.3 | Estilos |
| [Zod](https://zod.dev) | 4.6.7 | Validación de dominio, de entradas, del entorno y de las salidas del modelo |
| PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) | 17 + 0.8.7 | Base de datos relacional y vectorial (Docker en local, Neon en producción) |
| [Drizzle ORM](https://orm.drizzle.team) + `drizzle-kit` | 0.45.4 + 0.31.11 | Consultas parametrizadas, esquema y migraciones |
| [Better Auth](https://www.better-auth.com) | 1.7.14 | Registro, inicio de sesión y sesiones, en nuestra PostgreSQL |
| [Vercel AI SDK](https://sdk.vercel.ai) (`@ai-sdk/openai-compatible`) | 7.0.145 | Llamadas al modelo por el protocolo de OpenAI, con *Structured Outputs* |
| [Ollama](https://ollama.com) con `qwen2.5:7b` | — | Modelo de lenguaje en local (desarrollo) |
| [Groq](https://groq.com) con `openai/gpt-oss-120b` | — | Modelo de lenguaje en producción (plan gratuito) |
| [Transformers.js](https://huggingface.co/docs/transformers.js) con `multilingual-e5-small` | 4.3.1 | Embeddings dentro de Node, para el RAG |
| [Vitest](https://vitest.dev) | 5.0.4 | Tests unitarios y de integración |
| [Playwright](https://playwright.dev) | 1.64.1 | Tests end-to-end en el navegador |
| [ESLint](https://eslint.org) (`eslint-config-next`) | 9.39.5 | Linter |
| [Vercel](https://vercel.com) + [Neon](https://neon.com) | Hobby + Free | Despliegue de la aplicación (Frankfurt) y de la base de datos (Frankfurt) |

---

## 4. Arquitectura

El proyecto sigue una **Clean Architecture pragmática**, orientada al dominio. Cada capa tiene su propia carpeta:

| Capa | Carpeta | Responsabilidad |
| --- | --- | --- |
| 🔴 Dominio | `domain/` | Reglas del negocio: entidades y *value objects*. TypeScript puro, sin dependencias de Next.js, base de datos ni IA |
| 🟠 Aplicación | `application/` | Casos de uso que orquestan el dominio, y *ports* (interfaces) con lo que necesitan del exterior |
| 🔵 Infraestructura | `infrastructure/` | Implementación de los *ports*: PostgreSQL + pgvector, modelo de lenguaje, embeddings, autenticación, límites |
| 🟢 Composición | `composition/` | Conecta cada caso de uso con sus implementaciones reales y valida la configuración |
| 🟤 Compartido | `shared/` | Utilidades transversales sin lógica de negocio (`Result`) |
| ⚪ Presentación | `app/`, `components/`, `lib/` | Páginas, Server Actions (la entrada HTTP) y componentes de Next.js |

```text
   app/ (páginas y Server Actions)
        │ llama a
        ▼
   application/use-cases ──usa──► application/ports  (interfaces)
        │                                ▲
        ▼                                │ implementa
      domain/                    infrastructure/  (PostgreSQL, IA, auth)

   composition/ une cada caso de uso con su implementación real
```

**Regla de dependencias:** las dependencias solo apuntan hacia dentro (`infrastructure` → `application` → `domain`). `domain` y `application` nunca importan de `infrastructure` ni de Next.js, lo que permite probar toda la lógica de negocio con repositorios en memoria. Cada port tiene un **test de contrato** que cumplen a la vez su implementación en memoria y la de PostgreSQL.

Las normas completas de arquitectura, seguridad y metodología están en [`AGENTS.md`](AGENTS.md). Para leer el código con orden (por dónde empezar, el recorrido de una petición, cómo funciona el RAG y las decisiones principales), consulta la [guía de arquitectura](docs/ARQUITECTURA.md).

---

## 5. Estructura del proyecto

```
.
├── src/
│   ├── domain/                   # 🔴 Reglas del negocio
│   │   ├── entities/             # Temas, eventos, hitos, quizzes, comentarios, recomendaciones, propuestas, fragmentos del RAG
│   │   └── value-objects/        # Fechas y periodos, civilizaciones, categorías, datos clave, imágenes, roles, slugs e ids
│   ├── application/              # 🟠 Organiza el trabajo
│   │   ├── use-cases/            # Casos de uso (y los decorators de reindexado y tope diario de IA)
│   │   ├── ports/                # Interfaces de repositorios y servicios externos
│   │   ├── dto/                  # Esquemas de entrada y salidas públicas de los casos de uso
│   │   └── errors/               # Errores esperados de los casos de uso
│   ├── infrastructure/           # 🔵 Mundo real
│   │   ├── persistence/
│   │   │   ├── in-memory/        # Repositorios en memoria y datos iniciales (seed/)
│   │   │   └── postgres/         # Cliente, esquema, migraciones, mappers, repositorios y límites en PostgreSQL
│   │   ├── ai/                   # Modelo de lenguaje (protocolo OpenAI), prompts y embeddings (Transformers.js)
│   │   ├── auth/                 # Better Auth, cookies de sesión y contraseñas filtradas (Have I Been Pwned)
│   │   ├── images/               # Catálogo de imágenes de los temas
│   │   ├── rate-limiting/        # Limitador en memoria (tests unitarios)
│   │   └── system/               # Reloj y generador de identificadores
│   ├── composition/              # 🟢 Container y validación del entorno con Zod
│   ├── shared/                   # 🟤 Utilidades transversales
│   ├── app/                      # ⚪ Presentación (Next.js App Router)
│   │   ├── (auth)/               # Registro e inicio de sesión
│   │   ├── [era]/                # Civilización (/roma) y su cronología (/roma/cronologia)
│   │   │   └── [category]/[topic]/  # Página de cada tema (/roma/personajes/julio-cesar) y sus Server Actions
│   │   ├── admin/                # Panel: temas, cronologías y propuestas
│   │   ├── mi-biblioteca/        # Biblioteca y propuestas del usuario
│   │   ├── preguntar/            # Preguntar a la enciclopedia
│   │   ├── layout.tsx            # Layout raíz: fuentes, tema (con su nonce) y metadatos
│   │   ├── page.tsx              # Portada
│   │   └── globals.css           # Paleta «Aurora y piedra» y temas claro y oscuro
│   ├── components/               # ⚪ Componentes por zona (topic, era, home, admin, ask, auth, library, proposals)
│   ├── lib/                      # ⚪ Utilidades de la interfaz (rutas, fechas, tema, escala, cabeceras de seguridad)
│   └── proxy.ts                  # Política de seguridad de contenido con un nonce por petición
├── tests/                        # Tests, replicando la estructura de src/ (contratos en application/ports)
├── e2e/                          # Tests end-to-end con Playwright y su servidor falso del modelo
├── scripts/                      # Seed, índice del RAG, roles de administrador y descarga del modelo
├── public/images/                # Imágenes del catálogo y de los temas, con licencia revisada
├── docs/
│   ├── ARQUITECTURA.md           # Guía para leer el código
│   └── slides/                   # Presentación del TFM en PDF
├── AGENTS.md                     # Reglas de arquitectura, seguridad OWASP y TDD
├── CLAUDE.md                     # Instrucciones para el asistente de IA
├── .env.example                  # Plantilla de variables de entorno (sin valores reales)
├── docker-compose.yml            # PostgreSQL + pgvector para desarrollo
├── next.config.ts                # Cabeceras de seguridad y archivos del modelo dentro de las funciones
├── vercel.json                   # Región de Vercel y descarga del modelo antes de compilar
├── drizzle.config.ts             # Configuración de drizzle-kit
├── vitest.config.mts             # Tests unitarios
├── vitest.integration.config.mts # Tests de integración (PostgreSQL)
├── playwright.config.ts          # Tests end-to-end
└── package.json
```

---

## 6. Instalación y ejecución en local

### Requisitos previos

- [Node.js](https://nodejs.org) 24 LTS y npm 11 o superior
- Git
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ejecuta PostgreSQL 17 con pgvector; no hace falta instalar PostgreSQL)
- [Ollama](https://ollama.com), para que la IA redacte en local. Es opcional: sin él, `/preguntar` muestra solo los fragmentos encontrados y las propuestas con IA no están disponibles

### Pasos

1. Clonar el repositorio e instalar las dependencias:

   ```bash
   git clone https://github.com/ARiojaD/Tfm-IA-NextJs.git
   cd Tfm-IA-NextJs
   npm install
   ```

2. Configurar las variables de entorno (ver [sección 7](#7-variables-de-entorno)):

   ```bash
   cp .env.example .env.local
   npm run auth:secret
   ```

   Pega el secreto generado en `BETTER_AUTH_SECRET` y cambia la contraseña de PostgreSQL.

3. Con Docker Desktop abierto, levantar la base de datos, crear las tablas y cargar los datos de ejemplo:

   ```bash
   npm run db:up
   npm run db:migrate
   npm run db:seed
   ```

4. Crear el índice del RAG (la primera vez descarga el modelo de embeddings, unos 130 MB):

   ```bash
   npm run rag:index
   ```

5. Con Ollama instalado, descargar el modelo de lenguaje (unos 4,7 GB):

   ```bash
   ollama pull qwen2.5:7b
   ```

6. Arrancar el servidor de desarrollo y abrir [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

7. Para entrar en el panel, registra una cuenta en la web y nómbrala administradora:

   ```bash
   npm run admin:grant -- tu@email.com
   ```

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` / `npm run start` | Compilación y servidor de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run test` | Tests unitarios (no necesitan Docker) |
| `npm run test:watch` | Tests en modo observación, para el ciclo TDD |
| `npm run test:integration` | Tests de integración contra PostgreSQL, en una base de datos aparte (`<nombre>_test`) que se crea y migra sola. Requiere `npm run db:up` |
| `npm run test:e2e` | Tests end-to-end: compila la app y la prueba en Chromium (puerto 3100) contra la base de datos de test. Requiere `npm run db:up`; la primera vez, `npx playwright install chromium` |
| `npm run db:up` / `db:down` | Levanta o para PostgreSQL en Docker (los datos se conservan en un volumen) |
| `npm run db:generate` | Genera una migración SQL a partir de los cambios del esquema |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Carga los temas y cronologías de ejemplo (no duplica datos ni pisa lo editado desde el panel) |
| `npm run rag:index` | Rehace el índice del RAG con todos los temas publicados |
| `npm run admin:grant -- email` | Nombra administradora a una cuenta ya registrada (`admin:revoke` lo quita). Es la única forma de dar el rol |
| `npm run auth:secret` | Genera un secreto aleatorio para `BETTER_AUTH_SECRET` |
| `npm run model:download` | Deja el modelo de embeddings en `.cache/transformers` (Vercel lo ejecuta antes de compilar) |
| `npm run neon:migrate` / `neon:seed` / `neon:index` / `neon:admin -- email` | Lo mismo que `db:migrate`, `db:seed`, `rag:index` y `admin:grant`, contra la base de datos de producción (lee la conexión de `.env.neon`) |

---

## 7. Variables de entorno

| Variable | Descripción |
| --- | --- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Solo en local: usuario, contraseña y nombre con los que Docker crea la base de datos |
| `DATABASE_URL` | Conexión a PostgreSQL. En local, `postgresql://usuario:contraseña@localhost:5432/basededatos`; en producción, la cadena de Neon con *pooler* |
| `TEST_DATABASE_URL` | Opcional. Base de datos de los tests; por defecto, la de `DATABASE_URL` con `_test` al final del nombre |
| `BETTER_AUTH_SECRET` | Firma las cookies de sesión. Al menos 32 caracteres aleatorios (`npm run auth:secret`); uno distinto en cada entorno |
| `BETTER_AUTH_URL` | Dirección de la aplicación (`http://localhost:3000` en local, `https://memnonhistory.vercel.app` en producción) |
| `LLM_BASE_URL`, `LLM_MODEL` | Opcionales. Servidor y modelo con protocolo OpenAI. Por defecto, Ollama en local con `qwen2.5:7b`; en producción, `https://api.groq.com/openai/v1` y `openai/gpt-oss-120b` |
| `LLM_API_KEY` | Opcional. Solo si el servidor del modelo la pide (Groq sí; Ollama no) |
| `LLM_REASONING_EFFORT` | Opcional (`low`, `medium`, `high`). Para modelos que razonan antes de responder, como `gpt-oss`: cuánto razonar. En producción, `low` |
| `LLM_DAILY_LIMIT` | Opcional. Tope diario de llamadas a la IA para toda la web (preguntas y propuestas con IA juntas). Por defecto, 50 |

Las variables se validan con Zod en su primer uso: si falta alguna o tiene un formato incorrecto, la aplicación se detiene con un mensaje que nombra la variable, nunca su valor (OWASP A05). Los archivos `.env*` con valores reales nunca se suben al repositorio.

---

## 8. Despliegue

La aplicación está publicada en **[memnonhistory.vercel.app](https://memnonhistory.vercel.app)**, con servicios gratuitos y sin tarjeta:

| Pieza | Servicio | Detalle |
| --- | --- | --- |
| Aplicación | **Vercel** (plan Hobby) | Funciones en Frankfurt (`fra1`), HTTPS y despliegue automático en cada push a `main` |
| Base de datos | **Neon** (plan Free) | PostgreSQL 17 + pgvector en Frankfurt. La web se conecta por el *pooler*; los scripts, por la conexión directa |
| Modelo de lenguaje | **Groq** (plan gratuito) | `openai/gpt-oss-120b`, que admite *Structured Outputs* con esquema estricto |
| Embeddings | **Dentro de la propia función** | El mismo modelo que en local, descargado al compilar e incluido en la función |

**Cómo se ha preparado para Vercel:**

- Transformers.js carga su motor ONNX en tiempo de ejecución, y el rastreo de Next.js no lo detecta. `next.config.ts` incluye a mano el motor para Linux x64 y el modelo de embeddings, sin los binarios de otros sistemas ni los de GPU: unos **194 MB por función**, por debajo del límite de 250 MB.
- El modelo se descarga **durante la compilación** (`vercel.json` ejecuta `npm run model:download` antes de `npm run build`), porque en Vercel el disco es de solo lectura.
- Los **límites de peticiones** se guardan en PostgreSQL y no en memoria: en Vercel funcionan varias instancias a la vez y todas tienen que compartir la cuenta.

**Reproducir el despliegue:**

1. Crear un proyecto en Neon (Postgres 17, región Frankfurt) y guardar su conexión directa en `.env.neon`:

   ```
   DATABASE_URL=postgresql://...
   ```

2. Cargar la base de datos desde el equipo local:

   ```bash
   npm run neon:migrate
   npm run neon:seed
   npm run neon:index
   ```

3. Crear una API key en Groq.
4. Importar el repositorio en Vercel (Next.js, sin cambiar la configuración: la toma de `vercel.json`) y añadir las variables de entorno solo para **Production**: `DATABASE_URL` (la conexión de Neon con *pooler*), `BETTER_AUTH_SECRET` (uno nuevo), `BETTER_AUTH_URL`, `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY` y `LLM_REASONING_EFFORT=low`.
5. Desplegar, registrar una cuenta en la web y darle el rol: `npm run neon:admin -- email`.

**Al publicar cambios:** basta con hacer push a `main`. Si el cambio trae una migración nueva, antes hay que ejecutar `npm run neon:migrate`. Las migraciones solo añaden, así que la versión anterior sigue funcionando mientras tanto.

---

## 9. Tests y metodología TDD

Toda la lógica de `domain/` y `application/` se ha desarrollado con **TDD estricto**:

1. 🔴 **Red**: se escribe el test y se comprueba que falla.
2. 🟢 **Green**: se escribe el código mínimo para que pase.
3. 🔵 **Refactor**: se mejora el diseño manteniendo los tests en verde.

| Tipo | Cantidad | Ámbito | Herramientas |
| --- | --- | --- | --- |
| Unitarios | **836** | `tests/domain/`, `tests/application/`, `tests/infrastructure/`, `tests/lib/` | Vitest con repositorios en memoria y dobles de prueba. No necesitan Docker |
| Integración | **143** | `tests/**/*.integration.test.ts` | Vitest contra PostgreSQL real. Los repositorios y el limitador de PostgreSQL pasan **los mismos tests de contrato** que los de memoria, y el seed completo se escribe y se lee sin perder datos |
| End-to-end | **48** | `e2e/` | Playwright sobre una compilación de producción, con la base de datos de test reiniciada en cada ejecución y un servidor falso del modelo |

Los end-to-end recorren los flujos clave en un navegador real:

- navegación hasta un tema y 404;
- quiz corregido en el servidor (sin las soluciones en el HTML);
- registro, inicio y cierre de sesión, y la redirección abierta bloqueada;
- comentarios con y sin sesión;
- Mi biblioteca;
- preguntar a la enciclopedia y su respuesta con citas;
- cronología completa y su editor;
- panel de administración: acceso, y un tema de principio a fin (crear, completar, publicar, jugar su quiz, imagen, despublicar y borrar);
- propuestas con dos cuentas a la vez;
- cabeceras de seguridad, con la CSP sin bloquear nada de la web.

```bash
npm run test               # unitarios
npm run test:integration   # integración (Docker)
npm run test:e2e           # end-to-end (Docker)
```

---

## 10. Seguridad

El desarrollo sigue tres guías OWASP, y cada medida está cubierta por tests:

- **OWASP Top 10 (web):**
  - control de acceso en el servidor, en cada caso de uso: la sesión sale siempre de la cookie, nunca del formulario, y el rol de administrador se lee de la base de datos en cada petición (A01);
  - consultas parametrizadas mediante ORM y React para pintar el contenido (A03);
  - variables de entorno validadas con Zod (A05);
  - **cabeceras de seguridad:** CSP con un **nonce por petición** (solo se ejecutan los scripts que lo llevan), `frame-ancestors 'none'` y `X-Frame-Options` contra el *clickjacking*, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS (la pone Vercel) y sin `X-Powered-By` (A05).
- **OWASP API Security Top 10:**
  - comprobación de propiedad de cada recurso (BOLA, API1): cada usuario solo ve y cambia lo suyo;
  - esquemas estrictos contra *Mass Assignment*: un `userId`, un `status` o un `slug` inyectados en un formulario se rechazan (API3);
  - **límites de peticiones** en comentarios, quiz, registro, inicio de sesión (por visitante y por cuenta), biblioteca, panel, propuestas y cada uso de la IA. Se guardan en PostgreSQL para que las instancias de Vercel compartan la cuenta, con un cerrojo por clave contra las peticiones simultáneas, y la clave (que puede ser un correo) se guarda como *hash* (API4).
- **OWASP Top 10 for LLM Applications:**
  - inyección de prompts (LLM01): instrucciones separadas de los datos, que van delimitados y no pueden cerrar sus etiquetas;
  - salidas del modelo estructuradas y validadas con Zod, y nunca interpretadas como HTML ni como URL (LLM02);
  - al modelo solo llega contenido público y revisado o el texto que el propio usuario pega, y los fallos se registran sin ese texto (LLM06);
  - la IA no escribe en la base de datos: lo que propone pasa siempre por una persona (LLM08), y las respuestas enlazan sus fuentes (LLM09);
  - límites de longitud, tokens, tiempo y peticiones por usuario, y un **tope diario global** para toda la web que protege el cupo gratuito de Groq (LLM10).

**Autenticación** (Better Auth sobre nuestra PostgreSQL):

- contraseñas de 12 a 128 caracteres (OWASP ASVS), sin reglas de composición, guardadas con scrypt;
- el registro rechaza las contraseñas que aparecen en filtraciones conocidas (Have I Been Pwned, con k-anonimato: solo salen los 5 primeros caracteres de su hash SHA-1);
- cookie de sesión `httpOnly` y `SameSite=Lax`; al cerrar sesión se borra también en la base de datos;
- el inicio de sesión responde siempre «Email o contraseña incorrectos», sin revelar qué emails tienen cuenta;
- tras iniciar sesión solo se vuelve a rutas de la propia web (sin redirecciones abiertas);
- la ruta HTTP de Better Auth no se expone: todo pasa por Server Actions que validan y limitan.

Otros detalles: el quiz llega al navegador sin las respuestas correctas, y las imágenes solo pueden ser archivos locales del catálogo (nunca SVG ni dominios externos). El detalle completo está en [`AGENTS.md`](AGENTS.md#3-directivas-de-seguridad-owasp-triléctica-de-seguridad).

---

## 11. Limitaciones conocidas

- **Sin correo electrónico:** no hay verificación de la cuenta ni recuperación de la contraseña. Better Auth lo admite; añadirlo exige un proveedor de correo (por ejemplo, Resend) y un dominio propio verificado para poder escribir a cualquier dirección. Se ha dejado fuera a propósito para no depender de más servicios en el TFM.
- **El cupo de la IA es el gratuito de Groq:** unas decenas de preguntas al día entre todos los usuarios (tope de 50, configurable con `LLM_DAILY_LIMIT`). Al agotarse, «Preguntar» sigue funcionando y muestra los fragmentos encontrados, sin redactar.
- **Inyección de prompts:** un modelo no resiste todas las inyecciones (medido en el relleno de propuestas: 1 de 8 intentos pasa). El daño posible se limita por diseño: el modelo no tiene herramientas ni datos privados, su salida tiene esquema y solo rellena el formulario de quien pegó el texto, que después revisa un administrador.
- **Primera visita lenta:** tras un rato sin uso, Neon pausa la base de datos y Vercel arranca la función en frío (y, al preguntar, carga el modelo de embeddings). La primera petición tarda unos segundos; las siguientes van rápidas.
- **Aviso de React en desarrollo** («Encountered a script tag…»): aparece si React rehace la página en el navegador. Es inofensivo, porque el script del tema ya se ha ejecutado desde el HTML del servidor; la alternativa (`next/script`) lo retrasaba en producción y se veía un instante el tema contrario.

---

## 12. Usuario y contraseña de prueba

Cuenta de prueba en la aplicación desplegada, con los permisos de un usuario normal (preguntar, comentar, jugar el quiz, biblioteca y propuestas):

| Campo | Valor |
| --- | --- |
| URL | [memnonhistory.vercel.app/iniciar-sesion](https://memnonhistory.vercel.app/iniciar-sesion) |
| Email | `lectortfm1@example.com` |
| Contraseña | `Lectorpruebatfm1` |

Los datos de una cuenta **administradora** (panel, editor de temas y cronologías, bandeja de propuestas) se entregan aparte, en el formulario de entrega del TFM: publicarlos aquí permitiría a cualquiera editar el contenido.

> Credenciales exclusivamente de prueba, sin relación con ninguna cuenta real.
