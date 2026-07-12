import { create } from 'zustand';

type Position = { left: number; top: number };

type TooltipStore = {
    position: Position;
    content: string;
    shown: boolean;
    setContent: (i: string) => void;
    setPosition: (i: Position) => void;
    setShown: (i: boolean) => void;
    html: boolean;
    setHtml: (i: boolean) => void;
};

export const useTooltipStore = create<TooltipStore>((set) => ({
    position: { left: 0, top: 0 },
    content: '',
    shown: false,
    html: false,

    setPosition: (position: Position) => {
        set({ position: position });
    },

    setContent: (content: string) => {
        set({ content: content });
    },

    setShown: (shown: boolean) => {
        set({ shown: shown });
    },

    setHtml: (value: boolean) => {
        set({ html: value });
    },
}));
