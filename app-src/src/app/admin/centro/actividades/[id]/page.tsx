'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { updateActivityAction } from '@/actions';

const typeOptions = [
    { value: 'GESTION', label: 'Gestión' },
    { value: 'REUNION', label: 'Reunión' },
    { value: 'DERECHO', label: 'Derecho' },
];

const appliesToOptions = [
    { value: 'TODOS', label: 'Todos los cargos' },
    { value: 'PROFESIONAL', label: 'Solo Profesionales' },
    { value: 'TECNICO', label: 'Solo Técnicos' },
];

export default function EditActivityPage() {
    const router = useRouter();
    const params = useParams();
    const activityId = params.id as string;

    const [activity, setActivity] = useState<{
        id: string;
        code: string;
        type: string;
        name: string;
        weeklyHours: number;
        criteria: string | null;
        appliesTo: string;
        isRequired: boolean;
        isActive: boolean;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadActivity() {
            const data = await prisma.activity.findUnique({
                where: { id: activityId },
            });
            setActivity(data);
            setIsLoading(false);
        }
        loadActivity();
    }, [activityId]);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setError(null);

        const appliesToValue = formData.get('appliesTo') as string;
        const appliesTo = appliesToValue === 'TODOS' ? [] : [appliesToValue];

        formData.set('appliesTo', JSON.stringify(appliesTo));
        formData.set('isRequired', formData.get('isRequired') === 'on' ? 'true' : 'false');
        formData.set('isActive', formData.get('isActive') === 'on' ? 'true' : 'false');

        const result = await updateActivityAction(activityId, formData);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        router.push('/admin/centro/actividades');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-gray-500">Cargando...</p>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-red-500">Actividad no encontrada</p>
            </div>
        );
    }

    const parsedAppliesTo = activity.appliesTo ? JSON.parse(activity.appliesTo) : [];
    const currentAppliesTo = parsedAppliesTo.length === 0 ? 'TODOS' : parsedAppliesTo[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Editar Actividad</h1>
                <p className="text-gray-500">Modificar actividad HNC del catálogo</p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600 text-sm">{error}</div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Datos de la Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Código"
                                name="code"
                                required
                                defaultValue={activity.code}
                            />

                            <Select
                                label="Tipo"
                                name="type"
                                required
                                options={typeOptions}
                                defaultValue={activity.type}
                            />
                        </div>

                        <Input
                            label="Nombre"
                            name="name"
                            required
                            defaultValue={activity.name}
                        />

                        <Input
                            label="Horas estándar semanales"
                            name="weeklyHours"
                            type="number"
                            step="0.25"
                            min="0.25"
                            max="44"
                            required
                            defaultValue={activity.weeklyHours}
                        />

                        <Input
                            label="Criterios (opcional)"
                            name="criteria"
                            placeholder="Ej: 22 a 44 horas"
                            defaultValue={activity.criteria || ''}
                        />

                        <Select
                            label="Aplica a"
                            name="appliesTo"
                            options={appliesToOptions}
                            defaultValue={currentAppliesTo}
                        />

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isRequired"
                                    name="isRequired"
                                    defaultChecked={activity.isRequired}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="isRequired" className="text-sm text-gray-700">
                                    Actividad obligatoria
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    defaultChecked={activity.isActive}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">
                                    Activa
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={() => router.back()}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}