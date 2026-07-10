import { create } from 'zustand';

type AuthStore = {
    user: string | null;
    loading: boolean;
    status: 'unknown' | 'unauthorized' | 'forbidden' | 'authorized';
    init: () => Promise<void>;
    logout: () => Promise<void>;
    isConnected: boolean;
    setConnected: (i: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: true,
    status: 'unknown',

    init: async () => {
        try {
            console.log('starting auth call');

            const res = await fetch('http://localhost:8080/api/v1/me', {
                credentials: 'include',
            });

            if (!res.ok) {
                if (res.status === 403) {
                    set({
                        status: 'forbidden',
                        user: null,
                        loading: false,
                    });
                    return;
                }
                set({
                    status: 'unauthorized',
                    user: null,
                    loading: false,
                });
                return;
            }

            const data = await res.json();
            const user = data.user;
            console.log('auth done');
            set({
                user,
                loading: false,
                status: 'authorized',
            });
        } catch {
            set({
                user: null,
                loading: false,
                status: 'unauthorized',
            });
        }
    },
    logout: async () => {
        await fetch('http://localhost:8080/logout', {
            credentials: 'include',
        });
        set({
            user: null,
            status: 'unauthorized',
        });
    },

    isConnected: false,
    setConnected: (i) => {
        set({
            isConnected: i,
        });
    },
}));
