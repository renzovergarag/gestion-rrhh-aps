'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { createProfessionalAction } from '@/actions';

const categoryOptions = [
    { value: 'CAT_A', label: 'Categoría A' },
    { value: 'CAT_B', label: 'Categoría B' },
    { value: 'CAT_C', label: 'Categoría C' },
    { value: 'CAT_D', label: 'Categoría D' },
];

const hoursOptions = [
    { value: '44', label: '44 horas semanales' },
    { value: '33', label: '33 horas semanales' },
    { value: '22', label: '22 horas semanales' },
    { value: '11', label: '11 horas semanales' },
];

export default function NewProfessionalPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setError(null);

        const result = await createProfessionalAction(formData);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        router.push('/admin/centro/profesionales');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Nuevo Profesional</h1>
                <p className="text-gray-500">Agregar un nuevo funcionario al centro</p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600 text-sm">{error}</div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Datos del Profesional</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <Input
                            label="Nombre completo"
                            name="name"
                            required
                            placeholder="Ej: Juan Pérez Muñoz"
                        />

                        <Input
                            label="RUT"
                            name="rut"
                            required
                            placeholder="Ej: 12345678-9"
                        />

                        <Input
                            label="Cargo"
                            name="position"
                            required
                            placeholder="Ej: Técnico en enfermería"
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <Select
                                label="Categoría"
                                name="category"
                                required
                                options={categoryOptions}
                            />

                            <Select
                                label="Horas semanales contratadas"
                                name="weeklyHours"
                                required
                                options={hoursOptions}
                            />
                        </div>

                        <Input
                            label="ID de Usuario (opcional)"
                            name="userId"
                            placeholder="Vincular cuenta del sistema"
                        />

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={() => router.back()}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Profesional'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}