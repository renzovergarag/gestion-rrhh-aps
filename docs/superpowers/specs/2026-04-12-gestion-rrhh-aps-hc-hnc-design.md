# GestionRRHH APS - HC/HNC Calculator
**Fecha:** 2026-04-12
**Versión:** 1.0

---

## 1. Concepto y Visión

Sistema multi-tenant para 30 centros de salud APS que centraliza el cálculo de Horas Clínicas (HC) vs Horas No Clínicas (HNC). Migración desde Google Sheets a una aplicación web profesional con autenticación, formularios dinámicos y dashboards de cumplimiento. Interfaz limpia y funcional, priorizando la velocidad de captura y validación en tiempo real.

---

## 2. Diseño de Arquitectura

### 2.1 Stack Técnico
- **Framework:** Next.js 15 (App Router)
- **Estilos:** Tailwind CSS
- **Base de Datos:** MySQL 8.0 (local) con Prisma ORM
- **Auth:** NextAuth.js con credenciales (email/password) - OAuth posterior
- **Validación:** Zod
- **Mutaciones:** Server Actions

### 2.2 Modelo de Datos

```
HealthCenter (centro de salud)
├── id (PK)
├── name (ej: "CESFAM BARON")
├── code (ej: "CESFAM_BARON")
├── createdAt
└── updatedAt

User (usuarios del sistema)
├── id (PK)
├── email (único)
├── password (hash bcrypt)
├── name
├── role (SUPER_ADMIN | ADMIN_CENTRO | PROFESIONAL)
├── healthCenterId (FK, nullable para SUPER_ADMIN)
├── createdAt
└── updatedAt

Professional (funcionarios/profesionales)
├── id (PK)
├── healthCenterId (FK)
├── userId (FK, nullable - algunos profesionales no acceden al sistema)
├── name
├── rut
├── position (cargo)
├── category (CAT_A | CAT_B | CAT_C | CAT_D)
├── weeklyHours (44 | 33 | 22 | horas contratadas)
├── isActive (boolean)
├── createdAt
└── updatedAt

Activity (catálogo de actividades)
├── id (PK)
├── healthCenterId (FK)
├── code (GES_001, REU_001, DER_001)
├── type (GESTION | REUNION | DERECHO)
├── name
├── weeklyHours (tiempo estándar)
├── criteria (rangos, ej: "22 a 44")
├── appliesTo (cargos que aplican, JSON array)
├── isRequired (boolean)
├── isActive (boolean)
├── createdAt
└── updatedAt

Survey (encuesta semanal por profesional)
├── id (PK)
├── healthCenterId (FK)
├── professionalId (FK)
├── year (int)
├── week (int)
├── status (DRAFT | SUBMITTED)
├── createdAt
└── updatedAt

SurveyEntry (entrada de tiempo por actividad)
├── id (PK)
├── surveyId (FK)
├── activityId (FK)
├── hours (decimal)
├── createdAt
└── updatedAt

Absence (ausencias legales)
├── id (PK)
├── healthCenterId (FK)
├── year (int)
├── type (HOLIDAY | ADMIN_DAY | TRAINING)
├── date
├── description
├── createdAt
└── updatedAt
```

### 2.3 Relaciones entre tablas

- Todo registro en `Professional`, `Activity`, `Survey`, `SurveyEntry`, `Absence` tiene `healthCenterId` para aislamiento.
- `User.healthCenterId` es NULL para SUPER_ADMIN, FK para ADMIN_CENTRO.
- `Professional.userId` puede ser NULL (profesionales sin acceso).

### 2.4 Fórmulas de negocio (derivadas de Excel)

```
Días Disponibles = JORNADA - (Días Admin + Días Feriado + Días Capacitación)
Horas Disponibles Año = Días Disponibles × 8.8 (factor de conversión)

HNC (semanal) = Σ horas registradas en SurveyEntry
HC (semanal) = JORNADA - HNC (semanal)

Validación: HNC ≤ JORNADA (error si excede)
```

---

## 3. Modelo de Acceso (RBAC)

| Rol | Alcance | Permisos |
|-----|---------|----------|
| SUPER_ADMIN | Global (todos los centros) | CRUD centros, usuarios, profesionales. Ver dashboards globales. |
| ADMIN_CENTRO | Solo su centro | CRUD profesionales, actividades, encuestas de su centro. Ver dashboard local. |
| PROFESIONAL | Solo su perfil | Ver disponibilidad personal. |
| (sin rol de Admin Global - se unifica en SUPER_ADMIN) | |

### Rutas protegidas
- `/admin/global/*` - Solo SUPER_ADMIN
- `/admin/centro/*` - SUPER_ADMIN o ADMIN_CENTRO (filtrado por centro)
- `/profesional/*` - Cualquier usuario autenticado (misma vista)

---

## 4. Funcionalidades por Fase

### Fase 1: Fundamentos (Auth + Centros + Profesionales)
- [ ] Pantalla de login/registro con email/password
- [ ] Middleware de protección de rutas
- [ ] CRUD HealthCenter (solo SUPER_ADMIN)
- [ ] CRUD Professional vinculado a centro
- [ ] Calculadora de disponibilidad teórica (anual/semanal)
- [ ] Seed de los 45 centros y usuarios de prueba

### Fase 2: Motor de Encuestas
- [ ] CRUD Activities (catálogo por centro)
- [ ] Formulario dinámico de encuesta semanal
- [ ] Autocompletado de actividades según perfil del profesional
- [ ] Validación en tiempo real: no exceder jornada contratada
- [ ] Estados: DRAFT → SUBMITTED

### Fase 3: Consolidación y Dashboard
- [ ] Función de consolidación HC/HNC por profesional/semana
- [ ] Dashboard local (ADMIN_CENTRO): tablas resumen, % cumplimiento
- [ ] Dashboard global (SUPER_ADMIN): comparativa entre 30 centros

### Fase 4: Backend - Optimización (opcional)
- [ ] Optimizar fórmulas y queries
- [ ] Índices en healthCenterId

---

## 5. Diseño de UI (texto)

### Login
- Email + contraseña
- Botón "Iniciar sesión"
- Mensaje de error inline

### Dashboard Admin Centro
- Header: nombre del centro, cerrar sesión
- Sidebar: Profesionales | Encuestas | Dashboard
- Tabla de profesionales con columnas: Nombre, Cargo, Categoría, Horas Contrato, Acciones
- Botón "Nueva Encuesta" abre formulario

### Formulario de Encuesta
- Selector de profesional
- Selector de semana (año-semana)
- Lista de actividades con campos de horas
- Validación en vivo: barra de progreso + mensaje de error si excede
- Botón guardar (draft) y enviar (submit)

### Dashboard Global (SUPER_ADMIN)
- Filtro por centro (dropdown)
- Tabla comparativa: Centro | Total Profesionales | % Cumplimiento Promedio | HC Promedio
- Gráficos simples (barras) de ocupación

### Vista Profesional
- Solo consulta: disponibilidad personal (horas teóricas disponibles)
- Sin capacidades de edición

---

## 6. Casos Edge y Validaciones

1. **Encuesta duplicada:** No permitir crear 2 encuestas para mismo profesional + semana
2. **Horas negativas:** No permitir valores < 0
3. **Horas excesivas:** Validar que Σ activities ≤ jornada, mostrar error claro
4. **Profesional sin usuario:** ADMIN_CENTRO puede crear encuestas en nombre del profesional
5. **Centro sin profesionales:** Mostrar estado vacío, no error
6. **Semana future:** Permitir encuestas para semanas futuras (planificación)

---

## 7. Stack de Implementación

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "next-auth": "5.x",
    "@prisma/client": "6.x",
    "bcryptjs": "2.x",
    "zod": "3.x",
    "@hookform/resolvers": "4.x",
    "react-hook-form": "7.x",
    "tailwindcss": "4.x",
    "lucide-react": "latest",
    "date-fns": "latest"
  }
}
```

---

## 8. Estructura de Carpetas

```
app-src/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (admin)/
│   │   │   ├── global/        # SUPER_ADMIN only
│   │   │   ├── centro/        # ADMIN_CENTRO
│   │   │   └── layout.tsx
│   │   ├── (profesional)/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/               # shadcn-like components
│   │   ├── forms/
│   │   └── dashboards/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── validations.ts    # Zod schemas
│   │   └── utils.ts
│   ├── actions/              # Server Actions
│   ├── types/
│   └── hooks/
├── middleware.ts
├── tailwind.config.ts
└── package.json
```

---

## 9. Datos de Prueba (Seed)

### Health Centers (45)
```
CECOSF CERRO ALEGRE, CECOSF ISLA NEGRA, ..., HOSPITAL SAN JOSÉ DE CASABLANCA, ...
```

### Users de prueba
```
renzovergarag@gmail.com - SUPER_ADMIN
gestiondelainformacion@cmvalparaiso.cl - ADMIN_CENTRO (CESFAM BARON)
rvergara@cmvalparaiso.cl - PROFESIONAL
```

### Connection string
```
mysql://user_local@127.0.0.1:3306/gestion_rrhh_aps
```

---

## 10. Criteria de Éxito

- [ ] SUPER_ADMIN puede ver y gestionar los 45 centros
- [ ] ADMIN_CENTRO solo ve datos de su centro (aislamiento verificado)
- [ ] Profesional solo ve su disponibilidad
- [ ] Encuesta valida en tiempo real que HNC ≤ jornada
- [ ] Dashboard muestra % HNC/HC correctos
- [ ] Aplicación responsive y funcional en móvil