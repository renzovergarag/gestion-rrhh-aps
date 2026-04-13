'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Credenciales inválidas');
                setLoading(false);
                return;
            }

            router.push('/admin/centro');
            router.refresh();
        } catch {
            setError('Credenciales inválidas');
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">GestionRRHH APS</CardTitle>
                    <p className="text-center text-sm text-gray-500">Ingresa tus credenciales</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            required
                            placeholder="tu@email.com"
                        />
                        <Input
                            label="Contraseña"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Ingresando...' : 'Iniciar sesión'}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-500">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Regístrate
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}