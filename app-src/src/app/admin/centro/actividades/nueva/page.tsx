'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { createActivityAction } from '@/actions';

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

export default function NewActivityPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setError(null);

        const appliesToValue = formData.get('appliesTo') as string;
        const appliesTo = appliesToValue === 'TODOS' ? [] : [appliesToValue];

        formData.set('appliesTo', JSON.stringify(appliesTo));
        formData.set('isRequired', formData.get('isRequired') === 'on' ? 'true' : 'false');
        formData.set('isActive', formData.get('isActive') === 'on' ? 'true' : 'false');

        const result = await createActivityAction(formData);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        router.push('/admin/centro/actividades');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Nueva Actividad</h1>
                <p className="text-gray-500">Agregar una nueva actividad HNC al catálogo</p>
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
                                placeholder="Ej: GES_001"
                            />

                            <Select
                                label="Tipo"
                                name="type"
                                required
                                options={typeOptions}
                            />
                        </div>

                        <Input
                            label="Nombre"
                            name="name"
                            required
                            placeholder="Ej: Gestión en terreno"
                        />

                        <Input
                            label="Horas estándar semanales"
                            name="weeklyHours"
                            type="number"
                            step="0.25"
                            min="0.25"
                            max="44"
                            required
                            placeholder="Ej: 4"
                        />

                        <Input
                            label="Criterios (opcional)"
                            name="criteria"
                            placeholder="Ej: 22 a 44 horas"
                        />

                        <Select
                            label="Aplica a"
                            name="appliesTo"
                            options={appliesToOptions}
                        />

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isRequired"
                                    name="isRequired"
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
                                    defaultChecked
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
                                {isSubmitting ? 'Guardando...' : 'Guardar Actividad'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}