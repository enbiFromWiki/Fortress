import { type ReactNode } from 'react';
import { useAuthStore } from '../stores/authstore';
import { Navigate } from 'react-router';
import { Loading } from './loading';

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const auth = useAuthStore();

    if (auth.loading) {
        return <Loading />;
    }
    if (auth.status === 'unauthorized' || auth.status === 'unknown') {
        return <Navigate to="/loginpage" replace />;
    }
    if (auth.status === 'forbidden') {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
