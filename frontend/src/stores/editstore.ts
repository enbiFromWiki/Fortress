import { create } from 'zustand';
import type { WSResponse } from '../types/types';
import { wsresponse, wsresponse2 } from '../testvalues';
import { type WikiPage } from './pagestore';

type EditStore = {
    selectedEdit: WSResponse | null;
    futureEdits: WSResponse[];
    pastEdits: WSResponse[];
    addEdit: (edit: WSResponse) => void;
    incrementSelection: () => void;
    decrementSelection: () => void;
    //manuallySetSelection: (index: number) => void;
    setOldRevisions: (i: WikiPage) => void;
};

export const useEditStore = create<EditStore>((set) => ({
    futureEdits: [wsresponse, wsresponse2],
    pastEdits: [],
    selectedEdit: null,
    addEdit: (edit: WSResponse) => {
        set((state) => {
            const isQueueEmpty =
                state.selectedEdit === null && state.futureEdits.length === 0;

            return {
                selectedEdit: isQueueEmpty ? edit : state.selectedEdit,
                futureEdits: isQueueEmpty
                    ? state.futureEdits
                    : [...state.futureEdits, edit],
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
            const checkifEqual = (e: WSResponse) =>
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
}));
