import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
    const session = await auth();
    const pathname = request.nextUrl.pathname;

    if (!session && pathname !== '/login' && pathname !== '/register') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session) {
        const isGlobalAdmin = pathname.startsWith('/admin/global');
        const isCentroAdmin = pathname.startsWith('/admin/centro');
        const isProfesional = pathname.startsWith('/profesional');

        if (isGlobalAdmin && session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/admin/centro', request.url));
        }

        if (isCentroAdmin && session.user.role === 'PROFESIONAL') {
            return NextResponse.redirect(new URL('/profesional', request.url));
        }

        if (isProfesional && !['SUPER_ADMIN', 'ADMIN_CENTRO', 'PROFESIONAL'].includes(session.user.role)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};