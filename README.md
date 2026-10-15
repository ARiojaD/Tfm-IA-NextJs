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
- **Líneas del tiempo** que ordenan los eventos y los distinguen por época.

### Inteligencia Artificial

- **Consultas con RAG:** preguntas en lenguaje natural respondidas solo con el contenido de la biblioteca del usuario, citando las fuentes.
- **Fichas automáticas:** a partir de un fragmento de lectura, la IA propone una ficha estructurada del evento, que se valida antes de guardarse.

### Usuarios e interfaz

- **Cuentas de usuario:** cada usuario accede únicamente a sus propios eventos, fuentes y notas.
- **Panel privado** para gestionar la biblioteca personal.
- **Portada de presentación** con una cronología de ejemplo y una consulta RAG ilustrativa.
- **Modo claro y oscuro:** sigue la preferencia del sistema y recuerda la elección del usuario.
- **Diseño adaptado a móvil** e interfaz en español.

> _Por completar con las funcionalidades definitivas al cierre del proyecto._

---

## 3. Stack tecnológico

| Tecnología | Versión | Uso |
| --- | --- | --- |
| [Next.js](https://nextjs.org) (App Router, Turbopack) | 16.3.8 | Framework *fullstack* |
| [React](https://react.dev) | 19.2.8 | Interfaz de usuario |
| [TypeScript](https://www.typescriptlang.org) | 5.9.3 | Lenguaje, en modo `strict` y sin `any` |
| [Tailwind CSS](https://tailwindcss.com) | 4.3.3 | Estilos |
| [Zod](https://zod.dev) | 4.6.7 | Validación de esquemas de dominio, de entrada y de salidas del LLM |
| [Vitest](https://vitest.dev) | 5.0.4 | Tests unitarios y de integración |
| [ESLint](https://eslint.org) (`eslint-config-next`) | 9.39.5 | Linter |
| PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) | _Por completar_ | Base de datos relacional y vectorial |
| ORM | _Por completar_ | Consultas parametrizadas y migraciones |
| [Anthropic Claude API](https://docs.anthropic.com) vía [Vercel AI SDK](https://sdk.vercel.ai) | _Por completar_ | Generación de respuestas y *Structured Outputs* |
| Modelo de embeddings | _Por completar_ | Vectorización de notas para el RAG |
| Autenticación | _Por completar_ | Registro, inicio de sesión y sesiones |
| Despliegue | _Por completar_ | Alojamiento de la aplicación y la base de datos |

---

## 4. Arquitectura

El proyecto sigue una **Clean Architecture pragmática**, orientada al dominio:

- **`core/`**: dominio y casos de uso. Es TypeScript puro: no depende de Next.js, de la base de datos ni de la IA.
- **`infrastructure/`**: detalles de implementación (base de datos, adaptadores de IA, repositorios).
- **`app/`**: presentación y controladores (páginas y *Route Handlers* de Next.js).

**Regla de dependencias:** `core` nunca importa de `infrastructure` ni de `app`. La comunicación con el exterior se hace mediante interfaces e inyección de dependencias, lo que permite probar toda la lógica de negocio con mocks.

Las normas completas de arquitectura, seguridad y metodología están en [`AGENTS.md`](AGENTS.md).

---

## 5. Estructura del proyecto

```
.
├── src/
│   ├── core/                     # Dominio y aplicación (agnóstico de Next.js)
│   │   ├── domain/               # Entidades y esquemas de dominio
│   │   └── use-cases/            # Casos de uso
│   ├── infrastructure/           # Detalles de implementación
│   │   ├── db/                   # Cliente PostgreSQL, esquemas y migraciones
│   │   ├── ai/                   # Adaptadores de Claude y embeddings
│   │   └── repositories/         # Implementaciones de los repositorios del dominio
│   ├── app/                      # Presentación (Next.js App Router)
│   │   ├── api/                  # Route Handlers
│   │   ├── (dashboard)/          # Panel privado del usuario
│   │   ├── layout.tsx            # Layout raíz: fuentes, tema y metadatos
│   │   ├── page.tsx              # Portada
│   │   └── globals.css           # Paleta de colores y temas claro/oscuro
│   ├── components/               # Componentes de UI reutilizables
│   └── lib/                      # Utilidades, constantes y validadores
├── public/                       # Recursos estáticos
├── AGENTS.md                     # Reglas de arquitectura, seguridad OWASP y TDD
├── CLAUDE.md                     # Instrucciones para el asistente de IA
├── vitest.config.ts              # Configuración de tests
└── package.json
```

Los tests están junto al código que prueban (por ejemplo, `HistoricalEvent.test.ts` al lado de `HistoricalEvent.ts`).

---

## 6. Instalación y ejecución

### Requisitos previos

- [Node.js](https://nodejs.org) 24 LTS
- npm 11 o superior
- Git
- PostgreSQL con la extensión pgvector (_versión por completar_)

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

4. Preparar la base de datos: _por completar (migraciones y datos de ejemplo)_.

5. Arrancar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción (requiere `npm run build` antes) |
| `npm run lint` | Análisis estático con ESLint |
| `npm run test` | Ejecución única de los tests |
| `npm run test:watch` | Tests en modo observación, para el ciclo TDD |

---

## 7. Variables de entorno

Copiar el archivo de ejemplo y rellenar los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
| --- | --- |
| _Por completar_ | _Conexión a PostgreSQL, clave de la API de Anthropic, secreto de autenticación…_ |

Las variables se validan con Zod al arrancar la aplicación: si falta alguna o tiene un formato incorrecto, la aplicación no arranca (OWASP A05). Los archivos `.env*` con valores reales nunca se suben al repositorio.

---

## 8. Tests y metodología TDD

Toda la lógica de `core/` se desarrolla con **TDD estricto**:

1. 🔴 **Red**: se escribe el test y se comprueba que falla.
2. 🟢 **Green**: se escribe el código mínimo para que pase.
3. 🔵 **Refactor**: se mejora el diseño manteniendo los tests en verde.

```bash
npm run test
```

**Estrategia de testing:**

| Tipo | Ámbito | Herramientas |
| --- | --- | --- |
| Unitarios | `core/` (dominio y casos de uso) y utilidades de `lib/` | Vitest con mocks y stubs; objetivo de cobertura del 100 % en `core/` |
| Integración | `infrastructure/` y `app/api/` | Vitest contra la base de datos vectorial y los endpoints |

> _Por completar con el resumen final de tests y cobertura._

---

## 9. Seguridad

El desarrollo sigue tres guías OWASP:

- **OWASP Top 10 (web):**
  - control de acceso por usuario en cada endpoint (A01);
  - consultas parametrizadas mediante ORM (A03);
  - variables de entorno validadas con Zod (A05).
- **OWASP API Security Top 10:**
  - comprobación de propiedad de cada recurso (BOLA, API1);
  - validación estricta del cuerpo de las peticiones contra *Mass Assignment* (API3);
  - *rate limiting* (API4).
- **OWASP Top 10 for LLM Applications:**
  - separación entre instrucciones del sistema y contenido del usuario contra la inyección de prompts (LLM01);
  - salidas del modelo estructuradas y validadas con Zod (LLM02);
  - filtrado de datos sensibles (LLM06);
  - límites de tokens y *timeouts* (LLM10).

Por ejemplo, los esquemas de dominio rechazan cualquier propiedad no declarada, de modo que un `userId` inyectado en el cuerpo de una petición se descarta. Este comportamiento está cubierto por tests.

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
