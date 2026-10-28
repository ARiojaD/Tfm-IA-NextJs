# CLAUDE.md — Instrucciones de Operación para Claude Code (MemnonHistory AI)

## Comandos Principales
- **Desarrollo:** `npm run dev`
- **Compilación:** `npm run build`
- **Linter:** `npm run lint`
- **Tests (Ejecución única):** `npm run test`
- **Tests (Modo Watch / TDD):** `npm run test:watch`
- **Tests de integración (PostgreSQL, requiere `npm run db:up`):** `npm run test:integration`
- **Tests end-to-end (Playwright):** `npm run test:e2e`
- **Base de datos:** `npm run db:up` · `npm run db:migrate` · `npm run db:seed` · `npm run db:generate` (tras cambiar el esquema)

## Directiva Principal
- Antes de realizar cualquier cambio en el código del proyecto **MemnonHistory AI**, lee atentamente las reglas de seguridad (OWASP Web, API, GenAI), la arquitectura limpia pragmática, las convenciones de tipado y la metodología **TDD** definidas en `AGENTS.md`.