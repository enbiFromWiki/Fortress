import { create } from 'zustand';
import type { HistEdit } from '../types/types';
import { devtools } from 'zustand/middleware';

export type WikiPage = {
    title: string;
    wiki: string;
};

type PageStore = {
    pages: Pages;
    setPage: (title: string, wiki: string, data: PageData) => void;
    getPage: (title: string, wiki: string) => PageData | undefined;
};

type PageData = {
    history: HistEdit[];
};

type Pages = Record<string, PageData>;

export const usePageStore = create<PageStore>()(
    devtools((set, get) => ({
        pages: {},

        setPage: (title, wiki, data) => {
            set((state) => {
                const pageName = `${title}|${wiki}`;
                return {
                    pages: { ...state.pages, [pageName]: data },
                };
            });
        },

        getPage: (title, wiki) => get().pages[`${title}|${wiki}`],
    }))
);
