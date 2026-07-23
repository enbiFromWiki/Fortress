import { create } from 'zustand';

export type UserData = {
    watched: boolean;
    blocked: string[];
    gblocked: boolean;
    locked: boolean;
    editcount: number;
};

type UserStore = {
    users: Record<string, UserData>;
    setUser: (i: string, j: UserData) => void;
    patchUser: (i: string, j: Partial<UserData>) => void;
};

export const useUserStore = create<UserStore>((set) => ({
    users: {
        '~2026-37947-76': {
            blocked: ['enwiki', 'testwiki'],
            watched: false,
            gblocked: true,
            locked: false,
            editcount: 10,
        },
    },

    setUser: (user, data) => {
        set((state) => {
            return {
                users: { ...state.users, [user]: data },
            };
        });
    },

    patchUser: (user, data) => {
        set((state) => {
            console.log(state);
            return {
                users: {
                    ...state.users,
                    [user]: { ...state.users[user], ...data },
                },
            };
        });
    },
}));
