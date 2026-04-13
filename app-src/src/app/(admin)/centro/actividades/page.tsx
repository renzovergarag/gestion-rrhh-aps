import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ActivitiesPage() {
    const session = await auth();
    const healthCenterId = session!.user.healthCenterId!;

    const activities = await prisma.activity.findMany({
        where: { healthCenterId },
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Actividades</h1>
                    <p className="text-gray-500">Catálogo de actividades HNC</p>
                </div>
                <Link href="/admin/centro/actividades/nueva">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Actividad
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">GESTION</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {activities.filter((a) => a.type === 'GESTION').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">REUNION</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {activities.filter((a) => a.type === 'REUNION').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">DERECHO</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {activities.filter((a) => a.type === 'DERECHO').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Horas/Sem</TableHead>
                                <TableHead>Obligatoria</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                        No hay actividades registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activities.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell className="font-mono text-sm">{activity.code}</TableCell>
                                        <TableCell>{activity.name}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    activity.type === 'GESTION'
                                                        ? 'default'
                                                        : activity.type === 'REUNION'
                                                        ? 'warning'
                                                        : 'success'
                                                }
                                            >
                                                {activity.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{activity.weeklyHours}h</TableCell>
                                        <TableCell>
                                            {activity.isRequired ? 'Sí' : 'No'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={activity.isActive ? 'success' : 'danger'}>
                                                {activity.isActive ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}