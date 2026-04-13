import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(2, 'El nombre es requerido'),
    role: z.enum(['ADMIN_CENTRO', 'PROFESIONAL']),
    healthCenterId: z.string().min(1, 'Selecciona un centro de salud'),
});

export const healthCenterSchema = z.object({
    name: z.string().min(2, 'El nombre es requerido'),
    code: z.string().min(2, 'El código es requerido'),
});

export const professionalSchema = z.object({
    name: z.string().min(2, 'El nombre es requerido'),
    rut: z.string().min(7, 'El RUT es requerido'),
    position: z.string().min(2, 'El cargo es requerido'),
    category: z.enum(['CAT_A', 'CAT_B', 'CAT_C', 'CAT_D']),
    weeklyHours: z.number().min(1).max(44),
    isActive: z.boolean().default(true),
    userId: z.string().optional().nullable(),
});

export const activitySchema = z.object({
    code: z.string().min(3, 'El código es requerido'),
    type: z.enum(['GESTION', 'REUNION', 'DERECHO']),
    name: z.string().min(2, 'El nombre es requerido'),
    weeklyHours: z.number().min(0.25).max(44),
    criteria: z.string().optional(),
    appliesTo: z.array(z.string()).default([]),
    isRequired: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

export const surveySchema = z.object({
    professionalId: z.string().min(1, 'Selecciona un profesional'),
    year: z.number().min(2020).max(2100),
    week: z.number().min(1).max(53),
    entries: z.array(z.object({
        activityId: z.string(),
        hours: z.number().min(0).max(44),
    })).default([]),
});

export const surveyEntrySchema = z.object({
    activityId: z.string(),
    hours: z.number().min(0).max(44),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type HealthCenterInput = z.infer<typeof healthCenterSchema>;
export type ProfessionalInput = z.infer<typeof professionalSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type SurveyInput = z.infer<typeof surveySchema>;
export type SurveyEntryInput = z.infer<typeof surveyEntrySchema>;