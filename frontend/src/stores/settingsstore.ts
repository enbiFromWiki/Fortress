import { create } from 'zustand';

type SettingsStore = {
    settingsOpen: boolean;
    setSettingsOpen: (v: boolean) => void;
    settings: Settings;
    setSettings: (i: Settings) => void;
};

export type Settings = {
    maxEditCount: string;
    wikis: string[];
    diffLinks: boolean;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
    settingsOpen: false,
    setSettingsOpen: (val) => {
        set({
            settingsOpen: val,
        });
    },

    settings: JSON.parse(localStorage.getItem('fortress-settings') ?? '0') || {
        maxEditCount: '10',
        wikis: ['enwiki'],
        diffLinks: true,
    },

    setSettings: (i) => {
        set({
            settings: i,
        });
    },
}));
