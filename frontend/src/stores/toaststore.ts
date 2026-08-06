import { create } from 'zustand';

export type ToastItem = {
    header: string;
    body: string;
    progress: number;
    id: string;
    status: 'done' | 'error' | 'normal';
};

type ToastStore = {
    toasts: ToastItem[];
    addToast: (i: ToastItem) => void;
    deleteToast: (id: string) => void;
    updateToast: (id: string, i: Partial<ToastItem>) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast(toast: ToastItem) {
        set((s) => ({
            toasts: [...s.toasts, toast],
        }));
    },

    deleteToast(id) {
        set((s) => ({
            toasts: s.toasts.filter((t) => t.id !== id),
        }));
    },

    updateToast(id, newItem) {
        set((s) => ({
            toasts: s.toasts.map((t) =>
                t.id === id ? { ...t, ...newItem } : t
            ),
        }));
    },
}));
