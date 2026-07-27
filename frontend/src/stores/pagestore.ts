import { create } from 'zustand';
import type { HistEdit } from '../types/types';

export type WikiPage = {
    title: string;
    wiki: string;
};

type PageStore = {
    pages: Pages;
    setPage: (title: string, wiki: string, data: PageData) => void;
    addToHist: (title: string, wiki: string, data: HistEdit) => void;
    patchPage: (title: string, wiki: string, data: Partial<PageData>) => void;
};

type PageData = {
    history?: HistEdit[];
    watched?: boolean;
};

type Pages = Record<string, PageData>;

export const usePageStore = create<PageStore>((set) => ({
    pages: {},

    setPage: (title, wiki, data) => {
        set((state) => {
            const pageName = `${title}|${wiki}`;
            return {
                pages: { ...state.pages, [pageName]: data },
            };
        });
    },

    patchPage: (title, wiki, data) => {
        set((state) => {
            const pageName = `${title}|${wiki}`;
            return {
                pages: {
                    ...state.pages,
                    [pageName]: { ...state.pages[pageName], ...data },
                },
            };
        });
    },

    addToHist: (title, wiki, data) => {
        set((s) => {
            const caller = `${title}|${wiki}`;
            const hist = s.pages[caller]?.history;
            if (!hist) return {};

            return {
                pages: {
                    ...s.pages,
                    [caller]: {
                        ...s.pages[caller],
                        history: [{ ...data }, ...hist],
                    },
                },
            };
        });
    },
}));
