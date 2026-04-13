import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function GlobalDashboardPage() {
    const session = await auth();

    if (session!.user.role !== 'SUPER_ADMIN') {
        redirect('/admin/centro');
    }

    const [healthCenters, totalProfessionals, totalSurveys] = await Promise.all([
        prisma.healthCenter.findMany({
            include: {
                _count: { select: { professionals: true, surveys: true } },
            },
            orderBy: { name: 'asc' },
        }),
        prisma.professional.count(),
        prisma.survey.count(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Panel Global</h1>
                <p className="text-gray-500">Administración de todos los centros de salud</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Centros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{healthCenters.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Profesionales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalProfessionals}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Encuestas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalSurveys}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Usuarios Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{/* TODO */} -</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Centros de Salud</CardTitle>
                    <Link href="/admin/global/centros/nuevo">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Centro
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Código</TableHead>
                                <TableHead>Profesionales</TableHead>
                                <TableHead>Encuestas</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {healthCenters.map((hc) => (
                                <TableRow key={hc.id}>
                                    <TableCell className="font-medium">{hc.name}</TableCell>
                                    <TableCell className="font-mono text-sm">{hc.code}</TableCell>
                                    <TableCell>{hc._count.professionals}</TableCell>
                                    <TableCell>{hc._count.surveys}</TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/admin/global/centros/${hc.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Gestionar
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}