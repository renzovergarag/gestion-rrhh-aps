import { PrismaClient, UserRole, ProfessionalCategory, ContractType, ActivityPillar, HolidayType } from '@prisma/client'

const prisma = new PrismaClient()

const centros = [
  { name: 'CESFAM Dr. Salvador Allende', code: 'CESFAM_001', commune: 'Lo Espejo', region: 'Metropolitana' },
  { name: 'CESFAM Dr. Alejandro del Río', code: 'CESFAM_002', commune: 'Buin', region: 'Metropolitana' },
  { name: 'CESFAM La Pintana', code: 'CESFAM_003', commune: 'La Pintana', region: 'Metropolitana' },
  { name: 'CESFAM Fernando Maffioletti', code: 'CESFAM_004', commune: 'Pudahuel', region: 'Metropolitana' },
  { name: 'CESFAM Dr. Alberto Allende Jones', code: 'CESFAM_005', commune: 'San Ramón', region: 'Metropolitana' },
  { name: 'CESFAM Carol Urzúa', code: 'CESFAM_006', commune: 'La Florida', region: 'Metropolitana' },
  { name: 'CESFAM Padre Hurtado', code: 'CESFAM_007', commune: 'Padre Hurtado', region: 'Metropolitana' },
  { name: 'CESFAM El Roble', code: 'CESFAM_008', commune: 'Lo Prado', region: 'Metropolitana' },
  { name: 'CESFAM Cerro Navia', code: 'CESFAM_009', commune: 'Cerro Navia', region: 'Metropolitana' },
  { name: 'CESFAM Pedro Aguirre Cerda', code: 'CESFAM_010', commune: 'Pedro Aguirre Cerda', region: 'Metropolitana' },
  { name: 'CESFAM Centro Oriente', code: 'CESFAM_011', commune: 'Providencia', region: 'Metropolitana' },
  { name: 'CESFAM La Reina', code: 'CESFAM_012', commune: 'La Reina', region: 'Metropolitana' },
  { name: 'CESFAM Macul', code: 'CESFAM_013', commune: 'Macul', region: 'Metropolitana' },
  { name: 'CESFAM Peñalolén', code: 'CESFAM_014', commune: 'Peñalolén', region: 'Metropolitana' },
  { name: 'CESFAM Quilicura', code: 'CESFAM_015', commune: 'Quilicura', region: 'Metropolitana' },
  { name: 'CESFAM Huechuraba', code: 'CESFAM_016', commune: 'Huechuraba', region: 'Metropolitana' },
  { name: 'CESFAM Conchalí', code: 'CESFAM_017', commune: 'Conchalí', region: 'Metropolitana' },
  { name: 'CESFAM Renca', code: 'CESFAM_018', commune: 'Renca', region: 'Metropolitana' },
  { name: 'CESFAM Quinta Normal', code: 'CESFAM_019', commune: 'Quinta Normal', region: 'Metropolitana' },
  { name: 'CESFAM Estación Central', code: 'CESFAM_020', commune: 'Estación Central', region: 'Metropolitana' },
  { name: 'CESFAM San Joaquín', code: 'CESFAM_021', commune: 'San Joaquín', region: 'Metropolitana' },
  { name: 'CESFAM La Granja', code: 'CESFAM_022', commune: 'La Granja', region: 'Metropolitana' },
  { name: 'CESFAM El Bosque', code: 'CESFAM_023', commune: 'El Bosque', region: 'Metropolitana' },
  { name: 'CESFAM San Bernardo', code: 'CESFAM_024', commune: 'San Bernardo', region: 'Metropolitana' },
  { name: 'CESFAM Melipilla', code: 'CESFAM_025', commune: 'Melipilla', region: 'Metropolitana' },
  { name: 'CESFAM Talagante', code: 'CESFAM_026', commune: 'Talagante', region: 'Metropolitana' },
  { name: 'CESFAM Peñaflor', code: 'CESFAM_027', commune: 'Peñaflor', region: 'Metropolitana' },
  { name: 'CESFAM Lampa', code: 'CESFAM_028', commune: 'Lampa', region: 'Metropolitana' },
  { name: 'CESFAM Colina', code: 'CESFAM_029', commune: 'Colina', region: 'Metropolitana' },
  { name: 'CESFAM Pirque', code: 'CESFAM_030', commune: 'Pirque', region: 'Metropolitana' },
]

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

const feriadosChile2024 = [
  { name: 'Año Nuevo', date: new Date('2024-01-01'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Viernes Santo', date: new Date('2024-03-29'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Sábado Santo', date: new Date('2024-03-30'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Día del Trabajo', date: new Date('2024-05-01'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Día de las Glorias Navales', date: new Date('2024-05-21'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Día de los Pueblos Indígenas', date: new Date('2024-06-20'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'San Pedro y San Pablo', date: new Date('2024-06-29'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Día de la Virgen del Carmen', date: new Date('2024-07-16'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Día del Libertador Bernardo O\'Higgins (traslado)', date: new Date('2024-08-19'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Día de la Unidad Nacional', date: new Date('2024-09-20'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Independencia Nacional', date: new Date('2024-09-18'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Glorias del Ejército', date: new Date('2024-09-19'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Encuentro de Dos Mundos', date: new Date('2024-10-12'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Día de las Iglesias Evangélicas', date: new Date('2024-10-31'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Día de Todos los Santos', date: new Date('2024-11-01'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Inmaculada Concepción', date: new Date('2024-12-08'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
  { name: 'Navidad', date: new Date('2024-12-25'), type: HolidayType.FERIADO_NACIONAL, year: 2024 },
]

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Limpiar datos existentes
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

  // 2. Crear los 30 centros de salud
  const centrosCreados = await Promise.all(
    centros.map(c => prisma.healthCenter.create({ data: c }))
  )
  console.log(`✅ ${centrosCreados.length} centros de salud creados`)

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

  // 4. Crear feriados nacionales 2024
  for (const feriado of feriadosChile2024) {
    await prisma.holiday.create({
      data: { ...feriado, healthCenterId: null },
    })
  }
  console.log(`✅ ${feriadosChile2024.length} feriados nacionales creados`)

  // 5. Crear usuario Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@rrhh-aps.cl',
      name: 'Super Administrador',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      healthCenterId: null,
    },
  })
  console.log(`✅ Super Admin creado: ${superAdmin.email}`)

  // 6. Crear un Admin por cada centro y algunos profesionales de demo
  const primerCentro = centrosCreados[0]

  const adminCentro = await prisma.user.create({
    data: {
      email: 'admin@cesfam001.cl',
      name: 'Administrador CESFAM 001',
      role: UserRole.ADMIN_CENTRO,
      isActive: true,
      healthCenterId: primerCentro.id,
    },
  })
  console.log(`✅ Admin de centro creado: ${adminCentro.email}`)

  // 7. Crear profesionales demo para el primer centro
  const profesionalesDemo = [
    { rut: '12345678-9', firstName: 'María', lastName: 'González López', category: ProfessionalCategory.MEDICO, contractType: ContractType.JORNADA_COMPLETA, weeklyHours: 44 },
    { rut: '23456789-0', firstName: 'Carlos', lastName: 'Ramírez Torres', category: ProfessionalCategory.ENFERMERA, contractType: ContractType.JORNADA_COMPLETA, weeklyHours: 44 },
    { rut: '34567890-1', firstName: 'Ana', lastName: 'Martínez Vega', category: ProfessionalCategory.MATRONA, contractType: ContractType.MEDIA_JORNADA, weeklyHours: 22 },
    { rut: '45678901-2', firstName: 'Luis', lastName: 'Pérez Silva', category: ProfessionalCategory.KINESIOLOGO, contractType: ContractType.JORNADA_COMPLETA, weeklyHours: 44 },
    { rut: '56789012-3', firstName: 'Sofía', lastName: 'Muñoz Castro', category: ProfessionalCategory.PSICOLOGO, contractType: ContractType.TRES_CUARTOS, weeklyHours: 33 },
    { rut: '67890123-4', firstName: 'Pedro', lastName: 'Rojas Herrera', category: ProfessionalCategory.ASISTENTE_SOCIAL, contractType: ContractType.JORNADA_COMPLETA, weeklyHours: 44 },
    { rut: '78901234-5', firstName: 'Carmen', lastName: 'Flores Díaz', category: ProfessionalCategory.NUTRICIONISTA, contractType: ContractType.MEDIA_JORNADA, weeklyHours: 22 },
  ]

  for (const prof of profesionalesDemo) {
    const profesional = await prisma.professional.create({
      data: {
        ...prof,
        startDate: new Date('2022-01-01'),
        isActive: true,
        healthCenterId: primerCentro.id,
      },
    })

    // Crear WorkConfig 2024 para cada profesional
    const theoreticalHoursYear = prof.weeklyHours * 52
    const hoursPerDay = prof.weeklyHours / 5
    const holidayDeduction = feriadosChile2024.length * hoursPerDay
    const vacationDeduction = 15 * hoursPerDay
    const availableHoursYear = theoreticalHoursYear - holidayDeduction - vacationDeduction

    await prisma.workConfig.create({
      data: {
        year: 2024,
        theoreticalHoursYear,
        holidayDays: feriadosChile2024.length,
        adminDays: 3,
        vacationDays: 15,
        sickLeaveDays: 0,
        otherAbsenceDays: 0,
        availableHoursYear,
        availableHoursWeek: availableHoursYear / 52,
        healthCenterId: primerCentro.id,
        professionalId: profesional.id,
      },
    })
  }

  console.log(`✅ ${profesionalesDemo.length} profesionales demo creados con WorkConfig`)

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📋 Credenciales de acceso (después de configurar Google OAuth):')
  console.log('   Super Admin: superadmin@rrhh-aps.cl')
  console.log('   Admin Centro: admin@cesfam001.cl')
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
