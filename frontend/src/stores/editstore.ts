import { create } from 'zustand';
import type { RecentChange } from '../types/types';
import { type WikiPage } from './pagestore';

type EditStore = {
    selectedEdit: RecentChange | null;
    futureEdits: RecentChange[];
    pastEdits: RecentChange[];
    addEdit: (edit: RecentChange) => void;
    incrementSelection: () => void;
    decrementSelection: () => void;
    setOldRevisions: (i: WikiPage) => void;
    clearQueue: () => void;
    tempItem: RecentChange | null;
    setTempItem: (i: RecentChange) => void;
    shouldUseTemp: boolean;
    setShouldUseTemp: (i: boolean) => void;
};

export const useEditStore = create<EditStore>((set) => ({
    futureEdits: [],
    pastEdits: [],
    selectedEdit: null,
    addEdit: (edit: RecentChange) => {
        set((state) => {
            const isQueueEmpty =
                state.selectedEdit === null && state.futureEdits.length === 0;

            function priority(item: RecentChange): number {
                if (item.watched && item.pagewatched) return 3;
                if (item.watched) return 2;
                if (item.pagewatched) return 1;
                return 0;
            }

            return {
                selectedEdit: isQueueEmpty ? edit : state.selectedEdit,
                futureEdits: (isQueueEmpty
                    ? state.futureEdits
                    : [...state.futureEdits, edit]
                ).sort((a, b) => priority(b) - priority(a)),
            };
        });
    },
    incrementSelection: () => {
        set((state) => {
            if (state.selectedEdit === null && state.futureEdits.length === 0)
                return {};
            return {
                pastEdits: state.selectedEdit
                    ? [...state.pastEdits, state.selectedEdit]
                    : state.pastEdits,
                selectedEdit: state.futureEdits[0] ?? null,
                futureEdits: state.futureEdits.slice(1),
                shouldUseTemp: false,
            };
        });
    },

    decrementSelection: () => {
        set((state) => {
            if (state.pastEdits.length === 0) return {};
            return {
                futureEdits: state.selectedEdit
                    ? [state.selectedEdit, ...state.futureEdits]
                    : state.futureEdits,
                selectedEdit:
                    state.pastEdits[state.pastEdits.length - 1] ?? null,
                pastEdits: state.pastEdits.slice(0, -1),
                shouldUseTemp: false,
            };
        });
    },

    // manuallySetSelection: (index: number) => {
    //     set({
    //         selectedEdit: index,
    //     });
    // },

    setOldRevisions: (page: WikiPage) => {
        set((state: EditStore) => {
            const checkifEqual = (e: RecentChange) =>
                e.title === page.title && e.wiki === page.wiki;
            const newHist = state.pastEdits.map((i) => ({
                ...i,
                currentRevision: checkifEqual(i) ? false : i.currentRevision,
            }));
            const curr = state.selectedEdit;
            const newCurr = curr
                ? checkifEqual(curr)
                    ? { ...curr, currentRevision: false }
                    : curr
                : null;
            const newFuture = state.futureEdits.map((i) => ({
                ...i,
                currentRevision: checkifEqual(i) ? false : i.currentRevision,
            }));
            return {
                pastEdits: newHist,
                selectedEdit: newCurr,
                futureEdits: newFuture,
            };
        });
    },

    clearQueue: () => {
        set({
            futureEdits: [],
            selectedEdit: null,
        });
    },

    tempItem: null,
    setTempItem: (i: RecentChange) => {
        set({
            tempItem: i,
        });
    },

    shouldUseTemp: false,
    setShouldUseTemp: (i: boolean) => {
        set({
            shouldUseTemp: i,
        });
    },
}));
