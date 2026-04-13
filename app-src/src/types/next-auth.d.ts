import 'next-auth';

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        name: string;
        role: string;
        healthCenterId: string | null;
        healthCenterName: string | null;
    }

    interface Session {
        user: User;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        healthCenterId: string | null;
        healthCenterName: string | null;
    }
}