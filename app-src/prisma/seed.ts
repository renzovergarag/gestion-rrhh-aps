import { PrismaClient, UserRole, ProfessionalCategory, ContractType, ActivityPillar, HolidayType } from '@prisma/client'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────
// CENTROS DE SALUD REALES (CM Valparaíso)
// ─────────────────────────────────────────────
const centros = [
  { name: 'CECOSF CERRO ALEGRE', code: 'CECOSF_001', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CECOSF ISLA NEGRA', code: 'CECOSF_002', commune: 'El Quisco', region: 'Valparaíso' },
  { name: 'CECOSF JUAN PABLO II', code: 'CECOSF_003', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CECOSF LAGUNA VERDE', code: 'CECOSF_004', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CECOSF LAS CRUCES', code: 'CECOSF_005', commune: 'El Tabo', region: 'Valparaíso' },
  { name: 'CECOSF LO GALLARDO', code: 'CECOSF_006', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CECOSF PORVENIR BAJO', code: 'CECOSF_007', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CECOSF SAN SABASTIAN', code: 'CECOSF_008', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CECOSF TEJAS VERDES', code: 'CECOSF_009', commune: 'San Antonio', region: 'Valparaíso' },
  { name: 'CESFAM 30 DE MARZO', code: 'CESFAM_001', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM ALGARROBO', code: 'CESFAM_002', commune: 'Algarrobo', region: 'Valparaíso' },
  { name: 'CESFAM BARON', code: 'CESFAM_003', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM BARRANCAS', code: 'CESFAM_004', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM CARTAGENA', code: 'CESFAM_005', commune: 'Cartagena', region: 'Valparaíso' },
  { name: 'CESFAM CORDILLERA', code: 'CESFAM_006', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM DIPUTADO MANUEL BUSTOS', code: 'CESFAM_007', commune: 'Viña del Mar', region: 'Valparaíso' },
  { name: 'CESFAM DR. NÉSTOR FERNÁNDEZ', code: 'CESFAM_008', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM EL QUISCO', code: 'CESFAM_009', commune: 'El Quisco', region: 'Valparaíso' },
  { name: 'CESFAM EL TABO', code: 'CESFAM_010', commune: 'El Tabo', region: 'Valparaíso' },
  { name: 'CESFAM ESPERANZA', code: 'CESFAM_011', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM JEAN Y MARIE THIERRY', code: 'CESFAM_012', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM JUAN FERNÁNDEZ', code: 'CESFAM_013', commune: 'Juan Fernández', region: 'Valparaíso' },
  { name: 'CESFAM LAS CAÑAS', code: 'CESFAM_014', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM MENA', code: 'CESFAM_015', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM NAVIDAD', code: 'CESFAM_016', commune: 'Navidad', region: 'Valparaíso' },
  { name: 'CESFAM PADRE DAMIAN', code: 'CESFAM_017', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM PLACERES', code: 'CESFAM_018', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM PLACILLA', code: 'CESFAM_019', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM PLAZA JUSTICIA', code: 'CESFAM_020', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM PUERTAS NEGRAS', code: 'CESFAM_021', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM QUEBRADA VERDE', code: 'CESFAM_022', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM REINA ISABEL II', code: 'CESFAM_023', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM RODELILLO', code: 'CESFAM_024', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CESFAM SAN ANTONIO', code: 'CESFAM_025', commune: 'San Antonio', region: 'Valparaíso' },
  { name: 'CESFAM SANTO DOMINGO', code: 'CESFAM_026', commune: 'Santo Domingo', region: 'Valparaíso' },
  { name: 'CLINICA MOVIL CARTAGENA', code: 'CMOVIL_001', commune: 'Cartagena', region: 'Valparaíso' },
  { name: 'CLINICA MOVIL CMV 1', code: 'CMOVIL_002', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CLINICA MOVIL CMV 2', code: 'CMOVIL_003', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'CLINICA MOVIL QUISCO', code: 'CMOVIL_004', commune: 'El Quisco', region: 'Valparaíso' },
  { name: 'CLINICA MOVIL SSVSA', code: 'CMOVIL_005', commune: 'Valparaíso', region: 'Valparaíso' },
  { name: 'HOSPITAL SAN JOSÉ DE CASABLANCA', code: 'HOSP_001', commune: 'Casablanca', region: 'Valparaíso' },
  { name: 'PSR PUPUYA', code: 'PSR_001', commune: 'Navidad', region: 'Valparaíso' },
  { name: 'PSR RAPEL (NAVIDAD)', code: 'PSR_002', commune: 'Navidad', region: 'Valparaíso' },
  { name: 'PSR SAN VICENTE DE PUCALÁN', code: 'PSR_003', commune: 'Cartagena', region: 'Valparaíso' },
  { name: 'PSR(S) ALGARROBO ( EL YECO , SAN JOSÉ)', code: 'PSR_004', commune: 'Algarrobo', region: 'Valparaíso' },
  { name: 'PSR(S) CARTAGENA (LO ZARATE, LO ABARCA, EL TURCO)', code: 'PSR_005', commune: 'Cartagena', region: 'Valparaíso' },
  { name: 'PSR(S) CASABLANCA (QUINTAY, LAS DICHAS, LOS MAITENES, LAGUNILLAS)', code: 'PSR_006', commune: 'Casablanca', region: 'Valparaíso' },
  { name: 'PSR(S) SAN ANTONIO (EL ASILO, CUNCUMEN, SAN JUAN, LEYDA)', code: 'PSR_007', commune: 'San Antonio', region: 'Valparaíso' },
  { name: 'PSR(S) SANTO DOMINGO (BUCALEMU,EL CONVENTO, SAN ENRIQUE)', code: 'PSR_008', commune: 'Santo Domingo', region: 'Valparaíso' },
]

// ─────────────────────────────────────────────
// CATÁLOGO BASE DE ACTIVIDADES
// ─────────────────────────────────────────────
const actividadesBase = [
  // GESTIÓN
  { name: 'Atención de Usuarios (No Presencial)', code: 'GES_001', pillar: ActivityPillar.GESTION, description: 'Llamadas, correos, atención telefónica', isObligatory: false, order: 1, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL'] },
  { name: 'Gestión Administrativa', code: 'GES_002', pillar: ActivityPillar.GESTION, description: 'Informes, reportes, documentación', isObligatory: false, order: 2, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL', 'ADMINISTRATIVO'] },
  { name: 'Supervisión y Coordinación de Equipo', code: 'GES_003', pillar: ActivityPillar.GESTION, description: 'Liderazgo de equipo clínico', isObligatory: false, order: 3, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA'] },
  { name: 'Gestión de Redes Asistenciales', code: 'GES_004', pillar: ActivityPillar.GESTION, description: 'Derivaciones, interconsultas', isObligatory: false, order: 4, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO'] },
  { name: 'Actividades de Docencia', code: 'GES_005', pillar: ActivityPillar.GESTION, description: 'Formación, tutoría de estudiantes', isObligatory: false, order: 5, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO'] },
  { name: 'Capacitación Recibida', code: 'GES_006', pillar: ActivityPillar.GESTION, description: 'Cursos, talleres, formaciones', isObligatory: false, order: 6, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL'] },
  { name: 'Trabajo en Terreno / Visitas Domiciliarias', code: 'GES_007', pillar: ActivityPillar.GESTION, description: 'Visitas a domicilio y terreno comunitario', isObligatory: false, order: 7, applicableCategories: ['ENFERMERA', 'MATRONA', 'PSICOLOGO', 'ASISTENTE_SOCIAL', 'NUTRICIONISTA'] },

  // REUNIONES
  { name: 'Reunión de Equipo', code: 'REU_001', pillar: ActivityPillar.REUNION, description: 'Reunión general del equipo del centro', isObligatory: true, order: 1, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL', 'TENS', 'ADMINISTRATIVO'] },
  { name: 'Reunión de Sector', code: 'REU_002', pillar: ActivityPillar.REUNION, description: 'Reunión por sector o unidad', isObligatory: false, order: 2, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL'] },
  { name: 'Reunión Clínica / Caso Clínico', code: 'REU_003', pillar: ActivityPillar.REUNION, description: 'Análisis de casos clínicos', isObligatory: false, order: 3, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO'] },
  { name: 'Reunión de Gestión / Directiva', code: 'REU_004', pillar: ActivityPillar.REUNION, description: 'Reuniones con dirección del centro', isObligatory: false, order: 4, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA'] },
  { name: 'Reunión Intersectorial', code: 'REU_005', pillar: ActivityPillar.REUNION, description: 'Coordinación con otros servicios o instancias', isObligatory: false, order: 5, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'ASISTENTE_SOCIAL'] },

  // DERECHOS / HNC LEGALES
  { name: 'Permiso Administrativo (Ley 18.834)', code: 'DER_001', pillar: ActivityPillar.DERECHO, description: 'Días administrativos por ley', isObligatory: false, order: 1, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL', 'TENS', 'ADMINISTRATIVO'] },
  { name: 'Licencia Médica', code: 'DER_002', pillar: ActivityPillar.DERECHO, description: 'Ausencias por licencia médica', isObligatory: false, order: 2, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL', 'TENS', 'ADMINISTRATIVO'] },
  { name: 'Feriado Legal', code: 'DER_003', pillar: ActivityPillar.DERECHO, description: 'Días feriados nacionales y regionales', isObligatory: false, order: 3, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL', 'TENS', 'ADMINISTRATIVO'] },
  { name: 'Vacaciones Anuales', code: 'DER_004', pillar: ActivityPillar.DERECHO, description: 'Período de vacaciones anuales', isObligatory: false, order: 4, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL', 'TENS', 'ADMINISTRATIVO'] },
  { name: 'Permiso por Maternidad/Paternidad', code: 'DER_005', pillar: ActivityPillar.DERECHO, description: 'Pre y postnatal', isObligatory: false, order: 5, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA', 'KINESIOLOGO', 'PSICOLOGO', 'NUTRICIONISTA', 'ASISTENTE_SOCIAL', 'TENS', 'ADMINISTRATIVO'] },
  { name: 'Comisión de Servicio', code: 'DER_006', pillar: ActivityPillar.DERECHO, description: 'Representación oficial fuera del centro', isObligatory: false, order: 6, applicableCategories: ['MEDICO', 'ENFERMERA', 'MATRONA'] },
]

// ─────────────────────────────────────────────
// FERIADOS NACIONALES CHILE 2025
// ─────────────────────────────────────────────
const feriadosChile2025 = [
  { name: 'Año Nuevo', date: new Date('2025-01-01'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Viernes Santo', date: new Date('2025-04-18'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Sábado Santo', date: new Date('2025-04-19'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Día del Trabajo', date: new Date('2025-05-01'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Día de las Glorias Navales', date: new Date('2025-05-21'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Día de los Pueblos Indígenas', date: new Date('2025-06-20'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'San Pedro y San Pablo', date: new Date('2025-06-29'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Día de la Virgen del Carmen', date: new Date('2025-07-16'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Asunción de la Virgen', date: new Date('2025-08-15'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Independencia Nacional', date: new Date('2025-09-18'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Glorias del Ejército', date: new Date('2025-09-19'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Encuentro de Dos Mundos', date: new Date('2025-10-13'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Día de las Iglesias Evangélicas', date: new Date('2025-10-31'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Día de Todos los Santos', date: new Date('2025-11-01'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Inmaculada Concepción', date: new Date('2025-12-08'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
  { name: 'Navidad', date: new Date('2025-12-25'), type: HolidayType.FERIADO_NACIONAL, year: 2025 },
]

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Limpiar datos en orden correcto (FK constraints)
  await prisma.surveyItem.deleteMany()
  await prisma.survey.deleteMany()
  await prisma.consolidationReport.deleteMany()
  await prisma.meetingParticipant.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.workConfig.deleteMany()
  await prisma.holiday.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.healthCenter.deleteMany()

  console.log('✅ Datos anteriores eliminados')

  // 2. Crear los 49 centros de salud reales
  const centrosCreados = await Promise.all(
    centros.map(c => prisma.healthCenter.create({ data: c }))
  )
  console.log(`✅ ${centrosCreados.length} centros de salud creados`)

  // Encontrar CESFAM ESPERANZA para los usuarios de prueba
  const cesfamEsperanza = centrosCreados.find(c => c.code === 'CESFAM_011')!
  console.log(`  → CESFAM ESPERANZA id: ${cesfamEsperanza.id}`)

  // 3. Crear actividades base globales (healthCenterId = null)
  for (const act of actividadesBase) {
    await prisma.activity.create({
      data: {
        name: act.name,
        code: act.code,
        pillar: act.pillar,
        description: act.description,
        isObligatory: act.isObligatory,
        order: act.order,
        applicableCategories: act.applicableCategories,
        healthCenterId: null,
      },
    })
  }
  console.log(`✅ ${actividadesBase.length} actividades base creadas`)

  // 4. Crear feriados nacionales 2025
  for (const feriado of feriadosChile2025) {
    await prisma.holiday.create({
      data: { ...feriado, healthCenterId: null },
    })
  }
  console.log(`✅ ${feriadosChile2025.length} feriados nacionales 2025 creados`)

  // 5. Crear usuario Super Admin (gestiondelainformacion@cmvalparaiso.cl)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'gestiondelainformacion@cmvalparaiso.cl',
      name: 'Gestión de la Información',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      healthCenterId: null,
    },
  })
  console.log(`✅ Super Admin creado: ${superAdmin.email}`)

  // 6. Crear Admin de Centro (rvergara@cmvalparaiso.cl) → CESFAM ESPERANZA
  const adminCentro = await prisma.user.create({
    data: {
      email: 'rvergara@cmvalparaiso.cl',
      name: 'R. Vergara',
      role: UserRole.ADMIN_CENTRO,
      isActive: true,
      healthCenterId: cesfamEsperanza.id,
    },
  })
  console.log(`✅ Admin de Centro creado: ${adminCentro.email} (CESFAM ESPERANZA)`)

  // 7. Crear Profesional demo (renzovergarag@gmail.com) → CESFAM ESPERANZA
  const profesionalUser = await prisma.user.create({
    data: {
      email: 'renzovergarag@gmail.com',
      name: 'Renzo Vergara',
      role: UserRole.PROFESIONAL,
      isActive: true,
      healthCenterId: cesfamEsperanza.id,
    },
  })
  console.log(`✅ Profesional creado: ${profesionalUser.email}`)

  // 8. Crear perfil profesional vinculado al usuario profesional
  const year = new Date().getFullYear()
  const profesional = await prisma.professional.create({
    data: {
      rut: '18000000-0',
      firstName: 'Renzo',
      lastName: 'Vergara González',
      category: ProfessionalCategory.MEDICO,
      contractType: ContractType.JORNADA_COMPLETA,
      weeklyHours: 44,
      startDate: new Date('2020-01-01'),
      isActive: true,
      healthCenterId: cesfamEsperanza.id,
      userId: profesionalUser.id,
    },
  })
  console.log(`✅ Perfil profesional vinculado a ${profesionalUser.email}`)

  // 9. Crear WorkConfig 2025 para el profesional demo
  const horasXDia = profesional.weeklyHours / 5
  const deducFeriados = feriadosChile2025.length * horasXDia
  const deducVacaciones = 15 * horasXDia
  const deducAdmin = 3 * horasXDia
  const availableHoursYear = (profesional.weeklyHours * 52) - deducFeriados - deducVacaciones - deducAdmin

  await prisma.workConfig.create({
    data: {
      year,
      theoreticalHoursYear: profesional.weeklyHours * 52,
      holidayDays: feriadosChile2025.length,
      adminDays: 3,
      vacationDays: 15,
      sickLeaveDays: 0,
      otherAbsenceDays: 0,
      availableHoursYear,
      availableHoursWeek: availableHoursYear / 52,
      healthCenterId: cesfamEsperanza.id,
      professionalId: profesional.id,
    },
  })
  console.log(`✅ WorkConfig ${year} creado para el profesional demo`)

  // 10. Crear algunos profesionales adicionales en CESFAM ESPERANZA para visualización
  const profesionalesDemo = [
    { rut: '12345678-9', firstName: 'María', lastName: 'González López', category: ProfessionalCategory.ENFERMERA, contractType: ContractType.JORNADA_COMPLETA, weeklyHours: 44 },
    { rut: '23456789-0', firstName: 'Carlos', lastName: 'Ramírez Torres', category: ProfessionalCategory.MATRONA, contractType: ContractType.MEDIA_JORNADA, weeklyHours: 22 },
    { rut: '34567890-1', firstName: 'Ana', lastName: 'Martínez Vega', category: ProfessionalCategory.KINESIOLOGO, contractType: ContractType.TRES_CUARTOS, weeklyHours: 33 },
    { rut: '45678901-2', firstName: 'Luis', lastName: 'Pérez Silva', category: ProfessionalCategory.PSICOLOGO, contractType: ContractType.JORNADA_COMPLETA, weeklyHours: 44 },
    { rut: '56789012-3', firstName: 'Sofía', lastName: 'Muñoz Castro', category: ProfessionalCategory.NUTRICIONISTA, contractType: ContractType.MEDIA_JORNADA, weeklyHours: 22 },
    { rut: '67890123-4', firstName: 'Pedro', lastName: 'Rojas Herrera', category: ProfessionalCategory.ASISTENTE_SOCIAL, contractType: ContractType.JORNADA_COMPLETA, weeklyHours: 44 },
  ]

  for (const prof of profesionalesDemo) {
    const p = await prisma.professional.create({
      data: {
        ...prof,
        startDate: new Date('2022-03-01'),
        isActive: true,
        healthCenterId: cesfamEsperanza.id,
      },
    })

    const hXd = p.weeklyHours / 5
    const avYear = (p.weeklyHours * 52) - (feriadosChile2025.length * hXd) - (15 * hXd) - (3 * hXd)
    await prisma.workConfig.create({
      data: {
        year,
        theoreticalHoursYear: p.weeklyHours * 52,
        holidayDays: feriadosChile2025.length,
        adminDays: 3,
        vacationDays: 15,
        sickLeaveDays: 0,
        otherAbsenceDays: 0,
        availableHoursYear: avYear,
        availableHoursWeek: avYear / 52,
        healthCenterId: cesfamEsperanza.id,
        professionalId: p.id,
      },
    })
  }
  console.log(`✅ ${profesionalesDemo.length} profesionales adicionales creados en CESFAM ESPERANZA`)

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📋 Usuarios de prueba (deben iniciar sesión con Google OAuth):')
  console.log('   Super Admin:    gestiondelainformacion@cmvalparaiso.cl')
  console.log('   Admin Centro:   rvergara@cmvalparaiso.cl (CESFAM ESPERANZA)')
  console.log('   Profesional:    renzovergarag@gmail.com (CESFAM ESPERANZA)')
  console.log(`\n📊 Total centros de salud: ${centrosCreados.length}`)
  console.log(`📊 Total actividades base: ${actividadesBase.length}`)
  console.log(`📅 Feriados 2025: ${feriadosChile2025.length}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
