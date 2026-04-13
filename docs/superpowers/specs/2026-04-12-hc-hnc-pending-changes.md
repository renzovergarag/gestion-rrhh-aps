# HC/HNC Calculator - Cambios Pendientes

**Fecha:** 2026-04-12
**Última actualización:** 2026-04-12

---

## Resumen General

| Fase | Completado | Pendiente |
|------|-----------|-----------|
| Fase 1: Fundamentos | ~95% | Formularios CRUD (editar profesional, editar actividad) |
| Fase 2: Motor de Encuestas | ~50% | Formularios, validación UI, autocompletado |
| Fase 3: Dashboard | ~65% | Dashboard global con gráficos |
| Fase 4: Optimización | ~40% | Optimización de fórmulas y queries |

---

## Fase 1: Fundamentos (Auth + Centros + Profesionales)

### Implementado ✅
- [x] Login con email/password
- [x] Registro de usuarios
- [x] Middleware de protección de rutas (RBAC)
- [x] CRUD HealthCenter
- [x] CRUD Professional
- [x] Calculadora de disponibilidad teórica
- [x] Seed con 52 centros, usuarios y profesionales de prueba

### Pendiente
- [ ] Formulario de editar profesional (`/admin/centro/profesionales/[id]`)
- [ ] Formulario de crear profesional (`/admin/centro/profesionales/nuevo`)
- [ ] Formulario de editar actividad (`/admin/centro/actividades/[id]`)
- [ ] Formulario de crear actividad (`/admin/centro/actividades/nueva`)

---

## Fase 2: Motor de Encuestas

### Implementado ✅
- [x] CRUD Activities en server actions
- [x] Estados DRAFT/SUBMITTED en schema
- [x] Server action `submitSurveyAction()`

### Pendiente ❌
- [ ] **Formulario de nueva encuesta** (`/admin/centro/encuestas/nueva`)
  - Selector de profesional
  - Selector de semana (año-semana)
  - Lista de actividades con campos de horas
  - Validación en vivo: barra de progreso + mensaje de error si excede jornada
  - Botón guardar (draft) y enviar (submit)

- [ ] **Formulario de editar encuesta** (`/admin/centro/encuestas/[id]`)
  - Carga de entradas existentes
  - Edición de horas
  - Cambio de estado DRAFT → SUBMITTED

- [ ] **Autocompletado de actividades** según perfil/categoría del profesional
- [ ] **Validación UI en tiempo real** (actualmente solo valida en server)

---

## Fase 3: Consolidación y Dashboard

### Implementado ✅
- [x] Función de consolidación HC/HNC (`calculateHNC_HC()` en utils.ts)
- [x] Dashboard Admin Centro (`/admin/centro`) con resumen básico
- [x] Vista Profesional (`/profesional`) con disponibilidad personal

### Pendiente
- [ ] Dashboard global completo (`/admin/global`)
  - Gráficos comparativos entre centros
  - Tabla: Centro | Total Profesionales | % Cumplimiento Promedio | HC Promedio
  - Filtro por centro

- [ ] Dashboard Admin Centro mejorado
  - Tablas resumen con datos reales
  - % cumplimiento HNC/HC por profesional

---

## Fase 4: Optimización (Opcional)

### Implementado ✅
- [x] Índices en healthCenterId, userId, rut, etc.

### Pendiente
- [ ] Optimizar fórmulas y queries (caché/memoización)
- [ ] Considerar materialized views para consolidación

---

## Casos Edge Pendientes de Validar

1. **Encuesta duplicada:** Implementado en server action, falta validar en UI
2. **Horas negativas:** Validación existe, probar en formulario
3. **Horas excesivas:** Validación existe en server, falta barra de progreso en UI
4. **Profesional sin usuario:** Flujo existe, falta probar
5. **Centro sin profesionales:** Estado vacío existe, no error
6. **Semana futura:** Permitido, validar funcionamiento

---

## Próximos Pasos Recomendados

### Prioridad 1 (Crítico - Flujo principal)
1. Crear formulario de encuesta (`/admin/centro/encuestas/nueva`)
2. Crear página de edición de encuesta (`/admin/centro/encuestas/[id]`)
3. Implementar validación UI en tiempo real (barra de progreso)

### Prioridad 2 (Importante - CRUD)
4. Crear formularios CRUD para profesionales
5. Crear formularios CRUD para actividades

### Prioridad 3 (Mejora)
6. Dashboard global con gráficos
7. Dashboard local mejorado con datos reales

---

## Notas Técnicas

- El seed incluye 52 centros, 3 usuarios de prueba y profesionales de ejemplo
- La función `calculateAvailableHours()` ya calcula disponibilidad teórica
- La función `calculateHNC_HC()` ya calcula consolidación
- Server actions para CRUD están en `src/actions/index.ts`
- Validaciones Zod en `src/lib/validations.ts`
