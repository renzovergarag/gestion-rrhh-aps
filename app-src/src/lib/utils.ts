import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function getWeekDates(weekNumber: number, year: number): { start: Date; end: Date } {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = simple
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  const ISOweekEnd = new Date(ISOweekStart)
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6)
  return { start: ISOweekStart, end: ISOweekEnd }
}

export function calculateAvailableHours(
  weeklyHours: number,
  holidayDays: number,
  adminDays: number,
  vacationDays: number,
  sickLeaveDays: number,
  otherAbsenceDays: number,
): { availableHoursYear: number; availableHoursWeek: number } {
  const theoreticalHoursYear = weeklyHours * 52
  const hoursPerDay = weeklyHours / 5
  const totalAbsenceHours =
    (holidayDays + adminDays + vacationDays + sickLeaveDays + otherAbsenceDays) * hoursPerDay
  const availableHoursYear = Math.max(0, theoreticalHoursYear - totalAbsenceHours)
  const availableHoursWeek = availableHoursYear / 52
  return { availableHoursYear, availableHoursWeek }
}

export const CONTRACT_HOURS: Record<string, number> = {
  JORNADA_COMPLETA: 44,
  MEDIA_JORNADA: 22,
  TRES_CUARTOS: 33,
  OTRO: 0,
}

export const PILLAR_LABELS: Record<string, string> = {
  GESTION: 'Gestión',
  REUNION: 'Reunión',
  DERECHO: 'Derechos (HNC)',
}

export const PILLAR_COLORS: Record<string, string> = {
  GESTION: '#6366f1',
  REUNION: '#f59e0b',
  DERECHO: '#10b981',
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN_CENTRO: 'Administrador de Centro',
  PROFESIONAL: 'Profesional',
}

export const CATEGORY_LABELS: Record<string, string> = {
  MEDICO: 'Médico/a',
  ENFERMERA: 'Enfermero/a',
  MATRONA: 'Matrona/ón',
  KINESIOLOGO: 'Kinesiólogo/a',
  PSICOLOGO: 'Psicólogo/a',
  NUTRICIONISTA: 'Nutricionista',
  ASISTENTE_SOCIAL: 'Asistente Social',
  TENS: 'TENS',
  TECNICO_PARAMEDICO: 'Técnico Paramédico',
  ADMINISTRATIVO: 'Administrativo/a',
  OTRO: 'Otro',
}

export const CONTRACT_LABELS: Record<string, string> = {
  JORNADA_COMPLETA: 'Jornada Completa (44h)',
  MEDIA_JORNADA: 'Media Jornada (22h)',
  TRES_CUARTOS: 'Tres Cuartos (33h)',
  OTRO: 'Otro',
}
