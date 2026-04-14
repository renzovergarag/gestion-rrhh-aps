import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function SurveysPage() {
    const session = await auth();
    const healthCenterId = session!.user.healthCenterId!;

    const surveys = await prisma.survey.findMany({
        where: { healthCenterId },
        include: { professional: true, entries: { include: { activity: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Encuestas</h1>
                    <p className="text-gray-500">Registro de tiempo semanal HNC</p>
                </div>
                <Link href="/admin/centro/encuestas/nueva">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Encuesta
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Profesional</TableHead>
                                <TableHead>Semana</TableHead>
                                <TableHead>HNC Total</TableHead>
                                <TableHead>HC Calculada</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {surveys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                        No hay encuestas registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                surveys.map((survey) => {
                                    const totalHNC = survey.entries.reduce((sum, e) => sum + e.hours, 0);
                                    const hc = survey.professional.weeklyHours - totalHNC;
                                    return (
                                        <TableRow key={survey.id}>
                                            <TableCell className="font-medium">{survey.professional.name}</TableCell>
                                            <TableCell>{survey.year}-W{String(survey.week).padStart(2, '0')}</TableCell>
                                            <TableCell>
                                                <span className="text-blue-600 font-medium">{totalHNC}h</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={hc < 0 ? 'text-red-600' : 'text-green-600'}>
                                                    {hc}h
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={survey.status === 'SUBMITTED' ? 'success' : 'warning'}
                                                >
                                                    {survey.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/centro/encuestas/${survey.id}`}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    Ver Detalle
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}