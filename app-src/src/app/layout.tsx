import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'GestionRRHH APS',
    description: 'Sistema de gestión de HC/HNC para centros de salud APS',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className="min-h-screen bg-gray-50">{children}</body>
        </html>
    );
}