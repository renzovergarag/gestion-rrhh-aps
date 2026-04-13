import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function HomePage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    switch (session.user.role) {
        case 'SUPER_ADMIN':
            redirect('/admin/global');
        case 'ADMIN_CENTRO':
            redirect('/admin/centro');
        case 'PROFESIONAL':
            redirect('/profesional');
        default:
            redirect('/login');
    }
}