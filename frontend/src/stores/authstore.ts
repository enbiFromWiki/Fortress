import { create } from 'zustand';

type AuthStore = {
    user: string | null;
    loading: boolean;

    init: () => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: true,

    init: async () => {
        try {
            const res = await fetch('http://localhost:8080/api/v1/me', {
                credentials: 'include',
            });

            if (!res.ok) {
                set({
                    user: null,
                    loading: false,
                });
            }

            const data = await res.json();
            const user = data.user;
            set({
                user,
                loading: false,
            });
        } catch {
            set({
                user: null,
                loading: false,
            });
        }
    },
    logout: async () => {
        await fetch('http://localhost:8080/logout', {
            credentials: 'include',
        });
        set({
            user: null,
        });
    },
}));
