import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function CentroDashboardPage() {
    const session = await auth();
    const healthCenterId = session!.user.healthCenterId!;

    const [professionalsCount, surveysThisWeek, recentSurveys] = await Promise.all([
        prisma.professional.count({ where: { healthCenterId, isActive: true } }),
        prisma.survey.count({
            where: {
                healthCenterId,
                year: new Date().getFullYear(),
                week: Math.ceil((new Date().getDate()) / 7),
            },
        }),
        prisma.survey.findMany({
            where: { healthCenterId },
            include: { professional: true, entries: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
        }),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-500">Resumen de {session!.user.healthCenterName}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Profesionales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{professionalsCount}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Encuestas Esta Semana
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{surveysThisWeek}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Estado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="success">Activo</Badge>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Encuestas Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Profesional</TableHead>
                                <TableHead>Semana</TableHead>
                                <TableHead>Horas HNC</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentSurveys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500">
                                        No hay encuestas recientes
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentSurveys.map((survey) => {
                                    const totalHNC = survey.entries.reduce((sum, e) => sum + e.hours, 0);
                                    return (
                                        <TableRow key={survey.id}>
                                            <TableCell>{survey.professional.name}</TableCell>
                                            <TableCell>{survey.year}-W{survey.week}</TableCell>
                                            <TableCell>{totalHNC}h</TableCell>
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