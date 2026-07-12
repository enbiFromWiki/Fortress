import { create } from 'zustand';

type SettingsStore = {
    settingsOpen: boolean;
    setSettingsOpen: (v: boolean) => void;
    settings: Settings;
};

export type Settings = {
    maxEditCount: number | '';
    wikis: string[];
};

export const useSettingsStore = create<SettingsStore>((set) => ({
    settingsOpen: false,
    setSettingsOpen: (val) => {
        set({
            settingsOpen: val,
        });
    },

    settings: {
        maxEditCount: 2,
        wikis: ['enwiki'],
    },
}));
