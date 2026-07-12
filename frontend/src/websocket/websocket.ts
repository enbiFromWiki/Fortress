import { useSettingsStore } from '../stores/settingsstore';
import { Socket } from './ws';

const settings = useSettingsStore.getState().settings;
export const socket = new Socket(Number(settings.maxEditCount), settings.wikis);
