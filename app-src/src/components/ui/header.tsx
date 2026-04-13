'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
    user: {
        name: string;
        email: string;
        role: string;
        healthCenterName?: string | null;
    };
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div>
                {user.healthCenterName && (
                    <p className="text-sm text-gray-500">{user.healthCenterName}</p>
                )}
                <p className="font-medium">{user.name}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{user.role}</span>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                </button>
            </div>
        </header>
    );
}