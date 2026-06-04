# Plan de Pruebas - Plataforma Desviación Positiva

## ✅ IMPLEMENTACIONES COMPLETADAS

### 1. **Home Page (Welcome)**
- ✅ Página descriptiva reemplazando template por defecto
- ✅ Explica qué es la plataforma
- ✅ Botones de login/dashboard
- ✅ 5 secciones con features
- ✅ Gráficos de estadísticas

**Localización:** `resources/js/pages/welcome.tsx`

### 2. **Gestión de Usuarios CRUD**
- ✅ UserController (index, create, store, edit, update, destroy)
- ✅ StoreUserRequest con validación
- ✅ UpdateUserRequest con validación
- ✅ Pages: users/index, users/create, users/edit
- ✅ UserPolicy para autorizacion
- ✅ Routes: /users/* con middleware admin
- ✅ Validación de email único
- ✅ Validación de contraseña fuerte (8 chars, mayúsculas, números, símbolos)
- ✅ Asignación de roles (admin, coordinator)

**Localización:** 
- Controller: `app/Http/Controllers/UserController.php`
- Requests: `app/Http/Requests/StoreUserRequest.php`, `UpdateUserRequest.php`
- Pages: `resources/js/pages/users/{index,create,edit}.tsx`
- Policy: `app/Policies/UserPolicy.php`
- Routes: `routes/web.php`

### 3. **Dashboard Mejorado**
- ✅ DashboardController reemplazando inertia simple
- ✅ 4 KPIs: NRCs, Estudiantes, Encuestas Activas, Análisis Completados
- ✅ Gráfica Donut de distribución de grupos
- ✅ Estado de NRCs (creado, segmentado, encuestas, analizado)
- ✅ Estadísticas adicionales: validadas, tasa de análisis, promedio por NRC
- ✅ Responsive design, colores por métrica

**Localización:** 
- Controller: `app/Http/Controllers/DashboardController.php`
- Page: `resources/js/pages/dashboard.tsx`
- Routes: `routes/web.php` (GET /dashboard)

### 4. **Validaciones**
- ✅ Cédula ecuatoriana (ValidEcuadorianCedula rule)
  - Exactamente 10 dígitos
  - Provincia válida (01-24)
  - Algoritmo módulo 11
- ✅ Período académico como TEXTO (no select)
  - Campo input free text
  - Auto-crea período si no existe
  - Acepta cualquier formato
- ✅ Notas de 0-20 (cambio de 0-10)
  - Validación en GradeImportService
  - Ejemplos en guía actualizada
  - CSV de prueba con notas 0-20

**Localización:**
- Rule: `app/Rules/ValidEcuadorianCedula.php`
- Service: `app/Services/GradeImportService.php`
- Form: `resources/js/pages/nrcs/create.tsx`
- Request: `app/Http/Requests/StoreNrcRequest.php`

### 5. **Archivos CSV de Prueba**
- ✅ test_data_nrc_2026_01.csv (15 estudiantes con emails)
  - Cédulas ecuatorianas válidas
  - Notas 0-20
  - Emails
  - Distribución: 4 alto, 5 medio, 6 en riesgo
- ✅ test_data_nrc_2026_02.csv (20 estudiantes sin emails)
  - Mismo formato
  - Mayor volumen de datos

**Localización:** En raíz del proyecto

---

## 🧪 PRUEBAS A REALIZAR

### FASE 1: Navegación Básica
- [ ] 1.1: Visitar http://127.0.0.1:8000/ → Home page carga
- [ ] 1.2: Click "Iniciar sesión" → Login page
- [ ] 1.3: Login con admin (usuario pre-existente)
- [ ] 1.4: Verificar Dashboard carga con gráficas
- [ ] 1.5: Click en "Usuarios" en sidebar → Lista vacía

### FASE 2: Gestión de Usuarios (Admin)
- [ ] 2.1: Click "Nuevo usuario" → Formulario vacío
- [ ] 2.2: Llenar formulario incompleto → Validaciones de error
- [ ] 2.3: Contraseña débil (< 8 chars) → Error
- [ ] 2.4: Contraseña sin mayúsculas → Error
- [ ] 2.5: Crear usuario válido (nombre, email único, contraseña fuerte, rol)
- [ ] 2.6: Verificar usuario aparece en lista
- [ ] 2.7: Click Edit → Formulario pre-poblado
- [ ] 2.8: Cambiar rol a admin → Guardar
- [ ] 2.9: Cambiar contraseña → Guardar
- [ ] 2.10: Click Delete → Confirmar → Usuario eliminado
- [ ] 2.11: Logout → Login con nuevo usuario coordinador

### FASE 3: Cargar NRC (Coordinador)
- [ ] 3.1: Click "Cargar NRC" → Formulario vacío
- [ ] 3.2: Período TEXT input visible (no select)
- [ ] 3.3: Ingresar período "2024-2025" → Acepta
- [ ] 3.4: Arrastrar test_data_nrc_2026_01.csv → Pre-visualización correcta
- [ ] 3.5: Seleccionar materia, carrera, código NRC → OK
- [ ] 3.6: Tablita de preview con 15 filas → OK
- [ ] 3.7: Click Importar → Éxito
- [ ] 3.8: Toast: "15 estudiantes importados"
- [ ] 3.9: Ir a Gestión NRCs → NRC aparece con status "segmented" (automático)
- [ ] 3.10: Cargar segundo CSV → test_data_nrc_2026_02.csv
- [ ] 3.11: Mismo proceso, 20 estudiantes

### FASE 4: Validaciones de Datos
- [ ] 4.1: Crear CSV con cédula inválida (9 dígitos) → Rechazo
- [ ] 4.2: Crear CSV con cédula inválida (provincia 99) → Rechazo
- [ ] 4.3: Crear CSV con nota > 20 → Rechazo
- [ ] 4.4: Crear CSV con nota < 0 → Rechazo
- [ ] 4.5: Crear CSV sin columna cedula → Rechazo
- [ ] 4.6: Crear CSV sin columna parcial_1 → Rechazo

### FASE 5: Gestión de Encuestas
- [ ] 5.1: Click NRC → Detalles → Ver distribución de grupos
- [ ] 5.2: Botón "Activar encuestas" → Modal/form
- [ ] 5.3: Presionar Activar → 3 encuestas creadas (alto, medio, riesgo)
- [ ] 5.4: Ver sección "Cumplimiento de encuestas"
- [ ] 5.5: 3 grupos visibles (Alto, Promedio, En riesgo)
- [ ] 5.6: Tabla de tokens con badges: Pendiente, Completada, Deshabilitada
- [ ] 5.7: Botón "Cerrar encuesta" por grupo → OK
- [ ] 5.8: Status cambia a "Cerrada" → Tokens muestran "Deshabilitada"
- [ ] 5.9: Botón "Habilitar encuesta" → OK
- [ ] 5.10: Status vuelve a "Activa"

### FASE 6: Dashboard Gráficas
- [ ] 6.1: Dashboard muestra 4 KPIs:
  - [ ] 6.1a: Total NRCs = 2
  - [ ] 6.1b: Total Estudiantes = 35
  - [ ] 6.1c: Encuestas Activas = 6
  - [ ] 6.1d: Análisis Completados = 0 (aún)
- [ ] 6.2: Donut chart: distribución por grupos (suma 35)
- [ ] 6.3: Badge de estados: 2 segmented, 6 surveying
- [ ] 6.4: Tasa análisis = 0%

### FASE 7: Análisis y Reportes
- [ ] 7.1: Botón "Ejecutar análisis" en NRC → OK
- [ ] 7.2: Status cambia a "analyzed"
- [ ] 7.3: Ir a Análisis → Ver resultados agrupados por grupo
- [ ] 7.4: Resultados con badges validados (>60%)
- [ ] 7.5: Prácticas y Barreras listadas
- [ ] 7.6: KPIs de análisis en página
- [ ] 7.7: Click "Ver reportes" → Dashboard reportes
- [ ] 7.8: Tarjeta NRC con:
  - [ ] Distribución gráfica
  - [ ] Prácticas y barreras
  - [ ] Botón "Ver reporte completo"
- [ ] 7.9: Click reporte → Página completa con:
  - [ ] Donut chart
  - [ ] KPIs
  - [ ] Prácticas y barreras detalladas
  - [ ] Desglose por grupo
  - [ ] Botones CSV y PDF
- [ ] 7.10: Click PDF (Ctrl+P) → Puede imprimir/guardar como PDF
- [ ] 7.11: Click CSV → Descarga archivo con recomendaciones

### FASE 8: Responder Encuestas (Público)
- [ ] 8.1: Copiar enlace token de una encuesta
- [ ] 8.2: Abrir en incógnito/privado → Sin login
- [ ] 8.3: Formulario de encuesta visible con preguntas
- [ ] 8.4: Responder todas las preguntas → OK
- [ ] 8.5: Click Enviar → Toast éxito
- [ ] 8.6: Intentar acceder de nuevo → Error "token ya usado"
- [ ] 8.7: Verificar en dashboard de coordinador que respuesta se registró
- [ ] 8.8: Cumplimiento actualizado (ej: 1/5 en grupo alto)

### FASE 9: UX/UI Responsiveness
- [ ] 9.1: Verificar tema dark/light funciona
- [ ] 9.2: Resize ventana a mobile (375px) → OK
- [ ] 9.3: Tabs y navegación funcional en mobile
- [ ] 9.4: Formularios legibles en mobile
- [ ] 9.5: Tablas tienen scroll horizontal en mobile
- [ ] 9.6: Gráficas se adaptan al tamaño

### FASE 10: Errores y Edge Cases
- [ ] 10.1: Intentar cargar NRC sin período → Error
- [ ] 10.2: Intentar cargar NRC sin archivo → Error
- [ ] 10.3: Intentar arrastrar archivo no CSV/Excel → Rechazo
- [ ] 10.4: Código NRC duplicado en segundo archivo → Rechazo
- [ ] 10.5: Usuario coordinador intenta crear usuario → 403
- [ ] 10.6: Usuario coordinador intenta ver /users → 403
- [ ] 10.7: Logout y login de nuevo → OK
- [ ] 10.8: Mensaje "sin reportes" si no hay análisis → OK

---

## 📊 Resultados Esperados

- **Home Page:** Descriptiva, clara, 5 secciones, botones funcionales
- **Usuarios:** CRUD completo, validaciones estrictas, roles asignables
- **Dashboard:** 4 KPIs reales, gráfica donut, estado de NRCs
- **Validaciones:** Cédula ecuatoriana válida, período texto, notas 0-20
- **Pruebas CSV:** 2 archivos listos con datos válidos
- **Flujo completo:** Desde home → login → crear usuario → cargar NRC → encuestas → análisis → reportes

---

## 🚀 Ejecución

```bash
# Terminal 1: Laravel
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2: Vite
npm run dev

# Navegador
http://127.0.0.1:8000/
```

---

## ✨ Notas Importantes

- Todas las cédulas en CSV son **ecuatorianas válidas**
- Todas las notas están en escala **0-20**
- Período se ingresa como **texto libre**
- Validaciones integradas en el backend (GradeImportService + Rule)
- Dashboard con **datos reales** del sistema
- LOPDP: SHA3-256 hashing + UUID anonimizado
