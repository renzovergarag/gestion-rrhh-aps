'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerAction } from '@/actions';

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [healthCenters, setHealthCenters] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetch('/api/health-centers')
            .then((res) => res.json())
            .then((data) => setHealthCenters(data))
            .catch(() => setHealthCenters([]));
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await registerAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        router.push('/login');
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Crear Cuenta</CardTitle>
                    <p className="text-center text-sm text-gray-500">Regístrate en el sistema</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Nombre" name="name" required placeholder="Tu nombre" />
                        <Input label="Email" name="email" type="email" required placeholder="tu@email.com" />
                        <Input label="Contraseña" name="password" type="password" required placeholder="••••••••" />
                        <Select
                            label="Rol"
                            name="role"
                            options={[
                                { value: 'ADMIN_CENTRO', label: 'Admin de Centro' },
                                { value: 'PROFESIONAL', label: 'Profesional' },
                            ]}
                        />
                        <Select
                            label="Centro de Salud"
                            name="healthCenterId"
                            options={[
                                { value: '', label: 'Selecciona un centro...' },
                                ...healthCenters.map((hc) => ({ value: hc.id, label: hc.name })),
                            ]}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}