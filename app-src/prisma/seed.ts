import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const healthCenters = [
    { name: "CECOSF CERRO ALEGRE", code: "CECOSF_CERRO_ALEGRE" },
    { name: "CECOSF ISLA NEGRA", code: "CECOSF_ISLA_NEGRA" },
    { name: "CECOSF JUAN PABLO II", code: "CECOSF_JPABLO_II" },
    { name: "CECOSF LAGUNA VERDE", code: "CECOSF_LAGUNA_VERDE" },
    { name: "CECOSF LAS CRUCES", code: "CECOSF_LAS_CRUCES" },
    { name: "CECOSF LO GALLARDO", code: "CECOSF_LO_GALLARDO" },
    { name: "CECOSF PORVENIR BAJO", code: "CECOSF_PORVENIR_BAJO" },
    { name: "CECOSF SAN SABASTIAN", code: "CECOSF_SAN_SABASTIAN" },
    { name: "CECOSF TEJAS VERDES", code: "CECOSF_TEJAS_VERDES" },
    { name: "CESFAM 30 DE MARZO", code: "CESFAM_30_DE_MARZO" },
    { name: "CESFAM ALGARROBO", code: "CESFAM_ALGARROBO" },
    { name: "CESFAM BARON", code: "CESFAM_BARON" },
    { name: "CESFAM BARRANCAS", code: "CESFAM_BARRANCAS" },
    { name: "CESFAM CARTAGENA", code: "CESFAM_CARTAGENA" },
    { name: "CESFAM CORDILLERA", code: "CESFAM_CORDILLERA" },
    { name: "CESFAM DIPUTADO MANUEL BUSTOS", code: "CESFAM_Diputado_BUSTOS" },
    { name: "CESFAM DR. NÉSTOR FERNÁNDEZ", code: "CESFAM_Dr_NESTOR_FERNANDEZ" },
    { name: "CESFAM EL QUISCO", code: "CESFAM_EL_QUISCO" },
    { name: "CESFAM EL TABO", code: "CESFAM_EL_TABO" },
    { name: "CESFAM ESPERANZA", code: "CESFAM_ESPERANZA" },
    { name: "CESFAM JEAN Y MARIE THIERRY", code: "CESFAM_JEAN_Y_MARIE" },
    { name: "CESFAM JUAN FERNÁNDEZ", code: "CESFAM_JPABLO_FERNANDEZ" },
    { name: "CESFAM LAS CAÑAS", code: "CESFAM_LAS_CANAS" },
    { name: "CESFAM MENA", code: "CESFAM_MENA" },
    { name: "CESFAM NAVIDAD", code: "CESFAM_NAVIDAD" },
    { name: "CESFAM PADRE DAMIAN", code: "CESFAM_PADRE_DAMIAN" },
    { name: "CESFAM PLACERES", code: "CESFAM_PLACERES" },
    { name: "CESFAM PLACILLA", code: "CESFAM_PLACILLA" },
    { name: "CESFAM PLAZA JUSTICIA", code: "CESFAM_PLAZA_JUSTICIA" },
    { name: "CESFAM PUERTAS NEGRAS", code: "CESFAM_PUERTAS_NEGRAS" },
    { name: "CESFAM QUEBRADA VERDE", code: "CESFAM_QUEBRADA_VERDE" },
    { name: "CESFAM REINA ISABEL II", code: "CESFAM_REINA_ISABEL_II" },
    { name: "CESFAM RODELILLO", code: "CESFAM_RODELILLO" },
    { name: "CESFAM SAN ANTONIO", code: "CESFAM_SAN_ANTONIO" },
    { name: "CESFAM SANTO DOMINGO", code: "CESFAM_SANTO_DOMINGO" },
    { name: "CLINICA MOVIL CARTAGENA", code: "CLINICA_MOVIL_CARTAGENA" },
    { name: "CLINICA MOVIL CMV 1", code: "CLINICA_MOVIL_CMV_1" },
    { name: "CLINICA MOVIL CMV 2", code: "CLINICA_MOVIL_CMV_2" },
    { name: "CLINICA MOVIL QUISCO", code: "CLINICA_MOVIL_QUISCO" },
    { name: "CLINICA MOVIL SSVSA", code: "CLINICA_MOVIL_SSVSA" },
    {
        name: "HOSPITAL SAN JOSÉ DE CASABLANCA",
        code: "HOSPITAL_SAN_JOSE_CASABLANCA",
    },
    { name: "PSR PUPUYA", code: "PSR_PUPUYA" },
    { name: "PSR RAPEL (NAVIDAD)", code: "PSR_RAPEL_NAVIDAD" },
    { name: "PSR SAN VICENTE DE PUCALÁN", code: "PSR_SAN_VICENTE_PUCALAN" },
    { name: "PSR(S) ALGARROBO (EL YECO, SAN JOSÉ)", code: "PSR_ALGARROBO" },
    {
        name: "PSR(S) CARTAGENA (LO ZARATE, LO ABARCA, EL TURCO)",
        code: "PSR_CARTAGENA",
    },
    {
        name: "PSR(S) CASABLANCA (QUINTAY, LAS DICHAS, LOS MAITENES, LAGUNILLAS)",
        code: "PSR_CASABLANCA",
    },
    {
        name: "PSR(S) SAN ANTONIO (EL ASILO, CUNCUMEN, SAN JUAN, LEYDA)",
        code: "PSR_SAN_ANTONIO",
    },
    {
        name: "PSR(S) SANTO DOMINGO (BUCALEMU, EL CONVENTO, SAN ENRIQUE)",
        code: "PSR_SANTO_DOMINGO",
    },
];

async function main() {
    console.log("Iniciando seed...");

    console.log("Creando Health Centers...");
    const createdCenters: { id: string; code: string }[] = [];
    for (const hc of healthCenters) {
        const created = await prisma.healthCenter.upsert({
            where: { code: hc.code },
            update: { name: hc.name },
            create: hc,
        });
        createdCenters.push(created);
        console.log(`  - ${hc.name} (${hc.code})`);
    }
    console.log(`Creados ${createdCenters.length} centros`);

    const cesfamBaron = createdCenters.find((c) => c.code === "CESFAM_BARON");
    if (!cesfamBaron) throw new Error("CESFAM BARON no encontrado");

    console.log("\nCreando usuarios de prueba...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const superAdmin = await prisma.user.upsert({
        where: { email: "renzovergarag@gmail.com" },
        update: {
            name: "Renzo Vergara",
            role: "SUPER_ADMIN",
            password: hashedPassword,
        },
        create: {
            email: "renzovergarag@gmail.com",
            name: "Renzo Vergara",
            password: hashedPassword,
            role: "SUPER_ADMIN",
            healthCenterId: null,
        },
    });
    console.log(`  - ${superAdmin.email} (SUPER_ADMIN)`);

    const adminBaron = await prisma.user.upsert({
        where: { email: "gestiondelainformacion@cmvalparaiso.cl" },
        update: {
            name: "Gestión Información",
            role: "ADMIN_CENTRO",
            password: hashedPassword,
            healthCenterId: cesfamBaron.id,
        },
        create: {
            email: "gestiondelainformacion@cmvalparaiso.cl",
            name: "Gestión Información",
            password: hashedPassword,
            role: "ADMIN_CENTRO",
            healthCenterId: cesfamBaron.id,
        },
    });
    console.log(`  - ${adminBaron.email} (ADMIN_CENTRO - CESFAM BARON)`);

    const profesional = await prisma.user.upsert({
        where: { email: "rvergara@cmvalparaiso.cl" },
        update: {
            name: "Roberto Vergara",
            role: "PROFESIONAL",
            password: hashedPassword,
            healthCenterId: cesfamBaron.id,
        },
        create: {
            email: "rvergara@cmvalparaiso.cl",
            name: "Roberto Vergara",
            password: hashedPassword,
            role: "PROFESIONAL",
            healthCenterId: cesfamBaron.id,
        },
    });
    console.log(`  - ${profesional.email} (PROFESIONAL)`);

    console.log("\nCreando profesionales de ejemplo...");
    const sampleProfessionals = [
        {
            name: "Juan Pablo Aceituno Jara",
            rut: "12345678-9",
            position: "Cirujano Dentista",
            category: "CAT_A",
            weeklyHours: 44,
        },
        {
            name: "María González López",
            rut: "98765432-1",
            position: "Médico General",
            category: "CAT_B",
            weeklyHours: 44,
        },
        {
            name: "Pedro Ramírez Soto",
            rut: "11122333-4",
            position: "Kinesiólogo",
            category: "CAT_C",
            weeklyHours: 33,
        },
        {
            name: "Ana María Torres",
            rut: "55566677-8",
            position: "Enfermera",
            category: "CAT_D",
            weeklyHours: 22,
        },
        {
            name: "Carmen Rosa Fuentes",
            rut: "22233344-5",
            position: "Matrona",
            category: "CAT_D",
            weeklyHours: 22,
        },
    ];

    for (const prof of sampleProfessionals) {
        await prisma.professional.upsert({
            where: { rut: prof.rut },
            update: { ...prof, healthCenterId: cesfamBaron.id },
            create: { ...prof, healthCenterId: cesfamBaron.id },
        });
        console.log(`  - ${prof.name} (${prof.position})`);
    }

    console.log("\nCreando actividades de ejemplo...");
    const sampleActivities = [
        {
            code: "GES_001",
            type: "GESTION" as const,
            name: "Gestión Comunitaria",
            weeklyHours: 2,
            criteria: "22 a 44",
            isRequired: false,
        },
        {
            code: "GES_002",
            type: "GESTION" as const,
            name: "Encargado COMSE",
            weeklyHours: 4,
            criteria: "22 a 44",
            isRequired: false,
        },
        {
            code: "GES_003",
            type: "GESTION" as const,
            name: "Gestor Comunitario (22h)",
            weeklyHours: 22,
            criteria: "22",
            isRequired: false,
        },
        {
            code: "REU_001",
            type: "REUNION" as const,
            name: "Reunión de Equipo",
            weeklyHours: 2,
            criteria: "22 a 44",
            isRequired: true,
        },
        {
            code: "REU_002",
            type: "REUNION" as const,
            name: "Reunión de Capacitación",
            weeklyHours: 1,
            criteria: "22 a 44",
            isRequired: false,
        },
        {
            code: "DER_001",
            type: "DERECHO" as const,
            name: "Derecho a Educación",
            weeklyHours: 3,
            criteria: "22 a 44",
            isRequired: true,
        },
        {
            code: "DER_002",
            type: "DERECHO" as const,
            name: "Derecho a Descanso",
            weeklyHours: 0.5,
            criteria: "22 a 44",
            isRequired: true,
        },
    ];

    for (const activity of sampleActivities) {
        await prisma.activity.upsert({
            where: {
                healthCenterId_code: {
                    healthCenterId: cesfamBaron.id,
                    code: activity.code,
                },
            },
            update: {
                ...activity,
                healthCenterId: cesfamBaron.id,
                appliesTo: '["CAT_A","CAT_B","CAT_C","CAT_D"]',
            },
            create: {
                ...activity,
                healthCenterId: cesfamBaron.id,
                appliesTo: '["CAT_A","CAT_B","CAT_C","CAT_D"]',
            },
        });
        console.log(`  - ${activity.code}: ${activity.name}`);
    }

    console.log("\n✅ Seed completado exitosamente!");
    console.log("\nCredenciales de prueba:");
    console.log("  Super Admin: renzovergarag@gmail.com / password123");
    console.log(
        "  Admin Centro: gestiondelainformacion@cmvalparaiso.cl / password123",
    );
    console.log("  Profesional: rvergara@cmvalparaiso.cl / password123");
}

main()
    .catch((e) => {
        console.error("Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
