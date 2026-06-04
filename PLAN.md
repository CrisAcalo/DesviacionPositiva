# Plan de Implementación — Plataforma de Desviación Positiva ESPE

**Stack:** Laravel 13 · React + Inertia.js v3 · Spatie Permission · Fortify · Wayfinder  
**Última actualización:** 2026-06-02 (post-Fase 3 + pruebas de navegador)

---

## Estado general

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Fundación: DB, roles, layout base | ✅ Completada |
| 1 | RF-01 — Ingesta de calificaciones por NRC | ✅ Completada |
| 2 | RF-02 — Segmentación automática por rendimiento | ✅ Completada |
| 3 | RF-03 — Encuestas dinámicas por grupo | ✅ Completada |
| 4 | RF-04 — Motor de análisis de desviación positiva | ✅ Completada |
| 5 | RF-05 — Reportes y dashboard de resultados | ✅ Completada |

---

## Fase 0 — Fundación

> Objetivo: tener la base del proyecto lista antes de desarrollar lógica de negocio.

### 0.1 Base de datos — migraciones iniciales

| Tabla | Propósito |
|-------|-----------|
| `nrcs` | Registro de NRCs cargados (materia, carrera, periodo académico) |
| `students` | Estudiantes anonimizados (UUID interno, sin nombre ni cédula) |
| `grades` | Calificaciones por estudiante y NRC (parciales + final, inmutables) |
| `student_groups` | Clasificación de cada estudiante en su NRC (alto/medio/riesgo) |
| `surveys` | Definición de encuestas por grupo de rendimiento |
| `survey_questions` | Preguntas de cada encuesta (tipo: escala, opción múltiple, texto) |
| `survey_responses` | Respuestas anonimizadas vinculadas al UUID del estudiante |
| `analysis_results` | Resultados del motor de análisis por NRC |
| `recommendations` | Recomendaciones generadas con umbral de respaldo ≥ 60% |

### 0.2 Roles y permisos (Spatie)

Roles a crear:

- `admin` — Administrador del sistema
- `coordinator` — Coordinador académico y ayudante (mismos privilegios)
- `teacher` — Docente
- `project_director` — Director del proyecto
- `student` — Respondiente de encuestas

### 0.3 Layout y navegación base

- Layout principal con sidebar por rol (React + Inertia)
- Rutas de auth ya disponibles vía Fortify (login, registro, etc.)
- Middleware de autorización por rol en rutas sensibles

---

## Fase 1 — RF-01: Ingesta de Calificaciones por NRC

> **Prioridad:** Alta / Crítica  
> **Actores:** Administrador / Investigador  
> **Módulo:** MOD-ING

### Entregables

- [x] Migraciones: `nrcs`, `students`, `grades`, tablas de catálogo (`departments`, `careers`, `subjects`, `academic_periods`)
- [x] `NrcController` con acciones index / create / store / show
- [x] `StoreNrcRequest` — validación de carga múltiple
- [x] Servicio `GradeImportService` — validación + importación + anonimización (SHA3-256)
- [x] Soporte de CSV (delimitador auto-detectado, BOM) y XLSX (`maatwebsite/excel`)
- [x] Página React: formulario multi-archivo con drag-and-drop y preview de primeras filas
- [x] Preview de datos por archivo (PapaParse / SheetJS) antes de confirmar
- [x] Reporte de errores de formato en línea (por archivo)
- [x] Política `NrcPolicy`: notas inmutables; acceso solo al uploader, admin, coordinator y project_director
- [x] Job `ImportGradesJob` — cola para cargas grandes (>100 registros)
- [x] Selects relacionales: materia, carrera (agrupada por departamento), período académico
- [x] Vista `nrcs/show` — detalle del NRC con tabla de estudiantes anonimizados y conteos por grupo

### Reglas críticas ✅

- Cédula → `hash('sha3-256', $cedula . APP_KEY)` → solo se guarda el hash (nunca la cédula)
- Notas inmutables tras importación (`locked_at`; sin rutas UPDATE)
- Carga agnóstica (funciona para cualquier carrera/materia)

### Formato de archivo fuente (acordado)

```
cedula | parcial_1 | parcial_2 | parcial_3
```

> `nota_final` se calcula automáticamente como `round((p1+p2+p3)/3, 2)`.

---

## Fase 2 — RF-02: Segmentación Automática por Rendimiento

> **Prioridad:** Alta  
> **Actores:** Sistema (automático)  
> **Módulo:** MOD-SEG

### Entregables

- [x] Migración: `student_groups`
- [x] Servicio `SegmentationService` — clasificación por umbral sobre `final_grade`
- [x] Job `SegmentStudentsJob` — disparado por `NrcController` (sync) o por `ImportGradesJob` (async/queued)
- [x] Vista `nrcs/show` muestra grupos con badges y conteos porcentuales (solo lectura)
- [x] NRC actualiza `status → 'segmented'` al terminar la segmentación

### Umbrales de clasificación (RN-01)

| Grupo | Etiqueta | Criterio |
|-------|----------|----------|
| `high` | Alto rendimiento / Desviante positivo | `final_grade > 8.5` |
| `medium` | Rendimiento promedio | `6.0 ≤ final_grade ≤ 8.5` |
| `at_risk` | En riesgo | `final_grade < 6.0` |

### Reglas críticas ✅

- Clasificación basada exclusivamente en calificaciones (sin factores externos)
- Ningún usuario puede cambiar la etiqueta de un estudiante manualmente
- Los grupos se manejan como conjuntos anonimizados
- `SegmentationService::segment()` es idempotente (`updateOrCreate`)

---

## Fase 3 — RF-03: Encuestas Dinámicas por Grupo

> **Prioridad:** Alta  
> **Actores:** Sistema / Estudiante  
> **Módulo:** MOD-ENC

### Entregables

- [x] Migraciones: `surveys` (refactorizada con `nrc_id`/`status`), `survey_questions`, `survey_responses`, `question_bank`, `survey_access_tokens`
- [x] Email opcional en `students` (columna nullable, via columna `email` en archivo de importación)
- [x] Seeder `QuestionBankSeeder` — 5 preguntas por grupo (high/medium/at_risk), 15 en total
- [x] `QuestionBankController` — CRUD completo (admin/coordinator)
- [x] `SurveyController` — activación manual por NRC, cierre manual/por fecha, descarga CSV de tokens, endpoint JSON de tokens por survey
- [x] `SurveyResponseController` — formulario público por token (sin login), validación de token único
- [x] `SurveyActivationService` — crea 3 surveys por NRC, copia preguntas del banco, genera tokens únicos por estudiante
- [x] Página React `surveys/respond` — formulario público mobile-first con soporte Likert, opción única y opción múltiple
- [x] Páginas React `question-bank/index`, `create`, `edit` — gestión del banco de preguntas
- [x] `nrcs/show` actualizado — sección de activación (status=segmented) y dashboard de cumplimiento (status=surveying)
- [x] Token de un solo uso — el segundo intento devuelve error 403; estado "Ya respondiste"
- [x] Tests unitarios (`SurveyActivationServiceTest`) y de feature (`SurveyResponseTest`, `QuestionBankTest`)

### Decisión de diseño (banco de preguntas)

El banco de preguntas es **universal** (no filtra por carrera o materia). Cuando se activan encuestas de un NRC, se copian las preguntas activas del banco hacia `survey_questions` del survey específico — esto garantiza inmutabilidad: editar el banco no afecta encuestas ya activadas.

> **TODO (v2):** Agregar columna `category` a `question_bank` para filtrar por área temática o departamento, permitiendo que coordinadores de distintas áreas mantengan bancos segmentados sin mezclarlos.

### Tipos de preguntas soportadas

- Escala Likert (1-5)
- Opción múltiple (selección única)
- Selección múltiple
- Texto libre (opcional, anonimizado)

### Plantillas de preguntas base (PA-04)

**Grupo de Alto Rendimiento:**

- ¿Qué recursos académicos utilizas con mayor frecuencia?
- ¿Con qué frecuencia revisas el material de clase fuera del horario lectivo?
- ¿Qué estrategias de estudio aplicas antes de los exámenes parciales?

**Grupo en Riesgo:**

- ¿Qué dificultades encuentras con mayor frecuencia en el desarrollo de la materia?
- ¿Con qué frecuencia asistes a tutorías o consultas con el docente?
- ¿Qué factores académicos dificultan tu rendimiento en esta materia?

> Las preguntas son mutuamente excluyentes entre grupos (RN-05).

---

## Fase 4 — RF-04: Motor de Análisis de Desviación Positiva

> **Prioridad:** Alta / Valor de negocio  
> **Actores:** Sistema / Investigador  
> **Módulo:** MOD-ANL  
> **Bloqueador:** ~~PA-03~~ ✅ Resuelto — análisis bajo demanda, sin mínimo de muestra

### Entregables

- [x] Migraciones: `analysis_results`, `recommendations`
- [x] Servicio `AnalysisEngine` — cruce de calificaciones + respuestas de encuestas
- [x] Job `RunAnalysisJob` — disparado bajo demanda (sin mínimo de muestra — PA-03 resuelto)
- [x] Lógica de umbral: solo recomendar patrones presentes en ≥ 60% del grupo alto (RN-09)
- [x] Cálculo de frecuencias de respuestas por pregunta y por grupo
- [x] Contraste entre recursos del grupo alto vs barreras del grupo en riesgo
- [x] Botón "Ejecutar análisis" en NRC (status=`surveying`) → NRC pasa a `analyzed`
- [x] Página React `analysis/show` — prácticas validadas + barreras detectadas + desglose por pregunta
- [x] Indicador visual de respaldo estadístico por hallazgo (ej: "8/10 estudiantes · 80%")
- [x] Tests unitarios `AnalysisEngineTest` — 7 casos cubriendo umbral, validación, rerun, skip sin respuestas

### Algoritmo de análisis

1. Agrupar `survey_responses` por `survey_question_id` y `student_group` (via `survey → group`)
2. Para cada pregunta del grupo **alto**: calcular frecuencia de cada opción de respuesta
3. Marcar como "práctica validada" si ≥ 60% del grupo alto reporta el mismo patrón
4. Contrastar con respuestas del grupo **en riesgo** (barreras)
5. Generar `recommendations` a partir de prácticas validadas: `{question_text, winning_answer, frequency, group}`
6. Actualizar NRC `status → 'analyzed'`

### Reglas críticas

- Sin inferencias socioeconómicas, emocionales o psicológicas
- Sin juicios de valor sobre docentes o estudiantes
- El sistema recomienda; no reemplaza la decisión docente (R-05)
- Los `analysis_results` son inmutables una vez generados (re-análisis crea nueva versión)

### Decisión PA-03 ✅

**Análisis bajo demanda** — el coordinador ejecuta el análisis cuando lo considere oportuno, sin importar cuántas respuestas haya. El botón "Ejecutar análisis" está siempre disponible mientras el NRC esté en `surveying`.

---

## Fase 5 — RF-05: Reportes y Dashboard de Resultados

> **Prioridad:** Alta  
> **Actores:** Director del Proyecto / Coordinador Académico / Docente  
> **Módulo:** MOD-REP  
> **Prerequisito:** Fase 4 completada

### Entregables

- [x] Dashboard `reports/index` — grid de todos los NRCs analizados con mini-donut de grupos, conteo de prácticas y barreras
- [x] Reporte detallado `reports/show` — KPIs, donut SVG de distribución, barras horizontales de prácticas, tarjetas de barreras, detalle por pregunta
- [x] Visualizaciones CSS/SVG puras (sin librería externa) — donut, barras horizontales, barras inline
- [x] Botón "Imprimir / PDF" → `window.print()` con `@media print` aplicado (sin instalar dompdf)
- [x] Descarga CSV de recomendaciones — `GET /reports/{nrc}/recommendations.csv` (BOM UTF-8, sin PII)
- [x] Nota LOPDP embebida en cada reporte imprimible
- [x] Sidebar "Análisis y Reportes" → `/reports`

### Reglas críticas (LOPDP)

- Ningún reporte expone nombres, cédulas, correos ni identificadores públicos
- El PDF solo incluye patrones estadísticos y recomendaciones pedagógicas
- Los UUIDs internos no aparecen en reportes descargables

---

## Requisitos no funcionales a implementar transversalmente

| ID | Requisito | Cómo se implementa |
|----|-----------|-------------------|
| RNF-01 | Cumplimiento LOPDP | Hash irreversible al importar; UUIDs en análisis; sin PII en reportes |
| RNF-02 | Anonimización irreversible | `GradeImportService` descarta PII antes de persistir |
| RNF-03 | Control de acceso | Middleware + Spatie roles por ruta y por acción |
| RNF-04 | Escalabilidad académica | Sin lógica hardcodeada por carrera; agnóstico al NRC |
| RNF-05 | Tiempo de respuesta ≤ 10s | Jobs en cola para procesamiento pesado |
| RNF-06 | 250 usuarios concurrentes | Queue workers + optimización de queries Eloquent |
| RNF-07 | Multi-idioma (ES/EN) | Laravel i18n + React i18next |
| RNF-08 | Diseño responsivo | Tailwind CSS mobile-first en todas las vistas |

---

## Preguntas abiertas que bloquean decisiones de implementación

| ID | Pregunta | Impacto | Estado |
|----|----------|---------|--------|
| PA-01 | ¿Formato oficial de archivo para carga de notas? | Define el parser en `GradeImportService` | ✅ Resuelto — CSV/XLSX con columnas `cedula`, `parcial_1`, `parcial_2`, `parcial_3` (+ `email`/`correo` opcional) |
| PA-03 | ¿Muestra mínima representativa para procesar encuestas? | Define cuándo disparar `RunAnalysisJob` | ⚠️ **Pendiente** — Necesario antes de implementar Fase 4 |
| PA-04 | ¿Plantillas de preguntas iniciales aprobadas? | Seed inicial de `survey_questions` | ✅ Resuelto — 15 preguntas seeded (5 por grupo), banco editable vía UI |

---

## Decisiones técnicas clave

- **Identificación de estudiantes:** cédula/código del archivo → `hash('sha3-256', $id . $secret)` → UUID descartable → solo el UUID persiste.
- **Inmutabilidad de notas:** columna `locked_at` en `grades`; policy que impide UPDATE después de import.
- **Acceso de estudiantes a encuestas:** token firmado de un solo uso (no requiere cuenta con PII).
- **Análisis:** PHP puro (colecciones Eloquent) para v1; migrar a Python/ML si el volumen lo justifica.
- **PDF:** `barryvdh/laravel-dompdf` o `spatie/browsershot` según complejidad del diseño.

---

## Convenciones de desarrollo

- Controladores delgados → toda la lógica en Services y Jobs
- Form Requests para validación de inputs
- Policies para autorización (no inline `can()` en controladores)
- Wayfinder para todas las llamadas frontend → backend (sin URLs hardcodeadas)
- Tailwind mobile-first en todos los componentes React
