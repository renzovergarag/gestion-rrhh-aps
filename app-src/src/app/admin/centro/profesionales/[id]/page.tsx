'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { updateProfessionalAction } from '@/actions';

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

export default function EditProfessionalPage() {
    const router = useRouter();
    const params = useParams();
    const professionalId = params.id as string;

    const [professional, setProfessional] = useState<{
        id: string;
        name: string;
        rut: string;
        position: string;
        category: string;
        weeklyHours: number;
        isActive: boolean;
        userId: string | null;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProfessional() {
            const data = await prisma.professional.findUnique({
                where: { id: professionalId },
            });
            setProfessional(data);
            setIsLoading(false);
        }
        loadProfessional();
    }, [professionalId]);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setError(null);

        const result = await updateProfessionalAction(professionalId, formData);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        router.push('/admin/centro/profesionales');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-gray-500">Cargando...</p>
            </div>
        );
    }

    if (!professional) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-red-500">Profesional no encontrado</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Editar Profesional</h1>
                <p className="text-gray-500">Modificar datos del funcionario</p>
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
                            defaultValue={professional.name}
                        />

                        <Input
                            label="RUT"
                            name="rut"
                            required
                            defaultValue={professional.rut}
                        />

                        <Input
                            label="Cargo"
                            name="position"
                            required
                            defaultValue={professional.position}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <Select
                                label="Categoría"
                                name="category"
                                required
                                options={categoryOptions}
                                defaultValue={professional.category}
                            />

                            <Select
                                label="Horas semanales contratadas"
                                name="weeklyHours"
                                required
                                options={hoursOptions}
                                defaultValue={String(professional.weeklyHours)}
                            />
                        </div>

                        <Input
                            label="ID de Usuario (opcional)"
                            name="userId"
                            placeholder="Vincular cuenta del sistema"
                            defaultValue={professional.userId || ''}
                        />

                        <div className="flex items-center gap-2">
                            <input
                                type="hidden"
                                name="isActive"
                                value={professional.isActive ? 'true' : 'false'}
                            />
                            <label className="text-sm text-gray-600">
                                Estado: {professional.isActive ? 'Activo' : 'Inactivo'}
                            </label>
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