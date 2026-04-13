import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        let healthCenters;
        if (session.user.role === 'SUPER_ADMIN') {
            healthCenters = await prisma.healthCenter.findMany({
                orderBy: { name: 'asc' },
                select: { id: true, name: true, code: true },
            });
        } else if (session.user.healthCenterId) {
            healthCenters = await prisma.healthCenter.findMany({
                where: { id: session.user.healthCenterId },
                select: { id: true, name: true, code: true },
            });
        } else {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(healthCenters);
    } catch {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}