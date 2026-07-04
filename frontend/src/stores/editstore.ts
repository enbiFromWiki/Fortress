import { create } from 'zustand';
import type { WSResponse } from '../types/types';
import { wsresponse, wsresponse2 } from '../testvalues';
import { devtools } from 'zustand/middleware';

type EditStore = {
    edits: WSResponse[];
    selectedIndex: number;
    addEdit: (edit: WSResponse) => void;
    incrementSelection: () => void;
    decrementSelection: () => void;
};

export const useEditStore = create<EditStore>()(
    devtools((set) => ({
        edits: [wsresponse, wsresponse2],

        selectedIndex: 0,
        addEdit: (edit: WSResponse) => {
            set((state: EditStore) => ({
                edits: [...state.edits, edit],
                selectedIndex:
                    state.edits.length === 1 ? 0 : state.selectedIndex,
            }));
        },
        incrementSelection: () => {
            set((state: EditStore) => ({
                selectedIndex:
                    state.selectedIndex > state.edits.length - 1
                        ? state.selectedIndex
                        : state.selectedIndex + 1,
            }));
        },

        decrementSelection: () => {
            set((state: EditStore) => ({
                selectedIndex:
                    state.selectedIndex === 0 ? 0 : state.selectedIndex - 1,
            }));
        },
    }))
);
