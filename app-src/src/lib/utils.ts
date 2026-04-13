import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getYearWeek(date: Date): { year: number; week: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week };
}

export function calculateAvailableHours(
    weeklyHours: number,
    adminDays: number,
    holidayDays: number,
    trainingDays: number
): { annual: number; weekly: number } {
    const totalAbsenceDays = adminDays + holidayDays + trainingDays;
    const weeksPerYear = 52;
    const hoursPerDay = weeklyHours / (5 * 7 / weeklyHours);

    const weeklyAbsenceHours = (totalAbsenceDays / weeksPerYear) * 8;
    const availableWeekly = Math.max(0, weeklyHours - weeklyAbsenceHours);
    const availableAnnual = availableWeekly * weeksPerYear;

    return {
        annual: Math.round(availableAnnual * 100) / 100,
        weekly: Math.round(availableWeekly * 100) / 100,
    };
}

export function calculateHNC_HC(
    totalHours: number,
    gestionHours: number,
    reunionHours: number,
    derechoHours: number
): { hnc: number; hc: number; hncPercent: number; hcPercent: number } {
    const hnc = gestionHours + reunionHours + derechoHours;
    const hc = totalHours - hnc;
    const total = hnc + hc;

    return {
        hnc: Math.round(hnc * 100) / 100,
        hc: Math.round(hc * 100) / 100,
        hncPercent: total > 0 ? Math.round((hnc / total) * 10000) / 100 : 0,
        hcPercent: total > 0 ? Math.round((hc / total) * 10000) / 100 : 0,
    };
}