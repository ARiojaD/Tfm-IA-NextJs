# MemnonHistory AI

**Gestor inteligente de conocimiento histórico con RAG.**

Plataforma web *fullstack* para organizar lecturas, eventos y cronologías históricas (Grecia, Roma, Hispania…) y consultar las notas personales y fuentes secundarias mediante un sistema RAG (*Retrieval-Augmented Generation*) que responde citando el origen de cada dato.

> Trabajo Fin de Máster · Máster en Desarrollo con IA · BigSchool
> Autor: Alejandro ([@ARiojaD](https://github.com/ARiojaD))

---

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Funcionalidades principales](#2-funcionalidades-principales)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Arquitectura](#4-arquitectura)
5. [Estructura del proyecto](#5-estructura-del-proyecto)
6. [Instalación y ejecución](#6-instalación-y-ejecución)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Tests y metodología TDD](#8-tests-y-metodología-tdd)
9. [Seguridad](#9-seguridad)
10. [Usuario y contraseña de prueba](#10-usuario-y-contraseña-de-prueba)

---

## 1. Descripción del proyecto

Quien estudia historia acumula lecturas, apuntes y fechas repartidos entre libros, documentos y notas sueltas. **MemnonHistory AI** reúne todo ese conocimiento en un solo lugar:

- **Organiza** eventos históricos con fecha, época y descripción, y los muestra en líneas del tiempo.
- **Relaciona** cada evento con las fuentes y notas personales de las que procede.
- **Responde preguntas** en lenguaje natural usando solo la biblioteca del usuario, con citas a las fuentes, gracias a un pipeline RAG sobre PostgreSQL + pgvector y la API de Anthropic Claude.
- **Estructura automáticamente** fragmentos de lectura en fichas de eventos mediante *Structured Outputs* validados con Zod.

**Origen del nombre.** Memnón de Etiopía, héroe de la Guerra de Troya e hijo de Eos (la Aurora), simboliza el amanecer del conocimiento histórico y la épica clásica. La identidad visual de la aplicación parte de esa idea: paleta de amanecer y tipografía clásica.

**Distribución del TFM:**

| Bloque | Peso | Contenido |
| --- | --- | --- |
| Web *fullstack* | 70 % | PostgreSQL/pgvector, CRUD de eventos y fuentes, líneas del tiempo interactivas, autenticación y panel de usuario |
| Inteligencia Artificial | 30 % | Pipeline RAG sobre notas, generación de embeddings y fichas históricas con *Structured Outputs* |

---

## 2. Funcionalidades principales

### Gestión del conocimiento histórico

- **Eventos históricos** con título, fecha, época y descripción.
  - Las fechas están pensadas para la historia antigua: año entero (negativo = a.C.), sin año 0 y con mes opcional, porque de muchos eventos solo se conoce el año.
  - Las épocas son un catálogo cerrado (Grecia Antigua, Roma, Hispania…).
- **Fuentes y notas personales** asociadas a cada evento, para saber siempre de dónde procede cada dato.
- **Navegación por civilizaciones** (Roma, Antigua Grecia, Hispania) y, dentro de cada una, por categorías: personajes, guerras y batallas, etapas y ciudades. Los temas de cada categoría se ordenan cronológicamente.
- **Temas históricos** (un personaje, una batalla, una etapa…) con periodo, introducción, datos clave, imagen opcional con su crédito, cronología, quiz, comentarios, recomendaciones y temas relacionados.
- **Líneas del tiempo** que ordenan los eventos y los distinguen por época.

### Inteligencia Artificial

- **Consultas con RAG:** preguntas en lenguaje natural respondidas solo con el contenido de la biblioteca del usuario, citando las fuentes.
- **Fichas automáticas:** a partir de un fragmento de lectura, la IA propone una ficha estructurada del evento, que se valida antes de guardarse.

### Usuarios e interfaz

- **Cuentas de usuario:** registro e inicio de sesión con email y contraseña (`/registro`, `/iniciar-sesion`). En público solo se muestra el nombre visible, nunca el email. Comentar requiere sesión: el comentario se firma con el nombre de la cuenta.
- **Mi biblioteca** (`/mi-biblioteca`): cada usuario puede **seguir civilizaciones** (le aparecen todos sus temas, también los que se añadan después) y **guardar temas** sueltos con ☆ Guardar. Sin sesión, los botones se ven igual y llevan a iniciar sesión. Cada usuario solo ve y cambia su propia biblioteca.
- **Panel de administración** (`/admin`, en desarrollo): los administradores gestionarán los temas (crear, editar, publicar), su cronología, quiz y recomendaciones, y revisarán las propuestas de los usuarios. Sin sesión lleva a iniciar sesión; a una cuenta normal le responde 404.
- **Propuestas** (próximamente): desde Mi biblioteca, los usuarios podrán proponer eventos, recomendaciones, correcciones o temas nuevos, que un administrador revisa antes de publicarlos.
- **Portada de presentación** con una cronología de ejemplo y una consulta RAG ilustrativa.
- **Modo claro y oscuro:** sigue la preferencia del sistema y recuerda la elección del usuario.
- **Diseño adaptado a móvil** e interfaz en español.

> _Por completar con las funcionalidades definitivas al cierre del proyecto._

---

## 3. Stack tecnológico

| Tecnología | Versión | Uso |
| --- | --- | --- |
| [Next.js](https://nextjs.org) (App Router, Turbopack) | 16.4.3 | Framework *fullstack* |
| [React](https://react.dev) | 19.2.8 | Interfaz de usuario |
| [TypeScript](https://www.typescriptlang.org) | 5.9.3 | Lenguaje, en modo `strict` y sin `any` |
| [Tailwind CSS](https://tailwindcss.com) | 4.3.3 | Estilos |
| [Zod](https://zod.dev) | 4.6.7 | Validación de esquemas de dominio, de entrada y de salidas del LLM |
| [Vitest](https://vitest.dev) | 5.0.4 | Tests unitarios y de integración |
| [Playwright](https://playwright.dev) | 1.64.1 | Tests end-to-end en el navegador |
| [ESLint](https://eslint.org) (`eslint-config-next`) | 9.39.5 | Linter |
| PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) | 17 + 0.8.7 (Docker) | Base de datos relacional y vectorial |
| [Drizzle ORM](https://orm.drizzle.team) (+ `drizzle-kit`) | 0.45.4 | Consultas parametrizadas, esquema y migraciones |
| [Anthropic Claude API](https://docs.anthropic.com) vía [Vercel AI SDK](https://sdk.vercel.ai) | _Por completar_ | Generación de respuestas y *Structured Outputs* |
| Modelo de embeddings | _Por completar_ | Vectorización de notas para el RAG |
| [Better Auth](https://www.better-auth.com) | 1.7.14 | Registro, inicio de sesión y sesiones (en nuestra PostgreSQL) |
| Despliegue | _Por completar_ | Alojamiento de la aplicación y la base de datos |

---

## 4. Arquitectura

El proyecto sigue una **Clean Architecture pragmática**, orientada al dominio. Cada capa tiene su propia carpeta:

| Capa | Carpeta | Responsabilidad |
| --- | --- | --- |
| 🔴 Dominio | `domain/` | Reglas del negocio: entidades y *value objects*. TypeScript puro, sin dependencias de Next.js, base de datos ni IA |
| 🟠 Aplicación | `application/` | Casos de uso que orquestan el dominio, y *ports* (interfaces) con lo que necesitan del exterior |
| 🔵 Infraestructura | `infrastructure/` | Implementación de los *ports*: PostgreSQL + pgvector, Claude y embeddings |
| 🟢 Composición | `composition/` | Conecta cada caso de uso con sus implementaciones reales y valida la configuración |
| 🟤 Compartido | `shared/` | Utilidades transversales sin lógica de negocio |
| ⚪ Presentación | `app/`, `components/`, `lib/` | Páginas, *Route Handlers* (entrada HTTP) y componentes de Next.js |

```text
   app/ (HTTP, páginas)
        │ llama a
        ▼
   application/use-cases ──usa──► application/ports  (interfaces)
        │                                ▲
        ▼                                │ implementa
      domain/                    infrastructure/  (PostgreSQL, Claude)

   composition/ une cada caso de uso con su implementación real
```

**Regla de dependencias:** las dependencias solo apuntan hacia dentro (`infrastructure` → `application` → `domain`). `domain` y `application` nunca importan de `infrastructure` ni de Next.js, lo que permite probar toda la lógica de negocio con repositorios en memoria o mocks.

Las normas completas de arquitectura, seguridad y metodología están en [`AGENTS.md`](AGENTS.md).

---

## 5. Estructura del proyecto

```
.
├── src/
│   ├── domain/                   # 🔴 Reglas del negocio
│   │   ├── entities/             # Temas, eventos, quizzes, comentarios y recomendaciones
│   │   └── value-objects/        # Fechas y periodos, épocas, categorías, datos clave, imágenes, slugs e ids
│   ├── application/              # 🟠 Organiza el trabajo
│   │   ├── use-cases/            # Casos de uso
│   │   ├── ports/                # Interfaces de repositorios y servicios externos
│   │   ├── dto/                  # Esquemas de entrada de los casos de uso
│   │   └── errors/               # Errores esperados de los casos de uso
│   ├── infrastructure/           # 🔵 Mundo real
│   │   ├── persistence/
│   │   │   ├── in-memory/        # Repositorios en memoria y datos iniciales (seed)
│   │   │   └── postgres/         # PostgreSQL: cliente, esquema, migraciones, mappers, seed y repositorios
│   │   ├── system/               # Reloj y generador de identificadores
│   │   ├── rate-limiting/        # Limitadores de frecuencia
│   │   └── ai/                   # Adaptadores de Claude y embeddings
│   ├── composition/              # 🟢 Conexión de piezas (container) y configuración
│   ├── shared/                   # 🟤 Utilidades transversales
│   ├── app/                      # ⚪ Presentación (Next.js App Router)
│   │   ├── api/                  # Route Handlers (entrada HTTP)
│   │   ├── (dashboard)/          # Panel privado del usuario
│   │   ├── [era]/                # Página de cada civilización (/roma), con sus temas por categoría
│   │   │   └── [category]/[topic]/  # Página de cada tema (/roma/personajes/julio-cesar) y sus Server Actions
│   │   ├── layout.tsx            # Layout raíz: fuentes, tema y metadatos
│   │   ├── page.tsx              # Portada
│   │   ├── not-found.tsx         # Página 404
│   │   └── globals.css           # Paleta de colores y temas claro/oscuro
│   ├── components/               # ⚪ Componentes de UI reutilizables
│   │   └── topic/                # Módulos de la página de un tema (quiz, comentarios, recomendaciones)
│   └── lib/                      # ⚪ Utilidades de la interfaz
├── tests/                        # Tests, replicando la estructura de src/
│   ├── domain/                   # Unitarios del dominio
│   ├── application/              # Casos de uso y tests de contrato de los ports
│   ├── infrastructure/           # Implementaciones de los ports (postgres/: *.integration.test.ts)
│   ├── shared/
│   ├── lib/
│   └── fixtures/                 # Constructores de datos de prueba
├── e2e/                          # Tests end-to-end con Playwright (la web entera en un navegador)
├── scripts/                      # Scripts de mantenimiento (db-seed.ts)
├── public/                       # Recursos estáticos (images/topics: imágenes de los temas)
├── AGENTS.md                     # Reglas de arquitectura, seguridad OWASP y TDD
├── CLAUDE.md                     # Instrucciones para el asistente de IA
├── .env.example                  # Plantilla de variables de entorno (sin valores reales)
├── docker-compose.yml            # PostgreSQL + pgvector para desarrollo
├── drizzle.config.ts             # Configuración de drizzle-kit (esquema y migraciones)
├── vitest.config.mts             # Configuración de los tests unitarios
├── vitest.integration.config.mts # Configuración de los tests de integración (PostgreSQL)
├── playwright.config.ts          # Configuración de los tests end-to-end
└── package.json
```

Los tests viven en `tests/` y replican la ruta del código que prueban: `src/domain/entities/HistoricalEvent.ts` se prueba en `tests/domain/entities/HistoricalEvent.test.ts`.

---

## 6. Instalación y ejecución

### Requisitos previos

- [Node.js](https://nodejs.org) 24 LTS
- npm 11 o superior
- Git
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ejecuta PostgreSQL 17 con pgvector; no hace falta instalar PostgreSQL)

### Pasos

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/ARiojaD/Tfm-IA-NextJs.git
   ```

2. Entrar en la carpeta del proyecto e instalar las dependencias:

   ```bash
   cd Tfm-IA-NextJs
   npm install
   ```

3. Configurar las variables de entorno (ver [sección 7](#7-variables-de-entorno)).

4. Con Docker Desktop abierto, levantar la base de datos, crear las tablas y cargar los datos de ejemplo:

   ```bash
   npm run db:up
   npm run db:migrate
   npm run db:seed
   ```

5. Arrancar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

La aplicación lee y guarda los datos en PostgreSQL, así que Docker Desktop tiene que estar abierto y la base de datos levantada (`npm run db:up`) mientras se usa. Los datos se conservan entre reinicios.

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción (requiere `npm run build` antes) |
| `npm run lint` | Análisis estático con ESLint |
| `npm run test` | Ejecución única de los tests unitarios (no necesitan Docker) |
| `npm run test:watch` | Tests en modo observación, para el ciclo TDD |
| `npm run test:integration` | Tests de integración contra PostgreSQL, en una base de datos de test aparte (`<nombre>_test`) que se crea y migra sola. Requiere `npm run db:up` |
| `npm run db:up` / `db:down` | Levanta o para PostgreSQL en Docker (los datos se conservan en un volumen) |
| `npm run db:generate` | Genera una migración SQL a partir de los cambios del esquema |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Carga los temas de ejemplo (se puede relanzar: no duplica datos ni pisa lo editado desde el panel) |
| `npm run admin:grant -- email` | Nombra administrador a una cuenta ya registrada (`admin:revoke` lo quita). Es la única forma de dar el rol: desde la web no se puede |
| `npm run auth:secret` | Genera un secreto aleatorio para `BETTER_AUTH_SECRET` |
| `npm run test:e2e` | Tests end-to-end con Playwright: compila la app y la prueba en Chromium (puerto 3100), contra la base de datos de test. Requiere `npm run db:up`. La primera vez, instalar el navegador con `npx playwright install chromium` |

---

## 7. Variables de entorno

Copiar el archivo de ejemplo y rellenar los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
| --- | --- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Usuario, contraseña y nombre con los que Docker crea la base de datos la primera vez |
| `DATABASE_URL` | Conexión de la aplicación: `postgresql://usuario:contraseña@localhost:5432/basededatos` (los mismos valores de arriba) |
| `TEST_DATABASE_URL` | Opcional. Base de datos de los tests de integración; por defecto, la de `DATABASE_URL` con `_test` al final del nombre |
| `BETTER_AUTH_SECRET` | Firma las cookies de sesión. Al menos 32 caracteres aleatorios: `npm run auth:secret` |
| `BETTER_AUTH_URL` | Dirección de la aplicación (`http://localhost:3000` en desarrollo; la URL pública con https en producción) |
| _Por completar_ | _Clave de la API de Anthropic…_ |

Las variables se validan con Zod al arrancar la aplicación: si falta alguna o tiene un formato incorrecto, la aplicación no arranca (OWASP A05). Los archivos `.env*` con valores reales nunca se suben al repositorio.

---

## 8. Tests y metodología TDD

Toda la lógica de `domain/` y `application/` se desarrolla con **TDD estricto**:

1. 🔴 **Red**: se escribe el test y se comprueba que falla.
2. 🟢 **Green**: se escribe el código mínimo para que pase.
3. 🔵 **Refactor**: se mejora el diseño manteniendo los tests en verde.

```bash
npm run test
```

**Estrategia de testing:**

| Tipo | Ámbito | Herramientas |
| --- | --- | --- |
| Unitarios | `tests/domain/`, `tests/application/` y `tests/lib/` | Vitest con repositorios en memoria, mocks y stubs; objetivo de cobertura del 100 % en dominio y casos de uso |
| Integración | `tests/**/*.integration.test.ts` y endpoints de `app/api/` | Vitest contra PostgreSQL real: los repositorios PostgreSQL pasan **los mismos tests de contrato** que los de memoria, y el seed completo se escribe y se lee sin perder datos |
| End-to-end | `e2e/` | Playwright sobre una compilación de producción conectada a la base de datos de test (reiniciada con el seed y dos cuentas de prueba en cada ejecución): navegación hasta un tema, 404, quiz corregido en el servidor (sin soluciones en el HTML), registro, inicio y cierre de sesión, redirección abierta bloqueada, comentarios con y sin sesión, Mi biblioteca (seguir, guardar y quitar; sin sesión, a iniciar sesión) y acceso al panel de administración (admin, cuenta normal y sin sesión) |

> _Por completar con el resumen final de tests y cobertura._

---

## 9. Seguridad

El desarrollo sigue tres guías OWASP:

- **OWASP Top 10 (web):**
  - control de acceso por usuario en cada endpoint (A01), y rol de administrador comprobado en el servidor, en cada caso de uso del panel, leído de la base de datos en cada petición;
  - consultas parametrizadas mediante ORM (A03);
  - variables de entorno validadas con Zod (A05).
- **OWASP API Security Top 10:**
  - comprobación de propiedad de cada recurso (BOLA, API1);
  - validación estricta del cuerpo de las peticiones contra *Mass Assignment* (API3);
  - *rate limiting* en comentarios, respuestas del quiz, registro, inicio de sesión y Mi biblioteca (API4).
- **OWASP Top 10 for LLM Applications:**
  - separación entre instrucciones del sistema y contenido del usuario contra la inyección de prompts (LLM01);
  - salidas del modelo estructuradas y validadas con Zod (LLM02);
  - filtrado de datos sensibles (LLM06);
  - límites de tokens y *timeouts* (LLM10).

Algunos ejemplos ya aplicados, todos cubiertos por tests:

- Los esquemas de dominio rechazan cualquier propiedad no declarada, de modo que un `userId` inyectado en el cuerpo de una petición se descarta.
- El quiz se envía al navegador sin las respuestas correctas; cada respuesta se corrige en el servidor.
- Cada usuario puede publicar como máximo 5 comentarios por minuto, y cada visitante enviar 30 respuestas del quiz; los intentos inválidos también cuentan.
- **Autenticación** (Better Auth sobre nuestra PostgreSQL):
  - contraseñas de 12 a 128 caracteres (OWASP ASVS), sin reglas de composición, guardadas con scrypt y nunca en texto plano;
  - el registro rechaza las contraseñas que aparecen en filtraciones conocidas (Have I Been Pwned, con k-anonimato: solo salen los 5 primeros caracteres de su hash SHA-1), y un indicador de fortaleza orienta mientras se escribe;
  - cookie de sesión `httpOnly` y `SameSite=Lax`; al cerrar sesión se borra también en la base de datos;
  - el inicio de sesión responde siempre "Email o contraseña incorrectos" (no revela qué emails tienen cuenta) y limita los intentos por visitante y por cuenta contra la fuerza bruta;
  - el autor de un comentario sale de la sesión, nunca del formulario: nadie puede comentar en nombre de otro;
  - tras iniciar sesión solo se vuelve a rutas de la propia web (sin redirecciones abiertas);
  - la ruta HTTP de Better Auth no se expone: todo pasa por Server Actions que validan y limitan.
- Las imágenes de los temas solo pueden ser archivos locales de `/images` (JPG, PNG, WebP o AVIF): ni dominios externos, ni rutas con `..`, ni SVG, que puede contener scripts.

El detalle completo está en [`AGENTS.md`](AGENTS.md#3-directivas-de-seguridad-owasp-triléctica-de-seguridad).

---

## 10. Usuario y contraseña de prueba

La base de datos incluye un usuario de demostración con datos de ejemplo, creado mediante un *seed*:

| Campo | Valor |
| --- | --- |
| URL | _Por completar_ |
| Usuario | _Por completar_ |
| Contraseña | _Por completar_ |

> Credenciales exclusivamente de prueba, sin relación con ninguna cuenta real.
