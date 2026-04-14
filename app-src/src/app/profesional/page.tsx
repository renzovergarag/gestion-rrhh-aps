import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { calculateAvailableHours } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProfesionalPage() {
    const session = await auth();

    const professional = await prisma.professional.findFirst({
        where: { userId: session!.user.id },
        include: {
            healthCenter: true,
            surveys: {
                include: { entries: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });

    if (!professional) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center py-8">
                        <p className="text-gray-500">No tienes un perfil de profesional asociado.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { annual, weekly } = calculateAvailableHours(professional.weeklyHours, 0, 0, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Mi Perfil</h1>
                <p className="text-gray-500">Bienvenido, {professional.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Centro de Salud
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-medium">{professional.healthCenter.name}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Jornada Semanal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{professional.weeklyHours}h</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Horas Disponibles Teóricas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{annual}h/año</p>
                        <p className="text-sm text-gray-500">{weekly}h/semana</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mi Información</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm text-gray-500">RUT</dt>
                            <dd className="font-medium">{professional.rut}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Cargo</dt>
                            <dd className="font-medium">{professional.position}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Categoría</dt>
                            <dd className="font-medium">
                                <Badge>{professional.category}</Badge>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Estado</dt>
                            <dd className="font-medium">
                                <Badge variant={professional.isActive ? 'success' : 'danger'}>
                                    {professional.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Encuestas Recientes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Semana</TableHead>
                                <TableHead>HNC Registrada</TableHead>
                                <TableHead>HC Resultante</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {professional.surveys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                        No hay encuestas registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                professional.surveys.map((survey) => {
                                    const hnc = survey.entries.reduce((sum, e) => sum + e.hours, 0);
                                    const hc = professional.weeklyHours - hnc;
                                    return (
                                        <TableRow key={survey.id}>
                                            <TableCell>{survey.year}-W{String(survey.week).padStart(2, '0')}</TableCell>
                                            <TableCell className="text-blue-600">{hnc}h</TableCell>
                                            <TableCell className={hc < 0 ? 'text-red-600' : 'text-green-600'}>
                                                {hc}h
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={survey.status === 'SUBMITTED' ? 'success' : 'warning'}
                                                >
                                                    {survey.status}
                                                </Badge>
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