import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function GlobalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (session?.user.role !== 'SUPER_ADMIN') {
        redirect('/admin/centro');
    }

    return <>{children}</>;
}