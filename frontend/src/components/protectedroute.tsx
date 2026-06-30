import { type ReactNode } from 'react';
import { useAuthStore } from '../stores/authstore';
import { Navigate } from 'react-router';

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const user = useAuthStore((i) => i.user);
    const loading = useAuthStore((i) => i.loading);

    if (loading) {
        return <div>loading...</div>;
    }
    if (!user) {
        return <Navigate to="/loginpage" replace />;
    }

    return children;
}
