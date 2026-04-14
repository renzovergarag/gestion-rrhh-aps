'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { healthCenterSchema, professionalSchema, activitySchema, surveySchema, loginSchema, registerSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

async function getSessionOrThrow() {
    const session = await auth();
    if (!session?.user) {
        throw new Error('No autenticado');
    }
    return session;
}

async function checkSuperAdmin() {
    const session = await getSessionOrThrow();
    if (session.user.role !== 'SUPER_ADMIN') {
        throw new Error('Acceso denegado: se requiere Super Admin');
    }
    return session;
}

async function checkAdminCentro() {
    const session = await getSessionOrThrow();
    if (!['SUPER_ADMIN', 'ADMIN_CENTRO'].includes(session.user.role)) {
        throw new Error('Acceso denegado: se requiere Admin de Centro');
    }
    return session;
}

export async function loginAction(formData: FormData) {
    try {
        const data = loginSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: { healthCenter: true },
        });

        if (!user) {
            return { error: 'Credenciales inválidas' };
        }

        const isValid = await bcrypt.compare(data.password, user.password);
        if (!isValid) {
            return { error: 'Credenciales inválidas' };
        }

        redirect('/admin/centro');
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function registerAction(formData: FormData) {
    try {
        const session = await getSessionOrThrow();

        if (session.user.role !== 'SUPER_ADMIN') {
            return { error: 'Solo Super Admin puede crear usuarios' };
        }

        const data = registerSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
            role: formData.get('role'),
            healthCenterId: formData.get('healthCenterId'),
        });

        const exists = await prisma.user.findUnique({ where: { email: data.email } });
        if (exists) {
            return { error: 'El email ya está registrado' };
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
                healthCenterId: data.healthCenterId || null,
            },
        });

        revalidatePath('/admin/global');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function createHealthCenterAction(formData: FormData) {
    try {
        await checkSuperAdmin();

        const data = healthCenterSchema.parse({
            name: formData.get('name'),
            code: formData.get('code'),
        });

        const exists = await prisma.healthCenter.findUnique({ where: { code: data.code } });
        if (exists) {
            return { error: 'El código ya existe' };
        }

        await prisma.healthCenter.create({
            data: {
                name: data.name,
                code: data.code,
            },
        });

        revalidatePath('/admin/global');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function updateHealthCenterAction(id: string, formData: FormData) {
    try {
        await checkSuperAdmin();

        const data = healthCenterSchema.parse({
            name: formData.get('name'),
            code: formData.get('code'),
        });

        await prisma.healthCenter.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code,
            },
        });

        revalidatePath('/admin/global');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function deleteHealthCenterAction(id: string) {
    try {
        await checkSuperAdmin();
        await prisma.healthCenter.delete({ where: { id } });
        revalidatePath('/admin/global');
        return { success: true };
    } catch {
        return { error: 'No se puede eliminar el centro' };
    }
}

export async function createProfessionalAction(formData: FormData) {
    try {
        const session = await checkAdminCentro();

        const data = professionalSchema.parse({
            name: formData.get('name'),
            rut: formData.get('rut'),
            position: formData.get('position'),
            category: formData.get('category'),
            weeklyHours: parseFloat(formData.get('weeklyHours') as string),
            isActive: formData.get('isActive') === 'true',
            userId: formData.get('userId') || null,
        });

        const healthCenterId = session.user.healthCenterId || formData.get('healthCenterId');
        if (!healthCenterId) {
            return { error: 'Centro de salud requerido' };
        }

        const exists = await prisma.professional.findFirst({
            where: { rut: data.rut, healthCenterId: healthCenterId as string },
        });
        if (exists) {
            return { error: 'Ya existe un profesional con este RUT en este centro' };
        }

        await prisma.professional.create({
            data: {
                ...data,
                healthCenterId: healthCenterId as string,
            },
        });

        revalidatePath('/admin/centro');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function updateProfessionalAction(id: string, formData: FormData) {
    try {
        await checkAdminCentro();

        const data = professionalSchema.parse({
            name: formData.get('name'),
            rut: formData.get('rut'),
            position: formData.get('position'),
            category: formData.get('category'),
            weeklyHours: parseFloat(formData.get('weeklyHours') as string),
            isActive: formData.get('isActive') === 'true',
            userId: formData.get('userId') || null,
        });

        await prisma.professional.update({
            where: { id },
            data,
        });

        revalidatePath('/admin/centro');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function deleteProfessionalAction(id: string) {
    try {
        await checkAdminCentro();
        await prisma.professional.delete({ where: { id } });
        revalidatePath('/admin/centro');
        return { success: true };
    } catch {
        return { error: 'No se puede eliminar el profesional' };
    }
}

export async function createActivityAction(formData: FormData) {
    try {
        const session = await checkAdminCentro();

        const appliesToRaw = formData.get('appliesTo');
        const appliesTo = typeof appliesToRaw === 'string' ? JSON.parse(appliesToRaw) : [];

        const data = activitySchema.parse({
            code: formData.get('code'),
            type: formData.get('type'),
            name: formData.get('name'),
            weeklyHours: parseFloat(formData.get('weeklyHours') as string),
            criteria: formData.get('criteria') || undefined,
            appliesTo,
            isRequired: formData.get('isRequired') === 'true',
            isActive: formData.get('isActive') !== 'false',
        });

        const healthCenterId = session.user.healthCenterId || formData.get('healthCenterId');
        if (!healthCenterId) {
            return { error: 'Centro de salud requerido' };
        }

        await prisma.activity.create({
            data: {
                ...data,
                appliesTo: JSON.stringify(data.appliesTo),
                healthCenterId: healthCenterId as string,
            },
        });

        revalidatePath('/admin/centro');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function updateActivityAction(id: string, formData: FormData) {
    try {
        await checkAdminCentro();

        const appliesToRaw = formData.get('appliesTo');
        const appliesTo = typeof appliesToRaw === 'string' ? JSON.parse(appliesToRaw) : [];

        const data = activitySchema.parse({
            code: formData.get('code'),
            type: formData.get('type'),
            name: formData.get('name'),
            weeklyHours: parseFloat(formData.get('weeklyHours') as string),
            criteria: formData.get('criteria') || undefined,
            appliesTo,
            isRequired: formData.get('isRequired') === 'true',
            isActive: formData.get('isActive') !== 'false',
        });

        await prisma.activity.update({
            where: { id },
            data: {
                ...data,
                appliesTo: JSON.stringify(data.appliesTo),
            },
        });

        revalidatePath('/admin/centro');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function deleteActivityAction(id: string) {
    try {
        await checkAdminCentro();
        await prisma.activity.delete({ where: { id } });
        revalidatePath('/admin/centro');
        return { success: true };
    } catch {
        return { error: 'No se puede eliminar la actividad' };
    }
}

export async function createSurveyAction(formData: FormData) {
    try {
        const session = await checkAdminCentro();

        const entriesRaw = formData.get('entries');
        const entries = typeof entriesRaw === 'string' ? JSON.parse(entriesRaw) : [];

        const data = surveySchema.parse({
            professionalId: formData.get('professionalId'),
            year: parseInt(formData.get('year') as string),
            week: parseInt(formData.get('week') as string),
            entries,
        });

        const healthCenterId = session.user.healthCenterId || formData.get('healthCenterId');
        if (!healthCenterId) {
            return { error: 'Centro de salud requerido' };
        }

        const exists = await prisma.survey.findUnique({
            where: {
                professionalId_year_week: {
                    professionalId: data.professionalId,
                    year: data.year,
                    week: data.week,
                },
            },
        });
        if (exists) {
            return { error: 'Ya existe una encuesta para esta semana' };
        }

        const totalHours = entries.reduce((sum: number, e: { hours: number }) => sum + e.hours, 0);
        const professional = await prisma.professional.findUnique({ where: { id: data.professionalId } });
        if (professional && totalHours > professional.weeklyHours) {
            return { error: `Las horas totales (${totalHours}) exceden la jornada (${professional.weeklyHours})` };
        }

        await prisma.survey.create({
            data: {
                healthCenterId: healthCenterId as string,
                professionalId: data.professionalId,
                year: data.year,
                week: data.week,
                status: 'DRAFT',
                entries: {
                    create: data.entries.map((e) => ({
                        activityId: e.activityId,
                        hours: e.hours,
                    })),
                },
            },
        });

        revalidatePath('/admin/centro');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: 'Error interno del servidor' };
    }
}

export async function submitSurveyAction(id: string) {
    try {
        await checkAdminCentro();

        const survey = await prisma.survey.findUnique({
            where: { id },
            include: { entries: true, professional: true },
        });

        if (!survey) {
            return { error: 'Encuesta no encontrada' };
        }

        const totalHours = survey.entries.reduce((sum, e) => sum + e.hours, 0);
        if (totalHours > survey.professional.weeklyHours) {
            return { error: `Las horas totales (${totalHours}) exceden la jornada (${survey.professional.weeklyHours})` };
        }

        await prisma.survey.update({
            where: { id },
            data: { status: 'SUBMITTED' },
        });

        revalidatePath('/admin/centro');
        return { success: true };
    } catch {
        return { error: 'Error interno del servidor' };
    }
}

export async function updateSurveyAction(id: string, formData: FormData) {
    try {
        const session = await checkAdminCentro();

        const entriesRaw = formData.get('entries');
        const entries = typeof entriesRaw === 'string' ? JSON.parse(entriesRaw) : [];

        const data = surveySchema.parse({
            professionalId: formData.get('professionalId'),
            year: parseInt(formData.get('year') as string),
            week: parseInt(formData.get('week') as string),
            entries,
        });

        const survey = await prisma.survey.findUnique({
            where: { id },
            include: { professional: true },
        });

        if (!survey) {
            return { error: 'Encuesta no encontrada' };
        }

        const totalHours = entries.reduce((sum: number, e: { hours: number }) => sum + e.hours, 0);
        if (totalHours > survey.professional.weeklyHours) {
            return { error: `Las horas totales (${totalHours}) exceden la jornada (${survey.professional.weeklyHours})` };
        }

        await prisma.surveyEntry.deleteMany({ where: { surveyId: id } });

        await prisma.surveyEntry.createMany({
            data: entries.map((e: { activityId: string; hours: number }) => ({
                surveyId: id,
                activityId: e.activityId,
                hours: e.hours,
            })),
        });

        revalidatePath('/admin/centro');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: 'Error interno del servidor' };
    }
}