import { create } from 'zustand';
import { parse } from 'yaml';

// export type RBMenuSingleItem = {
//     name: string;
//     template: string;
//     summary: string;
//     details?: string;
//     single?: boolean;
// };
export type ConfigWiki = {
    warnSummary: string;
    reportSummary?: string;
    rollbackOuterSummary: string;
    keymaps: KeyMap[];
    menuCategories: RBMenuCategory[];
};

export type KeyMap = {
    key: string;
    summary: string;
    template?: string;
    overrideOuter?: boolean;
};

export type RBMenuCategory = {
    name: string;
    warnings: RBMenuWarning[];
};

export type RBMenuWarning = {
    name: string;
    template: string;
    summary: string;
    details?: string;
    single?: boolean;
};

export type Config = Record<string, ConfigWiki>;

// export type RBMenuCategory = {
//     name: string;
//     warnings: RBMenuSingleItem[];
// };

type AuthStore = {
    user: string | null;
    loading: boolean;
    status: 'unknown' | 'unauthorized' | 'forbidden' | 'authorized' | 'error';
    logout: () => Promise<void>;
    isConnected: boolean;
    setConnected: (i: boolean) => void;
    rollbackWikis: string[];
    config: Config | undefined;
    loadConfig: () => Promise<void>;
    loadUser: () => Promise<void>;
};

export class BadConfigError extends Error {}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: true,
    config: undefined,
    status: 'unknown',
    rollbackWikis: [],

    loadUser: async () => {
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
                rollbackWikis: data.rollbackWikis ?? [],
            });
            console.log(useAuthStore.getState().rollbackWikis);
            console.log(data);
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
    async loadConfig() {
        const res = await fetch(
            'https://test.wikipedia.org/w/api.php?action=parse&page=User:enbi/fortress.yaml&prop=wikitext&format=json&origin=*&formatversion=2'
        );
        const data = await res.json();
        const text: string | undefined = data?.parse?.wikitext?.match(
            /<syntaxhighlight lang="yaml">(.*?)<\/syntaxhighlight>/s
        )?.[1];
        console.log('text:', text);
        if (!text) {
            throw new BadConfigError();
        }
        const config = parse(text);
        console.log('Config: ', config);
        set({
            config: config,
        });
    },
}));
