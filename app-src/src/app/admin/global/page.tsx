import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function GlobalDashboardPage() {
    const session = await auth();

    if (session!.user.role !== 'SUPER_ADMIN') {
        redirect('/admin/centro');
    }

    const [healthCenters, totalProfessionals, totalSurveys, totalUsers] = await Promise.all([
        prisma.healthCenter.findMany({
            include: {
                _count: { select: { professionals: true, surveys: true } },
                professionals: {
                    include: {
                        surveys: {
                            include: { entries: true },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        }),
        prisma.professional.count(),
        prisma.survey.count(),
        prisma.user.count(),
    ]);

    const centersWithStats = healthCenters.map((hc) => {
        const submittedSurveys = hc.professionals.flatMap((p) =>
            p.surveys.filter((s) => s.status === 'SUBMITTED')
        );

        let totalHNC = 0;
        let totalHC = 0;
        let professionalCount = hc._count.professionals;

        submittedSurveys.forEach((survey) => {
            const hnc = survey.entries.reduce((sum, e) => sum + e.hours, 0);
            totalHNC += hnc;
        });

        const avgWeeklyHours = professionalCount > 0
            ? hc.professionals.reduce((sum, p) => sum + p.weeklyHours, 0) / professionalCount
            : 44;

        totalHC = professionalCount > 0
            ? (totalHNC / submittedSurveys.length) * professionalCount - totalHNC
            : 0;

        const complianceRate = submittedSurveys.length > 0
            ? Math.round(((totalHNC / submittedSurveys.length) / avgWeeklyHours) * 100)
            : 0;

        return {
            ...hc,
            surveyCount: hc._count.surveys,
            submittedCount: submittedSurveys.length,
            totalHNC: Math.round(totalHNC * 100) / 100,
            complianceRate: isNaN(complianceRate) ? 0 : complianceRate,
            avgWeeklyHours: Math.round(avgWeeklyHours * 10) / 10,
        };
    });

    const sortedByCompliance = [...centersWithStats].sort(
        (a, b) => b.complianceRate - a.complianceRate
    );

    const maxCompliance = Math.max(...centersWithStats.map((c) => c.complianceRate), 1);
    const minCompliance = Math.min(...centersWithStats.map((c) => c.complianceRate), 0);

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
                        <p className="text-3xl font-bold">{totalUsers}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Cumplimiento por Centro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sortedByCompliance.slice(0, 10).map((center, index) => {
                            const barWidth = maxCompliance > 0
                                ? (center.complianceRate / maxCompliance) * 100
                                : 0;
                            const isGood = center.complianceRate >= 70;
                            const isWarning = center.complianceRate >= 40 && center.complianceRate < 70;

                            return (
                                <div key={center.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="truncate max-w-[150px]">{center.name}</span>
                                        <span className={isGood ? 'text-green-600' : isWarning ? 'text-yellow-600' : 'text-red-600'}>
                                            {center.complianceRate}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                        <div
                                            className={`h-2 rounded-full transition-all ${
                                                isGood ? 'bg-green-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {sortedByCompliance.length > 10 && (
                            <p className="text-sm text-gray-500 text-center">
                                ... y {sortedByCompliance.length - 10} centros más
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen HC/HNC</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-blue-50 p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {centersWithStats.reduce((sum, c) => sum + c.totalHNC, 0)}h
                                    </p>
                                    <p className="text-sm text-gray-600">Total HNC Registradas</p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {centersWithStats.reduce((sum, c) => sum + c.submittedCount, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600">Encuestas Enviadas</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Centros con mejor cumplimiento:</p>
                                {sortedByCompliance.slice(0, 3).map((center, i) => (
                                    <div key={center.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {i + 1}. {center.name}
                                        </span>
                                        <Badge variant="success">{center.complianceRate}%</Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Centros que necesitan atención:</p>
                                {sortedByCompliance.slice(-3).reverse().map((center, i) => (
                                    <div key={center.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {i + 1}. {center.name}
                                        </span>
                                        <Badge variant={center.complianceRate < 40 ? 'danger' : 'warning'}>
                                            {center.complianceRate}%
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                                <TableHead>Enviadas</TableHead>
                                <TableHead>HNC Total</TableHead>
                                <TableHead>% Cumplimiento</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {centersWithStats.map((hc) => {
                                const isGood = hc.complianceRate >= 70;
                                const isWarning = hc.complianceRate >= 40 && hc.complianceRate < 70;

                                return (
                                    <TableRow key={hc.id}>
                                        <TableCell className="font-medium">{hc.name}</TableCell>
                                        <TableCell className="font-mono text-sm">{hc.code}</TableCell>
                                        <TableCell>{hc._count.professionals}</TableCell>
                                        <TableCell>{hc.surveyCount}</TableCell>
                                        <TableCell>{hc.submittedCount}</TableCell>
                                        <TableCell>{hc.totalHNC}h</TableCell>
                                        <TableCell>
                                            <Badge variant={isGood ? 'success' : isWarning ? 'warning' : 'danger'}>
                                                {hc.complianceRate}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/admin/global/centros/${hc.id}`}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Gestionar
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}