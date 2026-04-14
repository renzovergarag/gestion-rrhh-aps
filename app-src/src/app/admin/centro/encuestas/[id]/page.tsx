'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { updateSurveyAction, submitSurveyAction } from '@/actions';
import { getCurrentWeekNumber } from '@/lib/utils';

interface Professional {
    id: string;
    name: string;
    rut: string;
    position: string;
    category: string;
    weeklyHours: number;
}

interface Activity {
    id: string;
    code: string;
    name: string;
    type: string;
    weeklyHours: number;
}

interface SurveyEntry {
    id: string;
    activityId: string;
    hours: number;
}

interface SurveyData {
    id: string;
    professionalId: string;
    year: number;
    week: number;
    status: string;
    entries: SurveyEntry[];
}

export default function EditSurveyPage() {
    const router = useRouter();
    const params = useParams();
    const surveyId = params.id as string;

    const [survey, setSurvey] = useState<SurveyData | null>(null);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [entries, setEntries] = useState<{ activityId: string; hours: number }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function loadData() {
            const session = await auth();
            const healthCenterId = session!.user.healthCenterId!;

            const [surveyData, profs, acts] = await Promise.all([
                prisma.survey.findUnique({
                    where: { id: surveyId },
                    include: { entries: true },
                }),
                prisma.professional.findMany({
                    where: { healthCenterId, isActive: true },
                    orderBy: { name: 'asc' },
                }),
                prisma.activity.findMany({
                    where: { healthCenterId, isActive: true },
                    orderBy: [{ type: 'asc' }, { code: 'asc' }],
                }),
            ]);

            if (surveyData) {
                setSurvey(surveyData as SurveyData);
                setSelectedProfessional(surveyData.professionalId);
                setSelectedWeek(`${surveyData.year}-W${String(surveyData.week).padStart(2, '0')}`);
                setEntries(surveyData.entries.map((e) => ({ activityId: e.activityId, hours: e.hours })));
            }

            setProfessionals(profs);
            setActivities(acts);
        }
        loadData();
    }, [surveyId]);

    const selectedProfData = professionals.find((p) => p.id === selectedProfessional);
    const jornada = selectedProfData?.weeklyHours || 44;
    const totalHNC = entries.reduce((sum, e) => sum + e.hours, 0);
    const hc = jornada - totalHNC;
    const progress = jornada > 0 ? (totalHNC / jornada) * 100 : 0;
    const isOverLimit = totalHNC > jornada;
    const isDraft = survey?.status === 'DRAFT';

    const handleActivityChange = (activityId: string, hours: number) => {
        setEntries((prev) => {
            const existing = prev.find((e) => e.activityId === activityId);
            if (existing) {
                return prev.map((e) =>
                    e.activityId === activityId ? { ...e, hours: Math.max(0, hours) } : e
                );
            }
            return [...prev, { activityId, hours: Math.max(0, hours) }];
        });
    };

    const handleSave = async () => {
        if (!selectedProfessional) {
            setError('Selecciona un profesional');
            return;
        }

        const filteredEntries = entries.filter((e) => e.hours > 0);

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('professionalId', selectedProfessional);
        formData.append('year', selectedWeek.split('-W')[0]);
        formData.append('week', selectedWeek.split('-W')[1]);
        formData.append('entries', JSON.stringify(filteredEntries));

        const result = await updateSurveyAction(surveyId, formData);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        router.push('/admin/centro/encuestas');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        const result = await submitSurveyAction(surveyId);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        router.push('/admin/centro/encuestas');
    };

    const weekOptions = Array.from({ length: 53 }, (_, i) => {
        const week = i + 1;
        return {
            value: `${new Date().getFullYear()}-W${String(week).padStart(2, '0')}`,
            label: `Semana ${week} - ${new Date().getFullYear()}`,
        };
    });

    if (!survey) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-gray-500">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Editar Encuesta</h1>
                    <p className="text-gray-500">
                        {survey.status === 'DRAFT' ? 'Borrador' : 'Enviada'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600 text-sm">{error}</div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Datos de la Encuesta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Select
                            label="Profesional"
                            value={selectedProfessional}
                            onChange={(e) => setSelectedProfessional(e.target.value)}
                            options={professionals.map((p) => ({
                                value: p.id,
                                label: `${p.name} (${p.position})`,
                            }))}
                            disabled={!isDraft}
                        />
                        <Select
                            label="Semana"
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            options={weekOptions}
                            disabled={!isDraft}
                        />
                    </div>

                    {selectedProfData && (
                        <div className="rounded-lg bg-blue-50 p-4 text-sm">
                            <p className="font-medium">Jornada semanal: {jornada}h</p>
                            <p className="text-gray-600">
                                Categoría: {selectedProfData.category} | RUT: {selectedProfData.rut}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Actividades HNC</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {activities.map((activity) => {
                            const entry = entries.find((e) => e.activityId === activity.id);
                            const currentHours = entry?.hours || 0;

                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-4 rounded-lg border p-3"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{activity.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {activity.code} | {activity.type} | Estándar: {activity.weeklyHours}h
                                        </p>
                                    </div>
                                    <div className="w-32">
                                        <Input
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            max={jornada}
                                            placeholder="0"
                                            value={currentHours || ''}
                                            onChange={(e) =>
                                                handleActivityChange(
                                                    activity.id,
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            disabled={!isDraft}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-500 w-16">horas</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>HNC Registradas</span>
                            <span className="font-medium">{totalHNC}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>HC Calculada</span>
                            <span className={hc < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                {hc}h
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Jornada</span>
                            <span>{jornada}h</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-200">
                            <div
                                className={`h-3 rounded-full transition-all ${
                                    isOverLimit ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        {isOverLimit && (
                            <p className="text-sm text-red-600 font-medium">
                                Excediste la jornada por {totalHNC - jornada}h
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        {isDraft && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleSave}
                                    disabled={isSubmitting || isOverLimit}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Borrador'}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isOverLimit}
                                >
                                    Enviar Encuesta
                                </Button>
                            </>
                        )}
                        {!isDraft && (
                            <span className="text-sm text-gray-500 py-2">
                                Esta encuesta ya fue enviada y no puede ser editada
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}