import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ProfessionalsPage() {
    const session = await auth();
    const healthCenterId = session!.user.healthCenterId!;

    const professionals = await prisma.professional.findMany({
        where: { healthCenterId },
        include: { user: true },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Profesionales</h1>
                    <p className="text-gray-500">Gestión de funcionarios del centro</p>
                </div>
                <Link href="/admin/centro/profesionales/nuevo">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Profesional
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>RUT</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Horas/Sem</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {professionals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                        No hay profesionales registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                professionals.map((prof) => (
                                    <TableRow key={prof.id}>
                                        <TableCell className="font-medium">{prof.name}</TableCell>
                                        <TableCell>{prof.rut}</TableCell>
                                        <TableCell>{prof.position}</TableCell>
                                        <TableCell>
                                            <Badge variant="default">{prof.category}</Badge>
                                        </TableCell>
                                        <TableCell>{prof.weeklyHours}h</TableCell>
                                        <TableCell>
                                            <Badge variant={prof.isActive ? 'success' : 'danger'}>
                                                {prof.isActive ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/admin/centro/profesionales/${prof.id}`}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    Editar
                                                </Link>
                                                <Link
                                                    href={`/admin/centro/encuestas/nueva?professionalId=${prof.id}`}
                                                    className="text-sm text-green-600 hover:underline"
                                                >
                                                    Crear Encuesta
                                                </Link>
                                            </div>
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