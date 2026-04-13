'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, ClipboardList, Activity } from 'lucide-react';

const menuItems = [
    { href: '/admin/centro', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/centro/profesionales', label: 'Profesionales', icon: Users },
    { href: '/admin/centro/actividades', label: 'Actividades', icon: Activity },
    { href: '/admin/centro/encuestas', label: 'Encuestas', icon: ClipboardList },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-white">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-lg font-bold text-blue-600">GestionRRHH</h1>
            </div>
            <nav className="p-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}